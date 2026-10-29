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
    this.box.appendChild(el('div', `position:absolute;left:${m + 50}px;bottom:${m + 50}px;font-size:38px`, P.info || '4K · 30FPS'));
    this.box.appendChild(el('div', `position:absolute;right:${m + 50}px;bottom:${m + 50}px;display:flex;align-items:center;gap:4px`,
      `<span style="display:inline-flex;gap:5px;padding:5px;border:4px solid #fff;border-radius:8px;width:92px;height:34px;box-sizing:content-box">
        <i style="flex:1;background:#fff"></i><i style="flex:1;background:#fff"></i><i style="flex:1;background:#fff"></i><i style="flex:1;background:rgba(255,255,255,.25)"></i></span>
        <span style="width:8px;height:18px;background:#fff;border-radius:0 3px 3px 0"></span>`));
    // centre cross
    this.box.appendChild(el('div', 'position:absolute;left:510px;top:930px;width:60px;height:60px;opacity:.7;background:linear-gradient(#fff,#fff) 50% 50%/4px 60px no-repeat, linear-gradient(#fff,#fff) 50% 50%/60px 4px no-repeat'));
    ctx.L.front.appendChild(this.box);
    this.start = P.start || 0;
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .25);
    this.box.style.opacity = Math.min(p, leave(ctx, .2));
    this.box.style.transform = `scale(${lerp(1.06, 1, ease.out(p))})`;
    this.dot.style.opacity = Math.floor(ctx.t * 2) % 2 ? .15 : 1;
    const T = this.start + ctx.t, f = Math.floor((T % 1) * 30);
    const s = Math.floor(T), pad = n => String(n).padStart(2, '0');
    this.tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
  },
};
