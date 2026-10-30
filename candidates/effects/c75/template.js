// MVP结算转场 · 转场：画面镜像并斜 -9°，蒙版放大铺满再猛地缩成卡片，抠出的人弹到前面，大字带循环扫光
TEMPLATES.c75 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const w = P.at && ctx.words.find(w => n(w.w) === n(P.at));
    this.T = w ? w.s : (P.start != null ? P.start : .3);
    ctx.L.bg.style.background = `repeating-linear-gradient(-9deg, transparent 0 60px, rgba(255,255,255,.06) 60px 64px),
      radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--accent) 70%, #000), #0c0c10 75%)`;
    ctx.personCv.style.filter = outline(9, '#fff');
    // the matte has a hole where the laptop is: let the cutout fade out at the chest, inside the card
    // fade: [from, to] height fractions; false = keep the whole cutout (footage without a laptop)
    const fade = P.fade === false ? null : (P.fade || [.64, .72]);
    if (fade) ctx.person.style.webkitMaskImage = `linear-gradient(180deg, #000 ${fade[0] * 100}%, transparent ${fade[1] * 100}%)`;
    ctx.base.style.transformOrigin = '50% 45%';
    this.txt = el('div', `position:absolute;left:0;right:0;top:${P.top || 150}px;text-align:center;font-size:${P.size || 170}px;text-transform:uppercase;
      transform-origin:50% 50%;color:transparent;-webkit-background-clip:text;background-clip:text;
      background-image:linear-gradient(105deg, var(--accent) 0 40%, #fff 47%, #fff 53%, var(--accent) 60% 100%);background-size:300% 100%;
      filter:drop-shadow(0 8px 0 rgba(0,0,0,.55))`, P.text || ''); // no text: just the card move
    this.txt.className = 'display';
    ctx.L.front.appendChild(this.txt);
  },
  frame(ctx) {
    const dt = ctx.t - this.T, z = ctx.seg.zoom || 1;
    const on = dt >= 0;
    // phase 1: mirror + tilt, the window grows to fill (0–.35 s); phase 2: snaps down to a card (.55–.75 s)
    const grow = ease.out(clamp(dt / .35)), snap = ease.back(clamp((dt - .55) / .22));
    const tilt = on ? -9 * ease.out(clamp(dt / .25)) : 0;
    const mirror = on ? -1 : 1;
    // window (fraction of the frame): starts as a card, grows past the edges, then snaps to a lower card
    // so her head pops out above its top edge
    const A = [.16, .16, .16, .16], B = [-.12, -.12, -.12, -.12], C = [.36, .1, .2, .1]; // top right bottom left insets
    const ins = A.map((v, i) => lerp(lerp(v, B[i], grow), C[i], snap) * 100);
    ctx.base.style.clipPath = on ? `inset(${ins[0]}% ${ins[1]}% ${ins[2]}% ${ins[3]}% round 36px)` : 'none';
    ctx.base.style.transform = on ? `rotate(${tilt}deg) scale(${mirror * z * 1.15}, ${z * 1.15})` : `scale(${z})`;
    ctx.baseImg.style.filter = on ? `brightness(${lerp(1, .7, snap)})` : '';
    // the cut-out person pops forward once the card has snapped
    const pp = enter(dt, .6, .4);
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.opacity = on && dt > .6 ? 1 : 0;
    ctx.person.style.transform = `scale(${z * lerp(.9, 1.05, ease.pop(pp))})`;
    const tq = enter(dt, .75, .35);
    this.txt.style.opacity = clamp(tq * 3);
    this.txt.style.transform = `rotate(-9deg) scale(${lerp(1.6, 1, ease.back(tq))})`;
    // looping sheen across the text
    this.txt.style.backgroundPosition = `${100 - ((Math.max(0, dt - .9) / 1.1) % 1) * 100}% 0`;
  },
};
