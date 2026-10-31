# Brief: batch 3 — find 10 reference videos by style, extract NEW effects

Repo: `~/motion-library`. It is a library of motion effects for vertical talking-head videos (one person talking to camera).
124 effects are already in `library/talking-head/effects/`. Each has a `style` tag (see `tags.json` → `style`):
简洁商务 / 网感活泼 / 电影感 / 科技感 / 复古手作 / 通用.

Goal of this batch: find **real, popular talking-head videos** in a given style, look at them, and list the motion
effects in them that the library does **not** have yet. Nothing gets built in this step — only found and described.

## Your share
Given in the task message (which styles, how many videos each).

## What counts as a good reference video
- A person talking to camera (vertical short: TikTok / Reels / YouTube Shorts; a horizontal YouTube talking-head is OK
  if it's clearly that style). Not product launch films, not pure motion design, not tutorials-about-editing unless
  the tutorial shows a finished talking-head result.
- Clearly in the requested style, and edited with care (popular creator / high views, or a well-known editing style).
  Examples of what each style means:
  - 简洁商务: knowledge / career / finance creators — clean cards, thin type, screenshots, lists, calm motion.
  - 电影感: documentary / story creators — letterbox, grading, light, depth of field, slow camera, title cards.
  - 科技感: tech / AI creators — glowing lines, glass UI, HUD, data, scan lines, 3D screens.
  - 网感活泼: energetic TikTok creators — bouncy captions, stickers, memes, shakes.
- Each video should give **at least 2 effects the library doesn't have**. If a video only repeats what we have, drop it
  and find another.

## How to look (you can't watch video — you must look at frames)
1. Check what we already have first: `python3 tools/catalog.py --json` (name, use_for, style of all 124).
   Read it once and keep it in mind. An effect is "new" only if it is visibly different from every existing one
   (not just a colour change).
2. Search (WebSearch / WebFetch) for creators and videos. YouTube is the most reliable to download; TikTok/IG often fail.
3. Download only short low-res sections and pull frames:
   ```
   mkdir -p candidates/refs3/<slug> && cd candidates/refs3/<slug>
   yt-dlp -q -f "bv*[height<=480][ext=mp4]/b[height<=480]" --download-sections "*START-END" -o ref.mp4 "<url>"
   ffmpeg -v error -i ref.mp4 -vf "fps=2,scale=360:-2" f_%03d.jpg && rm ref.mp4
   ```
   Sections of ≤60 s. Look at the jpgs with the Read tool. Keep at most ~25 jpgs per video; delete the video file.
   `candidates/refs3/` is git-ignored (other people's content).
4. Only describe what you actually saw in frames. If you couldn't fetch frames for a video, don't use that video.

## Output
Append to `candidates/batch3.json` (a JSON list; create it if missing; another agent writes to the same file, so
read-modify-write it in one go and keep the other agent's entries). One entry per NEW effect:
```json
{
  "name": "中文名（4–8 字）",
  "style": ["电影感"],
  "category": "字体 | 素材 | 版式 | 镜头特效 | 转场",
  "what": "中文：画面上具体发生什么——位置、大小、颜色、动作、时长、在人前还是人后。要具体到能照着做。",
  "use": "中文：口播里哪种句子用它",
  "needs": [],
  "needs_assets": [],
  "difficulty": "easy | medium | hard",
  "sources": ["https://...&t=NNs"],
  "ref_moment": "mm:ss–mm:ss",
  "ref_frames": "candidates/refs3/<slug>/f_012.jpg, f_013.jpg",
  "closest_existing": "库里最像的一个 id，以及区别在哪"
}
```
`needs` values: 抠像 / B-roll / 截图 / 数字 (as in tags.json); `needs_assets`: 截图 / 照片 / B-roll视频 / logo.

Also write `candidates/refs3/<slug>/video.md` per video: link, creator, views if known, style, 1–2 lines on why it's a
good example, and the list of effect names you took from it.

## Memory / disk — very important
The machine has ~13 GB disk free and little RAM; a crash loses everything.
- One yt-dlp download at a time, 480p, sections ≤60 s. Delete videos right after pulling frames.
- No renders, no previews, no ML models.
- Don't make giant contact sheets; read frames at the saved size.

## Don't
- Don't build templates or touch `library/`, `skills/`, `tags.json`.
- Don't commit.
- Don't log in anywhere or use cookies.

## Final report (short, English is fine)
Videos used (link + style + why), effects added (name + closest existing), videos tried and dropped.
