import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { SocialConfig } from "./config.js";
import type { DeepPartial, Theme } from "./theme.js";

export interface ProjectThemeSource {
  cwd: string;
  config: SocialConfig;
  /** Explicit `--theme <path>`; when set, a missing file is an error. */
  override?: string;
}

const DEFAULT_THEME_PATH = "theme.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Import a theme module (`.ts` or `.js`) and return its default export. */
export async function loadTheme(path: string, bustCache = false): Promise<DeepPartial<Theme>> {
  const url = pathToFileURL(path).href + (bustCache ? `?v=${Date.now().toString()}` : "");
  const imported = (await import(url)) as { default?: unknown; theme?: unknown };
  const theme = imported.default ?? imported.theme;
  if (!isPlainObject(theme)) {
    throw new Error(`Theme file "${path}" must default-export defineTheme({...}).`);
  }
  return theme as DeepPartial<Theme>;
}

/**
 * Resolve the project theme from `config.theme` (default `theme.ts`) or an explicit `--theme` path.
 * A missing default file is fine (defaults apply); a missing explicit override is an error.
 */
export async function loadProjectTheme(
  source: ProjectThemeSource,
  bustCache = false,
): Promise<DeepPartial<Theme> | undefined> {
  const requested = source.override ?? source.config.theme ?? DEFAULT_THEME_PATH;
  const path = resolve(source.cwd, requested);

  if (!existsSync(path)) {
    if (source.override !== undefined) {
      throw new Error(`Theme file "${source.override}" was not found.`);
    }
    return undefined;
  }

  return loadTheme(path, bustCache);
}
