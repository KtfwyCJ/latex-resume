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
