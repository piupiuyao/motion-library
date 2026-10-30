// 荧光笔划重点 · 字体：说到关键词时，一道毛边黄色荧光笔从左往右扫过字幕里的这个词
TEMPLATES.c01 = {
  setup(ctx) {
    const P = ctx.params;
    // rough marker stroke: jagged top/bottom edges, seeded so it is the same every frame
    let r = 7;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    let top = 'M0,' + (6 + rnd() * 4).toFixed(1), bot = '';
    for (let x = 0; x <= 200; x += 5) top += ` L${x},${(4 + rnd() * 5).toFixed(1)}`;
    for (let x = 200; x >= 0; x -= 5) bot += ` L${x},${(34 + rnd() * 5).toFixed(1)}`;
    const col = P.color || getComputedStyle(document.getElementById('stage')).getPropertyValue('--accent').trim() || '#ffe53b';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 42' preserveAspectRatio='none'>`
      + `<path d='${top}${bot} Z' fill='${col}' fill-opacity='.9'/>`
      + `<path d='M0,8 L200,6 L200,10 L0,12Z' fill='${col}' fill-opacity='.35'/></svg>`;
    this.mark = 'data:image/svg+xml;utf8,' + svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23').replace(/'/g, '%27');
    this.st = el('style');
    ctx.L.front.appendChild(this.st);
    this.g = ctx.groups[0] || { s: .3, e: .9 };
  },
  frame(ctx) {
    const g = this.g;
    const p = ease.inOut(enter(ctx.t, g.s - .05, clamp(g.e - g.s + .1, .35, .7)));
    this.st.textContent = `#caption .pill{isolation:isolate}
      #caption .key{background:none;position:relative;z-index:0;color:var(--cap-on);padding:0 6px}
      #caption .key::before{content:'';position:absolute;left:-8px;right:-8px;top:8%;bottom:2%;z-index:-1;
        background:url("${this.mark}") 0 0/100% 100% no-repeat;transform:rotate(-1.2deg);
        clip-path:inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)}`;
  },
};
