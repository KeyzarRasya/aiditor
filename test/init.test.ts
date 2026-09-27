import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/cli/init.js";

const tempDirs: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "aiditor-init-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

const EXPECTED_FILES = [
  "package.json",
  "tsconfig.json",
  ".gitignore",
  "README.md",
  "AGENTS.md",
  "theme.ts",
  "social.config.ts",
  "posts/hello.ts",
  "assets/.gitkeep",
];

describe("social init", () => {
  it("scaffolds a complete project into a new directory", () => {
    const dir = join(tempDir(), "my-social-posts");

    const result = initProject(dir);

    for (const file of EXPECTED_FILES) {
      expect(existsSync(join(dir, file)), `expected ${file}`).toBe(true);
    }
    expect(result.files).toContain("posts/hello.ts");
    expect(join(result.dir, "package.json")).toBe(join(dir, "package.json"));
  });

  it("copies the engine's bundled fonts", () => {
    const dir = join(tempDir(), "with-fonts");

    initProject(dir);

    const fonts = readdirSync(join(dir, "fonts"));
    expect(fonts.some((font) => font.endsWith(".ttf"))).toBe(true);
  });

  it("links aiditor by absolute file path and maps it to the engine source", () => {
    const dir = join(tempDir(), "linked");
    initProject(dir);

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies.aiditor).toMatch(/^file:\//);

    const tsconfig = JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8")) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    expect(tsconfig.compilerOptions.paths.aiditor?.[0]).toContain(
      "node_modules/aiditor/src/index.ts",
    );
  });

  it("slugifies the directory name for the package name", () => {
    const dir = join(tempDir(), "My Social Posts");
    initProject(dir);

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name: string };
    expect(pkg.name).toBe("my-social-posts");
  });

  it("refuses a non-empty directory without --force", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "existing.txt"), "hello");

    expect(() => initProject(dir)).toThrow(/is not empty/);
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  it("scaffolds into a non-empty directory with --force, leaving other files alone", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "existing.txt"), "hello");

    const result = initProject(dir, { force: true });

    expect(result.files).toContain("package.json");
    expect(existsSync(join(dir, "package.json"))).toBe(true);
    expect(readFileSync(join(dir, "existing.txt"), "utf8")).toBe("hello");
  });
});
