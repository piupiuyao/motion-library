// Caption News · lit grid: three dark panels (numbered 1–2–3) rise staggered 0.1 s apart at chest height;
// each panel lights up (honey border, honey number block, label turns honey) on the word that names it.
// A small top-left title block names the grid. The running caption stays underneath.
TEMPLATES.caption_news_grid = {
  norm: s => String(s).toLowerCase().replace(/[^a-z0-9%$']/g, ''),
  at(ctx, a) {
    if (typeof a === 'number') { const w = ctx.words.find(x => x.i === a); return w ? w.s : 0; }
    const first = this.norm(String(a || '').split(/\s+/)[0]);
    const w = ctx.words.find(x => this.norm(x.w) === first);
    return w ? w.s - .05 : null;
  },
  setup(ctx) {
    const P = ctx.params, items = (P.items || []).slice(0, 3), n = items.length || 1;
    const gap = 12, x0 = 72, wAll = 1080 - 2 * x0, pw = (wAll - gap * (n - 1)) / n, ph = P.h || 300, y = P.y || 1010;
    this.root = el('div', `position:absolute;left:${x0}px;top:${y}px;width:${wAll}px;height:${ph + 70}px`);
    ctx.L.front.appendChild(this.root);
    if (P.title) {
      this.title = el('div', 'position:absolute;left:0;top:0;height:54px;display:flex;align-items:stretch');
      this.title.appendChild(el('div', 'width:8px;background:var(--accent)'));
      this.title.appendChild(el('div', 'background:rgba(14,14,12,.82);color:var(--paper);font:800 28px/54px var(--font-body);padding:0 16px;letter-spacing:.08em;text-transform:uppercase', P.title));
      this.root.appendChild(this.title);
    }
    const top = P.title ? 70 : 0;
    this.panels = items.map((it, k) => {
      const p = el('div', `position:absolute;left:${k * (pw + gap)}px;top:${top}px;width:${pw}px;height:${ph}px;box-sizing:border-box;
        background:rgba(21,21,18,.88);border:3px solid rgba(247,245,239,.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px`);
      const num = el('div', 'position:absolute;left:-3px;top:-3px;width:48px;height:48px;background:rgba(247,245,239,.14);color:var(--paper);font:900 26px/48px var(--font-body);text-align:center', String(k + 1));
      p.appendChild(num);
      const ic = it.icon === false ? null : iconTile(it.icon || it.text, 116);
      if (ic) p.appendChild(ic);
      const lab = el('div', `color:var(--paper);font:800 ${it.size || 40}px/1.05 var(--font-body);letter-spacing:-.01em;text-align:center;padding:0 14px`, it.text);
      p.appendChild(lab);
      this.root.appendChild(p);
      const s = this.at(ctx, it.at != null ? it.at : it.text);
      return { p, num, lab, s: s == null ? .6 + k * .6 : s, r: .02 + k * .1 };
    });
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .12);
    if (this.title) { const k = ease.out(enter(t, 0, .22)); this.title.style.opacity = Math.min(k, out); this.title.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`; }
    for (const q of this.panels) {
      const k = ease.out(enter(t, q.r, .3));
      q.p.style.opacity = Math.min(clamp(k * 2), out);
      q.p.style.transform = `translateY(${(1 - k) * 90}px)`;
      const lit = t >= q.s;
      const lk = ease.out(enter(t, q.s, .12));
      q.p.style.borderColor = lit ? 'var(--accent)' : 'rgba(247,245,239,.14)';
      q.num.style.background = lit ? 'var(--accent)' : 'rgba(247,245,239,.14)';
      q.num.style.color = lit ? 'var(--ink)' : 'var(--paper)';
      q.lab.style.color = lit ? 'var(--accent)' : 'var(--paper)';
      q.p.style.transform += ` scale(${lit ? lerp(1.06, 1, lk) : 1})`;
    }
  },
};
