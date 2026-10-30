// 地图描线 · 素材：一张有质感的地图铺满屏幕慢慢移动，一条线自己画出路线，终点弹出地名
TEMPLATES.map_route = {
  setup(ctx) {
    const P = ctx.params;
    const Wd = 1500, Ht = 2400;
    this.map = el('div', `position:absolute;left:0;top:0;width:${Wd}px;height:${Ht}px`);
    const cv = el('canvas'); cv.width = Wd / 2; cv.height = Ht / 2;
    cv.style.cssText = `position:absolute;inset:0;width:${Wd}px;height:${Ht}px`;
    const c = cv.getContext('2d');
    let seed = P.seed || 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // sea
    c.fillStyle = '#b9cfc4'; c.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(60,90,80,${rnd() * .06})`; c.fillRect(rnd() * cv.width, rnd() * cv.height, 2, 2); }
    // land blobs
    const blob = (cx, cy, r) => {
      c.beginPath();
      for (let i = 0; i <= 60; i++) {
        const a = i / 60 * Math.PI * 2, rr = r * (1 + .22 * Math.sin(a * 3 + cx) + .12 * Math.sin(a * 7 + cy) + .05 * Math.sin(a * 17));
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 1.2;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
    };
    [[250, 400, 260], [520, 700, 230], [200, 950, 200], [560, 260, 150]].forEach(([x, y, r]) => {
      blob(x, y, r + 10); c.fillStyle = 'rgba(80,110,100,.35)'; c.fill();
      blob(x, y, r); c.fillStyle = '#e9dcb8'; c.fill(); c.strokeStyle = '#8a7654'; c.lineWidth = 2; c.stroke();
    });
    for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(120,90,50,${rnd() * .07})`; c.fillRect(rnd() * cv.width, rnd() * cv.height, 3, 3); }
    // grid + roads
    c.strokeStyle = 'rgba(90,70,40,.18)'; c.lineWidth = 1;
    for (let x = 0; x < cv.width; x += 75) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, cv.height); c.stroke(); }
    for (let y = 0; y < cv.height; y += 75) { c.beginPath(); c.moveTo(0, y); c.lineTo(cv.width, y); c.stroke(); }
    c.strokeStyle = 'rgba(150,60,40,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { c.beginPath(); let x = rnd() * cv.width, y = rnd() * cv.height; c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (rnd() - .5) * 160; y += (rnd() - .5) * 160; c.lineTo(x, y); } c.stroke(); }
    // vignette
    const g = c.createRadialGradient(cv.width / 2, cv.height / 2, 200, cv.width / 2, cv.height / 2, 900);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,40,20,.45)');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    this.map.appendChild(cv);
    // small place names
    [['Northport', 400, 520], ['Ellis Bay', 1080, 1240], ['Cardin', 300, 1800], ['Vale', 1150, 480]].forEach(([n, x, y]) =>
      this.map.appendChild(el('div', `position:absolute;left:${x}px;top:${y}px;font:italic 34px Georgia,serif;color:rgba(70,50,30,.75);letter-spacing:.08em`, n)));
    const cssv = n => getComputedStyle(document.getElementById('stage')).getPropertyValue(n).trim();
    const route = `color-mix(in srgb, ${cssv('--accent') || '#c0281e'} 85%, #000)`;
    const A = [560, 760], B = [1040, 1500];
    const d = `M${A[0]} ${A[1]} C ${A[0] + 380} ${A[1] + 120}, ${B[0] - 420} ${B[1] - 380}, ${B[0]} ${B[1]}`;
    const sv = el('div', 'position:absolute;inset:0');
    sv.innerHTML = `<svg width="${Wd}" height="${Ht}" style="position:absolute;inset:0">
      <path d="${d}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="14" stroke-linecap="round" transform="translate(4 6)" pathLength="1" stroke-dasharray="1 1"/>
      <path d="${d}" fill="none" style="stroke:${route}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <circle cx="${A[0]}" cy="${A[1]}" r="20" fill="#fff" style="stroke:${route}" stroke-width="8"/></svg>`;
    this.map.appendChild(sv);
    this.route = [...sv.querySelectorAll('path')];
    const tag = (txt, [x, y], big) => {
      if (!txt) return null;   // no place label given → no tag
      const e = el('div', `position:absolute;left:${x}px;top:${y}px;transform-origin:0 100%`,
        `<div style="position:absolute;left:-26px;top:-70px;width:52px;height:70px">
           <svg width="52" height="70" viewBox="0 0 52 70"><path d="M26 68 C26 68 2 40 2 25 A24 24 0 0 1 50 25 C50 40 26 68 26 68Z" style="fill:${route}" stroke="#fff" stroke-width="4"/><circle cx="26" cy="25" r="9" fill="#fff"/></svg></div>
         <div style="position:absolute;${big ? 'right:20px' : 'left:40px'};top:${big ? -150 : -120}px;white-space:nowrap;padding:14px 30px;background:#fffaf0;border:4px solid #2b2016;border-radius:12px;
           font:800 ${big ? 66 : 48}px var(--font-body);color:#2b2016;box-shadow:6px 6px 0 #2b2016">${txt}</div>`);
      this.map.appendChild(e); return e;
    };
    this.ta = tag(P.from, A, false);
    this.tb = tag(P.to, B, true);
    ctx.L.back.appendChild(this.map);
    this.A = A; this.B = B;
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    this.map.style.opacity = Math.min(pin, out);
    const draw = ease.inOut(enter(t, .5, Math.max(1, ctx.d - 1.6)));
    for (const p of this.route) p.style.strokeDashoffset = 1 - draw;
    // camera drifts from start point toward the destination
    const m = ease.inOut(clamp(t / ctx.d));
    const cx = lerp(this.A[0] + 120, this.B[0] - 80, m), cy = lerp(this.A[1] + 150, this.B[1] - 150, m);
    const z = lerp(1.05, 1.15, m);
    this.map.style.transformOrigin = '0 0';
    this.map.style.transform = `translate(${540 - cx * z}px,${820 - cy * z}px) scale(${z})`;
    const qa = enter(t, .2, .35), qb = enter(t, .5 + Math.max(1, ctx.d - 1.6) - .1, .4);
    if (this.ta) { this.ta.style.transform = `scale(${ease.pop(qa)})`; this.ta.style.opacity = qa > 0 ? 1 : 0; }
    if (this.tb) { this.tb.style.transform = `scale(${ease.pop(qb)})`; this.tb.style.opacity = qb > 0 ? 1 : 0; }
  },
};
