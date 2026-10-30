// 字体快速轮换 · 字体：关键词停在原位，字体每 2–3 帧换一次（衬线→手写→等宽→粗黑…）约 0.8 秒，最后落回原字体停住
TEMPLATES.font_shuffle = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.text) { this.off = true; return; } // required keyword: not shown without it
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const w = P.at != null ? ctx.words.find(w => norm(w.w) === norm(P.at)) : null;
    this.t0 = w ? w.s - .05 : (P.t0 != null ? P.t0 : .1);
    this.dur = P.dur || .8;
    this.fonts = P.fonts || [
      '400 1em "Didot",serif', 'italic 400 1em "Snell Roundhand",cursive', '700 1em "Courier New",monospace', '400 1em "Impact",sans-serif',
      '400 1em "Marker Felt",fantasy', '700 1em "American Typewriter",serif', '400 1em "Chalkduster",fantasy', '700 1em "Copperplate",serif',
      '400 1em "Bradley Hand",cursive', '900 1em "Futura",sans-serif', '400 1em "Papyrus",fantasy', '700 1em "Rockwell","Georgia",serif',
      'italic 700 1em "Baskerville",serif', '400 1em "Trattatello","Luminari",fantasy'];
    this.word = el('div', `position:absolute;left:0;right:0;top:${P.y || 210}px;text-align:center;font-size:${P.size || 190}px;line-height:1.1;
      color:#fff;white-space:nowrap;text-shadow:0 6px 24px rgba(0,0,0,.45)`, P.text);
    ctx.L.front.appendChild(this.word);
    this.final = P.final || `var(--display-weight) 1em var(--font-display)`;
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t - this.t0;
    const vis = t >= 0;
    this.word.style.opacity = vis ? leave(ctx, .25) : 0;
    if (!vis) return;
    if (t < this.dur) {
      // a new face every ~2.5 frames, picked by frame number so stills are deterministic
      const k = Math.floor(t * 30 / 2.5);
      const j = Math.floor(Math.abs(Math.sin(k * 78.233 + 1.3) * 43758.5453) % this.fonts.length);
      this.word.style.font = this.fonts[(j + k) % this.fonts.length];
      this.word.style.fontSize = (ctx.params.size || 190) + 'px';
      this.word.style.letterSpacing = '0';
    } else {
      this.word.style.font = this.final;
      this.word.style.fontSize = (ctx.params.size || 190) + 'px';
      this.word.style.letterSpacing = '-.01em';
      const q = enter(t, this.dur, .25);
      this.word.style.transform = `scale(${1 + .06 * Math.sin(Math.PI * q)})`;
    }
  },
};
