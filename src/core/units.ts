export type Spacing =
  | number
  | readonly [number, number]
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export interface ResolvedSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Normalize a CSS-like spacing shorthand into explicit edges.
 * `12` -> all sides, `[vertical, horizontal]`, `[top, right, bottom, left]`.
 */
export function resolveSpacing(value: Spacing | undefined): ResolvedSpacing {
  if (value === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  if (typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value };
  }
  if (value.length === 2) {
    const [vertical, horizontal] = value;
    return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
  }
  if (value.length === 3) {
    const [top, horizontal, bottom] = value;
    return { top, right: horizontal, bottom, left: horizontal };
  }
  const [top, right, bottom, left] = value;
  return { top, right, bottom, left };
}

/** Build a spacing shorthand from explicit edges, omitting trailing defaults. */
export function spacing(top: number, right?: number, bottom?: number, left?: number): Spacing {
  if (right === undefined) return top;
  if (bottom === undefined) return [top, right];
  if (left === undefined) return [top, right, bottom];
  return [top, right, bottom, left];
}

export function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be positive integers`);
  }
}

export function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
