// 快门闪白 · 转场：取景框一闪，白闪加轻微抖动，画面在闪的瞬间切成一张「刚拍下的照片」
TEMPLATES.c70 = {
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
    this.sc = this.scene(ctx);
    if (this.sc.img && typeof ctx.params.to === 'string') {
      // polaroid-style white border around the "photo"
      this.sc.img.style.border = '22px solid #fff'; this.sc.img.style.borderBottomWidth = '90px';
      this.sc.img.style.boxSizing = 'border-box'; this.sc.img.style.borderRadius = '6px';
      this.sc.img.style.top = '380px';
    }
    this.sc.root.style.opacity = 0;
    const c = 'position:absolute;width:110px;height:110px;border:0 solid #fff;';
    this.vf = el('div', 'position:absolute;inset:0;opacity:0');
    this.vf.innerHTML = `<div style="${c}left:80px;top:220px;border-left-width:10px;border-top-width:10px"></div>
      <div style="${c}right:80px;top:220px;border-right-width:10px;border-top-width:10px"></div>
      <div style="${c}left:80px;top:1260px;border-left-width:10px;border-bottom-width:10px"></div>
      <div style="${c}right:80px;top:1260px;border-right-width:10px;border-bottom-width:10px"></div>
      <div style="position:absolute;left:510px;top:${ctx.focus[1] * 1920 - 30}px;width:60px;height:60px;border:6px solid #fff;border-radius:50%;box-sizing:border-box"></div>`;
    this.barT = el('div', 'position:absolute;left:0;right:0;top:0;height:0;background:#000');
    this.barB = el('div', 'position:absolute;left:0;right:0;bottom:0;height:0;background:#000');
    this.white = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
    ctx.L.front.append(this.sc.root, this.vf, this.barT, this.barB, this.white);
  },
  frame(ctx) {
    const dt = ctx.t - this.T;
    this.sc.update(Math.max(0, dt));
    this.vf.style.opacity = dt < 0 && dt > -.7 ? clamp((dt + .7) / .15) : 0;
    // shutter blades close for ~3 frames right before the flash
    const shut = dt > -.1 && dt < 0 ? Math.sin(Math.PI * (dt + .1) / .1) : 0;
    this.barT.style.height = this.barB.style.height = 960 * shut + 'px';
    this.white.style.opacity = dt >= 0 ? Math.max(0, 1 - dt / .35) : 0;
    this.sc.root.style.opacity = dt >= 0 ? 1 : 0;
    const k = dt >= 0 && dt < .3 ? (1 - dt / .3) : 0;
    const sx = Math.sin(dt * 90) * 22 * k, sy = Math.cos(dt * 70) * 16 * k;
    const rot = dt >= 0 ? lerp(-6, -2, ease.out(clamp(dt / .6))) : 0;
    this.sc.root.style.transform = `translate(${sx}px, ${sy}px)`;
    if (this.sc.img && typeof ctx.params.to === 'string') this.sc.img.style.transform = `rotate(${rot}deg) scale(${lerp(1.08, 1, ease.out(clamp(dt / .5)))})`;
    ctx.base.style.transform = `translate(${dt < 0 ? 0 : sx}px, ${dt < 0 ? 0 : sy}px) scale(${ctx.seg.zoom || 1})`;
  },
};
