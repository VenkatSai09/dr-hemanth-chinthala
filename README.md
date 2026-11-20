# Dr Hemanth Chinthala: website

A single-page website for Dr Hemanth Chinthala, consultant medical gastroenterologist, hepatologist and interventional endoscopist at Medicover Hospital, Financial District, Hyderabad.

![Desktop hero](docs/screenshots/desktop-1-hero.jpg)

Videos: [walkthrough, desktop](docs/video/walkthrough-desktop.mp4) · [walkthrough, mobile](docs/video/walkthrough-mobile.mp4) · [digestive system, desktop](docs/video/digestive-journey-desktop.mp4) · [digestive system, mobile](docs/video/digestive-journey-mobile.mp4)

## Lighthouse (production build, local)

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 97 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Mobile: FCP 1.8 s, LCP 2.4 s, TBT 0 ms, CLS 0.

## Stack

- Vite with plain JavaScript, no framework
- GSAP and ScrollTrigger, the only animation library
- Lenis for smooth scrolling, driven by GSAP's ticker
- Self-hosted fonts: Newsreader for headings (subset to the characters the site uses) and Instrument Sans for everything else

## Sections

1. Hero: headline, one sentence, booking and call actions, and the credentials in plain text
2. How he works
3. The digestive system, organ by organ: a line drawing of the gut that stays on screen while seven organs scroll past
4. Conditions he treats: eleven groups, pinned and scrolled sideways on desktop
5. Procedures he performs
6. Training and career
7. Awards and grants
8. Publications and memberships
9. When to see a gastroenterologist: nine warning signs, three marked "Same day"
10. Your first visit
11. Common questions, including health insurance
12. Book a consultation: address, hours, fee, phone and a WhatsApp request form

## Motion

The hero stage and the digestive-system tour carry the motion, and floating objects carry it lightly through the rest of the page.

- **The digestive system tour.** The drawing draws itself when it first appears. The capsule camera, rendered in 3D and turning to follow the bends, travels through the gut from the oesophagus to the rectum and stops at each organ as its text scrolls in. The current organ turns sienna and gets a label, the others fade back, and a wave runs through the tube-shaped organs the way the gut moves food along.
- **Hero stage.** The photograph sits in an arched frame with rendered 3D objects floating around it at different depths: a capsule endoscope (the camera pill used in capsule endoscopy), two-tone capsules, a tablet, a glass cube and iridescent glass bubbles. A sienna-to-gold ribbon swirls behind the arch, and a thin thread crosses in front. On load the ribbons draw in and the objects fly in from outside and settle. They then bob and turn slowly, each on its own rhythm. They follow the mouse (nearer objects move further) and scatter upwards as the hero scrolls away. The objects load only after the photograph, so the first paint is unaffected.
- **Headline.** It rises word by word, and on desktop the photo tilts slightly towards the pointer.
- **Procedure animations.** Each of the ten procedures has its own small line drawing that loops while its row is on screen (`src/glyphs.js`): the scope travelling into the stomach and taking pictures; colonoscopy finding and removing a polyp; narrow-band light revealing a lesion; ERCP contrast filling the bile ducts and a stone pushed out; the EUS fan finding a pancreatic lesion; a clip closing on a bleeding vessel; the capsule camera photographing the small bowel; balloon enteroscopy pleating the bowel; an intestinal-ultrasound probe showing a thickened bowel wall; and manometry traces forming a swallow's wave. With reduced motion each shows a still frame.
- **Rising bubbles.** Small glass bubbles drift up behind the photograph and fade, like steam.
- **Objects between sections.** Capsules, the capsule camera, a tablet and glass drift past in the margins of the About, Procedures, warning-signs and Booking sections. They move faster than the page and turn as they go, with shorter travel on phones so they stay clear of the text.
- **Conditions.** On desktop the section pins and the cards scroll sideways, settling into line as they arrive.
- **Training.** The photo is uncovered and the career line fills in as you read down it.
- **Navy sections** open out from a rounded panel to full width as they scroll in.
- **Feedback:** a reading-progress line in the nav, the active section in the nav, form errors.

The script starts after the first frame is painted, so the page lays out before any animation code runs, and setup below the fold runs in small idle-time tasks. All other content is visible without animation. With "reduce motion" switched on in the operating system, smooth scrolling, pinning and every animation are off and the page is fully readable. If the script fails to load, a fallback in `<head>` shows everything after 2.5 seconds.

## Design skills applied

The site was reviewed against four Claude skills: three for design and one for writing. None of them is a runtime dependency. Their rules were applied by hand, and their helper scripts were not run.

| Skill | Source | What it changed |
|---|---|---|
| Impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Removed the small labels above headings and the section numbers. Replaced the big-number stats row with plain facts. Removed buttons that move towards the pointer and cards that tilt themselves. Cut the motion down to one main sequence instead of the same reveal on every section. Styled the text cursor, scrollbar, link underlines and numbers. |
| Hallmark | [nutlope/hallmark](https://github.com/nutlope/hallmark) | Every colour now comes from a design token. Labels use the body font in sentence case, with no tracked capitals or monospace. Removed the italic accent words inside headings, the middle-dot strings, the arrows on links and the decorative status dots. The FAQ no longer animates its height. Added `overflow-x: clip`, `minmax(0, 1fr)` grid tracks and wrapping headings. The hero headline, sentence and buttons fit in a 1280 × 800 window. |
| Humanizer | [blader/humanizer](https://github.com/blader/humanizer) | Rewrote all the copy: no em dashes, headings that say what the section holds ("Procedures he performs", not "Ten procedures, explained in a sentence each"), no staged contrasts or slogans, plain verbs. |
| UI UX Pro Max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Its medical-clinic guidance called for an insurance answer (added to the FAQ) and warned against motion-heavy healthcare pages, which supported reducing the motion. |

To use these skills in your own Claude Code sessions, read each repository's `SKILL.md` first, then install with the command in its README.

## Booking

The appointment form stores nothing. It builds a WhatsApp message to the Medicover appointments desk (+91 70754 93806) with the patient's name, mobile number, visit type, preferred date and problem. The phone links dial 040 6833 4455.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs dist/
npm run preview   # serves the production build
```

## Deploy

**GitHub Pages:** `.github/workflows/pages.yml` builds the site on every push to `main` and publishes it to the `gh-pages` branch, which Pages serves at https://venkatsai09.github.io/dr-hemanth-chinthala/. The workflow sets the base path to the repository name.

**Any static host** (Netlify, Vercel, Cloudflare Pages): upload `dist/`. For Netlify Drop, drag the folder onto https://app.netlify.com/drop.

**Opening a file directly:** double-clicking `dist/index.html` will not run the scripts, because browsers block module scripts and fonts on `file://`. Build the offline copy instead:

```bash
npm run build:offline   # writes offline/; double-click offline/index.html
```

## Files

```
index.html            all content and structured data (schema.org Physician)
src/main.js           motion and interactions
src/styles.css        design tokens, layout, responsive rules
vite.config.js        base path for GitHub Pages
public/img/           optimised images (AVIF/WebP, 1x and 2x) and the og.jpg share card
public/fonts/         subset Newsreader variable fonts
public/img/3d/        rendered 3D objects (transparent WebP)
scripts/              font subsetting, the offline build, and render-3d/ (Three.js scene that renders the 3D objects)
source-images/        original photos from the Medicover profile
docs/                 screenshots and videos
```

## Before going live

- Ask Dr Chinthala to review the copy I wrote: the organ facts, the warning signs, the procedure descriptions, the first-visit steps and the insurance answer. The rest comes from his [Medicover profile](https://www.medicoverhospitals.in/doctors/dr-hemanth-chinthala).
- Confirm you have permission to use the two photos from the Medicover profile, or replace them with a professional shoot. The hero is designed for a 4:5 portrait.
- Once the domain is known, add `<link rel="canonical">` and make the `og:image` URL absolute in `index.html`.
- After changing the copy, run `python3 scripts/subset-fonts.py` so any new characters are included in the heading font.
- To change the 3D objects, edit `scripts/render-3d/scene.html`, then run `node scripts/render-3d/render.mjs <dir>` and `python3 scripts/render-3d/matte.py <dir>`, and export the PNGs to `public/img/3d/` as WebP.
