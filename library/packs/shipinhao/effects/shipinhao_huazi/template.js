// 视频号花字 · 字体：几行粗花字（白 / 黄 / 橙 / 蓝混排、大小不一、带一点倾斜），按说到的词一行一行「啪」地砸出来，
// 硬投影代替黑描边。可以绕着头摆（头顶一行 + 下巴下一行），也可以一个超大字顶出画面边。
// shared line builder (same code in shipinhao_sticker): window.SHZ
window.SHZ = window.SHZ || {
  COLORS: { white: '#ffffff', yellow: 'var(--accent)', orange: '#f39a0b', blue: 'var(--accent-2)', ink: 'var(--ink)', pink: '#ff6fa5' },
  FONTS: { display: 'var(--font-display)', poster: 'var(--font-poster)', hand: 'var(--font-hand)' },
  FACES: { display: '"PkDisplay"', poster: '"PkPoster"', hand: '"PkHand"' },
  norm: s => String(s).toLowerCase().replace(/[^\w']/g, ''),
  wordAt(ctx, a, dflt) {
    if (a == null) return dflt;
    if (typeof a === 'number' && a < 1000) { const w = ctx.words.find(w => w.i === a); return w ? w.s : dflt; }
    const n = window.SHZ.norm(a), w = ctx.words.find(w => window.SHZ.norm(w.w) === n);
    return w ? w.s : dflt;
  },
  // lines: [{text, color, size, x, y, rot, font, align, at, out, behind, bg}]
  build(ctx, lines, layerFor) {
    const cv = document.createElement('canvas').getContext('2d');
    const out = [];
    lines.forEach((ln, k) => {
      if (!ln || !ln.text) return;
      const font = ln.font || 'display';
      const txt = ln.upper === false ? String(ln.text) : String(ln.text).toUpperCase();
      const maxW = ln.w || 960;
      let size = ln.size;
      if (!size) {  // fit to the width box, capped so short words don't become absurd
        size = font === 'poster' ? 420 : 210;
        for (; size > 50; size -= 4) {
          cv.font = `400 ${size}px ${window.SHZ.FACES[font]}`;
          if (cv.measureText(txt).width <= maxW) break;
        }
      }
      const align = ln.align || 'center';
      const x = ln.x != null ? ln.x : 540, y = ln.y != null ? ln.y : 260 + k * size * 1.05;
      const pos = align === 'left' ? `left:${x}px;` : align === 'right' ? `right:${1080 - x}px;` : `left:${x}px;`;
      const color = window.SHZ.COLORS[ln.color] || ln.color || '#fff';
      const dark = color === 'var(--ink)' || /^#(0|1|2|3)/.test(color);
      // hard offset shadow (the 视频号 look) + a soft one for bright footage; dark text gets a light hard shadow
      const sh = ln.shadow === false ? 'none' : dark
        ? '.035em .045em 0 rgba(255,255,255,.95)'
        : '.035em .05em 0 #141414, .02em .03em .18em rgba(0,0,0,.45)';
      const e = el('div', `position:absolute;${pos}top:${y}px;font-family:${window.SHZ.FONTS[font]};font-weight:400;font-size:${size}px;
        line-height:1;color:${color};white-space:nowrap;letter-spacing:${font === 'poster' ? '-.01em' : '.01em'};text-shadow:${sh};
        ${ln.bg ? `background:${ln.bg};padding:.12em .3em .14em;border-radius:.14em;box-shadow:0 .06em .2em rgba(0,0,0,.3);` : ''}
        transform-origin:${align === 'left' ? '0%' : align === 'right' ? '100%' : '50%'} 60%`, txt);
      e.className = font === 'hand' ? 'pk-hand' : 'pk-display';
      (layerFor ? layerFor(ln) : ctx.L.front).appendChild(e);
      out.push({ e, s: window.SHZ.wordAt(ctx, ln.at, .05 + k * .12) - .06, o: ln.out != null ? window.SHZ.wordAt(ctx, ln.out, null) : null,
                 rot: ln.rot != null ? ln.rot : 0, cx: align === 'center' ? '-50%' : '0', from: ln.from || 'stamp' });
    });
    return out;
  },
  animate(ctx, items) {
    const end = leave(ctx, .2);
    for (const it of items) {
      const p = enter(ctx.t, it.s, .32);
      const gone = it.o != null ? 1 - enter(ctx.t, it.o - .05, .15) : 1;
      let tr;
      if (it.from === 'slide') tr = `translateX(${lerp(-160, 0, ease.out(p))}px)`;
      else tr = `scale(${lerp(1.7, 1, ease.pop(p))})`;  // stamp: lands big and settles with a small bounce
      it.e.style.opacity = Math.min(clamp(p * 5), end, gone);
      it.e.style.transform = `translateX(${it.cx}) ${tr} rotate(${it.rot}deg)`;
    }
  },
};

TEMPLATES.shipinhao_huazi = {
  setup(ctx) {
    const P = ctx.params;
    const lines = P.lines || (P.text ? [{ text: P.text, y: P.y || 250, color: P.color || 'yellow', rot: P.rot ?? -3 }] : []);
    this.items = SHZ.build(ctx, lines);
    this.mono = !!P.mono;
    this.dim = P.dim || 0;
  },
  frame(ctx) {
    if (this.mono || this.dim) {
      const q = ease.out(enter(ctx.t, 0, .2));
      ctx.baseImg.style.filter = `${this.mono ? `grayscale(${q}) contrast(${1 + .15 * q})` : ''} brightness(${1 - this.dim * q})`;
    }
    SHZ.animate(ctx, this.items);
  },
};
