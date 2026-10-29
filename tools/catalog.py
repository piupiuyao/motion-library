#!/usr/bin/env python3
"""Library catalog: check every meta.json against tags.json, then write the overview files.

  python3 tools/catalog.py           -> library/README.md (tables) + gallery/data.js (for the gallery page)
  python3 tools/catalog.py --json    -> print all entries as JSON (for an agent picking effects)
  python3 tools/catalog.py --alt ID  -> print the ready effects that can replace ID (same video type, shares a purpose)

Library layout (video types are kept strictly apart, one folder each):
  library/<video_type>/effects/<id>/   status=ready: meta.json + template.js + preview.mp4 + poster.jpg
  library/<video_type>/refs/<id>/      status=reference: meta.json + preview.mp4 and/or poster.jpg
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, 'library')
TAGS = json.load(open(os.path.join(ROOT, 'tags.json')))
MULTI = ('purpose', 'style', 'needs')
TYPE_NAME = {'talking-head': '口播', 'launch': '产品发布片'}


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
                if m.get('category') not in TAGS['category']: errs.append(f'{where}: category "{m.get("category")}" not in tags.json')
                for k in MULTI:
                    bad = [x for x in m.get(k, []) if x not in TAGS[k]]
                    if bad: errs.append(f'{where}: {k} {bad} not in tags.json')
                if status == 'ready':
                    for need in ('template.js', 'meta.json'):
                        if not os.path.exists(os.path.join(d, i, need)): errs.append(f'{where}: missing {need}')
                    if not m.get('purpose'): errs.append(f'{where}: ready effects need at least one purpose')
                base = f'library/{vt}/{kind}/{i}/'
                m['_dir'] = base
                m['_preview'] = base + 'preview.mp4' if os.path.exists(os.path.join(d, i, 'preview.mp4')) else ''
                m['_poster'] = base + 'poster.jpg' if os.path.exists(os.path.join(d, i, 'poster.jpg')) else ''
                out.append(m)
    if errs:
        sys.exit('tag errors:\n  ' + '\n  '.join(errs))
    return out


def alternatives(entries, e, n=3, purpose=None):
    """Ready effects of the same video type that share a purpose with e; more shared purposes first, other styles preferred.
    purpose: what this particular sentence is doing (from shots.json) -- then only effects made for that purpose count."""
    cands = []
    want = {purpose} if purpose else set(e.get('purpose', []))
    for x in entries:
        if x['id'] == e['id'] or x['status'] != 'ready' or x['video_type'] != e['video_type']:
            continue
        shared = set(x.get('purpose', [])) & want
        if shared:
            cands.append((-len(shared), x.get('style') == e.get('style'), x['id'], x, sorted(shared)))
    cands.sort(key=lambda c: c[:3])
    out = [{'id': c[3]['id'], 'name': c[3]['name'], 'shared': c[4]} for c in cands[:n]]
    # not enough with a shared purpose: fall back to the same category
    for x in entries:
        if len(out) >= n or purpose:
            break
        if (x['status'] == 'ready' and x['video_type'] == e['video_type'] and x['id'] != e['id']
                and x['category'] == e['category'] and x['id'] not in {o['id'] for o in out}):
            out.append({'id': x['id'], 'name': x['name'], 'shared': []})
    return out


def write_readme(es):
    out = ['# 动效库总表', '', '由 `tools/catalog.py` 生成，别手改。标签取值见 `tags.json`。', '']
    for vt in TAGS['video_type']:
        group = [e for e in es if e['video_type'] == vt]
        if not group:
            continue
        ready = [e for e in group if e['status'] == 'ready']
        refs = [e for e in group if e['status'] == 'reference']
        out += [f'## {TYPE_NAME.get(vt, vt)}（`{vt}`）：能出片 {len(ready)} 个，参考 {len(refs)} 条', '']
        if ready:
            out += ['### 速查：这句话在说什么 → 用哪个', '', '| 句子用途 | 能出片的动效 |', '|---|---|']
            for p in TAGS['purpose']:
                names = [f"{e['name']}（`{e['id']}`）" for e in ready if p in e['purpose']]
                if names:
                    out.append(f'| {p} | {"、".join(names)} |')
            out += ['', '### 能出片', '', '| 动效 | 类别 | 用途 | 风格 | 需要 | 时长 | 可以换成 |', '|---|---|---|---|---|---|---|']
            for e in ready:
                alt = '、'.join(a['name'] for a in alternatives(es, e)) or '—'
                out.append(f"| **{e['name']}** `{e['id']}` | {e['category']} | {'、'.join(e['purpose'])} | {'、'.join(e['style'])} | "
                           f"{'、'.join(e['needs']) or '—'} | {e.get('duration', '')} | {alt} |")
            out += ['', '参数见各自的 `meta.json`。', '']
        if refs:
            out += ['### 参考（只拆了，还没做成模板）', '', '| 条目 | 类别 | 用途 | 风格 | 出处 |', '|---|---|---|---|---|']
            for e in refs:
                src = e.get('source', {})
                s = src.get('credit') or src.get('from', '')
                if src.get('url'):
                    s = f"[{s or '链接'}]({src['url']})"
                out.append(f"| {e['name']} `{e['id']}` | {e['category']} | {'、'.join(e.get('purpose', [])) or '—'} | "
                           f"{'、'.join(e.get('style', []))} | {s} |")
            out.append('')
    open(os.path.join(LIB, 'README.md'), 'w').write('\n'.join(out))


def main():
    es = load()
    if '--json' in sys.argv:
        print(json.dumps(es, ensure_ascii=False, indent=1))
        return
    if '--alt' in sys.argv:
        i = sys.argv[sys.argv.index('--alt') + 1]
        e = next((x for x in es if x['id'] == i), None) or sys.exit(f'no entry {i}')
        print(json.dumps(alternatives(es, e), ensure_ascii=False, indent=1))
        return
    for e in es:
        e['_alt'] = alternatives(es, e)
    write_readme(es)
    os.makedirs(os.path.join(ROOT, 'gallery'), exist_ok=True)
    with open(os.path.join(ROOT, 'gallery', 'data.js'), 'w') as f:
        f.write('// generated by tools/catalog.py\nwindow.LIB = ' +
                json.dumps({'tags': TAGS, 'types': TYPE_NAME, 'entries': es}, ensure_ascii=False) + ';\n')
    print(f'{len(es)} entries ok -> library/README.md, gallery/data.js')
    for vt in TAGS['video_type']:
        print(f"  {vt}: ready {sum(1 for e in es if e['video_type'] == vt and e['status'] == 'ready')}, "
              f"reference {sum(1 for e in es if e['video_type'] == vt and e['status'] == 'reference')}")


if __name__ == '__main__':
    main()
