// 道具出纸揭价 · 素材：人缩进顶部小窗，下方一台横向滚筒把一整张图「印」出来再带模糊掉走；白色药丸里数字打码乱跳，最后停在「?」
TEMPLATES.printer_reveal = {
  // seconds from a number or a spoken word ("40" / "After,"), else def
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.off = !P.media;               // needs_assets 照片: nothing uploaded → render nothing
    if (this.off) return;
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 50% 30%, var(--bg-b), var(--bg-a) 75%)';
    // speaker window (top)
    this.win = { x: 60, y: 70, w: 960, h: 600 };
    const s = this.win.w / 1080, srcH = this.win.h / s;
    this.srcTop = clamp(ctx.focus[1] * 1920 + 70 - srcH * .5, 0, 1920 - srcH);
    this.s = s;
    ctx.base.style.clipPath = `inset(${this.srcTop}px 0 ${1920 - this.srcTop - srcH}px 0 round ${30 / s}px)`;
    ctx.base.style.transformOrigin = '0 0';
    ctx.L.back.appendChild(el('div', `position:absolute;left:${this.win.x - 3}px;top:${this.win.y - 3}px;width:${this.win.w}px;height:${this.win.h}px;
      border:3px solid color-mix(in srgb, var(--paper) 55%, transparent);border-radius:32px;box-shadow:0 24px 60px rgba(0,0,0,.45)`));
    // printer: two metal rollers between dark side plates
    const top = P.y || 760, pw = 780, px = (1080 - pw) / 2;
    const metal = 'linear-gradient(180deg,#1b1b1f 0%,#55555c 22%,#d9d9de 46%,#f7f7f9 52%,#8b8b93 72%,#2a2a2f 100%)';
    const pr = el('div', `position:absolute;left:${px}px;top:${top}px;width:${pw}px;height:120px`);
    pr.appendChild(el('div', `position:absolute;left:24px;right:24px;top:30px;height:16px;background:#0d0d10;border-radius:8px`));
    pr.appendChild(el('div', `position:absolute;left:30px;right:30px;top:6px;height:42px;border-radius:21px;background:${metal}`));
    this.roll = el('div', `position:absolute;left:30px;right:30px;top:52px;height:48px;border-radius:24px;background:${metal};overflow:hidden`);
    this.stripes = el('div', 'position:absolute;inset:-48px 0;background:repeating-linear-gradient(180deg,transparent 0 10px,rgba(0,0,0,.18) 10px 12px)');
    this.roll.appendChild(this.stripes);
    pr.appendChild(this.roll);
    for (const side of ['left:0', 'right:0'])
      pr.appendChild(el('div', `position:absolute;${side};top:-6px;width:34px;height:120px;border-radius:10px;
        background:linear-gradient(90deg,#111114,#3b3b42 50%,#111114);box-shadow:0 8px 20px rgba(0,0,0,.5)`));
    // the sheet, clipped so it seems to come out of the rollers
    const sw = P.width || 620, sh = P.height || 470, grid = P.grid || [1, 1];
    this.sh = sh;
    const clip = el('div', `position:absolute;left:${(1080 - sw) / 2}px;top:${top + 92}px;width:${sw}px;height:${1920 - top}px;overflow:hidden`);
    this.sheet = el('div', `position:absolute;left:0;top:0;width:${sw}px;height:${sh}px;box-sizing:border-box;padding:16px;background:#f3eee4;
      display:grid;grid-template-columns:repeat(${grid[0]},1fr);grid-template-rows:repeat(${grid[1]},1fr);gap:10px;box-shadow:0 20px 40px rgba(0,0,0,.4)`);
    for (let i = 0; i < grid[0] * grid[1]; i++) {
      const img = el('img', 'width:100%;height:100%;object-fit:cover;display:block;min-height:0');
      img.src = typeof P.media === 'string' ? url(P.media) : mediaSrc(P.media, 0);
      pending.push(img.decode().catch(() => {}));
      this.sheet.appendChild(img);
    }
    clip.appendChild(this.sheet);
    ctx.L.front.appendChild(clip);
    ctx.L.front.appendChild(pr);
    // price pill: prefix + scrambled digits + suffix → final ("?")
    this.mask = String(P.mask || '_.__');
    this.final = P.final != null ? String(P.final) : '?';
    this.pill = el('div', `position:absolute;left:50%;top:${P.pillY || 1650}px;transform:translateX(-50%);display:flex;align-items:baseline;gap:14px;
      white-space:nowrap;padding:14px 40px 18px;border-radius:999px;background:var(--paper);color:var(--ink);box-shadow:0 16px 40px rgba(0,0,0,.35)`);
    if (P.prefix) this.pill.appendChild(el('span', 'font:800 72px var(--font-body)', P.prefix));
    this.digits = el('span', 'font:800 72px var(--font-body);font-variant-numeric:tabular-nums;display:inline-block');
    this.pill.appendChild(this.digits);
    if (P.suffix) this.pill.appendChild(el('span', 'font:600 32px var(--font-body);opacity:.6', P.suffix));
    ctx.L.front.appendChild(this.pill);
    this.t0 = this.tAt(ctx, P.at, .2);
    this.tPrint = this.t0 + (P.dur || 1.5);
    this.tFall = this.tAt(ctx, P.drop, Math.min(ctx.d - .7, this.tPrint + 1));
    this.tFinal = this.tAt(ctx, P.reveal, Math.max(this.tPrint, this.tFall - .25));
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, w = this.win, out = leave(ctx);
    ctx.base.style.transform = `translate(${w.x}px,${w.y - this.srcTop * this.s}px) scale(${this.s})`;
    // print: sheet slides out of the rollers, rollers spin, a little vibration
    const p = ease.inOut(enter(t, this.t0, this.tPrint - this.t0));
    const running = t > this.t0 && t < this.tPrint;
    this.stripes.style.transform = `translateY(${(t * 90) % 12}px)`;
    const f = enter(t, this.tFall, .6);
    const jit = running ? Math.sin(t * 90) * 1.5 : 0;
    this.sheet.style.transform = `translate(${jit}px,${(p - 1) * this.sh + f * f * 1500}px) scaleY(${1 + f * .35})`;
    this.sheet.style.filter = f > 0 ? `blur(${(f * 10).toFixed(1)}px)` : '';
    this.sheet.style.opacity = p > 0 ? 1 - f * .5 : 0;
    // pill: pops in, digits flicker blurred, then lands on the final value
    const q = enter(t, this.t0 + .3, .45);
    this.pill.style.opacity = Math.min(clamp(q * 4), out);
    const fin = t >= this.tFinal;
    const pop = fin ? 1 + .14 * Math.sin(Math.PI * clamp((t - this.tFinal) / .3)) : 1;
    this.pill.style.transform = `translateX(-50%) scale(${lerp(.5, 1, ease.pop(q)) * pop})`;
    if (fin) { this.digits.textContent = this.final; this.digits.style.filter = ''; this.digits.style.opacity = 1; }
    else {
      const n = Math.floor(t * 14), rnd = i => { const x = Math.sin((n * 31 + i * 7) * 12.9898) * 43758.5453; return x - Math.floor(x); };
      this.digits.textContent = [...this.mask].map((c, i) => c === '_' ? String(Math.floor(rnd(i) * 10)) : c).join('');
      this.digits.style.filter = 'blur(7px)';
      this.digits.style.opacity = .85;
    }
  },
};
