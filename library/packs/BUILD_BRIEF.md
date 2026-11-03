# Brief: build one style pack (vertical English talking-head shorts)

Read first: `library/packs/README.md` (the pack contract — folder, pack.json, tokens, captions, STYLE.md sections).
Then 3–4 library effects to see the template contract: `library/talking-head/effects/{keyword_pop,checklist,number_roll,icon_cards}/{template.js,meta.json}`
and `skills/talking-head-video/SKILL.md` (shots.json format: `{"pack": "<id>", "shots": [{"words": "a-b", "template": id, "params": {...}, "why": "..."}]}`).
The full effect catalogue: `python3 tools/catalog.py --json` (id, name, purpose, group, style, use_for, posters at
`library/talking-head/effects/<id>/poster.jpg`).

## Goal
The boss judged our videos ugly and cheap: tacky default fonts with thick black strokes, every effect in its own
style. Your pack must look like a real, well-edited creator short. **Copy the benchmark closely** — identify its
typeface(s), sizes, colours, caption treatment, card style, motion; then encode them. Taste comes from the reference,
not from invention. "Premium" usually = fewer colours, stronger light/dark contrast, slower motion, more space, finer type.

## Steps
1. Study the reference (given below). Extract frames with ffmpeg where there's a video
   (`ffmpeg -ss T -i in.mp4 -frames:v 1 -vf scale=540:-1 out.jpg`), look at them with the Read tool, save the best
   6–10 into `library/packs/<id>/ref/`. Write down exact observations: font look (geometric/grotesk/serif/condensed),
   weight, case, size relative to frame, colours (sample hex), caption position and chunking, card/box shapes, motion.
2. Fonts: only OFL / free-commercial. Download woff2 from Fontsource
   (`https://cdn.jsdelivr.net/fontsource/fonts/<family-slug>@latest/latin-<weight>-normal.woff2`, check it's non-empty)
   or from github.com/google/fonts. Record each in `fonts/LICENSES.md`. Pick the closest match to the reference.
3. Write `pack.json`, `pack.css`, `STYLE.md` (all 11 sections, concrete numbers at 1080×1920).
   - Choose effects: `signature` (the look) and `allowed` from the library. Library templates read the tokens, so
     most will re-skin automatically — verify by rendering. If the look needs a move the library lacks or a library
     template can't be made to fit via tokens/pack.css, write it in `library/packs/<id>/effects/<id>_<name>/`
     (template.js + meta.json copied from the closest library effect's meta schema). Never edit library effects,
     engine.html or render.py — if you think the engine needs a change, say so in your report.
4. Style frames on the test project `skills/talking-head-video/packtest_<id>/` (an English HeyGen presenter, words in
   `work/words.json`, script in `../mengyao_en/script.txt`; it's a ToneBird ad — AI reply assistant inside Gmail,
   Slack, WhatsApp). Write `packtest_<id>/shots.json` with `"pack": "<id>"` and 4–6 shots covering: the hook
   (words 0–19), plain talk with captions, a proof/example moment (the Gmail/Slack/WhatsApp line), a list or
   contrast moment, the ending. Text must be English and true to what she says. No brand theme is applied (pure pack).
   Render stills from `skills/talking-head-video`:
   `python3 scripts/render.py packtest_<id> --stills t1,t2,t3,t4` (outputs in packtest_<id>/stills/).
   Look, compare with ref frames, fix, repeat. Check: fonts actually loaded (not fallback), nothing cheap-looking
   (no thick black outline unless the reference truly has it), text not over mouth/chin, readable on bright footage.
5. Copy the final 4 stills to `library/packs/<id>/frames/` and build `frames/compare.jpg`: top row 4 reference frames,
   bottom row our 4 frames, each 360×640, labelled (PIL; any font).

## Memory / rendering — important
`render.py` has a global lock (one browser at a time across all agents). Run renders in the foreground with
timeout 600000 ms; if a call times out while queued, run it again. Stills only — no full videos. Keep contact sheets small.

## Don't
Edit anything outside `library/packs/<id>/` and `skills/talking-head-video/packtest_<id>/`. No commits.
No accounts, no paid services. Don't spend more than ~60 min total.

## Report back (short, <400 words)
What the reference's look is (fonts/colours/captions), what you matched and how (font choices + why), signature
effects, what still doesn't match and why, path of compare.jpg, any engine change you'd want.
