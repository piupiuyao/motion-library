#!/usr/bin/env python3
"""One-click edit, part 1: get a raw talking-head clip ready and print what the planner needs to pick effects.

  python3 scripts/prep.py PROJECT [--lang en] [--prompt "names"] [--brand https://…] [--level 适中]
Runs (skipping what's already done): transcribe → rough cut → frames → cutout → accent colour.
Then prints: the cut script sentence by sentence (word numbers + seconds), the uploaded material, the limits for the
level, and the effects that can be used (effects whose material wasn't uploaded are left out).
The planner (the agent running this skill) writes PROJECT/shots.json from that, then runs check_plan.py and render.py.
"""
import argparse, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import check_plan  # noqa: E402

SLOTS = ('截图', '照片', 'B-roll视频', 'logo')


def run(*cmd):
    print('·', ' '.join(str(c) for c in cmd[:3]), '…', flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--lang')
    ap.add_argument('--prompt')
    ap.add_argument('--brand')
    ap.add_argument('--level', default='适中', choices=list(check_plan.LEVELS))
    a = ap.parse_args()
    p = os.path.abspath(a.proj)
    raw, work = os.path.join(p, 'raw.mp4'), os.path.join(p, 'work')
    if not os.path.exists(raw):
        sys.exit(f'put the clip at {raw} first')
    for s in SLOTS:  # the upload slots, so the user knows where material goes
        os.makedirs(os.path.join(p, 'uploads', s), exist_ok=True)

    if not os.path.exists(os.path.join(work, 'words.json')):
        run(sys.executable, os.path.join(HERE, 'transcribe.py'), raw, *(['--lang', a.lang] if a.lang else []),
            *(['--prompt', a.prompt] if a.prompt else []))
    if not os.path.exists(os.path.join(work, 'edit.json')):
        run(sys.executable, os.path.join(HERE, 'plan_cut.py'), p)
    frames = os.path.join(work, 'frames_src')
    if not os.path.isdir(frames):
        os.makedirs(frames)
        run('ffmpeg', '-v', 'error', '-i', raw, '-q:v', '2', os.path.join(frames, '%06d.jpg'))
    matte = os.path.join(work, 'matte_src')
    if not os.path.isdir(matte) or len(os.listdir(matte)) < len(os.listdir(frames)) * .95:
        run(os.path.join(HERE, 'matte'), raw, matte)
    if a.brand or not os.path.exists(os.path.join(p, 'theme.json')):
        run(sys.executable, os.path.join(HERE, 'theme.py'), p, *(['--brand', a.brand] if a.brand else []))

    # uploaded B-roll videos → frames, which is what effects take: {"frames": "uploads/B-roll视频/<name>", "fps": 30, "count": N}
    broll = os.path.join(p, 'uploads', 'B-roll视频')
    for f in sorted(os.listdir(broll)):
        stem, ext = os.path.splitext(f)
        if ext.lower() in ('.mp4', '.mov', '.m4v', '.webm') and not os.path.isdir(os.path.join(broll, stem)):
            os.makedirs(os.path.join(broll, stem))
            run('ffmpeg', '-v', 'error', '-i', os.path.join(broll, f), '-t', '8', '-vf', 'fps=30,scale=1080:-2', '-q:v', '3',
                os.path.join(broll, stem, '%06d.jpg'))
    clips = {d: len(os.listdir(os.path.join(broll, d))) for d in sorted(os.listdir(broll)) if os.path.isdir(os.path.join(broll, d))}

    # ---- what the planner reads ----
    edit = json.load(open(os.path.join(work, 'edit.json')))
    words = json.load(open(os.path.join(work, 'words.json')))['words']
    out_t, lines = 0.0, []
    for seg in edit['segments']:
        ws = seg['words']
        lines.append(f"[{ws[0]}-{ws[-1]}] {out_t:5.1f}s  " + ' '.join(words[i]['w'] for i in ws))
        out_t += seg['e'] - seg['s']
    have = [s for s in SLOTS if os.listdir(os.path.join(p, 'uploads', s))]
    lim = check_plan.LEVELS[a.level]
    cat = json.loads(subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'catalog.py'), '--json'],
                                    capture_output=True, text=True, check=True).stdout)
    usable = [e for e in cat if not e['needs_assets'] or any(x in have for x in e['needs_assets'])]
    theme = json.load(open(os.path.join(p, 'theme.json')))

    print('\n==== 台词（粗剪后，[词编号] 成片里的秒数）====')
    print('\n'.join(lines))
    print(f'\n==== 成片约 {out_t:.0f} 秒 · 档位 {a.level} ====')
    print(f"大动效最多 {lim['big_min'] * max(out_t, 30) / 60:.1f} 个 · 小动效最多 {lim['small_10s'] * out_t / 10:.1f} 个 · "
          f"挡脸最多 {lim['face']:.0%} · 开头 3 秒一个钩子（不算数） · 底层（字幕样式/推近）不算数")
    print(f"颜色：{theme}")
    counts = ', '.join('%s(%d)' % (s, len(os.listdir(os.path.join(p, 'uploads', s)))) for s in have)
    print('已上传素材：' + (counts or '无'))
    for s in have:
        if s == 'B-roll视频':
            for d, n in clips.items():
                print(f'  {{"frames": "uploads/B-roll视频/{d}", "fps": 30, "count": {n}}}')
        else:
            for f in sorted(os.listdir(os.path.join(p, 'uploads', s))):
                print(f'  uploads/{s}/{f}')
    print(f'\n==== 能用的动效 {len(usable)} 个（没传素材的已去掉）====')
    for e in usable:
        print(json.dumps(e, ensure_ascii=False, separators=(',', ':')))


if __name__ == '__main__':
    main()
