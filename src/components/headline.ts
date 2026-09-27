import { component, text, type ComponentNode, type NodeOptions } from "../core/node.js";

export type HeadlineProps = NodeOptions & { text: string };

/** Main heading. Defaults come from `theme.typography.heading`. */
export function headline(props: HeadlineProps): ComponentNode {
  return component((theme) => {
    const heading = theme.typography.heading;
    const { text: content, ...overrides } = props;
    return text(content, {
      fontFamily: heading.family,
      fontWeight: heading.weight,
      fontSize: heading.size,
      lineHeight: heading.lineHeight,
      color: theme.colors.text,
      ...overrides,
    });
  });
}
