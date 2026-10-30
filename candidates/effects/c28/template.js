// 红线线索墙 · 素材：几张截图散在软木板上，红线把它们连起来，中间清楚、四周虚化，偏暖色
TEMPLATES.c28 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const imgs = P.images || [];
    if (!imgs.length) { this.off = true; return; }   // needs_assets: no screenshots → render nothing
    const notes = P.notes || [];
    this.bgc = el('div', `position:absolute;inset:0;background:radial-gradient(circle, rgba(0,0,0,.18) 1.5px, transparent 2px) 0 0/14px 14px,
      radial-gradient(circle, rgba(255,230,190,.12) 1px, transparent 2px) 7px 7px/11px 11px, linear-gradient(135deg,#b07a45,#8d5a2e)`);
    ctx.L.back.appendChild(this.bgc);
    this.wall = el('div', 'position:absolute;inset:0;transform-origin:50% 45%');
    ctx.L.back.appendChild(this.wall);
    const spots = [[540, 820, 560, -2, 0], [230, 330, 400, -8, 1], [850, 360, 380, 7, 1], [220, 1260, 380, 6, 1], [860, 1250, 400, -6, 1]];
    this.cards = imgs.slice(0, 5).map((src, k) => {
      const [x, y, w, r, blur] = spots[k];
      const c = el('div', `position:absolute;left:${x - w / 2}px;top:${y - w * .45}px;width:${w}px;padding:12px 12px 16px;background:#fdfbf5;
        box-shadow:0 18px 30px rgba(40,20,5,.45);${blur ? 'filter:blur(4px) sepia(.3);' : ''}transform:rotate(${r}deg)`);
      const im = el('img', 'display:block;width:100%;height:' + Math.round(w * .78) + 'px;object-fit:cover;object-position:top');
      im.src = url(src); pending.push(im.decode().catch(() => {}));
      c.appendChild(im);
      if (k && notes[k - 1]) c.appendChild(el('div', `font:700 34px 'Marker Felt','Chalkboard SE',cursive;color:#222;text-align:center;margin-top:8px`, notes[k - 1]));
      c.appendChild(el('div', 'position:absolute;left:50%;top:-14px;width:34px;height:34px;margin-left:-17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff7a6e,#b3120a);box-shadow:0 5px 6px rgba(0,0,0,.45)'));
      this.wall.appendChild(c);
      return { c, x, y: y - w * .45 };
    });
    // red string from every card to the centre one
    let s = '';
    this.cards.slice(1).forEach(({ x, y }, k) => {
      const X = this.cards[0].x, Y = this.cards[0].y;
      s += `<path d="M${x} ${y} Q ${(x + X) / 2} ${(y + Y) / 2 + 60} ${X} ${Y}" fill="none" stroke="#d11a1a" stroke-width="7" pathLength="1" stroke-dasharray="1 1"/>`;
    });
    if (this.cards.length > 2) s += `<path d="M${this.cards[1].x} ${this.cards[1].y} Q 540 300 ${this.cards[2].x} ${this.cards[2].y}" fill="none" stroke="#d11a1a" stroke-width="7" pathLength="1" stroke-dasharray="1 1"/>`;
    const sv = el('div', 'position:absolute;inset:0;pointer-events:none');
    sv.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0">${s}</svg>`;
    this.wall.appendChild(sv);
    this.strings = [...sv.querySelectorAll('path')];
    this.warm = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%, rgba(255,200,120,.05) 30%, rgba(60,25,5,.7) 85%)');
    ctx.L.back.appendChild(this.warm);
    if (P.label) {
      this.label = el('div', `position:absolute;left:0;right:0;top:120px;text-align:center;font-size:110px;color:#fff;-webkit-text-stroke:6px #3a0a0a;paint-order:stroke fill`, P.label);
      this.label.className = 'display';
      ctx.L.front.appendChild(this.label);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    for (const e of [this.bgc, this.wall, this.warm]) e.style.opacity = Math.min(pin, out);
    this.wall.style.transform = `scale(${lerp(1.08, 1.2, ease.inOut(clamp(t / ctx.d)))}) rotate(${lerp(-1.5, .5, clamp(t / ctx.d))}deg)`;
    this.cards.forEach(({ c }, k) => {
      const q = enter(t, .1 + k * .18, .3);
      c.style.opacity = q;
      c.style.translate = `0 ${lerp(-60, 0, ease.back(q))}px`;
    });
    this.strings.forEach((p, k) => { p.style.strokeDashoffset = 1 - ease.inOut(enter(t, .8 + k * .25, .45)); });
    if (this.label) { const q = enter(t, .3, .3); this.label.style.opacity = Math.min(q, out); this.label.style.transform = `scale(${ease.pop(q)})`; }
  },
};
