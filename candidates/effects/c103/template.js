// 透视斜放屏幕 · 素材：一块视频/截图像立着的平板斜放在人旁边（绕竖轴转约 30°，有透视、圆角、投影），从扁平转到斜角入场，缓慢上下漂浮
TEMPLATES.c103 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.media = P.media;
    if (!this.media) { this.off = true; return; } // material missing: render nothing
    this.angle = P.angle ?? 36;
    this.side = P.side || 'left';
    const w = P.w || 570, h = P.h || 550;
    const x = this.side === 'left' ? (P.x ?? 40) : (P.x ?? 1080 - 40 - w);
    this.scene = el('div', `position:absolute;left:${x}px;top:${P.y ?? 880}px;width:${w}px;height:${h}px;perspective:1000px;perspective-origin:50% 40%`);
    this.pane = el('div', `position:absolute;inset:0;border-radius:34px;background:#0d0d0f;padding:14px;box-sizing:border-box;
      box-shadow:0 40px 70px rgba(0,0,0,.5), 0 0 0 2px rgba(255,255,255,.18) inset;transform-origin:${this.side === 'left' ? '20%' : '80%'} 50%`);
    const scr = el('div', 'position:relative;width:100%;height:100%;border-radius:22px;overflow:hidden;background:#222');
    this.img = el('img', 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover');
    this.gloss = el('div', 'position:absolute;inset:0;background:linear-gradient(115deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 38%)');
    scr.append(this.img, this.gloss);
    this.pane.appendChild(scr);
    this.scene.appendChild(this.pane);
    ctx.L.front.appendChild(this.scene);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, p = enter(t, .1, .7), out = leave(ctx, .3);
    const s = this.side === 'left' ? 1 : -1;
    const ang = lerp(0, this.angle, ease.inOut(enter(t, .35, .7))) * s;
    const fl = Math.sin(t * 1.8) * 16;
    this.pane.style.transform = `translateY(${fl + lerp(80, 0, ease.out(p))}px) rotateY(${ang}deg) rotateX(${3 + Math.sin(t * 1.3) * 2}deg) scale(${lerp(.7, 1, ease.back(p))})`;
    this.pane.style.opacity = Math.min(clamp(p * 3), out);
    this.gloss.style.transform = `translateX(${Math.sin(t * .9) * 40}px)`;
    setImg(this.img, mediaSrc(this.media, t));
  },
};
