// 图表叠加 · 素材：画面上方一张白卡，横条一条条长出来
TEMPLATES.data_chart = {
  setup(ctx) {
    const P = ctx.params, items = P.items || [];
    const max = Math.max(...items.map(i => i.value), 1);
    this.card = el('div', 'position:absolute;left:70px;right:70px;top:230px;padding:44px 48px 50px;background:var(--paper);border-radius:40px;box-shadow:0 30px 80px rgba(0,0,0,.3)');
    const title = el('div', 'font-size:64px;color:var(--ink);margin-bottom:30px', P.title || '');
    title.className = 'display';
    this.card.appendChild(title);
    this.bars = items.map((it, k) => {
      const row = el('div', 'margin-top:26px');
      row.appendChild(el('div', 'font:700 40px var(--font-body);color:#555;margin-bottom:10px', it.label));
      const track = el('div', 'height:64px;border-radius:32px;background:#eee;position:relative;overflow:hidden');
      const bar = el('div', `position:absolute;left:0;top:0;bottom:0;border-radius:32px;background:${k === items.length - 1 ? 'var(--accent)' : '#bdbdbd'}`);
      const val = el('div', 'position:absolute;right:22px;top:6px;font:800 44px var(--font-body);color:var(--ink)',
        P.show_values === false ? '' : it.value + (P.unit || ''));
      track.append(bar, val);
      row.appendChild(track);
      this.card.appendChild(row);
      return { bar, val, f: it.value / max, s: .3 + k * .45 };
    });
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .4), out = leave(ctx);
    this.card.style.opacity = Math.min(p, out);
    this.card.style.transform = `translateY(${lerp(-80, 0, ease.back(p))}px)`;
    for (const b of this.bars) {
      const q = ease.out(enter(ctx.t, b.s, .7));
      b.bar.style.width = Math.max(6, b.f * 100 * q) + '%';
      b.val.style.opacity = q;
    }
  },
};
