// RGB 色散抖动 · 镜头特效：画面拆成红绿蓝三层横向错开，重音时错位突然拉大并乱抖 0.3 秒再收回，边缘彩色重影
TEMPLATES.c99 = {
  setup(ctx) {
    const P = ctx.params;
    this.base = P.base ?? 4; this.amp = P.amp ?? 28; this.hold = P.hold ?? .4;
    this.out = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px');
    this.out.width = W; this.out.height = H;
    this.o = this.out.getContext('2d');
    this.tmp = document.createElement('canvas'); this.tmp.width = W; this.tmp.height = H;
    this.tg = this.tmp.getContext('2d');
    ctx.L.back.appendChild(this.out);
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    const at = [].concat(P.at || []);
    this.hits = at.length ? at.map(a => (ctx.words.find(w => n(w.w) === n(a)) || {}).s).filter(x => x != null)
      : ctx.groups.map(g => g.s);
    if (!this.hits.length) this.hits = [ctx.d * .3, ctx.d * .7];
  },
  draw(ctx) {
    const t = ctx.t, z = ctx.seg.zoom || 1;
    let env = 0;
    for (const h of this.hits) {
      const q = (t - h + .03) / this.hold;
      if (q >= 0 && q < 1) env = Math.max(env, q < .15 ? q / .15 : 1 - ease.inOut((q - .15) / .85));
    }
    const fr = Math.round((ctx.shot.start + t) * 30);
    let s = (fr * 2654435761 + 7) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296 - .5;
    const a = this.base + this.amp * env;
    const chans = [['#ff0000', -a * (1 + rnd() * .8), rnd() * env * 10, 1 + env * .025],
                   ['#00ff00', rnd() * env * 8, rnd() * env * 6, 1],
                   ['#0000ff', a * (1 + rnd() * .8), rnd() * env * 10, 1 + env * .045]];
    const o = this.o, g = this.tg, img = ctx.baseImg;
    o.globalCompositeOperation = 'source-over'; o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    for (const [col, dx, dy, sc] of chans) {
      const k = z * sc, sw = W / k, sh = H / k;
      g.globalCompositeOperation = 'copy';
      g.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh, 0, 0, W, H);
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = col; g.fillRect(0, 0, W, H);
      o.globalCompositeOperation = 'lighter';
      o.drawImage(this.tmp, dx, dy);
    }
    // whole frame jolts a little at the hit
    this.out.style.transform = `translate(${rnd() * env * 16}px, ${rnd() * env * 10}px) scale(${1 + env * .02})`;
  },
  frame(ctx) {
    // the base frame may still be decoding when frame() runs (stills jump around): draw once it is ready
    const img = ctx.baseImg, go = () => this.draw(ctx);
    if (img.complete && img.naturalWidth) go(); else pending.push(img.decode().then(go, go));
  },
};
