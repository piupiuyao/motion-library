// 霓虹涂鸦描边 · 镜头特效：发光的粉/蓝/绿手绘线沿人的轮廓逐帧抖动（沸腾线），头旁冒出小星星和爱心
TEMPLATES.c58 = {
  setup(ctx) {
    const P = ctx.params;
    this.colors = P.colors || ['#ff3fd2', '#33e6ff', '#9dff3a'];
    // tiny copy of the cutout, used to find the silhouette edge by casting rays from the chest
    this.small = document.createElement('canvas'); this.small.width = 135; this.small.height = 240;
    this.sg = this.small.getContext('2d', { willReadFrequently: true });
    this.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.cv.width = 540; this.cv.height = 960;
    this.g = this.cv.getContext('2d');
    ctx.L.back.appendChild(this.cv);
    ctx.baseImg.style.filter = 'brightness(.5) saturate(.75)';
    this.cx = ctx.focus[0] * 135; this.cy = .6 * 240;
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
  // outermost person pixel along N rays from the chest; rays that leave the frame at the bottom are pushed off-screen
  contour() {
    const N = 140, sg = this.sg, d = (sg.clearRect(0, 0, 135, 240), sg.drawImage(this.personCv, 0, 0, 135, 240), sg.getImageData(0, 0, 135, 240).data);
    const r = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      let last = 0, edge = false;
      for (let k = 1; k < 260; k++) {
        const x = Math.round(this.cx + ca * k), y = Math.round(this.cy + sa * k);
        if (x < 0 || x >= 135 || y < 0 || y >= 240) { edge = last === k - 1; break; }
        if (d[(y * 135 + x) * 4 + 3] > 110) last = k;
      }
      r.push(edge ? 400 : last);
    }
    // smooth twice so the line follows the shape, not the matte noise
    for (let pass = 0; pass < 2; pass++) {
      const c = r.slice();
      for (let i = 0; i < N; i++) if (c[i] < 400) {
        const nb = [c[(i + N - 1) % N], c[i], c[(i + 1) % N]].filter(v => v < 400);
        r[i] = nb.reduce((x, y) => x + y, 0) / nb.length;
      }
    }
    return r;
  },
  frame(ctx) {
    const t = ctx.t, step = Math.floor((ctx.shot.start + t) * 10); // boil at ~10 fps
    let s = (step * 2654435761 + 7) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const appear = enter(t, 0, .4);
    this.personCv = ctx.personCv;
    const r = this.contour(), N = r.length, g = this.g;
    g.clearRect(0, 0, 540, 960);
    g.lineCap = g.lineJoin = 'round';
    const draw = ease.out(appear);
    this.colors.forEach((c, j) => {
      const off = 7 + j * 9; // px (half-res) outside the silhouette
      // hand-drawn wobble: a few random sine waves around the loop, re-rolled every boil step
      const w = [1, 2, 3].map(() => ({ f: 3 + Math.floor(rnd() * 9), ph: rnd() * 6.28, a: 1.5 + rnd() * 3 }));
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const k = (i + Math.round(N * .75)) % N, a = k / N * Math.PI * 2; // start at the top of the head
        let rr = r[k] >= 400 ? 520 : r[k] * 4 + off + w.reduce((x, q) => x + q.a * Math.sin(q.f * a + q.ph), 0);
        pts.push([this.cx * 4 + Math.cos(a) * rr, this.cy * 4 + Math.sin(a) * rr]);
      }
      // the line draws on during the first 0.4 s
      const upto = Math.max(2, Math.floor(pts.length * draw));
      const path = () => {
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < upto - 1; i++) {
          const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
          g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
        }
      };
      path(); g.strokeStyle = c; g.lineWidth = 5; g.shadowColor = c; g.shadowBlur = 14; g.stroke();
      g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6; g.stroke(); // hot white core
    });
    this.cv.style.opacity = 1;
    for (const d of this.doodles) {
      const q = enter(t, .25 + d.k * .12, .3);
      const wob = Math.sin(step * 1.7 + d.k * 2) * 10;
      d.e.style.transform = `scale(${ease.pop(q) * (1 + .06 * Math.sin(step * 2.3 + d.k))}) rotate(${wob}deg)`;
      d.e.style.opacity = Math.min(clamp(q * 3), leave(ctx));
    }
  },
};
