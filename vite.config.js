import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs so the built site works on GitHub Pages project sites
  // (e.g. …/S3-CH5-table/) as well as at domain root and on Vite dev server.
  base: './',
  server: {
    proxy: {
      // Proxy all /api/chem requests to the chemistry API server
      '/api/chem': {
        target: 'http://10.0.0.149:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chem/, ''),
      },
    },
  },
});
