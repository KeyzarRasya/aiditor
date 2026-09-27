import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export interface SocialConfig {
  outDir: string;
  fontsDir: string;
  defaultFormat: "png" | "svg";
}

export const defaultConfig: SocialConfig = {
  outDir: "dist",
  fontsDir: "fonts",
  defaultFormat: "png",
};

const CONFIG_FILES = ["social.config.ts", "social.config.js", "social.config.mjs"];

export async function loadConfig(cwd: string = process.cwd()): Promise<SocialConfig> {
  for (const name of CONFIG_FILES) {
    const path = resolve(cwd, name);
    if (!existsSync(path)) continue;
    const imported = (await import(pathToFileURL(path).href)) as {
      default?: Partial<SocialConfig>;
      config?: Partial<SocialConfig>;
    };
    const loaded = imported.default ?? imported.config;
    if (loaded && typeof loaded === "object") {
      return { ...defaultConfig, ...loaded };
    }
  }
  return { ...defaultConfig };
}
