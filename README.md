# Dr Hemanth Chinthala — website

Single-page website for **Dr Hemanth Chinthala**, Consultant Medical Gastroenterologist, Hepatologist & Interventional Endoscopist at Medicover Hospital, Financial District, Hyderabad.

![Desktop hero](docs/screenshots/desktop-1-hero.jpg)

## Lighthouse (production build, local)

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 97 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Mobile: FCP 1.7 s · LCP 2.4 s · TBT 100 ms · CLS 0.

## Stack

- **Vite** (vanilla JS — no framework, so the page stays light)
- **GSAP 3 + ScrollTrigger** — the only animation library
- **Lenis** — smooth scrolling, driven by GSAP's ticker
- Self-hosted fonts: **Newsreader** (display serif, subset to the glyphs used — 73 KB for roman + italic), **Instrument Sans** (text), **IBM Plex Mono** (labels)

## Design

Editorial and clinical rather than "template medical": ink-navy on warm paper with a single sienna accent, a serif display face with optical sizing, monospaced figure captions and section marks (§ 01…), hairline rules instead of cards and shadows. Real photographs only — no stock images, no icon sets.

## Motion

| Section | Effect |
|---|---|
| Hero | Word-by-word masked headline reveal, clip-path photo wipe with scale settle, scroll parallax, subtle 3D tilt on the photo (mouse only) |
| Credentials | Count-up numbers |
| Practice | Statement words brighten as you scroll (scrubbed) |
| Areas of care | **Pinned horizontal scroll** on desktop (≥1024 px) with progress bar; cards lift into place via `containerAnimation`. Stacked list on mobile |
| Procedures | Index rows with hover fill and slide |
| Training | Photo wipe, timeline line that draws with scroll |
| Everywhere | Batched fade-up reveals, hide-on-scroll nav, animated FAQ, mobile booking dock |

`prefers-reduced-motion` turns off Lenis, pinning and all animations, and the page renders fully. If the script fails to load, a 2.5 s fallback in `<head>` shows all content.

## Booking

The appointment form doesn't store anything. It builds a WhatsApp message to the Medicover appointments desk (`+91 70754 93806`) with name, mobile, visit type, preferred date and concern. Phone CTAs dial `040 6833 4455`.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs dist/
npm run preview   # serve the production build
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Files

```
index.html            all content and structured data (schema.org Physician)
src/main.js           GSAP / ScrollTrigger / Lenis and interactions
src/styles.css        design tokens, layout, responsive rules
public/img/           optimised images (AVIF/WebP, 1x/2x) and og.jpg share card
public/fonts/         subset Newsreader variable fonts
source-images/        original photos from the Medicover profile
docs/screenshots/     previews
```

## Before going live

- Content comes from the doctor's [Medicover profile](https://www.medicoverhospitals.in/doctors/dr-hemanth-chinthala). Have Dr Chinthala review it, especially the plain-English procedure descriptions and the "Your first visit" steps.
- Once the domain is known, add `<link rel="canonical">` and change `og:image` to an absolute URL in `index.html`.
- The photos come from the Medicover profile. Confirm you have permission to use them, or swap in a professional shoot. The hero is designed for a 4:5 portrait.
- If you change the copy, re-run the font subset step so any new characters are included, or point the `@font-face` rules back at the full `@fontsource-variable/newsreader` files.
