import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TSX = resolve(ROOT, "node_modules/.bin/tsx");
const CLI = resolve(ROOT, "src/cli/index.ts");
const VERSION = (
  JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as { version: string }
).version;

interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Spawn the real CLI through tsx and capture its result, including non-zero exits. */
async function runCli(args: string[]): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync(TSX, [CLI, ...args], { cwd: ROOT });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failure = error as { code?: number | string; stdout?: string; stderr?: string };
    return {
      code: typeof failure.code === "number" ? failure.code : 1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
    };
  }
}

describe("social CLI", () => {
  it("prints the package version", { timeout: 30000 }, async () => {
    const { code, stdout } = await runCli(["--version"]);
    expect(code).toBe(0);
    expect(stdout.trim()).toBe(VERSION);
  });

  it("lists the commands in --help", { timeout: 30000 }, async () => {
    const { code, stdout } = await runCli(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("render");
    expect(stdout).toContain("dev");
  });

  it("renders into an explicit output directory", { timeout: 30000 }, async () => {
    const outDir = mkdtempSync(join(tmpdir(), "aiditor-cli-"));
    try {
      const { code, stdout } = await runCli([
        "render",
        "posts/hello.ts",
        "--format",
        "svg",
        "--out",
        outDir,
      ]);
      expect(code).toBe(0);
      expect(stdout).toContain("Rendered");
      expect(existsSync(join(outDir, "hello.svg"))).toBe(true);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });

  it("rejects an unknown format with a non-zero exit", { timeout: 30000 }, async () => {
    const { code, stderr } = await runCli(["render", "posts/hello.ts", "--format", "webp"]);
    expect(code).not.toBe(0);
    expect(stderr).toContain('Unknown format "webp"');
  });

  it("errors when the post file is missing", { timeout: 30000 }, async () => {
    const { code, stderr } = await runCli(["render", "posts/does-not-exist.ts"]);
    expect(code).not.toBe(0);
    expect(stderr).toContain('Post file "posts/does-not-exist.ts" was not found.');
  });

  it("errors when an explicit --theme is missing", { timeout: 30000 }, async () => {
    const { code, stderr } = await runCli(["render", "posts/hello.ts", "--theme", "nope.ts"]);
    expect(code).not.toBe(0);
    expect(stderr).toContain('Theme file "nope.ts" was not found.');
  });

  it("lists components without needing a config", { timeout: 30000 }, async () => {
    const { code, stdout } = await runCli(["components"]);
    expect(code).toBe(0);
    expect(stdout).toContain("headline");
    expect(stdout).toContain("card");
    expect(stdout).toContain("grid");
  });

  it("emits the catalog as JSON", { timeout: 30000 }, async () => {
    const { code, stdout } = await runCli(["components", "--json"]);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout) as { name: string; example: string }[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.some((entry) => entry.name === "headline")).toBe(true);
  });

  it("shows detail for one component", { timeout: 30000 }, async () => {
    const { code, stdout } = await runCli(["components", "card"]);
    expect(code).toBe(0);
    expect(stdout).toContain("items");
    expect(stdout).toContain("Example:");
  });

  it("errors on an unknown component", { timeout: 30000 }, async () => {
    const { code, stderr } = await runCli(["components", "nope"]);
    expect(code).not.toBe(0);
    expect(stderr).toContain('Unknown component "nope"');
    expect(stderr).toContain("headline");
  });
});
