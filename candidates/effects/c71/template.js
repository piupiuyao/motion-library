// 光扫转场 · 转场：一道很亮的斜向光从整个画面扫过，画面在光下面换成新画面
TEMPLATES.c71 = {
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
    this.T = this.hit(ctx, ctx.params.at, clamp(ctx.d * .3, .6, 1.5));
    this.sc = this.scene(ctx);
    this.tan = Math.tan(18 * Math.PI / 180);
    // wide soft glow + a hot white core, screen-blended so it brightens whatever is under it
    this.band = el('div', `position:absolute;left:0;top:-400px;width:1000px;height:2720px;margin-left:-500px;transform-origin:50% 50%;mix-blend-mode:screen;
      background:linear-gradient(90deg, transparent 0%, rgba(255,250,235,.12) 20%, rgba(255,250,235,.45) 38%, rgba(255,255,255,.95) 46%, #fff 50%, rgba(255,255,255,.95) 54%, rgba(255,250,235,.45) 62%, rgba(255,250,235,.12) 80%, transparent 100%)`);
    this.lift = el('div', 'position:absolute;inset:0;background:#fff;opacity:0;mix-blend-mode:screen');
    ctx.L.front.append(this.sc.root, this.lift, this.band);
  },
  frame(ctx) {
    const D = ctx.params.dur || .9, dt = ctx.t - this.T;
    this.sc.update(Math.max(0, dt));
    const p = ease.inOut(clamp(dt / D));
    const X = lerp(-900, 1980, p); // band centre at mid-height
    const tn = this.tan;
    this.band.style.transform = `translateX(${X}px) rotate(18deg)`;
    this.band.style.opacity = dt > 0 && dt < D ? 1 : 0;
    // the whole frame flares a little while the light crosses it
    this.lift.style.opacity = dt > 0 && dt < D ? .28 * Math.sin(Math.PI * dt / D) : 0;
    // everything left of the band centre line is already the new scene
    const xt = X + 960 * tn, xb = X - 960 * tn;
    this.sc.root.style.clipPath = dt <= 0 ? 'inset(0 100% 0 0)' : dt >= D ? 'none' : `polygon(0 0, ${xt}px 0, ${xb}px 1920px, 0 1920px)`;
  },
};
