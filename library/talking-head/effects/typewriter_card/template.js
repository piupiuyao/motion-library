// 打字机出字 · 字体：仿推特卡片里，一句话一个字母一个字母打出来，末尾竖线光标闪烁
TEMPLATES.typewriter_card = {
  setup(ctx) {
    const P = ctx.params;
    this.text = P.text || ctx.words.map(w => w.w).join(' ');
    this.t0 = P.start ?? .3;
    this.cps = P.cps || 12;                     // ~2.5 frames per letter
    this.card = el('div', `position:absolute;left:70px;right:70px;top:${P.y || 110}px;padding:34px 40px 40px;border-radius:38px;
      background:${P.light ? '#fff' : '#0b0b0d'};color:${P.light ? '#111' : '#fff'};box-shadow:0 24px 60px rgba(0,0,0,.45);transform-origin:50% 0`);
    const head = el('div', 'display:flex;align-items:center;gap:22px;margin-bottom:22px');
    // avatar + name + handle only when given (no made-up account); avatar letter from the name or handle
    const who = P.name || (P.handle ? String(P.handle).replace(/^@/, '') : '');
    if (who) head.appendChild(el('div', `width:92px;height:92px;border-radius:50%;flex:none;background:linear-gradient(135deg,var(--accent),var(--accent-2));
      display:flex;align-items:center;justify-content:center;font:900 46px var(--font-body);color:var(--ink)`, who[0].toUpperCase()));
    head.appendChild(el('div', 'flex:1', !who ? '' : `<div style="font:800 44px var(--font-body)">${who}
      <span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:#1d9bf0;color:#fff;font:900 24px/34px var(--font-body);text-align:center;vertical-align:4px">✓</span></div>
      ${P.handle ? `<div style="font:500 34px var(--font-body);color:#8b8b93">${P.handle}</div>` : ''}`));
    // platform mark top-right from the icon library (one-colour mark in the card's text colour); platform: false hides it
    const pf = P.platform === false ? null : (iconFind('brand:' + (P.platform || 'X')) || iconFind(P.platform || 'X'));
    if (pf) head.appendChild(el('div', 'width:56px;height:56px;flex:none', iconSvg(pf, P.light ? '#111111' : '#ffffff')));
    this.body = el('div', `font:600 60px/1.22 ${P.mono ? '"SF Mono", Menlo, monospace' : 'var(--font-body)'};min-height:74px;word-break:break-word`);
    this.txt = document.createTextNode('');
    this.cur = el('span', `display:inline-block;width:6px;height:64px;margin-left:6px;vertical-align:-10px;background:var(--accent)`);
    this.body.append(this.txt, this.cur);
    this.card.append(head, this.body);
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const t = ctx.t, p = enter(t, 0, .35);
    this.card.style.opacity = Math.min(clamp(p * 3), leave(ctx));
    this.card.style.transform = `translateY(${lerp(-40, 0, ease.out(p))}px) scale(${lerp(.92, 1, ease.out(p))})`;
    // never slower than the speech: finish typing ~0.5 s before the shot ends
    const cps = Math.max(this.cps, this.text.length / Math.max(.5, ctx.d - this.t0 - .5));
    const n = clamp(Math.floor((t - this.t0) * cps), 0, this.text.length);
    this.txt.data = this.text.slice(0, n);
    const typing = n > 0 && n < this.text.length;
    this.cur.style.opacity = typing || Math.floor(t * 2.4) % 2 === 0 ? 1 : 0;
  },
};
