// 取景角标标签 · 素材：上方放一段素材、人移到下方；素材四角收进白色细直角角标，散着小十字准星，左上一个等宽小标签随讲解切换文字
TEMPLATES.viewfinder_label = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    this.off = !P.media;               // needs_assets B-roll视频: nothing uploaded → render nothing
    if (this.off) return;
    const H = this.H = P.height || 700;
    // the talking head slides down under the material so the face sits below it
    this.shift = clamp(H + 20 - (ctx.focus[1] * 1920 - 200), 0, 900);
    ctx.L.bg.style.background = 'var(--bg-a)';
    const box = el('div', `position:absolute;left:0;top:0;width:1080px;height:${H}px;overflow:hidden;background:#000`);
    this.img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover');
    box.appendChild(this.img);
    box.appendChild(el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 30%,transparent 80%,rgba(0,0,0,.3))'));
    this.box = box;
    ctx.L.back.appendChild(box);
    // corner brackets
    const m = 56, arm = 74, lw = 4, col = 'rgba(255,255,255,.92)';
    this.inset = { l: m, r: m, t: 70, b: 70 };
    this.corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy]) => {
      const c = el('div', `position:absolute;width:${arm}px;height:${arm}px;box-sizing:border-box;
        border-${cy ? 'bottom' : 'top'}:${lw}px solid ${col};border-${cx ? 'right' : 'left'}:${lw}px solid ${col}`);
      ctx.L.front.appendChild(c);
      return { c, cx, cy, arm };
    });
    // a few small crosshairs, seeded positions
    const rnd = i => { const x = Math.sin(i * 78.233 + 4.1) * 43758.5453; return x - Math.floor(x); };
    this.cross = [];
    for (let i = 0; i < (P.crosses != null ? P.crosses : 4); i++) {
      const c = el('div', `position:absolute;left:${180 + rnd(i) * 720}px;top:${150 + rnd(i + 9) * (H - 300)}px;width:30px;height:30px;
        background:linear-gradient(${col},${col}) center/2px 100% no-repeat, linear-gradient(${col},${col}) center/100% 2px no-repeat;opacity:.7`);
      ctx.L.front.appendChild(c);
      this.cross.push({ c, s: .35 + i * .12 });
    }
    // switching mono label
    const labels = (Array.isArray(P.labels) ? P.labels : P.label ? [P.label] : []).map((l, i) =>
      typeof l === 'string' ? { text: l, s: i ? null : 0 } : { text: l.text, s: this.tAt(ctx, l.at, null) });
    labels.forEach((l, i) => { if (l.s == null) l.s = ctx.d * i / labels.length; });
    this.labels = labels.sort((a, b) => a.s - b.s);
    this.tag = el('div', `position:absolute;left:${m + 18}px;top:${this.inset.t + 22}px;display:flex;align-items:center;gap:12px;
      padding:7px 14px 8px;background:rgba(0,0,0,.45);border-radius:6px;font:600 26px/1 "SF Mono","Menlo",monospace;letter-spacing:.14em;
      color:#fff;text-transform:uppercase;white-space:nowrap`);
    this.tag.appendChild(el('div', 'width:10px;height:10px;border-radius:50%;background:var(--accent)'));
    this.tagText = el('span', '');
    this.tag.appendChild(this.tagText);
    if (!labels.length) this.tag.style.display = 'none';
    ctx.L.front.appendChild(this.tag);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, H = this.H, k = ease.out(enter(t, 0, .35));
    ctx.base.style.transform = `translateY(${this.shift * k}px)`;
    this.box.style.transform = `translateY(${(k - 1) * H}px)`;
    setImg(this.img, mediaSrc(ctx.params.media, t));
    // brackets travel in from outside and lock (~0.3 s)
    const b = ease.out(enter(t, .15, .3)), o = (1 - b) * 70;
    for (const { c, cx, cy, arm } of this.corners) {
      c.style.left = (cx ? 1080 - this.inset.r - arm + o : this.inset.l - o) + 'px';
      c.style.top = (cy ? H - this.inset.b - arm + o : this.inset.t - o) + 'px';
      c.style.opacity = clamp(b * 3);
    }
    for (const x of this.cross) {
      const q = enter(t, x.s, .2);
      x.c.style.opacity = q * (.55 + .25 * Math.sin(t * 9 + x.s * 20));
      x.c.style.transform = `scale(${lerp(1.8, 1, ease.out(q))})`;
    }
    let cur = null;
    for (const l of this.labels) if (t >= l.s - .05) cur = l;
    this.tagText.textContent = cur ? cur.text : '';
    this.tag.style.opacity = cur ? clamp((t - .3) / .15) : 0;
  },
};
