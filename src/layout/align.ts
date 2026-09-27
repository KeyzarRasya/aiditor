import { group, type DesignNode, type GroupNode, type NodeOptions } from "../core/node.js";

/**
 * Alignment helpers from the design API (PRD §9). They are sugar over the `align`, `justify`, and
 * `fill` layout options — no new engine concepts — so behaviour is always predictable from the
 * underlying container rules.
 */

/** Center children on both axes inside a container that fills its parent. */
export function center(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, {
    align: "center",
    justify: "center",
    width: "fill",
    height: "fill",
    ...options,
  });
}

/** Left-align children across a full-width container. */
export function alignLeft(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { align: "start", width: "fill", ...options });
}

/** Right-align children across a full-width container. */
export function alignRight(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { align: "end", width: "fill", ...options });
}

/** Push children to the top of a full-height container. */
export function alignTop(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { justify: "start", height: "fill", ...options });
}

/** Push children to the bottom of a full-height container. */
export function alignBottom(children: DesignNode[], options: NodeOptions = {}): GroupNode {
  return group(children, { justify: "end", height: "fill", ...options });
}
