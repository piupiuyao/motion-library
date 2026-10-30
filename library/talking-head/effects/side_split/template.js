// 侧屏滑入 · 版式：另一块画面从一侧滑进来，人同时往另一侧滑，最后各占半边，人不缩小
TEMPLATES.side_split = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.dir = P.side === 'left' ? -1 : 1; // which side the new panel comes from
    if (!P.media) { this.off = true; return; }   // needs_assets: no picture / B-roll → render nothing
    this.media = P.media;
    ctx.L.bg.style.background = 'var(--bg-a)';
    this.panel = el('div', `position:absolute;top:0;${this.dir > 0 ? 'left:540px' : 'left:0'};width:540px;height:1920px;overflow:hidden;
      background:radial-gradient(ellipse at 50% 30%, var(--bg-b), var(--bg-a) 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px`);
    if (P.title) {
      const t = el('div', 'width:460px;color:var(--paper);font-size:68px;text-align:left', P.title);
      t.className = 'display';
      this.panel.appendChild(t);
    }
    if (typeof this.media === 'string') {
      const card = el('div', 'width:470px;border-radius:28px;overflow:hidden;background:#fff;box-shadow:0 24px 50px rgba(0,0,0,.45)');
      const img = el('img', 'display:block;width:100%');
      img.src = url(this.media); pending.push(img.decode().catch(() => {}));
      card.appendChild(img);
      this.panel.appendChild(card);
    } else {
      this.vid = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover');
      this.panel.appendChild(this.vid);
    }
    this.panel.appendChild(el('div', `position:absolute;top:0;bottom:0;${this.dir > 0 ? 'left:0' : 'right:0'};width:10px;background:var(--accent)`));
    ctx.L.front.appendChild(this.panel);
  },
  frame(ctx) {
    if (this.off) return;
    const pin = ease.inOut(enter(ctx.t, .1, .55)), pout = ease.inOut(enter(ctx.t, ctx.d - .5, .5));
    const k = pin * (1 - pout), d = this.dir;
    // person keeps full size: shift by a quarter and crop to the half it now owns
    ctx.base.style.transform = `translateX(${-270 * k * d}px) scale(${ctx.seg.zoom || 1})`;
    ctx.base.style.clipPath = d > 0 ? `inset(0 ${270 * k}px 0 0)` : `inset(0 0 0 ${270 * k}px)`;
    this.panel.style.transform = `translateX(${(1 - k) * 560 * d}px)`;
    if (this.vid) setImg(this.vid, mediaSrc(this.media, ctx.t));
  },
};
