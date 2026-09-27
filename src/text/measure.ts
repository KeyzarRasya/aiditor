import type { Font } from "fontkit";
import type { FontStyle, TextMetrics } from "../core/node.js";
import { round } from "../core/units.js";
import { getFontRegistry } from "../fonts/registry.js";

export interface TextLayoutOptions {
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: FontStyle;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  maxWidth?: number;
}

interface Chunk {
  text: string;
  spaceBefore: boolean;
}

// CJK ranges are treated as breakable per-character because they are not space-delimited.
const CJK_PATTERN = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

const widthCache = new Map<string, number>();

function scaleFontUnits(units: number, font: Font, fontSize: number): number {
  return (units / font.unitsPerEm) * fontSize;
}

function graphemeLength(text: string): number {
  return [...text].length;
}

/** Measure the advance width of a single line of text, in pixels. */
export function measureAdvance(
  content: string,
  font: Font,
  fontSize: number,
  letterSpacing = 0,
): number {
  if (content.length === 0) return 0;

  const key = `${font.postscriptName}|${fontSize}|${letterSpacing}|${content}`;
  const cached = widthCache.get(key);
  if (cached !== undefined) return cached;

  const run = font.layout(content);
  let units = 0;
  for (const position of run.positions) {
    units += position.xAdvance;
  }

  const width =
    scaleFontUnits(units, font, fontSize) + letterSpacing * Math.max(0, graphemeLength(content) - 1);
  widthCache.set(key, width);
  return width;
}

function toChunks(content: string): Chunk[] {
  const chunks: Chunk[] = [];
  let pendingSpace = false;

  for (const part of content.split(/(\s+)/)) {
    if (part.length === 0) continue;
    if (/^\s+$/.test(part)) {
      pendingSpace = chunks.length > 0;
      continue;
    }
    if (CJK_PATTERN.test(part)) {
      for (const character of part) {
        chunks.push({ text: character, spaceBefore: pendingSpace });
        pendingSpace = false;
      }
    } else {
      chunks.push({ text: part, spaceBefore: pendingSpace });
      pendingSpace = false;
    }
  }

  return chunks;
}

/**
 * Greedy word wrap. Words longer than `maxWidth` are broken by character so text
 * never overflows its container. `\n` always forces a new line.
 */
export function wrapText(content: string, font: Font, options: TextLayoutOptions): TextMetrics {
  const { fontSize, lineHeight, letterSpacing = 0, maxWidth = Infinity } = options;
  const lineHeightPx = Math.round(fontSize * lineHeight);
  const lines: string[] = [];

  for (const paragraph of content.split("\n")) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const chunk of toChunks(paragraph)) {
      const separator = current.length > 0 && chunk.spaceBefore ? " " : "";
      const candidate = current + separator + chunk.text;

      if (current.length > 0 && measureAdvance(candidate, font, fontSize, letterSpacing) > maxWidth) {
        lines.push(current);
        current = chunk.text;
      } else {
        current = candidate;
      }

      while (
        measureAdvance(current, font, fontSize, letterSpacing) > maxWidth &&
        graphemeLength(current) > 1
      ) {
        let fit = "";
        for (const character of current) {
          if (fit.length > 0 && measureAdvance(fit + character, font, fontSize, letterSpacing) > maxWidth) {
            break;
          }
          fit += character;
        }
        if (fit.length === 0 || fit === current) break;
        lines.push(fit);
        current = current.slice(fit.length);
      }
    }

    lines.push(current);
  }

  let width = 0;
  for (const line of lines) {
    width = Math.max(width, measureAdvance(line, font, fontSize, letterSpacing));
  }

  return {
    lines,
    width: round(width),
    height: lines.length * lineHeightPx,
    lineHeight: lineHeightPx,
    ascent: round(scaleFontUnits(font.ascent, font, fontSize)),
    descent: round(scaleFontUnits(font.descent, font, fontSize)),
    fontSize,
  };
}

/** Resolve a font face from the registry and lay the text out against a width. */
export function layoutText(content: string, options: TextLayoutOptions): TextMetrics {
  const face = getFontRegistry().resolve({
    family: options.fontFamily,
    weight: options.fontWeight,
    style: options.fontStyle,
  });
  return wrapText(content, face.font, options);
}
