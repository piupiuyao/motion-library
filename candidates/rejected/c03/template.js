// 盖章印戳 · 字体：一个木头印章从上方斜着砸下来再抬走，留下红色做旧印文（上下粗细双横线），画面震一下
TEMPLATES.c03 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const hit = P.at && ctx.words.find(w => norm(w.w) === norm(P.at));
    this.t0 = hit ? hit.s : .4;
    const col = P.color || '#d8232a';
    const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.5' numOctaves='3' seed='4'/>`
      + `<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.45'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
    const m = `url("data:image/svg+xml;utf8,${noise.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/'/g, '%27')}")`;
    const txt = P.text;
    if (!txt) { this.off = true; return; }   // 必填: no stamp text → render nothing
    const size = Math.min(180, Math.floor(1250 / (txt.length * .62 + 1)));
    this.rot = P.rotate != null ? P.rotate : -12;
    this.y = P.y || 1190;
    // the print: condensed red letters between a thick+thin bar above and a thin+thick bar below
    this.st = el('div', `position:absolute;left:50%;top:${this.y}px;color:${col};text-align:center;white-space:nowrap;
      -webkit-mask-image:${m};-webkit-mask-size:100% 100%;mask-image:${m};mask-size:100% 100%;opacity:0`);
    const bars = (a, b) => `<div style="height:${a}px;background:${col};margin:${a === 16 ? 0 : 8}px 0"></div><div style="height:${b}px;background:${col}"></div>`;
    this.st.innerHTML = `${bars(16, 6)}<div style="padding:8px 30px 4px;font:900 ${size}px/1 'Avenir Next Condensed','Impact',sans-serif;letter-spacing:.03em;text-transform:uppercase">${txt}</div>`
      + `<div style="height:6px;background:${col};margin-bottom:8px"></div><div style="height:16px;background:${col}"></div>`;
    ctx.L.front.appendChild(this.st);
    // the rubber stamp itself, seen from above: a wooden block a bit bigger than the print, round handle + brass knob in the middle
    this.stamp = el('div', `position:absolute;left:50%;top:${this.y}px;width:0;height:0;opacity:0`);
    const bw = Math.min(1000, txt.length * size * .62 + 160), bh = size + 150;
    this.stamp.innerHTML = `
      <div style="position:absolute;left:${-bw / 2}px;top:${-bh / 2}px;width:${bw}px;height:${bh}px;border-radius:24px;
        background:linear-gradient(160deg,#b0603a 0%,#86391c 45%,#5c220e 100%);box-shadow:inset 0 0 0 10px rgba(0,0,0,.18), inset 0 8px 0 rgba(255,255,255,.18)"></div>
      <div style="position:absolute;left:-95px;top:-95px;width:190px;height:190px;border-radius:50%;
        background:radial-gradient(circle at 45% 40%,#c8754a,#7a3018 70%,#4e1a0b);box-shadow:0 8px 18px rgba(0,0,0,.45)"></div>
      <div style="position:absolute;left:-56px;top:-56px;width:112px;height:112px;border-radius:50%;
        background:radial-gradient(circle at 38% 34%,#fff6c8 0,#e2b85a 25%,#a47a22 65%,#5e420e 100%)"></div>`;
    this.shadow = el('div', `position:absolute;left:50%;top:${this.y}px;width:${bw}px;height:${bh}px;margin:${-bh / 2}px 0 0 ${-bw / 2}px;border-radius:30px;
      background:rgba(0,0,0,.45);filter:blur(24px);opacity:0`);
    ctx.L.front.appendChild(this.shadow);
    ctx.L.front.appendChild(this.stamp);
  },
  frame(ctx) {
    if (this.off) return;
    const dt = ctx.t - this.t0;
    // stamp (top view): drops in big = close to the lens (-.25..0), presses (0..0.12), lifts off towards the lens and away (0.12..0.5)
    const fall = ease.inOut(clamp((dt + .25) / .25));
    const lift = Math.pow(clamp((dt - .1) / .3), 1.6);
    const sc = lerp(2.4, 1, fall) + lerp(0, 1.6, lift);
    const sx = lerp(220, 0, fall) + lerp(0, 520, lift), sy = lerp(-260, 0, fall) + lerp(0, -380, lift);
    const squash = dt >= 0 && dt < .12 ? 1 - Math.sin(dt / .12 * Math.PI) * .04 : 1;
    const vis = dt > -.25 && lift < 1;
    this.stamp.style.opacity = vis ? Math.min(clamp((dt + .25) / .08), 1 - clamp((lift - .6) / .4)) : 0;
    this.stamp.style.transform = `translate(${sx}px,${sy}px) rotate(${this.rot + lerp(8, 0, fall) - lift * 10}deg) scale(${sc * squash})`;
    this.shadow.style.opacity = vis ? .8 * (1 - Math.abs(sc - 1) / 1.6) : 0;
    this.shadow.style.transform = `translate(${sx * 1.1 + 30}px,${sy * 1.1 + 40}px) rotate(${this.rot}deg) scale(${sc * .95})`;
    // print appears on contact
    const pin = clamp(dt / .05);
    const s = 1 + (dt > 0 && dt < .3 ? Math.sin(clamp(dt / .3) * Math.PI) * .03 : 0);
    this.st.style.opacity = dt < 0 ? 0 : Math.min(pin * .95, leave(ctx));
    this.st.style.transform = `translate(-50%,-50%) rotate(${this.rot}deg) scale(${s})`;
    const shake = dt > 0 && dt < .4 ? 1 - dt / .4 : 0;
    const shx = Math.sin(dt * 95) * 16 * shake, shy = Math.cos(dt * 77) * 12 * shake;
    ctx.base.style.transform = `translate(${shx}px,${shy}px) scale(${(ctx.seg.zoom || 1) * (1 + .02 * shake)})`;
  },
};
