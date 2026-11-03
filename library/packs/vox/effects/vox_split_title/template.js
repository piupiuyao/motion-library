// Editorial Paper · split title: the person slides into the bottom half, a sheet of warm paper (grid + grain)
// covers the top half with a serif headline — light Fraunces line + one black-weight key phrase under a
// highlighter swipe — and one optional exhibit under it: a paper card, app tiles, or a handwritten note.
// Copied from the curiosity-reel layout (herk-edit-kit, MIT) in the Vox explainer type system.
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

TEMPLATES.vox_split_title = {
  setup(ctx) {
    const P = ctx.params;
    voxSplit.keyAt = null;
    this.S = voxSplit.build(ctx, P);
    this.sweepAt = Math.max(1.0, voxSplit.at(ctx, P.key_at, 1.0));
    this.items = [];
    const area = el('div', `position:absolute;left:96px;right:96px;top:${P.exhibit_top || 560}px;bottom:70px;display:flex;align-items:center;justify-content:center;gap:56px`);
    this.S.content.appendChild(area);
    if (P.apps) {
      // app tiles pasted on the sheet, each lands when its name is said
      P.apps.slice(0, 4).forEach((name, j) => {
        const ic = iconFind(name);
        if (!ic) return;
        const box = el('div', 'display:flex;flex-direction:column;align-items:center;gap:22px');
        const tile = el('div', `width:196px;height:196px;box-sizing:border-box;padding:44px;background:#fbf8f1;border:2px solid rgba(23,19,14,.14);
          border-radius:34px;box-shadow:0 3px 0 rgba(23,19,14,.10)`, iconSvg(ic));
        const lab = el('div', 'font:700 28px/1 var(--font-body);letter-spacing:.16em;text-transform:uppercase;color:var(--ink)', name);
        box.appendChild(tile); box.appendChild(lab); area.appendChild(box);
        this.items.push({ e: box, s: voxSplit.at(ctx, name, .9 + j * .25), rot: [-3, 2, -1.5, 2.5][j] });
      });
    } else if (P.card) {
      // a paper card (stacked sheet behind it), like the "YOUR PROJECT / NEEDS ACCESS" card
      const C = P.card;
      const wrap = el('div', 'position:relative;width:780px');
      wrap.appendChild(el('div', 'position:absolute;inset:0;background:#e9e1cd;border:2px solid rgba(23,19,14,.10);transform:rotate(2.2deg) translate(10px,8px)'));
      const card = el('div', `position:relative;background:#f6f1e6;border:2px solid rgba(23,19,14,.12);box-shadow:0 4px 0 rgba(23,19,14,.08);
        padding:38px 48px 42px;display:flex;flex-direction:column;align-items:center;gap:26px;transform:rotate(-1deg)`);
      if (C.label) card.appendChild(el('div', 'font:800 40px/1 var(--font-body);letter-spacing:.06em;text-transform:uppercase;color:var(--ink)', C.label));
      card.appendChild(el('div', 'align-self:stretch;height:2px;background:rgba(23,19,14,.14)'));
      if (C.text) { const q = el('div', 'font-weight:600;font-size:54px;line-height:1.12;letter-spacing:-.02em;color:var(--ink);text-align:center', C.text); q.className = 'pk-display'; card.appendChild(q); }
      else if (C.icon) { const ic = iconFind(C.icon); if (ic) card.appendChild(el('div', 'width:120px;height:120px;color:var(--ink)', iconSvg(ic, 'var(--ink)'))); }
      if (C.note) card.appendChild(el('div', `font:700 30px/1 var(--font-body);letter-spacing:.12em;text-transform:uppercase;color:${this.S.tone}`, C.note));
      wrap.appendChild(card); area.appendChild(wrap);
      this.items.push({ e: wrap, s: voxSplit.at(ctx, C.at, 1.0), rot: 0 });
    }
    if (P.note) {
      // the editor's pen: Caveat note + hand-drawn arrow, in the accent colour
      const n = el('div', `position:absolute;right:110px;top:${P.note_y || 470}px;display:flex;align-items:flex-start;gap:10px;color:${this.S.tone};transform:rotate(-4deg)`);
      n.innerHTML = `<svg width="110" height="80" viewBox="0 0 110 80" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M100 10 C 70 8, 30 20, 14 62"/><path d="M8 40 L14 64 L36 52"/></svg>`;
      const t = el('div', 'font-size:64px;line-height:1', P.note); t.className = 'pk-hand';
      n.appendChild(t); this.S.content.appendChild(n);
      this.items.push({ e: n, s: voxSplit.at(ctx, P.note_at, 1.6), rot: 0, fade: true });
    }

    // layout from measured type (fonts are loaded before setup): exhibit sits under the headline; no exhibit → headline centred
    const hb = (P.top || 190) + this.S.head.offsetHeight;
    if (area.childElementCount) area.style.top = Math.max(P.exhibit_top || 0, hb + 50) + 'px';
    else if (!P.top && !P.note) this.S.head.style.top = Math.round((960 - this.S.head.offsetHeight) / 2 - 10) + 'px';
  },
  frame(ctx) {
    const k = voxSplit.k(ctx);
    voxSplit.keyAt = this.sweepAt;
    voxSplit.frame(ctx, this.S, k);
    for (const it of this.items) {
      const p = enter(ctx.t, Math.max(.7, it.s - .06), .4);
      it.e.style.opacity = clamp(p * 3);
      it.e.style.transform = it.fade ? '' : `scale(${lerp(.6, 1, ease.back(p))}) rotate(${it.rot * clamp(p)}deg)`;
    }
  },
};
