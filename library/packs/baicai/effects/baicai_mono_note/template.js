// 黑白缩框 + 绿色弧形手写字 · 版式：画面去色缩进纯黑底上的直角框，头顶一行绿色手写字沿弧线滑进来；白菜的「吐槽」段
TEMPLATES.baicai_mono_note = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.L.bg.style.background = '#000';
    this.s = P.scale || .82;
    ctx.base.style.transformOrigin = '50% 50%';
    if (P.text) {
      // arc over the head (in shrunk coordinates): centre x = face, apex ~260px above the eyes
      const fx = 540 + (ctx.focus[0] * 1080 - 540) * this.s;
      const fy = 960 + (ctx.focus[1] * 1920 - 960) * this.s;
      const R = P.radius || 700, apex = fy - (P.lift || 300);
      const cy = apex + R;
      const a0 = -Math.PI / 2 - .8, a1 = -Math.PI / 2 + .8;
      const p = (a) => `${(fx + R * Math.cos(a)).toFixed(1)} ${(cy + R * Math.sin(a)).toFixed(1)}`;
      const d = `M ${p(a0)} A ${R} ${R} 0 0 1 ${p(a1)}`;
      this.svg = el('div', 'position:absolute;inset:0');
      this.svg.innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">
        <defs><path id="bcArc" d="${d}" fill="none"/></defs>
        <text class="pk-hand" font-size="${P.size || 92}" fill="var(--accent)" text-anchor="middle"
          style="font-family:var(--font-hand);filter:drop-shadow(0 0 10px rgba(76,217,100,.55)) drop-shadow(0 3px 6px rgba(0,0,0,.6));letter-spacing:.02em">
          <textPath class="pk-hand" href="#bcArc" startOffset="50%">${P.text}</textPath></text></svg>`;
      ctx.L.front.appendChild(this.svg);
      this.tp = this.svg.querySelector('textPath');
      this.txt = this.svg.querySelector('text');
      this.tIn = at(P.at); if (this.tIn == null) this.tIn = .25;
    }
  },
  frame(ctx) {
    const t = ctx.t;
    const p = ease.inOut(enter(t, 0, .4));
    const s = lerp(ctx.seg.zoom || 1, this.s, p);
    ctx.base.style.transform = `scale(${s})`;
    ctx.base.style.filter = `grayscale(${p}) contrast(${1 + .12 * p})`;
    ctx.base.style.borderRadius = `${6 * p}px`;
    if (this.tp) {
      // words slide along the arc from the right end into place (the reference reveals 就变音缩小画面 this way)
      const q = ease.out(enter(t, this.tIn, .6));
      this.tp.setAttribute('startOffset', `${lerp(95, 50, q)}%`);
      this.txt.style.opacity = Math.min(clamp(q * 2.5), leave(ctx, .2));
    }
  },
};
