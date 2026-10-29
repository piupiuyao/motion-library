// 光标点关注 · 片头片尾：「关注」按钮弹出，鼠标滑过来点一下，按钮变成「已关注」，炸一下消失
TEMPLATES.c79 = {
  setup(ctx) {
    const P = ctx.params;
    this.y = P.y || 1180;
    this.T = { pop: .15, move: .55, click: 1.25, burst: P.burst_at || 2.25 };
    this.wrap = el('div', `position:absolute;left:50%;top:${this.y}px;transform-origin:50% 50%`);
    this.card = el('div', `display:flex;align-items:center;gap:26px;padding:22px 26px 22px 22px;background:rgba(255,255,255,.96);border-radius:999px;
      box-shadow:0 20px 50px rgba(0,0,0,.35);white-space:nowrap`);
    this.card.appendChild(el('div', `width:104px;height:104px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#3d7bff);
      display:flex;align-items:center;justify-content:center;font:900 54px var(--font-body);color:#111`, (P.handle || 'M')[0].toUpperCase()));
    this.card.appendChild(el('div', 'font:800 50px var(--font-body);color:#111', P.handle || '@monica'));
    this.btn = el('div', `padding:20px 40px 24px;border-radius:999px;background:#ff2d55;color:#fff;font:800 52px var(--font-body);min-width:250px;text-align:center`);
    this.btnA = P.label || '+ Follow'; this.btnB = P.done || '✓ Following';
    this.card.appendChild(this.btn);
    this.wrap.appendChild(this.card);
    this.ring = el('div', 'position:absolute;width:60px;height:60px;border-radius:50%;border:6px solid #fff;opacity:0');
    this.burst = el('div', `position:absolute;left:540px;top:${this.y + 74}px;width:0;height:0`);
    this.parts = Array.from({ length: 14 }, (_, j) => {
      const e = el('div', `position:absolute;left:50%;top:50%;width:${26 + (j % 3) * 12}px;height:${26 + (j % 3) * 12}px;margin:-20px;border-radius:50%;
        background:${['#ff2d55', 'var(--accent)', '#3d7bff', '#ffd400'][j % 4]};opacity:0`);
      this.burst.appendChild(e);
      return { e, a: j / 14 * Math.PI * 2 + (j % 2) * .2, r: 260 + (j * 53) % 160 };
    });
    this.cursor = el('div', 'position:absolute;left:0;top:0;width:90px;height:110px;transform-origin:0 0');
    this.cursor.innerHTML = `<svg viewBox="0 0 24 30" width="90" height="110"><path d="M2 2 L2 24 L8 18.5 L12 27 L16 25.3 L12 17 L20 17 Z" fill="#111" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    ctx.L.front.append(this.wrap, this.burst, this.ring, this.cursor);
    pending.push(document.fonts.ready);
  },
  frame(ctx) {
    const t = ctx.t, T = this.T;
    const pop = enter(t, T.pop, .45);
    const done = t >= T.click;
    this.btn.textContent = done ? this.btnB : this.btnA;
    this.btn.style.background = done ? '#d9d9de' : '#ff2d55';
    this.btn.style.color = done ? '#333' : '#fff';
    const press = t >= T.click - .08 && t < T.click + .25 ? Math.sin(clamp((t - T.click + .08) / .33) * Math.PI) : 0;
    const bq = clamp((t - T.burst) / .3);
    const sc = lerp(.3, 1, ease.pop(pop)) * (1 - .06 * press) * (t >= T.burst ? lerp(1.1, 0, ease.out(bq)) : 1);
    this.wrap.style.transform = `translateX(-50%) scale(${sc})`;
    this.wrap.style.opacity = t < T.pop ? 0 : (t >= T.burst ? 1 - bq : 1);
    // button centre on screen (button is the right part of the card)
    const r = this.btn.getBoundingClientRect(), s = this.cursor.parentElement.getBoundingClientRect();
    const k = 1080 / s.width;
    const bx = (r.left + r.width / 2 - s.left) * k, by = (r.top + r.height / 2 - s.top) * k;
    const m = ease.inOut(enter(t, T.move, T.click - T.move - .1));
    const cx = lerp(1000, bx, m), cy = lerp(1500, by, m);
    const cOut = clamp((t - T.burst + .2) / .3);
    this.cursor.style.opacity = t < T.move ? 0 : 1 - cOut;
    this.cursor.style.transform = `translate(${cx}px, ${cy}px) scale(${1 - .15 * press})`;
    const rq = clamp((t - T.click) / .4);
    this.ring.style.opacity = t >= T.click && rq < 1 ? 1 - rq : 0;
    this.ring.style.transform = `translate(${bx - 36}px, ${by - 36}px) scale(${1 + rq * 3})`;
    for (const p of this.parts) {
      const q = ease.out(bq);
      p.e.style.opacity = t >= T.burst && bq < 1 ? 1 - bq * bq : 0;
      p.e.style.transform = `translate(${Math.cos(p.a) * p.r * q}px, ${Math.sin(p.a) * p.r * q}px)`;
    }
  },
};
