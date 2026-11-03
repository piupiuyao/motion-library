// 磨砂面板环形数据 · 数据：胸前一块磨砂玻璃面板，窄体标题 + 1–3 个百分比圆环，说到哪个就画满哪个（没到的先是灰圈「?」）
TEMPLATES.baicai_ring_stats = {
  setup(ctx) {
    const P = ctx.params, rings = P.rings || [];
    this.off = !rings.length;
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const COL = ['#8b7bff', 'var(--accent)', '#ff3b30'];
    this.panel = el('div', `position:absolute;left:50%;top:${P.top || 1010}px;width:max-content;min-width:640px;box-sizing:border-box;padding:40px 60px 42px;
      border-radius:22px;background:rgba(18,18,20,.30);border:2px solid rgba(255,255,255,.30);backdrop-filter:blur(18px) brightness(.62) saturate(.7);
      box-shadow:0 30px 80px rgba(0,0,0,.35)`);
    if (P.title) {
      const tr = el('div', 'display:flex;align-items:baseline;gap:18px;margin-bottom:30px');
      const t = el('div', 'font-size:76px', P.title); t.className = 'pk-display';
      tr.appendChild(t);
      if (P.label) tr.appendChild(el('div', 'font:400 28px var(--font-body);color:rgba(255,255,255,.8);letter-spacing:.12em', P.label));
      this.panel.appendChild(tr);
    }
    const row = el('div', 'display:flex;justify-content:center;gap:56px');
    const D = 220, SW = 22, R = (D - SW) / 2, C = 2 * Math.PI * R;
    this.rings = rings.map((r, k) => {
      const col = r.color || COL[(rings.length === 1 ? 1 : k) % 3];
      const cell = el('div', `width:${D}px;text-align:center`);
      const wrap = el('div', `position:relative;width:${D}px;height:${D}px`);
      wrap.innerHTML = `<svg width="${D}" height="${D}" style="position:absolute;inset:0;transform:rotate(-90deg)">
        <circle cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="${SW}"/>
        <circle class="arc" cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="${col}" stroke-width="${SW}" stroke-linecap="round"
          stroke-dasharray="${C}" stroke-dashoffset="${C}" style="filter:drop-shadow(0 0 8px ${col.startsWith('var') ? 'rgba(76,217,100,.6)' : col + '99'})"/></svg>`;
      const num = el('div', `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:66px`, '?');
      num.className = 'pk-display';
      wrap.appendChild(num);
      cell.appendChild(wrap);
      cell.appendChild(el('div', 'margin-top:20px;font:400 30px var(--font-body);color:rgba(255,255,255,.9);letter-spacing:.1em', r.label || ''));
      row.appendChild(cell);
      const s = at(r.at);
      return { arc: wrap.querySelector('.arc'), num, C, r, s: s != null ? s : .4 + k * .6 };
    });
    this.panel.appendChild(row);
    ctx.L.front.appendChild(this.panel);
  },
  frame(ctx) {
    if (this.off) return;
    const out = leave(ctx, .2);
    const p = ease.out(enter(ctx.t, 0, .45));
    this.panel.style.opacity = Math.min(p, out);
    this.panel.style.transform = `translateX(-50%) translateY(${lerp(40, 0, p)}px)`;
    for (const g of this.rings) {
      const q = ease.out(enter(ctx.t, g.s, .9));
      const fill = g.r.fill != null ? g.r.fill : (g.r.value || 0) / 100;
      g.arc.style.strokeDashoffset = g.C * (1 - clamp(fill) * q);
      g.arc.style.opacity = q > 0 ? 1 : 0;
      if (ctx.t < g.s) g.num.textContent = '?';
      else if (g.r.text != null && g.r.value == null) g.num.textContent = g.r.text;
      else {
        const v = (g.r.value || 0) * q, dec = g.r.decimals || 0;
        g.num.textContent = v.toFixed(dec) + (g.r.suffix != null ? g.r.suffix : '%');
      }
    }
  },
};
