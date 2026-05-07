# OpenCode Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle LandingPage, TemplateGallery, and EditorPage to use the OpenCode design system: JetBrains Mono everywhere, warm cream canvas, ink-black text, hairline borders, ASCII bracket markers, no animations or shadows.

**Architecture:** Pure visual restyle — no logic changes. All inline styles replace the existing mix of inline styles and Tailwind utilities. Font swap in index.html, body style in index.css, color tokens in tailwind.config.js, then each page/component top-to-bottom.

**Tech Stack:** React, TypeScript, Tailwind CSS v3, Vite, Monaco Editor

---

## File Map

| File | Change |
|---|---|
| `index.html` | Remove Playfair Display / EB Garamond / DM Mono, add JetBrains Mono |
| `src/index.css` | Update body font and background |
| `tailwind.config.js` | Replace color tokens with OpenCode system |
| `src/pages/LandingPage.tsx` | Full restyle — remove FluidCanvas, dark hero, gold accents |
| `src/components/TemplateGallery.tsx` | Full restyle — remove shadows, gradient text, white bg |
| `src/pages/EditorPage.tsx` | Full restyle — cream chrome, light Monaco, hairline dividers |

---

## Task 1: Foundation — fonts, body, color tokens

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Swap Google Fonts link in `index.html`**

Replace the existing `<link>` tag (Playfair Display + EB Garamond + DM Mono) with JetBrains Mono only:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/icon.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LaTeX Resume Builder</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Update `src/index.css` body styles**

Full file replacement:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: #fdfcfc;
  font-family: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: Replace color tokens in `tailwind.config.js`**

Full file replacement:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:          '#fdfcfc',
        ink:             '#201d1d',
        'ink-deep':      '#0f0000',
        'surface-soft':  '#f8f7f7',
        'surface-card':  '#f1eeee',
        'body-text':     '#424245',
        mute:            '#646262',
        ash:             '#9a9898',
        accent:          '#007aff',
        danger:          '#ff3b30',
        success:         '#30d158',
        warning:         '#ff9f0a',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Verify TypeScript build**

```bash
cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
```

Expected: build completes with no TypeScript errors. Tailwind warnings about removed tokens are fine.

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css tailwind.config.js
git commit -m "feat: swap to JetBrains Mono and OpenCode color tokens"
```

---

## Task 2: LandingPage restyle

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Replace `LandingPage.tsx` with cream theme**

Full file replacement (all logic unchanged — only styles):

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { renderPagesAsImages } from '../lib/pdfParser';
import { clearResume, loadResume } from '../lib/resumeStorage';
import type { Draft } from '../lib/resumeStorage';

async function renderFirstPage(file: File): Promise<string> {
  const [img] = await renderPagesAsImages(file, 1);
  return img;
}

interface Props {
  onParsed: (latex: string) => void;
  onOpenGallery: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function draftAge(savedAt: number): string {
  const days = Math.floor((Date.now() - savedAt) / 86_400_000);
  return days < 1 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

const primaryBtn: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 12,
  fontWeight: 500,
  padding: '10px 22px',
  background: '#201d1d',
  color: '#fdfcfc',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

const ghostBtn: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 12,
  fontWeight: 500,
  padding: '10px 22px',
  background: 'transparent',
  color: '#201d1d',
  border: '1px solid rgba(15,0,0,0.2)',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

export default function LandingPage({ onParsed, onOpenGallery }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => { setDraft(loadResume()); }, []);

  useEffect(() => {
    if (!previewFile) { setPreviewImg(null); return; }
    let cancelled = false;
    renderFirstPage(previewFile).then((img) => { if (!cancelled) setPreviewImg(img); });
    return () => { cancelled = true; };
  }, [previewFile]);

  const validateAndPreview = useCallback((file: File) => {
    setError('');
    if (file.type !== 'application/pdf') { setError('Only PDF files are supported.'); return; }
    if (file.size > MAX_SIZE) { setError('File is too large. Maximum size is 10 MB.'); return; }
    setPreviewFile(file);
  }, []);

  const confirmConvert = useCallback(async () => {
    if (!previewFile) return;
    setLoading(true);
    setError('');
    try {
      const images = await renderPagesAsImages(previewFile);
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setError(json.error ?? `Conversion failed (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      const { latex } = await res.json() as { latex: string };
      onParsed(latex);
    } catch {
      setError('Failed to convert the PDF. Please try another file.');
      setLoading(false);
    }
  }, [previewFile, onParsed]);

  const cancelPreview = () => {
    setPreviewFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndPreview(file);
  }, [validateAndPreview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndPreview(file);
  };

  return (
    <div style={{ background: '#fdfcfc', minHeight: '100vh' }}>

      {/* Draft banner */}
      {draft && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px',
          background: '#fdfcfc',
          borderBottom: '1px solid rgba(15,0,0,0.12)',
          fontFamily: mono, fontSize: 12, color: '#424245',
        }}>
          <span>
            You have changes saved {draftAge(draft.savedAt)} —{' '}
            <button
              onClick={() => onParsed(draft.latex)}
              style={{ color: '#201d1d', fontFamily: mono, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontSize: 12 }}
            >
              Resume editing →
            </button>
          </span>
          <button
            onClick={() => { clearResume(); setDraft(null); }}
            style={{ color: '#9a9898', background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 12 }}
          >
            [-] dismiss
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px',
        borderBottom: '1px solid rgba(15,0,0,0.12)',
        background: '#fdfcfc',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: '#201d1d', letterSpacing: '-0.02em' }}>
          latex-resume
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <button
            onClick={onOpenGallery}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 12, color: '#646262' }}
          >
            Templates
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 12, color: '#646262' }}
          >
            Import
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 24px 72px', textAlign: 'center', borderBottom: '1px solid rgba(15,0,0,0.12)' }}>
        <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#646262', marginBottom: 20 }}>
          LaTeX Resume Builder
        </p>
        <h1 style={{ fontFamily: mono, fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700, lineHeight: 1.25, color: '#201d1d', letterSpacing: '-0.02em', marginBottom: 16 }}>
          Professional resumes,<br />written in LaTeX.
        </h1>
        <p style={{ fontFamily: mono, fontSize: 14, lineHeight: 1.6, color: '#424245', maxWidth: 440, margin: '0 auto 32px' }}>
          Live editor, instant PDF preview, and AI-powered import from your existing resume.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onOpenGallery} style={primaryBtn}>[+] Browse Templates</button>
          <button onClick={() => inputRef.current?.click()} style={ghostBtn}>Import PDF →</button>
        </div>
        {error && (
          <p style={{ marginTop: 16, fontFamily: mono, fontSize: 12, color: '#ff3b30' }}>
            [x] {error}
          </p>
        )}
      </section>

      {/* Templates section */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid rgba(15,0,0,0.12)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#9a9898', marginBottom: 16 }}>
            Templates
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {['Modern', 'Classic', 'Minimal', 'Two Column', 'Executive'].map((n) => (
              <span
                key={n}
                style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#424245', border: '1px solid rgba(15,0,0,0.15)', padding: '2px 8px', borderRadius: 2 }}
              >
                {n}
              </span>
            ))}
          </div>
          <h2 style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: '#201d1d', marginBottom: 8 }}>
            Start from a template
          </h2>
          <p style={{ fontFamily: mono, fontSize: 14, lineHeight: 1.6, color: '#424245', marginBottom: 20 }}>
            10+ professional designs. Open in the live editor and customize every detail.
          </p>
          <button onClick={onOpenGallery} style={primaryBtn}>[+] Browse Templates →</button>
        </div>
      </section>

      {/* Import section */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#9a9898', marginBottom: 16 }}>
            Import
          </p>
          <h2 style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: '#201d1d', marginBottom: 8 }}>
            Import your résumé
          </h2>
          <p style={{ fontFamily: mono, fontSize: 14, lineHeight: 1.6, color: '#424245', marginBottom: 20 }}>
            Drop a PDF and Claude AI converts it to editable LaTeX source.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(15,0,0,0.1)' }} />
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9898' }}>or drop a PDF</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(15,0,0,0.1)' }} />
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1px dashed ${isDragging ? 'rgba(15,0,0,0.4)' : 'rgba(15,0,0,0.2)'}`,
              borderRadius: 4,
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? '#f8f7f7' : 'transparent',
              transition: 'border-color 0.15s, background 0.15s',
              userSelect: 'none',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#9a9898', marginBottom: 4, pointerEvents: 'none' }}>
              {isDragging ? 'Release to upload' : 'Drop your PDF here'}
            </p>
            <span style={{ fontFamily: mono, fontSize: 11, color: '#c4c2c2', pointerEvents: 'none' }}>
              PDF only · max 10 MB
            </span>
          </div>
        </div>
      </section>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* Preview modal */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#fdfcfc', borderRadius: 4, border: '1px solid rgba(15,0,0,0.12)', maxWidth: 520, width: '100%', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(15,0,0,0.12)' }}>
              <div>
                <p style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: '#201d1d', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewFile.name}
                </p>
                <p style={{ fontFamily: mono, fontSize: 11, color: '#9a9898', marginTop: 2 }}>
                  {formatSize(previewFile.size)}
                </p>
              </div>
              <button
                onClick={cancelPreview}
                style={{ color: '#9a9898', background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 12 }}
              >
                [x]
              </button>
            </div>

            {/* PDF thumbnail */}
            <div style={{ background: '#f1eeee', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
              {previewImg ? (
                <img
                  src={`data:image/png;base64,${previewImg}`}
                  alt="Resume preview"
                  style={{ maxHeight: 256, objectFit: 'contain', border: '1px solid rgba(15,0,0,0.12)', borderRadius: 2 }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(15,0,0,0.1)', borderTopColor: '#201d1d' }} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: '#9a9898', letterSpacing: 1 }}>Loading preview…</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid rgba(15,0,0,0.12)' }}>
              <button
                onClick={cancelPreview}
                disabled={loading}
                style={{ padding: '8px 16px', fontFamily: mono, fontSize: 11, letterSpacing: 1, color: '#646262', background: 'transparent', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmConvert}
                disabled={loading}
                style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(253,252,252,0.3)', borderTopColor: '#fdfcfc' }} />
                    Converting…
                  </>
                ) : (
                  'Convert to LaTeX'
                )}
              </button>
            </div>

            {loading && (
              <p style={{ paddingBottom: 14, textAlign: 'center', fontFamily: mono, fontSize: 13, color: '#646262' }}>
                AI is analyzing your resume… this may take 15–30 seconds.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript build**

```bash
cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Visual check**

```bash
npm run dev
```

Open http://localhost:5173. Verify:
- Cream canvas top to bottom (no dark section)
- JetBrains Mono everywhere (check browser inspector)
- Nav: `latex-resume` wordmark left, `Templates` / `Import` links right
- Hero: centered headline, two buttons with `[+]` and `→` markers
- Templates section with tag chips
- Import section with dashed drop zone

- [ ] **Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: restyle LandingPage with OpenCode cream theme"
```

---

## Task 3: TemplateGallery restyle

**Files:**
- Modify: `src/components/TemplateGallery.tsx`

- [ ] **Step 1: Replace `TemplateGallery.tsx` with cream theme**

Full file replacement:

```tsx
import { useEffect, useState } from 'react';
import { renderPagesAsImages } from '../lib/pdfParser';
import type { Template } from '../templates';

interface Props {
  templates: Template[];
  onSelect: (latex: string) => void;
  onBack: () => void;
}

interface CardProps {
  template: Template;
  onSelect: (latex: string) => void;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

function TemplateCard({ template, onSelect }: CardProps) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: template.latex }),
        });
        if (!res.ok) throw new Error('compile failed');
        const blob = await res.blob();
        const file = new File([blob], 'preview.pdf', { type: 'application/pdf' });
        const [img] = await renderPagesAsImages(file, 1);
        if (!cancelled) setThumb(img);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [template.latex]);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '1px solid rgba(15,0,0,0.12)',
        borderRadius: 4,
        cursor: 'pointer',
        background: '#fdfcfc',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(15,0,0,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(15,0,0,0.12)'; }}
      onClick={() => onSelect(template.latex)}
    >
      {/* Thumbnail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f1eeee', height: 340 }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(15,0,0,0.1)', borderTopColor: '#201d1d' }} />
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9a9898' }}>Rendering…</span>
          </div>
        )}
        {!loading && thumb && (
          <img src={`data:image/png;base64,${thumb}`} alt={`${template.name} preview`} style={{ objectFit: 'contain', width: 'auto', height: '100%' }} />
        )}
        {!loading && failed && (
          <span style={{ fontFamily: mono, fontSize: 11, color: '#9a9898', padding: '0 24px', textAlign: 'center' }}>Preview unavailable</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 20, borderTop: '1px solid rgba(15,0,0,0.08)' }}>
        <p style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: '#201d1d', marginBottom: 6 }}>{template.name}</p>
        <p style={{ fontFamily: mono, fontSize: 12, lineHeight: 1.6, color: '#646262', marginBottom: 16 }}>{template.description}</p>
        <button
          style={{
            width: '100%', padding: '10px 0',
            background: '#201d1d', color: '#fdfcfc',
            border: 'none', borderRadius: 4,
            fontFamily: mono, fontSize: 12, fontWeight: 500, letterSpacing: '0.5px',
            cursor: 'pointer',
          }}
        >
          [+] Use this template
        </button>
      </div>
    </div>
  );
}

export default function TemplateGallery({ templates, onSelect, onBack }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#fdfcfc' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 32px',
        background: '#fdfcfc',
        borderBottom: '1px solid rgba(15,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{ fontFamily: mono, fontSize: 12, color: '#646262', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <span style={{ color: 'rgba(15,0,0,0.15)', fontSize: 12 }}>|</span>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: '#201d1d', letterSpacing: '-0.02em' }}>
            latex-resume
          </span>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#9a9898', marginBottom: 10 }}>
            Templates
          </p>
          <h2 style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: '#201d1d', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Sample Templates
          </h2>
          <p style={{ fontFamily: mono, fontSize: 14, color: '#424245', lineHeight: 1.6 }}>
            Choose a template to open it in the editor — fully editable.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript build**

```bash
cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Visual check**

Open http://localhost:5173/gallery. Verify:
- Cream background, no white or shadowed cards
- Flat hairline-bordered cards with `#f1eeee` thumbnail area
- Ink-fill `[+] Use this template` button
- Monospace wordmark in header, no gradient text
- Cards darken border slightly on hover (no shadow)

- [ ] **Step 4: Commit**

```bash
git add src/components/TemplateGallery.tsx
git commit -m "feat: restyle TemplateGallery with OpenCode cream theme"
```

---

## Task 4: EditorPage restyle

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Replace `EditorPage.tsx` with cream theme**

Full file replacement:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { compileLatex } from '../lib/latexCompiler';
import { saveResume } from '../lib/resumeStorage';

interface Props {
  initialLatex: string;
  onBack: () => void;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

export default function EditorPage({ initialLatex, onBack }: Props) {
  const [source, setSource] = useState(initialLatex);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const prevPdfUrl = useRef<string | null>(null);
  const hasChanged = useRef(false);

  const [splitPct, setSplitPct] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const compile = useCallback(async (latexSource: string, signal?: AbortSignal) => {
    setCompiling(true);
    setCompileError('');
    const result = await compileLatex(latexSource);
    if (signal?.aborted) {
      if (result.ok && result.pdfUrl) URL.revokeObjectURL(result.pdfUrl);
      return;
    }
    setCompiling(false);
    if (result.ok && result.pdfUrl) {
      if (prevPdfUrl.current) URL.revokeObjectURL(prevPdfUrl.current);
      prevPdfUrl.current = result.pdfUrl;
      setPdfUrl(result.pdfUrl);
    } else {
      setCompileError(result.error ?? 'Unknown compile error.');
      setErrorOpen(true);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    compile(initialLatex, ctrl.signal);
    return () => {
      ctrl.abort();
      if (prevPdfUrl.current) URL.revokeObjectURL(prevPdfUrl.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasChanged.current) { hasChanged.current = true; return; }
    const timer = setTimeout(() => saveResume(source), 1000);
    return () => clearTimeout(timer);
  }, [source]);

  const downloadTex = () => {
    const blob = new Blob([source], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'resume.tex'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl; a.download = 'resume.pdf'; a.click();
  };

  const copyTex = () => navigator.clipboard.writeText(source);

  const ghostBtn: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '1px',
    padding: '5px 12px',
    background: 'transparent',
    color: '#646262',
    border: '1px solid rgba(15,0,0,0.15)',
    borderRadius: 4,
    cursor: 'pointer',
  };

  const solidBtn: React.CSSProperties = {
    ...ghostBtn,
    background: '#201d1d',
    color: '#fdfcfc',
    border: '1px solid #201d1d',
  };

  const paneHeader: React.CSSProperties = {
    background: '#fdfcfc',
    borderBottom: '1px solid rgba(15,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    flexShrink: 0,
  };

  const paneLabel: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#9a9898',
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#fdfcfc' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: '0 20px', height: 46, background: '#fdfcfc', borderBottom: '1px solid rgba(15,0,0,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ fontFamily: mono, fontSize: 11, letterSpacing: '1px', color: '#646262', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <span style={{ color: 'rgba(15,0,0,0.15)', fontSize: 12 }}>|</span>
          <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: '#201d1d', letterSpacing: '-0.02em' }}>
            latex-resume
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyTex} style={ghostBtn}>Copy</button>
          <button onClick={downloadTex} style={ghostBtn}>Download .tex</button>
          <button
            onClick={() => compile(source)}
            disabled={compiling}
            style={{ ...solidBtn, opacity: compiling ? 0.5 : 1, cursor: compiling ? 'not-allowed' : 'pointer' }}
          >
            {compiling ? 'Compiling…' : '↺ Recompile'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={!pdfUrl}
            style={{ ...ghostBtn, opacity: !pdfUrl ? 0.4 : 1, cursor: !pdfUrl ? 'not-allowed' : 'pointer' }}
          >
            Download PDF
          </button>
        </div>
      </header>

      {/* Split panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left: LaTeX editor */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${splitPct}%` }}>
          <div style={paneHeader}>
            <span style={paneLabel}>LaTeX Source</span>
            <div className="flex gap-2">
              <button onClick={copyTex} style={ghostBtn}>Copy</button>
              <button onClick={downloadTex} style={ghostBtn}>Download .tex</button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="latex"
              value={source}
              onChange={(val) => setSource(val ?? '')}
              theme="vs"
              options={{
                fontSize: 13,
                lineNumbers: 'on',
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'JetBrains Mono', monospace",
                renderLineHighlight: 'line',
              }}
            />
          </div>

          {/* Compile error panel */}
          {compileError && (
            <div style={{ borderTop: '1px solid rgba(255,59,48,0.25)', background: '#fff8f8', flexShrink: 0 }}>
              <button
                onClick={() => setErrorOpen((o) => !o)}
                className="flex items-center justify-between w-full"
                style={{ padding: '8px 16px', fontFamily: mono, fontSize: 11, fontWeight: 500, color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span>[x] Compile error</span>
                <span>{errorOpen ? '▲' : '▼'}</span>
              </button>
              {errorOpen && (
                <pre style={{ padding: '0 16px 12px', fontFamily: mono, fontSize: 11, color: 'rgba(255,59,48,0.6)', whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: 160 }}>
                  {compileError}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{ width: 1, flexShrink: 0, background: 'rgba(15,0,0,0.1)', cursor: 'col-resize', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,0,0,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,0,0,0.1)'; }}
        />

        {/* Right: PDF preview */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPct}%` }}>
          <div style={paneHeader}>
            <span style={paneLabel}>PDF Preview</span>
          </div>

          <div className="relative flex-1" style={{ background: '#f1eeee' }}>
            {compiling && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#f1eeee' }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(15,0,0,0.1)', borderTopColor: '#201d1d' }} />
                  <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: '#9a9898', textTransform: 'uppercase' }}>
                    Compiling LaTeX…
                  </p>
                </div>
              </div>
            )}

            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full border-0" title="Compiled PDF" />
            ) : !compiling ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span style={{ fontFamily: mono, fontSize: 13, color: '#c4c2c2' }}>[ no preview ]</span>
                <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#c4c2c2' }}>
                  Click Recompile to preview
                </p>
              </div>
            ) : null}
          </div>

          <div style={{ padding: '6px 14px', background: '#fdfcfc', borderTop: '1px solid rgba(15,0,0,0.08)', fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', color: '#9a9898' }}>
            Compiled via LaTeX.Online · click Recompile after edits
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript build**

```bash
cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Visual check**

Navigate to the editor (pick any template from gallery). Verify:
- Cream header with hairline bottom border
- `latex-resume` monospace wordmark
- Ghost/ink buttons (no gold)
- Monaco editor: white/cream background with light syntax highlighting
- `#f1eeee` PDF preview pane background
- 1px hairline divider between panes (widens slightly on hover)
- `[x] Compile error` header if a compile error occurs

- [ ] **Step 4: Commit**

```bash
git add src/pages/EditorPage.tsx
git commit -m "feat: restyle EditorPage with OpenCode cream theme"
```

---

## Done

All four tasks complete. The app now uses:
- JetBrains Mono throughout
- `#fdfcfc` warm cream canvas on all pages
- `#201d1d` ink-black for text and primary actions
- 1px hairline borders, no shadows
- ASCII `[+]` / `[-]` / `[x]` markers
- Light Monaco editor theme (`vs`)
