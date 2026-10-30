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
    const list = [{ app: P.app, sender: P.sender, text: P.text, time: P.time }, ...(P.more || [])].filter(m => m.text);
    if (!list.length) { this.off = true; return; }   // 必填: no notification text → render nothing
    this.cards = list.map((m, k) => {
      // app icon from the icon library: app = a name or word ('WhatsApp', 'Slack', 'email'); no app or no match → no icon
      const tile = iconTile(m.app, 104);
      if (tile) tile.style.cssText += ';flex:none;border-radius:24px;box-shadow:none';
      const card = el('div', `position:absolute;left:40px;right:40px;top:110px;padding:30px 34px;border-radius:44px;display:flex;gap:28px;align-items:center;
        background:rgba(245,245,247,.78);backdrop-filter:blur(26px) saturate(1.6);-webkit-backdrop-filter:blur(26px) saturate(1.6);
        box-shadow:0 20px 50px rgba(0,0,0,.28);font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;color:#111`);
      card.innerHTML = `<div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:42px;font-weight:700">${m.sender || ''}</b>
          <span style="font-size:32px;color:rgba(0,0,0,.45)">${m.time || 'now'}</span></div>
          <div style="font-size:40px;line-height:1.25;margin-top:6px;color:rgba(0,0,0,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.text}</div>
        </div>`;
      if (tile) card.insertBefore(tile, card.firstChild);
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
