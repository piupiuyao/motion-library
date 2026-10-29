// 聊天气泡对话 · 素材：iMessage 样式的气泡一条条弹出（左灰右蓝），每条前面先出「正在输入」三个点
TEMPLATES.c14 = {
  setup(ctx) {
    const P = ctx.params;
    const msgs = P.messages || [
      { from: 'them', text: 'Hey, quick question 👀' },
      { from: 'me', text: 'Sure, what is it?' },
      { from: 'them', text: 'Can you also check the Q3 report?' },
    ];
    this.shade = el('div', 'position:absolute;left:0;right:0;top:0;height:1000px;background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.25) 60%,transparent)');
    ctx.L.back.appendChild(this.shade);
    this.box = el('div', `position:absolute;left:50px;right:50px;top:130px;display:flex;flex-direction:column;gap:22px;
      font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif`);
    ctx.L.front.appendChild(this.box);
    const n = msgs.length, span = Math.max(1.2, ctx.d - .5) / n;
    this.items = msgs.map((m, k) => {
      const me = m.from === 'me';
      const row = el('div', `display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};`);
      const bub = el('div', `max-width:760px;padding:26px 40px;border-radius:48px;font-size:54px;line-height:1.22;transform-origin:${me ? '100%' : '0%'} 100%;
        background:${me ? 'linear-gradient(#3b9bff,#0a7cff)' : '#e9e9eb'};color:${me ? '#fff' : '#111'};box-shadow:0 8px 24px rgba(0,0,0,.18);
        border-${me ? 'bottom-right' : 'bottom-left'}-radius:12px`, m.text);
      const dots = el('div', `padding:28px 34px;border-radius:44px;background:${me ? '#0a7cff' : '#e9e9eb'};display:flex;gap:12px;
        border-${me ? 'bottom-right' : 'bottom-left'}-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)`,
        [0, 1, 2].map(() => `<i style="width:22px;height:22px;border-radius:50%;background:${me ? '#fff' : '#8e8e93'};display:block"></i>`).join(''));
      row.append(bub, dots);
      this.box.appendChild(row);
      const t0 = .15 + k * span;
      return { row, bub, dots, t0, tb: t0 + Math.min(.6, span * .45) };
    });
  },
  frame(ctx) {
    const out = leave(ctx, .3);
    this.shade.style.opacity = Math.min(enter(ctx.t, 0, .3), out);
    for (const it of this.items) {
      const shown = ctx.t >= it.t0;
      const typing = shown && ctx.t < it.tb;
      it.row.style.display = shown ? 'flex' : 'none';
      it.dots.style.display = typing ? 'flex' : 'none';
      [...it.dots.children].forEach((d, j) => {
        d.style.transform = `translateY(${-Math.max(0, Math.sin(ctx.t * 12 - j * 1.1)) * 9}px)`;
      });
      const q = enter(ctx.t, it.tb, .35);
      it.bub.style.display = ctx.t >= it.tb ? 'block' : 'none';
      it.bub.style.transform = `scale(${lerp(.3, 1, ease.pop(q))})`;
      it.row.style.opacity = out;
    }
  },
};
