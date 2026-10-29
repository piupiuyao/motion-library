// 清单打勾 · 版式：人往一边让开，一张清单卡滑进来，说到哪条哪条就打勾（或红叉），字变亮
TEMPLATES.c39 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 30% 30%, var(--bg-b), var(--bg-a) 70%)';
    this.shift = P.shift != null ? P.shift : 310;
    this.card = el('div', `position:absolute;left:34px;top:400px;width:${P.width || 620}px;padding:44px 38px 34px;border-radius:30px;background:var(--paper);
      box-shadow:0 30px 60px rgba(0,0,0,.35)`);
    if (P.title) {
      const h = el('div', 'font-size:66px;color:var(--ink);margin-bottom:28px', P.title);
      h.className = 'display';
      this.card.appendChild(h);
    }
    const items = P.items || [];
    this.items = items.map((it, j) => {
      const row = el('div', 'display:flex;align-items:center;gap:24px;padding:24px 0;border-top:3px solid rgba(0,0,0,.08)');
      const box = el('div', 'position:relative;flex:none;width:72px;height:72px;border-radius:16px;border:5px solid #c9c9c9;box-sizing:border-box');
      const bad = it.mark === 'x';
      const svg = bad
        ? `<svg viewBox="0 0 72 72" style="position:absolute;left:-5px;top:-5px;width:72px;height:72px"><path d="M18 18 L54 54 M54 18 L18 54" fill="none" stroke="#ff3b30" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`
        : `<svg viewBox="0 0 72 72" style="position:absolute;left:-5px;top:-5px;width:72px;height:72px"><path d="M14 38 L30 53 L60 18" fill="none" stroke="#16a34a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
      box.innerHTML = svg;
      const txt = el('div', `font:800 54px/1.1 var(--font-body);color:#b5b5b5`, it.text);
      row.append(box, txt);
      this.card.appendChild(row);
      const t = it.at != null ? at(it.at) : null;
      return { box, txt, path: box.querySelector('path'), bad, t: t != null ? t : .9 + j * (ctx.d - 1.4) / Math.max(1, items.length) };
    });
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const pin = ease.out(enter(ctx.t, 0, .5)), pout = ease.inOut(enter(ctx.t, ctx.d - .4, .4));
    const k = pin * (1 - pout);
    ctx.base.style.transform = `translateX(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.card.style.transform = `translateX(${lerp(-720, 0, ease.back(enter(ctx.t, .1, .5)))}px)`;
    this.card.style.opacity = 1 - pout;
    for (const it of this.items) {
      const q = enter(ctx.t, it.t, .3);
      it.path.setAttribute('stroke-dashoffset', 1 - ease.out(q));
      it.txt.style.color = q > 0 ? (it.bad ? '#ff3b30' : 'var(--ink)') : '#b5b5b5';
      it.txt.style.textDecoration = it.bad && q > 0 ? 'line-through' : 'none';
      it.box.style.borderColor = q > 0 ? (it.bad ? '#ff3b30' : '#16a34a') : '#c9c9c9';
      it.box.style.transform = `scale(${q > 0 ? 1 + .25 * Math.sin(Math.PI * clamp(q)) : 1})`;
    }
  },
};
