// 里程碑曲线分段画 · 版式：人下移到下半部，上方浅灰面板里一个折线图框，每个阶段一条强调色曲线从左下画到顶，末端标时长；下一阶段清空重画、旧终点留小圆点，新曲线更陡更早到顶
TEMPLATES.milestone_curve = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    const stages = (P.stages || []).filter(s => s && s.end != null && !isNaN(parseFloat(s.end)));
    if (!stages.length) { this.off = true; return; }        // 必填: no stages → render nothing
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    this.ph = P.panel || 720; this.shift = P.shift != null ? P.shift : 320;
    ctx.L.bg.style.background = '#000';
    this.panel = el('div', `position:absolute;left:0;top:0;width:1080px;height:${this.ph}px;background:#efefef`);
    ctx.L.front.appendChild(this.panel);
    if (P.title) this.panel.appendChild(el('div', `position:absolute;left:40px;right:40px;top:96px;text-align:center;color:#111;font:800 56px/1.1 var(--font-body);letter-spacing:-.01em`, P.title));
    if (P.sub) this.panel.appendChild(el('div', `position:absolute;left:40px;right:40px;top:164px;text-align:center;color:#444;font:600 30px var(--font-body)`, P.sub));
    // stage label (top-left), swapped per stage
    this.labs = stages.map(s => {
      const b = el('div', 'position:absolute;left:80px;top:225px;opacity:0');
      if (s.label) b.appendChild(el('div', 'font:800 40px var(--font-body);color:#111', s.label));
      if (s.range) b.appendChild(el('div', 'margin-top:4px;font:600 26px var(--font-body);color:#333', s.range));
      this.panel.appendChild(b);
      return b;
    });
    const xMax = parseFloat(P.xMax) || Math.max(...stages.map(s => parseFloat(s.end)));
    const gx = 90, gy = 380, gw = 900, gh = 240;            // chart box inside the panel
    const X = v => gx + gw * clamp(v / xMax, 0, 1);
    const ticks = P.ticks != null ? P.ticks : Math.min(10, Math.round(xMax));
    let grid = '', tk = '';
    for (let i = 1; i <= ticks; i++) {
      const xx = gx + gw * i / ticks;
      grid += `<line x1="${xx}" y1="${gy}" x2="${xx}" y2="${gy + gh}" stroke="#d6d6d6" stroke-width="2"/>`;
      tk += `<text x="${xx}" y="${gy + gh + 36}" text-anchor="middle" font-size="24" fill="#555">${+(xMax * i / ticks).toFixed(2)}</text>`;
    }
    const svg = `<svg width="1080" height="${this.ph}" viewBox="0 0 1080 ${this.ph}" style="position:absolute;left:0;top:0;font-family:var(--font-body);font-weight:600">
      ${grid}<path d="M${gx} ${gy - 6} V${gy + gh} H${gx + gw + 6}" fill="none" stroke="#111" stroke-width="4"/>${tk}
      ${P.xLabel ? `<text x="${gx + gw / 2}" y="${gy + gh + 78}" text-anchor="middle" font-size="26" font-weight="700" fill="#222">${P.xLabel}</text>` : ''}
      ${P.yLabel ? `<text transform="translate(${gx - 30} ${gy + gh / 2}) rotate(-90)" text-anchor="middle" font-size="24" fill="#333">${P.yLabel}</text>` : ''}
      <g id="mc_dots"></g><g id="mc_curves"></g></svg>`;
    this.panel.insertAdjacentHTML('beforeend', svg);
    const dots = this.panel.querySelector('#mc_dots'), curves = this.panel.querySelector('#mc_curves');
    const NS = 'http://www.w3.org/2000/svg';
    const step = (ctx.d - 1) / stages.length;
    this.stages = stages.map((s, j) => {
      const ex = X(parseFloat(s.end)), ey = gy + 6;
      let d = `M${gx} ${gy + gh}`;
      for (let i = 1; i <= 40; i++) { const u = i / 40; d += ` L${(gx + (ex - gx) * u).toFixed(1)} ${(gy + gh - (gh - 6) * Math.pow(u, 2.4)).toFixed(1)}`; }
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '8'); p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('pathLength', '1'); p.setAttribute('stroke-dasharray', '1'); p.setAttribute('stroke-dashoffset', '1');
      p.style.stroke = 'color-mix(in srgb, var(--accent) 82%, #000)';
      curves.appendChild(p);
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', ex); dot.setAttribute('cy', ey); dot.setAttribute('r', '10');
      dot.style.fill = 'color-mix(in srgb, var(--accent) 82%, #000)';
      dots.appendChild(dot);
      const lab = el('div', `position:absolute;left:${ex - 150}px;width:300px;top:${ey - 52}px;text-align:center;font:800 30px var(--font-body);color:#111;opacity:0`, s.endLabel || '');
      this.panel.appendChild(lab);
      const t0 = at(s.at);
      return { p, dot, lab, t: t0 != null ? t0 : .4 + j * step, dur: parseFloat(s.dur) || (j ? 1.1 : 1.7) };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t;
    const k = ease.inOut(enter(t, 0, .45)) * (1 - ease.inOut(enter(t, ctx.d - .35, .35)));
    ctx.base.style.transform = `translateY(${this.shift * k}px) scale(${ctx.seg.zoom || 1})`;
    this.panel.style.transform = `translateY(${(k - 1) * this.ph}px)`;
    this.stages.forEach((s, j) => {
      const next = this.stages[j + 1];
      const gone = next ? enter(t, next.t - .1, .2) : 0;        // the next stage clears this curve
      const q = enter(t, s.t, s.dur);
      s.p.setAttribute('stroke-dashoffset', 1 - ease.inOut(q));
      s.p.style.opacity = (q > 0 ? 1 : 0) * (1 - gone);
      const end = enter(t, s.t + s.dur - .1, .25);
      s.dot.style.opacity = end;                                  // finished stages leave their end dot
      s.lab.style.opacity = end * (1 - gone);
      const shown = enter(t, s.t - .1, .25) * (1 - gone);
      this.labs[j].style.opacity = shown;
      this.labs[j].style.transform = `translateY(${lerp(10, 0, ease.out(shown))}px)`;
    });
  },
};
