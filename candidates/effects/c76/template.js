// 定格人物介绍 · 片头片尾：画面定格，背景虚化压暗，抠出的人加描边放大挪到一边，笔刷贴纸滑进来写上名字/身份
TEMPLATES.c76 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.name) { this.off = true; return; } // name is required: without it the effect is not shown
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const hit = P.at && ctx.words.find(w => norm(w.w) === norm(P.at));
    this.tf = hit ? hit.s : (P.freeze || .6);
    // which source frame is on screen at the freeze moment
    const gt = ctx.shot.start + this.tf;
    let sg = TL.segments[0];
    for (const g of TL.segments) if (gt >= g.out) sg = g;
    const n = Math.max(1, Math.round((sg.src + (gt - sg.out)) * TL.srcFps) + 1);
    this.zoom = sg.zoom || 1;
    this.side = P.side === 'right' ? 1 : -1;
    // frozen layers live in #back (above the live video): sharp still, blurred+dark still, cut-out person
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0'; return c; };
    this.sharp = mk(); this.blur = mk(); this.cut = mk();
    this.cut.style.transformOrigin = '50% 100%';
    this.cut.style.webkitMaskImage = 'linear-gradient(180deg, #000 62%, transparent 74%)';  // drop matte bits at the bottom (desk, laptop)
    ctx.L.back.append(this.sharp, this.blur, this.cut);
    this.flash = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
    const src = new Image(), mask = new Image();
    src.src = frameUrl(TL.frames, n); mask.src = frameUrl(TL.matte, n, 'png');
    const zoom = this.zoom, sharp = this.sharp, blur = this.blur, cut = this.cut;
    pending.push(Promise.all([src.decode(), mask.decode()]).then(() => {
      const draw = (c, img, f) => {
        const g = c.getContext('2d'); g.filter = f || 'none';
        const w = W * zoom, h = H * zoom; g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      };
      draw(sharp, src); draw(blur, src, 'blur(20px) brightness(.45) saturate(.25)');
      // person cut-out with a white sticker outline
      const m = document.createElement('canvas'); m.width = W; m.height = H;
      const mg = m.getContext('2d', { willReadFrequently: true });
      mg.drawImage(mask, 0, 0, W, H);
      const id = mg.getImageData(0, 0, W, H), d = id.data;
      for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; }
      mg.putImageData(id, 0, 0);
      const g = cut.getContext('2d');
      for (const r of [10, 7, 3.5]) for (let a = 0; a < 16; a++) g.drawImage(m, Math.cos(a * Math.PI / 8) * r, Math.sin(a * Math.PI / 8) * r);
      const p = document.createElement('canvas'); p.width = W; p.height = H;
      const pg = p.getContext('2d');
      pg.drawImage(m, 0, 0); pg.globalCompositeOperation = 'source-in'; pg.drawImage(src, 0, 0, W, H);
      g.drawImage(p, 0, 0);
      // apply the jump-cut zoom
      if (zoom !== 1) {
        const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
        tmp.getContext('2d').drawImage(cut, 0, 0);
        g.clearRect(0, 0, W, H); g.drawImage(tmp, (W - W * zoom) / 2, (H - H * zoom) / 2, W * zoom, H * zoom);
      }
    }).catch(() => {}));
    // brush-stroke name sticker
    const brush = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><path d='M18,40 C120,14 300,22 590,10 L578,64 L596,92 L572,128 L588,176 C420,190 210,184 30,196 L44,150 L6,118 L34,86 Z' fill='black'/></svg>`;
    const bm = `url("data:image/svg+xml;utf8,${brush.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/'/g, '%27')}")`;
    this.tag = el('div', `position:absolute;${this.side < 0 ? 'right:30px' : 'left:30px'};top:${P.y || 760}px;width:520px;padding:40px 40px 46px 56px;
      background:var(--accent);-webkit-mask-image:${bm};-webkit-mask-size:100% 100%;color:var(--ink)`);
    const name = el('div', `font-size:${P.size || 120}px;text-transform:uppercase;line-height:.95`, P.name);
    name.className = 'display';
    this.tag.appendChild(name);
    if (P.title) this.tag.appendChild(el('div', 'margin-top:10px;font:800 40px var(--font-body);letter-spacing:.05em', P.title));
    this.tagWrap = el('div', 'position:absolute;inset:0');
    this.tagWrap.appendChild(this.tag);
    ctx.L.front.append(this.tagWrap, this.flash);
  },
  frame(ctx) {
    if (this.off) return;
    const dt = ctx.t - this.tf;
    ctx.person.style.opacity = 0;  // the live cut-out is not used; we show our own frozen one
    const frozen = dt >= 0;
    this.sharp.style.opacity = frozen ? 1 : 0;
    const b = ease.out(clamp(dt / .35));
    this.blur.style.opacity = frozen ? b : 0;
    const m = ease.back(clamp((dt - .05) / .5));
    this.cut.style.opacity = frozen ? 1 : 0;
    this.cut.style.transform = `translateX(${this.side * 250 * m}px) scale(${lerp(1, 1.1, m)}) rotate(${this.side * -2 * m}deg)`;
    this.flash.style.opacity = frozen ? Math.max(0, 1 - dt / .2) * .9 : 0;
    const q = ease.out(clamp((dt - .35) / .45));
    this.tag.style.opacity = frozen ? clamp(q * 3) : 0;
    this.tag.style.transform = `translateX(${-this.side * lerp(700, 0, q)}px) rotate(${this.side * 4}deg)`;
  },
};
