// 快闪连拍 · 素材：同一个构图的四个不同画面（同一个人、不同场景/调色），每个只停几帧，在标题后面的圆角框里快速循环闪
TEMPLATES.c30 = {
  setup(ctx) {
    const P = ctx.params;
    this.bgc = el('div', `position:absolute;inset:0;background:${pattern('dots')}`);
    ctx.L.back.appendChild(this.bgc);
    this.box = el('div', 'position:absolute;left:110px;top:280px;width:860px;height:1080px;border-radius:56px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);border:8px solid var(--paper);background:#000');
    ctx.L.back.appendChild(this.box);
    this.ims = [];
    if (P.images) {
      for (const src of P.images) {
        const im = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%');
        im.src = url(src); pending.push(im.decode().catch(() => {}));
        this.box.appendChild(im); this.ims.push(im);
      }
    } else {
      // default: four moments of the talking-head clip; three get the person cut out (matte) and dropped into a new scene
      const frames = P.frames || [31, 279, 744, 1099];
      const scenes = [null,
        ctx2 => { const g = ctx2.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#ffd9e6'); g.addColorStop(1, '#ff8fb8'); return g; },
        ctx2 => { const g = ctx2.createRadialGradient(540, 700, 50, 540, 700, 1300); g.addColorStop(0, '#3b6cff'); g.addColorStop(.5, '#1a1f5c'); g.addColorStop(1, '#06061a'); return g; },
        ctx2 => { const g = ctx2.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#ffb347'); g.addColorStop(.55, '#ff6a3d'); g.addColorStop(1, '#6b1f4a'); return g; }];
      const grades = ['none', 'saturate(1.1)', 'contrast(1.1) saturate(1.2)', 'sepia(.25) saturate(1.3)'];
      frames.forEach((n, k) => {
        const cv = el('canvas', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:${grades[k % 4]}`);
        cv.width = 540; cv.height = 960;
        this.box.appendChild(cv); this.ims.push(cv);
        const src = new Image(), mask = new Image(), id = String(n).padStart(6, '0');
        src.src = url(`work/frames_src/${id}.jpg`); mask.src = url(`work/matte_src/${id}.png`);
        pending.push(Promise.all([src.decode(), mask.decode()]).then(() => {
          const c = cv.getContext('2d');
          const sc = scenes[k % 4];
          if (!sc) { c.drawImage(src, 0, 0, 540, 960); return; }
          // person layer: matte luminance -> alpha
          const pc = document.createElement('canvas'); pc.width = 540; pc.height = 960;
          const p = pc.getContext('2d');
          p.drawImage(mask, 0, 0, 540, 960);
          const md = p.getImageData(0, 0, 540, 960), d = md.data;
          for (let i = 0; i < d.length; i += 4) d[i + 3] = d[i];
          p.putImageData(md, 0, 0);
          p.globalCompositeOperation = 'source-in'; p.drawImage(src, 0, 0, 540, 960);
          c.save(); c.scale(.5, .5); c.fillStyle = sc(c); c.fillRect(0, 0, 1080, 1920); c.restore();
          // a few scene details so each backdrop reads as a different place
          c.globalAlpha = .35; c.fillStyle = '#fff';
          for (let i = 0; i < 7; i++) c.fillRect(((i * 97 + k * 41) % 540), 40 + ((i * 53 + k * 29) % 300), 24 + (i % 3) * 30, 180 + (i % 2) * 120);
          c.globalAlpha = 1;
          c.drawImage(pc, 0, 0);
        }).catch(() => {}));
      });
    }
    this.title = el('div', `position:absolute;left:30px;right:30px;top:1120px;text-align:center;font-size:${P.size || 150}px;color:var(--accent);
      -webkit-text-stroke:8px var(--ink);paint-order:stroke fill;line-height:.9`, P.text || 'HEY GUYS!');
    this.title.className = 'display';
    ctx.L.front.appendChild(this.title);
    this.fpi = P.framesEach || 3;
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.bgc.style.opacity = Math.min(pin, out);
    this.box.style.opacity = Math.min(pin, out);
    this.box.style.transform = `scale(${lerp(.85, 1, ease.back(pin)) * lerp(1, 1.04, t / ctx.d)})`;
    const f = Math.floor(t * 30 / this.fpi);
    this.ims.forEach((im, k) => { im.style.opacity = f % this.ims.length === k ? 1 : 0; });
    const q = enter(t, .2, .3);
    this.title.style.opacity = Math.min(q, out);
    this.title.style.transform = `scale(${ease.pop(q)}) rotate(-3deg)`;
  },
};
