import { group, type DesignNode, type GroupNode, type LayoutStyle } from "./node.js";
import { assertPositiveInteger } from "./units.js";
import { createTheme, type DeepPartial, type Theme } from "../theme/theme.js";

export const FORMATS = {
  "instagram-square": { width: 1080, height: 1080 },
  "instagram-portrait": { width: 1080, height: 1350 },
  "instagram-story": { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
} as const;

export type FormatName = keyof typeof FORMATS;
export type PostSize = FormatName | { width: number; height: number };

export const DEFAULT_SAFE_MARGIN = 72;

export interface PostOptions {
  size: PostSize;
  children: DesignNode[];
  background?: string;
  layout?: LayoutStyle;
  theme?: DeepPartial<Theme>;
  safeMargin?: number;
}

export interface Post {
  width: number;
  height: number;
  background: string;
  theme: Theme;
  root: GroupNode;
}

export function resolveSize(size: PostSize): { width: number; height: number } {
  if (typeof size === "string") {
    const resolved = FORMATS[size];
    if (!resolved) {
      throw new Error(
        `Unknown format "${size}". Available formats: ${Object.keys(FORMATS).join(", ")}.`,
      );
    }
    return resolved;
  }
  return size;
}

export function createPost(options: PostOptions): Post {
  const { width, height } = resolveSize(options.size);
  assertPositiveInteger(width, "Canvas dimensions");
  assertPositiveInteger(height, "Canvas dimensions");

  const theme = createTheme(options.theme);
  const background = options.background ?? theme.colors.background;
  const safeMargin = options.safeMargin ?? DEFAULT_SAFE_MARGIN;

  const root = group(options.children, {
    direction: "column",
    gap: theme.spacing.lg,
    padding: safeMargin,
    ...options.layout,
    width,
    height,
  });

  return { width, height, background, theme, root };
}
