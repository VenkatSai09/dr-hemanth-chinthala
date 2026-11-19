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
  // Keep the full sentence available to screen readers.
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  walk(el);
  $$('.' + wrapClass, el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
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

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.08 });
  tl.to(words, { yPercent: 0, duration: 1.25, stagger: 0.055 }, 0)
    .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
    .fromTo(img, { scale: 1.28 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.35)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.45)
    .from('.hero__figure figcaption', { opacity: 0, duration: 0.8 }, 1.2)
    .from('.ledger__cell', { opacity: 0, y: 20, duration: 1, stagger: 0.07 }, 0.75);

  // Gentle parallax as the hero leaves.
  gsap.to(img, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

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
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
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
  const rest = () => {
    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
    initCounters();
    initStatement();
    initReveals();
    initCare();
    initTraining();
    initNav();
    initFaq();
    initForm();
    ScrollTrigger.refresh();
  };
  if ('requestIdleCallback' in window) requestIdleCallback(rest, { timeout: 700 });
  else setTimeout(rest, 200);

  // Re-measure once web fonts and images settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

init();
