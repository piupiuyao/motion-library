# shipinhao — 视频号花字 (Channels Sticker-Pop)

## 1. Essence
A hand-edited Chinese 视频号 talking-head short, in English. The key phrase is **slammed onto the frame as 花字**:
2–4 short lines of chunky heavy type, white mixed with yellow, slightly tilted, different sizes, placed *around the head*
(above it, beside it, under the chin), with a **hard offset drop shadow, never a fat black stroke**. On topic changes the
presenter becomes a **sticker**: cut out, thick white outline, slapped on a loud background (candy polka dots, black/white
gingham, crumpled paper, hot magenta). Between beats, plain face with a small clean white subtitle.

Reference: 我李哥豆儿「4 套剪辑手法打破扁平画面」(`~/Desktop/95_1793056112.mp4`, the main source) and 剪辑师白菜「告别廉价口播」
(`~/Desktop/94_1793056051.mp4`, the quiet subtitle layer). Frames in `ref/`.

**It is NOT** tb2_zh (default 黑体 + 7px black stroke on everything, stroked captions); NOT nischa (calm, one accent, lots of
air); NOT a karaoke-caption pack (no word-by-word coloured pill captions). Text colour is white + yellow; colour lives in
the backgrounds.

## 2. Layers & framing
1. Background: original footage (default) · or a pattern card behind the cutout (`shipinhao_sticker`).
2. Behind-person text (optional, `behind: true`): a title the head may overlap.
3. Person: original framing for face beats; as a sticker scaled 0.9, pinned to the bottom, pushed down 60 px, 18 px outline.
4. 花字 / icons in front.
5. Subtitle (hidden while 花字 is on screen — in the reference the 花字 *is* the subtitle).
Face stays clear: no text over eyes/mouth. Text zones at 1080×1920: top band y 150–420, side gap beside the head
(x 640–1080 when the head is centre-left), chin band y 950–1350.

## 3. Colour rules
- Text: **white #ffffff** and **yellow #f5e10a** (`--accent`, sampled from ref 位置/网感). One line per beat may be **orange #f39a0b**
  or **blue #2f63ff** (`--accent-2`, ref 立刻拉满) — never both in one shot.
- Typical beat: line 1 white, line 2 yellow (the word that matters). Never a whole block of yellow.
- Shadow: #141414 hard offset. Dark text (ink) only on a colour block.
- Backgrounds carry the colour: mint #d6e4d8 + dots (#f27ba8 #f5d90a #4fc3c8 #f6a33a #7aa7f2), gingham #141414/#f4f2ee,
  paper #e8e2d4, magenta #ff3fa4→#5a0738, pink #f2a7c3. Max one pattern per shot.
- Outline: white (default), light blue #a9cbef or yellow #f7e86a (ref 95 opens with blue/yellow outlines).

## 4. Type & captions
| Role | Font | Size @1080 | Case | Treatment |
|---|---|---|---|---|
| 花字 main | **Lilita One** (PkDisplay) — heavy, slightly condensed, soft corners; closest Latin to 站酷快乐体 / 优设标题黑 | 110–210 px, auto-fit to width box (default 960) | UPPER | `text-shadow: .035em .05em 0 #141414, soft .18em blur`; tracking +.01em; line-height 1; rotate −5…+5° |
| Giant word | **Anton** (PkPoster) — ultra-tall condensed, like the cropped 位/置 | 300–420 px | UPPER | same shadow; allowed to run off the frame edge |
| Brush accent | **Knewave** (PkHand) — dry brush, like 打破/画面 | 70–110 px | sentence case | white, same shadow, rot −4…−6°; max 1 line per shot |
| Subtitle | **Figtree 600** (PkBody) | 52 px, line-height 1.22 | as spoken | white, no box, no stroke; `0 2px 3px rgba(0,0,0,.7), 0 0 16px rgba(0,0,0,.45)`; keyword = yellow 800 |
- Subtitle sits at top 1250 px (chest), centred, max 900 px wide, ≤4 words per line (engine chunking).
- 花字 lines: 1–4 words each, words *she says*. Line gap ≈ 1.05 × size; lines may overlap slightly.
- Library effects are re-skinned by pack.css: any `.display` text loses its stroke and gets the hard shadow.

## 5. Motion feel
- 花字 **stamp**: each line lands at its spoken word, scale 1.7 → 1 with a springy settle (`ease.pop`, 0.32 s), opacity in
  over the first 0.06 s. Lines arrive one by one, never all at once. Optional `slide` from the left.
- Exit: whole shot fades in the last 0.2 s; a line may leave early at its `out` word (hook beat 1 → beat 2).
- Sticker: person drops in at 1.15× and −4° → 0.9×, 0° (`ease.back`, 0.38 s). Background appears on the cut, no wipe.
- Icons pop 0.3 → 1 with the spring, tilted −6/+4/−3°.
- Nothing drifts or floats once landed. No slow ken-burns. Fast in, still, cut.

## 6. Shot grammar
| Sentence role | Treatment |
|---|---|
| Hook (first 3–6 s) | `shipinhao_huazi` with `mono: true`: two white/yellow lines over the head, then the second beat under the chin |
| Plain talk | face + subtitle only |
| Claim / punchline | `shipinhao_huazi`: small white line top + one **giant Anton word** beside the head, cropped by the edge |
| Example / proof (apps, tools) | `shipinhao_sticker` on `dots` with `icons` popping as she names them |
| List / options | `shipinhao_sticker` on `gingham`, items placed around the head (top / side / chin), last one in brush |
| Contrast / two words | `split_word_head` or `text_sandwich` (word behind the head) |
| Pointing at something | `dashed_focus` (white dashed circle + vertical label) |
| Emotional / "remember this" | `scanline_word` or `shipinhao_huazi` with `dim: .2` |
| Topic change | `shipinhao_sticker` (`magenta` / `pink`), title behind head |
| CTA / ending | `shipinhao_sticker` on `paper`, brand line on top, slogan under the chin, brush last line |

## 7. Signature moves
- `shipinhao_huazi` — the look. Every 3–6 s on the phrase worth remembering.
- `shipinhao_sticker` — topic change, proof, list, ending. 2–4 per minute.
- `dashed_focus` — once per video, when she says "look / this / reads".
- `scanline_word` — once, for the line that closes an argument.
Allowed (re-skin automatically): text_sandwich, split_word_head, keyword_pop, hook_bigword, mono_shrink, frame_layer, doc_fly,
broll_circle, paper_props, push_in, end_title, tick_cross_tags, bg_switch, sticker_outline, cutout_card, data_chart,
punch_zoom, icon_cards, phone_notification.

## 8. Density & pacing
- 50–60 % of runtime has a pack effect, in bursts of 1.5–4 s. 2–5 s of quiet face + subtitle between bursts.
- Never two sticker shots back to back; alternate sticker ↔ 花字 ↔ face.
- Max 4 花字 lines on screen; max 2 lines per 1.5 s.
- Background pattern never repeats in consecutive sticker shots.

## 9. Brand adaptation
- Brand colour may replace `--accent-2` (the blue line) and the sticker outline; yellow + white type stays.
- Brand font: **none** (`brand_font: "none"`) — the type system is the pack.
- Brand name in its own casing in subtitles; in 花字 it's uppercased like everything else (e.g. THAT'S TONEBIRD).
- App icons: official full-colour logos on white tiles (iconTile), with the pack's hard shadow.

## 10. Variation
Openings: (a) mono hook — 2 lines over the head then 2 under the chin; (b) sticker on magenta with the pain point behind
the head; (c) giant Anton word beside the face + small white line on top.
Endings: (a) paper sticker, brand line + slogan + brush line; (b) gingham sticker with a single yellow line and the icons;
(c) `end_title` re-skinned (big white title, small yellow sub).

## 11. Common failures to check
- Font fallback: Lilita's soft rounded corners and Anton's tall condensed shapes must be visible; if text looks like Helvetica
  the font failed.
- Any black stroke around letters on footage or dark patterns = wrong (only the offset shadow); on light patterns the dark outline is automatic.
- 花字 over the mouth/chin, or a sticker title colliding with the hair — move `y`.
- Subtitle showing at the same time as 花字 (should be hidden unless `caption: true`).
- Yellow everywhere; more than one extra colour line; more than 4 lines.
- Words not from the script; long sentences as 花字 (≤4 words per line).
- Busy pattern behind white text without the shadow, or a pattern behind a face beat.
- Lines all appearing together instead of on their words.
- **Platform safe zone** (TikTok / Reels / Shorts UI covers it): no text, sticker or card text in the right 120 px (x > 960 — like/comment/share buttons), the bottom ~280 px (y > 1640 — description; only the running caption may sit low) or the top ~150 px (status bar / search). Check every still against those three bands. 花字 lines are fitted/clamped automatically (x 60–960, y 150–1640): a line that needs the edge will come out smaller, so keep lines short instead of fighting it. On light patterns (paper, gingham, dots, pink) white/yellow lines get a dark outline automatically — don't add a dark `bg` block.
