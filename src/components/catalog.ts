/**
 * The component catalog: one place that describes what an agent can call.
 *
 * It drives `social components`, `docs/COMPONENTS.md` (via `npm run docs`), and the drift test in
 * `test/catalog.test.ts`. Keep it in sync with the actual exports — the drift test fails if a
 * component or layout helper is missing here.
 */

export type CatalogCategory = "component" | "layout" | "preset";

export interface CatalogParam {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  default?: string;
}

export interface CatalogEntry {
  name: string;
  category: CatalogCategory;
  summary: string;
  params: CatalogParam[];
  example: string;
}

const OPTIONS_PARAM: CatalogParam = {
  name: "...options",
  type: "NodeOptions",
  description:
    "Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden.",
};

export const CATALOG: CatalogEntry[] = [
  {
    name: "headline",
    category: "component",
    summary: "Main heading, using `theme.typography.heading` and `colors.text`.",
    params: [
      { name: "text", type: "string", required: true, description: "Heading text." },
      OPTIONS_PARAM,
    ],
    example: 'headline({ text: "ERP yang mahal belum tentu ERP yang paling cocok." })',
  },
  {
    name: "subheadline",
    category: "component",
    summary: "Secondary heading, sized between the heading and body tokens.",
    params: [
      { name: "text", type: "string", required: true, description: "Heading text." },
      OPTIONS_PARAM,
    ],
    example: 'subheadline({ text: "Yang lebih penting" })',
  },
  {
    name: "paragraph",
    category: "component",
    summary: "Body copy using `theme.typography.body`, coloured `colors.textMuted`.",
    params: [
      { name: "text", type: "string", required: true, description: "Body text." },
      OPTIONS_PARAM,
    ],
    example: 'paragraph({ text: "Yang lebih penting adalah proses bisnis perusahaan." })',
  },
  {
    name: "cta",
    category: "component",
    summary: "Call to action: emphasised accent text.",
    params: [
      { name: "text", type: "string", required: true, description: "Call-to-action text." },
      OPTIONS_PARAM,
    ],
    example: 'cta({ text: "Pahami proses bisnis sebelum memilih software." })',
  },
  {
    name: "badge",
    category: "component",
    summary: "Small pill label that hugs its content.",
    params: [
      { name: "text", type: "string", required: true, description: "Label text." },
      {
        name: "tone",
        type: '"accent" | "muted"',
        description: "Colour of the label text.",
        default: '"accent"',
      },
      OPTIONS_PARAM,
    ],
    example: 'badge({ text: "Tips" })',
  },
  {
    name: "divider",
    category: "component",
    summary: "Full-width one-pixel rule in `colors.border`.",
    params: [OPTIONS_PARAM],
    example: "divider()",
  },
  {
    name: "card",
    category: "component",
    summary:
      "Surface container with a title and/or bulleted items. Fills the parent width and hugs its height.",
    params: [
      { name: "title", type: "string", description: "Optional heading inside the card." },
      { name: "items", type: "string[]", description: "Optional list." },
      {
        name: "numbered",
        type: "boolean",
        description: "Number the items (`1.`) instead of bulleting them.",
        default: "false",
      },
      {
        name: "children",
        type: "DesignNode[]",
        description: "Extra nodes appended after the title and items.",
      },
      OPTIONS_PARAM,
    ],
    example:
      'card({ title: "Sebelum memilih ERP", items: ["Pahami proses bisnis"], numbered: true })',
  },
  {
    name: "quote",
    category: "component",
    summary: "Pull quote: an accent bar beside quoted text, with an optional attribution.",
    params: [
      { name: "text", type: "string", required: true, description: "Quoted text." },
      { name: "author", type: "string", description: "Optional attribution." },
      OPTIONS_PARAM,
    ],
    example: 'quote({ text: "Desain adalah kode.", author: "Tim Produk" })',
  },
  {
    name: "number",
    category: "component",
    summary: "Big statistic with an optional caption underneath.",
    params: [
      { name: "value", type: "string", required: true, description: "The figure to show." },
      { name: "label", type: "string", description: "Optional caption." },
      OPTIONS_PARAM,
    ],
    example: 'number({ value: "1080", label: "lebar kanvas" })',
  },
  {
    name: "comparison",
    category: "component",
    summary: "Two equal-width cards side by side.",
    params: [
      {
        name: "left",
        type: "{ title: string; items?: string[] }",
        required: true,
        description: "Left column.",
      },
      {
        name: "right",
        type: "{ title: string; items?: string[] }",
        required: true,
        description: "Right column.",
      },
      OPTIONS_PARAM,
    ],
    example: 'comparison({ left: { title: "Sebelum" }, right: { title: "Sesudah" } })',
  },
  {
    name: "flow",
    category: "component",
    summary: "Ordered steps, each with a numbered marker.",
    params: [
      { name: "steps", type: "string[]", required: true, description: "Step captions, in order." },
      {
        name: "direction",
        type: '"column" | "row"',
        description: "Stack the steps vertically or lay them side by side.",
        default: '"column"',
      },
      OPTIONS_PARAM,
    ],
    example: 'flow({ steps: ["Tulis konten", "Susun komponen", "Render ke PNG"] })',
  },
  {
    name: "icon",
    category: "component",
    summary: "Square SVG icon scaled to `size`, filled with `colors.accent`.",
    params: [
      { name: "d", type: "string", required: true, description: "SVG path data." },
      { name: "size", type: "number", required: true, description: "Rendered size in pixels." },
      {
        name: "viewBox",
        type: "number",
        description: "Source coordinate space of `d`.",
        default: "24",
      },
      OPTIONS_PARAM,
    ],
    example: 'icon({ d: "M12 2 L22 20 H2 Z", size: 32 })',
  },

  {
    name: "group",
    category: "layout",
    summary: "Generic container. Lays children out with `direction`, `gap`, `align` and `justify`.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example:
      'group([headline({ text: "Hi" })], { fill: "#111C31", padding: 32, radius: 24, width: "fill" })',
  },
  {
    name: "stack",
    category: "layout",
    summary: "Vertical stack — `group` with `direction: \"column\"`.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "stack([headline({ text: \"A\" }), paragraph({ text: \"B\" })], { gap: 24 })",
  },
  {
    name: "row",
    category: "layout",
    summary: "Horizontal row — `group` with `direction: \"row\"`.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "row([card({ title: \"A\" }), card({ title: \"B\" })], { gap: 24, align: \"stretch\" })",
  },
  {
    name: "grid",
    category: "layout",
    summary: "Row-major auto-flow grid with equal-width columns.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Cell contents." },
      { name: "columns", type: "number", required: true, description: "Number of equal columns." },
      OPTIONS_PARAM,
    ],
    example: "grid([number({ value: \"1\" }), number({ value: \"2\" })], { columns: 2, gap: 16 })",
  },
  {
    name: "center",
    category: "layout",
    summary: "Center children on both axes inside a container that fills its parent.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: 'center([headline({ text: "Hi" })])',
  },
  {
    name: "alignLeft",
    category: "layout",
    summary: "Left-align children across a full-width container.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "alignLeft([paragraph({ text: \"Left\" })])",
  },
  {
    name: "alignRight",
    category: "layout",
    summary: "Right-align children across a full-width container.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "alignRight([cta({ text: \"Go\" })])",
  },
  {
    name: "alignTop",
    category: "layout",
    summary: "Push children to the top of a full-height container.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "alignTop([headline({ text: \"Top\" })])",
  },
  {
    name: "alignBottom",
    category: "layout",
    summary: "Push children to the bottom of a full-height container.",
    params: [
      { name: "children", type: "DesignNode[]", required: true, description: "Child nodes." },
      OPTIONS_PARAM,
    ],
    example: "alignBottom([cta({ text: \"Bottom\" })])",
  },

  {
    name: "educationalPost",
    category: "preset",
    summary:
      "Page template: optional badge, headline, optional intro, a points card and an optional takeaway.",
    params: [
      { name: "title", type: "string", required: true, description: "Headline." },
      { name: "points", type: "string[]", required: true, description: "Bulleted points." },
      { name: "badge", type: "string", description: "Optional eyebrow label." },
      { name: "intro", type: "string", description: "Optional supporting sentence." },
      { name: "pointsTitle", type: "string", description: "Optional heading for the points card." },
      { name: "takeaway", type: "string", description: "Optional closing call to action." },
      OPTIONS_PARAM,
    ],
    example:
      'educationalPost({ title: "ERP bukan sekadar harga", points: ["Pahami proses bisnis"], takeaway: "Mulai dari proses." })',
  },
  {
    name: "comparisonPost",
    category: "preset",
    summary: "Page template: headline, optional intro, a two-column comparison and an optional takeaway.",
    params: [
      { name: "title", type: "string", required: true, description: "Headline." },
      { name: "left", type: "ComparisonColumn", required: true, description: "Left column." },
      { name: "right", type: "ComparisonColumn", required: true, description: "Right column." },
      { name: "intro", type: "string", description: "Optional supporting sentence." },
      { name: "takeaway", type: "string", description: "Optional closing call to action." },
      OPTIONS_PARAM,
    ],
    example:
      'comparisonPost({ title: "Sebelum vs sesudah", left: { title: "Sebelum" }, right: { title: "Sesudah" } })',
  },
  {
    name: "listPost",
    category: "preset",
    summary: "Page template: headline, optional intro, a numbered list card and an optional takeaway.",
    params: [
      { name: "title", type: "string", required: true, description: "Headline." },
      { name: "items", type: "string[]", required: true, description: "Numbered items." },
      { name: "intro", type: "string", description: "Optional supporting sentence." },
      { name: "listTitle", type: "string", description: "Optional heading for the list card." },
      { name: "takeaway", type: "string", description: "Optional closing call to action." },
      OPTIONS_PARAM,
    ],
    example: 'listPost({ title: "3 tanda ERP perlu diganti", items: ["Data terpisah"] })',
  },
  {
    name: "processPost",
    category: "preset",
    summary: "Page template: headline, optional intro, a numbered flow and an optional takeaway.",
    params: [
      { name: "title", type: "string", required: true, description: "Headline." },
      { name: "steps", type: "string[]", required: true, description: "Step captions, in order." },
      { name: "intro", type: "string", description: "Optional supporting sentence." },
      {
        name: "direction",
        type: '"column" | "row"',
        description: "Stack the steps vertically or lay them side by side.",
        default: '"column"',
      },
      { name: "takeaway", type: "string", description: "Optional closing call to action." },
      OPTIONS_PARAM,
    ],
    example: 'processPost({ title: "Cara memulai", steps: ["Petakan proses", "Tentukan kebutuhan"] })',
  },
  {
    name: "quotePost",
    category: "preset",
    summary: "Page template: optional headline, a pull quote and an optional takeaway.",
    params: [
      { name: "quote", type: "string", required: true, description: "Quoted text." },
      { name: "author", type: "string", description: "Optional attribution." },
      { name: "title", type: "string", description: "Optional headline above the quote." },
      { name: "takeaway", type: "string", description: "Optional closing call to action." },
      OPTIONS_PARAM,
    ],
    example: 'quotePost({ quote: "Desain adalah kode.", author: "Tim Produk" })',
  },
];

const CATEGORY_TITLES: Record<CatalogCategory, string> = {
  component: "Components",
  layout: "Layout",
  preset: "Presets",
};

const CATEGORY_ORDER: CatalogCategory[] = ["component", "layout", "preset"];

export function findEntry(name: string): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.name === name);
}

function requiredParams(entry: CatalogEntry): CatalogParam[] {
  return entry.params.filter((param) => param.required);
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

/** Index listing: one line per entry, for `social components`. */
export function renderCatalogIndex(): string {
  const lines: string[] = [];
  for (const category of CATEGORY_ORDER) {
    const entries = CATALOG.filter((entry) => entry.category === category);
    if (entries.length === 0) continue;
    lines.push(`${CATEGORY_TITLES[category]}:`);
    for (const entry of entries) {
      const required = requiredParams(entry).map((param) => param.name);
      const suffix = required.length > 0 ? `  (requires: ${required.join(", ")})` : "";
      lines.push(`  ${entry.name} — ${entry.summary}${suffix}`);
    }
    lines.push("");
  }
  lines.push("Run `social components <name>` for params and an example, or `--json` for machines.");
  return lines.join("\n") + "\n";
}

/** Detail view for a single entry, for `social components <name>`. */
export function renderCatalogEntry(entry: CatalogEntry): string {
  const lines: string[] = [`${entry.name} (${entry.category}) — ${entry.summary}`, ""];
  if (entry.params.length > 0) {
    lines.push("Params:");
    for (const param of entry.params) {
      const required = param.required ? "required" : "optional";
      const fallback = param.default ? ` default: ${param.default};` : "";
      lines.push(`  ${param.name}  ${param.type}  (${required};${fallback} ${param.description})`);
    }
    lines.push("");
  }
  lines.push("Example:", `  ${entry.example}`);
  return lines.join("\n") + "\n";
}

export function renderCatalogJson(): string {
  return JSON.stringify(CATALOG, null, 2) + "\n";
}

/** Markdown reference written to `docs/COMPONENTS.md` by `npm run docs`. */
export function renderCatalogMarkdown(): string {
  const lines: string[] = [
    "# Component catalog",
    "",
    "> Generated from `src/components/catalog.ts` by `npm run docs`. Do not edit by hand.",
    "",
    "Every component and layout helper also accepts the shared `NodeOptions` overrides (`fontSize`,",
    "`color`, `width`, `grow`, `padding`, `margin`, …) merged last, so any theme-derived default can be",
    "overridden per use.",
    "",
  ];

  for (const category of CATEGORY_ORDER) {
    const entries = CATALOG.filter((entry) => entry.category === category);
    if (entries.length === 0) continue;

    lines.push(`## ${CATEGORY_TITLES[category]}`, "");
    for (const entry of entries) {
      lines.push(`### \`${entry.name}\``, "", entry.summary, "");

      if (entry.params.length > 0) {
        lines.push("| Param | Type | Required | Description |", "|---|---|---|---|");
        for (const param of entry.params) {
          const fallback = param.default ? ` Default: \`${escapeCell(param.default)}\`.` : "";
          lines.push(
            `| \`${param.name}\` | \`${escapeCell(param.type)}\` | ${param.required ? "yes" : "no"} | ` +
              `${escapeCell(param.description)}${fallback} |`,
          );
        }
        lines.push("");
      }

      lines.push("```ts", entry.example, "```", "");
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
