// 画面缩进手机 · 版式：全屏口播缩进一个手机外框里，浮在彩色背景上，像「手机上刷到的一条视频」，周围放字
TEMPLATES.phone_frame = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = P.bg || 'radial-gradient(circle, rgba(255,255,255,.22) 10px, transparent 11px) 0 0/64px 64px, linear-gradient(160deg, var(--accent), var(--bg-b))';
    this.s = .6; this.cy = 850;
    this.body = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;background:#0d0d0f;transform-origin:50% 50%;box-shadow:0 40px 80px rgba(0,0,0,.45)');
    ctx.L.bg.appendChild(this.body);
    this.island = el('div', 'position:absolute;left:50%;top:0;width:200px;height:56px;margin-left:-100px;border-radius:28px;background:#0d0d0f');
    ctx.L.front.appendChild(this.island);
    // feed UI drawn on top of the shrunk video
    this.ui = el('div', 'position:absolute;inset:0;transform-origin:50% 50%');
    // feed side-bar icons from the icon library (white, filled like the TikTok / Reels UI); counts are neutral demo-style numbers
    const icon = (name, n, fill) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff;font:800 40px var(--font-body);text-shadow:0 2px 8px rgba(0,0,0,.5)">
      <span style="display:block;width:92px;height:92px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))">${iconSvg(iconFind('ui:' + name), '#ffffff').replace('fill="none"', fill ? 'fill="#ffffff"' : 'fill="none"')}</span>${n}</div>`;
    this.ui.appendChild(el('div', 'position:absolute;right:50px;top:860px;display:flex;flex-direction:column;gap:40px', icon('heart', '12.4K', 1) + icon('message-circle-more', '318', 0) + icon('forward', 'Share', 0)));
    this.ui.appendChild(el('div', 'position:absolute;left:60px;top:1330px;color:#fff;font:800 64px var(--font-body);text-shadow:0 2px 10px rgba(0,0,0,.6)', P.handle || ''));
    this.ui.appendChild(el('div', 'position:absolute;left:60px;top:1420px;width:760px;color:#fff;font:500 50px/1.2 var(--font-body);text-shadow:0 2px 10px rgba(0,0,0,.6)', P.desc || ''));
    ctx.L.front.appendChild(this.ui);
    this.label = el('div', 'position:absolute;left:0;right:0;top:95px;text-align:center;font-size:92px;color:var(--ink)', P.text || 'SAW THIS ON MY FEED');
    this.label.className = 'display';
    ctx.L.front.appendChild(this.label);
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, .15, .65)), out = ease.inOut(enter(ctx.t, ctx.d - .45, .45));
    const k = p * (1 - out);
    const s = lerp(ctx.seg.zoom || 1, this.s, k), dy = lerp(0, this.cy - 960, k);
    const r = lerp(0, 80, k) / s;
    const tf = `translateY(${dy}px) scale(${s})`;
    ctx.base.style.transform = tf;
    ctx.base.style.clipPath = `inset(0 round ${r}px)`;
    const b = 26 / s; // bezel width in unscaled px
    this.body.style.transform = tf;
    this.body.style.clipPath = 'none';
    this.body.style.left = -b + 'px'; this.body.style.top = -b + 'px';
    this.body.style.width = 1080 + 2 * b + 'px'; this.body.style.height = 1920 + 2 * b + 'px';
    this.body.style.borderRadius = (r + b) + 'px';
    this.body.style.transformOrigin = `${540 + b}px ${960 + b}px`;
    this.body.style.opacity = clamp(k * 3);
    this.island.style.transform = `translateY(${960 + dy - 960 * s + 40 * s}px) scale(${s})`;
    this.island.style.opacity = clamp(k * 3);
    this.ui.style.transform = tf;
    this.ui.style.opacity = clamp((k - .6) * 3);
    const q = enter(ctx.t, .6, .4);
    this.label.style.opacity = Math.min(clamp(q * 3), 1 - out);
    this.label.style.transform = `scale(${ease.pop(q)}) rotate(-2deg)`;
  },
};
