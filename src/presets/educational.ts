import { badge, card, cta, headline, paragraph } from "../components/index.js";
import {
  component,
  stack,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type EducationalPostProps = NodeOptions & {
  /** Optional eyebrow label above the headline. */
  badge?: string;
  title: string;
  intro?: string;
  points: string[];
  /** Optional heading for the points card. */
  pointsTitle?: string;
  takeaway?: string;
};

/**
 * Page-level template for a teaching post: optional badge, headline, optional intro, a bulleted
 * points card, and an optional takeaway. Use as `createPost({ size, children: [educationalPost({…})] })`.
 */
export function educationalPost(props: EducationalPostProps): ComponentNode {
  return component((theme) => {
    const { badge: badgeText, title, intro, points, pointsTitle, takeaway, ...overrides } = props;

    const sections: DesignNode[] = [];
    if (badgeText) sections.push(badge({ text: badgeText }));
    sections.push(headline({ text: title }));
    if (intro) sections.push(paragraph({ text: intro }));
    sections.push(card({ title: pointsTitle, items: points }));
    if (takeaway) sections.push(cta({ text: takeaway }));

    return stack(sections, { gap: theme.spacing.lg, width: "fill", ...overrides });
  });
}
