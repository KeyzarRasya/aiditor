import { existsSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { openSync, type Font, type FontCollection } from "fontkit";
import type { FontStyle } from "../core/node.js";

const SUPPORTED_EXTENSIONS = new Set([".ttf", ".otf"]);

export interface FontFace {
  family: string;
  weight: number;
  style: FontStyle;
  path: string;
  font: Font;
}

export interface FontQuery {
  family?: string;
  weight?: number;
  style?: FontStyle;
}

function isFontCollection(value: Font | FontCollection): value is FontCollection {
  return "fonts" in value;
}

function inferWeight(subfamily: string): number {
  const value = subfamily.toLowerCase();
  if (value.includes("thin")) return 100;
  if (value.includes("extralight") || value.includes("ultralight")) return 200;
  if (value.includes("light")) return 300;
  if (value.includes("medium")) return 500;
  if (value.includes("semibold") || value.includes("demibold")) return 600;
  if (value.includes("extrabold") || value.includes("ultrabold")) return 800;
  if (value.includes("black") || value.includes("heavy")) return 900;
  if (value.includes("bold")) return 700;
  return 400;
}

export class FontRegistry {
  readonly #directories: string[];
  #faces: FontFace[] = [];

  constructor(directories: string[] = []) {
    this.#directories = directories.map((directory) => resolve(directory));
    for (const directory of this.#directories) {
      this.scan(directory);
    }
  }

  get paths(): string[] {
    return this.#faces.map((face) => face.path);
  }

  get families(): string[] {
    return [...new Set(this.#faces.map((face) => face.family))];
  }

  get size(): number {
    return this.#faces.length;
  }

  scan(directory: string): FontFace[] {
    const resolved = resolve(directory);
    if (!existsSync(resolved)) return [];
    const added: FontFace[] = [];
    for (const entry of readdirSync(resolved).sort()) {
      if (!SUPPORTED_EXTENSIONS.has(extname(entry).toLowerCase())) continue;
      added.push(this.register(join(resolved, entry)));
    }
    return added;
  }

  register(path: string): FontFace {
    const opened = openSync(path);
    const font = isFontCollection(opened) ? opened.fonts[0] : opened;
    if (!font) {
      throw new Error(`Font file "${path}" does not contain any usable font.`);
    }
    const subfamily = font.subfamilyName ?? "Regular";
    const style: FontStyle = /italic|oblique/i.test(subfamily) ? "italic" : "normal";
    const weight = font["OS/2"]?.usWeightClass ?? inferWeight(subfamily);
    const face: FontFace = { family: font.familyName, weight, style, path, font };
    this.#faces.push(face);
    return face;
  }

  resolve(query: FontQuery = {}): FontFace {
    const directories = this.#directories.join(", ") || "./fonts";

    if (this.#faces.length === 0) {
      throw new Error(
        `No fonts found in ${directories}. Add .ttf or .otf files to your fonts directory.`,
      );
    }

    const style = query.style ?? "normal";
    const weight = query.weight ?? 400;
    const family = query.family;

    const matchingStyle = this.#faces.filter((face) => face.style === style);
    const sameStylePool = matchingStyle.length > 0 ? matchingStyle : this.#faces;
    const pool = family
      ? sameStylePool.filter((face) => face.family.toLowerCase() === family.toLowerCase())
      : sameStylePool;

    if (pool.length === 0) {
      throw new Error(
        `Font "${family ?? "default"}" was not found in ${directories}. ` +
          `Available families: ${this.families.join(", ") || "(none)"}.`,
      );
    }

    return pickClosestWeight(pool, weight);
  }
}

function pickClosestWeight(faces: FontFace[], weight: number): FontFace {
  return faces.reduce((best, face) =>
    Math.abs(face.weight - weight) < Math.abs(best.weight - weight) ? face : best,
  );
}

let registry: FontRegistry | undefined;

export function getFontRegistry(): FontRegistry {
  registry ??= new FontRegistry(["fonts"]);
  return registry;
}

export function configureFontRegistry(next: FontRegistry): void {
  registry = next;
}
