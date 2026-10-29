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
      root.style.background = 'radial-gradient(ellipse at 50% 35%, #3a2a22, #121014 75%)';
      const l = el('div', 'position:absolute;left:70px;right:70px;top:560px;text-align:center;font-size:150px;color:var(--paper);text-transform:uppercase', P.title || 'Next up');
      l.className = 'display'; root.appendChild(l);
      if (P.subtitle) {
        const s = el('div', 'position:absolute;left:70px;right:70px;top:1180px;text-align:center;font:700 56px var(--font-body);color:var(--paper);opacity:.75', P.subtitle);
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
    // light leak: big soft warm blobs (orange/red/yellow) added on top with screen blending
    this.leak = el('div', `position:absolute;left:-900px;top:-500px;width:2400px;height:2900px;opacity:0;mix-blend-mode:screen;
      background:radial-gradient(ellipse 22% 30% at 52% 46%, rgba(255,250,225,1), rgba(255,200,90,.95) 35%, rgba(255,120,30,.75) 65%, rgba(255,60,20,0) 100%),
                 radial-gradient(ellipse 14% 40% at 30% 55%, rgba(255,80,30,.9), rgba(255,40,10,0) 100%),
                 radial-gradient(ellipse 12% 25% at 72% 38%, rgba(255,210,80,.85), rgba(255,160,40,0) 100%)`);
    this.white = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, #fffdf5, #ffe2b0);opacity:0');
    ctx.L.front.append(this.sc.root, this.leak, this.white);
  },
  frame(ctx) {
    const dt = ctx.t - this.T, D = ctx.params.dur || 1.2;
    this.sc.update(Math.max(0, dt));
    const p = clamp((dt + D * .5) / D); // leak travels over D seconds, brightest at T (the cut)
    this.leak.style.opacity = Math.pow(Math.sin(Math.PI * p), .7);
    this.leak.style.transform = `translate(${lerp(-420, 520, p)}px, ${lerp(250, -200, p)}px) rotate(${lerp(-10, 16, p)}deg)`;
    // overexposure: the old shot burns out toward white just before the cut, the new one comes up out of it
    const burn = Math.max(0, 1 - Math.abs(dt) / (D * .2));
    this.white.style.opacity = .92 * Math.pow(burn, 1.4);
    ctx.baseImg.style.filter = dt < 0 ? `brightness(${1 + 1.2 * burn}) saturate(${1 + .4 * burn})` : '';
    this.sc.root.style.opacity = dt >= 0 ? 1 : 0;
    this.sc.root.style.filter = dt >= 0 && burn > 0 ? `brightness(${1 + 1.2 * burn})` : '';
    this.sc.root.style.transform = `scale(${dt >= 0 ? lerp(1.06, 1, ease.out(clamp(dt / 1.2))) : 1})`;
  },
};
