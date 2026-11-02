# Brief: build batch-3 effects (all 27 approved) — demo on Rumi, English, library-ready

The user approved all 27 entries in `candidates/batch3.json`. Build each one as a working template, demo it on the
same English AI presenter as every other effect (Rumi), and write a full library meta.json, so the lead only has to
move the folders into the library and render previews.

## Read first
- `candidates/BRIEF.md` — renderer, layers, template contract, helpers, performance and memory rules. Its paths
  for footage are old: the demo project is now **`skills/talking-head-video/demo_rumi/`**.
- `candidates/REMAP_BRIEF.md` — the Rumi script (L1–L12 table) and how to pick a line per effect.
- `candidates/NEUTRAL_BRIEF.md` — **rules A and B apply to every new template**: no topic content inside templates
  (all text comes from params / ctx.words; uploaded material has no fallback and renders nothing if missing), colours
  from theme variables (`--accent`, `--accent-2`, `--ink`, `--paper`, `--bg-a`, `--bg-b`, `--dim`).
- `tags.json` and 3–4 library effects' `meta.json` + `template.js` (e.g. `library/talking-head/effects/keyword_pop`,
  `checklist`, `number_roll`, `icon_cards`) — copy their meta schema exactly.
- `candidates/refs3/<slug>/` — the reference frames for each entry (`ref_frames` in batch3.json) and `video.md`.
  **Look at the frames** before building; the demo should read as the reference.
- Icons/logos: the engine has `iconTile(q, size, {bg, fg, app})` / `iconSvg(q)` (7,500 icons; brand names → real logos,
  common words → UI icons). Use it whenever an effect shows app icons or logos — never hand-draw logos.

## English only
Several references are Chinese (五个 / 两边 / 重点 / 律师…). **All on-screen text in demos is English**, taken from
Rumi's script (e.g. a two-word split → "DECIDING · IS", four-corner word → "S-Y-S-T-E-M" or a 4-letter word you
can build from her line, arc text under the avatar → a short English phrase). Templates must handle Latin text well
(letter spacing, word vs character splitting); CJK should still work if a param is Chinese, but demos are English.

## Your entries
Given in the task message as indexes into `candidates/batch3.json` (0-based).

## For each entry
1. Pick a readable snake_case English id (unique; check `ls library/talking-head/effects` and the other agents'
   folders in `candidates/effects3/`). Folder: `candidates/effects3/<id>/` with `template.js` + `meta.json`.
2. `meta.json` = full library schema, values only from `tags.json`:
   `id, name (中文), video_type "talking-head", status "ready", category, purpose (1–3), weight, covers_face, zone,
   group, style (1–2; start from batch3.json's style), duration, use_for (中文一句), needs, needs_assets, fills, params,
   what (from batch3.json, 中文), sources, ref_moment`.
   - `group`: reuse an existing group from tags.json when the effect is a look-alike of that group; otherwise invent a
     short Chinese group name and **list it in your report** (don't edit tags.json — the lead adds new groups).
   - `fills`: params the planner fills from speech, each starting `必填：` or `可选：`.
3. Demo shot: add it to **your own** files `skills/talking-head-video/demo_rumi/shots_<B><k>.json`
   (`{"skin": "clean", "shots": [...]}`, shots in time order, non-overlapping; one shot per effect; caption-replacing
   effects in a file with `"captions": false`). The effect should start within ~0.3 s of the shot start and be clearly
   visible for most of the shot (the preview is just this shot). Use only the params the template documents.
4. Render stills (start / middle / end) from `skills/talking-head-video`:
   `python3 scripts/render.py demo_rumi --shots shots_<B>1.json --effects ../../candidates/effects3 --stills 3.2,4,5`
   Look at them next to the reference frames; fix; re-check. Also test once with a theme
   (`"theme": {"accent": "#ff4d6d", "accent-2": "#3d7bff"}` in a temp copy of your shots file, delete afterwards) and
   once with a required param removed (must render nothing, not crash).
5. Write `candidates/effects3/<id>/review.json`:
   `{"status": "good|ok|rough", "ref": "compared with refs3 frames", "checked": "...", "fixed": "...", "left": "..."}`.

## Memory — very important
`render.py` has a global lock (one browser at a time across all agents; waits if RAM is low). Run renders in the
foreground with timeout 600000 ms; if a call times out while queued, run it again. **Stills only** — no full videos,
no `tools/previews.py`. Don't make giant contact sheets.

## Don't
- Edit anything outside `candidates/effects3/<your ids>/` and your own `demo_rumi/shots_<B>*.json`
  (no engine.html, render.py, tags.json, library/, other agents' files). No commits.
- Don't spend more than ~15 min on one effect; a recognisable, clean demo of every entry matters more.

## Report back (short)
Table: index · id · name · group (mark NEW groups) · shots file + word range · good/ok/rough · anything the user
should know.
