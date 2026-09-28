/**
 * Templates for `social init`. They live here as strings rather than as files under `src/` so that
 * `tsc`'s build output contains them — no asset-copying step in the build.
 */

const THEME = `import { defineTheme } from "aiditor";

/**
 * Project-wide brand theme. Values here are merged over the built-in defaults, so you only need to
 * specify the tokens you want to change. The renderer applies this to every post.
 */
export default defineTheme({
  colors: {
    primary: "#2563EB",
    background: "#0B1220",
    surface: "#111C31",
    text: "#F8FAFC",
    textMuted: "#CBD5E1",
    accent: "#38BDF8",
    border: "#1E293B",
  },
});
`;

const SOCIAL_CONFIG = `import type { SocialConfig } from "aiditor";

const config: SocialConfig = {
  outDir: "dist",
  fontsDir: "fonts",
  defaultFormat: "png",
  theme: "theme.ts",
};

export default config;
`;

const STARTER_POST = `import { card, createPost, headline, paragraph } from "aiditor";

export default createPost({
  size: "instagram-square",
  children: [
    headline({ text: "Hello from aiditor." }),
    paragraph({ text: "Edit this file, then run: npm run render -- posts/hello.ts" }),
    card({
      title: "Next steps",
      items: ["Change the brand tokens in theme.ts", "Write a post in posts/", "Render it"],
    }),
  ],
});
`;

const GITIGNORE = `node_modules/
dist/
*.log
.DS_Store
`;

const AGENTS = `# AGENTS.md

Rules for AI coding agents working in this repository.

## What this project is

Social images as code. A post is a TypeScript file under \`posts/\`; rendering walks it through
layout → SVG → PNG. The same code always produces the same image.

## Workflow

1. Read this file and the aiditor docs (\`node_modules/aiditor/docs/COMPONENTS.md\`).
2. Edit or create a post under \`posts/\`.
3. Render it: \`npm run render -- posts/<name>.ts\`.
4. Inspect the output in \`dist/\`, then iterate.

Never hand-edit generated files in \`dist/\`.

## Discover the available surface

- \`npx tsx node_modules/aiditor/src/cli/index.ts components\` — list every component and layout helper.
- \`npx tsx node_modules/aiditor/src/cli/index.ts components card\` — params and an example for one entry.
- Add \`--json\` for machine-readable output.

## Render-verification workflow

After every change:

1. **Render** — \`npm run render -- posts/<name>.ts\`.
2. **Inspect** — open the PNG in \`dist/\`, or read the generated SVG for exact geometry.
3. **Check** — nothing spills past the canvas, the 72px safe margin holds, text is readable, and
   nothing overlaps.
4. **Fix the code, not the image**, then render again.

Never call a post done without looking at the rendered output.

## Rules

- Use the semantic components first — \`headline\`, \`paragraph\`, \`card\`, \`comparison\`, \`flow\`,
  \`cta\`, \`badge\`, \`quote\`, \`number\`, \`divider\`, \`icon\` — then \`group\`/\`stack\`/\`row\`/\`grid\`.
  Never raw \`x\`/\`y\` coordinates.
- Do not use magic numbers for positioning. Prefer \`gap\`, \`padding\`, \`align\`, \`justify\`,
  \`width: "fill"\`, \`grow\`, and \`grid({ columns })\`.
- Keep the 72px safe margin the root container applies.
- Colours and typography come from \`theme.ts\` — change it there, not per post.
- Keep text readable at the target resolution: headings ≥ 48px, body ≥ 28px.
- One post file describes one image (\`createPost\`) or one carousel folder (\`createCarousel\` →
  \`dist/<name>/slide-01.png\`, …).
- After every change, render and inspect the result. For carousels, inspect every slide.

## Images

- Store workflow screenshots and PoC shots under \`assets/\`, reference them by project-root
  path: \`image("assets/shot.png", { width: 936, height: 520 })\`. Any path relative to the
  project root works.
- \`width\` and \`height\` are mandatory numbers (images have no intrinsic sizing). Keep \`width\`
  within the content column (≤936px on square after the 72px safe margins).
- Supported formats: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.webp\`, \`.gif\`, \`.svg\`. Pre-size large
  screenshots before committing so the repo stays lean.
- Remote \`http(s):\` URLs render in SVG output only and stay blank in PNG — always use local
  files for anything that ships as PNG.
- \`social dev\` re-renders when a referenced asset file changes. New files under \`assets/\`
  are picked up automatically; asset paths outside \`assets/\` that are added mid-session need a
  \`dev\` restart to be picked up.

## Errors are contracts

If you see an error, fix the cause rather than working around it:

\`\`\`
Font "Inter" was not found in ./fonts. Available families: Roboto.
image("assets/logo.png") requires numeric "width" and "height" props ...
card() requires at least one of "title", "items", or "children".
Component was not resolved. Call layout(post) before rendering this tree.
\`\`\`
`;

const AUTHORING_NOTE = `> **Note:** \`aiditor\` is linked with a \`file:\` dependency and resolved through the \`paths\`
> mapping in \`tsconfig.json\` (\`aiditor\` → \`./node_modules/aiditor/src/index.ts\`). This is because the
> engine is not published to a registry yet. Once it is, replace the \`file:\` dependency with a
> version range and drop the \`paths\` mapping.`;

function readme(name: string): string {
  return `# ${name}

Social images as code, built with \`aiditor\`. A post is a TypeScript file that describes a layout
using semantic components; rendering walks it through layout → SVG → PNG. The same source always
produces the same image.

## Quick start

\`\`\`bash
npm install
npm run render -- posts/hello.ts     # -> dist/hello.png
npm run render -- posts/hello.ts --format svg
npm run dev -- posts/hello.ts        # re-render on save
\`\`\`

Edit posts under \`posts/\`, change brand tokens in \`theme.ts\`, then render. Output lands in \`dist/\`.

${AUTHORING_NOTE}
`;
}

function packageJson(name: string, enginePath: string): string {
  return (
    JSON.stringify(
      {
        name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          render: "tsx node_modules/aiditor/src/cli/index.ts render",
          dev: "tsx node_modules/aiditor/src/cli/index.ts dev",
        },
        dependencies: {
          aiditor: `file:${enginePath}`,
        },
        devDependencies: {
          "@types/node": "^22.10.0",
          tsx: "^4.19.0",
          typescript: "^5.7.0",
        },
      },
      null,
      2,
    ) + "\n"
  );
}

const TSCONFIG =
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        types: ["node"],
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        baseUrl: ".",
        paths: {
          aiditor: ["./node_modules/aiditor/src/index.ts"],
        },
      },
      include: ["posts", "theme.ts", "social.config.ts"],
    },
    null,
    2,
  ) + "\n";

/** Turn a directory name into a valid npm package name. */
export function toPackageName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "");
  return slug.length > 0 ? slug : "social-images";
}

/** Files written by `init`, keyed by path relative to the project root. */
export function scaffoldFiles(name: string, enginePath: string): Record<string, string> {
  return {
    "package.json": packageJson(toPackageName(name), enginePath),
    "tsconfig.json": TSCONFIG,
    ".gitignore": GITIGNORE,
    "README.md": readme(toPackageName(name)),
    "AGENTS.md": AGENTS,
    "theme.ts": THEME,
    "social.config.ts": SOCIAL_CONFIG,
    "posts/hello.ts": STARTER_POST,
    "assets/.gitkeep": "",
  };
}
