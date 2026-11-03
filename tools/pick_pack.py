#!/usr/bin/env python3
"""Which style pack fits this video? Reads the script, the footage and the brand, scores every pack's "fit"
(library/packs/<id>/pack.json) and recommends the top two with reasons. The director still decides — write the pick
and why into brief.md「## 视觉系统」.

  python3 tools/pick_pack.py skills/talking-head-video/PROJECT [--tone premium|lively|calm|friendly|punchy|editorial]

Four things are weighed (SKILL.md「选包」): what the script does (numbers? list? opinion? emotion? product?),
the footage (bright/dark, room above the head for a top panel), the tone wanted, and the brand site's look.
"""
import argparse, glob, json, os, re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(ROOT, 'library', 'packs')

# script signals → content keys used in pack.json fit.content (each pack scores them 0–2)
SIGNALS = {
    'data': r'\d|%|\bhalf\b|\btwice\b|\bhours?\b|\bminutes?\b|\bpercent\b|\bmillion\b|\bbillion\b|\$|£|€|倍|小时|分钟|万|亿',
    'list': r'\b(first|second|third|then|finally|step)\b|\b\w+, \w+(,| and| or) \w+|第[一二三]|首先|然后|最后',
    'emotion': r'!|\b(hate|love|never|crazy|insane|awful|shouldn\'t|ugh)\b|崩溃|太|真的',
    'opinion': r'\b(i think|should|the truth|the problem|actually|most people|myth)\b|我觉得|其实|问题是',
    'promo': r'\b(that\'s what|meet|try|introducing|it\'s an?|for you)\b|就是为|试试',
    'tutorial': r'\b(how to|here\'s how|you can|tip|steps?)\b|怎么|教你|技巧',
    'news': r'\b(today|announced|report|new study|this week|launched)\b|今天|发布|报道',
    'story': r'\b(i was|when i|years ago|my )\b|那时候|有一次',
}


def script_text(proj):
    f = os.path.join(proj, 'script.txt')
    if os.path.exists(f):
        return open(f).read()
    w = os.path.join(proj, 'work', 'words.json')
    return ' '.join(x['w'] for x in json.load(open(w))['words']) if os.path.exists(w) else ''


def footage(proj):
    """Mean brightness of 8 frames, and how much room is above the head (from the cutout matte)."""
    frames = sorted(glob.glob(os.path.join(proj, 'work', 'frames_src', '*.jpg')))
    if not frames:
        return None, None
    pick = frames[::max(1, len(frames) // 8)][:8]
    lum = sum(sum(Image.open(f).convert('L').resize((54, 96)).getdata()) / (54 * 96) for f in pick) / len(pick) / 255
    tops = []
    for f in pick:
        m = os.path.join(proj, 'work', 'matte_src', os.path.basename(f).replace('.jpg', '.png'))
        if os.path.exists(m):
            im = Image.open(m).convert('L').resize((54, 96))
            rows = [y for y in range(96) if max(im.getpixel((x, y)) for x in range(54)) > 128]
            if rows:
                tops.append(rows[0] / 96)
    return lum, (sum(tops) / len(tops) if tops else None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--tone', help='tone wanted: premium, lively, calm, friendly, punchy, editorial, fun, clean')
    a = ap.parse_args()
    text = script_text(a.proj).lower()
    sentences = max(1, len(re.findall(r'[.?!。？！]', text)))
    feats = {k: min(1.0, len(re.findall(rx, text)) / sentences * 2) for k, rx in SIGNALS.items()}
    lum, head = footage(a.proj)
    look = None
    tf = os.path.join(a.proj, 'theme.json')
    if os.path.exists(tf) and str(json.load(open(tf)).get('source', '')).startswith('brand'):
        look = json.load(open(tf)).get('look') or 'dark'
    print('稿子信号（0–1）：' + '  '.join(f'{k} {v:.1f}' for k, v in sorted(feats.items(), key=lambda x: -x[1])))
    print(f"素材：亮度 {lum:.2f}" if lum is not None else '素材：没抽帧（先跑 prep.py）',
          f"· 头顶在画面 {head:.0%} 处" if head is not None else '', f"· 品牌官网 {look}" if look else '· 没给品牌')
    rows = []
    for pj in sorted(glob.glob(os.path.join(PACKS, '*', 'pack.json'))):
        pk = json.load(open(pj))
        fit = pk.get('fit')
        if not fit:
            continue
        score, why = 0.0, []
        for k, v in feats.items():
            w = fit['content'].get(k, 0)
            score += w * v
            if w == 2 and v >= .3:
                why.append({'data': '有数字', 'list': '有清单/并列', 'emotion': '情绪强', 'opinion': '讲观点',
                            'promo': '有产品出场', 'tutorial': '是教程', 'news': '是资讯', 'story': '有故事'}[k])
        if a.tone:
            if a.tone in fit.get('tone', []):
                score += 1.5
                why.append(f'调性 {a.tone}')
            else:
                score -= .5
        foot = fit.get('footage', {})
        if foot.get('needs_headroom') and head is not None and head < .18:
            score -= 1.5
            why.append('⚠ 头顶空间小，上方图解板会压到头')
        if look and look in fit.get('brand_look', []):
            score += .5
            why.append(f'品牌官网偏{"浅" if look == "light" else "深"}，搭')
        rows.append((score, pk['id'], pk.get('name', ''), why, fit))
    rows.sort(key=lambda r: -r[0])
    print('\n推荐（导演再按审稿表确认，写进 brief.md「## 视觉系统」）：')
    for i, (s, pid, name, why, fit) in enumerate(rows):
        mark = '★' if i < 2 else ' '
        print(f" {mark} {pid:<13} {name:<22} {s:4.1f}  {'、'.join(why) or '—'}")
        if i < 2:
            print(f"     适合：{fit['good_for']}\n     不适合：{fit['avoid']}")


if __name__ == '__main__':
    main()
