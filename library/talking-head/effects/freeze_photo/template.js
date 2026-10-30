// 定格快门 · 片头片尾：节拍点上画面白闪定格，像一张照片停一秒（带一行字），然后继续播放
TEMPLATES.freeze_photo = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const hit = P.at && ctx.words.find(w => norm(w.w) === norm(P.at));
    this.tf = hit ? hit.s : (P.freeze || .6);
    this.hold = P.hold || 1.1;
    const gt = ctx.shot.start + this.tf;
    let sg = TL.segments[0];
    for (const g of TL.segments) if (gt >= g.out) sg = g;
    const n = Math.max(1, Math.round((sg.src + (gt - sg.out)) * TL.srcFps) + 1);
    this.stage = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, #2a2a30, #0d0d10);opacity:0');
    this.photo = el('div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:#fff;box-sizing:border-box;padding:30px 30px 230px;
      box-shadow:0 40px 80px rgba(0,0,0,.6);transform-origin:50% 45%`);
    const inner = el('div', 'width:100%;height:100%;overflow:hidden;position:relative');
    const img = el('img', `position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;transform:scale(${sg.zoom || 1})`);
    img.src = frameUrl(TL.frames, n);
    pending.push(img.decode().catch(() => {}));
    inner.appendChild(img);
    this.photo.appendChild(inner);
    this.stage.appendChild(this.photo);
    ctx.L.back.appendChild(this.stage);
    // handwritten line on the white strip at the bottom of the photo
    this.label = el('div', `position:absolute;left:0;right:0;bottom:50px;text-align:center;font:700 ${P.size || 110}px "Marker Felt","Noteworthy",cursive;
      color:#1a1a1a;opacity:0;white-space:nowrap`, P.text || '');
    this.photo.appendChild(this.label);
    this.flash = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
    this.cap = el('style');
    ctx.L.front.append(this.flash, this.cap);
  },
  frame(ctx) {
    const dt = ctx.t - this.tf, end = this.hold;
    const on = dt >= 0 && dt < end;
    this.stage.style.opacity = on ? 1 : 0;
    const q = ease.out(clamp((dt - .06) / .3));
    this.photo.style.transform = `scale(${lerp(1, .78, q)}) rotate(${lerp(0, -4, q)}deg)`;
    const lq = ease.back(clamp((dt - .3) / .3));
    this.label.style.opacity = on ? clamp(lq * 3) : 0;
    this.label.style.transform = `scale(${lerp(.6, 1, lq)}) rotate(-2deg)`;
    this.cap.textContent = on ? '#caption{visibility:hidden}' : '';
    let f = 0;
    if (dt >= 0 && dt < .25) f = 1 - dt / .25;
    if (dt >= end && dt < end + .18) f = .6 * (1 - (dt - end) / .18);
    this.flash.style.opacity = f;
  },
};
