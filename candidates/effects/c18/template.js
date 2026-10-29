// 手绘涂鸦 · 素材：马克笔样式的箭头、波浪线、星星、圈圈一笔一笔自己画出来，围着人或指向某处
TEMPLATES.c18 = {
  setup(ctx) {
    const P = ctx.params;
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 70;
    const col = P.color || '#ffffff';
    const jit = (s, k) => Math.sin(s * 12.9898 + k * 78.233) * 43758.5453 % 1;
    // wobbly circle around the head
    const circ = (cx, cy, rx, ry) => {
      let d = '';
      for (let i = 0; i <= 44; i++) {
        const a = -2.2 + i / 40 * Math.PI * 2.1, w = 1 + jit(i, 3) * .03;
        d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rx * w).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * w).toFixed(1);
      }
      return d;
    };
    const star = (cx, cy, r) => {
      let d = '';
      for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); }
      return d;
    };
    const wave = (x, y, w) => { let d = `M${x} ${y}`; for (let i = 1; i <= 6; i++) d += ` Q${x + (i - .5) * w / 6} ${y + (i % 2 ? -26 : 26)} ${x + i * w / 6} ${y}`; return d; };
    const shapes = [
      { d: circ(fx, fy - 20, 300, 360), w: 13, t: .1, dur: .7 },
      // loop-de-loop arrow from the label down to the face, with a little burst where it lands
      { d: `M120 ${fy - 540} C 160 ${fy - 420}, 330 ${fy - 470}, 290 ${fy - 380} C 250 ${fy - 290}, 150 ${fy - 360}, 220 ${fy - 410} C 290 ${fy - 460}, ${fx - 330} ${fy - 330}, ${fx - 320} ${fy - 200}`, w: 11, t: .65, dur: .6 },
      { d: `M${fx - 375} ${fy - 245} L ${fx - 320} ${fy - 200} L ${fx - 285} ${fy - 262}`, w: 11, t: 1.2, dur: .18 },
      { d: `M${fx - 300} ${fy - 170} l 26 18 M${fx - 330} ${fy - 150} l 4 32 M${fx - 280} ${fy - 200} l 32 -2`, w: 7, t: 1.35, dur: .2 },
      // >>> chevrons
      { d: `M${fx - 300} ${fy + 300} l 40 34 l -40 34 M${fx - 240} ${fy + 300} l 40 34 l -40 34 M${fx - 180} ${fy + 300} l 40 34 l -40 34`, w: 10, t: 2.0, dur: .35 },
      { d: star(fx + 360, fy - 380, 70), w: 10, t: 1.3, dur: .45 },
      { d: star(fx + 300, fy - 520, 38), w: 8, t: 1.6, dur: .3 },
      { d: wave(fx - 60, fy + 440, 360), w: 11, t: 1.8, dur: .5 },
      { d: `M${fx + 330} ${fy + 60} l 50 -20 M${fx + 340} ${fy + 120} l 60 0 M${fx + 330} ${fy + 180} l 50 20`, w: 10, t: 2.2, dur: .3 },
    ];
    const sc = Math.max(.6, Math.min(1.2, (ctx.d - .4) / 2.6));
    this.svg = el('div', 'position:absolute;inset:0');
    this.svg.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0;overflow:visible">${shapes.map(s =>
      `<path d="${s.d}" transform="translate(0 4)" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="${s.w + 4}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/><path d="${s.d}" fill="none" stroke="${col}" stroke-width="${s.w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>`).join('')}</svg>`;
    this.paths = [...this.svg.querySelectorAll('path')].map((p, k) => ({ p, t: shapes[k >> 1].t * sc, dur: shapes[k >> 1].dur }));
    ctx.L.front.appendChild(this.svg);
    if (P.label) {
      this.label = el('div', `position:absolute;left:60px;top:${fy - 620}px;font:700 74px 'Marker Felt','Chalkboard SE',cursive;color:${col};transform:rotate(-8deg);
        text-shadow:0 4px 0 rgba(0,0,0,.35)`, P.label);
      ctx.L.front.appendChild(this.label);
    }
  },
  frame(ctx) {
    const out = leave(ctx, .3);
    for (const { p, t, dur } of this.paths) {
      const q = ease.out(enter(ctx.t, t, dur));
      p.style.strokeDashoffset = 1 - q;
      p.style.opacity = q > 0 ? out : 0;
    }
    if (this.label) {
      const q = enter(ctx.t, .5, .3);
      this.label.style.opacity = Math.min(q, out);
      this.label.style.transform = `rotate(-8deg) scale(${ease.pop(q)})`;
    }
  },
};
