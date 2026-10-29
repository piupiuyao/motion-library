// 跟踪引线标签 · 镜头特效：头旁一个小圆点，拉出一条先斜后平的白线，线上文字擦出来带下划线，整组跟着人移动
TEMPLATES.c96 = {
  // head position for the CURRENT frame, read from the person matte (maskCv, filled by cutout() before frame()).
  // Coarse 54x96 grid -> cheap; pure function of the frame. Returns screen px (base zoom applied).
  head(ctx) {
    const gw = 54, gh = 96, c = this.hc;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, gw, gh);
    let top = -1, sx = 0, n = 0;
    try {
      g.drawImage(maskCv, 0, 0, gw, gh);
      const d = g.getImageData(0, 0, gw, gh).data;
      for (let y = 0; y < gh && top < 0; y++) {
        let k = 0;
        for (let x = 0; x < gw; x++) if (d[(y * gw + x) * 4 + 3] > 110) k++;
        if (k >= 3) top = y;
      }
      if (top >= 0) for (let y = top; y < Math.min(gh, top + 9); y++)
        for (let x = 0; x < gw; x++) if (d[(y * gw + x) * 4 + 3] > 110) { sx += x; n++; }
    } catch (e) { top = -1; }
    let hx, ht;
    if (top < 0 || !n) { hx = ctx.focus[0] * W; ht = ctx.focus[1] * H - 300; }
    else { hx = (sx / n + .5) * (W / gw); ht = top * (H / gh); }
    const z = ctx.seg.zoom || 1;
    return { x: 540 + (hx - 540) * z, top: 960 + (ht - 960) * z, z };
  },
  setup(ctx) {
    const P = ctx.params;
    this.hc = document.createElement('canvas'); this.hc.width = 54; this.hc.height = 96;
    this.side = P.side || 'left';
    this.svg = el('div', 'position:absolute;inset:0');
    this.svg.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0;overflow:visible;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))">
      <polyline fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle r="13" fill="#fff"/><circle r="26" fill="none" stroke="#fff" stroke-width="4"/></svg>`;
    [this.line, this.dot, this.ring] = this.svg.querySelectorAll('polyline,circle');
    this.title = el('div', `position:absolute;left:0;top:0;white-space:nowrap;color:#fff;font:800 64px/1 var(--font-display);letter-spacing:.02em;
      text-shadow:0 2px 6px rgba(0,0,0,.6)`, P.text || 'MONICA');
    this.sub = el('div', `position:absolute;left:0;top:0;white-space:nowrap;color:#fff;font:600 36px/1 var(--font-body);letter-spacing:.06em;
      text-shadow:0 2px 6px rgba(0,0,0,.6)`, P.sub || 'host · creator');
    ctx.L.front.append(this.svg, this.title, this.sub);
  },
  frame(ctx) {
    const h = this.head(ctx);
    const L = this.side === 'left' ? -1 : 1;
    const ax = h.x + L * (ctx.params.ax ?? 165) * h.z, ay = h.top + (ctx.params.ay ?? 250) * h.z;     // the dot
    const bx = ax + L * 120, by = ay - 150;                           // end of the slanted part
    const len = ctx.params.len || 300;
    const cx = bx + L * len;                                          // end of the flat part
    const tDot = enter(ctx.t, .1, .25), tLine = enter(ctx.t, .3, .4), tText = enter(ctx.t, .65, .45), out = leave(ctx);
    // draw-on: walk along the polyline by length
    const s1 = Math.hypot(bx - ax, by - ay), tot = s1 + len, dl = ease.out(tLine) * tot;
    const pts = [[ax, ay]];
    if (dl <= s1) pts.push([lerp(ax, bx, dl / s1), lerp(ay, by, dl / s1)]);
    else pts.push([bx, by], [bx + L * (dl - s1), by]);
    this.line.setAttribute('points', pts.map(p => p.join(',')).join(' '));
    this.line.style.opacity = tLine > 0 ? 1 : 0;
    this.dot.setAttribute('cx', ax); this.dot.setAttribute('cy', ay);
    this.ring.setAttribute('cx', ax); this.ring.setAttribute('cy', ay);
    this.dot.setAttribute('r', 13 * ease.pop(tDot));
    this.ring.setAttribute('r', 18 + 10 * ease.out(tDot) + 4 * Math.sin(ctx.t * 6));
    this.svg.style.opacity = out;
    // text sits on the flat part (the line is its underline), wiped in along the line direction
    const x0 = Math.min(bx, cx) + 8, w = len - 16;
    for (const [e, top, al] of [[this.title, by - 78, 0], [this.sub, by + 18, 1]]) {
      e.style.left = (L > 0 ? x0 + 6 : x0) + 'px'; e.style.top = top + 'px';
      e.style.width = w + 'px'; e.style.textAlign = L > 0 ? 'left' : 'right';
      const q = ease.out(clamp((ctx.t - .65 - al * .15) / .45)) * 100;
      e.style.clipPath = L > 0 ? `inset(-20px ${100 - q}% -20px 0)` : `inset(-20px 0 -20px ${100 - q}%)`;
      e.style.opacity = out;
    }
  },
};
