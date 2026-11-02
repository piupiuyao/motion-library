// 胸前羽化图条 · 素材：画面压暗，字幕正下方一条无边框的横向图片，底边羽化融进暗部，随句子硬切换图
TEMPLATES.feather_strip = {
  tAt(ctx, a, def) {
    if (a == null || a === '') return def;
    if (typeof a === 'number') return a;
    const n = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const k = n(a), w = k && (ctx.words.find(w => n(w.w) === k) || ctx.words.find(w => n(w.w).startsWith(k)));
    return w ? Math.max(0, w.s) : def;
  },
  setup(ctx) {
    const P = ctx.params;
    const list = (Array.isArray(P.images) ? P.images : P.images ? [P.images] : []).filter(Boolean);
    this.off = !list.length;           // needs_assets 照片: nothing uploaded → render nothing
    if (this.off) return;
    const n = list.length, t0 = .15;
    this.items = list.map((it, i) => {
      const src = typeof it === 'string' ? it : it.src || it.media;
      const at = typeof it === 'string' ? null : it.at;
      return { src, s: this.tAt(ctx, at, t0 + (ctx.d - t0) * i / n) };
    }).filter(x => x.src).sort((a, b) => a.s - b.s);
    this.items[0].s = Math.min(this.items[0].s, t0);
    const w = P.width || 700, h = P.height || 345;
    this.strip = el('div', `position:absolute;left:${(1080 - w) / 2}px;top:${P.y || 1572}px;width:${w}px;height:${h}px;overflow:hidden;
      -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 52%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 52%,transparent 100%)`);
    for (const it of this.items) {
      it.img = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none');
      this.strip.appendChild(it.img);
      it.media = it.src;
    }
    ctx.L.front.appendChild(this.strip);
    this.dark = P.dark !== false;
    if (this.dark) ctx.L.back.appendChild(el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%, rgba(0,0,0,.12) 30%, rgba(0,0,0,.62) 100%)'));
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    if (this.dark) ctx.base.style.filter = 'brightness(.66) contrast(1.08) saturate(.8)';
    let cur = null;
    for (const it of this.items) if (t >= it.s) cur = it;
    for (const it of this.items) it.img.style.display = it === cur ? '' : 'none';
    if (cur) setImg(cur.img, mediaSrc(cur.media, t - cur.s));
    this.strip.style.opacity = Math.min(clamp((t - this.items[0].s) / .15), leave(ctx, .2));
  },
};
