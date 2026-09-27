import { component, path, type ComponentNode, type NodeOptions } from "../core/node.js";

export type IconProps = NodeOptions & {
  /** SVG path data, authored in a `viewBox`-sized square. */
  d: string;
  /** Rendered size in pixels (square). */
  size: number;
  /** Source coordinate space of `d`. Defaults to 24. */
  viewBox?: number;
};

/** Square SVG icon scaled to `size`. */
export function icon(props: IconProps): ComponentNode {
  return component((theme) => {
    const { d, size, viewBox = 24, ...overrides } = props;
    return path(d, {
      viewBox,
      width: size,
      height: size,
      fill: theme.colors.accent,
      ...overrides,
    });
  });
}
