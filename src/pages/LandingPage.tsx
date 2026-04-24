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

export default function LandingPage({ onParsed, onOpenGallery }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    setDraft(loadResume());
  }, []);

  // Render first page to canvas image when a file is selected
  useEffect(() => {
    if (!previewFile) { setPreviewImg(null); return; }
    let cancelled = false;
    renderFirstPage(previewFile).then((img) => {
      if (!cancelled) setPreviewImg(img);
    });
    return () => { cancelled = true; };
  }, [previewFile]);

  const validateAndPreview = useCallback((file: File) => {
    setError('');
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-50">
      {/* Resume draft banner */}
      {draft && (
        <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-800 text-white text-sm bg-gradient-to-r from-sky-600 to-teal-500 ">
          <span className="flex items-center gap-2">
            <span>You have changes saved {draftAge(draft.savedAt)} —</span>
            <button
              onClick={() => onParsed(draft.latex)}
              className="font-semibold underline transition-colors underline-offset-2 hover:text-slate-300"
            >
              Resume editing →
            </button>
          </span>
          <button
            onClick={() => { clearResume(); setDraft(null); }}
            className="leading-none text-white transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Headline */}
      <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-center text-slate-800">
        LaTeX Based{' '}
        <span className="text-transparent bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text">
          Resume Builder
        </span>
      </h1>
      <p className="max-w-md mb-10 text-lg leading-relaxed text-center text-gray-500">
        Pick a professional template and edit it live — or import your existing PDF resume.
      </p>

      {/* Primary CTA: Templates */}
      <div className="w-full max-w-md shadow-xl rounded-2xl bg-slate-800 shadow-slate-200">
        <div className="px-8 py-8 text-center rounded-2xl bg-slate-800">
          {/* Mini template chips */}
          <div className="flex justify-center gap-2 mb-6">
            {['Modern', 'Classic', 'Minimal', 'Sidebar', 'Executive'].map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-semibold tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
            Start from a Template
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 mb-7">
            10+ professional designs ready to customize with a live LaTeX editor and instant PDF preview.
          </p>
          <button
            onClick={onOpenGallery}
            className="
              w-full py-3.5 rounded-xl bg-white text-slate-800 font-bold text-sm tracking-wide
              shadow-lg hover:bg-slate-50 transition-colors duration-200
            "
          >
            Browse Templates →
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full max-w-md gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">or import your PDF</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Secondary CTA: PDF upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-md border-2 border-dashed rounded-2xl px-8 py-6 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragging
            ? 'border-sky-400 bg-sky-50'
            : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40'}
        `}
      >
        <p className="mb-1 text-sm font-semibold text-gray-500">
          {isDragging ? 'Release to upload' : 'Drop your PDF here'}
        </p>
        <p className="mb-4 text-xs text-gray-400">PDF only · Max 10 MB</p>
        <button
          className="
            px-6 py-2.5 rounded-xl text-slate-700 text-sm font-bold border-2 border-slate-200
            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
          "
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Browse File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {error && (
        <p className="max-w-md px-5 py-3 mt-5 text-sm text-center text-red-500 border border-red-200 bg-red-50 rounded-xl">
          {error}
        </p>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="max-w-xs text-sm font-semibold text-gray-800 truncate">{previewFile.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatSize(previewFile.size)}</p>
              </div>
              <button
                onClick={cancelPreview}
                className="text-lg leading-none text-gray-400 transition-colors hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* PDF thumbnail */}
            <div className="bg-gray-50 px-5 py-4 flex items-center justify-center min-h-[16rem]">
              {previewImg ? (
                <img
                  src={`data:image/png;base64,${previewImg}`}
                  alt="Resume preview"
                  className="object-contain w-auto border border-gray-200 rounded-lg shadow-sm max-h-64"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-accent animate-spin" />
                  <span className="text-xs">Loading preview…</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={cancelPreview}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmConvert}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all duration-200 rounded-lg shadow bg-gradient-to-r from-secondary to-accent shadow-secondary/20 hover:from-primary hover:to-secondary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Converting…
                  </>
                ) : (
                  'Convert to LaTeX'
                )}
              </button>
            </div>

            {loading && (
              <p className="pb-4 text-xs text-center text-accent animate-pulse">
                AI is analyzing your resume… this may take 15–30 seconds.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
