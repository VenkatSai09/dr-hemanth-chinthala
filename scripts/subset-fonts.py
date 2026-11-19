"""Re-create the subset Newsreader fonts in public/fonts after editing index.html.

    pip install fonttools brotli
    python3 scripts/subset-fonts.py
"""
import html
import pathlib
import re
import subprocess
import tempfile

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/newsreader/files"
OUT = ROOT / "public/fonts"

page = (ROOT / "index.html").read_text(encoding="utf-8")
roman = set(html.unescape(re.sub(r"<[^>]+>", " ", page)))
roman |= {chr(c) for c in range(0x20, 0x7F)} | set("–—‘’“”·×₹§•…é")
roman = {c for c in roman if ord(c) < 0x2200}
italic = set("".join(html.unescape(m) for m in re.findall(r"<em>(.*?)</em>", page)))
italic |= set("abcdefghijklmnopqrstuvwxyz ivx.,")

with tempfile.TemporaryDirectory() as tmp:
    for style, chars in (("normal", roman), ("italic", italic)):
        font = TTFont(SRC / f"newsreader-latin-opsz-{style}.woff2")
        font = instancer.instantiateVariableFont(font, {"wght": (300, 480), "opsz": (24, 72)})
        ttf = pathlib.Path(tmp) / f"{style}.ttf"
        txt = pathlib.Path(tmp) / f"{style}.txt"
        font.save(ttf)
        txt.write_text("".join(sorted(chars)), encoding="utf-8")
        subprocess.run(
            [
                "pyftsubset", str(ttf), f"--text-file={txt}",
                "--layout-features=kern,liga,lnum,tnum", "--flavor=woff2",
                "--no-hinting", "--desubroutinize",
                f"--output-file={OUT / f'newsreader-{style}.woff2'}",
            ],
            check=True,
        )
        print("wrote", OUT / f"newsreader-{style}.woff2")
