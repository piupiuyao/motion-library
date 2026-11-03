# packtest_vox — full test edit (pack: vox / Editorial Paper)

English HeyGen presenter, ~53 s ToneBird ad. Calm, friendly; bright outdoor daylight street, framed waist-up,
face ~y 500–750 in the full frame (lands ~y 1240 in the split). Captions at y 1470 sit on the chest in both framings.

## 审稿
| 句子（词编号） | 这句在干什么 | 观众此刻缺什么 | 配不配 | 为什么 |
|---|---|---|---|---|
| Ever had this happen? (0–3) | 钩子·提问 | 没感觉：要一眼知道在说什么情境 | 配 | 开场 3 秒钩子，和后两句一起做第一张纸 |
| You've seen the message. (4–7) | 钩子·情境 | 看不懂：什么消息 | 配 | 同一张纸上的卡「YOU'VE SEEN THE MESSAGE」 |
| You know you should reply. (8–12) | 钩子·点题 | 记不住 | 配 | 标题 + key「reply.」荧光笔 |
| You just don't know how to start. (13–19) | 痛点 | 没感觉 | 配（同一张） | 卡片下的橙色小字，原话 |
| A client is chasing you for an update. (20–27) | 痛点·举例 | 什么都不缺 | 不配 | 刚收起钩子纸，留人脸 |
| You want to explain, but it sounds like an excuse. (28–37) | 痛点·举例 | 什么都不缺 | 不配 | 叙述，人脸 + 字幕 |
| You want to turn down a partnership, but… burn the bridge. (38–52) | 痛点·举例 | 什么都不缺 | 不配 | 叙述 |
| And if it's in a second language, you type, delete, and type again. (53–65) | 痛点·加码 | 什么都不缺 | 不配 | 字幕节奏本身就够 |
| One message eats up half your afternoon. (66–72) | 痛点·代价（金句） | 记不住 | 配（小） | caption_highlighter 划「half your afternoon」，脸干净 |
| That's what ToneBird is for. (73–77) | 转折·产品出场 | 什么都不缺 | 不配 | 品牌名在字幕里就够；下一句就是大纸。push_in 虽在 allowed 里，但 STYLE §5「Nothing glides… Faces never move」，不用 |
| It's an AI reply assistant. (78–82) | 定义 | 什么都不缺 | 不配 | 人脸 |
| It works right inside the tools you already use, like Gmail, Slack, and WhatsApp. (83–96) | 证据·具体 app | 看不懂：哪些工具 | 配 | vox_split_title + 官方 app 图标，说到哪个落哪个 |
| It reads the conversation and drafts a reply for you. (97–106) | 用法 | 什么都不缺 | 不配 | 刚收起纸，留人脸 |
| No copying and pasting back and forth. (107–113) | 用法·反面 | 什么都不缺 | 不配 | 离下一张清单纸太近（< 3 s），宁少 |
| Tell it what you want this time: say no politely, move a deal forward, or follow up without being pushy. (114–133) | 清单 | 记不住：三个用法 | 配 | vox_split_list，三个虚线格依次填上 |
| It learns how you write, so the reply sounds like you. (134–144) | 卖点 | 什么都不缺 | 不配 | 人脸 |
| Then you edit it, and send it only when you're happy. (145–155) | 用法·放心 | 什么都不缺 | 不配 | 人脸 |
| Replying shouldn't take courage, or a free hour. (156–163) | 金句 | 什么都不缺 | 不配 | 离结尾纸太近，且 caption_highlighter 已用过一次 |
| That's ToneBird. (164–165) | 结尾·品牌名 | 记不住 | 配 | 绿色收尾纸的 kicker「THAT'S TONEBIRD」 |
| Every reply, easier, and more you. (166–171) | 结尾·tagline | 记不住 | 配 | 同一张绿纸：title + key「and more you.」，ending (a) |

骨架读一遍：钩子（看到消息不知道怎么回）→ 代价（半个下午）→ 在你的工具里 → 告诉它你想要什么 → Every reply, easier, and more you。

## 视觉系统
= pack `vox`（Editorial Paper），全部来自 `library/packs/vox/`：
- 纸 #efe9dc + 墨 #17130e；主色 burnt orange #c8562e（分割线、荧光笔、卡片小字）；绿 #5f9327 只在结尾一张纸。
- 字体：Fraunces（衬线标题 300/900）、Archivo（大写标签 + 字幕）、Caveat 不用。
- 卡片质感：只有纸（纸面分屏 + 纸卡 + 纸白 app 方块）。
- 动效气质：stop-motion 跳格（分屏 6 格展开），不滑不淡。
- 字幕：pack 皮肤，暖墨底框、大写，每行 3 词（pack.json caption_words: 3，照参考 1–3 词）。
- 开场 (a) 分屏 + 问题 kicker + 情境卡；结尾 (a) 绿色分屏 tagline。
- 纸面节拍 4 张 / 53 s（≈4.5/分钟，STYLE 3–5）。

## 每个时刻
| 时间 | 效果 | 屏上 | 备注 |
|---|---|---|---|
| 0.0–5.9 | vox_split_title | EVER HAD THIS HAPPEN? / You know you should **reply.** / 卡 YOU'VE SEEN THE MESSAGE + 气泡图标 + DON'T KNOW HOW TO START | 卡是情境示意（不是界面截图） |
| 19.1–21.3 | caption_highlighter | 字幕「HALF YOUR AFTERNOON」橙色马克 | |
| 25.2–31.7 | vox_split_title | RIGHT INSIDE THE TOOLS / you already **use.** / Gmail · Slack · WhatsApp 官方 logo | |
| 36.1–41.3 | vox_split_list | TELL IT WHAT YOU WANT / This time: / 01 Say no politely · 02 Move a deal forward · 03 Follow up, not pushy | 第 3 条把 "without being pushy" 压成 "not pushy"，意思不变 |
| 50.0–53.5 | vox_split_title (accent-2) | THAT'S TONEBIRD / Every reply, easier, / **and more you.** | 绿 |

## 自查时改过的
- 第一版 sheet：apps 纸在 30.3 s 收起，WhatsApp 图标（29.6 s 说到）只露 0.7 s → 镜头延到词 100（31.7 s）。
- 结尾荧光笔原定 key_at "more"（52.8 s），片子 53.25 s 结束只亮 0.4 s → 改为默认 1.0 s（51 s）扫过。
- pack.json 加 caption_words: 3（参考是 1–3 词一行）。
