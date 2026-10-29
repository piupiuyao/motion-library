# 动效库总表

由 `tools/catalog.py` 生成，别手改。标签取值见 `tags.json`。

## 口播（`talking-head`）：能出片 8 个，参考 9 条

### 速查：这句话在说什么 → 用哪个

| 句子用途 | 能出片的动效 |
|---|---|
| 开场钩子 | 关键词放大（`keyword_pop`）、文字夹层（`text_sandwich`） |
| 核心观点 | 相框分层（`frame_layer`）、关键词放大（`keyword_pop`）、推近（`push_in`） |
| 吐槽痛点 | 黑白缩小（`mono_shrink`）、推近（`push_in`）、文字夹层（`text_sandwich`） |
| 数据对比 | 图表叠加（`data_chart`）、关键词放大（`keyword_pop`） |
| 引用资料 | 圆窗 B-roll（`broll_circle`）、资料飞入（`doc_fly`） |
| 展示细节 | 圆窗 B-roll（`broll_circle`）、资料飞入（`doc_fly`） |
| 列举 | 资料飞入（`doc_fly`）、相框分层（`frame_layer`） |
| 换话题 | 相框分层（`frame_layer`） |
| 强调词 | 文字夹层（`text_sandwich`） |
| 情绪高点 | 推近（`push_in`）、文字夹层（`text_sandwich`） |
| 结尾 | 关键词放大（`keyword_pop`）、推近（`push_in`） |

### 能出片

| 动效 | 类别 | 用途 | 风格 | 需要 | 时长 | 可以换成 |
|---|---|---|---|---|---|---|
| **圆窗 B-roll** `broll_circle` | 素材 | 展示细节、引用资料 | 通用 | 视频 | 3–6 秒 | 资料飞入、图表叠加 |
| **图表叠加** `data_chart` | 素材 | 数据对比 | 克制 | 数字 | 3–6 秒 | 关键词放大、圆窗 B-roll、资料飞入 |
| **资料飞入** `doc_fly` | 素材 | 引用资料、列举、展示细节 | 通用 | 图片 | 3–6 秒 | 圆窗 B-roll、相框分层、图表叠加 |
| **相框分层** `frame_layer` | 版式 | 换话题、列举、核心观点 | 网感、拼贴 | 抠像 | 3–8 秒 | 资料飞入、关键词放大、推近 |
| **关键词放大** `keyword_pop` | 字体 | 开场钩子、核心观点、结尾、数据对比 | 通用 | — | 2–6 秒 | 推近、图表叠加、相框分层 |
| **黑白缩小** `mono_shrink` | 版式 | 吐槽痛点 | 克制 | — | 2–5 秒 | 推近、文字夹层、相框分层 |
| **推近** `push_in` | 镜头特效 | 情绪高点、结尾、核心观点、吐槽痛点 | 通用 | — | 2–6 秒 | 文字夹层、关键词放大、相框分层 |
| **文字夹层** `text_sandwich` | 字体 | 强调词、情绪高点、开场钩子、吐槽痛点 | 网感 | 抠像 | 2–5 秒 | 推近、关键词放大、黑白缩小 |

参数见各自的 `meta.json`。

### 参考（只拆了，还没做成模板）

| 条目 | 类别 | 用途 | 风格 | 出处 |
|---|---|---|---|---|
| 每段换背景 `bg_switch` | 版式 | 换话题 | 网感 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 抠像出镜 + 重点卡 `cutout_card` | 版式 | 核心观点 | 克制 | 剪辑师白菜「告别廉价口播」（视频号，refs/94_1793056051） |
| 虚线圈聚焦 `dashed_focus` | 镜头特效 | 展示细节、强调词 | 网感 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 结尾标题卡 `end_title` | 片头片尾 | 结尾 | 克制 | 剪辑师白菜「告别廉价口播」（视频号，refs/94_1793056051） |
| 黑白 + 白底大字钩子 `hook_bigword` | 片头片尾 | 开场钩子、吐槽痛点 | 网感 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 背景纸 + 分层道具 `paper_props` | 版式 | 展示细节、列举 | 网感、纸艺 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 扫描线质感 + 大字 `scanline_word` | 镜头特效 | 核心观点、结尾 | 复古 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 人像贴纸描边 `sticker_outline` | 版式 | 换话题 | 网感、拼贴 | 我李哥豆儿「4 套剪辑手法打破扁平画面」（视频号，refs/95_1793056112） |
| 顶部固定标题栏 `title_bar` | 字体 | 全片常驻 | 克制 | 剪辑师白菜「告别廉价口播」（视频号，refs/94_1793056051） |

## 产品发布片（`launch`）：能出片 0 个，参考 22 条

### 参考（只拆了，还没做成模板）

| 条目 | 类别 | 用途 | 风格 | 出处 |
|---|---|---|---|---|
| Taste Studio：一支讲 launch 视频的 launch 视频 `17a08yy7tdpypfz3jnrp` | 整片参考 | — | 未分 | Taste Studio |
| Base44：流体渐变 + 句中嵌入提示词卡 `2glntm1zfwcocwnu2prn` | 整片参考 | — | 光感 | Base44 |
| 生活实拍 TVC + 一个输入框 `3ikc5p8nuygs0q58fkou` | 整片参考 | — | 电影感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| Cardboard：TOKYO 瑞士海报式动态排版 `54o3znqkwv1ro5su5bam` | 整片参考 | — | 排版 | Cardboard |
| Future Proof 2026《In the Fold》：纸艺动效 `ag49n14nu6ce7ot9fepu` | 整片参考 | — | 纸艺 | Future Proof 2026 |
| Clicky：一封打出来的信 → 老互联网 → 会说话的光标 `clicky-nostalgia` | 整片参考 | — | 复古 | [Farza (Clicky)](https://x.com/FarzaTV/status/2054397864009408889) |
| ChatCut：缩略图卡片云 → 输入框 `s23eg9i9vx5xihgpt1fz` | 整片参考 | — | 光感 | ChatCut |
| 心流动效：铁屑成形与手绘 `seed-flow` | 整片参考 | — | 纸艺 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| Kimi K3：从桌上的草图到可玩的世界 `seed-kimi` | 整片参考 | — | 纸艺 | Kimi (Moonshot AI) |
| Lovable：高能光斑 + 光标演示 `seed-lovable` | 整片参考 | — | 光感 | Lovable |
| 设计动效合集：充气字与光斑 `seed-r1-1014` | 整片参考 | — | 光感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| 无限推进：眼睛 → 虹膜 → 世界 → 纸上一个点 `seed-r2-1014` | 整片参考 | — | 电影感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| 黑白电影感：taste vs AVERAGE. `seed-r3-1014` | 整片参考 | — | 电影感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| 档案胶片：过去怎么找到你 → TODAY, `seed-r4-1014` | 整片参考 | — | 复古 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| 立体书：从巴黎到罗马 `seed-r5-1014` | 整片参考 | — | 纸艺 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| Base44：贴纸拼贴 + 单词转盘 `seed-r6-1014` | 整片参考 | — | 拼贴、纸艺 | Base44 |
| Agent 产品片：渐变马赛克 → 光球 → 输入框 `seed-r7-1014` | 整片参考 | — | 光感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| OpenCompute：黑白照片网格 + 红色强调 `seed-r8-1014` | 整片参考 | — | 排版、电影感 | OpenCompute |
| Lovable：质疑推文墙 → 创始人来电 `seed-r9-1014` | 整片参考 | — | 电影感 | Lovable |
| 消息简史：从打字机到群聊 `seed-retro` | 整片参考 | — | 复古 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| AI 图像工具发布：柔光渐变 + 半调云朵 `t1ehdxhnq6fari49j3re` | 整片参考 | — | 光感 | Monica 的 Taste Gallery（Clico taste-gallery 分支） |
| Ideogram 4.5：生成图满屏 + 衬线词 + 选框 `vnu0mxbsjdft7v5w2oiu` | 整片参考 | — | 光感 | Ideogram |
