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
  catalog.py                      检查标签 + 生成总表和库页面数据；--alt ID 查替代
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
| `category` 类别 | 字体 / 素材 / 版式 / 镜头特效 / 片头片尾 / 整片参考 |
| `purpose` 句子用途 | 开场钩子、核心观点、吐槽痛点、数据对比、引用资料……（AI 选动效和推荐替代都靠它） |
| `style` 风格 | 通用（跟皮肤变）、克制、网感、拼贴、复古、光感、纸艺、排版、电影感 |
| `needs` 需要 | 抠像 / 图片 / 视频 / 数字 |
| `source` 出处 | 从哪条片子拆的 |

## 加一条

- 建 `library/<类型>/effects/<id>/`，写 `meta.json` + `template.js`（写法见 `skills/talking-head-video/SKILL.md`「加新模板」），在示例镜头表 `shots_showcase.json` 里用一次，跑 `python3 tools/previews.py <id>`。
- 最后都跑 `python3 tools/catalog.py`。

`inspiration/` 里的缩略图和介绍来自别人的片子，只做内部学习用，这个库不要公开。
