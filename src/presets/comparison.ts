import {
  comparison,
  cta,
  headline,
  paragraph,
  type ComparisonColumn,
} from "../components/index.js";
import {
  component,
  stack,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type ComparisonPostProps = NodeOptions & {
  title: string;
  intro?: string;
  left: ComparisonColumn;
  right: ComparisonColumn;
  takeaway?: string;
};

/** Page-level template for a side-by-side comparison. */
export function comparisonPost(props: ComparisonPostProps): ComponentNode {
  return component((theme) => {
    const { title, intro, left, right, takeaway, ...overrides } = props;

    const sections: DesignNode[] = [headline({ text: title })];
    if (intro) sections.push(paragraph({ text: intro }));
    sections.push(comparison({ left, right }));
    if (takeaway) sections.push(cta({ text: takeaway }));

    return stack(sections, { gap: theme.spacing.lg, width: "fill", ...overrides });
  });
}
