// 撕纸转场 · 转场：当前画面沿锯齿状的纸边撕成两半飞开（白色纸纤维边 + 阴影），露出下面的新画面
// next-scene builder shared by batch-C transitions: params.to = image path | {frames, fps, count} | {title, sub}
function nextScene(to) {
  to = to || {}; // missing: a plain accent-coloured card, no text
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
TEMPLATES.paper_tear = {
  setup(ctx) {
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : 1.0;
    this.back = P.back !== false; // tear the next scene away again near the end? (no: just cut back)
    this.scene = nextScene(P.to);
    ctx.L.front.appendChild(this.scene.box);
    // jagged tear line, seeded
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pts = [];
    for (let x = -20; x <= 1100; x += 26) pts.push([x, 860 + x * .2 + (rnd() - .5) * 46]);
    const edge = (dy, amp) => pts.map(([x, y], j) => `${x}px ${y + dy + (j % 2 ? amp : -amp) * rnd()}px`);
    const topPoly = (dy, amp) => `polygon(0 -20px, 1100px -20px, ${edge(dy, amp).reverse().join(',')})`;
    const botPoly = (dy, amp) => `polygon(${edge(dy, amp).join(',')}, 1100px 1940px, -20px 1940px)`;
    const piece = (poly, white, shadow) => {
      const g = el('div', 'position:absolute;inset:0;transform-origin:50% 50%');
      g.appendChild(el('div', `position:absolute;inset:0;background:rgba(0,0,0,.35);clip-path:${shadow}`));
      g.appendChild(el('div', `position:absolute;inset:0;background:#fbfaf6;clip-path:${white}`));
      const wrap = el('div', `position:absolute;inset:0;overflow:hidden;clip-path:${poly}`);
      const img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%');
      wrap.appendChild(img); g.appendChild(wrap);
      ctx.L.front.appendChild(g);
      return { g, img };
    };
    this.A = piece(topPoly(-14, 4), topPoly(6, 12), topPoly(30, 10));
    this.B = piece(botPoly(14, 4), botPoly(-6, 12), botPoly(-30, 10));
  },
  frame(ctx) {
    const t0 = this.t0, on = ctx.t >= t0;
    this.scene.box.style.visibility = on ? 'visible' : 'hidden';
    this.scene.tick(ctx.t - t0);
    ctx.base.style.opacity = on ? 0 : 1;
    const src = ctx.baseImg.getAttribute('src');
    for (const P of [this.A, this.B]) { P.g.style.display = on ? '' : 'none'; if (on) { setImg(P.img, src); P.img.style.transform = `scale(${ctx.seg.zoom || 1})`; } }
    if (!on) return;
    const rip = ease.out(enter(ctx.t, t0, .22));
    const fly = Math.pow(enter(ctx.t, t0 + .12, .6), 2);
    this.A.g.style.transform = `translate(${-fly * 700}px, ${-rip * 18 - fly * 1300}px) rotate(${-rip * 2 - fly * 18}deg)`;
    this.B.g.style.transform = `translate(${fly * 600}px, ${rip * 18 + fly * 1500}px) rotate(${rip * 1.5 + fly * 14}deg)`;
  },
};
