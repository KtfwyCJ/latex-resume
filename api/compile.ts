import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source } = req.body as { source?: string };
  if (!source) {
    return res.status(400).json({ error: 'Missing LaTeX source' });
  }

  try {
    const form = new FormData();
    form.append('filecontents[]', new Blob([source], { type: 'application/x-tex' }), 'document.tex');
    form.append('filename[]', 'document.tex');
    form.append('engine', 'pdflatex');
    form.append('return', 'pdf');

    const upstream = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: form,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text });
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.includes('application/pdf')) {
      const text = await upstream.text();
      return res.status(422).json({ error: text });
    }

    const buffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(502).json({ error: `Upstream error: ${message}` });
  }
}
