// 聚光灯 · 镜头特效：画面压到接近全黑，一束柔和的圆形光从上方打在人身上，像舞台
TEMPLATES.c55 = {
  setup(ctx) {
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 140;
    this.fx = fx; this.fy = fy;
    this.dark = el('div', 'position:absolute;inset:0;opacity:0');
    // the beam: drawn once on a half-res canvas, stacked translucent cones = soft edges, fades out toward the pool
    const cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;mix-blend-mode:screen');
    cv.width = 540; cv.height = 960;
    const g = cv.getContext('2d'), x = fx / 2, top = -10, bot = (fy + 380) / 2;
    const grad = g.createLinearGradient(0, top, 0, bot);
    grad.addColorStop(0, 'rgba(255,240,205,.16)'); grad.addColorStop(.6, 'rgba(255,240,205,.07)'); grad.addColorStop(1, 'rgba(255,240,205,0)');
    g.fillStyle = grad;
    for (let k = 0; k < 7; k++) {
      const w0 = 30 + k * 8, w1 = 170 + k * 26;
      g.beginPath(); g.moveTo(x - w0, top); g.lineTo(x + w0, top); g.lineTo(x + w1, bot); g.lineTo(x - w1, bot); g.closePath(); g.fill();
    }
    this.beam = cv;
    ctx.L.front.append(this.dark, this.beam);
    ctx.base.style.transformOrigin = `${ctx.focus[0] * 100}% ${ctx.focus[1] * 100}%`;
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, .1, .7));
    const R = lerp(1100, ctx.params.radius || 420, p);
    // pool of light: warm, slightly brighter centre, soft falloff to near-black
    this.dark.style.background = `radial-gradient(ellipse ${R}px ${R * 1.2}px at ${this.fx}px ${this.fy}px,
      rgba(255,230,180,.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 75%, rgba(0,0,0,.94) 100%)`;
    this.dark.style.opacity = p;
    this.beam.style.opacity = p;
    ctx.baseImg.style.filter = `saturate(${1 - .15 * p}) contrast(${1 + .1 * p})`;
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * (1 + .04 * p)})`;
  },
};
