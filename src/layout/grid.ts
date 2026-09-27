import type { Align, DesignNode } from "../core/node.js";
import { resolveSpacing } from "../core/units.js";
import type { LayoutContext, Placement, Size2 } from "./context.js";

export interface GridInput {
  children: DesignNode[];
  /** Inner area available for measurement; may be Infinite on an axis. */
  inner: Size2;
  columns: number;
  columnGap: number;
  rowGap: number;
  align: Align;
}

export interface GridResult {
  content: Size2;
  placements: Placement[];
}

/**
 * Row-major auto-flow grid. Children fill equal-width columns; row heights come from the tallest
 * child in each row. `align` positions children vertically within their row.
 */
export function resolveGrid(input: GridInput, context: LayoutContext): GridResult {
  const { children, inner, columns, columnGap, rowGap, align } = input;

  if (!Number.isInteger(columns) || columns < 1) {
    throw new Error(`grid() requires "columns" to be a positive integer.`);
  }

  const rows = Math.ceil(children.length / columns);
  const boundedWidth = Number.isFinite(inner.width);
  const cellWidth = boundedWidth
    ? Math.max(0, (inner.width - (columns - 1) * columnGap) / columns)
    : Infinity;

  const entries = children.map((child, index) => ({
    child,
    size: context.resolve(child, { width: cellWidth, height: inner.height }),
    margin: resolveSpacing(child.layout.margin),
    column: index % columns,
    row: Math.floor(index / columns),
  }));

  // Column widths: equal shares when bounded; otherwise each column hugs its widest child.
  const columnWidths = Array.from({ length: columns }, (_, column) => {
    if (boundedWidth) return cellWidth;
    let max = 0;
    for (const entry of entries) {
      if (entry.column !== column) continue;
      const width =
        typeof entry.child.layout.width === "number" ? entry.child.layout.width : entry.size.width;
      max = Math.max(max, width + entry.margin.left + entry.margin.right);
    }
    return max;
  });

  const rowHeights = Array.from({ length: rows }, (_, row) => {
    let max = 0;
    for (const entry of entries) {
      if (entry.row !== row) continue;
      max = Math.max(max, entry.margin.top + entry.size.height + entry.margin.bottom);
    }
    return max;
  });

  const columnOffsets: number[] = [];
  let offsetX = 0;
  for (let column = 0; column < columns; column += 1) {
    columnOffsets.push(offsetX);
    offsetX += (columnWidths[column] ?? 0) + columnGap;
  }

  const rowOffsets: number[] = [];
  let offsetY = 0;
  for (let row = 0; row < rows; row += 1) {
    rowOffsets.push(offsetY);
    offsetY += (rowHeights[row] ?? 0) + rowGap;
  }

  const stretch = align === "stretch";
  const placements: Placement[] = entries.map((entry) => {
    const columnWidth = columnWidths[entry.column] ?? 0;
    const rowHeight = rowHeights[entry.row] ?? 0;
    const width =
      typeof entry.child.layout.width === "number" ? entry.child.layout.width : columnWidth;
    const availableHeight = rowHeight - entry.margin.top - entry.margin.bottom;
    const height = stretch ? availableHeight : entry.size.height;
    const alignOffset =
      align === "center"
        ? (availableHeight - height) / 2
        : align === "end"
          ? availableHeight - height
          : 0;

    return {
      node: entry.child,
      box: {
        x: (columnOffsets[entry.column] ?? 0) + entry.margin.left,
        y: (rowOffsets[entry.row] ?? 0) + entry.margin.top + alignOffset,
        width,
        height,
      },
    };
  });

  const contentWidth = columnWidths.reduce((sum, width) => sum + width, 0) + (columns - 1) * columnGap;
  const contentHeight =
    rowHeights.reduce((sum, height) => sum + height, 0) + Math.max(0, rows - 1) * rowGap;

  return { content: { width: contentWidth, height: contentHeight }, placements };
}
