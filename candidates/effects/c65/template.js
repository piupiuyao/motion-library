// 纸团展开 · 转场：一个揉皱的小纸团弹出来，在画面中间快速展开铺满屏幕，展平的纸上还留着折痕，下一张图印在纸上
TEMPLATES.c65 = {
  setup(ctx) {
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : 1.0;
    this.box = el('div', 'position:absolute;inset:0');
    // paper drawn as a jittered triangle mesh on a half-res canvas: crumpled = many small facets with strong
    // random shading squeezed into a ball; flat = the same facets spread over the screen with faint shading (creases)
    this.cv = el('canvas', 'position:absolute;inset:0;width:1080px;height:1920px');
    this.cv.width = 540; this.cv.height = 960;
    this.g = this.cv.getContext('2d');
    this.box.appendChild(this.cv);
    // no image: the unfolded paper only carries the handwritten title (or stays blank)
    this.pic = el('div', `position:absolute;left:90px;top:${P.to ? 400 : 760}px;width:900px;mix-blend-mode:multiply;transform:rotate(-2deg)`);
    if (P.to) {
      const img = el('img', 'display:block;width:100%');
      img.src = url(P.to); pending.push(img.decode().catch(() => {}));
      this.pic.appendChild(img);
    }
    if (P.title) this.pic.appendChild(el('div', 'margin-top:40px;text-align:center;font:700 80px "Marker Felt","Chalkboard SE",cursive;color:#222', P.title));
    this.box.appendChild(this.pic);
    ctx.L.front.appendChild(this.box);
    let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const GX = 13, GY = 22, X0 = -40, Y0 = -40, X1 = 580, Y1 = 1000; // flat sheet a bit larger than the canvas
    this.cx = 270; this.cy = 470;
    this.V = [];
    for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) {
      const inner = i > 0 && i < GX && j > 0 && j < GY;
      const fx = X0 + (X1 - X0) * i / GX + (inner ? (rnd() - .5) * .7 * (X1 - X0) / GX : 0);
      const fy = Y0 + (Y1 - Y0) * j / GY + (inner ? (rnd() - .5) * .7 * (Y1 - Y0) / GY : 0);
      // ball position: square -> disc, plus lumpy jitter
      const u = (i / GX) * 2 - 1, v = (j / GY) * 2 - 1;
      const du = u * Math.sqrt(1 - v * v / 2), dv = v * Math.sqrt(1 - u * u / 2);
      const lump = 1 + (rnd() - .5) * .22;
      this.V.push({ fx, fy, bx: du * lump + (rnd() - .5) * .2, by: dv * lump + (rnd() - .5) * .2 });
    }
    this.T = [];
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const a = j * (GX + 1) + i, b = a + 1, c = a + GX + 1, d = c + 1;
      const tri = rnd() > .5 ? [[a, b, d], [a, d, c]] : [[a, b, c], [b, d, c]];
      for (const t of tri) this.T.push({ v: t, s: rnd() - .5, o: rnd() });
    }
    this.T.sort((p, q) => p.o - q.o); // random stacking order makes the ball look folded over itself
  },
  frame(ctx) {
    const t0 = this.t0, on = ctx.t >= t0;
    this.box.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    const pop = ease.back(enter(ctx.t, t0, .28));          // ball pops in
    const k = ease.inOut(enter(ctx.t, t0 + .4, .6));       // unfolds
    const R = 95 * pop, rot = (1 - k) * 2.4 + (1 - pop) * 1.5, cs = Math.cos(rot), sn = Math.sin(rot);
    const g = this.g, cx = this.cx, cy = this.cy;
    const P = this.V.map(p => {
      let x = p.bx * R, y = p.by * R;
      [x, y] = [x * cs - y * sn, x * sn + y * cs];
      return [lerp(cx + x, p.fx, k), lerp(cy + y, p.fy, k)];
    });
    g.clearRect(0, 0, 540, 960);
    const contrast = lerp(.6, .035, k);
    g.lineJoin = 'round';
    if (k < .6) { // soft shadow under the ball (drawn in canvas: no CSS filter on a full-frame layer)
      const sr = R * 1.5 + 1, gr = g.createRadialGradient(cx + 8, cy + 18, 0, cx + 8, cy + 18, sr);
      gr.addColorStop(0, `rgba(0,0,0,${.4 * (1 - k / .6)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(cx + 8 - sr, cy + 18 - sr, sr * 2, sr * 2);
    }
    for (const t of this.T) {
      const [a, b, c] = t.v.map(i => P[i]);
      const l = clamp(.9 + t.s * contrast * 2 - (1 - k) * .06, .35, 1);
      const col = `rgb(${Math.round(244 * l)},${Math.round(241 * l)},${Math.round(233 * l)})`;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath();
      g.fillStyle = col; g.fill();
      g.strokeStyle = col; g.lineWidth = .8; g.stroke(); // hide seams between facets
    }
    const q = enter(ctx.t, t0 + .85, .35);
    this.pic.style.opacity = q;
    this.pic.style.transform = `rotate(-2deg) scale(${lerp(.94, 1, ease.out(q))})`;
  },
};
