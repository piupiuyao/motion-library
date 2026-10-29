// 进度条 · 版式：顶部一条分段进度条从左往右填满，讲到第几步亮到第几段，带一个「第几步」小标签
TEMPLATES.c49 = {
  setup(ctx) {
    const P = ctx.params;
    this.n = P.steps || 4;
    this.from = P.from != null ? P.from : .15; this.to = P.to != null ? P.to : .62;
    this.bar = el('div', `position:absolute;left:50px;right:50px;top:${P.y || 70}px;display:flex;gap:14px`);
    this.segs = [];
    for (let j = 0; j < this.n; j++) {
      const s = el('div', 'position:relative;flex:1;height:22px;border-radius:11px;background:rgba(255,255,255,.35);overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.25)');
      const f = el('div', 'position:absolute;left:0;top:0;bottom:0;width:0;background:var(--accent);border-radius:11px');
      s.appendChild(f);
      this.bar.appendChild(s);
      this.segs.push(f);
    }
    ctx.L.front.appendChild(this.bar);
    this.labels = P.labels || [];
    this.chip = el('div', `position:absolute;left:50px;top:${(P.y || 70) + 46}px;padding:8px 22px 12px;border-radius:14px;background:rgba(0,0,0,.65);
      color:#fff;font:800 40px var(--font-body);transform-origin:0 0`);
    ctx.L.front.appendChild(this.chip);
  },
  frame(ctx) {
    const fill = lerp(this.from, this.to, ctx.p) * this.n;
    const k = Math.min(this.n - 1, Math.floor(fill));
    this.segs.forEach((f, j) => {
      const v = clamp(fill - j);
      f.style.width = v * 100 + '%';
      f.style.boxShadow = j === k ? '0 0 16px var(--accent)' : 'none';
    });
    const a = enter(ctx.t, 0, .3);
    this.bar.style.opacity = a;
    this.bar.style.transform = `translateY(${lerp(-40, 0, ease.out(a))}px)`;
    const stepStart = (k / this.n - this.from) / (this.to - this.from) * ctx.d;
    const q = enter(ctx.t, Math.max(0, stepStart), .35);
    this.chip.textContent = `STEP ${k + 1}/${this.n}` + (this.labels[k] ? ' · ' + this.labels[k] : '');
    this.chip.style.left = 50 + (980 / this.n) * k + 'px';
    this.chip.style.opacity = a;
    this.chip.style.transform = `scale(${ease.pop(q)})`;
  },
};
