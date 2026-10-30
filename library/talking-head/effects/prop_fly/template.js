// 道具旋转飞入 · 素材：一个跟这句话有关的道具（手机、硬币、轮胎）转着圈滑过人前面，带一团雾气
TEMPLATES.prop_fly = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.image && !P.emoji) { this.off = true; return; }   // 必填: emoji or image; none → render nothing
    const size = P.size || 460;
    this.prop = el('div', `position:absolute;left:0;top:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center`);
    if (P.image) {
      const img = el('img', 'max-width:100%;max-height:100%');
      img.src = url(P.image); pending.push(img.decode().catch(() => {}));
      this.prop.appendChild(img);
    } else this.prop.innerHTML = `<div style="font-size:${size * .82}px;line-height:1;filter:drop-shadow(0 30px 30px rgba(0,0,0,.4))">${P.emoji}</div>`;
    this.puffs = [];
    for (let i = 0; i < 9; i++) {
      const p = el('div', `position:absolute;left:0;top:0;width:360px;height:360px;margin:-180px 0 0 -180px;border-radius:50%;
        background:radial-gradient(circle, rgba(255,255,255,.75), rgba(255,255,255,.25) 45%, transparent 70%)`);
      ctx.L.front.appendChild(p);
      this.puffs.push({ p, k: i, r: Math.sin(i * 91.7) * .5 + .5 });
    }
    ctx.L.front.appendChild(this.prop);
    this.size = size;
    this.t0 = this.at(ctx, P.at, .3);
    this.dur = P.duration || Math.min(1.8, ctx.d - this.t0 - .2);
    this.y = P.y || ctx.focus[1] * 1920 + 380;
    this.dir = P.from === 'left' ? 1 : -1;
  },
  pos(u) {
    const x0 = this.dir < 0 ? 1080 + this.size : -this.size, x1 = this.dir < 0 ? -this.size : 1080 + this.size;
    // fast in, slows through the middle, fast out
    const v = u < .5 ? .5 * ease.out(u * 2) : .5 + .5 * Math.pow((u - .5) * 2, 2.2);
    return [lerp(x0, x1, v), this.y + Math.sin(u * Math.PI) * -80];
  },
  frame(ctx) {
    if (this.off) return;
    const u = (ctx.t - this.t0) / this.dur;
    const vis = u > 0 && u < 1;
    this.prop.style.display = vis ? 'flex' : 'none';
    if (vis) {
      const [x, y] = this.pos(u);
      this.prop.style.transform = `translate(${x - this.size / 2}px,${y - this.size / 2}px) rotate(${this.dir * -u * 540}deg) scale(${1 + Math.sin(u * Math.PI) * .15})`;
    }
    // fog puffs left behind along the path, each expands and fades
    for (const f of this.puffs) {
      const born = f.k / 9 * .8, age = (u - born) * this.dur;
      const a = age > 0 ? clamp(1 - age / .9) : 0;
      f.p.style.opacity = a * .8;
      if (a > 0) {
        const [x, y] = this.pos(born);
        f.p.style.transform = `translate(${x + (f.r - .5) * 120}px,${y + 60 + (f.r - .5) * 160 - age * 60}px) scale(${.5 + age * 1.2 + f.r * .3})`;
      }
    }
  },
};
