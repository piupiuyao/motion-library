// 失焦入场 · 镜头特效：画面一开始雾蒙蒙、很糊、稍微放大，然后慢慢变清楚，人「对上焦」
TEMPLATES.c61 = {
  setup(ctx) {
    // cheap blur: shrink the frame to a tiny canvas and let the browser smooth it back up
    this.tiny = document.createElement('canvas'); this.tg = this.tiny.getContext('2d');
    this.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 50%');
    this.cv.width = 270; this.cv.height = 480;
    this.g = this.cv.getContext('2d');
    this.haze = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, rgba(255,250,240,.25), rgba(255,250,240,.5))');
    ctx.L.back.append(this.cv, this.haze);
    ctx.base.style.transformOrigin = this.cv.style.transformOrigin = '50% 40%';
  },
  draw(b) {
    const sw = Math.max(6, Math.round(lerp(270, 14, b))), sh = Math.round(sw * 16 / 9);
    this.tiny.width = sw; this.tiny.height = sh;
    this.tg.imageSmoothingQuality = 'high';
    this.tg.drawImage(this.baseImg, 0, 0, sw, sh);
    this.g.imageSmoothingQuality = 'high';
    this.g.drawImage(this.tiny, 0, 0, 270, 480);
  },
  frame(ctx) {
    const dur = ctx.params.dur || 1.6;
    const b = 1 - ease.inOut(enter(ctx.t, .2, dur)); // 1 = fully blurred
    const s = (ctx.seg.zoom || 1) * (1 + .09 * b);
    ctx.base.style.transform = this.cv.style.transform = `scale(${s})`;
    this.haze.style.opacity = b;
    this.cv.style.opacity = clamp(b * 2.2);
    this.baseImg = ctx.baseImg;
    if (b > .001) pending.push(ctx.baseImg.decode().catch(() => {}).then(() => this.draw(b)));
  },
};
