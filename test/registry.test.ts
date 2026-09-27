import { describe, expect, it } from "vitest";
import { FontRegistry, getFontRegistry } from "aiditor";

describe("font registry", () => {
  it("resolves the closest weight for a known family", () => {
    const face = getFontRegistry().resolve({ family: "Roboto", weight: 700 });
    expect(face.family).toBe("Roboto");
    expect(face.weight).toBe(700);
  });

  it("lists available families when the font is unknown", () => {
    expect(() => getFontRegistry().resolve({ family: "Inter" })).toThrow(
      /Available families: Roboto/,
    );
  });

  it("explains an empty fonts directory", () => {
    const registry = new FontRegistry([]);
    expect(() => registry.resolve({ family: "Roboto" })).toThrow(/No fonts found/);
  });
});
