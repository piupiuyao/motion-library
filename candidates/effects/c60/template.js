// 手势控制缩放 · 镜头特效：人抠出来放在图案背景上，到指定的词时身体变小或变大，像捏合手指缩放自己
TEMPLATES.c60 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    ctx.L.bg.style.background = pattern(P.background || 'dots');
    ctx.base.style.opacity = 0;
    ctx.personCv.style.filter = outline(8, '#fff');
    const steps = P.steps || [{ at: null, scale: .62 }, { at: null, scale: 1.3 }];
    this.steps = steps.map((st, k) => ({
      scale: st.scale,
      t: (st.at != null && (ctx.words.find(w => n(w.w) === n(st.at)) || {}).s) || ctx.d * (k + 1) / (steps.length + 1),
    }));
    // pinch / spread hint next to the hand
    this.hint = el('div', `position:absolute;left:760px;top:980px;width:220px;height:220px;border-radius:50%;background:var(--accent);
      display:flex;align-items:center;justify-content:center;font-size:120px;box-shadow:0 14px 34px rgba(0,0,0,.3);opacity:0`, '🤏');
    this.arrows = el('div', `position:absolute;left:740px;top:930px;width:260px;height:320px;font:900 90px/1 sans-serif;color:var(--paper);opacity:0;
      display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-shadow:0 4px 12px rgba(0,0,0,.4)`, '<div>⇱</div><div>⇲</div>');
    ctx.L.front.append(this.arrows, this.hint);
  },
  frame(ctx) {
    let s = 1, last = -9, k = -1;
    for (let i = 0; i < this.steps.length; i++) {
      const st = this.steps[i], p = ease.back(enter(ctx.t, st.t, .4));
      s = lerp(s, st.scale, p);
      if (ctx.t >= st.t - .3) { last = st.t; k = i; }
    }
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${s})`;
    // hint shows briefly around each change
    const h = clamp(1 - Math.abs(ctx.t - last - .1) / .45) * (k >= 0 ? 1 : 0);
    this.hint.style.opacity = h;
    this.hint.style.transform = `scale(${.8 + .2 * h})`;
    this.hint.textContent = k >= 0 && this.steps[k].scale < 1 ? '🤏' : '🖐️';
    this.arrows.style.opacity = h;
  },
};
