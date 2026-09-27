import {
  component,
  group,
  text,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type NumberProps = NodeOptions & { value: string; label?: string };

/** Big statistic with an optional caption underneath. */
export function number(props: NumberProps): ComponentNode {
  return component((theme) => {
    const heading = theme.typography.heading;
    const body = theme.typography.body;
    const { value, label, ...overrides } = props;

    const nodes: DesignNode[] = [
      text(value, {
        fontFamily: heading.family,
        fontWeight: heading.weight,
        fontSize: Math.round(heading.size * 1.2),
        lineHeight: 1.1,
        color: theme.colors.accent,
      }),
    ];
    if (label) {
      nodes.push(
        text(label, {
          fontFamily: body.family,
          fontWeight: body.weight,
          fontSize: Math.round(body.size * 0.8),
          lineHeight: 1.3,
          color: theme.colors.textMuted,
        }),
      );
    }

    return group(nodes, { gap: theme.spacing.xs, width: "hug", ...overrides });
  });
}
