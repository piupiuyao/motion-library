// 标题扫光 · 字体：渐变填充、带阴影柔光的大标题落下，一道斜光从字上扫过一次；背后画面虚化压暗
TEMPLATES.c05 = {
  setup(ctx) {
    const P = ctx.params;
    const lines = (P.title || 'AI HASN\'T SOLVED THIS').split('\n');
    const longest = Math.max(...lines.map(l => l.length));
    const size = P.size || Math.min(190, Math.floor(1500 / (longest * .62 + 1)));
    this.t0 = P.at || .25;
    this.dim = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, rgba(0,0,0,.25), rgba(0,0,0,.7));opacity:0');
    ctx.L.back.appendChild(this.dim);
    this.wrap = el('div', `position:absolute;left:0;right:0;top:${P.y || 640}px;text-align:center;
      filter:drop-shadow(0 0 28px rgba(255,190,110,.45)) drop-shadow(0 14px 18px rgba(0,0,0,.55))`);
    const html = lines.join('<br>');
    const fill = el('div', `position:relative;font-size:${size}px;text-transform:uppercase;line-height:1;
      background:linear-gradient(180deg,#ffe2a3 0%,#ffb347 55%,#ff7a2a 100%);-webkit-background-clip:text;background-clip:text;color:transparent`, html);
    fill.className = 'display';
    this.shine = el('div', `position:absolute;inset:0;font-size:${size}px;text-transform:uppercase;line-height:1;
      background:linear-gradient(110deg, transparent 0 40%, #fff 47%, #fff 53%, transparent 60% 100%) no-repeat;background-size:300% 100%;
      -webkit-background-clip:text;background-clip:text;color:transparent`, html);
    this.shine.className = 'display';
    fill.appendChild(this.shine);
    this.wrap.appendChild(fill);
    if (P.sub) {
      this.wrap.appendChild(el('div', `margin-top:26px;font:700 46px var(--font-body);letter-spacing:.3em;color:rgba(255,255,255,.85);text-transform:uppercase`, P.sub));
    }
    ctx.L.front.appendChild(this.wrap);
  },
  frame(ctx) {
    const b = ease.out(enter(ctx.t, 0, .4));
    ctx.baseImg.style.filter = `blur(${(b * 14).toFixed(1)}px) brightness(${1 - b * .4})`;
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * (1 + b * .06)})`;
    this.dim.style.opacity = b;
    const p = enter(ctx.t, this.t0, .5);
    const out = leave(ctx);
    this.wrap.style.opacity = Math.min(clamp(p * 2.5), out);
    this.wrap.style.transform = `translateY(${lerp(-160, 0, ease.back(p))}px) scale(${lerp(1.12, 1, ease.out(p))})`;
    const s = ease.inOut(enter(ctx.t, this.t0 + .45, .75));
    this.shine.style.backgroundPosition = `${lerp(100, 0, s)}% 0`;
    this.shine.style.opacity = s > 0 && s < 1 ? 1 : 0;
  },
};
