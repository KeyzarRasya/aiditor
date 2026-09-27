import { describe, expect, it } from "vitest";
import { createPost, layout, rect, type DesignNode } from "aiditor";

describe("layout", () => {
  it("stacks children vertically with gap and padding", () => {
    const post = createPost({
      size: { width: 400, height: 400 },
      safeMargin: 0,
      layout: { padding: 0, gap: 10 },
      children: [
        rect({ width: 100, height: 50, fill: "#000000" }),
        rect({ width: 100, height: 50, fill: "#000000" }),
      ],
    });
    layout(post);
    expect(post.root.children[0]?.box).toMatchObject({ x: 0, y: 0, width: 100, height: 50 });
    expect(post.root.children[1]?.box).toMatchObject({ y: 60 });
  });

  it("fills a child to the inner width", () => {
    const post = createPost({
      size: { width: 400, height: 400 },
      safeMargin: 0,
      layout: { padding: 20, gap: 0 },
      children: [rect({ width: "fill", height: 10, fill: "#000000" })],
    });
    layout(post);
    expect(post.root.children[0]?.box).toMatchObject({ x: 20, y: 20, width: 360, height: 10 });
  });

  it("centers children on the cross axis", () => {
    const post = createPost({
      size: { width: 400, height: 400 },
      safeMargin: 0,
      layout: { padding: 0, align: "center" },
      children: [rect({ width: 100, height: 10 })],
    });
    layout(post);
    expect(post.root.children[0]?.box?.x).toBe(150);
  });

  it("applies the safe margin by default", () => {
    const post = createPost({
      size: { width: 400, height: 400 },
      layout: { gap: 0 },
      children: [rect({ width: 100, height: 10 })],
    });
    layout(post);
    expect(post.root.children[0]?.box?.x).toBe(72);
    expect(post.root.children[0]?.box?.y).toBe(72);
  });

  it("requires an explicit size for images", () => {
    const node: DesignNode = { kind: "image", src: "logo.png", style: {}, layout: {} };
    const post = createPost({
      size: { width: 400, height: 400 },
      children: [node],
    });
    expect(() => layout(post)).toThrow(/requires numeric "width" and "height"/);
  });
});
