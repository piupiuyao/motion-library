// 账号名牌条 · 版式：胶囊形标签（平台图标 + 名字 + @账号 + 关注按钮）从下方滑进来，2–3 秒后收回
TEMPLATES.c48 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.name && !P.handle) { this.off = true; return; }   // 必填: no name / handle → render nothing
    this.wrap = el('div', `position:absolute;left:0;right:0;top:${P.y || 1240}px;display:flex;justify-content:center`);
    this.pill = el('div', `display:flex;align-items:center;gap:22px;padding:16px 16px 16px 16px;border-radius:999px;background:rgba(255,255,255,.96);
      box-shadow:0 18px 40px rgba(0,0,0,.3)`);
    // platform icon from the icon library: platform = a name ('Instagram', 'TikTok', 'YouTube', 'X'); one-colour mark on its brand colour
    // when the library has one, else the full-colour logo on white. icon (HTML/emoji) still overrides. No match → no icon.
    const pf = P.icon ? null : (iconFind('brand:' + (P.platform || 'Instagram')) || iconFind(P.platform || 'Instagram'));
    const tile = pf ? iconTile(pf, 104, P.iconBg ? { bg: P.iconBg } : {}) : P.icon ? el('div', `width:104px;height:104px;display:flex;align-items:center;justify-content:center;
      background:${P.iconBg || 'var(--accent)'};color:#fff;font-size:54px`, P.icon) : null;
    if (tile) { tile.style.cssText += ';flex:none;border-radius:50%;box-shadow:none'; if (pf) tile.style.padding = '26px'; this.pill.appendChild(tile); }
    this.pill.appendChild(el('div', 'display:flex;flex-direction:column;padding-right:10px',
      `<span style="font:800 50px/1.05 var(--font-body);color:var(--ink)">${P.name || P.handle} <span style="color:#3d9bff;font-size:40px">✔</span></span>
       <span style="font:500 36px/1.2 var(--font-body);color:#777">${P.name ? P.handle || '' : ''}</span>`));
    this.btn = el('div', 'padding:22px 40px;border-radius:999px;background:var(--accent);color:var(--ink);font:800 42px var(--font-body);white-space:nowrap', P.follow || 'Follow');
    if (P.follow !== false) this.pill.appendChild(this.btn);
    this.wrap.appendChild(this.pill);
    ctx.L.front.appendChild(this.wrap);
    this.t0 = P.at != null ? P.at : .3;
    this.hold = P.hold || 2.6;
  },
  frame(ctx) {
    if (this.off) return;
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
