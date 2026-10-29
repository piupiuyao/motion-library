// 发光流程线 · 素材：深色渐变背景上一条发光的线画过屏幕，圆角标签沿线一个个弹出，整组跟着往下移
TEMPLATES.c20 = {
  setup(ctx) {
    const P = ctx.params;
    const steps = P.steps || ['New message', 'AI reads it', 'Drafts a reply', 'You hit send'];
    this.bgc = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 30% 15%, #2b1b5e, transparent 60%),radial-gradient(ellipse at 80% 90%, #0c3b4a, transparent 60%),#07070d');
    ctx.L.back.appendChild(this.bgc);
    this.grp = el('div', 'position:absolute;left:0;top:0;width:1080px;height:3000px');
    ctx.L.back.appendChild(this.grp);
    const gap = 300, y0 = 400;
    const pts = steps.map((_, k) => [k % 2 ? 760 : 320, y0 + k * gap]);
    let d = `M${pts[0][0]} ${pts[0][1] - 260}`;
    pts.forEach(([x, y], k) => {
      if (k === 0) d += ` L${x} ${y}`;
      else { const [px, py] = pts[k - 1]; d += ` C ${px} ${py + gap * .55}, ${x} ${y - gap * .55}, ${x} ${y}`; }
    });
    const last = pts[pts.length - 1];
    d += ` L${last[0]} ${last[1] + 300}`;
    const col = P.color || 'var(--accent)';
    const sv = el('div', 'position:absolute;inset:0');
    sv.innerHTML = `<svg width="1080" height="3000" style="position:absolute;inset:0;overflow:visible">
      <path d="${d}" fill="none" stroke="${col}" stroke-opacity=".18" stroke-width="44" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <path d="${d}" fill="none" stroke="${col}" stroke-opacity=".35" stroke-width="22" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/></svg>`;
    this.grp.appendChild(sv);
    this.paths = [...sv.querySelectorAll('path')];
    this.labels = steps.map((s, k) => {
      const [x, y] = pts[k];
      const dot = el('div', `position:absolute;left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;border-radius:50%;background:#fff;box-shadow:0 0 0 10px color-mix(in srgb, ${col} 40%, transparent),0 0 40px 10px ${col}`);
      const lb = el('div', `position:absolute;top:${y - 58}px;${k % 2 ? `right:${1080 - x + 60}px` : `left:${x + 60}px`};padding:22px 40px;border-radius:60px;white-space:nowrap;
        background:rgba(255,255,255,.08);border:3px solid color-mix(in srgb, ${col} 70%, transparent);color:#fff;font:700 58px var(--font-body);
        box-shadow:0 0 30px color-mix(in srgb, ${col} 35%, transparent), inset 0 0 20px color-mix(in srgb, ${col} 15%, transparent)`,
        `<span style="color:${col};margin-right:16px">${String(k + 1).padStart(2, '0')}</span>${s}`);
      this.grp.append(dot, lb);
      return { dot, lb, frac: k / Math.max(1, steps.length - 1) };
    });
    this.gap = gap; this.ns = steps.length;
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.grp.style.opacity = Math.min(pin, out);
    const draw = clamp((t - .15) / (ctx.d - .7));
    for (const p of this.paths) p.style.strokeDashoffset = 1 - draw;
    // labels pop when the line reaches them; the whole group drifts down the screen (camera follows up)
    this.labels.forEach(({ dot, lb, frac }) => {
      const q = enter(draw, .08 + frac * .78, .08);
      dot.style.opacity = q; dot.style.transform = `scale(${ease.pop(q)})`;
      lb.style.opacity = q; lb.style.transform = `scale(${lerp(.4, 1, ease.pop(q))})`;
    });
    this.grp.style.transform = `translateY(${lerp(-160, 120, ease.inOut(clamp(t / ctx.d)))}px)`;
  },
};
