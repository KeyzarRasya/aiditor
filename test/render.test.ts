import { describe, expect, it } from "vitest";
import {
  createPost,
  getFontRegistry,
  layout,
  rect,
  renderPost,
  renderToPng,
  renderToSvg,
  text,
  type Post,
} from "aiditor";

function samplePost(): Post {
  return layout(
    createPost({
      size: "instagram-square",
      children: [
        text("Hello world", { fontSize: 64, fontWeight: 700 }),
        rect({ width: "fill", height: 20, fill: "#2563EB", radius: 10 }),
      ],
    }),
  );
}

describe("rendering", () => {
  it("produces deterministic SVG", () => {
    const first = renderToSvg(samplePost());
    const second = renderToSvg(samplePost());
    expect(first).toBe(second);
    expect(first).toContain("<svg");
    expect(first).toContain("Hello world");
  });

  it("rasterizes to a PNG buffer", () => {
    const output = renderPost(samplePost(), { format: "png" });
    expect(Buffer.isBuffer(output)).toBe(true);
    expect((output as Buffer).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("produces byte-identical PNGs for identical input", () => {
    const fontFiles = getFontRegistry().paths;
    const first = renderToPng(renderToSvg(samplePost()), { width: 1080, height: 1080, fontFiles });
    const second = renderToPng(renderToSvg(samplePost()), { width: 1080, height: 1080, fontFiles });
    expect(first.equals(second)).toBe(true);
  });
});
