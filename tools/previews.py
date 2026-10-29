#!/usr/bin/env python3
"""Render a few-second preview clip + poster for every ready talking-head effect, from the example project.

  python3 tools/previews.py               -> library/talking-head/effects/<id>/preview.mp4, poster.jpg
  python3 tools/previews.py push_in       -> just that one

Uses the first shot with that template in skills/talking-head-video/work_example/shots_showcase.json.
A new effect needs one shot there (or pass its own project with --proj/--shots).
"""
import argparse, json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = os.path.join(ROOT, 'skills', 'talking-head-video')
sys.path.insert(0, os.path.join(SKILL, 'scripts'))
import render  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('ids', nargs='*')
ap.add_argument('--proj', default=os.path.join(SKILL, 'work_example'))
ap.add_argument('--shots', default='shots_showcase.json')
ap.add_argument('--effects', help='folder of draft effects (default: the library)')
a = ap.parse_args()
if a.effects:
    render.EFFECTS = os.path.abspath(a.effects)
tmpl = render.load_templates()
tl, _ = render.build_timeline(a.proj, tmpl, a.shots)
first = {}
for s in tl['shots']:
    first.setdefault(s['template'], s)
for i in a.ids or sorted(tmpl):
    s = first.get(i)
    if not s:
        print(f'skip {i}: no shot uses it in {a.shots}')
        continue
    t0, t1 = max(0, s['start'] - .2), min(tl['duration'], s['end'] + .2)
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, 'p.mp4')
        subprocess.run([sys.executable, os.path.join(SKILL, 'scripts', 'render.py'), a.proj, '--shots', a.shots, '--preview',
                        '--from', str(t0), '--to', str(t1), '--out', raw] + (['--effects', render.EFFECTS] if a.effects else []),
                       check=True, stdout=subprocess.DEVNULL)
        d = os.path.join(render.EFFECTS, i)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-vf', 'scale=360:-2', '-c:v', 'libx264', '-crf', '27',
                        '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart',
                        os.path.join(d, 'preview.mp4')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str((t1 - t0) * .6), '-i', raw, '-frames:v', '1',
                        '-vf', 'scale=360:-2', '-q:v', '4', os.path.join(d, 'poster.jpg')], check=True)
    print(f'{i}: {t1 - t0:.1f}s -> {d}/preview.mp4')
