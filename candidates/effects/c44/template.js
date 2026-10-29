// 绿幕讲解 · 版式：一个网页/截图铺满做背景并慢慢滚动推近，抠出的人站在下方大大地讲
TEMPLATES.c44 = {
  setup(ctx) {
    const P = ctx.params;
    ctx.base.style.opacity = 0;
    ctx.L.bg.style.background = '#f3f3f3';
    const imgs = P.images || ['assets/docs/gmail.jpg', 'assets/docs/chat.jpg'];
    this.page = el('div', 'position:absolute;left:0;top:0;width:1080px;transform-origin:50% 0');
    this.page.appendChild(el('div', `height:110px;background:#e8e8ec;display:flex;align-items:center;gap:16px;padding:0 30px;border-bottom:2px solid #d0d0d6`,
      `<span style="width:26px;height:26px;border-radius:50%;background:#ff5f57"></span><span style="width:26px;height:26px;border-radius:50%;background:#febc2e"></span>
       <span style="width:26px;height:26px;border-radius:50%;background:#28c840"></span>
       <span style="flex:1;margin-left:20px;height:62px;border-radius:31px;background:#fff;font:500 32px/62px var(--font-body);color:#666;padding-left:30px">${P.address || 'mail.example.com/inbox'}</span>`));
    for (const src of imgs) {
      const img = el('img', 'display:block;width:1080px');
      img.src = url(src); pending.push(img.decode().catch(() => {}));
      this.page.appendChild(img);
    }
    ctx.L.bg.appendChild(this.page);
    this.shade = el('div', 'position:absolute;left:0;right:0;bottom:0;height:900px;background:linear-gradient(transparent, rgba(0,0,0,.45))');
    ctx.L.bg.appendChild(this.shade);
    ctx.personCv.style.filter = outline(7, '#fff');
    this.scroll = P.scroll != null ? P.scroll : 500;
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .45));
    ctx.L.bg.style.opacity = clamp(p * 2);
    const s = ease.inOut(enter(ctx.t, .4, ctx.d - .4));
    this.page.style.transform = `translateY(${-this.scroll * s}px) scale(${lerp(1, 1.12, s)})`;
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `translateY(${lerp(0, 60, p)}px) scale(${lerp(ctx.seg.zoom || 1, .74, p)})`;
  },
};
