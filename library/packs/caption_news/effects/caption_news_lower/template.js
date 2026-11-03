// Caption News · lower-third stack: a honey tab names the list, then one lower third per item
// (8 px honey bar + dark 78 % panel + number + one line) wipes in left → right in 0.22 s on the word that starts it.
// Rows stack downward and stay; the newest row's number block is honey. Sits at chest height, above the caption.
TEMPLATES.caption_news_lower = {
  norm: s => String(s).toLowerCase().replace(/[^a-z0-9%$']/g, ''),
  at(ctx, a, from) {
    if (typeof a === 'number') { const j = ctx.words.findIndex(x => x.i === a); return j; }
    const first = this.norm(String(a || '').split(/\s+/)[0]);
    for (let j = from; j < ctx.words.length; j++) if (this.norm(ctx.words[j].w) === first) return j;
    return -1;
  },
  setup(ctx) {
    const P = ctx.params, x = P.x || 72, y = P.y || 900, rh = P.rowH || 104;
    this.root = el('div', `position:absolute;left:${x}px;top:${y}px;width:${1080 - 2 * x}px`);
    ctx.L.front.appendChild(this.root);
    let top = 0;
    if (P.label) {
      this.tab = el('div', 'position:absolute;left:0;top:0;height:56px;background:var(--accent);color:var(--ink);font:900 28px/56px var(--font-body);padding:0 18px;letter-spacing:.08em;text-transform:uppercase', P.label);
      this.root.appendChild(this.tab);
      top = 72;
    }
    let from = 0;
    this.rows = (P.items || []).slice(0, 4).map((it, k) => {
      const r = el('div', `position:absolute;left:0;top:${top + k * (rh + 14)}px;height:${rh}px;display:flex;align-items:stretch`);
      r.appendChild(el('div', 'width:8px;background:var(--accent)'));
      const num = el('div', `width:${rh * .72}px;background:rgba(247,245,239,.12);color:var(--paper);font:900 ${rh * .4}px/${rh}px var(--font-body);text-align:center`, String(k + 1));
      r.appendChild(num);
      r.appendChild(el('div', `background:rgba(14,14,12,.78);color:var(--paper);font:800 ${it.size || 52}px/${rh}px var(--font-body);letter-spacing:-.015em;padding:0 30px 0 24px;white-space:nowrap`, it.text));
      this.root.appendChild(r);
      const j = this.at(ctx, it.at != null ? it.at : it.text, from);
      if (j >= 0) from = j + 1;
      return { r, num, s: j >= 0 ? ctx.words[j].s - .06 : .3 + k * .8 };
    });
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .12);
    if (this.tab) { const k = ease.out(enter(t, 0, .22)); this.tab.style.opacity = out; this.tab.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`; }
    this.rows.forEach((q, k) => {
      const p = ease.out(enter(t, q.s, .22));
      q.r.style.opacity = t < q.s ? 0 : out;
      q.r.style.clipPath = `inset(-4px ${(1 - p) * 100}% -4px 0)`;
      const next = this.rows[k + 1], newest = t >= q.s && (!next || t < next.s);
      q.num.style.background = newest ? 'var(--accent)' : 'rgba(247,245,239,.12)';
      q.num.style.color = newest ? 'var(--ink)' : 'var(--paper)';
    });
  },
};
