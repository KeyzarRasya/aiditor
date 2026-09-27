export {
  createPost,
  resolveSize,
  FORMATS,
  DEFAULT_SAFE_MARGIN,
} from "./core/canvas.js";
export type { FormatName, Post, PostOptions, PostSize } from "./core/canvas.js";

export {
  rect,
  circle,
  line,
  path,
  text,
  image,
  group,
  stack,
  row,
  grid,
  component,
} from "./core/node.js";
export type {
  Align,
  Box,
  CircleNode,
  CircleOptions,
  ComponentFactory,
  ComponentNode,
  DesignNode,
  Direction,
  FontStyle,
  GridOptions,
  GroupNode,
  ImageNode,
  ImageOptions,
  Justify,
  LayoutStyle,
  LineNode,
  LineOptions,
  NodeKind,
  NodeOptions,
  PathNode,
  PathOptions,
  RectNode,
  Size,
  Style,
  TextAlign,
  TextMetrics,
  TextNode,
} from "./core/node.js";

export { resolveSpacing, spacing, round } from "./core/units.js";
export type { ResolvedSpacing, Spacing } from "./core/units.js";

export { layout } from "./layout/index.js";
export {
  center,
  alignLeft,
  alignRight,
  alignTop,
  alignBottom,
} from "./layout/align.js";

export {
  headline,
  subheadline,
  paragraph,
  cta,
  badge,
  divider,
  card,
  quote,
  number,
  comparison,
  flow,
  icon,
} from "./components/index.js";
export type {
  HeadlineProps,
  SubheadlineProps,
  ParagraphProps,
  CtaProps,
  BadgeProps,
  BadgeTone,
  DividerProps,
  CardProps,
  QuoteProps,
  NumberProps,
  ComparisonColumn,
  ComparisonProps,
  FlowDirection,
  FlowProps,
  IconProps,
} from "./components/index.js";

export {
  educationalPost,
  comparisonPost,
  listPost,
  processPost,
  quotePost,
} from "./presets/index.js";
export type {
  EducationalPostProps,
  ComparisonPostProps,
  ListPostProps,
  ProcessPostProps,
  QuotePostProps,
} from "./presets/index.js";

export { renderToSvg } from "./render/svg.js";
export { renderToPng } from "./render/png.js";
export type { PngRenderOptions } from "./render/png.js";
export { renderPost } from "./render/post.js";
export type { RenderFormat, RenderPostOptions } from "./render/post.js";

export {
  createTheme,
  defineTheme,
  defaultTheme,
  setProjectTheme,
  getProjectTheme,
  resetProjectTheme,
} from "./theme/theme.js";
export { loadTheme, loadProjectTheme } from "./theme/load.js";
export type { ProjectThemeSource } from "./theme/load.js";
export type { DeepPartial, ShadowToken, Theme, TypographyToken } from "./theme/theme.js";

export { loadConfig, defaultConfig } from "./theme/config.js";
export type { SocialConfig } from "./theme/config.js";

export {
  FontRegistry,
  getFontRegistry,
  configureFontRegistry,
} from "./fonts/registry.js";
export type { FontFace, FontQuery } from "./fonts/registry.js";

export { layoutText, measureAdvance, wrapText } from "./text/measure.js";
export type { TextLayoutOptions } from "./text/measure.js";
