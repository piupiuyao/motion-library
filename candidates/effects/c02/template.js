// 数字滚动计数 · 字体：一个大数字在脸下方飞快往上滚（如 $0 → $42,000,000），停下时弹一下
TEMPLATES.c02 = {
  setup(ctx) {
    const P = ctx.params;
    this.from = P.from || 0; this.to = P.to != null ? P.to : 42000000;
    const hit = P.at && ctx.words.find(w => w.w.toLowerCase().replace(/[^\w]/g, '') === P.at.toLowerCase().replace(/[^\w]/g, ''));
    this.t0 = hit ? hit.s : .25;
    this.dur = P.dur || 1.3;
    const str = Math.round(this.to).toLocaleString('en-US');
    const size = P.size || Math.min(230, Math.floor(1700 / (str.length + (P.prefix || '').length + (P.suffix || '').length * .6 + 1)));
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 1100}px;display:flex;flex-direction:column;align-items:center`);
    const row = el('div', `display:flex;align-items:flex-end;font-size:${size}px;line-height:1;color:#fff;
      text-shadow:0 10px 30px rgba(0,0,0,.55);font-variant-numeric:tabular-nums`);
    row.className = 'display';
    this.row = row;
    if (P.prefix) row.appendChild(el('span', 'color:var(--accent);margin-right:.04em', P.prefix));
    this.cols = [];
    const digits = str.replace(/,/g, '').length;
    let k = digits - 1;
    for (const ch of str) {
      if (ch === ',') { row.appendChild(el('span', '', ',')); continue; }
      const col = el('span', 'display:inline-block;height:1em;overflow:hidden;position:relative;width:.62em');
      const strip = el('span', 'position:absolute;left:0;top:0;display:flex;flex-direction:column;width:100%;text-align:center',
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<span style="height:1em;line-height:1em">${d}</span>`).join(''));
      col.appendChild(strip);
      row.appendChild(col);
      this.cols.push({ col, strip, k: k-- });
    }
    if (P.suffix) row.appendChild(el('span', `font-size:.42em;margin:0 0 .12em .12em;color:var(--accent)`, P.suffix));
    this.box.appendChild(row);
    if (P.label) {
      this.lab = el('div', `margin-top:10px;padding:8px 22px;border-radius:12px;background:var(--accent);color:var(--ink);
        font:800 44px var(--font-body);letter-spacing:.04em;text-transform:uppercase`, P.label);
      this.box.appendChild(this.lab);
    }
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    const p = enter(ctx.t, this.t0, this.dur);
    const v = lerp(this.from, this.to, 1 - Math.pow(1 - p, 4));
    for (const c of this.cols) {
      // odometer: units roll freely, higher digits tick over only as the digit below passes 9
      const x = v / Math.pow(10, c.k);
      const lower = c.k ? (v / Math.pow(10, c.k - 1)) % 10 : 0;
      const off = c.k ? (Math.floor(x) % 10) + clamp(lower - 9) : x % 10;
      c.strip.style.transform = `translateY(${-off}em)`;
      c.col.style.opacity = (v < Math.pow(10, c.k) && c.k > 0 && p < 1) ? .25 : 1;
    }
    const inP = ease.out(enter(ctx.t, this.t0 - .2, .3));
    const pop = ctx.t > this.t0 + this.dur ? Math.sin(clamp((ctx.t - this.t0 - this.dur) / .35) * Math.PI) * .16 : 0;
    this.box.style.opacity = Math.min(inP, leave(ctx));
    this.row.style.transform = `translateY(${lerp(60, 0, inP)}px) scale(${1 + pop})`;
  },
};
