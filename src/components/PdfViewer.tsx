import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { renderTextLayer } from 'pdfjs-dist';

// Use CDN worker matching the installed version — no Vite worker config needed
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface Props {
  pdfUrl: string | null;
  onTextClick: (text: string) => void;
}

export default function PdfViewer({ pdfUrl, onTextClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdfUrl || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = '';

    (async () => {
      // @ts-ignore
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      if (cancelled) return;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) break;
        const page = await pdf.getPage(pageNum);
        if (cancelled) break;

        const naturalViewport = page.getViewport({ scale: 1 });
        const scale = Math.max((container.clientWidth - 24) / naturalViewport.width, 0.5);
        const viewport = page.getViewport({ scale });

        // Wrapper holds canvas + text layer at the same size
        const wrapper = document.createElement('div');
        wrapper.style.cssText = [
          'position: relative',
          `width: ${viewport.width}px`,
          `height: ${viewport.height}px`,
          'margin: 0 auto 8px',
          'box-shadow: 0 1px 4px rgba(0,0,0,0.15)',
          'background: #fff',
        ].join('; ');
        container.appendChild(wrapper);

        // Canvas layer
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.cssText = 'display: block; width: 100%; height: 100%;';
        wrapper.appendChild(canvas);

        const ctx = canvas.getContext('2d')!;
        // @ts-ignore
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) break;

        // Text layer
        const textDiv = document.createElement('div');
        textDiv.className = 'textLayer';
        wrapper.appendChild(textDiv);

        const textContent = await page.getTextContent();
        if (cancelled) break;

        renderTextLayer({
          // @ts-ignore
          textContent,
          container: textDiv,
          viewport,
          textDivs: [],
        });
      }
    })();

    return () => { cancelled = true; };
  }, [pdfUrl]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'SPAN') return;
    const text = target.textContent?.trim();
    if (!text) return;

    target.classList.add('clicked-word');
    setTimeout(() => target.classList.remove('clicked-word'), 800);

    onTextClick(text);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        overflowY: 'auto',
        padding: '12px',
        background: '#f1eeee',
        height: '100%',
      }}
    />
  );
}
