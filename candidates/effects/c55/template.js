// 聚光灯 · 镜头特效：画面压到接近全黑，一束柔和的圆形光打在人身上，像舞台
TEMPLATES.c55 = {
  setup(ctx) {
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 160;
    this.fx = fx; this.fy = fy;
    this.dark = el('div', 'position:absolute;inset:0;opacity:0');
    this.beam = el('div', `position:absolute;inset:0;opacity:0;clip-path:polygon(${fx - 90}px -20px, ${fx + 90}px -20px, ${fx + 560}px ${fy + 420}px, ${fx - 560}px ${fy + 420}px);
      background:linear-gradient(180deg, rgba(255,244,214,.3), rgba(255,244,214,.08) 70%, rgba(255,244,214,0))`);
    ctx.L.front.append(this.dark, this.beam);
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100}%`;
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, .1, .7));
    const R = lerp(900, ctx.params.radius || 430, p);
    this.dark.style.background = `radial-gradient(ellipse ${R}px ${R * 1.15}px at ${this.fx}px ${this.fy}px,
      rgba(255,236,200,.10) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,.93) 100%)`;
    this.dark.style.opacity = p;
    this.beam.style.opacity = p * .9;
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * (1 + .04 * p)})`;
  },
};
