"""Builds "KS Pixel", the site's display face, from code.

An original chamfered pixel-geometric typeface: thick even strokes, 45° corner cuts, square counters
and small pixel notches. Every glyph is composed from rectangles and diagonal strokes on a 1000-unit
em, then compiled to public/fonts/ks-pixel.woff2.

    python3 scripts/build-font.py
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from shapely import affinity
from shapely.geometry import MultiPolygon, Point, Polygon, box
from shapely.ops import unary_union

UPM = 1000
H = 731  # cap height
S = 161  # stroke weight, vertical and horizontal alike
C = 207  # outer corner cut
c = 17  # inner (counter) corner fill: barely softened, the counters read as square
N = 49  # pixel notch depth
D = S * 2**0.5  # horizontal width of a 45° stroke that reads as weight S
MID0, MID1 = (H - S) / 2, (H + S) / 2  # crossbar band
RSB = 78  # all spacing sits on the right, so text starts flush with its box


def rect(x0, y0, x1, y1):
    return box(x0, y0, x1, y1)


def ring(w, h=H, s=S):
    return rect(0, 0, w, h).difference(rect(s, s, w - s, h - s))


def tri(x, y, sx, sy, size):
    """Right triangle with its right angle at (x, y), legs running sx/sy (±1) for `size`."""
    return Polygon([(x, y), (x + sx * size, y), (x, y + sy * size)])


def diag(x0, y0, x1, y1, w=D):
    """Stroke between two points with horizontal ends, `w` wide measured horizontally."""
    return Polygon([(x0 - w / 2, y0), (x0 + w / 2, y0), (x1 + w / 2, y1), (x1 - w / 2, y1)])


def brush(x0, y0, x1, y1, s=S):
    """Sweep a square nib (lower-left corner at each point) between two points: diagonals keep stroke weight."""
    return rect(x0, y0, x0 + s, y0 + s).union(rect(x1, y1, x1 + s, y1 + s)).convex_hull


class G:
    """A glyph under construction: union shapes in, cut shapes out, then clip to its box."""

    def __init__(self, w):
        self.w, self.shape = w, Polygon()

    def add(self, *shapes):
        self.shape = unary_union([self.shape, *shapes])
        return self

    def sub(self, *shapes):
        self.shape = self.shape.difference(unary_union(shapes))
        return self

    def cut(self, *corners, size=C):
        """Chamfer outer corners: 'tl' 'tr' 'bl' 'br'."""
        w = self.w
        at = {'tl': (0, H, 1, -1), 'tr': (w, H, -1, -1), 'bl': (0, 0, 1, 1), 'br': (w, 0, -1, 1)}
        return self.sub(*[tri(*at[k], size) for k in corners])

    def fill(self, *pts, size=c):
        """Soften counter corners: (x, y, sx, sy) with the right angle in the counter."""
        return self.add(*[tri(x, y, sx, sy, size) for x, y, sx, sy in pts])

    def done(self):
        return self.shape.intersection(rect(0, -250, self.w, H))  # room for comma and Q tails below the baseline


def bowl_fills(w, top=H, bottom=0, left=True, right=True):
    """Counter-corner fills for a rectangular bowl spanning x 0..w, y bottom..top."""
    pts = []
    if left:
        pts += [(S, top - S, 1, -1), (S, bottom + S, 1, 1)]
    if right:
        pts += [(w - S, top - S, -1, -1), (w - S, bottom + S, -1, 1)]
    return pts


W = 705  # standard width
WW = 728  # wide letters
NW = 654  # narrow letters (B E F 3)
ADV = {'V': 806, '-': 333, '–': 500, ':': 278}  # advance overrides where the ink overhangs or sits inside the usual spacing
SPACE = 440  # word space
J = S * 1.6  # run of a 45° joint between a centre bar and an outer stem


def upper_joint(w=W):
    """K's top arm: centre bar steps up at 45° into a right stem running to the cap line."""
    return [brush(w - J - S, MID0, w - S, MID0 + J), rect(w - S, MID0 + J, w, H)]


def lower_joint(w=W):
    """K's lower arm: centre bar steps down at 45° into a right stem on the baseline."""
    return [brush(w - J - S, MID0, w - S, MID0 - J), rect(w - S, 0, w, MID0 - J + S)]


def vnotch(x=0, y=H / 2, size=S * 0.55):
    """Small V cut into a side edge (x=0 left, x=w right), marking where a crossbar meets the stem."""
    d = size if x == 0 else -size
    e = -1 if x == 0 else 1
    return Polygon([(x + e, y + size), (x + d, y), (x + e, y - size)])


def pnotch(x, d=1, top=False):
    """Pixel notch: a small 45°-sided bite out of the baseline (or cap line) beside a stem at x, running d=±1."""
    y0, y1 = (H + 1, H - N) if top else (-1, N)
    return Polygon([(x, y0), (x, y1), (x + d * 31, y1), (x + d * 80, y0)])


def glyphs():
    g = {}
    # Round family: octagonal outer, softened square counters
    g['O'] = G(WW).add(ring(WW)).cut('tl', 'tr', 'bl', 'br').fill(*bowl_fills(WW)).done()
    g['0'] = G(WW).add(ring(WW), diag(S + 40, S, WW - S - 40, H - S, w=S * 1.25)).cut('tl', 'tr', 'bl', 'br').fill(*bowl_fills(WW)).done()
    # Q rides 22 units above the cap line so its tail lands on the baseline instead of hanging below it
    q = G(752).add(ring(WW)).cut('tl', 'tr', 'bl', 'br').fill(*bowl_fills(WW)).add(Polygon([(570, 48), (640, -22), (752, 90), (682, 160)])).done()
    g['Q'] = affinity.translate(q, yoff=22)
    g['C'] = G(WW).add(ring(WW)).sub(rect(WW - S, S, WW + 1, H - S)).cut('tl', 'bl').fill(*bowl_fills(WW, right=False)).done()
    g['G'] = (
        G(WW).add(ring(WW)).sub(rect(WW - S, MID1, WW + 1, H - S)).cut('tl', 'bl')
        .add(rect(WW / 2, MID0, WW, MID1)).sub(tri(WW, MID1, -1, -1, C)).fill(*bowl_fills(WW, right=False)).done()
    )
    g['D'] = G(WW).add(ring(WW)).cut('tr', 'br').fill(*bowl_fills(WW, left=False)).sub(pnotch(S)).done()
    g['U'] = G(WW).add(rect(0, 0, S, H), rect(WW - S, 0, WW, H), rect(0, 0, WW, S)).cut('bl').fill((S, S, 1, 1)).sub(pnotch(WW - S, -1)).done()
    g['J'] = G(568).add(rect(568 - S, 0, 568, H), rect(0, 0, 568, S)).cut('br').fill((568 - S, S, -1, 1)).done()
    g['S'] = (
        G(W).add(rect(0, H - S, W, H), rect(0, MID0, S, H), rect(0, MID0, W, MID1), rect(W - S, 0, W, MID1), rect(0, 0, W, S))
        .cut('tl', 'br').sub(tri(0, MID0, 1, 1, C), tri(W, MID1, -1, -1, C)).fill((S, MID1, 1, 1), (W - S, MID0, -1, -1)).done()
    )
    g['5'] = (
        G(W).add(rect(0, H - S, W - N, H), rect(0, MID0, S, H), rect(0, MID0, W, MID1), rect(W - S, 0, W, MID1), rect(46, 0, W, S))
        .cut('tl', 'br').sub(tri(46, 0, 1, 1, S), tri(0, MID0, 1, 1, C), tri(W, MID1, -1, -1, C)).fill((S, MID1, 1, 1), (W - S, MID0, -1, -1)).done()
    )
    g['2'] = (
        G(W).add(rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1), rect(0, 0, S, MID1), rect(0, 0, W, S))
        .cut('tr', 'bl').sub(tri(W, MID0, -1, 1, C), tri(0, MID1, 1, -1, C)).fill((W - S, H - S, -1, -1), (S, MID0, 1, -1)).done()
    )
    g['3'] = (
        G(NW).add(rect(0, H - S, NW, H), rect(NW - S, 0, NW, H), rect(114, MID0, NW, MID1), rect(0, 0, NW, S))
        .cut('tr', 'br').fill((NW - S, H - S, -1, -1), (NW - S, S, -1, 1), (NW - S, MID0, -1, -1), (NW - S, MID1, -1, 1)).sub(vnotch(NW)).done()
    )
    # 6 is a closed lower bowl under a shortened top bar; 9 is the same figure turned half round
    g['6'] = (
        G(W).add(rect(0, 0, S, H), rect(0, H - S, W - 46, H), rect(0, MID0, W, MID1), rect(0, 0, W, S), rect(W - S, 0, W, MID1))
        .cut('tl', 'bl', 'br').sub(tri(W, MID1, -1, -1, C)).fill((S, H - S, 1, -1), *bowl_fills(W, top=MID1, bottom=0)).done()
    )
    g['9'] = affinity.rotate(g['6'], 180, origin=(W / 2, H / 2))
    g['8'] = (
        G(W).add(ring(W), rect(0, MID0, W, MID1)).cut('tl', 'tr', 'bl', 'br')
        .fill(*bowl_fills(W, top=MID1 + S - S, bottom=0), *bowl_fills(W, top=H, bottom=MID0))
        .sub(rect(-1, MID0 + 30, N, MID1 - 30), rect(W - N, MID0 + 30, W + 1, MID1 - 30)).done()
    )
    g['B'] = (
        G(NW).add(ring(NW), rect(0, MID0, NW, MID1)).cut('tr', 'br')
        .fill(*bowl_fills(NW, top=MID1, bottom=0), *bowl_fills(NW, top=H, bottom=MID0)).sub(vnotch(NW)).done()
    )
    g['P'] = (
        G(W).add(rect(0, 0, S, H), rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1))
        .cut('tr').sub(tri(W, MID0, -1, 1, C)).fill(*bowl_fills(W, top=H, bottom=MID0)).done()
    )
    g['R'] = (
        G(W).add(rect(0, 0, S, H), rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1))
        .cut('tr').sub(tri(W, MID0, -1, 1, C)).fill((W - S, H - S, -1, -1), (S, MID1, 1, 1), (S, H - S, 1, -1))
        .add(Polygon([(335, MID1), (500, MID1), (500, 165), (W, 165), (W, 0), (550, 0), (335, 215)])).done()
    )
    # Straight family
    g['H'] = G(W).add(rect(0, 0, S, H), rect(W - S, 0, W, H), rect(0, MID0, W, MID1)).done()
    g['E'] = G(NW).add(rect(0, 0, S, H), rect(0, H - S, NW, H), rect(0, 0, NW, S), rect(0, MID0, NW - 115, MID1)).cut('tl', 'bl').fill((S, H - S, 1, -1), (S, S, 1, 1)).sub(vnotch()).done()
    g['F'] = G(NW).add(rect(0, 0, S, H), rect(0, H - S, NW, H), rect(0, MID0, NW - 115, MID1)).cut('tl').fill((S, H - S, 1, -1)).sub(vnotch()).done()
    g['L'] = G(568).add(rect(0, 0, S, H), rect(0, 0, 568, S)).cut('bl').fill((S, S, 1, 1)).done()
    g['T'] = G(WW).add(rect(0, H - S, WW, H), rect((WW - S) / 2, 0, (WW + S) / 2, H)).done()
    g['I'] = G(528).add(rect(0, H - S, 528, H), rect(0, 0, 528, S), rect(184, 0, 184 + S, H)).sub(pnotch(184 + S), pnotch(184 + S, top=True)).done()
    g['1'] = G(619).add(rect(0, 0, 619, S), rect(229, 0, 229 + S, H), rect(0, H - S, 229 + S, H)).sub(tri(229 + S, H, -1, -1, C), pnotch(229 + S)).done()
    g['4'] = G(W).add(rect(0, MID0, S, H), rect(0, MID0, W, MID1), rect(W - S, 0, W, H)).sub(tri(0, MID0, 1, 1, S), vnotch(W)).done()
    g['7'] = (
        G(W).add(rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1), rect(0, 0, S, MID1))
        .sub(tri(W, MID0, -1, 1, C), tri(0, MID1, 1, -1, C)).fill((W - S, H - S, -1, -1), (S, MID0, 1, -1)).done()
    )
    g['N'] = G(WW).add(rect(0, 0, S, H), rect(WW - S, 0, WW, H), rect(0, H - S, WW, H)).cut('tl', 'tr').fill((S, H - S, 1, -1), (WW - S, H - S, -1, -1)).done()
    apex = S * 0.9 + WW / 2 - S
    chevron = Polygon([(S, S * 0.9), (WW / 2, apex), (WW - S, S * 0.9), (WW - S, MID1), (S, MID1)])
    g['W'] = G(WW).add(rect(0, 0, S, H), rect(WW - S, 0, WW, H), chevron).fill((S, MID1, 1, 1), (WW - S, MID1, -1, 1)).done()
    g['M'] = affinity.scale(g['W'], yfact=-1, origin=(0, H / 2))
    vw = 765  # wider than U so the V-shaped counter has room
    g['V'] = G(vw).add(rect(0, 0, vw, H)).sub(Polygon([(S, H + 1), (S, MID0), (vw / 2, S * 0.55), (vw - S, MID0), (vw - S, H + 1)])).cut('bl', 'br', size=C * 1.1).done()
    g['Y'] = (
        G(W).add(rect(0, MID0, S, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1), rect((W - S) / 2, 0, (W + S) / 2, MID1))
        .sub(tri(0, MID0, 1, 1, S * 1.05), tri(W, MID0, -1, 1, S * 1.05)).fill((S, MID1, 1, 1), (W - S, MID1, -1, 1)).done()
    )
    # K keeps diagonal arms: a notched-H form made the name read "Hrishna"
    g['K'] = G(W).add(rect(0, 0, S, H), rect(0, MID0, W - J - S, MID1), *upper_joint(), *lower_joint()).sub(rect(S - 1, MID1 - N, S + N, MID1 + 1)).done()
    # H with a V cut into both sides of the crossbar
    g['X'] = G(W).add(g['H']).sub(vnotch(0), vnotch(W)).done()
    # Z is 2 with square outer corners
    g['Z'] = (
        G(W).add(rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(0, MID0, W, MID1), rect(0, 0, S, MID1), rect(0, 0, W - 9, S))
        .sub(tri(W, MID0, -1, 1, C), tri(0, MID1, 1, -1, C)).fill((W - S, H - S, -1, -1), (S, MID0, 1, -1)).done()
    )
    g['A'] = G(W).add(rect(0, 0, S, H), rect(W - S, 0, W, H), rect(0, H - S, W, H), rect(0, MID0, W, MID1)).cut('tr').fill((W - S, H - S, -1, -1)).done()
    # Punctuation and symbols (all sit on the same stroke grid)
    P = 192  # punctuation mark width
    dot = lambda y=0: rect(0, y, P, y + S)
    low = 5  # full stops sit a hair above the baseline
    # comma tail: a short stem below the dot that hooks back left, chamfered on its outer corner
    tail = rect(0, -164, P, 0).difference(rect(-1, -86, 114, 1)).difference(tri(P, -164, -1, 1, 100))
    g['.'] = G(P).add(dot(low)).done()
    g[','] = G(P).add(dot(), tail).done()
    g[':'] = G(P).add(Point(135, 407).buffer(55, 16), Point(135, 48).buffer(55, 16)).done()  # small round dots, unlike the square full stop
    g[';'] = G(P).add(affinity.translate(unary_union([dot(), tail]), yoff=low), dot(240)).done()
    g['!'] = G(P).add(dot(), rect(0, 245, P, H)).sub(tri(0, 245, 1, 1, 88), tri(P, 245, -1, 1, 88)).done()
    g["'"] = G(P).add(affinity.translate(unary_union([dot(), tail]), yoff=H - S)).done()
    # ?: square hook, stem and dot centred under it
    qx = (W - P) / 2 + 1
    g['?'] = (
        G(W).add(rect(0, H - S, W, H), rect(W - S, MID0, W, H), rect(qx, MID0, W, MID1), rect(qx, 243, qx + P, MID1), affinity.translate(dot(low), xoff=qx))
        .add(Polygon([(0, H - S), (80, H - S), (80, 450), (175, 450), (175, 370), (100, 370), (0, 470)]))
        .sub(tri(W, MID0, -1, 1, C)).fill((W - S, H - S, -1, -1)).done()
    )
    g['-'] = G(285).add(rect(39, 194, 285, 257)).done()  # light and low, below the crossbar line
    g['–'] = G(500).add(rect(0, 201, 500, 250)).done()  # en dash, used in date ranges
    g['·'] = G(P).add(dot(MID0)).done()
    g['%'] = (
        G(WW).add(rect(0, MID1, S * 1.6, H), rect(WW - S * 1.6, 0, WW, MID0), brush(WW - S, H - S, 0, 0))
        .sub(rect(S * 0.55, MID1 + S * 0.55, S * 1.05, H - S * 0.55), rect(WW - S * 1.05, S * 0.55, WW - S * 0.55, MID0 - S * 0.55)).done()
    )
    xw = 520
    g['×'] = G(xw).add(brush(0, MID1 + 60, xw - S, MID0 - 60 - S), brush(xw - S, MID1 + 60, 0, MID0 - 60 - S)).done()
    # Small upper loop, open lower bowl, and a 45° leg that crosses out to the bottom right
    up = rect(0, MID0, WW * 0.6, H).difference(rect(S, MID1, WW * 0.6 - S, H - S))
    g['&'] = (
        G(WW).add(up, rect(0, 0, S, MID1), rect(0, 0, WW * 0.62, S), brush(WW * 0.6 - S, MID0, WW - S, 0), rect(WW - S, MID0 - S * 0.3, WW, MID1 - S * 0.3))
        .cut('tl', 'bl').fill((S, H - S, 1, -1), (S, S, 1, 1)).done()
    )
    # $ is S with square outer corners; the stem only shows where it pokes out above and below
    g['$'] = (
        G(W).add(rect(0, H - S, W, H), rect(0, MID0, S, H), rect(0, MID0, W, MID1), rect(W - S, 0, W, MID1), rect(0, 0, W, S))
        .sub(tri(0, MID0, 1, 1, C), tri(W, MID1, -1, -1, C)).fill((S, MID1, 1, 1), (W - S, MID0, -1, -1)).shape
        .union(rect((W - S) / 2 + 1, -97, (W + S) / 2 + 1, 0)).union(rect((W - S) / 2 + 1, H, (W + S) / 2 + 1, H + 100))
    )
    g['/'] = G(480).add(brush(480 - S, H - S, 0, 0)).done()
    g[' '] = None
    return g


def to_ttglyph(shape):
    pen = TTGlyphPen(None)
    if shape is None or shape.is_empty:
        return pen.glyph()
    shape = shape.buffer(0)
    polys = shape.geoms if isinstance(shape, MultiPolygon) else [shape]
    for poly in polys:
        if not isinstance(poly, Polygon) or poly.is_empty:
            continue
        # TrueType: outer contours clockwise, holes counter-clockwise
        rings = [(poly.exterior, True)] + [(i, False) for i in poly.interiors]
        for r, outer in rings:
            pts = [(round(x), round(y)) for x, y in r.coords[:-1]]
            ccw = Polygon(pts).exterior.is_ccw if len(pts) > 2 else False
            if outer == ccw:
                pts.reverse()
            pen.moveTo(pts[0])
            for p in pts[1:]:
                pen.lineTo(p)
            pen.closePath()
    return pen.glyph()


def build(out_dir: Path):
    defs = glyphs()
    names = {' ': 'space', '.': 'period', ',': 'comma', ':': 'colon', ';': 'semicolon', '!': 'exclam', "'": 'quotesingle', '?': 'question',
             '-': 'hyphen', '–': 'endash', '·': 'periodcentered', '%': 'percent', '×': 'multiply', '&': 'ampersand', '$': 'dollar', '/': 'slash'}
    order, cmap, glyf, metrics = ['.notdef'], {}, {'.notdef': TTGlyphPen(None).glyph()}, {'.notdef': (500, 0)}
    for ch, shape in defs.items():
        name = names.get(ch, ch if ch.isalpha() else f'uni{ord(ch):04X}')
        if ch.isdigit():
            name = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][int(ch)]
        order.append(name)
        glyf[name] = to_ttglyph(shape)
        metrics[name] = (SPACE, 0) if shape is None else (ADV.get(ch, round(shape.bounds[2]) + RSB), round(shape.bounds[0]))
        cmap[ord(ch)] = name
        if ch.isalpha() and ch.isupper():
            cmap[ord(ch.lower())] = name  # lowercase shares the capitals, as headings are set in caps
    cmap[0x2019] = cmap[0x2018] = 'quotesingle'  # typographic apostrophes
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyf)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=834, descent=-166)
    fb.setupNameTable({'familyName': 'KS Pixel', 'styleName': 'Regular', 'uniqueFontIdentifier': 'KSPixel-Regular', 'fullName': 'KS Pixel Regular',
                       'psName': 'KSPixel-Regular', 'version': 'Version 1.000', 'copyright': 'Copyright 2026 Krishna Somani',
                       'description': 'Chamfered pixel-geometric display face drawn for kr7shnasomani.is-a.dev'})
    fb.setupOS2(sTypoAscender=834, sTypoDescender=-166, usWinAscent=834, usWinDescent=166, sCapHeight=H, sxHeight=H, achVendID='KSPX')
    fb.setupPost()
    out_dir.mkdir(parents=True, exist_ok=True)
    fb.font.flavor = 'woff2'
    fb.save(out_dir / 'ks-pixel.woff2')
    return out_dir


if __name__ == '__main__':
    out = build(Path(__file__).resolve().parent.parent / 'public' / 'fonts')
    print('wrote', out / 'ks-pixel.woff2')
