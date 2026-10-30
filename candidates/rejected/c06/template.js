// 反色混合字 · 字体：粗体大字用「差值」混合压在画面上，压在人身上或亮处的部分颜色自动反转
TEMPLATES.c06 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const txt = P.text;
    if (!txt) { this.off = true; return; }   // 必填: nothing to show
    const size = P.size || Math.min(260, Math.floor(1250 / (txt.length + .5)));
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 980}px;text-align:center;mix-blend-mode:difference;color:#fff`);
    this.letters = [...txt].map(ch => {
      const s = el('span', 'display:inline-block', ch === ' ' ? '&nbsp;' : ch);
      return s;
    });
    const big = el('div', `font-size:${size}px;line-height:.9;text-transform:uppercase;white-space:nowrap`);
    big.className = 'display';
    this.letters.forEach(s => big.appendChild(s));
    this.big = big;
    this.box.appendChild(big);
    if (P.sub) {
      this.sub = el('div', `margin-top:24px;font:700 54px var(--font-body);letter-spacing:.35em;text-transform:uppercase`, P.sub);
      this.box.appendChild(this.sub);
    }
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    if (this.off) return;
    const out = leave(ctx, .3);
    this.letters.forEach((s, j) => {
      const q = ease.out(enter(ctx.t, .1 + j * .06, .45));
      s.style.opacity = Math.min(q, out);
      s.style.transform = `translateY(${lerp(120, 0, q)}px)`;
    });
    this.big.style.letterSpacing = `${lerp(.18, .02, ease.out(enter(ctx.t, .1, 1.6)))}em`;
    if (this.sub) {
      const q = ease.out(enter(ctx.t, .6, .5));
      this.sub.style.opacity = Math.min(q, out);
      this.sub.style.transform = `translateY(${lerp(30, 0, q)}px)`;
    }
  },
};
