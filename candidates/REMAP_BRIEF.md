# Brief: move effect demos onto the new clean demo footage (round 3)

Background: the user found the old demo footage (Monica) uncomfortable because it had an earlier edit's
overlays burned in. We now have a **clean** talking-head clip made with HeyGen (an AI presenter, "Rumi",
plain room, nothing burned in) speaking a script written for these demos. Project:
`skills/talking-head-video/demo_rumi/` (same layout as work_example: `raw.mp4`, `work/words.json`,
`work/transcript.txt` with word numbers, `work/matte_src/`, `assets` → work_example/assets).

Goal: like CapCut's effect gallery — **every effect demoed the same way on the same presenter**, each on the
line of the script that suits it, so the user can compare effects fairly.

Read first: `candidates/BRIEF.md` (renderer, template contract, memory rules) and `candidates/REVIEW_BRIEF.md`
(memory rules again — one render at a time, stills only; render.py has a global lock).

## The script (find exact word numbers in demo_rumi/work/transcript.txt)

| line | text | suits |
|---|---|---|
| L1 | Stop scrolling. | hook, big title, intro, flash, punch-in |
| L2 | You have three thousand unread messages, and that's not even the worst part. | number, notification, counter, stamp |
| L3 | Here's the truth: replying isn't the hard part. Deciding is. | keyword emphasis, contrast, focus, spotlight |
| L4 | Every day we jump between email, WhatsApp, Slack and Telegram, and every single one wants an answer right now. | app list, icons, chat UI, split screen, collage, pressure |
| L5 | So what actually works? Three things. | question, search box, title card, transition |
| L6–L8 | One: reply in batches, twice a day. Two: keep your answers short. Three: turn off every notification you don't need. | checklist, steps, progress, numbered callouts |
| L9 | Before, I spent four hours a day in my inbox. After? Forty minutes. | before/after, comparison, numbers, chart |
| L10 | Last week my friend Sarah texted me: "How do you reply so fast?" | quote, chat bubble, tweet card, comment sticker, story |
| L11 | Honestly, it's not talent. It's a system. | punchline, emotional peak, push-in, outline, halo |
| L12 | If this helped, follow for part two, and comment "system" and I'll send you my template. | CTA, follow button, end card, outro |

## For every id in your range

1. Pick the line that best matches the effect's `use` (meta.json). Prefer a ~3–5 s span (part of a line is fine;
   a whole line for list/step effects). Keep it **uniform**: the effect should start within ~0.3 s of the shot
   start and be fully visible for most of the shot — the preview is just this shot.
2. Rewrite the shot's `params` for the new words: any `at` / keyword / text param must use **this script's**
   words (e.g. card texts EMAIL / WHATSAPP / SLACK / TELEGRAM, number 3,000, "4 hours → 40 min", Sarah's text,
   comment keyword "system"). Remove workarounds that only existed for the old footage (e.g. covering a
   burned-in caption bar: `hideOld` etc. should default off for this footage, or be removed).
3. Things specific to Rumi: she sits centred, head near the top third, no laptop in frame, plain bright room.
   Effects that track the head from the matte should still work — check. B-roll / screenshots from
   `assets/` are still available.
4. Write your shots into **your** files `skills/talking-head-video/demo_rumi/shots_<BATCH><k>.json`
   (`{"skin": "clean", "shots": [...]}`) — shots in one file in time order and non-overlapping, so you'll need
   several files (roughly one per 8–12 effects). Every id exactly once across your files.
   Caption effects that replace the caption pill (word-by-word captions) go in a file with `"captions": false`.
5. Render stills (start / middle / end) with `--shots` and `--effects ../../candidates/effects`:
   `python3 scripts/render.py demo_rumi --shots shots_<BATCH>1.json --effects ../../candidates/effects --stills ...`
   (run from `skills/talking-head-video`). Look at them, fix, re-check. Keep the quality reached in round 2;
   if the template itself needs a small fix for this footage, make it (don't break its params for other footage).
6. Update `review.json` → add `"footage": "rumi"` and adjust `left` if anything changed.

## Don't

- Edit outside your ids' effect folders and your own shots files. No engine/render.py changes. No commits.
- No previews (the lead renders them). One render at a time.

## Report back

id · line used (word range) · file · anything that got worse or needs the user's decision.
