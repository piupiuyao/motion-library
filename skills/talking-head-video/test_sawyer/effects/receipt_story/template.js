// 收据串场 · 这条视频专用：左上方吐出一张收据，跟着台词打出合计、逐项补全被忘掉的订阅、划掉、合计转进存款，最后撕下掉落
TEMPLATES.receipt_story = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w$]/g, '');
    const at = (w, dflt) => { if (w == null) return dflt; const hit = ctx.words.find(x => norm(x.w).startsWith(norm(w))); return hit ? hit.s : dflt; };
    const INK = '#1d1c1a', RED = '#d4342b', GREEN = '#1e9e57', MONO = '"SF Mono", Menlo, "Courier New", monospace';
    this.c = { INK, RED, GREEN };
    const W = this.W = P.width || 380, X = 18, Y = 26;
    // everything lives in one box scaled down to fit the empty wall beside the head; behind the cut-out person so any overlap tucks behind the hair
    this.root = el('div', `position:absolute;left:${P.x ?? 6}px;top:${P.y ?? 120}px;width:${W + 36}px;height:1400px;transform:scale(${P.scale || .8});transform-origin:0 0`);
    ctx.L[P.layer || 'back'].appendChild(this.root);

    // the printer slot the paper comes out of
    this.slot = el('div', `position:absolute;left:${X - 18}px;top:${Y - 26}px;width:${W + 36}px;height:30px;border-radius:15px;
      background:linear-gradient(#2b2b2e,#111);box-shadow:0 8px 20px rgba(0,0,0,.35)`);
    this.clip = el('div', `position:absolute;left:${X}px;top:${Y - 10}px;width:${W}px;height:1300px;overflow:hidden`);
    const zig = Array.from({ length: 25 }, (_, i) => `${(i / 24) * 100}% ${i % 2 ? 100 : 'calc(100% - 14px)'}`).join(',');
    this.paper = el('div', `position:absolute;left:0;top:0;width:${W}px;box-sizing:border-box;padding:34px 34px 46px;
      background:linear-gradient(90deg,#f1efe8,#fbfaf6 12%,#fbfaf6 88%,#efede5);color:${INK};font-family:${MONO};
      clip-path:polygon(0 0,100% 0,${zig},0 calc(100% - 14px));box-shadow:0 18px 40px rgba(0,0,0,.25)`);
    this.clip.appendChild(this.paper);
    this.root.append(this.clip, this.slot);

    const row = (css = '') => { const r = el('div', `display:flex;align-items:center;gap:14px;${css}`); this.paper.appendChild(r); return r; };
    const dash = () => this.paper.appendChild(el('div', 'border-top:3px dashed rgba(0,0,0,.28);margin:18px 0'));

    // header
    const h = row('flex-direction:column;align-items:flex-start;gap:4px');
    h.appendChild(el('div', `font:700 22px ${MONO};letter-spacing:.18em;opacity:.55`, P.kicker || 'MONTHLY STATEMENT'));
    this.head = el('div', `position:relative;font:800 34px/1.12 ${MONO};letter-spacing:-.01em`, P.header || '');
    this.mark = el('div', `position:absolute;left:-6px;bottom:2px;height:18px;width:0;background:${RED};opacity:.28;border-radius:4px`);
    this.head.appendChild(this.mark);
    h.appendChild(this.head);
    dash();

    // items: start as blank "forgotten" lines, fill in when named
    this.items = (P.items || []).map(it => {
      const r = row('height:64px;position:relative');
      const ic = iconFind(it.icon || it.text);
      const icon = el('div', `width:44px;height:44px;flex:none;border-radius:10px;overflow:hidden;opacity:0;
        background:${ic && ic.kind === 'brand' ? ic.hex : ic && ic.kind === 'ui' ? '#eceae2' : 'transparent'};padding:${ic && ic.kind !== 'logo' ? 8 : 0}px;box-sizing:border-box;color:${INK}`,
        ic ? iconSvg(ic, ic.kind === 'brand' ? '#fff' : null) : '');
      const blank = el('div', `position:absolute;left:58px;right:90px;top:30px;border-top:4px dotted rgba(0,0,0,.25)`);
      const name = el('div', `flex:1;font:700 34px ${MONO};white-space:nowrap;overflow:hidden`, '');
      const q = el('div', `font:700 30px ${MONO};opacity:.35`, '/mo');
      const strike = el('div', `position:absolute;left:-8px;top:31px;height:5px;width:0;background:${RED};border-radius:3px`);
      r.append(icon, blank, name, q, strike);
      return { r, icon, blank, name, q, strike, text: it.text, t: at(it.at || it.text, null) };
    });
    dash();

    // total
    const tr = row('justify-content:space-between;position:relative;height:84px');
    tr.appendChild(el('div', `font:800 30px ${MONO};letter-spacing:.06em`, P.totalLabel || 'TOTAL'));
    this.total = el('div', `font:900 64px ${MONO};color:${RED};letter-spacing:-.02em;transform-origin:100% 50%`, (P.total && P.total.text) || '');
    tr.appendChild(this.total);
    this.save = el('div', `position:absolute;right:0;top:${84}px;font:800 30px ${MONO};color:${GREEN};white-space:nowrap`, (P.save && P.save.text) || '');
    tr.appendChild(this.save);
    this.paper.appendChild(el('div', 'height:40px'));

    const end = ctx.d;
    this.T = {
      total: at(P.total && P.total.at, null),
      search: at(P.search && P.search.at, null),
      cancel: at(P.cancel && P.cancel.at, null),
      save: at(P.save && P.save.at, null),
      tear: P.tear != null ? at(P.tear, end - .7) : end - .7,
    };
    this.items.forEach((it, k) => { if (it.t == null) it.t = (this.T.total ?? 1) + .6 + k * .5; });
    this.full = this.paper.offsetHeight || 640;
  },
  frame(ctx) {
    const t = ctx.t, T = this.T;
    // print: the paper feeds out of the slot over the first ~1.6 s, then a little more as items fill
    const feed = ease.out(enter(t, .05, 1.6));
    const tear = enter(t, T.tear, .7);
    const y = -this.full * (1 - feed) + ease.inOut(tear) * 900;
    this.paper.style.transform = `translateY(${y}px) rotate(${ease.inOut(tear) * 9}deg)`;
    this.paper.style.opacity = 1 - clamp((tear - .5) * 2);
    this.slot.style.opacity = clamp(enter(t, 0, .25)) * (1 - clamp(enter(t, T.tear + .2, .4)));
    this.slot.style.transform = `translateY(${lerp(-20, 0, ease.out(enter(t, 0, .3)))}px)`;

    // header highlight when he says "search"
    this.mark.style.width = T.search != null ? `${ease.inOut(enter(t, T.search, .5)) * 104}%` : '0';

    // total pops in, later slides out and the savings line comes in
    const tp = T.total != null ? enter(t, T.total - .05, .35) : 0;
    const sv = T.save != null ? enter(t, T.save, .5) : 0;
    this.total.style.opacity = clamp(tp * 2) * (1 - ease.inOut(sv) * .65);
    this.total.style.transform = `scale(${lerp(1.5, 1, ease.back(tp))})`;
    this.total.style.textDecoration = sv > .5 ? 'line-through' : 'none';
    this.save.style.opacity = clamp(sv * 2);
    this.save.style.transform = `translateY(${lerp(16, 0, ease.out(sv))}px)`;

    // items type in when named, then get struck through one by one on "cancel"
    this.items.forEach((it, k) => {
      const q = enter(t, it.t - .05, .35);
      it.name.textContent = it.text.slice(0, Math.round(it.text.length * clamp(q * 1.4)));
      it.blank.style.opacity = 1 - clamp(q * 3);
      it.icon.style.opacity = clamp(q * 2);
      it.icon.style.transform = `scale(${lerp(.4, 1, ease.back(q))})`;
      const s = T.cancel != null ? enter(t, T.cancel + k * .28, .3) : 0;
      it.strike.style.width = `${ease.out(s) * 104}%`;
      it.r.style.opacity = 1 - s * .45;
    });
  },
};
