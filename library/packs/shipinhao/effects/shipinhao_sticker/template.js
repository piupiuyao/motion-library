// 视频号贴纸人像 · 版式：人抠出来加一圈粗白边（或浅蓝 / 黄边），贴在一张很「跳」的背景上（彩色波点、黑白格子、皱纸、洋红），
// 头顶 / 身后砸几行花字；可选一排 app 图标按说到的名字弹出。
// shared line builder (same code in shipinhao_huazi): window.SHZ
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
  hideCaption(ctx) {  // removed automatically with the layer when the next shot starts
    ctx.L.front.appendChild(el('style', '', '#caption{opacity:0 !important}'));
  },
};

function shzPattern(name) {
  const dot = (c, x, y, s) => `radial-gradient(circle at ${x}px ${y}px, ${c} 19px, transparent 20.5px) 0 0/${s}px ${s}px`;
  const grunge = (base, seed) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.009 .012' numOctaves='4' seed='${seed}'/>`
      + `<feColorMatrix values='0 0 0 0 .22  0 0 0 0 0  0 0 0 0 .14  0 0 0 -1.7 1.15'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace('%23', '#'))}") center/cover, ${base}`;
  };
  return {
    // mint paper with candy-coloured polka dots (ref 95 · 错落/分层)
    dots: [dot('#f27ba8', 40, 40, 250), dot('#f5d90a', 170, 100, 250), dot('#4fc3c8', 100, 190, 250), dot('#f6a33a', 225, 225, 250),
           dot('#7aa7f2', 20, 150, 250), '#d6e4d8'].join(', '),
    // black / white gingham (ref 95 · 第二种)
    gingham: 'repeating-linear-gradient(0deg, rgba(20,20,20,.55) 0 64px, transparent 64px 128px), repeating-linear-gradient(90deg, rgba(20,20,20,.55) 0 64px, transparent 64px 128px), #f4f2ee',
    paper: (() => {  // crumpled kraft-white paper with strong creases (ref 95 · 插入背景纸)
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><filter id='f'><feTurbulence type='turbulence' baseFrequency='.0045' numOctaves='5' seed='11'/>`
        + `<feDiffuseLighting lighting-color='#efeadf' surfaceScale='4'><feDistantLight azimuth='40' elevation='52'/></feDiffuseLighting></filter>`
        + `<rect width='100%' height='100%' filter='url(%23f)'/></svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace('%23', '#'))}") center/cover, #e8e2d4`;
    })(),
    // hot magenta grunge (ref 95 · 打破画面)
    magenta: grunge('radial-gradient(ellipse at 30% 30%, #ff3fa4, #b0126c 60%, #5a0738)', 4),
    pink: 'radial-gradient(circle, rgba(255,255,255,.35) 9px, transparent 10px) 0 0/64px 64px, #f2a7c3',
    blur: null,
  }[name] ?? name;
}

TEMPLATES.shipinhao_sticker = {
  setup(ctx) {
    const P = ctx.params;
    const bg = shzPattern(P.background || 'dots');
    if (bg) { ctx.L.bg.style.background = bg; ctx.base.style.opacity = 0; }
    else {  // blur: the original frame, blurred and darkened, behind the sticker
      ctx.baseImg.style.filter = 'blur(26px) brightness(.6) saturate(1.15)';
      ctx.base.style.transform = 'scale(1.1)';
    }
    const ring = { white: '#ffffff', blue: '#a9cbef', yellow: '#f7e86a' }[P.outline || 'white'] || P.outline;
    ctx.personCv.style.filter = outline(P.width || 18, ring);
    this.scale = P.scale || .9;
    this.dy = P.dy ?? 60;   // push the person down so the title has room above the head
    this.items = SHZ.build(ctx, P.lines || [], ln => ln.behind ? ctx.L.back : ctx.L.front);
    // app icons that pop in when their name is said
    this.icons = (P.icons || []).map((q, k, all) => {
      const name = typeof q === 'string' ? q : q.q;
      const size = P.icon_size || 190, gap = 46, n = all.length;
      const tile = iconTile(name, size);  // full-colour official logo on a white tile
      if (!tile) return null;
      const x0 = 540 - (n * size + (n - 1) * gap) / 2;
      const box = el('div', `position:absolute;left:${x0 + k * (size + gap)}px;top:${P.icons_y || 1330}px;
        border-radius:${size * .23}px;box-shadow:10px 14px 0 #141414`);
      box.appendChild(tile);
      ctx.L.front.appendChild(box);
      return { e: box, s: SHZ.wordAt(ctx, typeof q === 'string' ? q : q.at, .3 + k * .3) - .05, rot: [-6, 4, -3, 5][k % 4] };
    }).filter(Boolean);
    if (P.caption !== true) SHZ.hideCaption(ctx);
  },
  frame(ctx) {
    const p = enter(ctx.t, 0, .38);
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `translateY(${this.dy}px) scale(${lerp(this.scale * 1.15, this.scale, ease.back(p))}) rotate(${lerp(-4, 0, ease.out(p))}deg)`;
    SHZ.animate(ctx, this.items);
    const end = leave(ctx, .2);
    for (const it of this.icons) {
      const q = enter(ctx.t, it.s, .3);
      it.e.style.opacity = Math.min(clamp(q * 5), end);
      it.e.style.transform = `scale(${lerp(.3, 1, ease.pop(q))}) rotate(${it.rot}deg)`;
    }
  },
};
