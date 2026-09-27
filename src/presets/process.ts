import { cta, flow, headline, paragraph, type FlowDirection } from "../components/index.js";
import {
  component,
  stack,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type ProcessPostProps = NodeOptions & {
  title: string;
  intro?: string;
  steps: string[];
  /** Stack the steps vertically (default) or lay them side by side. */
  direction?: FlowDirection;
  takeaway?: string;
};

/** Page-level template for a step-by-step process. */
export function processPost(props: ProcessPostProps): ComponentNode {
  return component((theme) => {
    const { title, intro, steps, direction, takeaway, ...overrides } = props;

    const sections: DesignNode[] = [headline({ text: title })];
    if (intro) sections.push(paragraph({ text: intro }));
    sections.push(flow({ steps, direction }));
    if (takeaway) sections.push(cta({ text: takeaway }));

    return stack(sections, { gap: theme.spacing.lg, width: "fill", ...overrides });
  });
}
