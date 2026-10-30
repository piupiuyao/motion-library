// 数字滚动计数 · 字体：一个大数字在脸下方飞快往上跳（如 $0 → $42,000,000），滚动时带竖向拖影，停下时弹一下
TEMPLATES.c02 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    // no number given → take the first number she says in this shot; none → render nothing
    let to = P.to, atW = P.at;
    if (to == null) {
      const nw = ctx.words.find(w => /\d/.test(w.w));
      if (nw) { to = parseFloat(nw.w.replace(/[^\d.]/g, '')); atW = nw.w; }
    }
    if (to == null || isNaN(to)) { this.off = true; return; }
    this.from = P.from || 0; this.to = to;
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const hit = atW && ctx.words.find(w => norm(w.w) === norm(atW));
    this.t0 = hit ? hit.s : .25;
    this.dur = P.dur || 1.3;
    const str = Math.round(this.to).toLocaleString('en-US');
    const size = P.size || Math.min(250, Math.floor(1700 / (str.length + (P.prefix || '').length + (P.suffix || '').length * .45 + 1)));
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 1080}px;display:flex;flex-direction:column;align-items:center`);
    if (P.title) {
      this.ttl = el('div', `margin-bottom:6px;font:800 50px var(--font-body);color:#fff;text-shadow:0 4px 16px rgba(0,0,0,.6)`, P.title);
      this.box.appendChild(this.ttl);
    }
    const row = el('div', `display:flex;align-items:flex-end;font-size:${size}px;line-height:1;color:#fff;white-space:nowrap`);
    row.className = 'display';
    this.row = row;
    if (P.prefix) row.appendChild(el('span', 'color:var(--accent);margin-right:.04em', P.prefix));
    // fixed-width digits so the number does not jitter sideways while it counts
    this.num = el('span', 'font-variant-numeric:tabular-nums;display:inline-block;text-align:right');
    this.num.style.minWidth = str.replace(/[0-9]/g, '').length * .3 + str.replace(/[^0-9]/g, '').length * .62 + 'em';
    row.appendChild(this.num);
    if (P.suffix) row.appendChild(el('span', `font-size:.42em;margin:0 0 .12em .12em;color:var(--accent)`, P.suffix));
    this.box.appendChild(row);
    if (P.label) {
      this.lab = el('div', `margin-top:12px;padding:8px 22px;border-radius:12px;background:var(--accent);color:var(--ink);
        font:800 44px var(--font-body);letter-spacing:.04em;text-transform:uppercase`, P.label);
      this.box.appendChild(this.lab);
    }
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    if (this.off) return;
    const p = enter(ctx.t, this.t0, this.dur);
    const k = 1 - Math.pow(1 - p, 3);
    // quantise to frames so it reads as a fast counter, digits changing every frame
    const v = Math.round(lerp(this.from, this.to, k));
    this.num.textContent = v.toLocaleString('en-US');
    const rolling = p > 0 && p < 1;
    const speed = rolling ? 3 * Math.pow(1 - p, 2) : 0;              // derivative of k, for the blur strength
    const sh = clamp(speed / 3) * .16;
    this.num.style.textShadow = rolling
      ? `0 ${-sh}em 0 rgba(255,255,255,.35), 0 ${sh}em 0 rgba(255,255,255,.25), 0 10px 30px rgba(0,0,0,.55)`
      : '0 10px 30px rgba(0,0,0,.55)';
    const inP = ease.out(enter(ctx.t, this.t0 - .2, .3));
    const st = ctx.t - this.t0 - this.dur;
    const pop = st > 0 ? Math.sin(clamp(st / .3) * Math.PI) * .18 : 0;
    this.num.style.color = st > 0 && st < .3 ? 'var(--accent)' : '#fff';
    this.box.style.opacity = Math.min(inP, leave(ctx));
    this.row.style.transform = `translateY(${lerp(60, 0, inP)}px) scale(${1 + pop})`;
    if (this.lab) {
      const lq = ease.back(enter(ctx.t, this.t0 + this.dur, .35));
      this.lab.style.opacity = clamp(lq * 2);
      this.lab.style.transform = `scale(${lerp(.6, 1, lq)})`;
    }
  },
};
