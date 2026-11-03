# Style packs

A pack is one locked look for vertical (1080×1920) talking-head shorts, English first. Every video picks ONE pack;
the pack decides fonts, colours, caption skin, text treatment, motion feel and which effects may be used.
Effects stay generic: they read the pack's CSS variables, so the same effect looks different in each pack.

Rule that makes this work: **copy a real reference, don't invent.** Each pack is reverse-engineered from a
benchmark creator / video and judged by putting our frame next to theirs.

## Folder
```
library/packs/<id>/
  STYLE.md      the style bible (sections below) — the agent reads this before directing
  pack.json     machine part: fonts, tokens, caption style, allowed effects
  pack.css      caption skin + .pk-* classes (scoped under .pack-<id> or #caption.pack)
  fonts/        OFL / free-commercial font files (+ fonts/LICENSES.md: name, licence, source URL)
  effects/      signature effects this pack needs that the library lacks (same format as library effects)
  ref/          reference frames (jpg) from the benchmark
  frames/       our style frames + compare.jpg (reference left, ours right)
```

## pack.json
```json
{
  "id": "nischa", "name": "Clean Finance", "vibe": "one line",
  "reference": [{"creator": "...", "url": "...", "what": "what we copy from it"}],
  "fonts": [{"family": "PkDisplay", "file": "fonts/x.woff2", "weight": "100 900"}],
  "tokens": {"font-display": "\"PkDisplay\", sans-serif", "font-body": "...", "font-hand": "...", "display-weight": "800",
             "accent": "#..", "accent-2": "#..", "ink": "#..", "paper": "#..", "bg-a": "#..", "bg-b": "#..", "dim": "rgba(..)",
             "cap-bg": "..", "cap-ink": "..", "cap-on": "..", "on-accent": "#.."},
  "caption_style": "pack",
  "brand_font": "display | none | all",
  "effects": {"signature": ["ids used often — the look"], "allowed": ["other ids that fit"]},
  "density": "how often something appears, how quiet the face shots are",
  "not": ["what this style is NOT"]
}
```
Tokens become CSS variables on #stage (`--accent` …). Library templates already use `--accent, --accent-2, --ink,
--paper, --bg-a, --bg-b, --dim, --on-accent, --on-bg, --accent-text, --font-display, --font-body, --display-weight`
and the `.display` class. With a pack, ALL text is forced to `--font-body` except elements with class `display`,
`pk-display`, `pk-hand` or `pk-mono` (so templates can't sneak in their own font).
Captions: `caption_style: "pack"` adds class `pack` to `#caption`; style `#caption.pack .pill / .on / .key` in pack.css
(`.pill` = the line, `.on` = words already spoken, `.key` = keywords).
A brand (theme.json) still overrides colour tokens; `brand_font: "display"` lets the brand font take only the titles.

## STYLE.md sections (after lemo-opuscar)
1. Essence (3–5 lines) + reference + **what it is NOT** (vs. the nearest other pack)
2. Layers (person / cutout / background / cards / captions) and framing of the person
3. Colour rules (how many hues, where the accent may appear — rules, not just a palette)
4. Type & captions (exact fonts, weights, sizes at 1080×1920, case, tracking, stroke/shadow, chunk size, position)
5. Motion feel (easing family, enter/exit, what never moves, durations)
6. Shot grammar: sentence role → treatment table (hook, claim, list, number, example/proof, contrast, CTA, plain talk)
7. Signature moves (effect ids + when to use each)
8. Density & pacing (how often, how much quiet face time)
9. Brand adaptation (accent only, logo open/end, what never changes)
10. Variation: 3 openings, 3 endings
11. Common failures to check before showing anyone

## Engine helpers for packs
- Caption words are `<span class="w [on]" style="--age:S">` (S = seconds since the word started, -1…5): animate with
  `calc(var(--age))`, e.g. a slam: `transform: scale(clamp(1, calc(1.3 - var(--age) * 2.3), 1.3))`. Keywords: `.key[.on]`.
- `"caption_words": N` in pack.json = words per caption line (default 4).
- `"hide_captions": true` in an effect's meta.json (or on a shot) hides the running captions during that shot.

## Brand (one link: `prep.py PROJECT --brand https://site`)
theme.py saves the site's colours, font, logo and app icons (PROJECT/theme.json + brand/). With a pack, the brand only
takes what `pack.json "brand"` allows — the pack's grounds, inks and type system never change:
```json
"brand": {"tokens": ["accent", "on-accent", "accent-text"], "accent_role": "fill | text", "text_on": "#hex", "font": "display | none"}
```
- `fill`: the brand colour is used as-is for blocks/bars; `--accent-text` is the same hue shifted until it reads
  (≥4.5:1) on `text_on`, and `--on-accent` is black or white, whichever reads on the block.
- `text`: the pack uses the accent as text, so `--accent` itself becomes the readable shifted colour.
- `"map": {"ink": "accent-text"}` makes other pack tokens follow the brand (e.g. sticker ink).
- `--accent-raw` always holds the exact brand colour. `font: "display"` lets the brand font take titles only.
- Logo: only on the end card / opening (`"logo": true` where the effect supports it).
- A footage-picked theme (no brand link) is ignored with a pack. Pack CSS must use `--accent-text` for any text in the accent colour.
