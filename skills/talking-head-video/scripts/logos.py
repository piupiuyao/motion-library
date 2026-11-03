#!/usr/bin/env python3
"""Every brand the video names → its real, official, full-colour logo (or an honest NOT FOUND). Never a guess.

  python3 scripts/logos.py PROJECT                         names from PROJECT/script.txt (else work/words.json)
  python3 scripts/logos.py PROJECT --names "Notion,Linear"  check these names (added to the ones in the script)
  python3 scripts/logos.py PROJECT --only --names "…"       only these names
  python3 scripts/logos.py PROJECT --approve Linear         a human looked at it: mark the cached logo verified (→ ok)
  python3 scripts/logos.py PROJECT --no-official            skip the OFFICIAL map (to re-check it against the brand sites)

Where each logo comes from, in this order:
  1. icons.OFFICIAL — hand-verified full-colour logos in the icon library                       → ok
  2. library/icons/official/<slug>.(svg|png) + sources.json (source URL, date, how verified)    → ok if verified by a human
  3. the brand's OWN site (or its official press / brand page): apple-touch-icon → svg/large icon link → logo SVG in
     the page → /apple-touch-icon.png → og:image. Saved into the cache with its source URL.     → ok / needs_check
     robots.txt is respected; at most robots + 1 page + 1–2 files per brand. No third-party icon sites.
  4. the icon library's full-colour logo set (not from the brand's domain)                       → needs_check
  nothing → not_found (shown as a red NOT FOUND tile; render.py then shows text only, never a fake).

Writes PROJECT/brand/logos.json and the contact sheet PROJECT/stills/logos_check.jpg (every logo big on white and on
dark, with its name and source domain) — look at it before directing.
"""
import argparse, base64, datetime, io, json, os, re, sys, urllib.parse, urllib.request, urllib.robotparser

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import icons  # noqa: E402

CACHE = os.path.join(HERE, '..', '..', '..', 'library', 'icons', 'official')
SOURCES = os.path.join(CACHE, 'sources.json')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

# The brand's own domain. Anything not here: <slug>.com / .ai / .app / .io is tried and must name the brand in its
# <title> / og:site_name, and the result is needs_check (the domain was guessed).
DOMAINS = {
    'gmail': 'mail.google.com', 'google': 'google.com', 'slack': 'slack.com', 'whatsapp': 'whatsapp.com',
    'telegram': 'telegram.org', 'linkedin': 'linkedin.com', 'youtube': 'youtube.com', 'tiktok': 'tiktok.com',
    'facebook': 'facebook.com', 'instagram': 'instagram.com', 'discord': 'discord.com', 'notion': 'notion.com',
    'zoom': 'zoom.us', 'chrome': 'google.com/chrome', 'figma': 'figma.com', 'spotify': 'spotify.com',
    'netflix': 'netflix.com', 'reddit': 'reddit.com', 'x': 'x.com', 'twitter': 'x.com', 'teams': 'microsoft.com/microsoft-teams',
    'messenger': 'messenger.com', 'openai': 'openai.com', 'chatgpt': 'chatgpt.com', 'claude': 'claude.ai',
    'linear': 'linear.app', 'hubspot': 'hubspot.com', 'salesforce': 'salesforce.com', 'canva': 'canva.com',
    'trello': 'trello.com', 'asana': 'asana.com', 'airtable': 'airtable.com', 'dropbox': 'dropbox.com',
    'shopify': 'shopify.com', 'stripe': 'stripe.com', 'paypal': 'paypal.com', 'airbnb': 'airbnb.com', 'uber': 'uber.com',
    'amazon': 'amazon.com', 'apple': 'apple.com', 'microsoft': 'microsoft.com', 'outlook': 'outlook.com',
    'github': 'github.com', 'gitlab': 'gitlab.com', 'vercel': 'vercel.com', 'calendly': 'calendly.com',
    'loom': 'loom.com', 'miro': 'miro.com', 'clickup': 'clickup.com', 'monday': 'monday.com', 'intercom': 'intercom.com',
    'zapier': 'zapier.com', 'grammarly': 'grammarly.com', 'duolingo': 'duolingo.com', 'pinterest': 'pinterest.com',
    'snapchat': 'snapchat.com', 'wechat': 'wechat.com', 'threads': 'threads.net', 'perplexity': 'perplexity.ai',
    'gemini': 'gemini.google.com', 'midjourney': 'midjourney.com', 'cursor': 'cursor.com', 'superhuman': 'superhuman.com',
    'imessage': 'apple.com/imessage', 'excel': 'microsoft.com/microsoft-365/excel', 'word': 'microsoft.com/microsoft-365/word',
}

# capitalised at the start of a sentence doesn't make a word a brand
STOP = set('''a an and or but the this that these those it its i i'm i've you you're your we our they their he she his her
him them me my mine us what when where why how who which if then than so just also only even still yet not no yes ever
every one two three first last next tell then that's there here replying', said say says'''.split())


def slug(n):
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


def key(n):
    return re.sub(r'[^a-z0-9]', '', n.lower())


# ---------- 1. find the names ----------

def script_text(proj):
    f = os.path.join(proj, 'script.txt')
    if os.path.exists(f):
        return open(f).read()
    w = os.path.join(proj, 'work', 'words.json')
    if os.path.exists(w):
        return ' '.join(x['w'] for x in json.load(open(w))['words'])
    return ''


def brand_names():
    """lowercase key → display name, for every brand / logo in the icon library + OFFICIAL."""
    db, _, _ = icons._db()
    out = {}
    for k, v in db.items():
        if v['kind'] == 'brand':
            out.setdefault(key(v['name']), v['name'])
    for k, v in db.items():
        if v['kind'] == 'logo':
            out.setdefault(key(v['name']), v['name'].title())
            parts = v['name'].split()
            if len(parts) == 2:  # "google gmail" → also "gmail"
                out.setdefault(key(parts[1]), parts[1].title())
    for k in icons.OFFICIAL:
        out.setdefault(k, k.title())
    return out


def generic(k):
    """An everyday word that also happens to be some brand's name ("AI", "Box", "Notes"): not a brand unless written CamelCase."""
    db, by, tag = icons._db()
    return len(k) < 3 or k in icons.CONCEPTS or ('ui', k) in by or k in tag


def find_names(text, own=None):
    """Brand names said in the text, in order: (found, unmatched capitalised words)."""
    known = brand_names()
    found, loose = {}, []
    toks = list(re.finditer(r"[A-Za-z][A-Za-z0-9'’.]*[A-Za-z0-9]|[A-Za-z]", text))
    for i, m in enumerate(toks):
        w = m.group(0).rstrip('.').replace('’', "'")
        before = text[toks[i - 1].end():m.start()] if i else '.'
        start = i == 0 or bool(re.search(r'[.!?:\n]', before))
        camel = bool(re.search(r'[a-z][A-Z]', w))
        if not w[0].isupper() or w.lower() in STOP:
            continue
        k = key(w)
        nxt = toks[i + 1].group(0) if i + 1 < len(toks) else ''
        if nxt[:1].isupper() and key(w + nxt) in known and key(w + nxt) not in found:  # two-word brands ("Google Chat")
            found[key(w + nxt)] = w + ' ' + nxt
            continue
        if own and k == key(own):
            found.setdefault(k, own)
        elif k in icons.OFFICIAL or (k in known and (not start or camel) and (camel or not generic(k))):
            found.setdefault(k, w if camel or w != w.lower() else known[k])
        elif not start and len(w) > 1 and w.upper() != w and k not in found:
            loose.append(w)
    return list(found.values()), sorted(set(loose) - set(found.values()))


# ---------- 2. resolve ----------

def http(u, binary=True, timeout=15):
    r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA, 'Accept': '*/*'}), timeout=timeout)
    data = r.read(4_000_000)
    return (data if binary else data.decode('utf-8', 'ignore')), r.geturl(), r.headers.get('Content-Type', '')


def allowed(url):
    p = urllib.parse.urlparse(url)
    rp = urllib.robotparser.RobotFileParser()
    try:
        txt, _, _ = http(f'{p.scheme}://{p.netloc}/robots.txt', binary=False, timeout=8)
        rp.parse(txt.splitlines())
    except Exception:
        return True  # no robots.txt → allowed
    return rp.can_fetch(UA, url) and rp.can_fetch('*', url)


def clean_svg(s):
    s = re.sub(r'<script[\s\S]*?</script>|<foreignObject[\s\S]*?</foreignObject>', '', s, flags=re.I)
    s = re.sub(r'\son\w+\s*=\s*("[^"]*"|\'[^\']*\')', '', s)
    i = s.find('<svg')
    return s[i:] if i >= 0 else None


def svg_colours(s):
    cs = set()
    for c in re.findall(r'(?:fill|stop-color|stroke|color)\s*[:=]\s*["\']?\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|[a-z]+)', s):
        c = c.lower()
        if c not in ('none', 'transparent', 'inherit', 'url', 'evenodd', 'nonzero'):
            cs.add(c)
    return cs


def judge(data, ext):
    """Automatic sanity checks → (problems list, size). Problems make it needs_check."""
    probs = []
    if ext == 'svg':
        s = data.decode('utf-8', 'ignore')
        cs = svg_colours(s)
        if 'currentcolor' in cs or len(cs - {'currentcolor'}) <= 1:
            probs.append('one-colour SVG (confirm that is the real mark)')
        return probs, None
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    w, h = im.size
    if min(w, h) < 120:
        probs.append(f'small ({w}×{h}px)')
    if max(w, h) > 1.3 * min(w, h):
        probs.append(f'not square ({w}×{h}) — banner or wordmark?')
    q = im.resize((64, 64)).convert('RGBA')
    px = [p for p in q.getdata() if p[3] > 128]
    buckets = {}
    for r, g, b, _ in px:
        buckets[(r // 48, g // 48, b // 48)] = buckets.get((r // 48, g // 48, b // 48), 0) + 1
    big = [k for k, n in buckets.items() if n > .03 * max(1, len(px))]
    if len(big) <= 1:
        probs.append('one-colour image (confirm that is the real mark)')
    return probs, (w, h)


def to_file(data, ctype, url):
    """bytes → (bytes, ext) as svg or png (ico / webp / jpg converted to png)."""
    head = data[:400].lstrip().lower()
    if b'<svg' in head or 'svg' in ctype or url.lower().split('?')[0].endswith('.svg'):
        s = clean_svg(data.decode('utf-8', 'ignore'))
        if not s:
            raise ValueError('bad svg')
        return s.encode(), 'svg'
    im = Image.open(io.BytesIO(data))
    if getattr(im, 'n_frames', 1) > 1 or im.format == 'ICO':
        sizes = getattr(im, 'ico', None) and im.ico.sizes()
        if sizes:
            im.size = max(sizes)
    out = io.BytesIO()
    im.convert('RGBA').save(out, 'PNG')
    return out.getvalue(), 'png'


def candidates(html, base, name=''):
    """Logo candidates on the brand's page, best first: (url, how)."""
    out = []
    links = re.findall(r'<link\b[^>]*>', html, flags=re.I)
    def attr(tag, a):
        m = re.search(rf'\b{a}\s*=\s*["\']([^"\']*)["\']', tag, flags=re.I)
        return m.group(1) if m else ''
    def size(tag):
        m = re.search(r'(\d+)x\d+', attr(tag, 'sizes'))
        return int(m.group(1)) if m else 0
    touch = sorted([t for t in links if 'apple-touch-icon' in attr(t, 'rel').lower()], key=size, reverse=True)
    out += [(attr(t, 'href'), 'apple-touch-icon') for t in touch]
    ic = [t for t in links if re.search(r'(^|\s)icon(\s|$)', attr(t, 'rel').lower())]
    out += [(attr(t, 'href'), 'svg icon link') for t in ic if 'svg' in attr(t, 'type') or attr(t, 'href').split('?')[0].endswith('.svg')]
    out += [(attr(t, 'href'), f'icon link {size(t)}px') for t in sorted(ic, key=size, reverse=True) if size(t) >= 120]
    for m in re.finditer(r'<img\b[^>]*>', html, flags=re.I):
        t = m.group(0)
        src = attr(t, 'src')
        # the page's own logo: says "logo" AND the brand's name (a homepage also shows customers' logos — eBay on HubSpot)
        if src.split('?')[0].endswith('.svg') and re.search(r'logo', t, flags=re.I) \
                and key(name) in key(os.path.basename(src.split('?')[0]) + attr(t, 'alt') + attr(t, 'class') + attr(t, 'id')):
            out.append((src, 'logo SVG in the page'))
            break
    # an inline <svg> logo (header logos often are): its tag / <title> / aria-label names the brand
    for m in re.finditer(r'<svg\b[^>]*>[\s\S]{0,400000}?</svg>', html[:3_000_000], flags=re.I):
        t = m.group(0)
        label = re.search(r'<svg\b[^>]*>', t).group(0) + ' '.join(re.findall(r'<title[^>]*>([^<]*)', t)[:1])
        if key(name) in key(label) and len(t) > 300:
            out.append(('inline:' + t, 'inline logo SVG in the page'))
            break
    out.append(('/apple-touch-icon.png', 'apple-touch-icon (standard path)'))
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, flags=re.I)
    if m:
        out.append((m.group(1), 'og:image'))
    seen, res = set(), []
    for u, how in out:
        if u.startswith('inline:'):
            res.append((u, how))
        elif u and not u.startswith('data:'):
            u = urllib.parse.urljoin(base, u)
            if u not in seen:
                seen.add(u)
                res.append((u, how))
    return res


def same_site(a, b):
    ra = '.'.join(urllib.parse.urlparse(a).netloc.split('.')[-2:])
    rb = '.'.join(urllib.parse.urlparse(b).netloc.split('.')[-2:])
    return ra == rb


def fetch_official(name, site=None):
    """Download the logo from the brand's own site. → dict(data, ext, url, page, how, problems) or (None, reason)."""
    k = key(name)
    guessed = False
    if site:
        pages = [site if site.startswith('http') else 'https://' + site]
    elif k in DOMAINS:
        pages = ['https://' + DOMAINS[k]]
    else:
        guessed = True
        pages = [f'https://{k}.{tld}' for tld in ('com', 'ai', 'app', 'io')]
    why = 'no site answered'
    for page in pages:
        if not allowed(page):
            why = f'robots.txt disallows {page}'
            continue
        try:
            html, final, _ = http(page, binary=False)
        except Exception as e:
            why = f'{page}: {str(e)[:60]}'
            continue
        if guessed:  # a guessed domain must say the brand's name in its title / site name
            m = re.search(r'<title[^>]*>([^<]*)', html, flags=re.I)
            og = re.search(r'og:site_name["\'][^>]+content=["\']([^"\']+)', html, flags=re.I)
            if k not in key((m.group(1) if m else '') + ' ' + (og.group(1) if og else '')):
                why = f'{page} does not name {name} in its title'
                continue
        tries = 0
        for u, how in candidates(html, final, name):
            if u.startswith('inline:'):
                data, ext = to_file(u[7:].encode(), 'svg', '')
                probs, _ = judge(data, ext)
                return {'data': data, 'ext': ext, 'url': final, 'page': final, 'how': how, 'problems': probs}, None
            if not same_site(u, final) and not re.search(r'cdn|static|assets|img|images|media|ctfassets|cloudfront|gstatic|fbcdn|akamai|imgix|prismic|sanity|webflow|framer|wp', urllib.parse.urlparse(u).netloc):
                continue  # only the brand's own domain or the CDN its page loads assets from
            if tries >= 2:
                break
            tries += 1
            try:
                data, got, ctype = http(u)
                if 'html' in ctype:
                    continue
                data, ext = to_file(data, ctype, got)
            except Exception:
                continue
            probs, _ = judge(data, ext)
            if guessed:
                probs.append(f'domain guessed ({urllib.parse.urlparse(final).netloc})')
            if how == 'og:image':
                probs.append('og:image (often a banner, not the logo)')
            return {'data': data, 'ext': ext, 'url': got, 'page': final, 'how': how, 'problems': probs}, None
        why = f'no usable logo on {final}'
    return None, why


def load_sources():
    return json.load(open(SOURCES)) if os.path.exists(SOURCES) else {}


def save_sources(s):
    os.makedirs(CACHE, exist_ok=True)
    json.dump(s, open(SOURCES, 'w'), indent=1, ensure_ascii=False)


def resolve(name, proj, src, use_official=True, own_site=None):
    k, sl = key(name), slug(name)
    db, by, _ = icons._db()
    if use_official and k in icons.OFFICIAL and icons.OFFICIAL[k] in db:
        lk = icons.OFFICIAL[k]
        return {'svg': db[lk]['svg'].encode(), 'ext': 'svg', 'status': 'ok', 'source': f'icon library {lk} (OFFICIAL map, checked by eye)',
                'domain': 'OFFICIAL map', 'url': None}
    c = src.get(sl)
    if c and os.path.exists(os.path.join(CACHE, c['file'])):
        data = open(os.path.join(CACHE, c['file']), 'rb').read()
        st = 'ok' if c.get('verified') else 'needs_check'
        return {'svg': data, 'ext': c['file'].rsplit('.', 1)[1], 'status': st, 'url': c['url'],
                'domain': urllib.parse.urlparse(c['url']).netloc, 'source': f"cache ({c['how']}, {c['date']})" + (f"; verified {c['verified']}" if c.get('verified') else ''),
                'problems': c.get('problems', [])}
    got, why = fetch_official(name, own_site)
    if got:
        os.makedirs(CACHE, exist_ok=True)
        fn = f'{sl}.{got["ext"]}'
        open(os.path.join(CACHE, fn), 'wb').write(got['data'])
        src[sl] = {'name': name, 'file': fn, 'url': got['url'], 'page': got['page'], 'how': got['how'],
                   'date': datetime.date.today().isoformat(), 'problems': got['problems'], 'verified': None}
        # fresh from the brand's own site and passes the checks → ok; anything odd → a human looks first
        st = 'needs_check' if got['problems'] else 'ok'
        if not got['problems']:
            src[sl]['verified'] = 'auto: brand domain, full-colour, square ≥120px'
        return {'svg': got['data'], 'ext': got['ext'], 'status': st, 'url': got['url'],
                'domain': urllib.parse.urlparse(got['url']).netloc, 'source': f"fetched: {got['how']}", 'problems': got['problems']}
    for f in icons._forms(name):  # last resort: the icon library's full-colour logo (not from the brand's domain)
        lk = by.get(('logo', f.replace(' ', '')) ) or by.get(('logo', f))
        if lk:
            return {'svg': db[lk]['svg'].encode(), 'ext': 'svg', 'status': 'needs_check', 'url': None, 'domain': 'icon library',
                    'source': f'icon library {lk} (not from the brand site: {why})', 'problems': ['not from the brand domain']}
    return {'status': 'not_found', 'source': why, 'domain': '', 'url': None}


# ---------- 3. contact sheet ----------

def sheet(entries, out):
    def img(e):
        if e['status'] == 'not_found':
            return '<div class="nf">NOT FOUND</div>'
        mime = 'image/svg+xml' if e['ext'] == 'svg' else 'image/png'
        return f'<img src="data:{mime};base64,{base64.b64encode(e["bytes"]).decode()}">'
    cards = ''.join(f'''<div class="c"><div class="row"><div class="t w">{img(e)}</div><div class="t d">{img(e)}</div></div>
      <div class="n">{e["name"]}</div><div class="s {e["status"]}">{e["status"].upper()}</div>
      <div class="m">{e["domain"] or "—"}</div><div class="m small">{e["source"][:120]}</div></div>''' for e in entries)
    html = f'''<html><head><style>
      body{{margin:0;padding:36px;background:#e9e9ec;font:16px -apple-system,Helvetica,sans-serif;width:1428px}}
      h1{{font-size:26px;margin:0 0 24px}} .g{{display:flex;flex-wrap:wrap;gap:24px}}
      .c{{width:448px;background:#fff;border-radius:16px;padding:18px;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,.1)}}
      .row{{display:flex;gap:12px}} .t{{width:200px;height:200px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd}}
      .w{{background:#fff}} .d{{background:#15171c}} .t img{{max-width:150px;max-height:150px}}
      .nf{{width:100%;height:100%;border-radius:12px;background:#d91e18;color:#fff;font:800 28px/200px Helvetica;text-align:center}}
      .n{{font:700 24px Helvetica;margin-top:12px}} .s{{display:inline-block;margin:6px 0;padding:3px 10px;border-radius:6px;font-weight:700;color:#fff}}
      .ok{{background:#1a9b4b}} .needs_check{{background:#e08a00}} .not_found{{background:#d91e18}} .m{{color:#444}} .small{{font-size:13px;color:#777;margin-top:4px}}
      </style></head><body><h1>Logo check — is every one the brand's real, current, full-colour mark?</h1><div class="g">{cards}</div></body></html>'''
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1500, 'height': 800})
        pg.set_content(html)
        pg.wait_for_timeout(300)
        pg.screenshot(path=out, full_page=True, type='jpeg', quality=88)
        b.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--names', help='comma-separated brand names to check (added to those found in the script)')
    ap.add_argument('--only', action='store_true', help='with --names: check only these')
    ap.add_argument('--no-official', action='store_true', help='skip the OFFICIAL map (fetch from the brand sites instead)')
    ap.add_argument('--approve', help='comma-separated names a human checked on the sheet: mark the cached logo verified')
    a = ap.parse_args()
    proj = a.proj
    src = load_sources()
    if a.approve:
        for n in a.approve.split(','):
            c = src.get(slug(n.strip()))
            if c:
                c['verified'] = f'by eye {datetime.date.today().isoformat()}'
                print('verified', n.strip())
            else:
                print('not in cache:', n.strip())
        save_sources(src)
    theme = os.path.join(proj, 'theme.json')
    kit = json.load(open(theme)).get('brand', {}) if os.path.exists(theme) else {}
    own = kit.get('name')
    names, loose = ([], []) if a.only else find_names(script_text(proj), own)
    if a.names:
        names += [n.strip() for n in a.names.split(',') if n.strip() and key(n) not in {key(x) for x in names}]
    bdir = os.path.join(proj, 'brand', 'logos')
    os.makedirs(bdir, exist_ok=True)
    out, entries = {}, []
    for n in names:
        site = kit.get('site') if own and key(n) == key(own) else None
        r = resolve(n, proj, src, not a.no_official, site)
        rec = {'status': r['status'], 'source': r['source'], 'url': r.get('url'), 'domain': r['domain']}
        if r.get('problems'):
            rec['problems'] = r['problems']
        if r['status'] != 'not_found':
            fn = f'{slug(n)}.{r["ext"]}'
            open(os.path.join(bdir, fn), 'wb').write(r['svg'])
            rec['file'] = 'brand/logos/' + fn
        out[n] = rec
        entries.append(dict(rec, name=n, bytes=r.get('svg'), ext=r.get('ext')))
        print(f'{r["status"]:12} {n:14} {r["domain"]:26} {r["source"][:90]}' + (f'  !! {"; ".join(r["problems"])}' if r.get('problems') else ''))
    save_sources(src)
    json.dump({'logos': out, 'not_brands_maybe': loose}, open(os.path.join(proj, 'brand', 'logos.json'), 'w'), indent=1, ensure_ascii=False)
    if loose:
        print('capitalised words not in the brand list (add with --names if any is a brand):', ', '.join(loose))
    os.makedirs(os.path.join(proj, 'stills'), exist_ok=True)
    jpg = os.path.join(proj, 'stills', 'logos_check.jpg')
    if entries:
        sheet(entries, jpg)
        print('contact sheet →', jpg)


if __name__ == '__main__':
    main()
