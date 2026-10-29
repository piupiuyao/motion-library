// 文字绕人旋转 · 字体：一圈文字像腰带一样水平绕着人转，前半圈在人前面、后半圈被人身体挡住，带透视（前大后小、后面稍暗、背面镜像）
TEMPLATES.c88 = {
  setup(ctx) {
    const P = ctx.params;
    let txt = String(P.text || 'REPETITIVE • TIME-CONSUMING • ').toUpperCase();
    this.size = P.size || 74;
    this.cx = P.cx || 540; this.cy = P.y || 1080;
    this.rx = P.rx || 480; this.ry = P.ry || 80;
    this.period = P.period || 3.6;
    const mk = () => { const c = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 50%'); c.width = 1080; c.height = 1920; return c; };
    this.back = mk(); this.front = mk();
    ctx.L.back.appendChild(this.back); ctx.L.front.appendChild(this.front);
    // repeat the slogan until it fills the whole circumference
    const c = this.front.getContext('2d');
    c.font = `900 ${this.size}px "Avenir Next","Arial Black",sans-serif`;
    const circ = Math.PI * (3 * (this.rx + this.ry) - Math.sqrt((3 * this.rx + this.ry) * (this.rx + 3 * this.ry)));
    // ring width measured at front scale so letters sit snugly
    let unit = c.measureText(txt).width;
    let reps = Math.max(1, Math.round(circ / unit));
    this.chars = [...txt.repeat(reps)];
    const widths = this.chars.map(ch => c.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let acc = 0;
    this.angles = widths.map(w => { const a = (acc + w / 2) / total * Math.PI * 2; acc += w; return a; });
    this.widths = widths;
    this.color = P.color || '#ffffff';
  },
  frame(ctx) {
    const pin = ease.out(enter(ctx.t, 0, .4)), out = leave(ctx, .3);
    const k = Math.min(pin, out);
    const rot = -ctx.t / this.period * Math.PI * 2;
    for (const cv of [this.back, this.front]) {
      cv.style.transform = `scale(${ctx.seg.zoom || 1})`;
      cv.getContext('2d').clearRect(0, 0, 1080, 1920);
    }
    const cb = this.back.getContext('2d'), cf = this.front.getContext('2d');
    const rx = this.rx * lerp(.6, 1, pin);
    this.chars.forEach((ch, i) => {
      const a = this.angles[i] + rot;
      const z = Math.cos(a);              // +1 = nearest the camera, -1 = behind the person
      const x = this.cx + rx * Math.sin(a), y = this.cy + this.ry * z;
      const persp = lerp(.62, 1, (z + 1) / 2);
      const c = z >= 0 ? cf : cb;
      c.save();
      c.translate(x, y);
      c.globalAlpha = k * (z >= 0 ? 1 : lerp(.45, .8, (z + 1)));
      // letters face outward: squeezed towards the sides, mirrored on the far side
      c.scale(Math.cos(a) * persp || .001, persp);
      c.font = `900 ${this.size}px "Avenir Next","Arial Black",sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (z >= 0) { c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,.35)'; c.strokeText(ch, 0, 3); }
      c.fillStyle = z >= 0 ? this.color : '#d9d9d9';
      c.fillText(ch, 0, 0);
      c.restore();
    });
  },
};
