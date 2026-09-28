# AGENTS.md

Rules for AI coding agents (OpenCode, Command Code, etc.) working in this repository.

## What this project is

Social images as code. A post is a TypeScript file that describes a layout using semantic
components; rendering walks the tree through layout → SVG → PNG. Same code always produces the
same image.

## Workflow

1. Read this file and the relevant component source under `src/`.
2. Edit or create a post under `posts/`.
3. Render it: `npm run render -- posts/<name>.ts`.
4. Inspect the output in `dist/`, then iterate.

Never hand-edit generated files in `dist/`.

## Discover the available surface

- `npm run social:components` — list every component and layout helper. (Or `npx tsx src/cli/index.ts components`.)
- `npx tsx src/cli/index.ts components card` — params and a copy-paste example for one entry.
- `npx tsx src/cli/index.ts components --json` — the same catalog, machine-readable.
- `docs/COMPONENTS.md` — the generated reference.

## Render-verification workflow

After every change:

1. **Render** — `npm run render -- posts/<name>.ts`.
2. **Inspect** — open the PNG in `dist/`, or read the generated SVG for exact geometry.
3. **Check** — nothing spills past the canvas, the 72px safe margin holds, text is readable at the
   target size, and nothing overlaps.
4. **Fix the code, not the image**, then render again.

Never call a post done without looking at the rendered output.

## Rules

- Use the highest-level API that fits — semantic components (`headline`, `card`, `comparison`,
  `flow`, …) first, then `group`/`stack`/`row`/`grid` with semantic layout. Never raw `x`/`y`.
- Do not use magic numbers for positioning. Prefer `gap`, `padding`, `align`, `justify`,
  `width: "fill"`, `grow` for sharing space, and `grid({ columns })` for equal columns.
- Keep a safe margin on all sides. The root container applies 72px by default — keep it.
- Colors and typography come from the theme — change `theme.ts`, not individual posts. Reach for raw
  hex values only when a post genuinely needs an accent the theme does not provide.
- Keep text readable at the target resolution: headings ≥ 48px, body ≥ 28px.
- One post file describes one image (`createPost`) or one carousel folder (`createCarousel` →
  `dist/<name>/slide-01.png`, …). Keep content separate from layout where practical.
- After every change, render and inspect the result before declaring it done. For carousels,
  inspect every slide.

## Images

- Store workflow screenshots and PoC shots under `assets/`, reference them by project-root
  path: `image("assets/shot.png", { width: 936, height: 520 })`. The engine does not care about
  subfolders — any path relative to the project root works.
- `width` and `height` are mandatory numbers (images have no intrinsic sizing). Keep `width`
  within the content column (≤936px on square after the 72px safe margins).
- Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`. Pre-size large screenshots
  before committing so the repo stays lean.
- Remote `http(s):` URLs render in SVG output only and stay blank in PNG — always use local
  files for anything that ships as PNG.
- `social dev` re-renders when a referenced asset file changes. New files under `assets/`
  are picked up automatically; asset paths outside `assets/` that are added mid-session need a
  `dev` restart to be picked up.

## Error messages are contracts

Errors are written to be actionable. If you see one, fix the cause rather than working around it:

```
Font "Inter" was not found in ./fonts. Available families: Roboto.
image("assets/logo.png") requires numeric "width" and "height" props ...
card() requires at least one of "title", "items", or "children".
Canvas dimensions must be positive integers
```
