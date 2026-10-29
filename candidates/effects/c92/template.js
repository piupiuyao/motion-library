// 电脑窗口弹窗 · 版式：macOS 风格窗口（浅灰标题栏 + 红黄绿圆点、圆角、阴影）从小放大弹出在画面上半部，可连续弹 2–3 个错位叠起，最后一起缩回
TEMPLATES.c92 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? null : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const wins = P.windows || [{ image: 'assets/docs/gmail.jpg', title: 'Mail' }, { image: 'assets/docs/chat.jpg', title: 'Messages' }, { image: 'assets/docs/notify.jpg', title: 'Notifications' }];
    const spots = P.spots || [[60, 110, 600, 430], [420, 210, 600, 430], [200, 330, 640, 450]];
    this.wins = wins.slice(0, 3).map((w, j) => {
      const [x, y, W, Hh] = spots[j];
      const win = el('div', `position:absolute;left:${x}px;top:${y}px;width:${W}px;height:${Hh}px;border-radius:18px;overflow:hidden;background:#fff;
        box-shadow:0 30px 70px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.12);transform-origin:50% 60%`);
      const bar = el('div', `position:absolute;left:0;right:0;top:0;height:50px;background:linear-gradient(#ececec,#dcdcdc);border-bottom:1px solid #c4c4c4;
        display:flex;align-items:center;padding-left:20px;gap:12px`);
      for (const c of ['#ff5f57', '#febc2e', '#28c840']) bar.appendChild(el('div', `width:18px;height:18px;border-radius:50%;background:${c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)`));
      if (w.title) bar.appendChild(el('div', `position:absolute;left:0;right:0;text-align:center;font:600 24px var(--font-body);color:#555`, w.title));
      const img = el('img', 'position:absolute;left:0;right:0;top:50px;bottom:0;width:100%;height:calc(100% - 50px);object-fit:cover;object-position:50% 0');
      win.append(img, bar);
      ctx.L.front.appendChild(win);
      img.src = url(w.image); pending.push(img.decode().catch(() => {}));
      const s = w.at != null ? at(w.at) : null;
      return { win, s: s != null ? s - .1 : .15 + j * (P.gap || .7) };
    });
  },
  frame(ctx) {
    const pout = ease.inOut(enter(ctx.t, ctx.d - .45, .35));
    for (const w of this.wins) {
      const q = enter(ctx.t, w.s, .45);
      const s = q <= 0 ? .001 : lerp(.2, 1, ease.back(q));
      w.win.style.opacity = Math.min(clamp(q * 5), 1 - pout);
      w.win.style.transform = `scale(${Math.max(.001, s * (1 - pout * .8))})`;
    }
  },
};
