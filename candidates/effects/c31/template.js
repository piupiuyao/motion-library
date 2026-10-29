// 纸片展开图形 · 素材：扁平的剪纸插画和纸片字母一步步翻开、展开，出现在人旁边
TEMPLATES.c31 = {
  setup(ctx) {
    const P = ctx.params;
    const word = (P.text || 'REPLY').toUpperCase();
    const cols = ['#ff6b5a', '#ffc94a', '#4cc38a', '#4aa3ff', '#b47cff', '#ff8fc7'];
    this.row = el('div', 'position:absolute;left:0;right:0;top:150px;display:flex;justify-content:center;gap:14px;perspective:900px');
    this.letters = [...word].map((ch, k) => {
      const c = el('div', `width:${Math.min(170, 900 / word.length)}px;height:200px;background:${cols[k % cols.length]};border-radius:14px;
        display:flex;align-items:center;justify-content:center;font:900 150px/1 var(--font-display);color:#fff;transform-origin:50% 0%;
        box-shadow:0 10px 0 rgba(0,0,0,.18), 0 16px 24px rgba(0,0,0,.25);text-shadow:0 5px 0 rgba(0,0,0,.15);
        background-image:linear-gradient(180deg, rgba(255,255,255,.18), transparent 40%, rgba(0,0,0,.08))`, ch);
      this.row.appendChild(c); return c;
    });
    ctx.L.front.appendChild(this.row);
    // paper-cut illustration: a speech bubble + envelope made of layered card, unfolding panel by panel
    const fx = ctx.focus[0] * 1080;
    this.art = el('div', `position:absolute;left:${fx > 540 ? 0 : 690}px;top:600px;width:380px;height:520px;perspective:1000px;transform-origin:${fx > 540 ? 0 : 100}% 0;scale:.85`);
    const panel = (css, html = '') => el('div', `position:absolute;transform-origin:50% 100%;box-shadow:0 10px 18px rgba(0,0,0,.28);${css}`, html);
    this.panels = [
      panel('left:20px;top:250px;width:340px;height:230px;background:#f3e9d2;border-radius:10px;transform-origin:50% 100%',
        `<div style="position:absolute;left:0;top:0;width:0;height:0;border-left:170px solid transparent;border-right:170px solid transparent;border-top:130px solid #e2d3b0"></div>`),
      panel('left:60px;top:20px;width:280px;height:200px;background:#4aa3ff;border-radius:40px;transform-origin:50% 100%',
        `<div style="position:absolute;left:40px;bottom:-40px;width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-top:50px solid #4aa3ff"></div>
         <div style="position:absolute;left:40px;right:40px;top:60px;display:flex;justify-content:space-between">${[0, 1, 2].map(() => '<i style="width:44px;height:44px;border-radius:50%;background:#fff;display:block"></i>').join('')}</div>`),
      panel('left:250px;top:170px;width:120px;height:120px;background:#ff6b5a;border-radius:50%;transform-origin:50% 50%',
        `<div style="color:#fff;font:900 76px/120px var(--font-display);text-align:center">3</div>`),
    ];
    this.panels.forEach(p => this.art.appendChild(p));
    ctx.L.front.appendChild(this.art);
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3);
    this.letters.forEach((c, k) => {
      const q = enter(t, .1 + k * .12, .45);
      // flips down like a folded card opening, with a little overshoot
      c.style.transform = `rotateX(${lerp(-95, 0, ease.back(q))}deg) rotate(${(k % 2 ? 3 : -3) * ease.out(q)}deg)`;
      c.style.opacity = Math.min(q > 0 ? 1 : 0, out);
    });
    const base = .4;
    this.panels.forEach((p, k) => {
      const q = enter(t, base + k * .35, .5);
      const tf = k === 2 ? `scale(${ease.pop(q)}) rotate(${lerp(-180, 0, ease.out(q))}deg)` : `rotateX(${lerp(90, 0, ease.back(q))}deg)`;
      p.style.transform = tf;
      p.style.opacity = Math.min(q > 0 ? 1 : 0, out);
    });
    this.art.style.transform = `translateY(${Math.sin(t * 1.8) * 6}px) rotate(${Math.sin(t * 1.2) * 1.5}deg)`;
  },
};
