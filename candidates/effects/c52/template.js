// 手持晃动 · 镜头特效：整个画面加一点随机晃动和旋转，三脚架画面看起来像手持拍的
TEMPLATES.c52 = {
  setup(ctx) {
    ctx.base.style.transformOrigin = '50% 45%';
  },
  frame(ctx) {
    const t = ctx.t, A = ctx.params.amount || 1, z = ctx.seg.zoom || 1;
    // sum of incommensurate sines = smooth pseudo-random drift, pure function of t
    const x = A * 16 * (Math.sin(t * 2.3) + .6 * Math.sin(t * 3.9 + 1.3) + .3 * Math.sin(t * 8.1 + 2.1));
    const y = A * 13 * (Math.sin(t * 1.9 + .7) + .6 * Math.sin(t * 4.4 + 2.2) + .3 * Math.sin(t * 9.3));
    const r = A * .9 * (Math.sin(t * 1.6 + 1) + .5 * Math.sin(t * 4.7));
    ctx.base.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${z * (1 + .07 * A)})`;
  },
};
