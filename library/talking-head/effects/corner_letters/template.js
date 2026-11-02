// 四角分字框人 · 版式：黑底，人缩进中间一个竖长硬边矩形窗；一个词拆成四块超大白字钉在画面四个角上，压住人窗的边
TEMPLATES.corner_letters = {
  setup(ctx) {
    const P = ctx.params;
    const raw = String(P.text || '').trim();
    // split: words if there are spaces, else characters (CJK or Latin letters)
    let parts = /\s/.test(raw) ? raw.split(/\s+/) : Array.from(raw.replace(/[-·]/g, ''));
    parts = parts.slice(0, 4);
    this.off = !parts.length;                      // 必填: no text → render nothing (person stays full screen)
    if (this.off) return;
    ctx.L.bg.style.background = '#000';
    const ww = P.window ? P.window[0] : 640, wh = P.window ? P.window[1] : 1280;
    this.dst = { x: 540 - ww / 2, y: 1600 - wh, w: ww, h: wh };
    const fx = ctx.focus[0] * 1080;
    const sw = Math.min(1080, 1920 * ww / wh), sh = sw * wh / ww;
    this.src = { x: clamp(fx - sw / 2, 0, 1080 - sw), y: (1920 - sh) / 2, w: sw, h: sh };
    const longest = Math.max(...parts.map(p => Array.from(p).length));
    const cjk = /[㐀-鿿]/.test(raw);
    const size = P.size || (longest <= 1 ? (cjk ? 250 : 300) : Math.max(110, Math.round(520 / longest)));
    const d = this.dst;
    // corners: tl, tr, bl, br — each letter centred on the window corner, pushed outward a little
    const spots = [[d.x, d.y - 30], [d.x + d.w, d.y - 30], [d.x, d.y + d.h + 115], [d.x + d.w, d.y + d.h + 115]];
    const rot = [-6, 5, 4, -5];
    this.items = parts.map((p, j) => {
      const e = el('div', `position:absolute;left:0;top:0;font-size:${size}px;color:${P.color || 'var(--paper)'};white-space:nowrap;text-transform:uppercase;
        text-shadow:0 6px 0 rgba(0,0,0,.35),0 14px 30px rgba(0,0,0,.5);letter-spacing:0`, p);
      e.className = 'display';
      ctx.L.front.appendChild(e);
      return { e, x: spots[j][0], y: spots[j][1], r: rot[j], delay: j * .05 };
    });
    this.t0 = .15;
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    const k = ease.out(enter(ctx.t, 0, .25));
    const { src, dst } = this;
    const S1 = dst.w / src.w, S = lerp(z, S1, k);
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${lerp(540 - 540 * z, dst.x - src.x * S1, k)}px,${lerp(960 - 960 * z, dst.y - src.y * S1, k)}px) scale(${S})`;
    ctx.base.style.clipPath = `inset(${lerp(0, src.y, k)}px ${lerp(0, 1080 - src.x - src.w, k)}px ${lerp(0, 1920 - src.y - src.h, k)}px ${lerp(0, src.x, k)}px)`;
    const out = leave(ctx, .2);
    for (const it of this.items) {
      const q = enter(ctx.t, this.t0 + it.delay, .4);
      it.e.style.opacity = Math.min(clamp(q * 4), out);
      it.e.style.transform = `translate(${it.x}px,${it.y}px) translate(-50%,-50%) scale(${lerp(.2, 1, ease.pop(q))}) rotate(${it.r}deg)`;
    }
  },
};
