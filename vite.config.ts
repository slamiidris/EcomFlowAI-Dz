import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * The first screen needs one lazily loaded chunk (the app shell for members, the landing page for
 * visitors, a login page...). Without help the browser only asks for it after the main bundle has
 * downloaded AND run. This injects a tiny inline script that preloads the right chunk straight
 * from the HTML, in parallel with the main bundle. Mirrors the logic in src/main.tsx.
 */
function earlyChunkPreload(): Plugin {
  const EARLY = ['AppShell', 'DashboardHome', 'LandingPage', 'LoginPage', 'RegisterPage', 'VerifyPage', 'ForgotPasswordPage', 'AdminDashboard', 'LegalPage'];
  return {
    name: 'early-chunk-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const chunks: Record<string, string> = {};
        for (const item of Object.values(ctx.bundle ?? {})) {
          if (item.type === 'chunk' && EARLY.includes(item.name)) chunks[item.name] = `/${item.fileName}`;
        }
        if (Object.keys(chunks).length === 0) return undefined;
        const script =
          `(function(){try{var m=${JSON.stringify(chunks)},p=location.pathname,` +
          `r=localStorage.getItem('dz_returning')==='1',n;` +
          `if(/^\\/admin/.test(p))n=['AdminDashboard'];` +
          `else if(/^\\/login/.test(p))n=['LoginPage'];` +
          `else if(/^\\/register/.test(p))n=['RegisterPage'];` +
          `else if(/^\\/verify/.test(p))n=['VerifyPage'];` +
          `else if(/^\\/forgot-password/.test(p))n=['ForgotPasswordPage'];` +
          `else if(/^\\/(terms|privacy)/.test(p))n=['LegalPage'];` +
          `else n=r?['AppShell','DashboardHome']:['LandingPage'];` +
          `n.forEach(function(k){if(!m[k])return;var l=document.createElement('link');` +
          `l.rel='modulepreload';l.href=m[k];document.head.appendChild(l)})}catch(e){}})();`;
        // 'head' (not 'head-prepend'): a prepended script would land before <meta charset>.
        return [{ tag: 'script', children: script, injectTo: 'head' }];
      },
    },
  };
}

/**
 * Link previews (WhatsApp, Facebook, X...) only accept ABSOLUTE image URLs, so the share-image tags are added
 * when the site's address is known. Set SITE_URL (for example https://ecomflow.example) when building for production.
 */
function shareImageTags(): Plugin {
  const site = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
  return {
    name: 'share-image-tags',
    transformIndexHtml() {
      if (!/^https?:\/\//.test(site)) return undefined;
      const image = `${site}/og-image.jpg`;
      return [
        { tag: 'meta', attrs: { property: 'og:image', content: image }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: image }, injectTo: 'head' },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), earlyChunkPreload(), shareImageTags()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: app code changes do not invalidate the cached framework code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) return 'react-vendor';
          if (/[\\/]node_modules[\\/](framer-motion|motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          // One icon chunk instead of ~50 one-kilobyte files: each file would cost a request on a slow link.
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR === 'true'
      ? false
      : { port: 5173 },
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    // Proxy /api/* requests to the Express server during development.
    // ws: false ensures Vite's own HMR WebSocket is NOT intercepted.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: false,
      },
    },
  },
});
