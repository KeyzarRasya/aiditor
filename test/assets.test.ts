import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { card, createPost, image, layout, renderToSvg } from "aiditor";
import { collectImageDeps, collectImageSources } from "../src/cli/assets.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

describe("image assets", () => {
  it("embeds a local file as a base64 data URL", () => {
    const post = layout(
      createPost({
        size: { width: 400, height: 300 },
        safeMargin: 0,
        layout: { padding: 0, gap: 0 },
        children: [image("test/fixtures/shot.png", { width: 100, height: 100 })],
      }),
    );

    expect(renderToSvg(post)).toContain("<image");
    expect(renderToSvg(post)).toContain("data:image/png;base64,");
  });

  it("throws an actionable error for a missing file", () => {
    const post = layout(
      createPost({
        size: { width: 400, height: 300 },
        safeMargin: 0,
        layout: { padding: 0, gap: 0 },
        children: [image("assets/does-not-exist.png", { width: 100, height: 100 })],
      }),
    );

    expect(() => renderToSvg(post)).toThrow('Image "assets/does-not-exist.png" was not found');
  });

  it("finds local images including ones nested in components, skipping remote sources", () => {
    const post = createPost({
      size: { width: 400, height: 300 },
      children: [
        image("test/fixtures/shot.png", { width: 100, height: 100 }),
        card({
          title: "Nested",
          children: [image("test/fixtures/shot.png", { width: 50, height: 50 })],
        }),
        image("https://example.com/remote.png", { width: 10, height: 10 }),
        image("data:image/png;base64,AAAA", { width: 10, height: 10 }),
      ],
    });

    expect(collectImageSources(post.root, post.theme)).toEqual([
      "test/fixtures/shot.png",
      "test/fixtures/shot.png",
    ]);

    const deps = collectImageDeps(post, ROOT);
    expect(deps).toContain(fileURLToPath(new URL("../test/fixtures/shot.png", import.meta.url)));
    expect(deps.some((dep) => dep.includes("example.com"))).toBe(false);
  });

  it("ignores image paths that do not exist on disk", () => {
    const post = createPost({
      size: { width: 400, height: 300 },
      children: [image("assets/gone.png", { width: 10, height: 10 })],
    });

    expect(collectImageDeps(post, ROOT)).not.toContain("assets/gone.png");
  });
});
