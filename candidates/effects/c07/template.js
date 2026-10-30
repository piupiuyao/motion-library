// 镂空透视字 · 字体：满屏纯色上一个巨大的词，只有字的形状里透出视频，然后字迅速放大直到视频铺满全屏
TEMPLATES.c07 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.text) { this.off = true; return; }   // 必填: no word → render nothing
    const txt = P.text.toUpperCase();
    const font = `"Avenir Next Condensed", "Avenir Next", "PingFang SC", sans-serif`;
    // fit the word to ~980px wide using a scratch canvas, then find a point well inside a stroke to zoom into
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    let size = 600;
    c.font = `900 ${size}px ${font}`;
    size = Math.min(900, Math.floor(size * 880 / c.measureText(txt).width));
    c.font = `900 ${size}px ${font}`;
    const cy = P.y || 900;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000';
    // stretch the letters vertically so the word is tall like the poster-style reference
    const sy = P.stretch || 1.6;
    c.setTransform(1, 0, 0, sy, 0, cy * (1 - sy));
    c.fillText(txt, W / 2, cy);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const d = c.getImageData(0, 0, W, H).data;
    const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 200;
    let best = [W / 2, cy], bd = 1e9;
    const r = Math.max(8, size * .05);
    for (let y = cy - size * sy; y < cy + size * sy; y += 6) for (let x = 0; x < W; x += 6) {
      if (!on(x, y)) continue;
      let ok = true;
      for (let a = 0; a < 8 && ok; a++) ok = on(Math.round(x + Math.cos(a * .785) * r), Math.round(y + Math.sin(a * .785) * r));
      if (!ok) continue;
      const dist = (x - W / 2) ** 2 + (y - cy) ** 2;
      if (dist < bd) { bd = dist; best = [x, y]; }
    }
    this.pt = best;
    const fill = P.color || 'var(--bg-a)';
    this.svg = el('div', 'position:absolute;inset:0');
    this.svg.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0"><defs><mask id="c07m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/><g id="c07g"><text transform="matrix(1 0 0 ${sy} 0 ${cy * (1 - sy)})" x="${W / 2}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
      style="font:900 ${size}px ${font.replace(/"/g, "'")}" fill="#000">${txt}</text></g></mask></defs>
      <rect width="${W}" height="${H}" style="fill:${fill}" mask="url(#c07m)"/></svg>`;
    ctx.L.front.appendChild(this.svg);
    this.g = this.svg.querySelector('#c07g');
    this.zoomAt = P.zoom_at || 1.1;
  },
  frame(ctx) {
    if (this.off) return;
    const [px, py] = this.pt;
    const z = enter(ctx.t, this.zoomAt, .75);
    const hold = 1 + .14 * ease.inOut(clamp(ctx.t / this.zoomAt));
    const s = hold * Math.exp(Math.log(60) * z * z * z);
    this.g.setAttribute('transform', `translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`);
    this.svg.style.opacity = 1 - clamp((z - .8) / .2);
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * lerp(1.25, 1, ease.out(z))})`;
  },
};
