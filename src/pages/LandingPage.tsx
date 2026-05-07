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
            aria-label="Dismiss"
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
          {error && (
            <p style={{ marginTop: 12, fontFamily: mono, fontSize: 12, color: '#ff3b30' }}>
              [x] {error}
            </p>
          )}
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
