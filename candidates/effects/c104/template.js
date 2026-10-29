// 关键词纵向拉伸 · 字体：关键词出现后在 0.4 秒内只往上拉高到 2–3 倍（宽度不变），像拉长的橡皮筋，回弹一下停住
TEMPLATES.c104 = {
  setup(ctx) {
    const P = ctx.params;
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    const w = P.at ? ctx.words.find(x => n(x.w) === n(P.at)) : null;
    const g = ctx.groups[0];
    this.text = (P.text || (w && w.w.replace(/[^\w'-]/g, '')) || (g && g.text) || 'BIG').toUpperCase();
    this.t0 = w ? w.s : g ? g.s : .3;
    this.dir = P.dir || 'y';
    this.sy = P.scale || 2.6;
    const fs = P.size || (this.text.length > 9 ? 150 : 190);
    this.word = el('div', `position:absolute;left:0;right:0;top:${(P.y || 420) - fs * .8}px;text-align:center;white-space:nowrap;font-size:${fs}px;
      color:#fff;-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:0 10px 0 var(--ink);letter-spacing:-.02em;transform-origin:50% 100%`, this.text);
    this.word.className = 'display';
    ctx.L.front.appendChild(this.word);
  },
  frame(ctx) {
    const t = ctx.t, t0 = this.t0;
    const a = enter(t, t0 - .12, .12);           // quick appear at normal size
    const s = enter(t, t0 + .05, .42);           // the stretch
    // overshoot past the target, then settle (rubber band)
    let k = s < 1 ? lerp(1, this.sy * 1.12, ease.inOut(s)) : this.sy * (1 + .12 * Math.exp(-6 * (t - t0 - .47)) * Math.cos(14 * (t - t0 - .47)));
    if (s <= 0) k = 1;
    this.word.style.opacity = Math.min(a, leave(ctx));
    this.word.style.transform = this.dir === 'x' ? `scaleX(${k})` : `scaleY(${k})`;
  },
};
