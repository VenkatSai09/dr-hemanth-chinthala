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
# The mark itself lives in mark.py.
# ---------------------------------------------------------------------------
from mark import mark as _mark, TIGHT, TIGHT_NO_HANDS

SCHEMES = ('colour', 'on-dark', 'navy', 'white')
TEXT = {  # name colour, tagline colour
    'colour': (NAVY, SIENNA),
    'on-dark': (CREAM, SIENNA_LIGHT),
    'navy': (NAVY, NAVY),
    'white': (WHITE, WHITE),
}


def mark_paths(scheme, fold=True, hands=True):
    """The mark's shapes for one colour scheme. fold is kept for older callers."""
    return _mark(scheme, hands=hands)


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
    k = (bottom - top) * 1.45 / th
    mw = tw * k
    my = top - (bottom - top) * 0.22
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
    tx, ty, tw, th = TIGHT_NO_HANDS
    k = 84 / th
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
