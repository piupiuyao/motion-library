// 霓虹涂鸦描边 · 镜头特效：发光的粉/蓝/绿手绘线沿人的轮廓逐帧抖动（沸腾线），头旁冒出小星星和爱心
TEMPLATES.c58 = {
  setup(ctx) {
    const P = ctx.params;
    this.colors = P.colors || ['#ff3fd2', '#33e6ff', '#9dff3a'];
    this.small = document.createElement('canvas'); this.small.width = 540; this.small.height = 960;
    this.sg = this.small.getContext('2d');
    this.tmp = document.createElement('canvas'); this.tmp.width = 540; this.tmp.height = 960;
    this.tg = this.tmp.getContext('2d');
    this.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.cv.width = 540; this.cv.height = 960;
    this.g = this.cv.getContext('2d');
    ctx.L.back.appendChild(this.cv);
    ctx.baseImg.style.filter = 'brightness(.5) saturate(.75)';
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const D = [['✦', -330, -330, 0], ['♥', 300, -360, 1], ['★', 360, -120, 2], ['✦', -380, -80, 1], ['♥', -250, -470, 2], ['✶', 200, -520, 0]];
    this.doodles = D.map(([ch, dx, dy, ci], k) => {
      const c = this.colors[ci];
      const e = el('div', `position:absolute;left:${fx + dx - 50}px;top:${fy + dy - 50}px;width:100px;height:100px;font:900 ${k % 2 ? 84 : 100}px/100px sans-serif;
        text-align:center;color:#fff;-webkit-text-stroke:3px ${c};text-shadow:0 0 14px ${c},0 0 28px ${c}`, ch);
      ctx.L.front.appendChild(e);
      return { e, k };
    });
  },
  frame(ctx) {
    const t = ctx.t, step = Math.floor((ctx.shot.start + t) * 10); // boil at ~10 fps
    let s = (step * 2654435761 + 7) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const appear = enter(t, 0, .4);
    const sg = this.sg, tg = this.tg, g = this.g;
    sg.clearRect(0, 0, 540, 960);
    sg.drawImage(ctx.personCv, 0, 0, 540, 960);
    g.clearRect(0, 0, 540, 960);
    const radii = [6, 12, 18];
    this.colors.forEach((c, j) => {
      const r = radii[j] * (.4 + .6 * ease.out(appear));
      const ox = (rnd() - .5) * 5, oy = (rnd() - .5) * 5;
      tg.globalCompositeOperation = 'source-over';
      tg.clearRect(0, 0, 540, 960);
      for (let a = 0; a < 12; a++) {
        const rr = r + (rnd() - .5) * 3.5, an = a * Math.PI / 6;
        tg.drawImage(this.small, ox + Math.cos(an) * rr, oy + Math.sin(an) * rr);
      }
      tg.globalCompositeOperation = 'source-in';
      tg.fillStyle = c; tg.fillRect(0, 0, 540, 960);
      tg.globalCompositeOperation = 'destination-out';
      for (let a = 0; a < 8; a++) {
        const rr = Math.max(0, r - 3.2), an = a * Math.PI / 4 + .3;
        tg.drawImage(this.small, ox + Math.cos(an) * rr, oy + Math.sin(an) * rr);
      }
      g.shadowColor = c; g.shadowBlur = 10;
      g.drawImage(this.tmp, 0, 0);
    });
    g.shadowBlur = 0;
    this.cv.style.opacity = clamp(appear * 2);
    for (const d of this.doodles) {
      const q = enter(t, .25 + d.k * .12, .3);
      const wob = Math.sin(step * 1.7 + d.k * 2) * 10;
      d.e.style.transform = `scale(${ease.pop(q) * (1 + .06 * Math.sin(step * 2.3 + d.k))}) rotate(${wob}deg)`;
      d.e.style.opacity = Math.min(clamp(q * 3), leave(ctx));
    }
  },
};
