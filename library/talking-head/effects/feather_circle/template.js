// 羽化圆窗黑场 · 版式：一刀切到纯黑，人的头肩裁进上方一个边缘羽化的圆窗并慢慢推近；圆窗下方黑底上出字幕，关键词变色放大
// 自带字幕：放在 "captions": false 的镜头文件里（或整条片子关掉底部字幕时用）
TEMPLATES.feather_circle = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = '#000';
    this.D = P.diameter || 700;
    this.cy = P.y || 600;
    this.hard = P.edge === 'hard';
    this.fx = ctx.focus[0] * 1080; this.fy = ctx.focus[1] * 1920 + 90;
    this.r = P.radius || 470;                      // radius cut from the full-size video around the face
    if (this.hard) {
      this.ring = el('div', `position:absolute;left:${540 - this.D / 2}px;top:${this.cy - this.D / 2}px;width:${this.D}px;height:${this.D}px;border-radius:50%;
        border:5px solid #fff;box-sizing:border-box`);
      ctx.L.front.appendChild(this.ring);
    }
    // own captions under the window: one chunk at a time, words light up as spoken, keyword in accent and bigger
    if (P.captions === false) { this.chunks = []; return; }
    const keys = new Set(ctx.groups.flatMap(g => g.idx));
    const chunks = [];
    let cur = [];
    for (const w of ctx.words) {
      if (!w.w) continue;
      if (cur.length && (cur.length >= 4 || /[.?!,;]$/.test(cur[cur.length - 1].w) || w.s - cur[cur.length - 1].e > .35)) { chunks.push(cur); cur = []; }
      cur.push(w);
    }
    if (cur.length) chunks.push(cur);
    this.cap = el('div', `position:absolute;left:60px;right:60px;top:${this.cy + this.D / 2 + 90}px;text-align:center;font:700 64px/1.3 var(--font-body);color:#fff`);
    ctx.L.front.appendChild(this.cap);
    this.chunks = chunks.map((ws, j) => {
      const line = el('div', 'position:absolute;left:0;right:0;top:0');
      const spans = ws.map(w => {
        const k = keys.has(w.i);
        const s = el('span', k ? 'color:var(--accent);font-size:1.32em;font-weight:900;display:inline-block' : '', w.w);
        line.appendChild(s); line.appendChild(document.createTextNode(' '));
        return { s, t: w.s, k };
      });
      this.cap.appendChild(line);
      const next = chunks[j + 1];
      return { line, spans, s: ws[0].s - .08, e: next ? next[0].s - .08 : 1e9 };
    });
  },
  frame(ctx) {
    const { D, cy, fx, fy, r } = this;
    // slow push into a face close-up inside the window
    const S = (D / 2 / r) * lerp(1, 1.14, ease.inOut(ctx.p));
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${540 - fx * S}px,${cy - fy * S}px) scale(${S})`;
    const R = D / 2 / S;
    if (this.hard) {
      ctx.base.style.clipPath = `circle(${R}px at ${fx}px ${fy}px)`;
    } else {
      const m = `radial-gradient(circle ${R}px at ${fx}px ${fy}px, #000 ${R * .8}px, rgba(0,0,0,.5) ${R * .91}px, transparent ${R}px)`;
      ctx.base.style.webkitMaskImage = ctx.base.style.maskImage = m;
    }
    for (const c of this.chunks) {
      const on = ctx.t >= c.s && ctx.t < c.e;
      c.line.style.display = on ? '' : 'none';
      if (!on) continue;
      for (const sp of c.spans) {
        const q = enter(ctx.t, sp.t - .06, .18);
        sp.s.style.opacity = lerp(.35, 1, q);
        if (sp.k) sp.s.style.transform = `scale(${lerp(.8, 1, ease.pop(q))})`;
      }
    }
  },
};
