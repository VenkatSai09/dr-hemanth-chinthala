"""Build the Dr Hemanth Chinthala logo kit from one source of truth.

Writes vector SVGs to brand/logo/. build_docs.py writes the print sources and
render.cjs turns everything into PNGs and PDFs.
Run: python3 scripts/brand/build_brand.py && python3 scripts/brand/build_docs.py && node scripts/brand/render.cjs
"""
import json
import pathlib

from textpath import text_path, cap_height

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'brand'

NAVY = '#0f1d2b'
SIENNA = '#9a4421'
SIENNA_LIGHT = '#e08a5f'
CREAM = '#f2eee6'
WHITE = '#ffffff'

# ---------------------------------------------------------------------------
# The mark, "the Shield of Care": the organs he treats (liver and gallbladder,
# stomach, small and large intestine) inside a shield, cradled by two hands.
# Drawn on a 100 x 100 grid; its visible extent is TIGHT.
# ---------------------------------------------------------------------------
import re

LIVER_BROWN = '#6e2a14'
LIVER_LIGHT = '#b9562c'
GALL_GOLD = '#c58a3c'
GALL_LIGHT = '#e7b26a'

# Organs, front view (the liver on the viewer's left), on their own 100 grid.
O_OES = 'M54 3 C54 10 54.5 17 56 23'
O_LIVER = ('M11 30 C10 21 20 16.5 33 17 C46 17.5 58 20 67.5 23.5 C72 25.5 71 29.5 66.5 30.5 '
           'C58 32.5 51 35.5 45 39 C42.5 40.6 40.5 41.3 38.5 41 C36.5 40.7 34.5 41.4 32.5 43 '
           'C26 47.5 12 44.5 11 30 Z')
O_GALL = 'M35.4 38.5 C39.8 38.8 42.4 43.8 41.3 48.4 C40.4 51.8 35.7 52.3 34.1 49.3 C32.8 46.6 32.6 40.5 35.4 38.5 Z'
O_STOMACH = ('M42 33 C43 22 53 14 65 14 C79 14 89 26 89 43 C89 66 73 85 51 86 C39 86.5 29 82 23 75 '
             'C20 71.5 19.5 67 22 64.5 C24.5 62 28 62.5 30.5 64.5 C35 67.5 41 68.5 47 67.5 C53 66.5 57 61 57.5 53 '
             'C58 46 56 40 51 37.5 C48 36 45.5 36 44 37.5 Z')
O_STOMACH_T = 'translate(40.5 16.5) scale(0.46)'
O_COLON = ('M27 92 C22 90 20 86 20 80 L20 66 C20 61 23 59 28 59 L72 59 C77 59 80 61 80 66 '
           'L80 80 C80 86 77 89 71 89 L60 89 C55 89 52 91 52 96')
O_SMALL = ('M31 66.5 C35.5 62.5 41 64.5 40 68.5 C39 72.5 32.5 71.5 32.5 76 C32.5 80.5 38.5 81 41.5 78 '
           'C44.5 75 43.5 69.5 48 67.5 C52.5 65.5 57.5 67.5 56.5 71.5 C55.5 75.5 49.5 75.5 50 79.5 '
           'C50.5 83.5 57 83.5 60 80.5 C63 77.5 61 72.5 64 69.5 C66.5 67 70.5 68 70 71.5 '
           'C69.5 75 66 76.5 66.5 80 C67 83 70 83.5 70.5 83.5')

SHIELD = ('M50 6 C60 11.5 72 14 84 14 L84 43 C84 63 70 78 50 87 '
          'C30 78 16 63 16 43 L16 14 C28 14 40 11.5 50 6 Z')
SHIELD_IN = ('M50 12.2 C59 16.8 69.2 19.2 78.4 19.5 L78.4 43 C78.4 60 67 72.6 50 80.8 '
             'C33 72.6 21.6 60 21.6 43 L21.6 19.5 C30.8 19.2 41 16.8 50 12.2 Z')
HAND_L = ('M12.2 44.5 C12.6 51 13.2 57 14.8 62.5 C18.6 75 30 85.6 50 92 '
          'L50 98.5 C25 96 8 79 5.6 56 C5.2 51 6.6 45.6 9.4 44.2 C10.4 43.7 11.6 43.9 12.2 44.5 Z')
FINGERS_L = ['M4 58.5 L14.4 56.6', 'M5.4 66.6 L16.6 63.2', 'M8.6 74.4 L20.2 69.6']


def _mirror(d):
    toks = re.findall(r'[A-Za-z]|-?\d*\.?\d+', d)
    out, n = [], 0
    for tk in toks:
        if tk.isalpha():
            out.append(tk); n = 0
        else:
            out.append(f'{100 - float(tk):g}' if n % 2 == 0 else tk); n += 1
    return ' '.join(out)


HAND_R = _mirror(HAND_L)
FINGERS_R = [_mirror(f) for f in FINGERS_L]
TIGHT = (5, 5.5, 90, 93.5)  # x, y, w, h of the mark's ink

SCHEMES = {
    # left half, right half, organ colours (liver, gall, stomach, small bowel, colon and food pipe)
    'colour': (SIENNA, NAVY, (LIVER_BROWN, GALL_GOLD, SIENNA_LIGHT, SIENNA, NAVY)),
    'on-dark': (SIENNA_LIGHT, CREAM, (LIVER_LIGHT, GALL_LIGHT, SIENNA_LIGHT, SIENNA_LIGHT, CREAM)),
    'navy': (NAVY, NAVY, (NAVY,) * 5),
    'white': (WHITE, WHITE, (WHITE,) * 5),
}
TEXT = {  # name colour, tagline colour
    'colour': (NAVY, SIENNA),
    'on-dark': (CREAM, SIENNA_LIGHT),
    'navy': (NAVY, NAVY),
    'white': (WHITE, WHITE),
}
_uid = [0]


def organs(scheme):
    liver, gall, stom, small, colon = SCHEMES[scheme][2]
    return (f'<path d="{O_COLON}" fill="none" stroke="{colon}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{O_SMALL}" fill="none" stroke="{small}" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{O_OES}" fill="none" stroke="{colon}" stroke-width="4.2" stroke-linecap="round"/>'
            f'<path d="{O_STOMACH}" transform="{O_STOMACH_T}" fill="{stom}"/>'
            f'<path d="{O_GALL}" fill="{gall}"/>'
            f'<path d="{O_LIVER}" fill="{liver}"/>')


def mark_paths(scheme, fold=True, hands=True):
    """The mark's shapes. The shield is a ring in two halves (sienna and navy);
    the hands have small gaps between the fingers. fold is kept for older callers."""
    left, right, _ = SCHEMES[scheme]
    _uid[0] += 1
    u = f'soc{_uid[0]}'
    ring = f'{SHIELD} {SHIELD_IN}'
    s = (f'<defs><clipPath id="{u}l"><rect width="50" height="100"/></clipPath>'
         f'<clipPath id="{u}r"><rect x="50" width="50" height="100"/></clipPath>'
         f'<mask id="{u}m" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/>'
         + ''.join(f'<path d="{f}" stroke="#000" stroke-width="1.5"/>' for f in FINGERS_L + FINGERS_R) +
         '</mask></defs>'
         f'<path d="{ring}" fill-rule="evenodd" fill="{left}" clip-path="url(#{u}l)"/>'
         f'<path d="{ring}" fill-rule="evenodd" fill="{right}" clip-path="url(#{u}r)"/>'
         f'<g transform="translate(29.1 23.4) scale(.46)">{organs(scheme)}</g>')
    if hands:
        s += f'<g mask="url(#{u}m)"><path d="{HAND_L}" fill="{left}"/><path d="{HAND_R}" fill="{right}"/></g>'
    return s


def svg(view, body, w=None, h=None, title='Dr Hemanth Chinthala, The Gut Doctor'):
    vx, vy, vw, vh = view
    size = f' width="{w}" height="{h}"' if w else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:g} {vy:g} {vw:g} {vh:g}"{size} role="img">'
            f'<title>{title}</title>{body}</svg>\n')


def mark_svg(scheme, fold=True):
    return svg(TIGHT, mark_paths(scheme, fold), title='The Gut Doctor mark')


def app_icon_svg(fold=True, radius=22):
    # Navy rounded tile; the mark sits in the middle with room to breathe.
    tx, ty, tw, th = TIGHT
    k = 74 / th
    ox = 50 - (tx + tw / 2) * k
    oy = 50 - (ty + th / 2) * k
    body = (f'<rect width="100" height="100" rx="{radius}" fill="{NAVY}"/>'
            f'<g transform="translate({ox:.2f} {oy:.2f}) scale({k:.4f})">{mark_paths("on-dark", fold)}</g>')
    return svg((0, 0, 100, 100), body, title='The Gut Doctor')


# ---------------------------------------------------------------------------
# Lockups. Units are arbitrary; everything is laid out from the type.
# ---------------------------------------------------------------------------
NAME = dict(font='serif', wght=380, opsz=72)
TAG = dict(font='serif-italic', wght=380, opsz=36)


def horizontal(scheme):
    name_size, tag_size = 44, 30
    capH = cap_height('serif', name_size, wght=380, opsz=72)
    name_base = capH
    tag_base = name_base + 40
    top, bottom = 0, tag_base + 1  # cap top to tagline baseline
    tx, ty, tw, th = TIGHT
    k = (bottom - top) * 1.42 / th
    mw = tw * k
    my = top - (bottom - top) * 0.21
    gap = 30
    nx = mw + gap
    nc, tc = TEXT[scheme]
    name_d, name_w = text_path('Dr Hemanth Chinthala', size=name_size, x=nx, y=name_base, tracking=-0.01, **NAME)
    tag_d, tag_w = text_path('The Gut Doctor', size=tag_size, x=nx, y=tag_base, **TAG)
    body = (f'<g transform="translate({-tx * k:.2f} {my - ty * k:.2f}) scale({k:.4f})">{mark_paths(scheme, scheme in ("colour", "on-dark"))}</g>'
            f'<path d="{name_d}" fill="{nc}"/><path d="{tag_d}" fill="{tc}"/>')
    width = nx + max(name_w, tag_w)
    pad = 2
    return svg((-pad, my - pad, width + 2 * pad, th * k + 2 * pad + 8), body), (width + 2 * pad, th * k + 2 * pad + 8)


def stacked(scheme):
    name_size, tag_size = 44, 30
    nc, tc = TEXT[scheme]
    name_d, name_w = text_path('Dr Hemanth Chinthala', size=name_size, x=0, y=0, tracking=-0.01, **NAME)
    tag_d, tag_w = text_path('The Gut Doctor', size=tag_size, x=0, y=0, **TAG)
    tx, ty, tw, th = TIGHT
    mark_h = 120
    k = mark_h / th
    cx = name_w / 2
    capH = cap_height('serif', name_size, wght=380, opsz=72)
    name_base = mark_h + 34 + capH
    tag_base = name_base + 42
    body = (f'<g transform="translate({cx - (tx + tw / 2) * k:.2f} {-ty * k:.2f}) scale({k:.4f})">{mark_paths(scheme, scheme in ("colour", "on-dark"))}</g>'
            f'<g transform="translate(0 {name_base:.2f})"><path d="{name_d}" fill="{nc}"/></g>'
            f'<g transform="translate({(name_w - tag_w) / 2:.2f} {tag_base:.2f})"><path d="{tag_d}" fill="{tc}"/></g>')
    pad = 4
    h = tag_base + 10
    return svg((-pad, -pad, name_w + 2 * pad, h + 2 * pad), body), (name_w + 2 * pad, h + 2 * pad)


def wordmark(scheme):
    nc, tc = TEXT[scheme]
    capH = cap_height('serif', 44, wght=380, opsz=72)
    name_d, name_w = text_path('Dr Hemanth Chinthala', size=44, x=0, y=capH, tracking=-0.01, **NAME)
    tag_d, tag_w = text_path('The Gut Doctor', size=30, x=0, y=capH + 40, **TAG)
    return svg((-2, -2, name_w + 4, capH + 52), f'<path d="{name_d}" fill="{nc}"/><path d="{tag_d}" fill="{tc}"/>')


def favicon_svg():
    # Simplified for 16-32 px: the shield and organs without the hands, larger in the tile.
    tx, ty, tw, th = 16, 6, 68, 81
    k = 82 / th
    ox = 50 - (tx + tw / 2) * k
    oy = 50 - (ty + th / 2) * k
    body = (f'<rect width="100" height="100" rx="20" fill="{NAVY}"/>'
            f'<g transform="translate({ox:.2f} {oy:.2f}) scale({k:.4f})">{mark_paths("on-dark", hands=False)}</g>')
    return svg((0, 0, 100, 100), body, title='The Gut Doctor')


def main():
    (OUT / 'logo').mkdir(parents=True, exist_ok=True)
    files = {}
    sizes = {}
    for sch in SCHEMES:
        files[f'logo/mark-{sch}.svg'] = mark_svg(sch)
        files[f'logo/logo-horizontal-{sch}.svg'], sizes[f'logo-horizontal-{sch}'] = horizontal(sch)
        files[f'logo/logo-stacked-{sch}.svg'], sizes[f'logo-stacked-{sch}'] = stacked(sch)
        files[f'logo/wordmark-{sch}.svg'] = wordmark(sch)
    files['logo/app-icon.svg'] = app_icon_svg()
    files['logo/app-icon-square.svg'] = app_icon_svg(radius=0)  # for iOS, Android and profile pictures, which round it themselves
    files['logo/favicon.svg'] = favicon_svg()
    for name, content in files.items():
        (OUT / name).write_text(content)
    (OUT / 'logo' / 'sizes.json').write_text(json.dumps(sizes, indent=1))
    print(f'{len(files)} SVG files written to brand/logo/')


if __name__ == '__main__':
    main()
