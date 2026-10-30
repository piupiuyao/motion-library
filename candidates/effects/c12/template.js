// 原生文字框钩子 · 字体：开头一句钩子放在白色圆角底的文字框里（Instagram 原生快拍文字样式）+ 一个表情
TEMPLATES.c12 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.text) { this.off = true; return; }   // 必填: no hook text → render nothing
    this.box = el('div', `position:absolute;left:90px;right:90px;top:${P.y || 330}px;text-align:center;
      font:700 ${P.size || 64}px/1.32 "Helvetica Neue","SF Pro Display",Arial,sans-serif;letter-spacing:-.01em`);
    const t = el('span', `background:${P.bg || '#fff'};color:${P.color || '#000'};padding:6px 22px 10px;border-radius:16px;
      -webkit-box-decoration-break:clone;box-decoration-break:clone`, P.text + (P.emoji ? ' ' + P.emoji : ''));
    this.box.appendChild(t);
    ctx.L.front.appendChild(this.box);
    this.hold = P.hold || 0;
  },
  frame(ctx) {
    if (this.off) return;
    const p = enter(ctx.t, .05, .4);
    const end = this.hold ? 1 - clamp((ctx.t - this.hold) / .2) : leave(ctx, .2);
    this.box.style.opacity = Math.min(clamp(p * 4), end);
    this.box.style.transform = `scale(${lerp(.55, 1, ease.pop(p))})`;
  },
};
