import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createPost,
  defaultConfig,
  defaultTheme,
  getProjectTheme,
  headline,
  layout,
  loadProjectTheme,
  loadTheme,
  renderToSvg,
  resetProjectTheme,
  setProjectTheme,
  type DeepPartial,
  type Post,
  type Theme,
} from "aiditor";

afterEach(() => {
  resetProjectTheme();
});

function render(overrides?: DeepPartial<Theme>): Post {
  return layout(
    createPost({
      size: { width: 400, height: 400 },
      safeMargin: 0,
      theme: overrides,
      children: [headline({ text: "Hello" })],
    }),
  );
}

describe("project theme registry", () => {
  it("applies a registered theme to posts", () => {
    setProjectTheme({ colors: { background: "#123456" } });

    const svg = renderToSvg(render());

    expect(svg).toContain('fill="#123456"');
    expect(getProjectTheme()).toEqual({ colors: { background: "#123456" } });
  });

  it("reverts to defaults after resetProjectTheme", () => {
    setProjectTheme({ colors: { background: "#123456" } });
    resetProjectTheme();

    const svg = renderToSvg(render());

    expect(svg).toContain(`fill="${defaultTheme.colors.background}"`);
  });

  it("prefers per-post overrides over the project theme", () => {
    setProjectTheme({ colors: { background: "#111111" } });

    expect(render().theme.colors.background).toBe("#111111");
    expect(render({ colors: { background: "#222222" } }).theme.colors.background).toBe("#222222");
  });

  it("falls back to defaultTheme when nothing is registered", () => {
    expect(render().theme.colors.background).toBe(defaultTheme.colors.background);
  });

  it("flows the project theme into components", () => {
    setProjectTheme({ typography: { heading: { size: 50 } } });

    expect(render().root.children[0]?.style.fontSize).toBe(50);
  });
});

describe("theme loader", () => {
  it("loads theme.ts from the project root", async () => {
    const theme = await loadProjectTheme({ cwd: process.cwd(), config: defaultConfig });

    expect(theme?.colors?.background).toBe(defaultTheme.colors.background);
  });

  it("returns undefined when the configured theme is absent", async () => {
    const theme = await loadProjectTheme({
      cwd: process.cwd(),
      config: { ...defaultConfig, theme: "missing-theme.ts" },
    });

    expect(theme).toBeUndefined();
  });

  it("errors when an explicit --theme file is missing", async () => {
    await expect(
      loadProjectTheme({ cwd: process.cwd(), config: defaultConfig, override: "nope.ts" }),
    ).rejects.toThrow(/was not found/);
  });

  it("errors when the theme module has no object default export", async () => {
    await expect(loadTheme(resolve(process.cwd(), "src/core/units.ts"))).rejects.toThrow(
      /must default-export/,
    );
  });
});
