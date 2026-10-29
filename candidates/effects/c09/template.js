// 3D投影大字 · 字体：粗窄全大写字幕，黄橙色，带厚厚的粉红色斜向 3D 投影，按她说的词一组组砸进画面下方
TEMPLATES.c09 = {
  setup(ctx) {
    const P = ctx.params;
    const per = P.per || 2;
    // chunk her words: at most `per` words, break after punctuation
    this.chunks = [];
    let cur = [];
    for (const w of ctx.words) {
      if (!w.w) continue;
      cur.push(w);
      if (cur.length >= per || /[.,!?;]$/.test(w.w)) { this.chunks.push(cur); cur = []; }
    }
    if (cur.length) this.chunks.push(cur);
    const depth = P.depth || 16, col = P.shadow || '#ff4fa3';
    const sh = Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${col}`).join(',');
    const font = '"Avenir Next Condensed","Impact",sans-serif';
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = `900 100px ${font}`;
    this.items = this.chunks.map((c, j) => {
      const txt = c.map(w => w.w.replace(/[.,!?;]/g, '')).join(' ').toUpperCase();
      // fit to ~900px wide (leaves room for the 3D shadow and the pop overshoot)
      const size = Math.min(P.size || 210, Math.floor(100 * (900 - depth) / mc.measureText(txt).width));
      const e = el('div', `position:absolute;left:0;right:0;top:${P.y || 1150}px;text-align:center;white-space:nowrap;
        font:900 ${size}px/1 ${font};letter-spacing:.01em;color:${P.color || '#ffc21a'};
        text-shadow:${sh}, ${depth + 4}px ${depth + 8}px 18px rgba(0,0,0,.35);transform-origin:50% 60%;opacity:0`, txt);
      ctx.L.front.appendChild(e);
      const nx = this.chunks[j + 1];
      return { e, s: c[0].s - .04, e2: nx ? nx[0].s - .04 : ctx.d, rot: j % 2 ? 2 : -2 };
    });
  },
  frame(ctx) {
    const out = leave(ctx, .15);
    for (const it of this.items) {
      const on = ctx.t >= it.s && ctx.t < it.e2;
      const q = clamp((ctx.t - it.s) / .13);
      it.e.style.opacity = on ? out : 0;
      it.e.style.transform = `scale(${lerp(1.7, 1, ease.out(q))}) rotate(${it.rot}deg)`;
    }
  },
};
