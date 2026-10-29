// 背景纸 + 分层道具 · 版式：背景换成皱纸，人抠出加白描边，图片卡片从两边插进来，一半在人后、一半在人前
TEMPLATES.paper_props = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = pattern('paper');
    ctx.base.style.opacity = 0;
    ctx.personCv.style.filter = outline(9, '#fff');
    const spots = [
      { x: -40, y: 300, w: 520, rot: -14, from: -700, layer: 'back' },
      { x: 600, y: 230, w: 500, rot: 11, from: 700, layer: 'back' },
      { x: 640, y: 1080, w: 430, rot: -8, from: 700, layer: 'front' },
      { x: -30, y: 1160, w: 400, rot: 9, from: -700, layer: 'front' },
    ];
    this.cards = (P.images || []).slice(0, 4).map((src, j) => {
      const s = spots[j];
      const c = el('div', `position:absolute;left:${s.x}px;top:${s.y}px;width:${s.w}px;padding:14px 14px 18px;background:#fff;
        box-shadow:0 22px 40px rgba(0,0,0,.28);border-radius:6px`);
      const img = el('img', 'display:block;width:100%;border-radius:2px');
      img.src = url(src);
      pending.push(img.decode().catch(() => {}));
      c.appendChild(img);
      ctx.L[s.layer].appendChild(c);
      return { c, s, t0: .15 + j * .22 };
    });
    if (P.label) {
      this.label = el('div', `position:absolute;left:0;right:0;top:120px;text-align:center;font-size:120px;color:var(--accent);
        -webkit-text-stroke:6px var(--ink);paint-order:stroke fill`, P.label);
      this.label.className = 'display';
      ctx.L.front.appendChild(this.label);
    }
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .35));
    ctx.L.bg.style.opacity = clamp(p * 2);
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${lerp(ctx.seg.zoom || 1, .86, p)})`;
    for (const { c, s, t0 } of this.cards) {
      const q = enter(ctx.t, t0, .45);
      c.style.transform = `translateX(${lerp(s.from, 0, ease.back(q))}px) rotate(${s.rot + Math.sin(ctx.t * 1.6 + t0 * 9) * 1.5}deg)`;
      c.style.opacity = Math.min(clamp(q * 3), leave(ctx));
    }
    if (this.label) {
      const q = enter(ctx.t, .1, .35);
      this.label.style.opacity = Math.min(q, leave(ctx));
      this.label.style.transform = `scale(${ease.pop(q)}) rotate(-3deg)`;
    }
  },
};
