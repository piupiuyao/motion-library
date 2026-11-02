// 声波光带 · 素材：字幕正下方横贯全屏一条细长发光声波线，中间振幅大、两端渐细成直线，跟着说话起伏
TEMPLATES.voice_wave = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.y = P.y || 1640;
    this.cv = el('canvas', `position:absolute;left:0;top:${this.y - 150}px;width:1080px;height:300px`);
    this.cv.width = 1080; this.cv.height = 300;
    this.g = this.cv.getContext('2d');
    ctx.L.front.appendChild(this.cv);
    const st = getComputedStyle(document.getElementById('stage'));
    this.col = P.color || st.getPropertyValue('--accent').trim() || '#5aa9ff';
    this.t0 = this.tAt(ctx, P.at, .05);
    this.t1 = this.tAt(ctx, P.until, ctx.d);
    this.amp = P.amp || 1;
  },
  // speaking level 0..1 from word timings (no audio in the renderer)
  level(ctx, t) {
    let v = 0;
    for (const w of ctx.words) {
      if (!w.w) continue;
      const a = clamp((t - (w.s - .05)) / .07), b = 1 - clamp((t - (w.e + .02)) / .14);
      v = Math.max(v, Math.min(a, b) * (.75 + .25 * Math.sin(w.s * 17.3)));
    }
    return v;
  },
  frame(ctx) {
    const t = ctx.t, g = this.g, W = 1080, cy = 150;
    g.clearRect(0, 0, W, 300);
    const vis = Math.min(clamp((t - this.t0) / .25), 1 - clamp((t - (this.t1 - .25)) / .25), leave(ctx, .2));
    if (vis <= 0) return;
    const spread = ease.out(clamp((t - this.t0) / .35));
    const lv = .14 + .86 * this.level(ctx, t);
    const A = 95 * lv * this.amp;
    const pts = [];
    for (let x = 0; x <= W; x += 3) {
      const u = (x - W / 2) / (W * .26 * spread + 1);
      const env = Math.exp(-u * u);
      const y = env * A * (.55 * Math.sin(x * .19 + t * 29) + .3 * Math.sin(x * .47 - t * 41) + .35 * Math.sin(x * .061 + t * 11))
        * (.7 + .3 * Math.sin(x * .013 - t * 5));
      pts.push([x, Math.abs(y)]);
    }
    g.globalAlpha = vis;
    // soft mirrored body
    g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x, cy - y) : g.moveTo(x, cy - y));
    for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], cy + pts[i][1]);
    g.closePath();
    g.fillStyle = this.col;
    g.globalAlpha = vis * .38;
    g.shadowColor = this.col; g.shadowBlur = 24;
    g.fill();
    // bright edges + centre line
    g.globalAlpha = vis;
    g.lineWidth = 3;
    g.strokeStyle = this.col;
    for (const sgn of [-1, 1]) {
      g.beginPath();
      pts.forEach(([x, y], i) => i ? g.lineTo(x, cy + sgn * y) : g.moveTo(x, cy + sgn * y));
      g.stroke();
    }
    g.shadowBlur = 10;
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255,255,255,.85)';
    g.beginPath(); g.moveTo(0, cy); g.lineTo(W, cy); g.stroke();
    g.shadowBlur = 0;
  },
};
