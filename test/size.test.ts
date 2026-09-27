import { describe, expect, it } from "vitest";
import {
  createPost,
  group,
  layout,
  line,
  rect,
  renderToSvg,
  type DesignNode,
  type LayoutStyle,
  type Post,
} from "aiditor";

function frame(children: DesignNode[], layoutStyle: LayoutStyle = {}): Post {
  return createPost({
    size: { width: 400, height: 400 },
    safeMargin: 0,
    layout: { padding: 0, gap: 0, ...layoutStyle },
    children,
  });
}

describe("percentage sizing", () => {
  it("resolves width percentages against the parent inner width", () => {
    const node = rect({ width: "50%", height: 20 });
    const post = frame([node]);
    layout(post);
    expect(node.box?.width).toBe(200);
  });

  it("resolves height percentages against the parent inner height", () => {
    const node = rect({ width: 20, height: "25%" });
    const post = frame([node]);
    layout(post);
    expect(node.box?.height).toBe(100);
  });

  it("resolves percentages on a row's main axis", () => {
    const node = rect({ width: "25%", height: 10 });
    const post = frame([node], { direction: "row" });
    layout(post);
    expect(node.box?.width).toBe(100);
  });
});

describe("line", () => {
  it("draws relative to its laid-out box", () => {
    const node = line({ x1: 0, y1: 0, x2: 100, y2: 0, stroke: "#ffffff" });
    const post = frame([group([node], { padding: 40 })]);
    layout(post);
    const svg = renderToSvg(post);
    expect(svg).toContain('<line x1="40" y1="40" x2="140" y2="40"');
  });
});
