// 漏光闪白 · 转场：一道暖橙/白色光扫过画面，短暂过曝到接近全白，光过去时新画面出现
TEMPLATES.c69 = {
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
    this.sc.root.style.opacity = 0;
    this.leak = el('div', `position:absolute;left:-1080px;top:-200px;width:2160px;height:2320px;opacity:0;
      background:radial-gradient(ellipse 30% 45% at 50% 45%, rgba(255,255,240,.95), rgba(255,190,90,.75) 40%, rgba(255,110,30,.35) 70%, transparent 100%),
                 radial-gradient(ellipse 18% 30% at 30% 70%, rgba(255,120,40,.6), transparent 100%)`);
    this.white = el('div', 'position:absolute;inset:0;background:#fff8ec;opacity:0');
    ctx.L.front.append(this.sc.root, this.leak, this.white);
  },
  frame(ctx) {
    const dt = ctx.t - this.T, D = ctx.params.dur || 1.0;
    this.sc.update(Math.max(0, dt));
    const p = clamp((dt + D * .5) / D); // leak travels over D seconds, peak at T
    this.leak.style.opacity = Math.sin(Math.PI * p);
    this.leak.style.transform = `translateX(${lerp(-500, 1500, ease.inOut(p))}px) rotate(12deg)`;
    this.white.style.opacity = .95 * Math.max(0, 1 - Math.abs(dt) / (D * .35));
    this.sc.root.style.opacity = dt >= 0 ? 1 : 0;
    this.sc.root.style.transform = `scale(${dt >= 0 ? lerp(1.06, 1, ease.out(clamp(dt / 1.2))) : 1})`;
  },
};
