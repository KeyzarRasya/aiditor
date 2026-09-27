# Developer Documentation

How the **aiditor** codebase works, end to end — enough to read it, extend it, and debug it.

For the product vision and requirements see [`PRD.md`](./PRD.md). For agent-facing rules see
[`../AGENTS.md`](../AGENTS.md).

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [Quick start](#2-quick-start)
3. [Repository layout](#3-repository-layout)
4. [The rendering pipeline](#4-the-rendering-pipeline)
5. [Core data model](#5-core-data-model)
6. [Sizing and layout rules](#6-sizing-and-layout-rules)
7. [Theme system](#7-theme-system)
8. [Fonts and text measurement](#8-fonts-and-text-measurement)
9. [Renderers: SVG and PNG](#9-renderers-svg-and-png)
10. [CLI and configuration](#10-cli-and-configuration)
11. [Public API reference](#11-public-api-reference)
12. [Writing a post](#12-writing-a-post)
13. [Extending the engine](#13-extending-the-engine)
14. [Testing](#14-testing)
15. [Known limitations and gotchas](#15-known-limitations-and-gotchas)
16. [Troubleshooting](#16-troubleshooting)
17. [Where the code goes next](#17-where-the-code-goes-next)

---

## 1. What this project is

Social images as code. A post is a TypeScript file that describes a layout with a small semantic
API; rendering walks that tree through layout → SVG → PNG. The same source always produces the same
image, which is what makes it safe to iterate on with an AI coding agent.

This repository is currently **the engine** (library + CLI). The posts you write live alongside it
under `posts/`, but the engine never depends on them.

---

## 2. Quick start

```bash
npm install            # see the NODE_ENV note below
npm run render -- posts/hello.ts            # -> dist/hello.png
npm run render -- posts/hello.ts --format svg
npm run dev -- posts/hello.ts               # re-render on save
```

Quality gates (all green on `main`-equivalent state):

```bash
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run lint           # eslint .
npm run build          # tsc -> build/
```

> **NODE_ENV gotcha.** If your shell exports `NODE_ENV=production`, `npm install` silently skips
> devDependencies (no `vitest`, `tsc`, `tsx`, `eslint`). Install with
> `npm install --include=dev` in that case.

Package manager: npm. Node: ≥20. Module system: ESM only.

---

## 3. Repository layout

```
aiditor/
├── src/
│   ├── core/
│   │   ├── node.ts        # DesignNode types + primitive builders and options
│   │   ├── canvas.ts      # createPost(), format table, validation
│   │   └── units.ts       # spacing shorthand, rounding, validation helpers
│   ├── text/
│   │   └── measure.ts     # fontkit advance measurement, word wrap, metrics
│   ├── fonts/
│   │   └── registry.ts    # discover fonts, resolve family/weight/style
│   ├── layout/
│   │   ├── index.ts       # resolve + place pass, produces absolute boxes
│   │   ├── context.ts     # Size2 / Resolved / Placement / LayoutContext types
│   │   ├── length.ts      # px / percent / fill / hug resolution
│   │   ├── flex.ts        # flex resolver: gap, align, justify, grow
│   │   ├── grid.ts        # grid resolver: equal columns, row-major auto-flow
│   │   └── align.ts       # center / alignLeft / alignRight / alignTop / alignBottom
│   ├── render/
│   │   ├── svg.ts         # DesignNode tree -> SVG string
│   │   ├── png.ts         # SVG string -> PNG buffer (resvg)
│   │   └── post.ts        # renderPost() facade
│   ├── theme/
│   │   ├── theme.ts       # token model, default theme, deep-merge createTheme
│   │   └── config.ts      # load social.config.ts
│   ├── cli/
│   │   └── index.ts       # `social render` / `social dev`
│   └── index.ts           # public API barrel
├── posts/                 # your posts (NOT under src/)
├── fonts/                 # bundled Roboto Regular + Bold (.ttf)
├── assets/               # images/icons referenced by posts
├── dist/                  # rendered PNG/SVG output (gitignored)
├── build/                 # compiled engine (gitignored)
├── theme.ts               # project theme override
├── social.config.ts       # outDir / fontsDir / defaultFormat
├── AGENTS.md
└── docs/
```

Two layout decisions differ from the PRD sketch:

- **Posts live in `posts/`, not `src/posts/`.** The engine must never import user content, so that
  the later library/CLI split is a directory move rather than a rewrite.
- **Compiled output goes to `build/`,** leaving `dist/` for rendered images (as the PRD intends).

Inside `src/`, relative imports use **`.js` extensions** even though the files are `.ts`
(`moduleResolution: NodeNext`). Posts import the engine through the bare specifier `aiditor`, wired
up by `tsconfig.json` `paths` and the `resolve.alias` in `vitest.config.ts`.

---

## 4. The rendering pipeline

```
post.ts  (your code: createPost + components/primitives)
   │
   ▼
DesignNode tree        pure data, no coordinates yet
   │
   ▼  layout(post)                    ← src/layout/index.ts
RenderNode state       every node gets a box {x,y,width,height}
   │
   ▼  renderToSvg(post)               ← src/render/svg.ts
SVG string
   │
   ▼  renderToPng(svg, fonts)         ← src/render/png.ts
PNG buffer
```

The two phases are strictly separated:

- **Layout** runs a bottom-up **resolve** pass (intrinsic sizes, text wrapping, child placements)
  and then a top-down **place** pass (absolute positions). Resolve writes `node.box` and, for text,
  `node.metrics`. Each node is resolved exactly once, so its measured size always matches its box.
- **Rendering** only *reads* boxes and metrics. It never measures anything.

That separation is why `renderToSvg` is a pure, dependency-light function and why the layout engine
can be tested by asserting on boxes alone.

---

## 5. Core data model

Everything is a `DesignNode` — a discriminated union on `kind` (`src/core/node.ts`):

| kind | carries | notes |
|------|---------|-------|
| `rect` | — | size from layout props |
| `circle` | `radius` | size is always `2 × radius` |
| `line` | `x1,y1,x2,y2` | coordinates relative to the node's box |
| `text` | `text`, `metrics?` | `metrics` filled in by layout |
| `image` | `src` | requires numeric `width`/`height` |
| `group` | `children[]` | the only container |

Every node carries:

```ts
interface BaseNode {
  kind: NodeKind;
  style: Style;        // visual properties
  layout: LayoutStyle; // geometry + container behaviour
  box?: Box;           // written by layout()
  meta?: Record<string, unknown>;
}
```

**`Style`** (visual): `fill`, `stroke`, `strokeWidth`, `opacity`, `radius`, `shadow`, `color`,
`fontFamily`, `fontWeight`, `fontStyle`, `fontSize`, `lineHeight`, `letterSpacing`, `textAlign`.

**`LayoutStyle`** (geometry): `x`, `y`, `width`, `height`, `direction`, `gap`, `padding`, `margin`,
`align`, `justify`, `grow`, and for grids `columns`, `columnGap`, `rowGap`.

Builders accept a single flattened options object (`NodeOptions = Style & LayoutStyle & { meta? }`)
and split it into `style` and `layout` via the `STYLE_KEYS` / `LAYOUT_KEYS` lists. This is why you
write `text("Hi", { fontSize: 48, width: "fill" })` instead of nesting `style`/`layout` objects.

`padding` and `margin` take CSS-like shorthands (`number`, `[v,h]`, `[t,h,b]`, `[t,r,b,l]`),
normalized by `resolveSpacing()`.

---

## 6. Sizing and layout rules

This is the heart of the engine. Every container is resolved **once** against the space its parent
gives it: the resolve pass measures children bottom-up and records their placements, and the place
pass translates those placements into absolute coordinates. A child's main-axis size is decided
*before* the child is measured, so nothing is ever measured twice with a stale constraint.

### How a single size is resolved

| value | width means | height means |
|---|---|---|
| `number` | fixed px | fixed px |
| `"NN%"` | NN% of the parent's inner width | NN% of the parent's inner height |
| `"fill"` | parent's inner width | parent's inner height |
| `"hug"` | content (`group`), `0` (`rect`), intrinsic (`text`) | content / intrinsic |
| absent | `group`: fill when the parent bound is finite, else hug · `text`: intrinsic (wraps to the available width) · `rect`: `0` | `group` / `text`: content |

Percentages resolve against the parent's **inner** size; when the parent bound is unbounded the
percentage falls back to hug. `circle` always measures to `2 × radius` and ignores `width`/`height`.
`image` requires both to be numbers.

### Containers

A `group` lays its children out along `direction` (`"column"` default, or `"row"`) with `gap`
between them, offset by `padding`. `align` positions children on the **cross** axis
(`start | center | end | stretch`; `stretch` fills the cross axis). `justify` distributes children
along the **main** axis (`start | center | end | space-between`). Margins are honoured per child.

The root container is a `group` created by `createPost` with `direction: "column"`, `gap` =
`theme.spacing.lg`, and `padding` = `safeMargin` (default 72). Its `width`/`height` are forced to the
canvas size last, so `layout` cannot accidentally resize the canvas.

### Growing (`grow`)

`grow` makes a child share the container's leftover main-axis space:

```
free       = max(0, innerMain − Σ(non-grow mains + margins) − Σ(grow margins) − gaps − Σ(bases))
child main = base + free × grow / Σgrow
```

`base` is a grow child's explicit main size if it has one, otherwise `0` — so two `grow: 1` children
with no width split the free space evenly. There is no shrink: when fixed children already overflow,
`free` clamps to `0` and overflow is allowed.

### Grids

Setting `columns` on a group switches it from flex to a **row-major auto-flow grid**: children fill
`columns` equal-width columns (`colWidth = (innerWidth − (columns−1)·columnGap) / columns`) and each
row's height comes from its tallest child. `gap` sets both `columnGap` and `rowGap` unless overridden.
When the grid is unbounded (e.g. `width: "hug"`), each column hugs its widest child instead.

### Alignment helpers

`center`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom` (`src/layout/align.ts`) are thin
wrappers over `align` / `justify` / `fill` — they add no new engine behaviour.

### Text measurement during layout

For a `text` node, layout resolves the font, wraps the string to its width target (its own `width`,
else the available width), stores the result on `node.metrics`, and reports the wrapped size. Text in
a grown or percentage-sized column wraps to that definite width.

---

## 7. Theme system

`src/theme/theme.ts` defines the token model and `defaultTheme`:

- `colors`: `primary`, `background`, `surface`, `text`, `textMuted`, `accent`, `border`
- `typography`: `heading`, `body` — each `{ family, weight, size, lineHeight }`
- `spacing`: `xs`, `sm`, `md`, `lg`, `xl`
- `borderRadius`: `sm`, `md`, `lg`
- `shadows.card`: `{ color, blur, offsetX, offsetY }`

`createTheme(overrides)` deep-merges a `DeepPartial<Theme>` over the defaults. `defineTheme()` is an
identity helper that gives editors type checking for an override object — that is what `theme.ts`
at the repo root uses. `createPost({ theme })` accepts the same partial, so a single post can
override tokens locally.

Today, primitives consume the theme **implicitly**: text falls back to `typography.body` for family,
weight, size, and line height, and to `colors.text` for its fill. `typography.heading` is defined but
not yet consumed — the Phase 3 semantic components (`headline()`, `card()`, …) will use it.

---

## 8. Fonts and text measurement

`FontRegistry` (`src/fonts/registry.ts`) scans a directory for `.ttf`/`.otf` files and reads each
font's real metadata — `familyName`, `OS/2.usWeightClass`, and italic detection from the subfamily
name. `resolve({ family, weight, style })` picks the **closest weight** within the matching family
and style, and throws an actionable error listing the available families when the family is unknown.

The active registry is a module-level singleton:

- `getFontRegistry()` lazily scans `./fonts` relative to the current working directory.
- `configureFontRegistry(registry)` replaces it — the CLI uses this to point at `config.fontsDir`.

This matters because **the same registry drives both measurement and rasterization**, so text wraps
exactly where the PNG will break it.

`src/text/measure.ts` does the actual work with `fontkit`:

- `measureAdvance(text, font, fontSize, letterSpacing)` sums glyph `xAdvance` values and scales from
  font units by `fontSize / font.unitsPerEm`. Results are cached.
- `wrapText(content, font, options)` is a greedy wrapper: words split on whitespace, CJK runs split
  per character, over-long words broken by character so nothing ever overflows, and `\n` forces a
  line break. It returns `{ lines, width, height, lineHeight, ascent, descent, fontSize }`.
- `layoutText(content, options)` resolves the face from the registry and then wraps.

`lineHeight` in a style is a **multiplier**; the pixel height is `Math.round(fontSize × lineHeight)`.

Bundled fonts are Roboto Regular (400) and Bold (700). Roboto's Medium reports a distinct family name
(`"Roboto Medium"`), so it was deliberately excluded to keep weight resolution unambiguous between
the measurer and the rasterizer.

---

## 9. Renderers: SVG and PNG

`src/render/svg.ts` walks the tree and emits a `<svg>` with a background `<rect>` and one element per
node:

- **text** → `<text>` with one `<tspan>` per wrapped line. The first tspan carries `x` and `y`
  (`box.y + ascent`); later tspans carry `dy="lineHeight"`. `textAlign` maps to `text-anchor` +
  anchor x.
- **rect / group background** → `<rect>` with optional `rx`. A `group` with `fill` draws its own
  background before its children.
- **circle** → `<circle>` centred at `box.x + radius`, `box.y + radius`.
- **line** → `<line>` at its absolute coordinates.
- **image** → `<image>` with a base64 `data:` URI for local files (no network fetch, keeps output
  deterministic).
- **shadow** → a `<feDropShadow>` filter with a deterministic id (`shadow-0`, `shadow-1`, … in
  traversal order).

All text is XML-escaped; numbers are rounded to 2 decimals.

`src/render/png.ts` rasterizes with `@resvg/resvg-js` using `loadSystemFonts: false` and an explicit
`fontFiles` list (the registry's paths), scaling `fitTo: { mode: "width" }`. Disabling system fonts
is what makes output identical across machines.

`renderPost(post, { format })` ties them together and is the function the CLI calls.

**Determinism rules** — follow these when adding renderer features:

- No randomness, timestamps, or `Date` in output.
- Derive ids from traversal order or node paths, never from random values.
- Keep the same `fontFiles` list flowing into both measurement and resvg.
- Iterate arrays, never rely on object/`Map` iteration order for output.

---

## 10. CLI and configuration

`src/cli/index.ts` implements two commands:

| Command | Behaviour |
|---|---|
| `social render <file> [--format svg\|png] [--out <dir>]` | loads the post, runs `layout`, renders, writes `dist/<name>.<ext>` |
| `social dev <file>` | renders once, then `fs.watch`es the file and re-renders (cache-busted dynamic import) |

Flags accept both `--format png` and `--format=png`. Errors are printed as `Error: <message>` and set
a non-zero exit code.

`social.config.ts` (loaded by `src/theme/config.ts`) supplies:

```ts
interface SocialConfig {
  outDir: string;        // default "dist"
  fontsDir: string;      // default "fonts"
  defaultFormat: "png" | "svg";  // default "png"
}
```

The CLI loads this config, then calls `configureFontRegistry(new FontRegistry([resolve(cwd, config.fontsDir)]))`
before rendering, so `fontsDir` is authoritative for the whole run.

> The compiled `build/cli/index.js` cannot render in-repo posts yet: those posts import the bare
> `aiditor` specifier, which resolves under `tsx` via `tsconfig` paths but not from plain Node
> without an install/link. Use `npm run render` during development.

---

## 11. Public API reference

Everything below is exported from `src/index.ts` (import as `aiditor`).

**Canvas**

| Export | Signature |
|---|---|
| `createPost` | `(options: PostOptions) => Post` |
| `resolveSize` | `(size: PostSize) => { width; height }` |
| `FORMATS` | `instagram-square 1080×1080`, `instagram-portrait 1080×1350`, `instagram-story 1080×1920`, `landscape 1200×630` |
| `DEFAULT_SAFE_MARGIN` | `72` |

**Primitives**

| Export | Signature |
|---|---|
| `rect` | `(options?) => RectNode` |
| `circle` | `(options & { radius }) => CircleNode` |
| `line` | `(options & { x1,y1,x2,y2 }) => LineNode` |
| `text` | `(content: string, options?) => TextNode` |
| `image` | `(src: string, options & { width, height }) => ImageNode` |
| `group` | `(children, options?) => GroupNode` |
| `stack` / `row` | `(children, options?) => GroupNode` (column / row sugar) |
| `grid` | `(children, { columns, ...options }) => GroupNode` |

**Alignment helpers:** `center`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom` —
`(children, options?) => GroupNode`, sugar over `align` / `justify` / `fill`.

**Pipeline**

| Export | Signature |
|---|---|
| `layout` | `(post: Post) => Post` — attaches boxes |
| `renderToSvg` | `(post: Post) => string` |
| `renderToPng` | `(svg: string, options) => Buffer` |
| `renderPost` | `(post: Post, { format? }) => string \| Buffer` |

**Theme**

`createTheme`, `defineTheme`, `defaultTheme`, `loadConfig`, `defaultConfig` (+ types `Theme`,
`DeepPartial`, `SocialConfig`).

**Fonts & text**

`FontRegistry`, `getFontRegistry`, `configureFontRegistry`, `layoutText`, `wrapText`,
`measureAdvance` (+ types `FontFace`, `FontQuery`, `TextLayoutOptions`).

**Units**

`resolveSpacing`, `spacing`, `round`.

---

## 12. Writing a post

A post is one file with a default export:

```ts
import { createPost, group, text } from "aiditor";

export default createPost({
  size: "instagram-square",
  layout: { gap: 40 },
  children: [
    text("ERP yang mahal belum tentu ERP yang paling cocok.", {
      fontSize: 78,
      fontWeight: 700,
      lineHeight: 1.15,
    }),
    group(
      [
        text("Yang lebih penting adalah proses bisnis perusahaan.", {
          fontSize: 36,
          lineHeight: 1.5,
          color: "#CBD5E1",
        }),
      ],
      { fill: "#111C31", radius: 28, padding: 36, width: "fill", shadow: true },
    ),
  ],
});
```

Then `npm run render -- posts/hello.ts`. Because sizing is semantic, the card grows to fit its text
and the container wraps the headline automatically — no coordinates anywhere.

---

## 13. Extending the engine

### Adding a semantic component (the normal case)

Most new capabilities should **not** add a node kind. Write a function that returns a `DesignNode`
subtree built from existing primitives, pulling defaults from the theme. Example shape:

```ts
// src/components/badge.ts (Phase 3)
export function badge(content: string, options: BadgeOptions = {}): GroupNode {
  return group([text(content, { fontSize: 24, color: theme.colors.accent })], {
    fill: theme.colors.surface,
    radius: theme.borderRadius.sm,
    padding: [8, 16],
    width: "hug",
    ...options,
  });
}
```

Components are pure functions of their inputs and the theme — easy to test by asserting on geometry.

### Adding a primitive (rare)

Adding a new `kind` touches five places; keep them in sync:

1. `NodeKind` union and a `XxxNode` interface in `src/core/node.ts`.
2. Add it to the `DesignNode` union.
3. Add a builder function (and export it from `src/index.ts`).
4. Handle the kind in `measureNode` in `src/layout/index.ts`.
5. Handle the kind in `renderNode` in `src/render/svg.ts`.

TypeScript's exhaustive `switch` will error at steps 4–5 until both are handled — use that as your
checklist.

---

## 14. Testing

Tests live in `test/` and run under Vitest:

```bash
npm test           # once
npm run test:watch # watch
```

`test/setup.ts` runs before every suite and calls `configureFontRegistry` with an **absolute** path
to `fonts/`, so tests do not depend on the working directory.

| File | Covers |
|---|---|
| `node.test.ts` | builder option splitting, circle radius, canvas validation |
| `measure.test.ts` | measurement scaling, wrapping, long-word breaks, explicit newlines |
| `layout.test.ts` | stacking, gap/padding, fill, cross-axis alignment, safe margin, image sizing error |
| `render.test.ts` | deterministic SVG, PNG signature, byte-identical PNG output |
| `registry.test.ts` | weight resolution, unknown-family error, empty-registry error |

When you add layout behaviour, assert on `node.box`; when you add rendering, assert on substrings or
determinism rather than pixel snapshots.

---

## 15. Known limitations and gotchas

- **`line` coordinates are box-relative**, not canvas-absolute. `line({ x1: 0, y1: 0, x2: 100, y2: 0 })`
  draws a 100px rule starting at the node's laid-out box origin. Its bounding box (`100 × 0` here)
  is what participates in flow spacing.
- **A row's main axis is measured unbounded.** Children with no explicit width and no `grow` keep
  their intrinsic width, so text placed directly in a row does not wrap. Give row children `grow` or
  an explicit/percentage `width` to make them share and wrap.
- **`grid()` requires a positive integer `columns`** — enforced by both types and a runtime error.
- **`image` requires numeric `width` and `height`** — the engine does not read intrinsic image size
  yet. Enforced by both types and a runtime error.
- **A `rect` with no `width`/`height` measures to `0`.** Give it numbers or `"fill"`.
- **`circle` ignores `width`/`height`**; its size is always `2 × radius`.
- **`typography.heading` is unused** until the Phase 3 components land; primitives default to
  `typography.body`.
- **`--no-verify`-style shortcuts don't exist here.** If an error appears, fix the cause; the error
  strings are part of the contract (`AGENTS.md`).

---

## 16. Troubleshooting

| Message | Cause / fix |
|---|---|
| `Font "X" was not found in ./fonts. Available families: …` | The family is not in the fonts dir, or `fontsDir` points elsewhere. Check spelling and the config. |
| `No fonts found in ./fonts. Add .ttf or .otf files …` | The fonts directory is empty or missing. |
| `image("…") requires numeric "width" and "height" props …` | Add explicit dimensions to the image. |
| `Canvas dimensions must be positive integers` | `size` had a non-positive or non-integer width/height. |
| `Unknown format "…". Available formats: …` | `size` was a string that is not one of `FORMATS` keys. |
| `grid() requires "columns" to be a positive integer.` | `columns` was missing, fractional, or < 1. |
| `"file.ts" must default-export the result of createPost().` | The post file has no default export (or exports something else). |
| `Post file "…" was not found.` | Path passed to `social render`/`dev` is wrong. |

---

## 17. Where the code goes next

The roadmap lives in the plan and `PRD.md`. Current state and next steps:

- **Done:** Phase 0 (tooling), Phase 1 (renderer core), and Phase 2 (layout system — `grow`, grid,
  percentages, alignment helpers, box-relative `line`).
- **Next — Phase 3 (components):** `Headline`, `Paragraph`, `Card`, `CTA`, `Comparison`, `Flow`, and
  the rest — pure functions over primitives, consuming `typography.heading`.
- **Phase 4 (theme):** complete the token surface and `social.config.ts` integration.
- **Phase 5 (CLI):** `social init`, `commander`-based parsing, `chokidar` watch.
- **Phase 6 (agent optimization):** a complete `AGENTS.md` rulebook and per-component examples.
