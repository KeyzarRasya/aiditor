import { component, row, type ComponentNode, type NodeOptions } from "../core/node.js";
import { card } from "./card.js";

export type ComparisonColumn = { title: string; items?: string[] };

export type ComparisonProps = NodeOptions & { left: ComparisonColumn; right: ComparisonColumn };

/** Two equal-width cards side by side — a direct beneficiary of the `grow` layout. */
export function comparison(props: ComparisonProps): ComponentNode {
  return component((theme) => {
    const { left, right, ...overrides } = props;
    return row(
      [
        card({ title: left.title, items: left.items, grow: 1 }),
        card({ title: right.title, items: right.items, grow: 1 }),
      ],
      { gap: theme.spacing.lg, align: "stretch", width: "fill", ...overrides },
    );
  });
}
