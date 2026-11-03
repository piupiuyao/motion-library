// 贴纸讲解 · 舞台：人抠出来加白边，站在暖米白细网格纸上；头顶可升起虹彩闪卡主标题，四周按原话贴上珠光模切贴纸
// （圆体蓝字 / 手写注释 / 红色划掉 / emoji / 官方 app 图标），每张贴纸入场后整张轻摆。左上角可挂章节角标。
if (!window.STK) { const r = new XMLHttpRequest(); r.open('GET', '/pack/sticker/stk.js', false); r.send(); (0, eval)(r.responseText); }
TEMPLATES.sticker_stage = {
  setup(ctx) {
    const P = ctx.params;
    STK.stage(ctx, P.bg);
    this.layout = P.layout || 'center';
    this.from = P.from || this.layout;
    this.badge = STK.badge(P.badge);
    if (this.badge) ctx.L.front.appendChild(this.badge.el);
    this.items = [];
    if (P.hero) {
      const s = STK.make({ id: 'hero:' + P.hero, kind: 'hero', text: P.hero, size: P.hero_size || (P.hero.length > 14 ? 104 : P.hero.length > 9 ? 120 : 140), rot: P.hero_rot != null ? P.hero_rot : -1.5 });
      ctx.L.back.appendChild(s.el);   // behind the person: it rises from behind the head
      this.items.push({ s, t0: STK.at(ctx, P.hero_at, .1), t1: STK.at(ctx, P.hero_until, null), pos: P.hero_pos || 'top', x: P.hero_x, y: P.hero_y, rise: true });
    }
    (P.stickers || []).forEach((it, k) => {
      const id = `st:${k}:${it.text || it.icon || it.emoji}`;
      const s = it.icon ? STK.icon({ ...it, id }) : STK.make({ ...it, id });
      if (!s) return;
      (it.behind ? ctx.L.back : ctx.L.front).appendChild(s.el);
      this.items.push({ s, t0: STK.at(ctx, it.at, .2 + k * .5), t1: STK.at(ctx, it.until, null), pos: it.pos || ['right', 'upper-right', 'lower-right', 'left'][k % 4], x: it.x, y: it.y });
    });
    this.laid = false;
  },
  place(head) {
    const s = head.s;
    for (const it of this.items) {
      const w = it.s.w, side = 200 * s + w / 2 - it.s.S * .3;
      const slot = {
        top: [(head.x + 540) / 2, head.top - 150],
        'above-left': [head.x - 150, head.top - 120], 'above-right': [head.x + 170, head.top - 120],
        'upper-right': [head.x + side, head.top + 40], right: [head.x + side, head.top + 230], 'lower-right': [head.x + side, head.top + 430],
        'upper-left': [head.x - side, head.top + 40], left: [head.x - side, head.top + 230], 'lower-left': [head.x - side, head.top + 430],
        chest: [head.x + 60, head.top + 700],
      }[it.pos] || [head.x + side, head.top + 230];
      const x = it.x != null ? it.x : STK.clampX(it.s, slot[0]);
      let y = it.y != null ? it.y : slot[1];
      // a side sticker too wide to sit beside the head would cover the face: lift it above the head instead
      const hw = 175 * s, faceBot = head.top + 470 * s, vis = it.s.h / 2 - it.s.S * .35;
      if (it.y == null && it.pos !== 'top' && x - it.s.w / 2 + it.s.S * .45 < head.x + hw && x + it.s.w / 2 - it.s.S * .45 > head.x - hw
          && y + vis > head.top - 30 && y - vis < faceBot) y = head.top - 40 - vis;
      if (!this.used || this.used.owner !== this.items) { this.used = []; this.used.owner = this.items; }
      while (it.y == null && this.used.some(u => u.t0 <= it.t0 && (u.t1 == null || u.t1 > it.t0) && Math.abs(u.y - y) < (u.h + vis * 2) * .5)) y -= it.s.S * 1.5;
      this.used.push({ y, h: vis * 2, t0: it.t0, t1: it.t1 });
      STK.place(it.s, x, y);
    }
    this.laid = true;
  },
  frame(ctx) {
    const k = ease.inOut(enter(ctx.t, 0, .42));
    const head = STK.personAt(ctx, this.from, this.layout, k);
    if (!this.laid) this.place(head);
    const out = leave(ctx, .18);
    if (this.badge) STK.animate(this.badge, ctx.t, -1, 1, .2);   // no fade at the shot end: the next shot repeats the same badge, a fade made it blink at every cut
    for (const it of this.items) {
      const gone = it.t1 != null ? 1 - clamp((ctx.t - it.t1) / .16) : 1;
      STK.animate(it.s, ctx.t, it.t0, Math.min(out, gone), 1);
      if (it.rise) {   // hero climbs out from behind the head
        const q = ease.out(enter(ctx.t, it.t0, .5));
        it.s.el.style.transform = `translateY(${lerp(150, 0, q).toFixed(1)}px) ` + it.s.el.style.transform;
      }
    }
  },
};
