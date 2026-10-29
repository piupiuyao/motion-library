// 盖章印戳 · 字体：一个红色做旧印章斜着砸下来，画面震一下，带油墨斑驳质感
TEMPLATES.c03 = {
  setup(ctx) {
    const P = ctx.params;
    const hit = P.at && ctx.words.find(w => w.w.toLowerCase().replace(/[^\w]/g, '') === P.at.toLowerCase().replace(/[^\w]/g, ''));
    this.t0 = hit ? hit.s : .4;
    const col = P.color || '#d8232a';
    const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3' seed='4'/>`
      + `<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
    const m = `url("data:image/svg+xml;utf8,${noise.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/'/g, '%27')}")`;
    const txt = P.text || 'APPROVED';
    const size = Math.min(170, Math.floor(1150 / (txt.length * .68 + 1)));
    this.st = el('div', `position:absolute;left:50%;top:${P.y || 1020}px;padding:14px 46px 22px;border:14px solid ${col};border-radius:26px;
      outline:5px solid ${col};outline-offset:10px;color:${col};font-size:${size}px;white-space:nowrap;letter-spacing:.04em;text-transform:uppercase;
      -webkit-mask-image:${m};-webkit-mask-size:100% 100%;mask-image:${m};mask-size:100% 100%;mix-blend-mode:multiply`, txt);
    this.st.className = 'display';
    this.st.style.lineHeight = '1';
    ctx.L.front.appendChild(this.st);
    this.rot = P.rotate != null ? P.rotate : -14;
  },
  frame(ctx) {
    const dt = ctx.t - this.t0;
    const p = clamp(dt / .14);
    const s = dt < 0 ? 2.8 : lerp(2.8, 1, p * p) + (dt > .14 ? Math.sin(clamp((dt - .14) / .2) * Math.PI) * -.04 : 0);
    this.st.style.opacity = dt < 0 ? 0 : Math.min(clamp(p * 3) * .92, leave(ctx));
    this.st.style.transform = `translate(-50%,-50%) rotate(${this.rot}deg) scale(${s})`;
    const shake = dt > .12 && dt < .5 ? 1 - (dt - .12) / .38 : 0;
    const sx = Math.sin(dt * 95) * 18 * shake, sy = Math.cos(dt * 77) * 12 * shake;
    ctx.base.style.transform = `translate(${sx}px,${sy}px) scale(${(ctx.seg.zoom || 1) * (1 + .02 * shake)})`;
  },
};
