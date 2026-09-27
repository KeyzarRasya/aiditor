import type { Align, DesignNode, Direction, Justify } from "../core/node.js";
import { resolveSpacing, type ResolvedSpacing } from "../core/units.js";
import type { LayoutContext, Placement, Size2 } from "./context.js";
import { percentageOf } from "./length.js";

export interface FlexInput {
  children: DesignNode[];
  /** Inner area available for measurement; may be Infinite on an axis. */
  inner: Size2;
  direction: Direction;
  gap: number;
  align: Align;
  justify: Justify;
}

export interface FlexResult {
  /** Content extent excluding padding. */
  content: Size2;
  /** Child placements relative to the container's content origin (padding applied by the caller). */
  placements: Placement[];
}

interface Entry {
  child: DesignNode;
  size: Size2;
  margin: ResolvedSpacing;
  grow: number;
  /** Assigned main-axis size (width on a row, height on a column). */
  main: number;
}

/**
 * Lay children out along one axis with `gap`, `align` (cross axis) and `justify` (main axis).
 *
 * `grow > 0` children share the leftover main-axis space by weight. Each child is measured exactly
 * once, against the constraint its parent decided for it.
 */
export function resolveFlex(input: FlexInput, context: LayoutContext): FlexResult {
  const { children, inner, direction, gap, align, justify } = input;
  const column = direction === "column";
  const gapTotal = gap * Math.max(0, children.length - 1);
  const innerMain = column ? inner.height : inner.width;
  const boundedMain = Number.isFinite(innerMain);

  const measurement: Size2 = column
    ? { width: inner.width, height: inner.height }
    : { width: Infinity, height: inner.height };

  // A row's main axis is measured unbounded, so a percentage width there needs the parent's real
  // inner extent in order to resolve. (On a column the main axis is already bounded.)
  const measurementFor = (child: DesignNode): Size2 => {
    if (column) return measurement;
    if (percentageOf(child.layout.width, innerMain) === undefined) return measurement;
    return { width: innerMain, height: inner.height };
  };

  const entries: Entry[] = children.map((child) => ({
    child,
    size: { width: 0, height: 0 },
    margin: resolveSpacing(child.layout.margin),
    grow: child.layout.grow ?? 0,
    main: 0,
  }));

  // Measure everything that is not a grow participant. Grow children have no intrinsic main size
  // to contribute, so they are measured after their share is known.
  for (const entry of entries) {
    if (entry.grow > 0 && boundedMain) continue;
    entry.size = context.resolve(entry.child, measurementFor(entry.child));
    entry.main = column ? entry.size.height : entry.size.width;
  }

  const growers = entries.filter((entry) => entry.grow > 0 && boundedMain);
  if (growers.length > 0) {
    const reserved = entries
      .filter((entry) => !growers.includes(entry))
      .reduce((sum, entry) => sum + entry.main + mainMargins(entry.margin, column), 0);
    const growMargins = growers.reduce((sum, entry) => sum + mainMargins(entry.margin, column), 0);
    const bases = growers.reduce(
      (sum, entry) => sum + mainBase(entry.child, column, innerMain, boundedMain),
      0,
    );
    const free = Math.max(0, innerMain - reserved - growMargins - gapTotal - bases);
    const totalWeight = growers.reduce((sum, entry) => sum + entry.grow, 0);

    for (const entry of growers) {
      const base = mainBase(entry.child, column, innerMain, boundedMain);
      const share = totalWeight > 0 ? (free * entry.grow) / totalWeight : 0;
      entry.main = base + share;
      entry.size = context.resolve(
        entry.child,
        column
          ? { width: inner.width, height: entry.main }
          : { width: entry.main, height: inner.height },
      );
    }
  }

  let contentWidth = 0;
  let contentHeight = 0;
  for (const entry of entries) {
    const cross = column ? entry.size.width : entry.size.height;
    const outerWidth = (column ? cross : entry.main) + entry.margin.left + entry.margin.right;
    const outerHeight = (column ? entry.main : cross) + entry.margin.top + entry.margin.bottom;
    if (column) {
      contentWidth = Math.max(contentWidth, outerWidth);
      contentHeight += outerHeight;
    } else {
      contentWidth += outerWidth;
      contentHeight = Math.max(contentHeight, outerHeight);
    }
  }
  if (column) contentHeight += gapTotal;
  else contentWidth += gapTotal;

  const finalInner: Size2 = {
    width: Number.isFinite(inner.width) ? inner.width : contentWidth,
    height: Number.isFinite(inner.height) ? inner.height : contentHeight,
  };

  const stretch = align === "stretch";
  const boxes = entries.map((entry) => {
    const explicitCross = column ? entry.child.layout.width : entry.child.layout.height;
    const fillCross =
      typeof explicitCross !== "number" &&
      (explicitCross === "fill" || (explicitCross === undefined && stretch));
    return column
      ? {
          node: entry.child,
          margin: entry.margin,
          width: fillCross ? finalInner.width : entry.size.width,
          height: entry.main,
        }
      : {
          node: entry.child,
          margin: entry.margin,
          width: entry.main,
          height: fillCross ? finalInner.height : entry.size.height,
        };
  });

  const placements: Placement[] = [];
  const mainExtent = column
    ? boxes.reduce((sum, box) => sum + box.height + box.margin.top + box.margin.bottom, 0)
    : boxes.reduce((sum, box) => sum + box.width + box.margin.left + box.margin.right, 0);
  const extra = (column ? finalInner.height : finalInner.width) - mainExtent - gapTotal;

  let cursor = 0;
  let effectiveGap = gap;
  if (justify === "center") cursor += extra / 2;
  else if (justify === "end") cursor += extra;
  else if (justify === "space-between" && boxes.length > 1) {
    effectiveGap = gap + extra / (boxes.length - 1);
  }

  for (const box of boxes) {
    if (column) {
      cursor += box.margin.top;
      const offset =
        align === "center"
          ? (finalInner.width - box.width) / 2
          : align === "end"
            ? finalInner.width - box.width
            : 0;
      placements.push({
        node: box.node,
        box: { x: offset + box.margin.left, y: cursor, width: box.width, height: box.height },
      });
      cursor += box.height + box.margin.bottom + effectiveGap;
    } else {
      cursor += box.margin.left;
      const offset =
        align === "center"
          ? (finalInner.height - box.height) / 2
          : align === "end"
            ? finalInner.height - box.height
            : 0;
      placements.push({
        node: box.node,
        box: { x: cursor, y: offset + box.margin.top, width: box.width, height: box.height },
      });
      cursor += box.width + box.margin.right + effectiveGap;
    }
  }

  return { content: { width: contentWidth, height: contentHeight }, placements };
}

function mainMargins(margin: ResolvedSpacing, column: boolean): number {
  return column ? margin.top + margin.bottom : margin.left + margin.right;
}

function mainBase(child: DesignNode, column: boolean, innerMain: number, bounded: boolean): number {
  const value = column ? child.layout.height : child.layout.width;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("%") && bounded) {
    return (Number.parseFloat(value) / 100) * innerMain;
  }
  return 0;
}
