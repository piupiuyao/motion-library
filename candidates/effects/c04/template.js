// 文字快闪 · 字体：口播画面突然切成一串纯色卡，每张砸一两个超大字，踩着节拍快速闪（每张卡内再反色闪一拍），再切回人
TEMPLATES.c04 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => s.toLowerCase().replace(/[^\w]/g, '');
    const wordAt = a => a && ctx.words.find(w => norm(w.w) === norm(a));
    const raw = P.cards || ctx.groups.map(g => g.text);
    const step = P.step || .3;
    const hit = wordAt(P.start);
    const t0 = hit ? hit.s - .04 : .3;
    // card times: each card's own "at" word if given, otherwise evenly from the start word
    let cards = raw.map((c, j) => {
      const o = typeof c === 'string' ? { text: c } : c;
      const w = wordAt(o.at);
      return { text: o.text, s: w ? w.s - .04 : t0 + j * step };
    });
    const endW = wordAt(P.end);
    cards.forEach((c, j) => { c.e = j + 1 < cards.length ? cards[j + 1].s : (endW ? endW.s - .04 : c.s + Math.max(step, P.last || .5)); });
    // palette pairs; each card flips to its inverse on the off-beat
    const looks = P.colors || [['var(--accent)', 'var(--ink)'], ['#111111', 'var(--accent)'], ['var(--accent-2)', '#111111'], ['#111111', '#ffffff'], ['#ffffff', '#111111']];
    const font = `"Avenir Next Condensed", "Impact", "PingFang SC", sans-serif`;
    const mc = document.createElement('canvas').getContext('2d');
    this.cards = cards.map((k, j) => {
      const [bgc, fg] = looks[j % looks.length];
      const lines = k.text.toUpperCase().split(/\s*\n\s*|\s+/).slice(0, 2);
      // fit the widest line to ~94% of the frame width, cap by height
      mc.font = `900 100px ${font}`;
      const wmax = Math.max(...lines.map(l => mc.measureText(l).width));
      const size = Math.min(lines.length > 1 ? 520 : 700, Math.floor(100 * 1010 / wmax));
      const c = el('div', `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;overflow:hidden`);
      const t = el('div', `font:900 ${size}px/.86 ${font};text-transform:uppercase;text-align:center;letter-spacing:-.01em;white-space:nowrap`,
        lines.join('<br>'));
      c.appendChild(t);
      ctx.L.front.appendChild(c);
      return { ...k, c, t, bgc, fg, rot: [-3, 2, -1.5, 3, -2][j % 5] };
    });
    // short white blink on the cut in / cut out
    this.blink = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
    ctx.L.front.appendChild(this.blink);
    // the subtitle pill is hidden while a card is up (the cards are the text); style lives in #front so it is wiped with the shot
    this.capStyle = el('style');
    ctx.L.front.appendChild(this.capStyle);
    this.first = cards.length ? cards[0].s : 0;
    this.last = cards.length ? cards[cards.length - 1].e : 0;
  },
  frame(ctx) {
    const t = ctx.t;
    for (const k of this.cards) {
      const on = t >= k.s && t < k.e;
      k.c.style.opacity = on ? 1 : 0;
      if (!on) continue;
      const half = k.s + (k.e - k.s) / 2;
      const off = (k.e - k.s) > .3 && t >= half;          // off-beat: inverse colours + second punch
      const b0 = off ? half : k.s;
      const q = clamp((t - b0) / .1);
      k.c.style.background = off ? k.fg : k.bgc;
      k.t.style.color = off ? k.bgc : k.fg;
      const sc = off ? lerp(1.12, 1, ease.out(q)) : lerp(1.6, 1, ease.out(q));
      // small camera shake on each hit
      const sh = (1 - q) * 14, f = Math.floor(t * 30);
      k.t.style.transform = `translate(${Math.sin(f * 2.3) * sh}px, ${Math.cos(f * 1.7) * sh}px) scale(${sc}) rotate(${off ? -k.rot : k.rot}deg)`;
    }
    const bi = t >= this.first && t < this.first + .07 ? .9 : (t >= this.last && t < this.last + .07 ? .7 : 0);
    this.blink.style.opacity = bi;
    const up = t >= this.first && t < this.last;
    this.capStyle.textContent = up ? '#caption{visibility:hidden}' : '';
  },
};
