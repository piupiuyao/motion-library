// 虚线圈聚焦 · 镜头特效：白色虚线圈圈住要看的地方，边转边画出来，旁边一行竖排提示字；可以按词跳到下一个位置
TEMPLATES.dashed_focus = {
  setup(ctx) {
    const P = ctx.params;
    // targets: [{x, y, r, at, label}] in 0–1 frame coords (r in px); default = one circle on the face
    const fx = ctx.focus[0], fy = ctx.focus[1];
    const ts = (P.targets || [{ x: fx, y: fy + .01, r: 250 }]).map(g => {
      const w = g.at && ctx.words.find(w => w.w.toLowerCase().replace(/[^\w]/g, '') === g.at.toLowerCase());
      return { ...g, t: w ? w.s : 0 };
    });
    ts[0].t = 0;
    this.ts = ts;
    this.svg = el('div', 'position:absolute;inset:0');
    this.svg.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0;overflow:visible">
      <circle cx="0" cy="0" r="100" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="46 30"
        style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))"/></svg>`;
    this.c = this.svg.querySelector('circle');
    ctx.L.front.appendChild(this.svg);
    this.label = el('div', `position:absolute;font-size:96px;color:var(--accent);-webkit-text-stroke:5px var(--ink);paint-order:stroke fill;
      writing-mode:vertical-rl;letter-spacing:.04em;white-space:nowrap`);
    this.label.className = 'display';
    ctx.L.front.appendChild(this.label);
    this.dim = el('div', 'position:absolute;inset:0;background:rgba(0,0,0,.28)');
    ctx.L.back.appendChild(this.dim);
  },
  frame(ctx) {
    let k = 0;
    this.ts.forEach((g, j) => { if (ctx.t >= g.t) k = j; });
    const g = this.ts[k], prev = this.ts[Math.max(0, k - 1)];
    const m = k ? ease.inOut(enter(ctx.t, g.t, .35)) : 1;
    const x = lerp(prev.x, g.x, m) * 1080, y = lerp(prev.y, g.y, m) * 1920, r = lerp(prev.r || 250, g.r || 250, m);
    const draw = ease.out(enter(ctx.t, 0, .45));
    const C = 2 * Math.PI * r;
    this.c.setAttribute('cx', x); this.c.setAttribute('cy', y); this.c.setAttribute('r', r);
    // draw on: a mask-like reveal using dash offset on a second pattern is overkill; scale + rotate reads the same
    this.c.style.transformOrigin = `${x}px ${y}px`;
    this.c.style.transform = `rotate(${ctx.t * 40}deg) scale(${lerp(1.5, 1, draw)})`;
    this.c.style.opacity = Math.min(draw * 1.5, leave(ctx));
    this.dim.style.opacity = Math.min(draw, leave(ctx));
    // hole in the dim layer so the circled area stays bright
    this.dim.style.maskImage = this.dim.style.webkitMaskImage = `radial-gradient(circle ${r}px at ${x}px ${y}px, transparent 98%, #000 100%)`;
    const lab = g.label ?? (k === 0 ? ctx.params.label : '');
    if (this.label.textContent !== (lab || '')) this.label.textContent = lab || '';
    const left = x > 540 ? x - r - 130 : x + r + 30;
    this.label.style.left = left + 'px';
    this.label.style.top = (y - r * .6) + 'px';
    const q = enter(ctx.t, g.t + .2, .3);
    this.label.style.opacity = Math.min(q, leave(ctx));
    this.label.style.transform = `translateY(${lerp(40, 0, ease.out(q))}px)`;
  },
};
