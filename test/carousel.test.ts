import { describe, expect, it } from "vitest";
import {
  createCarousel,
  headline,
  isCarousel,
  paragraph,
  renderCarousel,
} from "aiditor";

describe("createCarousel", () => {
  it("builds one Post per slide sharing the carousel size", () => {
    const carousel = createCarousel({
      size: "instagram-square",
      slides: [
        { children: [headline({ text: "Slide one" })] },
        { children: [headline({ text: "Slide two" })] },
      ],
    });

    expect(isCarousel(carousel)).toBe(true);
    expect(carousel.slides).toHaveLength(2);
    for (const slide of carousel.slides) {
      expect(slide.width).toBe(1080);
      expect(slide.height).toBe(1080);
    }
  });

  it("lets slide-level fields override carousel defaults", () => {
    const carousel = createCarousel({
      size: "instagram-square",
      background: "#0B1220",
      slides: [
        { children: [paragraph({ text: "default bg" })] },
        { children: [paragraph({ text: "custom bg" })], background: "#111C31" },
      ],
    });

    expect(carousel.slides[0]?.background).toBe("#0B1220");
    expect(carousel.slides[1]?.background).toBe("#111C31");
  });

  it("rejects an empty slides array with an actionable error", () => {
    expect(() => createCarousel({ size: "instagram-square", slides: [] })).toThrow(
      'createCarousel requires at least one slide in "slides".',
    );
  });

  it("rejects a slide without children", () => {
    expect(() =>
      createCarousel({ size: "instagram-square", slides: [{ children: [] }] }),
    ).toThrow("createCarousel slide 1 requires at least one child node.");
  });

  it("renders one output per slide", () => {
    const carousel = createCarousel({
      size: { width: 400, height: 400 },
      slides: [
        { children: [headline({ text: "One" })] },
        { children: [headline({ text: "Two" })] },
        { children: [headline({ text: "Three" })] },
      ],
    });

    const outputs = renderCarousel(carousel, { format: "svg" });
    expect(outputs).toHaveLength(3);
    for (const output of outputs) {
      expect(typeof output).toBe("string");
    }
  });
});
