// 身侧声波涟漪 · 素材：人身体两侧各冒出 3–4 道发光弧线，像声波一圈圈往外扩散变淡（约 1 秒一波）
TEMPLATES.side_ripples = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.y = P.y || 1720;
    this.gap = P.gap || 230;            // distance of each source point from the centre line
    this.cv = el('canvas', `position:absolute;left:0;top:${this.y - 300}px;width:1080px;height:600px`);
    this.cv.width = 1080; this.cv.height = 600;
    this.g = this.cv.getContext('2d');
    ctx.L.front.appendChild(this.cv);
    const st = getComputedStyle(document.getElementById('stage'));
    this.col = P.color || st.getPropertyValue('--accent').trim() || '#5aa9ff';
    const ats = Array.isArray(P.at) ? P.at : [P.at != null ? P.at : .1];
    this.bursts = ats.map(a => this.tAt(ctx, a, null)).filter(x => x != null).sort((a, b) => a - b);
    if (!this.bursts.length) this.bursts = [.1];
    // repeat: keep pulsing every `every` seconds after the last burst (default on)
    if (P.repeat !== false) {
      const every = P.every || 1.0;
      for (let s = this.bursts[this.bursts.length - 1] + every; s < ctx.d - .6; s += every) this.bursts.push(s);
    }
    this.n = P.rings || 4;
  },
  frame(ctx) {
    const t = ctx.t, g = this.g, cy = 300;
    g.clearRect(0, 0, 1080, 600);
    g.strokeStyle = this.col;
    g.shadowColor = this.col;
    g.shadowBlur = 18;
    for (const b of this.bursts) {
      for (let k = 0; k < this.n; k++) {
        const u = (t - b - k * .12) / .95;
        if (u <= 0 || u >= 1) continue;
        const r = 30 + ease.out(u) * 200, a = Math.pow(1 - u, 1.3) * clamp(u * 8);
        g.globalAlpha = a;
        g.lineWidth = 9 - 5 * u;
        for (const side of [-1, 1]) {
          const cx = 540 + side * this.gap, mid = side < 0 ? Math.PI : 0;
          g.beginPath();
          g.arc(cx, cy, r, mid - .85, mid + .85);
          g.stroke();
        }
      }
    }
    g.globalAlpha = 1;
    g.shadowBlur = 0;
  },
};
