import {
  component,
  group,
  text,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type CardProps = NodeOptions & {
  /** Optional heading inside the card. */
  title?: string;
  /** Optional bulleted list. */
  items?: string[];
  /** Extra nodes appended after the title and items. */
  children?: DesignNode[];
};

/** Surface container with a title and/or bulleted items. */
export function card(props: CardProps): ComponentNode {
  return component((theme) => {
    const body = theme.typography.body;
    const { title, items = [], children = [], ...overrides } = props;

    const content: DesignNode[] = [];
    if (title) {
      content.push(
        text(title, {
          fontFamily: body.family,
          fontWeight: 700,
          fontSize: Math.round(body.size * 1.05),
          lineHeight: 1.3,
          color: theme.colors.text,
        }),
      );
    }
    for (const item of items) {
      content.push(
        text(`•  ${item}`, {
          fontFamily: body.family,
          fontWeight: body.weight,
          fontSize: body.size,
          lineHeight: 1.45,
          color: theme.colors.textMuted,
        }),
      );
    }
    content.push(...children);

    return group(content, {
      fill: theme.colors.surface,
      radius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      width: "fill",
      shadow: true,
      ...overrides,
    });
  });
}
