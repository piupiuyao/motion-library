// 相框分层 · 版式：换图案背景，画面装进拍立得相框，人像头部冲出相框，贴纸错落叠放
TEMPLATES.frame_layer = {
  setup(ctx) {
    const P = ctx.params, pat = P.pattern || 'dots';
    ctx.L.bg.style.background = pat === 'grid'
      ? 'repeating-linear-gradient(0deg, transparent 0 58px, rgba(0,0,0,.12) 58px 60px), repeating-linear-gradient(90deg, var(--bg-a) 0 58px, rgba(0,0,0,.12) 58px 60px)'
      : pat === 'plain' ? 'var(--bg-a)'
      : 'radial-gradient(circle, rgba(255,255,255,.16) 13px, transparent 14px) 0 0/72px 72px, var(--bg-a)';
    // photo window in source-frame coordinates; the person may break out above it
    this.win = { x: 90, y: 560, w: 900, h: 960 };
    this.s = .8;
    this.group = el('div', 'position:absolute;inset:0;transform-origin:50% 55%');
    const w = this.win, s = this.s, T = this.T = { x: 540 - s * 540, y: 18 };
    this.paper = el('div', `position:absolute;left:${T.x + s * w.x - 26}px;top:${T.y + s * w.y - 26}px;width:${s * w.w + 52}px;height:${s * w.h + 150}px;
      background:var(--paper);border-radius:10px;box-shadow:0 30px 70px rgba(0,0,0,.28)`);
    if (P.label) {
      this.paper.appendChild(el('div', `position:absolute;left:0;right:0;bottom:22px;text-align:center;font:700 64px "Marker Felt","Chalkboard SE",cursive;color:var(--ink)`, P.label));
    }
    ctx.L.bg.appendChild(this.paper);
    ctx.base.style.transformOrigin = ctx.person.style.transformOrigin = '0 0';
    ctx.base.style.clipPath = `inset(${w.y}px ${1080 - w.x - w.w}px ${1920 - w.y - w.h}px ${w.x}px)`;
    ctx.person.style.clipPath = `inset(0 0 ${1920 - w.y - w.h}px 0)`;
    ctx.personCv.style.filter = outline(5, '#fff');
    this.stickers = P.stickers === false ? [] : [
      ['★', 'left:60px;top:420px;font-size:150px;color:var(--accent);-webkit-text-stroke:5px var(--ink)', -12, .35],
      ['', 'left:720px;top:440px;width:260px;height:70px;background:var(--accent-2);opacity:.85', 18, .5],
      ['✦', 'left:860px;top:1130px;font-size:130px;color:var(--accent-2);-webkit-text-stroke:4px var(--ink)', 10, .65],
      ['●', 'left:90px;top:1200px;font-size:90px;color:var(--accent)', 0, .8],
    ].map(([ch, css, rot, s0]) => {
      const e = el('div', 'position:absolute;line-height:1;' + css, ch);
      ctx.L.front.appendChild(e);
      return { e, rot, s0 };
    });
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .5), k = ease.back(p);
    const g = `rotate(${lerp(-5, -1.5, k)}deg) scale(${lerp(1.18, 1, k)})`;
    const s = this.s, T = this.T;
    const inner = `translate(${T.x}px, ${T.y}px) scale(${s})`;
    // rotate the whole stack around the centre, then place the frame inside it
    const wrap = `translate(540px, 850px) ${g} translate(-540px, -850px) `;
    ctx.base.style.transform = wrap + inner;
    ctx.person.style.transform = wrap + inner;
    this.paper.style.transform = `translate(540px, 850px) ${g} translate(-540px, -850px)`;
    this.paper.style.transformOrigin = '0 0';
    ctx.L.bg.style.opacity = clamp(p * 2);
    for (const st of this.stickers) {
      const q = enter(ctx.t, st.s0, .35);
      st.e.style.transform = `scale(${ease.pop(q)}) rotate(${st.rot}deg)`;
      st.e.style.opacity = Math.min(clamp(q * 3), leave(ctx));
    }
  },
};
