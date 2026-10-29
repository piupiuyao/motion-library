---
name: talking-head-video
description: 把一段口播原片剪成约 1 分钟的竖屏短视频。去停顿口误 → 逐句判断在说什么 → 按句子类型套抠图模板（字体 / 素材 / 版式 / 镜头特效四类）→ 逐词字幕 → 出片。风格不写死，换皮肤就换风格。Triggers："剪口播"、"口播视频"、"talking head"、"把这段录像剪一下"、"套模板"。
---

# 口播剪辑（通用）

有人对着镜头录了一段话，这个 skill 把它剪成一条能发的竖屏短视频。

核心思路分两层：
- **规则层**：这句话在说什么（观点 / 吐槽 / 数据 / 资料 / 细节 / 情绪高点 / 列举）→ 该用哪类画面。
- **模板层**：每个模板是一套分好层的画面（背景 / 原画面 / 人后文字 / 抠出的人像 / 人前元素），把人像放进去就出画面。换颜色和字体（皮肤）就是另一种风格。

模板放在共用的动效库里：**`../../library/talking-head/effects/`**。总表和速查见 `../../library/README.md`，可视化的库页面是 `../../gallery/index.html`。标签取值见 `../../tags.json`。现在有 17 个，分字体 / 素材 / 版式 / 镜头特效 / 片头片尾五类。

## 硬规则

1. **成片约 1 分钟**，只出竖屏 1080×1920（横屏以后再加）。
2. **连续露脸不超过 10 秒。** 只有「素材」和「版式」两类模板算打断露脸；「字体」和「镜头特效」还是脸占满画面，不算。`render.py` 每次都会检查，超了会打印警告。
3. **每个模板都要和那句话直接相关**，别为了热闹乱套。一条片子 6–10 个模板就够，中间留没有模板的普通段落喘口气。
4. **图表里的数字只能来自原话或用户给的资料，不许编。** 没有真实数字就用 `show_values: false` 只显示长短。
5. **网上的图不直接用**，第三方 logo、别人的肖像不要出现。用户自己的截图、录屏可以用。
6. **先给用户看镜头表和几张定格图，确认了再出整片。**

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

## 流程

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
    {"words": "16-24", "purpose": "强调词",   "template": "text_sandwich", "params": {"text": "DRAINING"}},
    {"words": "31-41", "purpose": "引用资料", "template": "doc_fly",       "params": {"images": ["assets/docs/gmail.jpg", "assets/docs/chat.jpg"]}}
  ]
}
```

- `words`：`work/transcript.txt` 里的词编号范围，模板从第一个词开始、到最后一个词结束。没写到的词就是普通露脸段落，只有字幕。
- `purpose`：这句话在做什么，取值见 `tags.json` 的 `purpose`（开场钩子 / 吐槽痛点 / 引用资料……）。先判断用途，再从库里挑这个用途下的动效；镜头清单里的「可以换成」也按它推荐。
- `params`：每个模板要什么写在库里它的 `meta.json` 里。
- `keywords` 里的词在底部字幕里也会高亮。
- `focus`（可选）：`[x, y]`，脸在画面里的位置（0–1）。不写就从抠像里自动算。
- `skin`：`clean`（克制，深色加荧光绿）或 `pop`（网感，亮黄加蓝）。
- 素材（B-roll、截图）放 `PROJECT/assets/`。视频类 B-roll 先拆成帧：`ffmpeg -ss 起点 -t 时长 -i 视频 -q:v 3 assets/名字/%06d.jpg`，参数写 `{"frames": "assets/名字", "fps": 30, "count": 帧数}`。

## 加新模板

1. 新建 `library/talking-head/effects/<id>/`，写 `meta.json`（标签按 `tags.json`：类别、句子用途、风格、需要什么；再加分层、参数、出处）和 `template.js`（`setup` 搭画面，`frame` 每帧按时间改样式）。照现有 8 个的写法，只用 `engine.html` 里的皮肤变量（`--accent` 等），换皮肤才会跟着变。
2. 在 `work_example/shots_showcase.json` 里用一次，跑 `python3 tools/previews.py <id>` 出预览，再跑 `python3 tools/catalog.py` 更新总表和库页面（标签写错会报错）。

## 环境

- python3：`openai-whisper`、`playwright`（带 Chromium）、`pillow`、`numpy`；ffmpeg。
- 抠像用 macOS 自带的 Vision 人像分割，不下载模型、不上传。第一次编译：
  `swiftc -O scripts/matte.swift -o scripts/matte`
  如果报 `redefinition of module 'SwiftBridging'`（Command Line Tools 自带的问题），用 vfsoverlay 把 `bridging.modulemap` 换成空文件再编译。
- 不在 Mac 上时没有 Vision，抠像要换别的工具（还没做）。

## 示例

`work_example/`：Monica 讲 OKEight 的原片前 56 秒（原片已烧了字幕，用 delogo 抹掉后再加我们的字幕），B-roll 和截图取自同一条视频后面的录屏部分。
