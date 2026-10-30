// 收据结尾 · 这条视频专用：最后一张小票从下方打出「COMMENT: MONEY」和条形码，和开头的收据首尾呼应
TEMPLATES.receipt_cta = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w$]/g, '');
    const hit = P.at && ctx.words.find(x => norm(x.w).startsWith(norm(P.at)));
    this.t0 = hit ? hit.s - .15 : .2;
    const INK = '#1d1c1a', RED = '#d4342b', MONO = "'SF Mono', Menlo, 'Courier New', monospace";
    const bars = Array.from({ length: 46 }, (_, i) => `<i style="display:inline-block;width:${[3, 6, 2, 4][(i * 7) % 4]}px;height:56px;margin-right:${[2, 3, 4][(i * 5) % 3]}px;background:${INK}"></i>`).join('');
    this.card = el('div', `position:absolute;left:${P.x ?? 40}px;top:${P.y ?? 960}px;width:${P.width || 440}px;box-sizing:border-box;padding:26px 30px 28px;
      background:#fbfaf6;color:${INK};font-family:${MONO};border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.25);text-align:center`,
      `<div style="font:700 22px ${MONO};letter-spacing:.18em;opacity:.55">${P.kicker || 'FREE CHECKLIST'}</div>
       <div style="font:800 40px ${MONO};margin-top:10px">COMMENT</div>
       <div style="font:900 96px/1.05 ${MONO};color:${RED};letter-spacing:.02em">${(P.keyword || '').toUpperCase()}</div>
       <div style="margin-top:16px;white-space:nowrap;overflow:hidden">${bars}</div>`);
    if (!P.keyword) { this.off = true; return; }
    this.off = false;
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    if (this.off) return;
    const q = enter(ctx.t, this.t0, .5), out = enter(ctx.t, ctx.d - .3, .3);
    this.card.style.opacity = clamp(q * 2) * (1 - out);
    this.card.style.clipPath = `inset(0 0 ${(1 - ease.out(q)) * 100}% 0)`;
    this.card.style.transform = `translateY(${lerp(30, 0, ease.out(q))}px)`;
  },
};
