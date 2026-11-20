/*
 * Procedure animations: one small line drawing per procedure, showing what
 * the procedure actually does. Each is a looping GSAP timeline that plays only
 * while its row is on screen. They are decorative (aria-hidden): the row's
 * text carries the meaning.
 *
 * Drawing conventions (viewBox 0 0 160 100):
 *   tube organs = a wide ink stroke under a slightly narrower organ-coloured
 *   stroke, so the outline reads as a hollow tube; the scope is a thick ink
 *   line drawn along the lumen with a light at its tip.
 */
import { gsap } from 'gsap';

const $ = (s, c) => c.querySelector(s);
const $$ = (s, c) => [...c.querySelectorAll(s)];
const BASE = import.meta.env.BASE_URL;

const tube = (d, outer, inner, extra = '') =>
  `<path class="g-tube-o" stroke-width="${outer}" d="${d}" ${extra}/><path class="g-tube-i" stroke-width="${inner}" d="${d}"/>`;
const tip = `<g data-tip><circle class="g-glow" data-glow r="6"/><circle class="g-light" r="2.3"/></g>`;

/* Hide a stroke so it can be drawn in; returns its length. */
function prepDraw(path) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return len;
}

/* Move an element along a path; optionally turn it to face along the path. */
function follower(path, el, rotate = false) {
  const len = path.getTotalLength();
  return (p) => {
    const at = Math.max(0, Math.min(1, p)) * len;
    const pt = path.getPointAtLength(at);
    let t = `translate(${pt.x} ${pt.y})`;
    if (rotate) {
      const a = path.getPointAtLength(Math.max(0, at - 1.5));
      const b = path.getPointAtLength(Math.min(len, at + 1.5));
      t += ` rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI})`;
    }
    el.setAttribute('transform', t);
  };
}

/* A scope that is drawn along a path, with its light riding the tip. */
function scope(path, tipEl) {
  const len = prepDraw(path);
  const follow = follower(path, tipEl);
  const st = { p: 0 };
  const set = () => { path.style.strokeDashoffset = `${len * (1 - st.p)}`; follow(st.p); };
  set();
  return { st, set };
}

export const GLYPHS = {
  /* Upper GI endoscopy: down the oesophagus into the stomach, pictures taken. */
  'upper-gi': {
    svg: `${tube('M40 -2 L40 38 C40 54 54 60 72 58', 13, 10)}
      <path class="g-organ" d="M68 52 C84 38 126 38 138 60 C148 82 122 98 98 94 C82 91 72 82 68 70 Z"/>
      <path class="g-fold" d="M84 70 C96 78 116 78 130 66 M90 82 C104 88 120 86 132 78"/>
      <path class="g-scope" data-scope d="M40 -6 L40 38 C40 52 52 58 70 60 C90 62 110 62 120 72"/>
      ${tip}`,
    build(svg, tl) {
      const sc = scope($('[data-scope]', svg), $('[data-tip]', svg));
      const glow = $('[data-glow]', svg);
      tl.to(sc.st, { p: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: sc.set })
        .to(glow, { attr: { r: 13 }, opacity: 0.7, duration: 0.14, yoyo: true, repeat: 3 }, '+=0.15')
        .to(sc.st, { p: 0, duration: 1.1, ease: 'power2.inOut', onUpdate: sc.set }, '+=0.5');
    },
  },

  /* Colonoscopy: around the colon to the caecum; a polyp is found and removed. */
  colon: {
    svg: `${tube('M112 100 C112 90 120 86 124 80 L124 30 C124 20 118 16 108 16 L52 16 C42 16 36 20 36 30 L36 72 C36 80 40 84 46 84', 17, 13)}
      <path class="g-fold" d="M118 42 h12 M118 60 h12 M70 10 v12 M92 10 v12 M30 42 h12 M30 60 h12"/>
      <circle class="g-polyp" data-polyp cx="41" cy="51" r="3.2"/>
      <circle class="g-ring" data-ring cx="41" cy="51" r="3"/>
      <path class="g-scope" data-scope d="M112 104 C112 90 120 86 124 80 L124 30 C124 20 118 16 108 16 L52 16 C42 16 36 20 36 30 L36 72 C36 80 40 84 46 84"/>
      ${tip}`,
    build(svg, tl) {
      const sc = scope($('[data-scope]', svg), $('[data-tip]', svg));
      const polyp = $('[data-polyp]', svg);
      const ring = $('[data-ring]', svg);
      tl.set(polyp, { attr: { r: 3.2 }, opacity: 1 })
        .set(ring, { attr: { r: 3 }, opacity: 0 })
        .to(sc.st, { p: 0.82, duration: 2, ease: 'power1.inOut', onUpdate: sc.set })
        .to(ring, { attr: { r: 9 }, opacity: 0.9, duration: 0.35 }, '+=0.2')
        .to(polyp, { attr: { r: 0 }, duration: 0.35 }, '<')
        .to(ring, { opacity: 0, duration: 0.3 })
        .to(sc.st, { p: 1, duration: 0.5, ease: 'power1.out', onUpdate: sc.set })
        .to(sc.st, { p: 0, duration: 1.4, ease: 'power2.inOut', onUpdate: sc.set }, '+=0.4');
    },
  },

  /* Image-enhanced endoscopy: narrow-band light sweeps across and reveals a lesion. */
  iee: {
    svg: `<defs>
        <clipPath id="iee-view"><circle cx="80" cy="50" r="40"/></clipPath>
        <clipPath id="iee-band"><rect data-wipe x="39" y="8" width="0" height="84"/></clipPath>
      </defs>
      <g clip-path="url(#iee-view)">
        <rect class="g-mucosa" x="38" y="8" width="84" height="84"/>
        <path class="g-pits-faint" data-pits/>
        <g clip-path="url(#iee-band)">
          <rect class="g-nbi" x="38" y="8" width="84" height="84"/>
          <path class="g-pits" data-pits/>
          <path class="g-irregular" d="M84 54 q4 -4 7 0 q3 4 7 -1 M86 62 q3 3 6 -1 q4 -3 8 2 M90 70 q3 -3 6 0"/>
        </g>
      </g>
      <path class="g-lesion" data-lesion d="M80 52 C84 44 98 44 104 50 C110 57 106 70 98 74 C90 78 80 72 79 64 C78 59 78 56 80 52 Z"/>
      <circle class="g-view" cx="80" cy="50" r="40"/>`,
    build(svg, tl) {
      const pits = [];
      for (let y = 16; y <= 86; y += 8) {
        for (let x = 42 + ((y / 8) % 2) * 5; x <= 118; x += 10) {
          if (Math.hypot(x - 92, y - 60) > 13) pits.push(`M${x} ${y} q3 -3 6 0`);
        }
      }
      $$('[data-pits]', svg).forEach((p) => p.setAttribute('d', pits.join(' ')));
      const wipe = $('[data-wipe]', svg);
      const lesion = $('[data-lesion]', svg);
      const len = prepDraw(lesion);
      tl.set(wipe, { attr: { x: 39, width: 0 } })
        .set(lesion, { strokeDashoffset: len, opacity: 1 })
        .to(wipe, { attr: { width: 82 }, duration: 1.4, ease: 'power2.inOut' }, '+=0.5')
        .to(lesion, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.out' })
        .to(lesion, { opacity: 0.35, duration: 0.25, yoyo: true, repeat: 3 })
        .to(wipe, { attr: { x: 121, width: 0 }, duration: 1.1, ease: 'power2.inOut' }, '+=0.6')
        .to(lesion, { opacity: 0, duration: 0.4 }, '<');
    },
  },

  /* ERCP: scope in the duodenum, catheter into the bile duct, contrast fills the
     duct tree, and a stone is pushed out into the duodenum. */
  ercp: {
    svg: `<path class="g-organ g-organ--soft" d="M118 50 C100 52 70 56 42 62 C34 64 34 82 44 84 C72 82 100 76 122 66 Z"/>
      <path class="g-duct" d="M118 58 C98 64 72 66 46 72"/>
      ${tube('M122 6 C142 28 142 72 118 88 C102 98 78 96 66 86', 16, 12)}
      <path class="g-duct" data-duct d="M42 8 C60 22 84 32 102 44 L118 52"/>
      <path class="g-duct" d="M42 8 L28 4 M42 8 L34 18 M58 19 L50 30 M58 19 L64 8"/>
      <path class="g-contrast" data-contrast d="M118 52 L102 44 C84 32 60 22 42 8"/>
      <path class="g-contrast" data-contrast d="M42 8 L28 4 M42 8 L34 18"/>
      <path class="g-contrast" data-contrast d="M58 19 L50 30 M58 19 L64 8"/>
      <circle class="g-stone" data-stone r="3.8"/>
      <path class="g-scope" data-scope d="M164 0 C148 6 136 16 134 30 L132 48"/>
      <path class="g-cath" data-cath d="M132 48 C128 50 122 51 118 52 C110 47 104 44 96 40"/>
      ${tip}`,
    build(svg, tl) {
      const sc = scope($('[data-scope]', svg), $('[data-tip]', svg));
      const cath = $('[data-cath]', svg);
      const lc = prepDraw(cath);
      const contrast = $$('[data-contrast]', svg);
      const lens = contrast.map(prepDraw);
      const duct = $('[data-duct]', svg);
      const ld = duct.getTotalLength();
      const stone = $('[data-stone]', svg);
      const st = { s: 0.52 };
      const place = () => { const pt = duct.getPointAtLength(st.s * ld); stone.setAttribute('cx', pt.x); stone.setAttribute('cy', pt.y); };
      place();
      tl.set(st, { s: 0.52, onComplete: place })
        .set(stone, { opacity: 1 })
        .set(contrast, { opacity: 1, strokeDashoffset: (i) => lens[i] })
        .to(sc.st, { p: 1, duration: 1, ease: 'power2.out', onUpdate: sc.set })
        .to(cath, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' })
        .to(contrast, { strokeDashoffset: 0, duration: 1.1, stagger: 0.25, ease: 'power1.out' })
        .to(st, { s: 1, duration: 1, ease: 'power1.in', onUpdate: place }, '+=0.3')
        .to(stone, { attr: { cx: '+=5', cy: '+=9' }, opacity: 0, duration: 0.5 })
        .to(contrast, { opacity: 0, duration: 0.6 }, '+=0.6')
        .to(cath, { strokeDashoffset: lc, duration: 0.4 }, '<')
        .to(sc.st, { p: 0, duration: 0.8, ease: 'power2.in', onUpdate: sc.set });
    },
  },

  /* EUS: an ultrasound fan opens from the scope, waves pulse out, a pancreatic
     lesion shows up on the screen. */
  eus: {
    svg: `<defs><clipPath id="eus-clip"><path d="M92 22 L56 94 A80 80 0 0 0 128 94 Z"/></clipPath></defs>
      ${tube('M-4 22 C40 12 120 12 164 24', 16, 12)}
      <g data-fan clip-path="url(#eus-clip)">
        <path class="g-screen" d="M92 22 L56 94 A80 80 0 0 0 128 94 Z"/>
        <path class="g-us-organ" d="M46 64 C70 56 110 58 142 62 C148 72 140 82 128 82 C100 84 70 86 48 80 Z"/>
        <circle class="g-us-lesion" data-lesion cx="104" cy="72" r="6"/>
        <circle class="g-us-ring" data-lring cx="104" cy="72" r="7"/>
        <circle class="g-us-wave" data-wave cx="92" cy="22" r="4"/>
        <circle class="g-us-wave" data-wave cx="92" cy="22" r="4"/>
        <circle class="g-us-wave" data-wave cx="92" cy="22" r="4"/>
      </g>
      <path class="g-scope" d="M-6 21 C40 12 70 12 92 16"/>
      <circle class="g-light" cx="92" cy="17" r="2.3"/>`,
    build(svg, tl) {
      const fan = $('[data-fan]', svg);
      const waves = $$('[data-wave]', svg);
      const lesion = $('[data-lesion]', svg);
      const ring = $('[data-lring]', svg);
      gsap.set(fan, { scaleY: 0, transformOrigin: '50% 0%' });
      tl.set([lesion, ring], { opacity: 0 })
        .to(fan, { scaleY: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo(waves, { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 84 }, opacity: 0, duration: 1.5, ease: 'none', stagger: { each: 0.5, repeat: 2 } }, '<0.2')
        .to(lesion, { opacity: 1, duration: 0.5 }, 1.6)
        .fromTo(ring, { attr: { r: 7 }, opacity: 0.9 }, { attr: { r: 15 }, opacity: 0, duration: 0.8, repeat: 2 }, 1.8)
        .to(fan, { scaleY: 0, duration: 0.5, ease: 'power2.in' }, '>0.6');
    },
  },

  /* GI bleed: a vessel bleeds; a clip comes down, closes on it, the bleeding stops. */
  bleed: {
    svg: `<path class="g-organ" d="M-4 70 C30 64 50 76 80 70 S130 64 164 70 L164 104 L-4 104 Z"/>
      <path class="g-fold" d="M10 84 C40 80 60 90 90 84 S140 80 156 86"/>
      <path class="g-vessel" d="M72 71 C74 62 86 62 88 71"/>
      <g data-drops>${Array.from({ length: 6 }, () => '<circle class="g-drop" cx="80" cy="64" r="1.8"/>').join('')}</g>
      <g data-clip>
        <path class="g-jaw" data-jaw-l d="M80 30 L68 54"/>
        <path class="g-jaw" data-jaw-r d="M80 30 L92 54"/>
        <rect class="g-clip-body" x="76" y="24" width="8" height="8" rx="1.5"/>
      </g>
      <path class="g-scope" data-scope d="M80 -6 L80 24"/>`,
    build(svg, tl) {
      const drops = $$('.g-drop', svg);
      const clip = $('[data-clip]', svg);
      const scopeEl = $('[data-scope]', svg);
      const jl = $('[data-jaw-l]', svg);
      const jr = $('[data-jaw-r]', svg);
      gsap.set([jl, jr], { svgOrigin: '80 30' });
      const dx = [-12, -6, -1, 4, 9, 13];
      const dy = [16, 24, 30, 26, 20, 14];
      tl.set([clip, scopeEl], { y: -44 })
        .set([jl, jr], { rotation: 0, opacity: 1 })
        .set(clip, { opacity: 1 })
        .fromTo(drops, { x: 0, y: 0, opacity: 1 }, { x: (i) => dx[i], y: (i) => -dy[i], opacity: 0, duration: 0.8, ease: 'power2.out', stagger: { each: 0.13, repeat: 2 } }, 0)
        .to([clip, scopeEl], { y: 10, duration: 1, ease: 'power2.out' }, 0.8)
        .to(jl, { rotation: -26, duration: 0.25, ease: 'power2.in' }, '>')
        .to(jr, { rotation: 26, duration: 0.25, ease: 'power2.in' }, '<')
        .to(scopeEl, { y: -50, duration: 0.7, ease: 'power2.in' }, '+=0.3')
        .to(clip, { opacity: 0, duration: 0.5 }, '+=1.2');
    },
  },

  /* Capsule endoscopy: the capsule camera travels the small bowel taking pictures. */
  capsule: {
    svg: `${tube('M-6 30 C30 30 40 14 60 14 C84 14 84 46 60 46 C40 46 40 80 64 80 C92 82 100 50 124 50 C144 50 150 72 166 72', 15, 11)}
      <path class="g-none" data-path d="M-6 30 C30 30 40 14 60 14 C84 14 84 46 60 46 C40 46 40 80 64 80 C92 82 100 50 124 50 C144 50 150 72 166 72"/>
      <g data-frames>${Array.from({ length: 5 }, () => '<rect class="g-frame" width="7" height="5.5" rx="1"/>').join('')}</g>
      <g data-cap>
        <circle class="g-glow" data-flash cx="10" cy="0" r="4"/>
        <image href="${BASE}img/3d/capsule-cam-side.webp" width="22" height="11.3" x="-11" y="-5.65"/>
      </g>`,
    build(svg, tl) {
      const path = $('[data-path]', svg);
      const cap = $('[data-cap]', svg);
      const flash = $('[data-flash]', svg);
      const frames = $$('.g-frame', svg);
      const len = path.getTotalLength();
      const follow = follower(path, cap, true);
      const st = { p: 0 };
      follow(0);
      gsap.set(frames, { opacity: 0 });
      tl.to(st, { p: 1, duration: 5.2, ease: 'none', onUpdate: () => follow(st.p) });
      for (let k = 0; k < 8; k++) {
        tl.call(() => {
          gsap.fromTo(flash, { attr: { r: 4 }, opacity: 0.95 }, { attr: { r: 11 }, opacity: 0, duration: 0.35 });
          const f = frames[k % frames.length];
          const pt = path.getPointAtLength(st.p * len);
          gsap.fromTo(f, { attr: { x: pt.x - 3.5, y: pt.y - 12 }, opacity: 1, y: 0 }, { y: -12, opacity: 0, duration: 0.9, ease: 'power1.out' });
        }, null, 0.35 + k * 0.6);
      }
    },
  },

  /* Balloon-assisted enteroscopy: balloons inflate in turn, the scope advances,
     the bowel pleats onto the overtube. */
  bae: {
    svg: `${tube('M-6 50 C30 40 50 60 80 50 S130 40 166 50', 42, 36)}
      <g data-pleats>${Array.from({ length: 14 }, (_, i) => `<path class="g-fold" d="M${8 + i * 11} 36 v28"/>`).join('')}</g>
      <line class="g-scope g-scope--wide" data-ot x1="-6" y1="50" x2="58" y2="50"/>
      <ellipse class="g-balloon" data-ob cx="54" cy="50" rx="7" ry="3"/>
      <line class="g-scope" data-sc x1="58" y1="50" x2="60" y2="50"/>
      <ellipse class="g-balloon" data-sb cx="60" cy="50" rx="5" ry="2.2"/>`,
    build(svg, tl) {
      const ob = $('[data-ob]', svg);
      const sb = $('[data-sb]', svg);
      const sc = $('[data-sc]', svg);
      const pleats = $('[data-pleats]', svg);
      gsap.set(pleats, { transformOrigin: '0% 50%' });
      tl.set(sc, { attr: { x2: 60 } })
        .set(sb, { attr: { cx: 60, ry: 2.2 } })
        .set(ob, { attr: { ry: 3 } })
        .set(pleats, { scaleX: 1 })
        .to(ob, { attr: { ry: 15 }, duration: 0.5, ease: 'power2.out' })
        .to(sc, { attr: { x2: 128 }, duration: 1.1, ease: 'power1.inOut' })
        .to(sb, { attr: { cx: 124 }, duration: 1.1, ease: 'power1.inOut' }, '<')
        .to(sb, { attr: { ry: 14 }, duration: 0.45, ease: 'power2.out' })
        .to(ob, { attr: { ry: 3 }, duration: 0.4 }, '+=0.1')
        .to(pleats, { scaleX: 0.72, duration: 0.9, ease: 'power2.inOut' }, '+=0.1')
        .to(sb, { attr: { ry: 2.2 }, duration: 0.4 }, '+=0.5')
        .to(sc, { attr: { x2: 60 }, duration: 0.8, ease: 'power2.in' })
        .to(sb, { attr: { cx: 60 }, duration: 0.8, ease: 'power2.in' }, '<')
        .to(pleats, { scaleX: 1, duration: 0.8 }, '<');
    },
  },

  /* Intestinal ultrasound: a probe glides over the abdomen; the bowel shows in
     cross-section as a target of layers, its wall thickened. */
  ius: {
    svg: `<defs><clipPath id="ius-clip"><path data-fanclip d="M-5 3 L-34 72 A72 72 0 0 0 34 72 L5 3 Z"/></clipPath></defs>
      <path class="g-skin" d="M-4 27 C40 20 120 20 164 27 L164 104 L-4 104 Z"/>
      <g data-fan><path class="g-screen" d="M-5 3 L-34 72 A72 72 0 0 0 34 72 L5 3 Z"/></g>
      <g clip-path="url(#ius-clip)">
        <g class="g-target"><circle cx="66" cy="66" r="12"/><circle class="g-wall" cx="66" cy="66" r="8"/><circle class="g-core" cx="66" cy="66" r="3"/></g>
        <g class="g-target"><circle cx="112" cy="72" r="11"/><circle class="g-wall g-wall--thick" data-thick cx="112" cy="72" r="7"/><circle class="g-core" cx="112" cy="72" r="2.5"/></g>
      </g>
      <g data-probe><path class="g-cable" d="M0 -12 C0 -22 10 -26 24 -30"/><rect class="g-probe" x="-9" y="-14" width="18" height="16" rx="4"/></g>`,
    build(svg, tl) {
      const probe = $('[data-probe]', svg);
      const fan = $('[data-fan]', svg);
      const clip = $('[data-fanclip]', svg);
      const thick = $('[data-thick]', svg);
      const st = { x: 50 };
      const set = () => {
        const t = `translate(${st.x} 24)`;
        probe.setAttribute('transform', t);
        fan.setAttribute('transform', t);
        clip.setAttribute('transform', t);
      };
      set();
      tl.to(st, { x: 116, duration: 2.6, ease: 'sine.inOut', onUpdate: set })
        .fromTo(thick, { strokeWidth: 3 }, { strokeWidth: 5, duration: 0.4, yoyo: true, repeat: 3 }, 1.8)
        .to(st, { x: 50, duration: 2.6, ease: 'sine.inOut', onUpdate: set }, '+=0.6');
    },
  },

  /* High-resolution manometry and pH: pressure traces fire one after another,
     the diagonal wave of a normal swallow. */
  mano: {
    svg: `${[0, 1, 2, 3, 4].map((i) => {
      const y = 16 + i * 17;
      const x = 34 + i * 23;
      return `<path class="g-base" d="M6 ${y} L154 ${y}"/><path class="g-trace" data-trace d="M6 ${y} L${x - 14} ${y} C${x - 8} ${y} ${x - 6} ${y - 12} ${x} ${y - 12} C${x + 6} ${y - 12} ${x + 8} ${y} ${x + 14} ${y} L154 ${y}"/>`;
    }).join('')}
      <circle class="g-dot" data-front r="3"/>`,
    build(svg, tl) {
      const traces = $$('[data-trace]', svg);
      const lens = traces.map(prepDraw);
      const front = $('[data-front]', svg);
      const peaks = [0, 1, 2, 3, 4].map((i) => ({ x: 34 + i * 23, y: 16 + i * 17 - 12 }));
      tl.set(traces, { opacity: 1, strokeDashoffset: (i) => lens[i] })
        .set(front, { attr: { cx: peaks[0].x, cy: peaks[0].y }, opacity: 0 })
        .to(traces, { strokeDashoffset: 0, duration: 1.1, stagger: 0.32, ease: 'power1.inOut' })
        .to(front, { opacity: 1, duration: 0.2 }, 0.4);
      peaks.slice(1).forEach((pk, i) => tl.to(front, { attr: { cx: pk.x, cy: pk.y }, duration: 0.32, ease: 'none' }, 0.4 + i * 0.32 + 0.2));
      tl.to(front, { opacity: 0, duration: 0.3 }, '>0.2')
        .to(traces, { opacity: 0, duration: 0.5 }, '+=0.8');
    },
  },
};

/* Build a glyph into its container and return its (paused) looping timeline. */
export function buildGlyph(el) {
  const def = GLYPHS[el.dataset.glyph];
  if (!def) return null;
  el.innerHTML = `<svg class="glyph" viewBox="0 0 160 100" focusable="false">${def.svg}</svg>`;
  const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.7 });
  def.build($('svg', el), tl);
  return tl;
}
