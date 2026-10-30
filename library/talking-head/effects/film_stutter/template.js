// 胶片卡顿颗粒 · 镜头特效：画面掉到很低的帧率（一卡一卡像定格），叠一层跳动的胶片颗粒、划痕和暖色调
TEMPLATES.film_stutter = {
  setup(ctx) {
    this.fps = ctx.params.fps || 7;
    ctx.baseImg.style.filter = 'sepia(.5) contrast(1.18) saturate(.8) brightness(.95)';
    this.grain = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:.4;mix-blend-mode:overlay');
    this.grain.width = 360; this.grain.height = 640;
    this.gg = this.grain.getContext('2d');
    this.img = this.gg.createImageData(360, 640);
    this.scratch = el('div', 'position:absolute;inset:0');
    this.flick = el('div', 'position:absolute;inset:0;background:#000');
    this.vig = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(30,16,0,.6) 100%)');
    ctx.L.front.append(this.grain, this.scratch, this.flick, this.vig);
  },
  frame(ctx) {
    // hold each picture for 1/fps s: swap the base frame for the one at the start of the hold
    const tq = Math.floor(ctx.t * this.fps) / this.fps, gt = ctx.shot.start + tq, sg = segAt(gt);
    const n = Math.max(1, Math.round((sg.src + (gt - sg.out)) * TL.srcFps) + 1);
    setImg(ctx.baseImg, frameUrl(TL.frames, n));
    const hold = Math.floor(ctx.t * this.fps), fr = Math.round((ctx.shot.start + ctx.t) * 30);
    let s = (fr * 2654435761 + 11) >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    let h = (hold * 40503 + 3) >>> 0;
    const hr = () => (h = (h * 1664525 + 1013904223) >>> 0) / 4294967296;
    ctx.base.style.transform = `translate(${(hr() - .5) * 8}px, ${(hr() - .5) * 10}px) scale(${(sg.zoom || 1) * 1.03})`;
    // grain: new noise every output frame
    const d = this.img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 70 + rnd() * 115; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    this.gg.putImageData(this.img, 0, 0);
    this.flick.style.opacity = (rnd() * .14).toFixed(3);
    let sc = '';
    const k = rnd() < .7 ? 1 + Math.floor(rnd() * 2) : 0;
    for (let i = 0; i < k; i++) sc += `<div style="position:absolute;left:${Math.floor(rnd() * 1080)}px;top:0;width:${1 + Math.floor(rnd() * 3)}px;height:1920px;background:rgba(255,248,230,${(.25 + rnd() * .35).toFixed(2)})"></div>`;
    if (rnd() < .4) sc += `<div style="position:absolute;left:${Math.floor(rnd() * 1000)}px;top:${Math.floor(rnd() * 1800)}px;width:${6 + Math.floor(rnd() * 10)}px;height:${6 + Math.floor(rnd() * 10)}px;border-radius:50%;background:rgba(20,10,0,.7)"></div>`;
    this.scratch.innerHTML = sc;
  },
};
