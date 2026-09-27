import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scaffoldFiles } from "./templates.js";

const SUPPORTED_FONT_EXTENSIONS = [".ttf", ".otf"];

export interface InitOptions {
  /** Scaffold into a non-empty directory. */
  force?: boolean;
}

export interface InitResult {
  dir: string;
  /** Paths written, relative to `dir`. */
  files: string[];
}

/** Absolute path to the engine package root (this file lives in `<engine>/src/cli/`). */
export function engineRoot(): string {
  return resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

function assertUsableTarget(dir: string, target: string, force: boolean): void {
  if (!existsSync(dir)) return;
  if (!statSync(dir).isDirectory()) {
    throw new Error(`"${target}" exists and is not a directory.`);
  }
  if (readdirSync(dir).length > 0 && !force) {
    throw new Error(
      `Directory "${target}" is not empty. Use --force to scaffold into it anyway.`,
    );
  }
}

function writeTree(dir: string, files: Record<string, string>): string[] {
  const written: string[] = [];
  for (const [relativePath, contents] of Object.entries(files)) {
    const path = join(dir, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
    written.push(relativePath);
  }
  return written;
}

function copyFonts(dir: string, engine: string): string[] {
  const source = join(engine, "fonts");
  if (!existsSync(source)) return [];
  const target = join(dir, "fonts");
  mkdirSync(target, { recursive: true });

  const copied: string[] = [];
  for (const entry of readdirSync(source)) {
    if (!SUPPORTED_FONT_EXTENSIONS.some((extension) => entry.toLowerCase().endsWith(extension))) {
      continue;
    }
    copyFileSync(join(source, entry), join(target, entry));
    copied.push(join("fonts", entry));
  }
  return copied;
}

/** Scaffold a runnable aiditor project into `target`. */
export function initProject(target: string, options: InitOptions = {}): InitResult {
  const dir = resolve(target);
  assertUsableTarget(dir, target, options.force ?? false);

  mkdirSync(dir, { recursive: true });
  const engine = engineRoot();
  const files = writeTree(dir, scaffoldFiles(basename(dir), engine));
  const fonts = copyFonts(dir, engine);

  return { dir, files: [...files, ...fonts] };
}
