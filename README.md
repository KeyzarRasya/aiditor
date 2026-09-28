# aiditor

Social images as code. A post is a TypeScript file that describes a layout with a small semantic
API; rendering walks that tree through layout → SVG → PNG:

```
TypeScript design → layout → SVG → PNG
```

The same source always produces the same image, which makes designs reproducible,
version-controlled, and safe to iterate on with an AI coding agent.

- Product vision: [`docs/PRD.md`](docs/PRD.md)
- Engine internals: [`docs/DEV-DOCS.md`](docs/DEV-DOCS.md)
- Component reference: [`docs/COMPONENTS.md`](docs/COMPONENTS.md) (generated — never edit by hand)

## Install

Prerequisites: **Node ≥ 20** and **npm**. The engine is ESM only.

```bash
git clone https://github.com/KeyzarRasya/aiditor.git
cd aiditor
npm install
```

> If your shell exports `NODE_ENV=production`, `npm install` silently skips devDependencies
> (no `vitest`, `tsc`, `tsx`, `eslint`). Install with `npm install --include=dev` in that case.

Verify with the bundled example post:

```bash
npm run render -- posts/hello.ts            # -> dist/hello.png
npm run render -- posts/hello.ts --format svg
npm run dev -- posts/hello.ts               # re-render on save
```

A registry release (`npm i @keyzarrasya/aiditor`) is planned; until then, install from source
as above. Scaffolded projects (`npx social init`) still link the engine locally for the same
reason — see [`docs/DEV-DOCS.md`](docs/DEV-DOCS.md) §11.

## Your content stays yours

This repo ships the engine, docs, fonts, and tests — not your posts. By design:

| Path | Tracked? | Purpose |
|---|---|---|
| `posts/` (except `hello.ts`) | No — gitignored | Your posts. `hello.ts` stays as the runnable example. |
| `assets/` | No — gitignored | Your screenshots and PoC images, referenced as `image("assets/shot.png", …)`. |
| `dist/` | No — gitignored | Generated PNG/SVG output. Never hand-edit. |
| `theme.ts`, `social.config.ts` | Yes | Project defaults; override per post via `createPost({ theme })`. |

A typical session:

```bash
# 1. Edit or create a post under posts/
# 2. Render it
npm run render -- posts/<name>.ts
# 3. Open the PNG in dist/, check margins/readability/overlap, iterate on the code
```

One file describes one image (`createPost`) or one carousel folder (`createCarousel` →
`dist/<name>/slide-01.png`, …). For carousels, inspect every slide. Component usage rules live
in `AGENTS.md`; the callable surface is listed by `npm run social:components`.

## Contributing

### Quality gates

All of these must pass before a change is done:

```bash
npm run typecheck      # tsc --noEmit
npm test               # vitest run (npm run test:watch to iterate)
npm run lint           # eslint .
npm run build          # tsc -> build/
npm run docs           # regenerate docs/COMPONENTS.md from the catalog
```

`npm run docs` is enforced by a test: `docs/COMPONENTS.md` must byte-match
`src/components/catalog.ts`, so the reference can never go stale silently. If you add a
component, layout helper, or preset, add its catalog entry and regenerate.

### Rules that keep output deterministic

- No randomness, timestamps, or `Date` in rendered output.
- Derive ids (e.g. shadow filters) from traversal order, never from random values.
- Keep the same `fontFiles` list flowing into both text measurement and PNG rasterization.
- Factories for deferred components must be pure: theme in, nodes out.

### Errors are contracts

Error strings are part of the UX — for humans and agents. New failure modes get an actionable
message naming the cause and the fix (see `AGENTS.md`), plus a test pinning the text.

### Where code goes

- `src/core/` — node types, builders, canvas, units.
- `src/layout/` — resolve + place passes, flex/grid, alignment helpers.
- `src/components/` — semantic components (+ `catalog.ts`, the source of truth).
- `src/presets/` — page-level templates composed from components.
- `src/render/` — SVG emitter, PNG rasterizer, `renderPost`/`renderCarousel` facades.
- `src/theme/`, `src/fonts/`, `src/text/` — tokens, registry, measurement.
- `src/cli/` — `social` commands (`render`, `dev`, `components`, `init`).
- `test/` — Vitest suites. Assert on `node.box` for layout, on substrings/determinism for
  rendering — no pixel snapshots.

The full internals tour is [`docs/DEV-DOCS.md`](docs/DEV-DOCS.md) (start at §3 for the repo
layout and §14 for extending the engine).

## License

MIT (see `license` in `package.json`).
