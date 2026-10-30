// 闪烁出字 · 字体：字像接触不良的灯管一样逐帧闪 6 次左右（约 0.3 秒）然后稳定亮着，几个词各自闪着出
TEMPLATES.c87 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const items = P.words || []; // required: nothing is shown without words
    this.row = el('div', `position:absolute;left:30px;right:30px;top:${P.y || 1110}px;display:flex;flex-wrap:wrap;justify-content:center;gap:0 30px;
      font:900 ${P.size || 120}px/1.05 var(--font-body);letter-spacing:-.01em`);
    ctx.L.front.appendChild(this.row);
    this.items = items.map((it, j) => {
      const e = el('span', `display:inline-block;background:${P.gradient || 'linear-gradient(180deg,#ffffff 30%,color-mix(in srgb, var(--accent) 40%, #fff))'};-webkit-background-clip:text;background-clip:text;
        color:transparent;filter:drop-shadow(0 0 14px color-mix(in srgb, var(--accent) 60%, transparent)) drop-shadow(0 4px 10px rgba(0,0,0,.45))`, it.text);
      this.row.appendChild(e);
      const s = it.at != null ? at(it.at) : null;
      return { e, s: s != null ? s - .05 : .3 + j * .6 };
    });
    // opacity per frame during the flicker (≈0.3 s at 30 fps), then steady
    this.pattern = P.pattern || [1, 0, .25, 1, 0, 0, .9, .1, 1, .3, 0, 1];
  },
  frame(ctx) {
    const out = leave(ctx, .2);
    for (const it of this.items) {
      const f = Math.floor((ctx.t - it.s) * 30);
      let o = f < 0 ? 0 : f < this.pattern.length ? this.pattern[f] : 1;
      it.e.style.opacity = Math.min(o, out);
    }
  },
};
