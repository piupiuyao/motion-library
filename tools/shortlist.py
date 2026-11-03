#!/usr/bin/env python3
"""Candidates for one moment, side by side, so the pick is made by looking, not by habit.

  python3 tools/shortlist.py 清单步骤                         -> every ready effect for that purpose
  python3 tools/shortlist.py 清单步骤 --style 简洁商务 --light  -> only that style; light cards first (bright footage)
  python3 tools/shortlist.py 引用证据 --project skills/talking-head-video/mengyao_zh
      (--project: leaves out effects whose material wasn't uploaded, marks the ones the last two videos used)

Writes one contact sheet of the effects' posters (id · name · group · weight on each) and prints its path and the list.
Look at the sheet, then write the top 3 (from different groups) and why one wins into brief.md.
⚠固定色 = the template has its own vivid colours that won't follow the brand: with a brand set, prefer the others.
"""
import argparse, json, os, re, subprocess, sys, tempfile

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, COLS = 216, 384, 6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('purpose', help='a purpose value from tags.json, e.g. 清单步骤')
    ap.add_argument('--style', help='keep effects that have this style (or 通用)')
    ap.add_argument('--project', help='project folder: drop effects needing material not uploaded, flag recent repeats')
    ap.add_argument('--light', action='store_true', help='bright footage / light brand: list light-card effects first')
    ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'shortlist.jpg'))
    a = ap.parse_args()
    cat = json.loads(subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'catalog.py'), '--json'],
                                    capture_output=True, text=True, check=True).stdout)
    tags = json.load(open(os.path.join(ROOT, 'tags.json')))
    if a.purpose not in tags['purpose']:
        sys.exit(f"purpose must be one of: {', '.join(k for k in tags['purpose'] if not k.startswith('_'))}")
    es = [e for e in cat if a.purpose in e['purpose']]
    if a.style:
        es = [e for e in es if a.style in e.get('style', []) or '通用' in e.get('style', [])]
    recent = set()
    if a.project:
        up = os.path.join(a.project, 'uploads')
        have = {d for d in os.listdir(up) if os.listdir(os.path.join(up, d))} if os.path.isdir(up) else set()
        es = [e for e in es if not e['needs_assets'] or any(x in have for x in e['needs_assets'])]
        usage = os.path.join(ROOT, 'library', 'usage.json')
        if os.path.exists(usage):
            base = lambda n: re.sub(r'_(zh|en|ja|ko)$', '', n)
            me = base(os.path.basename(os.path.abspath(a.project)))
            others, seen = [], set()
            for r in reversed(json.load(open(usage))):
                if base(r['project']) != me and base(r['project']) not in seen:
                    seen.add(base(r['project']))
                    others.append(r)
            recent = {t for r in others[:2] for t in r['templates']}
    def fixed(e):  # colours written into the template instead of the theme: won't follow the brand
        tj = os.path.join(ROOT, 'library', 'talking-head', 'effects', e['id'], 'template.js')
        cs = set(re.findall(r'#[0-9a-fA-F]{6}\b', open(tj).read())) if os.path.exists(tj) else set()
        def vivid(h):
            r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
            return max(r, g, b) - min(r, g, b) > .35
        return sorted(c for c in cs if vivid(c))
    for e in es:
        e['_fixed'] = fixed(e)
    dark = lambda e: any(k in (e.get('use_for', '') + e['name']) for k in ('深色', '压暗', '黑', '霓虹', '暗'))
    es.sort(key=lambda e: ((dark(e) if a.light else False), e['id'] in recent, e['group'], e['id']))
    if not es:
        sys.exit('no effect matches')
    rows = (len(es) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * W, rows * (H + 46)), '#f4f4f2')
    d = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for f in ('/System/Library/Fonts/Hiragino Sans GB.ttc', '/System/Library/Fonts/STHeiti Medium.ttc',
              '/System/Library/Fonts/PingFang.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'):
        if os.path.exists(f):
            font = ImageFont.truetype(f, 15)
            break
    for k, e in enumerate(es):
        x, y = k % COLS * W, k // COLS * (H + 46)
        p = os.path.join(ROOT, 'library', 'talking-head', 'effects', e['id'], 'poster.jpg')
        if os.path.exists(p):
            sheet.paste(Image.open(p).convert('RGB').resize((W - 6, H - 6)), (x + 3, y + 3))
        tag = ('  ↺最近用过' if e['id'] in recent else '') + ('  ⚠固定色' if e['_fixed'] else '')
        d.text((x + 4, y + H + 2), f"{e['id']}{tag}", fill='#c0392b' if tag else '#111', font=font)  # red = think twice
        d.text((x + 4, y + H + 22), f"{e['name']} · {e['group']} · {e['weight']}", fill='#555', font=font)
    sheet.save(a.out, quality=85)
    print(a.out)
    for e in es:
        print(f"{e['id']:<22} {e['name']:<10} 组:{e['group']:<8} {e['weight']} 风格:{'/'.join(e.get('style', []))}"
              f"{'  ↺最近用过' if e['id'] in recent else ''}{'  ⚠固定色 ' + ' '.join(e['_fixed'][:4]) if e['_fixed'] else ''}  {e['use_for']}")


if __name__ == '__main__':
    main()
