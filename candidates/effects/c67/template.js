// 变焦模糊转场 · 转场：画面猛地往中间冲、带强烈的放射模糊，下一个画面从模糊里冲出来对上焦
// next-scene builder shared by batch-C transitions: params.to = image path | {frames, fps, count} | {title, sub}
function candC_scene(to) {
  to = to || { title: 'PART 2', sub: 'Why replying is hard' };
  const box = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden');
  let tick = () => {};
  if (typeof to === 'string') {
    box.style.background = 'radial-gradient(ellipse at 50% 35%, var(--bg-b), var(--bg-a) 75%)';
    const card = el('div', 'position:absolute;left:60px;top:380px;width:960px;border-radius:30px;overflow:hidden;background:#fff;box-shadow:0 30px 70px rgba(0,0,0,.5)');
    const img = el('img', 'display:block;width:100%');
    img.src = url(to); pending.push(img.decode().catch(() => {}));
    card.appendChild(img); box.appendChild(card);
  } else if (to.frames) {
    box.style.background = '#000';
    const img = el('img', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${to.pos || '100% 50%'}`);
    box.appendChild(img);
    tick = t => setImg(img, mediaSrc(to, Math.max(0, t)));
  } else {
    box.style.background = to.bg || 'var(--accent)';
    box.appendChild(el('div', 'position:absolute;inset:0;background:radial-gradient(circle, rgba(0,0,0,.08) 9px, transparent 10px) 0 0/60px 60px'));
    const t = el('div', `position:absolute;left:80px;right:80px;top:720px;color:var(--ink);font-size:${to.size || 170}px;text-align:center`, to.title || '');
    t.className = 'display';
    box.appendChild(t);
    if (to.sub) box.appendChild(el('div', 'position:absolute;left:80px;right:80px;top:1130px;color:var(--ink);font:700 64px var(--font-body);text-align:center;opacity:.75', to.sub));
  }
  return { box, tick };
}
TEMPLATES.c67 = {
  setup(ctx) {
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : .9;
    this.N = 8;
    // zoom-blur = several copies stacked at growing scales
    this.outBox = el('div', 'position:absolute;inset:0');
    this.outs = Array.from({ length: this.N }, (_, i) => {
      const img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 42%');
      this.outBox.appendChild(img); return img;
    });
    this.inBox = el('div', 'position:absolute;inset:0;background:#000');
    this.ins = Array.from({ length: this.N }, () => {
      const s = candC_scene(P.to);
      s.box.style.transformOrigin = '50% 42%';
      this.inBox.appendChild(s.box); return s;
    });
    this.flash = el('div', 'position:absolute;inset:0;background:#fff;pointer-events:none');
    ctx.L.front.append(this.outBox, this.inBox, this.flash);
  },
  frame(ctx) {
    const t0 = this.t0, a = .28, b = .4;
    const pOut = enter(ctx.t, t0 - a, a), pIn = enter(ctx.t, t0, b);
    const outOn = ctx.t >= t0 - a && ctx.t < t0, inOn = ctx.t >= t0;
    this.outBox.style.display = outOn ? '' : 'none';
    this.inBox.style.display = inOn ? '' : 'none';
    ctx.base.style.opacity = outOn || inOn ? 0 : 1;
    if (outOn) {
      const e = pOut * pOut, src = ctx.baseImg.getAttribute('src'), z = ctx.seg.zoom || 1;
      this.outs.forEach((img, i) => {
        setImg(img, src);
        img.style.transform = `scale(${z * (1 + e * 1.4) * (1 + i * e * .09)})`;
        img.style.opacity = i ? .3 * e + (1 - e) * 0 : 1;
      });
    }
    if (inOn) {
      const e = 1 - ease.out(pIn);
      this.ins.forEach((s, i) => {
        s.tick(ctx.t - t0);
        s.box.style.transform = `scale(${(1 + e * 1.2) * (1 + i * e * .08)})`;
        s.box.style.opacity = i ? .3 * e : 1;
      });
    }
    const f = Math.max(0, 1 - Math.abs(ctx.t - t0) / .12);
    this.flash.style.opacity = f * .6;
  },
};
