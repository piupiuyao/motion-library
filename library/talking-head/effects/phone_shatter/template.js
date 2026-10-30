// 物体碎裂 · 素材：一部手机从旁边转进来，接着碎成玻璃渣飞散
TEMPLATES.phone_shatter = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.image) { this.off = true; return; }   // needs_assets 截图: no screenshot → render nothing
    const PW = P.w || 360, PH = Math.round((P.w || 360) * 2.05);
    this.PW = PW; this.PH = PH;
    this.cx = P.x || 700; this.cy = P.y || 1000;
    const phoneHTML = `<div style="position:absolute;inset:0;border-radius:64px;background:linear-gradient(135deg,#3a3a40,#0e0e10);box-shadow:inset 0 0 0 4px #55555c"></div>
      <div style="position:absolute;left:18px;top:18px;right:18px;bottom:18px;border-radius:50px;overflow:hidden;background:#fff">
        <img src="${url(P.image)}" style="width:100%;height:100%;object-fit:cover;object-position:${P.pos || '60% 0%'}">
        <div style="position:absolute;inset:0;background:linear-gradient(120deg, rgba(255,255,255,.35), transparent 40%)"></div></div>
      <div style="position:absolute;left:50%;top:30px;width:110px;height:32px;margin-left:-55px;border-radius:16px;background:#000"></div>`;
    // the phone is a two-sided card: screen in front, titanium back with a camera bump behind
    const backHTML = `<div style="position:absolute;inset:0;border-radius:64px;background:linear-gradient(140deg,#5a6372,#2b313b 45%,#1a1d23);box-shadow:inset 0 0 0 5px #7b8494, inset 0 0 0 9px #22262d"></div>
      <div style="position:absolute;left:26px;top:26px;width:${PW * .44}px;height:${PW * .44}px;border-radius:44px;background:linear-gradient(140deg,#4a525f,#262a31);box-shadow:inset 0 0 0 3px rgba(255,255,255,.12), 0 6px 14px rgba(0,0,0,.4)">
        ${[[.27, .27], [.27, .73], [.72, .5]].map(([a, b]) => `<div style="position:absolute;left:${b * 100}%;top:${a * 100}%;width:38%;height:38%;margin:-19% 0 0 -19%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3a4a6a,#05070b 60%);box-shadow:0 0 0 6px #1b1e24, 0 0 0 8px #555c68"></div>`).join('')}</div>
      <div style="position:absolute;left:50%;top:52%;width:70px;height:84px;margin:-42px 0 0 -35px;border-radius:50% 50% 45% 45%;background:rgba(255,255,255,.14)"></div>`;
    this.phone = el('div', `position:absolute;left:${this.cx - PW / 2}px;top:${this.cy - PH / 2}px;width:${PW}px;height:${PH}px;transform-style:preserve-3d`);
    const face = (html, back) => el('div', `position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;${back ? 'transform:rotateY(180deg)' : ''}`, html);
    this.phone.append(face(phoneHTML), face(backHTML, true));
    pending.push(this.phone.querySelector('img').decode().catch(() => {}));
    ctx.L.front.appendChild(this.phone);
    // shards: jittered grid split into triangles; each shard is a clipped copy of the phone
    let s = 11;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const nx = 4, ny = 6, pts = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const edge = i === 0 || j === 0 || i === nx || j === ny;
      pts.push([i / nx * PW + (edge ? 0 : (rnd() - .5) * PW / nx * .7), j / ny * PH + (edge ? 0 : (rnd() - .5) * PH / ny * .7)]);
    }
    const P_ = (i, j) => pts[j * (nx + 1) + i];
    this.shards = [];
    const impact = [PW * .55, PH * .45];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const tris = (i + j) % 2 ? [[P_(i, j), P_(i + 1, j), P_(i, j + 1)], [P_(i + 1, j), P_(i + 1, j + 1), P_(i, j + 1)]]
        : [[P_(i, j), P_(i + 1, j), P_(i + 1, j + 1)], [P_(i, j), P_(i + 1, j + 1), P_(i, j + 1)]];
      for (const tri of tris) {
        const e = el('div', `position:absolute;left:${this.cx - PW / 2}px;top:${this.cy - PH / 2}px;width:${PW}px;height:${PH}px;
          clip-path:polygon(${tri.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(',')});display:none`, phoneHTML);
        ctx.L.front.appendChild(e);
        const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        const dx = mx - impact[0], dy = my - impact[1], dist = Math.hypot(dx, dy) + 1;
        const sp = 900 + rnd() * 900;
        this.shards.push({ e, mx, my, vx: dx / dist * sp + (rnd() - .5) * 300, vy: dy / dist * sp - 500 * rnd(), vr: (rnd() - .5) * 900, vz: (rnd() - .5) * 720 });
      }
    }
    // crack lines + flash
    let cr = '';
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * Math.PI * 2 + rnd() * .4; let x = impact[0], y = impact[1]; cr += `M${x} ${y}`;
      for (let m = 0; m < 4; m++) { x += Math.cos(a + (rnd() - .5) * .6) * 60; y += Math.sin(a + (rnd() - .5) * .6) * 60; cr += ` L${x.toFixed(0)} ${y.toFixed(0)}`; }
    }
    this.crack = el('div', `position:absolute;left:${this.cx - PW / 2}px;top:${this.cy - PH / 2}px;width:${PW}px;height:${PH}px`,
      `<svg width="${PW}" height="${PH}"><path d="${cr}" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="bevel"/><circle cx="${impact[0]}" cy="${impact[1]}" r="18" fill="#fff"/></svg>`);
    ctx.L.front.appendChild(this.crack);
    this.flash = el('div', `position:absolute;left:${this.cx + impact[0] - PW / 2 - 400}px;top:${this.cy + impact[1] - PH / 2 - 400}px;width:800px;height:800px;border-radius:50%;
      background:radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,.3) 30%, transparent 65%)`);
    ctx.L.front.appendChild(this.flash);
    this.dim = el('div', 'position:absolute;inset:0;background:rgba(0,0,0,.45)');
    ctx.L.back.appendChild(this.dim);
    this.tIn = .1;
    this.tCrack = this.at(ctx, P.at, Math.min(1.3, ctx.d * .4));
    this.tBreak = this.tCrack + .35;
    if (P.label) {
      this.label = el('div', `position:absolute;left:0;right:0;top:160px;text-align:center;font-size:130px;color:var(--accent);-webkit-text-stroke:6px var(--ink);paint-order:stroke fill`, P.label);
      this.label.className = 'display'; ctx.L.front.appendChild(this.label);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3);
    this.dim.style.opacity = Math.min(enter(t, 0, .3), out);
    const pin = 1 - Math.pow(1 - enter(t, this.tIn, 1.1), 2.2);   // slow enough to see the back of the phone swing past
    const broken = t >= this.tBreak;
    this.phone.style.display = broken ? 'none' : 'block';
    const shake = t > this.tCrack && !broken ? Math.sin(t * 90) * 8 : 0;
    this.phone.style.transform = `perspective(1400px) translateX(${lerp(900, 0, pin) + shake}px) rotateY(${lerp(-320, 0, pin)}deg) rotateZ(${lerp(25, -6, pin)}deg)`;
    this.crack.style.display = t > this.tCrack && !broken ? 'block' : 'none';
    this.crack.style.transform = this.phone.style.transform;
    const fl = t > this.tBreak - .05 ? clamp(1 - (t - this.tBreak + .05) / .3) : 0;
    this.flash.style.opacity = fl; this.flash.style.transform = `scale(${lerp(1.4, .4, fl)})`;
    const u = t - this.tBreak;
    for (const sh of this.shards) {
      sh.e.style.display = broken ? 'block' : 'none';
      if (!broken) continue;
      const x = sh.vx * u, y = sh.vy * u + 1800 * u * u;
      sh.e.style.transformOrigin = `${sh.mx}px ${sh.my}px`;
      sh.e.style.transform = `perspective(1400px) translate(${x}px,${y}px) rotateZ(${-6 + sh.vr * u}deg) rotateX(${sh.vz * u}deg)`;
      sh.e.style.opacity = Math.min(clamp(1.6 - u), out);
    }
    if (this.label) { const q = enter(t, this.tBreak, .3); this.label.style.opacity = Math.min(q, out); this.label.style.transform = `scale(${ease.pop(q)}) rotate(-4deg)`; }
  },
};
