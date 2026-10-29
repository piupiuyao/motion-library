// 局部留色 · 镜头特效：画面褪成黑白，只有人保留颜色（抠像），字幕关键词也是彩色
TEMPLATES.c54 = {
  setup(ctx) {
    ctx.personCv.style.filter = '';
  },
  frame(ctx) {
    const g = ease.inOut(enter(ctx.t, ctx.params.start != null ? ctx.params.start : .25, .5));
    ctx.baseImg.style.filter = `grayscale(${g}) contrast(${1 + .15 * g}) brightness(${1 - .12 * g})`;
    // tiny push so the colour-drain feels intentional
    const s = (ctx.seg.zoom || 1) * (1 + .03 * g);
    ctx.base.style.transform = ctx.person.style.transform = `scale(${s})`;
  },
};
