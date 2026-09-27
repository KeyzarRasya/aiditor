import { component, group, text, type ComponentNode, type NodeOptions } from "../core/node.js";

export type BadgeTone = "accent" | "muted";

export type BadgeProps = NodeOptions & { text: string; tone?: BadgeTone };

/** Small pill label. Hugs its content by default. */
export function badge(props: BadgeProps): ComponentNode {
  return component((theme) => {
    const body = theme.typography.body;
    const { text: content, tone = "accent", ...overrides } = props;
    return group(
      [
        text(content, {
          fontFamily: body.family,
          fontWeight: 700,
          fontSize: Math.round(body.size * 0.6),
          lineHeight: 1.1,
          letterSpacing: 1,
          color: tone === "accent" ? theme.colors.accent : theme.colors.textMuted,
          textAlign: "center",
        }),
      ],
      {
        fill: theme.colors.surface,
        radius: theme.borderRadius.sm,
        padding: [10, 18],
        width: "hug",
        ...overrides,
      },
    );
  });
}
