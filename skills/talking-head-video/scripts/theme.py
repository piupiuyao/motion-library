#!/usr/bin/env python3
"""Pick the video's accent colour, so every effect matches the video or the brand.

  python3 scripts/theme.py PROJECT                     -> from the footage (clothes / background)
  python3 scripts/theme.py PROJECT --brand https://…   -> from the brand's website; falls back to the footage
Writes PROJECT/theme.json {"accent": "#…", "accent-2": "#…", "source": "…"}; render.py uses it when the shots file
has no "theme" of its own. Research: one highlight colour per video, bright enough to read (≥ 4.5:1 against --ink).
With --brand the colours are the brand's own (exact, plus "on-accent" = the text colour that reads on them), and
"brand" holds the kit saved to PROJECT/brand/: name, logo, font, and the app icons the site itself uses.
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


def fetch(u, binary=False):
    data = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15).read()
    return data if binary else data.decode('utf-8', 'ignore')


def on(c):
    """Text colour that reads on top of colour c: white or near-black."""
    return '#ffffff' if contrast(c, (255, 255, 255)) >= contrast(c, (17, 17, 17)) else '#111111'


def from_brand(link, proj):
    """Brand kit from the brand's own website: its exact colours (CSS variables), font, logo, and the app icons
    the site itself shows. Files go to PROJECT/brand/; colours are used as they are (not brightened)."""
    html = fetch(link)
    css = html
    for href in re.findall(r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)', html)[:12]:
        try:
            css += fetch(urllib.parse.urljoin(link, href))
        except Exception:
            pass
    var = {}
    for name, val in re.findall(r'--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b', css):
        var.setdefault(name.lower(), val.lower())
    def pick(*pats, test=lambda c: True, skip=('soft', 'light', 'muted', 'hover', 'pressed', 'focus', 'edge', 'border')):
        for pat in pats:
            for n, v in var.items():
                if re.fullmatch(pat, n) and not any(x in n for x in skip) and test(rgb(v)):
                    return v
    out = {}
    # what the eye sees first on the site: the call-to-action button, then the logo, then a --accent/--primary variable
    # (a variable named "accent" can be a link colour that barely shows on the page)
    cta = pick(r'[\w-]*(button|btn|cta)[\w-]*(fill|bg|background)?', test=lambda c: colourful(c, .2), skip=('hover', 'pressed', 'focus', 'edge', 'border', 'ink', 'text'))
    named = pick(r'accent', r'primary', r'brand', r'[\w-]*(primary|brand|accent)[\w-]*', test=lambda c: colourful(c, .2))
    m = re.search(r'<meta[^>]+name=["\']theme-color["\'][^>]+content=["\'](#[0-9a-fA-F]{3,6})', html)
    meta = m.group(1) if m and colourful(rgb(m.group(1)), .2) else None
    used = Counter(h.lower() for h in re.findall(r'#[0-9a-fA-F]{6}\b', css) if colourful(rgb(h), .3))
    order = [c for c in (cta, named, meta, *(h for h, _ in used.most_common(3))) if c]
    if not order:
        return None
    accent = order[0]
    out['accent'] = accent
    # accent used as TEXT on white / bright footage: a very light accent (lime, yellow) can't be read → its dark ink
    out['accent-text'] = accent if contrast(rgb(accent), (255, 255, 255)) >= 3 else None
    out['on-accent'] = pick(r'[\w-]*(button|btn|cta)[\w-]*ink', test=lambda c: contrast(c, rgb(accent)) >= 4.5) or on(rgb(accent))
    out['accent-text'] = out['accent-text'] or out['on-accent']
    hue = lambda h: colorsys.rgb_to_hls(*[v / 255 for v in rgb(h)])[0]
    far = lambda h: min(abs(hue(h) - hue(accent)), 1 - abs(hue(h) - hue(accent))) > .12
    a2 = next((c for c in order[1:] if far(c)), None)
    if a2:
        out['accent-2'] = a2
        out['on-accent-2'] = on(rgb(a2))
    ink = pick(r'ink', r'text', r'foreground', r'fg', r'[\w-]*(ink|text|foreground)', test=lambda c: lum(c) < .2)
    paper = pick(r'paper', r'surface', r'card', test=lambda c: lum(c) > .8)
    page = pick(r'canvas', r'background', r'bg', r'page[\w-]*', r'body[\w-]*', test=lambda c: True)
    if ink:
        out['ink'] = ink
    if paper:
        out['paper'] = paper
    if page and lum(rgb(page)) > .6:
        # a light site: full-screen cards are light like its pages, text on them is the site's ink
        out['look'] = 'light'
        out['bg-a'], out['bg-b'] = page, paper or '#ffffff'
        out['on-bg'] = ink or '#111111'
    elif ink:
        out['bg-a'] = ink
        out['bg-b'] = hx([v + (255 - v) * .12 for v in rgb(ink)])
    out['source'] = f'brand {link}'

    bdir = os.path.join(proj, 'brand')
    os.makedirs(bdir, exist_ok=True)
    kit = {'site': link}
    def save(u, name):
        data = fetch(urllib.parse.urljoin(link, u), binary=True)
        open(os.path.join(bdir, name), 'wb').write(data)
        return 'brand/' + name
    # name: the text next to the header logo, else og:site_name, else the <title> before a separator
    m = re.search(r'<img[^>]*class=["\'][^"\']*logo[^"\']*["\'][^>]*>\s*([^<]{2,30})<', html) \
        or re.search(r'<meta[^>]+property=["\']og:site_name["\'][^>]+content=["\']([^"\']+)', html) \
        or re.search(r'<title>\s*([^<|\-–—:]+)', html)
    if m:
        kit['name'] = m.group(1).strip()
    # logo: an <img> whose class or file name says logo
    m = re.search(r'<img[^>]+class=["\'][^"\']*logo[^"\']*["\'][^>]*src=["\']([^"\']+)', html) \
        or re.search(r'<img[^>]+src=["\']([^"\']*logo[^"\']*)["\']', html)
    if m:
        try:
            kit['logo'] = save(m.group(1), 'logo' + os.path.splitext(urllib.parse.urlparse(m.group(1)).path)[1])
        except Exception:
            pass
    # font: the @font-face the body text uses
    faces = dict(re.findall(r"@font-face\s*\{[^}]*font-family:\s*['\"]?([^;'\"]+)['\"]?;[^}]*src:\s*url\(['\"]?([^)'\"]+)", css))
    body = re.findall(r'font-family:\s*([^;}]+)', css)
    fam = next((f for b in body for f in faces if f.lower() in b.lower()), None)
    if fam:
        try:
            kit['font'] = {'family': fam, 'file': save(faces[fam], 'font' + os.path.splitext(urllib.parse.urlparse(faces[fam]).path)[1])}
        except Exception:
            pass
    # the app icons the site shows (Gmail, Slack…): the brand's own versions win over the icon library
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import icons
    kit['icons'] = {}
    for src in re.findall(r'<img[^>]+src=["\']([^"\']+\.(?:svg|png|webp))', html):
        stem = re.sub(r'[-_](native|color|icon|logo|tasks)$', '', os.path.splitext(os.path.basename(urllib.parse.urlparse(src).path))[0].lower())
        stem = stem.replace('-', ' ')
        if stem in kit['icons'] or not icons.find(stem) or icons.find(stem)['kind'] == 'ui':
            continue
        try:
            kit['icons'][stem.replace(' ', '')] = save(src, 'icon-' + stem.replace(' ', '-') + os.path.splitext(urllib.parse.urlparse(src).path)[1])
        except Exception:
            pass
    out['brand'] = kit
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--brand', help='brand website link')
    a = ap.parse_args()
    theme = None
    if a.brand:
        try:
            theme = from_brand(a.brand, a.proj)
        except Exception as e:
            print('brand link failed, using the footage:', e, file=sys.stderr)
    theme = theme or from_footage(a.proj) or {'accent': YELLOW, 'source': 'default yellow'}
    json.dump(theme, open(os.path.join(a.proj, 'theme.json'), 'w'), indent=1)
    print(json.dumps(theme, ensure_ascii=False))
