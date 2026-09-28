import type { Post } from "../core/canvas.js";
import type { Carousel } from "../core/carousel.js";
import { getFontRegistry } from "../fonts/registry.js";
import { layout } from "../layout/index.js";
import { renderToPng } from "./png.js";
import { renderToSvg } from "./svg.js";

export type RenderFormat = "svg" | "png";

export interface RenderPostOptions {
  format?: RenderFormat;
  /** Override the font files handed to the rasterizer. Defaults to the registered fonts. */
  fontFiles?: string[];
}

export function renderPost(post: Post, options: RenderPostOptions = {}): string | Buffer {
  layout(post);

  const svg = renderToSvg(post);
  const format = options.format ?? "png";
  if (format === "svg") return svg;

  const registry = getFontRegistry();
  return renderToPng(svg, {
    width: post.width,
    height: post.height,
    fontFiles: options.fontFiles ?? registry.paths,
    defaultFontFamily: post.theme.typography.body.family,
  });
}

/** Render every slide of a carousel, in order. */
export function renderCarousel(
  carousel: Carousel,
  options: RenderPostOptions = {},
): (string | Buffer)[] {
  return carousel.slides.map((slide) => renderPost(slide, options));
}
