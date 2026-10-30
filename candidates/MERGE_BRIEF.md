# Brief: move the approved candidates into the library and re-tag everything for auto-picking (round 5)

The user reviewed all 126 effects on the review page and rejected only **c03 (盖章印戳)** and **c06 (反色混合字)**;
everything else is approved. Next we build "one talking-head video in → finished video out": a planner reads the
transcript, decides what each sentence is, and picks effects from the library under density rules
(`research/auto-edit-rules-draft.md` — read it). The current tags (category = what it *looks* like) don't let a
planner pick by *what the sentence needs*. This round fixes that.

Read first: `README.md`, `tags.json`, `tools/catalog.py`, `candidates/BRIEF.md` (renderer + template contract),
`research/auto-edit-rules-draft.md`, a few `library/talking-head/effects/*/meta.json` and `candidates/effects/*/meta.json`.

## 1. Move

- `candidates/effects/c03`, `c06` → `candidates/rejected/` (keep the folders, git mv).
- Every other candidate → `library/talking-head/effects/<new_id>/` with `git mv`. `new_id` = short readable
  snake_case English describing the effect (like the existing `keyword_pop`, `doc_fly`), unique. Keep the old id
  in meta as `"was": "c13"`.
- Rename everywhere the id is used: the folder, `meta.json` `id`, `TEMPLATES.<id>` in template.js, any helper or
  cross-reference between templates (e.g. c63/c67 share a global `candC_scene` — give shared helpers one neutral
  name and keep the copies identical), and the `"template"` values in
  `skills/talking-head-video/demo_rumi/shots_*.json` (and `work_example/shots_*.json` if they reference cNN).
  preview.mp4 / poster.jpg / review.json move with the folder.
- Keep `candidates/candidates.json`, `taxonomy.json`, `batch2.json` as the historical record; add a mapping file
  `candidates/id_map.json` {"c13": "new_id", …}.

## 2. New tags (edit `tags.json` — it is the only source of tag values — and every meta.json)

Each effect gets:
- `purpose` (1–3, what kind of sentence it serves): 开场钩子 · 数字 · 清单步骤 · 对比前后 · 定义概念 · 金句观点 ·
  引用证据 (quote / chat / tweet / screenshot / news) · 情绪吐槽 · 提到具体东西 (app, product, place, person) ·
  换话题 · 结尾号召 · 转场 · 字幕 (caption styles). Adjust names if a clearly better split appears, but keep it
  ~12–15 values and write each value's meaning in tags.json.
- `weight`: `底层` (always-on caption styles), `小` (keyword pop, sticker, icon, small card — face fully visible),
  `大` (full-screen card, split screen, B-roll / screenshot covering the face, transitions, big layout changes).
  Judge by how much of the frame and face it takes over, from the preview.
- `covers_face`: true/false.
- `zone`: where it sits — `上方` / `中部` / `胸口` / `下方` / `全屏` / `环绕` (so the planner avoids two things in the same spot
  and keeps clear of the caption band).
- `group`: look-alike effects share a group (e.g. all number counters → `数字跳动`; all "pop a keyword" →
  `关键词弹出`). A video uses at most one effect per group. Aim for roughly 40–60 groups.
- `fills`: which params the planner must fill from the speech and how, e.g.
  `{"keywords": "原话里的短语", "number": "原话里的数字", "items": "清单每项：原话里的词 + at"}`. Derive from each
  template's params; mark which are required.
- `needs`: keep 抠像 etc.; `needs_assets`: 截图 / 照片 / B-roll视频 / logo (already set last round — keep).
- `duration`: sensible shot length range, e.g. "2–4 秒".
- `use_for` (Chinese one-liner when to use) and `name` (Chinese) — keep/clean up.
- Drop the old `category` / `style` if they no longer help, or keep `category` only as a browsing label — your call,
  but `catalog.py` must validate whatever the schema is.

## 3. Tools

- Update `tools/catalog.py` to validate the new fields, and to print `--json` in a compact form a planner can
  read (id, name, purpose, weight, covers_face, zone, group, fills, needs, needs_assets, duration, use_for).
- Regenerate `library/README.md` (table grouped by purpose → group) and `gallery/data.js`; make sure
  `gallery/index.html` still works with the new fields (filters by purpose / weight / group).
- `tools/previews.py` default paths: point at `skills/talking-head-video/demo_rumi` and the demo shots files.

## Check

- `python3 tools/catalog.py` passes with no errors; 124 effects (17 old + 107 moved).
- Render a few stills from 3 demo shots files with the **library** (no `--effects` flag) to prove renamed
  templates load: `cd skills/talking-head-video && python3 scripts/render.py demo_rumi --shots shots_R22.json --stills 5,12`.
  One render at a time, stills only, long timeout (600000 ms) — the machine is memory-limited.
- `grep -rn '"c[0-9]\{2,3\}"'` over demo shots and library templates finds nothing left.

## Don't
- Don't change how any effect looks or behaves (only ids/tags/docs). No engine/render.py changes. No commits.

## Report back (Chinese)
The purpose list you settled on (with meanings), the groups (group → ids), counts by weight, anything you
couldn't classify confidently, and anything that broke.
