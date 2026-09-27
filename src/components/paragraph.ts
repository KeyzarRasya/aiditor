import { component, text, type ComponentNode, type NodeOptions } from "../core/node.js";

export type ParagraphProps = NodeOptions & { text: string };

/** Body copy. Defaults come from `theme.typography.body`, coloured `textMuted`. */
export function paragraph(props: ParagraphProps): ComponentNode {
  return component((theme) => {
    const body = theme.typography.body;
    const { text: content, ...overrides } = props;
    return text(content, {
      fontFamily: body.family,
      fontWeight: body.weight,
      fontSize: body.size,
      lineHeight: 1.5,
      color: theme.colors.textMuted,
      ...overrides,
    });
  });
}
