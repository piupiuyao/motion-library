// 录像取景框 · 版式：画面叠一层摄像机取景框：四角括号、闪烁的红色 REC、走动的时间码、电量
TEMPLATES.c47 = {
  setup(ctx) {
    const P = ctx.params;
    this.box = el('div', 'position:absolute;inset:0;color:#fff;font:700 46px Menlo,"SF Mono",monospace;text-shadow:0 2px 6px rgba(0,0,0,.6)');
    const m = 60, L = 130, w = 8;
    const corner = (css, bt, bl) => el('div', `position:absolute;${css};width:${L}px;height:${L}px;border:0 solid #fff;${bt}:${w}px solid #fff;${bl}:${w}px solid #fff;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))`);
    this.box.append(
      corner(`left:${m}px;top:${m}px`, 'border-top', 'border-left'),
      corner(`right:${m}px;top:${m}px`, 'border-top', 'border-right'),
      corner(`left:${m}px;bottom:${m}px`, 'border-bottom', 'border-left'),
      corner(`right:${m}px;bottom:${m}px`, 'border-bottom', 'border-right'));
    this.rec = el('div', `position:absolute;left:${m + 50}px;top:${m + 46}px;display:flex;align-items:center;gap:18px`,
      '<span style="width:42px;height:42px;border-radius:50%;background:#ff2d2d;box-shadow:0 0 16px #ff2d2d"></span><span>REC</span>');
    this.dot = this.rec.firstChild;
    this.tc = el('div', `position:absolute;right:${m + 50}px;top:${m + 46}px`, '00:00:00:00');
    this.box.append(this.rec, this.tc);
    this.box.appendChild(el('div', `position:absolute;left:${m + 50}px;bottom:${m + 50}px;font-size:34px;letter-spacing:.02em`, P.info || '4K&nbsp;&nbsp;30FPS&nbsp;&nbsp;1/60&nbsp;&nbsp;F2.8&nbsp;&nbsp;ISO400'));
    this.box.appendChild(el('div', `position:absolute;right:${m + 50}px;bottom:${m + 50}px;display:flex;align-items:center;gap:4px`,
      `<span style="display:inline-flex;gap:5px;padding:5px;border:4px solid #fff;border-radius:8px;width:92px;height:34px;box-sizing:content-box">
        <i style="flex:1;background:#fff"></i><i style="flex:1;background:#fff"></i><i style="flex:1;background:#fff"></i><i style="flex:1;background:rgba(255,255,255,.25)"></i></span>
        <span style="width:8px;height:18px;background:#fff;border-radius:0 3px 3px 0"></span>`));
    // audio level meters (L / R) above the battery, like a camera screen
    this.meters = [0, 1].map(j => {
      const m2 = el('div', `position:absolute;right:${m + 50 + j * 34}px;bottom:${m + 120}px;width:22px;height:150px;border:3px solid rgba(255,255,255,.8);box-sizing:border-box;display:flex;align-items:flex-end`);
      const f = el('div', 'width:100%;background:linear-gradient(to top,#3ddc5a 0 60%,#ffd23d 60% 85%,#ff3b30 85%)');
      m2.appendChild(f); this.box.appendChild(m2);
      this.box.appendChild(el('div', `position:absolute;right:${m + 50 + j * 34}px;bottom:${m + 278}px;width:22px;text-align:center;font-size:24px`, j ? 'L' : 'R'));
      return f;
    });
    this.box.appendChild(el('div', `position:absolute;right:${m + 190}px;bottom:${m + 50}px;font-size:34px`, '60%'));
    this.box.appendChild(el('div', `position:absolute;left:${m + 50}px;top:${m + 120}px;font-size:30px;opacity:.85`, 'SD 1  ·  30 MIN'));
    // centre cross
    this.box.appendChild(el('div', 'position:absolute;left:510px;top:930px;width:60px;height:60px;opacity:.7;background:linear-gradient(#fff,#fff) 50% 50%/4px 60px no-repeat, linear-gradient(#fff,#fff) 50% 50%/60px 4px no-repeat'));
    ctx.L.front.appendChild(this.box);
    this.start = P.start || 0;
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .25);
    this.box.style.opacity = Math.min(p, leave(ctx, .2));
    this.box.style.transform = `scale(${lerp(1.06, 1, ease.out(p))})`;
    this.dot.style.opacity = (ctx.t % 1) < .6 ? 1 : .12;
    const fr = Math.floor(ctx.t * 15);
    this.meters.forEach((f, j) => { const v = .35 + .45 * Math.abs(Math.sin(fr * 1.7 + j * 2.1)) + .15 * Math.sin(fr * .53 + j); f.style.height = clamp(v) * 100 + '%'; });
    const T = this.start + ctx.t, f = Math.floor((T % 1) * 30);
    const s = Math.floor(T), pad = n => String(n).padStart(2, '0');
    this.tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
  },
};
