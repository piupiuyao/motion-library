// 半调网点 · 镜头特效：背景变成报纸/漫画印刷网点（暗处点大、亮处点小），人保持原样；重音时整屏网点闪一下并抖动
TEMPLATES.c97 = {
  setup(ctx) {
    const P = ctx.params;
    this.cell = P.cell || 18;
    this.cols = Math.ceil(W / this.cell) + 1; this.rows = Math.ceil(H / this.cell) + 1;
    this.sm = document.createElement('canvas'); this.sm.width = this.cols; this.sm.height = this.rows;
    this.sg = this.sm.getContext('2d', { willReadFrequently: true });
    this.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.cv.width = W; this.cv.height = H;
    this.g = this.cv.getContext('2d');
    this.paper = P.paper || '#f2e8d2'; this.ink = P.ink || '#1a1a1a';
    // optional big word behind the person (like a watermark title)
    this.word = el('div', `position:absolute;left:0;right:0;top:${P.word_y || 250}px;text-align:center;color:var(--accent);
      font-size:${P.word_size || 230}px;-webkit-text-stroke:8px ${this.ink};paint-order:stroke fill;text-transform:uppercase;white-space:nowrap`, P.word || '');
    this.word.className = 'display';
    ctx.L.back.append(this.cv, this.word);
    // hit times: params.at (words) or highlight phrases
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    const at = [].concat(P.at || []);
    this.hits = at.length ? at.map(a => (ctx.words.find(w => n(w.w) === n(a)) || {}).s).filter(x => x != null)
      : ctx.groups.map(g => g.s);
  },
  draw(ctx) {
    const t = ctx.t, z = ctx.seg.zoom || 1, c = this.cell;
    // flash envelope: full-screen halftone over the person for ~0.3 s at each hit
    let hit = 0, since = 9;
    for (const h of this.hits) if (t >= h - .03 && t < h + .3) { hit = 1; since = t - h; }
    // sample the (zoomed) video frame on the dot grid
    const sw = W / z, sh = H / z;
    this.sg.drawImage(ctx.baseImg, (W - sw) / 2, (H - sh) / 2, sw, sh, 0, 0, this.cols, this.rows);
    const d = this.sg.getImageData(0, 0, this.cols, this.rows).data;
    const g = this.g;
    g.fillStyle = hit ? (getComputedStyle(ctx.L.back).getPropertyValue('--accent').trim() || '#c6f432') : this.paper;
    g.fillRect(0, 0, W, H);
    g.fillStyle = this.ink;
    g.beginPath();
    for (let y = 0; y < this.rows; y++) {
      const off = (y % 2) * c / 2;
      for (let x = 0; x < this.cols; x++) {
        const i = (y * this.cols + x) * 4;
        const lum = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
        const r = c * .62 * Math.sqrt(clamp(1.08 - lum * 1.1));
        if (r < .7) continue;
        const px = x * c + off, py = y * c;
        g.moveTo(px + r, py); g.arc(px, py, r, 0, Math.PI * 2);
      }
    }
    g.fill();
    // shake on hits (seeded by frame number)
    const fr = Math.round((ctx.shot.start + t) * 30);
    const j = hit ? (1 - since / .3) * 14 : 0;
    const sx = Math.sin(fr * 12.9898) * j, sy = Math.cos(fr * 78.233) * j;
    this.cv.style.transform = `translate(${sx}px, ${sy}px)`;
    this.cv.style.opacity = Math.min(enter(t, 0, .2), leave(ctx)) || 0;
    ctx.person.style.opacity = hit ? 0 : 1;   // person turns to dots too during the flash
    const wq = enter(t, .15, .4);
    this.word.style.opacity = hit ? 0 : Math.min(wq, leave(ctx));
    this.word.style.transform = `translateY(${lerp(60, 0, ease.out(wq))}px)`;
    if (hit) ctx.person.style.transform = `translate(${sx}px, ${sy}px) scale(${z})`;
  },
  frame(ctx) {
    // the base frame may still be decoding when frame() runs (stills jump around): draw once it is ready
    const img = ctx.baseImg, go = () => this.draw(ctx);
    if (img.complete && img.naturalWidth) go(); else pending.push(img.decode().then(go, go));
  },
};
