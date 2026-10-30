// 手机通知弹窗 · 素材：一条 iOS 样式的毛玻璃通知从顶上滑下来（图标、发件人、一行字），停一会儿再收回
TEMPLATES.c13 = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const icons = {
      whatsapp: ['#25d366', '<svg viewBox="0 0 24 24" width="62" height="62"><path fill="#fff" d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.3 4.8 4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 1.8a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4z"/><path fill="#fff" d="M9 7.6c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.2 5 4.3 2.4.9 2.9.7 3.5.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4l-.4-.3-1.9-.9c-.3-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3a8 8 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.5l.4-.5.3-.4v-.5L9 7.6z"/></svg>'],
      message: ['linear-gradient(#5df777,#0ac43a)', '<svg viewBox="0 0 24 24" width="60" height="60"><path fill="#fff" d="M12 3C6.5 3 2 6.7 2 11.2c0 2.6 1.5 4.9 3.8 6.4L5 21l3.8-2.1c1 .3 2.1.4 3.2.4 5.5 0 10-3.7 10-8.2S17.5 3 12 3z"/></svg>'],
      mail: ['linear-gradient(#5ab8ff,#1a73f0)', '<svg viewBox="0 0 24 24" width="60" height="60"><path fill="#fff" d="M3 6h18v12H3z" opacity=".0"/><rect x="3" y="5.5" width="18" height="13" rx="2" fill="#fff"/><path d="M3.5 7l8.5 6 8.5-6" stroke="#1a73f0" stroke-width="1.8" fill="none"/></svg>'],
    };
    const list = [{ app: P.app, sender: P.sender, text: P.text, time: P.time }, ...(P.more || [])].filter(m => m.text);
    if (!list.length) { this.off = true; return; }   // 必填: no notification text → render nothing
    this.cards = list.map((m, k) => {
      const [ibg, isvg] = icons[m.app || 'message'] || icons.message;
      const card = el('div', `position:absolute;left:40px;right:40px;top:110px;padding:30px 34px;border-radius:44px;display:flex;gap:28px;align-items:center;
        background:rgba(245,245,247,.78);backdrop-filter:blur(26px) saturate(1.6);-webkit-backdrop-filter:blur(26px) saturate(1.6);
        box-shadow:0 20px 50px rgba(0,0,0,.28);font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;color:#111`);
      card.innerHTML = `<div style="flex:none;width:104px;height:104px;border-radius:24px;background:${ibg};display:flex;align-items:center;justify-content:center">${isvg}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:42px;font-weight:700">${m.sender || ''}</b>
          <span style="font-size:32px;color:rgba(0,0,0,.45)">${m.time || 'now'}</span></div>
          <div style="font-size:40px;line-height:1.25;margin-top:6px;color:rgba(0,0,0,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.text}</div>
        </div>`;
      ctx.L.front.insertBefore(card, ctx.L.front.firstChild);   // newer cards sit on top
      return card;
    });
    this.t0 = this.at(ctx, P.at, .25);
    this.gap = P.every || .6;
    const tLast = this.t0 + (list.length - 1) * this.gap;
    this.tOut = P.hold ? tLast + .5 + P.hold : Math.max(tLast + 1.2, ctx.d - .55);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, n = this.cards.length;
    const pout = enter(t, this.tOut, .4);
    this.cards.forEach((card, k) => {
      const pin = enter(t, this.t0 + k * this.gap, .5);
      // each newer arrival pushes this card down one slot (iOS stack)
      let push = 0;
      for (let j = k + 1; j < n; j++) push += ease.out(enter(t, this.t0 + j * this.gap, .4));
      const y = lerp(-340, 0, ease.back(pin)) + push * 205 - lerp(0, 340 + push * 205, ease.inOut(pout));
      card.style.transform = `translateY(${y}px) scale(${lerp(.92, 1, ease.out(pin)) * (1 - push * .03)})`;
      card.style.opacity = pin > 0 ? 1 - push * .12 : 0;
    });
  },
};
