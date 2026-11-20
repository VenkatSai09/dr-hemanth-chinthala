import '@fontsource-variable/instrument-sans/wght.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { buildGlyph } from './glyphs.js';


/*
 * Motion plan
 * - Focal sequence: the digestive-system tour (an endoscope light travelling
 *   the gut, organ by organ). Everything else stays quiet beside it.
 * - Hero: one short entrance for the headline and photograph.
 * - Continuity: the conditions track pins and scrolls sideways; the training
 *   line draws as you read down the career.
 * - Feedback: reading progress, nav state, form errors.
 * Content is visible by default; nothing else animates in.
 */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

root.classList.add('motion-ready');
if (reduceMotion) root.classList.add('no-motion');

/* ------------------------------------------------------------------ *
 * Smooth scroll (Lenis, driven by GSAP's ticker)
 * ------------------------------------------------------------------ */
let lenis = null;
function initSmoothScroll() {
  if (reduceMotion) return;
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const navHeight = () => $('[data-nav]').offsetHeight;
function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'top' ? 0 : -navHeight() - 8, duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* Wrap each word of a heading in a mask so it can rise into place. */
function splitWords(el) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/( +|\n+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const outer = document.createElement('span');
          outer.className = 'w';
          outer.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
}

/* ------------------------------------------------------------------ *
 * Hero: one entrance
 * ------------------------------------------------------------------ */
function initHero() {
  const title = $('[data-split]');
  splitWords(title);
  if (reduceMotion) return;

  const words = $$('.w > span', title);
  const frame = $('.hero__frame');
  const img = $('img', frame);
  gsap.set(words, { yPercent: 105, y: 0 });

  gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.05 })
    .to(words, { yPercent: 0, duration: 1.1, stagger: 0.04 }, 0)
    .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', onComplete: () => gsap.set(frame, { clipPath: 'none' }) }, 0.05)
    .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.8 }, 0.25)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.4);

  // The photograph drifts a little slower than the page as the hero leaves.
  gsap.to(img, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* Procedure animations: each is built the first time its row comes near the
   screen and plays only while the row is visible. With reduced motion, each
   shows one representative still frame instead. */
function initGlyphs() {
  $$('[data-glyph]').forEach((el) => {
    let tl = null;
    if (reduceMotion) {
      tl = buildGlyph(el);
      tl?.progress(0.45).pause();
      return;
    }
    ScrollTrigger.create({
      trigger: el.closest('.proc__row') || el,
      start: 'top bottom+=200',
      end: 'bottom top-=100',
      onToggle: (self) => {
        if (!tl) tl = buildGlyph(el);
        if (!tl) return;
        if (self.isActive) tl.play(); else tl.pause();
      },
    });
  });
}

/* Liver disease, stage by stage. The three Gemini illustrations share one
   frame; scrolling blends healthy -> fatty -> cirrhosis. The fatty liver
   swells a little and the cirrhotic liver shrinks, as they do in life. */
function initLiver() {
  const sec = $('[data-liver]');
  if (!sec) return;
  const imgs = $$('.liver__img', sec);
  const wrap = $('[data-liver-imgs]', sec);
  const fill = $('[data-liver-fill]', sec);
  const labels = $$('[data-llabel]', sec);
  const steps = $$('article[data-lstep]', sec);

  const setStage = (i) => {
    labels.forEach((l, k) => l.classList.toggle('is-active', k === i));
    steps.forEach((st, k) => st.classList.toggle('is-active', k === i));
  };
  setStage(0);
  steps.forEach((st, i) => ScrollTrigger.create({
    trigger: st, start: 'top 60%', end: 'bottom 60%',
    onToggle: (self) => { if (self.isActive) setStage(i); },
  }));

  // The morph follows the scroll position itself, so it runs both ways.
  // Each new stage fades in on top; the one beneath fades only at the end,
  // so the liver never looks see-through mid-blend.
  gsap.timeline({
    scrollTrigger: { trigger: steps[0], start: 'center 60%', endTrigger: steps[2], end: 'center 60%', scrub: reduceMotion ? true : 0.6 },
  })
    .to(imgs[1], { opacity: 1, duration: 1, ease: 'none' }, 0)
    .to(imgs[0], { opacity: 0, duration: 0.2, ease: 'none' }, 0.8)
    .to(wrap, { scale: 1.06, duration: 1, ease: 'none' }, 0)
    .to(fill, { scaleX: 0.5, duration: 1, ease: 'none' }, 0)
    .to(imgs[2], { opacity: 1, duration: 1, ease: 'none' }, 1)
    .to(imgs[1], { opacity: 0, duration: 0.2, ease: 'none' }, 1.8)
    .to(wrap, { scale: 0.86, rotation: -2, duration: 1, ease: 'none' }, 1)
    .to(fill, { scaleX: 1, duration: 1, ease: 'none' }, 1);

  if (reduceMotion) return;
  // A slow float, paused while the section is off screen.
  const float = gsap.to($('[data-liver-float]', sec), { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? float.play() : float.pause()) });
}

/* ------------------------------------------------------------------ *
 * The digestive system, organ by organ (the focal sequence)
 * The diagram draws itself, then an "endoscope light" travels the tract
 * from the oesophagus to the rectum, stopping at each organ as its text
 * scrolls into view. The active organ warms up and a peristaltic wave
 * runs through it; the rest of the anatomy recedes.
 * ------------------------------------------------------------------ */
/* Where the camera looks for each stop, in the illustration's own pixels
   (465 x 1015), and how far it zooms in relative to the whole tract. */
const GUT_W = 465;
const GUT_H = 1015;
const GUT_FOCUS = {
  overview: [232, 507, 1],
  oesophagus: [238, 160, 2.1],
  stomach: [312, 372, 2.2],
  liver: [150, 362, 1.5],
  gallbladder: [158, 412, 2.8],
  pancreas: [268, 468, 2.6],
  smallbowel: [236, 672, 1.7],
  colon: [240, 690, 1.12],
};

function initGut() {
  const section = $('[data-gut]');
  if (!section) return;
  const view = $('[data-gut-view]', section);
  const rig = $('[data-gut-rig]', section);
  const vignette = $('[data-gut-vignette]', section);
  const svg = $('[data-gut-svg]', section);
  const journey = $('[data-journey]', svg);
  const trail = $('[data-trail]', svg);
  const scope = $('[data-scope]', svg);
  const label = $('[data-gut-label]', section);
  const counter = $('[data-gut-count]', section);
  const steps = $$('[data-step]', section);

  // One continuous route through the tract, built from its segments.
  const order = ['oesophagus', 'stomach', 'duodenum', 'smallbowel', 'colon'];
  const segs = order.map((id) => $(`[data-seg="${id}"]`, svg));
  const d = segs.map((p, i) => (i ? p.getAttribute('d').trim().replace(/^M/, 'L') : p.getAttribute('d').trim())).join(' ');
  journey.setAttribute('d', d);
  trail.setAttribute('d', d);
  const total = journey.getTotalLength();
  const lens = segs.map((p) => p.getTotalLength());
  const sum = lens.reduce((a, b) => a + b, 0);
  const startOf = {};
  order.reduce((acc, id, i) => { startOf[id] = acc; return acc + lens[i]; }, 0);
  const stopFor = (spec) => {
    const [id, f] = spec.split(':');
    return Math.min(1, (startOf[id] + lens[order.indexOf(id)] * Number(f)) / sum);
  };

  // The camera: scale and move the illustration so the organ sits mid-frame.
  // Phones show a wide, short frame, so they zoom in further.
  const frameFor = (key) => {
    const [fx, fy, z] = GUT_FOCUS[key] || GUT_FOCUS.overview;
    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const fit = Math.min(vw / GUT_W, vh / GUT_H) * 0.96;
    const wide = z > 1 ? (vw / vh > 0.8 ? 1.45 : 0.9) : 1;
    const s = Math.min(fit * z * wide, 2.2);
    const sw = GUT_W * s;
    const sh = GUT_H * s;
    const x = sw <= vw ? (vw - sw) / 2 : gsap.utils.clamp(vw - sw, 0, vw / 2 - fx * s);
    const y = sh <= vh ? (vh - sh) / 2 : gsap.utils.clamp(vh - sh, 0, vh / 2 - fy * s);
    return { x, y, scale: s };
  };
  let focus = 'overview';
  gsap.set(rig, frameFor(focus));
  new ResizeObserver(() => gsap.set(rig, frameFor(focus))).observe(view);

  trail.style.strokeDasharray = `${total}`;
  const state = { p: 0 };
  // The capsule camera points along the gut as it travels.
  const cam = $('[data-scope-cam]', svg);
  const render = () => {
    const at = state.p * total;
    const pt = journey.getPointAtLength(at);
    const a = journey.getPointAtLength(Math.max(0, at - 3));
    const b = journey.getPointAtLength(Math.min(total, at + 3));
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    scope.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    cam.setAttribute('transform', `rotate(${angle})`);
    trail.style.strokeDashoffset = String(total * (1 - state.p));
  };
  render();

  const setActive = (i) => {
    const step = steps[i];
    const organ = step ? step.dataset.step : null;
    focus = organ || 'overview';
    label.textContent = step ? step.dataset.label : 'The digestive tract';
    counter.textContent = step ? `${i + 1} of ${steps.length}` : '';
    const target = step ? stopFor(step.dataset.stop) : 0;
    if (reduceMotion) {
      gsap.set(rig, frameFor(focus));
      gsap.set(vignette, { opacity: organ ? 1 : 0 });
      state.p = target; render();
      return;
    }
    gsap.to(rig, { ...frameFor(focus), duration: 1.4, ease: 'power3.inOut', overwrite: 'auto' });
    gsap.to(vignette, { opacity: organ ? 1 : 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(state, { p: target, duration: 1.5, ease: 'power2.inOut', overwrite: true, onUpdate: render });
  };

  let current = -1;
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 62%', end: 'bottom 62%',
      onToggle: (self) => { if (self.isActive && current !== i) { current = i; setActive(i); } },
    });
  });
  ScrollTrigger.create({ trigger: steps[0], start: 'top 62%', onLeaveBack: () => { current = -1; setActive(-1); } });

  if (reduceMotion) return;

  steps.forEach((step) => {
    gsap.to(step.children, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: step, start: 'top 80%', once: true } });
  });

  // The illustration rises into place the first time it is seen.
  const img = $('.gut__img', rig);
  gsap.set(img, { opacity: 0, y: 40 });
  gsap.set(scope, { opacity: 0 });
  gsap.timeline({ scrollTrigger: { trigger: view, start: 'top 85%', once: true } })
    .to(img, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out' })
    .to(scope, { opacity: 1, duration: 0.5 }, 0.7);

  // The light breathes while it waits; paused when the section is off screen.
  const breathe = gsap.to($('.gut__glow', scope), { scale: 1.35, opacity: 0.6, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%', paused: true });
  ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? breathe.play() : breathe.pause()) });
}

/* ------------------------------------------------------------------ *
 * Conditions: pinned sideways track on large screens
 * ------------------------------------------------------------------ */
function initCare() {
  const section = $('[data-care]');
  const pin = $('[data-care-pin]');
  const track = $('[data-care-track]');
  const bar = $('[data-care-progress]');
  const cards = $$('.card', track);

  gsap.matchMedia().add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('has-hscroll');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: pin, pin: true, scrub: 0.8, start: 'top top', end: () => '+=' + distance(), invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + distance(), scrub: true, invalidateOnRefresh: true } });
    // Cards settle into line as they arrive from the right.
    cards.forEach((card) => {
      gsap.fromTo(card, { y: 70, rotation: 2.5 }, { y: 0, rotation: 0, ease: 'power2.out', scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 100%', end: 'left 62%', scrub: true } });
    });
    return () => section.classList.remove('has-hscroll');
  });
}

/* ------------------------------------------------------------------ *
 * Navy sections open from an inset rounded panel into full width
 * ------------------------------------------------------------------ */
function initSectionOpen() {
  if (reduceMotion) return;
  ['.care', '.book'].forEach((sel) => {
    gsap.fromTo(sel,
      { clipPath: 'inset(6% 4% 0% 4% round 24px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sel, start: 'top 95%', end: 'top 25%', scrub: true } });
  });
}

/* ------------------------------------------------------------------ *
 * Training: photo wipe and a career line that draws as you read
 * ------------------------------------------------------------------ */
function initTraining() {
  if (reduceMotion) return;
  const fig = $('.training__figure');
  gsap.fromTo(fig, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
  gsap.fromTo($('img', fig), { scale: 1.15 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
  gsap.fromTo('[data-timeline-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-timeline]', start: 'top 70%', end: 'bottom 60%', scrub: true } });
}

/* The credentials count up once, the first time they are seen. */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    if (reduceMotion) return;
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const o = { v: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      onStart: () => gsap.set(el, { opacity: 1 }),
      onUpdate: () => { el.textContent = `${Math.round(o.v)}${suffix}`; },
    });
  });
}

/* The training map: the land appears, then his route is drawn leg by leg,
   from Hyderabad to Chandigarh, Vellore and Melbourne and home again. */
function initMap() {
  const svg = $('[data-tmap]');
  if (!svg || reduceMotion) return;
  const order = ['hyderabad', 'chandigarh', 'vellore', 'melbourne'];
  const place = (id) => $(`[data-place="${id}"]`, svg);
  const pop = (tl, id, at) => tl
    .to(place(id), { opacity: 1, duration: 0.35 }, at)
    .fromTo($('.tmap__dot', place(id)), { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '50% 50%' }, '<');

  const home = $('.tmap__ring', place('hyderabad'));
  const pulse = gsap.fromTo(home, { scale: 1, opacity: 0.6 }, { scale: 2.6, opacity: 0, duration: 1.8, ease: 'sine.out', repeat: -1, paused: true, transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ paused: true, onComplete: () => pulse.play() });
  tl.to($('.tmap__land', svg), { opacity: 1, duration: 0.9, ease: 'power1.out' });
  pop(tl, 'hyderabad', 0.4);
  $$('[data-leg]', svg).forEach((leg, i) => {
    tl.to(leg, { strokeDashoffset: 0, duration: i === 2 ? 1.3 : 0.9, ease: 'power2.inOut' }, i ? '>-0.05' : '>');
    if (i < 3) pop(tl, order[i + 1], '>-0.2');
  });

  ScrollTrigger.create({ trigger: svg, start: 'top 78%', once: true, onEnter: () => tl.play() });
  ScrollTrigger.create({
    trigger: svg, start: 'top bottom', end: 'bottom top',
    onToggle: (st) => { if (tl.progress() === 1) (st.isActive ? pulse.play() : pulse.pause()); },
  });
}

/* ------------------------------------------------------------------ *
 * Navigation: progress, hide on scroll down, active section, menu, dock
 * ------------------------------------------------------------------ */
function initNav() {
  const nav = $('[data-nav]');
  const dock = $('[data-dock]');
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');

  gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 24);
      const open = toggle.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-hidden', !open && self.direction === 1 && y > 420);
    },
  });

  let pastHero = false;
  let atBook = false;
  const syncDock = () => dock.classList.toggle('is-visible', pastHero && !atBook);
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', onEnter: () => { pastHero = true; syncDock(); }, onLeaveBack: () => { pastHero = false; syncDock(); } });
  ScrollTrigger.create({ trigger: '#book', start: 'top bottom', end: 'bottom top', onToggle: (s) => { atBook = s.isActive; syncDock(); } });

  $$('.nav__links a').forEach((link) => {
    const section = $(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({ trigger: section, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => link.classList.toggle('is-active', s.isActive) });
  });

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { nav.classList.remove('is-hidden'); lenis?.stop(); } else { lenis?.start(); }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    scrollToTarget(target);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

/* Opening an answer changes the page height; re-measure the triggers below it. */
function initFaq() {
  $$('.qa').forEach((d) => d.addEventListener('toggle', () => ScrollTrigger.refresh()));
}

/* ------------------------------------------------------------------ *
 * Appointment request -> WhatsApp (nothing stored on this site)
 * ------------------------------------------------------------------ */
function initForm() {
  const form = $('[data-form]');
  const error = $('[data-form-error]');
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.date.min = iso(new Date());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const digits = phone.replace(/\D/g, '');
    form.name.setAttribute('aria-invalid', String(!name));
    form.phone.setAttribute('aria-invalid', String(digits.length < 10));
    if (!name || digits.length < 10) {
      error.textContent = !name ? 'Please enter your name.' : 'Please enter a 10-digit mobile number.';
      (!name ? form.name : form.phone).focus();
      return;
    }
    error.textContent = '';
    const when = form.date.value
      ? new Date(form.date.value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Earliest available';
    const lines = [
      'Appointment request for Dr Hemanth Chinthala (Gastroenterology), Medicover Financial District',
      '',
      `Name: ${name}`,
      `Mobile: ${phone}`,
      `Visit: ${form.type.value}`,
      `Preferred date: ${when}`,
    ];
    if (form.message.value.trim()) lines.push(`Problem: ${form.message.value.trim()}`);
    window.open(`https://wa.me/917087222235?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  [form.name, form.phone].forEach((input) => input.addEventListener('input', () => input.removeAttribute('aria-invalid')));
}

/* ------------------------------------------------------------------ *
 * Start after the first frame has painted. ScrollTrigger and the hero
 * read layout as they start; doing that before the first paint forces the
 * browser to lay out the whole page inside this script, one long blocking
 * task on a slow phone. After the paint, layout is already done and cheap.
 * ------------------------------------------------------------------ */
function start() {
  gsap.registerPlugin(ScrollTrigger);
  initSmoothScroll();
  initHero();
  scheduleRest();
}

// Below-the-fold setup runs in small tasks so the main thread never blocks
// long enough to delay a tap. The pinned section is created before the
// triggers that sit below it.
const queue = [
  initNav, initForm, initFaq,
  () => $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear())),
  initGut, initCare, initSectionOpen, initTraining, initMap, initCounters, initGlyphs, initLiver,
];
const rest = async () => {
  for (const task of queue) {
    task();
    await new Promise((r) => setTimeout(r, 0));
  }
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  measured = document.fonts ? document.fonts.status !== 'loaded' : false;
};
function scheduleRest() {
  if ('requestIdleCallback' in window) requestIdleCallback(rest, { timeout: 700 });
  else setTimeout(rest, 200);
}

requestAnimationFrame(() => setTimeout(start, 0));

// ScrollTrigger already re-measures on window load. Fonts only need a second
// measurement if they finish after the setup above has measured once.
let measured = false;
document.fonts?.ready.then(() => { if (measured) ScrollTrigger.refresh(); });

