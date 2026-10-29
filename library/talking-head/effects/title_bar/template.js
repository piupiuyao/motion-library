// 顶部固定标题栏 · 字体：画面顶部挂着节目名大标题 + 一行小字，原画面缩进下方的框里
TEMPLATES.title_bar = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = 'linear-gradient(180deg, var(--bg-b), var(--bg-a))';
    this.title = el('div', `position:absolute;left:0;right:0;top:110px;text-align:center;color:var(--paper);font-size:${P.size || 112}px;letter-spacing:.06em`, P.title || '');
    this.title.className = 'display';
    this.sub = el('div', `position:absolute;left:0;right:110px;top:${110 + (P.size || 112) + 18}px;text-align:right;color:var(--accent);
      font:700 44px var(--font-body);letter-spacing:.2em`, P.sub || '');
    ctx.L.front.append(this.title, this.sub);
    ctx.base.style.borderRadius = '36px';
    ctx.base.style.boxShadow = '0 24px 60px rgba(0,0,0,.4)';
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .4));
    ctx.base.style.transformOrigin = '50% 100%';
    ctx.base.style.transform = `translateY(${lerp(0, -40, p)}px) scale(${lerp(ctx.seg.zoom || 1, .8, p)})`;
    const q = enter(ctx.t, .15, .4);
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(-60, 0, ease.out(q))}px)`;
    this.sub.style.opacity = enter(ctx.t, .4, .3);
  },
};
