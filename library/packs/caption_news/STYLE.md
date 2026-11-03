# Caption News — style bible (1080×1920, English)

Reference: lemo-opuscar `styles/caption-news` ("The Bee Ledger"; code/docs MIT, demo CC BY 4.0) — grammar of
mid-2010s captions-first social news. Reference frames in `ref/`, our frames and `frames/compare.jpg`.
In the reference the Chinese line is the big caption and English is a small line under it; **our output is English,
so the English caption is the main caption (big)** and there is no second-language line.

## 1. Essence, and what it is not
1. **Sound-off first.** Every beat reads from picture + caption alone; the voice adds pace, not information.
2. **The caption is the shot.** One big ivory line in the lower band, arriving chunk by chunk, at most one keyword on a honey-yellow block.
3. **A small news package, used sparingly**: channel bug + source tag top left, lower thirds, a lit 3-panel grid. Flat, square, no rounded cards.
4. **Real footage, one grade.** The presenter is the footage; nothing is cut out or stylised.

Not **Hormozi/CapCut captions** (no thick black stroke, no all-caps word-by-word colour flashing, no bounce, no emoji).
Not a **TV news package** (no anchor desk, ticker, crawl, studio, rundown). Not a **keynote** (no centred title + bullets,
no page turns). Not the glossy creator look (no glass cards, no gradients on type, no rounded pills).

## 2. Layers and framing
| Layer | What | Position (1080×1920) |
|---|---|---|
| Footage | the presenter, full bleed, graded (§3) | face stays in y 300–850; never shrink the person into a frame |
| Veil | bottom gradient `#0E0E0C` 0 → 50 % at y 1440 → 78 % at y 1920 + soft dark radial from the bottom-left corner (on `#back`, under cards) | always on |
| Package | bug (x 64, y 132, 74 h) + source tag under it (46 h); a 55 % → 0 top gradient over 360 px under them | top safe area, only in the hook / data moments |
| Cards | grid / lower thirds | chest band y 900–1340, x 72–1008, left-aligned |
| Caption | left aligned at x 72, max width 936, bottom edge y 1670 (slam card: last baseline y 1660) | lower band, always under the chin |

Vertical is a different layout, not a crop: the caption stacks on up to two lines in the lower band, the bug moves
into the top safe area, cards sit at chest height and bleed toward the left margin, never centred.

## 3. Colour rules
- Ivory `#F7F5EF` = all type. Ink `#0E0E0C` = panels (at 78–88 % opacity), text on honey. Honey `#FFC21A` = the point.
- **One accent.** Honey appears only as: the keyword block (one per caption), the bug block, bars/tabs of the package, the lit state of a grid panel. Never as text colour for whole lines.
- Red `#FF4A3D` (`--accent-2`) only for a loss / the bad number. Grey `#8D8B83` for labels and units.
- Footage grade: `contrast(1.07) saturate(0.92) brightness(0.98)` + 6 % warm (`#FF9A3C`) soft-light layer (pack.css on `#base`).
- A brand changes only `--accent` (keep it a single saturated, light colour with ink text on it); ivory/ink never change.

## 4. Type & captions
- Font: **Inter Tight** (OFL) only — 800 caption & labels, 900 bug/numbers, 500 source text. Sentence case for captions; package labels in caps with +0.06–0.08 em tracking.
- Running caption (engine, `#caption.pack`): 800, **88 px**, line-height 1.06, tracking −0.02 em, ivory, shadow `0 4px 20px rgba(0,0,0,.6)` + `0 1px 3px rgba(0,0,0,.3)`. **No stroke, no pill.** Engine lines are ≤ 4 words; unspoken words keep their slot but are hidden, so the line builds left → right as she speaks.
- Keyword: square honey block, ink text, padding 0 0.14 em. One per caption, a phrase that reads like the headline of the sentence.
- Slam card (`caption_news_slam`): 800, **96 px** (verdict line `!` = 118 px), 2–3 chunks per caption (`a|b|c`), each chunk slams on its first spoken word: scale 1.3 → 1 in 0.13 s (back ease, overshoot 1.6), opacity full in 0.04 s; keyword block wipes left → right in 0.12 s starting 0.05 s after the chunk, text turns ink. Chunks wrap at 936 px — max two rows.
- Package type: bug name 900 36 px ink on honey, topic 800 30 px ivory caps on 66 % ink; tab/label 900 28 px; lower-third line 800 52 px (46 px if > 24 chars); grid label 800 40 px.

## 5. Motion feel
- Family: **slam and wipe**. Entrances: chunk slam (0.13 s back), honey wipe left → right (0.12 s), lower third clip-wipe (0.22 s ease-out), panels rise 90 px staggered 0.1 s (0.3 s ease-out), bug slides 40 px from the left (0.2 s).
- Exits: hard (0.1–0.12 s fade at most). Nothing floats, bobs, rotates or loops.
- Camera: slow push only (`push_in`, ≤ 1.12×, no vignette) or one punch-in (0.3 s to ~1.2×) on the key word.
- Transition whitelist: hard cut (default), 1–2 frame white flash (`shutter_flash`) on the turn, card sliding in from the right, split opening from its divider, punch-in. **No dissolves, no page turns, no 3D flips, no zoom-blur whooshes.**
- Never moves: the caption baseline, the bug position, the honey colour.

## 6. Shot grammar
| Sentence role | Treatment |
|---|---|
| Hook (first 3–6 s) | `caption_news_slam` with `bug`; chunks slam on the words, keyword on the question/pain |
| Plain talk | running caption only (face + caption); optional keyword on one phrase per 5–8 s |
| Emotional peak / pain line | `push_in` (≤ 1.12, `vignette: false`) + keyword on the phrase |
| Mentions of tools / three things | `caption_news_grid` (3 panels, app logos, light on each name) |
| List / ways / steps | `caption_news_lower` (tab + stacked lower thirds, wiped in on each phrase) |
| Number | `number_land_block` or `number_roll` (re-skinned honey); add `tag` (source) on the slam card if the figure has a source |
| Proof / document / screenshot | `article_highlight` or `snippet_stack` (needs real assets) |
| Contrast / before–after | `split_vertical` or `side_split` (bad half darker), never two cards at once |
| Turn | one `shutter_flash` or `punch_zoom`, then a held beat of face + caption |
| CTA / ending | `caption_news_slam`, last line `!` big, keyword on the final phrase |

## 7. Signature moves
1. `caption_news_slam` — the caption card itself (hook, verdict, ending). The look.
2. `caption_news_grid` — lit grid: three tools / three causes, each panel lights on its word.
3. `caption_news_lower` — lower-third stack for lists, a place, a date, a speaker's name.
4. `push_in` — slow push under a pain or verdict line, no vignette.
Allowed: `punch_zoom`, `shutter_flash`, `freeze_photo`, `split_vertical`, `side_split`, `number_roll`, `number_land_block`, `article_highlight`, `snippet_stack`, `zoom_jumpcut`.

## 8. Density & pacing
- Caption on every spoken word; caption lines change ≤ every ~2.5 s where possible.
- One package graphic (slam / grid / lower) per 8–12 s at most; 40–60 % of the runtime is face + caption only.
- A strong action within 0.5 s of each graphic's start (first chunk slam / first panel rise).
- Never two things competing: while a slam card is up the running caption is hidden; while a grid/lower is up, no keyword on the caption.

## 9. Brand adaptation
- Brand = `--accent` only (the honey slot). Bug name = brand name in caps, topic = what the video is about.
- Logo only through app/brand icons in the grid (official logos from the icon library), never in the caption.
- Never changes: Inter Tight, ivory type, ink panels, square shapes, the caption position, the grade. `brand_font: none` — a brand font does not replace Inter Tight.

## 10. Variation
**Openings:** (a) slam card + bug on the hook question; (b) the biggest number on frame 4 as a honey block (`number_land_block`) then the slam card; (c) a freeze on her first gesture (`freeze_photo`) with the question as the slam card.
**Endings:** (a) verdict slam card, last line big with the keyword on the block; (b) back to the hook's phrase, now answered (same keyword block, new words); (c) lower-third stack recap of the 2–3 things said, then a one-line slam card.

## 11. Common failures (check every still)
- A stroke or outline crept in (template font styles) — captions must have shadow only.
- Two keywords lit in one line, or a keyword on an empty word (thing, way, problem).
- Caption over mouth/chin (caption bottom must stay ≥ 250 px from the frame bottom and below y 1400).
- Ivory text on a bright patch with the veil missing (check `#back::before` is present; a template that paints `#bg`/`#back` opaque can hide it).
- Rounded pills / glass cards / gradients from library effects that are not in the allowed list.
- Lower-third text wider than 936 px (shorten or `size: 46`).
- Fallback font (Helvetica/Arial look, wider spacing) = pack fonts did not load.
- Dissolves, page turns, 3D flips, spinning icons.
