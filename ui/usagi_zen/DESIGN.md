# Design System Specification: Editorial Neo-Brutalism

## 1. Overview & Creative North Star: "The Tactile Zendo"
This design system rejects the sterile, flat interfaces of typical language apps in favor of **The Tactile Zendo**. Our North Star is a fusion of Neo-Brutalist confidence and Japanese minimalist tranquility. We move beyond "standard" UI by treating the screen as a physical desk—layers of heavy cardstock, intentional ink-strokes, and rhythmic spacing. 

The aesthetic is "Soft Brutalism": the structural honesty of raw lines and heavy shadows tempered by a calming Mint palette and organic roundedness. We break the template through **Intentional Asymmetry**—placing our mascot or key headings slightly off-center to create a sense of wabi-sabi (beauty in imperfection).

---

## 2. Colors & Tonal Architecture
We utilize a sophisticated palette that balances high-contrast utility with environmental softness. 

### The Palette
*   **Primary (Mint Focus):** `#3E6658` (Primary) for authoritative text; `#8FB9A8` (Primary Container) for vibrant action areas.
*   **Surface (The Off-White Base):** `#FAF9F5` (Surface) provides a warm, paper-like foundation.
*   **On-Surface (The Ink):** `#1B1C1A` (On Surface) used for 2px borders and primary legibility.

### The "No-Line" Rule & Surface Hierarchy
To maintain a premium feel, avoid 1px "hairline" dividers. Sectioning is achieved through **Surface Nesting**:
*   **Level 0 (Background):** `surface` (#FAF9F5).
*   **Level 1 (Sectioning):** `surface_container_low` (#F4F4F0) for large layout blocks.
*   **Level 2 (Interactive Elements):** `surface_container_lowest` (#FFFFFF) for cards and inputs to create a "pop" against the off-white base.

**The Glass & Gradient Rule:** For "Zen Moments" (completed lessons), use a linear gradient from `primary` to `primary_container` at a 135-degree angle. This adds "visual soul" to milestone achievements.

---

## 3. Typography: The Editorial Voice
**Plus Jakarta Sans** is our sole typeface. Its geometric clarity mirrors the precision of Japanese calligraphy while remaining modern.

*   **Display (The Statement):** Use `display-lg` (3.5rem) for kanji characters or "Lesson Complete" screens. Decrease letter-spacing by -2% for a "tight" editorial feel.
*   **Headline (The Guide):** `headline-md` (1.75rem) for navigation headers. Always pair with a `primary` color token to signify importance.
*   **Body (The Content):** `body-lg` (1rem) for definitions and explanations. Increase line-height to 1.6 for maximum breathability.
*   **Label (The Utility):** `label-md` (0.75rem) in ALL CAPS with +5% letter-spacing for category tags.

---

## 4. Elevation, Depth & The "Soft Stroke"
Unlike traditional Material Design, depth here is physical and illustrative.

*   **The Layering Principle:** Depth is created by stacking `surface_container_highest` (#E3E2DF) behind `surface_container_lowest` (#FFFFFF).
*   **Signature Borders:** Every primary container must feature a **2px solid border** using the `on_surface` (#1B1C1A) token. This provides the "Brutalist" structure.
*   **The 4px Offset:** Use a hard-edge shadow (no blur) offset by 4px down and 4px right. Color: `on_surface` at 100% opacity for high-action items, or `secondary` (#5F5E5E) for secondary cards.
*   **The "Ghost Border" Fallback:** For non-interactive decorative elements, use the `outline_variant` (#C0C8C3) at 20% opacity. Never use 100% black for decorative lines.

---

## 5. Components & Interface Patterns

### Buttons (The "Hanko" Style)
*   **Primary:** Fill `primary_container` (#8FB9A8), 2px `on_surface` border, 4px shadow. On press: translate [2px, 2px] and remove shadow to simulate a physical button press.
*   **Tertiary:** No fill, no border. Use `body-lg` bold with an underline in `primary`.

### Cards & Learning Modules
*   **Rule:** Forbid divider lines. Use `spacing-6` (2rem) of vertical white space to separate content. 
*   **Mascot Integration:** The Zen Rabbit should partially overlap card boundaries (z-index: 10) to break the "boxiness" of the Neo-Brutalist grid.

### Input Fields (The Writing Surface)
*   **Default:** `surface_container_lowest` background, 2px `on_surface` border, `rounded-md` (0.75rem).
*   **Active:** Border changes to `primary` (#3E6658) with a 4px `primary_fixed` (#C0ECDA) offset shadow.

### Specialized App Components
*   **Kanji Stroke Pad:** A `surface_container_high` (#E9E8E4) area with a subtle 10% opacity grid pattern. 
*   **Progress "Garden":** Instead of a standard bar, use a row of minimalist rabbit icons that fill from `outline_variant` to `primary` as the user learns.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. If the left margin is `spacing-4`, the right margin can be `spacing-6` for a custom, editorial feel.
*   **Do** lean into `rounded-lg` (1rem) for all large containers to keep the "Zen" softness present.
*   **Do** use the mascot as a UI guide (e.g., the rabbit looking toward the "Next" button).

### Don’t:
*   **Don’t** use standard 1px grey borders. They look "cheap" and "default."
*   **Don’t** use soft, blurry shadows. All shadows must be hard-edged offsets to maintain the Neo-Brutalist identity.
*   **Don’t** crowd the interface. If a screen feels busy, double the spacing values. Zen is found in the "Ma" (negative space).