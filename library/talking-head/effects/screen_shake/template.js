// 震屏冲击 · 镜头特效：整个画面在重音词上猛地抖几下（约 0.5 秒）再迅速停住
TEMPLATES.screen_shake = {
  hit(ctx, a, def) {
    const n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const w = a != null && ctx.words.find(w => n(w.w) === n(a));
    return w ? w.s : ctx.groups[0] ? ctx.groups[0].s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.T = this.hit(ctx, P.at, ctx.d * .45);
    this.D = P.dur || .5;
    this.A = P.strength || 1;
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100}%`;
    // a quick white pulse on the hit makes the shake read even in a still
    this.flash = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
    ctx.L.front.appendChild(this.flash);
  },
  frame(ctx) {
    const z = ctx.seg.zoom || 1, dt = ctx.t - this.T;
    let x = 0, y = 0, r = 0, s = 1;
    if (dt >= 0 && dt < this.D) {
      const k = 1 - dt / this.D, a = this.A * k * k;
      x = Math.sin(dt * 95) * 46 * a;
      y = Math.cos(dt * 77 + 1) * 34 * a;
      r = Math.sin(dt * 61 + .5) * 2.4 * a;
      s = 1 + .1 * k;
    }
    ctx.base.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${z * s})`;
    this.flash.style.opacity = dt >= 0 && dt < .12 ? .35 * (1 - dt / .12) : 0;
  },
};
