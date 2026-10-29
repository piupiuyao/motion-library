// 评论回复贴纸 · 素材：TikTok「回复评论」样式白色圆角贴纸挂在画面上方：小头像 +「Reply to xx's comment」+ 黑色评论正文
TEMPLATES.c106 = {
  setup(ctx) {
    const P = ctx.params;
    this.rot = P.rotate ?? -2;
    this.wrap = el('div', `position:absolute;left:0;right:0;top:${P.y || 200}px;display:flex;justify-content:center`);
    this.card = el('div', `position:relative;max-width:${P.width || 780}px;padding:24px 34px 30px;background:#fff;border-radius:30px;
      box-shadow:0 14px 40px rgba(0,0,0,.28);transform-origin:20% 100%`);
    this.card.innerHTML = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
        <div style="width:60px;height:60px;border-radius:50%;flex:none;background:linear-gradient(135deg,#ffb36b,#ff5c8a);display:flex;align-items:center;
          justify-content:center;font:800 30px var(--font-body);color:#fff">${(P.user || 'jess.k')[0].toUpperCase()}</div>
        <div style="font:500 34px var(--font-body);color:#8a8b91;white-space:nowrap">Reply to ${P.user || 'jess.k'}'s comment</div></div>
      <div style="font:800 50px/1.18 var(--font-body);color:#111">${P.text || 'how do you even answer the long emotional texts?? 😭'}</div>
      <div style="position:absolute;left:52px;bottom:-22px;width:0;height:0;border-right:34px solid transparent;border-top:24px solid #fff"></div>`;
    this.wrap.appendChild(this.card);
    ctx.L.front.appendChild(this.wrap);
  },
  frame(ctx) {
    const p = enter(ctx.t, .05, .45);
    this.card.style.opacity = Math.min(clamp(p * 4), leave(ctx));
    this.card.style.transform = `rotate(${this.rot}deg) scale(${lerp(.4, 1, ease.pop(p))})`;
  },
};
