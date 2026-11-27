# Playbook: a doctor's website, logo and SEO, start to finish

This is how the Dr Hemanth Chinthala site was built, written so the same result can be repeated for another doctor in another specialty. Use this repository (`VenkatSai09/dr-hemanth-chinthala`) as the working template: copy its structure and code, and replace the content, images and specialty-specific sections.

Live example: https://venkatsai09.github.io/dr-hemanth-chinthala/

---

## 1. Collect before you start

Ask for all of this in one message. Missing facts are the main cause of rework.

**The doctor**
- Full name, as it should appear (for example "Dr Firstname Lastname").
- Specialty and exact job title, for example "Consultant Cardiologist and Electrophysiologist".
- Qualifications with institutions (MBBS, MD, DM, fellowships, exams).
- Training and career timeline, with cities (used for the training map).
- Awards, grants, research interests, publications.
- Languages he or she consults in.
- Medical council registration number (required on prescriptions in India).
- A caption or brand line, if they have one (here: "The Gut Doctor").

**Practice**
- Hospital or clinic name, full address, consulting days and hours.
- Appointment phone number, WhatsApp number (can be the same), hospital emergency number.
- Consultation fee, insurance notes.
- Link to their hospital profile page, if any.
- Patient rating and review count, if public.

**Images**
- Real photos of the doctor: a professional studio headshot is best. Never generate or edit the doctor's face.
- A logo, if they have one. If not, see section 7.

**Accounts**
- A GitHub repository created by the user (the session cannot create one), with push access.
- Later: the domain, Google Business Profile, Google Search Console.

---

## 2. Stack and setup

- **Vite** (vanilla JS, multi-page), **GSAP + ScrollTrigger** for animation, **Lenis** for smooth scrolling. One animation library only.
- Fonts self-hosted: **Newsreader** (serif headings) and **Instrument Sans** (text). `scripts/subset-fonts.py` subsets Newsreader; rerun after copy changes.
- Colours as CSS tokens on `:root` in `src/styles.css`. Pick two or three brand colours per doctor; here: navy `#0f1d2b`, sienna `#9a4421`, cream `#f2eee6`.
- Deploy: `.github/workflows/pages.yml` builds on every push to `main` and publishes to the `gh-pages` branch (GitHub Pages). It sets `BASE_PATH` to `/<repo>/`.
- `vite.config.js` holds the base-path fix, the SEO build step (canonical, share image, FAQ data, sitemap, robots) and the home-page CSS inlining. Copy it as is.

---

## 3. Design rules (what keeps it from looking AI-made; skills in section 11)

Applied from the Hallmark, Impeccable, Humanizer and UI UX Pro Max skills:

- No eyebrow labels, section numbers, italic accent words in headings, tracked-out uppercase labels, middle-dot strings, decorative dots, or arrows glued to links.
- No em dashes in the copy. Plain, specific headings. Plain language a patient understands.
- No `transition: all`; never animate width or height.
- `overflow-x: clip` on html and body; grid tracks as `minmax(0, 1fr)`; test at 320, 360 and 375 px.
- Content is visible without JavaScript; motion states apply only under `.js:not(.no-motion)`, and `prefers-reduced-motion` shows everything still.
- The hero is calm: a real portrait in a plain frame. The doctor rejected floating 3D pills and ribbons around the photo as unprofessional; do not repeat that.

---

## 4. Page sections (home page)

In order. Sections marked **(specialty)** must be redesigned for the new field; the rest carry over with new text.

1. Header: logo mark, name, caption; links; phone; "Book a visit".
2. Hero: headline, one-line lede, book and call buttons, studio portrait.
3. Credentials strip with counters (years in practice, rating, reviews).
4. About.
5. **(specialty) Organ tour**: a realistic Gemini illustration of the relevant organ system; on scroll the view zooms to each structure with a short card (what it is, what he treats there, how it is examined). Here: the digestive system with a capsule camera following the tract. For cardiology, the heart and vessels; for orthopaedics, the skeleton and joints; for neurology, the brain and spine; and so on.
6. Conditions treated (cards; sideways scrolling on desktop).
7. **(specialty) Disease-stage sections**: three matching Gemini images that blend as you scroll (here: healthy, fatty and cirrhotic liver; healthy, inflamed and healed colon lining). Choose one or two conditions central to the doctor's work.
8. Procedures, each with a small looping line-drawing animation (`src/glyphs.js`). **(specialty)**: redraw for the new procedures.
9. Training: photo, career timeline, and a dotted map with the route between training cities (`scripts/build-map.mjs`; change the cities and region).
10. Awards, research.
11. Warning signs ("when to see a ..."), with line icons; urgent ones pulse. **(specialty)**: new list and icons.
12. Your first visit: four steps with a progress line.
13. FAQ (becomes FAQ structured data automatically).
14. Booking: details, map that loads on tap, WhatsApp form (stores nothing; opens WhatsApp with the details filled in).
15. Footer with topic-page links; mobile booking dock; floating WhatsApp button.

---

## 5. Images with Gemini

The session cannot reach Gemini or the user's browser. The working method:

1. Write the Gemini prompt and give it to the user to paste into Gemini.
2. The user downloads the result and **attaches the file in a new message**. Images sent while the assistant is still working are visible but not saved as files; ask for a resend.
3. Process: cut the plain background out (distance-to-background keying with colour un-mixing), remove the Gemini star in the corner, crop with one shared box when images must line up, export WebP at two widths, lazy-load.
4. Caption generated images "Illustration made with Google Gemini. Simplified, not to scale."

Prompt pattern that worked (adapt the subject):

> Create a realistic, high-detail 3D medical illustration of [subject], front view, shown on its own with no body, skin or skeleton. [List the parts, in anatomical position.] Natural, healthy colours, glossy and lifelike but clean and not gory. Soft studio lighting from the upper left. Centred with generous empty space, nothing cropped. Plain solid off-white background, colour #F3EEE6, no gradient, floor or shadow. No text, labels, arrows or watermark. [Portrait 4:5 / Landscape 4:3].

For a stage series, make image 1, then in the **same Gemini chat**: "Same image, same angle, framing, lighting and background. Now show [the next stage]..." so the three line up exactly.

---

## 6. Animations that were kept

- Headline and every section heading rise word by word.
- Hero photo unveiled from the bottom, settling from a slight zoom.
- Organ tour: camera zoom per stop plus a travelling marker (capsule).
- Stage blends scrubbed by scroll, both directions.
- Procedure line drawings that loop only while visible.
- Training map route drawing leg by leg; counters counting up.
- Warning-sign icons drawing in; urgent ones pulsing.
- First-visit progress line with a dot.
Setup runs in idle time after the first paint, one task at a time, so mobile performance stays high.

---

## 7. Logo

What happened here, so it goes faster next time: several vector concepts were rejected; the doctor chose a Gemini-made logo and wanted it **used exactly as is**.

- Offer 4 to 6 concept directions first (initials monogram, an organ of the specialty, a symbol of care such as hands or a shield, a wordmark). Show them as one image sheet.
- If they bring a Gemini logo, do not redraw it. Use `scripts/brand/build_from_image.py`: it keeps the original untouched in `brand/source/`, removes only the background outside the mark (keeping any cream fill inside), removes the Gemini star, crops the mark, and makes enlargements, icons, favicon and a profile picture.
- `scripts/brand/build_docs.py` and `render.cjs` make the business card (3.5 x 2 in, 3 mm bleed), A4 letterhead with a registration-number line, brand guide and a sign mockup.
- Tell them the limits: an image logo suits light backgrounds; for large signboards a sign maker traces a vector copy.
- Check every exported PNG by looking at it. A renderer bug once produced blank PNGs that went unnoticed into two zips.

---

## 8. SEO

- Title and description per page; Physician structured data on the home page.
- The build adds an absolute canonical URL and share image (WhatsApp needs a full URL), FAQPage data from the page's FAQ, `sitemap.xml` and `robots.txt`.
- Topic pages: `scripts/build-pages.py` generates `conditions/*.html` and `procedures/*.html` (here eight), each with MedicalWebPage and breadcrumb data, FAQs, booking card and related links, linked from the home page. Rewrite the content for the new specialty; keep it conservative and have the doctor review it.
- Share card `public/img/og.jpg`: logo, portrait, headline.
- After the domain: submit the sitemap in Search Console; set up the Google Business Profile.

---

## 9. Quality bar and checks

- Mobile Lighthouse: performance 95 or more, accessibility, best practices and SEO 100. Run it three times; scores move by a point or two.
- Functional test (Playwright): no sideways scroll at 320/360/375 px, menu, every scroll animation completes, FAQ, form validation and WhatsApp link, map, reduced motion, every page loads with one h1 and a canonical link, and every image loads after scrolling.
- Look at screenshots on phone and desktop for every new section before deploying.

---

## 10. Domain day

In the repository Settings, Pages, add the custom domain; add `public/CNAME`; in the workflow set `BASE_PATH: /` and `SITE_URL: https://<domain>/`; at the registrar add GitHub's four A records and a `www` CNAME; turn on Enforce HTTPS; resubmit the sitemap.

---

## 11. Skills and tools used

### Claude skills (design, animation and writing)

None is a runtime dependency. Read each skill's `SKILL.md` before installing it. Where a skill's own scripts could not be run in the cloud session, its rules were applied by hand.

| Skill | Where to get it | How it was used here |
|---|---|---|
| **Impeccable** | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Main design review. Removed labels above headings, section numbers and big-number stat rows; removed buttons that chase the pointer and self-tilting cards; one main motion sequence instead of the same reveal everywhere; styled cursor, scrollbar, link underlines and numbers. Builds on Anthropic's frontend-design skill. |
| **Hallmark** | [nutlope/hallmark](https://github.com/nutlope/hallmark) | Anti-"AI look" rules: every colour from a token; sentence-case labels in the body font; no italic accent words, middle dots, link arrows or decorative dots; no animated height; `overflow-x: clip` and `minmax(0, 1fr)`; hero fits a 1280 x 800 window. Its lint script was not run (blocked in the session); the rules were applied manually. |
| **Humanizer** | [blader/humanizer](https://github.com/blader/humanizer) | All copy: no em dashes, plain headings that say what the section holds, no slogans or staged contrasts, plain verbs. Use it on every page, including topic pages. |
| **UI UX Pro Max** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Medical-clinic guidance: add an insurance answer to the FAQ, keep healthcare pages calm rather than motion-heavy. |
| **awwwards-animations** | [devmartinese/awwwards-animations-skill](https://github.com/devmartinese/awwwards-animations-skill) | Checked as plain documentation; its techniques were used: word-by-word heading reveals, clip-path image reveals, scroll-scrubbed timelines, pinned sections, parallax, smooth scroll with Lenis. |
| **frontend-design** (Anthropic) | Install in Claude Code with `/plugin` (only the user can run it) | Not installed in the cloud session; Impeccable, which extends it, was applied instead. Install it if you are working locally. |
| gsap-framer-scroll-animation, web-design-guidelines, web-animation-design | As listed in the original request | Their site was blocked by the session's network. GSAP and ScrollTrigger were used directly following GSAP's own documentation. |

Also from the same reel, not needed for a website: REA, Ponytail, Diagram Design, Onyx, Last 30 Days, Scrapling.

### Claude Code skills and features used in the session

- **Chrome browser skill** (`anthropic-skills:chrome-browser`): tried, so Gemini could be driven in the user's logged-in Chrome. It does not work from a cloud session; it needs a session running on the user's own computer (Claude desktop app, local session). Hence the "user generates in Gemini, attaches the file" method.
- **Task list** to track the work, **Playwright** screenshots and tests, **GitHub CLI** for deploy status.

### Libraries and tools

| Tool | Used for |
|---|---|
| Vite 5 | Build, multi-page site, SEO build step |
| GSAP 3 + ScrollTrigger | All animation |
| Lenis | Smooth scrolling |
| Newsreader, Instrument Sans (Fontsource, Google Fonts) | Type |
| fontTools (Python) | Font subsetting (`scripts/subset-fonts.py`) |
| Pillow + NumPy (Python) | Image cut-outs, crops, WebP/AVIF exports, icons, share card |
| Playwright (Chromium) | Screenshots, PDFs (business card, letterhead, guide), PNG exports, functional tests |
| Lighthouse 12 | Performance, accessibility, SEO scores |
| d3-geo, topojson-client, world-atlas | The dotted training map (`scripts/build-map.mjs`) |
| Three.js | Offline 3D renders of capsules (`scripts/render-3d/`; the hero objects were later removed, the capsule camera is still used) |
| uharfbuzz | Turning text into outlines for the vector logo concepts (not used by the final image logo) |
| Google Gemini | All illustrations and the final logo, made by the user and attached |
| GitHub Pages + Actions | Hosting and automatic deploys |

---

## 12. Pricing guide (India, rough)

Website ₹60,000 to ₹1,50,000; logo and brand kit ₹15,000 to ₹35,000; SEO setup ₹10,000 to ₹25,000; ongoing local SEO ₹8,000 to ₹25,000 a month; domain about ₹1,000 a year. A package of about ₹90,000 to ₹1,10,000 plus monthly SEO worked as a suggestion here.
