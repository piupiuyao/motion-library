// 白卡图标环绕 · 版式：几张白色圆角小卡（图标 + 一行字）一张张弹到人四周的角落，不挡脸
TEMPLATES.c41 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const spots = [
      { css: 'left:50px;top:150px', rot: -5, o: '100% 100%' },
      { css: 'right:50px;top:150px', rot: 5, o: '0 100%' },
      { css: 'left:50px;top:1060px', rot: 4, o: '100% 0' },
      { css: 'right:50px;top:1060px', rot: -4, o: '0 0' },
      { css: 'left:46px;top:640px', rot: -3, o: '100% 50%' },
      { css: 'right:46px;top:640px', rot: 3, o: '0 50%' },
    ];
    // icon per card from the icon library: it.icon (a name or word: 'Slack', 'gym', 'ui:wallet') or else the spoken word it.at;
    // brand → its official logo/colours, other words → line icon on the card colour. An emoji in icon is shown as is.
    // No icon found → that card is left out (say it → show it).
    const pick = it => {
      const q = it.icon || (typeof it.at === 'string' ? it.at : null);
      const ic = q && /[a-z0-9]/i.test(q) ? iconFind(q) : null;   // emoji → not looked up
      if (ic) {
        const tile = iconTile(ic, 104, ic.kind === 'ui' && it.color ? { bg: it.color } : {});
        tile.style.boxShadow = 'none'; tile.style.borderRadius = '26px';
        if (ic.kind === 'logo') tile.style.padding = '12px';   // full-colour logo straight on the white card
        return tile;
      }
      if (it.icon && /[^\x00-\x7f]/.test(it.icon))
        return el('div', `width:104px;height:104px;border-radius:26px;background:${it.color || 'var(--accent)'};display:flex;align-items:center;justify-content:center;font-size:66px`, it.icon);
      return null;
    };
    const items = (P.items || []).map(it => ({ ...it, tile: pick(it) })).filter(it => it.tile).slice(0, 6);
    this.cards = items.map((it, j) => {
      const s = spots[j];
      // Ali Abdaal style: small white rounded square, icon on top, short uppercase label under it
      const c = el('div', `position:absolute;${s.css};width:200px;padding:22px 10px 18px;display:flex;flex-direction:column;align-items:center;gap:12px;border-radius:30px;
        background:#fff;box-shadow:0 14px 34px rgba(0,0,0,.25);transform-origin:${s.o}`);
      c.appendChild(it.tile);
      c.appendChild(el('div', 'font:800 30px/1.05 var(--font-body);letter-spacing:.04em;text-transform:uppercase;color:var(--ink);text-align:center;max-width:190px', it.text));
      ctx.L.front.appendChild(c);
      const t = it.at != null ? at(it.at) : null;
      return { c, s, t: t != null ? t : .3 + j * .5 };
    });
  },
  frame(ctx) {
    const lv = leave(ctx, .3);
    for (const { c, s, t } of this.cards) {
      const q = enter(ctx.t, t, .45);
      c.style.opacity = Math.min(clamp(q * 4), lv);
      c.style.transform = `scale(${ease.pop(q)}) rotate(${s.rot + Math.sin(ctx.t * 2 + t * 5) * 1.2}deg) translateY(${Math.sin(ctx.t * 2.4 + t * 3) * 6}px)`;
    }
  },
};
