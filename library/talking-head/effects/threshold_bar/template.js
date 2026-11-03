// 阈值进度条 · 版式：人下移到下半部，上方浅灰面板里一条横向进度条，灰色先长到门槛线（上方标数字），越线部分换强调色填满，门槛下落一个说明小标签
TEMPLATES.threshold_bar = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.mark) { this.off = true; return; }                 // 必填: no threshold label → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.ph = P.panel || 720; this.shift = P.shift != null ? P.shift : 320;
    ctx.L.bg.style.background = '#000';
    // light-grey explainer panel with a faint grid (neutral, the look of the style)
    this.panel = el('div', `position:absolute;left:0;top:0;width:1080px;height:${this.ph}px;background:
      repeating-linear-gradient(0deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px),
      repeating-linear-gradient(90deg, transparent 0 89px, rgba(0,0,0,.035) 89px 90px), #efefef`);
    ctx.L.front.appendChild(this.panel);
    const bx = 70, bw = 940, by = P.title ? 400 : 330, bh = 64;
    this.split = clamp(P.split != null ? P.split : .6, .1, .9);
    if (P.title) this.panel.appendChild(el('div', `position:absolute;left:60px;right:60px;top:200px;text-align:center;color:#111;
      font:800 72px/1.1 var(--font-body);letter-spacing:-.01em`, P.title));
    if (P.label) this.panel.appendChild(el('div', `position:absolute;left:${bx}px;top:${by - 46}px;font:600 30px var(--font-body);color:#555`, P.label + ' →'));
    this.track = el('div', `position:absolute;left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;border-radius:10px;background:#f7f7f7;
      border:3px solid #cfcfcf;box-sizing:border-box;overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.06)`);
    this.grey = el('div', 'position:absolute;left:0;top:0;bottom:0;width:0;background:#c4c4c4');
    this.hot = el('div', `position:absolute;top:0;bottom:0;left:${this.split * 100}%;width:0;background:var(--accent)`);
    this.track.append(this.grey, this.hot);
    this.panel.appendChild(this.track);
    const lx = bx + bw * this.split;
    this.line = el('div', `position:absolute;left:${lx - 2}px;top:${by - 18}px;width:4px;height:${bh + 36}px;background:#333;transform-origin:50% 0`);
    this.mark = el('div', `position:absolute;left:${lx - 200}px;width:400px;top:${by - 72}px;text-align:center;font:800 38px var(--font-body);color:#111`, P.mark);
    this.panel.append(this.line, this.mark);
    if (P.tag) {
      this.tag = el('div', `position:absolute;left:${lx}px;top:${by + bh + 34}px;transform:translateX(-50%);max-width:520px;width:max-content;
        padding:10px 22px;border-radius:10px;background:#dcdcdc;border:2px solid #c2c2c2;color:#222;font:700 32px/1.2 var(--font-body);text-align:center`, P.tag);
      this.panel.appendChild(this.tag);
    }
    // timing: grey grows to the line, colour fills from `at`, tag drops at `tagAt`
    this.tGrey = .35;
    this.tHot = at(P.at); if (this.tHot == null) this.tHot = Math.min(1.6, ctx.d * .4);
    this.tGreyEnd = Math.max(this.tGrey + .4, Math.min(this.tHot - .05, this.tGrey + 1));
    this.tTag = at(P.tagAt); if (this.tTag == null) this.tTag = this.tHot + .9;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    for (const n of [ctx.L.bg, ctx.L.bg.parentNode]) { n.style.setProperty('--panel-k', k); n.style.setProperty('--panel-h', this.ph); }  // panel in/out: a pack can move its caption with the seam
    const g = ease.inOut(enter(t, this.tGrey, this.tGreyEnd - this.tGrey));
    this.grey.style.width = g * this.split * 100 + '%';
    const lq = enter(t, this.tGrey + (this.tGreyEnd - this.tGrey) * .7, .3);
    this.line.style.transform = `scaleY(${ease.out(lq)})`;
    this.mark.style.opacity = lq;
    this.mark.style.transform = `translateY(${lerp(10, 0, ease.out(lq))}px)`;
    const h = ease.inOut(enter(t, this.tHot, .8));
    this.hot.style.width = h * (1 - this.split) * 100 + '%';
    if (this.tag) {
      const q = ease.out(enter(t, this.tTag, .35));
      this.tag.style.opacity = q;
      this.tag.style.transform = `translateX(-50%) translateY(${lerp(-24, 0, q)}px)`;
    }
  },
};
