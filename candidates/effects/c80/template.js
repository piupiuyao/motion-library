// 逐词上滑字幕 · 字体：下巴下方一行 3–4 个词，每个词从下方 40px 滑上来并由透明变实，几乎连着出；整行出完停住，下一句整行换掉
TEMPLATES.c80 = {
  // The demo footage has an old blank caption pill burned in (y≈1445–1577). With the pill caption switched
  // off it would show, so with hideOld:true (old Monica footage only) we paint over it with the rows above/below.
  oldBarSetup(ctx) {
    this.patch = null;
    if (ctx.params.hideOld !== true || typeof TL === 'undefined' || TL.captions !== false) return;
    this.patch = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 50%');
    this.patch.width = 1080; this.patch.height = 1920;
    ctx.L.back.appendChild(this.patch);
  },
  oldBarFrame(ctx) {
    if (!this.patch) return;
    const cv = this.patch, c = cv.getContext('2d'), img = ctx.baseImg, x0 = 150, x1 = 930, y0 = 1432, y1 = 1592;
    cv.style.transform = `scale(${ctx.seg.zoom || 1})`;
    pending.push(img.decode().catch(() => {}).then(() => {
      const sx = img.naturalWidth / 1080, sy = img.naturalHeight / 1920;
      c.clearRect(0, 0, 1080, 1920);
      // top half: row above stretched down; bottom half: row below stretched up; overlap blended by a gradient
      c.drawImage(img, x0 * sx, (y0 - 4) * sy, (x1 - x0) * sx, 3 * sy, x0, y0, x1 - x0, y1 - y0);
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      if (!this.tmp) { this.tmp = document.createElement('canvas'); this.tmp.width = x1 - x0; this.tmp.height = y1 - y0; }
      const t = this.tmp.getContext('2d');
      t.globalCompositeOperation = 'copy';
      t.drawImage(img, x0 * sx, (y1 + 1) * sy, (x1 - x0) * sx, 3 * sy, 0, 0, x1 - x0, y1 - y0);
      t.globalCompositeOperation = 'destination-in';
      const g2 = t.createLinearGradient(0, 0, 0, y1 - y0);
      g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
      t.fillStyle = g2; t.fillRect(0, 0, x1 - x0, y1 - y0);
      c.drawImage(this.tmp, x0, y0);
      // soften the left/right ends so the patch has no hard edge
      c.globalCompositeOperation = 'destination-in';
      const h = c.createLinearGradient(x0, 0, x1, 0);
      h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.06, 'rgba(0,0,0,1)'); h.addColorStop(.94, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = h; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.globalCompositeOperation = 'source-over';
    }));
  },
  setup(ctx) {
    this.oldBarSetup(ctx);
    const P = ctx.params, per = P.per || 4;
    const ws = ctx.words.filter(w => w.w.trim());
    // lines of up to `per` words, broken after punctuation
    // lines of up to `per` words that also fit the frame width at full size, broken after punctuation
    const size = P.size || 84;
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = `800 ${size}px "Avenir Next", sans-serif`;
    const wid = w => mc.measureText(w.w).width + size * .26;
    this.lines = [];
    let cur = [], cw = 0;
    ws.forEach((w, j) => {
      if (cur.length && cw + wid(w) > 990) { this.lines.push(cur); cur = []; cw = 0; }
      cur.push(w); cw += wid(w);
      if (cur.length >= per || /[.,!?;:]$/.test(w.w) || j === ws.length - 1) { this.lines.push(cur); cur = []; cw = 0; }
    });
    this.box = el('div', `position:absolute;left:40px;right:40px;top:${P.y || 1075}px;height:200px`);
    ctx.L.front.appendChild(this.box);
    this.lines = this.lines.map((ln, k) => {
      const row = el('div', `position:absolute;left:0;right:0;top:0;display:flex;justify-content:center;flex-wrap:nowrap;gap:0 ${Math.round(size * .26)}px;
        font:800 ${size}px/1.1 var(--font-body);color:#fff;letter-spacing:-.01em;text-shadow:0 3px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.5);white-space:nowrap`);
      const t0 = ln[0].s;
      const items = ln.map((w, j) => {
        const e = el('span', 'display:inline-block;will-change:transform,opacity', w.w.replace(/[,.]$/, ''));
        row.appendChild(e);
        // each word starts on its own beat, but never later than a short stagger after the line start
        return { e, s: Math.min(w.s, t0 + j * .14) - .05 };
      });
      this.box.appendChild(row);
      // shrink long lines so they never run off the frame
      row.style.justifyContent = 'flex-start';
      const wid = row.scrollWidth;
      row.style.justifyContent = 'center';
      if (wid > 980) row.style.fontSize = Math.floor(size * 980 / wid) + 'px';
      return { row, items, s: t0 - .05 };
    });
  },
  frame(ctx) {
    this.oldBarFrame(ctx);
    const out = leave(ctx, .2);
    this.lines.forEach((ln, k) => {
      const next = this.lines[k + 1];
      const on = ctx.t >= ln.s && (!next || ctx.t < next.s);
      ln.row.style.display = on ? 'flex' : 'none';
      if (!on) return;
      for (const it of ln.items) {
        const p = enter(ctx.t, it.s, .6);
        it.e.style.opacity = Math.min(ease.out(clamp(p * 1.6)), out);
        it.e.style.transform = `translateY(${lerp(40, 0, ease.out(p))}px)`;
      }
    });
  },
};
