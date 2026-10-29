// 人像贴纸描边 · 版式：背景虚化压暗，人抠出来加一圈粗白边，像一张贴纸「啪」地拍上去
TEMPLATES.sticker_outline = {
  setup(ctx) {
    const P = ctx.params;
    ctx.L.bg.style.background = P.background ? pattern(P.background) : 'var(--bg-a)';
    if (!P.background) {
      ctx.baseImg.style.filter = 'blur(28px) brightness(.55) saturate(1.2)';
      ctx.base.style.transform = 'scale(1.1)';
    } else ctx.base.style.opacity = 0;
    ctx.personCv.style.filter = outline(P.width || 12, P.color || '#fff');
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .4);
    // pinned to the bottom edge so the cut-off body never shows a gap
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `scale(${lerp(1.18, 1, ease.back(p))}) rotate(${lerp(-5, 0, ease.out(p))}deg)`;
    if (!ctx.params.background) ctx.base.style.transform = 'scale(1.1)';
  },
};
