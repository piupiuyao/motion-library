// 标题幕下滑 · 转场：一张全屏标题卡从上往下滑下来盖住人，卡上写段落标题，过一会儿继续滑走露出人
TEMPLATES.c66 = {
  setup(ctx) {
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : .4;
    this.hold = P.hold || 1.3;
    this.card = el('div', `position:absolute;inset:0;background:${P.bg || 'var(--accent)'};box-shadow:0 30px 60px rgba(0,0,0,.4)`);
    this.card.appendChild(el('div', 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent 0 58px, rgba(0,0,0,.07) 58px 60px), repeating-linear-gradient(90deg, transparent 0 58px, rgba(0,0,0,.07) 58px 60px)'));
    this.num = el('div', 'position:absolute;left:90px;top:560px;font-size:220px;color:var(--ink);opacity:.18', P.num || '02');
    this.num.className = 'display';
    this.title = el('div', `position:absolute;left:90px;right:90px;top:760px;font-size:${P.size || 150}px;color:var(--ink)`, P.title || 'The real problem');
    this.title.className = 'display';
    this.bar = el('div', 'position:absolute;left:90px;top:1180px;width:260px;height:18px;background:var(--ink);transform-origin:0 50%');
    this.card.append(this.num, this.title, this.bar);
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const t0 = this.t0, t1 = Math.min(ctx.d - .5, t0 + .5 + this.hold);
    const pin = ease.out(enter(ctx.t, t0, .5)), pout = ease.inOut(enter(ctx.t, t1, .5));
    this.card.style.transform = `translateY(${(pin - 1) * 1960 + pout * 1960}px)`;
    const q = enter(ctx.t, t0 + .3, .4);
    this.title.style.opacity = q;
    this.title.style.transform = `translateY(${lerp(60, 0, ease.out(q))}px)`;
    this.bar.style.transform = `scaleX(${ease.out(enter(ctx.t, t0 + .45, .4))})`;
  },
};
