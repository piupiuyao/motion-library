// 虚化压暗发光卡 · 版式：口播画面虚化变暗，四周弹出深色圆角发光卡（渐变、发光边、发光字），讲完画面变回清楚
TEMPLATES.c46 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // cheap blur: the frame drawn into a tiny canvas and scaled back up
    this.cv = el('canvas', 'position:absolute;inset:0;width:1080px;height:1920px');
    this.cv.width = 54; this.cv.height = 96;
    this.cx = this.cv.getContext('2d');
    this.dim = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, rgba(5,8,20,.6), rgba(5,8,20,.92))');
    ctx.L.back.append(this.cv, this.dim);
    const spots = P.spots || ['left:60px;top:200px', 'right:60px;top:600px', 'left:60px;top:1000px', 'right:60px;top:1240px'];
    const glow = P.glow || 'var(--accent)';
    this.cards = (P.cards || []).slice(0, 4).map((c, j) => {
      const e = el('div', `position:absolute;${spots[j]};min-width:420px;padding:28px 40px 34px;border-radius:30px;
        background:linear-gradient(145deg, rgba(40,44,70,.95), rgba(12,14,28,.95));border:3px solid ${glow};
        box-shadow:0 0 40px color-mix(in srgb, ${glow} 55%, transparent), inset 0 0 30px color-mix(in srgb, ${glow} 18%, transparent)`);
      if (c.top) e.appendChild(el('div', 'font:700 34px var(--font-body);letter-spacing:.12em;color:rgba(255,255,255,.7)', c.top));
      const b = el('div', `margin-top:6px;font-size:${c.size || 110}px;color:#fff;text-shadow:0 0 18px ${glow}, 0 0 40px ${glow}`, c.big);
      b.className = 'display';
      e.appendChild(b);
      ctx.L.front.appendChild(e);
      const t = c.at != null ? at(c.at) : null;
      return { e, t: t != null ? t : .5 + j * .7 };
    });
  },
  frame(ctx) {
    const pin = ease.out(enter(ctx.t, .1, .4)), pout = ease.inOut(enter(ctx.t, ctx.d - .5, .45));
    const k = pin * (1 - pout);
    const img = ctx.baseImg, cx = this.cx, cv = this.cv;
    pending.push(img.decode().catch(() => {}).then(() => { cx.clearRect(0, 0, 54, 96); cx.drawImage(img, 0, 0, 54, 96); }));
    cv.style.opacity = k; this.dim.style.opacity = k;
    cv.style.transform = `scale(${(ctx.seg.zoom || 1) * 1.04})`;
    for (const c of this.cards) {
      const q = enter(ctx.t, c.t, .45);
      c.e.style.opacity = Math.min(clamp(q * 3), 1 - pout);
      c.e.style.transform = `translateY(${lerp(50, 0, ease.out(q))}px) scale(${lerp(.85, 1, ease.back(q))})`;
    }
  },
};
