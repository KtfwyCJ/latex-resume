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
