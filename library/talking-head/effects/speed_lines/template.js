// 漫画集中线 · 镜头特效：白色（可选黑色）放射速度线从四周冲向脸，闪 0.5–1 秒后消失，同时画面猛推一下
TEMPLATES.speed_lines = {
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
    this.cx = ctx.focus[0] * 540; this.cy = ctx.focus[1] * 960 + 25;
    this.ink = P.color === 'black' ? '#000' : '#fff';
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
    const cx = this.cx, cy = this.cy, ink = this.ink;
    // darken the edges a little so the speed lines read on any footage (clear oval stays on the face)
    const vg = g.createRadialGradient(cx, cy, 200, cx, cy, 760);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, ink === '#fff' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.75)');
    g.fillStyle = vg; g.fillRect(0, 0, 540, 960);
    g.fillStyle = ink;
    // thin wedges that start on a clear oval around the face and run off the frame edge
    const N = 150, rx = 175, ry = 215;
    for (let i = 0; i < N; i++) {
      const a = (i + rnd() * .9) / N * Math.PI * 2, w = .002 + rnd() * .011;
      const k = .95 + rnd() * .75; // how far in the line reaches (1 = oval edge)
      const x0 = cx + Math.cos(a) * rx * k, y0 = cy + Math.sin(a) * ry * k;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(cx + Math.cos(a - w) * 1300, cy + Math.sin(a - w) * 1300);
      g.lineTo(cx + Math.cos(a + w) * 1300, cy + Math.sin(a + w) * 1300);
      g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  },
};
