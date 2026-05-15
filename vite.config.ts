import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const argocdToken = env.ARGOCD_AUTH_TOKEN

  function createProxyConfig() {
    return {
      target: 'https://argocd.diamond.ac.uk',
      changeOrigin: true,
      secure: false,
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          proxyReq.setHeader('Host', 'argocd.diamond.ac.uk');
          // Forward browser cookies, with env token as fallback
          const browserCookies = req.headers.cookie || '';
          const cookieHeader = argocdToken && !browserCookies.includes('argocd.token=')
            ? `argocd.token=${argocdToken};${browserCookies}`
            : browserCookies;
          if (cookieHeader) {
            proxyReq.setHeader('Cookie', cookieHeader);
          }
        });
        proxy.on('error', (err: any) => {
          console.error('[proxy error]', err.message);
        });
      },
    }
  }

  // Dev-only middleware that mimics the nginx /api/client-ip endpoint so the
  // header IP display works under `vite dev` (otherwise the request gets
  // proxied to ArgoCD, which 404s).
  const devClientIpPlugin = {
    name: 'dev-client-ip',
    configureServer(server: any) {
      server.middlewares.use('/api/client-ip', (req: any, res: any) => {
        const forwardedFor = (req.headers['x-forwarded-for'] as string | undefined) ?? '';
        const ip = (req.socket?.remoteAddress as string | undefined) ?? '';
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ip, forwardedFor }));
      });
    },
  }

  return {
    plugins: [react(), tailwindcss(), devClientIpPlugin],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': createProxyConfig(),
        '/auth': createProxyConfig(),
      },
    },
  }
})
