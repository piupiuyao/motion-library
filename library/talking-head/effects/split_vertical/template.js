// 上下分屏 · 版式：竖屏上下一分为二，上半是人、下半是 B-roll/对比图，两块从两边滑进来，中缝压一行字
TEMPLATES.split_vertical = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.media) { this.off = true; return; }   // needs_assets: no B-roll / picture → render nothing
    this.media = P.media;
    this.flip = !!P.flip; // true: person at the bottom
    ctx.L.bg.style.background = 'var(--bg-a)';
    // the untouched full frame stays underneath while the two halves slide in over it from opposite sides
    this.full = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%');
    ctx.L.bg.appendChild(this.full);
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
    if (this.off) return;
    const pin = ease.out(enter(ctx.t, 0, .5)), pout = ease.inOut(enter(ctx.t, ctx.d - .45, .45));
    const k = pin * (1 - pout);
    const z = ctx.seg.zoom || 1, f = this.flip ? -1 : 1;
    setImg(this.full, ctx.baseImg.getAttribute('src'));
    this.full.style.transform = `scale(${z})`;
    this.full.style.display = k < 1 ? '' : 'none';
    // person half: source rows 330..1290 (the face) shown in one half, sliding in from the right
    const dy = this.flip ? 630 : -330;
    ctx.base.style.transform = `translateX(${(1 - k) * 1080 * f}px) translateY(${dy}px)`;
    ctx.base.style.clipPath = `inset(330px 0 630px 0)`;
    ctx.base.style.boxShadow = 'none';
    setImg(this.img, mediaSrc(this.media, ctx.t));
    this.panel.style.transform = `translateX(${lerp(-1080 * f, 0, k)}px)`;
    this.line.style.transform = `scaleX(${k})`;
    if (this.chip) {
      const q = enter(ctx.t, .45, .4);
      this.chip.style.opacity = Math.min(clamp(q * 3), 1 - pout);
      this.chip.style.transform = `scale(${ease.pop(q)})`;
    }
    if (this.tags) this.tags.forEach((e, j) => { e.style.opacity = clamp((k - .7) * 4); });
  },
};
