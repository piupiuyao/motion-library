// 三联屏 · 版式：屏幕分成三格，每格是人的不同景别；正在说的那格亮，说完的那格定格变暗
TEMPLATES.c42 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.base.style.opacity = 0;
    ctx.L.bg.style.background = '#000';
    const ts = (P.at || []).map(at);
    this.times = [0, ts[0] != null ? ts[0] : ctx.d / 3, ts[1] != null ? ts[1] : ctx.d * 2 / 3, ctx.d];
    // fy = where the face lands inside the cell; the bottom cell keeps the face below the caption band
    const crops = [{ z: 1.0, x: 0, fy: 330 }, { z: 1.35, x: -40, fy: 330 }, { z: 1.12, x: 50, fy: 470 }];
    const labels = P.labels || [];
    this.cells = crops.map((c, j) => {
      const cell = el('div', `position:absolute;left:0;top:${j * 640}px;width:1080px;height:640px;overflow:hidden;background:#111`);
      const img = el('img', `position:absolute;width:${1080 * c.z}px;height:${1920 * c.z}px;left:${540 - 540 * c.z + c.x}px;top:${c.fy - 760 * c.z}px`);
      const dim = el('div', 'position:absolute;inset:0;background:#000');
      const num = el('div', 'position:absolute;right:40px;top:30px;font-size:120px;color:#fff;opacity:.9', String(j + 1));
      num.className = 'display';
      const border = el('div', 'position:absolute;inset:0;border:10px solid var(--accent);box-sizing:border-box');
      cell.append(img, dim, num, border);
      if (labels[j]) cell.appendChild(el('div', `position:absolute;left:36px;${j === 2 ? 'top:34px' : 'bottom:34px'};padding:8px 20px 12px;border-radius:14px;background:var(--accent);
        color:var(--ink);font:800 44px var(--font-body)`, labels[j]));
      ctx.L.front.appendChild(cell);
      return { cell, img, dim, border };
    });
    for (let j = 1; j < 3; j++) ctx.L.front.appendChild(el('div', `position:absolute;left:0;top:${j * 640 - 4}px;width:1080px;height:8px;background:#000`));
  },
  srcAt(ctx, T) {
    const g = ctx.shot.start + T, seg = segAt(g);
    return frameUrl(TL.frames, Math.max(1, Math.round((seg.src + (g - seg.out)) * TL.srcFps) + 1));
  },
  frame(ctx) {
    let k = 0;
    for (let j = 0; j < 3; j++) if (ctx.t >= this.times[j]) k = j;
    this.cells.forEach((c, j) => {
      const q = ease.out(enter(ctx.t, j * .12, .4));
      c.cell.style.transform = `translateX(${(j % 2 ? 1 : -1) * (1 - q) * 1080}px)`;
      if (j === k) setImg(c.img, ctx.baseImg.getAttribute('src'));
      else if (j < k) setImg(c.img, this.srcAt(ctx, this.times[j + 1] - .04));
      else setImg(c.img, this.srcAt(ctx, Math.max(0, this.times[j])));
      // active: bright; done: frozen + dimmed; not yet: dark
      const on = enter(ctx.t, this.times[j], .2);
      c.dim.style.opacity = j === k ? lerp(.8, 0, on) : j < k ? .58 : .8;
      c.border.style.opacity = j === k ? on : 0;
    });
  },
};
