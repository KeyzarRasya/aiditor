import {
  component,
  group,
  row,
  text,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type FlowDirection = "column" | "row";

export type FlowProps = NodeOptions & { steps: string[]; direction?: FlowDirection };

/** Ordered steps, each with a numbered marker. Column stacks them; row lays them side by side. */
export function flow(props: FlowProps): ComponentNode {
  return component((theme) => {
    const heading = theme.typography.heading;
    const body = theme.typography.body;
    const { steps, direction = "column", ...overrides } = props;

    const marker = (index: number): DesignNode =>
      group(
        [
          text(String(index + 1), {
            fontFamily: heading.family,
            fontWeight: heading.weight,
            fontSize: Math.round(body.size * 0.7),
            lineHeight: 1.1,
            color: theme.colors.background,
            textAlign: "center",
          }),
        ],
        {
          fill: theme.colors.accent,
          radius: 999,
          padding: [10, 10],
          width: 46,
          align: "center",
        },
      );

    const caption = (step: string, extra: NodeOptions): DesignNode =>
      text(step, {
        fontFamily: body.family,
        fontWeight: body.weight,
        fontSize: body.size,
        lineHeight: 1.4,
        color: theme.colors.textMuted,
        ...extra,
      });

    const nodes: DesignNode[] =
      direction === "row"
        ? steps.map((step, index) =>
            group([marker(index), caption(step, {})], {
              grow: 1,
              width: "fill",
              gap: theme.spacing.sm,
              align: "center",
            }),
          )
        : steps.map((step, index) =>
            row([marker(index), caption(step, { grow: 1 })], {
              gap: theme.spacing.md,
              align: "center",
            }),
          );

    return group(nodes, { direction, gap: theme.spacing.md, width: "fill", ...overrides });
  });
}
