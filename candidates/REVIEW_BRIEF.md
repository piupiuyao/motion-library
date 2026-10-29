# Brief: careful review + fix of candidate effect demos (round 2)

Read `candidates/BRIEF.md` first — it explains the repo, the renderer, the template contract, the demo footage
and the shots files. Everything there still applies. This round is about **quality**: each candidate already has a
quick demo (`candidates/effects/<id>/template.js`); some are rough. The user will pick effects by watching the
demos, so a demo that doesn't look like the real thing makes them reject a good effect. Be meticulous.

## For every id in your range

1. **Look at the real thing.** `candidates/candidates.json` has `sources` (links) for each id.
   - YouTube with `&t=NNNs`: download only a ~10 s section around it at low res, then pull frames:
     ```
     mkdir -p candidates/refs/<id> && cd candidates/refs/<id>
     yt-dlp -q -f "bv*[height<=480][ext=mp4]/b[height<=480]" --download-sections "*NNN-NNN+10" -o ref.mp4 "<url>"
     ffmpeg -v error -i ref.mp4 -vf "fps=2,scale=360:-2" f_%02d.jpg && rm ref.mp4
     ```
     No timestamp: try the first 60 s at fps=1 and find the moment; if the video is long and the effect is not
     findable quickly, move on.
   - Envato / Motion Array / Videohive pages: try `yt-dlp` on the page or fetch the page and look for an
     `og:video` / preview `.mp4` link; grab frames the same way. Douyin/TikTok often fail — fine, skip.
   - If nothing can be fetched in ~3 minutes, work from the `what` description plus your own knowledge of
     the style. Note that in the review.
   - `candidates/refs/` is git-ignored (other people's content). Keep only the jpgs, max ~20 per id. Delete videos.
2. **Look at our demo**: render stills at start / middle / end of its shot (and at the key moment of the motion).
   Shot times: `work/timeline_<shots-stem>.json` after a run.
3. **Compare honestly** — layout, size, colour, motion, timing, what is in front/behind the person. List the
   differences that matter for recognising the effect.
4. **Fix** `template.js` (and the shot's params / word range in the shots file if the line doesn't suit the
   effect). Re-render stills and look again. Iterate until it reads as the real thing, within reason
   (~15 min per effect; if an effect fundamentally needs something we can't do, say so).
5. **Write `candidates/effects/<id>/review.json`**:
   ```json
   {"status": "good" | "ok" | "rough", "ref": "fetched" | "description-only",
    "checked": "what you compared", "fixed": "what you changed", "left": "known gaps, if any"}
   ```
   good = a viewer would recognise it as the reference; ok = clearly the right idea, details differ;
   rough = only a sketch of the idea.

## Memory — very important

The machine has little RAM; a crash loses the whole night's work.
- `render.py` now takes a global lock: only one browser render runs at a time across all agents, and it waits
  when free memory is low. A render may therefore sit queued for a few minutes — that's normal. Run renders in
  the foreground with a long timeout (600000 ms); if a call times out while queued, just run it again.
- Only render **stills** (never full videos, never `tools/previews.py` — the lead does previews).
- Never start more than one render or yt-dlp download at a time yourself. Don't run anything heavy in parallel
  (no local ML models, no big downloads — 480p sections only).
- Read stills at their saved size; don't make giant contact sheets.

## Don't

- Don't edit outside your ids' `candidates/effects/<id>/`, your shots files, and `candidates/refs/<id>/`.
- Don't touch engine.html, render.py, library/, or other ids. If an engine change would really help, say so in
  your report instead.
- Don't git commit (the lead commits).

## Report back

A table: id · name · status (good/ok/rough) · ref fetched? · one line on what you fixed. Then a short list of
anything that needs an engine change or the user's decision.
