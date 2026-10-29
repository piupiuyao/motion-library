#!/usr/bin/env python3
"""Step 5 · render: rough-cut segments + person matte + templates + captions -> vertical mp4.

  python3 scripts/render.py PROJECT                     -> PROJECT/out.mp4
  python3 scripts/render.py PROJECT --stills 2,7.5      -> PROJECT/stills/st_02.00.jpg ...
  python3 scripts/render.py PROJECT --sheet 1           -> PROJECT/stills/sheet.jpg (one frame per second)
  options: --out FILE  --from T  --to T  --preview (half resolution, faster)

PROJECT needs: raw.mp4, work/words.json (transcribe.py), work/edit.json (plan_cut.py), shots.json,
and work/matte_src/ (scripts/matte) when any shot uses a template that needs the cutout.
Needs: python3, playwright (Chromium), ffmpeg, pillow, numpy.
"""
import argparse, functools, http.server, json, os, re, shutil, subprocess, sys, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(SKILL))
EFFECTS = os.path.join(ROOT, 'library', 'talking-head', 'effects')  # templates live in the shared motion library
FPS = 30


def norm(w):
    return re.sub(r'[^\w]', '', w.lower())


def load_templates():
    out = {}
    for d in sorted(os.listdir(EFFECTS)):
        meta = os.path.join(EFFECTS, d, 'meta.json')
        if os.path.exists(meta):
            out[d] = json.load(open(meta))
    return out


def parse_range(spec):
    a, _, b = str(spec).partition('-')
    return int(a), int(b or a)


def head_focus(matte_dir, frame):
    """Rough face centre from the matte: middle of the top band of the person shape."""
    import numpy as np
    from PIL import Image
    p = os.path.join(matte_dir, f'{frame:06d}.png')
    if not os.path.exists(p):
        return None
    m = np.asarray(Image.open(p).convert('L')) > 128
    rows = np.where(m.any(axis=1))[0]
    if not len(rows):
        return None
    h, w = m.shape
    top = rows[0]
    band = m[top:top + int(h * .14)]
    xs = np.where(band.any(axis=0))[0]
    return [round(float(xs.mean()) / w, 3), round(min(.6, (top + h * .1) / h), 3)]


def build_timeline(proj, tmpl, shots_file='shots.json'):
    words = json.load(open(os.path.join(proj, 'work', 'words.json')))['words']
    edit = json.load(open(os.path.join(proj, 'work', 'edit.json')))
    plan = json.load(open(os.path.join(proj, shots_file)))
    by_i = {w['i']: w for w in words}
    segs, out_t, wout = [], 0.0, {}
    for g in edit['segments']:
        segs.append({'out': round(out_t, 3), 'src': g['s'], 'zoom': g.get('zoom', 1)})
        for i in g['words']:
            w = by_i[i]
            wout[i] = {'i': i, 'w': w['w'], 's': round(out_t + w['s'] - g['s'], 3), 'e': round(out_t + w['e'] - g['s'], 3)}
        out_t += g['e'] - g['s']
    dur = round(out_t, 3)

    # caption lines: break on pauses, sentence ends, or every 4 words, but never inside a highlighted phrase
    glue = set()
    for s in plan['shots']:
        for phrase in s.get('params', {}).get('keywords', []):
            toks = [norm(x) for x in phrase.split()]
            for j in range(len(words) - len(toks) + 1):
                if [norm(w['w']) for w in words[j:j + len(toks)]] == toks:
                    glue |= {words[x]['i'] for x in range(j + 1, j + len(toks))}
    lines, cur = [], []
    kept = [wout[i] for i in sorted(wout) if wout[i]['w']]
    for w in kept:
        if cur and w['i'] not in glue and (len(cur) >= 4 or w['s'] - cur[-1]['e'] > .35 or cur[-1]['w'][-1] in '.?!,;'):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    lines = [{'start': ln[0]['s'] - .05, 'end': ln[-1]['e'] + .05, 'words': ln} for ln in lines]
    for a, b in zip(lines, lines[1:]):
        if b['start'] - a['end'] < .5:
            a['end'] = b['start']  # no flicker between close lines

    matte_dir = os.path.join(proj, 'work', 'matte_src')
    shots = []
    for k, s in enumerate(plan['shots']):
        if s['template'] not in tmpl:
            sys.exit(f"shot {k}: unknown template '{s['template']}' (have: {', '.join(tmpl)})")
        a, b = parse_range(s['words'])
        ws = [wout[i] for i in range(a, b + 1) if i in wout]
        if not ws:
            sys.exit(f"shot {k}: words {s['words']} were all cut out")
        params = dict(s.get('params', {}))
        # keywords are phrases from the transcript ("say no"); each becomes one highlight group
        groups, keys = [], []
        for phrase in params.get('keywords', []):
            toks = [norm(x) for x in phrase.split()]
            for j in range(len(ws) - len(toks) + 1):
                if [norm(w['w']) for w in ws[j:j + len(toks)]] == toks:
                    g = ws[j:j + len(toks)]
                    groups.append({'text': phrase, 's': g[0]['s'], 'e': g[-1]['e'], 'idx': [w['i'] for w in g]})
                    keys += [w['i'] for w in g]
                    break
            else:
                sys.exit(f"shot {k}: keyword '{phrase}' is not in words {s['words']} (use the exact words she says)")
        start = max(0, ws[0]['s'] - .12)
        seg = max((g for g in segs if g['out'] <= start), key=lambda g: g['out'])
        src_frame = int((seg['src'] + start - seg['out']) * FPS) + 1
        shots.append({'template': s['template'], 'params': params, 'purpose': s.get('purpose'), 'start': round(start, 3),
                      'end': round(ws[-1]['e'] + .12, 3), 'words': ws, 'keys': keys, 'groups': groups,
                      'matte': bool(tmpl[s['template']].get('needs_matte')),
                      'focus': s.get('focus') or head_focus(matte_dir, src_frame) or [.5, .33]})
    # close small gaps so templates hand over cleanly; never overlap
    for a, b in zip(shots, shots[1:]):
        if b['start'] - a['end'] < .6:
            a['end'] = b['start'] = round((a['end'] + b['start']) / 2, 3) if b['start'] > a['end'] else b['start']
    if shots and dur - shots[-1]['end'] < .6:
        shots[-1]['end'] = dur
    need = sorted({s['template'] for s in shots})
    if any(s['matte'] for s in shots) and not os.path.isdir(matte_dir):
        sys.exit('a template needs the cutout: run  scripts/matte PROJECT/raw.mp4 PROJECT/work/matte_src  first')
    return {'fps': FPS, 'srcFps': FPS, 'duration': dur, 'skin': plan.get('skin', 'clean'),
            'captions': plan.get('captions', True), 'segments': segs, 'lines': lines, 'shots': shots,
            'templateIds': need, 'frames': 'work/frames_src', 'matte': 'work/matte_src'}, edit


def check_face_time(tl, tmpl, limit=10):
    """Hard rule: no more than 10 s of uninterrupted face. Only 素材/版式 templates break it up."""
    breaks = [(s['start'], s['end']) for s in tl['shots'] if tmpl[s['template']]['category'] in ('素材', '版式')]
    t, worst = 0.0, []
    for a, b in breaks + [(tl['duration'], tl['duration'])]:
        if a - t > limit:
            worst.append((t, a))
        t = max(t, b)
    for a, b in worst:
        print(f'!! {a:.1f}s–{b:.1f}s: {b - a:.1f}s of face with no 素材/版式 template (limit {limit}s)')


def serve(proj):
    class H(http.server.SimpleHTTPRequestHandler):
        def translate_path(self, path):
            path = path.split('?')[0]
            for pre, root in (('/proj/', proj), ('/lib/', EFFECTS)):
                if path.startswith(pre):
                    return os.path.join(root, *path[len(pre):].split('/'))
            return os.path.join(HERE, path.lstrip('/'))

        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def cut_audio(proj, edit, out):
    parts = ''.join(f"[0:a]atrim={g['s']}:{g['e']},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, g['e'] - g['s'] - .02)}:d=0.02[a{k}];"
                    for k, g in enumerate(edit['segments']))
    n = len(edit['segments'])
    filt = parts + ''.join(f'[a{k}]' for k in range(n)) + f'concat=n={n}:v=0:a=1[a]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(proj, 'raw.mp4'), '-filter_complex', filt,
                    '-map', '[a]', '-ar', '48000', out], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--out')
    ap.add_argument('--from', dest='t0', type=float, default=0)
    ap.add_argument('--to', dest='t1', type=float)
    ap.add_argument('--stills')
    ap.add_argument('--sheet', type=float)
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--shots', default='shots.json', help='shot list inside PROJECT (default shots.json)')
    a = ap.parse_args()
    proj = os.path.abspath(a.project)
    tmpl = load_templates()

    frames = os.path.join(proj, 'work', 'frames_src')
    if not os.path.isdir(frames):
        print('extracting source frames ...')
        os.makedirs(frames)
        subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(proj, 'raw.mp4'), '-q:v', '2',
                        os.path.join(frames, '%06d.jpg')], check=True)
    tl, edit = build_timeline(proj, tmpl, a.shots)
    check_face_time(tl, tmpl)
    json.dump(tl, open(os.path.join(proj, 'work', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    html = open(os.path.join(HERE, 'engine.html')).read().replace('/*TIMELINE*/null', json.dumps(tl, ensure_ascii=False))
    open(os.path.join(HERE, '.render.html'), 'w').write(html)
    srv = serve(proj)
    page_url = f'http://127.0.0.1:{srv.server_port}/.render.html'

    if a.stills or a.sheet:
        times = ([float(x) for x in a.stills.split(',')] if a.stills
                 else [i * a.sheet for i in range(int(tl['duration'] / a.sheet) + 1)])
    else:
        t1 = min(a.t1 or tl['duration'], tl['duration'])
        times = None
        ks = range(int(a.t0 * FPS), int(t1 * FPS))

    from playwright.sync_api import sync_playwright
    scale = .5 if a.preview else 1
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=scale)
        pg.on('console', lambda m: print('[js]', m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: print('[page error]', e))
        pg.goto(page_url)
        pg.evaluate('window.ready')
        stage = pg.locator('#stage')
        if times is not None:
            sd = os.path.join(proj, 'stills')
            os.makedirs(sd, exist_ok=True)
            paths = []
            for t in times:
                pg.evaluate(f'renderFrame({int(t * FPS)})')
                fp = os.path.join(sd, f'st_{t:05.2f}.jpg')
                stage.screenshot(path=fp, type='jpeg', quality=90)
                paths.append(fp)
            if a.sheet:
                from PIL import Image
                ims = [Image.open(x) for x in paths]
                tw, th = 216, 384
                cols = 8
                sheet = Image.new('RGB', (cols * tw, -(-len(ims) // cols) * th))
                for i, im in enumerate(ims):
                    sheet.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
                sheet.save(os.path.join(sd, 'sheet.jpg'), quality=88)
                print('->', os.path.join(sd, 'sheet.jpg'))
            else:
                print('->', '\n   '.join(paths))
            b.close()
            return
        out = a.out or os.path.join(proj, 'out.mp4')
        silent = out + '.video.mp4'
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', silent],
                              stdin=subprocess.PIPE)
        t_start = time.time()
        for n, k in enumerate(ks):
            pg.evaluate(f'renderFrame({k})')
            ff.stdin.write(stage.screenshot(type='jpeg', quality=92))
            if n and n % 150 == 0:
                el = time.time() - t_start
                print(f'  {n}/{len(ks)} frames  {el:.0f}s  (~{el / n * (len(ks) - n):.0f}s left)')
        ff.stdin.close()
        ff.wait()
        b.close()

    audio = os.path.join(proj, 'work', 'audio_cut.wav')
    cut_audio(proj, edit, audio)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', silent, '-ss', str(a.t0), '-i', audio, '-map', '0:v', '-map', '1:a',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], check=True)
    os.remove(silent)
    write_report(proj, tl, tmpl, out)


def write_report(proj, tl, tmpl, out):
    """Shot list next to the video: what each shot used and what it can be swapped for (from the library)."""
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import catalog
    es = catalog.load()
    by_id = {e['id']: e for e in es}
    rows = ['| # | 时间 | 说的话 | 这句在 | 用了 | 可以换成 |', '|---|---|---|---|---|---|']
    for k, s in enumerate(tl['shots']):
        e = by_id[s['template']]
        said = ' '.join(w['w'] for w in s['words'] if w['w'])
        def tag(x):
            needs = by_id[x['id']]['needs']
            return f"{x['name']} `{x['id']}`" + (f"（要准备{'、'.join(needs)}）" if needs else '')
        alt = '、'.join(tag(x) for x in catalog.alternatives(es, e, purpose=s.get('purpose'))) or '—'
        rows.append(f"| {k + 1} | {s['start']:.1f}–{s['end']:.1f}s | {said[:60]}{'…' if len(said) > 60 else ''} | "
                    f"{s.get('purpose') or '—'} | {e['name']} `{e['id']}` | {alt} |")
    fp = os.path.splitext(out)[0] + '_镜头清单.md'
    open(fp, 'w').write('\n'.join([f'# 镜头清单：{os.path.basename(out)}', '',
        '不满意哪个镜头：把 shots.json 里那一行的 `template` 改成右边任意一个（参数见库里它的 meta.json），再出片。',
        '右边只列能用在同一种句子上的动效；镜头表里没写 `purpose` 的，按模板本身的用途推荐。',
        '想看全部动效：打开库页面 `gallery/index.html`，按「句子用途」筛选。', ''] + rows) + '\n')
    print('->', out, '\n->', fp)
    print('->', out)


if __name__ == '__main__':
    main()
