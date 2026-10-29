// 标题扫光 · 字体：渐变填充、带阴影柔光的大标题落下，一道斜光从字上扫过一次；背后画面虚化压暗
TEMPLATES.c05 = {
  setup(ctx) {
    const P = ctx.params;
    const lines = (P.title || 'AI HASN\'T SOLVED THIS').split('\n');
    const longest = Math.max(...lines.map(l => l.length));
    const size = P.size || Math.min(210, Math.floor(1560 / (longest * .6 + 1)));
    this.t0 = P.at || .25;
    this.dim = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%, rgba(0,0,0,.2), rgba(0,0,0,.72));opacity:0');
    ctx.L.back.appendChild(this.dim);
    this.wrap = el('div', `position:absolute;left:0;right:0;top:${P.y || 600}px;display:flex;flex-direction:column;align-items:center`);
    // three stacked copies of the title: shadow+glow underneath, gradient fill, and the light sweep on top
    // (separate copies because filters/text-shadow do not show on background-clip:text)
    const stack = el('div', 'display:grid;position:relative');
    const html = lines.join('<br>');
    const common = `grid-area:1/1;font-size:${size}px;text-transform:uppercase;line-height:1;text-align:center;`;
    const glow = el('div', common + `color:#000;opacity:.85;text-shadow:0 18px 26px rgba(0,0,0,.75), 0 0 60px rgba(255,170,70,.75), 0 0 120px rgba(255,120,40,.5)`, html);
    const fill = el('div', common + `background:linear-gradient(180deg,#fff3cf 0%,#ffc35a 45%,#ff7a2a 100%);-webkit-background-clip:text;background-clip:text;color:transparent`, html);
    this.shine = el('div', common + `background:linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,.0) 44%, #fff 49%, #fff 51%, rgba(255,255,255,0) 56%, transparent 58% 100%) no-repeat;
      background-size:320% 100%;-webkit-background-clip:text;background-clip:text;color:transparent`, html);
    // a soft flare that travels with the sweep across the whole title block
    this.flare = el('div', `position:absolute;top:-10%;bottom:-10%;width:34%;left:0;background:linear-gradient(115deg, transparent, rgba(255,240,210,.28), transparent);
      mix-blend-mode:screen;pointer-events:none`);
    for (const e of [glow, fill, this.shine]) e.className = 'display';
    stack.append(glow, fill, this.shine, this.flare);
    this.stack = stack;
    this.wrap.appendChild(stack);
    if (P.sub) {
      this.wrap.appendChild(el('div', `margin-top:26px;font:700 46px var(--font-body);letter-spacing:.3em;color:rgba(255,255,255,.85);text-transform:uppercase`, P.sub));
    }
    ctx.L.front.appendChild(this.wrap);
  },
  frame(ctx) {
    const b = ease.out(enter(ctx.t, 0, .4));
    ctx.baseImg.style.filter = `blur(${(b * 14).toFixed(1)}px) brightness(${1 - b * .35})`;
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * (1 + b * .06)})`;
    this.dim.style.opacity = b;
    // title drops in from above with a little overshoot
    const p = enter(ctx.t, this.t0, .5);
    const out = leave(ctx);
    this.wrap.style.opacity = Math.min(clamp(p * 2.5), out);
    this.wrap.style.transform = `translateY(${lerp(-200, 0, ease.back(p))}px) scale(${lerp(1.15, 1, ease.out(p))})`;
    // one diagonal light sweep, left to right, right after it lands
    const s = ease.inOut(enter(ctx.t, this.t0 + .45, .8));
    this.shine.style.backgroundPosition = `${lerp(100, 0, s)}% 0`;
    this.shine.style.opacity = s > 0 && s < 1 ? 1 : 0;
    this.flare.style.left = `${lerp(-40, 110, s)}%`;
    this.flare.style.opacity = s > 0 && s < 1 ? 1 : 0;
  },
};
