# Dune Theme Design

**Date:** 2026-04-25
**Scope:** Full — Landing Page + Editor Page
**Replaces:** `docs/superpowers/specs/2026-04-25-e-magazine-theme-design.md`

---

## Vision

A warm parchment aesthetic inspired by the Dune universe — open desert light, not dark drama. Every surface is a variation of the same bleached-warm cream, creating a calm, unified canvas. A giant ghost-serif watermark floats behind the hero as a textural background element (replacing the WebGL fluid simulation, which is removed). Cards sit on this surface like manuscript pages. The editor keeps a dark code pane (readable code requires dark), but all chrome switches to the warm parchment language.

---

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `sand` | `#EDEAE3` | Body background, hero background — the base surface |
| `sand-card` | `#F5F2EC` | Cards, editor header, modal surfaces |
| `sand-pane` | `#EAE7DF` | Pane headers, editor footer |
| `dune-text` | `#1C1916` | Primary text, black CTA button, code pane bg |
| `dune-muted` | `#5A544D` | Body copy, card descriptions, subtitles |
| `dune-faint` | `rgba(28,25,22,0.38)` | Eyebrow labels, back link, muted UI |
| `amber` | `#8B6A3E` | Card labels, italic `<em>` accents, PDF card left-border, logo `<em>` |
| `sand-border` | `rgba(28,25,22,0.13)` | Card borders, header borders |
| `sand-dashed` | `rgba(28,25,22,0.20)` | Drop zone dashed border |
| `watermark` | `rgba(28,25,22,0.045)` | Ghost "Résumé" watermark text |

`sand-card` and `sand-pane` use hex values; all `rgba` tokens stay as inline Tailwind arbitrary values or CSS custom properties.

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Headlines | Playfair Display | 900 | Hero h1 |
| Card / logo titles | Playfair Display | 700 | Card h2, editor logo |
| Italic accent | Playfair Display | 400–700 italic | `<em>` in amber |
| Body / captions | EB Garamond | 400 italic | Subtitles, card descriptions |
| UI labels / mono | DM Mono | **500** | All UI labels, buttons, chips, pane headers, eyebrows |

DM Mono must always be `font-weight: 500` — `400` renders too thin at small sizes.

All three loaded from Google Fonts (already in `index.html`).

---

## Landing Page

### Hero Section (full-viewport, `#EDEAE3`)

- Background: `#EDEAE3` — no dark section, no gradient
- **Ghost watermark:** absolutely positioned, centred, `font-family: Playfair Display`, `font-size: 220px`, `font-weight: 900`, `font-style: italic`, `color: rgba(28,25,22,0.045)`, text content: `"Résumé"`. Pointer-events none. Replaces FluidCanvas.
- Eyebrow: DM Mono 500, `letter-spacing: 4px`, `rgba(28,25,22,0.38)`, `margin-bottom: 28px`
- H1: Playfair Display 900, `clamp(38px, 5vw, 58px)`, `#1C1916`; one `<em>` word in `#8B6A3E` italic. Two lines: `"Craft Your"` / `"<em>Professional</em> Story"`. `margin-bottom: 24px`
- Subtitle: EB Garamond italic, 20px, `#5A544D`, `margin-bottom: 64px`
- **Two-column card row:** `max-width: 840px`, `gap: 20px`, `align-items: stretch`

### Template Card (left column)

- Background: `#F5F2EC`, `1px solid rgba(28,25,22,0.13)`, `border-radius: 3px`, `padding: 32px`
- Card label: DM Mono 500, `font-size: 10px`, `letter-spacing: 2.5px`, uppercase, `color: #8B6A3E`, `margin-bottom: 14px`
- Chips: DM Mono 500, `font-size: 9px`, `rgba(28,25,22,0.55)` text, `rgba(28,25,22,0.06)` bg, `rgba(28,25,22,0.13)` border
- h2: Playfair Display 700, 22px, `#1C1916`
- Description: EB Garamond italic, 16px, `#5A544D`
- "Browse Templates" button: full-width, `background: #1C1916`, `color: #EDEAE3`, DM Mono 500, `letter-spacing: 2px`, uppercase

### PDF Import Card (right column)

- Same card base styles as template card
- **Left border accent:** `border-left: 3px solid #8B6A3E` (replaces standard 1px on left side)
- Card label: DM Mono 500, `#8B6A3E`
- PDF icon: 52×60px box, `rgba(28,25,22,0.06)` bg, `rgba(28,25,22,0.12)` border, DM Mono 500 "PDF" text
- h2: Playfair Display 700, 22px
- Description: EB Garamond italic, 16px, `#5A544D`
- Drop zone: dashed `1px rgba(28,25,22,0.20)` border, `border-radius: 2px`, DM Mono 500, `rgba(28,25,22,0.35)` text, `padding: 12px 16px`
- Entire card is a click target (opens file picker)
- On `dragOver`: border becomes `rgba(28,25,22,0.4)`, background shifts to `rgba(28,25,22,0.03)`

### No Paper Transition

No gradient divider needed — the whole page is one warm cream tone.

### Paper Body Section

- Same `#EDEAE3` background, `border-top: 1px solid rgba(28,25,22,0.10)`
- Upload card: `#F5F2EC` bg, same card border, `padding: 36px 32px`, centred
- h4: Playfair Display 700, 22px
- Description: EB Garamond italic, 16px, `#5A544D`
- "Browse File" button: outline style — `border: 1px solid rgba(28,25,22,0.4)`, transparent bg, DM Mono 500

### Draft Banner

- Position: `fixed top-0`, `z-index: 40`
- Background: `rgba(139,106,62,0.1)`, `border-bottom: 1px solid rgba(139,106,62,0.2)`, `backdrop-filter: blur(8px)`
- Text: EB Garamond, `#5A544D`; link: `#8B6A3E`, italic underline

### Preview Modal

- Overlay: `rgba(0,0,0,0.4)` + `backdrop-filter: blur(8px)`
- Modal card: `#F5F2EC`, `border: 1px solid rgba(28,25,22,0.13)`
- "Convert to LaTeX" button: `#1C1916` bg, `#EDEAE3` text

### Error State

- Background: `rgba(180,60,60,0.08)`, border: `rgba(180,60,60,0.2)`, text: `rgba(120,40,40,0.9)`
- DM Mono 500, displayed inline below the PDF card (not below the fold)

---

## Editor Page

### Top Bar / Header

- Background: `#F5F2EC`
- Bottom border: `1px solid rgba(28,25,22,0.12)`
- Logo: Playfair Display 700, `#1C1916`, `<em>` in `#8B6A3E` italic
- Back link: DM Mono 500, `rgba(28,25,22,0.38)`, uppercase
- Ghost buttons (Copy, Download .tex, Download PDF): `rgba(28,25,22,0.05)` bg, `rgba(28,25,22,0.13)` border, `rgba(28,25,22,0.6)` text, DM Mono 500
- Recompile button: `#1C1916` bg, `#EDEAE3` text, DM Mono 500

### Code Editor Pane

- Pane header: `#EAE7DF` bg, `rgba(28,25,22,0.10)` bottom border, DM Mono 500, `rgba(28,25,22,0.50)` text
- Monaco editor: theme stays `vs-dark` (dark code area — `#1C1916`)
- Error panel: `#1a0f0f` bg, `rgba(200,80,80,0.3)` border (unchanged from e-magazine theme)

### Divider

- `3px` wide, `rgba(28,25,22,0.10)` (replacing gold)
- Hover: `rgba(28,25,22,0.25)`

### PDF Preview Pane

- Pane header: `#EAE7DF` bg (matching code pane header)
- Preview area: `#F5F2EC` background
- Footer: `#EAE7DF` bg, DM Mono 500, `rgba(28,25,22,0.35)` text

---

## Removed / Changed vs E-Magazine Theme

| Item | Change |
|---|---|
| `FluidCanvas` component usage | Removed from LandingPage — replaced by CSS ghost watermark |
| Ink-black hero (`#080808`) | Replaced by `#EDEAE3` |
| Paper transition gradient | Removed — not needed, single tone |
| Gold accent (`#c8a97e`) | Replaced by amber (`#8B6A3E`) |
| Dark editor header (`#0d0d0d`) | Replaced by `#F5F2EC` |
| Stacked vertical CTA layout | Replaced by two-column card row |

`FluidCanvas.tsx` file is kept but no longer imported in LandingPage.

---

## Tailwind Config Updates

```js
colors: {
  sand:        '#EDEAE3',
  'sand-card': '#F5F2EC',
  'sand-pane': '#EAE7DF',
  amber:       '#8B6A3E',
  'dune-text': '#1C1916',
  'dune-muted':'#5A544D',
  // keep primary/secondary/accent/neutral for LaTeX template colours
}
```

`rgba` tokens (`sand-border`, `sand-dashed`, `watermark`, `dune-faint`) stay as inline Tailwind arbitrary values.

---

## Files to Modify

| File | Change |
|---|---|
| `tailwind.config.js` | Replace ink/paper/gold tokens with sand/amber/dune tokens |
| `src/index.css` | Update body background to `#EDEAE3` |
| `src/pages/LandingPage.tsx` | Full rework per spec — remove FluidCanvas, add watermark, two-column cards |
| `src/pages/EditorPage.tsx` | Light chrome rework — `#F5F2EC` header/footer, `#EAE7DF` pane headers, amber accents |

---

## Out of Scope

- `FluidCanvas.tsx` — no changes, just no longer imported
- Template gallery page styling
- LaTeX template designs
- Mobile/responsive layout changes
- Dark mode toggle
