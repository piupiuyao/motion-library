// 侧边手写短句 · 字体：人挪到一边，空出来的一侧用白色手写体一句一句往下叠，关键词变黄，不压脸
TEMPLATES.side_handwriting = {
  setup(ctx) {
    const P = ctx.params;
    this.side = P.side === 'left' ? -1 : 1;   // text side; the person moves the other way
    this.shift = P.shift || 200;
    const keyIdx = new Set(ctx.groups.flatMap(g => g.idx));
    ctx.L.bg.style.background = 'linear-gradient(90deg, var(--bg-a), var(--bg-b))';
    const g = this.side > 0 ? '90deg' : '270deg';
    this.shade = el('div', `position:absolute;inset:0;background:linear-gradient(${g}, transparent 38%, rgba(12,12,16,.6) 58%, rgba(12,12,16,.93) 76%)`);
    ctx.L.back.appendChild(this.shade);
    // lines: up to 3 words / ~15 chars, break after punctuation
    const lines = []; let cur = [];
    for (const w of ctx.words) {
      if (!w.w) continue;
      const len = cur.map(x => x.w).join(' ').length + w.w.length;
      if (cur.length && (cur.length >= 3 || len > 14)) { lines.push(cur); cur = []; }
      cur.push(w);
      if (/[.,!?;]$/.test(w.w)) { lines.push(cur); cur = []; }
    }
    if (cur.length) lines.push(cur);
    this.lh = P.line_height || 96;
    this.col = el('div', `position:absolute;${this.side > 0 ? 'right:40px' : 'left:40px'};top:${P.y || 300}px;width:${P.width || 470}px`);
    this.items = lines.map(ln => {
      const e = el('div', `height:${this.lh}px;font:${P.size || 66}px/1.2 "Bradley Hand","Noteworthy","Marker Felt",cursive;font-weight:700;color:#fff;
        white-space:nowrap;text-shadow:0 3px 10px rgba(0,0,0,.5);text-align:${this.side > 0 ? 'left' : 'right'}`,
        ln.map(w => keyIdx.has(w.i) ? `<span style="color:var(--accent)">${w.w}</span>` : w.w).join(' '));
      this.col.appendChild(e);
      return { e, s: ln[0].s - .05 };
    });
    this.maxLines = P.max_lines || 9;
    ctx.L.front.appendChild(this.col);
    // the side text replaces the centred subtitle pill (style lives in #front, so it is wiped with the shot)
    if (P.keep_caption !== true) ctx.L.front.appendChild(el('style', '', '#caption{visibility:hidden}'));
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, 0, .5));
    ctx.base.style.transform = `translateX(${-this.side * this.shift * p}px) scale(${ctx.seg.zoom || 1})`;
    this.shade.style.opacity = p;
    const out = leave(ctx);
    let shown = 0;
    this.items.forEach(it => {
      const q = ease.out(enter(ctx.t, it.s, .4));
      if (ctx.t >= it.s) shown++;
      it.e.style.opacity = Math.min(q, out);
      it.e.style.transform = `translateY(${lerp(24, 0, q)}px)`;
      it.e.style.clipPath = `inset(-20% ${lerp(100, -40, q)}% -20% -40%)`;
    });
    // scroll up once the column is full (smoothed from each line's start time)
    let scroll = 0;
    this.items.forEach((it, j) => { if (j >= this.maxLines) scroll += ease.inOut(enter(ctx.t, it.s, .35)); });
    this.col.style.transform = `translateY(${-scroll * this.lh}px)`;
    this.items.forEach((it, j) => { if (j < scroll - .01) it.e.style.opacity = Math.min(+it.e.style.opacity, clamp(1 - (scroll - j))); });
  },
};
