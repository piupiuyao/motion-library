// 上下分屏 · 版式：竖屏上下一分为二，上半是人、下半是 B-roll/对比图，两块从两边滑进来，中缝压一行字
TEMPLATES.c36 = {
  setup(ctx) {
    const P = ctx.params;
    this.media = P.media || { frames: 'assets/broll_inbox', fps: 30, count: 165, offset: 2.5 };
    this.flip = !!P.flip; // true: person at the bottom
    ctx.L.bg.style.background = 'var(--bg-a)';
    this.panel = el('div', `position:absolute;left:0;top:${this.flip ? 0 : 960}px;width:1080px;height:960px;overflow:hidden;background:var(--bg-b)`);
    this.img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover');
    this.panel.appendChild(this.img);
    ctx.L.front.appendChild(this.panel);
    this.line = el('div', 'position:absolute;left:0;top:954px;width:1080px;height:12px;background:var(--paper);transform-origin:50% 50%');
    ctx.L.front.appendChild(this.line);
    if (P.label) {
      this.chip = el('div', `position:absolute;left:0;right:0;top:960px;display:flex;justify-content:center`);
      const c = el('div', `transform:translateY(-50%);padding:16px 34px 20px;border-radius:999px;background:var(--accent);color:var(--ink);
        font-size:58px;box-shadow:0 12px 30px rgba(0,0,0,.3);white-space:nowrap`, P.label);
      c.className = 'display';
      this.chip.appendChild(c);
      ctx.L.front.appendChild(this.chip);
    }
    if (P.tags) { // e.g. ["BEFORE","AFTER"]
      this.tags = P.tags.slice(0, 2).map((txt, j) => {
        const e = el('div', `position:absolute;left:40px;top:${j ? 1000 : 40}px;padding:8px 20px 10px;border-radius:12px;background:rgba(0,0,0,.6);
          color:#fff;font:800 40px var(--font-body);letter-spacing:.06em`, txt);
        ctx.L.front.appendChild(e);
        return e;
      });
    }
  },
  frame(ctx) {
    const pin = ease.out(enter(ctx.t, 0, .55)), pout = ease.inOut(enter(ctx.t, ctx.d - .45, .45));
    const k = pin * (1 - pout);
    // show source rows 330..1290 (the face) in one half
    const top = 330 * k, bot = 630 * k, dy = this.flip ? 630 * k : -330 * k;
    ctx.base.style.transform = `translateY(${dy}px) scale(${lerp(ctx.seg.zoom || 1, 1, k)})`;
    ctx.base.style.clipPath = `inset(${top}px 0 ${bot}px 0)`;
    setImg(this.img, mediaSrc(this.media, ctx.t));
    this.panel.style.transform = `translateX(${lerp(-1080, 0, k)}px)`;
    this.line.style.transform = `scaleX(${k})`;
    if (this.chip) {
      const q = enter(ctx.t, .45, .4);
      this.chip.style.opacity = Math.min(clamp(q * 3), 1 - pout);
      this.chip.style.transform = `scale(${ease.pop(q)})`;
    }
    if (this.tags) this.tags.forEach((e, j) => { e.style.opacity = clamp((k - .7) * 4); });
  },
};
