import type { Size } from "../core/node.js";

export function isPercentage(value: Size | undefined): boolean {
  return typeof value === "string" && value.endsWith("%");
}

/** Resolve a `"NN%"` size against the given available extent, or `undefined` when unbounded. */
export function percentageOf(value: Size | undefined, available: number): number | undefined {
  if (!isPercentage(value)) return undefined;
  const percentage = Number.parseFloat(value as string);
  if (Number.isNaN(percentage)) return undefined;
  return Number.isFinite(available) ? (percentage / 100) * available : undefined;
}

/**
 * Resolve a leaf size to a concrete number:
 * explicit px, a percentage of `available`, `"fill"` (the available extent), else `fallback`
 * (used for `"hug"` / absent, where the caller supplies the intrinsic size).
 */
export function resolveLength(value: Size | undefined, available: number, fallback: number): number {
  if (typeof value === "number") return value;
  const percentage = percentageOf(value, available);
  if (percentage !== undefined) return percentage;
  if (value === "fill") return Number.isFinite(available) ? available : fallback;
  return fallback;
}

/**
 * Resolve a container's width target. Absent means "fill the parent" when the parent bound is
 * finite, otherwise hug.
 */
export function resolveWidthTarget(value: Size | undefined, available: number): number | undefined {
  if (typeof value === "number") return value;
  const percentage = percentageOf(value, available);
  if (percentage !== undefined) return percentage;
  if (value === "hug") return undefined;
  return Number.isFinite(available) ? available : undefined;
}

/** Resolve a container's height target. Absent means hug; only `"fill"` fills the parent. */
export function resolveHeightTarget(value: Size | undefined, available: number): number | undefined {
  if (typeof value === "number") return value;
  const percentage = percentageOf(value, available);
  if (percentage !== undefined) return percentage;
  if (value === "fill") return Number.isFinite(available) ? available : undefined;
  return undefined;
}
