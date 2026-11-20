"""Difference matting for the glass renders.

For each <name>.white.png / <name>.black.png pair, alpha = 1 - (white - black)
and colour = black / alpha. That recovers the glass's real transparency and its
highlights. Writes <name>.png next to the pair.

    python3 scripts/render-3d/matte.py <render-dir>
"""
import pathlib
import sys

import numpy as np
from PIL import Image

d = pathlib.Path(sys.argv[1])
for w in sorted(d.glob('*.white.png')):
    name = w.name[: -len('.white.png')]
    white = np.asarray(Image.open(w).convert('RGB'), dtype=np.float32) / 255
    black = np.asarray(Image.open(d / f'{name}.black.png').convert('RGB'), dtype=np.float32) / 255
    alpha = np.clip(1 - (white - black).mean(axis=2), 0, 1)
    color = np.where(alpha[..., None] > 1e-3, black / np.maximum(alpha[..., None], 1e-3), 0)
    rgba = np.dstack([np.clip(color, 0, 1), alpha])
    Image.fromarray((rgba * 255).round().astype(np.uint8), 'RGBA').save(d / f'{name}.png')
    print('matted', name)
