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

export default defineConfig({
  plugins: [react(), latexDevProxyPlugin()],
})
