#!/usr/bin/env python3
"""Batch-3 review page: reference frames + description per candidate (demos not built yet).

  python3 candidates/build3.py  ->  ~/Desktop/第三批动效审核.html  (self-contained: frames embedded as base64)
"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.expanduser('~/Desktop/第三批动效审核.html')
ORDER = ['简洁商务', '科技感', '电影感', '网感活泼']
# lead's call after reading both agents' reports
NOTE = {'地图国境发光': '建议不做：和库里「地图描线」太像',
        '词条飞入榜位': '建议并进「梯队排行榜」：是它里面的一个动作'}


def frames(c):
    paths = [p.strip() for p in c['ref_frames'].split(',')]
    base = os.path.dirname(paths[0])
    out = []
    for p in paths:
        if '/' not in p: p = os.path.join(base, p)
        f = os.path.join(ROOT, p)
        if os.path.exists(f):
            out.append('data:image/jpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode())
    return out[:4]


def video_info(c):
    slug = re.search(r'refs3/([^/]+)/', c['ref_frames']).group(1)
    md = os.path.join(HERE, 'refs3', slug, 'video.md')
    title = slug
    if os.path.exists(md):
        first = next((l for l in open(md) if l.strip()), '')
        title = re.sub(r'^#+\s*', '', first).strip() or slug
    return slug, title


def lib_poster(text):
    m = re.match(r'\s*`?([a-z0-9_]+)`?', text or '')
    if not m: return None, None
    d = os.path.join(ROOT, 'library/talking-head/effects', m.group(1))
    if not os.path.isdir(d): return None, None
    name = json.load(open(os.path.join(d, 'meta.json')))['name']
    p = os.path.join(d, 'poster.jpg')
    img = 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode() if os.path.exists(p) else None
    return name, img


cands = json.load(open(os.path.join(HERE, 'batch3.json')))
cands.sort(key=lambda c: ORDER.index(c['style'][0]) if c['style'][0] in ORDER else 9)
data = []
for n, c in enumerate(cands, 1):
    slug, title = video_info(c)
    ln, li = lib_poster(c.get('closest_existing'))
    data.append({'n': n, 'name': c['name'], 'style': c['style'], 'what': c['what'], 'use': c['use'],
                 'diff': {'easy': '好做', 'medium': '中等', 'hard': '难做'}.get(c['difficulty'], c['difficulty']),
                 'needs': c.get('needs_assets') or [], 'src': c['sources'][0], 'video': title, 'slug': slug,
                 'closest': c.get('closest_existing', ''), 'lib_name': ln, 'lib_img': li,
                 'frames': frames(c), 'note': NOTE.get(c['name'], '')})

html = open(os.path.join(HERE, 'review3_template.html')).read().replace('/*DATA*/[]', json.dumps(data, ensure_ascii=False))
open(OUT, 'w').write(html)
print(f'{len(data)} candidates -> {OUT} ({os.path.getsize(OUT) // 1024} KB)')
