import { defineConfig } from 'vite';

// GitHub Pages serves the site from /<repo>/, so the workflow sets BASE_PATH.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    {
      // Vite rewrites most public-file URLs for `base`, but not every attribute
      // (e.g. imagesrcset on preloads, meta content, later srcset entries).
      name: 'prefix-public-paths',
      transformIndexHtml: {
        order: 'post',
        handler: (html) => (base === '/' ? html : html.replace(/(["\s,])\/(img|fonts|favicon\.svg)/g, `$1${base}$2`)),
      },
    },
  ],
});
