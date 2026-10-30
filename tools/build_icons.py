#!/usr/bin/env python3
"""Build library/icons/icons.json from three open icon sets, so effects can show the right icon for a spoken word.

  logos  — full-colour brand logos (Iconify "logos" / gilbarbara svg-logos, CC0)
  brands — one-colour brand marks + official brand colour (Simple Icons, CC0); used when "logos" lacks a brand
  ui     — plain line icons for ordinary things: money, gym, clock… (Lucide, ISC)

  python3 tools/build_icons.py <dir with the three unpacked npm packages: lg/ si/ lu/>
Brand logos are trademarks: fine for referring to the product the speaker talks about, not for implying endorsement.
"""
import json, os, re, sys

src = sys.argv[1]
out = {}
def keys(*ws):
    return sorted({re.sub(r'[^a-z0-9]+', ' ', w.lower()).strip() for w in ws if w})

# lucide first, brands override on clashes (a spoken "apple" is more often the brand… ui still reachable as ui:apple)
tags = json.load(open(os.path.join(src, 'lu/package/tags.json')))
for f in sorted(os.listdir(os.path.join(src, 'lu/package/icons'))):
    n = f[:-4]
    svg = open(os.path.join(src, 'lu/package/icons', f)).read()
    svg = re.sub(r'<!--.*?-->\s*', '', svg, flags=re.S)
    svg = re.sub(r'\s+', ' ', svg).replace('> <', '><').strip()
    svg = re.sub(r' class="[^"]*"', '', svg)
    out['ui:' + n] = {'kind': 'ui', 'name': n.replace('-', ' '), 'keys': keys(n.replace('-', ' ')), 'tags': keys(*tags.get(n, [])), 'svg': svg}

for i in json.load(open(os.path.join(src, 'si/package/data/simple-icons.json'))):
    p = os.path.join(src, 'si/package/icons', i['slug'] + '.svg')
    if not os.path.exists(p):
        continue
    aka = (i.get('aliases') or {}).get('aka', [])
    out['brand:' + i['slug']] = {'kind': 'brand', 'name': i['title'], 'hex': '#' + i['hex'],
                                 'keys': keys(i['title'], i['slug'], *aka), 'svg': open(p).read().strip()}

lg = json.load(open(os.path.join(src, 'lg/package/icons.json')))
W, H = lg.get('width', 256), lg.get('height', 256)
for n, ic in lg['icons'].items():
    base = n[:-5] if n.endswith('-icon') else n
    if n != base + '-icon' and base + '-icon' in lg['icons']:
        continue  # prefer the square mark over the wordmark
    w, h = ic.get('width', W), ic.get('height', H)
    out['logo:' + base] = {'kind': 'logo', 'name': base.replace('-', ' '), 'keys': keys(base.replace('-', ' ')),
                           'svg': f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ic.get("left", 0)} {ic.get("top", 0)} {w} {h}">{ic["body"]}</svg>'}

json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'library', 'icons', 'icons.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'icons')
