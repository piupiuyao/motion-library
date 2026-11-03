// 面板标题 · 版式：人下移，上方浅灰细网格面板（约屏幕一半）里一行 Poppins 粗体标题 + 一行副标题，副标题按原话出现；Nischa 每条视频开头的那块面板
TEMPLATES.nischa_panel_title = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.title) { this.off = true; return; }                // 必填: no title → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.ph = P.panel || 900; this.shift = P.shift != null ? P.shift : 480;
    ctx.L.bg.style.background = '#000';
    this.panel = el('div', `height:${this.ph}px`);
    this.panel.className = 'pk-panel';
    ctx.L.front.appendChild(this.panel);
    const top = P.top || Math.round(this.ph * .36);
    this.title = el('div', `position:absolute;left:70px;right:70px;top:${top}px;font-size:${P.size || 54}px`, P.title);
    this.title.className = 'pk-title';
    this.panel.appendChild(this.title);
    if (P.sub) {
      this.sub = el('div', `position:absolute;left:90px;right:90px;top:${top + (P.size || 54) * 1.25 * Math.ceil(P.title.length / 26) + 22}px`, P.sub);
      this.sub.className = 'pk-sub';
      this.panel.appendChild(this.sub);
      this.tSub = at(P.subAt); if (this.tSub == null) this.tSub = .9;
    }
    if (P.tag) {
      this.tag = el('div', `position:absolute;left:50%;top:${P.tagTop || this.ph - 210}px;transform:translateX(-50%);width:max-content;max-width:760px;
        padding:10px 26px 12px;border-radius:12px;background:var(--accent);color:var(--on-accent);font:700 34px/1.2 var(--font-body);text-align:center`, P.tag);
      this.panel.appendChild(this.tag);
      this.tTag = at(P.tagAt); if (this.tTag == null) this.tTag = ctx.d * .6;
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    const q = ease.out(enter(t, .3, .4));
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(14, 0, q)}px)`;
    if (this.sub) {
      const s = ease.out(enter(t, this.tSub, .35));
      this.sub.style.opacity = s;
      this.sub.style.transform = `translateY(${lerp(12, 0, s)}px)`;
    }
    if (this.tag) {
      const g = ease.out(enter(t, this.tTag, .3));
      this.tag.style.opacity = g;
      this.tag.style.transform = `translateX(-50%) translateY(${lerp(12, 0, g)}px)`;
    }
  },
};
