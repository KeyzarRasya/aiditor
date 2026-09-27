import { describe, expect, it } from "vitest";
import {
  badge,
  card,
  createPost,
  cta,
  divider,
  headline,
  layout,
  paragraph,
  renderToSvg,
  subheadline,
  type DesignNode,
  type GroupNode,
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

function asGroup(node: DesignNode | undefined): GroupNode {
  if (!node || node.kind !== "group") {
    throw new Error(`expected a group node, got ${node?.kind ?? "undefined"}`);
  }
  return node;
}

describe("component mechanism", () => {
  it("resolves a component into a real node during layout()", () => {
    const post = frame([headline({ text: "Hello" })]);
    expect(post.root.children[0]?.kind).toBe("component");

    layout(post);

    expect(post.root.children[0]?.kind).toBe("text");
  });

  it("resolves components nested inside a component", () => {
    const post = frame([card({ title: "T", items: ["a"] })]);
    layout(post);
    const node = asGroup(post.root.children[0]);
    expect(node.children[0]?.kind).toBe("text");
    expect(node.children).toHaveLength(2);
  });

  it("throws an actionable error when rendering before layout()", () => {
    const post = frame([headline({ text: "Hello" })]);
    expect(() => renderToSvg(post)).toThrow(/was not resolved/);
  });

  it("is idempotent across repeated layout passes", () => {
    const post = frame([card({ title: "T", items: ["a", "b"] })]);
    layout(post);
    const first = JSON.stringify(post.root.children.map((child) => child.box));
    layout(post);
    const second = JSON.stringify(post.root.children.map((child) => child.box));
    expect(second).toBe(first);
  });
});

describe("theme flow", () => {
  it("uses the heading tokens for a headline", () => {
    const post = frame([headline({ text: "Hello" })]);
    layout(post);
    expect(post.root.children[0]?.style.fontSize).toBe(72);
    expect(post.root.children[0]?.style.color).toBe("#F8FAFC");
  });

  it("lets explicit props override tokens", () => {
    const post = frame([headline({ text: "Hello", fontSize: 90 })]);
    layout(post);
    expect(post.root.children[0]?.style.fontSize).toBe(90);
  });

  it("passes a per-post theme into components", () => {
    const post = createPost({
      size: { width: 400, height: 400 },
      safeMargin: 0,
      theme: { typography: { heading: { size: 40 } } },
      children: [headline({ text: "Hello" })],
    });
    layout(post);
    expect(post.root.children[0]?.style.fontSize).toBe(40);
  });
});

describe("text components", () => {
  it("sizes subheadline between heading and body", () => {
    const post = frame([subheadline({ text: "Sub" })]);
    layout(post);
    expect(post.root.children[0]?.style.fontSize).toBe(Math.round(72 * 0.62));
  });

  it("colours paragraph with textMuted", () => {
    const post = frame([paragraph({ text: "Body" })]);
    layout(post);
    expect(post.root.children[0]?.style.color).toBe("#CBD5E1");
  });

  it("weights and colours the cta", () => {
    const post = frame([cta({ text: "Go" })]);
    layout(post);
    expect(post.root.children[0]?.style.color).toBe("#38BDF8");
    expect(post.root.children[0]?.style.fontWeight).toBe(700);
  });

  it("hugs the badge around its content", () => {
    const post = frame([badge({ text: "New" })]);
    layout(post);
    const node = asGroup(post.root.children[0]);
    expect(node.layout.width).toBe("hug");
    expect(node.box?.width ?? 0).toBeGreaterThan(0);
    expect(node.box?.width ?? 0).toBeLessThan(400);
  });

  it("renders a divider as a full-width one-pixel rule", () => {
    const post = frame([divider()]);
    layout(post);
    expect(post.root.children[0]?.box).toMatchObject({ width: 400, height: 1 });
  });
});

describe("card", () => {
  it("builds a surface container with a title and items", () => {
    const post = frame([card({ title: "T", items: ["a", "b"] })]);
    layout(post);
    const node = asGroup(post.root.children[0]);
    expect(node.style.fill).toBe("#111C31");
    expect(node.style.radius).toBe(28);
    expect(node.children).toHaveLength(3);
    expect(node.box?.width).toBe(400);
    expect(node.box?.height ?? 0).toBeGreaterThan(0);
  });

  it("appends extra children after items", () => {
    const post = frame([card({ items: ["a"], children: [cta({ text: "Go" })] })]);
    layout(post);
    const node = asGroup(post.root.children[0]);
    expect(node.children.at(-1)?.kind).toBe("text");
  });
});
