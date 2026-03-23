# Design System Strategy: The Radiant Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Radiant Sanctuary."** 

This system rejects the cold, clinical efficiency of standard utility apps in favor of a digital environment that feels like a sun-drenched morning. We move beyond "templates" by embracing **Intentional Asymmetry** and **Tonal Depth**. Instead of a rigid grid, think of the interface as a series of soft, organic layers that breathe. We use high-contrast typography scales—pairing expansive, airy display type with compact, functional body text—to create an editorial feel that honors the "little joys" being tracked. 

The goal is a "Healing Minimalist" aesthetic: high-end, peaceful, and profoundly intentional.

---

## 2. Colors
Our palette is rooted in warmth. We avoid pure blacks and harsh grays, opting instead for "Glow-Based" neutrals and soft, nature-inspired accents.

### The Palette
- **The Glow (Surface):** `#fefccf` (Surface/Background). This soft cream is the heartbeat of the app.
- **Sunset Orange (Primary):** `#9b4500` (Core Action) with `#ff8c42` (Container). Used for moments of energy and achievement.
- **Healing Green (Secondary):** `#006e21` (Core Action) with `#96f996` (Container). Used for growth, health, and calm.
- **Cherry Blossom (Tertiary):** `#864e5a` (Core Action) with `#dc98a6` (Container). Used for reflection and soft emotional cues.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** To define sections, use:
- **Background Color Shifts:** Place a `surface-container-low` card against a `surface` background.
- **Tonal Transitions:** Use a subtle shift from `surface` to `surface-bright` to imply a change in context.
- **Negative Space:** Use the Spacing Scale (specifically `8` or `10`) to let content sit independently.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine, handmade paper.
- **Level 0 (Base):** `surface` (#fefccf)
- **Level 1 (Sectioning):** `surface-container-low` (#f8f6c9)
- **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) – This creates a "lifted" feel through pure brightness.

### The "Glass & Gradient" Rule
For floating elements (like Bottom Navigation or Modals), use **Glassmorphism**. Combine `surface-container-lowest` at 70% opacity with a `backdrop-blur` of 20px. 
**Signature Textures:** Apply a linear gradient from `primary` to `primary-container` on high-value CTAs to give them a "lit-from-within" soul.

---

## 3. Typography
We utilize a pairing of **Manrope** (for character and warmth) and **Inter** (for high-legibility utility).

- **Display & Headlines (Manrope):** These should feel expansive. Use `display-lg` (3.5rem) for daily summaries. The wide tracking of Manrope communicates peace and high-end curation.
- **Titles & Body (Inter):** Use `title-md` for card headers and `body-md` for descriptions. Inter provides a clean, "iOS-native" technical precision that balances the organic warmth of the colors.
- **Hierarchy Logic:** Use extreme scale differences. A `display-sm` headline next to a `label-sm` date creates a sophisticated, editorial contrast that feels designed, not just "inputted."

---

## 4. Elevation & Depth
We convey importance through **Tonal Layering** rather than structural geometry.

- **The Layering Principle:** To highlight a "Joy Entry," place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#f2f0c4) background. The contrast in "warmth" creates the elevation.
- **Ambient Shadows:** Shadows are reserved only for elements that truly "hover" (e.g., Fab Buttons, Modals). Use `shadow-md` but tint the shadow color using the `on-surface` (#1d1d03) at 6% opacity. This mimics natural light falling on a cream surface.
- **The Ghost Border:** If a form field requires a boundary, use the `outline-variant` token at 15% opacity. It should be felt, not seen.
- **Glassmorphism:** Use `backdrop-blur` on the top Navigation Bar to allow the warm background colors to bleed through as the user scrolls, maintaining a sense of place.

---

## 5. Components

### Buttons
- **Primary:** `primary` background with `on-primary` text. Use `rounded-xl` (3rem) for a pill shape. Add a subtle `primary-container` inner glow.
- **Secondary:** `secondary-container` background with `on-secondary-container` text. No border.

### Cards & Lists (The "No-Divider" Rule)
- **Cards:** Forbid the use of divider lines. Separate content using `spacing-4` (1.4rem) or by nesting a `surface-container-high` element inside a `surface-container-low` card.
- **List Items:** Use `surface-container-lowest` cards with a `shadow-sm` and a `rounded-md` (1.5rem) corner.

### Joy-Specific Components
- **The "Joy-Halo" Input:** A large text area for journaling that uses a `surface-bright` background and a soft `primary-fixed` ambient glow when focused.
- **Micro-Moment Chips:** Use `secondary-fixed` with `on-secondary-fixed` text for "healing" tags. The extreme roundedness (`rounded-full`) makes them feel like smoothed river stones.
- **Glass Bottom Bar:** A floating navigation bar using `surface-container-lowest` at 80% opacity with a heavy blur. Icons should use `on-surface-variant` when inactive and `primary` when active.

---

## 6. Do’s and Don’ts

### Do:
- **Use "White Space" as a Color:** Treat empty space as an active design element to reduce cognitive load.
- **Embrace Asymmetry:** Align a headline to the left and a supporting "Joy Counter" to the far right with significant vertical offset.
- **Softness First:** Use `rounded-2xl` as the standard for all main containers to maintain the "healing" vibe.

### Don't:
- **Don't use pure Gray:** Never use `#808080`. Use `on-surface-variant` (#564338) which has a warm brown undertone.
- **Don't use 1px lines:** Do not use dividers to separate list items. Use spacing or tonal shifts.
- **Don't crowd the edges:** Maintain a minimum `spacing-6` (2rem) margin from the screen edge to keep the "Sanctuary" feeling open.
- **Don't use "Vibrant" colors for text:** Keep text on `on-surface` or `on-surface-variant` to ensure the "Peaceful" vibe isn't broken by neon-colored labels.