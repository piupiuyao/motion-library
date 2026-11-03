#!/usr/bin/env python3
"""Step 1 · transcribe the talking-head recording to word-level timestamps.

  python3 scripts/transcribe.py PROJECT/raw.mp4 [--model medium] [--lang en|zh] [--script PROJECT/script.txt]
      -> PROJECT/work/words.json   [{"i": 0, "w": "Hello", "s": 0.52, "e": 0.81, "p": 0.98}, ...]
      -> PROJECT/work/transcript.txt  (readable, with word indices — use these indices in shots.json)

Uses local openai-whisper (word_timestamps). No API key, nothing uploaded.
With --script (the text that was read, e.g. the script given to an AI presenter) whisper only supplies the timing:
every word's text is replaced by the script's own spelling and punctuation, so captions have no recognition errors.
"""
import argparse, difflib, json, os, re

NOISE = re.compile(r'^[\[\(].*[\]\)]$')  # (static) [music] ...
CJK = ('zh', 'ja', 'ko')


def key(c):
    return c.lower() if c.isalnum() else ''


def align_script(words, script, lang):
    """Give each whisper word the script text it covers. CJK matches by character, other languages by word."""
    if lang in CJK:
        units = [c for c in script if not c.isspace()]
        # a unit is one script character; latin runs inside CJK text ("ToneBird") stay whole
        merged = []
        for c in units:
            if merged and c.isascii() and c.isalnum() and merged[-1][-1:].isascii() and merged[-1][-1:].isalnum():
                merged[-1] += c
            else:
                merged.append(c)
        units = merged
        hyp = []  # (text unit, word index)
        for w in words:
            for u in re.findall(r'[A-Za-z0-9]+|\S', w['w']):
                hyp.append((u, w['i']))
    else:
        units = script.split()
        hyp = [(w['w'], w['i']) for w in words]
    norm = lambda u: ''.join(key(c) for c in u)
    content = [k for k, u in enumerate(units) if norm(u)]  # punctuation rides along with the unit before it
    a, b = [norm(u) for u, _ in hyp], [norm(units[k]) for k in content]
    owner = [None] * len(units)
    ha = sa = 0
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        # gap before this block: misheard stretch -> spread the script units over the whisper words there, in order
        gh, gs = list(range(ha, blk.a)), list(range(sa, blk.b))
        if gh and gs:
            for n, k in enumerate(gs):
                owner[content[k]] = hyp[gh[n * len(gh) // len(gs)]][1]
        for k in range(blk.size):
            owner[content[blk.b + k]] = hyp[blk.a + k][1]
        ha, sa = blk.a + blk.size, blk.b + blk.size
    last = next((o for o in owner if o is not None), words[0]['i'] if words else None)
    for k, o in enumerate(owner):
        if o is None:
            owner[k] = last
        last = owner[k]
    text = {}
    sep = '' if lang in CJK else ' '
    for u, o in zip(units, owner):
        text[o] = text[o] + sep + u if o in text else u
    out = []
    for w in words:
        if w['i'] in text:
            out.append({**w, 'w': text[w['i']], 'i': len(out)})
        elif out:
            out[-1]['e'] = w['e']  # its sound now belongs to the word before
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--model', default='medium')
    ap.add_argument('--lang')
    ap.add_argument('--prompt', help='spelling hints: product names, people, jargon')
    ap.add_argument('--script', help='the exact text that was read; replaces recognised text, keeps the timing')
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
    lang = r.get('language')
    if a.script:
        words = align_script(words, open(a.script).read(), lang)
    json.dump({'source': os.path.abspath(a.video), 'lang': lang, 'script': bool(a.script), 'words': words},
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
