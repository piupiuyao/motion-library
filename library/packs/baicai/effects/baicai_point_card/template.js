// 观点卡 · 抠像版式：黑色低多边形线网背景，左上白色胶囊标签（POINT 1）+ 一行绿色小字；下方细白边深色框，左边标题，
// 抠出的人站在框里右侧、头冒出框顶；白菜的「输出观点就抠像出镜」
TEMPLATES.baicai_point_card = {
  setup(ctx) {
    const P = ctx.params;
    this.off = !P.title;
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // low-poly line network on black (deterministic)
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pts = Array.from({ length: 46 }, () => [rnd() * 1240 - 80, rnd() * 2080 - 80]);
    let lines = '', tris = '';
    pts.forEach((a, i) => {
      const near = pts.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).sort((x, y) => x[0] - y[0]).slice(1, 4);
      near.forEach(([, j]) => { lines += `<line x1="${a[0] | 0}" y1="${a[1] | 0}" x2="${pts[j][0] | 0}" y2="${pts[j][1] | 0}"/>`; });
      if (i % 4 === 0) { const b = pts[near[0][1]], c = pts[near[1][1]]; tris += `<polygon points="${a[0] | 0},${a[1] | 0} ${b[0] | 0},${b[1] | 0} ${c[0] | 0},${c[1] | 0}"/>`; }
    });
    ctx.L.bg.style.background = 'radial-gradient(ellipse at 50% 35%, #141414, #030303 75%)';
    this.net = el('div', 'position:absolute;inset:0');
    this.net.innerHTML = `<svg width="1080" height="1920" style="position:absolute;inset:0"><g fill="rgba(255,255,255,.035)" stroke="none">${tris}</g>
      <g stroke="rgba(255,255,255,.16)" stroke-width="1.6">${lines}</g></svg>`;
    ctx.L.bg.appendChild(this.net);
    // chip + green note (top left)
    this.head = el('div', 'position:absolute;left:84px;top:300px;right:84px');
    const chip = el('div', '', P.tag || 'POINT 1');
    chip.className = 'pk-display pk-chip';
    this.head.appendChild(chip);
    if (P.note) {
      const n = el('div', 'margin-top:30px;font-size:30px;letter-spacing:.2em;line-height:1.7', P.note);
      n.className = 'pk-green';
      this.head.appendChild(n);
    }
    ctx.L.front.appendChild(this.head);
    // framed box (behind the person so the head overlaps its top edge)
    const B = this.B = { l: 56, r: 1024, t: P.boxTop || 1330, b: (P.boxTop || 1330) + 420 };
    this.box = el('div', `position:absolute;left:${B.l}px;top:${B.t}px;width:${B.r - B.l}px;height:${B.b - B.t}px;box-sizing:border-box;
      border:4px solid rgba(255,255,255,.88);border-radius:14px;background:rgba(38,38,40,.62);box-shadow:0 30px 80px rgba(0,0,0,.6)`);
    const title = el('div', `position:absolute;left:58px;top:${P.sub ? 120 : 160}px;width:470px;font:500 ${P.size || 84}px/1.05 var(--font-body);color:#fff;letter-spacing:.08em`, P.title);
    this.box.appendChild(title);
    if (P.sub) this.box.appendChild(el('div', 'position:absolute;left:60px;bottom:110px;width:460px;font:400 26px/1.3 var(--font-body);color:rgba(255,255,255,.75);letter-spacing:.22em', P.sub));
    ctx.L.back.appendChild(this.box);
    this.title = title;
    // where the person lands: face just above the box top, right half
    this.s = P.scale || .56;
    this.fx = ctx.focus[0] * 1080; this.fy = ctx.focus[1] * 1920;
    this.dst = [P.personX || 810, B.t - 20];
    ctx.person.style.transformOrigin = '0 0';
    // soften the footage's own left edge where her arm is cut by the source frame
    ctx.person.style.webkitMaskImage = ctx.person.style.maskImage = 'linear-gradient(90deg, transparent 0, #000 220px)';
    ctx.base.style.transformOrigin = '0 0';
    this.tTitle = at(P.at); if (this.tTitle == null) this.tTitle = .45;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .2);
    const p = ease.inOut(enter(t, 0, .6));
    const s = lerp(ctx.seg.zoom || 1, this.s, p);
    const tx = lerp(0, this.dst[0] - this.s * this.fx, p), ty = lerp(0, this.dst[1] - this.s * this.fy, p);
    const tr = `translate(${tx}px, ${ty}px) scale(${s})`;
    ctx.base.style.transform = tr;
    ctx.base.style.opacity = 1 - clamp(p * 1.6);
    ctx.person.style.transform = tr;
    // body cut off at the box bottom (local coords of the scaled layer)
    const cut = Math.max(0, 1920 - (this.B.b - 4 - ty) / s);
    ctx.person.style.clipPath = `inset(0 0 ${p > .5 ? cut : 0}px 0)`;
    ctx.personCv.style.filter = 'brightness(.98) contrast(1.06) saturate(.86) sepia(.06)';
    ctx.L.bg.style.opacity = clamp(p * 1.8);
    const b = ease.out(enter(t, .3, .45));
    this.box.style.opacity = Math.min(b, out);
    this.box.style.transform = `translateY(${lerp(40, 0, b)}px)`;
    const q = ease.out(enter(t, this.tTitle, .45));
    this.title.style.opacity = q;
    this.title.style.letterSpacing = `${lerp(.24, .08, q)}em`;
    const h = ease.out(enter(t, .2, .4));
    this.head.style.opacity = Math.min(h, out);
    this.head.style.transform = `translateX(${lerp(-30, 0, h)}px)`;
  },
};
