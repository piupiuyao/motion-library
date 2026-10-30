// 景别跳切 · 镜头特效：在原景别和 120–150% 脸部特写之间硬切来回，假装有第二台机位
TEMPLATES.zoom_jumpcut = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    if (P.at && P.at.length) {
      this.cuts = P.at.map(a => (ctx.words.find(w => n(w.w) === n(a)) || {}).s).filter(x => x != null);
    } else {
      // cut on a word start roughly every `every` seconds
      const every = P.every || 1.0;
      this.cuts = []; let last = 0;
      for (const w of ctx.words) if (w.s - last >= every && w.s < ctx.d - .4) { this.cuts.push(w.s); last = w.s; }
    }
    this.to = P.to || 1.4;
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100 + 2}%`;
  },
  frame(ctx) {
    let k = 0;
    for (const c of this.cuts) if (ctx.t >= c) k++;
    const close = k % 2 === 1;
    // close-up is slightly off-centre, like a second camera at another angle
    ctx.base.style.transform = close ? `translateX(-30px) scale(${this.to})` : `scale(${ctx.seg.zoom || 1})`;
  },
};
