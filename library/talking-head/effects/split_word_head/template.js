// 两字分立头侧 · 字体：一个两字/两词的关键词拆开，一半放在脸左边、一半放在脸右边（齐眼睛到下巴高度），金色衬线字同时淡入放大
TEMPLATES.split_word_head = {
  setup(ctx) {
    const P = ctx.params;
    let L = P.left, R = P.right;
    if ((L == null || R == null) && P.text) {
      const raw = String(P.text).trim();
      const parts = /\s/.test(raw) ? raw.split(/\s+/) : Array.from(raw);
      const h = Math.ceil(parts.length / 2), sep = /\s/.test(raw) ? ' ' : '';
      L = parts.slice(0, h).join(sep); R = parts.slice(h).join(sep);
    }
    this.off = !L || !R;                           // 必填: need both halves → otherwise render nothing
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    const t = P.at != null ? at(P.at) : null;
    this.t0 = t != null ? t - .1 : .15;
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const gap = P.gap || 200;                      // half-width kept clear for the face
    const y = P.y || fy + 150;
    const font = 'Georgia,"Times New Roman","Songti SC","STSong",serif';
    const upper = P.upper !== false;
    const cv = document.createElement('canvas').getContext('2d');
    const fit = (s, room) => {
      let size = P.size || 190;
      for (; size > 60; size -= 4) { cv.font = `400 ${size}px ${font}`; if (cv.measureText(upper ? s.toUpperCase() : s).width + size * .04 * s.length <= room) break; }
      return size;
    };
    const roomL = fx - gap - 22, roomR = 1080 - (fx + gap) - 22;
    const size = Math.min(fit(L, roomL), fit(R, roomR));
    const css = `position:absolute;top:${y}px;font:400 ${size}px/1 ${font};color:${P.color || 'var(--accent)'};white-space:nowrap;letter-spacing:.04em;
      ${upper ? 'text-transform:uppercase;' : ''}text-shadow:0 2px 3px rgba(0,0,0,.55),0 6px 22px rgba(0,0,0,.45)`;
    this.a = el('div', css + `;right:${1080 - (fx - gap)}px;transform-origin:100% 50%`, L);
    this.b = el('div', css + `;left:${fx + gap}px;transform-origin:0 50%`, R);
    ctx.L.front.append(this.a, this.b);
  },
  frame(ctx) {
    if (this.off) return;
    const q = enter(ctx.t, this.t0, .45), out = leave(ctx, .25);
    for (const e of [this.a, this.b]) {
      e.style.opacity = Math.min(ease.out(q), out);
      e.style.transform = `translateY(-50%) scale(${lerp(1.35, 1, ease.out(q))})`;
    }
  },
};
