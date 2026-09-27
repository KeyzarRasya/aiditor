import { cta, headline, quote as quoteBlock } from "../components/index.js";
import {
  component,
  stack,
  type ComponentNode,
  type DesignNode,
  type NodeOptions,
} from "../core/node.js";

export type QuotePostProps = NodeOptions & {
  quote: string;
  author?: string;
  /** Optional headline above the quote. */
  title?: string;
  takeaway?: string;
};

/** Page-level template for a single pull quote. */
export function quotePost(props: QuotePostProps): ComponentNode {
  return component((theme) => {
    const { quote, author, title, takeaway, ...overrides } = props;

    const sections: DesignNode[] = [];
    if (title) sections.push(headline({ text: title }));
    sections.push(quoteBlock({ text: quote, author }));
    if (takeaway) sections.push(cta({ text: takeaway }));

    return stack(sections, { gap: theme.spacing.lg, width: "fill", ...overrides });
  });
}
