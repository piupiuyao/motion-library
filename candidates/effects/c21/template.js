// 玻璃卡绕身 · 素材：一张半透明发光玻璃卡（图标 + 往上跳的数字）在 3D 空间里绕人转一圈，从人背后穿过
TEMPLATES.c21 = {
  setup(ctx) {
    const P = ctx.params;
    this.num = P.number ?? 12453;
    this.card = el('div', `position:absolute;left:0;top:0;width:420px;padding:28px 32px;border-radius:36px;box-sizing:border-box;
      background:linear-gradient(135deg,rgba(255,255,255,.34),rgba(255,255,255,.08));border:2px solid rgba(255,255,255,.55);
      backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 0 40px color-mix(in srgb, var(--accent) 45%, transparent),0 24px 50px rgba(0,0,0,.3);
      color:#fff;font-family:var(--font-body)`);
    this.card.innerHTML = `<div style="display:flex;align-items:center;gap:18px">
        <div style="width:84px;height:84px;border-radius:22px;background:${P.iconBg || 'linear-gradient(135deg,#ff5a5a,#d93025)'};display:flex;align-items:center;justify-content:center;font-size:52px">${P.icon || '✉️'}</div>
        <div style="font:700 34px var(--font-body);opacity:.9;line-height:1.1">${P.label || 'Unread emails'}</div></div>
      <div class="n display" style="font-size:118px;margin-top:20px;color:#fff;text-shadow:0 0 24px color-mix(in srgb, var(--accent) 80%, transparent)">0</div>
      <div style="margin-top:8px;font:700 30px var(--font-body);color:var(--accent)">▲ ${P.delta || '+128 today'}</div>`;
    this.n = this.card.querySelector('.n');
    this.cx = ctx.focus[0] * 1080; this.cy = ctx.focus[1] * 1920 + (P.dy ?? 330);
    this.R = P.radius || 350;
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const t = ctx.t, P = ctx.params;
    const orbit = ease.inOut(clamp((t - .2) / Math.max(1.5, ctx.d * .62)));
    const th = -.3 * Math.PI + orbit * 2 * Math.PI;
    const z = Math.cos(th), x = this.cx + this.R * Math.sin(th), y = this.cy + 90 * z;
    const layer = z < -.05 ? ctx.L.back : ctx.L.front;
    if (this.card.parentNode !== layer) layer.appendChild(this.card);
    const s = .72 + .28 * (z + 1) / 2;
    const pin = ease.out(enter(t, 0, .35));
    this.card.style.transform = `translate(${x - 210}px,${y - 150}px) perspective(1200px) rotateY(${Math.sin(th) * 55}deg) scale(${s * lerp(.3, 1, pin)})`;
    this.card.style.opacity = Math.min(pin, leave(ctx, .3)) * (z < -.05 ? .85 : 1);
    const v = Math.round(this.num * ease.out(clamp((t - .3) / (ctx.d * .75))));
    this.n.textContent = (P.prefix || '') + v.toLocaleString('en-US') + (P.suffix || '');
  },
};
