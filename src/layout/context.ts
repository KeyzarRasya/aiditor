import type { Box, DesignNode } from "../core/node.js";
import type { Theme } from "../theme/theme.js";

export interface Size2 {
  width: number;
  height: number;
}

/** A child's box, expressed relative to its container's top-left corner. */
export interface Placement {
  node: DesignNode;
  box: Box;
}

/** The cached result of resolving a single node. */
export interface Resolved {
  size: Size2;
  /** Present for containers only: child placements in container-local coordinates. */
  placements?: Placement[];
}

export interface LayoutContext {
  theme: Theme;
  /** Resolve a node against an available area, memoized for the duration of one layout pass. */
  resolve(node: DesignNode, available: Size2): Size2;
}
