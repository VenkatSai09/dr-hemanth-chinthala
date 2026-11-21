// Builds the dotted training map (India to Australia) and writes it into
// index.html between the <!-- map:start --> and <!-- map:end --> markers.
// Run with: node scripts/build-map.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);

// Region and projection: plain equirectangular, 10 units per degree.
const LON0 = 58, LON1 = 152, LAT0 = 37, LAT1 = -41, K = 10, STEP = 1.25;
const px = (lon) => +((lon - LON0) * K).toFixed(1);
const py = (lat) => +((LAT0 - lat) * K).toFixed(1);
const W = px(LON1), H = py(LAT1);

let dots = '';
for (let lat = LAT0 - STEP / 2; lat > LAT1; lat -= STEP) {
  for (let lon = LON0 + STEP / 2; lon < LON1; lon += STEP) {
    if (geoContains(land, [lon, lat])) dots += `M${px(lon)} ${py(lat)}h0`;
  }
}

// Where he trained and worked, in order. The ESEGH is an examination, not a
// placement, so it is not drawn as a journey.
const places = [
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.385, lon: 78.487, dx: -14, dy: 6, anchor: 'end' },
  { id: 'chandigarh', name: 'Chandigarh', lat: 30.733, lon: 76.779, dx: 14, dy: 5, anchor: 'start' },
  { id: 'vellore', name: 'Vellore', lat: 12.916, lon: 79.133, dx: -14, dy: 24, anchor: 'end' },
  { id: 'melbourne', name: 'Melbourne', lat: -37.814, lon: 144.963, dx: -14, dy: 5, anchor: 'end' },
];
const P = Object.fromEntries(places.map((p) => [p.id, [px(p.lon), py(p.lat)]]));
// Each leg bows to one side so the lines never overlap.
const arc = (a, b, bend) => {
  const [x1, y1] = P[a], [x2, y2] = P[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const nx = -(y2 - y1), ny = x2 - x1, len = Math.hypot(nx, ny);
  const cx = mx + (nx / len) * bend * len, cy = my + (ny / len) * bend * len;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
};
const legs = [
  ['hyderabad', 'chandigarh', 0.3],
  ['chandigarh', 'vellore', -0.32],
  ['vellore', 'melbourne', 0.1],
  ['melbourne', 'hyderabad', 0.2],
];

const i1 = '              ';
const svg = [
  `${i1}<svg class="tmap__svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="tmap-t" data-tmap>`,
  `${i1}  <title id="tmap-t">Map of where Dr Chinthala trained and worked: Hyderabad, Chandigarh, Vellore and Melbourne, and back to Hyderabad</title>`,
  // The land dots are a separate image, so they do not weigh down the page's HTML.
  `${i1}  <image class="tmap__land" href="/img/map-land.svg" width="${W}" height="${H}" />`,
  ...legs.map(([a, b, bend]) => `${i1}  <path class="tmap__leg" data-leg pathLength="1" d="${arc(a, b, bend)}" />`),
  ...places.map((p) => {
    const [x, y] = P[p.id];
    return `${i1}  <g class="tmap__place" data-place="${p.id}" transform="translate(${x} ${y})"><circle class="tmap__ring" r="9" /><circle class="tmap__dot" r="5" /><text x="${p.dx}" y="${p.dy}" text-anchor="${p.anchor}">${p.name}</text></g>`;
  }),
  `${i1}</svg>`,
].join('\n');

writeFileSync(new URL('../public/img/map-land.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><path d="${dots}" fill="none" stroke="#0f1d2b" stroke-opacity=".4" stroke-width="4.4" stroke-linecap="round"/></svg>\n`);

const file = new URL('../index.html', import.meta.url);
const html = readFileSync(file, 'utf8');
const a = html.indexOf('<!-- map:start -->');
const b = html.indexOf('<!-- map:end -->');
if (a < 0 || b < 0) throw new Error('map markers not found in index.html');
writeFileSync(file, html.slice(0, a) + '<!-- map:start -->\n' + svg + '\n' + i1 + html.slice(b));
console.log(`map: ${W}x${H}, ${dots.split('M').length - 1} dots`);
