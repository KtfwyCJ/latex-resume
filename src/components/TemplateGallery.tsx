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
