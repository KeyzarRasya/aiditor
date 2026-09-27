import { component, rect, type ComponentNode, type NodeOptions } from "../core/node.js";

export type DividerProps = NodeOptions;

/** Full-width hairline rule in `theme.colors.border`. */
export function divider(props: DividerProps = {}): ComponentNode {
  return component((theme) =>
    rect({
      height: 1,
      width: "fill",
      fill: theme.colors.border,
      ...props,
    }),
  );
}
