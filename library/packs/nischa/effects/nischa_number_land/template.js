// 数字落定橙块（Clean Finance 版）· 字体：胸口一个白色 Poppins Bold 数字往上跳，停住时橙色块从左扫到它背后，数字保持白色（她的做法），停一会再收
TEMPLATES.nischa_number_land = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    // no number given → the first number she says in this shot; none → render nothing
    let to = P.to, atW = P.at;
    if (to == null) {
      const nw = ctx.words.find(w => /\d/.test(w.w));
      if (nw) { to = nw.w; atW = atW || nw.w; }
    }
    to = to == null ? NaN : parseFloat(String(to).replace(/[^\d.\-]/g, ''));
    if (isNaN(to)) { this.off = true; return; }
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const hit = atW != null && (typeof atW === 'number' ? ctx.words.find(w => w.i === atW) : ctx.words.find(w => norm(w.w) === norm(atW)));
    this.to = to; this.from = P.from != null ? P.from : 0;
    this.dec = P.decimals != null ? P.decimals : (String(P.to || '').split('.')[1] || '').length;
    this.t0 = hit ? hit.s : .25;
    this.dur = P.dur || 1.1;
    this.pre = P.prefix || ''; this.suf = P.suffix || '';
    const fmt = v => this.pre + v.toLocaleString('en-US', { minimumFractionDigits: this.dec, maximumFractionDigits: this.dec }) + this.suf;
    this.fmt = fmt;
    const str = fmt(this.to);
    const size = P.size || Math.min(124, Math.floor(1300 / (str.length * .62 + .6)));
    this.box = el('div', `position:absolute;left:0;right:0;top:${P.y || 1050}px;display:flex;flex-direction:column;align-items:center`);
    const wrap = el('div', `position:relative;font:700 ${size}px/1 var(--font-body);letter-spacing:-.005em;white-space:nowrap;font-variant-numeric:tabular-nums`);
    const pad = `${size * .06}em`;
    this.a = el('div', `padding:.06em .14em .08em;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.35)`, str);
    // the block: accent fill carrying an --ink copy of the number, revealed left → right with clip-path
    this.b = el('div', `position:absolute;inset:0;padding:.06em .14em .08em;background:var(--accent);color:var(--on-accent);border-radius:4px;clip-path:inset(0 100% 0 0)`, str);
    wrap.append(this.a, this.b);
    this.wrap = wrap;
    this.box.appendChild(wrap);
    // fixed width so the counter does not jitter
    wrap.style.minWidth = 'max-content';
    if (P.label) {
      this.lab = el('div', `margin-top:14px;font:600 ${Math.round(size * .3)}px var(--font-body);color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.5)`, P.label);
      this.box.appendChild(this.lab);
    }
    this.box.className = 'pk-number';
    ctx.L.front.appendChild(this.box);
    this.wrap.style.width = this.wrap.offsetWidth + 'px';
    this.a.style.textAlign = this.b.style.textAlign = 'center';
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const p = enter(t, this.t0, this.dur);
    const k = 1 - Math.pow(1 - p, 3);
    const v = lerp(this.from, this.to, k);
    const m = Math.pow(10, this.dec);
    const s = this.fmt(Math.round(v * m) / m);
    if (this.a.textContent !== s) { this.a.textContent = s; this.b.textContent = s; }
    const inP = ease.out(enter(t, this.t0 - .2, .25));
    const sweep = ease.out(enter(t, this.t0 + this.dur, .3));
    this.b.style.clipPath = `inset(0 ${(1 - sweep) * 100}% 0 0)`;
    this.a.style.textShadow = sweep > 0 ? 'none' : '0 3px 14px rgba(0,0,0,.35)';
    // hold ~1 s after landing, then collapse (block shrinks back to the right, number fades)
    const hold = this.t0 + this.dur + .3 + (ctx.params.hold || 1.2);
    const outQ = ease.inOut(enter(t, Math.min(hold, ctx.d - .35), .3));
    this.box.style.opacity = Math.min(inP, 1 - outQ);
    this.box.classList.toggle('on', +this.box.style.opacity > .02);
    this.wrap.style.transform = `translateY(${lerp(30, 0, inP)}px)`;
    if (this.lab) this.lab.style.opacity = ease.out(enter(t, this.t0 + this.dur, .3));
  },
};
