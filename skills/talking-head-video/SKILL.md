---
name: talking-head-video
description: 把一段口播原片剪成约 1 分钟的竖屏短视频。去停顿口误 → 逐句判断在说什么 → 按句子类型套抠图模板（字体 / 素材 / 版式 / 镜头特效四类）→ 逐词字幕 → 出片。风格不写死，换皮肤就换风格。Triggers："剪口播"、"口播视频"、"talking head"、"把这段录像剪一下"、"套模板"。
---

# 口播剪辑（通用）

有人对着镜头录了一段话，这个 skill 把它剪成一条能发的竖屏短视频。

核心思路分两层：
- **规则层**：这句话在说什么（观点 / 吐槽 / 数据 / 资料 / 细节 / 情绪高点 / 列举）→ 该用哪类画面。
- **模板层**：每个模板是一套分好层的画面（背景 / 原画面 / 人后文字 / 抠出的人像 / 人前元素），把人像放进去就出画面。换颜色和字体（皮肤）就是另一种风格。

模板放在共用的动效库里：**`../../library/talking-head/effects/`**。总表和速查见 `../../library/README.md`，可视化的库页面是 `../../gallery/index.html`。标签取值见 `../../tags.json`。现在有 124 个，每个都标了句子用途、分量（底层/小/大）、挡不挡脸、位置、组（长得像的一组，一条视频每组最多用一个）和要从原话里填的参数；挑动效时跑 `python3 ../../tools/catalog.py --json` 看精简表。

## 一键成片（默认）

用户给一条口播原片（可选：品牌链接、上传素材、档位），不用逐步确认，像剪辑师一样**先看懂、再导演**，直接出片。
**所有动效只从库里来**（`../../library/talking-head/effects/`），不现写新动效；创意体现在挑哪几个、怎么组合、参数怎么填、放在哪一刻。

1. **准备**：`python3 scripts/prep.py PROJECT [--lang en] [--brand https://品牌官网] [--level 极简|适中|丰富]`
   → 打印台词（词编号 + 秒数）、数量上限、颜色、能用的动效。
2. **看片**：抽 6–8 帧看画面（`ffmpeg -ss 秒 -i PROJECT/raw.mp4 -frames:v 1 -vf scale=270:-2 x.jpg`，拼成一张看）。记下：
   这个人是什么气质（平静 / 高能 / 搞笑 / 专业）、在什么环境、画面哪里有空位（图形放哪不挡脸、不撞麦克风或手）、身上和背景的颜色。
3. **写创意简报** `PROJECT/brief.md`：一句话核心（全片要让人记住什么）、情绪走向、整体气质（决定用哪一类动效：平静的人不用震屏和漫画，高能的人可以）、
   颜色（theme.json 取到的，或按题材定）、然后逐个时刻写「用库里哪个 + 为什么」。同一条视频的动效要像一家人：气质一致，不东拼西凑。每个动效有 `style` 标签（第一个是主风格），看完片定一个主风格写进简报，尽量从这个风格里挑，「通用」可以混；要跨风格就在 why 里说清楚为什么。
4. **导演**：按简报写 `PROJECT/shots.json`，每个镜头加 `"why": "为什么这么放"`。参数按这条视频调：位置避开空位以外的地方、字号、文字用原话。
   故意打破间隔规则时写 `"why_break": "原因"`。
5. **检查**：`python3 scripts/check_plan.py PROJECT --level 适中`，有 ✗ 就改，直到「通过」。
6. **自己回看挑刺**：`python3 scripts/render.py PROJECT --stills 秒,秒,…`（每个动效的开始、中间各一张），拼起来看。像观众一样挑：
   挡脸了吗？字看得清吗？和这个人的气质搭吗？是不是在套路（和上一条视频一模一样）？哪里太挤？改了再看，直到满意。把改了什么记在 brief.md 末尾。
7. **出片**：`python3 scripts/render.py PROJECT` → `out.mp4` + `out_镜头清单.md`。

- 原片放 `PROJECT/raw.mp4`。素材放 `PROJECT/uploads/截图|照片|B-roll视频|logo/`。**没传素材，需要素材的动效就不用**。
- 颜色：`--brand` 给了就从官网取；没给就从视频里取；都取不到，在简报里按题材定，写进 shots.json 的 `"theme": {"accent": "#…"}`。
- 用户说「先给我看看」时，第 6 步的定格图和简报先给用户看，确认了再出片。

## 怎么挑：护栏（依据：research/auto-edit-rules-draft.md，实测 21 条爆款 + 约 40 篇教程/工具做法）

1. **开头 3 秒**放一个钩子：钩子句里最关键的短语做大标题（用途「开场钩子」），停 3–5 秒。
2. **只给这几类句子配动效**，按优先级：数字 → 清单步骤 → 对比前后 → 定义概念 → 金句观点 → 引用证据 → 提到具体东西 → 结尾号召。普通叙述句不配；10–20 秒没有动效是正常的。
3. **按档位的上限放**（prep 会打印）：适中 = 每 10 秒最多 1 个小动效、每分钟最多 3 个大动效、挡脸 ≤ 15%。先放最值得的句子，放到上限就停。字幕样式、推近这类「底层」不算数。
4. **间隔**：两个动效至少隔 3 秒；两个大动效至少隔 8 秒，中间切回人脸。
5. **不重复**：同一个动效只用一次；同一组（`group`）只用一个。
6. **位置不打架**：看 `zone`，同一时间不放两个同位置的；图形不压字幕带。
7. **默认不加** emoji 贴纸和结尾「关注我」卡，用户要才加。
8. **字只用原话**：`fills` 里写「用原话」的参数，从这句话里摘，不改写意思、不编数字。
9. **图标说什么给什么**：提到 app / 品牌 / 具体东西时，图标参数写那个词（如 `Slack`、`gym`），没有对应图标的那项自动不出。
10. 一条视频只用 1 个强调色（theme.json），不在 shots.json 里另配颜色。

## 硬规则

1. 只出竖屏 1080×1920。
2. **每个动效都要和那句话直接相关**，别为了热闹乱套。
3. **图表里的数字只能来自原话或用户给的资料，不许编。**
4. **网上的图不直接用**，别人的肖像不要出现。品牌 logo 只在说到这个品牌时出现（图标库，见 `../../library/icons/`）。用户自己上传的截图、录屏可以用。

## 高亮怎么挑

`keywords` 管两件事：底部字幕里哪几个词变色，以及「关键词放大」弹出的大字。挑错了观众会看不懂，按下面的规则挑：

1. **只看高亮也要能看懂。** 高亮一整个短语（`"say no"`、`"too cold"`），不要两个拆开的词（❌ `["problem", "AI"]` → 观众看到 PROBLEM / AI 不知道在说什么）。
2. **挑信息量最大的地方**：转折、情绪词、数字、她的主张。不挑 problem、thing、way 这类空泛的词，也不挑人名打招呼。
3. **弹出的大字只放开场和结尾**（或全片最重要的一句），用原话里的短句，不改写意思。
4. **一句话最多一处高亮**，全片大概 5–8 秒一处。不是每个镜头都要写 `keywords`。
5. 写之前自问：**把高亮的词单独念出来，像不像这句话的标题？** 不像就换。

例子（work_example）：

| 原话 | ❌ | ✅ |
|---|---|---|
| Today's AI is powerful. But somehow… | `powerful` | `AI is powerful` |
| …repetitive, time-consuming, and emotionally draining… | `repetitive`、`draining` | `emotionally draining`（只留情绪最重的一处） |
| …sound thoughtful… say no without sounding too cold | `thoughtful`、`no`、`cold` | `sound thoughtful`、`say no`、`too cold` |
| …the kind of problem AI should be solving | `problem`、`AI` | `AI should be solving` |

## 不满意某个镜头怎么换

出片时会生成 `out_镜头清单.md`，每个镜头后面列了 2–3 个可以换的动效（同一种句子用途优先，不够再补同类别的）。
把 `shots.json` 里那行的 `template` 改掉、按新模板的 `meta.json` 补参数，再出片。
也可以 `python3 ../../tools/catalog.py --alt 模板id` 直接查，或在库页面里按「句子用途」筛选。

## 分步流程（要逐步确认、或单独重跑某一步时）

| 步骤 | 做什么 | 命令 / 产出 | 用户确认 |
|---|---|---|---|
| 0 | 建项目文件夹，原片放成 `PROJECT/raw.mp4`（只用一段就先截出来） | `ffmpeg -ss 起点 -t 时长 -i 原片 raw.mp4` | — |
| 1 | 转逐词文字 | `python3 scripts/transcribe.py PROJECT/raw.mp4 --lang en/zh --prompt "人名、产品名"` → `work/words.json`、`work/transcript.txt` | — |
| 1b | **校对**：带 `?` 的词是没把握的，对照用户脚本或原片改 `work/words.json` 里的 `w` | — | — |
| 2 | 粗剪：去停顿、嗯啊、重说 | `python3 scripts/plan_cut.py PROJECT` → `work/edit.json`、`work/cut.txt`；要删的整段写进 `PROJECT/cut.json` 的 `drop` | — |
| 3 | 抠像（有模板要用时） | `scripts/matte PROJECT/raw.mp4 PROJECT/work/matte_src   (默认 combo：头发用「抠出主体」，再用人像轮廓去掉电脑椅子)`（第一次先编译，见下） | — |
| 4 | **镜头表**：读 `cut.txt`，逐句标类型，按 `library/README.md` 的速查表（句子用途 → 动效）选模板，写 `PROJECT/shots.json` | 见下面格式 | ✅ |
| 5 | 定格图 | `python3 scripts/render.py PROJECT --sheet 1`（每秒一张拼图）或 `--stills 3,12.5` | ✅ |
| 6 | 出片 | `python3 scripts/render.py PROJECT` → `PROJECT/out.mp4` + `out_镜头清单.md`（每个镜头用了什么、可以换成什么）；试节奏用 `--preview`（半分辨率，快一倍）；换镜头表用 `--shots 文件名` | ✅ |
| 7 | 复盘 | 用户的新反馈写回本文件的硬规则，或改模板的 `meta.json` | — |

### shots.json 格式

```json
{
  "skin": "clean",
  "shots": [
    {"words": "0-9",   "purpose": "开场钩子", "template": "keyword_pop",   "params": {"keywords": ["AI is powerful"]}},
    {"words": "16-24", "purpose": "金句观点",   "template": "text_sandwich", "params": {"text": "DRAINING"}},
    {"words": "31-41", "purpose": "引用证据", "template": "doc_fly",       "params": {"images": ["assets/docs/gmail.jpg", "assets/docs/chat.jpg"]}}
  ]
}
```

- `words`：`work/transcript.txt` 里的词编号范围，模板从第一个词开始、到最后一个词结束。没写到的词就是普通露脸段落，只有字幕。
- `purpose`：这句话在做什么，取值见 `tags.json` 的 `purpose`（开场钩子 / 数字 / 清单步骤 / 引用证据 / 金句观点……）。先判断用途，再从库里挑这个用途下的动效；镜头清单里的「可以换成」也按它推荐。
- `params`：每个模板要什么写在库里它的 `meta.json` 里。
- `keywords` 里的词在底部字幕里也会高亮。
- `focus`（可选）：`[x, y]`，脸在画面里的位置（0–1）。不写就从抠像里自动算。
- `skin`：`clean`（克制，深色加荧光绿）或 `pop`（网感，亮黄加蓝）。
- 素材（B-roll、截图）放 `PROJECT/assets/`。视频类 B-roll 先拆成帧：`ffmpeg -ss 起点 -t 时长 -i 视频 -q:v 3 assets/名字/%06d.jpg`，参数写 `{"frames": "assets/名字", "fps": 30, "count": 帧数}`。

## 加新模板

1. 新建 `library/talking-head/effects/<id>/`，写 `meta.json`（标签按 `tags.json`：句子用途、分量、挡脸、位置、组、前提、素材、类别；再加 `use_for`、`duration`、`fills`、参数、出处）和 `template.js`（`setup` 搭画面，`frame` 每帧按时间改样式）。照现有模板的写法，只用 `engine.html` 里的皮肤变量（`--accent` 等），换皮肤才会跟着变。
2. 在 `demo_rumi/shots_*.json` 里用一次，跑 `python3 tools/previews.py <id>` 出预览，再跑 `python3 tools/catalog.py` 更新总表和库页面（标签写错会报错）。

## 环境

- python3：`openai-whisper`、`playwright`（带 Chromium）、`pillow`、`numpy`；ffmpeg。
- 抠像用 macOS 自带的 Vision 人像分割，不下载模型、不上传。第一次编译：
  `swiftc -O scripts/matte.swift -o scripts/matte`
  如果报 `redefinition of module 'SwiftBridging'`（Command Line Tools 自带的问题），用 vfsoverlay 把 `bridging.modulemap` 换成空文件再编译。
- 不在 Mac 上时没有 Vision，抠像要换别的工具（还没做）。

## 示例

`work_example/`：Monica 讲 OKEight 的原片前 56 秒（原片已烧了字幕，用 delogo 抹掉后再加我们的字幕），B-roll 和截图取自同一条视频后面的录屏部分。
