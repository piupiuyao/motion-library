// 贴纸讲解 · 渐进列表：人缩小移到左下（被裁的一侧始终贴住画框），上方先出手写标题，说到哪条贴哪条；
// 每行是独立的珠光贴纸（编号蓝胶囊 / 蓝勾 / 问号 + 可选 emoji），各自以不同相位轻摆，已出现的行不挪位。
if (!window.STK) { const r = new XMLHttpRequest(); r.open('GET', '/pack/sticker/stk.js', false); r.send(); (0, eval)(r.responseText); }
TEMPLATES.sticker_list = {
  setup(ctx) {
    const P = ctx.params;
    this.off = !(P.items || []).length;
    STK.stage(ctx, P.bg);
    this.from = P.from || 'center';
    this.badge = STK.badge(P.badge);
    if (this.badge) ctx.L.front.appendChild(this.badge.el);
    if (this.off) return;
    const S = P.size || 60;
    this.rows = [];
    if (P.title) {
      const s = STK.make({ id: 'lt:' + P.title, kind: P.title_kind || 'hand', text: P.title, emoji: P.title_emoji, size: P.title_size || 64 });
      ctx.L.front.appendChild(s.el);
      this.rows.push({ s, t0: STK.at(ctx, P.title_at, .15), title: true });
    }
    const mark = P.mark || 'num';
    P.items.forEach((it, j) => {
      const m = it.mark || mark;
      const s = STK.make({
        id: `li:${j}:${it.text}`, kind: it.kind || 'plain', text: it.text, emoji: it.emoji, size: S, rot: it.rot,
        num: m === 'num' ? String(j + 1).padStart(2, '0') : null, check: m === 'check', q: m === 'q',
      });
      ctx.L.front.appendChild(s.el);
      this.rows.push({ s, t0: STK.at(ctx, it.at, .6 + j * (ctx.d - 1.2) / P.items.length) });
    });
    this.P = P; this.S = S; this.laid = false;
  },
  frame(ctx) {
    const k = ease.inOut(enter(ctx.t, 0, .42));
    STK.personAt(ctx, this.from, 'left', k);
    const out = leave(ctx, .18);
    if (this.badge) STK.animate(this.badge, ctx.t, -1, 1, .2);   // no fade at the shot end: the next shot repeats the same badge, a fade made it blink at every cut
    if (this.off) return;
    if (!this.laid) {
      // column in the free upper-right area; rows keep fixed reading positions (no reflow when a row appears)
      const P = this.P, cx = P.x || 650, gap = P.gap || this.S * 1.92;
      let y = P.y || 360;
      this.rows.forEach((r, j) => {
        const jitter = r.title ? 0 : ((r.s.seed % 41) - 20);
        STK.place(r.s, STK.clampX(r.s, cx + jitter), y);
        y += r.title ? gap * 1.15 : gap;
      });
      this.laid = true;
    }
    for (const r of this.rows) STK.animate(r.s, ctx.t, r.t0, out, r.title ? .8 : .55);
  },
};
