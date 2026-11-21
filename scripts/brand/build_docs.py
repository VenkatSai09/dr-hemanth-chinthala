"""HTML sources for the business card, letterhead, brand guide and sign mockup.

They use the doctor's logo image exactly as chosen (see build_from_image.py).
render.cjs turns them into PDFs and PNG previews.
Run: python3 scripts/brand/build_from_image.py && python3 scripts/brand/build_docs.py && node scripts/brand/render.cjs
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'brand'
SRC = OUT / 'src'
LOGO = '../logo'
FONTS = '../../node_modules/@fontsource-variable'

# Colours sampled from the logo itself.
NAVY = '#121f2b'
COPPER = '#db8e5d'
BROWN = '#81432f'
TERRACOTTA = '#b9714f'
CREAM = '#f6f1e5'
FULL = f'{LOGO}/logo-transparent@4x.png'
MARK = f'{LOGO}/mark-transparent@4x.png'

HEAD = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'Newsreader'; src: url({FONTS}/newsreader/files/newsreader-latin-standard-normal.woff2) format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'Newsreader'; font-style: italic; src: url({FONTS}/newsreader/files/newsreader-latin-standard-italic.woff2) format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'Instrument Sans'; src: url({FONTS}/instrument-sans/files/instrument-sans-latin-standard-normal.woff2) format('woff2'); font-weight: 400 700; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family: 'Instrument Sans', sans-serif; color: {NAVY}; }}
.serif {{ font-family: 'Newsreader', serif; font-variation-settings: 'opsz' 72; }}
'''

PHONE = '+91 70872 22235'
HOURS = 'Monday to Saturday, 9 am to 4 pm'
ROLE = 'Consultant Medical Gastroenterologist, Hepatologist and Interventional Endoscopist'
QUALS = 'MBBS, MD (PGIMER), DM (CMC Vellore), ESEGH (UK)'


# --------------------------------------------------------------------------
# Business card: 3.5 x 2 inches (the usual Indian size) with 3 mm bleed.
# Both sides are cream, because the logo's navy lettering needs a light ground.
# --------------------------------------------------------------------------
def business_card():
    css = f'''
@page {{ size: 94.9mm 56.8mm; margin: 0; }}
.card {{ width: 94.9mm; height: 56.8mm; position: relative; overflow: hidden; page-break-after: always; background: {CREAM}; }}
.front {{ display: grid; place-items: center; }}
.front img {{ width: 66mm; }}
.back {{ padding: 8mm 9mm 0 9mm; }}
.back::before {{ content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1.6mm; background: linear-gradient(90deg, {COPPER}, {BROWN} 55%, {NAVY}); }}
.back .name {{ font-size: 15pt; line-height: 1.05; font-weight: 430; letter-spacing: -0.01em; }}
.back .tag {{ font-family: 'Newsreader', serif; font-style: italic; font-size: 9.5pt; color: {TERRACOTTA}; margin-top: 1mm; }}
.back .role {{ font-size: 6.4pt; line-height: 1.35; margin-top: 3mm; max-width: 56mm; color: #33414f; }}
.back .quals {{ font-size: 6.4pt; margin-top: 1mm; color: #5d6772; }}
.back .rule {{ height: 0.3mm; background: rgba(18,31,43,.18); margin: 3.2mm 0 2.6mm; width: 76.9mm; }}
.back .row {{ display: grid; grid-template-columns: 22mm 1fr; gap: 1mm 2mm; font-size: 6.4pt; line-height: 1.35; }}
.back .row dt {{ color: #5d6772; }}
.back .mark {{ position: absolute; right: 9mm; top: 7.4mm; width: 12mm; }}
'''
    html = HEAD + css + f'''</style></head><body>
<section class="card front"><img src="{FULL}" alt="Dr Hemanth Chinthala, The Gut Doctor"></section>
<section class="card back">
  <img class="mark" src="{MARK}" alt="">
  <p class="name serif">Dr Hemanth Chinthala</p>
  <p class="tag">The Gut Doctor</p>
  <p class="role">{ROLE}</p>
  <p class="quals">{QUALS}</p>
  <div class="rule"></div>
  <dl class="row">
    <dt>Appointments</dt><dd>{PHONE}</dd>
    <dt>Consults</dt><dd>{HOURS}</dd>
    <dt>Hospital</dt><dd>Medicover Hospital, Financial District,<br>Nanakramguda, Hyderabad 500032</dd>
  </dl>
</section>
</body></html>'''
    (SRC / 'business-card.html').write_text(html)


# --------------------------------------------------------------------------
# Letterhead / prescription pad: A4.
# --------------------------------------------------------------------------
def letterhead():
    css = f'''
@page {{ size: A4; margin: 0; }}
.page {{ width: 210mm; height: 297mm; position: relative; background: #fff; padding: 14mm 18mm; }}
.head {{ display: flex; justify-content: space-between; align-items: center; padding-bottom: 5mm; border-bottom: 0.5mm solid {BROWN}; }}
.head img {{ height: 26mm; }}
.head .right {{ text-align: right; font-size: 8pt; line-height: 1.5; color: #33414f; }}
.head .right b {{ font-weight: 600; color: {NAVY}; white-space: nowrap; }}
.reg {{ margin-top: 4mm; display: flex; justify-content: space-between; font-size: 8.4pt; color: #5d6772; }}
.reg span {{ display: inline-block; min-width: 46mm; border-bottom: 0.25mm solid #c9c3b7; margin-left: 2mm; }}
.patient {{ margin-top: 7mm; display: grid; grid-template-columns: 2.2fr 0.7fr 0.7fr 1fr; gap: 4mm; font-size: 8.4pt; color: #5d6772; }}
.patient div {{ border-bottom: 0.25mm solid #c9c3b7; padding-bottom: 1.5mm; }}
.wm {{ position: absolute; right: 24mm; bottom: 40mm; width: 64mm; opacity: .06; }}
.foot {{ position: absolute; left: 18mm; right: 18mm; bottom: 12mm; border-top: 0.25mm solid #c9c3b7; padding-top: 3.5mm; display: flex; justify-content: space-between; gap: 8mm; font-size: 7.8pt; line-height: 1.45; color: #5d6772; }}
.foot b {{ color: {NAVY}; font-weight: 600; }}
'''
    html = HEAD + css + f'''</style></head><body><div class="page">
  <header class="head">
    <img src="{FULL}" alt="Dr Hemanth Chinthala, The Gut Doctor">
    <div class="right"><b>{QUALS}</b><br>{ROLE.replace(', Hepatologist', ',<br>Hepatologist')}</div>
  </header>
  <div class="reg"><p>Reg. No.<span></span></p><p>Date<span></span></p></div>
  <div class="patient"><div>Patient name</div><div>Age</div><div>Sex</div><div>Mobile</div></div>
  <img class="wm" src="{MARK}" alt="">
  <footer class="foot">
    <p><b>Medicover Hospital</b><br>Myscape Road, beside The District, Financial District,<br>Nanakramguda, Hyderabad 500032</p>
    <p style="text-align:right"><b>Appointments {PHONE}</b><br>{HOURS}<br>In an emergency, call 108</p>
  </footer>
</div></body></html>'''
    (SRC / 'letterhead.html').write_text(html)


# --------------------------------------------------------------------------
# Brand guide: A4 landscape, three pages.
# --------------------------------------------------------------------------
def cmyk(hexv):
    r, g, b = (int(hexv[i:i + 2], 16) / 255 for i in (1, 3, 5))
    k = 1 - max(r, g, b)
    if k == 1:
        return 0, 0, 0, 100
    return tuple(round(100 * v) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k))


def guide():
    css = f'''
@page {{ size: 297mm 210mm; margin: 0; }}
.p {{ width: 297mm; height: 210mm; position: relative; padding: 18mm 20mm; page-break-after: always; background: {CREAM}; overflow: hidden; }}
h1 {{ font-family: 'Newsreader', serif; font-weight: 340; font-size: 30pt; letter-spacing: -0.02em; line-height: 1.05; font-variation-settings: 'opsz' 72; }}
h2 {{ font-family: 'Newsreader', serif; font-weight: 380; font-size: 17pt; letter-spacing: -0.01em; margin-bottom: 5mm; font-variation-settings: 'opsz' 48; }}
p, li {{ font-size: 9pt; line-height: 1.5; color: #33414f; }}
.foot {{ position: absolute; left: 20mm; right: 20mm; bottom: 10mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #5d6772; }}
.cover {{ display: grid; place-items: center; }}
.cover img {{ width: 150mm; margin-top: -24mm; }}
.cover .sub {{ position: absolute; left: 20mm; bottom: 22mm; max-width: 200mm; }}
.grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }}
.tile {{ border-radius: 2mm; height: 40mm; padding: 5mm; }}
.tile img {{ display: block; width: 100%; height: 100%; object-fit: contain; }}
.panel {{ background: {CREAM}; border-radius: 2mm; height: 100%; padding: 2mm 3mm; }}
.cap {{ font-size: 7.5pt; color: #5d6772; margin-top: 1.5mm; }}
.wide {{ grid-column: span 2; }}
.cols {{ display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 12mm; }}
.sw {{ display: flex; gap: 3mm; align-items: center; margin-bottom: 3mm; }}
.sw i {{ width: 15mm; height: 15mm; border-radius: 1.5mm; border: 0.25mm solid rgba(18,31,43,.15); flex: none; }}
.sw p {{ font-size: 8pt; line-height: 1.45; }}
.sw b {{ font-size: 9pt; color: {NAVY}; }}
.type1 {{ font-family: 'Newsreader', serif; font-size: 24pt; font-weight: 430; line-height: 1.1; font-variation-settings: 'opsz' 72; }}
.type2 {{ font-family: 'Newsreader', serif; font-style: italic; font-size: 15pt; color: {TERRACOTTA}; }}
.type3 {{ font-size: 13pt; margin-top: 1mm; }}
ul {{ padding-left: 4mm; }}
.space {{ position: relative; width: 112mm; height: 50mm; margin: 4mm 0 2mm; outline: 0.3mm dashed {BROWN}; display: grid; place-items: center; }}
.space img {{ width: 84mm; }}
'''
    swatches = [
        ('Navy', NAVY, 'The name, the right hand, body text'),
        ('Copper', COPPER, 'The top of the shield, highlights'),
        ('Brown', BROWN, 'The organs and the left hand'),
        ('Terracotta', TERRACOTTA, 'The tagline, The Gut Doctor'),
        ('Cream', CREAM, 'Background and the inside of the shield'),
    ]
    sw_html = ''
    for name, hx, use in swatches:
        r, g, b = (int(hx[i:i + 2], 16) for i in (1, 3, 5))
        c, m, y, k = cmyk(hx)
        sw_html += (f'<div class="sw"><i style="background:{hx}"></i><p><b>{name}</b><br>HEX {hx.upper()}, RGB {r} {g} {b}<br>'
                    f'CMYK {c} {m} {y} {k} (approx.)<br>{use}</p></div>')
    foot = '<div class="foot"><span>Dr Hemanth Chinthala, The Gut Doctor</span><span>Logo and brand guide</span></div>'
    html = HEAD + css + f'''</style></head><body>
<section class="p cover"><img src="{FULL}" alt="">
  <div class="sub"><h1>Logo and brand guide</h1><p style="margin-top:3mm">The logo shows the organs he treats (the liver, the stomach and the intestines) inside a shield, held by two caring hands. Use the files in this kit as they are: the design is final.</p></div></section>

<section class="p"><h2>Logo files</h2>
<div class="grid">
  <div class="wide"><div class="tile" style="background:#fff"><img src="{FULL}"></div><p class="cap">The logo on white. logo-transparent.png</p></div>
  <div class="wide"><div class="tile" style="background:{CREAM};outline:0.25mm solid rgba(18,31,43,.12)"><img src="{FULL}"></div><p class="cap">The logo on its own cream. logo-on-cream.png</p></div>
  <div><div class="tile" style="background:#fff"><img src="{MARK}"></div><p class="cap">The shield alone. mark-transparent.png</p></div>
  <div><div class="tile" style="background:#fff"><img src="../social/profile-picture-1080.png"></div><p class="cap">Profile picture for WhatsApp, Instagram, Google. profile-picture-1080.png</p></div>
  <div><div class="tile" style="background:#fff"><img src="../icons/apple-touch-icon.png"></div><p class="cap">App and phone home-screen icon. icons/</p></div>
  <div><div class="tile" style="background:{NAVY}"><div class="panel"><img src="{FULL}"></div></div><p class="cap">On navy or a dark photo: always on a cream panel, never directly.</p></div>
</div>{foot}</section>

<section class="p"><div class="cols">
  <div><h2>Colours from the logo</h2>{sw_html}</div>
  <div><h2>Type</h2>
    <p class="type1">Newsreader</p><p class="type2">Newsreader Italic</p><p class="type3">Instrument Sans</p>
    <p style="margin-top:4mm">The logo's lettering is part of the logo image. For other text near it (letters, cards, the website), use Newsreader for names and headings, its italic for the tagline, and Instrument Sans for everything else. Both are free Google fonts.</p>
    <h2 style="margin-top:8mm">Clear space</h2>
    <div class="space"><img src="{FULL}"></div>
    <p>Keep space around the logo at least as wide as one hand in the logo. Nothing else should sit inside the dashed line.</p>
  </div>
  <div><h2>Minimum size</h2>
    <ul><li>Full logo: 35 mm wide in print, 200 px on screen.</li><li>The shield alone: 10 mm, 40 px.</li><li>Below 40 px, as in a browser tab, the shield becomes a small blur; that is expected.</li></ul>
    <h2 style="margin-top:8mm">Please don't</h2>
    <ul><li>Redraw, recolour or rearrange the logo.</li><li>Stretch, squash or rotate it.</li><li>Put it directly on navy, black or a busy photo; use a cream panel behind it.</li><li>Add shadows, outlines or glows.</li><li>Print it larger than about 30 cm across: it is an image, and a signboard needs a print-ready vector file made from it.</li></ul>
  </div>
</div>{foot}</section>
</body></html>'''
    (SRC / 'brand-guide.html').write_text(html)


# --------------------------------------------------------------------------
# Sign mockup: the logo on a cream panel mounted on a clinic wall.
# --------------------------------------------------------------------------
def sign_mockup():
    css = f'''
body {{ width: 1600px; height: 1100px; overflow: hidden; }}
.wall {{ position: absolute; inset: 0; background: radial-gradient(1200px 900px at 24% 18%, #f1ece3 0%, #ddd6cb 48%, #c6bdb1 100%); }}
.grain {{ position: absolute; inset: 0; opacity: .45; mix-blend-mode: multiply; }}
.floor {{ position: absolute; left: 0; right: 0; bottom: 0; height: 120px; background: linear-gradient(#b9afa2, #a89d8f); }}
.panel {{ position: absolute; left: 50%; top: 230px; transform: translateX(-50%); width: 1040px; padding: 54px 70px; background: {CREAM}; border-radius: 6px;
  box-shadow: 18px 26px 34px rgba(60,40,25,.30), 3px 5px 6px rgba(60,40,25,.28), inset 0 1px 0 rgba(255,255,255,.6); }}
.panel img {{ display: block; width: 100%; }}
'''
    html = HEAD + css + f'''</style></head><body>
<div class="wall"></div>
<svg class="grain" width="1600" height="1100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .22 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
<div class="floor"></div>
<div class="panel"><img src="{FULL}" alt=""></div>
</body></html>'''
    (SRC / 'sign-mockup.html').write_text(html)


def main():
    SRC.mkdir(parents=True, exist_ok=True)
    business_card()
    letterhead()
    guide()
    sign_mockup()
    print('HTML sources written to brand/src/')


if __name__ == '__main__':
    main()
