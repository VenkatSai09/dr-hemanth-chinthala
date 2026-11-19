import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

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
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.105, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const navHeight = () => $('[data-nav]').offsetHeight;

function scrollToTarget(target) {
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: target.id === 'top' ? 0 : -navHeight() - 8, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */
function splitWords(el, wrapClass) {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/( +|\n+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const outer = document.createElement('span');
          outer.className = wrapClass;
          if (wrapClass === 'w') {
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.appendChild(inner);
          } else {
            outer.textContent = part;
          }
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  // Headings keep their full text as one accessible name; other elements read their words as-is.
  const isHeading = /^H[1-6]$/.test(el.tagName);
  if (isHeading) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  walk(el);
  if (isHeading) $$('.' + wrapClass, el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */
function initHero() {
  const title = $('[data-split]');
  splitWords(title, 'w');
  if (reduceMotion) return;

  const words = $$('.w > span', title);
  const frame = $('.hero__frame');
  const img = $('.hero__frame img');

  gsap.set(words, { yPercent: 105, y: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true });
  tl.to(words, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0)
    .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.05)
    .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.3)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.45)
    .from('.hero__figure figcaption', { opacity: 0, y: 10, duration: 0.8 }, 1.1)
    .from('.ledger__cell', { opacity: 0, y: 30, duration: 1.1, stagger: 0.08 }, 0.7)
    .from('.nav__inner > *', { opacity: 0, y: -16, duration: 1, stagger: 0.08 }, 0.2);

  // Intro: name rises, counter runs to 100, then the curtain lifts into the hero.
  const loader = $('[data-loader]');
  if (loader && getComputedStyle(loader).display !== 'none') {
    try { sessionStorage.setItem('hc-intro', '1'); } catch (e) { /* private mode */ }
    lenis?.stop();
    const count = $('[data-loader-count]');
    const o = { v: 0 };
    gsap.timeline({ onComplete: () => { loader.remove(); lenis?.start(); } })
      .fromTo($$('.loader__name .w > span', loader), { yPercent: 105, y: 0 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0)
      .from('.loader__meta', { opacity: 0, duration: 0.5 }, 0.2)
      .to(o, { v: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.v)).padStart(3, '0')) }, 0)
      .to('[data-loader-bar]', { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0)
      .addLabel('out', 1.05)
      .to($$('.loader__inner', loader), { y: -80, opacity: 0, duration: 0.8, ease: 'expo.in' }, 'out')
      .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, 'out+=0.1')
      .add(() => tl.play(), 'out+=0.45');
  } else {
    loader?.remove();
    tl.delay(0.05).play();
  }

  // Depth as the hero leaves: photo, title and ledger move at different speeds.
  const leave = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(img, { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: leave });
  gsap.to(title, { y: -90, ease: 'none', scrollTrigger: leave });
  gsap.to('[data-hero-figure]', { y: -40, ease: 'none', scrollTrigger: leave });

  // 3D tilt on the portrait (fine pointers only).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    gsap.set(frame, { transformPerspective: 900 });
    const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const fig = $('[data-hero-figure]');
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 7);
      rx(-py * 7);
    });
    fig.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

/* ------------------------------------------------------------------ *
 * Count-up numbers in the credentials ledger
 * ------------------------------------------------------------------ */
function initCounters() {
  if (reduceMotion) return;
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'power3.out',
      delay: el.getBoundingClientRect().top < window.innerHeight ? 0.9 : 0,
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ *
 * Practice statement — words brighten as you read
 * ------------------------------------------------------------------ */
function initStatement() {
  const el = $('[data-scrub-words]');
  if (!el) return;
  splitWords(el, 'sw');
  el.removeAttribute('aria-label');
  $$('.sw', el).forEach((w) => w.removeAttribute('aria-hidden'));
  if (reduceMotion) return;
  gsap.fromTo(
    $$('.sw', el),
    // Dimmed words keep 3:1 contrast (large text), so the paragraph is always legible.
    { color: '#7f868d' },
    {
      color: '#0f1d2b',
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.6 },
    }
  );
}

/* ------------------------------------------------------------------ *
 * Generic reveals, batched for performance
 * ------------------------------------------------------------------ */
function initReveals() {
  if (reduceMotion) return;
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      const [show, skip] = splitByViewport(batch);
      gsap.set(skip, { opacity: 1, y: 0 });
      gsap.to(show, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true });
    },
  });
}

// After a long jump (menu link, refresh mid-page) many elements enter at once.
// Only animate the ones on screen; anything already scrolled past appears instantly,
// so the visible rows never queue behind dozens of off-screen ones.
function splitByViewport(els) {
  const show = [];
  const skip = [];
  els.forEach((el) => (el.getBoundingClientRect().bottom < 0 ? skip : show).push(el));
  return [show, skip];
}

/* ------------------------------------------------------------------ *
 * Section headings — each word rises out of a mask
 * ------------------------------------------------------------------ */
function initWords() {
  $$('[data-words]').forEach((el) => {
    splitWords(el, 'w');
    el.classList.add('is-split');
    if (reduceMotion) return;
    const words = $$('.w > span', el);
    gsap.set(words, { yPercent: 110, y: 0 });
    gsap.to(words, {
      yPercent: 0,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ *
 * Rows wipe in left-to-right; their contents follow
 * ------------------------------------------------------------------ */
function initWipes() {
  if (reduceMotion) return;
  ScrollTrigger.batch('[data-wipe]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      const [show, skip] = splitByViewport(batch);
      gsap.set(skip, { clipPath: 'none' });
      gsap.set(skip.map((b) => [...b.children]).flat(), { opacity: 1, y: 0 });
      if (!show.length) return;
      gsap.to(show, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: 0.09,
        // Drop the clip once open so hover fills and focus rings are never cut off.
        onComplete: () => gsap.set(show, { clipPath: 'none' }),
      });
      gsap.to(show.map((b) => [...b.children]).flat(), { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.25 });
    },
  });
}

/* ------------------------------------------------------------------ *
 * Specialty marquee — direction and speed follow the scroll
 * ------------------------------------------------------------------ */
function initMarquee() {
  const track = $('[data-marquee-track]');
  if (!track || reduceMotion) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  let dir = 1;
  ScrollTrigger.create({
    trigger: '[data-marquee]',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      if (self.direction !== dir) dir = self.direction;
      const boost = Math.min(Math.abs(self.getVelocity()) / 220, 7);
      gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.4, delay: 0.25, ease: 'power2.out' });
    },
  });
  // Pause when off-screen to save battery.
  ScrollTrigger.create({ trigger: '[data-marquee]', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.resume() : loop.pause()) });
}

/* ------------------------------------------------------------------ *
 * Reading progress bar in the nav
 * ------------------------------------------------------------------ */
function initProgress() {
  const bar = $('[data-progress]');
  if (!bar) return;
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

/* ------------------------------------------------------------------ *
 * Navy sections open from an inset rounded card into full bleed
 * ------------------------------------------------------------------ */
function initSectionOpen() {
  if (reduceMotion) return;
  ['.care', '.book'].forEach((sel) => {
    gsap.fromTo(
      sel,
      { clipPath: 'inset(7% 5% 0% 5% round 28px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sel, start: 'top 95%', end: 'top 20%', scrub: true } }
    );
  });
}

/* ------------------------------------------------------------------ *
 * Magnetic buttons (mouse only)
 * ------------------------------------------------------------------ */
function initMagnetic() {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-magnetic]').forEach((btn) => {
    const x = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.3);
      y((e.clientY - r.top - r.height / 2) * 0.4);
    });
    btn.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/* ------------------------------------------------------------------ *
 * Small set pieces: languages, memberships, card tilt, booking facts
 * ------------------------------------------------------------------ */
function initDetails() {
  if (reduceMotion) return;
  gsap.to('[data-langs] li', {
    opacity: 1, y: 0, yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '[data-langs]', start: 'top 88%', once: true },
  });
  gsap.from('.members__list li', {
    opacity: 0, y: 40, duration: 1.1, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.members__list', start: 'top 85%', once: true },
  });
  gsap.from('.doc-card img', {
    scale: 0, rotation: -40, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '.doc-card', start: 'top 90%', once: true },
  });
  gsap.from('.form', {
    y: 80, rotation: 1.5, opacity: 0, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '.form', start: 'top 92%', once: true },
  });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.card').forEach((card) => {
      gsap.set(card, { transformPerspective: 800 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
}

/* ------------------------------------------------------------------ *
 * Inside the digestive system
 * The diagram draws itself, then an "endoscope light" travels the tract
 * from the oesophagus to the rectum, stopping at each organ as its
 * story scrolls into view. The active organ warms up and a peristaltic
 * wave runs through it; the rest of the anatomy recedes.
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

  // Build one continuous lumen from the organ centre-lines.
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
    const i = order.indexOf(id);
    return Math.min(1, (startOf[id] + lens[i] * Number(f)) / sum);
  };

  // Flow dashes need a consistent rhythm regardless of path length.
  trail.style.strokeDasharray = `${total}`;
  const state = { p: 0 };
  const render = () => {
    const pt = journey.getPointAtLength(state.p * total);
    scope.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    trail.style.strokeDashoffset = String(total * (1 - state.p));
  };
  render();

  const setActive = (i) => {
    const step = steps[i];
    const organ = step ? step.dataset.step : null;
    svg.classList.toggle('has-active', !!organ);
    $$('.organ', svg).forEach((g) => g.classList.toggle('is-active', g.dataset.organ === organ));
    $$('.tag', svg).forEach((t) => t.classList.toggle('is-active', t.dataset.tag === organ));
    label.innerHTML = step ? step.dataset.label : 'The digestive tract';
    counter.textContent = `${String(step ? i + 1 : 0).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    const target = step ? stopFor(step.dataset.stop) : 0;
    if (reduceMotion) { state.p = target; render(); return; }
    gsap.to(state, { p: target, duration: 1.6, ease: 'power2.inOut', overwrite: true, onUpdate: render });
  };

  let current = -1;
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      end: 'bottom 62%',
      onToggle: (self) => {
        if (self.isActive && current !== i) { current = i; setActive(i); }
      },
    });
  });
  // Leaving the section upwards resets the tour.
  ScrollTrigger.create({
    trigger: steps[0], start: 'top 62%',
    onLeaveBack: () => { current = -1; setActive(-1); },
  });

  if (reduceMotion) return;

  // Steps fade up as they arrive.
  steps.forEach((step) => {
    gsap.to(step.children, {
      opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: step, start: 'top 78%', once: true },
    });
    gsap.from($$('.chips li', step), {
      scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.04,
      scrollTrigger: { trigger: $('.gstep__meta', step), start: 'top 85%', once: true },
    });
  });

  // Line-art draw-in the first time the diagram is seen.
  const lines = $$('.o-fill, .o-duct, .o-detail, .t-out, .t-haustra', svg);
  lines.forEach((el) => {
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
  });
  const fills = $$('.o-fill', svg);
  const inners = $$('.t-in', svg);
  gsap.set(fills, { fillOpacity: 0 });
  gsap.set(inners, { opacity: 0 });
  gsap.set(scope, { opacity: 0 });
  gsap.timeline({
    scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
    onComplete: () => lines.forEach((el) => { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; }),
  })
    .to(lines, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.06 })
    .to(inners, { opacity: 1, duration: 0.6, stagger: 0.05 }, 0.9)
    .to(fills, { fillOpacity: 1, duration: 1, stagger: 0.08 }, 1.2)
    .to(scope, { opacity: 1, duration: 0.6 }, 1.6);

  // The light breathes while it waits.
  gsap.to($('.gut__glow', scope), { scale: 1.35, opacity: 0.6, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' });
}

/* ------------------------------------------------------------------ *
 * Areas of care — pinned horizontal track on large screens
 * ------------------------------------------------------------------ */
function initCare() {
  const section = $('[data-care]');
  const pin = $('[data-care-pin]');
  const track = $('[data-care-track]');
  const bar = $('[data-care-progress]');
  const cards = $$('.card', track);
  const mm = gsap.matchMedia();

  mm.add(
    {
      wide: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      narrow: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { wide } = ctx.conditions;
      if (wide) {
        section.classList.add('has-hscroll');
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const move = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            pin: true,
            scrub: 0.8,
            start: 'top top',
            end: () => '+=' + distance(),
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        gsap.to(bar, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + distance(), scrub: true, invalidateOnRefresh: true },
        });

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 80, rotation: 3 },
            {
              y: 0,
              rotation: 0,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 100%', end: 'left 62%', scrub: true },
            }
          );
        });

        gsap.from('.care__intro > *', {
          opacity: 0,
          y: 30,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 70%', once: true },
        });

        return () => section.classList.remove('has-hscroll');
      }

      // Narrow screens: a simple staggered stack.
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }),
      });
      gsap.from('.care__intro > *', {
        opacity: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });
    }
  );
}

/* ------------------------------------------------------------------ *
 * Training — photo wipe and a timeline that draws as you scroll
 * ------------------------------------------------------------------ */
function initTraining() {
  const fill = $('[data-timeline-fill]');
  const fig = $('.training__figure');
  if (reduceMotion) return;

  gsap.fromTo(
    fig,
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 80%', once: true } }
  );
  gsap.fromTo($('img', fig), { scale: 1.2 }, { scale: 1, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-timeline]', start: 'top 70%', end: 'bottom 60%', scrub: true } }
  );
}

/* ------------------------------------------------------------------ *
 * Navigation: hide on scroll down, active section, mobile menu, dock
 * ------------------------------------------------------------------ */
function initNav() {
  const nav = $('[data-nav]');
  const dock = $('[data-dock]');
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 24);
      const menuOpen = toggle.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > 420);
    },
  });

  // Booking dock (mobile): visible after the hero, hidden over the booking section.
  let pastHero = false;
  let atBook = false;
  const syncDock = () => dock.classList.toggle('is-visible', pastHero && !atBook);
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', onEnter: () => { pastHero = true; syncDock(); }, onLeaveBack: () => { pastHero = false; syncDock(); } });
  ScrollTrigger.create({ trigger: '#book', start: 'top bottom', end: 'bottom top', onToggle: (s) => { atBook = s.isActive; syncDock(); } });

  // Active link state.
  const links = $$('.nav__links a');
  links.forEach((link) => {
    const section = $(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (s) => link.classList.toggle('is-active', s.isActive),
    });
  });

  // Mobile menu.
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      nav.classList.remove('is-hidden');
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      if (!reduceMotion) {
        gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out' });
        gsap.fromTo($$('.menu__inner > *', menu), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04, delay: 0.1 });
      }
    } else {
      menu.hidden = true;
      lenis?.start();
      document.body.style.overflow = '';
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });

  // In-page anchors via Lenis.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    scrollToTarget(target);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

/* ------------------------------------------------------------------ *
 * FAQ — animated <details>
 * ------------------------------------------------------------------ */
function initFaq() {
  $$('.qa').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.qa__a', d);
    summary.addEventListener('click', (e) => {
      if (reduceMotion) { requestAnimationFrame(() => ScrollTrigger.refresh()); return; }
      e.preventDefault();
      if (d.open) {
        gsap.to(body, {
          height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut',
          onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); },
        });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, {
          height: 'auto', opacity: 1, duration: 0.6, ease: 'expo.out',
          onComplete: () => { gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); },
        });
      }
    });
  });
}

/* ------------------------------------------------------------------ *
 * Appointment request -> WhatsApp (no data stored on this site)
 * ------------------------------------------------------------------ */
function initForm() {
  const form = $('[data-form]');
  const error = $('[data-form-error]');
  const date = $('#f-date');
  const today = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  date.min = iso(today);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const digits = phone.replace(/\D/g, '');
    form.name.setAttribute('aria-invalid', String(!name));
    form.phone.setAttribute('aria-invalid', String(digits.length < 10));
    if (!name || digits.length < 10) {
      error.textContent = !name ? 'Please enter your name.' : 'Please enter a valid 10-digit mobile number.';
      (!name ? form.name : form.phone).focus();
      return;
    }
    error.textContent = '';
    const when = form.date.value
      ? new Date(form.date.value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Earliest available';
    const lines = [
      'Appointment request — Dr Hemanth Chinthala (Gastroenterology), Medicover Financial District',
      '',
      `Name: ${name}`,
      `Mobile: ${phone}`,
      `Visit: ${form.type.value}`,
      `Preferred date: ${when}`,
    ];
    if (form.message.value.trim()) lines.push(`Concern: ${form.message.value.trim()}`);
    const url = `https://wa.me/917075493806?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });

  [form.name, form.phone].forEach((input) => input.addEventListener('input', () => input.removeAttribute('aria-invalid')));
}

/* ------------------------------------------------------------------ */
function init() {
  initHero();
  // Everything below the fold is set up once the browser is idle, keeping the first paint fast.
  // Below-the-fold setup runs in small tasks, yielding to the browser between
  // each, so the main thread never blocks long enough to delay a tap.
  // Order matters: the pinned section is created before the triggers below it.
  const queue = [
    initNav, initForm, initFaq,
    () => $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear())),
    initGut, initCare, initCounters, initMarquee, initStatement,
    initWords, initWipes, initReveals, initSectionOpen,
    initTraining, initDetails, initProgress, initMagnetic,
  ];
  const yieldToBrowser = () => new Promise((r) => setTimeout(r, 0));
  const rest = async () => {
    for (const task of queue) {
      task();
      await yieldToBrowser();
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  if ('requestIdleCallback' in window) requestIdleCallback(rest, { timeout: 700 });
  else setTimeout(rest, 200);

  // Re-measure once web fonts and images settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

init();
