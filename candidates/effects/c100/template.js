// 竖屏片尾推荐卡 · 片头片尾：结尾背景虚化压暗，「Watch next」标题 + 大圆角视频卡 + 圆头像和订阅按钮依次滑入弹出
TEMPLATES.c100 = {
  setup(ctx) {
    const P = ctx.params;
    this.media = P.media || { frames: 'assets/broll_inbox', fps: 30, count: 165, offset: 2.5 };
    // blurred background: draw the frame tiny + soft, scale up (cheap compared with CSS blur on a full frame)
    this.bl = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.bl.width = 108; this.bl.height = 192;
    this.bg = this.bl.getContext('2d');
    this.dim = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,8,12,.55), rgba(8,8,12,.78))');
    ctx.L.front.append(this.bl, this.dim);
    // deco: thin lines + glow dots
    this.deco = el('div', 'position:absolute;inset:0');
    this.deco.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0">
      <path d="M60 330 H200 M880 330 H1020 M90 900 L150 900 L150 1240 M990 900 L930 900 L930 1240" stroke="rgba(255,255,255,.55)" stroke-width="4" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/></svg>`;
    this.decoPath = this.deco.querySelector('path');
    this.dots = [[120, 420], [960, 520], [80, 1180], [1000, 1080], [880, 260], [200, 1320]].map(([x, y], j) => {
      const e = el('div', `position:absolute;left:${x}px;top:${y}px;width:${14 + (j % 3) * 6}px;height:${14 + (j % 3) * 6}px;margin:-10px;border-radius:50%;
        background:var(--accent);box-shadow:0 0 18px 6px color-mix(in srgb, var(--accent) 60%, transparent)`);
      this.deco.appendChild(e); return e;
    });
    this.title = el('div', `position:absolute;left:0;right:0;top:250px;text-align:center;color:#fff;font-size:118px;text-transform:uppercase;white-space:nowrap`,
      P.title || 'Watch next');
    this.title.className = 'display';
    this.bar = el('div', 'position:absolute;left:390px;top:385px;width:300px;height:12px;border-radius:6px;background:var(--accent)');
    // next-video card
    this.card = el('div', `position:absolute;left:110px;top:450px;width:860px;height:500px;border-radius:40px;overflow:hidden;background:#222;
      border:6px solid #fff;box-shadow:0 30px 70px rgba(0,0,0,.55), 0 0 40px color-mix(in srgb, var(--accent) 45%, transparent)`);
    this.thumb = el('img', 'position:absolute;left:0;top:-80px;width:100%;height:auto');
    this.card.appendChild(this.thumb);
    this.card.appendChild(el('div', 'position:absolute;inset:0;background:linear-gradient(180deg, transparent 45%, rgba(0,0,0,.82))'));
    this.card.appendChild(el('div', `position:absolute;left:50%;top:42%;width:140px;height:140px;margin:-70px;border-radius:50%;background:rgba(255,255,255,.92);
      display:flex;align-items:center;justify-content:center`, '<div style="margin-left:14px;border-left:50px solid #111;border-top:30px solid transparent;border-bottom:30px solid transparent"></div>'));
    this.card.appendChild(el('div', 'position:absolute;left:40px;right:40px;bottom:34px;color:#fff;font:800 54px/1.1 var(--font-body)', P.next || 'How I reply 10× faster'));
    // avatar + subscribe
    this.av = el('canvas', 'position:absolute;left:430px;top:1010px;width:220px;height:220px;border-radius:50%;border:6px solid #fff');
    this.av.width = 220; this.av.height = 220;
    this.ring = el('div', `position:absolute;left:400px;top:980px;width:280px;height:280px;border-radius:50%;
      border:4px solid color-mix(in srgb, var(--accent) 80%, transparent);box-shadow:0 0 30px color-mix(in srgb, var(--accent) 50%, transparent)`);
    this.ring2 = el('div', 'position:absolute;left:400px;top:980px;width:280px;height:280px;border-radius:50%;border:3px solid rgba(255,255,255,.5)');
    this.name = el('div', 'position:absolute;left:0;right:0;top:1265px;text-align:center;color:#fff;font:700 44px var(--font-body)', P.handle || '@monica');
    this.sub = el('div', `position:absolute;left:340px;top:1335px;width:400px;height:96px;border-radius:999px;background:#ff1f3d;color:#fff;
      font:800 46px/96px var(--font-body);text-align:center;letter-spacing:.04em;box-shadow:0 12px 30px rgba(255,31,61,.45)`, P.button || 'SUBSCRIBE');
    ctx.L.front.append(this.deco, this.title, this.bar, this.card, this.ring2, this.ring, this.av, this.name, this.sub);
    this.fx = ctx.focus[0] * W; this.fy = ctx.focus[1] * H;
  },
  draw(ctx) {
    const t = ctx.t, z = ctx.seg.zoom || 1, img = ctx.baseImg;
    // background blur in
    const b = ease.out(enter(t, 0, .45));
    const g = this.bg, sw = W / z, sh = H / z;
    g.filter = 'blur(2px)';
    g.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh, -4, -4, 116, 200);
    this.bl.style.opacity = b; this.dim.style.opacity = b;
    // avatar = face crop from the live frame
    const a = this.av.getContext('2d'), r = 300;
    a.drawImage(img, this.fx - r, this.fy - r * .9, r * 2, r * 2, 0, 0, 220, 220);
    // sequence
    const ti = enter(t, .2, .45), tc = enter(t, .45, .55), ta = enter(t, .9, .5), ts = enter(t, 1.25, .45);
    this.title.style.opacity = ti; this.title.style.transform = `translateY(${lerp(-70, 0, ease.out(ti))}px)`;
    this.bar.style.transform = `scaleX(${ease.out(enter(t, .4, .4))})`;
    this.card.style.opacity = clamp(tc * 3);
    this.card.style.transform = `translateY(${lerp(500, 0, ease.out(tc))}px) scale(${lerp(.85, 1, ease.back(tc))})`;
    setImg(this.thumb, mediaSrc(this.media, Math.max(0, t - .45)));
    const pa = ease.pop(ta);
    for (const e of [this.av, this.ring, this.ring2]) { e.style.opacity = clamp(ta * 3); }
    this.av.style.transform = `scale(${lerp(.2, 1, pa)})`;
    this.ring.style.transform = `scale(${lerp(.2, 1, pa) * (1 + .05 * Math.sin(t * 5))})`;
    const rq = ((t - .9) % 1.2) / 1.2;
    this.ring2.style.transform = `scale(${1 + rq * .35})`; this.ring2.style.opacity = ta >= 1 ? 1 - rq : 0;
    this.name.style.opacity = enter(t, 1.1, .3);
    this.sub.style.opacity = clamp(ts * 3);
    this.sub.style.transform = `scale(${lerp(.3, 1, ease.pop(ts)) * (1 + .04 * Math.max(0, Math.sin((t - 1.7) * 6)))})`;
    this.decoPath.style.strokeDashoffset = 1 - ease.inOut(enter(t, .5, .8));
    this.dots.forEach((e, j) => {
      const q = enter(t, .6 + j * .08, .3);
      e.style.opacity = q * (.6 + .4 * Math.sin(t * 3 + j));
      e.style.transform = `translateY(${Math.sin(t * 1.5 + j) * 12}px) scale(${ease.pop(q)})`;
    });
  },
  frame(ctx) {
    // the base frame may still be decoding when frame() runs (stills jump around): draw once it is ready
    const img = ctx.baseImg, go = () => this.draw(ctx);
    if (img.complete && img.naturalWidth) go(); else pending.push(img.decode().then(go, go));
  },
};
