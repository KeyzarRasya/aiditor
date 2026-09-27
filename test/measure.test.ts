import { describe, expect, it } from "vitest";
import { getFontRegistry, measureAdvance, wrapText } from "aiditor";

const font = getFontRegistry().resolve({ family: "Roboto", weight: 400 }).font;

describe("text measurement", () => {
  it("scales linearly with font size", () => {
    const small = measureAdvance("Hello world", font, 16);
    const large = measureAdvance("Hello world", font, 32);
    expect(large).toBeGreaterThan(small);
    expect(large).toBeCloseTo(small * 2, 1);
  });

  it("wraps long text within a width", () => {
    const metrics = wrapText("The quick brown fox jumps over the lazy dog again and again", font, {
      fontSize: 32,
      lineHeight: 1.4,
      maxWidth: 200,
    });
    expect(metrics.lines.length).toBeGreaterThan(1);
    for (const line of metrics.lines) {
      expect(measureAdvance(line, font, 32)).toBeLessThanOrEqual(201);
    }
  });

  it("keeps one line when width is unbounded", () => {
    const metrics = wrapText("A short line", font, {
      fontSize: 32,
      lineHeight: 1.4,
      maxWidth: Infinity,
    });
    expect(metrics.lines).toEqual(["A short line"]);
  });

  it("breaks words longer than the available width", () => {
    const metrics = wrapText("supercalifragilisticexpialidocious", font, {
      fontSize: 32,
      lineHeight: 1.4,
      maxWidth: 80,
    });
    expect(metrics.lines.length).toBeGreaterThan(1);
  });

  it("honors explicit newlines", () => {
    const metrics = wrapText("one\ntwo", font, {
      fontSize: 32,
      lineHeight: 1.4,
      maxWidth: Infinity,
    });
    expect(metrics.lines).toEqual(["one", "two"]);
  });
});
