// 渐变混排标题 · 字体：两行段落标题，前半句白灰渐变无衬线，关键词换成斜体衬线、红橙渐变
TEMPLATES.c10 = {
  setup(ctx) {
    const P = ctx.params;
    const lines = [P.line1 || 'Replying isn\'t', P.line2 || 'just *typing*'];
    const size = P.size || 142;
    this.dark = el('div', 'position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,.78), rgba(0,0,0,.45) 55%, rgba(0,0,0,0))');
    ctx.L.back.appendChild(this.dark);
    this.box = el('div', `position:absolute;left:40px;right:40px;top:${P.y || 210}px;text-align:${P.align || 'center'}`);
    const sans = `background:linear-gradient(180deg,#ffffff 10%,#9a9aa3 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
      font:700 ${size}px/1.08 var(--font-body);letter-spacing:-.02em`;
    const serif = `background:linear-gradient(100deg,#ff2d3a 0%,#ff7a2f 60%,#ffb347 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
      font:italic 700 ${size * 1.18}px/1.08 "Bodoni 72","Didot","Georgia",serif;padding-right:.08em;display:inline-block`;
    this.lines = lines.map(l => {
      const row = el('div', 'white-space:nowrap');
      const keys = [];
      l.split(/(\*[^*]+\*)/).filter(Boolean).forEach(part => {
        if (part.startsWith('*')) { const k = el('span', serif, part.slice(1, -1)); keys.push(k); row.appendChild(k); }
        else row.appendChild(el('span', sans, part.replace(/ /g, '&nbsp;')));
      });
      this.box.appendChild(row);
      return { row, keys };
    });
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    const out = leave(ctx);
    this.dark.style.opacity = Math.min(ease.out(enter(ctx.t, 0, .4)), out);
    this.lines.forEach((ln, j) => {
      const q = ease.out(enter(ctx.t, .1 + j * .3, .55));
      ln.row.style.opacity = Math.min(q, out);
      ln.row.style.transform = `translateY(${lerp(50, 0, q)}px)`;
      ln.row.style.clipPath = `inset(-20% ${100 - q * 100}% -30% 0)`;
      for (const k of ln.keys) {
        const r = ease.back(enter(ctx.t, .35 + j * .3, .5));
        k.style.transform = `translateY(${lerp(30, 0, r)}px) scale(${lerp(.85, 1, r)})`;
      }
    });
  },
};
