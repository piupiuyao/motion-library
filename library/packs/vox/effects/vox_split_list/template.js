// Editorial Paper · split list: the person slides into the bottom half; the paper sheet on top shows a headline
// and 2–4 dashed, numbered slots ("01 … ?"). Each slot fills with its item in serif the moment it is said.
// Copied from the curiosity-reel "BUILD A BETTER AI SYSTEM" frame (herk-edit-kit, MIT). Helper shared with vox_split_title.
if (!window.voxSplit) {
  const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E"
    + "%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E"
    + "%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  window.voxSplit = {
    SEAM: 960, DROP: 640,
    // shot-local start time of a spoken word: a word index (number) or the word itself ("Slack")
    at(ctx, key, fb) {
      if (key == null) return fb;
      const hit = typeof key === 'number' ? ctx.words.find(w => w.i === key)
        : ctx.words.find(w => norm(w.w) === norm(String(key).split(/\s+/)[0])) || ctx.words.find(w => norm(w.w).startsWith(norm(String(key).split(/\s+/)[0])));
      return hit ? hit.s : fb;
    },
    build(ctx, P) {
      const tone = P.color === 'accent-2' ? 'var(--accent-2)' : 'var(--accent)';
      ctx.L.bg.style.background = 'var(--paper)';
      const panel = el('div', `position:absolute;left:0;top:0;width:1080px;height:${this.SEAM}px;overflow:hidden;background:var(--paper);
        transform-origin:50% 0`);
      panel.className = 'vx-panel';
      panel.appendChild(el('div', `position:absolute;inset:0;background-image:
        repeating-linear-gradient(0deg, var(--grid-line) 0 1px, transparent 1px 72px),
        repeating-linear-gradient(90deg, var(--grid-line) 0 1px, transparent 1px 72px);background-position:-1px -1px`));
      panel.appendChild(el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(80,60,30,.13))'));
      const content = el('div', 'position:absolute;inset:0');
      panel.appendChild(content);
      const grain = el('div', `position:absolute;inset:-60px;background:${GRAIN};background-size:220px 220px;mix-blend-mode:multiply;opacity:.38;pointer-events:none`);
      panel.appendChild(grain);
      const seam = el('div', `position:absolute;left:0;top:${this.SEAM - 6}px;width:1080px;height:6px;background:${tone};transform-origin:0 50%`);
      ctx.L.back.appendChild(panel); ctx.L.back.appendChild(seam);
      // headline block: kicker (Archivo caps), light serif line, black serif key phrase with a highlighter swipe
      const head = el('div', `position:absolute;left:96px;right:96px;top:${P.top || 190}px`);
      let kick = null, title = null, key = null, sweep = null, span = null;
      if (P.kicker) { kick = el('div', 'font:700 30px/1 var(--font-body);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:30px', P.kicker); head.appendChild(kick); }
      const size = P.size || 104;
      if (P.title) {
        title = el('div', `font-weight:300;font-size:${size}px;line-height:1.02;letter-spacing:-.03em;color:var(--ink)`, P.title);
        title.className = 'pk-display'; head.appendChild(title);
      }
      if (P.key) {
        key = el('div', `font-weight:900;font-size:${Math.round(size * 1.12)}px;line-height:1.04;letter-spacing:-.035em;color:var(--ink);margin-top:6px`);
        key.className = 'pk-display';
        span = el('span', 'position:relative;z-index:0;padding:0 6px'); span.className = 'pk-display';
        sweep = el('span', `position:absolute;left:-6px;right:-10px;top:30%;bottom:2%;z-index:-1;background:color-mix(in srgb, ${tone} 42%, transparent);
          transform:skewX(-8deg) rotate(-1.2deg) scaleX(0);transform-origin:0 50%;border-radius:2px`);
        span.appendChild(sweep); span.appendChild(document.createTextNode(P.key));
        key.appendChild(span); head.appendChild(key);
        key.style.whiteSpace = 'nowrap';  // one line so the highlighter is one stroke
      }
      content.appendChild(head);
      if (key) { const w = span.offsetWidth, room = 1080 - 192; if (w > room) key.style.fontSize = Math.floor(parseFloat(key.style.fontSize) * room / w) + 'px'; }
      return { panel, seam, grain, content, head, kick, title, key, sweep, tone };
    },
    // 0 → 1 → 0 progress of the split itself, stepped like stop-motion (shot on twos)
    k(ctx) {
      const step = p => Math.round(p * 6) / 6;
      return step(ease.out(enter(ctx.t, 0, .42))) * (1 - step(ease.inOut(enter(ctx.t, ctx.d - .32, .32))));
    },
    frame(ctx, S, k) {
      const z = ctx.seg.zoom || 1, drop = this.DROP * k, cut = this.SEAM * k;
      ctx.base.style.transform = `translateY(${drop}px) scale(${z})`;
      ctx.base.style.clipPath = `inset(${(cut - drop) / z + (1 - 1 / z) * 960}px 0 0 0)`;
      S.panel.style.transform = `scaleY(${k})`;
      S.content.style.opacity = k > .99 ? 1 : 0;
      S.seam.style.transform = `translateY(${cut - this.SEAM}px) scaleX(${k})`;
      // grain boils on stepped timing (8 fps)
      const g = Math.floor(ctx.t * 8) % 4;
      S.grain.style.transform = `translate(${[0, -37, -11, -52][g]}px, ${[0, -23, -48, -9][g]}px)`;
      const st = (p, n) => Math.round(clamp(p) * n) / n;
      if (S.kick) { const p = st(enter(ctx.t, .4, .28), 4); S.kick.style.opacity = p; S.kick.style.transform = `translateX(${(1 - p) * -22}px)`; }
      if (S.title) { const p = ease.out(enter(ctx.t, .48, .5)); S.title.style.opacity = clamp(p * 2); S.title.style.transform = `translateY(${(1 - p) * 26}px)`; }
      if (S.key) { const p = ease.out(enter(ctx.t, .62, .5)); S.key.style.opacity = clamp(p * 2); S.key.style.transform = `translateY(${(1 - p) * 26}px)`; }
      if (S.sweep) S.sweep.style.transform = `skewX(-8deg) rotate(-1.2deg) scaleX(${st(enter(ctx.t, this.keyAt != null ? this.keyAt : 1.0, .42), 5)})`;
    },
  };
}

TEMPLATES.vox_split_list = {
  setup(ctx) {
    const P = ctx.params;
    voxSplit.keyAt = null;
    this.S = voxSplit.build(ctx, P);
    const items = (P.items || []).slice(0, 4).map(it => typeof it === 'string' ? { text: it } : it);
    const n = items.length || 1;
    const top = P.list_top || (P.key ? 540 : 470), rowH = n > 3 ? 92 : 112, gap = n > 3 ? 18 : 24;
    const burst = !P.no_burst;
    const left = burst ? 300 : 96;
    if (burst) {
      // the cut-paper starburst + arrow pointing into the slots, accent colour
      const cy = top + (n * rowH + (n - 1) * gap) / 2;
      let rays = '';
      for (let a = 0; a < 12; a++) { const r = a * Math.PI / 6, l = a % 2 ? 46 : 62; rays += `<path d="M70 70 L${(70 + Math.cos(r) * l).toFixed(1)} ${(70 + Math.sin(r) * l).toFixed(1)}"/>`; }
      this.burst = el('div', `position:absolute;left:84px;top:${cy - 70}px;width:140px;height:140px;color:${this.S.tone}`,
        `<svg width="140" height="140" viewBox="0 0 140 140" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round">${rays}</svg>`);
      this.arrow = el('div', `position:absolute;left:226px;top:${cy - 14}px;width:62px;height:28px;color:${this.S.tone}`,
        `<svg width="62" height="28" viewBox="0 0 62 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M2 14 H56 M44 4 L58 14 L44 24"/></svg>`);
      this.S.content.appendChild(this.burst); this.S.content.appendChild(this.arrow);
    }
    this.rows = items.map((it, j) => {
      const row = el('div', `position:absolute;left:${left}px;right:84px;top:${top + j * (rowH + gap)}px;height:${rowH}px;box-sizing:border-box;
        border:3px dashed rgba(23,19,14,.30);display:flex;align-items:center;padding:0 30px;gap:26px`);
      const num = el('div', 'font:700 30px/1 var(--font-body);letter-spacing:.12em;color:var(--muted);flex:none', String(j + 1).padStart(2, '0'));
      const q = el('div', `margin-left:auto;font-weight:900;font-size:50px;line-height:1;color:var(--muted)`, '?'); q.className = 'pk-display';
      const txt = el('div', `font-weight:600;font-size:${P.size_item || 50}px;line-height:1;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;
        flex:1;min-width:0;transform-origin:0 50%`, it.text); txt.className = 'pk-display';
      row.appendChild(num); row.appendChild(txt); row.appendChild(q);
      this.S.content.appendChild(row);
      return { row, num, q, txt, s: voxSplit.at(ctx, it.at != null ? it.at : it.text, 1.2 + j * .8) };
    });
    // shrink long items to fit their slot (fonts are loaded before setup runs)
    for (const r of this.rows) { const w = r.txt.scrollWidth, room = r.txt.clientWidth; if (w > room) r.txt.style.fontSize = Math.floor(parseFloat(r.txt.style.fontSize) * room / w) + 'px'; }
  },
  frame(ctx) {
    const k = voxSplit.k(ctx);
    voxSplit.frame(ctx, this.S, k);
    const st = (p, n) => Math.round(clamp(p) * n) / n;
    if (this.burst) {
      const p = enter(ctx.t, .55, .4);
      this.burst.style.opacity = clamp(p * 3);
      this.burst.style.transform = `scale(${lerp(.3, 1, ease.back(p))}) rotate(${Math.floor(ctx.t * 4) * 7}deg)`;
      this.arrow.style.clipPath = `inset(0 ${100 - st(enter(ctx.t, .75, .3), 4) * 100}% 0 0)`;
    }
    this.rows.forEach((r, j) => {
      const pin = st(enter(ctx.t, .7 + j * .1, .25), 3);
      r.row.style.opacity = pin;
      const p = enter(ctx.t, Math.max(.8, r.s - .05), .3);
      r.q.style.opacity = 1 - clamp(p * 3);
      r.txt.style.opacity = clamp(p * 3);
      r.txt.style.transform = `translateY(${(1 - ease.back(p)) * 18}px)`;
      r.num.style.color = p > .3 ? this.S.tone : '';
      r.row.style.borderColor = p > .3 ? 'rgba(23,19,14,.55)' : '';
      r.row.style.borderStyle = p > .3 ? 'solid' : 'dashed';
      r.row.style.background = p > .3 ? 'rgba(251,248,241,.7)' : '';
    });
  },
};
