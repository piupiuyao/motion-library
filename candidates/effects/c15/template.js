// 推文卡片弹出 · 素材：一张社交帖子卡片（头像、账号、正文、点赞数）在胸前弹出、微微倾斜，然后飞走
TEMPLATES.c15 = {
  setup(ctx) {
    const P = ctx.params;
    const av = P.avatar ? `<img src="${url(P.avatar)}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--accent),#3d7bff);display:flex;align-items:center;justify-content:center;color:#111;font:800 46px var(--font-body)">${(P.name || 'Monica')[0]}</div>`;
    this.card = el('div', `position:absolute;left:90px;width:900px;top:${P.top || 930}px;padding:40px 44px 34px;border-radius:34px;background:#fff;color:#0f1419;
      box-shadow:0 30px 70px rgba(0,0,0,.38);font-family:-apple-system,'Helvetica Neue',sans-serif`);
    this.card.innerHTML = `<div style="display:flex;gap:22px;align-items:center">
        <div style="width:96px;height:96px;border-radius:50%;overflow:hidden;flex:none">${av}</div>
        <div style="flex:1"><div style="font-size:40px;font-weight:800;display:flex;gap:10px;align-items:center">${P.name || 'Monica'}
          <svg width="38" height="38" viewBox="0 0 24 24"><path fill="#1d9bf0" d="M22.3 12 20 9.4l.3-3.4-3.3-.8-1.8-3-3.2 1.4L8.8 2.2 7 5.1l-3.3.8.3 3.5L1.7 12 4 14.6l-.3 3.5 3.3.7 1.8 3 3.2-1.4 3.2 1.4 1.8-3 3.3-.8-.3-3.4z"/><path d="m10 16.2-3.4-3.4 1.4-1.4 2 2 5-5 1.4 1.4z" fill="#fff"/></svg></div>
          <div style="font-size:34px;color:#536471">${P.handle || '@monica'} · 2h</div></div>
        <div style="font:900 52px var(--font-body);color:#0f1419">𝕏</div></div>
      <div style="font-size:${(P.text || '').length > 90 ? 44 : 52}px;line-height:1.28;margin:28px 0 26px;font-weight:500">${P.text || "Today's AI is powerful. But it still hasn't solved replying to messages."}</div>
      <div style="display:flex;justify-content:space-between;color:#536471;font-size:34px;border-top:1px solid #eff3f4;padding-top:22px">
        <span>💬 ${P.replies || '1.2K'}</span><span>🔁 ${P.reposts || '3.4K'}</span><span style="color:#f91880">♥ <b class="lk">0</b></span><span>📊 ${P.views || '2.1M'}</span></div>`;
    this.lk = this.card.querySelector('.lk');
    this.likes = P.likes || 18400;
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const pin = enter(ctx.t, .1, .5), pout = enter(ctx.t, ctx.d - .5, .45);
    const rot = lerp(-12, -3, ease.out(pin)) + lerp(0, 24, ease.inOut(pout)) + Math.sin(ctx.t * 1.3) * .6;
    const x = lerp(0, 1300, ease.inOut(pout) ** 1.4), y = lerp(260, 0, ease.back(pin)) + lerp(0, -500, ease.inOut(pout));
    this.card.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${lerp(.6, 1, ease.pop(pin))})`;
    this.card.style.opacity = clamp(pin * 3);
    const n = Math.round(this.likes * ease.out(enter(ctx.t, .3, 1.6)));
    this.lk.textContent = n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n;
  },
};
