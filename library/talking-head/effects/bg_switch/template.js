// 每段换背景 · 版式：人抠出来，背景按词或按时间切换（霓虹 / 波点 / 格子 / 皱纸），每次切换带一下擦除
TEMPLATES.bg_switch = {
  setup(ctx) {
    const P = ctx.params;
    this.list = P.patterns || [P.pattern || 'neon'];
    // switch times: at the given words, else evenly through the shot
    const at = (P.at || []).map(a => ctx.words.find(w => w.w.toLowerCase().replace(/[^\w]/g, '') === a.toLowerCase()));
    this.times = this.list.map((_, j) => j === 0 ? 0 : at[j - 1] ? at[j - 1].s : j * ctx.d / this.list.length);
    ctx.base.style.opacity = 0;
    this.a = el('div', 'position:absolute;inset:0');
    this.b = el('div', 'position:absolute;inset:0');
    ctx.L.bg.append(this.a, this.b);
    ctx.personCv.style.filter = outline(7, P.outline || '#fff');
  },
  frame(ctx) {
    let k = 0;
    this.times.forEach((t, j) => { if (ctx.t >= t) k = j; });
    const cur = pattern(this.list[k]), prev = pattern(this.list[Math.max(0, k - 1)]);
    if (this.a.dataset.p !== prev) { this.a.style.background = prev; this.a.dataset.p = prev; }
    if (this.b.dataset.p !== cur) { this.b.style.background = cur; this.b.dataset.p = cur; }
    // diagonal wipe in of the new background
    const w = k ? ease.inOut(enter(ctx.t, this.times[k], .3)) : ease.out(enter(ctx.t, 0, .3));
    this.b.style.clipPath = `polygon(0 0, ${w * 240}% 0, ${w * 240 - 100}% 100%, 0 100%)`;
    const bump = k ? Math.sin(Math.PI * clamp((ctx.t - this.times[k]) / .3)) * .04 : 0;
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${.94 + bump})`;
  },
};
