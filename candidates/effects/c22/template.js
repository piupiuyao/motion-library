// 背后冒出物 · 素材：一张图或图标从人肩膀后面升起来（被人挡住一部分），旁边弹出发光标签
TEMPLATES.c22 = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    const P = ctx.params;
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const side = P.side === 'left' ? -1 : 1;
    this.x = fx + side * (P.dx || 300); this.y = fy + (P.dy || 140);
    const size = P.size || 440;
    this.obj = el('div', `position:absolute;left:${this.x - size / 2}px;top:${this.y - size / 2}px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center`);
    if (P.image) {
      const img = el('img', 'max-width:100%;max-height:100%;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,.35)');
      img.src = url(P.image); pending.push(img.decode().catch(() => {}));
      this.obj.appendChild(img);
    } else {
      this.obj.innerHTML = `<div style="position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent), transparent 70%)"></div>
        <div style="position:relative;font-size:${size * .72}px;line-height:1">${P.emoji || '⏰'}</div>`;
    }
    ctx.L.back.appendChild(this.obj);
    this.label = el('div', `position:absolute;top:${this.y - size / 2 - 140}px;${side > 0 ? 'right:50px' : 'left:50px'};color:#ffe23d;font:900 92px/1 var(--font-body);
      white-space:nowrap;letter-spacing:.01em;text-transform:uppercase;
      text-shadow:0 0 6px #fff3a0, 0 0 22px #ffcc00, 0 0 48px rgba(255,190,0,.85), 0 6px 0 rgba(60,40,0,.35)`, P.label || 'Hours a day');
    ctx.L.front.appendChild(this.label);
    this.t0 = this.at(ctx, P.at, .2);
    this.size = size;
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3);
    const q = enter(t, this.t0, .6);
    // rise from below the shoulder line (hidden by the body) up into view
    const rise = lerp(this.size * 1.1, 0, ease.back(q));
    this.obj.style.transform = `translateY(${rise + Math.sin(t * 2.2) * 8}px) rotate(${lerp(-14, 6, ease.out(q)) + Math.sin(t * 1.7) * 2}deg)`;
    this.obj.style.opacity = Math.min(clamp(q * 4), out);
    const l = enter(t, this.t0 + .45, .35);
    this.label.style.opacity = Math.min(l, out);
    this.label.style.transform = `scale(${lerp(.4, 1, ease.pop(l))})`;
  },
};
