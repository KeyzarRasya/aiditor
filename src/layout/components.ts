import type { DesignNode } from "../core/node.js";
import type { Theme } from "../theme/theme.js";

/**
 * Replace every deferred `component` node with the subtree its factory builds from `theme`, in
 * place, depth-first. Node identity is preserved so references held by a post keep pointing at the
 * resolved nodes once `layout()` finishes.
 */
export function normalizeComponents(node: DesignNode, theme: Theme): DesignNode {
  if (node.kind === "component") {
    return normalizeComponents(node.factory(theme), theme);
  }
  if (node.kind === "group") {
    node.children = node.children.map((child) => normalizeComponents(child, theme));
  }
  return node;
}
