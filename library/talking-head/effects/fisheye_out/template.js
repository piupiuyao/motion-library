// 鱼眼拉远 · 转场：新画面一出来像鱼眼一样鼓起、推得很近，然后快速变平并拉远，先快后慢；结尾同样方式回到人
TEMPLATES.fisheye_out = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.t1 = P.at != null ? P.at : .8;
    this.back = P.back !== false;
    this.t2 = ctx.d - (P.backAt != null ? P.backAt : 1.1);
    this.media = P.to;
    if (!this.media) { this.off = true; return; } // material missing: render nothing
    this.fx = P.fx != null ? P.fx : 1;
    this.cv = el('canvas', 'position:absolute;inset:0;width:1080px;height:1920px;background:#000');
    this.cv.width = 540; this.cv.height = 960; // half-res drawing keeps it fast
    this.g = this.cv.getContext('2d');
    this.src = new Image();
    ctx.L.front.appendChild(this.cv);
  },
  draw(img, k, zoom, fx = .5) {
    const g = this.g, W2 = 540, H2 = 960, cx = W2 / 2, cy = H2 / 2, R = Math.hypot(cx, cy);
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw) return;
    // cover-fit the source into the canvas
    const sc = Math.max(W2 / iw, H2 / ih), ox = (W2 - iw * sc) * fx, oy = (H2 - ih * sc) / 2;
    const map = (x, y) => {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) / R;
      const m = zoom * (1 + k) / (1 + k * r * r);
      return [cx + dx * m, cy + dy * m];
    };
    g.fillStyle = '#000'; g.fillRect(0, 0, W2, H2);
    const GX = 18, GY = 32, tw = W2 / GX, th = H2 / GY;
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const x0 = i * tw, y0 = j * th, x1 = x0 + tw, y1 = y0 + th;
      const a = map(x0, y0), b = map(x1, y0), c = map(x0, y1), d = map(x1, y1);
      const dx0 = Math.min(a[0], c[0]), dx1 = Math.max(b[0], d[0]), dy0 = Math.min(a[1], b[1]), dy1 = Math.max(c[1], d[1]);
      if (dx1 < 0 || dy1 < 0 || dx0 > W2 || dy0 > H2) continue;
      g.drawImage(img, (x0 - ox) / sc, (y0 - oy) / sc, tw / sc, th / sc, dx0, dy0, dx1 - dx0 + .8, dy1 - dy0 + .8);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const inB = ctx.t >= this.t1 && (!this.back || ctx.t < this.t2);
    const inP = this.back && ctx.t >= this.t2;
    this.cv.style.display = inB || inP ? '' : 'none';
    if (!inB && !inP) return;
    ctx.base.style.opacity = 0;
    const u = inB ? ctx.t - this.t1 : ctx.t - this.t2;
    const e = 1 - Math.pow(2, -10 * clamp(u / .75)); // fast then slow
    const k = .9 * (1 - e), zoom = 1 + .7 * (1 - e);
    let img;
    if (inB) { img = this.src; setImg(img, mediaSrc(this.media, u)); }
    else img = ctx.baseImg;
    pending.push(img.decode().catch(() => {}).then(() => this.draw(img, k, zoom * (inP ? ctx.seg.zoom || 1 : 1), inP ? .5 : this.fx)));
  },
};
