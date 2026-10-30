// 3D翻转图标 · 素材：一个 App 图标在人身边带厚度做 3D 翻转（近大远小），每提到一个名字翻到下一个，最后斜着定住轻轻浮动
TEMPLATES.c102 = {
  icons: {
    mail: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" rx="22" fill="#fff"/>
      <path d="M18 30 h64 v42 h-64z" fill="#fff" stroke="#e8e8e8" stroke-width="2"/><path d="M18 30 v42 h12 V44 L50 59 L70 44 V72 h12 V30 L50 52 Z" fill="#ea4335"/>
      <path d="M18 30 L30 39 V72 H18Z" fill="#4285f4"/><path d="M82 30 L70 39 V72 H82Z" fill="#34a853"/><path d="M18 30 L50 52 L82 30 L74 30 L50 47 L26 30Z" fill="#c5221f"/></svg>`,
    chat: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" rx="22" fill="#25d366"/>
      <path d="M50 20 a30 30 0 1 1 -16 55 l-14 4 l4 -13 A30 30 0 0 1 50 20z" fill="none" stroke="#fff" stroke-width="6"/>
      <path d="M38 36 c-3 3 -3 9 3 16 s13 9 16 6 l3 -4 l-7 -5 l-3 3 c-3 -1 -8 -6 -9 -9 l3 -3 l-5 -7z" fill="#fff"/></svg>`,
    slack: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" rx="22" fill="#fff"/>
      <g stroke-linecap="round" stroke-width="11"><path d="M40 22 V48" stroke="#36c5f0"/><path d="M22 60 H48" stroke="#2eb67d"/>
      <path d="M60 52 V78" stroke="#e01e5a"/><path d="M52 40 H78" stroke="#ecb22e"/></g>
      <g stroke-linecap="round" stroke-width="11"><path d="M22 40 h4" stroke="#36c5f0"/><path d="M60 22 v4" stroke="#2eb67d"/><path d="M78 60 h-4" stroke="#e01e5a"/><path d="M40 78 v-4" stroke="#ecb22e"/></g></svg>`,
    plane: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" rx="22" fill="#2aabee"/>
      <path d="M20 49 L78 26 L68 76 L50 63 L41 72 L42 58 L68 36 L36 54Z" fill="#fff"/></svg>`,
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    // steps: [{icon, at}] — the first appears at its word, each next one flips in at its word
    const steps = P.steps || [];
    if (!steps.length) { this.off = true; return; } // required: not shown without steps
    this.steps = steps.map((s, k) => ({ html: s.img ? `<img src="${url(s.img)}" style="width:100%;height:100%;object-fit:cover;border-radius:22%">` : this.icons[s.icon] || this.icons.mail,
      t: k === 0 ? (s.at ? ((ctx.words.find(w => n(w.w) === n(s.at)) || { s: 0 }).s) : 0)
        : ((ctx.words.find(w => n(w.w) === n(s.at || '')) || { s: ctx.d * k / steps.length }).s) }));
    this.steps[0].t = Math.max(0, this.steps[0].t - .1);
    const S = this.size = P.size || 280;
    this.pos = [P.x ?? 860, P.y ?? 330];
    this.scene = el('div', `position:absolute;left:${this.pos[0] - S / 2}px;top:${this.pos[1] - S / 2}px;width:${S}px;height:${S}px;perspective:900px`);
    this.cube = el('div', `position:absolute;inset:0;transform-style:preserve-3d`);
    this.thick = 26;
    // thickness: stacked slabs between the two faces
    for (let i = 1; i < 13; i++)
      this.cube.appendChild(el('div', `position:absolute;inset:0;border-radius:22%;background:${i % 2 ? '#d9d9d9' : '#cfcfcf'};transform:translateZ(${-i * this.thick / 13}px)`));
    this.front = el('div', `position:absolute;inset:0;border-radius:22%;overflow:hidden;backface-visibility:hidden;transform:translateZ(0)`);
    this.back = el('div', `position:absolute;inset:0;border-radius:22%;overflow:hidden;backface-visibility:hidden;transform:translateZ(${-this.thick}px) rotateY(180deg)`);
    this.cube.append(this.front, this.back);
    this.scene.appendChild(this.cube);
    this.shadow = el('div', `position:absolute;left:${this.pos[0] - S * .45}px;top:${this.pos[1] + S * .62}px;width:${S * .9}px;height:${S * .16}px;border-radius:50%;
      background:radial-gradient(ellipse, rgba(0,0,0,.45), transparent 70%)`);
    ctx.L.front.append(this.shadow, this.scene);
    this.cur = [-1, -1];
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, st = this.steps;
    let j = 0;
    st.forEach((s, k) => { if (k && t >= s.t) j = k; });
    let fi, bi;
    if (j === 0) { fi = 0; bi = 0; } else if (j % 2) { fi = j - 1; bi = j; } else { bi = j - 1; fi = j; }
    if (this.cur[0] !== fi) { this.front.innerHTML = st[fi].html; this.cur[0] = fi; }
    if (this.cur[1] !== bi) { this.back.innerHTML = st[bi].html; this.cur[1] = bi; }
    const pin = enter(t, st[0].t, .8);
    let ang = -360 * (1 - ease.out(pin));
    for (let k = 1; k < st.length; k++) ang += 180 * ease.inOut(enter(t, st[k].t - .05, .5));
    const settle = ease.inOut(enter(t, st[st.length - 1].t + .5, .6));
    const fl = Math.sin(t * 2.2);
    ang += settle * (-28 + fl * 6);
    const sc = lerp(.2, 1, ease.pop(pin));
    this.cube.style.transform = `translateY(${fl * 12}px) translateZ(${this.thick / 2}px) rotateX(${8 + fl * 3}deg) rotateY(${ang}deg) scale(${sc})`;
    this.scene.style.opacity = Math.min(clamp(pin * 5), leave(ctx));
    this.shadow.style.opacity = Math.min(pin, leave(ctx)) * .8;
    this.shadow.style.transform = `scaleX(${(.55 + .45 * Math.abs(Math.cos(ang * Math.PI / 180))) * sc})`;
  },
};
