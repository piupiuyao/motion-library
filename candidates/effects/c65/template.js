// 纸团展开 · 转场：一个揉皱的纸团在画面中间展开铺满屏幕，下一张图出现在展平的纸上
TEMPLATES.c65 = {
  setup(ctx) {
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : 1.0;
    this.paper = el('div', `position:absolute;inset:0;background:${pattern('paper')};transform-origin:540px 900px`);
    // irregular creases: a few conic gradients with uneven stops + ball shading
    let sd = 9; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const cone = (cx, cy) => { let a = 0, st = []; while (a < 360) { const b = Math.min(360, a + 10 + rr() * 34); const v = rr(); st.push(`rgba(${v > .5 ? '255,255,255' : '0,0,0'},${(.08 + rr() * .22).toFixed(2)}) ${a.toFixed(0)}deg ${b.toFixed(0)}deg`); a = b; } return `conic-gradient(from ${rr() * 360}deg at ${cx}% ${cy}%, ${st.join(',')})`; };
    this.cones = `${cone(48, 46)}, ${cone(53, 48)}`;
    this.facets = el('div', 'position:absolute;inset:0');
    this.paper.appendChild(this.facets);
    // the next picture printed on the paper
    const to = P.to || 'assets/docs/chat.jpg';
    this.pic = el('div', 'position:absolute;left:100px;top:420px;width:880px;mix-blend-mode:multiply;transform:rotate(-2deg)');
    const img = el('img', 'display:block;width:100%');
    img.src = url(to); pending.push(img.decode().catch(() => {}));
    this.pic.appendChild(img);
    if (P.title) {
      const t = el('div', 'margin-top:40px;text-align:center;font:700 80px "Marker Felt","Chalkboard SE",cursive;color:#222', P.title);
      this.pic.appendChild(t);
    }
    this.paper.appendChild(this.pic);
    ctx.L.front.appendChild(this.paper);
    let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    this.N = 72;
    this.noise = Array.from({ length: this.N }, (_, i) => { const a = i / this.N * Math.PI * 2; return 1 + .12 * Math.sin(3 * a + 1) + .08 * Math.sin(5 * a + 2) + .07 * (rnd() - .5); });
  },
  poly(k, r0) {
    // morph a lumpy ball (centre 540,900) into the full-screen rectangle
    const pts = [];
    for (let i = 0; i < this.N; i++) {
      const a = i / this.N * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const r = r0 * this.noise[i];
      const bx = 540 + c * r, by = 900 + s * r;
      // point on the (oversized) frame rectangle in the same direction
      const sc = Math.min(Math.abs(700 / (c || 1e-6)), Math.abs(1150 / (s || 1e-6)));
      const rx = 540 + c * sc, ry = 900 + s * sc;
      pts.push(`${lerp(bx, rx, k).toFixed(1)}px ${lerp(by, ry, k).toFixed(1)}px`);
    }
    return `polygon(${pts.join(',')})`;
  },
  frame(ctx) {
    const t0 = this.t0, on = ctx.t >= t0;
    this.paper.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    const pop = ease.back(enter(ctx.t, t0, .25));           // ball lands
    const k = ease.inOut(enter(ctx.t, t0 + .3, .75));       // unfolds
    this.paper.style.clipPath = this.poly(k, 150 * pop);
    this.paper.style.transform = `rotate(${(1 - k) * 160}deg)`;
    const R = Math.max(1, lerp(150 * pop, 1200, k));
    this.facets.style.background = `radial-gradient(circle at 520px 880px, rgba(255,255,255,.3), rgba(0,0,0,.05) ${R * .45}px, rgba(0,0,0,.42) ${R * 1.1}px), ${this.cones}`;
    this.facets.style.opacity = Math.pow(1 - k, 1.5);
    const q = enter(ctx.t, t0 + 1.05, .45);
    this.pic.style.opacity = q;
    this.pic.style.transform = `rotate(-2deg) scale(${lerp(.96, 1, ease.out(q))})`;
  },
};
