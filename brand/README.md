# Logo and brand kit

The logo is the doctor's chosen design, used exactly as it is: the organs he treats (the liver, the stomach and the intestines) inside a shield, held by two caring hands, with his name and *The Gut Doctor*. The original file is kept unchanged in `source/logo-original.png`.

The only processing: the plain cream background was made transparent (the inside of the shield keeps its cream), the small Gemini star in the corner was removed, and the shield was cropped out on its own for icons. The `@2x` and `@4x` files are smooth enlargements for print.

The full rules (colours, clear space, minimum sizes, what not to do) are in `print/brand-guide.pdf`.

## Which file to use

| Need | File |
| --- | --- |
| Documents, posters, anything on a light background | `logo/logo-transparent@4x.png` |
| Where a cream background is fine, or the background must not be transparent | `logo/logo-on-cream@4x.png` (also `.jpg`) |
| The shield alone | `logo/mark-transparent@4x.png` |
| WhatsApp, Instagram, Google Business profile picture | `social/profile-picture-1080.png` |
| Browser and phone home-screen icons | `icons/` (already used by the website) |
| Business card, ready to print (3.5 x 2 in, 3 mm bleed) | `print/business-card.pdf` |
| Letterhead and prescription pad (A4) | `print/letterhead.pdf` |
| How it looks as a clinic sign | `preview/sign-mockup.png` |

## Good to know

- **Light backgrounds only.** The name is navy, so on navy, black or a busy photo put the logo on a cream panel.
- **Size limits.** The logo is an image about 760 pixels wide. It prints sharply up to roughly 30 cm across (a card, letterhead, poster or standee). A large signboard needs a vector file made from it; any sign maker can trace one, and the design must stay exactly the same.
- **Before printing:** add his medical council registration number to the letterhead, which has a blank line for it, and confirm the appointment number (+91 90307 43962). The CMYK values in the guide are approximate, so ask the printer for a proof.

## Editing

Everything is generated from `scripts/brand/`:

```bash
python3 scripts/brand/build_from_image.py   # logo files, icons, profile picture
python3 scripts/brand/build_docs.py         # business card, letterhead, guide, sign mockup
node scripts/brand/render.cjs               # PDFs and previews
```
