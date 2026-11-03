# motion-library：一键口播成片

给一张人物照片 + 一份文稿（或一条录好的口播），出一条剪好的竖屏短视频。可选：品牌官网链接、喜欢的例子视频。

## 怎么用（详细步骤在 `skills/talking-head-video/SKILL.md`）

```
照片 + 文稿 ──avatar.py──► 数字人原片（用户自己的 HeyGen：API 密钥自动，或套餐积分网页手动）
     │
录好的口播 ─────────────────┤
                            ▼
  prep.py（转写/对齐稿子、粗剪、抠像、品牌资料）→ logos.py（稿子里的品牌 → 官方 logo + 核对图）
  → 逐句审稿 → pick_pack.py 选风格包 → 从包的菜单里只挑需要的几个动作 → check_plan.py 按包的额度检查
  → render.py 出片（out.mp4 + 镜头清单）
```

- **风格包**（`library/packs/`）：一个包 = 一套定死的画风（字体、颜色、字幕、卡片、动法、能用的动作、每条片子的额度）。
  现在有 6 个，都是照真实的好视频仿出来的：视频号花字 `shipinhao`、白菜暗调 `baicai`、Clean Finance `nischa`、
  贴纸讲解 `sticker`、杂志纸张 `vox`、字幕新闻 `caption_news`。写法见 `library/packs/README.md`。
- **品牌**：给官网链接就行，品牌只换强调色（太浅自动换成同色系可读的深色），logo 放开头 / 结尾，包的底色和字体不变。
- **logo**：视频里提到的品牌一律用官方正版彩色 logo（核对过的表 → 品牌官网抓取），出片前出核对图；找不到就不放。
- **喜欢的例子 → 新包**：给一条喜欢的视频，照它做成新风格包（`library/packs/BUILD_BRIEF.md`），先出对比图确认，再用它剪。
- **选包**：`tools/pick_pack.py` 按稿子内容 / 素材条件 / 调性 / 品牌推荐两个包，SKILL.md 里有对照表。

## 动效零件库

下面的 151 个动效是零件：风格包把它们列进菜单才会被一键成片用到（换上包的字体和颜色）；以后做手动剪辑时给人挑着用。

### 说明

剪视频用的动效，按「视频类型」严格分开存放，每条都打了标签。AI 剪片时按标签从这里挑；
用户不满意哪一段，也按同样的标签在这里找替代。

- **库页面**：用浏览器打开 `gallery/index.html`（双击就行），可以筛选、看预览、看每个动效能换成什么。
- **总表**：`library/README.md`。
- **标签取值**：`tags.json`。所有标签只能从这里取，写错 `tools/catalog.py` 会报错。

## 目录

```
tags.json                         标签取值表（唯一来源）
library/
  talking-head/                   口播
    effects/<id>/                 每个动效：meta.json + template.js + preview.mp4 + poster.jpg
inspiration/
  launch/refs/<id>/               Monica Taste Gallery 的 22 条产品发布片（整片，还没拆成动效，不进库页面）
skills/
  talking-head-video/             口播一键成片 skill（转写 → 粗剪 → 抠像 → 镜头表 → 出片），模板从 library 取
tools/
  catalog.py                      检查标签 + 生成总表和库页面数据；--json 给 AI 挑动效的精简表；--alt ID 查替代
  previews.py                     给能出片的动效渲染预览
gallery/index.html                库页面
```

## 严格区分的规则

1. **视频类型由文件夹决定**：放在 `library/talking-head/` 下的，`video_type` 必须是 `talking-head`，不一致直接报错。
2. **库里只放做出来的动效**：每个都有 `template.js` 和用同一段口播渲染的预览。别人的整片放 `inspiration/`，拆成动效、写好代码后才进库。
3. **替代只在同一类型里找**：口播动效不会推荐产品发布片的东西。

## 每条的标签

| 标签 | 说明 |
|---|---|
| `purpose` 句子用途 | 这句话在做什么（开场钩子、数字、清单步骤、对比前后、引用证据……），1–3 个。AI 挑动效先看它 |
| `weight` 分量 | 底层（字幕、推近，不算数量）/ 小（脸完整露出）/ 大（全屏、盖脸、转场、版式大变） |
| `covers_face` 挡脸 | 会不会盖住、虚化脸或把人缩进小窗 |
| `zone` 位置 | 上方 / 中部 / 胸口 / 下方 / 全屏 / 环绕 / 整体（只动镜头或调色） |
| `group` 组 | 长得像的归一组，一条视频每组最多用一个；替代也先在同组里找 |
| `fills` 要填的参数 | 哪些参数要从原话里填、怎么填，标了必填/可选 |
| `needs` 前提 | 抠像 / 数字（要有真实数字） |
| `needs_assets` 素材 | 截图 / 照片 / B-roll视频 / logo，没有就不能用 |
| `duration`、`use_for` | 合适的镜头长度、一句话说什么时候用 |
| `category` 类别 | 只是浏览用：字体 / 素材 / 版式 / 镜头特效 / 转场 / 片头片尾 |
| `was` | 从候选区搬进来的，原来的编号（对照表 `candidates/id_map.json`） |

## 加一条

- 建 `library/<类型>/effects/<id>/`，写 `meta.json` + `template.js`（写法见 `skills/talking-head-video/SKILL.md`「加新模板」），在 `skills/talking-head-video/demo_rumi/shots_*.json` 里用一次，跑 `python3 tools/previews.py <id>`。
- 最后都跑 `python3 tools/catalog.py`。

`inspiration/` 里的缩略图和介绍来自别人的片子，只做内部学习用，这个库不要公开。
