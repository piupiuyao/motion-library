// 急推回弹 · 镜头特效：镜头快速推到脸上，停一拍，再缓缓退回原来的景别（一次进出）
TEMPLATES.c51 = {
  hit(ctx, a, def) {
    const n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const w = a != null && ctx.words.find(w => n(w.w) === n(a));
    return w ? w.s : ctx.groups[0] ? ctx.groups[0].s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.T = this.hit(ctx, P.at, ctx.d * .4);
    this.to = P.to || 1.55;
    this.hold = P.hold != null ? P.hold : .5;
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100 + 2}%`;
  },
  frame(ctx) {
    const z = ctx.seg.zoom || 1;
    const up = ease.out(enter(ctx.t, this.T - .06, .16));
    const down = ease.inOut(enter(ctx.t, this.T + .1 + this.hold, .9));
    const s = z + (this.to - z) * (up - down);
    ctx.base.style.transform = `scale(${s})`;
  },
};
