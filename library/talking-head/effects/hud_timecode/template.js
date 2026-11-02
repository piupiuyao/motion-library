// HUD顶栏时间码 · 版式：顶部一条很细的 HUD 栏：左边小圆点+等宽节目名，右边等宽时间码随播放实时跳动；顶部深色渐变压暗，不挡脸
TEMPLATES.hud_timecode = {
  setup(ctx) {
    const P = ctx.params;
    const y = P.y || 112, mono = '"SF Mono","Menlo","Monaco","Courier New",monospace';
    ctx.L.front.appendChild(el('div', 'position:absolute;left:0;right:0;top:0;height:330px;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,.28) 55%,transparent)'));
    this.bar = el('div', `position:absolute;left:56px;right:56px;top:${y}px;display:flex;align-items:center;justify-content:space-between;
      font:600 27px/1 ${mono};letter-spacing:.14em;color:rgba(255,255,255,.82);text-transform:uppercase;white-space:nowrap`);
    const left = el('div', 'display:flex;align-items:center;gap:16px');
    this.dot = el('div', 'width:13px;height:13px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px var(--accent)');
    left.appendChild(this.dot);
    if (P.title) {
      // a trailing number ("… 01") is tinted like the dot
      const m = String(P.title).match(/^(.*?)(\s+\d+)$/);
      left.appendChild(el('span', '', m ? `${m[1]}<span style="color:var(--accent)">${m[2]}</span>` : P.title));
    }
    this.time = el('div', 'font-variant-numeric:tabular-nums');
    this.bar.appendChild(left);
    this.bar.appendChild(this.time);
    ctx.L.front.appendChild(this.bar);
    this.prefix = P.prefix != null ? P.prefix : 'T+';
    this.offset = P.offset || 0;
    this.global = P.clock !== 'shot';
  },
  frame(ctx) {
    // time code = playback time of the whole video (or of this shot with clock:"shot")
    const T = Math.max(0, (this.global ? ctx.shot.start : 0) + ctx.t + this.offset);
    const mm = String(Math.floor(T / 60)).padStart(2, '0'), ss = (T % 60).toFixed(1).padStart(4, '0');
    this.time.textContent = `${this.prefix}${mm}:${ss}`;
    this.dot.style.opacity = Math.floor(ctx.t * 2) % 2 ? .45 : 1;   // slow blink
  },
};
