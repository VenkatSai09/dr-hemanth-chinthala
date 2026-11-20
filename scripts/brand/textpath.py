"""Turn a line of text into SVG path data using the site's own fonts.

The logo files must look identical everywhere, with or without the fonts
installed, so every letter is converted to outlines. HarfBuzz shapes the
text (kerning and ligatures included) at the chosen weight and optical size.
"""
import io
import pathlib
from functools import lru_cache

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
FONTS = {
    'serif': ROOT / 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2',
    'serif-italic': ROOT / 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-italic.woff2',
    'sans': ROOT / 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2',
}


@lru_cache(None)
def _face(name):
    f = TTFont(str(FONTS[name]))
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    return hb.Face(hb.Blob(buf.getvalue())), f['head'].unitsPerEm


def text_path(text, font='serif', size=100, x=0, y=0, tracking=0, **axes):
    """Return (path_d, advance_width) for text whose baseline starts at (x, y).

    tracking is extra space between letters, in em units (0.02 = 2%).
    axes are variation settings, e.g. wght=380, opsz=72.
    """
    face, upem = _face(font)
    f = hb.Font(face)
    if axes:
        f.set_variations(axes)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(f, buf, {'kern': True, 'liga': True})
    scale = size / upem
    pen = SVGPathPen(None, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
    cx = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        gx = x + (cx + pos.x_offset) * scale
        gy = y - pos.y_offset * scale
        tp = TransformPen(pen, (scale, 0, 0, -scale, gx, gy))
        f.draw_glyph_with_pen(info.codepoint, tp)
        cx += pos.x_advance + tracking * upem
    width = (cx - tracking * upem) * scale
    return pen.getCommands(), width


def cap_height(font='serif', size=100, **axes):
    """Height of a capital H above the baseline, for lining up the mark."""
    from fontTools.pens.boundsPen import BoundsPen
    face, upem = _face(font)
    f = hb.Font(face)
    if axes:
        f.set_variations(axes)
    bp = BoundsPen(None)
    f.draw_glyph_with_pen(f.get_nominal_glyph(ord('H')), bp)
    return bp.bounds[3] * size / upem
