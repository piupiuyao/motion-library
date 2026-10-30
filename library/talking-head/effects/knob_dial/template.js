// 质感旋钮仪表 · 素材：深色颗粒背景上一个带立体感的旋钮，放大出现，指针转到某一档，刻度跟着亮
TEMPLATES.knob_dial = {
  setup(ctx) {
    const P = ctx.params;
    this.col = P.color || 'var(--accent)';
    const nc = el('canvas'); nc.width = nc.height = 256;
    const c = nc.getContext('2d'), im = c.createImageData(256, 256);
    let s = 9;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s % 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 22; }
    c.putImageData(im, 0, 0);
    this.bgc = el('div', `position:absolute;inset:0;background:url(${nc.toDataURL()}), radial-gradient(circle at 50% 42%, #1b1a22, #050507 70%)`);
    ctx.L.back.appendChild(this.bgc);
    this.dial = el('div', 'position:absolute;left:140px;top:460px;width:800px;height:800px');
    this.n = P.ticks || 25;
    this.lo = -135; this.hi = 135;
    this.level = P.level ?? .88;
    this.from = P.from ?? 0;
    this.ticks = [];
    for (let i = 0; i < this.n; i++) {
      const a = this.lo + (this.hi - this.lo) * i / (this.n - 1), big = i % 4 === 0;
      const tk = el('div', `position:absolute;left:397px;top:${big ? 0 : 14}px;width:${big ? 10 : 6}px;height:${big ? 70 : 46}px;margin-left:${big ? -2 : 0}px;border-radius:4px;
        background:rgba(255,255,255,.22);transform-origin:50% ${big ? 400 : 386}px;transform:rotate(${a}deg)`);
      this.dial.appendChild(tk); this.ticks.push({ tk, f: i / (this.n - 1) });
    }
    this.wedge = el('div', `position:absolute;left:0;top:0;width:800px;height:800px;border-radius:50%;
      -webkit-mask:radial-gradient(circle, transparent 120px, #000 200px, rgba(0,0,0,.85) 330px, transparent 400px);mask:radial-gradient(circle, transparent 120px, #000 200px, rgba(0,0,0,.85) 330px, transparent 400px)`);
    this.dial.appendChild(this.wedge);
    this.dial.insertAdjacentHTML('beforeend', `
      <div style="position:absolute;left:130px;top:130px;width:540px;height:540px;border-radius:50%;background:linear-gradient(160deg,#4a4a52,#141417);
        box-shadow:0 40px 60px rgba(0,0,0,.7), inset 0 3px 2px rgba(255,255,255,.15)"></div>
      <div class="knob" style="position:absolute;left:170px;top:170px;width:460px;height:460px;border-radius:50%;
        background:radial-gradient(circle at 50% 35%, rgba(255,255,255,.35), transparent 55%),
          repeating-conic-gradient(from 0deg, #8d8d96 0deg 2deg, #6e6e78 2deg 4deg), #777;
        box-shadow:inset 0 -14px 24px rgba(0,0,0,.45), inset 0 8px 12px rgba(255,255,255,.35), 0 18px 30px rgba(0,0,0,.6)">
        <div style="position:absolute;left:50px;top:50px;right:50px;bottom:50px;border-radius:50%;background:radial-gradient(circle at 50% 30%, #b8b8c2, #5c5c66 75%);
          box-shadow:inset 0 4px 6px rgba(255,255,255,.4), inset 0 -6px 10px rgba(0,0,0,.4)"></div>
        <div style="position:absolute;left:222px;top:40px;width:16px;height:120px;border-radius:8px;background:#fff;box-shadow:0 0 18px ${this.col}, 0 0 4px #fff"></div></div>`);
    this.knob = this.dial.querySelector('.knob');
    const lab = (txt, x) => this.dial.appendChild(el('div', `position:absolute;top:720px;${x};font:800 44px var(--font-body);letter-spacing:.12em;color:#8a8a92`, txt));
    lab(P.min || '', 'left:40px'); lab(P.max || '', 'right:40px');
    this.title = el('div', `position:absolute;left:0;right:0;top:220px;text-align:center;font:800 54px var(--font-body);letter-spacing:.3em;color:#9a9aa2`, P.title || '');
    this.val = el('div', `position:absolute;left:0;right:0;top:1280px;text-align:center;font-size:130px;color:#fff`, '');
    this.val.className = 'display';
    this.word = P.word || '';   // no word → the dial shows the percentage
    ctx.L.back.append(this.dial, this.title, this.val);
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .45);
    this.bgc.style.opacity = Math.min(clamp(pin * 2), out);
    this.dial.style.opacity = Math.min(clamp(pin * 2), out);
    this.dial.style.transform = `scale(${lerp(.35, 1, ease.back(pin))})`;
    this.title.style.opacity = Math.min(pin, out);
    const turn = Math.max(-.02, lerp(this.from, this.level, ease.back(enter(t, .5, Math.min(1.4, ctx.d * .4)))));
    const ang = this.lo + (this.hi - this.lo) * turn;
    this.knob.style.transform = `rotate(${ang}deg)`;
    // purple light beam fanning out from the knob over the active range
    const a0 = this.lo, w = Math.max(0, ang - this.lo);
    this.wedge.style.background = `conic-gradient(from ${a0}deg, color-mix(in srgb, ${this.col} 35%, transparent) 0deg, color-mix(in srgb, ${this.col} 95%, transparent) ${w}deg, transparent ${w + .5}deg)`;
    this.wedge.style.opacity = clamp(turn * 4);
    for (const { tk, f } of this.ticks) {
      const on = f <= turn + 1e-3;
      const col = `color-mix(in srgb, ${this.col} 55%, #fff)`;
      tk.style.background = on ? col : 'rgba(255,255,255,.22)';
      tk.style.boxShadow = on ? `0 0 14px ${col}` : 'none';
    }
    const q = enter(t, .5 + Math.min(1.4, ctx.d * .4) - .1, .3);
    this.val.textContent = Math.round(clamp(turn) * 100) + '%';
    if (q > 0 && this.word) this.val.innerHTML = `<span style="color:#ff4a3d">${this.word}</span>`;
    this.val.style.opacity = Math.min(enter(t, .5, .3), out);
    this.val.style.transform = `scale(${q > 0 ? ease.pop(q) : 1})`;
  },
};
