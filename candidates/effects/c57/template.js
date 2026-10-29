// 漫画集中线 · 镜头特效：黑白放射速度线从四周冲向脸，闪 0.5–1 秒后消失，同时画面猛推一下
TEMPLATES.c57 = {
  hit(ctx, a, def) {
    const n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const w = a != null && ctx.words.find(w => n(w.w) === n(a));
    return w ? w.s : ctx.groups[0] ? ctx.groups[0].s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.T = this.hit(ctx, P.at, ctx.d * .35);
    this.D = P.dur || .9;
    this.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.cv.width = 540; this.cv.height = 960;
    this.g = this.cv.getContext('2d');
    ctx.L.front.appendChild(this.cv);
    this.cx = ctx.focus[0] * 540; this.cy = ctx.focus[1] * 960 + 20;
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100}%`;
  },
  frame(ctx) {
    const g = this.g, dt = ctx.t - this.T, z = ctx.seg.zoom || 1;
    g.clearRect(0, 0, 540, 960);
    const on = dt >= 0 && dt < this.D;
    const punch = on ? 1 + .14 * (1 - ease.inOut(clamp((dt - this.D * .6) / (this.D * .4)))) * ease.out(clamp(dt / .1)) : 1;
    ctx.base.style.transform = `scale(${z * punch})`;
    if (!on) return;
    // reseed every 2 frames so the lines flicker like hand-drawn manga frames
    let s = (Math.floor((ctx.shot.start + ctx.t) * 15) * 2654435761) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const fade = Math.min(clamp(dt / .06), clamp((this.D - dt) / .15));
    g.globalAlpha = fade;
    // white wash at the very edges so the black lines read on any footage
    const wash = g.createRadialGradient(this.cx, this.cy, 230, this.cx, this.cy, 720);
    wash.addColorStop(0, 'rgba(255,255,255,0)'); wash.addColorStop(1, 'rgba(255,255,255,.85)');
    g.fillStyle = wash; g.fillRect(0, 0, 540, 960);
    g.fillStyle = '#000';
    const N = 110;
    for (let i = 0; i < N; i++) {
      const a = (i + rnd() * .8) / N * Math.PI * 2, w = .006 + rnd() * .018;
      const r0 = 170 + rnd() * 130, r1 = 1200;
      g.beginPath();
      g.moveTo(this.cx + Math.cos(a) * r0, this.cy + Math.sin(a) * r0);
      g.lineTo(this.cx + Math.cos(a - w) * r1, this.cy + Math.sin(a - w) * r1);
      g.lineTo(this.cx + Math.cos(a + w) * r1, this.cy + Math.sin(a + w) * r1);
      g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  },
};
