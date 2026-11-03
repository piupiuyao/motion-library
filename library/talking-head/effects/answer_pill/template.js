// 结论药丸反色放大 · 字体：人在顶部小窗，下方对比框里前一行是普通白色小药丸；说到结论时右侧虚线空槽里弹出一个大一倍的黑底白字药丸，框标签同时换字
TEMPLATES.answer_pill = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params, A = P.answer;
    this.off = !A || A.value == null || A.value === '';   // the conclusion number is required
    if (this.off) return;
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 50% 30%, var(--bg-b), var(--bg-a) 75%)';
    this.win = { x: 60, y: 70, w: 960, h: 600 };
    const s = this.win.w / 1080, srcH = this.win.h / s;
    this.srcTop = clamp(ctx.focus[1] * 1920 + 70 - srcH * .5, 0, 1920 - srcH);
    this.s = s;
    ctx.base.style.clipPath = `inset(${this.srcTop}px 0 ${1920 - this.srcTop - srcH}px 0 round ${30 / s}px)`;
    ctx.base.style.transformOrigin = '0 0';
    ctx.L.back.appendChild(el('div', `position:absolute;left:${this.win.x - 3}px;top:${this.win.y - 3}px;width:${this.win.w}px;height:${this.win.h}px;
      border:3px solid color-mix(in srgb, var(--paper) 55%, transparent);border-radius:32px;box-shadow:0 24px 60px rgba(0,0,0,.45)`));
    // comparison box
    const box = el('div', `position:absolute;left:60px;top:${P.y || 800}px;width:960px;box-sizing:border-box;padding:56px 40px 36px;
      border:3px solid color-mix(in srgb, var(--on-bg, var(--paper)) 55%, transparent);border-radius:36px;color:var(--on-bg, var(--paper))`);
    this.box = box;
    this.tag = el('div', `position:absolute;left:32px;top:-34px;padding:8px 26px 12px;border-radius:16px;background:var(--paper);color:var(--ink);
      font:800 44px var(--font-body);white-space:nowrap`, P.label || '');
    if (!P.label) this.tag.style.display = 'none';
    box.appendChild(this.tag);
    const left = r => {
      const c = el('div', 'flex:1;min-width:0');
      c.appendChild(el('div', 'font:800 58px/1.1 var(--font-body)', r.title || ''));
      if (r.sub) c.appendChild(el('div', 'font:500 32px/1.3 var(--font-body);opacity:.62;margin-top:4px', r.sub));
      return c;
    };
    const pill = (r, big) => {
      const p = el('div', `display:flex;align-items:baseline;gap:${big ? 16 : 10}px;white-space:nowrap;border-radius:999px;
        padding:${big ? '18px 52px 24px' : '8px 30px 12px'};font:800 ${big ? 128 : 66}px/1 var(--font-body);
        background:${big ? 'var(--ink)' : 'var(--paper)'};color:${big ? 'var(--paper)' : 'var(--ink)'};
        ${big ? 'border:4px solid var(--paper);box-shadow:0 22px 50px rgba(0,0,0,.5)' : ''}`);
      p.appendChild(el('span', '', r.value));
      if (r.unit) p.appendChild(el('span', `font:600 ${big ? 40 : 28}px var(--font-body);opacity:.65`, r.unit));
      return p;
    };
    const rows = (P.rows || []).slice(0, 3);
    rows.forEach(r => {
      const row = el('div', 'display:flex;align-items:center;gap:24px;padding:18px 0 26px');
      row.appendChild(left(r));
      if (r.value != null && r.value !== '') row.appendChild(pill(r));
      box.appendChild(row);
    });
    if (rows.length) box.appendChild(el('div', 'height:3px;background:color-mix(in srgb, var(--paper) 30%, transparent);margin:6px 0 10px'));
    const row = el('div', 'display:flex;align-items:center;gap:24px;padding:22px 0 8px;min-height:190px');
    this.aLeft = left(A);
    row.appendChild(this.aLeft);
    const slot = el('div', 'position:relative;flex:none;display:flex;justify-content:flex-end;align-items:center');
    this.big = pill(A, true);
    this.big.style.transformOrigin = '100% 50%';
    this.slot = el('div', `position:absolute;right:0;top:50%;width:420px;height:150px;margin-top:-75px;border-radius:999px;
      border:4px dashed color-mix(in srgb, var(--paper) 45%, transparent)`);
    slot.appendChild(this.slot);
    slot.appendChild(this.big);
    row.appendChild(slot);
    box.appendChild(row);
    ctx.L.front.appendChild(box);
    this.label = P.label || '';
    this.label2 = P.label2 || '';
    this.tRow = this.tAt(ctx, A.show, .25);
    this.tA = this.tAt(ctx, A.at, Math.min(ctx.d * .55, ctx.d - 1.2));
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, w = this.win, out = leave(ctx);
    ctx.base.style.transform = `translate(${w.x}px,${w.y - this.srcTop * this.s}px) scale(${this.s})`;
    const b = enter(t, 0, .35);
    this.box.style.opacity = Math.min(clamp(b * 2), out);
    this.box.style.transform = `translateY(${(1 - ease.out(b)) * 40}px)`;
    const r = enter(t, this.tRow, .3);
    this.aLeft.style.opacity = r;
    this.slot.style.opacity = r * (1 - enter(t, this.tA, .15));
    const q = enter(t, this.tA, .5);
    this.big.style.opacity = clamp(q * 5);
    this.big.style.transform = `scale(${Math.max(.001, lerp(.55, 1, ease.pop(q)))})`;
    if (this.label2) this.tag.textContent = t >= this.tA ? this.label2 : this.label;
  },
};
