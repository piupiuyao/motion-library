// 电影黑边拉开 · 片头片尾：画面从全黑开始，上下两条黑边往外拉开露出画面，停在宽银幕比例，黑边上放标题
TEMPLATES.c78 = {
  setup(ctx) {
    const P = ctx.params;
    this.band = P.band || 780;          // visible picture height when open
    this.cy = P.center || 770;          // centre of the visible band
    this.top = el('div', 'position:absolute;left:0;right:0;top:0;background:#000');
    this.bot = el('div', 'position:absolute;left:0;right:0;bottom:0;background:#000');
    this.title = el('div', `position:absolute;left:0;right:0;text-align:center;color:#f3efe6;font:500 ${P.size || 64}px/1.15 "Didot","Bodoni 72","Georgia",serif;
      letter-spacing:.32em;text-transform:uppercase;opacity:0`, P.title || '');
    this.sub = el('div', `position:absolute;left:0;right:0;text-align:center;color:rgba(243,239,230,.6);font:600 34px var(--font-body);letter-spacing:.5em;
      text-transform:uppercase;opacity:0`, P.sub || '');
    ctx.L.front.append(this.top, this.bot, this.title, this.sub);
  },
  frame(ctx) {
    const p = ease.inOut(enter(ctx.t, .2, 1.1));
    const topH = lerp(this.cy, this.cy - this.band / 2, p);
    const botH = lerp(H - this.cy, H - (this.cy + this.band / 2), p);
    this.top.style.height = topH + 'px';
    this.bot.style.height = botH + 'px';
    const q = ease.out(enter(ctx.t, 1.0, .8));
    this.title.style.top = (topH - 200) + 'px';
    this.title.style.opacity = q;
    this.title.style.letterSpacing = lerp(.5, .32, q) + 'em';
    this.sub.style.top = (topH - 90) + 'px';
    this.sub.style.opacity = ease.out(enter(ctx.t, 1.3, .6));
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * lerp(1.08, 1, ease.out(enter(ctx.t, 0, 2.5)))})`;
  },
};
