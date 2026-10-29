// 表情包弹出 · 素材：大号表情在说到对应的词时弹到脸旁，另有一串表情像直播点赞一样往上飘
TEMPLATES.c26 = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const items = P.items || [{ emoji: '😱', at: null }, { emoji: '🔥', at: null }];
    const spots = [[fx - 310, fy + 150, -14], [fx + 300, fy - 40, 12], [fx - 300, fy + 420, 10], [fx + 300, fy + 330, -10]];
    this.pops = items.map((it, k) => {
      const [x, y, r] = spots[k % 4];
      const e = el('div', `position:absolute;left:${x - 140}px;top:${y - 140}px;width:280px;height:280px;font-size:230px;line-height:280px;text-align:center`, it.emoji);
      ctx.L.front.appendChild(e);
      return { e, r, t0: this.at(ctx, it.at, .2 + k * ctx.d / (items.length + 1)) };
    });
    this.floats = [];
    const fl = P.float === false ? [] : (P.float || ['😂', '❤️', '🔥', '😱', '😂', '👏', '❤️', '😂', '🔥', '😱', '❤️', '😂']);
    fl.forEach((em, k) => {
      const e = el('div', `position:absolute;left:0;top:0;font-size:${90 + (k * 37) % 50}px;line-height:1`, em);
      ctx.L.front.appendChild(e);
      this.floats.push({ e, k, t0: .3 + k * (ctx.d - 1.2) / fl.length, x: 880 + Math.sin(k * 12.7) * 90, sway: 30 + (k * 13) % 30 });
    });
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3);
    for (const p of this.pops) {
      const q = enter(t, p.t0, .4);
      p.e.style.opacity = Math.min(q > 0 ? 1 : 0, out);
      p.e.style.transform = `scale(${ease.pop(q)}) rotate(${p.r + Math.sin(t * 6 + p.r) * 5 * clamp(1 - (t - p.t0))}deg) translateY(${Math.sin(t * 2.5 + p.r) * 8}px)`;
    }
    for (const f of this.floats) {
      const age = t - f.t0, life = 1.8;
      const u = age / life;
      f.e.style.display = u > 0 && u < 1 ? 'block' : 'none';
      if (u > 0 && u < 1) {
        f.e.style.transform = `translate(${f.x + Math.sin(age * 4 + f.k) * f.sway}px,${1380 - u * 900}px) scale(${lerp(.4, 1, ease.out(u * 4))})`;
        f.e.style.opacity = Math.min(clamp((1 - u) * 3), out);
      }
    }
  },
};
