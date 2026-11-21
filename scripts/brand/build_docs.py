"""HTML sources for the print and guide files. render.cjs turns them into PDFs and PNGs.

Run after build_brand.py:  python3 scripts/brand/build_docs.py
"""
import pathlib

from build_brand import (NAVY, SIENNA, SIENNA_LIGHT, CREAM, OUT, TIGHT, mark_paths)

SRC = OUT / 'src'
LOGO = '../logo'
FONTS = '../../node_modules/@fontsource-variable'

HEAD = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'Newsreader'; src: url({FONTS}/newsreader/files/newsreader-latin-standard-normal.woff2) format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'Newsreader'; font-style: italic; src: url({FONTS}/newsreader/files/newsreader-latin-standard-italic.woff2) format('woff2'); font-weight: 200 800; }}
@font-face {{ font-family: 'Instrument Sans'; src: url({FONTS}/instrument-sans/files/instrument-sans-latin-standard-normal.woff2) format('woff2'); font-weight: 400 700; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family: 'Instrument Sans', sans-serif; color: {NAVY}; }}
.serif {{ font-family: 'Newsreader', serif; font-variation-settings: 'opsz' 72; }}
'''

ADDRESS = 'Medicover Hospital, Myscape Road, beside The District, Financial District, Nanakramguda, Hyderabad 500032'
PHONE = '+91 70872 22235'
HOURS = 'Monday to Saturday, 9 am to 4 pm'
ROLE = 'Consultant Medical Gastroenterologist, Hepatologist and Interventional Endoscopist'
QUALS = 'MBBS, MD (PGIMER), DM (CMC Vellore), ESEGH (UK)'


def watermark(opacity):
    tx, ty, tw, th = TIGHT
    return (f'<svg viewBox="{tx} {ty} {tw} {th}" style="opacity:{opacity}">'
            f'{mark_paths("navy", fold=False)}</svg>')


# --------------------------------------------------------------------------
# Business card: 3.5 x 2 inches (the usual Indian size) with 3 mm bleed.
# --------------------------------------------------------------------------
def business_card():
    css = '''
@page { size: 94.9mm 56.8mm; margin: 0; }
.card { width: 94.9mm; height: 56.8mm; position: relative; overflow: hidden; page-break-after: always; }
.front { background: #f2eee6; display: grid; place-items: center; }
.front img { width: 62mm; }
.back { background: #0f1d2b; color: #e9e3d7; padding: 8mm 9mm 0 9mm; }
.back .name { font-size: 15.5pt; line-height: 1.05; font-weight: 380; letter-spacing: -0.01em; color: #f2eee6; }
.back .tag { font-family: 'Newsreader', serif; font-style: italic; font-size: 9.5pt; color: #e08a5f; margin-top: 1mm; }
.back .role { font-size: 6.4pt; line-height: 1.35; margin-top: 3mm; max-width: 58mm; color: #cfd6dc; }
.back .quals { font-size: 6.4pt; margin-top: 1mm; color: #9aa6b2; }
.back .rule { height: 0.3mm; background: rgba(233,227,215,.25); margin: 3.2mm 0 2.6mm; width: 76.9mm; }
.back .row { display: grid; grid-template-columns: 22mm 1fr; gap: 1mm 2mm; font-size: 6.4pt; line-height: 1.35; }
.back .row dt { color: #9aa6b2; }
.back .row dd { color: #f2eee6; }
.back .mark { position: absolute; right: 9mm; top: 8mm; width: 9mm; }
'''
    tx, ty, tw, th = TIGHT
    html = HEAD + css + f'''</style></head><body>
<section class="card front"><img src="{LOGO}/logo-primary-colour.svg" alt="Dr Hemanth Chinthala, The Gut Doctor"></section>
<section class="card back">
  <svg class="mark" viewBox="{tx} {ty} {tw} {th}">{mark_paths("on-dark")}</svg>
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
    css = '''
@page { size: A4; margin: 0; }
.page { width: 210mm; height: 297mm; position: relative; background: #fff; padding: 16mm 18mm; }
.head { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 6mm; border-bottom: 0.5mm solid #9a4421; }
.head img { height: 22mm; }
.head .right { text-align: right; font-size: 8pt; line-height: 1.5; color: #33414f; }
.head .right b { white-space: nowrap; }
.head .right b { font-weight: 600; color: #0f1d2b; }
.reg { margin-top: 4mm; display: flex; justify-content: space-between; font-size: 8.4pt; color: #5d6772; }
.reg span { display: inline-block; min-width: 46mm; border-bottom: 0.25mm solid #c9c3b7; margin-left: 2mm; }
.patient { margin-top: 7mm; display: grid; grid-template-columns: 2.2fr 0.7fr 0.7fr 1fr; gap: 4mm; font-size: 8.4pt; color: #5d6772; }
.patient div { border-bottom: 0.25mm solid #c9c3b7; padding-bottom: 1.5mm; }
.wm { position: absolute; right: 22mm; bottom: 42mm; width: 62mm; }
.foot { position: absolute; left: 18mm; right: 18mm; bottom: 12mm; border-top: 0.25mm solid #c9c3b7; padding-top: 3.5mm; display: flex; justify-content: space-between; gap: 8mm; font-size: 7.8pt; line-height: 1.45; color: #5d6772; }
.foot b { color: #0f1d2b; font-weight: 600; }
'''
    html = HEAD + css + f'''</style></head><body><div class="page">
  <header class="head">
    <img src="{LOGO}/logo-primary-colour.svg" alt="Dr Hemanth Chinthala, The Gut Doctor">
    <div class="right"><b>{QUALS}</b><br>{ROLE.replace(', Hepatologist', ',<br>Hepatologist')}</div>
  </header>
  <div class="reg"><p>Reg. No.<span></span></p><p>Date<span></span></p></div>
  <div class="patient"><div>Patient name</div><div>Age</div><div>Sex</div><div>Mobile</div></div>
  <div class="wm">{watermark(0.045)}</div>
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
    css = '''
@page { size: 297mm 210mm; margin: 0; }
.p { width: 297mm; height: 210mm; position: relative; padding: 18mm 20mm; page-break-after: always; background: #f2eee6; overflow: hidden; }
h1 { font-family: 'Newsreader', serif; font-weight: 340; font-size: 30pt; letter-spacing: -0.02em; line-height: 1.05; font-variation-settings: 'opsz' 72; }
h2 { font-family: 'Newsreader', serif; font-weight: 380; font-size: 17pt; letter-spacing: -0.01em; margin-bottom: 5mm; font-variation-settings: 'opsz' 48; }
h3 { font-size: 9pt; font-weight: 600; margin-bottom: 2mm; }
p, li { font-size: 9pt; line-height: 1.5; color: #33414f; }
.foot { position: absolute; left: 20mm; right: 20mm; bottom: 10mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #5d6772; }
.cover { display: grid; place-items: center; }
.cover img { width: 140mm; margin-top: -20mm; }
.cover .sub { position: absolute; left: 20mm; bottom: 22mm; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }
.tile { border-radius: 2mm; height: 36mm; padding: 5mm; }
.tile img { display: block; width: 100%; height: 100%; object-fit: contain; }
.cap { font-size: 7.5pt; color: #5d6772; margin-top: 1.5mm; }
.wide { grid-column: span 2; }
.cols { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 12mm; }
.sw { display: flex; gap: 3mm; align-items: center; margin-bottom: 3mm; }
.sw i { width: 16mm; height: 16mm; border-radius: 1.5mm; border: 0.25mm solid rgba(15,29,43,.15); flex: none; }
.sw p { font-size: 8pt; line-height: 1.45; }
.sw b { font-size: 9pt; color: #0f1d2b; }
.type1 { font-family: 'Newsreader', serif; font-size: 26pt; font-weight: 380; line-height: 1.1; font-variation-settings: 'opsz' 72; }
.type2 { font-family: 'Newsreader', serif; font-style: italic; font-size: 16pt; color: #9a4421; }
.type3 { font-size: 13pt; margin-top: 1mm; }
ul { padding-left: 4mm; }
.space { position: relative; width: 110mm; height: 38mm; margin: 4mm 0 2mm; outline: 0.3mm dashed #9a4421; outline-offset: 0; display: grid; place-items: center; }
.space img { width: 72mm; }
'''
    swatches = [
        ('Navy', NAVY, 'Text, the food pipe, dark backgrounds'),
        ('Sienna', SIENNA, 'The stomach and the tagline on light backgrounds'),
        ('Light sienna', SIENNA_LIGHT, 'The stomach and the tagline on navy'),
        ('Cream', CREAM, 'Light backgrounds'),
    ]
    sw_html = ''
    for name, hx, use in swatches:
        r, g, b = (int(hx[i:i + 2], 16) for i in (1, 3, 5))
        c, m, y, k = cmyk(hx)
        sw_html += (f'<div class="sw"><i style="background:{hx}"></i><p><b>{name}</b><br>HEX {hx.upper()}<br>'
                    f'RGB {r} {g} {b}<br>CMYK {c} {m} {y} {k} (approx.)<br>{use}</p></div>')
    foot = '<div class="foot"><span>Dr Hemanth Chinthala, The Gut Doctor</span><span>Logo and brand guide</span></div>'
    html = HEAD + css + f'''</style></head><body>
<section class="p cover"><img src="{LOGO}/logo-primary-colour.svg" alt="">
  <div class="sub"><h1>Logo and brand guide</h1><p style="margin-top:3mm">The mark is the Shield of Care: the organs he treats (the liver and gallbladder, the stomach, and the small and large intestine) inside a sienna-to-navy shield, with dots for the gut's microbes, held by two hands.</p></div></section>

<section class="p"><h2>Logo versions</h2>
<div class="grid">
  <div class="wide"><div class="tile" style="background:#fff"><img src="{LOGO}/logo-primary-colour.svg"></div><p class="cap">Primary logo. The main version. logo-primary-colour</p></div>
  <div class="wide"><div class="tile" style="background:{NAVY}"><img src="{LOGO}/logo-primary-on-dark.svg"></div><p class="cap">Primary, on navy or dark photos. logo-primary-on-dark</p></div>
  <div class="wide"><div class="tile" style="background:#fff"><img src="{LOGO}/logo-horizontal-colour.svg"></div><p class="cap">One line, for narrow spaces such as a website header. logo-horizontal-colour</p></div>
  <div><div class="tile" style="background:#fff"><img src="{LOGO}/logo-stacked-colour.svg"></div><p class="cap">Stacked, for square spaces. logo-stacked-colour</p></div>
  <div><div class="tile" style="background:#fff"><img src="{LOGO}/badge-circle.svg"></div><p class="cap">Round badge and profile picture. badge-circle</p></div>
  <div><div class="tile" style="background:#fff"><img src="{LOGO}/mark-line.svg"></div><p class="cap">Line drawing, for engraving, embossing and one-colour print. mark-line</p></div>
  <div><div class="tile" style="background:#fff"><img src="{LOGO}/mark-colour.svg"></div><p class="cap">Mark alone. mark-colour</p></div>
  <div><div class="tile" style="background:#fff"><img src="{LOGO}/logo-primary-navy.svg"></div><p class="cap">One colour, navy. logo-primary-navy</p></div>
  <div><div class="tile" style="background:#33414f"><img src="{LOGO}/logo-primary-white.svg"></div><p class="cap">One colour, white. logo-primary-white</p></div>
</div>{foot}</section>

<section class="p"><div class="cols">
  <div><h2>Colours</h2>{sw_html}</div>
  <div><h2>Type</h2>
    <p class="type1">Newsreader</p><p class="type2">Newsreader Italic</p><p class="type3">Instrument Sans</p>
    <p style="margin-top:4mm">Newsreader for the name and headings, its italic for the tagline, Instrument Sans for everything else. Both are free Google fonts, so any printer or designer can use them. In the logo files the letters are already outlines, so the logo looks right even without the fonts.</p>
    <h2 style="margin-top:9mm">Clear space</h2>
    <div class="space"><img src="{LOGO}/logo-primary-colour.svg"></div>
    <p>Keep space around the logo at least a quarter of the shield's width. Nothing else should sit inside the dashed line.</p>
  </div>
  <div><h2>Minimum size</h2>
    <ul><li>Horizontal logo: 30 mm wide in print, 160 px on screen.</li><li>Stacked logo: 22 mm wide, 120 px.</li><li>Mark alone: 10 mm, 40 px. Below 40 px, use favicon.svg, which leaves out the hands.</li></ul>
    <h2 style="margin-top:9mm">Please don't</h2>
    <ul><li>Stretch, squash or rotate the logo.</li><li>Change its colours, or use the colour version on navy (use the on-dark version).</li><li>Add shadows, outlines or glows.</li><li>Put it on a busy photo without a plain area behind it.</li><li>Retype the name in another font. Use the files.</li></ul>
  </div>
</div>{foot}</section>
</body></html>'''
    (SRC / 'brand-guide.html').write_text(html)


def sign_mockup():
    from build_brand import mark_paths as mp, primary
    tx, ty, tw, th = TIGHT
    css = """
body { width: 1600px; height: 1100px; overflow: hidden; }
.wall { position: absolute; inset: 0; background:
  radial-gradient(1200px 900px at 22% 18%, #efe9e0 0%, #ddd5ca 46%, #c5bcb0 100%); }
.grain { position: absolute; inset: 0; opacity: .5; mix-blend-mode: multiply; }
.floor { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; background: linear-gradient(#b9afa2, #a89d8f); box-shadow: 0 -2px 0 rgba(0,0,0,.06) inset; }
.sign { position: absolute; left: 50%; top: 150px; transform: translateX(-50%); text-align: center; }
.sign svg.m { width: 420px; height: auto; filter: drop-shadow(10px 16px 10px rgba(60,40,25,.32)) drop-shadow(2px 3px 2px rgba(60,40,25,.35)); }
.name { margin-top: 34px; font-family: 'Newsreader', serif; font-weight: 430; font-size: 76px; letter-spacing: -0.01em; color: #0f1d2b; font-variation-settings: 'opsz' 72;
  text-shadow: 3px 5px 4px rgba(60,40,25,.28), 1px 1px 0 rgba(255,255,255,.35); }
.tag { margin-top: 6px; font-family: 'Newsreader', serif; font-style: italic; font-size: 46px; color: #9a4421; text-shadow: 2px 4px 3px rgba(60,40,25,.25); }
"""
    bevel = ('<filter id="bev" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="b"/>'
             '<feSpecularLighting in="b" surfaceScale="2.4" specularConstant=".6" specularExponent="22" lighting-color="#fff" result="s">'
             '<feDistantLight azimuth="225" elevation="38"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>'
             '<feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".32" k4="0"/></filter>')
    html = HEAD + css + f"""</style></head><body>
<div class="wall"></div>
<svg class="grain" width="1600" height="1100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .22 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
<div class="floor"></div>
<div class="sign">
  <svg class="m" viewBox="{tx} {ty} {tw} {th}"><defs>{bevel}</defs><g filter="url(#bev)">{mp('colour')}</g></svg>
  <p class="name">Dr Hemanth Chinthala</p>
  <p class="tag">The Gut Doctor</p>
</div>
</body></html>"""
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
