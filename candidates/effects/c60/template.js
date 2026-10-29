// 手势控制缩放 · 镜头特效：抠出来的人放在图案背景上，做捏合/张开手势时身体跟着缩小/放大，旁边两个「触摸点」演示手势
// 没有手部识别：手的位置和时间点靠参数（steps 里的 at 和 hand）手动对准
TEMPLATES.c60 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    ctx.L.bg.style.background = pattern(P.background || 'dots');
    ctx.base.style.opacity = 0;
    ctx.personCv.style.filter = outline(7, '#fff');
    // the matte has a hole where the laptop is: fade the cutout out above it so it reads as a clean bust
    const fade = P.fade || [.64, .73];
    ctx.person.style.webkitMaskImage = `linear-gradient(180deg, #000 ${fade[0] * 100}%, transparent ${fade[1] * 100}%)`;
    const steps = P.steps || [{ at: null, scale: .72 }, { at: null, scale: 1.25 }];
    this.steps = steps.map((st, k) => ({
      scale: st.scale,
      hand: st.hand || [800, 1050],
      t: (st.at != null && (ctx.words.find(w => n(w.w) === n(st.at)) || {}).s) || ctx.d * (k + 1) / (steps.length + 1),
    }));
    // two touch points (like a pinch/spread gesture on a phone screen) joined by a thin line
    this.g = el('div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:0');
    const dot = 'position:absolute;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;background:rgba(255,255,255,.35);border:6px solid #fff;box-sizing:border-box;box-shadow:0 0 0 10px rgba(255,255,255,.15),0 8px 20px rgba(0,0,0,.35)';
    this.d1 = el('div', dot); this.d2 = el('div', dot);
    this.ln = el('div', 'position:absolute;height:6px;margin-top:-3px;background:rgba(255,255,255,.7);transform-origin:0 50%;border-radius:3px');
    this.g.append(this.ln, this.d1, this.d2);
    ctx.L.front.appendChild(this.g);
  },
  frame(ctx) {
    let s = 1, k = -1;
    for (let i = 0; i < this.steps.length; i++) {
      const st = this.steps[i], p = ease.out(enter(ctx.t, st.t, .5));
      s = lerp(s, st.scale, p);
      if (ctx.t >= st.t - .45) k = i;
    }
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${s})`;
    // gesture: appears just before the change, fingers move apart (grow) or together (shrink) while the body scales
    if (k < 0) { this.g.style.opacity = 0; return; }
    const st = this.steps[k], prev = k ? this.steps[k - 1].scale : 1, grow = st.scale > prev;
    const lt = ctx.t - st.t, g = ease.inOut(clamp((lt + .1) / .55));
    const vis = clamp((lt + .45) / .15) * clamp(1 - (lt - .7) / .2);
    // hand position follows the body as it scales (scaled about bottom centre)
    const hx = 540 + (st.hand[0] - 540) * s, hy = 1920 + (st.hand[1] - 1920) * s;
    const gap = grow ? lerp(40, 150, g) : lerp(150, 40, g), ang = -.8;
    const ax = hx - Math.cos(ang) * gap, ay = hy - Math.sin(ang) * gap, bx = hx + Math.cos(ang) * gap, by = hy + Math.sin(ang) * gap;
    this.g.style.opacity = vis;
    this.d1.style.left = ax + 'px'; this.d1.style.top = ay + 'px';
    this.d2.style.left = bx + 'px'; this.d2.style.top = by + 'px';
    Object.assign(this.ln.style, { left: ax + 'px', top: ay + 'px', width: 2 * gap + 'px', transform: `rotate(${ang}rad)` });
  },
};
