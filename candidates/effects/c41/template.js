// 白卡图标环绕 · 版式：几张白色圆角小卡（图标 + 一行字）一张张弹到人四周的角落，不挡脸
TEMPLATES.c41 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const spots = [
      { css: 'left:46px;top:170px', rot: -5, o: '100% 100%' },
      { css: 'right:46px;top:170px', rot: 5, o: '0 100%' },
      { css: 'left:46px;top:1150px', rot: 4, o: '100% 0' },
      { css: 'right:46px;top:1150px', rot: -4, o: '0 0' },
      { css: 'left:46px;top:640px', rot: -3, o: '100% 50%' },
      { css: 'right:46px;top:640px', rot: 3, o: '0 50%' },
    ];
    const items = (P.items || []).slice(0, 6);
    this.cards = items.map((it, j) => {
      const s = spots[j];
      const c = el('div', `position:absolute;${s.css};display:flex;align-items:center;gap:20px;padding:18px 30px 18px 18px;border-radius:28px;
        background:#fff;box-shadow:0 18px 40px rgba(0,0,0,.28);transform-origin:${s.o}`);
      c.appendChild(el('div', `width:92px;height:92px;border-radius:22px;background:${it.color || 'var(--accent)'};display:flex;align-items:center;justify-content:center;font-size:56px`, it.icon || '★'));
      c.appendChild(el('div', 'font:800 46px var(--font-body);color:var(--ink);white-space:nowrap', it.text));
      ctx.L.front.appendChild(c);
      const t = it.at != null ? at(it.at) : null;
      return { c, s, t: t != null ? t : .3 + j * .5 };
    });
  },
  frame(ctx) {
    const lv = leave(ctx, .3);
    for (const { c, s, t } of this.cards) {
      const q = enter(ctx.t, t, .45);
      c.style.opacity = Math.min(clamp(q * 4), lv);
      c.style.transform = `scale(${ease.pop(q)}) rotate(${s.rot + Math.sin(ctx.t * 2 + t * 5) * 1.2}deg) translateY(${Math.sin(ctx.t * 2.4 + t * 3) * 6}px)`;
    }
  },
};
