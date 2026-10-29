// 人物分身 · 镜头特效：画面里同时出现两三个抠出来的自己（变小、错开、一个镜像），配气泡做「我 vs 我」
TEMPLATES.c59 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    ctx.personCv.style.filter = outline(6, '#fff', false);
    ctx.L.bg.style.background = pattern(P.background || 'grid');
    ctx.base.style.opacity = 0;
    const labels = P.labels || [];
    const at = (P.at || []).map(a => (ctx.words.find(w => n(w.w) === n(a)) || {}).s);
    this.clones = [
      { x: -330, mirror: true, s0: .2 }, { x: 330, mirror: false, s0: .45 },
    ].map((c, k) => {
      const cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 100%;-webkit-mask-image:linear-gradient(180deg,#000 55%,transparent 72%)');
      cv.width = 540; cv.height = 960;
      ctx.L.back.appendChild(cv);
      let bub = null;
      if (labels[k]) {
        bub = el('div', `position:absolute;top:430px;left:${540 + c.x * 1.1 - 170}px;width:340px;text-align:center;padding:18px 0 22px;background:var(--paper);color:var(--ink);
          border-radius:40px;font-size:62px;box-shadow:0 14px 30px rgba(0,0,0,.3);transform-origin:50% 100%`, labels[k]);
        bub.className = 'display';
        ctx.L.front.appendChild(bub);
      }
      return { ...c, cv, g: cv.getContext('2d'), bub, bt: at[k] != null ? at[k] : c.s0 + .6 };
    });
  },
  frame(ctx) {
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${lerp(1, .8, ease.out(enter(ctx.t, 0, .35)))})`;
    for (const c of this.clones) {
      c.g.clearRect(0, 0, 540, 960);
      c.g.drawImage(ctx.personCv, 0, 0, 540, 960);
      const q = enter(ctx.t, c.s0, .35), s = .62 * ease.pop(q);
      c.cv.style.opacity = clamp(q * 3);
      c.cv.style.transform = `translateX(${c.x}px) translateY(-300px) scale(${c.mirror ? -s : s}, ${s})`;
      if (c.bub) {
        const b = enter(ctx.t, c.bt - .05, .3);
        c.bub.style.opacity = Math.min(clamp(b * 3), leave(ctx));
        c.bub.style.transform = `scale(${ease.pop(b)})`;
      }
    }
  },
};
