// 虚线占位填值表 · 版式：人缩进顶部圆角小窗，下面深色底上一张白字表，每行右边先是虚线空药丸「?」，念到数字时变成白底实心药丸，一行接一行往下长
TEMPLATES.dashed_fill_table = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const rows = (P.rows || []).filter(r => r && r.name && r.value != null);
    if (!rows.length) { this.off = true; return; }           // 必填: no rows → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 70% 85%, color-mix(in srgb, var(--bg-b) 80%, #3a8f7a), transparent 70%), linear-gradient(180deg, var(--bg-a), var(--bg-b))';
    // talking-head window (top ~28%)
    const wx = 60, wy = 70, ww = 960, wh = P.windowHeight || 600, s = ww / 1080;
    const fy = clamp((ctx.focus[1] || .33) * 1920 + (P.windowOffset || 170), wh / s / 2, 1920 - wh / s / 2);
    this.win = { wx, wy, ww, wh, s, top: fy - wh / s / 2 };
    this.frameBox = el('div', `position:absolute;left:${wx - 3}px;top:${wy - 3}px;width:${ww}px;height:${wh}px;border:3px solid rgba(255,255,255,.75);border-radius:26px;opacity:0`);
    ctx.L.front.appendChild(this.frameBox);
    // table
    const tx = 70, tw = 940;
    let y = wy + wh + 40;
    this.head = el('div', `position:absolute;left:${tx}px;top:${y}px;width:${tw}px`);
    if (P.title) this.head.appendChild(el('div', 'font:800 52px/1.1 var(--font-body);color:#fff', P.title));
    if (P.subtitle) this.head.appendChild(el('div', 'margin-top:6px;font:600 28px var(--font-body);color:rgba(255,255,255,.7)', P.subtitle));
    const seg = el('div', 'display:flex;gap:12px;margin-top:20px');
    this.segs = [];
    const nSeg = Math.max(rows.length, P.segments || 6);
    for (let i = 0; i < nSeg; i++) { const b = el('div', 'flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.25)'); seg.appendChild(b); this.segs.push(b); }
    this.head.appendChild(seg);
    ctx.L.front.appendChild(this.head);
    y += (P.title ? 62 : 0) + (P.subtitle ? 40 : 0) + 50;
    const rowH = P.rowHeight || (rows.length > 4 ? 100 : 140);
    const step = (ctx.d - 1.2) / rows.length;
    this.rows = rows.map((r, j) => {
      const e = el('div', `position:absolute;left:${tx}px;top:${y + j * rowH}px;width:${tw}px;height:${rowH}px;display:flex;align-items:center;gap:24px`);
      const name = el('div', 'flex:1;min-width:0');
      name.appendChild(el('div', 'font:800 46px/1.1 var(--font-body);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis', r.name));
      if (r.sub) name.appendChild(el('div', 'margin-top:4px;font:600 24px var(--font-body);color:rgba(255,255,255,.6)', r.sub));
      e.appendChild(name);
      // optional picture in the middle: uploaded photo (needs 照片) or an icon from the icon library; neither → nothing
      if (r.photo) {
        const img = el('img', 'width:110px;height:72px;object-fit:cover;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.3);flex:none');
        img.src = url(r.photo); pending.push(img.decode().catch(() => {}));
        e.appendChild(img);
      } else if (r.icon) {
        const tile = iconTile(r.icon, 72); if (tile) { tile.style.lineHeight = '0'; const sv = tile.querySelector('svg'); if (sv) sv.style.display = 'block';  tile.style.flex = 'none'; e.appendChild(tile); }
      }
      const slot = el('div', 'position:relative;flex:none;width:380px;height:76px;display:flex;justify-content:flex-end;align-items:center');
      const dash = el('div', `position:absolute;right:0;top:4px;width:260px;height:68px;box-sizing:border-box;border:3px dashed rgba(255,255,255,.75);
        border-radius:999px;display:flex;align-items:center;justify-content:center;font:700 34px var(--font-body);color:rgba(255,255,255,.85)`, P.placeholder || '?');
      const pill = el('div', `position:absolute;right:0;top:4px;height:68px;box-sizing:border-box;padding:0 26px;border-radius:999px;background:var(--paper);
        display:flex;align-items:baseline;justify-content:center;gap:10px;white-space:nowrap;line-height:68px;box-shadow:0 6px 16px rgba(0,0,0,.25)`);
      pill.appendChild(el('span', 'font:800 44px var(--font-body);color:var(--ink)', r.value));
      if (r.note) pill.appendChild(el('span', 'font:600 22px var(--font-body);color:#777', r.note));
      slot.append(dash, pill);
      e.appendChild(slot);
      ctx.L.front.appendChild(e);
      const tf = at(r.at);
      const fill = tf != null ? tf : .9 + j * step;
      const show = at(r.show);
      return { e, dash, pill, fill, show: show != null ? show : Math.max(.35 + j * .15, fill - (P.lead || 1.2)) };
    });
    this.rows.forEach((r, j) => { if (j && r.show < this.rows[j - 1].show) r.show = this.rows[j - 1].show + .1; });
    // optional empty dashed "folder" frame under the table, for what comes next
    if (P.folder !== false) {
      const fyy = y + rows.length * rowH + 50, fh = Math.max(200, Math.min(420, 1820 - fyy));
      this.folder = el('div', `position:absolute;left:${tx}px;top:${fyy}px;width:${tw}px;height:${fh}px`);
      this.folder.appendChild(el('div', 'position:absolute;left:20px;top:0;width:200px;height:50px;border:3px dashed rgba(255,255,255,.45);border-radius:20px;box-sizing:border-box'));
      this.folder.appendChild(el('div', `position:absolute;left:0;right:0;top:34px;bottom:0;border:3px dashed rgba(255,255,255,.45);border-radius:22px;box-sizing:border-box`));
      ctx.L.front.appendChild(this.folder);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, W = this.win;
    // shrink the talking head into the window
    const k = ease.inOut(enter(t, 0, .5)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    const s = lerp(1, W.s, k), top = lerp(0, W.top, k);
    const left = lerp(0, (1080 - W.ww / W.s) / 2, k), right = left, bottom = lerp(0, 1920 - W.top - W.wh / W.s, k);
    const tx = lerp(0, W.wx - left * W.s, k), ty = lerp(0, W.wy - W.top * W.s, k);
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    ctx.base.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${lerp(0, 26 / W.s, k)}px)`;
    this.frameBox.style.opacity = enter(t, .4, .2) * (1 - enter(t, ctx.d - .35, .15));
    const hq = ease.out(enter(t, .3, .4)), out = leave(ctx, .3);
    this.head.style.opacity = Math.min(hq, out);
    this.head.style.transform = `translateY(${lerp(20, 0, hq)}px)`;
    if (this.folder) this.folder.style.opacity = Math.min(ease.out(enter(t, .5, .4)), out);
    let filled = 0;
    this.rows.forEach((r, j) => {
      const a = ease.out(enter(t, r.show, .35));
      r.e.style.opacity = Math.min(a, out);
      r.e.style.transform = `translateY(${lerp(18, 0, a)}px)`;
      const f = enter(t, r.fill - .05, .3);
      r.dash.style.opacity = 1 - clamp(f * 2);
      r.pill.style.opacity = clamp(f * 2);
      r.pill.style.transform = `scale(${lerp(.85, 1, ease.back(f))})`;
      r.pill.style.transformOrigin = '100% 50%';
      if (f > 0) filled = j + 1;
    });
    this.segs.forEach((b, i) => { b.style.background = i < filled ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.25)'; });
  },
};
