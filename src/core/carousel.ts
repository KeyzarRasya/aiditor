import { createPost, type Post, type PostOptions } from "./canvas.js";

/** Per-slide content. Inherits the carousel-level `size` and defaults; fields set here win. */
export interface CarouselSlideOptions {
  children: PostOptions["children"];
  background?: PostOptions["background"];
  layout?: PostOptions["layout"];
  theme?: PostOptions["theme"];
  safeMargin?: PostOptions["safeMargin"];
}

export interface CarouselOptions {
  /** Canvas size for every slide — any `FORMATS` name or custom dimensions. */
  size: PostOptions["size"];
  slides: CarouselSlideOptions[];
  /** Defaults applied to every slide; a slide-level field overrides these. */
  background?: PostOptions["background"];
  layout?: PostOptions["layout"];
  theme?: PostOptions["theme"];
  safeMargin?: PostOptions["safeMargin"];
}

export interface Carousel {
  kind: "carousel";
  slides: Post[];
}

/**
 * A carousel post: one file that renders to a folder of slides
 * (`dist/<name>/slide-01.png`, `slide-02.png`, …).
 *
 * Every slide shares the carousel-level `size`; per-slide `background`, `layout`,
 * `theme`, and `safeMargin` override the carousel defaults.
 */
export function createCarousel(options: CarouselOptions): Carousel {
  if (!options.slides || options.slides.length === 0) {
    throw new Error('createCarousel requires at least one slide in "slides".');
  }
  const slides = options.slides.map((slide, index) => {
    if (!slide.children || slide.children.length === 0) {
      throw new Error(`createCarousel slide ${index + 1} requires at least one child node.`);
    }
    return createPost({
      size: options.size,
      background: options.background,
      layout: options.layout,
      theme: options.theme,
      safeMargin: options.safeMargin,
      ...slide,
    });
  });
  return { kind: "carousel", slides };
}

export function isCarousel(value: unknown): value is Carousel {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value as { kind?: unknown }).kind === "carousel" &&
    "slides" in value &&
    Array.isArray((value as { slides?: unknown }).slides)
  );
}
