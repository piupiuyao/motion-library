// 漫画对白气泡 · 素材：漫画样式的对话框 / 思考泡 / 爆炸字（WHAT?!）带网点，从人头旁边弹出
TEMPLATES.c25 = {
  at(ctx, a, def) {
    if (a == null) return def;
    const w = ctx.words.find(w => w.w.toLowerCase().replace(/[^\w']/g, '').startsWith(String(a).toLowerCase()));
    return w ? w.s : def;
  },
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920;
    const items = (P.items || []).filter(it => it && it.text);
    if (!items.length) { this.off = true; return; }   // 必填: no bubbles → render nothing
    const cssv = n => getComputedStyle(document.getElementById('stage')).getPropertyValue(n).trim();
    const acc = P.color || '#ffe14d', acc2 = P.color2 || '#e8261c';  // classic comic yellow/red; kept fixed on purpose
    const font = "'Bangers','Impact','Arial Black',sans-serif";
    const dots = (id, c) => `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="11" cy="11" r="5" style="fill:${c}"/></pattern>`;
    this.items = items.map((it, k) => {
      const kind = it.kind || 'speech';
      const box = el('div', 'position:absolute;left:0;top:0');
      let svg, w, h, x, y, origin;
      if (kind === 'burst') {
        w = 620; h = 500; x = fx - 560; y = fy - 470; origin = '70% 80%';
        let d = '';
        for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = i % 2 ? 150 : 250 + Math.sin(i * 7.1) * 40; d += (i ? 'L' : 'M') + (310 + Math.cos(a) * r * 1.15).toFixed(0) + ' ' + (250 + Math.sin(a) * r * .9).toFixed(0); }
        svg = `<svg width="${w}" height="${h}"><defs>${dots('bd' + k, `color-mix(in srgb, ${acc} 70%, #000)`)}</defs><path d="${d}Z" style="fill:${acc}" stroke="#111" stroke-width="10" stroke-linejoin="round"/>
          <path d="${d}Z" fill="url(#bd${k})" opacity=".55" transform="translate(310 250) scale(.8) translate(-310 -250)"/></svg>`;
        box.innerHTML = svg + `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:400 150px/1 ${font};color:${acc2};
          -webkit-text-stroke:7px #111;paint-order:stroke fill;transform:rotate(-8deg);letter-spacing:.02em">${it.text}</div>`;
      } else {
        w = 640; h = 420; x = Math.min(1080 - w - 20, fx + 70); y = fy - 640; origin = '20% 100%';
        const body = kind === 'thought'
          ? `<path d="M120 300 C40 300 30 200 100 180 C70 100 170 50 230 90 C260 30 380 30 410 90 C470 50 590 90 560 170 C630 200 610 300 530 300 C520 350 430 360 400 320 C350 370 250 360 230 320 C190 350 130 340 120 300Z" fill="#fff" stroke="#111" stroke-width="9"/>
             <circle cx="140" cy="355" r="24" fill="#fff" stroke="#111" stroke-width="8"/><circle cx="95" cy="400" r="14" fill="#fff" stroke="#111" stroke-width="7"/>`
          : `<path d="M60 40 H580 Q610 40 610 70 V280 Q610 310 580 310 H200 L90 410 L130 310 H60 Q30 310 30 280 V70 Q30 40 60 40Z" fill="#fff" stroke="#111" stroke-width="10" stroke-linejoin="round"/>`;
        svg = `<svg width="${w}" height="${h}"><defs>${dots('sd' + k, '#cfe8ff')}</defs>${body}
          <rect x="40" y="50" width="560" height="250" fill="url(#sd${k})" opacity=".0"/></svg>`;
        box.innerHTML = svg + `<div style="position:absolute;left:60px;right:60px;top:${kind === 'thought' ? 110 : 60}px;height:${kind === 'thought' ? 180 : 240}px;display:flex;align-items:center;justify-content:center;text-align:center;
          font:400 ${it.text.length > 14 ? 72 : 92}px/1 ${font};color:#111;letter-spacing:.02em">${it.text}</div>`;
      }
      box.style.cssText += `;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:${origin}`;
      ctx.L.front.appendChild(box);
      return { box, t0: this.at(ctx, it.at, .2 + k * .9), kind, rot: kind === 'burst' ? -6 : 3 };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const out = leave(ctx, .25);
    this.items.forEach((it, k) => {
      const q = enter(ctx.t, it.t0, .35);
      const next = this.items[k + 1];
      const gone = next && it.kind !== 'burst' && next.kind !== 'burst' ? 1 - enter(ctx.t, next.t0, .2) : 1;
      it.box.style.opacity = Math.min(q > 0 ? 1 : 0, out, gone);
      const shake = it.kind === 'burst' ? Math.sin(ctx.t * 40) * 4 * clamp(1 - (ctx.t - it.t0) / .5) : 0;
      it.box.style.transform = `scale(${ease.pop(q)}) rotate(${it.rot + shake + Math.sin(ctx.t * 2 + k) * 1.2}deg)`;
    });
  },
};
