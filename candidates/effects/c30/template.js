// 快闪连拍 · 素材：同一构图的几个不同画面，每个只停几帧，在标题后面的圆角框里快速循环闪
TEMPLATES.c30 = {
  setup(ctx) {
    const P = ctx.params;
    // default: four moments of the same talking-head clip, each graded differently so they read as different takes
    const imgs = P.images || [80, 520, 980, 1420].map(n => `work/frames_src/${String(n).padStart(6, '0')}.jpg`);
    const grades = P.images ? ['none'] : ['none', 'hue-rotate(160deg) saturate(1.3)', 'grayscale(1) contrast(1.2)', 'sepia(.7) hue-rotate(-20deg) saturate(1.6)'];
    this.bgc = el('div', `position:absolute;inset:0;background:${pattern('dots')}`);
    ctx.L.back.appendChild(this.bgc);
    this.box = el('div', 'position:absolute;left:110px;top:300px;width:860px;height:1060px;border-radius:56px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);border:8px solid var(--paper)');
    this.ims = imgs.map((src, k) => {
      const im = el('img', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:${grades[k % grades.length]}`);
      im.src = url(src); pending.push(im.decode().catch(() => {}));
      this.box.appendChild(im); return im;
    });
    ctx.L.back.appendChild(this.box);
    this.title = el('div', `position:absolute;left:30px;right:30px;top:1120px;text-align:center;font-size:${P.size || 150}px;color:var(--accent);
      -webkit-text-stroke:8px var(--ink);paint-order:stroke fill;line-height:.9`, P.text || 'HEY GUYS!');
    this.title.className = 'display';
    ctx.L.front.appendChild(this.title);
    this.fpi = P.framesEach || 3;
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.box.style.opacity = Math.min(pin, out);
    this.box.style.transform = `scale(${lerp(.85, 1, ease.back(pin)) * lerp(1, 1.04, t / ctx.d)})`;
    const f = Math.floor(t * 30 / this.fpi);
    this.ims.forEach((im, k) => { im.style.opacity = f % this.ims.length === k ? 1 : 0; });
    const q = enter(t, .2, .3);
    this.title.style.opacity = Math.min(q, out);
    this.title.style.transform = `scale(${ease.pop(q)}) rotate(-3deg)`;
  },
};
