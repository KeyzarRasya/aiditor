import {
  component,
  group,
  rect,
  text,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type QuoteProps = NodeOptions & { text: string; author?: string };

/** Pull quote: an accent bar beside quoted text, with an optional attribution. */
export function quote(props: QuoteProps): ComponentNode {
  return component((theme) => {
    const body = theme.typography.body;
    const { text: content, author, ...overrides } = props;

    const lines: DesignNode[] = [
      text(`\u201C${content}\u201D`, {
        fontFamily: body.family,
        fontWeight: body.weight,
        fontSize: Math.round(body.size * 1.25),
        lineHeight: 1.4,
        color: theme.colors.text,
      }),
    ];
    if (author) {
      lines.push(
        text(`\u2014 ${author}`, {
          fontFamily: body.family,
          fontWeight: body.weight,
          fontSize: Math.round(body.size * 0.8),
          lineHeight: 1.3,
          color: theme.colors.textMuted,
        }),
      );
    }

    return group(
      [
        rect({ width: 6, fill: theme.colors.accent }),
        group(lines, { gap: theme.spacing.sm, grow: 1 }),
      ],
      { direction: "row", gap: theme.spacing.md, align: "stretch", width: "fill", ...overrides },
    );
  });
}
