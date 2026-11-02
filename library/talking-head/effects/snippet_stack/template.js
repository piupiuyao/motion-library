// 摘录条甩入堆叠 · 素材：黑底，人缩进中下方小矩形窗；上方一条条细长的截图摘录条从左边甩进来（梯形变形后压平），从上往下排成列表
TEMPLATES.snippet_stack = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const items = (P.items || []).filter(it => it && it.image).slice(0, 5);
    this.off = !items.length;                     // material missing: render nothing (person stays full screen)
    if (this.off) return;
    ctx.L.bg.style.background = `linear-gradient(rgba(255,255,255,.045) 2px, transparent 2px) 0 0/72px 72px,
      linear-gradient(90deg, rgba(255,255,255,.045) 2px, transparent 2px) 0 0/72px 72px, #070707`;
    // person window (base-video px → stage px)
    const ww = P.window ? P.window[0] : 500, wh = P.window ? P.window[1] : 540;
    this.dst = { x: 540 - ww / 2, y: 1405 - wh, w: ww, h: wh };
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const sw = 820, sh = sw * wh / ww;
    this.src = { x: fx - sw / 2, y: fy - sh * .36, w: sw, h: sh };
    // strips
    const SW = P.width || 880;
    let y = P.top || 230;
    this.items = items.map((it, j) => {
      const c = it.crop || null;
      const h = Math.round(clamp(c ? SW * c[3] / c[2] : 120, 70, 230));
      const strip = el('div', `position:absolute;left:${P.left != null ? P.left : 70}px;top:${y}px;width:${SW}px;height:${h}px;overflow:hidden;background:#fff;
        border-left:10px solid var(--accent);box-sizing:border-box;box-shadow:0 10px 26px rgba(0,0,0,.55);transform-origin:0 50%;opacity:0`);
      const img = el('img', 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover');
      img.src = url(it.image);
      pending.push(img.decode().catch(() => {}));
      strip.appendChild(img);
      ctx.L.front.appendChild(strip);
      y += h + (P.gap || 30);
      const t = it.at != null ? at(it.at) : null;
      return { strip, img, c, w: SW - 10, h, t: t != null ? t : .35 + j * Math.max(.6, (ctx.d - 1.2) / items.length) };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    const k = ease.out(enter(ctx.t, 0, .3));
    const { src, dst } = this;
    const S1 = dst.w / src.w, S = lerp(z, S1, k);
    const tx = lerp(540 - 540 * z, dst.x - src.x * S1, k), ty = lerp(960 - 960 * z, dst.y - src.y * S1, k);
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${tx}px,${ty}px) scale(${S})`;
    const top = lerp(0, src.y, k), left = lerp(0, src.x, k);
    const bot = lerp(0, 1920 - src.y - src.h, k), right = lerp(0, 1080 - src.x - src.w, k);
    ctx.base.style.clipPath = `inset(${top}px ${right}px ${bot}px ${left}px round ${lerp(0, 18 / S1, k)}px)`;
    const out = leave(ctx, .2);
    for (const it of this.items) {
      // screenshot crop → fill the strip
      if (it.c && it.img.naturalWidth) {
        const s = Math.max(it.w / it.c[2], it.h / it.c[3]);
        it.img.style.cssText = `position:absolute;max-width:none;left:${-it.c[0] * s}px;top:${-it.c[1] * s}px;width:${it.img.naturalWidth * s}px;height:${it.img.naturalHeight * s}px`;
      }
      const q = enter(ctx.t, it.t - .1, .38), e = ease.out(q);
      // flung paper: comes in from the left, right end narrowed and lifted, then flattens
      it.strip.style.opacity = Math.min(clamp(q * 5), out);
      it.strip.style.transform = `translateX(${lerp(-1150, 0, e)}px) perspective(900px) rotateY(${lerp(58, 0, e)}deg) rotateZ(${lerp(-9, 0, e)}deg)`;
    }
  },
};
