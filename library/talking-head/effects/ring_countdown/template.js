// 圆环倒计时 · 字体：细环倒计时，灰色底环上一圈主题色亮环随时间被吃掉，中间数字递减，走完正好到 0
TEMPLATES.ring_countdown = {
  setup(ctx) {
    const P = ctx.params;
    this.from = P.from != null ? P.from : 5;
    this.t0 = P.t0 != null ? P.t0 : .25;
    this.t1 = ctx.d - (P.hold != null ? P.hold : .45);
    const D = P.size || 380, R = D / 2 - 22, C = 2 * Math.PI * R;
    this.C = C;
    const [x, y] = P.pos || [770, 330];
    this.box = el('div', `position:absolute;left:${x - D / 2}px;top:${y - D / 2}px;width:${D}px;height:${D}px;transform-origin:50% 50%`);
    this.box.innerHTML = `<svg width="${D}" height="${D}" viewBox="0 0 ${D} ${D}" style="position:absolute;inset:0;overflow:visible">
      <defs><linearGradient id="ring_countdown_g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--accent) 75%, #fff)"/><stop offset="1" style="stop-color:var(--accent)"/></linearGradient></defs>
      <circle cx="${D / 2}" cy="${D / 2}" r="${R + 20}" fill="rgba(8,10,16,.55)"/>
      <circle cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="rgba(120,124,135,.55)" stroke-width="34"/>
      <circle class="arc" cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="url(#ring_countdown_g)" stroke-width="34" stroke-linecap="butt"
        transform="rotate(-90 ${D / 2} ${D / 2})" stroke-dasharray="${C} ${C}" style="filter:drop-shadow(0 0 10px color-mix(in srgb, var(--accent) 90%, transparent))"/>
      <g class="num"></g></svg>`;
    ctx.L.front.appendChild(this.box);
    this.arc = this.box.querySelector('.arc');
    this.num = this.box.querySelector('.num');
    this.D = D;
    this.last = null;
  },
  // seven-segment digits like a digital clock
  seg(d, x, y, w, h) {
    const on = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'][d];
    const t = w * .17, g = t * .25, hh = h / 2;
    const H = (x0, y0) => `M${x0 + g + t / 2},${y0} l${t / 2},${-t / 2} h${w - 2 * g - 2 * t} l${t / 2},${t / 2} l${-t / 2},${t / 2} h${-(w - 2 * g - 2 * t)} z`;
    const V = (x0, y0, len) => `M${x0},${y0 + g + t / 2} l${t / 2},${-t / 2} l${t / 2},${t / 2} v${len - 2 * g - t} l${-t / 2},${t / 2} l${-t / 2},${-t / 2} z`;
    const segs = [H(x, y + t / 2), V(x + w - t, y + t / 2, hh - t / 2), V(x + w - t, y + hh, hh - t / 2), H(x, y + h - t / 2),
      V(x, y + hh, hh - t / 2), V(x, y + t / 2, hh - t / 2), H(x, y + hh)];
    return segs.map((p, k) => on[k] === '1' ? `<path d="${p}"/>` : `<path d="${p}" opacity=".06"/>`).join('');
  },
  frame(ctx) {
    const pin = enter(ctx.t, this.t0 - .3, .35), out = ease.inOut(enter(ctx.t, ctx.d - .3, .28));
    this.box.style.opacity = Math.min(clamp(pin * 2), 1 - out);
    this.box.style.transform = `scale(${lerp(.6, 1, ease.back(pin)) * (1 - out * .2)})`;
    const p = clamp((ctx.t - this.t0) / (this.t1 - this.t0));
    const rem = 1 - p;
    this.arc.setAttribute('stroke-dasharray', `${this.C * rem} ${this.C}`);
    const n = Math.max(0, Math.ceil(this.from * rem - 1e-6));
    if (n !== this.last) {
      this.last = n;
      const D = this.D, s = String(n), h = D * .4, w = h * .52, gap = w * .22;
      const tw = s.length * w + (s.length - 1) * gap;
      let x = D / 2 - tw / 2;
      this.num.innerHTML = `<g fill="#f4f7ff" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))">` +
        [...s].map(c => { const g = this.seg(+c, x, D / 2 - h / 2, w, h); x += w + gap; return g; }).join('') + '</g>';
    }
  },
};
