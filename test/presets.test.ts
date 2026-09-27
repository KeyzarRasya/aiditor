import { describe, expect, it } from "vitest";
import {
  comparisonPost,
  createPost,
  educationalPost,
  layout,
  listPost,
  processPost,
  quotePost,
  renderToSvg,
  type DesignNode,
  type GroupNode,
  type Post,
} from "aiditor";

function build(children: DesignNode[]): Post {
  return layout(
    createPost({ size: { width: 1080, height: 1080 }, safeMargin: 0, children }),
  );
}

function asGroup(node: DesignNode | undefined): GroupNode {
  if (!node || node.kind !== "group") {
    throw new Error(`expected a group node, got ${node?.kind ?? "undefined"}`);
  }
  return node;
}

describe("page-level presets", () => {
  it("educationalPost composes badge, headline, intro, points and takeaway", () => {
    const post = build([
      educationalPost({
        badge: "Tips",
        title: "ERP bukan sekadar harga",
        intro: "Yang penting adalah kecocokan proses.",
        points: ["Pahami proses", "Tentukan kebutuhan"],
        takeaway: "Mulai dari proses.",
      }),
    ]);

    const stack = asGroup(post.root.children[0]);
    expect(stack.children).toHaveLength(5);
    expect(stack.layout.width).toBe("fill");
  });

  it("omits optional sections when their props are absent", () => {
    const post = build([educationalPost({ title: "T", points: ["a"] })]);

    const stack = asGroup(post.root.children[0]);
    expect(stack.children).toHaveLength(2); // headline + card
  });

  it("honours a gap override from the shared options", () => {
    const post = build([educationalPost({ title: "T", points: ["a"], gap: 100 })]);

    const stack = asGroup(post.root.children[0]);
    const [first, second] = stack.children;
    expect(second?.box?.y).toBeCloseTo((first?.box?.height ?? 0) + 100, 5);
  });

  it("renders every preset without throwing", () => {
    const posts: Post[] = [
      build([comparisonPost({ title: "T", left: { title: "A" }, right: { title: "B" } })]),
      build([listPost({ title: "T", items: ["a", "b"] })]),
      build([processPost({ title: "T", steps: ["a", "b"] })]),
      build([quotePost({ quote: "Desain adalah kode.", author: "Tim Produk" })]),
    ];

    for (const post of posts) {
      expect(renderToSvg(post)).toContain("<svg");
    }
  });

  it("numbers the items in listPost and bullets them in educationalPost", () => {
    const numbered = renderToSvg(build([listPost({ title: "T", items: ["a"] })]));
    const bulleted = renderToSvg(
      build([educationalPost({ title: "T", points: ["a"] })]),
    );

    expect(numbered).toContain("1.");
    expect(bulleted).toContain("\u2022");
  });

  it("rejects an empty card", () => {
    const post = createPost({ size: { width: 100, height: 100 }, safeMargin: 0, children: [] });
    expect(post.width).toBe(100);

    expect(() =>
      layout(
        createPost({
          size: { width: 100, height: 100 },
          safeMargin: 0,
          children: [listPost({ title: "T", items: [] })],
        }),
      ),
    ).toThrow(/card\(\) requires at least one of/);
  });
});
