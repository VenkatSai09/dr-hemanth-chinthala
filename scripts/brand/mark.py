"""The logo mark: the Shield of Care.

The doctor's chosen design (a Gemini concept) redrawn as vector art: the organs
he treats (liver, stomach, small and large intestine) inside a gradient shield,
with dots for the gut's microbes, held by two hands. Drawn on a 100 x 100 grid.
"""
import re

NAVY, SIENNA, CREAM, SL = '#0f1d2b', '#9a4421', '#f2eee6', '#e08a5f'

SHIELD = ('M50 6.5 C56 10 64 13 73 14.5 C78 15.3 83 15.6 88 15.6 '
          'C88 30 88 41 86.5 51 C83.5 70 70 84 50 94.5 '
          'C30 84 16.5 70 13.5 51 C12 41 12 30 12 15.6 '
          'C17 15.6 22 15.3 27 14.5 C36 13 44 10 50 6.5 Z')
SHIELD_IN = ('M50 10.4 C56 13.6 63.6 16.3 72.4 17.7 C76.8 18.4 81.2 18.7 85 18.8 '
             'C85 31 85 41.4 83.6 50.6 C80.8 68.4 68.4 81.2 50 91 '
             'C31.6 81.2 19.2 68.4 16.4 50.6 C15 41.4 15 31 15 18.8 '
             'C18.8 18.7 23.2 18.4 27.6 17.7 C36.4 16.3 44 13.6 50 10.4 Z')

LIVER = ('M19.5 31 C19.2 25.6 24 22.6 30 23 C35.5 23.4 39.5 24.6 43.6 24.3 '
         'C47 24 49.8 25.4 48.8 27.6 C47.9 29.5 44.8 30.2 42.2 31.6 '
         'C39.2 33.3 36.6 36.6 33.6 40 C31 43 27.2 45.6 23.8 44.2 C20.4 42.8 19.7 36.6 19.5 31 Z')
LIVER_LOBE = 'M40.2 24.6 C38.6 26.6 37.6 28.6 37.2 31'   # the line between the two lobes
OESOPHAGUS = 'M50 9 C50.4 14.5 51.8 19.5 54.4 24.2'
STOMACH = ('M52.2 26.6 C53.2 22.6 58 21 63.4 21.6 C70.4 22.4 74.8 28.4 74.2 35.6 '
           'C73.6 44.4 66 51.2 56.4 52 C50.6 52.5 46.2 50.6 44.2 47.6 '
           'C43 45.7 44.2 43.6 46.2 44.3 C48.6 45.1 51.2 45.9 54.2 45.5 '
           'C59.2 44.9 62.6 41 62.6 36 C62.6 31.6 59.6 28.6 56 28.5 C54.2 28.4 52.8 28.3 52.2 26.6 Z')
PYLORUS = 'M45 46.2 C40.6 47.6 38.2 50.6 39.8 53.4 C41 55.2 43.4 55.4 46 55.4'
COLON = ('M46 55.4 L62 55.4 C66 55.4 68 57.6 68 61.4 L68 70 C68 74 66 76.2 62 76.2 L54.6 76.2 '
         'C52 76.2 50.8 77.6 50.8 80 L50.8 82.2 C50.8 84 49.4 84.8 47.6 84.4 '
         'M46 55.4 L39 55.4 C35 55.4 33 57.6 33 61.4 L33 70 C33 74 35 76.2 39 76.2 L47 76.2')
SMALL = 'M38.4 61.4 L61.6 61.4 C64 61.4 64 66.2 61.6 66.2 L39.4 66.2 C37 66.2 37 71 39.4 71 L58 71'
# Dots for the gut's microbes: x, y, radius, colour key.
DOTS = [(76.5, 24.5, 2.4, 'a'), (81.4, 28.6, 1.1, 'b'), (80.4, 36.6, 2.2, 'a'), (76.4, 42.6, 1.2, 'g'),
        (81.8, 44.2, 1, 'n'), (78, 50.2, 2.6, 'y'), (74.6, 56.4, 1.1, 'b'), (81.2, 56, 0.9, 'n'),
        (23.6, 47.2, 1, 'b'), (27.8, 51.2, 1.2, 'a'), (25.2, 57.2, 2.6, 'a'), (29.4, 63.4, 1.2, 'y')]

# Left hand: the thumb runs up the shield's left side; the fingers curl in front.
HAND_L = ('M5.2 52.2 C4.6 66 13.6 80 27.4 88.2 C35.6 93 42.6 96 48.6 98.6 '
          'L49.6 93.4 C42.4 88.6 34.4 82.6 28.6 75.6 C26.4 72.8 24.8 69.6 25.2 67.4 '
          'C25.6 65.6 23.8 65 22.6 66 C21.2 67.2 20.6 68.8 19.8 70.2 '
          'C16.2 66 12.8 60.2 10.8 54.6 C10 52.4 7.6 50.6 5.2 52.2 Z')


def _mirror(d):
    toks = re.findall(r'[A-Za-z]|-?\d*\.?\d+', d)
    out, n = [], 0
    for tk in toks:
        if tk.isalpha():
            out.append(tk); n = 0
        else:
            out.append(f'{100 - float(tk):g}' if n % 2 == 0 else tk); n += 1
    return ' '.join(out)


HAND_R = _mirror(HAND_L)
_uid = [0]

PALETTES = {
    'colour': dict(ring=('#cf7440', '#a0482a', '#4a2c34', '#1c2b3e'), organ=('#b0532c', '#8a391b'),
                   liver=('#a24826', '#7e3219'), dots=dict(a='#d99066', b='#b86a42', g='#7a6466', n='#3a3f4c', y='#c9a061'),
                   hand_l=('#c4652f', '#8a3a1c'), hand_r=('#2c3c54', '#0f1d2b'), gap=CREAM),
    'on-dark': dict(ring=('#f0a070', '#e08a5f', '#d9c2b0', '#f2eee6'), organ=('#f0a070', '#d97a4c'),
                    liver=('#e48a58', '#c4652f'), dots=dict(a='#f0a070', b='#e08a5f', g='#d9c2b0', n='#f2eee6', y='#e7c27a'),
                    hand_l=('#f0a070', '#d97a4c'), hand_r=('#f2eee6', '#d9d2c6'), gap=NAVY),
    'navy': dict(mono=NAVY),
    'white': dict(mono='#ffffff'),
    'line': dict(line=NAVY),
}


# The organs are drawn a little larger than their paths, about this centre.
ORGANS_T = 'translate(48 52) scale(1.07) translate(-48 -52)'
STOMACH_FOLD = 'M64.6 25.6 C71 28.6 72.4 37.6 68.4 44.4'   # dotted line in the line-art version
SPARKLE = 'M79 20.4 V25.2 M76.6 22.8 H81.4'


def mark(scheme='colour', hands=True):
    P = PALETTES[scheme]
    _uid[0] += 1
    u = f'sc{_uid[0]}'
    if P.get('line'):
        return _line_mark(P['line'], u, hands)
    mono = P.get('mono')
    defs = ''
    if mono:
        ring = organ = liver = hl = hr = mono
        dot_cols = dict(a=mono, b=mono, g=mono, n=mono, y=mono)
    else:
        r = P['ring']
        defs = (f'<linearGradient id="{u}ring" x1="10" y1="10" x2="90" y2="70" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{r[0]}"/><stop offset=".38" stop-color="{r[1]}"/>'
                f'<stop offset=".7" stop-color="{r[2]}"/><stop offset="1" stop-color="{r[3]}"/></linearGradient>'
                f'<linearGradient id="{u}org" x1="20" y1="20" x2="70" y2="85" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{P["organ"][0]}"/><stop offset="1" stop-color="{P["organ"][1]}"/></linearGradient>'
                f'<linearGradient id="{u}liv" x1="20" y1="22" x2="45" y2="45" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{P["liver"][0]}"/><stop offset="1" stop-color="{P["liver"][1]}"/></linearGradient>'
                f'<linearGradient id="{u}hl" x1="5" y1="52" x2="45" y2="98" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{P["hand_l"][0]}"/><stop offset="1" stop-color="{P["hand_l"][1]}"/></linearGradient>'
                f'<linearGradient id="{u}hr" x1="95" y1="52" x2="55" y2="98" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{P["hand_r"][0]}"/><stop offset="1" stop-color="{P["hand_r"][1]}"/></linearGradient>')
        ring, organ, liver, hl, hr = (f'url(#{u}ring)', f'url(#{u}org)', f'url(#{u}liv)', f'url(#{u}hl)', f'url(#{u}hr)')
        dot_cols = P['dots']
    gap = CREAM if scheme == 'colour' else (NAVY if scheme == 'on-dark' else None)
    s = [f'<defs>{defs}<mask id="{u}lobe" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">'
         f'<rect width="100" height="100" fill="#fff"/><path d="{LIVER_LOBE}" stroke="#000" stroke-width="1.1" fill="none" stroke-linecap="round"/></mask></defs>',
         f'<path d="{SHIELD} {SHIELD_IN}" fill-rule="evenodd" fill="{ring}"/>',
         f'<g transform="{ORGANS_T}">',
         f'<path d="{OESOPHAGUS}" fill="none" stroke="{organ}" stroke-width="2.8" stroke-linecap="round"/>',
         f'<path d="{LIVER}" fill="{liver}" mask="url(#{u}lobe)"/>',
         f'<path d="{STOMACH}" fill="{organ}"/>',
         f'<path d="{PYLORUS}" fill="none" stroke="{organ}" stroke-width="3.8" stroke-linecap="round"/>',
         f'<path d="{COLON}" fill="none" stroke="{organ}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>',
         f'<path d="{SMALL}" fill="none" stroke="{organ}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>',
         '</g>']
    for x, y, rr, key in DOTS:
        s.append(f'<circle cx="{x}" cy="{y}" r="{rr}" fill="{dot_cols[key]}" opacity="{0.85 if rr > 2 else 0.92}"/>')
    # Hands, each with a thin outline in the background colour so they sit in front of the shield.
    for d, fill in (((HAND_L, hl), (HAND_R, hr)) if hands else ()):
        if gap:
            s.append(f'<path d="{d}" fill="none" stroke="{gap}" stroke-width="2.4" stroke-linejoin="round"/>')
        s.append(f'<path d="{d}" fill="{fill}"/>')
    return ''.join(s)


def _line_mark(col, u, hands=True, w=1.3):
    """Line-art version: every shape as a fine outline, tubes as double lines.
    Masks make nearer shapes hide the lines behind them, like a drawing."""
    tubes = [(OESOPHAGUS, 3.4), (PYLORUS, 4.4), (COLON, 5), (SMALL, 4.4)]
    cut = ''.join(f'<path d="{d}" stroke="#000" stroke-width="{tw - 2 * w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' for d, tw in tubes)
    outer = ''.join(f'<path d="{d}" stroke="{col}" stroke-width="{tw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' for d, tw in tubes)
    big = '<rect x="-10" y="-10" width="120" height="120" fill="#fff"/>'
    mu = 'maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"'
    hand_cut = f'<path d="{HAND_L}" fill="#000" stroke="#000" stroke-width="{w}"/><path d="{HAND_R}" fill="#000" stroke="#000" stroke-width="{w}"/>' if hands else ''
    defs = (f'<defs><mask id="{u}t" {mu}>{big}{cut}<path d="{STOMACH}" fill="#000"/></mask>'
            f'<mask id="{u}h" {mu}>{big}{hand_cut}</mask>'
            f'<clipPath id="{u}c"><path d="{SHIELD_IN}"/></clipPath></defs>')
    s = [defs,
         f'<g mask="url(#{u}h)"><g fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">',
         f'<path d="{SHIELD}"/><path d="{SHIELD_IN}"/>',
         f'<g clip-path="url(#{u}c)"><g transform="{ORGANS_T}"><path d="{LIVER}"/><path d="{LIVER_LOBE}"/><path d="{STOMACH}"/>'
         f'<path d="{STOMACH_FOLD}" stroke-dasharray="0.1 2.2"/></g></g>',
         f'<path d="{SPARKLE}"/><circle cx="80.4" cy="36.6" r="1.4"/><circle cx="78" cy="50.2" r="2"/><circle cx="25.2" cy="57.2" r="1.4"/></g>',
         f'<g clip-path="url(#{u}c)"><g transform="{ORGANS_T}" mask="url(#{u}t)">{outer}</g></g></g>']
    if hands:
        s.append(f'<g fill="none" stroke="{col}" stroke-width="{w}" stroke-linejoin="round"><path d="{HAND_L}"/><path d="{HAND_R}"/></g>')
    return ''.join(s)


TIGHT = (4, 5.5, 92, 94)  # x, y, w, h of the mark's ink
TIGHT_NO_HANDS = (11, 5.5, 78, 90.5)
