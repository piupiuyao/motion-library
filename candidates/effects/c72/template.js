// 圆形扩散揭示 · 转场：新画面透过一个从 0 长到全屏的圆形出现，像光圈打开
TEMPLATES.c72 = {
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
    const P = ctx.params;
    this.T = this.hit(ctx, P.at, clamp(ctx.d * .3, .6, 1.5));
    this.c = P.center || [540, 760];
    this.sc = this.scene(ctx);
    this.ring = el('div', 'position:absolute;border-radius:50%;border:12px solid var(--accent);box-sizing:border-box;box-shadow:0 0 30px rgba(0,0,0,.35)');
    ctx.L.front.append(this.sc.root, this.ring);
  },
  frame(ctx) {
    const D = ctx.params.dur || .8, dt = ctx.t - this.T;
    this.sc.update(Math.max(0, dt));
    const R = dt <= 0 ? 0 : lerp(0, 1400, ease.inOut(clamp(dt / D)));
    const [cx, cy] = this.c;
    this.sc.root.style.clipPath = `circle(${R}px at ${cx}px ${cy}px)`;
    Object.assign(this.ring.style, {
      left: cx - R - 6 + 'px', top: cy - R - 6 + 'px', width: 2 * R + 12 + 'px', height: 2 * R + 12 + 'px',
      opacity: dt > 0 && dt < D ? 1 - clamp((R - 900) / 400) : 0,
    });
  },
};
