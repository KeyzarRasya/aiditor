import { Resvg } from "@resvg/resvg-js";

export interface PngRenderOptions {
  width: number;
  height: number;
  fontFiles?: string[];
  defaultFontFamily?: string;
}

/**
 * Rasterize an SVG string to a PNG buffer. System fonts are disabled so the same
 * SVG always produces the same pixels on every machine.
 */
export function renderToPng(svg: string, options: PngRenderOptions): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: options.width },
    font: {
      loadSystemFonts: false,
      fontFiles: options.fontFiles ?? [],
      defaultFontFamily: options.defaultFontFamily,
    },
    logLevel: "error",
  });
  return resvg.render().asPng();
}
