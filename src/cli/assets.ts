import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Post } from "../core/canvas.js";
import { isCarousel, type Carousel } from "../core/carousel.js";
import type { DesignNode } from "../core/node.js";
import type { Theme } from "../theme/theme.js";

const REMOTE_SRC = /^(https?:|data:)/;

/**
 * Collect the raw `src` of every local image in a tree, resolving deferred
 * `component` factories with the slide theme so images nested inside semantic
 * components (e.g. `card({ children })`) are found too. Remote and data-URL
 * sources are skipped — they are not files on disk.
 */
export function collectImageSources(
  node: DesignNode,
  theme: Theme,
  out: string[] = [],
): string[] {
  if (node.kind === "image") {
    if (!REMOTE_SRC.test(node.src)) out.push(node.src);
    return out;
  }
  if (node.kind === "group") {
    for (const child of node.children) collectImageSources(child, theme, out);
    return out;
  }
  if (node.kind === "component") {
    collectImageSources(node.factory(theme), theme, out);
  }
  return out;
}

/**
 * Absolute paths `social dev` should watch: every local image file referenced
 * by the post or carousel, plus `assets/` itself when present (so newly added
 * screenshots under the convention folder are picked up without a restart).
 * Asset paths outside `assets/` that are added mid-session need a `dev`
 * restart to be picked up.
 */
export function collectImageDeps(post: Post | Carousel, cwd: string): string[] {
  const seen = new Set<string>();
  const slides = isCarousel(post) ? post.slides : [post];
  for (const slide of slides) {
    for (const src of collectImageSources(slide.root, slide.theme)) {
      const absolute = resolve(cwd, src);
      if (existsSync(absolute)) seen.add(absolute);
    }
  }
  const assetsDir = resolve(cwd, "assets");
  if (existsSync(assetsDir)) seen.add(assetsDir);
  return [...seen];
}
