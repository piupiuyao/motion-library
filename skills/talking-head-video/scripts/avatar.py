#!/usr/bin/env python3
"""Step 0 · photo + script → talking-head footage (HeyGen Avatar IV), so a video can start from just a photo.

  python3 scripts/avatar.py PROJECT --photo me.jpg [--voice "Olivia"] [--lang en]   -> PROJECT/heygen_raw.mp4 + raw.mp4
  python3 scripts/avatar.py PROJECT --voices [--lang en]                             -> list voices to pick from
  python3 scripts/avatar.py PROJECT --from-file downloaded.mp4                       -> use a video made on heygen.com

The script is PROJECT/script.txt. Two ways, both use the user's OWN HeyGen account:
  · API key (automatic): HEYGEN_API_KEY in the environment or in ~/.secrets/heygen.env. API usage is billed by HeyGen
    on that account (API credit may be separate from a web plan).
  · Plan credits (manual): no key → this prints the steps to make it on heygen.com with their plan, then
    `--from-file` brings the downloaded video in.
Never ask for the key in chat; the user stores it themselves.
Photo tips (from our tests): chest-up, face large and sharp, mouth visible, plain light → better lip sync than half/full body.
After it's made: check every second for fake/glitched hands and odd mouths (SKILL.md); regenerate if any.
"""
import argparse, json, os, shutil, subprocess, sys, time
import urllib.request, urllib.error

API = 'https://api.heygen.com'
UPLOAD = 'https://upload.heygen.com/v1/asset'


def api_key():
    if os.environ.get('HEYGEN_API_KEY'):
        return os.environ['HEYGEN_API_KEY'].strip()
    f = os.path.expanduser('~/.secrets/heygen.env')
    if os.path.exists(f):
        for ln in open(f):
            if ln.strip().startswith('HEYGEN_API_KEY='):
                return ln.split('=', 1)[1].strip().strip('"\'')
    return None


def call(method, url, key, body=None, ctype='application/json'):
    data = body if isinstance(body, (bytes, type(None))) else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={'X-Api-Key': key, 'Content-Type': ctype, 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', 'ignore')[:400]
        sys.exit(f'HeyGen {method} {url.split(".com")[-1]} → HTTP {e.code}: {msg}\n'
                 '(401/403: key wrong or no API access · 402/insufficient: top up API credit on heygen.com)')


def voices(key, lang):
    vs = call('GET', f'{API}/v2/voices', key)['data']['voices']
    return [v for v in vs if not lang or lang.lower() in (v.get('language') or '').lower()]


def manual_steps(proj, photo):
    print(f"""没有 HeyGen API 密钥 → 用自己的 HeyGen 套餐积分在网页上做（约 2 分钟）：
  1. 打开 https://app.heygen.com → Avatars → Create → Photo Avatar，上传照片：{photo or '（胸口以上的近景照，脸大、清楚）'}
  2. 用这个形象新建视频：选 Avatar IV 引擎、竖屏 9:16，把 {os.path.join(proj, 'script.txt')} 的稿子整段贴进去，选一个声音
  3. 生成后下载 1080p MP4，然后：
     python3 scripts/avatar.py {proj} --from-file 下载的文件.mp4
有密钥想全自动：自己把密钥存到 ~/.secrets/heygen.env（一行 HEYGEN_API_KEY=…），别贴在聊天里。""")


def to_raw(proj, src):
    """heygen_raw.mp4 → raw.mp4: 1080×1920, 30 fps (what prep.py expects)."""
    raw = os.path.join(proj, 'raw.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
                    'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
                    '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', raw], check=True)
    print(f'-> {raw}  (next: check hands/mouth, then  python3 scripts/prep.py {proj} --lang …)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('proj')
    ap.add_argument('--photo', help='chest-up photo (jpg/png)')
    ap.add_argument('--voice', help='voice name to match (e.g. Olivia), or use --voice-id')
    ap.add_argument('--voice-id')
    ap.add_argument('--lang', default='en', help='voice language filter, e.g. en, zh, ja, ko')
    ap.add_argument('--voices', action='store_true', help='list voices and exit')
    ap.add_argument('--from-file', help='a video made on heygen.com with plan credits')
    ap.add_argument('--motion', help='optional custom motion prompt, e.g. "natural small hand gestures"')
    a = ap.parse_args()
    proj = a.proj
    os.makedirs(proj, exist_ok=True)
    out = os.path.join(proj, 'heygen_raw.mp4')

    if a.from_file:
        shutil.copy(a.from_file, out)
        return to_raw(proj, out)
    key = api_key()
    if not key:
        return manual_steps(proj, a.photo)
    if a.voices:
        for v in voices(key, a.lang)[:80]:
            print(f"{v['voice_id']}  {v.get('name', ''):<28} {v.get('language', ''):<12} {v.get('gender', '')}")
        return
    script = open(os.path.join(proj, 'script.txt')).read().strip()
    if not a.photo:
        sys.exit('--photo is required (chest-up photo)')
    vid = a.voice_id
    if not vid:
        vs = voices(key, a.lang)
        pick = [v for v in vs if a.voice and a.voice.lower() in (v.get('name') or '').lower()] or vs
        if not pick:
            sys.exit(f'no voice for language {a.lang}; run --voices')
        vid = pick[0]['voice_id']
        print(f"voice: {pick[0].get('name')} ({vid})")
    ext = os.path.splitext(a.photo)[1].lower()
    up = call('POST', UPLOAD, key, open(a.photo, 'rb').read(), 'image/png' if ext == '.png' else 'image/jpeg')['data']
    image_key = up.get('image_key') or up.get('key') or up.get('id')
    body = {'image_key': image_key, 'video_title': os.path.basename(os.path.abspath(proj)), 'script': script,
            'voice_id': vid, 'video_orientation': 'portrait', 'fit': 'cover'}
    if a.motion:
        body.update({'custom_motion_prompt': a.motion, 'enhance_custom_motion_prompt': True})
    video_id = call('POST', f'{API}/v2/video/av4/generate', key, body)['data']['video_id']
    print(f'generating {video_id} …')
    for _ in range(180):  # up to ~30 min
        time.sleep(10)
        st = call('GET', f'{API}/v1/video_status.get?video_id={video_id}', key)['data']
        if st.get('status') == 'completed':
            urllib.request.urlretrieve(st['video_url'], out)
            print(f'-> {out}')
            return to_raw(proj, out)
        if st.get('status') == 'failed':
            sys.exit(f"HeyGen failed: {st.get('error')}")
    sys.exit(f'still not done after 30 min; video_id {video_id} — check heygen.com, then --from-file')


if __name__ == '__main__':
    main()
