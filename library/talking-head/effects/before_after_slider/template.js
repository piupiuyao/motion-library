// 前后对比滑杆 · 版式：两段画面重叠，一条白色竖线带圆形手柄从左往右扫过，线左是「之后」，线右是「之前」，上角标 BEFORE / AFTER
TEMPLATES.before_after_slider = {
  setup(ctx) {
    const P = ctx.params;
    this.before = P.before_filter || 'grayscale(.85) contrast(.82) brightness(.9)';
    this.after = P.after_filter || 'saturate(1.45) contrast(1.12) brightness(1.04)';
    this.media = P.after || null;   // optional separate "after" image / frames; default = same footage, graded
    this.wrap = el('div', 'position:absolute;inset:0;overflow:hidden');
    this.aimg = el('img', 'position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover');
    this.warm = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,150,60,.10), rgba(255,90,40,.06))');
    this.wrap.append(this.aimg, this.warm);
    this.line = el('div', 'position:absolute;top:0;left:0;width:8px;height:1920px;margin-left:-4px;background:#fff;box-shadow:0 0 14px rgba(0,0,0,.35)');
    this.knob = el('div', `position:absolute;left:0;top:${P.knob_y || 1180}px;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;background:#fff;
      box-shadow:0 8px 24px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;gap:14px`,
      '<div style="border-right:20px solid #111;border-top:14px solid transparent;border-bottom:14px solid transparent"></div><div style="border-left:20px solid #111;border-top:14px solid transparent;border-bottom:14px solid transparent"></div>');
    const tag = (txt, side) => el('div', `position:absolute;top:170px;${side}:50px;padding:12px 26px 14px;border-radius:14px;background:rgba(0,0,0,.6);color:#fff;
      font:800 46px var(--font-body);letter-spacing:.08em`, txt);
    this.tA = tag(P.after_label || 'AFTER', 'left'); this.tB = tag(P.before_label || 'BEFORE', 'right');
    ctx.L.back.append(this.wrap);
    ctx.L.front.append(this.line, this.knob, this.tA, this.tB);
  },
  frame(ctx) {
    const t = ctx.t, z = ctx.seg.zoom || 1;
    ctx.baseImg.style.filter = this.before;
    if (this.media) { setImg(this.aimg, mediaSrc(this.media, t)); this.aimg.style.transform = ''; }
    else { setImg(this.aimg, ctx.baseImg.getAttribute('src')); this.aimg.style.transform = `scale(${z})`; }
    this.aimg.style.filter = this.after;
    // sweep left -> right, then come back and rest in the middle
    const s1 = ease.inOut(enter(t, .35, 1.4)), s2 = ease.inOut(enter(t, 2.1, .7));
    const x = lerp(lerp(0, 1080, s1), 540, s2);
    this.wrap.style.clipPath = `inset(0 ${1080 - x}px 0 0)`;
    const vis = Math.min(enter(t, .1, .25), leave(ctx));
    this.line.style.transform = this.knob.style.transform = `translateX(${x}px)`;
    this.line.style.opacity = this.knob.style.opacity = vis;
    this.tA.style.opacity = Math.min(vis, clamp(x / 300));
    this.tB.style.opacity = Math.min(vis, clamp((1080 - x) / 300));
  },
};
