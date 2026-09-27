# Product Requirements Document (PRD)
## Social Image as Code

> **Version:** 1.0  
> **Status:** Draft  
> **Target:** MVP  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals](#3-goals)
4. [Non-Goals](#4-non-goals)
5. [Target User](#5-target-user)
6. [Core Concept](#6-core-concept)
7. [Architecture](#7-architecture)
8. [Design API](#8-design-api)
9. [Layout System](#9-layout-system)
10. [Component System](#10-component-system)
11. [Theme System](#11-theme-system)
12. [Supported Formats](#12-supported-formats)
13. [CLI Interface](#13-cli-interface)
14. [AI Agent Integration](#14-ai-agent-integration)
15. [Technology Stack](#15-technology-stack)
16. [MVP Phases](#16-mvp-phases)
17. [Success Criteria](#17-success-criteria)
18. [Future Features](#18-future-features)
19. [Project Philosophy](#19-project-philosophy)

---

## 1. Overview

**Social Image as Code** is a developer-focused tool for creating social media graphics programmatically. The core idea is to treat social media graphics like software — instead of manually designing posts in Canva or Figma, developers write TypeScript code that describes visual layouts, which AI coding agents (e.g., OpenCode) can create, modify, and iterate on.

**Workflow:**

```
Content Idea → OpenCode → TypeScript Design → Design System → SVG → PNG → Social Media
```

**Target content:** Personal social media posts, especially educational, technology, business, ERP, and software-related content.

**This is not a Canva replacement.** It is a small, developer-friendly image generation system optimized for AI coding agents.

---

## 2. Problem Statement

Creating social media graphics manually is slow and repetitive. A typical workflow in Canva/Figma involves 10+ steps — opening a template, adding text, adjusting spacing, fixing typography, exporting, noticing errors, and repeating.

This becomes especially inefficient when producing many educational posts that require a consistent visual identity.

**AI image generators are not suitable** for graphics that require:

- Precise typography and exact text
- Predictable, consistent layout
- Reusable components and branding
- Deterministic positioning
- Fast iteration and version control

**The missing piece:** A visual system that lets an AI coding agent modify images through code.

---

## 3. Goals

### Primary Goals

| # | Goal |
|---|------|
| 1 | Generate high-quality social media graphics through code |
| 2 | Be easy for OpenCode and other AI coding agents to use |
| 3 | Provide reusable design components |
| 4 | Produce deterministic output |
| 5 | Make designs editable through code |
| 6 | Support consistent branding via a theme system |
| 7 | Export social-media-ready PNG images |
| 8 | Make visual iteration fast |

### Secondary Goals

- Multiple social media dimensions
- Reusable templates
- Diagrams, comparison graphics, process flows
- Educational infographics
- Local images/assets and custom fonts
- SVG and PNG output
- Carousel generation

---

## 4. Non-Goals

The project should **not** become any of the following (especially in the MVP):

- A Canva clone or drag-and-drop editor
- A browser-based or cloud design editor
- A template marketplace or social media management platform
- An AI image generation platform
- A photo or video editor
- A real-time collaborative editor
- A SaaS authentication or cloud storage platform

> **Principle:** Keep the project small and focused.

---

## 5. Target User

**Primary user:**

> A developer who wants to create social media graphics using code and an AI coding agent.

The first real user is the project creator. The tool optimizes for:

- Developer experience
- OpenCode compatibility
- Fast iteration
- Predictable rendering
- Reusable components
- Code readability

Non-technical user optimization is **not required** during the MVP phase.

---

## 6. Core Concept

The image is **not** treated as an opaque binary file. Instead, it is represented as structured code using semantic elements:

| Element | Description |
|---------|-------------|
| `headline` | Main heading text |
| `paragraph` | Body text content |
| `card` | Container with a title and list |
| `image` | Embedded image block |
| `icon` | Icon element |
| `cta` | Call-to-action text |
| `divider` | Visual separator |
| `comparison` | Side-by-side comparison block |
| `flow` | Step-by-step process flow |
| `badge` | Tag or label element |
| `quote` | Pull quote / statement |
| `number` | Numbered stat or list item |

**Rendering pipeline:**

```
OpenCode
    ↓
TypeScript Source
    ↓
Design API / DSL
    ↓
Internal Design Tree
    ↓
SVG Generator
    ↓
SVG
    ↓
PNG Renderer
    ↓
PNG
```

This makes the design reproducible, version-controlled, editable, composable, deterministic, and AI-friendly.

---

## 7. Architecture

### Why SVG?

SVG is the primary intermediate representation because it provides:

- Precise positioning and vector graphics
- Text rendering, shapes, and paths
- Scalability and inspectability
- Deterministic output

**Preferred approach:**

```
TypeScript → design representation → SVG → PNG
```

Rather than directly manipulating pixels.

### Project Structure

```
social-content/
├── src/
│   ├── posts/
│   │   ├── erp-vs-excel.ts
│   │   ├── inventory-problem.ts
│   │   └── business-process.ts
│   ├── components/
│   │   ├── headline.ts
│   │   ├── card.ts
│   │   ├── comparison.ts
│   │   ├── flow.ts
│   │   └── cta.ts
│   └── theme.ts
├── assets/
├── fonts/
├── dist/
└── social.config.ts
```

Posts, components, themes, assets, and generated output must remain clearly separated.

---

## 8. Design API

### Primitives

```typescript
text(...)
rect(...)
circle(...)
image(...)
group(...)
```

The API hides low-level SVG complexity from both the developer and the AI agent.

### Example Post Definition

```typescript
createPost({
    size: "instagram-square",
    children: [
        headline({
            text: "ERP yang mahal belum tentu ERP yang paling cocok.",
        }),
        paragraph({
            text: "Yang lebih penting adalah apakah ERP tersebut sesuai dengan proses bisnis perusahaan.",
        }),
        card({
            title: "Sebelum memilih ERP",
            items: [
                "Pahami proses bisnis",
                "Identifikasi masalah",
                "Tentukan kebutuhan",
            ],
        }),
        cta({
            text: "Pahami proses bisnis sebelum memilih software.",
        }),
    ],
})
```

The API must be **readable, semantic, composable, strongly typed, and easy for OpenCode to modify**.

---

## 9. Layout System

The layout system provides common positioning operations so that the AI agent does not need to manually calculate coordinates.

### Layout Operations

| Operation | Purpose |
|-----------|---------|
| `center()` | Center element in container |
| `alignLeft()` / `alignRight()` | Horizontal alignment |
| `alignTop()` / `alignBottom()` | Vertical alignment |
| `stack()` | Stack elements vertically or horizontally |
| `grid()` | Arrange elements in a grid |
| `padding()` | Apply inner spacing |
| `gap()` | Apply spacing between elements |
| `spacing()` | General spacing utility |

**Prefer semantic layout:**

```typescript
// ✅ Preferred
center(headline({ text: "Hello" }))
stack([card1, card2], { gap: 16 })

// ❌ Avoid
{ x: 384, y: 172 }
```

---

## 10. Component System

Reusable, high-level semantic components that handle reasonable defaults for font, size, spacing, line height, alignment, and color.

### Available Components

| Component | Description |
|-----------|-------------|
| `Headline` | Large, prominent heading |
| `Subheadline` | Secondary heading |
| `Paragraph` | Body text |
| `Card` | Content container with title and items |
| `Badge` | Tag or label |
| `CTA` | Call-to-action text block |
| `Divider` | Horizontal rule |
| `Image` | Image block |
| `Icon` | SVG icon |
| `Quote` | Pull quote |
| `Number` | Numbered stat or item |
| `Comparison` | Two-column comparison |
| `Flow` | Step-by-step flow diagram |

### Component Usage Example

```typescript
headline({ text: "ERP yang mahal belum tentu ERP yang paling cocok." })
// ✅ Font, size, line height, color, and alignment handled automatically
```

---

## 11. Theme System

A theme controls the overall visual identity across all posts.

### Theme Properties

```typescript
theme.colors.primary
theme.colors.background
theme.colors.text
theme.colors.accent

theme.typography.heading       // font family, weight, size
theme.typography.body

theme.spacing.sm
theme.spacing.md
theme.spacing.lg

theme.borderRadius.sm
theme.borderRadius.md

theme.shadows.card
```

The theme allows the visual identity to change without rewriting every post.

---

## 12. Supported Formats

| Format | Dimensions |
|--------|-----------|
| Instagram Square | 1080 × 1080 px |
| Instagram Portrait | 1080 × 1350 px |
| Instagram Story | 1080 × 1920 px |
| Landscape (OG) | 1200 × 630 px |

Dimensions are configurable via `social.config.ts`.

---

## 13. CLI Interface

### Commands

| Command | Description |
|---------|-------------|
| `social init` | Initialize a new social-image project |
| `social render src/post.ts` | Render a design to PNG |
| `social render src/post.ts --format svg` | Render to SVG |
| `social dev src/post.ts` | Run development watch mode |

### Error Reporting

The CLI must provide clear, actionable errors. Examples:

```
Error: Font "Inter Bold" was not found in ./fonts/
Error: Component "card" requires a "title" prop
Error: Canvas dimensions must be positive integers
```

---

## 14. AI Agent Integration

### Workflow

```
1. User provides a content idea
2. OpenCode reads AGENTS.md and project instructions
3. OpenCode inspects available components and theme
4. OpenCode creates or modifies the TypeScript design
5. OpenCode runs the renderer
6. Image is generated
7. User reviews the output
8. User provides feedback
9. OpenCode modifies the code
10. Image is rendered again
```

**Key principle:**

```
Feedback → Code Change → Render
```

Not: `Feedback → Manual GUI editing`

### AGENTS.md Rules

The project includes an `AGENTS.md` file with rules for OpenCode:

- Use existing components whenever possible
- Prefer semantic components over low-level primitives
- Use the project theme — do not use raw color values
- Maintain safe margins on all sides
- Keep text readable at target resolution
- Avoid unnecessary manual positioning
- Reuse existing layouts
- Render after making changes and inspect the output
- Do not create a new component when an existing one is sufficient
- Keep content and visual structure separate where practical
- Avoid arbitrary magic numbers — use layout abstractions

### AI-Agent Design Principles

| Principle | Description |
|-----------|-------------|
| Semantic components | Use `comparison()`, `card()`, `headline()` over raw `rect()` + `text()` |
| Strong TypeScript types | All component options are strongly typed — no `any` |
| Good defaults | `headline({ text: "Hello" })` renders something visually reasonable out of the box |
| Reusable layouts | Common structures (hero, two-column, numbered list, flow) are reusable |
| Deterministic rendering | Same source → same output, always |
| Clear errors | Errors must be understandable and actionable for an AI agent |

---

## 15. Technology Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript |
| Runtime | Node.js |
| Vector format | SVG |
| Raster export | PNG renderer (e.g., sharp, resvg-js) |
| Fonts | Local font files |
| Testing | Vitest |
| Formatting | Prettier |
| Linting | ESLint |

**Explicit exclusions:**

- FFmpeg — not a core dependency for MVP (may be added later for video/GIF)
- OpenCode is **not** coupled to the renderer; the renderer is independently usable

---

## 16. MVP Phases

### Phase 1 — Basic Renderer

- [ ] Canvas setup
- [ ] Rectangle, circle, line primitives
- [ ] Text rendering
- [ ] Image embedding
- [ ] SVG generation
- [ ] PNG export
- [ ] Custom font support
- [ ] Basic absolute positioning

### Phase 2 — Layout System

- [ ] Alignment (center, left, right, top, bottom)
- [ ] Padding and gap
- [ ] Stack (vertical / horizontal)
- [ ] Grid layout
- [ ] Sizing utilities
- [ ] Basic responsive calculations

### Phase 3 — Components

- [ ] Headline, Subheadline, Paragraph
- [ ] Card, Badge, CTA
- [ ] Quote, Number
- [ ] Comparison, Flow
- [ ] Image block

### Phase 4 — Theme System

- [ ] Color tokens
- [ ] Typography tokens
- [ ] Spacing scale
- [ ] Border radius and shadow tokens
- [ ] Brand configuration file

### Phase 5 — CLI

- [ ] `social init`
- [ ] `social render`
- [ ] `social dev` (watch mode)
- [ ] Config loading
- [ ] Output path management
- [ ] Error reporting

### Phase 6 — AI Agent Optimization

- [ ] `AGENTS.md` with complete rules
- [ ] Strong TypeScript types across all APIs
- [ ] Semantic component documentation
- [ ] Code examples for each component
- [ ] Reusable layout presets
- [ ] AI-friendly error messages
- [ ] Render verification workflow

---

## 17. Success Criteria

### First Milestone

> OpenCode can create a decent 1080 × 1080 educational social media post using TypeScript, and the renderer produces a PNG.

**Minimum visual requirements:**

```
┌─────────────────────────────┐
│                             │
│    ERP yang mahal           │
│    belum tentu cocok.       │
│                             │
│  ┌───────────────────────┐  │
│  │  Yang lebih penting   │  │
│  │  adalah proses bisnis │  │
│  │  perusahaan.          │  │
│  └───────────────────────┘  │
│                             │
│  Pahami proses bisnis       │
│  sebelum memilih software.  │
│                             │
└─────────────────────────────┘
```

Must include: headline, supporting text, card or visual section, CTA.

### Primary Question

> Can this tool make creating social media content faster than manually designing it?

**Target workflow:**

```
Idea → OpenCode → Code → Image → Review → Feedback → Code Change → Image → Publish
```

**Validation example:**

User: *"Move the headline down and make the card slightly wider."*  
OpenCode: modifies TypeScript → renders → produces updated image  
Result: No manual GUI interaction required ✅

---

## 18. Future Features

These are **post-MVP** and should only be considered after the core workflow works.

| Feature | Description |
|---------|-------------|
| Carousel generation | One `post.ts` produces `slide-01.png`, `slide-02.png`, etc. |
| Template system | Reusable templates: educational, comparison, list, process, quote |
| Asset management | Images, icons, logos, illustrations, fonts |
| Automatic layout | System auto-arranges elements based on content length and hierarchy |
| Content-to-design pipeline | `Content Idea → AI → Structured Content → Design Components → PNG` |
| Video / GIF | Using FFmpeg for animated content |
| Multiple theme switching | Quick brand switching across post sets |

---

## 19. Project Philosophy

| Principle | Description |
|-----------|-------------|
| **Code First** | Designs are represented by code, not binary blobs |
| **AI Friendly** | API is designed for coding agents to understand and modify |
| **Deterministic** | Same code always produces the same design |
| **Reusable** | Components work across multiple posts |
| **Simple** | Avoid unnecessary complexity at every layer |
| **Version Controlled** | Designs work naturally with Git |
| **Fast Iteration** | The primary advantage over GUI tools |

### What This Project Is Actually Building

Not an image editor — a **design system controlled through code and AI coding agents**.

```
Semantic Design API
        ↓
  Layout System
        ↓
 Component System
        ↓
   Theme System
        ↓
    Renderer
        ↓
     PNG/SVG
```

### Final Vision

**Instead of:**
```
Open Canva → Drag elements → Adjust layout → Export → Notice mistake → Repeat
```

**The workflow becomes:**
```
Content idea → OpenCode → Design as Code → Render → Review → Modify → Render → Publish
```

> **Treat social media content like software.**

---

*PRD — Social Image as Code — v1.0*
