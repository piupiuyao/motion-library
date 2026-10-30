// 加载条百分比 · 字体：白色圆角长条里主题色条从左往右填充，百分比数字同步从 0% 跳到目标值，填满时轻弹一下
TEMPLATES.progress_percent = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const w = P.at != null ? ctx.words.find(w => norm(w.w) === norm(P.at)) : null;
    this.t0 = w ? w.s - .1 : (P.t0 != null ? P.t0 : .35);
    if (P.value == null) { this.off = true; return; } // required: without a value the bar is not shown
    this.target = P.value;
    this.dur = P.dur || 1.6;
    const W = P.width || 720;
    this.box = el('div', `position:absolute;left:${(1080 - W) / 2}px;top:${P.y || 1130}px;width:${W}px;transform-origin:50% 50%`);
    const head = el('div', 'display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px');
    head.appendChild(el('div', `font:800 44px var(--font-body);color:#fff;letter-spacing:.04em;white-space:nowrap;text-shadow:0 3px 12px rgba(0,0,0,.55)`, P.label || ''));
    this.pct = el('div', `font:800 92px/1 var(--font-body);color:#fff;text-shadow:0 4px 16px rgba(0,0,0,.55);font-variant-numeric:tabular-nums`, '0%');
    head.appendChild(this.pct);
    this.track = el('div', `position:relative;height:50px;border-radius:25px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.35);overflow:hidden`);
    this.fill = el('div', `position:absolute;left:7px;top:7px;bottom:7px;width:0;border-radius:18px;
      background:linear-gradient(180deg,color-mix(in srgb, var(--accent) 70%, #fff),var(--accent));box-shadow:inset 0 2px 0 rgba(255,255,255,.45)`);
    this.track.appendChild(this.fill);
    this.box.append(head, this.track);
    ctx.L.front.appendChild(this.box);
    this.W = W;
  },
  frame(ctx) {
    if (this.off) return;
    const pin = enter(ctx.t, this.t0 - .35, .3), out = ease.inOut(enter(ctx.t, ctx.d - .3, .28));
    const p = ease.inOut(enter(ctx.t, this.t0, this.dur));
    const v = this.target * p;
    this.fill.style.width = `${(this.W - 14) * v / 100}px`;
    this.pct.textContent = Math.round(v) + '%';
    // little bounce when it lands on the target
    const b = enter(ctx.t, this.t0 + this.dur, .35);
    const bump = b > 0 && b < 1 ? Math.sin(b * Math.PI) * .06 : 0;
    this.box.style.opacity = Math.min(clamp(pin * 2), 1 - out);
    this.box.style.transform = `translateY(${lerp(40, 0, ease.out(pin))}px) scale(${1 + bump})`;
    this.pct.style.color = b > 0 ? 'var(--accent)' : '#fff';
  },
};
