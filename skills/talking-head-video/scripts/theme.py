#!/usr/bin/env python3
"""Pick the video's accent colour, so every effect matches the video or the brand.

  python3 scripts/theme.py PROJECT                     -> from the footage (clothes / background)
  python3 scripts/theme.py PROJECT --brand https://…   -> from the brand's website; falls back to the footage
Writes PROJECT/theme.json {"accent": "#…", "accent-2": "#…", "source": "…"}; render.py uses it when the shots file
has no "theme" of its own. Research: one highlight colour per video, bright enough to read (≥ 4.5:1 against --ink).
"""
import argparse, colorsys, glob, json, os, re, sys, urllib.parse, urllib.request
from collections import Counter

from PIL import Image

YELLOW = '#ffd400'  # most common highlight in the measured hit videos; used when nothing usable is found


def hx(rgb):
    return '#%02x%02x%02x' % tuple(int(round(c)) for c in rgb)


def rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = c
    return .2126 * ch(r) + .7152 * ch(g) + .0722 * ch(b)


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + .05) / (lb + .05)


def as_accent(c):
    """Same hue, pushed bright and saturated enough to work as a highlight behind dark text."""
    h, l, s = colorsys.rgb_to_hls(*[v / 255 for v in c])
    s = max(s, .65)
    l = min(max(l, .5), .62)
    out = [v * 255 for v in colorsys.hls_to_rgb(h, l, s)]
    while contrast(out, (17, 17, 17)) < 4.5 and l < .85:
        l += .03
        out = [v * 255 for v in colorsys.hls_to_rgb(h, l, s)]
    return hx(out)


def colourful(c, min_s=.28):
    h, l, s = colorsys.rgb_to_hls(*[v / 255 for v in c])
    return s >= min_s and .18 <= l <= .85


def from_footage(proj):
    frames = sorted(glob.glob(os.path.join(proj, 'work', 'frames_src', '*.jpg')))
    if not frames:
        return None
    pick = frames[::max(1, len(frames) // 12)][:12]
    mattes = os.path.join(proj, 'work', 'matte_src')
    vivid, clothes, total = Counter(), Counter(), 0
    for f in pick:
        im = Image.open(f).convert('RGB').resize((96, 170))
        m = os.path.join(mattes, os.path.basename(f).replace('.jpg', '.png'))
        mask = Image.open(m).convert('L').resize((96, 170)) if os.path.exists(m) else None
        q = im.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette()[:24]
        for px, mk in zip(q.getdata(), mask.getdata() if mask else [0] * (96 * 170)):
            total += 1
            c = tuple(pal[px * 3:px * 3 + 3])
            h, l, s = colorsys.rgb_to_hls(*[v / 255 for v in c])
            if mk > 128 and 10 <= h * 360 <= 40:
                continue  # skin / hair
            key = tuple(v // 16 * 16 + 8 for v in c)
            if colourful(c):
                vivid[key] += 2 if mk > 128 else 1
            elif mk > 128 and s >= .08 and .2 <= l <= .85:
                clothes[key] += 1  # muted clothes (sage, navy, beige…): their hue, made brighter
    # 1) a clearly coloured thing in frame (≥3% of pixels)  2) the colour of their clothes  3) nothing → yellow
    if vivid and sum(vivid.values()) >= .03 * total:
        best = vivid.most_common(1)[0][0]
    elif clothes and sum(clothes.values()) >= .03 * total:
        best = clothes.most_common(1)[0][0]
    else:
        return None
    return {'accent': as_accent(best), 'source': 'footage ' + hx(best)}


def from_brand(link):
    req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', 'ignore')
    css = html
    for href in re.findall(r'<link[^>]+rel=["\']?stylesheet["\']?[^>]*href=["\']([^"\']+)', html)[:4]:
        try:
            u = urllib.parse.urljoin(link, href)
            css += urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15).read().decode('utf-8', 'ignore')
        except Exception:
            pass
    m = re.search(r'<meta[^>]+name=["\']theme-color["\'][^>]+content=["\'](#[0-9a-fA-F]{3,6})', html)
    cands = []
    if m and colourful(rgb(m.group(1)), .2):
        cands.append((m.group(1), 'theme-color'))
    # brand-ish CSS variables first (--primary, --brand, --accent), then the most used colourful hex
    for name, val in re.findall(r'--([\w-]*(?:primary|brand|accent)[\w-]*)\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b', css):
        if colourful(rgb(val), .2):
            cands.append((val, '--' + name))
    used = Counter(h.lower() for h in re.findall(r'#[0-9a-fA-F]{6}\b', css) if colourful(rgb(h), .3))
    cands += [(h, 'most used') for h, _ in used.most_common(3)]
    if not cands:
        return None
    first = rgb(cands[0][0])
    out = {'accent': as_accent(first), 'source': f'brand {link} {cands[0][1]} {cands[0][0]}'}
    for h, _ in cands[1:]:  # a second, clearly different hue for --accent-2
        a, b = colorsys.rgb_to_hls(*[v / 255 for v in first])[0], colorsys.rgb_to_hls(*[v / 255 for v in rgb(h)])[0]
        if min(abs(a - b), 1 - abs(a - b)) > .12:
            out['accent-2'] = as_accent(rgb(h))
            break
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--brand', help='brand website link')
    a = ap.parse_args()
    theme = None
    if a.brand:
        try:
            theme = from_brand(a.brand)
        except Exception as e:
            print('brand link failed, using the footage:', e, file=sys.stderr)
    theme = theme or from_footage(a.proj) or {'accent': YELLOW, 'source': 'default yellow'}
    json.dump(theme, open(os.path.join(a.proj, 'theme.json'), 'w'), indent=1)
    print(json.dumps(theme, ensure_ascii=False))
