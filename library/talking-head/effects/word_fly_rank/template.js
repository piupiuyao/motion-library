// 词条飞入榜位 · 字体：说到一个东西，它的名字以大白字（略糊→变清楚）出现在胸口，停一下后缩小带运动模糊飞进下方榜单对应的行
TEMPLATES.word_fly_rank = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const items = (P.items || []).filter(it => it && it.text);
    if (!items.length) { this.off = true; return; }           // 必填: no items → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // rows of the target list: given, or the distinct `to` values in order
    let rows = (P.rows || []).map(String);
    if (!rows.length) items.forEach(it => { if (it.to != null && !rows.includes(String(it.to))) rows.push(String(it.to)); });
    if (!rows.length) rows = items.map((_, k) => String(k + 1));
    const TIER = { S: '#ff7f7f', A: '#ffbf7f', B: '#ffdf7f', C: '#ffff7f', D: '#bfff7f', E: '#bfff7f', F: '#ff7fff' };
    const rowCol = (name, k) => TIER[name.toUpperCase()] || (k % 2 ? 'var(--accent-2)' : 'var(--accent)');
    const top = P.y || 1290, left = 90, width = 900, labW = 140;
    const rowH = P.rowHeight || Math.max(96, Math.min(130, Math.floor(540 / rows.length)));
    this.panel = el('div', `position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${rowH * rows.length}px;background:#151515;
      box-shadow:0 20px 50px rgba(0,0,0,.35)`);
    rows.forEach((name, k) => {
      const row = el('div', `position:absolute;left:0;top:${k * rowH}px;width:${width}px;height:${rowH}px;border-bottom:3px solid #000;box-sizing:border-box`);
      row.appendChild(el('div', `position:absolute;left:0;top:0;bottom:0;width:${labW}px;background:${rowCol(name, k)};display:flex;align-items:center;
        justify-content:center;font:700 ${name.length > 2 ? 30 : 46}px var(--font-body);color:#222;text-align:center`, name));
      this.panel.appendChild(row);
    });
    ctx.L.front.appendChild(this.panel);
    // the flying words live in their own layer so they can leave the panel
    const big = P.size || 92, small = 38, lineH = 46;
    this.bigY = P.wordY || 1150;
    const perRow = rows.map(() => 0);
    const first = items.map(it => at(it.at != null ? it.at : it.text));
    const step = (ctx.d - 1.5) / Math.max(1, items.length);
    this.items = items.map((it, j) => {
      const e = el('div', `position:absolute;left:0;top:0;display:flex;align-items:center;gap:.25em;white-space:nowrap;transform-origin:0 50%;
        font:800 ${big}px/1 var(--font-body);color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.45)`);
      e.appendChild(el('span', '', it.text));
      if (it.icon && /\p{Extended_Pictographic}/u.test(it.icon)) e.appendChild(el('span', 'font-size:.8em', it.icon));
      else if (it.icon) { const tile = iconTile(it.icon, big * .82); if (tile) { tile.style.lineHeight = '0'; const sv = tile.querySelector('svg'); if (sv) sv.style.display = 'block';  tile.style.boxShadow = 'none'; e.appendChild(tile); } }
      ctx.L.front.appendChild(e);
      const w = e.offsetWidth, h = e.offsetHeight;
      let r = rows.findIndex(x => norm(x) === norm(it.to));
      if (r < 0) r = Math.min(j, rows.length - 1);
      const k = perRow[r]++;
      const t0 = first[j] != null ? first[j] : .3 + j * step;
      const next = first.slice(j + 1).find(v => v != null);
      let land = at(it.land);
      if (land == null) land = next != null ? Math.max(t0 + .45, next - .08) : t0 + 1.2;
      const s = small / big;
      return {
        e, t0, land, fly: Math.min(.4, Math.max(.25, land - t0 - .2)),
        x0: 540 - w / 2, y0: this.bigY - h / 2, s,
        x1: left + labW + 24, y1: top + k * lineH + Math.max(10, (rowH - lineH * 1.6) / 2) + r * rowH + (lineH - h * s) / 2,
        // emptying room: later items in the same row shift the first one up a bit is skipped — rows hold 2 lines
      };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3);
    const pin = ease.out(enter(t, 0, .4));
    this.panel.style.opacity = Math.min(pin, out);
    this.panel.style.transform = `translateY(${lerp(80, 0, pin)}px)`;
    for (const it of this.items) {
      const a = enter(t, it.t0 - .08, .3);               // appear: blurry → sharp
      const f = enter(t, it.land, it.fly);                 // fly into its row
      const k = ease.inOut(f);
      const x = lerp(it.x0, it.x1, k), y = lerp(it.y0, it.y1, k) - Math.sin(Math.PI * k) * 40;
      const sc = lerp(lerp(.9, 1, ease.out(a)), it.s, k);
      const blur = a < 1 ? (1 - a) * 10 : (f > 0 && f < 1 ? Math.sin(Math.PI * f) * 5 : 0);
      it.e.style.opacity = a <= 0 ? 0 : Math.min(clamp(a * 2.5), out);
      it.e.style.filter = blur > .2 ? `blur(${blur.toFixed(1)}px)` : 'none';
      it.e.style.transform = `translate(${x}px,${y}px) scale(${sc})`;
      it.e.style.textShadow = f > .5 ? 'none' : '0 6px 24px rgba(0,0,0,.45)';
    }
  },
};
