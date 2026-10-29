#!/usr/bin/env python3
"""Step 2 · rough cut: drop pauses, fillers and retakes; turn the recording into jump-cut segments.

  python3 scripts/plan_cut.py PROJECT [--gap 0.30] [--pad 0.12] [--drop 14-22,57-60] [--keep-fillers]
      reads  PROJECT/work/words.json
      writes PROJECT/work/edit.json      {"segments": [{"s", "e", "words": [i...], "zoom"}], "dropped": [...]}
             PROJECT/work/cut.txt        what survived, segment by segment (check it reads naturally)

--drop takes word-index ranges from work/transcript.txt (retakes, false starts, off-script chatter).
They can also live in PROJECT/cut.json as {"drop": ["14-22", "57-60"]} so reruns remember them.
"""
import argparse, json, os, re

FILLERS = {'um', 'uh', 'erm', 'uhm', 'hmm', 'mm', 'ah', '嗯', '呃', '额', '啊', '那个'}


def parse_ranges(specs):
    out = set()
    for spec in specs:
        for part in str(spec).split(','):
            part = part.strip()
            if not part:
                continue
            a, _, b = part.partition('-')
            out.update(range(int(a), int(b or a) + 1))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--gap', type=float, default=0.30, help='split where silence between words exceeds this')
    ap.add_argument('--pad', type=float, default=0.12, help='keep this much air on each side of a cut')
    ap.add_argument('--drop', action='append', default=[])
    ap.add_argument('--keep-fillers', action='store_true')
    ap.add_argument('--zooms', default='1.0,1.08', help='alternate punch-in per jump cut so cuts look intentional')
    a = ap.parse_args()
    proj = os.path.abspath(a.project)
    W = json.load(open(os.path.join(proj, 'work', 'words.json')))
    words = W['words']
    cfg_path = os.path.join(proj, 'cut.json')
    cfg = json.load(open(cfg_path)) if os.path.exists(cfg_path) else {}
    drop = parse_ranges(a.drop + cfg.get('drop', []))
    if not a.keep_fillers:
        drop |= {w['i'] for w in words if re.sub(r'[^\w]', '', w['w'].lower()) in FILLERS}
    gap, pad = cfg.get('gap', a.gap), cfg.get('pad', a.pad)
    zooms = [float(z) for z in str(cfg.get('zooms', a.zooms)).split(',')]

    # group kept words into phrases; a dropped word or a long pause starts a new phrase
    phrases, cur, prev = [], [], None
    for w in words:
        if w['i'] in drop:
            if cur:
                phrases.append(cur)
            cur, prev = [], None
            continue
        if cur and w['s'] - prev['e'] > gap:
            phrases.append(cur)
            cur = []
        cur.append(w)
        prev = w
    if cur:
        phrases.append(cur)

    segs = []
    for ph in phrases:
        s, e = max(0, ph[0]['s'] - pad), ph[-1]['e'] + pad
        if segs and s <= segs[-1]['e'] and ph[0]['i'] == segs[-1]['words'][-1] + 1:
            segs[-1]['e'] = e  # pads overlap and nothing was dropped between: keep as one take
            segs[-1]['words'] += [w['i'] for w in ph]
            continue
        if segs and s < segs[-1]['e']:  # dropped word in between but pads overlap: split at the middle
            mid = (segs[-1]['e'] + s) / 2
            segs[-1]['e'], s = mid, mid
        segs.append({'s': round(s, 3), 'e': round(e, 3), 'words': [w['i'] for w in ph]})
    for k, sg in enumerate(segs):
        sg['zoom'] = zooms[k % len(zooms)]

    src_dur = words[-1]['e'] if words else 0
    kept = sum(sg['e'] - sg['s'] for sg in segs)
    json.dump({'source': W['source'], 'lang': W.get('lang'), 'segments': segs, 'dropped': sorted(drop)},
              open(os.path.join(proj, 'work', 'edit.json'), 'w'), indent=1)
    sep = '' if W.get('lang') in ('zh', 'ja', 'ko') else ' '
    by_i = {w['i']: w for w in words}
    with open(os.path.join(proj, 'work', 'cut.txt'), 'w') as f:
        for k, sg in enumerate(segs):
            f.write(f"#{k:02d} [{sg['words'][0]}-{sg['words'][-1]}] {sg['e'] - sg['s']:5.2f}s z{sg['zoom']}  "
                    + sep.join(by_i[i]['w'] for i in sg['words']) + '\n')
    print(f"{len(segs)} segments, {kept:.1f}s kept of {src_dur:.1f}s ({len(drop)} words dropped) -> work/edit.json, work/cut.txt")


if __name__ == '__main__':
    main()
