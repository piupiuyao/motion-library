// 文字跟着脸走 · 镜头特效：一块文字贴纸钉在头旁边，人怎么晃它就怎么跟（只跟位置，不缩放不旋转）
TEMPLATES.c95 = {
  // head position for the CURRENT frame, read from the person matte (maskCv, filled by cutout() before frame()).
  // Coarse 54x96 grid -> cheap; pure function of the frame. Returns screen px (base zoom applied).
  head(ctx) {
    const gw = 54, gh = 96, c = this.hc;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, gw, gh);
    let top = -1, sx = 0, n = 0;
    try {
      g.drawImage(maskCv, 0, 0, gw, gh);
      const d = g.getImageData(0, 0, gw, gh).data;
      for (let y = 0; y < gh && top < 0; y++) {
        let k = 0;
        for (let x = 0; x < gw; x++) if (d[(y * gw + x) * 4 + 3] > 110) k++;
        if (k >= 3) top = y;
      }
      if (top >= 0) for (let y = top; y < Math.min(gh, top + 9); y++)
        for (let x = 0; x < gw; x++) if (d[(y * gw + x) * 4 + 3] > 110) { sx += x; n++; }
    } catch (e) { top = -1; }
    let hx, ht;
    if (top < 0 || !n) { hx = ctx.focus[0] * W; ht = ctx.focus[1] * H - 300; }
    else { hx = (sx / n + .5) * (W / gw); ht = top * (H / gh); }
    const z = ctx.seg.zoom || 1;
    return { x: 540 + (hx - 540) * z, top: 960 + (ht - 960) * z, z };
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.text) { this.off = true; return; } // required: not shown without text
    this.hc = document.createElement('canvas'); this.hc.width = 54; this.hc.height = 96;
    this.dx = P.dx ?? 200; this.dy = P.dy ?? 30;      // sticker offset from the top of the head
    this.wrap = el('div', 'position:absolute;left:0;top:0;width:0;height:0');
    this.tag = el('div', `position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;display:flex;align-items:center;gap:16px;
      padding:18px 34px 22px;background:var(--paper);color:var(--ink);border-radius:999px;font:800 62px var(--font-body);
      box-shadow:0 14px 34px rgba(0,0,0,.3);border:5px solid var(--ink)`,
      `${P.emoji ? `<span>${P.emoji}</span>` : ''}<span>${P.text}</span>`);
    // little pointer from the sticker down toward the head
    this.tip = el('div', `position:absolute;left:-22px;top:-8px;width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;
      border-top:30px solid var(--ink)`);
    this.wrap.append(this.tag, this.tip);
    ctx.L.front.appendChild(this.wrap);
  },
  frame(ctx) {
    if (this.off) return;
    const h = this.head(ctx);
    const x = clamp(h.x + this.dx, 230, 850), y = clamp(h.top + this.dy, 200, 1300);
    const p = enter(ctx.t, .1, .45), out = leave(ctx);
    this.wrap.style.transform = `translate(${x}px, ${y}px)`;
    this.tag.style.transform = `translate(-50%,-100%) translateY(-26px) scale(${lerp(.3, 1, ease.pop(p))})`;
    this.tag.style.transformOrigin = '50% 100%';
    this.tag.style.opacity = this.tip.style.opacity = Math.min(clamp(p * 4), out);
  },
};
