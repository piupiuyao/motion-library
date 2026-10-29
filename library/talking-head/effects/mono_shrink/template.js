// 黑白缩小 · 版式：画面一下子去色、缩进深色背景上的小框，情绪往下沉
TEMPLATES.mono_shrink = {
  setup(ctx) {
    ctx.L.bg.style.background = 'radial-gradient(circle at 50% 40%, var(--bg-b), var(--bg-a))';
    ctx.base.style.borderRadius = '48px';
    if (ctx.params.label) {
      this.label = el('div', 'position:absolute;left:0;right:0;top:120px;text-align:center;font-size:110px;color:var(--paper);letter-spacing:.04em', ctx.params.label);
      this.label.className = 'display';
      ctx.L.front.appendChild(this.label);
    }
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .35));
    const s = lerp(ctx.seg.zoom || 1, .72, p);
    const wob = Math.sin(ctx.t * 9) * .6 * p;  // slight unease
    ctx.base.style.transform = `translateY(${lerp(0, 40, p)}px) scale(${s}) rotate(${wob}deg)`;
    ctx.base.style.filter = `grayscale(${p}) contrast(${1 + .15 * p})`;
    if (this.label) {
      const q = enter(ctx.t, .2, .35);
      this.label.style.opacity = Math.min(q, leave(ctx));
      this.label.style.transform = `translateY(${lerp(-40, 0, ease.out(q))}px)`;
    }
  },
};
