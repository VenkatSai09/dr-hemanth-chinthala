import '@fontsource-variable/instrument-sans/wght.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

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
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

root.classList.add('motion-ready');
if (reduceMotion) root.classList.add('no-motion');

/* ------------------------------------------------------------------ *
 * Smooth scroll (Lenis, driven by GSAP's ticker)
 * ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
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
  const stageReady = loadStageImages();
  if (reduceMotion) return;

  const words = $$('.w > span', title);
  const frame = $('.hero__frame');
  const img = $('img', frame);
  gsap.set(words, { yPercent: 105, y: 0 });

  gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.05 })
    .to(words, { yPercent: 0, duration: 1.1, stagger: 0.05 }, 0)
    .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', onComplete: () => gsap.set(frame, { clipPath: 'none' }) }, 0.05)
    .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8 }, 0.25)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.4);

  // The photograph drifts a little slower than the page as the hero leaves.
  gsap.to(img, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  stageReady.then(initStage);

  // A slight 3D tilt follows the pointer. The figure listens and stays still;
  // only the frame inside it moves, so the hover target never slides away.
  if (finePointer) {
    const fig = $('[data-hero-figure]');
    gsap.set(frame, { transformPerspective: 900 });
    const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
    });
    fig.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

/* The floating objects are decoration: they load only after the hero
   photograph, so they never compete with it for the first paint. */
function loadStageImages() {
  const photo = $('.hero__frame img');
  const imgs = $$('.fl__i[data-src]');
  const photoDone = photo.complete
    ? Promise.resolve()
    : new Promise((done) => {
        photo.addEventListener('load', done, { once: true });
        photo.addEventListener('error', done, { once: true });
      });
  return photoDone.then(() => {
    imgs.forEach((img) => { img.src = img.dataset.src; });
    return Promise.all(imgs.map((img) => img.decode().catch(() => {})));
  });
}

/* ------------------------------------------------------------------ *
 * Hero stage: rendered 3D objects (a capsule endoscope, capsules, a
 * tablet, glass) float around the photograph at different depths.
 * Each object has three nested layers so the motions never fight:
 *   .fl__i  fly-in, then a slow idle bob and turn
 *   .fl__s  scatter outward as the hero scrolls away
 *   .fl__p  pointer parallax, scaled by depth
 * ------------------------------------------------------------------ */
function initStage() {
  const stage = $('[data-stage]');
  if (!stage) return;
  const items = $$('.fl', stage);
  const ribbons = $$('[data-ribbon]', stage);
  const sr = stage.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height / 2;

  // Ribbons draw themselves in behind and in front of the photograph.
  gsap.to(ribbons, {
    strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.18, delay: 0.1,
    onComplete: () => gsap.set(ribbons, { strokeDasharray: 'none' }),
  });

  const idles = [];
  items.forEach((el, i) => {
    const depth = Number(el.dataset.depth) || 1;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const img = $('.fl__i', el);
    const spin = (i % 2 ? 1 : -1) * (25 + depth * 20);

    // Fly in from outside the stage, turning as it settles.
    gsap.fromTo(img,
      { x: ux * 180 * depth, y: uy * 180 * depth, rotation: spin, scale: 0.55, opacity: 0 },
      {
        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out', delay: 0.15 + i * 0.07,
        onComplete: () => {
          // Then float: a slow bob and turn, each object on its own rhythm.
          idles.push(gsap.to(img, {
            y: (i % 2 ? -1 : 1) * (6 + depth * 6),
            rotation: (i % 3 - 1) * (3 + depth * 3),
            duration: 2.6 + (i % 4) * 0.6,
            ease: 'sine.inOut', yoyo: true, repeat: -1,
          }));
        },
      });

    // Scatter outward and upward as the hero leaves; nearer objects move more.
    gsap.to($('.fl__s', el), {
      x: ux * 90 * depth, y: -140 * depth + uy * 40, rotation: spin * 0.6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  });

  // Pointer parallax: nearer objects follow the pointer further.
  if (finePointer) {
    const movers = items.map((el) => {
      const p = $('.fl__p', el);
      const d = Number(el.dataset.depth) || 1;
      return { d, x: gsap.quickTo(p, 'x', { duration: 1, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: 1, ease: 'power3.out' }) };
    });
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * 46 * m.d); m.y(ny * 34 * m.d); });
    });
    hero.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); }));
  }

  // Idle motion stops while the hero is off screen.
  ScrollTrigger.create({
    trigger: '.hero', start: 'top bottom', end: 'bottom top',
    onToggle: (s) => idles.forEach((t) => (s.isActive ? t.resume() : t.pause())),
  });
}

/* ------------------------------------------------------------------ *
 * The digestive system, organ by organ (the focal sequence)
 * The diagram draws itself, then an "endoscope light" travels the tract
 * from the oesophagus to the rectum, stopping at each organ as its text
 * scrolls into view. The active organ warms up and a peristaltic wave
 * runs through it; the rest of the anatomy recedes.
 * ------------------------------------------------------------------ */
function initGut() {
  const section = $('[data-gut]');
  if (!section) return;
  const svg = $('[data-gut-svg]', section);
  const journey = $('[data-journey]', svg);
  const trail = $('[data-trail]', svg);
  const scope = $('[data-scope]', svg);
  const label = $('[data-gut-label]', section);
  const counter = $('[data-gut-count]', section);
  const steps = $$('[data-step]', section);

  // One continuous lumen built from the organs' centre-lines.
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
    svg.classList.toggle('has-active', !!organ);
    $$('.organ', svg).forEach((g) => g.classList.toggle('is-active', g.dataset.organ === organ));
    $$('.tag', svg).forEach((t) => t.classList.toggle('is-active', t.dataset.tag === organ));
    label.textContent = step ? step.dataset.label : 'The digestive tract';
    counter.textContent = step ? `${i + 1} of ${steps.length}` : '';
    const target = step ? stopFor(step.dataset.stop) : 0;
    if (reduceMotion) { state.p = target; render(); return; }
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

  // Line-art draw-in the first time the diagram is seen.
  const lines = $$('.o-fill, .o-duct, .o-detail, .t-out, .t-haustra', svg);
  lines.forEach((el) => { const len = el.getTotalLength(); el.style.strokeDasharray = `${len}`; el.style.strokeDashoffset = `${len}`; });
  const fills = $$('.o-fill', svg);
  const inners = $$('.t-in', svg);
  gsap.set(fills, { fillOpacity: 0 });
  gsap.set(inners, { opacity: 0 });
  gsap.set(scope, { opacity: 0 });
  gsap.timeline({
    scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
    onComplete: () => lines.forEach((el) => { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; }),
  })
    .to(lines, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: 0.05 })
    .to(inners, { opacity: 1, duration: 0.5, stagger: 0.04 }, 0.8)
    .to(fills, { fillOpacity: 1, duration: 0.9, stagger: 0.07 }, 1.1)
    .to(scope, { opacity: 1, duration: 0.5 }, 1.5);

  // The light breathes while it waits; paused when the section is off screen.
  const breathe = gsap.to($('.gut__glow', scope), { scale: 1.35, opacity: 0.6, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%', paused: true });
  ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? breathe.play() : breathe.pause()) });
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
    window.open(`https://wa.me/917075493806?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  [form.name, form.phone].forEach((input) => input.addEventListener('input', () => input.removeAttribute('aria-invalid')));
}

/* ------------------------------------------------------------------ */
initHero();

// Below-the-fold setup runs in small tasks so the main thread never blocks
// long enough to delay a tap. The pinned section is created before the
// triggers that sit below it.
const queue = [
  initNav, initForm, initFaq,
  () => $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear())),
  initGut, initCare, initSectionOpen, initTraining,
];
const rest = async () => {
  for (const task of queue) {
    task();
    await new Promise((r) => setTimeout(r, 0));
  }
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
};
if ('requestIdleCallback' in window) requestIdleCallback(rest, { timeout: 700 });
else setTimeout(rest, 200);

document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
