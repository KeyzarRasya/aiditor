import { describe, expect, it } from "vitest";
import {
  comparison,
  createPost,
  flow,
  group,
  icon,
  layout,
  number,
  path,
  quote,
  renderToSvg,
  type DesignNode,
  type GroupNode,
  type LayoutStyle,
  type Post,
  type TextNode,
} from "aiditor";

function frame(children: DesignNode[], layoutStyle: LayoutStyle = {}): Post {
  return createPost({
    size: { width: 400, height: 400 },
    safeMargin: 0,
    layout: { padding: 0, gap: 0, ...layoutStyle },
    children,
  });
}

function asGroup(node: DesignNode | undefined): GroupNode {
  if (!node || node.kind !== "group") {
    throw new Error(`expected a group node, got ${node?.kind ?? "undefined"}`);
  }
  return node;
}

function asText(node: DesignNode | undefined): TextNode {
  if (!node || node.kind !== "text") {
    throw new Error(`expected a text node, got ${node?.kind ?? "undefined"}`);
  }
  return node;
}

describe("comparison", () => {
  it("produces two equal-width columns", () => {
    const post = frame([
      comparison({ left: { title: "A", items: ["x"] }, right: { title: "B", items: ["y"] } }),
    ]);
    layout(post);
    const row = asGroup(post.root.children[0]);
    expect(row.children).toHaveLength(2);
    const left = asGroup(row.children[0]);
    const right = asGroup(row.children[1]);
    expect(left.box?.width).toBe(180);
    expect(right.box?.width).toBe(180);
    expect(right.box?.x).toBe(220);
  });
});

describe("flow", () => {
  it("numbers the steps in order", () => {
    const post = frame([flow({ steps: ["alpha", "beta", "gamma"] })]);
    layout(post);
    const column = asGroup(post.root.children[0]);
    expect(column.children).toHaveLength(3);
    const firstRow = asGroup(column.children[0]);
    const marker = asGroup(firstRow.children[0]);
    expect(asText(marker.children[0]).text).toBe("1");

    const svg = renderToSvg(post);
    expect(svg).toContain(">1</tspan>");
    expect(svg).toContain(">3</tspan>");
  });
});

describe("quote", () => {
  it("reserves an accent bar beside the text", () => {
    const post = frame([quote({ text: "Hello", author: "Me" })]);
    layout(post);
    const row = asGroup(post.root.children[0]);
    expect(row.children[0]?.kind).toBe("rect");
    expect(row.children[0]?.style.fill).toBe("#38BDF8");
    const body = asGroup(row.children[1]);
    expect(body.children).toHaveLength(2);
  });
});

describe("number", () => {
  it("sizes the value above the heading token and hugs", () => {
    const post = frame([number({ value: "1080", label: "lebar" })]);
    layout(post);
    const node = asGroup(post.root.children[0]);
    expect(node.layout.width).toBe("hug");
    expect(node.children[0]?.style.fontSize).toBe(Math.round(72 * 1.2));
    expect(node.children[0]?.style.color).toBe("#38BDF8");
  });
});

describe("path / icon", () => {
  it("scales the path into its box at the box origin", () => {
    const post = frame([group([icon({ d: "M0 0 L24 24", size: 48 })], { padding: 20 })]);
    layout(post);
    const svg = renderToSvg(post);
    expect(svg).toContain('<path d="M0 0 L24 24" transform="translate(20 20) scale(2 2)"');
  });

  it("requires an explicit size", () => {
    const node: DesignNode = { kind: "path", d: "M0 0", viewBox: 24, style: {}, layout: {} };
    const post = createPost({
      size: { width: 100, height: 100 },
      safeMargin: 0,
      children: [node],
    });
    expect(() => layout(post)).toThrow(/requires numeric "width" and "height"/);
  });

  it("exposes the raw path primitive", () => {
    const node = path("M0 0 H24", { width: 24, height: 1, stroke: "#ffffff" });
    expect(node.kind).toBe("path");
    expect(node.viewBox).toBe(24);
  });
});
