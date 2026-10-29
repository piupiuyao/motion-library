// 标题匹配切 · 转场：一串不同的「文章截图」快速切换，同一个关键词一直固定在屏幕同一位置，周围的文章每次都变
TEMPLATES.c74 = {
  setup(ctx) {
    const P = ctx.params, n = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const word = P.word || 'Replying';
    const w = P.at && ctx.words.find(w => n(w.w) === n(P.at));
    this.T = w ? w.s : (P.start != null ? P.start : .3);
    this.step = P.step || .2;
    const fs = 104, Y = P.y || 700;
    const A = P.articles || [
      { bg: '#f6f1e7', ink: '#1a1a1a', font: 'Georgia, serif', mast: 'THE DAILY LEDGER', l: 'Why', r: 'is the new email', img: 'assets/docs/gmail.jpg' },
      { bg: '#ffffff', ink: '#111', font: "'Helvetica Neue', Arial, sans-serif", mast: 'tech/weekly', l: 'The hidden cost of', r: 'late at night', img: null },
      { bg: '#fff4f0', ink: '#3a0d00', font: "'Times New Roman', serif", mast: 'Morning Herald', l: 'Stop', r: 'to everything', img: 'assets/docs/chat.jpg' },
      { bg: '#eef3ff', ink: '#0b1d4a', font: "'Avenir Next', sans-serif", mast: 'WORK LIFE', l: 'Inbox zero:', r: 'burnout', img: null },
      { bg: '#1d1d22', ink: '#f2f2f2', font: 'Georgia, serif', mast: 'THE EVENING POST', l: 'Is', r: 'killing your focus?', img: 'assets/docs/notify.jpg' },
      { bg: '#fffbe6', ink: '#222', font: "'Courier New', monospace", mast: 'inbox digest', l: 'Why we hate', r: 'so much', img: null },
      { bg: '#f0f7ee', ink: '#0f2a12', font: "'Helvetica Neue', sans-serif", mast: 'Modern Office', l: 'The art of', r: 'well and fast', img: 'assets/docs/gmail.jpg' },
      { bg: '#ffffff', ink: '#111', font: 'Didot, Georgia, serif', mast: 'QUARTERLY', l: 'AI and the', r: 'fatigue', img: null },
    ];
    this.n = P.count || A.length;
    const lines = (top, k, ink) => `<div style="position:absolute;left:80px;right:80px;top:${top}px;height:${k * 46}px;
      background:repeating-linear-gradient(180deg, ${ink} 0 18px, transparent 18px 46px);opacity:.18"></div>`;
    this.arts = A.slice(0, this.n).map((a, k) => {
      const d = el('div', `position:absolute;inset:0;background:${a.bg};color:${a.ink};font-family:${a.font};display:none;overflow:hidden`);
      d.innerHTML = `<div style="position:absolute;left:80px;right:80px;top:150px;border-bottom:4px solid ${a.ink};padding-bottom:16px;font:700 64px ${a.font};letter-spacing:.04em;text-align:${k % 2 ? 'left' : 'center'}">${a.mast}</div>
        <div style="position:absolute;left:80px;top:270px;font:500 30px ${a.font};opacity:.6">${['MON', 'TUE', 'WED', 'THU', 'FRI'][k % 5]} · ${3 + k} MIN READ</div>
        ${lines(360, 5 + (k % 3), a.ink)}
        <div style="position:absolute;left:0;right:0;top:${Y}px;display:grid;grid-template-columns:1fr auto 1fr;column-gap:26px;align-items:baseline;font:800 ${fs}px/1.1 ${a.font};white-space:nowrap">
          <div style="display:flex;justify-content:flex-end;min-width:0"><span>${a.l}</span></div>
          <div class="display" style="font-size:${fs}px;visibility:hidden;padding:0 18px">${word}</div>
          <div style="min-width:0">${a.r}</div></div>
        ${lines(Y + 160, 3, a.ink)}
        ${a.img ? `<img src="${url(a.img)}" style="position:absolute;left:80px;top:${Y + 330}px;width:920px;height:520px;object-fit:cover;border-radius:6px">` : lines(Y + 330, 11, a.ink)}`;
      d.querySelectorAll('img').forEach(i => pending.push(i.decode().catch(() => {})));
      ctx.L.front.appendChild(d);
      return d;
    });
    // the fixed word: same font/size as the hidden placeholder, so it lines up on every article
    this.key = el('div', `position:absolute;left:0;right:0;top:${Y}px;display:grid;grid-template-columns:1fr auto 1fr;column-gap:26px;font-size:${fs}px;line-height:1.1;white-space:nowrap;opacity:0`,
      `<div></div><div class="display" style="font-size:${fs}px;padding:0 18px;background:var(--accent);color:var(--ink);border-radius:10px">${word}</div><div></div>`);
    ctx.L.front.appendChild(this.key);
  },
  frame(ctx) {
    const dt = ctx.t - this.T, k = Math.floor(dt / this.step), on = dt >= 0 && k < this.n;
    this.arts.forEach((a, j) => {
      a.style.display = on && j === k ? '' : 'none';
      if (on && j === k) a.style.transform = `scale(${lerp(1.04, 1, ease.out(clamp((dt - k * this.step) / .12)))})`;
    });
    this.key.style.opacity = on ? 1 : 0;
  },
};
