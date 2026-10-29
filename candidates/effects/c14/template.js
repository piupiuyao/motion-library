// 聊天气泡对话 · 素材：iMessage 样式的气泡一条条弹出（左灰右蓝），每条前面先出「正在输入」三个点
TEMPLATES.c14 = {
  setup(ctx) {
    const P = ctx.params;
    const msgs = P.messages || [
      { from: 'them', text: 'Hey, quick question 👀' },
      { from: 'me', text: 'Sure, what is it?' },
      { from: 'them', text: 'Can you also check the Q3 report?' },
    ];
    this.shade = el('div', 'position:absolute;left:0;right:0;top:0;height:1150px;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.35) 65%,transparent)');
    ctx.L.back.appendChild(this.shade);
    this.box = el('div', `position:absolute;left:50px;right:50px;top:120px;display:flex;flex-direction:column;gap:14px;
      font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif`);
    ctx.L.front.appendChild(this.box);
    const n = msgs.length, span = Math.max(1.2, ctx.d - .5) / n;
    this.items = msgs.map((m, k) => {
      const me = m.from === 'me';
      const row = el('div', `display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};`);
      const bub = el('div', `max-width:700px;padding:24px 38px;border-radius:48px;font-size:54px;line-height:1.22;transform-origin:${me ? '100%' : '0%'} 100%;
        background:${me ? 'linear-gradient(#3b9bff,#0a7cff)' : '#e9e9eb'};color:${me ? '#fff' : '#111'};box-shadow:0 8px 24px rgba(0,0,0,.18);
        border-${me ? 'bottom-right' : 'bottom-left'}-radius:12px`, m.text);
      const dots = el('div', `padding:28px 34px;border-radius:44px;background:${me ? '#0a7cff' : '#e9e9eb'};display:flex;gap:12px;
        border-${me ? 'bottom-right' : 'bottom-left'}-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)`,
        [0, 1, 2].map(() => `<i style="width:22px;height:22px;border-radius:50%;background:${me ? '#fff' : '#8e8e93'};display:block"></i>`).join(''));
      const col = el('div', `display:flex;flex-direction:column;align-items:${me ? 'flex-end' : 'flex-start'};gap:8px`);
      const nm = el('div', `font-size:30px;font-weight:600;color:rgba(255,255,255,.85);text-shadow:0 2px 6px rgba(0,0,0,.5);padding:0 18px`, me ? (P.me || 'You') : (m.name || P.them || 'Sarah'));
      const tm = el('div', `font-size:26px;color:rgba(255,255,255,.7);text-shadow:0 2px 6px rgba(0,0,0,.5);padding:0 18px`, m.time || ['9:41 PM', '9:42 PM', '9:42 PM', '9:43 PM'][k % 4]);
      const holder = el('div', 'position:relative');
      holder.append(bub, dots);
      col.append(nm, holder, tm);
      if (!me) {
        const av = el('div', `flex:none;width:76px;height:76px;border-radius:50%;margin:0 18px 40px 0;align-self:flex-end;background:linear-gradient(135deg,#ffb36b,#ff6b8b);
          display:flex;align-items:center;justify-content:center;color:#fff;font:700 38px -apple-system,sans-serif;box-shadow:0 6px 16px rgba(0,0,0,.25)`, (m.name || P.them || 'Sarah')[0]);
        row.append(av);
      }
      row.append(col);
      row.style.alignItems = 'flex-end';
      this.box.appendChild(row);
      const t0 = .15 + k * span;
      return { row, bub, dots, nm, tm, t0, tb: t0 + Math.min(.6, span * .45) };
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
      it.tm.style.visibility = ctx.t >= it.tb ? 'visible' : 'hidden';
      it.row.style.opacity = out;
    }
  },
};
