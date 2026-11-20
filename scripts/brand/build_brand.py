"""Build the Dr Hemanth Chinthala logo kit from one source of truth.

Writes vector SVGs to brand/logo/, plus the HTML sources that
scripts/brand/render.mjs turns into PNGs and PDFs.
Run: python3 scripts/brand/build_brand.py && node scripts/brand/render.mjs
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
# The mark: a stomach in front view, the food pipe entering at the top.
# Drawn on a 100 x 100 grid; its visible extent is TIGHT.
# ---------------------------------------------------------------------------
STOMACH = ('M42 33 C43 22 53 14 65 14 C79 14 89 26 89 43 '
           'C89 66 73 85 51 86 C39 86.5 29 82 23 75 '
           'C20 71.5 19.5 67 22 64.5 C24.5 62 28 62.5 30.5 64.5 '
           'C35 67.5 41 68.5 47 67.5 C53 66.5 57 61 57.5 53 '
           'C58 46 56 40 51 37.5 C48 36 45.5 36 44 37.5 Z')
OESOPHAGUS = 'M47.6 1 C47.6 6 47.6 10 47.8 14.2'  # stops just short of the stomach
FOLD = 'M65 22 C78 26 83 40 81 54 C79 66 70 76 56 79'   # a highlight along the inner folds
TIGHT = (19.5, -2.5, 70, 89)  # x, y, w, h of the mark's ink, with the pipe's round cap

SCHEMES = {
    # name: (pipe, stomach, fold colour, fold opacity)
    'colour': (NAVY, SIENNA, CREAM, 0.55),
    'on-dark': (CREAM, SIENNA_LIGHT, CREAM, 0.6),
    'navy': (NAVY, NAVY, None, 0),
    'white': (WHITE, WHITE, None, 0),
}
TEXT = {  # name colour, tagline colour
    'colour': (NAVY, SIENNA),
    'on-dark': (CREAM, SIENNA_LIGHT),
    'navy': (NAVY, NAVY),
    'white': (WHITE, WHITE),
}


def mark_paths(scheme, fold=True, pipe_w=7):
    """The mark's shapes. The food pipe stops just short of the stomach, so
    the two parts stay distinct even when the mark is in one colour."""
    pipe, body, fc, fo = SCHEMES[scheme]
    s = (f'<path d="{STOMACH}" fill="{body}"/>'
         f'<path d="{OESOPHAGUS}" fill="none" stroke="{pipe}" stroke-width="{pipe_w}" stroke-linecap="round"/>')
    if fold and fc:
        s += f'<path d="{FOLD}" fill="none" stroke="{fc}" stroke-width="2.6" stroke-linecap="round" opacity="{fo}"/>'
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
    k = 64 / th
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
    k = (bottom - top) * 1.08 / th
    mw = tw * k
    my = top - (bottom - top) * 0.04
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
    # Simplified for 16-32 px: no fold line, slightly heavier pipe, tighter tile.
    tx, ty, tw, th = TIGHT
    k = 74 / th
    ox = 50 - (tx + tw / 2) * k
    oy = 50 - (ty + th / 2) * k
    body = (f'<rect width="100" height="100" rx="20" fill="{NAVY}"/>'
            f'<g transform="translate({ox:.2f} {oy:.2f}) scale({k:.4f})">{mark_paths("on-dark", fold=False, pipe_w=8.5)}</g>')
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
