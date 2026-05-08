import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { compileLatex } from '../lib/latexCompiler';
import { saveResume } from '../lib/resumeStorage';
import PdfViewer from '../components/PdfViewer';

interface Props {
  initialLatex: string;
  onBack: () => void;
}

const mono = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

export default function EditorPage({ initialLatex, onBack }: Props) {
  const [source, setSource] = useState(initialLatex);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const prevPdfUrl = useRef<string | null>(null);
  const hasChanged = useRef(false);

  const [splitPct, setSplitPct] = useState(50);
  const [zoom, setZoom] = useState(1.0);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const handleTextClick = useCallback((text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    let matches = model.findMatches(text, false, false, true, null, false);

    if (matches.length === 0) {
      const cleaned = text.replace(/~/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleaned !== text) {
        matches = model.findMatches(cleaned, false, false, true, null, false);
      }
    }

    if (matches.length === 0) return;

    const range = matches[0].range;
    editor.revealLineInCenter(range.startLineNumber);
    editor.setSelection(range);
  }, []);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 's')) {
        e.preventDefault();
        compile(source);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [source, compile]);

  const ghostBtn: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: '1px',
    padding: '5px 12px',
    background: 'transparent',
    color: '#646262',
    border: '1px solid rgba(15,0,0,0.15)',
    borderRadius: 4,
    cursor: 'pointer',
  };

  const solidBtn: React.CSSProperties = {
    ...ghostBtn,
    background: '#201d1d',
    color: '#fdfcfc',
    border: '1px solid #201d1d',
  };

  const paneHeader: React.CSSProperties = {
    background: '#fdfcfc',
    borderBottom: '1px solid rgba(15,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    flexShrink: 0,
  };

  const paneLabel: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#9a9898',
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#fdfcfc' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: '0 20px', height: 46, background: '#fdfcfc', borderBottom: '1px solid rgba(15,0,0,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ fontFamily: mono, fontSize: 11, letterSpacing: '1px', color: '#646262', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <span style={{ color: 'rgba(15,0,0,0.15)', fontSize: 12 }}>|</span>
          <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: '#201d1d', letterSpacing: '-0.02em' }}>
            latex-resume
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadTex} style={ghostBtn}>Download .tex</button>
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
              <button
                onClick={() => compile(source)}
                disabled={compiling}
                style={{ ...solidBtn, opacity: compiling ? 0.5 : 1, cursor: compiling ? 'not-allowed' : 'pointer' }}
              >
                {compiling ? 'Compiling…' : '↺ Recompile'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="latex"
              value={source}
              onChange={(val) => setSource(val ?? '')}
              theme="vs"
              onMount={(ed) => { editorRef.current = ed; }}
              options={{
                fontSize: 13,
                lineNumbers: 'on',
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'JetBrains Mono', monospace",
                renderLineHighlight: 'line',
              }}
            />
          </div>

          {/* Compile error panel */}
          {compileError && (
            <div style={{ borderTop: '1px solid rgba(255,59,48,0.25)', background: '#fff8f8', flexShrink: 0 }}>
              <button
                onClick={() => setErrorOpen((o) => !o)}
                className="flex items-center justify-between w-full"
                style={{ padding: '8px 16px', fontFamily: mono, fontSize: 11, fontWeight: 500, color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span>[x] Compile error</span>
                <span>{errorOpen ? '▲' : '▼'}</span>
              </button>
              {errorOpen && (
                <pre style={{ padding: '0 16px 12px', fontFamily: mono, fontSize: 11, color: 'rgba(255,59,48,0.6)', whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: 160 }}>
                  {compileError}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{ width: 1, flexShrink: 0, background: 'rgba(15,0,0,0.1)', cursor: 'col-resize', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,0,0,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,0,0,0.1)'; }}
        />

        {/* Right: PDF preview */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPct}%` }}>
          <div style={paneHeader}>
            <span style={paneLabel}>PDF Preview</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))} style={ghostBtn}>−</button>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#646262', minWidth: 36, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => setZoom(z => Math.min(3.0, +(z + 0.25).toFixed(2)))} style={ghostBtn}>+</button>
            </div>
          </div>

          <div className="relative flex-1" style={{ background: '#f1eeee' }}>
            {compiling && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#f1eeee' }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(15,0,0,0.1)', borderTopColor: '#201d1d' }} />
                  <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: '#9a9898', textTransform: 'uppercase' }}>
                    Compiling LaTeX…
                  </p>
                </div>
              </div>
            )}

            {pdfUrl ? (
              <PdfViewer pdfUrl={pdfUrl} zoom={zoom} onTextClick={handleTextClick} />
            ) : !compiling ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span style={{ fontFamily: mono, fontSize: 13, color: '#c4c2c2' }}>[ no preview ]</span>
                <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#c4c2c2' }}>
                  Click Recompile to preview
                </p>
              </div>
            ) : null}
          </div>

          <div style={{ padding: '6px 14px', background: '#fdfcfc', borderTop: '1px solid rgba(15,0,0,0.08)', fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', color: '#9a9898' }}>
            Compiled via TeXLive.net · click Recompile after edits
          </div>
        </div>
      </div>
    </div>
  );
}
