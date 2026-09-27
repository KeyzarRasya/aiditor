export interface TypographyToken {
  family: string;
  weight: number;
  size: number;
  lineHeight: number;
}

export interface ShadowToken {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
  };
  typography: {
    heading: TypographyToken;
    body: TypographyToken;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    card: ShadowToken;
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const defaultTheme: Theme = {
  colors: {
    primary: "#2563EB",
    background: "#0B1220",
    surface: "#111C31",
    text: "#F8FAFC",
    textMuted: "#CBD5E1",
    accent: "#38BDF8",
    border: "#1E293B",
  },
  typography: {
    heading: { family: "Roboto", weight: 700, size: 72, lineHeight: 1.15 },
    body: { family: "Roboto", weight: 400, size: 36, lineHeight: 1.45 },
  },
  spacing: { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 },
  borderRadius: { sm: 8, md: 16, lg: 28 },
  shadows: {
    card: { color: "rgba(0, 0, 0, 0.45)", blur: 40, offsetX: 0, offsetY: 18 },
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in result ? deepMerge(result[key], value) : value;
  }
  return result as T;
}

/**
 * Identity helper that gives editors type-checking for a theme override object.
 * `theme.ts` uses this as its default export.
 */
export function defineTheme(overrides: DeepPartial<Theme>): DeepPartial<Theme> {
  return overrides;
}

let projectTheme: DeepPartial<Theme> | undefined;

/**
 * Register the project theme (loaded from `theme.ts` by the CLI). It is merged under per-post
 * `createPost({ theme })` overrides and over `defaultTheme`.
 */
export function setProjectTheme(theme: DeepPartial<Theme> | undefined): void {
  projectTheme = theme;
}

export function getProjectTheme(): DeepPartial<Theme> | undefined {
  return projectTheme;
}

/** Clear the registered project theme (used by tests to stay isolated). */
export function resetProjectTheme(): void {
  projectTheme = undefined;
}

/** Resolve a full theme: `defaultTheme` ← project theme ← per-post overrides. */
export function createTheme(overrides?: DeepPartial<Theme>): Theme {
  return deepMerge(deepMerge(defaultTheme, projectTheme), overrides);
}
