// Renders the brand kit's PNGs and PDFs from brand/logo/*.svg and brand/src/*.html.
// Run: node scripts/brand/render.cjs   (after the two Python build scripts)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '../../brand');
const LOGO = path.join(BRAND, 'logo');
const url = (p) => 'file://' + p;

// [svg, output, width in px, background or null for transparent]
const pngs = [];
for (const s of ['colour', 'on-dark', 'navy', 'white']) {
  pngs.push([`logo-horizontal-${s}.svg`, `png/logo-horizontal-${s}-1200.png`, 1200, null]);
  pngs.push([`logo-horizontal-${s}.svg`, `png/logo-horizontal-${s}-2400.png`, 2400, null]);
  pngs.push([`logo-stacked-${s}.svg`, `png/logo-stacked-${s}-1000.png`, 1000, null]);
  pngs.push([`mark-${s}.svg`, `png/mark-${s}-512.png`, 512, null]);
  pngs.push([`mark-${s}.svg`, `png/mark-${s}-1024.png`, 1024, null]);
}
pngs.push(['app-icon.svg', 'png/app-icon-1024.png', 1024, null]);
pngs.push(['app-icon-square.svg', 'icons/apple-touch-icon.png', 180, null]);
pngs.push(['app-icon-square.svg', 'icons/icon-192.png', 192, null]);
pngs.push(['app-icon-square.svg', 'icons/icon-512.png', 512, null]);
pngs.push(['app-icon-square.svg', 'social/profile-picture-1080.png', 1080, null]);
for (const s of [16, 32, 48]) pngs.push(['favicon.svg', `icons/favicon-${s}.png`, s, null]);
// Previews on their intended backgrounds.
pngs.push(['logo-horizontal-colour.svg', 'preview/logo-on-cream.png', 1600, '#f2eee6']);
pngs.push(['logo-horizontal-on-dark.svg', 'preview/logo-on-navy.png', 1600, '#0f1d2b']);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  for (const [svg, out, w, bg] of pngs) {
    const file = path.join(LOGO, svg);
    const vb = fs.readFileSync(file, 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const h = Math.round((w * vb[3]) / vb[2]);
    const pad = bg ? Math.round(w * 0.08) : 0;
    await page.setViewportSize({ width: w + pad * 2, height: h + pad * 2 });
    await page.setContent(`<html><body style="margin:0;background:${bg || 'transparent'}"><img src="${url(file)}" style="display:block;width:${w}px;height:${h}px;margin:${pad}px"></body></html>`);
    await page.waitForLoadState('load');
    const dest = path.join(BRAND, out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.screenshot({ path: dest, omitBackground: !bg });
  }
  // Print files and the guide.
  const docs = [['business-card', null], ['letterhead', null], ['brand-guide', null]];
  for (const [name] of docs) {
    const p = await b.newPage();
    await p.goto(url(path.join(BRAND, 'src', name + '.html')), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const dest = path.join(BRAND, 'print', name + '.pdf');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await p.pdf({ path: dest, preferCSSPageSize: true, printBackground: true });
    await p.close();
  }
  // PNG previews of the print files, two pixels per CSS pixel.
  const ctx = await b.newContext({ deviceScaleFactor: 2 });
  for (const [name, w, h] of [['business-card', 359, 215], ['letterhead', 794, 1123], ['brand-guide', 1123, 794]]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: h });
    await p.goto(url(path.join(BRAND, 'src', name + '.html')), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(BRAND, 'preview', name + '.png'), fullPage: true });
    await p.close();
  }
  await b.close();
  console.log(`${pngs.length} PNGs, 3 PDFs and 3 print previews written to brand/`);
})();
