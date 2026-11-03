# Sticker Explainer (`sticker`)

## 1. Essence
The presenter is cut out with a thick white sticker outline and stands on warm off-white grid paper. Ideas show up as
small die-cut **pearl stickers**: blue rounded words, a light handwritten aside, one semantic emoji. One
**iridescent glitter title** per idea. Each sticker sways gently once it lands. Lists build one row at a time with
the person moved aside. A small "01 name" chapter badge sits top-left. **Most of the time the picture stays quiet.**

Reference: Zara Zhang, https://x.com/zarazhangrui/status/2116281211962454056 (frames in `ref/`), with the written rules
from the MIT skill github.com/ryanchenxr/sticker-talk-edit. The original is 16:9. This pack re-lays it out for 1080×1920.

**What it is NOT**: not a caption-driven short (no karaoke blocks, no bold black outlined words, no all-caps bars).
Not the dark glassy cutout look (`cutout_card`). Not loud: no shake, zoom punches, floating emoji or flashing colours.
Next to a "clean finance" pack it is softer and more playful. Next to a 视频号 pack it is far quieter.

## 2. Layers & framing
Back to front: paper background (colour + 44 px grid) → hero title (in `#back`, so it rises from behind the head) →
white-outline cutout → stickers, badge (`#front`) → caption strip.
- Cutout: white outline 24 px on the matte (≈ 20 px on screen after scaling), no dark halo. The original background is never shown.
- **center** layout: person scale .86, pinned to the bottom. Head top ≈ y 590, face ≈ y 650–950.
- **left** layout (lists, proof): scale .72, head ≈ x 300, head top ≈ y 820. The free area is the upper right (x 420–1040, y 200–900).
- If the body is cut by a frame edge (an arm at x=0), that edge stays glued to the frame (detected from the matte), so no floating cut shows.
  Otherwise the head is moved to x 540 (center) or x 300 (left).
- Safe zones: badge at y≈128. Stickers between y 200 and 1300. Nothing over the eyes or mouth. The bottom 380 px is for the caption strip.

## 3. Colour rules
- Paper: cream `#F2EFE6` is the default. Each chapter may move to a near-equal tint: lilac `#E8E6F4`, blush `#F5EBE6`.
- One ink: blue `#3340D4`. Words use a gradient `#262EC2 → #3340D4 → #6A72F2`. Number chips, check marks and "?" chips are solid blue.
- Coral `#F2625A` only for negation (a struck-through word). Never as decoration.
- Iridescence (pastel violet/pink/peach/yellow/mint/cyan/periwinkle) only on the hero title and big chapter numbers, always with a blue outline.
- Strong backgrounds: `blue #2F37C8` for one key relation, `holo` gradient for the final concept. Use each once per video at most.
- Emoji and app icons keep their real colours. The person, background and screenshots are never tinted.

## 4. Type & captions (1080×1920)
- Rounded face: **Nunito 900** (stickers, hero, numbers, badge) and **Nunito 800** (captions). It is the closest OFL match to the reference's SF-Rounded-like heavy rounded sans (two-storey a, round terminals).
- Hand face: **Kalam Bold** for asides ("don't know how to start", list titles). It has a light marker slant and is never just a slanted version of the main face.
- Sizes: hero 104–140 (shrinks automatically to fit 1000 px), chapter number 240, keyword 70, hand 62, list row 60, list title 64, badge 44, icon tile 170 with a 50 px label.
- Case: lower-case sentence style, as in the reference ("seen the message"). No all caps, no tracking.
- Sticker paper: a die-cut sheet that follows the glyphs (round joins, pad ≈ .21× size), near-white core, pearl rim (pink/cyan/mint/lilac), a few fixed specks, soft shadow (blur .28× size, ≈17% opacity).
- Hero: silver holo sheet with dense glitter, rainbow letter fill, 0.12× size blue outline, a wide soft sheen drifting slowly, sparkles on the letters breathing slowly.
- Captions (`caption_style: pack`): a pearl strip at y 1500, Nunito 800 50 px. Unspoken words `#A9AEEA`, spoken words `#3340D4`, keywords as a white-on-blue chip. Up to 4 words per line. The reference has no captions. Keep them for sound-off viewers, but they must stay this small and quiet.

## 5. Motion feel
- Entry: 0.24 s fade + scale .95→1 + a 14 px settle (`ease.out`). Hero: 0.34 s with one small overshoot, rising 150 px from behind the head.
- **Sway while on screen**: the whole sticker moves as one piece (paper, ink, emoji, shadow). Rotation ±1°, ±2.4 px float, ±2.2° Y-tilt, period 3.4–5.6 s, with a phase taken from the sticker's id. List rows sway at .55×, the badge at .2×.
- Exit: 0.16 s fade when the `until` word arrives or the shot ends. The next idea starts on a clean picture.
- Person moves center ↔ left only at a semantic boundary, over 0.42 s (`ease.inOut`). Never per sentence.
- Never: per-letter jitter, per-frame random noise, bounce on every word, camera shake, zoom punches.

## 6. Shot grammar (sentence role → treatment)
| Role | Treatment |
|---|---|
| Hook / topic | `sticker_stage` with `hero` (2–4 spoken words) + at most 2 side stickers |
| Plain talk, transitions | `sticker_stage` with nothing but the badge: the picture stays quiet, captions carry it |
| Term, question, feeling | `sticker_stage` with 1 sticker (+ emoji) next to the head, removed when the sentence ends |
| "Not A but B" / what it shouldn't cost | `kind: "neg"` (coral strike) for A, a blue sticker for B. Left = negated when the speech is a real correction |
| List of n things | `sticker_list` (num / check / q), title first, one row per spoken item, n = what she says |
| New point | `sticker_chapter` big holo number + short title → becomes the badge. Following shots repeat `badge` |
| Proof / names an app | `sticker_stage layout:left` with `icon` stickers (official marks) on their words, or `pip_card` for a real screenshot |
| Number | hero sticker with the number |
| Ending / CTA | `sticker_stage bg:holo` with the name as hero + one hand line, only if she says it |

## 7. Signature moves
- `sticker_stage`: the base of every shot (cutout + paper + badge + stickers + hero). Use it for every second of the video.
- `sticker_list`: progressive list with the person bottom-left. Use when she counts things.
- `sticker_chapter`: chapter intro that shrinks into the top-left badge. Use only when the talk has real sections.
- Allowed library effects: `pip_card` / `phone_frame` (real screenshots as proof), `bg_switch`, `equation_build` (input → output).
  Check them by rendering, because they don't share the cutout stage.

## 8. Density & pacing
- Cover the **whole timeline** with sticker_* shots. A gap falls back to raw footage, which breaks the look.
- About 40% of the time shows only the cutout (+ badge). New stickers come only with a new idea: 1–3 per screen, at most 2 emoji groups.
- Hero titles: at most one per 10–15 s. Chapter intro: 1–2.5 s. A short keyword stays readable for at least 1–1.5 s.
- Every sticker's first frame is on its spoken word (`at`). Never reveal a list item before she says it.

## 9. Brand adaptation
- A brand may change only `accent` (the ink blue → brand colour, but it must stay dark enough on white paper) and the hero rainbow stays.
- `brand_font: none`: the rounded and hand faces never change. Brand logos come in as `icon` stickers or a hero word at the end.
- Never change: white cutout outline, light grid paper, pearl die-cut paper, one hand face, quiet sway.

## 10. Variation
Openings: (a) hero title rising from behind the head + one aside. (b) the bare cutout for 1–2 s, then one emoji sticker on the question.
(c) a struck coral word on the left, then the real claim on the right ("not A → B").
Endings: (a) holo background + name hero + hand line. (b) a recap list re-using the chapter numbers. (c) the bare cutout with only the badge, then a blue-background relation (`bg: blue`, two stickers joined by a hand note).

## 11. Common failures to check
- A text font fell back (Times/Helvetica): the rounded "a" must be two-storey with round ends, and the hand must look like Kalam.
- A sticker over the eyes or mouth. Wide side stickers are lifted above the head automatically. Check the face in each still.
- Hero cut off at the frame edge. Keep it to ≤4 words; it auto-shrinks to 900 px.
- A gap between shots shows the original street background.
- Emoji drawn as empty boxes (the colour emoji font is missing on that machine).
- Too many stickers at once, or stickers left over from the last sentence. Use `until`.
- Coral used for something that isn't a negation; `neg` on "not only A".
- The left frame-edge cut of the body visible as a floating straight line (layout must keep that edge glued).
- Captions grown big/bold or moved over the face. They must stay a small strip at y 1500.
- **Platform safe zone** (TikTok / Reels / Shorts UI covers it): no text, sticker or card text in the right 120 px (x > 960 — like/comment/share buttons), the bottom ~280 px (y > 1640 — description; only the running caption may sit low) or the top ~150 px (status bar / search). Check every still against those three bands. STK keeps every sticker inside x 60–960 / y 150–1640 (explicit `x`/`y` too) and sheets ≤ 900 px wide; the chapter badge sits at y 190.
