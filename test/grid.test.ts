import { describe, expect, it } from "vitest";
import { createPost, grid, layout, rect, type DesignNode, type LayoutStyle, type Post } from "aiditor";

function frame(children: DesignNode[], layoutStyle: LayoutStyle = {}): Post {
  return createPost({
    size: { width: 400, height: 400 },
    safeMargin: 0,
    layout: { padding: 0, gap: 0, ...layoutStyle },
    children,
  });
}

describe("grid", () => {
  it("flows children row-major into equal columns", () => {
    const cells = [
      rect({ height: 40 }),
      rect({ height: 50 }),
      rect({ height: 60 }),
      rect({ height: 30 }),
    ];
    const post = frame([grid(cells, { columns: 3 })]);
    layout(post);
    expect(cells[0]?.box?.width).toBeCloseTo(133.33, 1);
    expect(cells[1]?.box?.x).toBeCloseTo(133.33, 1);
    expect(cells[2]?.box?.x).toBeCloseTo(266.67, 1);
    expect(cells[3]?.box?.x).toBe(0);
    expect(cells[3]?.box?.y).toBe(60);
  });

  it("sizes each row to its tallest child", () => {
    const cells = [rect({ height: 40 }), rect({ height: 90 })];
    const post = frame([grid(cells, { columns: 2 })]);
    layout(post);
    expect(cells[0]?.box?.y).toBe(0);
    expect(cells[0]?.box?.height).toBe(40);
    expect(cells[1]?.box?.height).toBe(90);
  });

  it("applies gap on both axes", () => {
    const cells = [rect({ height: 40 }), rect({ height: 40 }), rect({ height: 40 })];
    const post = frame([grid(cells, { columns: 2, gap: 20 })]);
    layout(post);
    expect(cells[0]?.box?.width).toBe(190);
    expect(cells[1]?.box?.x).toBe(210);
    expect(cells[2]?.box?.y).toBe(60);
  });

  it("hugs column widths when the grid is unbounded", () => {
    const cells = [rect({ width: 100, height: 10 }), rect({ width: 60, height: 10 })];
    const post = frame([grid(cells, { columns: 2, width: "hug" })]);
    layout(post);
    expect(cells[0]?.box?.width).toBe(100);
    expect(cells[1]?.box?.x).toBe(100);
  });

  it("rejects an invalid column count", () => {
    expect(() => grid([], { columns: 0 })).toThrow(/positive integer/);
  });
});
