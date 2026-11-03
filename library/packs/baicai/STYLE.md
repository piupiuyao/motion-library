# Bai Cai Dark (`baicai`) — style bible

## 1. Essence
A calm, premium editor's cut. The footage keeps its own brightness, only a touch warmer and calmer (premium, never gloomy — the boss rejected a dark grade as 阴森); subtitles are thin white type on the
chest with the key phrase bigger and green; the "moves" take the speaker out of the frame onto black: shrunk into a
B&W box, cut out into a framed card, parked in a round window while white documents fly in, framed under a heavy serif
title at the end. One accent: a soft neon green (#4cd964). Type: tall condensed titles (Anton), clean thin sans for
everything read (Inter), one heavy serif for the end card (Playfair Display Black), a brush hand only for the green arc note.
Reference: 剪辑师白菜「告别廉价口播 / BAI CAI EDITING」, WeChat Channels screen recording `~/Desktop/94_1793056051.mp4`
(the edited video is the portrait panel x 210–566, y 246–880 of the 592×1280 recording). Frames in `ref/`.
**What it is NOT:** not the old tb2_zh look (default 黑体 with thick black stroke); not Hormozi (no huge bouncing
caption, no pills); not `nischa` (light, flat, orange diagram panels) — this pack lives on black and dark footage and
makes its point with framing moves, not diagrams.

## 2. Layers & framing
- Footage: lightly graded (pack.css): `brightness .98 contrast 1.06 saturate .86 sepia .06` on `#baseImg`, plus a
  light vignette (top 16 % / bottom 18 % fade + radial edge 22 %) in `#back::before`. Never darken face shots to fake
  the reference's dim room; the black only appears in the backdrop moves.
- Face shots: full frame. Hook: push to 1.55× and park the face in the left third (`baicai_side_title`).
- Black backdrops: pure black (`baicai_mono_note`, `baicai_doc_cards` — footage blurred to 22 % as texture),
  black + low-poly white line net 16 % (`baicai_point_card`), warm black #3a332e→#161412 (`baicai_end_frame`).
- Speaker insets: B&W box 82 % centred, 6 px radius; round window 320 px top-left with 5 px white rim; cutout at 0.56
  in a framed box (head over the top edge, body cut at the bottom, left edge feathered 220 px); end frame 940×750 at
  y 1010, 4 px white rim, 18 px radius, head breaking out above.
- Caption: on top of everything, centre line y 1130 (drops to y 1690 while doc cards fill the middle).

## 3. Colour rules
- Neutrals do the work: black / near-black backdrops, white type, white cards (#fff, text #111/#666, rules #e9e9e9),
  frames and rims in white 88–92 %, frosted panels white 10 % / dark 30 % with a 30 % white border.
- ONE accent `#4cd964` (his green): caption keywords, the small sub-lines under titles, the arc hand note, the chip
  text, the single ring. Never as a fill behind text, never on big titles.
- The ring chart is the only place extra hues appear (violet #8b7bff, red #ff3b30 for 2nd/3rd rings, as in his donuts).
- A brand may swap the accent; keep it a mid-bright colour that reads on black.

## 4. Type & captions (1080×1920)
- Anton 400 (display): hook word 230 px auto-fit to ≤ 560 px wide, ALL CAPS, tracking .035 em, soft shadow
  `0 8px 30px rgba(0,0,0,.45)`; ring numbers 66 px; panel titles 76 px; chip 60 px.
- Inter (body): captions 400 50 px / 1.3, tracking .035 em, white, no stroke; halo
  `0 2px 4px rgba(0,0,0,.55), 0 0 16px rgba(0,0,0,.55), 0 0 36px rgba(0,0,0,.35)` + a soft radial dark band behind the
  line. 1–5 words per line (`caption_words: 5`), whole line at once (no karaoke), sentence case as spoken.
  Keywords (`keywords` param): green, Medium, 1.32×, settle up 7 px on the word. Green sub-lines: 400 34–46 px,
  tracking .10–.20 em. Box titles: 500 84 px, tracking .08 em (his 「白菜剪辑」). Tiny box sub: 26 px, tracking .22 em, caps.
- Playfair Display 900: end title 170 px (auto-fit to 960 px), shadow `0 10px 30px rgba(0,0,0,.55)`.
- Caveat Brush: arc note 92 px green with green glow; only in `baicai_mono_note`.

## 5. Motion feel
- Ease-out / ease-in-out only, no overshoot, no shake. Frame moves 0.4–0.6 s (shrink, slide into box, into end frame).
- Titles: wipe up from the bottom (clip) + 40 px rise 0.45 s; serif / box titles tighten tracking as they fade in.
- Cards fly in from bottom-right rotating ~24° to their −7°/6°/−4° rest, 0.5 s each, on the word that names them.
- Arc note slides along its arc into place 0.6 s. Rings draw 0.9 s and count up; unrevealed rings show "?".
- Face shots: slow push (6 % over the hook, `push_in` to 1.10–1.12 on plain talk). Captions swap instantly.

## 6. Shot grammar
| Sentence role | Treatment |
|---|---|
| Hook (first 2–3 s) | `baicai_side_title` — one of her words as the tall title, the rest of the line green underneath; captions hidden |
| Plain talk / claim | graded face + caption; `push_in` (to 1.1, `vignette: false`) with `keywords` for the phrase that matters |
| Pain / complaint / "it sounds like…" | `baicai_mono_note` with the phrase on the arc |
| Number / percent | `baicai_ring_stats` (only numbers she says; one ring is fine) |
| Product / point / definition | `baicai_point_card` (chip POINT n, note = her sentence, title = name) |
| Example / proof / named apps | `baicai_doc_cards` (one card per thing she names, on that word) |
| List / options | caption with each option as a keyword (green + bigger as she says it) |
| Ending / CTA | `baicai_end_frame` (brand or theme word as serif title, her last half-line green) |

## 7. Signature moves
- `baicai_side_title` — open; Anton word beside the face (his "SEVEN").
- `baicai_mono_note` — B&W shrink into black + green arc hand note (his 吐槽 → 缩小画面).
- `baicai_doc_cards` — documents / messages fly in on black, round face window (his 资料引入). No screenshots needed.
- `baicai_point_card` — low-poly black, white chip, framed box, cutout popping out (his 观点.1 / 抠像出镜). Needs matte.
- `baicai_ring_stats` — frosted panel with donuts on the body (his 2026XX 数据). Captions hidden.
- `baicai_end_frame` — heavy serif title + green line, speaker in a white frame with the head out (his 口播视频). Needs matte.
- `push_in` — slow push carrying keyword captions.
Allowed when material exists: `broll_circle` (B-roll + round inset; pack.css thins the ring to 5 px), `feather_circle`,
`spotlight`, `letterbox`, `text_sandwich`.

## 8. Density & pacing
The reference is a showreel (a move every 2–3 s). For a real 45–60 s short: a move every 6–10 s, each 2.5–5 s,
with 4–6 s of graded face + caption between. Never two black-backdrop moves back to back (put a face shot between
`baicai_doc_cards` and `baicai_point_card`). At most one ring panel and one mono shrink per 30 s.

## 9. Brand adaptation
Brand colour may replace `accent` if it reads on black (else keep green). `brand_font: none`: Anton / Inter / Playfair
stay. Brand name goes in `baicai_point_card` title and `baicai_end_frame` title; app logos only as card icons. The grade,
black backdrops, white frames and caption treatment never change.

## 10. Variation
Openings: (a) `baicai_side_title` on the first key word; (b) `baicai_mono_note` on an opening complaint, then face;
(c) `baicai_end_frame` used as an opener (title = topic, green line = her question), then cut to the face.
Endings: (a) `baicai_end_frame` with the brand; (b) `baicai_point_card` with the takeaway, then 1 s face;
(c) plain push-in with the last line in green keywords.

## 11. Common failures to check
- Thick stroke or pill on captions (must be thin white + halo). Fallback font (check Anton's narrow caps and Inter's "y").
- Ungraded footage next to graded (a template that sets its own `filter` on `#baseImg` — check), cutout ungraded (the
  pack effects grade `#personCv` themselves).
- Caption over a white card (doc cards move it down; any other white element must avoid y 1100–1220).
- Hook title over the face: keep `maxw` ≤ 560 and the face in the left third; sub wraps instead of running onto hair.
- Cutout with the source frame's hard edge showing (point card feathers the left edge; keep `personX` ≥ 790).
- End frame not filled edge to edge (the template forces scale ≥ frame width).
- Invented numbers in rings or invented text on cards — everything must be her words or the things she names.
- **Platform safe zone** (TikTok / Reels / Shorts UI covers it): no text, sticker or card text in the right 120 px (x > 960 — like/comment/share buttons), the bottom ~280 px (y > 1640 — description; only the running caption may sit low) or the top ~150 px (status bar / search). Check every still against those three bands. Pack effects keep to it: side title right:120 / left:60, doc cards 760 wide, point-card box x 56–960 and bottom ≤ 1630, end-frame title fit to 900 px, mono-note arc narrowed/shrunk to x 60–960.
