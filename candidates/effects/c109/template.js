// 梗图插入 · 素材：说到好笑/反差处，一个抠好背景的梗角色 + 梗字幕突然弹到人旁边，快速放大加抖动，1 秒左右直接消失
TEMPLATES.c109 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.top && !P.bottom) { this.off = true; return; } // required: a meme needs at least one caption
    const n = s => s.toLowerCase().replace(/[^\w]/g, '');
    const w = P.at && ctx.words.find(x => n(x.w) === n(P.at));
    this.t0 = w ? w.s - .05 : (P.start ?? ctx.d * .5);
    this.dur = P.dur || 1.3;
    const S = P.size || 450;
    this.box = el('div', `position:absolute;left:${P.x ?? 600}px;top:${P.y ?? 70}px;width:${S}px;transform-origin:50% 60%`);
    // a nervous sweating blob character, drawn here; white sticker edge = "keyed-out meme" look; phone:true adds a phone with a 99 badge in its hand
    this.box.innerHTML = `
      <div style="font:400 ${S * .13}px/1.02 Impact, 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;color:#fff;-webkit-text-stroke:${S * .016}px #000;paint-order:stroke fill;
        text-align:center;text-transform:uppercase;letter-spacing:.01em;margin-bottom:${S * .02}px">${P.top || ''}</div>
      <svg viewBox="0 0 200 200" width="${S}" height="${S * .92}" style="display:block;overflow:visible">
        <defs><radialGradient id="c109g" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f5b400"/></radialGradient></defs>
        <g stroke="#fff" stroke-width="14" stroke-linejoin="round" fill="#fff">
          <ellipse cx="100" cy="112" rx="78" ry="74"/><path d="M38 150 L20 196 L180 196 L162 150Z"/></g>
        <path d="M38 150 L22 194 L178 194 L162 150Z" fill="#3b6fd8" stroke="#1d2b55" stroke-width="4"/>
        <ellipse cx="100" cy="112" rx="78" ry="74" fill="url(#c109g)" stroke="#6b4a00" stroke-width="4"/>
        <ellipse cx="72" cy="98" rx="17" ry="21" fill="#fff" stroke="#222" stroke-width="3"/><ellipse cx="128" cy="98" rx="17" ry="21" fill="#fff" stroke="#222" stroke-width="3"/>
        <circle cx="76" cy="103" r="6" fill="#222"/><circle cx="124" cy="103" r="6" fill="#222"/>
        <path d="M52 70 Q70 62 86 72 M114 72 Q130 62 148 70" stroke="#5a3a00" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M66 148 Q76 136 86 148 Q96 160 106 148 Q116 136 126 148 Q132 154 136 148" stroke="#5a3a00" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M160 70 Q172 92 160 102 Q148 92 160 70Z" fill="#7fd3ff" stroke="#2a8acb" stroke-width="3"/>
        <path d="M44 60 Q52 76 44 84 Q36 76 44 60Z" fill="#7fd3ff" stroke="#2a8acb" stroke-width="3"/>
        <path d="M172 122 Q180 136 172 142 Q164 136 172 122Z" fill="#7fd3ff" stroke="#2a8acb" stroke-width="3"/>
        ${P.phone ? `        <g transform="rotate(-12 150 168)"><rect x="128" y="132" width="44" height="72" rx="8" fill="#222" stroke="#fff" stroke-width="5"/>
          <rect x="133" y="140" width="34" height="56" rx="4" fill="#9fd0ff"/>
          <circle cx="170" cy="134" r="13" fill="#ff2d3d" stroke="#fff" stroke-width="3"/><text x="170" y="139" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">99</text></g>
        <path d="M120 186 Q134 176 140 160" stroke="#f5b400" stroke-width="13" fill="none" stroke-linecap="round"/>` : ''}
      </svg>
      <div style="font:400 ${S * .1}px/1.02 Impact, 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;color:#fff;-webkit-text-stroke:${S * .014}px #000;paint-order:stroke fill;
        text-align:center;text-transform:uppercase;margin-top:${S * .01}px">${P.bottom || ''}</div>`;
    ctx.L.front.appendChild(this.box);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, q = t - this.t0;
    const on = q >= 0 && q < this.dur;
    this.box.style.display = on ? '' : 'none';
    if (!on) return;
    const fr = Math.round((ctx.shot.start + t) * 30);
    const sh = 1 - clamp(q / .5) * .6;
    const jx = Math.sin(fr * 12.9898) * 14 * sh, jy = Math.cos(fr * 78.233) * 10 * sh, jr = Math.sin(fr * 4.1) * 4 * sh;
    const sc = q < .12 ? lerp(.15, 1.15, q / .12) : lerp(1.15, 1, ease.out((q - .12) / .2));
    this.box.style.transform = `translate(${jx}px, ${jy}px) rotate(${jr}deg) scale(${sc})`;
  },
};
