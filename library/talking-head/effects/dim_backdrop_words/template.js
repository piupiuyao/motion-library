// 背景压暗人保持亮 · 版式：背景叠一层 ~70% 黑，抠出的人保持原亮度从暗背景里浮出来；压暗层之上、人之下放大字；进出各 0.3 秒淡入淡出
TEMPLATES.dim_backdrop_words = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.dim = el('div', `position:absolute;inset:0;background:rgba(0,0,0,${P.dark || .72})`);
    ctx.L.back.appendChild(this.dim);
    const lines = P.lines || []; // no lines: just the dimmed background with the bright person
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 170}px;text-align:center`);
    ctx.L.back.appendChild(this.box);
    this.lines = lines.map((l, j) => {
      const size = l.size || Math.min(230, Math.floor(1000 / (l.text.length * .8)));
      const e = el('div', `font-size:${size}px;line-height:.95;color:${l.accent ? 'var(--accent)' : '#fff'};white-space:nowrap`, l.text);
      e.className = 'display';
      this.box.appendChild(e);
      const s = l.at != null ? at(l.at) : null;
      return { e, s: s != null ? s - .08 : .3 + j * .4 };
    });
    ctx.personCv.style.filter = 'drop-shadow(0 0 30px rgba(0,0,0,.6))';
  },
  frame(ctx) {
    const k = Math.min(enter(ctx.t, 0, .3), 1 - enter(ctx.t, ctx.d - .3, .3));
    this.dim.style.opacity = k;
    this.box.style.opacity = k;
    for (const l of this.lines) {
      const q = enter(ctx.t, l.s, .35);
      l.e.style.opacity = clamp(q * 2);
      l.e.style.transform = `translateY(${lerp(40, 0, ease.out(q))}px)`;
    }
  },
};
