# E-Magazine Design Theme

**Date:** 2026-04-25
**Scope:** Full — Landing Page + Editor Page

---

## Vision

An editorial, print-magazine aesthetic applied across the entire app. The Landing Page opens with an ink-black hero section underpinned by a faint ambient WebGL fluid simulation (GLSL shader — organic ink-in-fluid motion). The page then dissolves into a warm paper-white canvas where upload UI rests like content on an open magazine spread. The Editor Page continues the language: an ink-black chrome header, a dark code pane, and a paper-white PDF preview panel.

---

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `ink` | `#080808` | Hero background, editor header/chrome |
| `paper` | `#faf8f4` | Body background, PDF preview panel |
| `paper-card` | `#ffffff` | Cards and modals on paper background |
| `ink-text` | `#1a1614` | Primary text on paper |
| `ink-muted` | `#7a6f6a` | Secondary/caption text on paper |
| `gold` | `#c8a97e` | Serif accent, primary CTAs, WebGL tint |
| `gold-subtle` | `rgba(200,169,126,0.12)` | Borders and backgrounds on dark |
| `paper-border` | `rgba(61,53,48,0.18)` | Borders on paper background |

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Headlines | Playfair Display | 700–900 | Landing hero h1, Editor logo |
| Italic accent | Playfair Display | 400–700 italic | Hero title emphasis (`<em>`) |
| Body / captions | EB Garamond | 400, italic | Subtitles, CTA descriptions |
| UI labels / code | DM Mono | 400–500 | Chips, buttons, pane labels, eyebrows |

All three loaded from Google Fonts via `<link>` tags in `index.html` `<head>` (see Fonts Loading section).

---

## Landing Page

### Hero Section (ink-black, full-viewport)

- Background: `#080808`
- `<canvas id="fluid-canvas">` absolutely positioned behind all content, full width/height
- WebGL fluid shader runs on mount; graceful CSS fallback if WebGL unavailable
- Eyebrow: DM Mono, `letter-spacing: 4px`, `rgba(210,185,140,0.5)`
- H1: Playfair Display 900, `clamp(42px, 7vw, 72px)`, `#f5f0e8`; one `<em>` word in `#c8a97e`
- Subtitle: EB Garamond italic, 18px, `rgba(245,240,232,0.55)`
- Template CTA card: `rgba(245,240,232,0.06)` background, `1px solid rgba(245,240,232,0.12)` border
  - Chips: DM Mono, `rgba(200,169,126,0.1)` bg, `rgba(200,169,126,0.2)` border
  - "Browse Templates" button: solid `#c8a97e` bg, `#0a0806` text, DM Mono uppercase
- Divider: thin rule with "or import your PDF" in DM Mono
- PDF drop zone: dashed border `rgba(245,240,232,0.15)`, DM Mono labels
- Draft banner: `rgba(200,169,126,0.12)` bg, `rgba(200,169,126,0.2)` bottom border, amber link

### Paper Transition

- A single `div` with `height: 60px` and `background: linear-gradient(to bottom, #080808, #faf8f4)`
- No content; purely a visual dissolve

### Paper Body Section

- Background: `#faf8f4`
- Upload zone card: `#ffffff` bg, `1px solid rgba(61,53,48,0.18)` border, subtle box-shadow
- H4 headline: Playfair Display 700, `#1a1614`
- Body text: EB Garamond italic, `#7a6f6a`
- "Browse File" button: `1px solid #3d3530` outline, DM Mono uppercase

### Preview Modal

- Overlay: `rgba(0,0,0,0.6)` with `backdrop-filter: blur(8px)`
- Modal card: `#ffffff`, warm border `rgba(61,53,48,0.12)`
- "Convert to LaTeX" button uses gold `#c8a97e`

### Error State

- Border: `rgba(180,60,60,0.25)`, background: `rgba(255,240,240,0.8)`, text: `#8b3030`
- Replaces the current red-500/red-50 palette

---

## Editor Page

### Top Bar / Header

- Background: `#0d0d0d`
- Bottom border: `1px solid rgba(200,169,126,0.15)`
- Logo: Playfair Display 700, `#f5f0e8` with `<em>` in `#c8a97e`
- Back link: DM Mono uppercase, `rgba(245,240,232,0.35)`
- Action buttons (Copy, Download .tex, Download PDF): ghost style — `rgba(245,240,232,0.07)` bg, same-tone border, `rgba(245,240,232,0.5)` text
- Recompile button: solid `#c8a97e` bg, `#0a0806` text

### Code Editor Pane

- Pane header: `#161616` bg, `rgba(200,169,126,0.1)` bottom border, gold-tinted labels
- Monaco editor: theme set to `vs-dark` (unchanged functionally)
- Error panel: dark-toned — `#1a0f0f` bg, `rgba(200,80,80,0.3)` border

### Divider

- `3px` wide, `rgba(200,169,126,0.15)` color (replacing gray-200)
- Hover: `rgba(200,169,126,0.4)`

### PDF Preview Pane

- Pane header: `#0d0d0d` bg (matching top bar)
- Preview area: `#faf8f4` background — the same paper-white as the Landing body
- `<iframe>` for the compiled PDF stays unchanged
- Footer: `#0d0d0d` bg, gold-tinted muted text

---

## WebGL Fluid Simulation

### Approach

Custom WebGL fragment shader. No external libraries. A single `<canvas>` element covers the hero absolutely.

### Shader Design

- Two-layer simplex-style noise field using `sin`/`cos` octave stacking
- Velocity field advected over time — slow, organic motion (~0.3 units/sec)
- Colour: deep amber/sepia tones (`vec3(0.5, 0.3, 0.1)`) multiplied against the noise output
- Final alpha: `0.15–0.25` — deliberately faint, "beneath the surface"
- Renders at `0.5×` device pixel ratio for performance (fluid appearance doesn't require crisp edges)

### Implementation

A `FluidCanvas` React component:
- `useEffect` on mount: initialises WebGL context, compiles vertex + fragment shaders, starts `requestAnimationFrame` loop
- Cleans up on unmount: cancels RAF, deletes WebGL program
- Accepts `opacity` and `speed` props (defaults: `0.2`, `0.4`)
- CSS fallback: if `getContext('webgl')` returns null, renders a static `radial-gradient` div

### Files

- `src/components/FluidCanvas.tsx` — new component
- Inline GLSL as template literals (no `.glsl` loader needed)

---

## Fonts Loading

In `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=EB+Garamond:ital,wght@0,400;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Tailwind Config Updates

Replace current colour tokens:

```js
colors: {
  ink:        '#080808',
  paper:      '#faf8f4',
  'paper-card': '#ffffff',
  gold:       '#c8a97e',
  'ink-text': '#1a1614',
  'ink-muted':'#7a6f6a',
  // keep primary/secondary/accent/neutral for LaTeX template colours
}
```

`gold-subtle` (`rgba(200,169,126,0.12)`) and `paper-border` (`rgba(61,53,48,0.18)`) use alpha so they stay as inline Tailwind arbitrary values (`bg-[rgba(...)]`) or CSS custom properties — not static Tailwind tokens.

---

## Files to Modify

| File | Change |
|---|---|
| `index.html` | Add Google Fonts `<link>` tags |
| `tailwind.config.js` | Add ink/paper/gold tokens |
| `src/index.css` | Update body background to `#faf8f4`, set base font to EB Garamond |
| `src/pages/LandingPage.tsx` | Full visual rework per spec above |
| `src/pages/EditorPage.tsx` | Header, pane headers, divider, preview bg per spec above |
| `src/components/FluidCanvas.tsx` | New — WebGL fluid simulation component |

---

## Out of Scope

- Template gallery page styling (separate task)
- LaTeX template designs
- Mobile/responsive layout changes
- Dark mode toggle
