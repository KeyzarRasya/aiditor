import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { watch } from "chokidar";
import { Command } from "commander";
import type { Post } from "../core/canvas.js";
import {
  CATALOG,
  findEntry,
  renderCatalogEntry,
  renderCatalogIndex,
  renderCatalogJson,
} from "../components/catalog.js";
import { FontRegistry, configureFontRegistry } from "../fonts/registry.js";
import { layout } from "../layout/index.js";
import { renderPost, type RenderFormat } from "../render/post.js";
import { loadConfig, type SocialConfig } from "../theme/config.js";
import { loadProjectTheme } from "../theme/load.js";
import { setProjectTheme } from "../theme/theme.js";
import { initProject } from "./init.js";

interface Context {
  config: SocialConfig;
  cwd: string;
  themeOverride?: string;
}

interface RenderFlags {
  file: string;
  format?: string;
  out?: string;
}

const DEFAULT_THEME_PATH = "theme.ts";

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

function readVersion(): string {
  try {
    const contents = readFileSync(new URL("../../package.json", import.meta.url), "utf8");
    return (JSON.parse(contents) as { version?: string }).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? `Error: ${error.message}` : `Error: ${String(error)}`;
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

async function createContext(cwd: string, themeOverride?: string): Promise<Context> {
  const config = await loadConfig(cwd);
  configureFontRegistry(new FontRegistry([resolve(cwd, config.fontsDir)]));
  const context: Context = { config, cwd, themeOverride };
  // Register the theme before any post is imported, since createPost runs at import time.
  await applyTheme(context);
  return context;
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

async function renderToFile(
  flags: RenderFlags,
  context: Context,
  bustCache = false,
): Promise<string> {
  const format = parseFormat(flags.format, context.config.defaultFormat);
  const outDir = resolve(context.cwd, flags.out ?? context.config.outDir);
  const post = await loadPost(flags.file, context, bustCache);

  layout(post);
  const output = renderPost(post, { format });

  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, `${basename(flags.file, extname(flags.file))}.${format}`);
  writeFileSync(outFile, output);
  return outFile;
}

function themeFilePath(context: Context): string {
  return resolve(
    context.cwd,
    context.themeOverride ?? context.config.theme ?? DEFAULT_THEME_PATH,
  );
}

/** Watch the post and the theme, re-rendering on change. Keeps the process alive. */
function startWatching(flags: RenderFlags, context: Context): void {
  const postPath = resolve(context.cwd, flags.file);
  const themePath = themeFilePath(context);
  const hasTheme = existsSync(themePath);
  const targets = hasTheme ? [postPath, themePath] : [postPath];

  if (hasTheme) {
    process.stdout.write(`Watching ${relative(context.cwd, themePath)}...\n`);
  }

  let timer: NodeJS.Timeout | undefined;
  watch(targets, { ignoreInitial: true }).on("change", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      void (async () => {
        try {
          await applyTheme(context, true);
          const outFile = await renderToFile(flags, context, true);
          process.stdout.write(`Rendered ${relative(context.cwd, outFile)}\n`);
        } catch (error) {
          process.stderr.write(`${formatError(error)}\n`);
        }
      })();
    }, 50);
  });
}

function buildProgram(): Command {
  const program = new Command();

  program
    .name("social")
    .description("Social images as code — render TypeScript posts to SVG/PNG")
    .version(readVersion());

  program
    .command("init")
    .description("scaffold a new social-image project")
    .argument("[dir]", "target directory", ".")
    .option("--force", "scaffold into a non-empty directory")
    .action((dir: string, options: { force?: boolean }) => {
      const result = initProject(dir, { force: options.force });
      const relativePath = relative(process.cwd(), result.dir);
      // Fall back to the absolute path when the target sits outside the working directory,
      // otherwise the hint reads like "../../../../../tmp/...".
      const shown = relativePath === "" ? "." : relativePath.startsWith("..") ? result.dir : relativePath;
      process.stdout.write(`Scaffolded ${result.files.length} files into ${shown}\n\n`);
      process.stdout.write("Next steps:\n");
      if (shown !== ".") {
        process.stdout.write(`  cd ${shown}\n`);
      }
      process.stdout.write("  npm install\n");
      process.stdout.write("  npm run render -- posts/hello.ts\n");
    });

  program
    .command("components")
    .description("list the semantic components and layout helpers")
    .argument("[name]", "show detail for one entry")
    .option("--json", "output the catalog as JSON")
    .action((name: string | undefined, options: { json?: boolean }) => {
      if (options.json) {
        process.stdout.write(renderCatalogJson());
        return;
      }
      if (name === undefined) {
        process.stdout.write(renderCatalogIndex());
        return;
      }
      const entry = findEntry(name);
      if (!entry) {
        throw new Error(
          `Unknown component "${name}". Available: ${CATALOG.map((item) => item.name).join(", ")}.`,
        );
      }
      process.stdout.write(renderCatalogEntry(entry));
    });

  program
    .command("render")
    .description("render a post to an image")
    .argument("<post-file>", "post file, e.g. posts/hello.ts")
    .option("-f, --format <format>", "output format: svg or png")
    .option("-o, --out <dir>", "output directory")
    .option("-t, --theme <file>", "theme file to use instead of social.config.ts")
    .action(async (file: string, options: { format?: string; out?: string; theme?: string }) => {
      const context = await createContext(process.cwd(), options.theme);
      const outFile = await renderToFile(
        { file, format: options.format, out: options.out },
        context,
      );
      process.stdout.write(`Rendered ${relative(context.cwd, outFile)}\n`);
    });

  program
    .command("dev")
    .description("render a post, then re-render whenever it or the theme changes")
    .argument("<post-file>", "post file, e.g. posts/hello.ts")
    .option("-f, --format <format>", "output format: svg or png")
    .option("-o, --out <dir>", "output directory")
    .option("-t, --theme <file>", "theme file to use instead of social.config.ts")
    .action(async (file: string, options: { format?: string; out?: string; theme?: string }) => {
      const context = await createContext(process.cwd(), options.theme);
      const flags: RenderFlags = { file, format: options.format, out: options.out };
      const first = await renderToFile(flags, context, true);
      process.stdout.write(`Rendered ${relative(context.cwd, first)}\n`);
      process.stdout.write(`Watching ${file}...\n`);
      startWatching(flags, context);
    });

  return program;
}

/** Entry point: parse argv, run the command, and report errors on stderr. */
export async function run(argv: string[]): Promise<void> {
  try {
    const program = buildProgram();
    if (argv.length === 0) {
      program.outputHelp();
      return;
    }
    await program.parseAsync(argv, { from: "user" });
  } catch (error) {
    process.stderr.write(`${formatError(error)}\n`);
    process.exitCode = 1;
  }
}
