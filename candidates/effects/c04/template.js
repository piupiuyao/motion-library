// 文字快闪 · 字体：画面突然切成一串纯色卡，每张砸一两个大字，快速闪过，再切回人
TEMPLATES.c04 = {
  setup(ctx) {
    const P = ctx.params;
    const cards = P.cards || ctx.groups.map(g => g.text);
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const hit = P.start && ctx.words.find(w => norm(w.w) === norm(P.start));
    const t0 = hit ? hit.s : .3, step = P.step || .3;
    const looks = [['var(--accent)', 'var(--ink)'], ['#111', '#fff'], ['#fff', '#111'], ['#ff3b5c', '#fff'], ['#3d7bff', '#fff']];
    this.cards = cards.map((txt, j) => {
      const [bgc, fg] = looks[j % looks.length];
      const size = Math.min(260, Math.floor(1500 / (Math.max(...txt.split(' ').map(x => x.length)) + 1)));
      const c = el('div', `position:absolute;inset:0;background:${bgc};display:flex;align-items:center;justify-content:center;opacity:0`);
      const t = el('div', `font-size:${size}px;color:${fg};text-transform:uppercase;text-align:center;line-height:.95;padding:0 40px`, txt.replace(' ', '<br>'));
      t.className = 'display';
      c.appendChild(t);
      ctx.L.front.appendChild(c);
      return { c, t, s: t0 + j * step, e: t0 + (j + 1) * step, rot: ((j * 37) % 7 - 3) };
    });
  },
  frame(ctx) {
    for (const k of this.cards) {
      const on = ctx.t >= k.s && ctx.t < k.e;
      k.c.style.opacity = on ? 1 : 0;
      const q = clamp((ctx.t - k.s) / .09);
      k.t.style.transform = `scale(${lerp(1.35, 1, ease.out(q))}) rotate(${k.rot}deg)`;
    }
  },
};
