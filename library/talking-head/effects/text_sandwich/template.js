// 文字夹层 · 字体：超大字放在人身后、头的高度，人像压在字上，画面出纵深
TEMPLATES.text_sandwich = {
  setup(ctx) {
    this.off = !ctx.params.text; // required text missing: render nothing
    if (this.off) return;
    const txt = (ctx.params.text || '').toUpperCase();
    const size = Math.min(330, Math.floor(980 / (Math.max(txt.length, 3) * .78)));
    const y = ctx.params.y ?? Math.round(ctx.focus[1] * 1920 - size * .95);
    this.big = el('div', `position:absolute;left:0;right:0;top:${y}px;text-align:center;font-size:${size}px;color:var(--accent);
      -webkit-text-stroke:6px var(--ink);paint-order:stroke fill;white-space:nowrap`, txt);
    this.big.className = 'display';
    ctx.L.back.appendChild(this.big);
    if (ctx.params.sub) {
      this.sub = el('div', `position:absolute;left:0;right:0;top:${y + size + 10}px;text-align:center;font:800 54px var(--font-body);
        color:var(--paper);text-shadow:0 4px 18px rgba(0,0,0,.6)`, ctx.params.sub);
      ctx.L.front.appendChild(this.sub);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const p = enter(ctx.t, 0, .55), out = leave(ctx);
    this.big.style.opacity = Math.min(clamp(p * 3), out);
    this.big.style.transform = `translateX(${lerp(420, 0, ease.out(p))}px) scale(${lerp(1.25, 1, ease.out(p))})`;
    if (this.sub) {
      const q = enter(ctx.t, .35, .4);
      this.sub.style.opacity = Math.min(q, out);
      this.sub.style.transform = `translateY(${lerp(30, 0, ease.out(q))}px)`;
    }
  },
};
