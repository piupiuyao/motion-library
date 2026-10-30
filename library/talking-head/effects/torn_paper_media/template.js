// 撕纸边画面 · 转场：一段 B-roll 装在一张撕边纸片里（白纸边 + 投影），连同彩色纸面背景一起滑进来，最后滑走回到人
TEMPLATES.torn_paper_media = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.t0 = P.at != null ? P.at : .6;
    this.media = P.media;
    if (!this.media) { this.off = true; return; } // material missing: render nothing
    this.bgEl = el('div', `position:absolute;inset:0;background:${P.bg ? pattern(P.bg) : pattern('paper')}`);
    // tint the crumpled paper with the accent colour (multiply keeps the creases visible)
    if (!P.bg) this.bgEl.appendChild(el('div', `position:absolute;inset:0;background:${P.tint || 'var(--accent)'};mix-blend-mode:multiply`));
    ctx.L.front.appendChild(this.bgEl);
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    // torn rectangle: jagged on all four sides
    const torn = (x0, y0, x1, y1, amp) => {
      const p = [], st = 22;
      for (let x = x0; x < x1; x += st) p.push([x, y0 + (rnd() - .5) * amp]);
      for (let y = y0; y < y1; y += st) p.push([x1 + (rnd() - .5) * amp, y]);
      for (let x = x1; x > x0; x -= st) p.push([x, y1 + (rnd() - .5) * amp]);
      for (let y = y1; y > y0; y -= st) p.push([x0 + (rnd() - .5) * amp, y]);
      return `polygon(${p.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
    };
    const W = 940, Hh = 1000;
    this.piece = el('div', `position:absolute;left:70px;top:330px;width:${W}px;height:${Hh}px;transform-origin:50% 50%`);
    this.piece.appendChild(el('div', `position:absolute;left:14px;top:26px;width:${W}px;height:${Hh}px;background:rgba(0,0,0,.3);clip-path:${torn(0, 0, W, Hh, 26)}`));
    this.piece.appendChild(el('div', `position:absolute;inset:0;background:#fbfaf4;clip-path:${torn(0, 0, W, Hh, 26)}`));
    const win = el('div', `position:absolute;inset:0;overflow:hidden;clip-path:${torn(30, 30, W - 30, Hh - 30, 18)}`);
    this.img = el('img', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${P.pos || '100% 50%'}`);
    win.appendChild(this.img);
    this.piece.appendChild(win);
    if (P.label) {
      const tape = el('div', `position:absolute;left:${W / 2 - 200}px;top:-50px;width:400px;padding:14px 0 18px;text-align:center;background:rgba(255,255,255,.75);
        transform:rotate(-4deg);font:700 54px "Marker Felt","Chalkboard SE",cursive;color:var(--ink);box-shadow:0 4px 10px rgba(0,0,0,.15)`, P.label);
      this.piece.appendChild(tape);
    }
    ctx.L.front.appendChild(this.piece);
  },
  frame(ctx) {
    if (this.off) return;
    const t0 = this.t0, outT = ctx.d - .9;
    const bgIn = ease.inOut(enter(ctx.t, t0, .4)), bgOut = ease.inOut(enter(ctx.t, outT + .3, .4));
    this.bgEl.style.clipPath = `inset(0 0 0 ${(1 - bgIn) * 100 + 0}% )`;
    this.bgEl.style.transform = `translateX(${bgOut * -1080}px)`;
    const pin = ease.back(enter(ctx.t, t0 + .15, .55)), pout = ease.inOut(enter(ctx.t, outT, .45));
    this.piece.style.transform = `translate(${lerp(1100, 0, pin) - pout * 1150}px, ${lerp(120, 0, pin)}px) rotate(${lerp(14, -3, pin) - pout * 10}deg)`;
    this.piece.style.visibility = ctx.t >= t0 ? 'visible' : 'hidden';
    setImg(this.img, mediaSrc(this.media, Math.max(0, ctx.t - t0)));
  },
};
