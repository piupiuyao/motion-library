# AI 数字人 / 声音克隆 / 翻译配音 调研入门

调研日期：2026-10-28 · 只做了网上调研，没注册、没装模型 · 标「⚠未核实」的是只在第三方网站看到、没在官方页面确认的数字

> **一句话结论**
>
> 1. 「照片 + 文案 → 会说话的人」这一步，**现成服务已经够用，不用自己训模型**。最成熟的是 **HeyGen**：它的 API 可以直接收「一张照片 + 一段我们自己的音频」，出 9:16、纯色背景、最长 30 分钟的视频，官方价约 **$3/分钟**（照片数字人 Avatar IV）。
> 2. 声音克隆这一步，**英文选 ElevenLabs**（1 分钟录音就能克隆，60 秒口播花的配音费不到 $0.5）；**中文另外测 MiniMax（海螺）或阿里 CosyVoice**，大家普遍说它们中文更自然，但没找到独立评测。
> 3. 翻译配音 + 对口型：**HeyGen 视频翻译**最省事（API 约 $2/分钟带对口型，⚠ 小语种和语速快的时候口型会飘）。
> 4. 一条 60 秒视频的「数字人 + 配音」成本，大约 **$3–7（约 20–50 元）**，比我们剪辑那一侧的成本高不了多少。
> 5. **建议明天先测**：同一张照片 + 同一段 ElevenLabs 克隆音频，分别喂给 **HeyGen Photo Avatar（Avatar IV）** 和 **可灵数字人 Kling Avatar 2.0**，对比真实感、口型、身体动作，再接进我们现有的抠像+动效流程。
> 6. 最大的风险不是技术，而是**授权和平台标识**：用谁的脸、谁的声音必须拿到书面同意；发抖音/TikTok 必须打「AI 生成」标识（国内 2025-09-01 起是法规要求）。

---

## 0. 先认识几个词（大白话）

| 词 | 意思 |
|---|---|
| 数字人 / Avatar | AI 生成的「会说话的人」视频 |
| 照片数字人（Photo Avatar / Talking Photo） | 只给一张照片，AI 让照片里的人开口说话、做表情 |
| 数字分身（Digital Twin） | 先拍一段你本人说话的视频（15 秒到几分钟），AI 学会你的样子和动作，之后打字就能出「你」的视频。比照片版更像真人 |
| 声音克隆（Voice Clone） | 给 AI 听一段某人的录音，之后 AI 能用这个人的声音读任何文字 |
| TTS | 文字转语音 |
| 对口型（Lip-sync） | 让嘴型和声音对上。翻译成外语时，要把嘴型也改成外语的样子 |
| API | 程序之间的接口。用了 API，我们的工具可以自动调用对方的服务，不用人去网页上点 |
| 异步渲染 | 提交任务后不会马上出结果，要隔一会儿去查「好了没」，或者让对方做好后通知我们（回调/webhook） |
| 透明背景 / Alpha / WebM | 视频背景是透明的，可以直接叠在别的画面上，不用再抠像。WebM 是一种支持透明的视频格式 |
| 开源模型 | 代码免费公开，可以自己部署。但需要强力显卡（GPU），我们的 Mac 跑不动，只能租云 GPU |

---

## 1. HeyGen 详细了解（目前最推荐的主力）

### 1.1 它能做什么

| 功能 | 说明 | 适合我们吗 |
|---|---|---|
| **照片数字人（Photo Avatar，引擎 Avatar IV）** | 一张照片 + 文案/音频 → 说话视频，有口型、表情、手势；侧脸、半身、全身照也能用，卡通/动物也行 | ✅ 正好就是「照片+文案→成片」缺的那一步 |
| **Avatar V（最新一代，2026 年推出）** | 用一段约 **15 秒**的本人视频做「数字分身」，号称多角度、长视频里长相不走样。官方说：真人用 Avatar V 更好，卡通/非人角色用 Avatar IV | ✅ 当质量上限对照组 |
| Avatar III | 老一代，便宜（约 $1/分钟），但没那么自然 | 只做便宜档备选 |
| **声音克隆** | 内置；官方说训练前会核实是不是你本人的声音，克隆别人的声音需要对方书面同意 | 可用，但英文质量一般认为不如 ElevenLabs（⚠未做对比） |
| **视频翻译 + 对口型** | 网页版写「175+ 种语言和方言」，保留原声音色并改嘴型 | ✅ 后面做多语言版本用 |
| 透明背景输出 | API 可输出 **WebM 透明背景**，但要求数字人是「带抠像训练」的（新建的数字分身大多支持）；**照片数字人能不能出透明背景，官方文档没写**（⚠未核实）。退路：指定纯色背景（比如绿幕色），再用我们自己的抠像 | ✅ 两条路都能接上我们的抠像步骤 |

### 1.2 输出规格

- 画面比例：`16:9`、**`9:16`**、`4:5`、`5:4`、`1:1`、`auto`（跟随照片比例）
- 清晰度：API 是 720p / 1080p；网页版 Pro 以上可导出 4K
- 时长：API 单次最长 **30 分钟**音频；网页版 免费 1 分钟、Creator/Pro 30 分钟、Business 60 分钟
- 背景：可以设纯色或图片；要透明就用 WebM（见上）
- 照片要求：PNG/JPG，≤32MB，正脸、光线好、表情自然效果最好；老文档要求脸部区域 >200×200 像素、画面里只有一张脸

### 1.3 API 怎么用（给开发同学看的简版）

最省事的路线是「**照片直接当输入 + 我们自己的音频**」，连创建数字人这一步都可以省掉：

1. `POST /v3/assets` 上传音频（MP3/WAV，≤32MB），拿到 `audio_asset_id`（或者直接给一个公开的音频链接 `audio_url`）
2. `POST /v3/videos`，`type: "image"`，`image` 填照片（链接/上传后的 ID/base64），音频填上一步的 ID，`aspect_ratio: "9:16"`，`resolution: "1080p"`；照片数字人还能加 `motion_prompt`（动作描述）和 `expressiveness`（表情幅度，仅 Avatar IV）
3. 拿到 `video_id` 后，每隔一段时间查 `GET /v3/videos/{video_id}`，状态从 `pending → processing → completed`；或者填 `callback_url` 让它做好后通知我们
4. 下载 `video_url`

另一条路线：先把照片建成「照片数字人」（`type: "photo"`，训练几分钟），再用 `avatar_id + script + voice_id` 出片，适合同一个人反复用。

还有独立的**对口型接口** `POST /v3/lipsyncs`：给一段现成视频 + 一段新音频，改嘴型（`speed` 快速 / `precision` 高质量两档）。以后「给真人口播换一段台词」可以用。

并发上限：同时 10 个任务（企业版 20 个）。

### 1.4 价格

**网页版订阅**（官方价格页）：

| 套餐 | 月费 | 积分 | 单条最长 | 清晰度 | 说明 |
|---|---|---|---|---|---|
| Free | $0 | – | 1 分钟 | – | 视频归 HeyGen，**只能非商用** |
| Creator | $29（年付 $24） | 600 | 30 分钟 | 1080p | Avatar V 有限使用 |
| Pro | $49 | 1,000 | 30 分钟 | 4K | Avatar V 完整使用 |
| Business | $149 + $20/人 | 1,500 | 60 分钟 | 4K | 5 个自定义分身 |

Avatar IV / V 都是 **20 积分/分钟**（Avatar III 3 积分/分钟）。所以 Creator 的 600 积分 ≈ 30 分钟 Avatar IV 视频。

**API（单独钱包，跟网页订阅不通用）**：最低充 $5，按用量扣，**没有免费额度**（2026-02 起取消），余额 12 个月过期。

| 项目 | 价格 | 一分钟约 |
|---|---|---|
| 照片数字人 Avatar IV | $0.05/秒 | **$3** |
| 数字分身 Avatar IV / V | $0.0667/秒 | $4 |
| 数字分身 Avatar III | $0.0167/秒 | $1 |
| 视频翻译（只换音频） | $0.0167/秒 | $1 |
| 视频翻译（带对口型） | $0.0333/秒 | $2 |
| 实时数字人（720p） | $0.05/秒 | $3 |

（来源：HeyGen 帮助中心 + HeyGen 自己写的 API 对比文章 + G2；4K 更贵。⚠ 官方 API 价格表页面我直接打不开，数字来自这几处转引，彼此一致）

注意：**用 API 自动建「数字分身」（Digital Twin）只有企业版才开放**，普通账号要在网页上建好再用。照片数字人则所有人都能用 API。

### 1.5 用别人的脸/声音：规则

- **数字分身**：必须让本人对着摄像头念一段同意声明（HeyGen 提供网页链接，24 小时有效），审核通过才能用。企业版可以上传预录的同意视频，或签免责协议跳过。
- **照片数字人**：HeyGen **不做任何同意核验**，但文档明确写了：**拿到照片当事人的同意、并自己留好记录，是你的责任**。
- **声音克隆**：HeyGen 会核实声音是不是你本人的；用第三方声音需书面同意。
- **商用**：付费用户拥有生成视频的所有权（前提是遵守服务条款）；免费版视频归 HeyGen，只能非商用。

### 1.6 已知问题（来自用户评价）

- 西/法/葡/中文等大语种的翻译口型普遍评价不错；泰语、越南语等小语种 + 说话快时会出现口音和口型不同步（⚠ 评测来源部分是竞品）
- 有用户反映对口型偶尔会让画质变差，需要人工检查
- 翻译任务慢的时候要 30 分钟到 1.5 小时

---

## 2. 其他选择（简表）

### 2.1 国外商业服务

| 产品 | 是什么 | 照片→说话 | API | 大概价格 | 一句话评价 |
|---|---|---|---|---|---|
| **可灵 Kling Avatar 2.0**（快手） | 一张图 + 一段音频 → 说话视频，带头部和上半身动作 | ✅ | ✅（可灵开放平台；也可通过 fal 等第三方调用） | 经 fal：标准版 $0.056/秒（≈$3.4/分钟），Pro 版 $0.115/秒（≈$6.9/分钟）⚠ | 单条最长约 **5 分钟**（有一处写 1 分钟，⚠ 待核实）。国产、中文场景友好，**重点对比对象** |
| **OmniHuman 1.5**（字节，即梦「数字人大师模式」） | 一张图 + 音频 → 带动作的数字人，号称「电影级」 | ✅ | ✅ 火山引擎企业 API；fal 等也有 | fal 约 $0.16/秒（≈$9.6/分钟）⚠，各平台 $0.13–0.25/秒 | 动作表现力强；1.5 版 720p 下最长 60 秒音频；不开源 |
| Captions / Mirage（Avatar X） | 美国口播 App 出的数字人模型，2026-07 发布 Avatar X，号称声音、表情、眼神一体生成 | ✅ | ✅ | 老模型 Mirage Video 1：$0.175/秒（≈$10.5/分钟）；Avatar X 官方价未查到，第三方 $0.3/秒 ⚠ | 偏贵，竖屏 UGC 风格强 |
| Hedra（Character-3） | 让肖像/卡通/非人脸开口说话 | ✅ | ✅ | API 视频「1.13 美分/秒起」（≈$0.7/分钟，⚠ 没写是哪个模型）；网页 6 积分/秒 | 便宜、风格化强，真人写实度待测 |
| Synthesia（Express-2/3） | 企业培训视频为主，数字人有全身动作 | 主要用自建分身 | Creator 档起（约 $89/月） | 约 120 积分/分钟 | 偏企业 PPT 讲解风，不太适合短视频口播 |
| D-ID | 老牌「会说话的照片」 | ✅ | ✅（API 单独套餐） | 网页 Lite $5.9 起；API 按分钟套餐，价格未公开 ⚠ | 便宜但真实感落后于第一梯队 |
| Tavus（Phoenix-4） | 主打**实时对话**数字人（像视频通话） | 需先训练分身 | ✅ | Starter $59/月 起 | 方向不同，我们用不上 |
| Argil | 社媒口播分身，偏 UGC 风格 | 以自拍视频训练分身为主 | 所有套餐都含 API | $39/月（约 25 分钟）起，无按量付费 | 可备选，但要订月费 |
| Akool | 换脸、照片说话、翻译一整套 | ✅ | ✅ | 照片说话 10 积分/5 秒（积分单价未查到 ⚠） | 功能杂，质量口碑一般 |
| Vidnoz | 免费额度多的入门工具 | ✅ | 未查到 API 资料 | 每天 60 免费积分；付费约 $23/月起 ⚠ | 质量入门级 |

### 2.2 国内服务

| 产品 | 是什么 | 价格 | 备注 |
|---|---|---|---|
| **即梦（字节）数字人** | 就是 OmniHuman；「大师模式」一张照片 + 一段音频出视频 | 企业 API 走火山引擎，价格页未抓到 ⚠ | 早期网页版只能传 15 秒音频（⚠ 可能已放宽） |
| **可灵（快手）数字人** | 见上表 | 见上表 | — |
| **蝉镜** | 照片数字人；上传 15 秒视频可「形象+声音」双复刻 | App 会员 39 元/月（连续包月）⚠；API 价格需找商务 | 国内口播数字人头部玩家之一 |
| **剪映数字人** | 剪映里自带的数字人合成 | 剪映 SVIP 79 元/月、599 元/年（连续包年） | 定制数字人是否另收费没查到 ⚠；适合手动做，不适合接进我们的自动流程 |
| 腾讯智影 | 腾讯的数字人+剪辑平台 | 未查到可靠价格 ⚠ | 偏企业播报风 |
| 硅基智能 | 做数字人定制、直播数字人的公司，偏 B 端 | 未查到 ⚠ | 主要卖给企业/直播间 |
| 闪剪 | 30 秒视频或图片复刻形象和声音，有开放 API | 未查到 ⚠ | 可作为国内 API 备选 |

### 2.3 开源模型（能不能自己部署）

| 模型 | 做什么 | 自部署现实吗 |
|---|---|---|
| LivePortrait（快手） | 让一张照片按另一个视频的表情动起来（表情迁移），不是由声音驱动 | 较轻，但单独用不了，要配音频驱动模型 |
| SadTalker | 老一代照片说话，只动头和嘴 | 能跑但效果明显过时 |
| Hallo / Hallo2 / Hallo3、EchoMimic（V1–V3） | 照片 + 音频 → 说话视频（扩散模型），EchoMimicV3 只有 13 亿参数，偏轻 | 要云 GPU，生成慢，质量不稳定 |
| **InfiniteTalk**（美团，基于 Wan2.1 14B） | 照片/视频 + 音频，**长度不限**，头、身体、表情一起动，开源 Apache 2.0 | 质量是开源里最好的一档，但需要**大显存 GPU**（社区用 80GB A100 跑）；RunPod 上有现成接口 $0.25/次（720p，⚠ 没写多长） |
| **LatentSync**（字节） | 只改嘴型（给现成视频配新音频） | 慢：20 秒音频要跑 100 秒以上 |
| **MuseTalk**（腾讯） | 只改嘴型，能实时（V100 上 30 帧/秒，但只有 256×256 嘴部区域） | 最轻，适合做翻译后改嘴型 |

**结论**：我们的 Mac 内存小，只能租云 GPU（A100 80GB 约 $1.4/小时，4090 约 $0.34–0.69/小时 ⚠ 2026-06 价格）。算上搭环境、调参数、处理失败的时间，**现阶段不划算**。等量大了（每月几百上千分钟）再考虑用开源压成本。

---

## 3. 声音克隆

| 服务 | 克隆需要多少录音 | 中文 / 英文 | 价格 | 备注 |
|---|---|---|---|---|
| **ElevenLabs 快速克隆（IVC）** | 官方建议 1–2 分钟，别超过 3 分钟 | 英文业内公认最好；最新是 v4 模型，v3 支持 70+ 语言；中文质量没找到独立评测 ⚠ | 订阅：Starter $5/月（3 万字符）、Creator $22/月（10 万字符）、Pro $99/月（50 万字符）；API 约 $0.05–0.2/千字符 ⚠ | Starter 起就能快速克隆 ⚠（各处说法不一） |
| **ElevenLabs 专业克隆（PVC）** | 至少 30 分钟，最好 2 小时以上 | 同上，更像本人 | Creator 档起 | 要验证是本人声音；训练要等一段时间 |
| HeyGen 内置克隆 | 网页上录一段即可 | 可用 | 含在套餐里 | 省一步，但质量未对比 ⚠ |
| **MiniMax 海螺（Speech 2.8）** | 约 10 秒起 ⚠ | 大家普遍说**中文声调、中英夹杂更好**，英文 ElevenLabs 更强（⚠ 都是厂商/转售商的说法） | HD 约 $100/百万字符，Turbo $60/百万字符；克隆 $1.5/个 ⚠ | 便宜；没找到同意核验步骤 |
| Fish Audio（S1 / S2.1 Pro） | 短样本即可 | 支持中文 | 约 $15/百万字节 ⚠ | 很便宜；商用授权条款说法不一，要核实 |
| **阿里云百炼 CosyVoice v3/v3.5** | 10–20 秒 | 中文强项 | 0.8–2 元/万字符（官方原价） | 国内合规、便宜；新加坡区不支持复刻 |
| 火山引擎 豆包声音复刻 2.0 | 秒级复刻（官方说法） | 中文强项，新增情感演绎 | 价格页没抓到 ⚠ | 抖音同门，中文首选候选 |
| OpenAI TTS | 不开放公众克隆 | — | — | 不适用 |

**60 秒口播大概多少字？** 英文约 150 词 ≈ 900 字符；中文约 250–300 字。按以上价格，**一条 60 秒的配音费都在几毛钱到 $0.5 之间**，可以忽略。

**建议**：英文用 ElevenLabs；中文同一段稿子分别用 ElevenLabs、MiniMax、CosyVoice（或火山）各出一版，让团队盲听打分。

---

## 4. 翻译配音 + 对口型

| 服务 | 保留原声 | 改嘴型 | 价格 | 评价 |
|---|---|---|---|---|
| **HeyGen 视频翻译** | ✅ 自动克隆原声 | ✅ | API：只换音 $1/分钟，带对口型 $2/分钟；网页 Creator 起 175+ 语言 | 大语种口型好；小语种+语速快会飘；慢的时候要等 30–90 分钟 |
| ElevenLabs Dubbing | ✅ 声音保留业内最好 | ❌ 不改嘴型（⚠ 第三方说法） | 约 $0.5/分钟，每个目标语言单独收费 ⚠ | 适合「只要声音像」的场景；嘴型可另外用对口型工具补 |
| Rask AI | ✅ | ✅（对口型按 3 倍时长扣） | 约 $1.5–3/分钟 ⚠ | 专做翻译配音，价格偏高 |
| 开源组合 | 用克隆 TTS 生成外语音频 | MuseTalk / LatentSync 改嘴型 | 云 GPU 成本 | 可控但要自己搭 |

**对我们来说**：如果视频本身就是 AI 数字人生成的，**翻译最简单的做法根本不用「翻译视频」**——直接把文案翻译好，用克隆声音读外语，再让数字人重新生成一遍，嘴型天然对得上。「翻译 + 对口型」服务主要用在**真人拍的口播**上。

---

## 5. 怎么接进我们的流程

### 5.1 流程图

```
照片 + 文案
   │
   ├─①（可选）文案翻译成目标语言
   │
   ├─② 声音克隆 TTS：文案 → 音频（ElevenLabs / MiniMax / CosyVoice）
   │
   ├─③ 数字人生成：照片 + 音频 → 9:16 说话视频，纯色/透明背景（HeyGen 或 可灵）
   │        （异步：提交 → 等待 → 下载，一般几分钟）
   │
   └─④ 我们现有的自动剪辑：转写 → 剪辑 → 抠像 → 加动效 → 成片
```

几个好处：
- 第②步先出音频，**音频就是最终台词**，第④步转写几乎不会出错（甚至可以直接用文案当字幕）
- 第③步如果拿到透明背景（WebM），第④步的抠像可以跳过；拿不到就要纯绿/纯色背景，抠像更干净
- 第③步数字人生成的视频本身就「没有废话和口误」，第④步的剪辑主要是加节奏和动效

### 5.2 建议先测的两个组合

| | 组合 A（主推） | 组合 B（对照） |
|---|---|---|
| 声音 | ElevenLabs 快速克隆（中文加测 MiniMax） | 同一段音频 |
| 数字人 | **HeyGen 照片数字人 Avatar IV** | **可灵 Kling Avatar 2.0**（Pro 档） |
| 为什么 | API 最成熟，直接收「照片+音频」，9:16 + 纯色背景 + 最长 30 分钟，有翻译，有同意流程文档 | 国产，中文语境自然，头和上身动作好，价格同档；有中国团队的口碑 |
| 60 秒成本 | 配音 <$0.5 + 数字人 $3 ≈ **$3.5（约 25 元）** | 配音 <$0.5 + $3.4–6.9 ≈ **$4–7.5（约 30–55 元）** |
| 质量上限对照 | 加测一个 HeyGen **Avatar V 数字分身**（录 15 秒本人视频），约 $4/分钟，看「照片版」和「视频分身版」差多少 | 时间够再加测 OmniHuman 1.5（即梦），约 $8–10/分钟 |

### 5.3 风险

| 风险 | 说明 | 怎么应对 |
|---|---|---|
| 恐怖谷 / 一看就假 | 照片数字人的眨眼、牙齿、嘴角细节、长时间的头部晃动最容易露馅 | 选正脸高清照；镜头里加动效、字幕、B-roll 切换，减少一直盯着脸的时长 |
| 手和身体 | 照片只有半身时，手势容易怪；全身照效果不稳定 | 先用胸部以上的照片；需要手势再测 Avatar V / 可灵 |
| 时长 | HeyGen API 单条 30 分钟；可灵约 5 分钟；OmniHuman 约 60 秒 | 口播 60 秒以内都不是问题；更长的分段生成再拼 |
| 授权（最重要） | 照片数字人平台不核验，**法律责任在我们** | 只用自己团队成员/签了授权书的人；授权书写明「肖像+声音用于 AI 生成、商用、期限」；用户上传照片时让用户勾选承诺 |
| 平台 AI 标识 | 国内《人工智能生成合成内容标识办法》**2025-09-01 起施行**，要求「看得见的标识 + 文件里的隐藏标识」；抖音规定 AI 内容要显著标注、虚拟人要注册、使用者实名；TikTok 要求写实的 AI 人物/声音打「AI 生成」标签，假冒真人不标会被删 | 成片默认打「AI 生成」角标；发布时勾选平台的 AI 声明；不要冒充真人身份 |
| 服务商绑定 / 涨价 | 价格和接口变化快（HeyGen 今年就取消了 API 免费额度） | 第③步做成可插拔的，HeyGen/可灵随时能换 |
| 免费版不能商用 | HeyGen 免费版视频只能非商用 | 正式用要付费 |

---

## 6. 明天怎么上手（具体步骤）

**准备（10 分钟）**
1. 准备 **2 张照片**：一张正脸胸像（光线均匀、不戴墨镜、嘴巴闭合）、一张半身带手的照片。**用团队自己同意的人的照片**（比如你自己）。
2. 准备 **2 段文案**：一段英文约 150 词、一段中文约 250 字，都是我们平常的口播风格（建议直接拿一条做过的口播视频的逐字稿，这样能跟真人版对比）。
3. 录一段 **1–2 分钟**本人说话的干净录音（安静房间，手机即可），用来克隆声音。

**测试（按顺序）**
1. **声音**：ElevenLabs 开 Starter（$5）或 Creator（$22）→ 快速克隆 → 用中英文案各出一版音频。中文再用 MiniMax 海螺网页版出一版。团队盲听：像不像本人、自不自然。
2. **HeyGen**：开 Creator（$29/月，600 积分 ≈ 30 分钟 Avatar IV，足够测）→ 照片数字人 → **上传第 1 步的音频**（不要用它自带配音，保证对比公平）→ 9:16、背景设纯绿色 → 各出 1 条 60 秒。
3. **可灵**：网页版可灵数字人（用网页积分先测，不用开 API）→ 同照片 + 同音频 → 出 1 条。
4. （可选）HeyGen 录 15 秒本人视频做 **Avatar V 分身**，同一文案出 1 条，看和照片版差距。
5. 把 2–3 条结果丢进**我们现有的自动剪辑流程**（转写 → 抠像 → 动效），看抠像边缘、字幕对齐是否正常。
6. （可选）HeyGen 视频翻译：把英文成片翻成西语或中文，看口型。

**对比打分表（每条视频 1–5 分）**

| 维度 | 看什么 |
|---|---|
| 像不像本人 | 脸型、肤色、牙齿、发型有没有走样 |
| 口型 | 中文/英文的嘴型准不准，有没有「嘴在动但对不上」 |
| 表情和眼神 | 眨眼自不自然，眼神是否呆 |
| 头和手的动作 | 会不会僵、会不会乱晃、手是否变形 |
| 抠像效果 | 进我们流程后边缘干不干净 |
| 速度 | 提交到出片多久 |
| 成本 | 实际扣了多少积分/钱 |

**注意**：测试只用自己人的脸和声音；在测试阶段不发布到公开平台。

---

## 7. 没确认的事（明天可以顺手查）

- HeyGen **照片数字人**能不能直接输出透明背景 WebM（文档只说数字分身支持）
- HeyGen API 价格表原页（我只能看到转引数字）
- 可灵数字人单条最长到底是 5 分钟还是 1 分钟；可灵开放平台官方单价
- 即梦/火山引擎 OmniHuman、火山声音复刻、蝉镜、腾讯智影、硅基智能的 API 官方价格
- ElevenLabs 中文克隆的实际质量、各档是否含 API

---

## 来源

**HeyGen**
- 价格页：https://www.heygen.com/pricing
- Avatar IV：https://www.heygen.com/avatars/avatar-iv
- Avatar IV API 公告：https://www.heygen.com/blog/announcing-the-avatar-iv-api
- Avatar V 上线（帮助中心）：https://help.heygen.com/en/articles/14602974-avatar-v-is-now-available-on-heygen
- API 价格说明：https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained
- HeyGen 自家的数字人 API 对比（含价格，注意是 HeyGen 自己写的）：https://www.heygen.com/blog/best-ai-avatar-talking-head-apis
- G2 整理的 HeyGen API 价格：https://www.g2.com/articles/heygen-api-pricing
- 透明背景：https://developers.heygen.com/transparent-background-videos.md
- 照片转视频：https://developers.heygen.com/photo-to-video.md
- 音频驱动视频：https://developers.heygen.com/audio-to-video
- 对口型接口：https://developers.heygen.com/reference/create-lipsync
- 同意流程：https://developers.heygen.com/docs/avatar-consent
- 常见问题（商用/所有权）：https://www.heygen.com/faq
- 翻译评测：https://creatify.ai/review/heygen-ai ， https://www.vmeg.ai/blog/heygen-reviews/

**其他数字人**
- 可灵 Avatar 2.0：https://fal.ai/models/fal-ai/kling-video/ai-avatar/v2/standard ， https://higgsfield.ai/blog/Meet-KlingAI-Avatar-2.0-AI-Talking-Avatars ， https://arxiv.org/html/2512.13313v1
- OmniHuman 1.5：https://fal.ai/learn/biz/omnihuman-15-vs-omnihuman-comparison ， https://piapi.ai/blogs/omnihuman-1-5-api-guide
- 即梦 API 开放：https://www.oschina.net/comment/news/369848
- Captions/Mirage：https://captions.ai/help/docs/api/pricing ， https://novoads.ai/en/blog/mirage-avatar-x-fal-pricing
- Hedra：https://www.usagepricing.com/blueprint/activity/hedra-2026-10-22-api-pay-per-use-rates
- Synthesia：https://creatify.ai/blog/synthesia-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- D-ID：https://creatify.ai/blog/d-id-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- Tavus：https://www.tavus.io/pricing
- Argil：https://argil.ai/pricing
- Akool：https://www.akool.com/api-pricing
- 蝉镜（App Store）：https://apps.apple.com/cn/app/id6736819551
- 剪映 SVIP 价格：https://www.ithome.com/0/908/477.htm
- 开源：InfiniteTalk https://meigen-ai.github.io/InfiniteTalk ， MuseTalk https://arxiv.org/html/2410.10122v3 ， EchoMimicV3 https://arxiv.org/html/2507.03905v1 ， LatentSync/MuseTalk https://studio.aifilms.ai/blog/latentsync-1-6-musetalk-1-5-open-source-lip-sync-dubbing ， LatentSync 实测 https://dev.to/frankfu/deployment-tests-of-imtalker-and-latentsync-1lma ， RunPod https://www.runpod.io/gpu-pricing

**声音**
- ElevenLabs 克隆文档：https://elevenlabs.io/docs/capabilities/voices ， https://elevenlabs.io/professional-voice-cloning
- ElevenLabs 语言：https://elevenlabs.io/docs/help-center/other/what-languages-do-you-support
- ElevenLabs 价格（第三方整理）：https://www.activepieces.com/blog/elevenlabs-pricing-2026-plans-credits-and-costs.md ， https://invideo.io/blog/ai-voice-model-pricing/
- MiniMax：https://www.gradually.ai/en/ai-models/minimax-speech-2-8/ ， https://telnyx.com/resources/minimax-speech-2-6-vs-elevenlabs-tts-benchmarks
- Fish Audio：https://fish.audio/en/developers/ ， https://smallest.ai/blog/fish-audio-pricing-plans-api-billing-commercial-use-in-2026
- 阿里云 CosyVoice：https://help.aliyun.com/zh/model-studio/cosyvoice-v3-plus ， https://help.aliyun.com/zh/model-studio/voice-replica-1/
- 火山引擎声音复刻：https://www.volcengine.com/docs/6561/79824

**翻译配音**
- 价格对比（第三方，有利益相关）：https://perso.ai/blog/ai-dubbing-pricing-2026-cost-per-minute-compared ， https://videodubber.ai/compare/elevenlabs-vs-rask-ai/

**合规**
- 《人工智能生成合成内容标识办法》：https://www.cac.gov.cn/2025-03/14/c_1743654685899683.htm ， https://www.stdaily.com/web/gdxw/2025-09/01/content_393211.html
- 抖音 AI 内容平台规范：https://www.chinalawtranslate.com/dou-yin-ai-rules/ ， https://www.36kr.com/p/2250495414873732
- TikTok AI 标识：https://www.echotik.live/blog/tiktok-ai-content-labeling-rules-2026/ ， https://musicbusinessworldwide.com/tiktok-says-its-testing-automatic-ai-content-detection-as-it-rolls-out-new-ai-generated-label-for-creators
