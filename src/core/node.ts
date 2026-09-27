import type { Spacing } from "./units.js";
import type { Theme } from "../theme/theme.js";

export type NodeKind =
  | "rect"
  | "circle"
  | "line"
  | "path"
  | "text"
  | "image"
  | "group"
  | "component";
export type TextAlign = "left" | "center" | "right";
export type FontStyle = "normal" | "italic";
export type Size = number | "fill" | "hug" | `${number}%`;
export type Direction = "row" | "column";
export type Align = "start" | "center" | "end" | "stretch";
export type Justify = "start" | "center" | "end" | "space-between";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Resolved result of measuring and wrapping a text node. */
export interface TextMetrics {
  lines: string[];
  width: number;
  height: number;
  lineHeight: number;
  ascent: number;
  descent: number;
  fontSize: number;
}

export interface Style {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  radius?: number;
  shadow?: boolean;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: FontStyle;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: TextAlign;
}

export interface LayoutStyle {
  x?: number;
  y?: number;
  width?: Size;
  height?: Size;
  direction?: Direction;
  gap?: number;
  padding?: Spacing;
  margin?: Spacing;
  align?: Align;
  justify?: Justify;
  grow?: number;
  /** When set, the group lays its children out as a grid with this many equal columns. */
  columns?: number;
  columnGap?: number;
  rowGap?: number;
}

export interface BaseNode {
  kind: NodeKind;
  style: Style;
  layout: LayoutStyle;
  box?: Box;
  meta?: Record<string, unknown>;
}

export interface RectNode extends BaseNode {
  kind: "rect";
}

export interface CircleNode extends BaseNode {
  kind: "circle";
  radius: number;
}

export interface LineNode extends BaseNode {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TextNode extends BaseNode {
  kind: "text";
  text: string;
  metrics?: TextMetrics;
}

export interface ImageNode extends BaseNode {
  kind: "image";
  src: string;
}

export interface PathNode extends BaseNode {
  kind: "path";
  /** SVG path data. */
  d: string;
  /** Source coordinate space the path is authored in; it is scaled to fill the node's box. */
  viewBox: number;
}

export interface GroupNode extends BaseNode {
  kind: "group";
  children: DesignNode[];
}

/** Builds a subtree from the post's resolved theme. Must be pure. */
export type ComponentFactory = (theme: Theme) => DesignNode;

/**
 * A deferred semantic component. `layout()` replaces it with `factory(theme)` so components can use
 * theme tokens even though they are constructed before `createPost` resolves the theme.
 */
export interface ComponentNode extends BaseNode {
  kind: "component";
  factory: ComponentFactory;
}

export type DesignNode =
  | RectNode
  | CircleNode
  | LineNode
  | PathNode
  | TextNode
  | ImageNode
  | GroupNode
  | ComponentNode;

export type NodeOptions = Style & LayoutStyle & { meta?: Record<string, unknown> };

export type CircleOptions = NodeOptions & { radius: number };
export type LineOptions = NodeOptions & { x1: number; y1: number; x2: number; y2: number };
export type ImageOptions = Omit<NodeOptions, "width" | "height"> & { width: number; height: number };
export type PathOptions = NodeOptions & { viewBox?: number };
export type GridOptions = NodeOptions & { columns: number };

const STYLE_KEYS = [
  "fill",
  "stroke",
  "strokeWidth",
  "opacity",
  "radius",
  "shadow",
  "color",
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "textAlign",
] as const satisfies readonly (keyof Style)[];

const LAYOUT_KEYS = [
  "x",
  "y",
  "width",
  "height",
  "direction",
  "gap",
  "padding",
  "margin",
  "align",
  "justify",
  "grow",
  "columns",
  "columnGap",
  "rowGap",
] as const satisfies readonly (keyof LayoutStyle)[];

function pick<T, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

function splitOptions(options: NodeOptions): {
  style: Style;
  layout: LayoutStyle;
  meta?: Record<string, unknown>;
} {
  return {
    style: pick(options, STYLE_KEYS),
    layout: pick(options, LAYOUT_KEYS),
    meta: options.meta,
  };
}

export function rect(options: NodeOptions = {}): RectNode {
  const { style, layout, meta } = splitOptions(options);
  return { kind: "rect", style, layout, meta };
}

export function circle(options: CircleOptions): CircleNode {
  const { radius, ...rest } = options;
  const { style, layout, meta } = splitOptions(rest);
  return { kind: "circle", radius, style, layout, meta };
}

export function line(options: LineOptions): LineNode {
  const { x1, y1, x2, y2, ...rest } = options;
  const { style, layout, meta } = splitOptions(rest);
  return { kind: "line", x1, y1, x2, y2, style, layout, meta };
}

export function text(content: string, options: NodeOptions = {}): TextNode {
  const { style, layout, meta } = splitOptions(options);
  return { kind: "text", text: content, style, layout, meta };
}

export function image(src: string, options: ImageOptions): ImageNode {
  const { style, layout, meta } = splitOptions(options);
  return { kind: "image", src, style, layout, meta };
}

export function path(d: string, options: PathOptions = {}): PathNode {
  const { viewBox = 24, ...rest } = options;
  const { style, layout, meta } = splitOptions(rest);
  return { kind: "path", d, viewBox, style, layout, meta };
}

export function group(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  const { style, layout, meta } = splitOptions(options);
  return { kind: "group", children, style, layout, meta };
}

/** Vertical stack — the default container. */
export function stack(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { direction: "column", ...options });
}

/** Horizontal row container. */
export function row(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { direction: "row", ...options });
}

/** Grid container: children flow row-major into `columns` equal-width columns. */
export function grid(children: DesignNode[], options: GridOptions): GroupNode {
  if (!Number.isInteger(options.columns) || options.columns < 1) {
    throw new Error(`grid() requires "columns" to be a positive integer.`);
  }
  return group(children, options);
}

/** Wrap a theme-resolving factory into a deferred component node. */
export function component(factory: ComponentFactory): ComponentNode {
  return { kind: "component", factory, style: {}, layout: {} };
}

export const UNRESOLVED_COMPONENT =
  "Component was not resolved. Call layout(post) before rendering this tree.";
