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
USAGE = os.path.join(render.ROOT, 'library', 'usage.json')  # render.py logs which effects each finished video used
HOOK_WINDOW = 3.0


def meta_of(tid):
    f = os.path.join(render.effect_dir(tid), 'meta.json')
    return json.load(open(f)) if os.path.exists(f) else {}


BG_KEYS = ('background', 'bg')  # params that swap the backdrop; mono/dim are looks of the footage


def review_rows(proj):
    bf = os.path.join(proj, 'brief.md')
    if not os.path.exists(bf):
        return 0
    sec = next((x for x in re.split(r'^## ', open(bf).read(), flags=re.M) if x.startswith('审稿')), '')
    return sum(1 for ln in sec.splitlines() if ln.startswith('|') and not re.match(r'^\|[\s|:-]*$', ln)) - 1


def check_pack(proj, plan, tl, info, errs, warns):
    """With a style pack the pack is the menu and its "budget" is the rule: a few moves, chosen for the few sentences
    that need them, used consistently — not every move the pack has."""
    pk = json.load(open(os.path.join(render.PACKS, plan['pack'], 'pack.json')))
    b = {'moves': 4, 'backgrounds': 2, 'peaks': 2, 'cover': .45, 'gap': 3.0, 'base': [], **pk.get('budget', {})}
    menu = set(pk.get('effects', {}).get('signature', []) + pk.get('effects', {}).get('allowed', []))
    dur = tl['duration']
    why = {i: s.get('why_break') for i, s in enumerate(plan['shots'])}
    ordered = sorted(info, key=lambda x: x[0]['start'])
    moves = [(s, m) for s, m in ordered if m.get('weight') != '底层']
    for s, m in moves:
        if s['template'] not in menu:
            errs.append(f"{s['template']} 不在风格包「{plan['pack']}」的菜单里 → 换包里的动作，或先把它加进 pack.json")
    kinds = sorted({s['template'] for s, _ in moves if s['template'] not in b['base']})
    if len(kinds) > b['moves']:
        errs.append(f"用了 {len(kinds)} 种动作（{', '.join(kinds)}），这个包一条片子最多 {b['moves']} 种 → 只留最需要的，同一种作用用同一个画面")
    bgs = sorted({str(s['params'].get(k)) for s, _ in moves for k in BG_KEYS if s['params'].get(k)})
    if len(bgs) > b['backgrounds']:
        errs.append(f"换了 {len(bgs)} 种背景（{', '.join(bgs)}），这个包最多 {b['backgrounds']} 种 → 背景只在段落变化时换")
    peaks = [s for s, _ in moves if s['params'].get('peak')]
    if len(peaks) > b['peaks']:
        errs.append(f"大高光 {len(peaks)} 个（params 里 peak:true），最多 {b['peaks']} 个 → 只留全片最重要的那一两句")
    covered = sum(s['end'] - s['start'] for s, m in moves if s['template'] not in b['base'])
    if covered > b['cover'] * dur + 1e-6:
        errs.append(f"动作占了 {covered:.1f}s = {covered / dur:.0%}，这个包最多 {b['cover']:.0%} → 其余时间留给干净的人脸 + 字幕")
    for (a, _), (c, _) in zip(moves, moves[1:]):
        if a['template'] in b['base'] or c['template'] in b['base']:
            continue
        gap = c['start'] - a['end']
        if gap < -0.01:
            errs.append(f"{a['template']} 和 {c['template']} 重叠")
        elif gap < b['gap']:
            msg = f"{a['template']} → {c['template']} 只隔 {gap:.1f}s（这个包要 ≥ {b['gap']:.0f}s 人脸）"
            reason = next((why[i] for i, x in enumerate(plan['shots']) if why[i] and x.get('template') == c['template']), None)
            (warns if reason else errs).append(msg + (f'：{reason}' if reason else ''))
    # logic: one role, one look — the same purpose shouldn't get a different treatment each time
    role = {}
    for s, _ in moves:
        if s.get('purpose') and s['template'] not in b['base']:
            role.setdefault(s['purpose'], set()).add(s['template'])
    for r, ts in role.items():
        if len(ts) > 1:
            warns.append(f"同一种作用「{r}」用了 {len(ts)} 种画面（{', '.join(sorted(ts))}）→ 没有理由就统一成一种")
    if not any(s['start'] < HOOK_WINDOW for s, _ in moves):
        errs.append('开头 3 秒没有钩子（开场标题）')
    words = json.load(open(os.path.join(proj, 'work', 'words.json')))['words']
    n_sent = max(1, sum(1 for w in words if w['w'][-1:] in '.?!。？！'))
    if review_rows(proj) < n_sent:
        errs.append(f'brief.md「## 审稿」只有 {max(review_rows(proj), 0)} 行，稿子有 {n_sent} 句：每句先写清它在说什么、要不要配画面、为什么')
    return errs, warns, {'duration': dur, 'big': sum(1 for _, m in moves if m.get('weight') == '大'),
                         'small': sum(1 for _, m in moves if m.get('weight') == '小'), 'covered': covered,
                         'pack': plan['pack'], 'kinds': len(kinds)}


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

    plan = json.load(open(os.path.join(proj, shots_file)))
    if plan.get('pack'):
        return check_pack(proj, plan, tl, info, errs, warns)

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
    # logic: the script was read sentence by sentence before anything was picked (brief.md「## 审稿」, one row each)
    words = json.load(open(os.path.join(proj, 'work', 'words.json')))['words']
    n_sent = max(1, sum(1 for w in words if w['w'][-1:] in '.?!。？！'))
    bf = os.path.join(proj, 'brief.md')
    rows = 0
    if os.path.exists(bf):
        sec = re.split(r'^## ', open(bf).read(), flags=re.M)
        sec = next((x for x in sec if x.startswith('审稿')), '')
        rows = sum(1 for ln in sec.splitlines() if ln.startswith('|') and not re.match(r'^\|[\s|:-]*$', ln)) - 1
    if rows < n_sent:
        errs.append(f'brief.md「## 审稿」只有 {max(rows, 0)} 行，稿子有 {n_sent} 句：每句先写清它在说什么、要不要配画面、为什么，再挑动效')
    # variety: don't re-run the last two videos' picks (caption styles / push-ins excepted)
    if os.path.exists(USAGE):
        base = lambda n: re.sub(r'_(zh|en|ja|ko)$', '', n)  # language versions of one video are the same video
        me = base(os.path.basename(os.path.abspath(proj)))
        recent, seen = [], set()
        for r in reversed(json.load(open(USAGE))):
            if base(r['project']) != me and base(r['project']) not in seen:
                seen.add(base(r['project']))
                recent.append(r)
        recent = recent[:2]
        before = {t for r in recent for t in r['templates']}
        mine = [s['template'] for s, m in body]
        rep = [t for t in mine if t in before]
        if mine and len(rep) * 2 > len(mine):
            errs.append(f'和最近两条片子（{", ".join(r["project"] for r in recent)}）重复了 {len(rep)}/{len(mine)} 个：{", ".join(rep)} → 至少换掉一半，每个时刻看 tools/shortlist.py 的候选再挑')
        elif rep:
            warns.append(f'和最近两条片子重复：{", ".join(rep)}（确定是最合适的就留着，写进 why）')
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
    if st.get('pack'):
        print(f"{st['duration']:.0f}s · 风格包 {st['pack']} · {st['kinds']} 种动作 · 动作占 {st['covered']:.1f}s")
    else:
        print(f"{st['duration']:.0f}s · 大 {st['big']} · 小 {st['small']} · 挡脸 {st['covered']:.1f}s")
    for w in warns:
        print('  提醒', w)
    for e in errs:
        print('  ✗', e)
    print('通过' if not errs else f'{len(errs)} 处不合规则')
    sys.exit(1 if errs else 0)
