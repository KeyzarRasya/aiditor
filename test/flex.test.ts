import { describe, expect, it } from "vitest";
import {
  alignBottom,
  alignRight,
  center,
  createPost,
  group,
  layout,
  rect,
  text,
  type Post,
} from "aiditor";

const FRAME = { size: { width: 400, height: 400 }, safeMargin: 0 } as const;

function frame(children: Parameters<typeof createPost>[0]["children"], layoutStyle = {}): Post {
  return createPost({
    ...FRAME,
    layout: { padding: 0, gap: 0, ...layoutStyle },
    children,
  });
}

describe("grow distribution", () => {
  it("splits free space evenly between equal weights", () => {
    const post = frame(
      [rect({ grow: 1, height: 50 }), rect({ grow: 1, height: 50 })],
      { direction: "row" },
    );
    layout(post);
    expect(post.root.children[0]?.box).toMatchObject({ x: 0, width: 200, height: 50 });
    expect(post.root.children[1]?.box).toMatchObject({ x: 200, width: 200 });
  });

  it("splits proportionally to weight", () => {
    const post = frame(
      [rect({ grow: 2, height: 50 }), rect({ grow: 1, height: 50 })],
      { direction: "row" },
    );
    layout(post);
    expect(post.root.children[0]?.box?.width).toBeCloseTo(266.67, 1);
    expect(post.root.children[1]?.box?.width).toBeCloseTo(133.33, 1);
  });

  it("subtracts gaps before sharing", () => {
    const post = frame(
      [rect({ grow: 1, height: 50 }), rect({ grow: 1, height: 50 })],
      { direction: "row", gap: 40 },
    );
    layout(post);
    expect(post.root.children[0]?.box?.width).toBe(180);
    expect(post.root.children[1]?.box).toMatchObject({ x: 220, width: 180 });
  });

  it("keeps fixed siblings at their explicit size", () => {
    const post = frame(
      [rect({ width: 100, height: 50 }), rect({ grow: 1, height: 50 })],
      { direction: "row" },
    );
    layout(post);
    expect(post.root.children[0]?.box?.width).toBe(100);
    expect(post.root.children[1]?.box).toMatchObject({ x: 100, width: 300 });
  });

  it("wraps text inside a grown child", () => {
    const long = text("The quick brown fox jumps over the lazy dog", {
      fontSize: 32,
      lineHeight: 1.4,
    });
    const left = group([long], { grow: 1 });
    const right = group([text("x", { fontSize: 32 })], { grow: 1 });
    const post = frame([left, right], { direction: "row" });
    layout(post);
    expect(left.box?.width).toBe(200);
    expect(long.metrics?.lines.length).toBeGreaterThan(1);
  });

  it("does not shrink below the container width", () => {
    const post = frame(
      [rect({ width: 300, height: 50 }), rect({ width: 300, height: 50 })],
      { direction: "row" },
    );
    layout(post);
    expect(post.root.children[1]?.box?.x).toBe(300);
    expect(post.root.children[1]?.box?.width).toBe(300);
  });
});

describe("cross-axis stretch", () => {
  it("fills the cross axis when align is stretch", () => {
    const post = frame([rect({ width: 100 })], { direction: "row", align: "stretch" });
    layout(post);
    expect(post.root.children[0]?.box).toMatchObject({ width: 100, height: 400 });
  });
});

describe("alignment helpers", () => {
  it("center() centers on both axes", () => {
    const node = rect({ width: 100, height: 50 });
    const post = frame([center([node])]);
    layout(post);
    expect(node.box).toMatchObject({ x: 150, y: 175, width: 100, height: 50 });
  });

  it("alignRight() pushes to the right edge", () => {
    const node = rect({ width: 100, height: 50 });
    const post = frame([alignRight([node])]);
    layout(post);
    expect(node.box?.x).toBe(300);
  });

  it("alignBottom() pushes to the bottom edge", () => {
    const node = rect({ width: 100, height: 50 });
    const post = frame([alignBottom([node])]);
    layout(post);
    expect(node.box?.y).toBe(350);
  });
});
