// 关键词放大 · 字体：说到关键词的那一刻，词在画面上方弹出，像荧光笔贴条
TEMPLATES.keyword_pop = {
  setup(ctx) {
    const P = ctx.params;
    // look "stroke": big outlined 花字 with no box (视频号 editing style); hl = the part drawn in the accent colour
    const stroke = P.look === 'stroke';
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 250}px;display:flex;flex-direction:column;align-items:center;gap:22px`);
    ctx.L.front.appendChild(this.box);
    this.items = (P.text ? [{ text: P.text, s: 0 }] : ctx.groups)
      .slice(0, 2).map((w, k) => {
        const n = [...w.text].reduce((a, c) => a + (/[\u3000-\u9fff\uac00-\ud7af]/.test(c) ? 2 : 1), 0);
        const size = P.size || (stroke ? (n > 12 ? 130 : n > 8 ? 160 : 200) : (n > 14 ? 104 : n > 9 ? 124 : 150));
        const html = stroke && P.hl && w.text.includes(P.hl)
          ? w.text.replace(P.hl, `<span style="color:var(--accent)">${P.hl}</span>`) : w.text;
        const e = el('div', stroke
          ? `font-size:${size}px;font-weight:900;color:#fff;-webkit-text-stroke:${size * .09}px #111;paint-order:stroke fill;
             text-shadow:0 ${size * .05}px 0 #111, 0 18px 40px rgba(0,0,0,.35);max-width:1000px;text-align:center;line-height:1.05`
          : `font-size:${size}px;padding:10px 34px 18px;background:var(--accent);color:var(--on-accent, var(--ink));
          border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.25);text-transform:uppercase;max-width:960px;text-align:center`, html);
        e.className = 'display';
        this.box.appendChild(e);
        return { e, s: w.s, rot: P.rot != null ? P.rot : k % 2 ? 3 : -3 };
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
