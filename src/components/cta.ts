import { component, text, type ComponentNode, type NodeOptions } from "../core/node.js";

export type CtaProps = NodeOptions & { text: string };

/** Call to action: emphasised accent text. */
export function cta(props: CtaProps): ComponentNode {
  return component((theme) => {
    const body = theme.typography.body;
    const { text: content, ...overrides } = props;
    return text(content, {
      fontFamily: body.family,
      fontWeight: 700,
      fontSize: Math.round(body.size * 1.15),
      lineHeight: 1.3,
      color: theme.colors.accent,
      ...overrides,
    });
  });
}
