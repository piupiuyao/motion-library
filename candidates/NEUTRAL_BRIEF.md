# Brief: make every effect topic-neutral and brand-colourable (round 4)

Background: the effects will soon be picked and filled **automatically** for any talking-head video (fitness,
finance, cooking…), not just our demo script about inbox/messages. Two things currently break that:

1. **Topic defaults.** Some templates fall back to demo content when a param is missing — e.g. `P.label ||
   'Unread messages'`, `P.media || {frames: 'assets/broll_inbox', …}`, `P.images || ['assets/docs/gmail.jpg', …]`,
   a "WORK LIFE / Inbox zero" newspaper. If the auto-filler misses a param, a fitness video would show an inbox.
2. **Hard-coded colours.** 81 of 126 templates don't use the theme variables, so a brand colour can't reach them.

Read first: `candidates/BRIEF.md` (renderer, template contract, memory rules) and `candidates/REVIEW_BRIEF.md`
(memory rules). Demo project: `skills/talking-head-video/demo_rumi/`, shots files `demo_rumi/shots_*.json`.

## Rules to apply to every template in your range

### A. No topic content inside templates
- Remove every default that is about a topic: text (labels, titles, names, numbers like 12453, "Sarah", app
  lists), screenshots, B-roll paths, emoji chosen for the inbox story. Neutral UI words that work for any topic
  are fine ("Follow", "Comment", "Before / After", "Step 1").
- **Material the user must upload** (screenshot, photo, B-roll clip, logo): no fallback at all. In meta.json add
  `"needs_assets": [...]` using these slot names: `截图` `照片` `B-roll视频` `logo`. If the param is missing,
  setup() must not crash: render nothing (effect is simply invisible). The planner will skip effects whose
  material wasn't uploaded.
- **Text the planner fills from the speaker's words**: if missing, prefer deriving from `ctx.words` (the shot's
  words) when that makes sense; otherwise render nothing. Mark such params "必填" in meta.json `params`.
- Make sure the demo still shows the same content: every value the demo relied on must now be passed explicitly
  in the `demo_rumi/shots_*.json` shot params (edit those shots; keep the rest of the shot unchanged).
- Update `meta.json` `params` descriptions: remove "默认 xxx" where the default was topic content.

### B. Colours come from the theme
Theme variables (set per video; brand colour or picked from the video):
`--accent` (main highlight), `--accent-2` (second colour), `--ink` (dark text), `--paper` (light card / light
text), `--bg-a` `--bg-b` (backgrounds), `--dim` (dark overlay). Use `var(--…)` and `color-mix(in srgb, var(--accent)
40%, transparent)` for tints. On canvas, read the value with
`getComputedStyle(document.getElementById('stage')).getPropertyValue('--accent').trim()` in setup().
- The effect's *signature* colour (its main highlight, glow, card tint, marker, sticker fill, underline…) →
  `--accent`; a second highlight → `--accent-2`.
- **Keep fixed**: real-world brand colours that identify something (WhatsApp green, Gmail red, Slack logo,
  iMessage blue bubble), neutral white/black/greys, shadows, and colours that *are* the style (e.g. a newspaper's
  off-white paper, a red "rejected" stamp, chroma glitch RGB). When unsure, ask: "would a brand-coloured version
  still be this effect?" — if yes, theme it.
- A `color` param may stay as an override, but its default becomes the theme variable.
- Must stay readable for any accent: text on an accent fill uses `--ink` (accents are usually bright); if you
  need it, compute contrast on canvas.

## Check
For each shots file that contains your ids, render stills twice from `skills/talking-head-video`:
1. as is (`"skin": "clean"`) — compare with the current previews in `candidates/effects/<id>/` (poster/preview);
   content and look should be about the same apart from intended colour changes.
2. with a test theme: copy the shots file to `demo_rumi/_theme_<BATCH>.json`, add
   `"theme": {"accent": "#ff4d6d", "accent-2": "#3d7bff", "bg-a": "#0e2240", "bg-b": "#183766"}` and render stills.
   The effect's main colour should now be pink/blue. Delete the `_theme_` files when done.
```
python3 scripts/render.py demo_rumi --shots shots_R11.json --effects ../../candidates/effects --stills 3,9,15
```
(library effects: `--effects` not needed; they're found in library/talking-head/effects.)
Also render one shot with a required param removed to confirm it renders nothing instead of crashing.

## Don't
- Edit outside your ids' effect folders and the `demo_rumi/shots_*.json` params of your ids. No engine/render.py
  changes, no commits, no previews (the lead renders them). One render at a time; stills only (render.py has a lock).

## Report back
Table: id · topic defaults removed · needs_assets · colour: themed / kept fixed (why) · anything that looks
worse. Then a list of templates where theming would hurt the look (for the user to decide).
