// 扭曲抖动标题 · 字体：标题的字边缘一直轻微扭动、沸腾，像手绘动画，压在带颗粒的画面上
TEMPLATES.c08 = {
  setup(ctx) {
    const P = ctx.params;
    const lines = (P.title || 'HASN\'T SOLVED').split('\n');
    const size = P.size || Math.min(210, Math.floor(1500 / (Math.max(...lines.map(l => l.length)) * .62 + 1)));
    const defs = el('div', 'position:absolute;width:0;height:0;overflow:hidden');
    defs.innerHTML = `<svg width="0" height="0"><filter id="c08boil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence id="c08turb" type="turbulence" baseFrequency=".022 .03" numOctaves="2" seed="1" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="${P.wobble || 14}" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`;
    ctx.L.front.appendChild(defs);
    this.turb = defs.querySelector('#c08turb');
    const grain = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/>`
      + `<feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  1.6 0 0 0 -.3'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>`;
    this.grain = el('div', `position:absolute;left:-360px;top:-360px;right:-360px;bottom:-360px;opacity:.35;mix-blend-mode:overlay;
      background:url("data:image/svg+xml;utf8,${grain.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/'/g, '%27')}") 0 0/360px 360px`);
    ctx.L.back.appendChild(this.grain);
    this.title = el('div', `position:absolute;left:0;right:0;top:${P.y || 230}px;text-align:center;font-size:${size}px;color:#fffaf0;
      text-transform:uppercase;line-height:.95;-webkit-text-stroke:4px #111;paint-order:stroke fill;filter:url(#c08boil)`, lines.join('<br>'));
    this.title.className = 'display';
    ctx.L.front.appendChild(this.title);
  },
  frame(ctx) {
    const f = Math.floor(ctx.t * 12);   // boil "on twos": new wobble 12 times a second
    this.turb.setAttribute('seed', 1 + (f % 6));
    const k = Math.floor(ctx.t * 24);
    this.grain.style.transform = `translate(${(k * 137) % 360}px, ${(k * 251) % 360}px)`;
    ctx.baseImg.style.filter = 'contrast(1.12) saturate(.8) sepia(.12)';
    const p = enter(ctx.t, .1, .35);
    this.title.style.opacity = Math.min(clamp(p * 3), leave(ctx));
    this.title.style.transform = `scale(${lerp(.7, 1, ease.pop(p))}) rotate(${-2 + Math.sin(f * 2.1) * .6}deg)`;
  },
};
