// 侧边窄体大标题 · 开场：脸部近景慢推，脸旁一个高窄白色大字（Anton）+ 下方一行绿色小字；白菜开场的 "SEVEN"
TEMPLATES.baicai_side_title = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.title) { this.off = true; return; }
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.side = P.side === 'left' ? 'left' : 'right';
    this.zoom = P.zoom || 1.55;
    // face goes to the opposite third; the title takes the free side
    this.fx = ctx.focus[0] * 1080; this.fy = ctx.focus[1] * 1920;
    this.tx = this.side === 'right' ? 300 : 780;
    ctx.base.style.transformOrigin = '0 0';
    const top = P.y || Math.round(this.fy - 40);
    this.box = el('div', `position:absolute;${this.side}:56px;top:${top}px;width:max-content;text-align:${this.side}`);
    this.title = el('div', `font-size:${P.size || 230}px;text-shadow:0 8px 30px rgba(0,0,0,.45)`, P.title);
    this.title.className = 'pk-display';
    this.box.appendChild(this.title);
    if (P.sub) {
      this.sub = el('div', `margin-top:26px;font-size:40px;letter-spacing:.1em;max-width:${P.maxw || 560}px;${this.side === 'right' ? 'margin-left:auto' : 'margin-right:auto'};`+'text-shadow:0 2px 10px rgba(0,0,0,.6)', P.sub);
      this.sub.className = 'pk-green';
      this.box.appendChild(this.sub);
    }
    ctx.L.front.appendChild(this.box);
    // auto-fit: the title may not run over the face (free width = 1080 - face third)
    const maxW = P.maxw || 560;
    const w = this.title.offsetWidth;
    if (w > maxW) this.title.style.fontSize = Math.floor((P.size || 230) * maxW / w) + 'px';
    this.tIn = at(P.at); if (this.tIn == null) this.tIn = .1;
    this.tSub = at(P.subAt); if (this.tSub == null) this.tSub = this.tIn + .35;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    // slow push over the whole shot, face parked on one side
    const s = lerp(this.zoom, this.zoom * 1.06, ease.inOut(ctx.p));
    ctx.base.style.transform = `translate(${this.tx - s * this.fx}px, ${this.fy * (1 - s) + 60}px) scale(${s})`;
    const q = ease.out(enter(t, this.tIn, .45)), out = leave(ctx, .2);
    this.title.style.opacity = Math.min(q, out);
    this.title.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`;
    this.title.style.transform = `translateY(${lerp(40, 0, q)}px)`;
    if (this.sub) {
      const r = ease.out(enter(t, this.tSub, .4));
      this.sub.style.opacity = Math.min(r, out);
      this.sub.style.transform = `translateY(${lerp(14, 0, r)}px)`;
    }
  },
};
