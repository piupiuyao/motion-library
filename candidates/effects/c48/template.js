// 账号名牌条 · 版式：胶囊形标签（平台图标 + 名字 + @账号 + 关注按钮）从下方滑进来，2–3 秒后收回
TEMPLATES.c48 = {
  setup(ctx) {
    const P = ctx.params;
    this.wrap = el('div', `position:absolute;left:0;right:0;top:${P.y || 1240}px;display:flex;justify-content:center`);
    this.pill = el('div', `display:flex;align-items:center;gap:22px;padding:16px 16px 16px 16px;border-radius:999px;background:rgba(255,255,255,.96);
      box-shadow:0 18px 40px rgba(0,0,0,.3)`);
    this.pill.appendChild(el('div', `width:104px;height:104px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;
      background:${P.iconBg || 'linear-gradient(45deg,#f9a825,#e91e63 55%,#7b1fa2)'};color:#fff;font-size:54px`,
      P.icon || '<svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="#fff"/></svg>'));
    this.pill.appendChild(el('div', 'display:flex;flex-direction:column;padding-right:10px',
      `<span style="font:800 50px/1.05 var(--font-body);color:var(--ink)">${P.name || 'Monica'} <span style="color:#3d9bff;font-size:40px">✔</span></span>
       <span style="font:500 36px/1.2 var(--font-body);color:#777">${P.handle || '@monica'}</span>`));
    this.btn = el('div', 'padding:22px 40px;border-radius:999px;background:var(--accent);color:var(--ink);font:800 42px var(--font-body);white-space:nowrap', P.follow || 'Follow');
    if (P.follow !== false) this.pill.appendChild(this.btn);
    this.wrap.appendChild(this.pill);
    ctx.L.front.appendChild(this.wrap);
    this.t0 = P.at != null ? P.at : .3;
    this.hold = P.hold || 2.6;
  },
  frame(ctx) {
    const q = enter(ctx.t, this.t0, .5), out = ease.inOut(enter(ctx.t, Math.min(ctx.d - .5, this.t0 + this.hold), .4));
    this.pill.style.transform = `translateY(${lerp(320, 0, ease.back(q)) + out * 320}px)`;
    this.pill.style.opacity = Math.min(clamp(q * 3), 1 - out);
    // follow button taps to "Following" halfway through
    const tap = enter(ctx.t, this.t0 + 1.3, .2);
    this.btn.textContent = tap >= 1 ? 'Following' : (ctx.params.follow || 'Follow');
    this.btn.style.background = tap >= 1 ? '#e6e6e6' : 'var(--accent)';
    this.btn.style.transform = `scale(${1 - .12 * Math.sin(Math.PI * tap)})`;
  },
};
