// 结尾标题卡 · 片头片尾：画面缩进下方的圆角框，上方大标题 + 一行小字，复述主题
TEMPLATES.end_title = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = 'linear-gradient(180deg, var(--bg-b), var(--bg-a))';
    this.title = el('div', `position:absolute;left:80px;right:80px;top:260px;text-align:center;color:var(--paper);font-size:${P.size || 120}px`, P.title || '');
    this.title.className = 'display';
    this.sub = el('div', `position:absolute;left:0;right:0;top:${260 + (P.size || 120) * (P.lines || 2) * .95 + 30}px;text-align:center;
      color:var(--accent);font:700 50px var(--font-body);letter-spacing:.12em`, P.sub || '');
    ctx.L.front.append(this.title, this.sub);
    ctx.base.style.borderRadius = '40px';
    ctx.base.style.boxShadow = '0 30px 70px rgba(0,0,0,.45)';
    this.captions = TL.captions;
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, 0, .5));
    ctx.base.style.transformOrigin = '50% 100%';
    ctx.base.style.transform = `translateY(${lerp(0, -170, p)}px) scale(${lerp(ctx.seg.zoom || 1, .56, p)})`;
    const q = enter(ctx.t, .35, .45), r = enter(ctx.t, .6, .4);
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(50, 0, ease.out(q))}px)`;
    this.title.style.letterSpacing = `${lerp(.12, -.01, ease.out(q))}em`;
    this.sub.style.opacity = r;
  },
};
