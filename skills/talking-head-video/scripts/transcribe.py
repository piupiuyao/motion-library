#!/usr/bin/env python3
"""Step 1 · transcribe the talking-head recording to word-level timestamps.

  python3 scripts/transcribe.py PROJECT/raw.mp4 [--model medium] [--lang en|zh]
      -> PROJECT/work/words.json   [{"i": 0, "w": "Hello", "s": 0.52, "e": 0.81, "p": 0.98}, ...]
      -> PROJECT/work/transcript.txt  (readable, with word indices — use these indices in shots.json)

Uses local openai-whisper (word_timestamps). No API key, nothing uploaded.
"""
import argparse, json, os, re

NOISE = re.compile(r'^[\[\(].*[\]\)]$')  # (static) [music] ...


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--model', default='medium')
    ap.add_argument('--lang')
    ap.add_argument('--prompt', help='spelling hints: product names, people, jargon')
    a = ap.parse_args()
    import whisper
    proj = os.path.dirname(os.path.abspath(a.video))
    work = os.path.join(proj, 'work')
    os.makedirs(work, exist_ok=True)
    model = whisper.load_model(a.model)
    r = model.transcribe(a.video, word_timestamps=True, language=a.lang, initial_prompt=a.prompt,
                         condition_on_previous_text=False, fp16=False)
    words = []
    for seg in r['segments']:
        for w in seg.get('words', []):
            t = w['word'].strip()
            if not t or NOISE.match(t):
                continue
            words.append({'i': len(words), 'w': t, 's': round(w['start'], 3), 'e': round(w['end'], 3),
                          'p': round(w.get('probability', 1), 3)})
    json.dump({'source': os.path.abspath(a.video), 'lang': r.get('language'), 'words': words},
              open(os.path.join(work, 'words.json'), 'w'), ensure_ascii=False, indent=1)
    write_transcript(words, r.get('language'), os.path.join(work, 'transcript.txt'))
    print(f"{len(words)} words, lang={r.get('language')} -> {work}/words.json, transcript.txt")


def write_transcript(words, lang, path):
    """One line per pause-separated phrase: '[12] 3.40s  word word word'. Low-confidence words get a '?'."""
    sep = '' if lang in ('zh', 'ja', 'ko') else ' '
    lines, cur = [], []
    for w in words:
        if cur and w['s'] - cur[-1]['e'] > 0.3:
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    with open(path, 'w') as f:
        for ln in lines:
            txt = sep.join(f"{w['w']}{'?' if w['p'] < 0.5 else ''}" for w in ln)
            f.write(f"[{ln[0]['i']}-{ln[-1]['i']}] {ln[0]['s']:6.2f}s  {txt}\n")


if __name__ == '__main__':
    main()
