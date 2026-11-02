// 流程卡链推演 · 版式：人下移到下半部，上方浅灰面板里一排卡片从左往右推：金额卡 → 药丸+箭头 → 新卡，放不下时整排左移，最后一张先转圈再变绿色对勾
TEMPLATES.flow_chain = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const steps = (P.steps || []).filter(s => s && (s.big || s.text || s.head));
    if (!steps.length) { this.off = true; return; }          // 必填: no steps → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.ph = P.panel || 720; this.shift = P.shift != null ? P.shift : 320;
    ctx.L.bg.style.background = '#000';
    this.panel = el('div', `position:absolute;left:0;top:0;width:1080px;height:${this.ph}px;overflow:hidden;background:
      repeating-linear-gradient(0deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px),
      repeating-linear-gradient(90deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px), #efefef`);
    ctx.L.front.appendChild(this.panel);
    if (P.title) this.panel.appendChild(el('div', `position:absolute;left:60px;right:60px;top:150px;text-align:center;color:#111;
      font:800 62px/1.1 var(--font-body);letter-spacing:-.01em`, P.title));
    const rowTop = P.title ? 290 : 230, cardW = 300, cardH = 250, linkW = 230, gap = 14;
    this.row = el('div', `position:absolute;left:0;top:${rowTop}px;height:${cardH}px;width:4000px`);
    this.panel.appendChild(this.row);
    const GREEN = '#16a34a';   // "done / restored" green is semantic, kept fixed
    let x = 50;
    const step = (ctx.d - 1) / steps.length;
    this.nodes = steps.map((s, j) => {
      const kind = s.kind || (s.text && !s.big ? 'link' : 'card');
      const t0 = at(s.at); const t = t0 != null ? t0 : .4 + j * step;
      let e, w, fill = null, spin = null, check = null;
      if (kind === 'link') {
        w = linkW;
        e = el('div', `position:absolute;left:${x}px;top:0;width:${w}px;height:${cardH}px;display:flex;flex-direction:column;align-items:center;justify-content:center`);
        e.appendChild(el('div', `padding:4px 14px 6px;border:3px solid #555;border-radius:999px;font:700 26px var(--font-body);color:#222;max-width:220px;text-align:center;line-height:1.15;background:#fafafa`, s.text));
        e.appendChild(el('div', 'margin:10px 0 6px', `<svg width="110" height="30" viewBox="0 0 110 30"><path d="M4 15 H100 M86 4 L102 15 L86 26" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`));
        if (s.note) e.appendChild(el('div', `font:600 22px/1.2 var(--font-body);color:#666;text-align:center;max-width:${w}px`, s.note));
      } else if (kind === 'done') {
        w = cardW;
        e = el('div', `position:absolute;left:${x}px;top:0;width:${w}px;height:${cardH}px;box-sizing:border-box;border-radius:14px;background:#fff;
          border:4px solid ${GREEN};box-shadow:0 8px 22px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center`);
        spin = el('div', `position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;
          border:7px solid #ddd;border-top-color:#777;box-sizing:border-box`);
        check = el('div', 'display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 18px;text-align:center');
        check.appendChild(el('div', '', `<svg width="74" height="74" viewBox="0 0 74 74"><circle cx="37" cy="37" r="33" fill="none" stroke="${GREEN}" stroke-width="5"/><path d="M22 38 L33 49 L53 27" fill="none" stroke="${GREEN}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`));
        check.appendChild(el('div', `font:800 32px/1.15 var(--font-body);color:${GREEN}`, s.text || s.big || ''));
        e.append(spin, check);
      } else {
        w = cardW;
        e = el('div', `position:absolute;left:${x}px;top:0;width:${w}px;height:${cardH}px;box-sizing:border-box;border-radius:14px;background:#fff;
          border:2px solid #dedede;box-shadow:0 8px 22px rgba(0,0,0,.08);overflow:hidden`);
        e.appendChild(el('div', `height:58px;display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--ink);
          font:800 28px var(--font-body);padding:0 10px;text-align:center`, s.head || ''));
        fill = el('div', 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:186px;padding:0 14px;text-align:center');
        const bs = String(s.big || '').length > 7 ? 54 : 74;
        fill.appendChild(el('div', `font:800 ${bs}px/1.05 var(--font-body);color:var(--ink);letter-spacing:-.02em;white-space:nowrap`, s.big || ''));
        if (s.sub) fill.appendChild(el('div', 'margin-top:12px;font:600 24px/1.2 var(--font-body);color:#777', s.sub));
        e.appendChild(fill);
      }
      this.row.appendChild(e);
      const node = { e, kind, t, x, w, fill, spin, check };
      x += w + gap;
      return node;
    });
    this.maxRight = 1080 - 50;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    // slide the whole row left whenever a new node would fall off the right edge
    let sh = 0;
    for (const n of this.nodes) {
      const need = Math.max(0, n.x + n.w - this.maxRight);
      sh = Math.max(sh, need * ease.inOut(enter(t, n.t - .15, .5)));
    }
    this.row.style.transform = `translateX(${-sh}px)`;
    for (const n of this.nodes) {
      const q = ease.out(enter(t, n.t, .35));
      n.e.style.opacity = q;
      n.e.style.transform = n.kind === 'link' ? `translateX(${lerp(-30, 0, q)}px)` : `translateY(${lerp(20, 0, q)}px)`;
      if (n.fill) n.fill.style.opacity = ease.out(enter(t, n.t + .25, .3));      // card shows empty first, then fills
      if (n.spin) {
        const done = enter(t, n.t + .7, .3);
        n.spin.style.opacity = 1 - done;
        n.spin.style.transform = `rotate(${(t * 540) % 360}deg)`;
        n.check.style.opacity = done;
        n.check.style.transform = `scale(${lerp(.7, 1, ease.back(done))})`;
      }
    }
  },
};
