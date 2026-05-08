import { useEffect, useState } from 'react';
import { clearResume, loadResume } from '../lib/resumeStorage';
import type { Draft } from '../lib/resumeStorage';

function draftAge(savedAt: number): string {
  const days = Math.floor((Date.now() - savedAt) / 86_400_000);
  return days < 1 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

interface Props {
  onOpenEditor: (latex: string) => void;
  onOpenGallery: () => void;
}

export default function LandingPage({ onOpenEditor, onOpenGallery }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => { setDraft(loadResume()); }, []);

  return (
    <div style={{ background: '#fdfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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
              onClick={() => onOpenEditor(draft.latex)}
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
      }}>
        <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: '#201d1d', letterSpacing: '-0.02em' }}>
          latex-resume
        </span>
        <button
          onClick={onOpenGallery}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 12, color: '#646262' }}
        >
          Templates
        </button>
      </nav>

      {/* Hero — vertically centered in remaining space */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '120px 24px 48px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#646262', marginBottom: 20 }}>
            LaTeX Resume Builder
          </p>
          <h1 style={{ fontFamily: mono, fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700, lineHeight: 1.25, color: '#201d1d', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Professional resumes,<br />written in LaTeX.
          </h1>
          <p style={{ fontFamily: mono, fontSize: 14, lineHeight: 1.6, color: '#424245', marginBottom: 32 }}>
            Pick a template, edit in the live editor, and export a crisp PDF.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
            {['Ember', 'Classic', 'Sharp', 'Executive', 'Two Column', 'Photo'].map((n) => (
              <span
                key={n}
                style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#424245', border: '1px solid rgba(15,0,0,0.15)', padding: '2px 8px', borderRadius: 2 }}
              >
                {n}
              </span>
            ))}
          </div>
          <button
            onClick={onOpenGallery}
            style={{
              fontFamily: mono, fontSize: 12, fontWeight: 500,
              padding: '10px 28px',
              background: '#201d1d', color: '#fdfcfc',
              border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.5px',
            }}
          >
            [+] Browse Templates
          </button>
        </div>
      </div>

    </div>
  );
}
