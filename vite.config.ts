import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import { config as loadDotenv } from 'dotenv'

loadDotenv()

function latexDevProxyPlugin(): Plugin {
  return {
    name: 'latex-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/compile',
        (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { source } = JSON.parse(body) as { source: string };
              const upstream = await fetch('https://latexonline.cc/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-tex' },
                body: source,
              });

              if (!upstream.ok) {
                const text = await upstream.text();
                res.statusCode = upstream.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: text }));
                return;
              }

              const contentType = upstream.headers.get('content-type') ?? '';
              if (!contentType.includes('application/pdf')) {
                const text = await upstream.text();
                res.statusCode = 422;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: text }));
                return;
              }

              const buffer = await upstream.arrayBuffer();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Cache-Control', 'no-store');
              res.end(Buffer.from(buffer));
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: message }));
            }
          });
        },
      );
    },
  };
}

function convertDevProxyPlugin(): Plugin {
  return {
    name: 'convert-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/convert',
        (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { images } = JSON.parse(body) as { images?: string[] };
              if (!images || images.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing page images' }));
                return;
              }

              const { default: Anthropic } = await import('@anthropic-ai/sdk');
              const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

              type ImageBlock = { type: 'image'; source: { type: 'base64'; media_type: 'image/png'; data: string } };
              const imageBlocks: ImageBlock[] = images.map((b64) => ({
                type: 'image',
                source: { type: 'base64', media_type: 'image/png', data: b64 },
              }));

              const message = await client.messages.create({
                model: 'claude-opus-4-7',
                max_tokens: 8192,
                messages: [
                  {
                    role: 'user',
                    content: [
                      ...imageBlocks,
                      {
                        type: 'text',
                        text: `You are an expert LaTeX typesetter. Convert this resume PDF (shown as page images) into complete, compilable LaTeX source that looks identical to the original.

FONT MATCHING (critical):
- Examine the font in the image carefully. Is it sans-serif (like Arial, Calibri, Helvetica, Lato, Open Sans) or serif (like Times New Roman, Georgia, Garamond)?
- For sans-serif resumes: use \\usepackage{lato} or \\usepackage[default]{opensans} or \\usepackage{helvet} + \\renewcommand{\\familydefault}{\\sfdefault}
- For serif resumes: use \\usepackage{mathptmx} (Times) or \\usepackage{palatino}
- For modern geometric sans (Calibri-like): use \\usepackage[sfdefault]{cabin} or \\usepackage[sfdefault]{roboto}
- Always include \\usepackage[T1]{fontenc} and \\usepackage[utf8]{inputenc}
- Match font sizes precisely: if the name is large, use \\Huge or \\LARGE; section headers typically \\large or \\Large

LAYOUT (critical):
- Reproduce column structure exactly (single column vs two-column)
- Match margins using \\usepackage{geometry} with exact-looking margins (e.g. margin=0.5in or margin=1in)
- Match spacing between sections, before/after headings, and between bullet points
- Use \\usepackage{enumitem} to control bullet spacing to match original

HORIZONTAL LINES (critical):
- Only add a horizontal rule if one is clearly visible in the image at that exact position
- Use \\noindent\\rule{\\linewidth}{0.4pt} for full-width section dividers
- Never place a rule inside a list, inside a tabular, or between bullet points
- If a rule appears under the name/header, place it immediately after the header block before the first section
- Do not add extra rules that are not in the original

OTHER:
- Preserve all content exactly: names, dates, bullets, URLs, contact info
- Use \\documentclass{article} — avoid document classes that alter fonts
- Output ONLY the raw LaTeX source — no markdown fences, no explanation, nothing else
- Must compile successfully with pdflatex`,
                      },
                    ],
                  },
                ],
              });

              const textBlock = message.content.find((b) => b.type === 'text');
              if (!textBlock || textBlock.type !== 'text') {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'No text response from Claude' }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ latex: textBlock.text.trim() }));
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Claude API error: ${message}` }));
            }
          });
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), latexDevProxyPlugin(), convertDevProxyPlugin()],
})
