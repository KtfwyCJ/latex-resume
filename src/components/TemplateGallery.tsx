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
      className="flex flex-col overflow-hidden transition-all duration-200 bg-white border border-gray-100 shadow-sm cursor-pointer group rounded-2xl hover:shadow-lg hover:border-primary"
      onClick={() => onSelect(template.latex)}
    >
      {/* Thumbnail */}
      <div className="flex items-center justify-center overflow-hidden bg-gray-50" style={{ height: '340px' }}>
        {loading && (
          <div className="flex flex-col items-center gap-3 text-gray-300">
            <div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-primary animate-spin" />
            <span className="text-xs">Rendering preview…</span>
          </div>
        )}
        {!loading && thumb && (
          <img
            src={`data:image/png;base64,${thumb}`}
            alt={`${template.name} preview`}
            className="object-contain w-auto h-full"
          />
        )}
        {!loading && failed && (
          <div className="px-6 text-xs text-center text-gray-300">Preview unavailable</div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 border-t border-gray-100">
        <p className="mb-1 font-bold text-gray-800">{template.name}</p>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">{template.description}</p>
        <button className="
          w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm tracking-wide
              shadow-lg hover:bg-primary/90 transition-colors duration-200
        ">
          Use this template
        </button>
      </div>
    </div>
  );
}

export default function TemplateGallery({ templates, onSelect, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-primary"
          >
            ← Back
          </button>
          <span className="text-gray-200">|</span>
          <span className="font-bold tracking-tight text-gray-800">
            LaTeX{' '}
            <span className="text-primary">
              Resume Builder
            </span>
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-6xl px-8 py-10 mx-auto">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-extrabold text-gray-900">Sample Templates</h2>
          <p className="text-gray-500">Choose a template to open it in the editor — fully editable.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
