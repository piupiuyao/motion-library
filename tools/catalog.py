#!/usr/bin/env python3
"""Library catalog: check every meta.json against tags.json, then write the overview files.

  python3 tools/catalog.py           -> library/README.md (by purpose -> group) + gallery/data.js (for the gallery page)
  python3 tools/catalog.py --json    -> compact list for a planner picking effects (one entry per line)
  python3 tools/catalog.py --full    -> every field of every entry
  python3 tools/catalog.py --alt ID  -> effects that can replace ID (same group first, then same purpose)

Library layout (video types are kept strictly apart, one folder each):
  library/<video_type>/effects/<id>/   meta.json + template.js + preview.mp4 + poster.jpg
Whole-film inspiration that is not yet broken into effects lives outside the library, in inspiration/.

Tag fields every ready effect carries (values only from tags.json):
  purpose 1-3 · style 1-2 (first = main) · weight · covers_face (bool) · zone · group · needs · needs_assets · category (browsing label)
  plus name, duration, use_for (one Chinese line) and fills {param: "必填：…" | "可选：…"} (params the planner fills from the speech).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, 'library')
TAGS = json.load(open(os.path.join(ROOT, 'tags.json')))
TYPE_NAME = {'talking-head': '口播', 'launch': '产品发布片'}
SINGLE = ('category', 'weight', 'zone', 'group')
MULTI = ('purpose', 'needs', 'needs_assets')
PLANNER = ('id', 'name', 'purpose', 'weight', 'covers_face', 'zone', 'group', 'style', 'fills', 'needs', 'needs_assets', 'duration', 'use_for')


def check(m, where, d, status):
    errs = []
    for k in SINGLE:
        if m.get(k) not in TAGS[k]:
            errs.append(f'{where}: {k} "{m.get(k)}" not in tags.json')
    for k in MULTI:
        v = m.get(k)
        if not isinstance(v, list):
            errs.append(f'{where}: {k} must be a list')
            continue
        bad = [x for x in v if x not in TAGS[k]]
        if bad: errs.append(f'{where}: {k} {bad} not in tags.json')
        if len(set(v)) != len(v): errs.append(f'{where}: {k} has duplicates')
    if status != 'ready':
        return errs
    if not 1 <= len(m.get('purpose') or []) <= 3: errs.append(f'{where}: purpose needs 1-3 values')
    st = m.get('style')
    if not isinstance(st, list) or not 1 <= len(st) <= 2 or any(x not in TAGS['style'] for x in st):
        errs.append(f'{where}: style needs 1-2 values from tags.json')
    if not isinstance(m.get('covers_face'), bool): errs.append(f'{where}: covers_face must be true/false')
    for k in ('name', 'duration', 'use_for'):
        if not isinstance(m.get(k), str) or not m[k].strip(): errs.append(f'{where}: {k} must be a non-empty string')
    params, fills = m.get('params', {}), m.get('fills')
    if not isinstance(fills, dict):
        errs.append(f'{where}: fills must be an object')
    else:
        for p, how in fills.items():
            if p not in params: errs.append(f'{where}: fills.{p} is not one of its params')
            if not re.match(r'^(必填|可选)：', str(how)): errs.append(f'{where}: fills.{p} must start with 必填： or 可选：')
    for need in ('template.js', 'meta.json'):
        if not os.path.exists(os.path.join(d, need)): errs.append(f'{where}: missing {need}')
    tj = os.path.join(d, 'template.js')
    if os.path.exists(tj) and not re.search(rf'TEMPLATES\.{re.escape(m.get("id", ""))}\s*=', open(tj).read()):
        errs.append(f'{where}: template.js does not define TEMPLATES.{m.get("id")}')
    return errs


def load():
    out, errs = [], []
    for vt in sorted(os.listdir(LIB)):
        for kind, status in (('effects', 'ready'), ('refs', 'reference')):
            d = os.path.join(LIB, vt, kind)
            if not os.path.isdir(d):
                continue
            for i in sorted(os.listdir(d)):
                f = os.path.join(d, i, 'meta.json')
                if not os.path.exists(f):
                    continue
                m = json.load(open(f))
                where = f'{vt}/{kind}/{i}'
                # folder decides video type and status, so the two can never drift apart
                if m.get('id') != i: errs.append(f'{where}: id "{m.get("id")}" != folder name')
                if m.get('video_type') != vt: errs.append(f'{where}: video_type must be "{vt}" (its folder)')
                if m.get('status') != status: errs.append(f'{where}: status must be "{status}" in {kind}/')
                if vt not in TAGS['video_type']: errs.append(f'{where}: folder {vt} is not a video_type in tags.json')
                errs += check(m, where, os.path.join(d, i), status)
                base = f'library/{vt}/{kind}/{i}/'
                m['_dir'] = base
                m['_preview'] = base + 'preview.mp4' if os.path.exists(os.path.join(d, i, 'preview.mp4')) else ''
                m['_poster'] = base + 'poster.jpg' if os.path.exists(os.path.join(d, i, 'poster.jpg')) else ''
                out.append(m)
    was = [m['was'] for m in out if m.get('was')]
    dup = sorted({w for w in was if was.count(w) > 1})
    if dup: errs.append(f'"was" used twice: {dup}')
    if errs:
        sys.exit('tag errors:\n  ' + '\n  '.join(errs))
    return out


def alternatives(entries, e, n=3, purpose=None):
    """Ready effects of the same video type that can stand in for e.
    Same group first (look-alikes: a video uses only one of them anyway), then effects sharing a purpose
    (purpose = what this particular sentence is doing, from shots.json -- then only that purpose counts),
    same weight before other weights, more shared purposes first."""
    want = {purpose} if purpose else set(e.get('purpose', []))
    pool = [x for x in entries if x['id'] != e['id'] and x['status'] == 'ready' and x['video_type'] == e['video_type']]
    ranked = []
    for x in pool:
        shared = sorted(set(x.get('purpose', [])) & want)
        same = x.get('group') == e.get('group')
        if purpose and not shared and not (same and purpose not in TAGS['purpose']):
            continue
        if not same and not shared:
            continue
        ranked.append((not same, -len(shared), x.get('weight') != e.get('weight'), x['id'], x, shared, same))
    ranked.sort(key=lambda c: c[:4])
    return [{'id': c[4]['id'], 'name': c[4]['name'], 'shared': c[5], 'same_group': c[6]} for c in ranked[:n]]


def planner_view(es):
    return [{k: e.get(k) for k in PLANNER} for e in es if e['status'] == 'ready']


def tag_cell(e):
    bits = []
    if e.get('needs'): bits.append('、'.join(e['needs']))
    if e.get('needs_assets'): bits.append('素材：' + ' / '.join(e['needs_assets']))
    return '；'.join(bits) or '—'


def write_readme(es):
    out = ['# 动效库总表', '', '由 `tools/catalog.py` 生成，别手改。标签取值和含义见 `tags.json`。', '',
           '- **用途**：这句话在做什么，挑动效先看它。一个动效最多 3 个用途。',
           '- **分量**：底层（不算数量）/ 小（脸完整露出）/ 大（全屏、盖脸、转场、版式大变）。',
           '- **组**：长得像的归一组，一条视频每组最多用一个。',
           '- **位置**：上方 / 中部 / 胸口 / 下方 / 全屏 / 环绕 / 整体（只动镜头或调色），同一时间别两个东西挤一个位置。', '']
    for vt in TAGS['video_type']:
        group = [e for e in es if e['video_type'] == vt]
        if not group:
            continue
        ready = [e for e in group if e['status'] == 'ready']
        if not ready:
            continue
        cnt = {w: sum(e['weight'] == w for e in ready) for w in TAGS['weight']}
        out += [f'## {TYPE_NAME.get(vt, vt)}（`{vt}`）：{len(ready)} 个动效，{len({e["group"] for e in ready})} 组', '',
                '分量：' + ' · '.join(f'{w} {n}' for w, n in cnt.items()), '']
        out += ['### 按用途 → 组', '']
        for p, meaning in TAGS['purpose'].items():
            hits = [e for e in ready if p in e['purpose']]
            if not hits:
                continue
            out += [f'#### {p}（{len(hits)}）', '', f'{meaning}', '', '| 组 | 动效 |', '|---|---|']
            for g in TAGS['group']:
                gs = [e for e in hits if e['group'] == g]
                if gs:
                    out.append(f'| {g} | ' + '、'.join(f"{e['name']} `{e['id']}`（{e['weight']}{'·挡脸' if e['covers_face'] else ''}）" for e in gs) + ' |')
            out.append('')
        out += ['### 按组', '', '| 组 | 动效 | 说明 |', '|---|---|---|']
        for g, meaning in TAGS['group'].items():
            gs = [e for e in ready if e['group'] == g]
            if gs:
                ids = '、'.join('`' + e['id'] + '`' for e in gs)
                out.append(f'| {g} | {ids} | {meaning} |')
        out += ['', '### 全部动效', '', '| 动效 | 用途 | 分量 | 挡脸 | 位置 | 组 | 前提/素材 | 时长 | 什么时候用 |',
                '|---|---|---|---|---|---|---|---|---|']
        for e in sorted(ready, key=lambda e: (list(TAGS['group']).index(e['group']), e['id'])):
            out.append(f"| **{e['name']}** `{e['id']}` | {'、'.join(e['purpose'])} | {e['weight']} | {'是' if e['covers_face'] else '—'} | "
                       f"{e['zone']} | {e['group']} | {tag_cell(e)} | {e['duration']} | {e['use_for']} |")
        out += ['', '要填的参数见 `--json` 的 `fills`，全部参数见各自的 `meta.json`。', '']
    open(os.path.join(LIB, 'README.md'), 'w').write('\n'.join(out))


def main():
    es = load()
    if '--json' in sys.argv:
        rows = planner_view(es)
        print('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in rows) + '\n]')
        return
    if '--full' in sys.argv:
        print(json.dumps(es, ensure_ascii=False, indent=1))
        return
    if '--alt' in sys.argv:
        i = sys.argv[sys.argv.index('--alt') + 1]
        e = next((x for x in es if x['id'] == i), None) or sys.exit(f'no entry {i}')
        print(json.dumps(alternatives(es, e), ensure_ascii=False, indent=1))
        return
    used = {e['group'] for e in es}
    empty = [g for g in TAGS['group'] if g not in used]
    if empty:
        print('note: groups with no effect yet:', '、'.join(empty))
    for e in es:
        e['_alt'] = alternatives(es, e)
    write_readme(es)
    os.makedirs(os.path.join(ROOT, 'gallery'), exist_ok=True)
    with open(os.path.join(ROOT, 'gallery', 'data.js'), 'w') as f:
        f.write('// generated by tools/catalog.py\nwindow.LIB = ' +
                json.dumps({'tags': TAGS, 'types': TYPE_NAME, 'entries': es}, ensure_ascii=False) + ';\n')
    ready = [e for e in es if e['status'] == 'ready']
    cnt = ' · '.join(f"{w} {sum(e['weight'] == w for e in ready)}" for w in TAGS['weight'])
    print(f'{len(es)} entries ok ({len(used)} groups; {cnt}) -> library/README.md, gallery/data.js')


if __name__ == '__main__':
    main()
