# motion-library：动效库

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
