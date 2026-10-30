// 扫描线质感 + 大字 · 镜头特效：画面压暗加扫描线和噪点闪烁，大字按她说的词一个个跳出来，带红蓝错位
TEMPLATES.scanline_word = {
  setup(ctx) {
    this.off = !(ctx.params.words || ctx.params.keywords || []).length; // no words given: render nothing
    if (this.off) return;
    const P = ctx.params;
    this.lines = el('div', `position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.32) 0 3px, transparent 3px 7px);mix-blend-mode:multiply`);
    this.band = el('div', 'position:absolute;left:0;right:0;height:180px;background:linear-gradient(180deg, transparent, rgba(255,255,255,.10), transparent)');
    ctx.L.front.append(this.lines, this.band);
    // words: explicit list, else the highlighted phrase split into words
    const words = P.words || (P.keywords || []).join(' ').split(/\s+/).filter(Boolean);
    const times = words.map((w, j) => {
      const hit = ctx.words.find(x => x.w.toLowerCase().replace(/[^\w]/g, '') === w.toLowerCase().replace(/[^\w]/g, ''));
      return hit ? hit.s : .3 + j * .35;
    });
    this.items = words.map((w, j) => {
      const e = el('div', `position:absolute;left:0;right:0;top:${(P.y || 700) + j * 175}px;text-align:center;font-size:170px;color:#fff;
        text-shadow:-7px 0 rgba(255,40,60,.85), 7px 0 rgba(40,220,255,.85);text-transform:uppercase`, w);
      e.className = 'display';
      ctx.L.front.appendChild(e);
      return { e, t: times[j] };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const f = Math.floor(ctx.t * 30);
    const flick = .9 + ((f * 7919) % 13) / 100;
    ctx.baseImg.style.filter = `brightness(${.62 * flick}) contrast(1.25) saturate(.55)`;
    this.band.style.top = ((ctx.t * 700) % 2200 - 200) + 'px';
    this.lines.style.opacity = ease.out(enter(ctx.t, 0, .3));
    for (const { e, t } of this.items) {
      const q = enter(ctx.t, t, .18);
      const jit = ctx.t - t < .3 ? ((f * 31) % 7 - 3) * 4 : 0;
      e.style.opacity = Math.min(q, leave(ctx));
      e.style.transform = `translateX(${jit}px) scale(${lerp(1.3, 1, ease.out(q))})`;
    }
  },
};
