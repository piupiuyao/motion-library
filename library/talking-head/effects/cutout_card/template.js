// 抠像出镜 + 重点卡 · 版式：人抠出来站在深色背景上，旁边弹出一张「重点」文字卡
TEMPLATES.cutout_card = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 70% 30%, var(--bg-b), var(--bg-a) 70%)';
    this.grid = el('div', `position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent 0 90px, rgba(255,255,255,.05) 90px 92px),
      repeating-linear-gradient(90deg, transparent 0 90px, rgba(255,255,255,.05) 90px 92px)`);
    ctx.L.bg.appendChild(this.grid);
    ctx.base.style.opacity = 0;
    this.card = el('div', `position:absolute;left:70px;top:250px;width:620px;padding:34px 38px 40px;border-radius:26px;
      background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.18);backdrop-filter:blur(14px);box-shadow:0 30px 60px rgba(0,0,0,.35)`);
    this.card.appendChild(el('div', `display:inline-block;padding:6px 18px;border-radius:12px;background:var(--accent);color:var(--ink);
      font:800 38px var(--font-body);letter-spacing:.06em`, P.tag || 'KEY POINT'));
    const t = el('div', `margin-top:22px;color:var(--paper);font-size:${P.size || 74}px;line-height:1.05`, P.text || '');
    t.className = 'display';
    this.card.appendChild(t);
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .45));
    ctx.L.bg.style.opacity = clamp(p * 2);
    // person slides from centre to the right third
    const s = lerp(ctx.seg.zoom || 1, .9, p);
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `translateX(${lerp(0, 220, p)}px) scale(${s})`;
    ctx.personCv.style.filter = 'drop-shadow(0 0 40px rgba(0,0,0,.5))';
    const q = enter(ctx.t, .25, .45);
    this.card.style.opacity = Math.min(clamp(q * 2), leave(ctx));
    this.card.style.transform = `translateY(${lerp(80, 0, ease.back(q))}px)`;
  },
};
