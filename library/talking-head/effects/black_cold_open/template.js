// 黑场细衬线冷开场 · 字体：开头几秒纯黑，正中一行很小的白色细衬线小写字随口播逐句替换（淡入淡出），然后硬切进调成暗青色的口播画面
TEMPLATES.black_cold_open = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.cut = this.tAt(ctx, P.cut, Math.min(3, ctx.d - .8));
    // lines: [{text, at}] or ["text", …]; missing → the shot's own words, a new line at each pause/punctuation (max 4 words)
    let lines = [];
    if (Array.isArray(P.lines) && P.lines.length) {
      lines = P.lines.map((l, i) => typeof l === 'string' ? { text: l, s: null } : { text: l.text, s: this.tAt(ctx, l.at, null) });
      const n = lines.length;
      lines.forEach((l, i) => { if (l.s == null) l.s = this.cut * i / n; });
    } else {
      let cur = [];
      for (const w of ctx.words) {
        if (w.s >= this.cut - .15) break;
        if (cur.length && (cur.length >= 4 || w.s - cur[cur.length - 1].e > .3 || /[.,?!;:]$/.test(cur[cur.length - 1].w))) { lines.push(cur); cur = []; }
        cur.push(w);
      }
      if (cur.length) lines.push(cur);
      lines = lines.map(g => ({ text: g.map(w => w.w).join(' '), s: g[0].s }));
    }
    this.off = !lines.length;
    if (this.off) return;
    lines.sort((a, b) => a.s - b.s);
    const lower = P.lower !== false;
    this.black = el('div', 'position:absolute;inset:0;background:#000');
    this.lines = lines.map((l, i) => {
      const e = el('div', `position:absolute;left:60px;right:60px;top:${P.y || 935}px;text-align:center;color:#f4f2ec;
        font:400 ${P.size || 46}px/1.2 "Hoefler Text","Iowan Old Style","Baskerville",Georgia,"Songti SC",serif;letter-spacing:.01em;opacity:0`,
        lower ? String(l.text).toLowerCase() : l.text);
      this.black.appendChild(e);
      return { e, s: Math.max(0, l.s - .08), end: i + 1 < lines.length ? Math.max(0, lines[i + 1].s - .08) : this.cut };
    });
    ctx.L.front.appendChild(this.black);
    // after the cut: cool dark-teal grade on the talking head
    this.grade = P.grade !== false;
    if (this.grade) {
      this.tint = el('div', `position:absolute;inset:0;background:${P.tint || 'rgba(4,42,50,.42)'};mix-blend-mode:multiply`);
      this.vig = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,8,12,.55) 100%)');
      ctx.L.back.appendChild(this.tint);
      ctx.L.back.appendChild(this.vig);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, on = t < this.cut;
    this.black.style.display = on ? '' : 'none';
    if (this.grade) ctx.base.style.filter = on ? '' : 'saturate(.55) brightness(.8) contrast(1.12)';
    if (!on) return;
    for (const l of this.lines) {
      const a = clamp((t - l.s) / .25) * (l.end >= this.cut ? 1 : 1 - clamp((t - (l.end - .2)) / .2));
      l.e.style.opacity = t >= l.s && t < l.end ? a : 0;
    }
  },
};
