// 结尾衬线大字 + 出框人像 · 片尾：暖黑底，上方超粗衬线白色大标题 + 右侧一行绿色小字，人缩进细白边圆角框、头冒出框顶；白菜的「口播视频 / 看着廉价」
TEMPLATES.baicai_end_frame = {
  setup(ctx) {
    const P = ctx.params;
    this.off = !P.title;
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 50% 30%, #3a332e, #221e1b 60%, #161412)';
    this.title = el('div', `position:absolute;left:60px;right:60px;top:${P.y || 230}px;text-align:center;font-size:${P.size || 170}px;
      text-shadow:0 10px 30px rgba(0,0,0,.55)`, P.title);
    this.title.className = 'pk-serif pk-display';
    ctx.L.front.appendChild(this.title);
    const tw = this.title.scrollWidth;
    if (tw > 960) this.title.style.fontSize = Math.floor((P.size || 170) * 960 / tw) + 'px';
    if (P.sub) {
      this.sub = el('div', `position:absolute;right:110px;top:${(P.y || 230) + parseFloat(this.title.style.fontSize) * 1.15 + 40}px;font-size:46px;letter-spacing:.1em;
        text-shadow:0 2px 10px rgba(0,0,0,.6)`, P.sub);
      this.sub.className = 'pk-green';
      ctx.L.front.appendChild(this.sub);
    }
    // frame: shoulders at its top edge, head breaks out above it
    this.F = { l: 70, r: 1010, t: P.frameTop || 1010, b: 1760 };
    // the footage must fill the frame width: never smaller than the frame, face as central as the edges allow
    this.s = Math.max(P.scale || .86, (this.F.r - this.F.l) / 1080 + .012);
    this.fx = ctx.focus[0] * 1080; this.fy = ctx.focus[1] * 1920;
    const xMax = this.F.l + 4 + this.s * this.fx, xMin = this.F.r - 4 - this.s * (1080 - this.fx);
    this.dst = [clamp(540, xMin, xMax), this.F.t - (P.faceAbove || 150)];
    this.frame_ = el('div', `position:absolute;left:${this.F.l}px;top:${this.F.t}px;width:${this.F.r - this.F.l}px;height:${this.F.b - this.F.t}px;
      box-sizing:border-box;border:4px solid rgba(255,255,255,.92);border-radius:18px;box-shadow:0 30px 70px rgba(0,0,0,.5)`);
    ctx.L.back.appendChild(this.frame_);
    ctx.base.style.transformOrigin = '0 0';
    ctx.person.style.transformOrigin = '0 0';
    this.tTitle = at(P.at); if (this.tTitle == null) this.tTitle = .3;
    this.tSub = at(P.subAt); if (this.tSub == null) this.tSub = this.tTitle + .45;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const p = ease.inOut(enter(t, 0, .55));
    const s = lerp(ctx.seg.zoom || 1, this.s, p);
    const tx = lerp(0, this.dst[0] - this.s * this.fx, p), ty = lerp(0, this.dst[1] - this.s * this.fy, p);
    const tr = `translate(${tx}px, ${ty}px) scale(${s})`;
    ctx.base.style.transform = tr; ctx.person.style.transform = tr;
    // footage only inside the frame; the cutout copy shows the head above it
    const F = this.F, loc = (x, o) => (x - o) / s;
    const k = p;  // clip closes in with the move
    const top = loc(lerp(0, F.t + 4, k), ty), bot = 1920 - loc(lerp(1920, F.b - 4, k), ty);
    const lft = loc(lerp(0, F.l + 4, k), tx), rgt = 1080 - loc(lerp(1080, F.r - 4, k), tx);
    ctx.base.style.clipPath = `inset(${Math.max(0, top)}px ${Math.max(0, rgt)}px ${Math.max(0, bot)}px ${Math.max(0, lft)}px round ${14 / s}px)`;
    ctx.person.style.clipPath = `inset(0 ${Math.max(0, rgt)}px ${Math.max(0, bot)}px ${Math.max(0, lft)}px)`;
    ctx.personCv.style.filter = 'brightness(.8) contrast(1.12) saturate(.75) sepia(.1)';
    ctx.person.style.opacity = p > .4 ? 1 : 0;
    this.frame_.style.opacity = clamp((p - .5) * 3);
    const q = ease.out(enter(t, this.tTitle, .5));
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(30, 0, q)}px)`;
    this.title.style.letterSpacing = `${lerp(.1, .01, q)}em`;
    if (this.sub) {
      const r = ease.out(enter(t, this.tSub, .4));
      this.sub.style.opacity = r;
      this.sub.style.transform = `translateX(${lerp(20, 0, r)}px)`;
    }
  },
};
