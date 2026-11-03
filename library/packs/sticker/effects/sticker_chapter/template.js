// 贴纸讲解 · 章节引入：背景换章节色，大号虹彩闪卡编号 + 短标题在头顶两侧出现，讲完缩成左上角小角标并一直留着。
if (!window.STK) { const r = new XMLHttpRequest(); r.open('GET', '/pack/sticker/stk.js', false); r.send(); (0, eval)(r.responseText); }
TEMPLATES.sticker_chapter = {
  setup(ctx) {
    const P = ctx.params;
    STK.stage(ctx, P.bg || 'lilac');
    const num = String(P.num || '01');
    this.num = STK.make({ id: 'ch:' + num, kind: 'hero', text: num, size: P.num_size || 240, rot: -3 });
    ctx.L.front.appendChild(this.num.el);
    this.title = P.title ? STK.make({ id: 'cht:' + P.title, text: P.title, size: P.title_size || 80, emoji: P.emoji }) : null;
    if (this.title) ctx.L.front.appendChild(this.title.el);
    this.badge = STK.badge({ num, text: P.badge_text || P.title || '' });
    ctx.L.front.appendChild(this.badge.el);
    this.tNum = STK.at(ctx, P.at, .05);
    this.tTitle = STK.at(ctx, P.title_at, this.tNum + .45);
    this.tShrink = STK.at(ctx, P.badge_at, Math.min(ctx.d * .6, this.tTitle + 2.2));
    this.laid = false;
  },
  frame(ctx) {
    const head = STK.personAt(ctx, 'center', 'center', 1);
    if (!this.laid) {
      STK.place(this.num, Math.max(60 + this.num.w / 2 - this.num.S * .45, head.x - 40), head.top - 200);
      if (this.title) STK.place(this.title, STK.clampX(this.title, head.x + 330), head.top - 10);
      this.laid = true;
    }
    const out = leave(ctx, .18);
    const sh = ease.inOut(enter(ctx.t, this.tShrink, .38));   // big intro -> small corner tag
    STK.animate(this.num, ctx.t, this.tNum, Math.min(out, 1 - sh), 1);
    this.num.el.style.transform += ` translate(${(-160 * sh).toFixed(1)}px, ${(-180 * sh).toFixed(1)}px) scale(${lerp(1, .35, sh).toFixed(3)})`;
    if (this.title) STK.animate(this.title, ctx.t, this.tTitle, Math.min(out, 1 - sh), 1);
    STK.animate(this.badge, ctx.t, this.tShrink + .12, 1, .2);   // stays at full strength into the next shot (same badge there)
  },
};
