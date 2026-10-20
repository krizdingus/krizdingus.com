"""Sets text as SVG path data from the site's own woff2 files (fontTools).

Reads a JSON list of requests on stdin and writes a JSON list of results on
stdout. Each request:
  {"font": "saira", "axes": {"wght": 650, "wdth": 108}, "text": "...",
   "size": 92, "min_size": 56, "max_width": 900, "max_lines": 3,
   "tracking": 0}
The largest size (stepping down by 2 px) whose greedy word wrap fits
max_lines lines of max_width px wins. Each result:
  {"size": 88, "lines": [{"d": "M..", "width": 812.4}], "cap": 61.6,
   "asc": 80.1, "desc": 22.3}
Paths are in px with the baseline at y = 0, ready for a translate().
Kerning comes from the font's GPOS 'kern' pairs. No system fonts are used.

Used by scripts/og-cards.mjs. Needs Python 3 with fontTools and brotli
(pip install fonttools brotli).
"""
import functools
import json
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'fonts')
FILES = {
    'saira': 'Saira-VariableFont_wdth-wght-latin.woff2',
    'figtree': 'Figtree-VariableFont_wght-latin.woff2',
    'mono': 'JetBrainsMono-wght400-700-latin.woff2',
}


@functools.lru_cache(None)
def load(name, axes):
    f = TTFont(os.path.join(FONTS, FILES[name]))
    if axes and 'fvar' in f:
        f = instancer.instantiateVariableFont(f, dict(axes))
    return f


@functools.lru_cache(None)
def kerning(name, axes):
    f = load(name, axes)
    pairs, classes = {}, []
    if 'GPOS' not in f:
        return pairs, classes
    gpos = f['GPOS'].table
    for rec in gpos.FeatureList.FeatureRecord:
        if rec.FeatureTag != 'kern':
            continue
        for idx in rec.Feature.LookupListIndex:
            lookup = gpos.LookupList.Lookup[idx]
            for st in lookup.SubTable:
                if lookup.LookupType == 9:
                    st = st.ExtSubTable
                if getattr(st, 'LookupType', 2) != 2 or not hasattr(st, 'Coverage'):
                    continue
                cov = st.Coverage.glyphs
                if st.Format == 1:
                    for g1, ps in zip(cov, st.PairSet):
                        for pv in ps.PairValueRecord:
                            v = getattr(pv.Value1, 'XAdvance', 0) if pv.Value1 else 0
                            pairs.setdefault((g1, pv.SecondGlyph), v or 0)
                elif st.Format == 2:
                    classes.append((set(cov), st.ClassDef1.classDefs, st.ClassDef2.classDefs, st.Class1Record))
    return pairs, classes


def kern(name, axes, a, b):
    pairs, classes = kerning(name, axes)
    if (a, b) in pairs:
        return pairs[(a, b)]
    for cov, c1, c2, recs in classes:
        if a not in cov:
            continue
        r = recs[c1.get(a, 0)].Class2Record[c2.get(b, 0)]
        v = getattr(r.Value1, 'XAdvance', 0) if r.Value1 else 0
        if v:
            return v
    return 0


def glyph_names(f, text):
    cmap = f.getBestCmap()
    out = []
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None:
            raise SystemExit(f'glyphs.py: no glyph for {ch!r} (U+{ord(ch):04X}) in {f}')
        out.append(g)
    return out


def measure(name, axes, text, tracking):
    f = load(name, axes)
    hmtx = f['hmtx']
    x, prev = 0, None
    for g in glyph_names(f, text):
        if prev is not None:
            x += kern(name, axes, prev, g) + tracking
        x += hmtx[g][0]
        prev = g
    return x


def draw(name, axes, text, scale, tracking):
    f = load(name, axes)
    gs, hmtx = f.getGlyphSet(), f['hmtx']
    fmt = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
    pen = SVGPathPen(gs, ntos=fmt)
    x, prev = 0, None
    for g in glyph_names(f, text):
        if prev is not None:
            x += kern(name, axes, prev, g) + tracking
        gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0)))
        x += hmtx[g][0]
        prev = g
    return pen.getCommands(), x * scale


def wrap(name, axes, words, upm_px, max_width, tracking):
    lines, cur = [], ''
    for w in words:
        trial = (cur + ' ' + w) if cur else w
        if cur and measure(name, axes, trial, tracking) * upm_px > max_width:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines


def layout(req):
    name = req['font']
    axes = tuple(sorted((req.get('axes') or {}).items()))
    f = load(name, axes)
    upm = f['head'].unitsPerEm
    tracking = req.get('tracking', 0)
    words = req['text'].split()
    size = req['size']
    min_size = req.get('min_size', size)
    max_lines = req.get('max_lines', 1)
    max_width = req['max_width']
    while True:
        px = size / upm
        lines = wrap(name, axes, words, px, max_width, tracking)
        widest = max(measure(name, axes, l, tracking) * px for l in lines)
        if (len(lines) <= max_lines and widest <= max_width) or size <= min_size:
            break
        size -= 2
    if len(lines) > max_lines or widest > max_width:
        raise SystemExit(f'glyphs.py: "{req["text"]}" does not fit {max_lines} line(s) of {max_width}px at {min_size}px')
    out = []
    for l in lines:
        d, w = draw(name, axes, l, px, tracking)
        out.append({'text': l, 'd': d, 'width': round(w, 1)})
    os2, hhea = f['OS/2'], f['hhea']
    return {
        'size': size,
        'lines': out,
        'cap': round(os2.sCapHeight * px, 1),
        'asc': round(hhea.ascent * px, 1),
        'desc': round(-hhea.descent * px, 1),
    }


if __name__ == '__main__':
    reqs = json.load(sys.stdin)
    json.dump([layout(r) for r in reqs], sys.stdout)
