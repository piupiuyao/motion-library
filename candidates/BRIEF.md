# Brief: build quick demo versions of candidate talking-head effects

We have a motion-effect library for vertical (1080x1920) talking-head videos. A user will review ~79 candidate
effects by WATCHING a few-second demo of each, so each candidate needs a working template now. Goal: **a quick,
recognisable demo** — the effect must clearly read as what the description says. Not pixel-perfect; clean and
not broken. After review, approved ones get polished.

## Where things are

- Repo: `~/motion-library`. Skill + renderer: `skills/talking-head-video/` (run commands from there).
- Candidate list: `candidates/candidates.json` (fields: n, id, name, category, what, use, needs, sources, note).
- Each candidate already has a folder `candidates/effects/<id>/` with `meta.json`. You add `template.js`
  and add a `"params"` object to its meta.json documenting any params (`{"name": "说明（中文）"}`).
- Renderer engine (read it first): `skills/talking-head-video/scripts/engine.html`.
- Good existing templates to copy style from (read 3–4): `library/talking-head/effects/*/template.js`
  e.g. keyword_pop, frame_layer, paper_props, bg_switch, dashed_focus, cutout_card, scanline_word, hook_bigword.
- Demo footage: `skills/talking-head-video/work_example/` — an English talking-head clip (a woman, Monica,
  talking about replying to messages; ~54 s after the rough cut). Transcript with word numbers:
  `work_example/work/transcript.txt` and `work/words.json` (words 0–148 usable; word 21 is blank;
  149–153 are cut). Person matte already exists (white = person) for every frame.
- Assets you may use (paths relative to work_example): `assets/docs/gmail.jpg`, `assets/docs/chat.jpg`,
  `assets/docs/notify.jpg` (app screenshots), and a B-roll clip as frames `{"frames": "assets/broll_inbox",
  "fps": 30, "count": 165}` (a laptop inbox screen recording). Anything else: draw it with HTML/CSS/SVG/canvas
  inline in the template (icons, emoji, cards, paper, maps, line art…). **No network images, no new files
  outside your effect folders and your shots files.**

## Template contract

```js
// 名字 · 类别：一句中文说明
TEMPLATES.<id> = {
  setup(ctx) { /* build DOM once per shot into ctx.L.bg / ctx.L.back / ctx.L.front; style ctx.base / ctx.person */ },
  frame(ctx) { /* set styles for local time ctx.t (0..ctx.d seconds) */ },
};
```

- Layers bottom→top: `#bg` (ctx.L.bg) → `#base` (original video, ctx.base / ctx.baseImg) → `#back` (ctx.L.back,
  between video and person) → `#person` (cut-out person canvas, ctx.person / ctx.personCv; only drawn when the
  effect's meta.json `needs` contains "抠像") → `#front` (ctx.L.front) → caption pill (bottom, y≈1452–1560;
  keep important stuff out of that band or accept it's covered).
- ctx: `t` local seconds, `d` shot duration, `p` = t/d, `params`, `words` (shot words with local `s`/`e`
  times, `w` text), `groups` (highlight phrases), `focus` [x,y] 0–1 face position, `seg.zoom` current jump-cut zoom.
- Helpers in engine: `clamp lerp ease.{out,inOut,back,pop} enter(t,t0,dur) leave(ctx,d) el(tag,css,html)
  url(path) frameUrl mediaSrc(media,t) setImg(img,src) pattern(name: dots|grid|neon|paper|plain) outline(px,color)`
  (outline() draws a sticker outline around the cut-out person; returns a soft-shadow filter for personCv).
  `pending.push(img.decode())` when you create images in setup so the frame waits for them.
  Skin CSS variables: `--accent --accent-2 --ink --paper --bg-a --bg-b --font-display --font-body`; class
  `display` for headline font. Use these so the skin can change.
- **frame() must be a pure function of ctx.t** — frames are rendered out of order (stills jump around).
  No state accumulated across frames; randomness must be seeded from t / frame number.
- `resetLayers()` wipes bg/back/front and base/person styles between shots, so setup can assume clean layers.
- **Performance**: target < 0.3 s per frame. Avoid stacked CSS `drop-shadow`/big `blur()` filters on
  full-frame layers (5 s/frame!). Prefer canvas, gradients, transforms, opacity. Small elements with filters are fine.
- **Transitions** (category 转场): the renderer has no "next shot" yet. Demo as: talking head → effect →
  a "next scene" (params.to: an image path, B-roll frames, or a title card you draw), holding it ~1 s, optionally
  transitioning back. Make the transition itself clearly visible (~0.4–0.8 s).
- **Sound** is not supported — ignore the SFX part of a description.
- Text on screen: use the speaker's real words where it fits (from the transcript) or short neutral English labels.

## Demo shot lists

Write your own shot list files in `work_example/`: `shots_cand_<BATCH><k>.json` (e.g. `shots_cand_B1.json`,
`shots_cand_B2.json`). Format:

```json
{"skin": "clean", "shots": [
  {"words": "30-45", "template": "c13", "params": {...}}
]}
```

Shots in one file must not overlap; pick word ranges of ~2.5–6 s whose content suits the effect. Use as many
files as you need (each file can reuse the whole transcript). Every one of your effects must appear in exactly
one shot across your files — the first shot using an id is what becomes its preview.

## Check your work

```
cd ~/motion-library/skills/talking-head-video
python3 scripts/render.py work_example --shots shots_cand_B1.json --effects ../../candidates/effects --stills 12.4,13,13.6
```

Stills land in `work_example/stills/shots_cand_B1/`. **Look at them** (Read the jpgs) at 2–3 moments per
effect (start / middle / end of the shot) and fix what's wrong. Use `--sheet 0.5` for an overview sheet.
Shot times: after a run, `work/timeline_shots_cand_B1.json` has each shot's start/end in output seconds.
Ignore the "!! ... face" warnings. Run **one render at a time** (the machine is memory-limited; other agents
are rendering too). Don't render full videos — the lead will render previews.

## Don't

- Don't edit anything outside `candidates/effects/<your ids>/` and your own `shots_cand_<BATCH>*.json`
  (not engine.html, render.py, library/, other batches' folders). If you need a helper, put it inside your template.
- Don't spend long polishing one effect; a recognisable demo of every effect in your batch matters more.

## Report back

A short list: id, name, done / rough / skipped (+ one line why if rough or skipped), which shots file + word range.
