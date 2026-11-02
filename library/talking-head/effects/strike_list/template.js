// 逐条划掉清单 · 字体：镜头推近到胸口，胸前一行行白色衬线字依次出现，每行出现后被一条红线从左到右划掉，叠成一列全被划掉的清单
TEMPLATES.strike_list = {
  setup(ctx) {
    const P = ctx.params;
    this.off = !(P.items || []).length;          // 必填: no items → render nothing
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const items = P.items.slice(0, 5).map(it => typeof it === 'string' ? { text: it } : it);
    const n = items.length;
    this.zoom = P.zoom || 1.16;
    this.delay = P.delay != null ? P.delay : .3;
    const size = P.size || (n > 3 ? 78 : 96);
    const glow = P.glow || 'color-mix(in srgb, var(--accent-2) 45%, #5f9dff)';
    const strike = P.color || '#ff2b2b';
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || Math.min(1040, 1430 - n * Math.round(size * 1.35))}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(size * .2)}px`);
    ctx.L.front.appendChild(this.box);
    this.items = items.map((it, j) => {
      const row = el('div', `position:relative;display:inline-block;padding:0 14px;font:700 ${size}px/1.15 Georgia,"Times New Roman","Songti SC",serif;color:#fff;white-space:nowrap;
        text-shadow:0 0 6px ${glow},0 0 18px color-mix(in srgb, ${glow} 70%, transparent),0 3px 10px rgba(0,0,0,.45)`, it.text);
      const line = el('div', `position:absolute;left:0;right:0;top:54%;height:${Math.max(6, Math.round(size * .085))}px;margin-top:-3px;border-radius:4px;background:${strike};
        box-shadow:0 0 8px color-mix(in srgb, ${strike} 60%, transparent);transform-origin:0 50%;transform:scaleX(0)`);
      row.appendChild(line);
      this.box.appendChild(row);
      const t = it.at != null ? at(it.at) : null;
      return { row, line, t: t != null ? t : .2 + j * Math.max(.6, (ctx.d - 1) / n) };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    // push in to a chest close-up (origin a bit above the list so the face stays in frame)
    const k = ease.inOut(enter(ctx.t, 0, .45));
    ctx.base.style.transformOrigin = '50% 52%';
    ctx.base.style.transform = `scale(${z * lerp(1, this.zoom, k)})`;
    const out = leave(ctx, .2);
    for (const it of this.items) {
      const q = enter(ctx.t, it.t - .05, .25);
      it.row.style.opacity = Math.min(q, out);
      it.row.style.transform = `translateY(${lerp(18, 0, ease.out(q))}px)`;
      it.line.style.transform = `scaleX(${ease.out(enter(ctx.t, it.t + this.delay, .28))})`;
    }
  },
};
