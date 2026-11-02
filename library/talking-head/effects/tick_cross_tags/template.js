// 勾叉对错标签 · 字体：画面缩小一圈露出黑边，人胸前一行里依次弹出「绿勾+词」和「红叉+词」两个标签做对错对比
TEMPLATES.tick_cross_tags = {
  setup(ctx) {
    const P = ctx.params;
    this.off = !(P.items || []).length;          // 必填: no items → render nothing
    this.shrink = P.shrink || .86;
    if (this.off) return;
    ctx.L.bg.style.background = '#050505';
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const items = P.items.slice(0, 3);
    const long = items.reduce((m, it) => m + String(it.text).length, 0);
    const size = P.size || (long > 22 ? 60 : long > 10 ? 84 : 96);
    const color = P.color || 'var(--accent)';
    this.row = el('div', `position:absolute;left:30px;right:30px;top:${P.y || 1250}px;display:flex;justify-content:center;align-items:center;gap:${Math.round(size * .7)}px;flex-wrap:wrap`);
    ctx.L.front.appendChild(this.row);
    const box = Math.round(size * .92);
    this.items = items.map((it, j) => {
      const bad = it.mark === 'x';
      const tag = el('div', `display:flex;align-items:center;gap:${Math.round(size * .22)}px;opacity:0`);
      const ic = el('div', `flex:none;width:${box}px;height:${box}px;border-radius:${Math.round(box * .16)}px;background:${bad ? '#e5322d' : '#22b14c'};
        border:4px solid #fff;box-sizing:border-box;box-shadow:0 4px 12px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center`,
        bad ? `<svg viewBox="0 0 40 40" width="${box * .62}" height="${box * .62}"><path d="M9 9 L31 31 M31 9 L9 31" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`
            : `<svg viewBox="0 0 40 40" width="${box * .66}" height="${box * .66}"><path d="M7 21 L16 30 L33 10" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
      const tx = el('div', `font:900 ${size}px/1.05 "Songti SC","STSong",Georgia,serif;color:${color};white-space:nowrap;
        -webkit-text-stroke:${Math.max(4, Math.round(size * .09))}px #000;paint-order:stroke fill;text-shadow:0 4px 10px rgba(0,0,0,.5)`, it.text);
      tag.append(ic, tx);
      this.row.appendChild(tag);
      const t = it.at != null ? at(it.at) : null;
      return { tag, t: t != null ? t : .3 + j * Math.min(1, (ctx.d - .8) / items.length) };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    const k = ease.out(enter(ctx.t, 0, .3));
    ctx.base.style.transform = `scale(${z * lerp(1, this.shrink, k)})`;
    ctx.base.style.boxShadow = `0 0 60px 20px rgba(0,0,0,${.8 * k})`;
    const out = leave(ctx, .2);
    for (const it of this.items) {
      const q = enter(ctx.t, it.t - .08, .4);
      it.tag.style.opacity = Math.min(clamp(q * 3), out);
      it.tag.style.transform = `scale(${lerp(.3, 1, ease.pop(q))})`;
    }
  },
};
