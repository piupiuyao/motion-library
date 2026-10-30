// 发光流程线 · 素材：深色背景（底部紫色光晕）上一条发光细线弯弯曲曲画下来，紫色圆角标签沿线一个个弹出，
// 顶上是发光白色大标题，整组慢慢往下移。Kallaway 风格。
TEMPLATES.glow_flow = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const steps = P.steps || [];
    if (!steps.length) { this.off = true; return; }   // 必填: no steps → render nothing
    const col = P.color || getComputedStyle(document.getElementById('stage')).getPropertyValue('--accent').trim() || '#8b5cff';
    this.bgc = el('div', `position:absolute;inset:0;background:radial-gradient(ellipse 90% 30% at 50% 108%, color-mix(in srgb, ${col} 85%, transparent), transparent 75%),
      radial-gradient(ellipse at 50% 30%, #1c1a24, #09090c 75%)`);
    ctx.L.back.appendChild(this.bgc);
    this.grp = el('div', 'position:absolute;left:0;top:0;width:1080px;height:3000px');
    ctx.L.back.appendChild(this.grp);
    const gap = P.gap || 210, y0 = 560;
    const pts = steps.map((_, k) => [k % 2 ? 700 : 380, y0 + k * gap]);
    let d = `M${pts[0][0] + 120} ${pts[0][1] - 260} C ${pts[0][0] + 120} ${pts[0][1] - 120}, ${pts[0][0]} ${pts[0][1] - 120}, ${pts[0][0]} ${pts[0][1]}`;
    pts.forEach(([x, y], k) => {
      if (!k) return;
      const [px, py] = pts[k - 1];
      d += ` C ${px} ${py + gap * .6}, ${x} ${y - gap * .6}, ${x} ${y}`;
    });
    const last = pts[pts.length - 1];
    d += ` C ${last[0]} ${last[1] + 150}, ${last[0] - 150} ${last[1] + 150}, ${last[0] - 150} ${last[1] + 300}`;
    const sv = el('div', 'position:absolute;inset:0');
    sv.innerHTML = `<svg width="1080" height="3000" style="position:absolute;inset:0;overflow:visible">
      <path d="${d}" fill="none" stroke="${col}" stroke-opacity=".22" stroke-width="26" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <path d="${d}" fill="none" stroke="${col}" stroke-opacity=".5" stroke-width="11" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <path d="${d}" fill="none" stroke="color-mix(in srgb, ${col} 45%, #fff)" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/></svg>`;
    this.grp.appendChild(sv);
    this.paths = [...sv.querySelectorAll('path')];
    this.labels = steps.map((s, k) => {
      const [x, y] = pts[k];
      const lb = el('div', `position:absolute;left:${x}px;top:${y}px;padding:24px 54px;border-radius:70px;white-space:nowrap;translate:-50% -50%;
        background:linear-gradient(180deg, color-mix(in srgb, ${col} 80%, #000), color-mix(in srgb, ${col} 45%, #000));
        border:3px solid color-mix(in srgb, ${col} 60%, #fff);color:#fff;font:600 56px var(--font-body);
        box-shadow:0 0 34px color-mix(in srgb, ${col} 60%, transparent), inset 0 2px 0 rgba(255,255,255,.25)`,
        (P.numbers ? `<span style="opacity:.6;margin-right:16px">${String(k + 1).padStart(2, '0')}</span>` : '') + s);
      this.grp.append(lb);
      return { lb, frac: k / Math.max(1, steps.length - 1) };
    });
    this.title = el('div', `position:absolute;left:40px;right:40px;top:210px;text-align:center;font:800 76px/1 var(--font-body);color:#fff;letter-spacing:.01em;
      text-shadow:0 0 24px rgba(255,255,255,.55), 0 0 60px color-mix(in srgb, ${col} 60%, transparent)`, P.title || '');
    ctx.L.back.appendChild(this.title);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.grp.style.opacity = Math.min(pin, out);
    const draw = clamp((t - .15) / (ctx.d - .8));
    for (const p of this.paths) p.style.strokeDashoffset = 1 - draw;
    // labels pop when the line reaches them; the whole group drifts down the screen
    this.labels.forEach(({ lb, frac }) => {
      const q = enter(draw, .1 + frac * .74, .07);
      lb.style.opacity = q;
      lb.style.transform = `scale(${lerp(.3, 1, ease.pop(q))})`;
    });
    this.grp.style.transform = `translateY(${lerp(0, 160, ease.inOut(clamp(t / ctx.d)))}px)`;
    const tq = enter(t, .1, .4);
    this.title.style.opacity = Math.min(tq, out);
    this.title.style.transform = `translateY(${lerp(-30, 0, ease.out(tq))}px)`;
  },
};
