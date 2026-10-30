// 圆形人头角落 · 版式：截图/录屏铺满全屏，说话的人从全屏缩进左下角一个带描边的圆里，讲完再放大回来
TEMPLATES.c91 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.media = P.media;
    if (!this.media) { this.off = true; return; } // material missing: render nothing
    this.img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover');
    ctx.L.bg.style.background = '#111';
    ctx.L.bg.appendChild(this.img);
    const D = P.diameter || 340;
    this.D = D;
    this.c = P.center || (P.corner === 'br' ? [1080 - 60 - D / 2, 1390 - D / 2] : [60 + D / 2, 1390 - D / 2]);
    this.r = P.radius || 360;     // radius of the circle cut from the full-size video, around the face
    this.ring = el('div', `position:absolute;left:0;top:0;width:${D}px;height:${D}px;border-radius:50%;border:${P.border || 9}px solid ${P.ring || 'var(--accent)'};
      box-sizing:border-box;box-shadow:0 18px 40px rgba(0,0,0,.45)`);
    ctx.L.front.appendChild(this.ring);
    this.t0 = P.t0 != null ? P.t0 : .25;
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    const pin = ease.inOut(enter(ctx.t, this.t0, .6)), pout = ease.inOut(enter(ctx.t, ctx.d - .65, .55));
    const p = pin * (1 - pout);
    setImg(this.img, mediaSrc(this.media, Math.max(0, ctx.t - this.t0)));
    this.img.style.opacity = clamp(p * 4);
    // face centre in base-video pixels
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 60;
    const S = lerp(z, this.D / 2 / this.r, p);
    const X = lerp(540 + (fx - 540) * z, this.c[0], p), Y = lerp(960 + (fy - 960) * z, this.c[1], p);
    const R = lerp(1500, this.r, Math.pow(p, .6));
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${X - fx * S}px, ${Y - fy * S}px) scale(${S})`;
    ctx.base.style.clipPath = `circle(${R}px at ${fx}px ${fy}px)`;
    const rr = R * S;
    this.ring.style.opacity = clamp((p - .55) * 4);
    this.ring.style.transform = `translate(${X - this.D / 2}px, ${Y - this.D / 2}px) scale(${Math.min(3, rr / (this.D / 2))})`;
  },
};
