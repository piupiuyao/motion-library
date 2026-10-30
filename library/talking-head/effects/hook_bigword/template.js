// 黑白 + 白底大字钩子 · 片头片尾：画面去色，中间砸下一块白底大字，带一下抖动，先戳痛点
TEMPLATES.hook_bigword = {
  setup(ctx) {
    this.off = !ctx.params.text; // required text missing: render nothing
    if (this.off) return;
    const txt = ctx.params.text || '';
    const size = Math.min(200, Math.floor(900 / (Math.max(txt.length, 4) * .62)));
    this.box = el('div', `position:absolute;left:50%;top:${ctx.params.y || 1020}px;padding:18px 44px 26px;background:#fff;
      border-radius:14px;box-shadow:0 26px 60px rgba(0,0,0,.45);white-space:nowrap`);
    const t = el('div', `font-size:${size}px;color:var(--accent);-webkit-text-stroke:5px var(--ink);paint-order:stroke fill`, txt);
    t.className = 'display';
    this.box.appendChild(t);
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    if (this.off) return;
    const p = enter(ctx.t, .1, .3);
    ctx.baseImg.style.filter = `grayscale(${ease.out(enter(ctx.t, 0, .2))}) contrast(1.15)`;
    const shake = (1 - clamp((ctx.t - .4) / .35)) * (ctx.t > .4 ? 1 : 0);
    const sx = Math.sin(ctx.t * 90) * 14 * shake, sy = Math.cos(ctx.t * 70) * 8 * shake;
    ctx.base.style.transform = `translate(${sx}px, ${sy}px) scale(${(ctx.seg.zoom || 1) * 1.03})`;
    this.box.style.transform = `translateX(-50%) translate(${sx}px, ${sy}px) scale(${lerp(2.2, 1, ease.out(p))}) rotate(${lerp(-8, -3, p)}deg)`;
    this.box.style.opacity = Math.min(clamp(p * 4), leave(ctx));
  },
};
