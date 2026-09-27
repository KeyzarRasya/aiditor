import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as components from "../src/components/index.js";
import * as presets from "../src/presets/index.js";
import { CATALOG, findEntry, renderCatalogMarkdown } from "../src/components/catalog.js";

const LAYOUT_HELPERS = [
  "group",
  "stack",
  "row",
  "grid",
  "center",
  "alignLeft",
  "alignRight",
  "alignTop",
  "alignBottom",
];

describe("component catalog", () => {
  it("catalogues every exported component", () => {
    const exported = Object.keys(components);
    // Guard against a vacuous pass if the namespace import ever comes back empty.
    expect(exported.length).toBeGreaterThanOrEqual(12);

    const catalogued = new Set(CATALOG.map((entry) => entry.name));
    for (const name of exported) {
      expect(catalogued.has(name), `missing catalog entry for "${name}"`).toBe(true);
    }
  });

  it("catalogues every layout helper", () => {
    const catalogued = new Set(CATALOG.map((entry) => entry.name));

    for (const name of LAYOUT_HELPERS) {
      expect(catalogued.has(name), `missing catalog entry for "${name}"`).toBe(true);
    }
  });

  it("catalogues every preset", () => {
    const exported = Object.keys(presets);
    expect(exported.length).toBeGreaterThanOrEqual(5);

    const catalogued = new Set(CATALOG.map((entry) => entry.name));
    for (const name of exported) {
      expect(catalogued.has(name), `missing catalog entry for "${name}"`).toBe(true);
    }
  });

  it("keeps every category populated", () => {
    for (const category of ["component", "layout", "preset"] as const) {
      expect(CATALOG.some((entry) => entry.category === category), category).toBe(true);
    }
  });

  it("gives every entry a summary and a self-referential example", () => {
    for (const entry of CATALOG) {
      expect(entry.summary.length, entry.name).toBeGreaterThan(0);
      expect(entry.example, entry.name).toContain(entry.name);
    }
  });

  it("uses unique names", () => {
    const names = CATALOG.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps docs/COMPONENTS.md in sync with the catalog", () => {
    const committed = readFileSync(
      fileURLToPath(new URL("../docs/COMPONENTS.md", import.meta.url)),
      "utf8",
    );

    expect(committed).toBe(renderCatalogMarkdown());
  });

  it("finds entries by name", () => {
    expect(findEntry("card")?.category).toBe("component");
    expect(findEntry("grid")?.category).toBe("layout");
    expect(findEntry("nope")).toBeUndefined();
  });
});
