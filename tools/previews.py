#!/usr/bin/env python3
"""Render a few-second preview clip + poster for every ready talking-head effect, from the demo project.

  python3 tools/previews.py               -> library/talking-head/effects/<id>/preview.mp4, poster.jpg
  python3 tools/previews.py push_in       -> just that one

Uses the first shot with that template in skills/talking-head-video/demo_rumi/shots_*.json (files in name order:
shots_L1 … shots_R45). A new effect needs one shot in one of those files (or pass --proj / --shots FILE …).
"""
import argparse, glob, json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = os.path.join(ROOT, 'skills', 'talking-head-video')
sys.path.insert(0, os.path.join(SKILL, 'scripts'))
import render  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('ids', nargs='*')
ap.add_argument('--proj', default=os.path.join(SKILL, 'demo_rumi'))
ap.add_argument('--shots', nargs='+', help='shots files in the project (default: every shots_*.json there)')
ap.add_argument('--effects', help='folder of draft effects (default: the library)')
a = ap.parse_args()
if a.effects:
    render.EFFECTS = os.path.abspath(a.effects)
tmpl = render.load_templates()
files = a.shots or sorted(os.path.basename(p) for p in glob.glob(os.path.join(a.proj, 'shots_*.json')))
first = {}  # template id -> (shots file, shot, timeline)
for fn in files:
    if not any(s.get('template') in tmpl and s['template'] not in first for s in json.load(open(os.path.join(a.proj, fn)))['shots']):
        continue
    tl, _ = render.build_timeline(a.proj, tmpl, fn)
    for s in tl['shots']:
        first.setdefault(s['template'], (fn, s, tl))
for i in a.ids or sorted(tmpl):
    if i not in first:
        print(f'skip {i}: no shot uses it in {a.proj}/{"|".join(files)}')
        continue
    fn, s, tl = first[i]
    # a little plain talking head before/after, but never a sliver of the neighbouring effect
    prev_end = max([o['end'] for o in tl['shots'] if o.get('template') and o['end'] <= s['start']], default=0)
    next_start = min([o['start'] for o in tl['shots'] if o.get('template') and o['start'] >= s['end']], default=tl['duration'])
    t0, t1 = max(0, prev_end, s['start'] - .2), min(tl['duration'], next_start, s['end'] + .2)
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, 'p.mp4')
        subprocess.run([sys.executable, os.path.join(SKILL, 'scripts', 'render.py'), a.proj, '--shots', fn, '--preview',
                        '--from', str(t0), '--to', str(t1), '--out', raw] + (['--effects', render.EFFECTS] if a.effects else []),
                       check=True, stdout=subprocess.DEVNULL)
        d = os.path.join(render.EFFECTS, i)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-vf', 'scale=360:-2', '-c:v', 'libx264', '-crf', '27',
                        '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart',
                        os.path.join(d, 'preview.mp4')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str((t1 - t0) * .6), '-i', raw, '-frames:v', '1',
                        '-vf', 'scale=360:-2', '-q:v', '4', os.path.join(d, 'poster.jpg')], check=True)
    print(f'{i}: {t1 - t0:.1f}s -> {d}/preview.mp4')
