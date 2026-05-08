import { useEffect, useState } from 'react';
import { clearResume, loadResume } from '../lib/resumeStorage';
import type { Draft } from '../lib/resumeStorage';

function draftAge(savedAt: number): string {
  const days = Math.floor((Date.now() - savedAt) / 86_400_000);
  return days < 1 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

function ResumeFragment({ x, y, rotate, opacity, name, section, bars, bullets }: {
  x: number; y: number; rotate: number; opacity: number;
  name: string; section: string;
  bars: number[];
  bullets: number[];
}) {
  const w = 130;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`} opacity={opacity}>
      <text fontFamily="Georgia,serif" fontSize={11} fontWeight="bold" fill="#201d1d" x={0} y={0}>{name}</text>
      <line x1={0} y1={4} x2={w} y2={4} stroke="#201d1d" strokeWidth={0.7}/>
      <text fontFamily="monospace" fontSize={6} fill="#201d1d" letterSpacing={1.5} x={0} y={16}>{section}</text>
      <line x1={0} y1={19} x2={w} y2={19} stroke="#201d1d" strokeWidth={0.4}/>
      {bars.map((bw, i) => (
        <rect key={i} x={0} y={26 + i * 7} width={bw} height={2.5} rx={1} fill="#201d1d" opacity={0.55 - i * 0.05}/>
      ))}
      {bullets.map((bw, i) => (
        <g key={i}>
          <circle cx={4} cy={26 + bars.length * 7 + 10 + i * 7} r={1.5} fill="#201d1d"/>
          <rect x={11} y={26 + bars.length * 7 + 7.5 + i * 7} width={bw} height={2.5} rx={1} fill="#201d1d" opacity={0.5 - i * 0.04}/>
        </g>
      ))}
    </g>
  );
}

interface Props {
  onOpenEditor: (latex: string) => void;
  onOpenGallery: () => void;
}

export default function LandingPage({ onOpenEditor, onOpenGallery }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => { setDraft(loadResume()); }, []);

  return (
    <div style={{ background: '#fdfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Ghost resume fragment background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

          {/* ── Top-left ── */}
          <ResumeFragment x={20}  y={45}  rotate={-7} opacity={0.055} name="Alex Chen"     section="EXPERIENCE"      bars={[125,110,118]} bullets={[100,85]}/>
          <ResumeFragment x={15}  y={210} rotate={-4} opacity={0.04}  name="Maria Santos"  section="EDUCATION"       bars={[120,105]}     bullets={[90]}/>
          <ResumeFragment x={90}  y={345} rotate={-9} opacity={0.035} name="James Li"      section="SKILLS"          bars={[115,100,108]} bullets={[]}/>

          {/* ── Top-right ── */}
          <ResumeFragment x={1270} y={30}  rotate={8}  opacity={0.05}  name="Sarah Kim"    section="EXPERIENCE"      bars={[125,112,120]} bullets={[95,82]}/>
          <ResumeFragment x={1290} y={195} rotate={5}  opacity={0.04}  name="Tom Park"     section="PUBLICATIONS"    bars={[122,108]}     bullets={[88,75]}/>
          <ResumeFragment x={1265} y={330} rotate={10} opacity={0.035} name="Emma Davis"   section="EDUCATION"       bars={[118,103]}     bullets={[]}/>

          {/* ── Mid-left ── */}
          <ResumeFragment x={10}  y={420} rotate={-6} opacity={0.045} name="Lucas Brown"   section="WORK EXPERIENCE" bars={[126,111,116]} bullets={[98,84]}/>
          <ResumeFragment x={40}  y={560} rotate={-10} opacity={0.035} name="Priya Patel"  section="SKILLS"          bars={[120,105,112]} bullets={[]}/>

          {/* ── Mid-right ── */}
          <ResumeFragment x={1300} y={425} rotate={7}  opacity={0.04}  name="Chen Wei"     section="PROJECTS"        bars={[124,109,117]} bullets={[92]}/>
          <ResumeFragment x={1288} y={558} rotate={9}  opacity={0.035} name="Ana Lima"     section="AWARDS"          bars={[119,104]}     bullets={[87]}/>

          {/* ── Bottom-left ── */}
          <ResumeFragment x={25}  y={650} rotate={-8} opacity={0.05}  name="David Wilson"  section="EDUCATION"       bars={[123,108,115]} bullets={[96]}/>
          <ResumeFragment x={10}  y={775} rotate={-5} opacity={0.04}  name="Nina Rossi"    section="EXPERIENCE"      bars={[121,106]}     bullets={[91,78]}/>
          <ResumeFragment x={80}  y={858} rotate={-9} opacity={0.035} name="Ryan Lee"      section="SKILLS"          bars={[117,102,110]} bullets={[]}/>

          {/* ── Bottom-right ── */}
          <ResumeFragment x={1255} y={645} rotate={6}  opacity={0.045} name="Yuki Tanaka"  section="EXPERIENCE"      bars={[126,111,119]} bullets={[97,83]}/>
          <ResumeFragment x={1270} y={768} rotate={9}  opacity={0.04}  name="Sofia Garcia" section="PUBLICATIONS"    bars={[122,107]}     bullets={[89,76]}/>
          <ResumeFragment x={1248} y={858} rotate={7}  opacity={0.035} name="Omar Hassan"  section="EDUCATION"       bars={[118,103,111]} bullets={[]}/>

          {/* ── Center band (very faded) ── */}
          <ResumeFragment x={620} y={65}  rotate={-3} opacity={0.028} name="Jordan Lee"    section="EXPERIENCE"      bars={[125,110,118]} bullets={[100,85]}/>
          <ResumeFragment x={650} y={805} rotate={4}  opacity={0.025} name="Casey Morgan"  section="SKILLS"          bars={[120,105,113]} bullets={[]}/>

        </svg>
      </div>

      {/* Draft banner */}
      {draft && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px',
          background: 'rgba(253,252,252,0.92)',
          borderBottom: '1px solid rgba(15,0,0,0.12)',
          fontFamily: mono, fontSize: 12, color: '#424245',
          position: 'relative', zIndex: 10,
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
        background: 'rgba(253,252,252,0.85)',
        backdropFilter: 'blur(8px)',
        position: 'relative', zIndex: 10,
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

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '120px 24px 48px', position: 'relative', zIndex: 10 }}>
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
