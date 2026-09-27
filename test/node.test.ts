import { describe, expect, it } from "vitest";
import { circle, createPost, rect, text } from "aiditor";

describe("node builders", () => {
  it("splits style and layout options", () => {
    const node = text("Hello", { fontSize: 32, color: "#ffffff", width: "fill", gap: 12 });
    expect(node.style.fontSize).toBe(32);
    expect(node.style.color).toBe("#ffffff");
    expect(node.layout.width).toBe("fill");
    expect(node.layout.gap).toBe(12);
  });

  it("keeps a circle's radius out of its style", () => {
    const node = circle({ radius: 40, fill: "#000000" });
    expect(node.radius).toBe(40);
    expect(node.style.radius).toBeUndefined();
    expect(node.style.fill).toBe("#000000");
  });

  it("rejects non-positive canvas dimensions", () => {
    expect(() => createPost({ size: { width: 0, height: 100 }, children: [rect()] })).toThrow(
      /positive integers/,
    );
  });

  it("rejects unknown formats", () => {
    expect(() =>
      // @ts-expect-error deliberately passing a format that does not exist
      createPost({ size: "not-a-format", children: [] }),
    ).toThrow(/Unknown format/);
  });
});
