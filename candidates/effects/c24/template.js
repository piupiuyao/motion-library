// 头顶光环 · 素材：一个手绘光环出现并漂在人头顶上，跟着头动（后半圈在头后、前半圈在头前）
TEMPLATES.c24 = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    const col = P.color || '#ffd84a';
    // hand-drawn ellipse: two slightly different loops
    const loop = (k, ry) => {
      let d = '';
      for (let i = 0; i <= 52; i++) {
        const a = i / 48 * Math.PI * 2 + k, r = 1 + Math.sin(i * 2.3 + k * 5) * .025;
        d += (i ? 'L' : 'M') + (Math.cos(a) * 190 * r).toFixed(1) + ' ' + (Math.sin(a) * ry * r).toFixed(1);
      }
      return d;
    };
    const mk = clip => {
      const w = el('div', 'position:absolute;left:0;top:0;width:500px;height:240px;margin:-120px 0 0 -250px');
      w.innerHTML = `<svg width="500" height="240" viewBox="-250 -120 500 240" style="overflow:visible">
        <defs><clipPath id="hc${clip}"><rect x="-260" y="${clip === 'b' ? -130 : 0}" width="520" height="130"/></clipPath></defs>
        <g clip-path="url(#hc${clip})">
          <path class="ln" d="${loop(0, 46)}" fill="none" stroke="${col}" stroke-opacity=".16" stroke-width="64" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
          <path class="ln" d="${loop(0, 46)}" fill="none" stroke="${col}" stroke-opacity=".32" stroke-width="34" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
          <path class="ln" d="${loop(0, 46)}" fill="none" stroke="${col}" stroke-width="15" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
          <path class="ln" d="${loop(0, 46)}" fill="none" stroke="#fff8d8" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
        </g></svg>`;
      return w;
    };
    this.back = mk('b'); this.front = mk('f');
    ctx.L.back.appendChild(this.back); ctx.L.front.appendChild(this.front);
    this.glow = el('div', `position:absolute;left:0;top:0;width:700px;height:700px;margin:-350px 0 0 -350px;border-radius:50%;
      background:radial-gradient(circle, rgba(255,230,140,.38), transparent 62%)`);
    ctx.L.back.insertBefore(this.glow, this.back);
    this.lines = [...this.back.querySelectorAll('.ln'), ...this.front.querySelectorAll('.ln')];
    this.sparks = [0, 1, 2, 3, 4].map(k => {
      const s = el('div', `position:absolute;left:0;top:0;font-size:${36 + k * 6}px;color:#fff6c8;text-shadow:0 0 12px ${col}`, '✦');
      ctx.L.front.appendChild(s); return s;
    });
    this.t0 = this.at(ctx, P.at, .2);
    this.fallback = [ctx.focus[0] * 1080, ctx.focus[1] * 1920 - 330];
  },
  // find the top of the head in the cut-out (sampled, cheap) and map to screen through the jump-cut zoom
  head(ctx) {
    const cv = ctx.personCv, c = cv.getContext('2d', { willReadFrequently: true });
    const d = c.getImageData(0, 0, 1080, 1100).data;
    let top = -1;
    for (let y = 0; y < 1100 && top < 0; y += 6)
      for (let x = 200; x < 880; x += 10) if (d[(y * 1080 + x) * 4 + 3] > 140) { top = y; break; }
    if (top < 0) return this.fallback;
    let sx = 0, n = 0;
    const yb = Math.min(1099, top + 120);
    for (let x = 100; x < 980; x += 6) if (d[(yb * 1080 + x) * 4 + 3] > 140) { sx += x; n++; }
    const hx = n ? sx / n : 540;
    const z = ctx.seg.zoom || 1;
    return [540 + (hx - 540) * z, 960 + (top - 960) * z, n * 6 * z];
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3);
    const [hx, hy, hw] = this.head(ctx);
    const k = clamp((hw || 340) / 340, .85, 1.3);
    const q = enter(t, this.t0, .7);
    const x = hx + Math.sin(t * 2.1) * 6, y = hy - 60 * k + Math.sin(t * 2.7) * 10 - lerp(120, 0, ease.out(q));
    const tf = `translate(${x}px,${y}px) rotate(${-6 + Math.sin(t * 1.6) * 3}deg) scale(${lerp(.6, 1, ease.pop(q)) * k})`;
    this.back.style.transform = this.front.style.transform = tf;
    const o = Math.min(clamp(q * 3), out);
    this.back.style.opacity = this.front.style.opacity = o;
    for (const l of this.lines) l.style.strokeDashoffset = 1 - ease.out(q);
    this.glow.style.transform = `translate(${x}px,${y}px)`;
    this.glow.style.opacity = o * (.8 + Math.sin(t * 5) * .2);
    this.sparks.forEach((s, k) => {
      const a = t * 1.3 + k * 1.26, tw = Math.max(0, Math.sin(t * 4 + k * 2));
      s.style.transform = `translate(${x + Math.cos(a) * 250 - 15}px,${y + Math.sin(a) * 70 - 30}px) scale(${tw})`;
      s.style.opacity = o * tw;
    });
  },
};
