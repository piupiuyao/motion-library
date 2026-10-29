// 逐词弹跳字幕 · 字体：一个词一个词「弹」出来（从 0 放大到略大再回落），出现前完全不可见；同屏累积 3–4 个词后整句清掉
TEMPLATES.c81 = {
  // The demo footage has an old blank caption pill burned in (y≈1445–1577). With the pill caption switched
  // off it would show, so when captions are off we paint over it with the rows just above/below it.
  oldBarSetup(ctx) {
    this.patch = null;
    if (ctx.params.hideOld === false || typeof TL === 'undefined' || TL.captions !== false) return;
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
    this.lines = [];
    let cur = [];
    ws.forEach((w, j) => {
      cur.push(w);
      if (cur.length >= per || /[.!?]$/.test(w.w) || j === ws.length - 1) { this.lines.push(cur); cur = []; }
    });
    this.box = el('div', `position:absolute;left:30px;right:30px;top:${P.y || 1070}px;height:220px`);
    ctx.L.front.appendChild(this.box);
    const size = P.size || 92;
    this.lines = this.lines.map(ln => {
      const row = el('div', `position:absolute;left:0;right:0;top:0;display:flex;justify-content:center;align-items:center;gap:0 ${Math.round(size * .24)}px;
        font:900 ${size}px/1.1 var(--font-body);color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.35), 0 6px 18px rgba(0,0,0,.45);white-space:nowrap`);
      const items = ln.map(w => {
        const e = el('span', 'display:inline-block;transform-origin:50% 60%', w.w.replace(/[,.]$/, ''));
        row.appendChild(e);
        return { e, s: w.s - .04 };
      });
      this.box.appendChild(row);
      // shrink long lines so they never run off the frame
      row.style.justifyContent = 'flex-start';
      const wid = row.scrollWidth;
      row.style.justifyContent = 'center';
      if (wid > 980) row.style.fontSize = Math.floor(size * 980 / wid) + 'px';
      return { row, items, s: ln[0].s - .04 };
    });
  },
  frame(ctx) {
    this.oldBarFrame(ctx);
    const out = leave(ctx, .15);
    this.lines.forEach((ln, k) => {
      const next = this.lines[k + 1];
      const on = ctx.t >= ln.s && (!next || ctx.t < next.s);
      ln.row.style.display = on ? 'flex' : 'none';
      if (!on) return;
      for (const it of ln.items) {
        const p = enter(ctx.t, it.s, .5);
        // hard cut-in: invisible until its frame, then a springy pop 0 -> ~1.2 -> 1
        it.e.style.opacity = ctx.t < it.s ? 0 : out;
        const s = p <= 0 ? 0 : 1 - Math.exp(-6 * p) * Math.cos(9 * p) + .0;
        it.e.style.transform = `scale(${Math.max(0, s)})`;
      }
    });
  },
};
