// 褪色心电线 · 镜头特效：念到关键句时人身后的背景一下褪色压暗、人保持彩色带淡淡白边；一条发光心电图线在头部高度从左往右划过（在人身后，被头挡住），然后背景颜色慢慢回来
TEMPLATES.heartbeat_line = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const t = P.at != null ? at(P.at) : null;
    this.t0 = Math.max(0, t != null ? t - .1 : .2);
    this.hold = P.hold != null ? P.hold : 1.2;
    this.y = P.y || ctx.focus[1] * 1920 + 40;
    this.sweep = P.sweep || .75;
    ctx.personCv.style.filter = '';
    outline(2, 'rgba(255,255,255,.28)', false);   // faint rim light around the person
    this.cv = el('canvas', 'position:absolute;inset:0;width:1080px;height:1920px');
    this.cv.width = 1080; this.cv.height = 1920;
    ctx.L.back.appendChild(this.cv);                // between video and person → hidden behind the head
    this.g = this.cv.getContext('2d');
    const css = getComputedStyle(document.getElementById('stage'));
    this.col = P.color || '#ffffff';
    this.glow = css.getPropertyValue('--accent-2').trim() || '#fff';
    // ECG path: flat, then a P-QRS-T complex left of the head and another to the right
    const y = this.y, pts = [[-20, 0]];
    const beat = x => pts.push([x, 0], [x + 18, -14], [x + 34, 0], [x + 52, 0], [x + 62, 24], [x + 80, -190], [x + 98, 70], [x + 112, 0], [x + 140, 0], [x + 165, -26], [x + 195, 0]);
    const cx = ctx.focus[0] * 1080;
    beat(cx - 420); beat(cx + 250);
    pts.push([1100, 0]);
    this.pts = pts.map(([x, d]) => [x, y + d]);
  },
  frame(ctx) {
    const t = ctx.t - this.t0;
    // background desaturates fast, holds, then the colour slowly comes back
    const k = t < 0 ? 0 : t < this.hold ? ease.out(clamp(t / .15)) : 1 - ease.inOut(clamp((t - this.hold) / .9));
    ctx.baseImg.style.filter = `grayscale(${.85 * k}) brightness(${1 - .32 * k}) contrast(${1 + .08 * k})`;
    const g = this.g;
    g.clearRect(0, 0, 1080, 1920);
    if (t <= 0) return;
    const head = ease.inOut(clamp(t / this.sweep)) * 1120 - 20;    // x of the drawing head
    const fade = 1 - clamp((t - this.sweep - .35) / .45);
    if (fade <= 0) return;
    const tail = 700;                                            // visible trail length (px)
    g.lineJoin = 'round'; g.lineCap = 'round';
    const draw = () => {
      g.beginPath();
      let started = false;
      for (let i = 0; i < this.pts.length - 1; i++) {
        const [x1, y1] = this.pts[i], [x2, y2] = this.pts[i + 1];
        if (x2 < head - tail || x1 > head) continue;
        const a = clamp((head - tail - x1) / ((x2 - x1) || 1)), b = clamp((head - x1) / ((x2 - x1) || 1));
        const p1 = [lerp(x1, x2, a), lerp(y1, y2, a)], p2 = [lerp(x1, x2, b), lerp(y1, y2, b)];
        if (!started) { g.moveTo(p1[0], p1[1]); started = true; }
        g.lineTo(p2[0], p2[1]);
      }
      g.stroke();
    };
    const grad = g.createLinearGradient(head - tail, 0, head, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(1, 'rgba(255,255,255,1)');
    for (const [w, a, c] of [[26, .14, this.glow], [12, .3, this.glow], [5, 1, this.col]]) {
      g.globalAlpha = a * fade;
      g.strokeStyle = c; g.lineWidth = w;
      g.globalCompositeOperation = 'source-over';
      draw();
    }
    // fade the tail: knock out the old end with the gradient mask
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'destination-in';
    g.fillStyle = grad;
    g.fillRect(0, 0, 1080, 1920);
    g.globalCompositeOperation = 'source-over';
    // bright dot at the head
    if (head < 1080) {
      let hy = this.y;
      for (let i = 0; i < this.pts.length - 1; i++) { const [x1, y1] = this.pts[i], [x2, y2] = this.pts[i + 1]; if (head >= x1 && head <= x2) { hy = lerp(y1, y2, (head - x1) / ((x2 - x1) || 1)); break; } }
      g.globalAlpha = fade; g.fillStyle = '#fff';
      g.beginPath(); g.arc(head, hy, 9, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    }
  },
};
