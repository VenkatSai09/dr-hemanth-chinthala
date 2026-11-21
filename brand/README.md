# Logo and brand kit

The mark is the Shield of Care: the organs he treats (the liver and gallbladder, the stomach, and the small and large intestine) inside a sienna-to-navy shield, with dots for the gut's microbes, held by two hands. It is the doctor's chosen Gemini design, redrawn as vector art so it prints sharply at any size. The shape is defined once, in `scripts/brand/mark.py`. The name is set in Newsreader with the tagline *The Gut Doctor* in its italic. In every logo file the letters are already outlines, so the logo looks right without the fonts installed.

The full rules (colours, clear space, minimum sizes, what not to do) are in `print/brand-guide.pdf`.

## Which file to use

| Need | File |
| --- | --- |
| Website, documents, anything on a light background | `logo/logo-horizontal-colour.svg` (PNG: `png/logo-horizontal-colour-2400.png`) |
| On navy or a dark photo | `logo/logo-horizontal-on-dark.svg` |
| Square spaces: signage, posters, slides | `logo/logo-stacked-colour.svg` |
| One-colour print, stamps, forms | `logo/logo-horizontal-navy.svg` |
| White on a coloured background | `logo/logo-horizontal-white.svg` |
| The mark alone | `logo/mark-colour.svg` |
| WhatsApp, Instagram, Google Business profile picture | `social/profile-picture-1080.png` |
| App icon with rounded corners | `png/app-icon-1024.png` |
| Business card, ready to print (3.5 x 2 in, 3 mm bleed) | `print/business-card.pdf` |
| Letterhead and prescription pad (A4) | `print/letterhead.pdf` |
| Browser and phone home-screen icons | `icons/` (already used by the website) |

SVG files scale to any size without blurring; send those to printers and sign makers. PNG files have transparent backgrounds.

## Before printing

- Add his medical council registration number to the letterhead, which has a blank line for it.
- The business card and letterhead use +91 70872 22235 for appointments. Change it in `scripts/brand/build_docs.py` if the number changes.
- Ask the printer for a proof. The CMYK values in the guide are approximate.

## Editing

Everything is generated from `scripts/brand/`:

```bash
python3 scripts/brand/build_brand.py   # logo SVGs
python3 scripts/brand/build_docs.py    # business card, letterhead, guide
node scripts/brand/render.cjs          # PNGs and PDFs
```

