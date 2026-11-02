// 梯队排行榜 · 版式：顶部白底黑字标题常驻，下半部黑色面板左侧 S/A/B/C/D/F 彩色色块，说到一个东西就把它放进对应那一行，行满了往下撑高
TEMPLATES.tier_board = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const items = (P.items || []).filter(it => it && it.text && it.tier != null);
    if (!items.length) { this.off = true; return; }          // 必填: no items → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // tier colours are the look of a tier list (red → pink), not a brand highlight: kept fixed
    const COLS = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#ffff7f', '#bfff7f', '#ff7fff', '#7fbfff', '#7fffff'];
    const tiers = (P.tiers && P.tiers.length ? P.tiers : ['S', 'A', 'B', 'C', 'D', 'F']).map(String);
    const top = P.y || 1040, left = 70, width = 940, labW = 168;
    this.rowMin = P.rowHeight || Math.max(96, Math.min(140, Math.floor(820 / tiers.length)));
    this.lineH = 56;
    // title bar (top, always on)
    if (P.title) {
      this.title = el('div', `position:absolute;left:0;right:0;top:${P.titleY || 130}px;display:flex;justify-content:center`);
      const t = el('div', `max-width:900px;padding:10px 26px 14px;background:#fff;color:#111;border-radius:14px;text-align:center;
        font:800 70px/1.08 var(--font-body);letter-spacing:-.01em;box-shadow:0 6px 20px rgba(0,0,0,.18)`, P.title);
      this.title.appendChild(t);
      ctx.L.front.appendChild(this.title);
    }
    this.panel = el('div', `position:absolute;left:${left}px;top:${top}px;width:${width}px;background:#151515;
      box-shadow:0 20px 50px rgba(0,0,0,.35);overflow:hidden`);
    ctx.L.front.appendChild(this.panel);
    this.rows = tiers.map((name, k) => {
      const row = el('div', `position:absolute;left:0;width:${width}px;border-bottom:3px solid #000;box-sizing:border-box`);
      const lab = el('div', `position:absolute;left:0;top:0;bottom:0;width:${labW}px;background:${COLS[k % COLS.length]};
        display:flex;align-items:center;justify-content:center;font:700 ${name.length > 2 ? 34 : 50}px var(--font-body);color:#222;text-align:center`, name);
      row.appendChild(lab);
      this.panel.appendChild(row);
      return { row, n: 0, items: [] };
    });
    const tierIx = v => { const i = tiers.findIndex(x => norm(x) === norm(v)); return i >= 0 ? i : (typeof v === 'number' ? clamp(v, 0, tiers.length - 1) : -1); };
    const fallbackStep = (ctx.d - 1) / Math.max(1, items.length);
    this.items = [];
    items.forEach((it, j) => {
      const r = tierIx(it.tier);
      if (r < 0) return;
      const R = this.rows[r];
      const e = el('div', `position:absolute;left:${labW + 22}px;display:flex;align-items:center;gap:12px;white-space:nowrap;
        font:700 44px var(--font-body);color:#fff`);
      e.appendChild(el('span', '', it.text));
      const icon = it.icon || null;
      if (icon && /\p{Extended_Pictographic}/u.test(icon)) e.appendChild(el('span', 'font-size:38px', icon));
      else if (icon) { const tile = iconTile(icon, 46); if (tile) { tile.style.lineHeight = '0'; const sv = tile.querySelector('svg'); if (sv) sv.style.display = 'block';  tile.style.boxShadow = 'none'; e.appendChild(tile); } }
      R.row.appendChild(e);
      const t = at(it.at != null ? it.at : it.text);
      this.items.push({ e, r, k: R.n++, t: t != null ? t : .5 + j * fallbackStep });
    });
    this.top = top;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3);
    const pin = ease.out(enter(t, 0, .45));
    this.panel.style.transform = `translateY(${lerp(500, 0, pin)}px)`;
    this.panel.style.opacity = Math.min(clamp(pin * 2), out);
    if (this.title) {
      const q = ease.back(enter(t, .05, .4));
      this.title.style.opacity = Math.min(clamp(q * 3), out);
      this.title.style.transform = `scale(${lerp(.85, 1, q)})`;
    }
    // row heights grow smoothly with the number of items already placed in that row
    const filled = this.rows.map(() => 0);
    for (const it of this.items) filled[it.r] += ease.out(enter(t, it.t - .05, .35)) * (it.k > 0 ? 1 : 0);
    let y = 0;
    this.rows.forEach((R, k) => {
      const h = Math.max(this.rowMin, 30 + (1 + filled[k]) * this.lineH);
      R.row.style.top = y + 'px'; R.row.style.height = h + 'px';
      R.h = h; y += h;
    });
    this.panel.style.height = y + 'px';
    for (const it of this.items) {
      const R = this.rows[it.r];
      const n = this.items.filter(o => o.r === it.r).length;
      const block = Math.min(n, 1 + filled[it.r]) * this.lineH;
      const y0 = (R.h - block) / 2;
      const q = enter(t, it.t - .05, .35);
      it.e.style.top = (y0 + it.k * this.lineH + 4) + 'px';
      it.e.style.opacity = clamp(q * 2);
      it.e.style.transform = `translateX(${lerp(60, 0, ease.out(q))}px) scale(${lerp(1.25, 1, ease.out(q))})`;
      it.e.style.transformOrigin = '0 50%';
    }
  },
};
