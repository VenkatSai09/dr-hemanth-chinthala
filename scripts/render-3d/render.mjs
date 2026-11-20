// Renders the hero's floating 3D objects to transparent PNGs.
//   node scripts/render-3d/render.mjs <out-dir>
// Uses the Playwright Chromium; files are served from the project root through a
// request route, so no web server is needed.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Playwright is installed globally in this environment; CommonJS resolution finds it via NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = process.argv[2] || join(root, 'scripts/render-3d/out');
mkdirSync(out, { recursive: true });

const shots = [
  // name, rotation x/y/z (radians), camera distance, file
  ['capsule-cam', 0.5, 0.6, -0.9, 9.4, 'capsule-cam-a'],
  ['capsule-cam', -0.45, 2.2, 0.75, 9.4, 'capsule-cam-b'],
  ['capsule-cam', 0.0, -0.5, -Math.PI / 2, 9.4, 'capsule-cam-side'],
  ['pill-sienna', 0.4, 0.3, 0.9, 4.6, 'pill-sienna'],
  ['pill-ink', -0.6, 1.0, -0.6, 4.6, 'pill-ink'],
  ['tablet', 1.05, 0.2, 0.25, 6.2, 'tablet'],
  ['bubble', 0, 0, 0, 5.4, 'bubble'],
  ['glass-cube', 0.6, 0.7, 0.2, 6.2, 'glass-cube'],
];

const types = { '.html': 'text/html', '.js': 'text/javascript' };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.route('http://render.local/**', (route) => {
  const path = decodeURIComponent(new URL(route.request().url()).pathname);
  const file = path === '/' ? join(root, 'scripts/render-3d/scene.html') : join(root, path);
  if (!file.startsWith(root) || !existsSync(file)) return route.fulfill({ status: 404, body: '' });
  route.fulfill({ status: 200, contentType: types[extname(file)] || 'application/octet-stream', body: readFileSync(file) });
});
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto('http://render.local/');
await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
// Glass is rendered twice, over white and over black; scripts/render-3d/matte.py
// recovers its true colour and transparency from the difference.
const GLASS = new Set(['bubble', 'glass-cube']);
const save = (file, url) => writeFileSync(join(out, file), Buffer.from(url.split(',')[1], 'base64'));
const shoot = (args) => page.evaluate(([n, a, b, c, d, bg]) => window.renderObject(n, a, b, c, d, bg), args);
for (const [name, rx, ry, rz, dist, file] of shots) {
  if (GLASS.has(name)) {
    save(file + '.white.png', await shoot([name, rx, ry, rz, dist, 0xffffff]));
    save(file + '.black.png', await shoot([name, rx, ry, rz, dist, 0x000000]));
  } else {
    save(file + '.png', await shoot([name, rx, ry, rz, dist, null]));
  }
  console.log('rendered', file);
}
await browser.close();
