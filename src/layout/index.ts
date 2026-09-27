import type { Post } from "../core/canvas.js";
import type { Box, DesignNode, GroupNode, TextNode } from "../core/node.js";
import { UNRESOLVED_COMPONENT } from "../core/node.js";
import { resolveSpacing } from "../core/units.js";
import { layoutText } from "../text/measure.js";
import type { LayoutContext, Placement, Resolved, Size2 } from "./context.js";
import { normalizeComponents } from "./components.js";
import { resolveFlex } from "./flex.js";
import { resolveGrid } from "./grid.js";
import { resolveHeightTarget, resolveLength, resolveWidthTarget } from "./length.js";

/**
 * Compute absolute boxes for every node in the post. Pure function of the tree: calling it twice
 * yields identical geometry.
 *
 * The pass runs bottom-up (`resolve`) to measure sizes and record child placements, then top-down
 * (`place`) to translate those placements into absolute canvas coordinates. Each node is resolved
 * exactly once, so a node's measured size always matches the box it is finally given.
 */
export function layout(post: Post): Post {
  const theme = post.theme;
  const resolved = new Map<DesignNode, Resolved>();

  const context: LayoutContext = { theme, resolve };

  function resolve(node: DesignNode, available: Size2): Size2 {
    const cached = resolved.get(node);
    if (cached) return cached.size;

    const record = resolveNode(node, available);
    resolved.set(node, record);
    return record.size;
  }

  function resolveNode(node: DesignNode, available: Size2): Resolved {
    switch (node.kind) {
      case "rect":
        return {
          size: {
            width: resolveLength(node.layout.width, available.width, 0),
            height: resolveLength(node.layout.height, available.height, 0),
          },
        };
      case "circle":
        return { size: { width: node.radius * 2, height: node.radius * 2 } };
      case "line":
        return {
          size: { width: Math.abs(node.x2 - node.x1), height: Math.abs(node.y2 - node.y1) },
        };
      case "image": {
        if (typeof node.layout.width !== "number" || typeof node.layout.height !== "number") {
          throw new Error(
            `image("${node.src}") requires numeric "width" and "height" props because it has no intrinsic size.`,
          );
        }
        return { size: { width: node.layout.width, height: node.layout.height } };
      }
      case "text":
        return { size: resolveText(node, available) };
      case "path": {
        if (typeof node.layout.width !== "number" || typeof node.layout.height !== "number") {
          throw new Error(
            `path("${node.d}") requires numeric "width" and "height" props because it has no intrinsic size.`,
          );
        }
        return { size: { width: node.layout.width, height: node.layout.height } };
      }
      case "group":
        return resolveGroup(node, available);
      case "component":
        throw new Error(UNRESOLVED_COMPONENT);
    }
  }

  function resolveText(node: TextNode, available: Size2): Size2 {
    const typography = theme.typography.body;
    const fontSize = node.style.fontSize ?? typography.size;
    const lineHeight = node.style.lineHeight ?? typography.lineHeight;
    const fallbackWidth = Number.isFinite(available.width) ? available.width : Infinity;

    const metrics = layoutText(node.text, {
      fontFamily: node.style.fontFamily ?? typography.family,
      fontWeight: node.style.fontWeight ?? typography.weight,
      fontStyle: node.style.fontStyle,
      fontSize,
      lineHeight,
      letterSpacing: node.style.letterSpacing ?? 0,
      maxWidth: resolveLength(node.layout.width, available.width, fallbackWidth),
    });
    node.metrics = metrics;

    return {
      width: resolveLength(node.layout.width, available.width, metrics.width),
      height: resolveLength(node.layout.height, available.height, metrics.height),
    };
  }

  function resolveGroup(node: GroupNode, available: Size2): Resolved {
    const padding = resolveSpacing(node.layout.padding);
    const widthTarget = resolveWidthTarget(node.layout.width, available.width);
    const heightTarget = resolveHeightTarget(node.layout.height, available.height);

    const inner: Size2 = {
      width:
        widthTarget !== undefined
          ? Math.max(0, widthTarget - padding.left - padding.right)
          : Infinity,
      height:
        heightTarget !== undefined
          ? Math.max(0, heightTarget - padding.top - padding.bottom)
          : Infinity,
    };

    const columns = node.layout.columns;
    const result =
      columns !== undefined
        ? resolveGrid(
            {
              children: node.children,
              inner,
              columns,
              columnGap: node.layout.columnGap ?? node.layout.gap ?? 0,
              rowGap: node.layout.rowGap ?? node.layout.gap ?? 0,
              align: node.layout.align ?? "start",
            },
            context,
          )
        : resolveFlex(
            {
              children: node.children,
              inner,
              direction: node.layout.direction ?? "column",
              gap: node.layout.gap ?? 0,
              align: node.layout.align ?? "start",
              justify: node.layout.justify ?? "start",
            },
            context,
          );

    const size: Size2 = {
      width: widthTarget ?? result.content.width + padding.left + padding.right,
      height: heightTarget ?? result.content.height + padding.top + padding.bottom,
    };

    const placements: Placement[] = result.placements.map((placement) => ({
      node: placement.node,
      box: {
        x: placement.box.x + padding.left,
        y: placement.box.y + padding.top,
        width: placement.box.width,
        height: placement.box.height,
      },
    }));

    return { size, placements };
  }

  function place(node: DesignNode, box: Box): void {
    node.box = box;
    const record = resolved.get(node);
    if (!record?.placements) return;
    for (const placement of record.placements) {
      place(placement.node, {
        x: box.x + placement.box.x,
        y: box.y + placement.box.y,
        width: placement.box.width,
        height: placement.box.height,
      });
    }
  }

  // Resolve deferred semantic components to concrete nodes before measuring anything.
  normalizeComponents(post.root, post.theme);

  resolve(post.root, { width: post.width, height: post.height });
  place(post.root, { x: 0, y: 0, width: post.width, height: post.height });
  return post;
}
