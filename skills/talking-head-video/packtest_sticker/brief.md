# packtest_sticker · full test edit (pack `sticker`, 贴纸讲解风)

English HeyGen presenter, ~53 s ToneBird ad. Calm, friendly, bright daytime street → the pack replaces the street with
grid paper anyway. Arc: hook (0–6 s) → pain points (6–21 s) → product (21–36 s) → how you steer it (36–47 s) → payoff + name (47–53 s).

## 审稿
| 句子（词编号） | 这句在干什么 | 观众此刻缺什么 | 配不配 | 为什么 |
|---|---|---|---|---|
| Ever had this happen? (0-3) | 钩子 | 没感觉：要一眼知道话题 | 配 | hero title rises from behind the head (opening a) |
| You've seen the message. (4-7) | 场景 1 | 没感觉 | 配 | one 👀 sticker on "seen" — the relatable beat |
| You know you should reply. (8-12) | 场景 2 | 什么都不缺 | 不配 | captions carry it; the 👀 sticker stays, nothing new |
| You just don't know how to start. (13-19) | 痛点核心 | 记不住 | 配 | hand aside "don't know how to start" (the reference's hand-note move) |
| A client is chasing you for an update. (20-27) | 痛点例 1 | 没感觉 | 配 | ⏰ "a client is chasing you" sticker, removed when the sentence ends |
| You want to explain, but it sounds like an excuse. (28-37) | 痛点例 2 | 什么都不缺 → 轻 | 配(轻) | only a hand aside "sounds like an excuse" on the turn |
| You want to turn down a partnership, but you don't want to burn the bridge. (38-52) | 痛点例 3（含否定） | 记不住 | 配 | "don't want to burn the bridge" = a real negation → coral struck "burn the bridge" |
| And if it's in a second language, (53-59) | 痛点例 4 | 什么都不缺 | 不配 | bare cutout; picture rests between ideas |
| you type, delete, and type again. (60-65) | 痛点动作 | 没感觉 | 配 | three tiny word stickers land on each verb, "delete" struck — the loop made visible |
| One message eats up half your afternoon. (66-72) | 痛点收尾（代价） | 记不住 | 配 | hero "half your afternoon" (2nd hero, 20 s after the first) |
| That's what ToneBird is for. (73-77) | 转折：产品出场 | 记不住 | 配 | sticker_chapter "01 ToneBird" — the talk's one real section break |
| It's an AI reply assistant. (78-82) | 定义 | 什么都不缺 | 不配(收角标) | the chapter title shrinks into the '01 ToneBird' badge here; captions carry the definition |
| It works right inside the tools you already use, like Gmail, Slack, and WhatsApp. (83-96) | 证据：哪些 app | 看不懂 | 配 | person moves left; official Gmail/Slack/WhatsApp icon stickers on their names |
| It reads the conversation and drafts a reply for you. (97-106) | 怎么用 | 什么都不缺 → 轻 | 配(轻) | one 💡 "drafts a reply" sticker |
| No copying and pasting back and forth. (107-113) | 否定 | 记不住 | 配 | coral struck "copying and pasting" |
| Tell it what you want this time: (114-120) | 清单标题 | 记不住 | 配 | sticker_list hand title |
| say no politely, move a deal forward, (121-127) | 清单 1–2 | 记不住 | 配 | check rows, one per item on its word |
| or follow up without being pushy. (128-133) | 清单 3 | 记不住 | 配 | third row |
| It learns how you write, so the reply sounds like you. (134-144) | 卖点 | 记不住 | 配 | back to center; one sticker "sounds like you" 😊 |
| Then you edit it, and send it only when you're happy. (145-155) | 控制权 | 什么都不缺 → 轻 | 配(轻) | hand aside "send it only when you're happy" |
| Replying shouldn't take courage, or a free hour. (156-164) | 金句（否定） | 记不住 | 配 | blue background (once): two coral struck words "courage" / "a free hour" |
| That's ToneBird. Every reply, easier, and more you. (165-171) | 结尾 + 品牌 | 记不住 | 配 | ending (a): holo bg + hero "ToneBird" + hand line with her slogan |

Skeleton check — the dressed lines read: "ever had this happen → seen the message → don't know how to start → client chasing →
excuse → burn the bridge → type/delete/type → half your afternoon → ToneBird → AI reply assistant → Gmail/Slack/WhatsApp →
drafts a reply → no copy-paste → tell it what you want ×3 → sounds like you → send when happy → not courage, not a free hour → ToneBird". That is the ad.

## 视觉系统
The pack **`sticker`** (Sticker Explainer, `library/packs/sticker/`) — nothing outside it:
- Every second sits on the cutout stage (sticker_stage / sticker_list / sticker_chapter); no raw-footage gaps.
- Fonts: Nunito 900/800 (rounded) + Kalam Bold (hand). Ink blue #3340D4, coral only for negations, iridescence only on hero/chapter number.
- Paper: cream for the hook + problem; lilac from the ToneBird chapter on; blue once (the key line), holo once (ending).
- Motion: soft fade/scale entry, gentle sway, 0.16 s fade on `until`. Person center ↔ left only at the app proof / list.
- Density: 1–3 stickers per screen, cleared with `until` between ideas, hero max every ~15–20 s (3 total: hook, half your afternoon, ToneBird).
- No brand override: ToneBird gets only the hero word at the end (pack rule `brand_font: none`).
- Icon stickers: official marks from the OFFICIAL table (Gmail, Slack, WhatsApp).

## 自查时改过的
- Chapter shot first covered only 73-77 (1.8 s, below the effect's 2 s); extended to 73-82 and dropped the separate 'AI reply assistant' sticker (more quiet face time, closer to the 40 % rule).
- Blue shot ended 0.6 s after 'a free hour' appeared → held it through 'That's' (156-164); holo ending starts on 'ToneBird'.
- Pack bug: the '01 ToneBird' badge faded to ~40 % in the last 0.18 s of every shot and popped back on the next (blink at each cut). Fixed in the pack's three templates (badge no longer fades at shot end).
