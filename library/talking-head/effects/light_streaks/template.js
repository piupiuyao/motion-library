// 上升光丝 · 镜头特效：念到情绪词时，几根细细的白色发光线从画面底边沿人身体两侧快速往上划到胸口/肩膀高度，划完就淡出
TEMPLATES.light_streaks = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // bursts: one per "at" word (list or single), else one per highlighted keyword, else one at the start
    let ts = [].concat(P.at != null ? P.at : []).map(at).filter(t => t != null);
    if (!ts.length) ts = ctx.groups.map(g => g.s);
    if (!ts.length) ts = [.2];
    this.ts = ts.map(t => Math.max(0, t - .1));
    this.cv = el('canvas', 'position:absolute;inset:0;width:1080px;height:1920px');
    this.cv.width = 1080; this.cv.height = 1920;
    ctx.L.front.appendChild(this.cv);
    this.g = this.cv.getContext('2d');
    const css = getComputedStyle(document.getElementById('stage'));
    this.col = P.color || css.getPropertyValue('--paper').trim() || '#fff';
    this.glow = css.getPropertyValue('--accent-2').trim() || '#fff';
    const n = P.count || 10;
    const cx = ctx.focus[0] * 1080;
    // seeded streak set (same every frame)
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    this.streaks = [];
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const x0 = cx + side * (230 + rnd() * 230);
      this.streaks.push({
        x0, top: 820 + rnd() * 360, bend: side * (60 + rnd() * 140), len: 420 + rnd() * 420,
        delay: rnd() * .3, dur: .5 + rnd() * .35, w: 3 + rnd() * 3,
      });
    }
  },
  frame(ctx) {
    const g = this.g;
    g.clearRect(0, 0, 1080, 1920);
    g.lineCap = 'round';
    for (const t0 of this.ts) {
      for (const s of this.streaks) {
        const q = (ctx.t - t0 - s.delay) / s.dur;
        if (q <= 0 || q > 1.6) continue;
        const head = ease.out(Math.min(q, 1));                     // 0 → 1 along the path
        const fade = q > 1 ? 1 - (q - 1) / .6 : 1;
        const pathY = u => lerp(1960, s.top, u);
        const pathX = u => s.x0 + s.bend * u * u;               // slight arc, curving outward near the top
        const H = 1960 - s.top, tl = s.len / H;
        const u1 = head, u0 = Math.max(0, head - tl);
        // trail: draw as segments with increasing alpha toward the head
        const N = 14;
        for (const [wMul, alpha, col] of [[7, .2, this.glow], [3, .45, this.glow], [1, 1, this.col]]) {
          g.strokeStyle = col;
          g.lineWidth = s.w * wMul;
          for (let k = 0; k < N; k++) {
            const a = lerp(u0, u1, k / N), b = lerp(u0, u1, (k + 1) / N);
            g.globalAlpha = alpha * fade * Math.pow((k + 1) / N, 1.6);
            g.beginPath(); g.moveTo(pathX(a), pathY(a)); g.lineTo(pathX(b), pathY(b)); g.stroke();
          }
        }
        // bright head
        g.globalAlpha = fade * (q < 1 ? 1 : 0);
        g.fillStyle = this.col;
        g.beginPath(); g.arc(pathX(u1), pathY(u1), s.w * 1.6, 0, Math.PI * 2); g.fill();
      }
    }
    g.globalAlpha = 1;
  },
};
