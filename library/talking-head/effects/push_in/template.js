// 推近 · 镜头特效：以脸为中心慢慢推近，四周压暗，情绪往上走
TEMPLATES.push_in = {
  setup(ctx) {
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100 + 3}%`;
    if (ctx.params.vignette !== false) {
      this.v = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,.55) 100%)');
      ctx.L.front.appendChild(this.v);
    }
  },
  frame(ctx) {
    const z0 = ctx.seg.zoom || 1, back = Math.min(.35, ctx.d / 4);
    // push in over the shot, then ease back out over its last ~0.35 s so the next shot doesn't start on a jump
    const s = lerp(lerp(z0, ctx.params.to || 1.3, ease.inOut(ctx.p)), z0, ease.inOut(enter(ctx.t, ctx.d - back, back)));
    ctx.base.style.transform = `scale(${s})`;
    if (this.v) this.v.style.opacity = ease.out(enter(ctx.t, 0, .8));
  },
};
