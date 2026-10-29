// 报纸底清单 · 版式：背景换成反色（变暗）的旧报纸慢慢漂移，人抠出站一边，清单条目带小图一条条弹出
TEMPLATES.c40 = {
  setup(ctx) {
    const P = ctx.params;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.base.style.opacity = 0;
    ctx.L.bg.style.background = '#141414';
    // an "inverted" newspaper page drawn with CSS: masthead, headlines, columns of grey text lines
    const paper = this.paper = el('div', `position:absolute;left:-160px;top:-160px;width:1400px;height:2300px;padding:60px 70px;box-sizing:border-box;
      color:#d9d4c7;font-family:Georgia,'Times New Roman',serif;opacity:.6`);
    paper.appendChild(el('div', 'text-align:center;font:900 150px/1 "Old English Text MT",Georgia,serif;letter-spacing:.02em;border-bottom:6px double #d9d4c7;padding-bottom:20px', 'The Daily Inbox'));
    paper.appendChild(el('div', 'display:flex;justify-content:space-between;font:400 28px Georgia;padding:10px 0;border-bottom:2px solid #d9d4c7', '<span>VOL. CXII</span><span>MONDAY EDITION</span><span>PRICE 5 CENTS</span>'));
    const heads = ['MESSAGES PILE UP AGAIN', 'Replies Delayed For Days', 'Readers Report Guilt', 'Inbox Zero Remains a Myth', 'Experts Baffled'];
    const cols = el('div', 'display:grid;grid-template-columns:repeat(4,1fr);gap:36px;margin-top:30px');
    const lines = 'repeating-linear-gradient(180deg, #d9d4c7 0 9px, transparent 9px 26px)';
    for (let c = 0; c < 4; c++) {
      const col = el('div', '');
      for (let b = 0; b < 4; b++) {
        const h = heads[(c * 2 + b) % heads.length];
        col.appendChild(el('div', `font:700 ${b === 0 && c % 2 === 0 ? 54 : 36}px/1.05 Georgia;margin:18px 0 14px`, h));
        if ((c + b) % 3 === 1) col.appendChild(el('div', 'height:200px;margin-bottom:14px;background:repeating-linear-gradient(45deg,#6d6a62 0 4px,#2a2a2a 4px 9px)'));
        col.appendChild(el('div', `height:${220 + ((c * 7 + b * 5) % 4) * 60}px;background:${lines}`));
      }
      cols.appendChild(col);
    }
    paper.appendChild(cols);
    ctx.L.bg.appendChild(paper);
    ctx.L.bg.appendChild(el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,.65))'));
    ctx.personCv.style.filter = outline(6, '#fff');
    this.list = el('div', 'position:absolute;left:50px;top:300px;width:600px;display:flex;flex-direction:column;gap:40px');
    if (P.title) {
      const h = el('div', 'font-size:76px;color:var(--accent);margin-bottom:4px;text-shadow:0 0 10px #000, 0 4px 24px #000', P.title);
      h.className = 'display';
      this.list.appendChild(h);
      this.title = h;
    }
    const items = P.items || [];
    this.items = items.map((it, j) => {
      // Ali Abdaal look: no card, just a small picture tile + white text straight on the dark newspaper
      const row = el('div', `display:flex;align-items:center;gap:24px;transform-origin:0 50%;width:max-content`);
      row.appendChild(el('div', `flex:none;width:104px;height:104px;border-radius:16px;background:${it.color || 'var(--accent)'};display:flex;align-items:center;justify-content:center;font-size:62px;
        box-shadow:0 0 0 5px #fff, 0 12px 26px rgba(0,0,0,.6);transform:rotate(${j % 2 ? 3 : -3}deg)`, it.icon || '•'));
      row.appendChild(el('div', 'font:800 60px var(--font-body);color:#fff;white-space:nowrap;text-shadow:0 3px 14px rgba(0,0,0,.85)', it.text));
      this.list.appendChild(row);
      const t = it.at != null ? at(it.at) : null;
      return { row, t: t != null ? t : .6 + j * .6 };
    });
    ctx.L.front.appendChild(this.list);
  },
  frame(ctx) {
    const p = ease.out(enter(ctx.t, 0, .4));
    ctx.L.bg.style.opacity = p;
    this.paper.style.transform = `translate(${-ctx.t * 14}px, ${-ctx.t * 22}px) rotate(-4deg)`;
    ctx.person.style.transformOrigin = '50% 100%';
    ctx.person.style.transform = `translateX(${lerp(0, 270, p)}px) scale(${lerp(ctx.seg.zoom || 1, .86, p)})`;
    const lv = leave(ctx, .3);
    if (this.title) { this.title.style.opacity = Math.min(enter(ctx.t, .15, .3), lv); }
    for (const it of this.items) {
      const q = enter(ctx.t, it.t, .4);
      it.row.style.opacity = Math.min(clamp(q * 3), lv);
      it.row.style.transform = `translateX(${lerp(-80, 0, ease.out(q))}px) scale(${ease.pop(q)})`;
    }
  },
};
