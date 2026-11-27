import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

// GitHub Pages serves the site from /<repo>/, so the workflow sets BASE_PATH.
const base = process.env.BASE_PATH || '/';
// The public address of the site, used for the canonical link, share image and
// sitemap. Change SITE_URL in the workflow when the site moves to its own domain.
const site = (process.env.SITE_URL || `https://venkatsai09.github.io${base}`).replace(/\/?$/, '/');

// Every HTML page: the home page plus the condition and procedure pages.
const pages = { main: resolve(__dirname, 'index.html') };
// The not-found page is built too, but kept out of the sitemap and search results.
if (existsSync(resolve(__dirname, '404.html'))) pages['404'] = resolve(__dirname, '404.html');
for (const dir of ['conditions', 'procedures']) {
  const d = resolve(__dirname, dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (f.endsWith('.html')) pages[`${dir}/${f.replace('.html', '')}`] = resolve(d, f);
}

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
// Pages are addressed without .html (Cloudflare and GitHub Pages both serve them that way).
const pagePath = (file) => file.replace(/^.*?\/(?=(conditions|procedures)\/)/, '').replace(/^.*index\.html$/, '').replace(/\.html$/, '');

export default defineConfig({
  base,
  build: { rollupOptions: { input: pages } },
  plugins: [
    {
      // Vite rewrites most public-file URLs for `base`, but not every attribute
      // (e.g. imagesrcset on preloads, meta content, later srcset entries).
      name: 'prefix-public-paths',
      transformIndexHtml: {
        order: 'post',
        handler: (html) => (base === '/' ? html : html.replace(/(["\s,])\/(img|fonts)\//g, `$1${base}$2/`)),
      },
    },
    {
      // Search engines and link previews: an absolute canonical address and
      // share image, and FAQ structured data built from the page's own FAQ.
      name: 'seo',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          if (ctx.filename.endsWith('404.html')) return html;
          const path = pagePath(ctx.filename.replace(/\\/g, '/'));
          const url = site + path;
          let head = `<link rel="canonical" href="${url}" />\n  <meta property="og:url" content="${url}" />\n`;
          html = html.replaceAll('%SITE%', site);
          html = html.replace(/<meta property="og:image" content="[^"]*\/img\/([^"]+)" \/>/, `<meta property="og:image" content="${site}img/$1" />`);
          const qa = [...html.matchAll(/<details class="qa">\s*<summary>([\s\S]*?)<\/summary>\s*<div class="qa__a">([\s\S]*?)<\/div>\s*<\/details>/g)];
          if (qa.length) {
            const faq = {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: qa.map(([, q, a]) => ({ '@type': 'Question', name: text(q), acceptedAnswer: { '@type': 'Answer', text: text(a) } })),
            };
            head += `  <script type="application/ld+json">${JSON.stringify(faq)}</script>\n`;
          }
          return html.replace('</head>', `  ${head}</head>`);
        },
      },
      generateBundle() {
        const urls = Object.keys(pages).filter((k) => k !== '404').map((k) => site + (k === 'main' ? '' : k)).sort();
        const today = new Date().toISOString().slice(0, 10);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}sitemap.xml\n` });
      },
    },
    {
      // The home page inlines its stylesheet, which saves a round trip before
      // the first paint. The other pages keep the linked, cacheable file.
      name: 'inline-home-css',
      enforce: 'post',
      generateBundle(_, bundle) {
        const page = bundle['index.html'];
        if (!page) return;
        let html = String(page.source);
        html = html.replace(/<link rel="stylesheet" crossorigin href="[^"]*\/assets\/([^"]+\.css)">/g, (tag, name) => {
          const css = bundle[`assets/${name}`];
          return css ? `<style>${css.source}</style>` : tag;
        });
        page.source = html;
      },
    },
  ],
});
