// 资料飞入 · 素材：原画面虚化做底，截图卡片一张张从下方飞入叠放，人缩在左上小圆窗
TEMPLATES.doc_fly = {
  setup(ctx) {
    this.off = !(ctx.params.images || []).length; // material missing: render nothing
    if (this.off) return;
    ctx.base.style.filter = 'blur(22px) brightness(.45)';
    const imgs = ctx.params.images || [];
    const at = (ctx.params.at || []).map(a => (ctx.words.find(w => w.w.toLowerCase().replace(/[^\w]/g, '') === a.toLowerCase()) || {}).s);
    const rots = [-6, 5, -3, 4];
    this.cards = imgs.map((src, k) => {
      const c = el('div', `position:absolute;left:110px;width:860px;top:${380 + k * 150}px;padding:14px;background:var(--paper);
        border-radius:28px;box-shadow:0 30px 70px rgba(0,0,0,.45)`);
      const im = el('img', 'display:block;width:100%;border-radius:18px');
      im.src = url(src); pending.push(im.decode().catch(() => {}));
      c.appendChild(im);
      ctx.L.front.appendChild(c);
      return { c, s: at[k] != null ? at[k] - .1 : ctx.d * .7 * k / Math.max(1, imgs.length), rot: rots[k % 4] };
    });
    this.pip = el('div', 'position:absolute;left:60px;top:150px;width:290px;height:290px;border-radius:50%;overflow:hidden;border:8px solid var(--paper);box-shadow:0 14px 40px rgba(0,0,0,.4)');
    this.pipImg = el('img', 'position:absolute;width:1080px;height:1920px;transform-origin:0 0');
    this.pip.appendChild(this.pipImg);
    ctx.L.front.appendChild(this.pip);
  },
  frame(ctx) {
    if (this.off) return;
    const out = leave(ctx);
    for (const it of this.cards) {
      const p = enter(ctx.t, it.s, .45);
      it.c.style.opacity = Math.min(clamp(p * 3), out);
      it.c.style.transform = `translateY(${lerp(900, 0, ease.out(p))}px) rotate(${lerp(it.rot * 2.5, it.rot, ease.out(p))}deg)`;
    }
    setImg(this.pipImg, ctx.baseImg.getAttribute('src'));
    const s = .36, fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 150;
    this.pipImg.style.transform = `translate(${145 - s * fx}px, ${145 - s * fy}px) scale(${s})`;
    const q = enter(ctx.t, 0, .35);
    this.pip.style.transform = `scale(${ease.pop(q)})`;
    this.pip.style.opacity = out;
  },
};
