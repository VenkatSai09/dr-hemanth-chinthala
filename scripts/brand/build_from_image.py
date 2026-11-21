"""Build the logo kit from the doctor's chosen logo image, without changing the design.

The only processing: the plain cream background is made transparent, the small
Gemini star in the corner is removed, and the shield is cropped out on its own.
Larger sizes are smooth enlargements of the original.

Source: brand/source/logo-original.png (kept exactly as received).
Run: python3 scripts/brand/build_from_image.py
"""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRAND = ROOT / 'brand'
SRC = BRAND / 'source' / 'logo-original.png'

STAR = (895, 636, 945, 690)        # x0, y0, x1, y1 of the Gemini star (empty background)
FULL = (133, 213, 895, 524)         # the whole logo: shield, name and tagline
MARK = (133, 213, 411, 524)         # the shield alone
CREAM_BG = (246, 241, 229)          # the logo's own background colour


def load():
    im = Image.open(SRC).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    bg = np.array(CREAM_BG, np.float32)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    alpha = np.clip((dist - 4) / 22, 0, 1)
    x0, y0, x1, y1 = STAR
    alpha[y0:y1, x0:x1] = 0
    # The inside of the shield is the same cream as the background. Keep it:
    # only background connected to the image edge becomes transparent there.
    bgl = Image.fromarray(((dist < 10) * 255).astype(np.uint8), 'L').copy()
    ImageDraw.floodfill(bgl, (0, 0), 128)
    outside = (np.asarray(bgl) == 128)
    outside = np.asarray(Image.fromarray((outside * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    mx0, my0, mx1, my1 = MARK
    region = np.zeros_like(outside)
    region[my0 - 6:my1 + 6, mx0 - 6:mx1 + 6] = True
    alpha = np.where(region & ~outside, 1.0, alpha)
    al = np.maximum(alpha, 1e-3)[..., None]
    fg = np.where(alpha[..., None] > 0.02, np.clip((a - bg * (1 - al)) / al, 0, 255), bg)
    transparent = Image.fromarray(np.dstack([fg, alpha * 255]).astype(np.uint8), 'RGBA')
    on_cream = im.copy()
    on_cream.paste(CREAM_BG, STAR)  # the star removed, background otherwise untouched
    return transparent, on_cream


def crop(im, box, pad):
    x0, y0, x1, y1 = box
    return im.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))


def enlarge(im, k):
    if k == 1:
        return im
    big = im.resize((im.width * k, im.height * k), Image.LANCZOS)
    if big.mode == 'RGBA':
        r, g, b, a = big.split()
        rgb = Image.merge('RGB', (r, g, b)).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
        return Image.merge('RGBA', (*rgb.split(), a))
    return big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))


def on_square(mark, size, bg, fill=0.78):
    """The shield centred on a square tile, for icons and profile pictures."""
    canvas = Image.new('RGBA', (size, size), bg + (255,) if bg else (0, 0, 0, 0))
    k = fill * size / max(mark.width, mark.height)
    m = mark.resize((round(mark.width * k), round(mark.height * k)), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


def main():
    t, cream = load()
    out = {d: BRAND / d for d in ('logo', 'icons', 'social', 'web')}
    for d in out.values():
        d.mkdir(parents=True, exist_ok=True)

    full_t, full_c = crop(t, FULL, 24), crop(cream, FULL, 48)
    mark_t, mark_c = crop(t, MARK, 10), crop(cream, MARK, 30)
    for k in (1, 2, 4):
        suffix = '' if k == 1 else f'@{k}x'
        enlarge(full_t, k).save(out['logo'] / f'logo-transparent{suffix}.png', optimize=True)
        enlarge(full_c, k).save(out['logo'] / f'logo-on-cream{suffix}.png', optimize=True)
        enlarge(mark_t, k).save(out['logo'] / f'mark-transparent{suffix}.png', optimize=True)
        enlarge(mark_c, k).save(out['logo'] / f'mark-on-cream{suffix}.png', optimize=True)
    enlarge(full_c, 2).convert('RGB').save(out['logo'] / 'logo-on-cream@2x.jpg', quality=92)

    big_mark = enlarge(mark_t, 4)
    # Icons: the shield on the logo's cream.
    for s in (16, 32, 48):
        on_square(big_mark, s, CREAM_BG, 0.92).save(out['icons'] / f'favicon-{s}.png')
    ico = on_square(big_mark, 48, CREAM_BG, 0.92)
    ico.save(out['icons'] / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    on_square(big_mark, 180, CREAM_BG, 0.8).convert('RGB').save(out['icons'] / 'apple-touch-icon.png')
    for s in (192, 512):
        on_square(big_mark, s, CREAM_BG, 0.72).convert('RGB').save(out['icons'] / f'icon-{s}.png')
    # Profile picture: safe inside the circle WhatsApp and Instagram crop to.
    on_square(big_mark, 1080, CREAM_BG, 0.66).convert('RGB').save(out['social'] / 'profile-picture-1080.png')
    # For the website header.
    for h in (44, 88, 132):
        k = h / mark_t.height
        src = big_mark if h > mark_t.height else mark_t
        src.resize((round(mark_t.width * k), h), Image.LANCZOS).save(out['web'] / f'mark-{h}.webp', quality=90, method=6)
    print('logo kit written to brand/')


if __name__ == '__main__':
    main()
