// 左右轮换图文 · 版式：抠出的人站在左或右三分之一，另外三分之二放图；每隔几秒换图，人换边站
TEMPLATES.side_images = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!(P.images || []).length) { this.off = true; return; }   // needs_assets 截图: no pictures → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.base.style.opacity = 0;
    ctx.L.bg.style.background = pattern(P.pattern || 'grid');
    ctx.personCv.style.filter = outline(6, '#fff');
    const imgs = P.images;
    const ts = (P.at || []).map(at);
    this.times = imgs.map((_, j) => j === 0 ? 0 : ts[j - 1] != null ? ts[j - 1] : j * ctx.d / imgs.length);
    this.panels = imgs.map((src, j) => {
      const c = el('div', `position:absolute;top:${P.top || 280}px;width:680px;padding:16px;border-radius:30px;background:#fff;box-shadow:0 26px 60px rgba(0,0,0,.4)`);
      const img = el('img', 'display:block;width:100%;border-radius:18px');
      img.src = url(src); pending.push(img.decode().catch(() => {}));
      c.appendChild(img);
      if (P.labels && P.labels[j]) c.appendChild(el('div', 'font:800 46px var(--font-body);color:var(--ink);padding:18px 10px 6px', P.labels[j]));
      ctx.L.back.appendChild(c);
      return c;
    });
  },
  frame(ctx) {
    if (this.off) return;
    let k = 0;
    this.times.forEach((t, j) => { if (ctx.t >= t) k = j; });
    const side = j => (j % 2 ? 1 : -1); // person side for segment j: -1 left, 1 right
    const sw = k ? ease.inOut(enter(ctx.t, this.times[k], .55)) : 1;
    const pin = ease.out(enter(ctx.t, 0, .45));
    const x = lerp(side(k - 1 < 0 ? 0 : k - 1), side(k), sw) * (ctx.params.shift || 300) * pin;
    ctx.L.bg.style.opacity = clamp(pin * 2);
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `translateX(${x}px) scale(${lerp(ctx.seg.zoom || 1, .82, pin)})`;
    this.panels.forEach((c, j) => {
      const s = side(j);               // panel sits opposite the person
      const left = s < 0 ? 372 : 28;
      let off, op = 1;
      if (j === k) { const q = j ? ease.out(enter(ctx.t, this.times[j] + .1, .5)) : pin; off = (1 - q) * 1100 * (s < 0 ? 1 : -1); op = clamp(q * 3); }
      else if (j === k - 1) { off = sw * 1100 * (s < 0 ? 1 : -1); op = 1 - sw; }
      else { op = 0; off = 0; }
      c.style.left = left + 'px';
      c.style.opacity = Math.min(op, leave(ctx, .3));
      c.style.transform = `translateX(${off}px) rotate(${s * -2}deg)`;
    });
  },
};
