// Caption News · slam caption card: the sentence IS the graphic. Each caption is split in 2–3 chunks ("a|b|c");
// every chunk slams in on its first spoken word (scale 1.3 → 1 in 0.13 s, back ease, opacity full in 0.04 s);
// at most one {keyword} per caption sits on a honey block that wipes left → right in 0.12 s, text turns ink.
// Optional news package: channel bug + source tag in the top safe area. Hides the running caption while up.
TEMPLATES.caption_news_slam = {
  norm: s => String(s).toLowerCase().replace(/[^a-z0-9%$']/g, ''),
  backOut(k, s = 1.6) { k = clamp(k); return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); },
  // time of the first spoken word of `chunk`, searching forward from word index `from`
  locate(ctx, chunk, from) {
    const first = this.norm((chunk.replace(/[{}]/g, '').trim().split(/\s+/)[0]) || '');
    for (let j = from; j < ctx.words.length; j++) if (this.norm(ctx.words[j].w) === first) return j;
    return -1;
  },
  setup(ctx) {
    const P = ctx.params, big = P.big === true, size = P.size || (big ? 118 : 96);
    const y = P.y || 1670;  // bottom of the last row: same band as the running caption (pack.css bottom:250px)
    this.root = el('div', 'position:absolute;inset:0');
    this.root.className = 'cn-slam';
    ctx.L.front.appendChild(this.root);
    // soft bottom gradient so ivory type reads on bright footage (on top of the pack's own veil)
    this.root.appendChild(el('div', 'position:absolute;left:0;right:0;bottom:0;height:820px;background:linear-gradient(180deg, rgba(14,14,12,0), rgba(14,14,12,.55))'));
    const lines = P.lines || [ctx.words.map(w => w.w).join(' ')];
    let wi = 0;
    this.caps = lines.map(line => {
      // a line that starts with "!" is a verdict line: set bigger
      const isBig = line.startsWith('!'), sz = isBig ? Math.round(size * 1.23) : size;
      if (isBig) line = line.slice(1);
      const box = el('div', `position:absolute;left:72px;width:936px;bottom:${1920 - y}px;display:flex;flex-wrap:wrap;align-items:baseline;
        column-gap:${Math.round(sz * .26)}px;row-gap:0;font:800 ${sz}px/1.06 var(--font-body);letter-spacing:-.02em;color:var(--paper)`);
      this.root.appendChild(box);
      const chunks = line.split('|').map(c => c.trim()).filter(Boolean).map((c, n) => {
        const j = this.locate(ctx, c, wi);
        if (j >= 0) wi = j + 1;
        const s = j >= 0 ? ctx.words[j].s - .04 : null;
        const e = el('span', `display:inline-block;transform-origin:0% 80%;max-width:936px;opacity:0;
          text-shadow:0 4px 20px rgba(0,0,0,.6), 0 1px 3px rgba(0,0,0,.3)`);
        let kw = null;
        e.innerHTML = c.replace(/\{([^}]+)\}/, (_, k) => `<span class="cn-kw" style="display:inline-block;padding:0 .14em;margin:0 -.04em;
          background:linear-gradient(var(--accent), var(--accent)) 0 0/0% 100% no-repeat;text-shadow:none;line-height:1.02">${k}</span>`);
        kw = e.querySelector('.cn-kw');
        box.appendChild(e);
        return { e, kw, s, n };
      });
      // chunks whose word was not found follow the previous chunk by 0.12 s
      chunks.forEach((c, n) => { if (c.s == null) c.s = n ? chunks[n - 1].s + .12 : 0; });
      // chunks not yet slammed take no space (display:none); the box is bottom-anchored, so it grows upward.
      // Measure its height with k chunks shown → frame() slides the rows up smoothly when a chunk opens a new row.
      const hs = chunks.map((c, n) => {
        chunks.forEach((d, m) => { d.e.style.display = m <= n ? 'inline-block' : 'none'; });
        return box.offsetHeight;
      });
      return { box, chunks, hs, s: chunks.length ? chunks[0].s : 0 };
    });
    this.caps.forEach((c, n) => { c.end = n + 1 < this.caps.length ? this.caps[n + 1].s : 1e9; });
    // channel bug + source tag (top safe area)
    if (P.bug || P.tag) {
      this.top = el('div', 'position:absolute;left:0;right:0;top:0;height:360px;background:linear-gradient(180deg, rgba(14,14,12,.55), rgba(14,14,12,0))');
      this.root.appendChild(this.top);
      this.pkg = el('div', 'position:absolute;left:64px;top:160px;display:flex;flex-direction:column;align-items:flex-start;gap:10px');
      this.root.appendChild(this.pkg);
      if (P.bug) {
        const b = el('div', 'display:flex;height:74px;align-items:stretch');
        b.appendChild(el('div', 'background:var(--accent);color:var(--ink);font:900 36px/74px var(--font-body);padding:0 18px;letter-spacing:.01em', P.bug.name || ''));
        if (P.bug.topic) b.appendChild(el('div', 'background:rgba(14,14,12,.66);color:var(--paper);font:800 30px/74px var(--font-body);padding:0 20px;letter-spacing:.06em;text-transform:uppercase', P.bug.topic));
        this.pkg.appendChild(b); this.bugEl = b;
      }
      if (P.tag) {
        const g = el('div', 'display:flex;height:46px;align-items:stretch');
        g.appendChild(el('div', 'background:var(--paper);color:var(--ink);font:800 20px/46px var(--font-body);padding:0 12px;letter-spacing:.08em', 'SOURCE'));
        g.appendChild(el('div', 'background:rgba(14,14,12,.82);color:var(--paper);font:500 22px/46px var(--font-body);padding:0 14px', P.tag));
        this.pkg.appendChild(g); this.tagEl = g;
      }
    }
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .1);
    for (const c of this.caps) {
      const on = t >= c.s - .001 && t < c.end;
      c.box.style.display = on ? 'flex' : 'none';
      if (!on) continue;
      let lift = 0;
      for (const ch of c.chunks) {
        const k = clamp((t - ch.s) / .13), shown = t >= ch.s - .001;
        ch.e.style.display = shown ? 'inline-block' : 'none';
        if (!shown) continue;
        // a new row pushes the shown rows up: ease that over the slam (0.13 s) instead of jumping
        if (ch.n) lift = (c.hs[ch.n] - c.hs[ch.n - 1]) * (1 - ease.out(k));
        // full opacity within one frame of its start, so a caption hand-over never shows an empty frame
        ch.e.style.opacity = Math.min(clamp((t - ch.s + .034) / .04), out);
        ch.e.style.transform = `scale(${lerp(1.3, 1, this.backOut(k))})`;
        if (ch.kw) {
          const wk = ease.out(clamp((t - ch.s - .05) / .12));
          ch.kw.style.backgroundSize = `${wk * 100}% 100%`;
          ch.kw.style.color = wk > .45 ? 'var(--ink)' : 'var(--paper)';
        }
      }
      c.box.style.transform = `translateY(${lift}px)`;
    }
    if (this.pkg) {
      // bug slides in from the left (0.2 s); source tag follows 0.15 s later
      const kb = ease.out(enter(t, .05, .2)), kt = ease.out(enter(t, .2, .2));
      if (this.bugEl) { this.bugEl.style.opacity = Math.min(kb, out); this.bugEl.style.transform = `translateX(${(1 - kb) * -40}px)`; }
      if (this.tagEl) { this.tagEl.style.opacity = Math.min(kt, out); this.tagEl.style.transform = `translateX(${(1 - kt) * -40}px)`; }
      this.top.style.opacity = Math.min(kb, out);
    }
  },
};
