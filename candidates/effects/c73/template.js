// 开幕分屏 · 转场：当前画面分成四条，像幕布一样从中间往两边拉开，露出下面的新画面或标题
TEMPLATES.c73 = {
  // next scene for the demo: params.to = image path | {frames,...} B-roll | omitted -> title card (params.title)
  scene(ctx) {
    const P = ctx.params, to = P.to;
    const root = el('div', 'position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 30%, var(--bg-b), var(--bg-a) 70%)');
    let img = null;
    if (to) {
      const isFrames = typeof to === 'object';
      img = el('img', isFrames
        ? 'position:absolute;left:0;top:330px;width:1080px;height:1000px;object-fit:cover;box-shadow:0 30px 80px rgba(0,0,0,.5)'
        : 'position:absolute;left:60px;top:300px;width:960px;height:auto;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.5)');
      root.appendChild(img);
      if (!isFrames) { img.src = url(to); pending.push(img.decode().catch(() => {})); }
      if (P.label) {
        const l = el('div', 'position:absolute;left:60px;right:60px;top:150px;text-align:center;font-size:84px;color:var(--paper)', P.label);
        l.className = 'display'; root.appendChild(l);
      }
    } else {
      root.style.background = 'var(--accent)';
      const l = el('div', 'position:absolute;left:70px;right:70px;top:560px;text-align:center;font-size:150px;color:var(--ink);text-transform:uppercase', P.title || 'Next up');
      l.className = 'display'; root.appendChild(l);
      if (P.subtitle) {
        const s = el('div', 'position:absolute;left:70px;right:70px;top:1180px;text-align:center;font:700 56px var(--font-body);color:var(--ink);opacity:.75', P.subtitle);
        root.appendChild(s);
      }
    }
    return {
      root, img,
      update: t => { if (img && typeof to === 'object') setImg(img, mediaSrc(to, t)); },
    };
  },
  hit(ctx, a, def) {
    const n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const w = a != null && ctx.words.find(w => n(w.w) === n(a));
    return w ? w.s : def;
  },
  setup(ctx) {
    this.T = this.hit(ctx, ctx.params.at, clamp(ctx.d * .35, .7, 1.6));
    this.N = ctx.params.strips || 4;
    this.sc = this.scene(ctx);
    ctx.L.front.appendChild(this.sc.root);
    const w = 1080 / this.N;
    this.strips = [];
    for (let i = 0; i < this.N; i++) {
      const cv = el('canvas', `position:absolute;top:0;left:${i * w}px;width:${w}px;height:1920px;box-shadow:0 0 40px rgba(0,0,0,.55)`);
      cv.width = Math.round(w / 2); cv.height = 960;
      this.strips.push({ cv, g: cv.getContext('2d'), i });
    }
    // inner strips sit on top so they slide over the outer ones like folding curtains
    const order = [...this.strips].sort((a, b) => Math.abs(b.i - (this.N - 1) / 2) - Math.abs(a.i - (this.N - 1) / 2));
    for (const s of order) ctx.L.front.appendChild(s.cv);
  },
  draw(img, z) {
    const w = 1080 / this.N;
    for (const s of this.strips) {
      const sx = 540 + (s.i * w - 540) / z;
      s.g.drawImage(img, sx, 960 - 960 / z, w / z, 1920 / z, 0, 0, s.cv.width, 960);
    }
  },
  frame(ctx) {
    const dt = ctx.t - this.T, D = ctx.params.dur || .8, w = 1080 / this.N;
    this.sc.update(Math.max(0, dt));
    const on = dt >= 0;
    this.sc.root.style.opacity = on ? 1 : 0;
    for (const s of this.strips) {
      s.cv.style.display = on && dt < D + .1 ? '' : 'none';
      const left = s.i < this.N / 2;
      const dist = left ? (s.i + 1) * w + 40 : (this.N - s.i) * w + 40;
      const p = ease.inOut(clamp((dt - Math.abs(s.i - (this.N - 1) / 2) * .04) / D));
      s.cv.style.transform = `translateX(${(left ? -1 : 1) * dist * p}px)`;
    }
    if (on && dt < D + .1) {
      const z = ctx.seg.zoom || 1;
      pending.push(ctx.baseImg.decode().catch(() => {}).then(() => this.draw(ctx.baseImg, z)));
    }
    this.sc.root.style.transform = `scale(${on ? lerp(1.08, 1, ease.out(clamp(dt / 1))) : 1})`;
  },
};
