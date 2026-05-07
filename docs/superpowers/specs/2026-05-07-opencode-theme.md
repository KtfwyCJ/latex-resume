# OpenCode Theme — Design Spec

**Date:** 2026-05-07
**Scope:** Full visual redesign of all three app surfaces (LandingPage, TemplateGallery, EditorPage) to match the OpenCode design system.

---

## 1. Design System

### Font
- **JetBrains Mono** — weights 400 (regular), 500 (medium), 700 (bold)
- Loaded via Google Fonts in `index.html`
- Replaces: Playfair Display, EB Garamond, DM Mono
- Fallback stack: `'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace`
- Used for **every** text role — headings, body, buttons, labels, captions, code

### Color Tokens (update `tailwind.config.js`)

| Token | Value | Use |
|---|---|---|
| `canvas` | `#fdfcfc` | Page background, all surfaces |
| `ink` | `#201d1d` | Headlines, body text, primary button fill |
| `ink-deep` | `#0f0000` | Pressed state for primary button |
| `surface-soft` | `#f8f7f7` | Input backgrounds, alternating rows |
| `surface-card` | `#f1eeee` | Slightly elevated panels, PDF preview bg |
| `hairline` | `rgba(15,0,0,0.12)` | All 1px section and card borders |
| `body-text` | `#424245` | Default paragraph text |
| `mute` | `#646262` | Labels, nav metadata, secondary text |
| `ash` | `#9a9898` | Disabled, captions, fine print |
| `accent` | `#007aff` | Informational, links |
| `danger` | `#ff3b30` | Error states |
| `success` | `#30d158` | Positive confirmation |
| `warning` | `#ff9f0a` | Caution callouts |

Remove existing tokens: `gold (#c8a97e)`, `paper (#faf8f4)`, `paper-card (#ffffff)`, `ink-text (#1a1614)`, `ink-muted (#7a6f6a)`, `primary (#1B211A)`, `secondary (#628141)`, `accent (#8BAE66)`, `neutral (#EBD5AB)`.

### Interactive Elements
- **Border radius**: 4px on all buttons and interactive elements
- **Section borders**: 1px hairline only — no shadows, no elevated cards
- **Buttons**:
  - Primary: `background #201d1d`, `color #fdfcfc`, pressed: `background #0f0000`
  - Ghost: `background transparent`, `border 1px solid rgba(15,0,0,0.2)`, `color #201d1d`
  - Both: `font-size 16px`, `font-weight 500`, `line-height 2`, `border-radius 4px`
- **ASCII markers**: `[+]` add/action, `[-]` dismiss/remove, `[x]` close/error — used as inline prefixes, not icons

### Typography Scale

| Role | Size | Weight | Line Height |
|---|---|---|---|
| Hero headline | 38px | 700 | 1.25 |
| Section heading | 16px | 700 | 1.5 |
| Body | 16px | 400 | 1.5 |
| Button label | 12–13px | 500 | 2 | (OpenCode targets 16px for marketing; app UI uses 12-13px for density) |
| Kicker / label | 10px | 400 | 1.5 (+ letter-spacing 3-4px, uppercase) |
| Caption / meta | 14px | 400 | 2 |

---

## 2. `index.html`

- Remove Google Fonts `<link>` for Playfair Display, EB Garamond, DM Mono
- Add: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap`

---

## 3. `index.css`

```css
body {
  margin: 0;
  min-height: 100vh;
  background-color: #fdfcfc;
  font-family: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 4. `tailwind.config.js`

Replace the `extend.colors` block with the token table above. Keep `content` and `plugins` unchanged.

---

## 5. LandingPage (`src/pages/LandingPage.tsx`)

### Remove
- `FluidCanvas` import and usage
- Dark hero section (`background: '#080808'`)
- Paper body section + gradient transition div
- All `fontFamily: '"Playfair Display"'` and `fontFamily: '"EB Garamond"'` references
- Gold accent `#c8a97e` throughout
- `backdropFilter: 'blur(8px)'` on draft banner and modal backdrop

### Structure (top to bottom)
1. **Draft banner** (conditional) — hairline bottom border, `[-] dismiss` button right
2. **Nav** — wordmark `latex-resume` left (700/13px), minimal links right, hairline bottom
3. **Hero section** — centered, `padding: '96px 24px 72px'`, hairline bottom
   - Kicker: `LATEX RESUME BUILDER` (10px, uppercase, letter-spacing 4px, `#646262`)
   - Headline: 38px/700, `#201d1d`, `letter-spacing: '-0.02em'`
   - Subheading: 14px/400, `#424245`, max-width 440px
   - CTAs: `[+] Browse Templates` (primary) + `Import PDF →` (ghost), gap 10px
4. **Templates section** — `padding: '64px 24px'`, hairline bottom, max-width 480px centered
   - Section label: `TEMPLATES` kicker
   - Tag chips: template names in hairline-bordered pills
   - Heading + body copy
   - `[+] Browse Templates →` primary button
5. **Import section** — same padding, no bottom border
   - Section label: `IMPORT`
   - Heading + body copy
   - `or drop a PDF` divider (hairline lines either side)
   - Drop zone: `border: '1px dashed rgba(15,0,0,0.2)'`, `border-radius: 4px`, cream bg
   - Error: `[x] {error}` displayed below drop zone in `#ff3b30`

### Preview modal
- Backdrop: `background: 'rgba(0,0,0,0.5)'` — no blur
- Card: `background: '#fdfcfc'`, `border: '1px solid rgba(15,0,0,0.12)'`, `border-radius: 4px`, no `box-shadow`
- Header: filename in 14px/700/ink, size in 12px/ash; `[x]` close button right
- PDF thumbnail area: `background: '#f1eeee'`
- Actions: Cancel (text-only, muted) + `Convert to LaTeX` (primary ink button)
- Loading hint: 13px/400/muted JetBrains Mono (not italic)

---

## 6. TemplateGallery (`src/components/TemplateGallery.tsx`)

### Remove
- `bg-white` → cream canvas
- `shadow-sm`, `shadow-lg`, `hover:shadow-lg` — no shadows
- `rounded-2xl` on cards → `border-radius: 4px`
- Gradient wordmark (`bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text`)

### Changes
- Header: cream bg, hairline bottom, monospace wordmark
- Card: flat hairline border `rgba(15,0,0,0.12)`, 4px radius, hover: `border-color rgba(15,0,0,0.3)`
- Thumbnail bg: `#f1eeee` instead of `bg-gray-50`
- Template name: 14px/700/ink (not gray-800 Tailwind default)
- Description: 13px/400/muted
- `[+] Use this template` button: full-width ink primary
- Loading spinner: ink color border-top

---

## 7. EditorPage (`src/pages/EditorPage.tsx`)

### Remove
- `background: '#0d0d0d'` and `background: '#161616'` (all dark surfaces)
- Gold accent `#c8a97e` throughout
- `fontFamily: '"Playfair Display"'` from wordmark

### Changes

**Top bar** (`height: 46px`):
- `background: '#fdfcfc'`, `borderBottom: '1px solid rgba(15,0,0,0.12)'`
- Back button: 11px/400/muted JetBrains Mono
- Wordmark: `latex-resume` in 14px/700/ink (plain, no serif/italic)
- Buttons: ghost hairline (Copy, Download .tex, Download PDF), ink primary (↺ Recompile)

**Pane headers**:
- `background: '#fdfcfc'`, `borderBottom: '1px solid rgba(15,0,0,0.12)'`
- Label: 9px/400, letter-spacing 2px, uppercase, `#9a9898`

**Monaco editor**:
- `theme: 'vs'` (light)
- `fontFamily: "'JetBrains Mono', monospace"`

**Divider**: `width: 1`, `background: 'rgba(15,0,0,0.1)'`, hover: `rgba(15,0,0,0.25)`

**PDF preview pane**:
- `background: '#f1eeee'`
- Compiling overlay: `background: '#f1eeee'`; spinner border-top `#201d1d`
- Empty state: remove `📄` emoji; show `[ no preview ]` in ash, with `Click Recompile to preview` below it

**Compile error panel**:
- `background: '#fff8f8'`, `borderTop: '1px solid rgba(255,59,48,0.25)'`
- Toggle header: `[x] Compile error` in 11px/500/danger (`#ff3b30`)
- Pre block: 11px/danger at 60% opacity

**Status bar**:
- `background: '#fdfcfc'`, `borderTop: '1px solid rgba(15,0,0,0.08)'`
- 10px/ash text

---

## 8. What does NOT change

- All routing logic (`App.tsx`) — untouched
- All LaTeX templates (`src/templates/`) — untouched
- All lib files (`latexCompiler`, `pdfParser`, `resumeStorage`) — untouched
- Monaco editor functionality — only theme and font change
- FluidCanvas component file — can stay (just remove import from LandingPage)

---

## 9. File change summary

| File | Change type |
|---|---|
| `index.html` | Font swap (remove 3 fonts, add JetBrains Mono) |
| `src/index.css` | Body font + background |
| `tailwind.config.js` | Color token replacement |
| `src/pages/LandingPage.tsx` | Full restyle |
| `src/components/TemplateGallery.tsx` | Full restyle |
| `src/pages/EditorPage.tsx` | Full restyle |
