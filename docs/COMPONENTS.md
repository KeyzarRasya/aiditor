# Component catalog

> Generated from `src/components/catalog.ts` by `npm run docs`. Do not edit by hand.

Every component and layout helper also accepts the shared `NodeOptions` overrides (`fontSize`,
`color`, `width`, `grow`, `padding`, `margin`, …) merged last, so any theme-derived default can be
overridden per use.

## Components

### `headline`

Main heading, using `theme.typography.heading` and `colors.text`.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Heading text. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
headline({ text: "ERP yang mahal belum tentu ERP yang paling cocok." })
```

### `subheadline`

Secondary heading, sized between the heading and body tokens.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Heading text. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
subheadline({ text: "Yang lebih penting" })
```

### `paragraph`

Body copy using `theme.typography.body`, coloured `colors.textMuted`.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Body text. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
paragraph({ text: "Yang lebih penting adalah proses bisnis perusahaan." })
```

### `cta`

Call to action: emphasised accent text.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Call-to-action text. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
cta({ text: "Pahami proses bisnis sebelum memilih software." })
```

### `badge`

Small pill label that hugs its content.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Label text. |
| `tone` | `"accent" \| "muted"` | no | Colour of the label text. Default: `"accent"`. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
badge({ text: "Tips" })
```

### `divider`

Full-width one-pixel rule in `colors.border`.

| Param | Type | Required | Description |
|---|---|---|---|
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
divider()
```

### `card`

Surface container with a title and/or bulleted items. Fills the parent width and hugs its height.

| Param | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | no | Optional heading inside the card. |
| `items` | `string[]` | no | Optional list. |
| `numbered` | `boolean` | no | Number the items (`1.`) instead of bulleting them. Default: `false`. |
| `children` | `DesignNode[]` | no | Extra nodes appended after the title and items. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
card({ title: "Sebelum memilih ERP", items: ["Pahami proses bisnis"], numbered: true })
```

### `quote`

Pull quote: an accent bar beside quoted text, with an optional attribution.

| Param | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | yes | Quoted text. |
| `author` | `string` | no | Optional attribution. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
quote({ text: "Desain adalah kode.", author: "Tim Produk" })
```

### `number`

Big statistic with an optional caption underneath.

| Param | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | yes | The figure to show. |
| `label` | `string` | no | Optional caption. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
number({ value: "1080", label: "lebar kanvas" })
```

### `comparison`

Two equal-width cards side by side.

| Param | Type | Required | Description |
|---|---|---|---|
| `left` | `{ title: string; items?: string[] }` | yes | Left column. |
| `right` | `{ title: string; items?: string[] }` | yes | Right column. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
comparison({ left: { title: "Sebelum" }, right: { title: "Sesudah" } })
```

### `flow`

Ordered steps, each with a numbered marker.

| Param | Type | Required | Description |
|---|---|---|---|
| `steps` | `string[]` | yes | Step captions, in order. |
| `direction` | `"column" \| "row"` | no | Stack the steps vertically or lay them side by side. Default: `"column"`. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
flow({ steps: ["Tulis konten", "Susun komponen", "Render ke PNG"] })
```

### `icon`

Square SVG icon scaled to `size`, filled with `colors.accent`.

| Param | Type | Required | Description |
|---|---|---|---|
| `d` | `string` | yes | SVG path data. |
| `size` | `number` | yes | Rendered size in pixels. |
| `viewBox` | `number` | no | Source coordinate space of `d`. Default: `24`. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
icon({ d: "M12 2 L22 20 H2 Z", size: 32 })
```

## Layout

### `group`

Generic container. Lays children out with `direction`, `gap`, `align` and `justify`.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
group([headline({ text: "Hi" })], { fill: "#111C31", padding: 32, radius: 24, width: "fill" })
```

### `stack`

Vertical stack — `group` with `direction: "column"`.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
stack([headline({ text: "A" }), paragraph({ text: "B" })], { gap: 24 })
```

### `row`

Horizontal row — `group` with `direction: "row"`.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
row([card({ title: "A" }), card({ title: "B" })], { gap: 24, align: "stretch" })
```

### `grid`

Row-major auto-flow grid with equal-width columns.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Cell contents. |
| `columns` | `number` | yes | Number of equal columns. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
grid([number({ value: "1" }), number({ value: "2" })], { columns: 2, gap: 16 })
```

### `center`

Center children on both axes inside a container that fills its parent.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
center([headline({ text: "Hi" })])
```

### `alignLeft`

Left-align children across a full-width container.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
alignLeft([paragraph({ text: "Left" })])
```

### `alignRight`

Right-align children across a full-width container.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
alignRight([cta({ text: "Go" })])
```

### `alignTop`

Push children to the top of a full-height container.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
alignTop([headline({ text: "Top" })])
```

### `alignBottom`

Push children to the bottom of a full-height container.

| Param | Type | Required | Description |
|---|---|---|---|
| `children` | `DesignNode[]` | yes | Child nodes. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
alignBottom([cta({ text: "Bottom" })])
```

## Presets

### `educationalPost`

Page template: optional badge, headline, optional intro, a points card and an optional takeaway.

| Param | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Headline. |
| `points` | `string[]` | yes | Bulleted points. |
| `badge` | `string` | no | Optional eyebrow label. |
| `intro` | `string` | no | Optional supporting sentence. |
| `pointsTitle` | `string` | no | Optional heading for the points card. |
| `takeaway` | `string` | no | Optional closing call to action. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
educationalPost({ title: "ERP bukan sekadar harga", points: ["Pahami proses bisnis"], takeaway: "Mulai dari proses." })
```

### `comparisonPost`

Page template: headline, optional intro, a two-column comparison and an optional takeaway.

| Param | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Headline. |
| `left` | `ComparisonColumn` | yes | Left column. |
| `right` | `ComparisonColumn` | yes | Right column. |
| `intro` | `string` | no | Optional supporting sentence. |
| `takeaway` | `string` | no | Optional closing call to action. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
comparisonPost({ title: "Sebelum vs sesudah", left: { title: "Sebelum" }, right: { title: "Sesudah" } })
```

### `listPost`

Page template: headline, optional intro, a numbered list card and an optional takeaway.

| Param | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Headline. |
| `items` | `string[]` | yes | Numbered items. |
| `intro` | `string` | no | Optional supporting sentence. |
| `listTitle` | `string` | no | Optional heading for the list card. |
| `takeaway` | `string` | no | Optional closing call to action. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
listPost({ title: "3 tanda ERP perlu diganti", items: ["Data terpisah"] })
```

### `processPost`

Page template: headline, optional intro, a numbered flow and an optional takeaway.

| Param | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Headline. |
| `steps` | `string[]` | yes | Step captions, in order. |
| `intro` | `string` | no | Optional supporting sentence. |
| `direction` | `"column" \| "row"` | no | Stack the steps vertically or lay them side by side. Default: `"column"`. |
| `takeaway` | `string` | no | Optional closing call to action. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
processPost({ title: "Cara memulai", steps: ["Petakan proses", "Tentukan kebutuhan"] })
```

### `quotePost`

Page template: optional headline, a pull quote and an optional takeaway.

| Param | Type | Required | Description |
|---|---|---|---|
| `quote` | `string` | yes | Quoted text. |
| `author` | `string` | no | Optional attribution. |
| `title` | `string` | no | Optional headline above the quote. |
| `takeaway` | `string` | no | Optional closing call to action. |
| `...options` | `NodeOptions` | no | Style/layout overrides (fontSize, color, width, grow, padding, margin, …) merged last, so any theme default can be overridden. |

```ts
quotePost({ quote: "Desain adalah kode.", author: "Tim Produk" })
```
