#!/usr/bin/env python3
"""Check an auto-picked shot list against the density rules before rendering (research/auto-edit-rules-draft.md).

  python3 scripts/check_plan.py PROJECT [--shots shots.json] [--level 极简|适中|丰富]
Prints every broken rule and exits 1 if any; the planner fixes the shot list and runs it again.
Effect facts (weight / group / covers_face / zone / needs_assets) come from each effect's meta.json.
Uploaded material lives in PROJECT/uploads/<截图|照片|B-roll视频|logo>/.
"""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import render  # noqa: E402

LEVELS = {  # small effects per 10 s · big effects per minute · share of time the face may be covered
    '极简': {'small_10s': 0, 'big_min': 0, 'face': .02},
    '适中': {'small_10s': 1, 'big_min': 3, 'face': .15},
    '丰富': {'small_10s': 1.5, 'big_min': 5, 'face': .25},
}
GAP_ANY, GAP_BIG = 3.0, 8.0  # seconds between two effects / between two big ones
HOOK_WINDOW = 3.0


def meta_of(tid):
    f = os.path.join(render.effect_dir(tid), 'meta.json')
    return json.load(open(f)) if os.path.exists(f) else {}


def check(proj, shots_file, level):
    render.use_project_effects(proj)
    tmpl = render.load_templates()
    tl, _ = render.build_timeline(proj, tmpl, shots_file)
    lim, dur = LEVELS[level], tl['duration']
    shots = [s for s in tl['shots'] if s.get('template')]
    errs, warns = [], []
    uploads = os.path.join(proj, 'uploads')
    have = {d for d in os.listdir(uploads) if os.listdir(os.path.join(uploads, d))} if os.path.isdir(uploads) else set()

    info = []
    for s in shots:
        m = meta_of(s['template'])
        if not m:
            errs.append(f"{s['template']}: not in the library")
            continue
        info.append((s, m))

    # hook: something in the first 3 s (except 极简, where the opening title is the only effect allowed)
    if not any(s['start'] < HOOK_WINDOW for s, _ in info):
        errs.append('开头 3 秒没有钩子（开场标题）')

    seen_t, seen_g = {}, {}
    for s, m in info:
        t, g = s['template'], m.get('group')
        if t in seen_t:
            errs.append(f'{t} 用了两次（{seen_t[t]:.1f}s 和 {s["start"]:.1f}s）')
        seen_t.setdefault(t, s['start'])
        if g and g in seen_g and seen_g[g] != t:
            errs.append(f'同一组「{g}」用了两个：{seen_g[g]} 和 {t}')
        seen_g.setdefault(g, t)
        mins = re.findall(r'[\d.]+', m.get('duration', ''))
        if mins and s['end'] - s['start'] < float(mins[0]) - .05:
            errs.append(f"{t} 只有 {s['end'] - s['start']:.1f}s，它至少要 {mins[0]}s 才演得完 → words 往后多包一句")
        for a in m.get('needs_assets', []):
            if a not in have:
                errs.append(f'{t} 需要素材「{a}」，但 uploads/{a}/ 里没有 → 换一个不要素材的')

    ordered = sorted(info, key=lambda x: x[0]['start'])
    for (a, ma), (b, mb) in zip(ordered, ordered[1:]):
        gap = b['start'] - a['end']
        if gap < -0.01:
            errs.append(f"{a['template']} 和 {b['template']} 重叠")
        elif gap < GAP_ANY and a['start'] >= HOOK_WINDOW:
            warns.append(f"{a['template']} → {b['template']} 只隔 {gap:.1f}s（建议 ≥ {GAP_ANY:.0f}s）")
    # a shot may break a spacing rule on purpose: "why_break": "reason" in the shots file turns that error into a note
    plan = json.load(open(os.path.join(proj, shots_file)))
    why = {s['template']: s['why_break'] for s in plan['shots'] if s.get('why_break')}
    bigs = [(s, m) for s, m in ordered if m.get('weight') == '大']
    for (a, _), (b, _) in zip(bigs, bigs[1:]):
        if b['start'] - a['end'] < GAP_BIG and (a['template'] in why or b['template'] in why):
            warns.append(f"{a['template']} → {b['template']} 故意挨着：{why.get(b['template']) or why.get(a['template'])}")
        elif b['start'] - a['end'] < GAP_BIG:
            errs.append(f"两个大动效太近：{a['template']} → {b['template']} 隔 {b['start'] - a['end']:.1f}s（要 ≥ {GAP_BIG:.0f}s，中间切回人脸）")

    # counts: the opening title is free; caption styles (底层) never count
    body = [(s, m) for s, m in ordered if m.get('weight') != '底层' and s['start'] >= HOOK_WINDOW]
    n_big = sum(1 for _, m in body if m.get('weight') == '大')
    n_small = sum(1 for _, m in body if m.get('weight') == '小')
    max_big = lim['big_min'] * max(dur, 30) / 60
    max_small = lim['small_10s'] * dur / 10
    if n_big > max_big + 1e-6:
        errs.append(f'大动效 {n_big} 个，{level}档 {dur:.0f} 秒最多 {max_big:.1f} 个')
    if n_small > max_small + 1e-6:
        errs.append(f'小动效 {n_small} 个，{level}档 {dur:.0f} 秒最多 {max_small:.1f} 个')
    covered = sum(s['end'] - s['start'] for s, m in ordered if m.get('covers_face'))
    if covered > lim['face'] * dur:
        errs.append(f'挡脸 {covered:.1f}s = {covered / dur:.0%}，{level}档最多 {lim["face"]:.0%}')
    return errs, warns, {'duration': dur, 'big': n_big, 'small': n_small, 'covered': covered}


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--shots', default='shots.json')
    ap.add_argument('--level', default='适中', choices=list(LEVELS))
    ap.add_argument('--effects', help='folder of draft effects (default: the library)')
    a = ap.parse_args()
    if a.effects:
        render.EFFECTS = os.path.abspath(a.effects)
    errs, warns, st = check(a.proj, a.shots, a.level)
    print(f"{st['duration']:.0f}s · 大 {st['big']} · 小 {st['small']} · 挡脸 {st['covered']:.1f}s")
    for w in warns:
        print('  提醒', w)
    for e in errs:
        print('  ✗', e)
    print('通过' if not errs else f'{len(errs)} 处不合规则')
    sys.exit(1 if errs else 0)
