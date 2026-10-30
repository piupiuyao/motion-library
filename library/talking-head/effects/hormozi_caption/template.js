// 当前词变色大字幕 · 字体：Hormozi 式，每次 2–4 个全大写超粗词，白字黑粗描边；正在说的词变亮黄/绿并瞬间放大再回落；整组硬切
TEMPLATES.hormozi_caption = {
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
    const P = ctx.params, per = P.per || 3;
    const ws = ctx.words.filter(w => w.w.trim());
    this.groups = [];
    let cur = [];
    ws.forEach((w, j) => {
      cur.push(w);
      if (cur.length >= per || /[.!?,]$/.test(w.w) || j === ws.length - 1) { this.groups.push(cur); cur = []; }
    });
    const size = P.size || 104;
    // default: theme accent, alternating with accent-2 unless accent-2 is (near) white like the normal words
    const css = getComputedStyle(document.getElementById('stage')), a2 = css.getPropertyValue('--accent-2').trim().toLowerCase();
    const whiteish = /^#(f{3}|f{6}|fff{5}f?)$/.test(a2) || /^(white|rgb\(255, 255, 255\))$/.test(a2) || /^#f[0-9a-f]f[0-9a-f]f[0-9a-f]$/.test(a2);
    this.hot = P.colors || (whiteish ? ['var(--accent)'] : ['var(--accent)', 'var(--accent-2)']);
    this.box = el('div', `position:absolute;left:40px;right:40px;top:${P.y || 1080}px;height:300px`);
    ctx.L.front.appendChild(this.box);
    this.groups = this.groups.map((g, k) => {
      const row = el('div', `position:absolute;left:0;right:0;top:0;display:flex;flex-wrap:wrap;justify-content:center;gap:0 ${Math.round(size * .22)}px;
        font:900 ${size}px/1.02 "Arial Black","Avenir Next",sans-serif;text-transform:uppercase;letter-spacing:-.01em;text-align:center`);
      const items = g.map(w => {
        const e = el('span', `display:inline-block;color:#fff;-webkit-text-stroke:${Math.round(size * .16)}px #000;paint-order:stroke fill;
          text-shadow:0 ${Math.round(size * .08)}px 0 #000, 0 10px 24px rgba(0,0,0,.45);transform-origin:50% 55%`, w.w.replace(/[,.!?]$/, ''));
        row.appendChild(e);
        return { e, s: w.s, e2: w.e };
      });
      this.box.appendChild(row);
      return { row, items, s: g[0].s - .03, color: this.hot[k % this.hot.length] };
    });
  },
  frame(ctx) {
    this.oldBarFrame(ctx);
    this.groups.forEach((g, k) => {
      const next = this.groups[k + 1];
      const on = ctx.t >= g.s && (!next || ctx.t < next.s) && ctx.t < ctx.d - .05;
      g.row.style.display = on ? 'flex' : 'none';
      if (!on) return;
      g.items.forEach((it, j) => {
        const nx = g.items[j + 1];
        const active = ctx.t >= it.s - .03 && (nx ? ctx.t < nx.s - .03 : true);
        it.e.style.color = active ? g.color : '#fff';
        // the moment a word becomes active it jumps to ~118% and settles back to ~106%
        const p = enter(ctx.t, it.s - .03, .25);
        it.e.style.transform = `scale(${active ? lerp(1.18, 1.06, ease.out(p)) : 1})`;
      });
    });
  },
};
