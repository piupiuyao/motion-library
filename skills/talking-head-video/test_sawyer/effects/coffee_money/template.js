// 咖啡钱算账 · 这条视频专用：收据小票上先出一杯咖啡和那句「just coffee money」，说到一年多少钱时杯子成排复制铺满小票，合计滚到年总额
TEMPLATES.coffee_money = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w$]/g, '');
    const at = (w, dflt) => { if (w == null) return dflt; const hit = ctx.words.find(x => norm(x.w).startsWith(norm(w))); return hit ? hit.s : dflt; };
    const INK = '#1d1c1a', RED = '#d4342b', MONO = '"SF Mono", Menlo, "Courier New", monospace';
    const W = P.width || 400, X = P.x ?? 8, Y = P.y ?? 140;
    const cup = iconFind('ui:coffee');
    this.card = el('div', `position:absolute;left:${X}px;top:${Y}px;width:${W}px;box-sizing:border-box;padding:30px 32px 36px;
      background:linear-gradient(90deg,#f1efe8,#fbfaf6 12%,#fbfaf6 88%,#efede5);color:${INK};font-family:${MONO};border-radius:6px;
      box-shadow:0 18px 40px rgba(0,0,0,.25);transform-origin:0 0`);
    this.scale = P.scale || .8;
    this.card.appendChild(el('div', `font:700 22px ${MONO};letter-spacing:.18em;opacity:.55`, P.kicker || 'JUST COFFEE MONEY?'));
    // one big cup first
    this.big = el('div', `width:120px;height:120px;margin:18px 0 6px;color:${INK}`, iconSvg(cup));
    this.card.appendChild(this.big);
    // then a grid of small cups: one per day-ish, only drawn, not a real count
    const N = P.cups || 84;
    this.grid = el('div', `display:grid;grid-template-columns:repeat(12,1fr);gap:6px;margin:6px 0 4px`);
    this.cups = Array.from({ length: N }, () => { const c = el('div', `aspect-ratio:1;color:${INK};opacity:0`, iconSvg(cup)); this.grid.appendChild(c); return c; });
    this.card.appendChild(this.grid);
    this.card.appendChild(el('div', 'border-top:3px dashed rgba(0,0,0,.28);margin:16px 0 12px'));
    const tr = el('div', 'display:flex;justify-content:space-between;align-items:baseline');
    tr.appendChild(el('div', `font:800 28px ${MONO};letter-spacing:.06em`, P.unit || 'PER YEAR'));
    this.num = el('div', `font:900 66px ${MONO};color:${RED};letter-spacing:-.02em`, '');
    tr.appendChild(this.num);
    this.card.appendChild(tr);
    ctx.L[P.layer || 'back'].appendChild(this.card);
    this.to = P.to || 0;
    this.prefix = P.prefix || '$';
    this.t0 = at(P.at, ctx.d * .45);
    this.tIn = at(P.inAt, .1);
  },
  frame(ctx) {
    const t = ctx.t;
    const inn = enter(t, this.tIn - .1, .45), out = enter(t, ctx.d - .35, .35);
    this.card.style.opacity = clamp(inn * 2) * (1 - out);
    this.card.style.transform = `translateY(${lerp(-40, 0, ease.out(inn))}px) rotate(${lerp(-4, 0, ease.out(inn))}deg) scale(${this.scale})`;
    // the big cup shrinks away as the small ones multiply
    const m = enter(t, this.t0 - .1, 1.1);
    this.big.style.height = `${lerp(120, 0, ease.inOut(clamp(m * 3)))}px`;
    this.big.style.opacity = 1 - clamp(m * 3);
    const n = this.cups.length;
    this.cups.forEach((c, i) => { c.style.opacity = clamp(m * n - i) ; });
    const v = Math.round(this.to * ease.out(m));
    this.num.textContent = m > 0 ? this.prefix + v.toLocaleString('en-US') : '';
  },
};
