import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resolve-3d-model-url',
      configureServer(server) {
        server.middlewares.use('/api/resolve-3d-url', async (req, res) => {
          try {
            const reqUrl = new URL(req.url || '', 'http://localhost:3000');
            const targetUrl = reqUrl.searchParams.get('url')?.trim() || '';
            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing url parameter' }));
              return;
            }

            // Follow redirects (e.g., https://skfb.ly/pNSGJ -> https://sketchfab.com/3d-models/...)
            const response = await fetch(targetUrl, {
              method: 'HEAD',
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AuraMotors3DResolver/1.0)',
              },
            }).catch(() =>
              fetch(targetUrl, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; AuraMotors3DResolver/1.0)',
                },
              })
            );

            const finalUrl = response.url || targetUrl;
            const uidMatch = finalUrl.match(/([0-9a-f]{32})/i);
            const uid = uidMatch ? uidMatch[1] : null;
            const embedUrl = uid
              ? `https://sketchfab.com/models/${uid}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&dnt=1`
              : null;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                originalUrl: targetUrl,
                resolvedUrl: finalUrl,
                uid,
                embedUrl,
              })
            );
          } catch (err: any) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                originalUrl: '',
                resolvedUrl: '',
                uid: null,
                embedUrl: null,
                error: err?.message || 'Failed to resolve URL',
              })
            );
          }
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

