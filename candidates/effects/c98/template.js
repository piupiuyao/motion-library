// 漏光光斑叠加 · 镜头特效：黑白/低饱和画面上，一团暖橙光从角落慢慢飘过，带几个六边形光斑，四周压暗角
TEMPLATES.c98 = {
  setup(ctx) {
    const P = ctx.params;
    this.sat = P.saturation ?? .15;
    this.glow = el('div', `position:absolute;left:0;top:0;width:1800px;height:1800px;margin:-900px 0 0 -900px;border-radius:50%;mix-blend-mode:plus-lighter;
      background:radial-gradient(circle, rgba(255,236,190,1) 0%, rgba(255,170,70,.95) 12%, rgba(255,110,25,.62) 30%, rgba(230,70,0,.3) 50%, rgba(160,40,0,.1) 62%, transparent 72%)`);
    this.wash = el('div', `position:absolute;inset:0;mix-blend-mode:screen;background:linear-gradient(150deg, rgba(255,120,30,.55), rgba(255,80,0,.12) 50%, transparent 75%)`);
    this.streak = el('div', `position:absolute;left:0;top:0;width:1700px;height:26px;margin:-13px 0 0 -850px;mix-blend-mode:screen;border-radius:50%;
      background:radial-gradient(ellipse, rgba(255,230,190,.85), rgba(255,140,60,.35) 35%, transparent 70%)`);
    const hexes = [[.45, 70, .45], [.75, 150, .26], [1.15, 46, .5], [1.45, 230, .2], [1.8, 110, .32], [2.15, 64, .4]];
    this.hex = hexes.map(([k, s, a], j) => {
      const e = el('div', `position:absolute;left:0;top:0;width:${s * 2}px;height:${s * 2}px;margin:-${s}px 0 0 -${s}px;mix-blend-mode:screen;
        clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%);
        background:radial-gradient(circle, rgba(255,${180 + j * 10},${110 + j * 15},${a * .6}) 40%, rgba(255,170,90,${a}) 92%, rgba(255,230,200,${a * 1.6}) 100%)`);
      return { e, k };
    });
    this.vig = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at 50% 42%, transparent 35%, rgba(0,0,0,.85) 100%)');
    ctx.L.front.append(this.wash, this.glow, this.streak, ...this.hex.map(h => h.e), this.vig);
    ctx.baseImg.style.filter = `saturate(${this.sat}) contrast(1.12) brightness(.92)`;
  },
  frame(ctx) {
    const t = ctx.t, d = ctx.d, p = ctx.p;
    const on = Math.min(enter(t, 0, .6), leave(ctx, .4));
    // light source drifts from the top-left corner across the top of the frame
    const sx = lerp(60, 900, ease.inOut(p)), sy = lerp(160, 330, ease.inOut(p)) + Math.sin(t * 1.3) * 30;
    const breathe = .9 + .1 * Math.sin(t * 2.1);
    this.glow.style.transform = `translate(${sx}px, ${sy}px) scale(${breathe})`;
    this.glow.style.opacity = on;
    this.wash.style.opacity = on * (.7 + .3 * Math.sin(t * 1.7));
    this.streak.style.transform = `translate(${sx}px, ${sy}px)`;
    this.streak.style.opacity = on * .8;
    // ghosts lie on the line from the source through the frame centre
    const cx = 540, cy = 900;
    for (const h of this.hex) {
      const x = sx + (cx - sx) * h.k, y = sy + (cy - sy) * h.k;
      h.e.style.transform = `translate(${x}px, ${y}px) rotate(${t * 8}deg)`;
      h.e.style.opacity = on;
    }
    this.vig.style.opacity = Math.min(enter(t, 0, .4), leave(ctx, .4));
    ctx.baseImg.style.filter = `saturate(${lerp(1, this.sat, Math.min(enter(t, 0, .4), leave(ctx, .4)))}) contrast(1.12) brightness(.92)`;
  },
};
