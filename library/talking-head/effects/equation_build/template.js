// 算式逐项拼出 · 版式：人下移到下半部，上方浅灰面板里一个白色长条框，随口播一项项填进「A + B = C」，每项下面一行灰色小注释，结果项用强调色
TEMPLATES.equation_build = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const terms = (P.terms || []).filter(x => x && (x.text || x.icon));
    if (terms.length < 2) { this.off = true; return; }       // 必填: at least two terms
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.ph = P.panel || 720; this.shift = P.shift != null ? P.shift : 320;
    ctx.L.bg.style.background = '#000';
    this.panel = el('div', `position:absolute;left:0;top:0;width:1080px;height:${this.ph}px;background:
      repeating-linear-gradient(0deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px),
      repeating-linear-gradient(90deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px), #efefef`);
    ctx.L.front.appendChild(this.panel);
    const top = P.title ? 330 : 250;
    if (P.title) this.panel.appendChild(el('div', `position:absolute;left:60px;right:60px;top:180px;text-align:center;color:#111;
      font:800 70px/1.1 var(--font-body);letter-spacing:-.01em`, P.title));
    this.box = el('div', `position:absolute;left:50px;width:980px;top:${top}px;min-height:0;box-sizing:border-box;padding:30px 30px 26px;
      background:#fff;border:3px solid #d2d2d2;border-radius:18px;display:flex;align-items:flex-start;justify-content:center;gap:0;
      box-shadow:0 8px 24px rgba(0,0,0,.06)`);
    this.panel.appendChild(this.box);
    // font size: fit all terms on one line inside the box
    const chars = terms.reduce((n, x) => n + (x.icon ? 2.8 : String(x.text).length) + (x.op ? 2 : 0), 0);
    const step = (ctx.d - 1.2) / terms.length;
    const build = fs => terms.map((x, j) => {
      const last = j === terms.length - 1;
      const g = el('div', 'display:flex;align-items:flex-start;flex:none');
      let opE = null;
      if (x.op) { opE = el('div', `font:800 ${fs * .8}px/${fs * 1.25}px var(--font-body);color:#111;margin:0 ${fs * .28}px`, x.op); g.appendChild(opE); }
      const col = el('div', 'display:flex;flex-direction:column;align-items:center;flex:none');
      let main;
      if (x.icon) {
        main = iconTile(x.icon, fs * 1.5);
        if (main) { main.style.boxShadow = '0 4px 10px rgba(0,0,0,.12)'; main.style.lineHeight = '0'; const sv = main.querySelector('svg'); if (sv) sv.style.display = 'block'; }
        else main = el('div', `font:800 ${fs}px/1.25 var(--font-body);color:#111`, x.text || '');
      } else {
        // the result gets the accent as a highlighter fill (text stays --ink so any accent is readable)
        main = el('div', `font:800 ${fs}px/1.25 var(--font-body);color:#111;white-space:nowrap;letter-spacing:-.01em;border-radius:10px;
          padding:0 ${last ? '.18em' : '0'};background:${last ? 'var(--accent)' : 'transparent'}`, x.text);
      }
      col.appendChild(main);
      if (x.note) col.appendChild(el('div', `margin-top:10px;max-width:${Math.max(180, fs * 3.4)}px;text-align:center;font:600 ${Math.max(22, fs * .3)}px/1.2 var(--font-body);color:#8a8a8a`, x.note));
      g.appendChild(col);
      this.box.appendChild(g);
      const t = at(x.at);
      return { g, t: t != null ? t : .5 + j * step };
    });
    // build once at a guess, measure, rebuild so the line fills the box (no wrapping, no tiny terms)
    let fs = P.size || clamp(Math.floor(900 / (chars * .62)), 40, 96);
    this.terms = build(fs);
    if (!P.size) {
      const used = this.terms.reduce((n, x) => n + x.g.offsetWidth, 0);
      const fit = clamp(Math.floor(fs * 900 / Math.max(1, used)), 40, 110);
      if (Math.abs(fit - fs) > 2) { this.box.innerHTML = ''; this.terms = build(fit); }
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    for (const n of [ctx.L.bg, ctx.L.bg.parentNode]) { n.style.setProperty('--panel-k', k); n.style.setProperty('--panel-h', this.ph); }  // panel in/out: a pack can move its caption with the seam
    const b = ease.out(enter(t, .25, .35));
    this.box.style.opacity = b;
    this.box.style.transform = `translateY(${lerp(16, 0, b)}px)`;
    for (const x of this.terms) {
      const q = ease.out(enter(t, x.t - .05, .3));
      x.g.style.opacity = q;
      x.g.style.transform = `translateY(${lerp(18, 0, q)}px)`;
    }
  },
};
