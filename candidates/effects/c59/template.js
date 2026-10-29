// 人物分身 · 镜头特效：抠出来的自己从身后滑出两个分身（一左一右、一个镜像、动作稍微慢半拍），站在同一个房间里，可配气泡做「我 vs 我」
TEMPLATES.c59 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const labels = P.labels || [];
    const at = (P.at || []).map(a => (ctx.words.find(w => n(w.w) === n(a)) || {}).s);
    const dx = P.offset || 390;
    // fade: [from, to] height fractions where the clones fade out (old footage had a laptop hole); false = full body
    const fade = P.fade === false ? null : (P.fade || [.62, .74]);
    const mask = fade ? `-webkit-mask-image:linear-gradient(180deg,#000 ${fade[0] * 100}%,transparent ${fade[1] * 100}%)` : '';
    // each clone is the person from a slightly earlier frame (delay, seconds), so it moves half a beat behind
    this.clones = [
      { x: -dx, mirror: true, s0: .15, delay: .35 }, { x: dx, mirror: false, s0: .3, delay: .7 },
    ].map((c, k) => {
      const cv = el('canvas', `position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 100%;${mask}`);
      cv.width = 540; cv.height = 960;
      ctx.L.back.appendChild(cv);
      let bub = null;
      if (labels[k]) {
        bub = el('div', `position:absolute;top:300px;left:${clamp(540 + c.x * 1.05 - 170, 30, 710)}px;width:340px;text-align:center;padding:18px 0 22px;background:var(--paper);color:var(--ink);
          border-radius:40px;font-size:62px;box-shadow:0 14px 30px rgba(0,0,0,.3);transform-origin:50% 100%`, labels[k]);
        bub.className = 'display';
        ctx.L.front.appendChild(bub);
      }
      return { ...c, cv, g: cv.getContext('2d'), bub, bt: at[k] != null ? at[k] : c.s0 + .6, src: new Image(), mat: new Image() };
    });
    this.tmp = document.createElement('canvas'); this.tmp.width = 540; this.tmp.height = 960;
    this.tg = this.tmp.getContext("2d", { willReadFrequently: true });
    // a soft shadow strip so the clones sit "behind" her, and the room gets slightly darker
    this.shade = el('div', 'position:absolute;inset:0;background:rgba(0,0,0,.18);opacity:0');
    ctx.L.back.prepend(this.shade);
  },
  // source frame number at a (possibly earlier) shot-local time
  srcFrame(ctx, lt) {
    const gt = Math.max(0, ctx.shot.start + lt), sg = segAt(gt);
    return Math.max(1, Math.round((sg.src + (gt - sg.out)) * TL.srcFps) + 1);
  },
  drawClone(c) {
    const g = this.tg;
    g.globalCompositeOperation = 'copy';
    g.drawImage(c.mat, 0, 0, 540, 960);
    // matte is white-on-black: turn luminance into alpha
    const id = g.getImageData(0, 0, 540, 960), d = id.data;
    for (let i = 0; i < d.length; i += 4) d[i + 3] = d[i];
    g.putImageData(id, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.drawImage(c.src, 0, 0, 540, 960);
    g.globalCompositeOperation = 'source-over';
    c.g.clearRect(0, 0, 540, 960);
    c.g.drawImage(this.tmp, 0, 0);
  },
  frame(ctx) {
    this.shade.style.opacity = ease.out(enter(ctx.t, .1, .4));
    for (const c of this.clones) {
      const q = enter(ctx.t, c.s0, .55), e = ease.back(q), s = lerp(.74, .8, e);
      // slide out from behind her to the side
      c.cv.style.opacity = clamp(q * 4);
      c.cv.style.transform = `translateX(${c.x * e}px) scale(${c.mirror ? -s : s}, ${s})`;
      c.cv.style.filter = 'brightness(.88)';
      const f = this.srcFrame(ctx, ctx.t - c.delay);
      setImg(c.src, frameUrl(TL.frames, f));
      setImg(c.mat, frameUrl(TL.matte, f, 'png'));
      pending.push(Promise.all([c.src.decode(), c.mat.decode()]).catch(() => {}).then(() => this.drawClone(c)));
      if (c.bub) {
        const b = enter(ctx.t, c.bt - .05, .3);
        c.bub.style.opacity = Math.min(clamp(b * 3), leave(ctx));
        c.bub.style.transform = `scale(${ease.pop(b)})`;
      }
    }
  },
};
