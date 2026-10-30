// 描边字透过人 · 字体：人后面一个大号实心彩色字，同一个字的空心描边版本叠在人前面、位置完全重合——被人挡住的地方能看到细描边「透」出来
TEMPLATES.outline_through = {
  setup(ctx) {
    const P = ctx.params;
    const lines = (P.lines || []).map(s => String(s).toUpperCase()); // required: nothing shown without lines
    const color = P.color || 'var(--accent)';
    this.groups = [];
    for (const [layer, solid] of [[ctx.L.back, true], [ctx.L.front, false]]) {
      const box = el('div', `position:absolute;left:0;right:0;top:${P.y || 380}px;text-align:center;transform-origin:50% 40%`);
      lines.forEach((t, k) => {
        const size = Math.min(P.size || 330, Math.floor(1060 / (t.length * .6)));
        box.appendChild(el('div', `font:900 ${size}px/.86 "Avenir Next Condensed","Impact",sans-serif;letter-spacing:-.01em;white-space:nowrap;
          ${solid ? `color:${color};text-shadow:0 10px 30px rgba(0,0,0,.25)` : `color:transparent;-webkit-text-stroke:3px ${color}`}`, t));
      });
      layer.appendChild(box);
      this.groups.push(box);
    }
  },
  frame(ctx) {
    const p = enter(ctx.t, .05, .45), out = leave(ctx, .25);
    for (const g of this.groups) {
      g.style.opacity = Math.min(clamp(p * 3), out);
      g.style.transform = `scale(${lerp(1.18, 1, ease.out(p))})`;
    }
  },
};
