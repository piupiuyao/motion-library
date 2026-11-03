# Clean Finance (`nischa`) — style bible

## 1. Essence
Calm, premium UK personal-finance explainer. The person talks; when a number or a mechanism needs explaining, a
light-grey grid panel slides down over the top half and a diagram builds in it word by word. Captions are a small
white pill on the chest. One colour: orange. One typeface: Poppins.
Reference: Nischa — https://www.youtube.com/shorts/kldKPSBuqH0 (panel diagrams) and
https://www.youtube.com/shorts/-m-GrB9f1aQ (caption pill, milestone chart, landing number). Frames in `ref/`.
**What it is NOT:** not Hormozi/hype (no huge bouncing captions, no strokes, no emoji, no zoom punches); not a
"glass card" tech look (no blur, gradients or dark cards); not a news lower-third. Nearest other look = any
white-pill caption pack — the difference here is the half-screen grey diagram panel and the single orange.

## 2. Layers & framing
- Person: full frame, never cut out, never zoomed. During a panel shot she is pushed down 480 px (`shift: 480`).
- Panel (the "explainer board"): 1080×900 at the top, `#ececec` with a 68 px grid at 2.8 % black. Slides in from the
  top in 0.45 s while she moves down, slides back out at the end of the shot.
- Diagram content lives inside the panel only (title ~y 240, diagram y 300–800).
- Caption: on top of everything. Face shots y 1098 (chest, below chin); panel shots it sits on the seam (top 868).
- Chest number (`nischa_number_land`): y 1050, replaces the caption while it is on screen.

## 3. Colour rules
- Neutrals do 95 % of the work: panel `#ececec`, cards/boxes `#ffffff` with `#d2d2d2`–`#dedede` 2–3 px borders,
  text `#111111`, notes `#777`–`#8a8a8a`, grey bar fill `#c4c4c4`.
- ONE accent `#fc8f00` (her orange). Allowed on: the "over the line" part of a bar, card headers, the big money figure
  in a card, the result of an equation, the block behind a landing number, the chart curve. Text on orange is white.
- Darker orange `#d97a00` only for caption keywords (readable on white).
- Green `#16a34a` only for a "done / restored" check (flow_chain `kind: done`). No other hues. A brand may swap
  the accent; nothing else changes.

## 4. Type & captions (1080×1920)
- Poppins (OFL) 400/500/600/700 only. No 800/900 is loaded, so every template asking for 800 renders Poppins Bold.
- Panel title: Poppins Bold ~46–54 px, sentence/title case, centred, tracking −0.01 em (library panel titles are
  scaled to 0.74 by pack.css). `nischa_panel_title` is the exception — a title-only board (780 high, person shift 413): headline
  Bold up to 104 px, auto-fit to ≤ 2 lines, short orange underline, sub SemiBold 40 px `#333`, optional orange tag 40 px.
- Diagram figures: Bold 60–110 px (auto in templates); notes SemiBold 22–26 px grey.
- Caption: Poppins Bold 42 px / 1.28, white pill `#fff`, padding 7×20 px, radius 12 px, soft shadow
  `0 3px 12px rgba(0,0,0,.16)`. Unspoken words `#b9b9b9`, spoken `#111` (karaoke). 1–4 words per line, lower case as
  spoken, punctuation kept. No stroke, no all-caps, no pop.
- Chest number: Poppins Bold ≤ 124 px, white with soft shadow; orange block sweeps in behind, number stays white.

## 5. Motion feel
- Easing: ease-in-out / ease-out only, no overshoot, no bounce. Panel in/out 0.45/0.35 s.
- Diagram parts enter on the word that says them: fade + 10–24 px rise, 0.3–0.4 s. Bars fill 0.8 s, curves draw 1.1–1.7 s.
- Captions swap instantly (0.08 s fade). The person never moves except the panel push-down. No camera moves.

## 6. Shot grammar
| Sentence role | Treatment |
|---|---|
| Hook (first 3–5 s) | `nischa_panel_title`: her opening question/claim as title, next line as sub |
| Claim / plain talk | face + caption only |
| Number / result | `nischa_number_land` (one per section); a computed sum → `equation_build` |
| Threshold / "once you cross X" | `threshold_bar` |
| Growth over time / stages | `milestone_curve` |
| Cause → effect, steps, options | `flow_chain` (max 2 cards visible; 3rd pushes the row left) |
| Example / proof (named apps, items) | `equation_build` with `icon` terms (A + B + C) |
| Contrast | `equation_build` (A vs B as terms) or `flow_chain` before → after |
| CTA / ending | `nischa_panel_title` with her last line (optional orange `tag`) |

## 7. Signature moves
- `nischa_panel_title` — open and close; always her words.
- `threshold_bar` — a limit being crossed; `mark` = the threshold she says.
- `equation_build` — "40 % + 20 % = 60 %" style; also lists of 2–3 named things with icons.
- `flow_chain` — "you earn → put £10k in pension → adjusted income". Head = 1–3 words, big = ≤ 9 characters.
- `milestone_curve` — compounding/time stages.
- `nischa_number_land` — one landing money figure, no label line.
Every diagram panel shot gets `"panel": 900, "shift": 480` and a `title` (pack.css relies on the title being the panel's first child). `nischa_panel_title` uses its own 780 default — leave `panel` out.
`karaoke_pill` is the same caption as the pack caption — do not add it as a shot (it would double the caption).

## 8. Density & pacing
One panel every 8–15 s, held 3–9 s; at least 6 s of clean face between panels. Max one chest number per 20 s.
A 60 s video: 4–5 panels + 1–2 numbers. Nothing else.

## 9. Brand adaptation
Brand colour replaces `accent` only (check white text on it is readable; if the brand colour is light, use its
darker shade). `brand_font: none` — Poppins stays. Brand name in her words in the end panel title; logo only as an
icon term in `equation_build` or as the end panel `tag` text. Panel grey, caption pill, layout never change.

## 10. Variation
Openings: (a) panel title with her question; (b) `threshold_bar` straight away with the topic as title (her tax
video); (c) clean face 2 s, then panel title on the claim.
Endings: (a) panel title with her last line + orange tag; (b) `nischa_number_land` on the final figure, then face;
(c) `flow_chain` ending in a green `done` card ("Full allowance restored").

## 11. Common failures to check
- Fallback font (look at "a", "t", "%": Poppins is geometric, round dots). Any 800-weight text looking extra-black = font not loaded.
- Caption pill doubled (karaoke_pill used as a shot) or caption under the panel (a panel template that doesn't publish `--panel-k/--panel-h` falls back to the fixed 868 seam → panel must be 900).
- Panel shot without `title` → its first element gets scaled.
- Orange text on white for long text, black text on orange, more than one accent.
- Number label in white over a light outfit — keep chest numbers label-free.
- flow_chain: the row is centred; when it overflows, the window jumps to start on a card (connectors leave with their card).
- Panel content too long: card heads > 3 words, titles > 6 words wrap.
- **Platform safe zone** (TikTok / Reels / Shorts UI covers it): no text, sticker or card text in the right 120 px (x > 960 — like/comment/share buttons), the bottom ~280 px (y > 1640 — description; only the running caption may sit low) or the top ~150 px (status bar / search). Check every still against those three bands. Panel titles start at y ≥ 150; the caption pill rides the panel seam in and out (`--panel-k`). Known gap: library diagram rows (flow_chain 3 cards, equation_build) are near full width and can reach x ≈ 1000 — keep card text short so the words stay left of 960.
