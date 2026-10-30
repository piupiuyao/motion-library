// 引线标注图解 · 素材：手写数字套在画好的圆圈里，会动的虚线连到几个标签，镜头从一组标注平移到下一组
TEMPLATES.c19 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const groups = (P.groups || []).map(g => ({ title: g.title || '', labels: g.labels || [] }));
    if (!groups.length) { this.off = true; return; }   // 必填: no groups → render nothing
    this.n = groups.length;
    const hand = "'Marker Felt','Chalkboard SE','Bradley Hand',cursive";
    this.bgc = el('div', `position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent 0 68px, rgba(60,110,200,.16) 68px 71px), #f6f2e7`);
    ctx.L.back.appendChild(this.bgc);
    this.strip = el('div', `position:absolute;left:0;top:0;width:${1080 * this.n}px;height:1920px`);
    ctx.L.back.appendChild(this.strip);
    const spots = [[[-250, -400], [250, 380]], [[250, -410], [-250, 390]], [[-250, -400], [250, 380]]];
    let svg = '';
    this.parts = [];
    groups.forEach((g, k) => {
      const cx = 540 + k * 1080, cy = 760;
      // rough hand-drawn circle
      let d = '';
      for (let i = 0; i <= 40; i++) {
        const a = -1.9 + i / 36 * Math.PI * 2, r = 150 + Math.sin(i * 1.7 + k) * 5;
        d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r * .95).toFixed(1);
      }
      svg += `<path class="ci${k}" d="${d}" fill="none" stroke="#1b1b1b" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>`;
      g.labels.forEach((lab, j) => {
        const [dx, dy] = spots[k % 3][j];
        const x1 = cx + Math.sign(dx) * 110, y1 = cy + Math.sign(dy) * 110, x2 = cx + dx * .72, y2 = cy + dy * .72;
        svg += `<line class="ln${k}_${j}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" data-x="${x2}" data-y="${y2}" stroke="#d6342c" stroke-width="7" stroke-dasharray="22 16" stroke-linecap="round"/>`;
        const lb = el('div', `position:absolute;left:${cx + dx - 190}px;top:${cy + dy - 55}px;width:380px;text-align:center;font:700 64px ${hand};color:#1b1b1b;
          background:#fff;border:5px solid #1b1b1b;border-radius:20px;padding:10px 0;box-shadow:8px 8px 0 #1b1b1b`, lab);
        this.strip.appendChild(lb);
        this.parts.push({ k, j, lb });
      });
      const num = el('div', `position:absolute;left:${cx - 150}px;top:${cy - 150}px;width:300px;height:300px;display:flex;align-items:center;justify-content:center;
        font:700 210px/1 ${hand};color:#d6342c`, String(k + 1));
      const title = el('div', `position:absolute;left:${k * 1080 + 60}px;top:200px;width:960px;text-align:center;font:700 92px/1.05 ${hand};color:#1b1b1b`, g.title);
      this.strip.append(num, title);
      this.parts.push({ k, num, title });
    });
    if (this.n > 1) for (let k = 0; k < this.n - 1; k++)
      svg += `<path class="cn${k}" d="M${540 + k * 1080 + 200} 1260 C ${1080 * (k + 1) - 200} 1450, ${1080 * (k + 1) + 200} 1450, ${540 + (k + 1) * 1080 - 200} 1260" fill="none" stroke="#1b1b1b" stroke-width="6" stroke-dasharray="18 14"/>`;
    const s = el('div', 'position:absolute;inset:0');
    s.innerHTML = `<svg width="${1080 * this.n}" height="1920" style="position:absolute;inset:0">${svg}</svg>`;
    this.strip.insertBefore(s, this.strip.firstChild);
    this.svg = s.querySelector('svg');
    this.seg = (ctx.d - .2) / this.n;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.strip.style.opacity = Math.min(pin, out);
    // camera: hold on each group, pan to the next
    let x = 0;
    for (let k = 1; k < this.n; k++) x += ease.inOut(enter(t, k * this.seg - .38, .42));
    // the camera dips back a little while it travels
    let travel = 0;
    for (let k = 1; k < this.n; k++) travel = Math.max(travel, Math.sin(Math.PI * enter(t, k * this.seg - .38, .42)));
    this.strip.style.transformOrigin = `${540 + x * 1080}px 800px`;
    this.strip.style.transform = `translateX(${-x * 1080}px) scale(${1 - .1 * travel})`;
    for (let k = 0; k < this.n; k++) {
      const t0 = k ? k * this.seg + .02 : .12;
      const c = ease.out(enter(t, t0, .3));
      const ci = this.svg.querySelector('.ci' + k);
      ci.style.strokeDashoffset = 1 - c;
      for (let j = 0; j < 2; j++) {
        const ln = this.svg.querySelector(`.ln${k}_${j}`);
        if (!ln) continue;
        const q = ease.out(enter(t, t0 + .22 + j * .12, .22));
        ln.style.opacity = q > 0 ? 1 : 0;
        ln.style.strokeDashoffset = -t * 60;
        const x1 = +ln.getAttribute('x1'), y1 = +ln.getAttribute('y1');
        ln.setAttribute('x2', lerp(x1, +ln.dataset.x, q)); ln.setAttribute('y2', lerp(y1, +ln.dataset.y, q));
      }
      const cn = this.svg.querySelector('.cn' + k);
      if (cn) { cn.style.strokeDashoffset = -t * 50; cn.style.opacity = enter(t, t0 + .6, .25); }
    }
    for (const it of this.parts) {
      const t0 = it.k ? it.k * this.seg + .02 : .12;
      if (it.lb) {
        const q = enter(t, t0 + .36 + it.j * .12, .22);
        it.lb.style.opacity = q; it.lb.style.transform = `scale(${lerp(.5, 1, ease.pop(q))}) rotate(${it.j ? 2 : -2}deg)`;
      } else {
        const q = enter(t, t0 + .12, .2);
        it.num.style.opacity = q; it.num.style.transform = `scale(${lerp(1.6, 1, ease.out(q))}) rotate(-6deg)`;
        it.title.style.opacity = enter(t, t0, .3);
      }
    }
  },
};
