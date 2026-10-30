// 素材环形阵列 · 素材：很多小圆角卡片（截图/B-roll）一张张弹出，围着中间的标题排成一圈，然后镜头拉远露出更多
TEMPLATES.c29 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const pool = P.images || [];
    if (!pool.length) { this.off = true; return; }   // needs_assets: no pictures → render nothing
    this.bgc = el('div', 'position:absolute;inset:0;background:radial-gradient(circle at 50% 43%, var(--bg-b), var(--bg-a) 70%)');
    ctx.L.back.appendChild(this.bgc);
    this.cam = el('div', 'position:absolute;inset:0;transform-origin:540px 820px');
    ctx.L.back.appendChild(this.cam);
    const rings = [[10, 400, 200, 260], [16, 680, 170, 220]];
    this.cards = [];
    let k = 0;
    rings.forEach(([n, R, w, h], ri) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i / n * Math.PI * 2 + ri * .2;
        const x = 540 + Math.cos(a) * R, y = 820 + Math.sin(a) * R * 1.12;
        const c = el('div', `position:absolute;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;border-radius:26px;overflow:hidden;
          box-shadow:0 14px 30px rgba(0,0,0,.45);border:4px solid rgba(255,255,255,.85);background:#333`);
        const im = el('img', `width:100%;height:100%;object-fit:cover;object-position:${(k * 37) % 100}% ${(k * 53) % 70}%`);
        im.src = url(pool[k % pool.length]); pending.push(im.decode().catch(() => {}));
        c.appendChild(im);
        this.cam.appendChild(c);
        this.cards.push({ c, ri, i, n, rot: Math.sin(k * 3.1) * 8 });
        k++;
      }
    });
    this.title = el('div', `position:absolute;left:240px;width:600px;top:700px;text-align:center;font-size:${P.size || 120}px;color:var(--paper);line-height:.95`,
      P.text || '');
    this.title.className = 'display';
    this.cam.appendChild(this.title);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, d = ctx.d, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.cam.style.opacity = out;
    const zoomOut = ease.inOut(enter(t, d * .5, d * .4));
    this.cam.style.transform = `scale(${lerp(1.25, .82, zoomOut)}) rotate(${lerp(-4, 2, t / d)}deg)`;
    for (const it of this.cards) {
      const t0 = it.ri ? d * .5 + it.i / it.n * d * .3 : .15 + it.i / it.n * d * .4;
      const q = enter(t, t0, .3);
      it.c.style.opacity = clamp(q * 3);
      it.c.style.transform = `scale(${ease.pop(q)}) rotate(${it.rot}deg)`;
    }
    const q = enter(t, .1, .35);
    this.title.style.opacity = q;
    this.title.style.transform = `scale(${lerp(.5, 1, ease.pop(q))})`;
  },
};
