// Builds offline/ — a copy of the site that works when index.html is opened
// straight from disk (double-click), with no web server.
//
// Browsers refuse to load module scripts and web fonts from file:// URLs,
// so this inlines the JS and CSS into the page and embeds the fonts as
// data URIs. Images stay as files next to index.html.
//
//   npm run build && node scripts/build-offline.mjs

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const out = join(root, 'offline');

let html = readFileSync(join(dist, 'index.html'), 'utf8');

// Inline the stylesheet, embedding the fonts the page actually uses.
html = html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/, (_, href) => {
  let css = readFileSync(join(dist, href), 'utf8');
  css = css.replace(/url\((['"]?)\/((?:assets|fonts)\/[^)'"]+)\1\)/g, (m, q, file) => {
    const embed = /\.woff2$/.test(file) && (/^fonts\//.test(file) || /-latin-(ext-)?(wght|400)-normal/.test(file));
    if (!embed) return `url(./${file})`;
    const b64 = readFileSync(join(dist, file)).toString('base64');
    return `url(data:font/woff2;base64,${b64})`;
  });
  return `<style>${css}</style>`;
});

// Inline the script as an inline module (allowed on file://).
html = html.replace(/<script type="module"[^>]*src="\/(assets\/[^"]+\.js)"[^>]*><\/script>/, (_, src) => {
  const js = readFileSync(join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

// Fonts are embedded now, so drop their preloads; make remaining paths relative.
html = html
  .replace(/\s*<link rel="preload" as="font"[^>]*>/g, '')
  .replace(/(["\s,])\/(img|fonts|favicon\.svg)/g, '$1./$2');

if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), html);
cpSync(join(dist, 'img'), join(out, 'img'), { recursive: true });
cpSync(join(dist, 'favicon.svg'), join(out, 'favicon.svg'));
console.log('offline/index.html', (html.length / 1024).toFixed(0) + ' KB');
