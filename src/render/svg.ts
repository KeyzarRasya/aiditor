import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { Post } from "../core/canvas.js";
import type {
  Box,
  CircleNode,
  DesignNode,
  GroupNode,
  ImageNode,
  LineNode,
  PathNode,
  RectNode,
  Style,
  TextNode,
} from "../core/node.js";
import { UNRESOLVED_COMPONENT } from "../core/node.js";
import { round } from "../core/units.js";
import type { Theme } from "../theme/theme.js";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

interface RenderContext {
  defs: string[];
  filterIndex: number;
}

function n(value: number): string {
  return String(round(value));
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

function addShadowFilter(context: RenderContext, theme: Theme): string {
  const id = `shadow-${context.filterIndex}`;
  context.filterIndex += 1;
  const shadow = theme.shadows.card;
  context.defs.push(
    `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">` +
      `<feDropShadow dx="${n(shadow.offsetX)}" dy="${n(shadow.offsetY)}" ` +
      `stdDeviation="${n(shadow.blur / 2)}" flood-color="${escapeAttribute(shadow.color)}"/>` +
      `</filter>`,
  );
  return id;
}

function shapeAttributes(style: Style, context: RenderContext, theme: Theme): string {
  const attributes: string[] = [`fill="${style.fill ? escapeAttribute(style.fill) : "none"}"`];
  if (style.stroke) {
    attributes.push(`stroke="${escapeAttribute(style.stroke)}"`);
    attributes.push(`stroke-width="${n(style.strokeWidth ?? 1)}"`);
  }
  if (style.opacity !== undefined && style.opacity !== 1) {
    attributes.push(`opacity="${n(style.opacity)}"`);
  }
  if (style.shadow && style.fill) {
    attributes.push(`filter="url(#${addShadowFilter(context, theme)})"`);
  }
  return attributes.join(" ");
}

function renderGroup(
  node: GroupNode,
  box: Box,
  context: RenderContext,
  theme: Theme,
): string {
  const parts: string[] = [];
  if (node.style.fill) {
    const radius = node.style.radius ? ` rx="${n(node.style.radius)}"` : "";
    parts.push(
      `<rect x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}"` +
        `${radius} ${shapeAttributes(node.style, context, theme)}/>`,
    );
  }
  for (const child of node.children) {
    parts.push(renderNode(child, context, theme));
  }
  const content = parts.join("");
  if (node.style.opacity !== undefined && node.style.opacity !== 1) {
    return `<g opacity="${n(node.style.opacity)}">${content}</g>`;
  }
  return content;
}

function renderRect(node: RectNode, box: Box, context: RenderContext, theme: Theme): string {
  const radius = node.style.radius ? ` rx="${n(node.style.radius)}"` : "";
  return (
    `<rect x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}"` +
    `${radius} ${shapeAttributes(node.style, context, theme)}/>`
  );
}

function renderCircle(node: CircleNode, box: Box, context: RenderContext, theme: Theme): string {
  return (
    `<circle cx="${n(box.x + node.radius)}" cy="${n(box.y + node.radius)}" ` +
    `r="${n(node.radius)}" ${shapeAttributes(node.style, context, theme)}/>`
  );
}

function renderLine(node: LineNode, box: Box, context: RenderContext, theme: Theme): string {
  const attributes = shapeAttributes(
    { ...node.style, stroke: node.style.stroke ?? node.style.fill },
    context,
    theme,
  );
  return (
    `<line x1="${n(box.x + node.x1)}" y1="${n(box.y + node.y1)}" ` +
    `x2="${n(box.x + node.x2)}" y2="${n(box.y + node.y2)}" ${attributes}/>`
  );
}

function renderText(node: TextNode, box: Box, theme: Theme): string {
  const fontSize = node.style.fontSize ?? theme.typography.body.size;
  const align = node.style.textAlign ?? "left";
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const anchorX = align === "center" ? box.x + box.width / 2 : align === "right" ? box.x + box.width : box.x;

  const ascent = node.metrics?.ascent ?? fontSize;
  const lineHeight = node.metrics?.lineHeight ?? Math.round(fontSize * 1.3);
  const lines = node.metrics?.lines ?? [node.text];
  const baseline = box.y + ascent;

  const tspans = lines
    .map((line, index) => {
      const attributes =
        index === 0
          ? `x="${n(anchorX)}" y="${n(baseline)}"`
          : `x="${n(anchorX)}" dy="${n(lineHeight)}"`;
      return `<tspan ${attributes}>${line.length > 0 ? escapeText(line) : " "}</tspan>`;
    })
    .join("");

  const attributes: string[] = [
    `fill="${escapeAttribute(node.style.color ?? theme.colors.text)}"`,
    `font-family="${escapeAttribute(node.style.fontFamily ?? theme.typography.body.family)}"`,
    `font-size="${n(fontSize)}"`,
    `font-weight="${node.style.fontWeight ?? theme.typography.body.weight}"`,
  ];
  if (node.style.fontStyle && node.style.fontStyle !== "normal") {
    attributes.push(`font-style="${node.style.fontStyle}"`);
  }
  if (node.style.letterSpacing) {
    attributes.push(`letter-spacing="${n(node.style.letterSpacing)}"`);
  }
  if (align !== "left") {
    attributes.push(`text-anchor="${anchor}"`);
  }
  if (node.style.opacity !== undefined && node.style.opacity !== 1) {
    attributes.push(`opacity="${n(node.style.opacity)}"`);
  }

  return `<text ${attributes.join(" ")}>${tspans}</text>`;
}

function renderImage(node: ImageNode, box: Box): string {
  let href = node.src;
  if (!/^(https?:|data:)/.test(node.src)) {
    const path = resolve(node.src);
    if (!existsSync(path)) {
      throw new Error(`Image "${node.src}" was not found (looked in ${path}).`);
    }
    const mime = MIME_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
    href = `data:${mime};base64,${readFileSync(path).toString("base64")}`;
  }
  return (
    `<image x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}" ` +
    `href="${escapeAttribute(href)}" preserveAspectRatio="xMidYMid meet"/>`
  );
}

function renderPath(node: PathNode, box: Box, context: RenderContext, theme: Theme): string {
  const scaleX = box.width / node.viewBox;
  const scaleY = box.height / node.viewBox;
  const transform = `translate(${n(box.x)} ${n(box.y)}) scale(${n(scaleX)} ${n(scaleY)})`;
  return (
    `<path d="${escapeAttribute(node.d)}" transform="${transform}" ` +
    `${shapeAttributes(node.style, context, theme)}/>`
  );
}

function renderNode(node: DesignNode, context: RenderContext, theme: Theme): string {
  if (node.kind === "component") {
    throw new Error(UNRESOLVED_COMPONENT);
  }

  const box = node.box;
  if (!box) return "";

  switch (node.kind) {
    case "group":
      return renderGroup(node, box, context, theme);
    case "rect":
      return renderRect(node, box, context, theme);
    case "circle":
      return renderCircle(node, box, context, theme);
    case "line":
      return renderLine(node, box, context, theme);
    case "path":
      return renderPath(node, box, context, theme);
    case "text":
      return renderText(node, box, theme);
    case "image":
      return renderImage(node, box);
  }
}

/** Fail loudly if a semantic component was never resolved (i.e. `layout()` has not run). */
function assertNoComponents(node: DesignNode): void {
  if (node.kind === "component") {
    throw new Error(UNRESOLVED_COMPONENT);
  }
  if (node.kind === "group") {
    for (const child of node.children) {
      assertNoComponents(child);
    }
  }
}

export function renderToSvg(post: Post): string {
  assertNoComponents(post.root);

  const context: RenderContext = { defs: [], filterIndex: 0 };
  const content = renderNode(post.root, context, post.theme);
  const defs = context.defs.length > 0 ? `<defs>${context.defs.join("")}</defs>` : "";
  const background =
    `<rect x="0" y="0" width="${n(post.width)}" height="${n(post.height)}" ` +
    `fill="${escapeAttribute(post.background)}"/>`;

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(post.width)}" height="${n(post.height)}" ` +
    `viewBox="0 0 ${n(post.width)} ${n(post.height)}">${defs}${background}${content}</svg>\n`
  );
}
