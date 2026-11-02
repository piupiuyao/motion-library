// 缩写首字母拆解 · 字体：头顶上方一个缩写的全称一行一个词逐行出现（斜体衬线、首字母高亮），然后人缩进下方小窗，全称收成大号缩写；可再替换一个字母变成另一个缩写
TEMPLATES.acronym_split = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    const words = (Array.isArray(P.words) ? P.words : []).map(x => typeof x === 'string' ? { text: x, at: null } : x).filter(x => x && x.text);
    this.off = !words.length;          // the full name is required (planner fills it from speech)
    if (this.off) return;
    const n = words.length;
    this.items = words.map((x, i) => ({ text: String(x.text), s: this.tAt(ctx, x.at, .2 + i * .45) }));
    const firsts = this.items.map(x => [...x.text.trim()][0].toUpperCase());
    this.abbr = P.abbr || firsts.join('');
    const lastS = Math.max(...this.items.map(x => x.s));
    this.t2 = this.tAt(ctx, P.collapse, Math.min(lastS + 1, ctx.d - 1.4));
    const mono = '"SF Mono","Menlo","Monaco",monospace', serif = '"Hoefler Text","Iowan Old Style",Georgia,"Songti SC",serif';
    // ---- phase 1: words stacked above the head
    this.p1 = el('div', 'position:absolute;inset:0');
    this.p1.appendChild(el('div', 'position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,.35) 55%,transparent)'));
    this.p1.appendChild(el('div', `position:absolute;left:78px;top:${(P.y || 150)}px;font:600 30px ${mono};letter-spacing:.2em;color:var(--accent)`,
      '— ' + firsts.join(' · ')));
    this.lines = this.items.map((x, i) => {
      const ch = [...x.text];
      const e = el('div', `position:absolute;left:72px;top:${(P.y || 150) + 56 + i * 136}px;font:italic 400 ${P.size || 130}px/1 ${serif};
        color:#fff;white-space:nowrap;text-shadow:0 4px 24px rgba(0,0,0,.45)`,
        `<span style="color:var(--accent)">${ch[0]}</span>${ch.slice(1).join('')}`);
      this.p1.appendChild(e);
      return { e, s: x.s };
    });
    ctx.L.front.appendChild(this.p1);
    // ---- phase 2: dark screen, speaker in a small window, big abbreviation
    ctx.L.bg.style.background = 'radial-gradient(circle, rgba(255,255,255,.07) 2px, transparent 3px) 0 0/36px 36px, var(--bg-a)';
    this.win = { x: 90, y: P.winY || 900, w: 900, h: 500 };
    const s = this.win.w / 1080, srcH = this.win.h / s;
    this.s = s; this.srcH = srcH;
    this.srcTop = clamp(ctx.focus[1] * 1920 + 70 - srcH * .5, 0, 1920 - srcH);
    ctx.base.style.transformOrigin = '0 0';
    this.p2 = el('div', 'position:absolute;inset:0;opacity:0');
    this.frameEl = el('div', `position:absolute;left:${this.win.x - 3}px;top:${this.win.y - 3}px;width:${this.win.w}px;height:${this.win.h}px;
      border:3px solid color-mix(in srgb, var(--paper) 35%, transparent);border-radius:30px`);
    this.p2.appendChild(this.frameEl);
    this.big = el('div', `position:absolute;left:84px;top:${P.y2 || 300}px;font:800 ${P.size2 || 190}px/1 ${mono};letter-spacing:.04em;color:#fff;white-space:nowrap`);
    this.p2.appendChild(this.big);
    this.sub = el('div', `position:absolute;left:92px;top:${(P.y2 || 300) + (P.size2 || 190) + 26}px;font:600 30px ${mono};letter-spacing:.18em;
      color:rgba(255,255,255,.7);text-transform:uppercase;white-space:nowrap`);
    this.p2.appendChild(this.sub);
    ctx.L.front.appendChild(this.p2);
    this.full = P.full || this.items.map(x => x.text).join(' ');
    const sw = P.swap || null;
    this.swap = sw && sw.abbr ? { abbr: String(sw.abbr), full: sw.full || '', s: this.tAt(ctx, sw.at, Math.min(this.t2 + 1, ctx.d - .6)) } : null;
    this.letters = [];
    const A = [...this.abbr], B = this.swap ? [...this.swap.abbr] : A;
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const sp = el('span', 'display:inline-block;transform-origin:50% 60%');
      this.big.appendChild(sp);
      this.letters.push({ sp, a: A[i] || '', b: B[i] || '', diff: (A[i] || '') !== (B[i] || '') });
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx);
    // phase 1
    for (const l of this.lines) {
      const q = enter(t, l.s - .05, .4);
      l.e.style.opacity = ease.out(q);
      l.e.style.transform = `translateY(${(1 - ease.out(q)) * 30}px)`;
    }
    const k = ease.inOut(enter(t, this.t2, .5));
    this.p1.style.opacity = 1 - clamp(k * 2.5);
    // phase 2: video shrinks from full frame into the window
    const w = this.win, s = lerp(1, this.s, k);
    const top = lerp(0, this.srcTop, k), bot = lerp(0, 1920 - this.srcTop - this.srcH, k);
    ctx.base.style.clipPath = k > 0 ? `inset(${top}px 0 ${bot}px 0 round ${lerp(0, 30 / this.s, k)}px)` : '';
    ctx.base.style.transform = `translate(${lerp(0, w.x, k)}px,${lerp(0, w.y - this.srcTop * this.s, k)}px) scale(${s})`;
    this.p2.style.opacity = Math.min(k, out);
    const q = enter(t, this.t2 + .25, .45);
    this.big.style.opacity = ease.out(q);
    this.big.style.transform = `translateY(${(1 - ease.out(q)) * 40}px)`;
    const sw = this.swap, f = sw ? enter(t, sw.s, .4) : 0;
    for (const L of this.letters) {
      const showB = sw && f >= .5;
      L.sp.textContent = showB ? L.b : L.a;
      L.sp.style.color = showB && L.diff ? 'var(--accent)' : '';
      L.sp.style.transform = L.diff && sw && f > 0 && f < 1 ? `rotateX(${Math.abs(.5 - f) < .5 ? (f < .5 ? f * 180 : (f - 1) * 180) : 0}deg)` : '';
    }
    this.sub.textContent = sw && f >= .5 ? sw.full : this.full;
    this.sub.style.opacity = clamp((t - this.t2 - .45) / .35);
  },
};
