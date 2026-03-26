# Little Joy Tracker UI Design Guidelines

## 1. Purpose

This document captures the UI design rules worth learning from and reusing in `Little Joy Tracker`.
It is not a generic design theory note. It is a product-specific guide derived from the current app shell, visual tokens, and mobile interaction style already present in the project.

The goal is to keep future screens visually consistent, emotionally coherent, and easy to implement.

## 2. Product Visual Positioning

### Core Mood

- Warm
- Gentle
- Light-filled
- Private
- Feminine but not childish
- Healing without becoming vague

### Brand Personality

The interface should feel like a handwritten memory box translated into a modern mobile product.
It should not feel corporate, cold, hyper-minimal, or productivity-driven.
It should communicate: "this is a safe place for small moments."

### Experience Keywords

- Soft sunlight
- Cream paper
- Apricot glow
- Rounded keepsake cards
- Delicate structure
- Quiet emotional warmth

## 3. High-Level Design Principles

### 3.1 Fast Emotional Capture

The first screen should lower emotional friction.
Users should feel they can record a moment immediately, before the feeling fades.

Design implication:

- Keep the main action visible
- Reduce visual clutter above the fold
- Make the "record" area feel welcoming, not procedural

### 3.2 Soft Structure, Not Loose Structure

The product should look gentle, but the layout must still be disciplined.
Use clear spacing, alignment, and hierarchy so the UI feels calm instead of messy.

Design implication:

- Use strong visual grouping
- Use only a few tokenized radii and spacing steps
- Keep card edges, chips, and action bars consistent

### 3.3 Memory First, Dashboard Second

The product is not a metrics dashboard.
Even AI summaries should feel reflective, not analytical in a cold sense.

Design implication:

- Prefer narrative headings over technical labels
- Prefer warm section transitions over hard dividers
- Keep data blocks emotionally readable

### 3.4 Mobile-First Always

This product is designed as a PWA with iPhone-like usage patterns.
Desktop can exist, but mobile is the source of truth.

Design implication:

- Thumb-friendly controls
- Strong bottom navigation
- One-screen primary intent
- Avoid dense two-column information layouts

## 4. Visual System

### 4.1 Color System

Current project tokens already define the right direction.
These should remain the primary palette unless a major brand refresh happens.

#### Base Tokens

- `--background`: `#fefccf`
- `--foreground`: `#1d1d03`
- `--surface`: `#fefccf`
- `--surface-soft`: `#f8f6c9`
- `--surface-strong`: `#f2f0c4`
- `--panel`: `#ffffff`
- `--primary`: `#9b4500`
- `--primary-soft`: `#ff8c42`
- `--primary-wash`: `#ffdbc9`
- `--secondary`: `#006e21`
- `--secondary-soft`: `#96f996`
- `--tertiary`: `#864e5a`
- `--muted`: `#564338`
- `--outline`: `#ddc1b3`
- `--outline-strong`: `#897266`

#### Color Roles

- Backgrounds use cream and pale yellow, not pure white
- Primary actions use warm orange, not blue or purple
- Text uses deep olive-brown instead of pure black
- Success or positive signals can use fresh green as a secondary accent
- Emotional or reflective accents can use muted rose-brown

#### Color Rules

- Do not introduce saturated neon colors
- Do not switch core CTAs to blue
- Do not use large dark blocks unless a specific storytelling surface demands it
- Do not let secondary accent colors compete with orange

### 4.2 Gradients and Atmosphere

Flat white backgrounds should be avoided in major shells.
The current direction uses layered gradients and subtle radial warmth well.

Use:

- radial warm glows near the top
- pale cream to soft yellow vertical gradients
- very subtle rose or brown tinting at the edges

Avoid:

- loud mesh gradients
- purple-pink startup gradients
- glossy glassmorphism everywhere

### 4.3 Typography

Typography should feel warm, compact, and expressive.
The product works best when display hierarchy uses strong weight and slightly tight tracking.

#### Typography Rules

- Titles can use `font-black` or strong bold weight
- Section headings should feel slightly compressed with negative tracking
- Supporting copy should stay readable and soft
- Body text should prioritize warmth and comfort over strict neutrality

#### Hierarchy Pattern

- App title: compact, bold, memorable
- Day grouping headings: large, strong, slightly editorial
- Card title: bold and concise
- Supporting reason text: softer, often italic
- Metadata: small, muted, right-aligned when appropriate

#### Avoid

- giant hero typography with no supporting rhythm
- overly technical UI copy styling
- weak hierarchy where all text sizes feel similar

### 4.4 Shape Language

Rounded geometry is core to the product identity.
Corners should feel soft enough to be comforting, but not toy-like.

#### Radius Tokens

- `--radius-shell`: `2.6rem`
- `--radius-card`: `1.25rem`
- `--radius-panel`: `1rem`
- `--radius-control`: `1.1rem`
- pill radius: `9999px`

#### Shape Rules

- Shell containers should feel almost device-like
- Cards should feel like keepsakes or memory tiles
- Controls should lean pill-shaped for friendliness
- Avoid sharp-cornered surfaces unless used intentionally for contrast

### 4.5 Shadow and Depth

Depth is present, but restrained.
The design uses short, soft shadows rather than dramatic floating layers.

#### Depth Rules

- Prefer low-spread, low-opacity warm shadows
- Use borders plus blur for cards, not shadow alone
- Keep top bars and panels airy rather than heavy
- Use stronger depth only for primary action emphasis

#### Avoid

- dark drop shadows
- exaggerated z-axis stacking
- floating cards that look detached from the rest of the product

## 5. Layout Rules

### 5.1 App Shell

Every main screen should feel like it belongs to the same mobile object.

The current shell pattern is correct:

- top bar
- scrollable content area
- persistent bottom nav
- warm atmospheric background

This structure should remain stable across tabs unless a screen has a strong reason to diverge.

### 5.2 Spacing Rhythm

Use a compact but breathable rhythm.
The product should not feel sparse, yet it should never feel crowded.

Recommended spacing behavior:

- tight spacing inside chips and metadata rows
- medium spacing between content blocks inside a card
- larger spacing between major sections or grouped days

Practical rule:

- if two elements belong to the same thought, keep them visually close
- if two blocks represent different tasks, separate them clearly

### 5.3 Alignment

Alignment should be stable and predictable.
The app works best when cards, headings, filters, and buttons visually snap to a shared left edge.

Use:

- left-aligned textual hierarchy
- right-aligned timestamps
- centered empty states

Avoid:

- random center alignment in content views
- decorative asymmetry that hurts readability

## 6. Component Guidelines

### 6.1 Top Bar

The top bar should feel like a warm navigation handle, not a productivity toolbar.

Rules:

- title must stay short and bold
- icon containers should be circular and softly tinted
- button treatments should remain pill-shaped
- avoid overcrowding the right side with too many actions

### 6.2 Bottom Navigation

Bottom navigation is a major anchor for the app.
It should feel soft, stable, and always reachable.

Rules:

- active state should be obvious through tint and fill
- labels should be human, not technical
- iconography should remain simple and lightweight
- nav should feel like part of the shell, not a separate app inside the app

### 6.3 Cards

Cards are the product's primary storytelling unit.
They should always contain clear hierarchy:

- owner or tag
- title
- short content preview
- optional emotional note
- timestamp

Rules:

- cards must remain tappable and visually complete even without images
- image blocks should not overpower text
- card density should support quick scanning in a timeline

### 6.4 Input Surfaces

Input areas should feel calm and inviting.
Users are often recording emotionally light, small moments, so the UI cannot feel bureaucratic.

Rules:

- placeholders should be gentle and directional
- textareas should have enough air to encourage writing
- image upload zones should feel generous and reassuring
- save action must stay visible and unambiguous

### 6.5 Filters and Chips

Filters are used often, so they must feel lightweight.

Rules:

- selected state should use warm filled treatment
- unselected state should remain quiet but legible
- chip labels should stay short
- avoid mixing too many filter styles on the same screen

### 6.6 Empty States

Empty states should feel companion-like.
They should invite recording, not shame the user for missing data.

Rules:

- pair one visual cue with one warm sentence
- optional secondary line can be slightly poetic
- avoid technical explanations unless something is broken

### 6.7 AI Summary Panels

AI output must feel insightful, not robotic.

Rules:

- organize by emotional meaning, not raw model output
- make each block scannable in under a few seconds
- use soft section cards inside the larger panel
- keep labels human and reflective

Avoid:

- dumping long paragraphs
- presenting AI as an authority figure
- cold charts unless they truly improve understanding

## 7. Motion and State Changes

Animation should support emotional softness and orientation.

### Motion Principles

- short, smooth transitions
- gentle lift on hover or tap-capable surfaces
- quiet loading states
- no flashy spring behavior unless it adds meaning

### Recommended Usage

- card hover or press: slight upward movement
- save success: fast but soft confirmation
- loading: restrained spin or glow
- section entry: subtle fade and rise

### Avoid

- bouncing UI everywhere
- long easing curves that slow down recording
- decorative motion that distracts from memory capture

## 8. Content and Microcopy

The current product works because the copy is warm and slightly intimate.
Future UI text should follow that tone.

### Voice Rules

- gentle
- observant
- encouraging
- emotionally literate
- never preachy

### Writing Rules

- prefer short Chinese phrases over long explanatory UI labels
- use action-oriented button text
- use supportive empty-state language
- let AI-related text sound like reflection, not diagnosis

### Avoid

- corporate product language
- technical backend wording on user surfaces
- over-cute phrasing that weakens trust

## 9. Imagery Guidelines

Imagery should support quiet beauty.
It is part of the emotional interface, not decoration.

### Desired Image Traits

- soft tones
- minimal composition
- warm or misty light
- peaceful texture
- intimate but not overly posed

### Avoid

- loud stock-photo energy
- cluttered scenes
- harsh contrast
- exaggerated lifestyle glamour

## 10. Responsive and PWA Rules

This app should remain strongest on mobile.

### Mobile Rules

- primary actions must remain reachable with one hand
- long forms must still preserve the save affordance
- content density must support quick scanning
- safe areas must be respected for top and bottom bars

### Tablet/Desktop Rules

- preserve the mobile emotional structure
- allow more breathing room, not entirely new layout logic
- avoid turning the app into a dashboard just because horizontal space exists

## 11. Accessibility Rules

This product is soft in tone, but accessibility cannot be soft in rigor.

Rules:

- maintain sufficient text contrast against cream surfaces
- preserve clear focus states
- avoid relying on color alone for selection and status
- keep tap targets comfortably large
- use clear labels for buttons and media inputs

## 12. Anti-Patterns To Avoid

- Generic SaaS blue-and-white redesigns
- Purple-heavy AI branding
- Dark mode by default without a product-level reason
- Over-glossy UI with too much blur and too little structure
- Dense tables and control-heavy admin patterns
- Emotionally flat labels such as "Submit", "Item", "Data", "Entry" when warmer language exists

## 13. Learning Checklist For Future Design Work

When designing a new screen, review this checklist:

1. Does it still feel warm, private, and mobile-first?
2. Does the shell match the existing app rhythm?
3. Are the colors using the current token system instead of ad hoc values?
4. Is the hierarchy strong enough to scan in under three seconds?
5. Are the primary actions obvious without being aggressive?
6. Does the copy sound like a thoughtful companion rather than a tool manual?
7. If the screen were shown without brand name, would it still feel like Little Joy Tracker?

## 14. Implementation Mapping

These files currently express the design language and should be treated as reference anchors:

- `src/app/globals.css`
- `src/components/AppTopBar.tsx`
- `src/components/QuickEntry.tsx`
- `src/components/TimelineView.tsx`
- `src/components/EventDetailPanel.tsx`
- `src/components/ProfileView.tsx`

When expanding the UI, prefer extending these patterns instead of inventing a parallel style system.

## 15. Recommended Next Step

If this guideline will be used actively, the next high-value follow-up is to turn it into a lightweight implementation reference with:

- token table by usage
- component do/don't examples
- page template patterns
- copywriting tone examples

That would make the document useful not only for learning, but also for faster future execution.
