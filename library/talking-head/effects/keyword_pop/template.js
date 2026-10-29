// 关键词放大 · 字体：说到关键词的那一刻，词在画面上方弹出，像荧光笔贴条
TEMPLATES.keyword_pop = {
  setup(ctx) {
    this.box = el('div', 'position:absolute;left:0;right:0;top:250px;display:flex;flex-direction:column;align-items:center;gap:22px');
    ctx.L.front.appendChild(this.box);
    this.items = (ctx.params.text ? [{ text: ctx.params.text, s: 0 }] : ctx.groups)
      .slice(0, 2).map((w, k) => {
        const e = el('div', `font-size:${w.text.length > 14 ? 104 : w.text.length > 9 ? 124 : 150}px;padding:10px 34px 18px;background:var(--accent);color:var(--ink);
          border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.25);text-transform:uppercase;max-width:960px;text-align:center`, w.text);
        e.className = 'display';
        this.box.appendChild(e);
        return { e, s: w.s, rot: k % 2 ? 3 : -3 };
      });
  },
  frame(ctx) {
    const out = leave(ctx);
    for (const it of this.items) {
      const p = enter(ctx.t, it.s - .08, .45);
      it.e.style.opacity = Math.min(clamp(p * 4), out);
      it.e.style.transform = `scale(${lerp(.4, 1, ease.pop(p))}) rotate(${it.rot * ease.out(p)}deg)`;
    }
  },
};
