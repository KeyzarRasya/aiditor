import { component, text, type ComponentNode, type NodeOptions } from "../core/node.js";

export type SubheadlineProps = NodeOptions & { text: string };

/** Secondary heading, sized between the heading and body tokens. */
export function subheadline(props: SubheadlineProps): ComponentNode {
  return component((theme) => {
    const heading = theme.typography.heading;
    const { text: content, ...overrides } = props;
    return text(content, {
      fontFamily: heading.family,
      fontWeight: heading.weight,
      fontSize: Math.round(heading.size * 0.62),
      lineHeight: 1.2,
      color: theme.colors.text,
      ...overrides,
    });
  });
}
