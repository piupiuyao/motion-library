# Brief: full test video for one style pack

The pack `<id>` exists in `library/packs/<id>/` (read its STYLE.md, pack.json, pack.css and its effects/ first —
plus `library/packs/README.md`). Stills looked good; now prove it holds up as a whole, moving video.

Footage: test project `skills/talking-head-video/packtest_<id>/` (English HeyGen presenter, ~53 s ToneBird ad;
words in `work/words.json`, script in `../mengyao_en/script.txt`). The existing `shots.json` there is a style-frame
sampler, not a real edit — leave it.

## Do
1. Direct the whole video the way the skill does (see `skills/talking-head-video/SKILL.md`, "一键成片"), but with
   this pack as the visual system: write `packtest_<id>/brief.md` with a `## 审稿` table (one row per sentence: what
   it says, does it need a visual, why) and `## 视觉系统` = the pack; then `packtest_<id>/shots_full.json` with
   `"pack": "<id>"`, using the pack's signature/allowed effects and STYLE.md's shot grammar, density and openings/endings.
   On-screen text must be English and true to what she says. Give each shot a `why`.
2. `python3 scripts/check_plan.py packtest_<id> --shots shots_full.json` (run from skills/talking-head-video; check
   `--help` for the exact flags). Fix what's real. If a check_plan rule contradicts the pack's STYLE.md (e.g.
   density, repeats of a signature move), follow STYLE.md, add `why_break` on that shot, and list the conflict in
   your report — those rules will be made pack-aware later.
3. Look before the full render: `python3 scripts/render.py packtest_<id> --shots shots_full.json --sheet 1` (one
   frame per second → stills/…sheet.jpg). Check every second: text off the mouth/chin, nothing clipped at frame
   edges, fonts are the pack's, captions readable, no empty/black frames, hand-offs between shots clean. Fix, recheck.
4. Full render once it's clean: `python3 scripts/render.py packtest_<id> --shots shots_full.json --out packtest_<id>/full.mp4`.
   Then spot-check the real file at 4–5 moments around shot changes
   (`ffmpeg -ss T -i full.mp4 -frames:v 1 -vf scale=360:-1 x.jpg`), and check audio is present (ffprobe).
5. Copy the result to `~/Desktop/数字人测试/风格包测试/<NN>_<pack name>.mp4` (NN given in the task).

## Rules
- You may fix bugs in this pack's own folder (`library/packs/<id>/`), and must say what you changed. Don't edit the
  library effects, engine.html, render.py, check_plan.py or other packs — report engine problems instead.
- Memory: render.py has a global lock (one browser at a time across agents). Run renders in the foreground with
  timeout 600000 ms; if a call times out while queued, run it again. Only ONE full render per pack (after the sheet is clean).
- No commits. ~60 min max.

## Report (<350 words)
Desktop file path + duration; the shot list in one line per shot (time · effect · what's on screen); what looks good
in motion; what's weak; check_plan conflicts with the pack; any engine problem.
