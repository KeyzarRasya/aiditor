import { card, cta, headline, paragraph } from "../components/index.js";
import {
  component,
  stack,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type ListPostProps = NodeOptions & {
  title: string;
  intro?: string;
  items: string[];
  /** Optional heading for the numbered list card. */
  listTitle?: string;
  takeaway?: string;
};

/** Page-level template for a numbered listicle. */
export function listPost(props: ListPostProps): ComponentNode {
  return component((theme) => {
    const { title, intro, items, listTitle, takeaway, ...overrides } = props;

    const sections: DesignNode[] = [headline({ text: title })];
    if (intro) sections.push(paragraph({ text: intro }));
    sections.push(card({ title: listTitle, items, numbered: true }));
    if (takeaway) sections.push(cta({ text: takeaway }));

    return stack(sections, { gap: theme.spacing.lg, width: "fill", ...overrides });
  });
}
