// 圆窗 B-roll · 素材：B-roll 占满画面，说话的人缩进底部圆窗，人一直在场
TEMPLATES.broll_circle = {
  setup(ctx) {
    this.off = !ctx.params.broll; // material missing: render nothing
    if (this.off) return;
    ctx.L.bg.style.background = 'var(--bg-a)';
    this.blur = el('img', 'position:absolute;inset:-60px;width:1200px;height:2040px;object-fit:cover;filter:blur(40px) brightness(.6)');
    this.main = el('img', 'position:absolute;left:0;top:200px;width:1080px;height:auto;border-radius:0 0 36px 36px;box-shadow:0 30px 80px rgba(0,0,0,.4)');
    ctx.L.bg.append(this.blur, this.main);
    if (ctx.params.label) {
      this.label = el('div', 'position:absolute;left:60px;right:60px;top:110px;text-align:center;font-size:72px;color:var(--paper)', ctx.params.label);
      this.label.className = 'display';
      ctx.L.bg.appendChild(this.label);
    }
    ctx.base.style.transformOrigin = '0 0';
    this.ring = el('div', 'position:absolute;border-radius:50%;border:10px solid var(--paper);box-shadow:0 18px 50px rgba(0,0,0,.45)');
    ctx.L.front.appendChild(this.ring);
  },
  frame(ctx) {
    if (this.off) return;
    const src = mediaSrc(ctx.params.broll, ctx.t);
    setImg(this.blur, src); setImg(this.main, src);
    const p = ease.inOut(enter(ctx.t, 0, .5));
    const s = lerp(1, .42, p), R = lerp(1400, 390, p);
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 150;
    const cx = lerp(fx, 540, p), cy = lerp(fy, 1130, p);
    ctx.base.style.clipPath = `circle(${R}px at ${fx}px ${fy}px)`;
    ctx.base.style.transform = `translate(${cx - s * fx}px, ${cy - s * fy}px) scale(${s})`;
    const r = R * s;
    Object.assign(this.ring.style, { left: cx - r - 10 + 'px', top: cy - r - 10 + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: p > .6 ? 1 : 0 });
    this.main.style.transform = `scale(${lerp(1.08, 1, ctx.p)})`;
  },
};
