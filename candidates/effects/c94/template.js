// 液态玻璃卡 · 版式：苹果 iOS 新设计风格的大圆角玻璃框，框内画面被模糊、边缘有折射高光，框里放图标和白字；从小到大弹出并轻轻漂浮
TEMPLATES.c94 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.text) { this.off = true; return; } // required: not shown without text
    const W = P.width || 760, Hh = P.height || 230;
    this.W = W; this.H = Hh;
    const x = (1080 - W) / 2, y = P.y || 250;
    this.x = x; this.y = y;
    const r = Math.round(Hh * .5 * (P.round || .62));
    this.card = el('div', `position:absolute;left:${x}px;top:${y}px;width:${W}px;height:${Hh}px;border-radius:${r}px;overflow:hidden;
      transform-origin:50% 50%;box-shadow:0 24px 60px rgba(0,0,0,.28)`);
    // glass body: a blurred, slightly magnified copy of what is behind (cheap: video drawn into a small canvas, scaled up)
    this.cv = el('canvas', `position:absolute;left:${-x}px;top:${-y}px;width:1080px;height:1920px;transform-origin:${540}px ${960}px`);
    this.cv.width = 108; this.cv.height = 192;
    this.card.appendChild(this.cv);
    // edge refraction: a sharper, magnified ring of the background near the rim
    this.rim = el('canvas', `position:absolute;left:${-x}px;top:${-y}px;width:1080px;height:1920px;transform-origin:${x + W / 2}px ${y + Hh / 2}px;
      -webkit-mask-image:radial-gradient(ellipse ${W / 2}px ${Hh / 2}px at ${x + W / 2}px ${y + Hh / 2}px, transparent 72%, #000 100%)`);
    this.rim.width = 270; this.rim.height = 480;
    this.card.appendChild(this.rim);
    this.card.appendChild(el('div', `position:absolute;inset:0;border-radius:${r}px;background:linear-gradient(160deg, rgba(255,255,255,.42), rgba(255,255,255,.16) 55%, rgba(255,255,255,.28));
      box-shadow:inset 0 0 0 2px rgba(255,255,255,.75), inset 0 10px 22px rgba(255,255,255,.55), inset 0 -14px 26px rgba(255,255,255,.25), inset 0 -2px 0 rgba(0,0,0,.08)`));
    const inner = el('div', `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:30px;padding:0 40px`);
    if (P.icon) inner.appendChild(el('div', `flex:none;width:${Hh * .56}px;height:${Hh * .56}px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;
      font-size:${Hh * .32}px;box-shadow:0 6px 16px rgba(0,0,0,.18);color:var(--ink)`,
      // icon: a name or word from the icon library ('Slack', 'idea', 'ui:wallet') drawn in the white circle; an emoji is shown as is
      (ic => ic ? `<div style="width:${ic.kind === 'ui' ? 52 : 58}%;height:${ic.kind === 'ui' ? 52 : 58}%">${iconSvg(ic)}</div>` : P.icon)(/[a-z0-9]/i.test(P.icon) ? iconFind(P.icon) : null)));
    inner.appendChild(el('div', `font:800 ${P.size || 66}px/1.05 var(--font-body);color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.35)`, P.text));
    this.card.appendChild(inner);
    ctx.L.front.appendChild(this.card);
    this.t0 = P.t0 != null ? P.t0 : .2;
  },
  frame(ctx) {
    if (this.off) return;
    const q = enter(ctx.t, this.t0, .7), pout = ease.inOut(enter(ctx.t, ctx.d - .4, .32));
    const s = q <= 0 ? .001 : lerp(.3, 1, ease.pop(q)) * (1 - pout * .7);
    const bob = Math.sin(ctx.t * 2.2) * 8;
    this.card.style.opacity = Math.min(clamp(q * 4), 1 - pout);
    this.card.style.transform = `translateY(${bob}px) scale(${Math.max(.001, s)})`;
    const z = ctx.seg.zoom || 1, img = ctx.baseImg;
    // keep the blurred copy lined up with the real frame behind the card (undo the card's own scale)
    this.cv.style.transform = `translateY(${-bob}px) scale(${z * 1.05})`;
    this.rim.style.transform = `translateY(${-bob}px) scale(${z * 1.12})`;
    const cx = this.cv.getContext('2d'), rx = this.rim.getContext('2d');
    pending.push(img.decode().catch(() => {}).then(() => {
      cx.drawImage(img, 0, 0, 108, 192);
      rx.drawImage(img, 0, 0, 270, 480);
    }));
  },
};
