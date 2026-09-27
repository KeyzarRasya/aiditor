#!/usr/bin/env node
import { existsSync, mkdirSync, watch, writeFileSync } from "node:fs";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Post } from "../core/canvas.js";
import { FontRegistry, configureFontRegistry } from "../fonts/registry.js";
import { layout } from "../layout/index.js";
import { renderPost, type RenderFormat } from "../render/post.js";
import { loadConfig, type SocialConfig } from "../theme/config.js";
import { loadProjectTheme } from "../theme/load.js";
import { setProjectTheme } from "../theme/theme.js";

const HELP = `social — social images as code

Usage:
  social render <post-file> [--format svg|png] [--out <dir>] [--theme <file>]
  social dev <post-file> [--theme <file>]

Options:
  --format <svg|png>   Output format (default: png)
  --out <dir>          Output directory (default: dist)
  --theme <file>       Theme file to use instead of social.config.ts's "theme"
`;

interface Context {
  config: SocialConfig;
  cwd: string;
  themeOverride?: string;
}

function getOption(args: string[], name: string): string | undefined {
  const withEquals = args.find((arg) => arg.startsWith(`${name}=`));
  if (withEquals) return withEquals.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseFormat(value: string | undefined, fallback: RenderFormat): RenderFormat {
  if (value === undefined) return fallback;
  if (value === "png" || value === "svg") return value;
  throw new Error(`Unknown format "${value}". Use "png" or "svg".`);
}

function isPost(value: unknown): value is Post {
  return (
    typeof value === "object" &&
    value !== null &&
    "root" in value &&
    "width" in value &&
    "height" in value
  );
}

/** Load the project theme (or `--theme` override) and register it for `createPost`. */
async function applyTheme(context: Context, bustCache = false): Promise<void> {
  setProjectTheme(
    await loadProjectTheme(
      { cwd: context.cwd, config: context.config, override: context.themeOverride },
      bustCache,
    ),
  );
}

async function loadPost(file: string, context: Context, bustCache = false): Promise<Post> {
  const path = resolve(context.cwd, file);
  if (!existsSync(path)) {
    throw new Error(`Post file "${file}" was not found.`);
  }
  const url = pathToFileURL(path).href + (bustCache ? `?v=${Date.now().toString()}` : "");
  const imported = (await import(url)) as { default?: unknown; post?: unknown };
  const post = imported.default ?? imported.post;
  if (!isPost(post)) {
    throw new Error(`"${file}" must default-export the result of createPost().`);
  }
  return post;
}

async function renderPostFile(
  args: string[],
  context: Context,
  bustCache = false,
): Promise<string> {
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file) {
    throw new Error("Usage: social render <post-file> [--format svg|png] [--out <dir>]");
  }

  const format = parseFormat(getOption(args, "--format"), context.config.defaultFormat);
  const outDir = resolve(context.cwd, getOption(args, "--out") ?? context.config.outDir);
  const post = await loadPost(file, context, bustCache);

  layout(post);
  const output = renderPost(post, { format });

  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, `${basename(file, extname(file))}.${format}`);
  writeFileSync(outFile, output);
  return outFile;
}

/**
 * Watch a single file. We watch the containing directory rather than the file itself: editors (and
 * atomic writers) replace the file, which invalidates a file-level watcher after the first change.
 */
function watchFile(path: string, onChange: () => void): void {
  const name = basename(path);
  watch(dirname(path), (_event, filename) => {
    if (filename === null || filename === name) onChange();
  });
}

function formatError(error: unknown): string {
  return error instanceof Error ? `Error: ${error.message}` : `Error: ${String(error)}`;
}

async function main(argv: string[]): Promise<void> {
  const cwd = process.cwd();
  const [command, ...rest] = argv;
  const config = await loadConfig(cwd);
  configureFontRegistry(new FontRegistry([resolve(cwd, config.fontsDir)]));
  const context: Context = { config, cwd, themeOverride: getOption(argv, "--theme") };

  // Register the project theme before any post is imported, since `createPost` runs at import time.
  await applyTheme(context);

  switch (command) {
    case "render": {
      const outFile = await renderPostFile(rest, context);
      process.stdout.write(`Rendered ${relative(cwd, outFile)}\n`);
      return;
    }
    case "dev": {
      const file = rest.find((arg) => !arg.startsWith("--"));
      if (!file) {
        throw new Error("Usage: social dev <post-file>");
      }
      const first = await renderPostFile(rest, context, true);
      process.stdout.write(`Rendered ${relative(cwd, first)}\n`);
      process.stdout.write(`Watching ${file}...\n`);

      let timer: NodeJS.Timeout | undefined;
      const rebuild = (): void => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          void (async () => {
            try {
              // Reload the theme too, so editing theme.ts restyles live.
              await applyTheme(context, true);
              const outFile = await renderPostFile(rest, context, true);
              process.stdout.write(`Rendered ${relative(cwd, outFile)}\n`);
            } catch (error) {
              process.stderr.write(`${formatError(error)}\n`);
            }
          })();
        }, 50);
      };

      watchFile(resolve(cwd, file), rebuild);

      const themeFile = resolve(cwd, context.themeOverride ?? config.theme ?? "theme.ts");
      if (existsSync(themeFile)) {
        watchFile(themeFile, rebuild);
        process.stdout.write(`Watching ${relative(cwd, themeFile)}...\n`);
      }
      return;
    }
    default:
      process.stdout.write(HELP);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
});
