// 面板标题 · 版式：人下移，上方浅灰细网格面板（780 高，比图解面板短）里两行内的 Poppins Bold 大标题 + 橙色短横 + 副标题（+ 可选橙标签），副标题按原话出现；Nischa 每条视频开头的那块面板
TEMPLATES.nischa_panel_title = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.title) { this.off = true; return; }                // 必填: no title → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // title-only board: shorter than the 900 diagram panel so the headline fills it (seam follows: pack.css --panel-h)
    this.ph = P.panel || 780; this.shift = P.shift != null ? P.shift : Math.round(this.ph * .53);
    ctx.L.bg.style.background = '#000';
    this.panel = el('div', `height:${this.ph}px`);
    this.panel.className = 'pk-panel';
    ctx.L.front.appendChild(this.panel);
    // content column: below the top UI band (150 px), above the caption seam; centred as a block
    const box = el('div', `position:absolute;left:70px;right:70px;top:${P.top || 150}px;bottom:96px;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:26px`);
    this.panel.appendChild(box);
    this.title = el('div', `font-size:${P.size || 104}px;line-height:1.08;max-width:900px`, P.title);
    this.title.className = 'pk-title';
    box.appendChild(this.title);
    // headline: as big as fits in two lines (measured)
    for (let fs = P.size || 104; fs > 56 && this.title.offsetHeight > fs * 1.08 * 2 + 4; fs -= 4) this.title.style.fontSize = fs + 'px';
    this.rule = el('div', 'width:96px;height:9px;border-radius:5px;background:var(--accent)');   // her one orange, as a short underline
    box.appendChild(this.rule);
    if (P.sub) {
      this.sub = el('div', 'font-size:40px;max-width:860px', P.sub);
      this.sub.className = 'pk-sub';
      box.appendChild(this.sub);
      this.tSub = at(P.subAt); if (this.tSub == null) this.tSub = .9;
    }
    if (P.tag) {
      this.tag = el('div', `margin-top:10px;width:max-content;max-width:760px;padding:12px 30px 14px;border-radius:14px;background:var(--accent);
        color:var(--on-accent);font:700 40px/1.2 var(--font-body);text-align:center`, P.tag);
      box.appendChild(this.tag);
      this.tTag = at(P.tagAt); if (this.tTag == null) this.tTag = ctx.d * .6;
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    for (const n of [ctx.L.bg, ctx.L.bg.parentNode]) { n.style.setProperty('--panel-k', k); n.style.setProperty('--panel-h', this.ph); }  // panel in/out: a pack can move its caption with the seam
    const q = ease.out(enter(t, .3, .4));
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(14, 0, q)}px)`;
    const r = ease.out(enter(t, .45, .35));
    this.rule.style.transform = `scaleX(${r})`;
    if (this.sub) {
      const s = ease.out(enter(t, this.tSub, .35));
      this.sub.style.opacity = s;
      this.sub.style.transform = `translateY(${lerp(12, 0, s)}px)`;
    }
    if (this.tag) {
      const g = ease.out(enter(t, this.tTag, .3));
      this.tag.style.opacity = g;
      this.tag.style.transform = `translateY(${lerp(12, 0, g)}px)`;
    }
  },
};
