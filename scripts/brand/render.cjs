// Renders the print PDFs and PNG previews from brand/src/*.html.
// Run: node scripts/brand/render.cjs   (after the two Python build scripts)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '../../brand');
const url = (p) => 'file://' + p;

(async () => {
  const b = await chromium.launch();
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
  fs.mkdirSync(path.join(BRAND, 'preview'), { recursive: true });
  // PNG previews of the print files, two pixels per CSS pixel.
  const ctx = await b.newContext({ deviceScaleFactor: 2 });
  for (const [name, w, h] of [['business-card', 359, 215], ['letterhead', 794, 1123], ['brand-guide', 1123, 794], ['sign-mockup', 1600, 1100]]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: h });
    await p.goto(url(path.join(BRAND, 'src', name + '.html')), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(BRAND, 'preview', name + '.png'), fullPage: true });
    await p.close();
  }
  await b.close();
  console.log('3 PDFs and 4 previews written to brand/');
})();
