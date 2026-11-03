# Editorial Paper (`vox`) — style bible

## 1. Essence
An explainer printed on warm newsprint. At the beats that matter, the person slides into the bottom half and a
sheet of paper takes the top half: a light serif line, one black-weight serif phrase under a highlighter swipe, and
one exhibit (a paper card, app tiles, dashed numbered slots). Between beats: the plain face and quiet caps captions.
Calm, editorial, handmade — motion is stepped (stop-motion), never glossy.

Reference: Nate Herk's herk-edit-kit (MIT) — the curiosity reel (`ref/curiosity-reel-1.jpg`, `-2.jpg`: beige paper top
half, person bottom, accent rule on the seam, ink line + accent line headline, dashed `01 … ?` slots, stacked paper
card) and its `style-library/01-vox-explainer` type system (Fraunces / Archivo / Caveat, paper #efe9dc, ink #17130e,
grid + grain, highlighter sweep). Vox cards are 1920×1080; here they are re-laid as a vertical split.

**What it is NOT:** not a hype/meme edit (no stroked words, emoji, bouncing captions); not glossy tech (no glass, glow,
neon, gradients, blurred shadows); not a sans headline style — statements are always serif; never pure white or black.

## 2. Layers & framing
- **Paper panel** (top 0–954 px): `--paper` #efe9dc + 72 px grid at 7 % ink + multiplied fractal grain (38 %) + faint
  warm vignette. Content inset 96 px left/right.
- **Seam**: 6 px rule at y 954–960 in `--accent` (or `--accent-2` on the ending).
- **Person** (bottom 960–1920): the original frame moved down 640 px and clipped at the seam — face lands ~y 1240,
  chin ~1400. No cutout needed (no matte), no outline.
- **Plain shots**: full original frame, untouched.
- **Captions** on top of everything at y 1470.

## 3. Colour rules
- Neutrals: paper #efe9dc (sheet), ink #17130e (all type), muted ink 55 % (kickers, slot numbers, `?`).
- **One accent per beat**: burnt orange `--accent` #c8562e (seam, highlighter at 42 % mix, card note, starburst, filled slot
  number). Green `--accent-2` #5f9327 only for the payoff/ending beat (`"color": "accent-2"`), never in the same frame as orange.
- Red #e23b2e (`--red`) only for wrong / loss marks (tick_cross_tags crosses).
- App logos keep their official colours, inside off-white #fbf8f1 tiles.

## 4. Type & captions (1080×1920)
| Role | Font | Weight | Size | Case / tracking |
|---|---|---|---|---|
| Kicker | Archivo | 700 | 30 px | CAPS, 0.16em, muted ink |
| Headline line | Fraunces | 300 | 92–104 px (`size`) | sentence case, −0.03em, lh 1.02 |
| Key phrase | Fraunces | 900 | 1.12 × headline (auto-shrinks to one line) | sentence case, −0.035em, highlighter behind |
| Card label | Archivo | 800 | 40 px | CAPS, 0.06em |
| Card / slot text | Fraunces | 600 | 50–54 px | sentence case |
| Small labels (app names, card note) | Archivo | 700 | 28–30 px | CAPS, 0.12–0.16em |
| Margin note | Caveat | 700 | 64 px | handwritten, accent, −4° |

Captions: Archivo 800, 54 px, CAPS, 0.015em, in one warm-ink box (rgba(23,19,14,.80), radius 6, padding 14/28, 2 px
paper-tint edge). Unspoken words 58 % paper, spoken words #fbf8f1, keywords light orange #f2925e (whole phrase only).
Lines of 2–4 words (engine chunking), centred, top 1470 px — below the chin in both full and split framing.
No stroke, no hard shadow.

## 5. Motion feel
- Stop-motion: the split opens in 0.42 s, quantised to 6 steps; closes in 0.32 s.
- Kicker: 4-step slide from −22 px at 0.40 s. Headline: rise 26 px + fade at 0.48 s, key at 0.62 s (cubic out).
- Highlighter: wipes left→right in 5 steps over 0.42 s, on the spoken key word (`key_at`) or at 1.0 s.
- Exhibits pop with a back-ease (scale .6→1, small rotation) as their word is said; slots go dashed `?` → solid, filled.
- Ambient: grain boils at 8 fps; starburst ticks 7° at 4 fps. Nothing glides, nothing fades slowly. Faces never move.

## 6. Shot grammar
| Sentence role | Treatment |
|---|---|
| Hook (first 3–6 s) | `vox_split_title` — kicker = the question, title + key = her line, card = the situation |
| Claim / punchline | `caption_highlighter` on the caption (face stays clean) or `vox_split_title` with no exhibit |
| List (2–4 items) | `vox_split_list` — slots fill as each item is said |
| Number | `number_roll` (re-skins to Fraunces) or `vox_split_title` with the number as `key` |
| Example / proof (names apps/tools) | `vox_split_title` with `apps` |
| Contrast (right vs wrong) | `tick_cross_tags` / `strike_list` (red only for the wrong side) |
| CTA / ending | `vox_split_title` with `"color": "accent-2"`, tagline as title + key |
| Plain talk | face + captions only |

## 7. Signature moves
- `vox_split_title` — the look. Hook, proof (apps), card for a situation, ending. Key phrase ≤ 4 words.
- `vox_split_list` — the reel-1 dashed slots. Any 2–4 item list; item text ≤ 5 words (auto-shrinks).
- Allowed library effects (they read the tokens): `caption_highlighter` (orange marker on the caption — verified),
  `push_in`, `article_highlight`, `tick_cross_tags`, `number_roll`, `strike_list`, `paper_tear`, `phone_notification`.

## 8. Density & pacing
3–5 paper beats per minute, at turning points only (hook, proof, list, ending). At least ~8 s of face between two
paper beats; one small caption move between them is fine. 10–20 s of plain face is normal.

## 9. Brand adaptation
A brand changes `--accent` (seam, highlighter, notes) and optionally `--accent-2`; `brand_font` is `none` — the
Fraunces/Archivo pairing never changes. Paper, ink, grid, grain, caption box stay. Logos only as official app tiles
or on the ending card text.

## 10. Variation
Openings: (a) split + question kicker + situation card (as tested); (b) split, title + key only, centred, no exhibit;
(c) plain face 1–2 s with a `caption_highlighter` hook word, then the first split on the second line.
Endings: (a) green split with the tagline; (b) split with a paper card carrying the product name as label + tagline
as text; (c) plain face, last line highlighted with `caption_highlighter`, no split.

## 11. Common failures to check
- Headline wraps into the exhibit → shorten title or lower `size`; the exhibit auto-places 50 px under the headline.
- Key phrase on two lines (highlighter breaks) — it auto-shrinks; if it drops under ~80 px, shorten it.
- Two accents (orange + green) in one frame; red used for anything but "wrong".
- Fallback fonts (Times/Arial look) — Fraunces has a soft, wedge-serif "y"/"r"; Archivo caps are wide.
- Caption over the mouth: caption top is 1470, OK for faces framed like the test; very low-framed faces need a check.
- Exhibit text invented beyond what she says; UI illustrations must be marked as illustration in the brief.
- Paper beats back to back with no face time in between.
