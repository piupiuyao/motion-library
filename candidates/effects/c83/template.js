// 翻牌数字 · 字体：一块机场翻牌板，每格字符快速上下翻片，从左到右逐格停到目标字符/数字，约 1–2 秒
TEMPLATES.c83 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const w = P.at != null ? ctx.words.find(w => norm(w.w) === norm(P.at)) : null;
    this.t0 = w ? w.s - .15 : (P.t0 != null ? P.t0 : .15);
    if (!P.text) { this.off = true; return; } // required: without text the board is not shown
    const rows = String(P.text).toUpperCase().split('|');
    const cols = Math.max(...rows.map(r => r.length));
    const padded = rows.map(r => { const l = Math.floor((cols - r.length) / 2); return (' '.repeat(l) + r).padEnd(cols, ' '); });
    const cw = Math.min(150, Math.floor(880 / cols)), ch = Math.round(cw * 1.32), gap = Math.round(cw * .09);
    const W = cols * (cw + gap) - gap + 44, Hh = rows.length * (ch + gap) - gap + 44;
    this.board = el('div', `position:absolute;left:${(1080 - W) / 2}px;top:${P.y || 90}px;width:${W}px;height:${Hh}px;border-radius:22px;
      background:linear-gradient(#26282d,#16171a);box-shadow:0 30px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08);transform-origin:50% 0`);
    ctx.L.front.appendChild(this.board);
    const fs = Math.round(ch * .72);
    const half = (top, extra = '') => {
      // a half-cell showing the top or bottom half of a full-height glyph
      const h = el('div', `position:absolute;left:0;width:${cw}px;height:${ch / 2}px;top:${top ? 0 : ch / 2}px;overflow:hidden;
        background:${top ? 'linear-gradient(#34363c,#2a2c31)' : 'linear-gradient(#25272b,#1d1e22)'};
        border-radius:${top ? '9px 9px 0 0' : '0 0 9px 9px'};backface-visibility:hidden;transform-origin:50% ${top ? '100%' : '0'};${extra}`);
      const g = el('div', `position:absolute;left:0;width:${cw}px;height:${ch}px;top:${top ? 0 : -ch / 2}px;display:flex;align-items:center;justify-content:center;
        font:700 ${fs}px/1 "SF Mono","Menlo","Roboto Mono",monospace;color:#f2efe6`);
      h.appendChild(g);
      return { h, g };
    };
    const SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%$';
    this.cells = [];
    padded.forEach((r, ri) => [...r].forEach((c, ci) => {
      const cell = el('div', `position:absolute;left:${22 + ci * (cw + gap)}px;top:${22 + ri * (ch + gap)}px;width:${cw}px;height:${ch}px;perspective:600px;
        box-shadow:0 6px 10px rgba(0,0,0,.45);border-radius:9px`);
      const top = half(true), bot = half(false), fT = half(true, 'z-index:2'), fB = half(false, 'z-index:2');
      cell.append(top.h, bot.h, fT.h, fB.h);
      cell.appendChild(el('div', `position:absolute;left:0;right:0;top:${ch / 2 - 1.5}px;height:3px;background:#0b0b0c;z-index:3`));
      this.board.appendChild(cell);
      const k = ri * cols + ci;
      // blank cells settle almost at once; the rest stop one after another, left to right
      const settle = c === " " ? 3 : 8 + Math.round(ci * 1.8 + ri * 2);
      this.cells.push({ top, bot, fT, fB, target: c, settle, k, SET });
    }));
    this.dt = P.flip || .065;
  },
  charAt(c, n) {
    if (n < 0) return ' ';
    if (n >= c.settle) return c.target;
    const r = Math.abs(Math.sin((c.k + 1) * 91.7 + n * 12.9898) * 43758.5453) % 1;
    return c.SET[Math.floor(r * c.SET.length)];
  },
  frame(ctx) {
    if (this.off) return;
    const pin = enter(ctx.t, this.t0 - .3, .3), out = ease.inOut(enter(ctx.t, ctx.d - .35, .3));
    this.board.style.opacity = Math.min(clamp(pin * 2), 1 - out);
    this.board.style.transform = `translateY(${lerp(-40, 0, ease.out(pin)) - out * 30}px)`;
    const x = (ctx.t - this.t0) / this.dt;
    for (const c of this.cells) {
      const n = Math.floor(x), f = x - n;
      const flipping = n >= 0 && n < c.settle;
      const now = this.charAt(c, Math.min(n, c.settle)), next = this.charAt(c, Math.min(n + 1, c.settle));
      const cur = flipping ? now : this.charAt(c, n < 0 ? -1 : c.settle);
      const nxt = flipping ? next : cur;
      // static halves: top shows the incoming glyph, bottom the outgoing one; two flaps animate between them
      c.top.g.textContent = nxt; c.bot.g.textContent = cur;
      c.fT.g.textContent = cur; c.fB.g.textContent = nxt;
      if (flipping && nxt !== cur) {
        c.fT.h.style.display = f < .5 ? '' : 'none';
        c.fB.h.style.display = f >= .5 ? '' : 'none';
        c.fT.h.style.transform = `rotateX(${-180 * f}deg)`;
        c.fB.h.style.transform = `rotateX(${180 * (1 - f)}deg)`;
        c.fT.h.style.filter = `brightness(${1 - f * .8})`;
      } else {
        c.fT.h.style.display = 'none'; c.fB.h.style.display = 'none';
        c.top.g.textContent = cur;
      }
    }
  },
};
