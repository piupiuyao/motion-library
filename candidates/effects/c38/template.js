// 画中画弹窗 · 版式：人保持全屏，角落弹开一个带阴影的圆角卡片放 B-roll/图片，过一会儿收起
TEMPLATES.c38 = {
  setup(ctx) {
    const P = ctx.params;
    this.media = P.media || 'assets/docs/chat.jpg';
    const pos = { tr: 'left:520px;top:110px', tl: 'left:60px;top:110px', top: 'left:270px;top:90px' }[P.corner || 'tr'];
    this.origin = { tr: '100% 0', tl: '0 0', top: '50% 0' }[P.corner || 'tr'];
    this.card = el('div', `position:absolute;${pos};width:500px;height:440px;border-radius:34px;overflow:hidden;background:#fff;
      border:8px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,.4)`);
    this.img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 0;border-radius:26px');
    this.card.appendChild(this.img);
    if (P.label) this.card.appendChild(el('div', `position:absolute;left:16px;bottom:16px;padding:6px 16px 8px;border-radius:12px;background:var(--accent);
      color:var(--ink);font:800 34px var(--font-body)`, P.label));
    ctx.L.front.appendChild(this.card);
    this.t0 = P.at != null ? P.at : .3;
  },
  frame(ctx) {
    const q = enter(ctx.t, this.t0, .5), out = ease.inOut(enter(ctx.t, ctx.d - .55, .4));
    const s = ease.pop(q) * (1 - out);
    this.card.style.transformOrigin = this.origin;
    this.card.style.transform = `scale(${Math.max(.001, s)}) rotate(${lerp(-6, 0, ease.out(q))}deg)`;
    this.card.style.opacity = Math.min(clamp(q * 4), clamp((1 - out) * 3));
    const src = mediaSrc(this.media, Math.max(0, ctx.t - this.t0));
    setImg(this.img, src);
  },
};
