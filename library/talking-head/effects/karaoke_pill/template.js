// 灰字转黑药丸字幕 · 字体：胸口一个紧贴文字的白色小药丸，一句 3–5 个词一起出现，没念到的词浅灰，念到就变黑，整句念完换下一句；不弹不放大
TEMPLATES.karaoke_pill = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const words = ctx.words.filter(w => w.w && String(w.w).trim());
    if (!words.length) { this.off = true; return; }
    const max = P.maxWords || 5;
    // split into short phrases: break after punctuation or at maxWords (CJK words count the same)
    const chunks = [];
    let cur = [];
    words.forEach((w, j) => {
      cur.push(w);
      const punct = /[.,!?;:，。！？；：]$/.test(w.w);
      if ((punct && cur.length >= 2) || cur.length >= max) { chunks.push(cur); cur = []; }
    });
    if (cur.length) { if (cur.length === 1 && chunks.length && chunks[chunks.length - 1].length < max) chunks[chunks.length - 1].push(...cur); else chunks.push(cur); }
    const fs = P.size || 46;
    const cjk = s => /[　-鿿]/.test(s);
    this.box = el('div', `position:absolute;left:60px;right:60px;top:${P.y || 1230}px;display:flex;justify-content:center`);
    ctx.L.front.appendChild(this.box);
    this.chunks = chunks.map((c, k) => {
      const pill = el('div', `position:absolute;max-width:960px;padding:${fs * .2}px ${fs * .36}px ${fs * .26}px;border-radius:${fs * .3}px;background:var(--paper);
        font:700 ${fs}px/1.2 var(--font-body);text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.12);opacity:0`);
      const spans = c.map((w, j) => {
        const s = el('span', '', (j && !(cjk(w.w) && cjk(c[j - 1].w)) ? ' ' : '') + w.w);
        pill.appendChild(s);
        return { s, t: w.s };
      });
      this.box.appendChild(pill);
      return { pill, spans, t0: c[0].s - .06 };
    });
    this.chunks.forEach((c, k) => { c.t1 = k + 1 < this.chunks.length ? this.chunks[k + 1].t0 : ctx.d + 1; });
    this.off_ = 'color-mix(in srgb, var(--ink) 28%, var(--paper))';
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    for (const c of this.chunks) {
      const on = t >= c.t0 && t < c.t1;
      c.pill.style.opacity = on ? Math.min(clamp((t - c.t0) / .08), leave(ctx, .15)) : 0;
      for (const s of c.spans) s.s.style.color = t >= s.t ? 'var(--ink)' : this.off_;
    }
  },
};
