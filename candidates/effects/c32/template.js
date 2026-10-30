// 极简线稿隐喻 · 素材：纯深色背景上，单色线稿把正在说的比喻画出来（默认：冰山在水里晃），插在口播中间
TEMPLATES.c32 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.top && !P.bottom) { this.off = true; return; }   // 必填: no captions → render nothing
    const col = P.color || '#ffffff';
    this.bgc = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, #121214, #000 75%)');
    ctx.L.back.appendChild(this.bgc);
    this.g = el('div', 'position:absolute;inset:0');
    const top = 'M380 760 L470 600 L520 650 L590 520 L660 640 L700 610 L760 760';
    const under = 'M380 760 L300 900 L250 1080 L320 1250 L460 1360 L640 1370 L790 1260 L850 1080 L820 900 L760 760';
    const cracks = 'M470 600 L500 700 M590 520 L600 680 L640 760 M330 1000 L420 1060 M700 1150 L780 1100 M480 1280 L560 1220';
    let wave = 'M60 760';
    for (let i = 0; i < 16; i++) wave += ` q 30 -16 60 0`;
    let wave2 = 'M100 800';
    for (let i = 0; i < 6; i++) wave2 += ` q 25 -12 50 0 m 80 0`;
    this.g.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0;overflow:visible"><g transform="translate(0 -40)">
      <g class="berg" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="${top}" pathLength="1" stroke-dasharray="1 1"/>
        <path d="${under}" pathLength="1" stroke-dasharray="1 1" stroke-opacity=".55" stroke-dasharray="1 1"/>
        <path d="${cracks}" pathLength="1" stroke-dasharray="1 1" stroke-width="4" stroke-opacity=".6"/></g>
      <path class="wv" d="${wave}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <path class="wv" d="${wave2}" fill="none" stroke="${col}" stroke-width="4" stroke-opacity=".5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
    </g></svg>`;
    // soft glow: thicken + fade a copy of every stroke underneath
    for (const p of [...this.g.querySelectorAll('path')]) {
      const gl = p.cloneNode(); gl.setAttribute('stroke-width', (+(p.getAttribute('stroke-width') || 7)) * 4); gl.setAttribute('stroke-opacity', '.12');
      gl.removeAttribute('class'); p.parentNode.insertBefore(gl, p); p._glow = gl;
    }
    ctx.L.back.appendChild(this.g);
    this.berg = this.g.querySelector('.berg');
    this.paths = [...this.g.querySelectorAll('path')].filter(p => p._glow);
    const lab = (txt, y, op) => {
      const e = el('div', `position:absolute;left:0;right:0;top:${y}px;text-align:center;font:500 46px var(--font-body);letter-spacing:.04em;color:${col};opacity:${op};text-shadow:0 0 18px rgba(255,255,255,.55)`, txt);
      ctx.L.back.appendChild(e); return e;
    };
    this.l1 = lab(P.top || '', 400, 1);
    this.l2 = lab(P.bottom || '', 1350, 1);
    this.l2.style.color = P.accent || 'var(--accent)';
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .25);
    this.bgc.style.opacity = Math.min(pin, out);
    this.g.style.opacity = out;
    const order = [0, 1, 2, 3, 4];
    const starts = [.2, .5, .9, .05, .15];
    this.paths.forEach((p, k) => { p.style.strokeDashoffset = 1 - ease.inOut(enter(t, starts[k], k === 1 ? .8 : .6)); if (p._glow) p._glow.style.strokeDashoffset = p.style.strokeDashoffset; });
    // the berg bobs in the water
    this.berg.style.transform = `translate(${Math.sin(t * 1.3) * 6}px,${Math.sin(t * 1.9) * 14}px) rotate(${Math.sin(t * 1.1) * 1.4}deg)`;
    this.berg.style.transformOrigin = '540px 900px';
    this.l1.style.opacity = Math.min(enter(t, .7, .4), out);
    this.l2.style.opacity = Math.min(enter(t, 1.1, .4), out);
    this.l2.style.transform = `translateY(${lerp(20, 0, ease.out(enter(t, 1.1, .4)))}px)`;
  },
};
