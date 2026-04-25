# E-Magazine Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire app with an ink-black/paper-white editorial magazine aesthetic, including a WebGL fluid simulation on the landing hero.

**Architecture:** Four independent changes applied in sequence — foundation tokens first, then the WebGL `FluidCanvas` component, then `LandingPage` visual rework, then `EditorPage` rework. Each task compiles cleanly and can be committed independently.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS 3 + Vite + Monaco Editor. WebGL via browser-native API (no libraries). Fonts from Google Fonts.

**Spec:** `docs/superpowers/specs/2026-04-25-e-magazine-theme-design.md`

---

### Task 1: Foundation — Fonts, Tailwind tokens, base CSS

**Files:**
- Modify: `index.html`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts to `index.html`**

  Replace the existing `<head>` block in `index.html` with:

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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=EB+Garamond:ital,wght@0,400;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 2: Update `tailwind.config.js` with new colour tokens**

  Replace the full file content:

  ```js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          ink:          '#080808',
          paper:        '#faf8f4',
          'paper-card': '#ffffff',
          gold:         '#c8a97e',
          'ink-text':   '#1a1614',
          'ink-muted':  '#7a6f6a',
          // Keep original tokens — used by LaTeX template previews
          primary:   '#1B211A',
          secondary: '#628141',
          accent:    '#8BAE66',
          neutral:   '#EBD5AB',
        },
      },
    },
    plugins: [],
  }
  ```

- [ ] **Step 3: Update `src/index.css` base styles**

  Replace the full file content:

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
    background-color: #faf8f4;
    font-family: 'EB Garamond', Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
  ```

  Expected: exits 0 with no TypeScript errors.

- [ ] **Step 5: Commit**

  ```bash
  git add index.html tailwind.config.js src/index.css
  git commit -m "feat: add magazine theme foundation — fonts, colour tokens, base CSS"
  ```

---

### Task 2: FluidCanvas WebGL component

**Files:**
- Create: `src/components/FluidCanvas.tsx`

- [ ] **Step 1: Create `src/components/FluidCanvas.tsx`**

  ```tsx
  import { useEffect, useRef } from 'react';

  const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}`;

  const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_res;

  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }

  float fbm(vec2 p){
    float v=0.;float a=.5;
    vec2 s=vec2(100.);
    mat2 r=mat2(.8,.6,-.6,.8);
    for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.+s;a*=.5;}
    return v;
  }

  void main(){
    vec2 uv=gl_FragCoord.xy/u_res;
    float t=u_time*.12;
    vec2 q=vec2(fbm(uv+t*.4),fbm(uv+vec2(1.)));
    vec2 r=vec2(
      fbm(uv+q+vec2(1.7,9.2)+t*.15),
      fbm(uv+q+vec2(8.3,2.8)+t*.13)
    );
    float f=fbm(uv+r);
    vec3 col=mix(vec3(.05,.02,.01),vec3(.45,.25,.08),clamp(f*f*2.5,0.,1.));
    col=mix(col,vec3(.55,.32,.1),clamp(length(q)*.4,0.,1.));
    float alpha=clamp(f*.3,0.,.25);
    gl_FragColor=vec4(col,alpha);
  }
  `;

  interface Props {
    speed?: number;
  }

  export default function FluidCanvas({ speed = 1 }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = ref.current;
      if (!canvas) return;
      const gl = canvas.getContext('webgl', { alpha: true });
      if (!gl) return;

      const mkShader = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };

      const prog = gl.createProgram()!;
      gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
        gl.STATIC_DRAW,
      );
      const posLoc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes  = gl.getUniformLocation(prog, 'u_res');
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      let rafId: number;
      const t0 = performance.now();

      const resize = () => {
        const w = Math.floor(canvas.offsetWidth  * 0.5);
        const h = Math.floor(canvas.offsetHeight * 0.5);
        if (w === 0 || h === 0) return;
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      };

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      const draw = (now: number) => {
        const t = ((now - t0) / 1000) * speed;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rafId = requestAnimationFrame(draw);
      };
      rafId = requestAnimationFrame(draw);

      return () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        gl.deleteProgram(prog);
        gl.deleteBuffer(buf);
      };
    }, [speed]);

    return (
      <canvas
        ref={ref}
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
  ```

  Expected: exits 0.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/FluidCanvas.tsx
  git commit -m "feat: add FluidCanvas WebGL fluid simulation component"
  ```

---

### Task 3: Landing Page visual rework

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Replace `src/pages/LandingPage.tsx` with the new magazine design**

  ```tsx
  import { useCallback, useEffect, useRef, useState } from 'react';
  import { renderPagesAsImages } from '../lib/pdfParser';
  import { clearResume, loadResume } from '../lib/resumeStorage';
  import type { Draft } from '../lib/resumeStorage';
  import FluidCanvas from '../components/FluidCanvas';

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
      <div style={{ background: '#080808' }}>
        {/* Draft banner */}
        {draft && (
          <div
            className="fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
            style={{
              background: 'rgba(200,169,126,0.1)',
              borderBottom: '1px solid rgba(200,169,126,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontFamily: '"EB Garamond", serif', color: 'rgba(245,240,232,0.75)' }}>
              You have changes saved {draftAge(draft.savedAt)} —{' '}
              <button
                onClick={() => onParsed(draft.latex)}
                style={{
                  color: '#c8a97e',
                  fontFamily: '"EB Garamond", serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  fontStyle: 'italic',
                  fontSize: 'inherit',
                }}
              >
                Resume editing →
              </button>
            </span>
            <button
              onClick={() => { clearResume(); setDraft(null); }}
              aria-label="Dismiss"
              style={{ color: 'rgba(245,240,232,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Hero (ink-black) ── */}
        <section
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ minHeight: '100vh', background: '#080808', padding: '80px 16px' }}
        >
          <FluidCanvas speed={0.5} />

          <p
            className="relative z-10 mb-5"
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: 'rgba(210,185,140,0.5)',
            }}
          >
            LaTeX Resume Builder
          </p>

          <h1
            className="relative z-10 text-center mb-4"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(42px, 7vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#f5f0e8',
              letterSpacing: '-0.02em',
            }}
          >
            Craft Your
            <br />
            <em style={{ color: '#c8a97e', fontStyle: 'italic' }}>Professional</em>
            <br />
            Story
          </h1>

          <p
            className="relative z-10 text-center mb-10"
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 18,
              fontStyle: 'italic',
              lineHeight: 1.65,
              color: 'rgba(245,240,232,0.55)',
              maxWidth: 420,
            }}
          >
            Professional templates, live LaTeX editor, instant PDF —
            <br />
            or import your existing resume.
          </p>

          {/* CTA group */}
          <div className="relative z-10 w-full" style={{ maxWidth: 420 }}>
            {/* Template card */}
            <div
              style={{
                background: 'rgba(245,240,232,0.06)',
                border: '1px solid rgba(245,240,232,0.12)',
                borderRadius: 4,
                padding: '24px 28px',
                marginBottom: 16,
              }}
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['Modern', 'Classic', 'Minimal', 'Sidebar', 'Executive'].map((n) => (
                  <span
                    key={n}
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: 'rgba(200,169,126,0.7)',
                      background: 'rgba(200,169,126,0.1)',
                      border: '1px solid rgba(200,169,126,0.2)',
                      padding: '3px 8px',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#f5f0e8',
                  marginBottom: 6,
                }}
              >
                Start from a Template
              </h2>
              <p
                style={{
                  fontFamily: '"EB Garamond", serif',
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'rgba(245,240,232,0.45)',
                  marginBottom: 16,
                }}
              >
                10+ professional designs, live LaTeX editor, instant PDF preview.
              </p>
              <button
                onClick={onOpenGallery}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 20px',
                  background: '#c8a97e',
                  color: '#0a0806',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                Browse Templates →
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.12)' }} />
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 9,
                  letterSpacing: 2,
                  color: 'rgba(245,240,232,0.25)',
                  textTransform: 'uppercase',
                }}
              >
                or import your PDF
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.12)' }} />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `1px dashed ${isDragging ? 'rgba(200,169,126,0.6)' : 'rgba(245,240,232,0.15)'}`,
                borderRadius: 4,
                padding: '18px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'rgba(200,169,126,0.06)' : 'transparent',
                transition: 'border-color 0.2s, background 0.2s',
                userSelect: 'none',
              }}
            >
              <p
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.3)',
                  marginBottom: 4,
                }}
              >
                {isDragging ? 'Release to upload' : 'Drop your PDF here'}
              </p>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.18)' }}>
                PDF only · Max 10 MB
              </span>
            </div>
          </div>
        </section>

        {/* ── Paper transition ── */}
        <div style={{ height: 60, background: 'linear-gradient(to bottom, #080808, #faf8f4)' }} />

        {/* ── Paper body ── */}
        <section style={{ background: '#faf8f4', padding: '40px 16px 64px' }}>
          {error && (
            <div
              className="max-w-md mx-auto mb-6"
              style={{
                background: 'rgba(255,240,240,0.8)',
                border: '1px solid rgba(180,60,60,0.25)',
                borderRadius: 4,
                padding: '12px 20px',
                color: '#8b3030',
                fontSize: 14,
                fontFamily: '"EB Garamond", serif',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
          <div
            className="max-w-md mx-auto"
            style={{
              background: '#fff',
              border: '1px solid rgba(61,53,48,0.18)',
              borderRadius: 2,
              padding: '32px 28px',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(61,53,48,0.06)',
            }}
          >
            <h4
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 20,
                fontWeight: 700,
                color: '#1a1614',
                marginBottom: 6,
              }}
            >
              Import Your Résumé
            </h4>
            <p
              style={{
                fontFamily: '"EB Garamond", serif',
                fontStyle: 'italic',
                fontSize: 15,
                lineHeight: 1.5,
                color: '#7a6f6a',
                marginBottom: 20,
              }}
            >
              Drop a PDF and we'll convert it to editable LaTeX
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                padding: '10px 24px',
                border: '1px solid #3d3530',
                color: '#3d3530',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: 1,
              }}
            >
              Browse File
            </button>
          </div>
        </section>

        {/* Hidden file input — shared between drop zone and paper button */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />

        {/* ── Preview modal ── */}
        {previewFile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 4,
                border: '1px solid rgba(61,53,48,0.12)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                maxWidth: 520,
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Modal header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(61,53,48,0.1)',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1a1614',
                      maxWidth: 280,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {previewFile.name}
                  </p>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#7a6f6a', marginTop: 2 }}>
                    {formatSize(previewFile.size)}
                  </p>
                </div>
                <button
                  onClick={cancelPreview}
                  style={{ color: '#7a6f6a', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* PDF thumbnail */}
              <div
                style={{
                  background: '#faf8f4',
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 260,
                }}
              >
                {previewImg ? (
                  <img
                    src={`data:image/png;base64,${previewImg}`}
                    alt="Resume preview"
                    style={{
                      maxHeight: 256,
                      objectFit: 'contain',
                      border: '1px solid rgba(61,53,48,0.12)',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(61,53,48,0.08)',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(61,53,48,0.15)', borderTopColor: '#c8a97e' }}
                    />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(61,53,48,0.35)', letterSpacing: 1 }}>
                      Loading preview…
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                  padding: '14px 20px',
                  borderTop: '1px solid rgba(61,53,48,0.1)',
                }}
              >
                <button
                  onClick={cancelPreview}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#7a6f6a',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmConvert}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: '#c8a97e',
                    color: '#0a0806',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: 2,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="w-3 h-3 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(10,8,6,0.3)', borderTopColor: '#0a0806' }}
                      />
                      Converting…
                    </>
                  ) : (
                    'Convert to LaTeX'
                  )}
                </button>
              </div>

              {loading && (
                <p
                  className="animate-pulse"
                  style={{
                    paddingBottom: 14,
                    textAlign: 'center',
                    fontFamily: '"EB Garamond", serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: '#c8a97e',
                  }}
                >
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

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
  ```

  Expected: exits 0.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/LandingPage.tsx
  git commit -m "feat: restyle LandingPage with ink-black hero and paper-white body"
  ```

---

### Task 4: Editor Page visual rework

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Replace `src/pages/EditorPage.tsx` with the magazine editor design**

  ```tsx
  import { useCallback, useEffect, useRef, useState } from 'react';
  import Editor from '@monaco-editor/react';
  import { compileLatex } from '../lib/latexCompiler';
  import { saveResume } from '../lib/resumeStorage';

  interface Props {
    initialLatex: string;
    onBack: () => void;
  }

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

    const compile = async (latexSource: string) => {
      setCompiling(true);
      setCompileError('');
      const result = await compileLatex(latexSource);
      setCompiling(false);
      if (result.ok && result.pdfUrl) {
        if (prevPdfUrl.current) URL.revokeObjectURL(prevPdfUrl.current);
        prevPdfUrl.current = result.pdfUrl;
        setPdfUrl(result.pdfUrl);
      } else {
        setCompileError(result.error ?? 'Unknown compile error.');
        setErrorOpen(true);
      }
    };

    useEffect(() => {
      compile(initialLatex);
      return () => { if (prevPdfUrl.current) URL.revokeObjectURL(prevPdfUrl.current); };
    }, []);

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
      fontFamily: 'DM Mono, monospace',
      fontSize: 9,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      padding: '5px 12px',
      background: 'rgba(245,240,232,0.07)',
      color: 'rgba(245,240,232,0.5)',
      border: '1px solid rgba(245,240,232,0.12)',
      borderRadius: 2,
      cursor: 'pointer',
    };

    const solidBtn: React.CSSProperties = {
      ...ghostBtn,
      background: '#c8a97e',
      color: '#0a0806',
      border: '1px solid #c8a97e',
    };

    const paneHeader: React.CSSProperties = {
      background: '#161616',
      borderBottom: '1px solid rgba(200,169,126,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      flexShrink: 0,
    };

    const paneLabel: React.CSSProperties = {
      fontFamily: 'DM Mono, monospace',
      fontSize: 9,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: 'rgba(200,169,126,0.4)',
    };

    return (
      <div className="flex flex-col h-screen" style={{ background: '#0d0d0d' }}>
        {/* Top bar */}
        <header
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: '0 20px',
            height: 46,
            background: '#0d0d0d',
            borderBottom: '1px solid rgba(200,169,126,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 9,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.35)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <span style={{ color: 'rgba(200,169,126,0.2)', fontSize: 12 }}>|</span>
            <span
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 16,
                fontWeight: 700,
                color: '#f5f0e8',
                letterSpacing: '-0.02em',
              }}
            >
              LaTeX{' '}
              <em style={{ color: '#c8a97e', fontStyle: 'italic' }}>Resume Builder</em>
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
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  renderLineHighlight: 'line',
                }}
              />
            </div>

            {/* Compile error panel */}
            {compileError && (
              <div
                style={{
                  borderTop: '1px solid rgba(200,80,80,0.3)',
                  background: '#1a0f0f',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setErrorOpen((o) => !o)}
                  className="flex items-center justify-between w-full"
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(220,80,80,0.7)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span>⚠ Compile error</span>
                  <span>{errorOpen ? '▲' : '▼'}</span>
                </button>
                {errorOpen && (
                  <pre
                    style={{
                      padding: '0 16px 12px',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 11,
                      color: 'rgba(220,80,80,0.6)',
                      whiteSpace: 'pre-wrap',
                      overflowY: 'auto',
                      maxHeight: 160,
                    }}
                  >
                    {compileError}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Draggable divider */}
          <div
            onMouseDown={onDividerMouseDown}
            style={{
              width: 3,
              flexShrink: 0,
              background: 'rgba(200,169,126,0.15)',
              cursor: 'col-resize',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,169,126,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,169,126,0.15)'; }}
          />

          {/* Right: PDF preview */}
          <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPct}%` }}>
            <div
              style={{
                ...paneHeader,
                background: '#0d0d0d',
                borderBottom: '1px solid rgba(200,169,126,0.1)',
              }}
            >
              <span style={paneLabel}>PDF Preview</span>
            </div>

            <div className="relative flex-1" style={{ background: '#faf8f4' }}>
              {compiling && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  style={{ background: '#faf8f4' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-8 h-8 border-4 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(61,53,48,0.15)', borderTopColor: '#c8a97e' }}
                    />
                    <p
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 11,
                        letterSpacing: 1,
                        color: 'rgba(61,53,48,0.4)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Compiling LaTeX…
                    </p>
                  </div>
                </div>
              )}

              {pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full border-0" title="Compiled PDF" />
              ) : !compiling ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-3"
                  style={{ color: 'rgba(61,53,48,0.25)' }}
                >
                  <span style={{ fontSize: 48 }}>📄</span>
                  <p
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Click Recompile to preview
                  </p>
                </div>
              ) : null}
            </div>

            <div
              style={{
                padding: '6px 14px',
                background: '#0d0d0d',
                borderTop: '1px solid rgba(200,169,126,0.08)',
                fontFamily: 'DM Mono, monospace',
                fontSize: 9,
                letterSpacing: 1,
                textTransform: 'uppercase',
                textAlign: 'center',
                color: 'rgba(200,169,126,0.2)',
              }}
            >
              Compiled via LaTeX.Online · click Recompile after edits
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd /Users/chengjing/Desktop/Github/latex-resume && npm run build
  ```

  Expected: exits 0.

- [ ] **Step 3: Visual verification — start dev server**

  ```bash
  cd /Users/chengjing/Desktop/Github/latex-resume && npm run dev
  ```

  Open http://localhost:5173 and verify:
  - Landing page shows ink-black hero with WebGL fluid animation
  - Gold serif headline "Craft Your *Professional* Story"
  - Amber "Browse Templates →" button
  - Dashed PDF drop zone
  - Gradient dissolves into paper-white body below
  - Paper-white section shows "Import Your Résumé" card
  - Navigate to `/gallery`, pick a template → Editor page opens with dark chrome header and paper-white PDF preview

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/EditorPage.tsx
  git commit -m "feat: restyle EditorPage with ink-black chrome and paper-white PDF preview"
  ```
