// 3D翻转图标 · 素材：一个 App 图标在人身边带厚度做 3D 翻转（近大远小），每提到一个名字翻到下一个，最后斜着定住轻轻浮动
TEMPLATES.c102 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    // steps: [{icon, at}] — the first appears at its word, each next one flips in at its word
    // icon = a name/word ('Slack', 'gym', 'ui:wallet'); default = the spoken word itself. No matching icon → that step is left out.
    const tile = q => { const e = iconTile(q, 100); if (!e) return null; e.style.cssText += ';width:100%;height:100%;border-radius:22%;box-shadow:none'; return e.outerHTML; };
    const steps = (P.steps || []).map(s => ({ ...s, html: s.img ? `<img src="${url(s.img)}" style="width:100%;height:100%;object-fit:cover;border-radius:22%">` : tile(s.icon || s.at) }))
      .filter(s => s.html);
    if (!steps.length) { this.off = true; return; } // required: not shown without steps
    this.steps = steps.map((s, k) => ({ html: s.html,
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
