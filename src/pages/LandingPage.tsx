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
  const w = 190;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`} opacity={opacity}>
      <text fontFamily="Georgia,serif" fontSize={16} fontWeight="bold" fill="#201d1d" x={0} y={16}>{name}</text>
      <line x1={0} y1={21} x2={w} y2={21} stroke="#201d1d" strokeWidth={1}/>
      <text fontFamily="monospace" fontSize={9} fill="#201d1d" letterSpacing={5} x={0} y={33}>{section}</text>
      <line x1={0} y1={38} x2={w} y2={38} stroke="#201d1d" strokeWidth={0.6}/>
      {bars.map((bw, i) => (
        <rect key={i} x={0} y={46 + i * 10} width={bw} height={3.5} rx={1.5} fill="#201d1d" opacity={0.55 - i * 0.05}/>
      ))}
      {bullets.map((bw, i) => (
        <g key={i}>
          <circle cx={5} cy={46 + bars.length * 10 + 12 + i * 10} r={2} fill="#201d1d"/>
          <rect x={13} y={46 + bars.length * 10 + 9 + i * 10} width={bw} height={3.5} rx={1.5} fill="#201d1d" opacity={0.5 - i * 0.04}/>
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

          {/* ── Left column ── */}
          <ResumeFragment x={35}  y={50}  rotate={-7} opacity={0.13} name="Alex Chen"     section="EXPERIENCE"      bars={[182,162,172]} bullets={[148,128]}/>
          <ResumeFragment x={20}  y={245} rotate={-4} opacity={0.10} name="Maria Santos"  section="EDUCATION"       bars={[178,155]}     bullets={[135]}/>
          <ResumeFragment x={50}  y={450} rotate={-9} opacity={0.11} name="James Li"      section="SKILLS"          bars={[170,148,160]} bullets={[]}/>
          <ResumeFragment x={30}  y={660} rotate={-6} opacity={0.12} name="David Wilson"  section="EDUCATION"       bars={[180,160,168]} bullets={[142]}/>
          <ResumeFragment x={15}  y={820} rotate={-8} opacity={0.10} name="Nina Rossi"    section="EXPERIENCE"      bars={[176,158]}     bullets={[136,118]}/>

          {/* ── Left-center column ── */}
          <ResumeFragment x={330} y={75}  rotate={5}  opacity={0.09} name="Tom Park"      section="PUBLICATIONS"    bars={[178,158]}     bullets={[130,112]}/>
          <ResumeFragment x={355} y={310} rotate={-7} opacity={0.08} name="Lucas Brown"   section="WORK EXPERIENCE" bars={[184,164,172]} bullets={[145,124]}/>
          <ResumeFragment x={315} y={555} rotate={6}  opacity={0.09} name="Priya Patel"   section="SKILLS"          bars={[176,154,165]} bullets={[]}/>
          <ResumeFragment x={345} y={790} rotate={-5} opacity={0.08} name="Ryan Lee"      section="EDUCATION"       bars={[172,150,162]} bullets={[]}/>

          {/* ── Center column (behind hero — slightly more faded) ── */}
          <ResumeFragment x={630} y={50}  rotate={-3} opacity={0.07} name="Jordan Lee"    section="EXPERIENCE"      bars={[182,162,172]} bullets={[148,126]}/>
          <ResumeFragment x={610} y={420} rotate={2}  opacity={0.06} name="Alex Park"     section="EDUCATION"       bars={[176,155]}     bullets={[133]}/>
          <ResumeFragment x={650} y={800} rotate={4}  opacity={0.07} name="Casey Morgan"  section="SKILLS"          bars={[176,154,166]} bullets={[]}/>

          {/* ── Right-center column ── */}
          <ResumeFragment x={900} y={80}  rotate={-6} opacity={0.09} name="Chen Wei"      section="PROJECTS"        bars={[180,160,172]} bullets={[136]}/>
          <ResumeFragment x={925} y={325} rotate={7}  opacity={0.08} name="Ana Lima"      section="AWARDS"          bars={[174,152]}     bullets={[128]}/>
          <ResumeFragment x={890} y={570} rotate={-5} opacity={0.09} name="Emma Davis"    section="SKILLS"          bars={[172,150]}     bullets={[]}/>
          <ResumeFragment x={915} y={795} rotate={6}  opacity={0.08} name="Omar Hassan"   section="EDUCATION"       bars={[172,150,163]} bullets={[]}/>

          {/* ── Right column ── */}
          <ResumeFragment x={1200} y={45}  rotate={8}  opacity={0.13} name="Sarah Kim"    section="EXPERIENCE"      bars={[182,166,176]} bullets={[140,122]}/>
          <ResumeFragment x={1210} y={240} rotate={5}  opacity={0.10} name="Yuki Tanaka"  section="WORK EXPERIENCE" bars={[184,164,175]} bullets={[144,124]}/>
          <ResumeFragment x={1195} y={460} rotate={9}  opacity={0.11} name="Sofia Garcia" section="PUBLICATIONS"    bars={[178,158]}     bullets={[132,114]}/>
          <ResumeFragment x={1205} y={670} rotate={7}  opacity={0.12} name="Tom Chen"     section="EDUCATION"       bars={[174,152,164]} bullets={[]}/>
          <ResumeFragment x={1198} y={820} rotate={10} opacity={0.10} name="Lena Park"    section="SKILLS"          bars={[176,154,166]} bullets={[]}/>

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
