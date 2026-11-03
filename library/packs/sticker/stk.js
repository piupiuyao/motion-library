// Sticker pack shared kit (STK). Loaded once by the pack's effects (sync XHR + indirect eval, like iconFind).
// Every sticker is drawn ONCE into a canvas at setup (die-cut pearl paper + ink); per frame only a CSS transform
// (gentle sway) changes. Hero stickers redraw their ink each frame so the iridescence drifts slowly.
// Deterministic: same id + same t -> same picture.
window.STK = (() => {
  const W = 1080, H = 1920;
  const ROUND = '"PkRound", "Nunito", "Arial Rounded MT Bold", sans-serif';
  const HAND = '"PkHand", "Kalam", cursive';
  const EMO = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  const C = { blue: '#3340d4', deep: '#262ec2', lite: '#6a72f2', line: '#2c39d6', coral: '#f2625a', hand: '#3a46d8' };
  const RAINBOW = ['#b98cff', '#ff8cc6', '#ffad85', '#f2e46a', '#8eeeae', '#7fe0ff', '#93a2ff'];
  const BG = {
    cream: '#f2efe6', lilac: '#e8e6f4', blush: '#f5ebe6', blue: '#2f37c8',
    holo: 'linear-gradient(135deg, #f3c6f1 0%, #c9d3ff 30%, #c4f1ec 55%, #f6f3b8 78%, #ffd2c2 100%)',
  };

  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = (seed >>> 0) || 7; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
  const meas = document.createElement('canvas').getContext('2d');

  // background: flat colour + faint 44px grid (lines darker on light bg, lighter on the blue bg)
  function bg(name) {
    const base = BG[name] || name || BG.cream;
    const line = name === 'blue' ? 'rgba(255,255,255,.07)' : 'rgba(70,70,110,.075)';
    return `repeating-linear-gradient(0deg, transparent 0 43px, ${line} 43px 44.5px), repeating-linear-gradient(90deg, transparent 0 43px, ${line} 43px 44.5px), ${base}`;
  }

  // word time inside a shot: a = word text ("Gmail") or global word index (93); def when missing
  function at(ctx, a, def) {
    if (a == null) return def;
    const n = s => String(s).toLowerCase().replace(/[^\w']/g, '');
    const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => n(w.w) === n(a)) || ctx.words.find(w => n(w.w).startsWith(n(a)));
    return w ? Math.max(0, w.s - .04) : def;
  }

  // ---- layout of one sticker: parts in a row ----
  function parts(spec, S) {
    const out = [];
    if (spec.check) out.push({ type: 'check', w: S * .78 });
    if (spec.num != null) { meas.font = `900 ${S * .72}px ${ROUND}`; out.push({ type: 'num', str: String(spec.num), w: Math.max(S * 1.05, meas.measureText(String(spec.num)).width + S * .5) }); }
    if (spec.q) out.push({ type: 'q', w: S * 1.0 });
    if (spec.emoji) out.push({ type: 'emoji', str: spec.emoji, w: S * 1.08 });
    if (spec.text) {
      const font = spec.kind === 'hand' ? `700 ${S}px ${HAND}` : `900 ${S}px ${ROUND}`;
      meas.font = font;
      out.push({ type: 'text', str: spec.text, font, w: meas.measureText(spec.text).width });
    }
    return out;
  }

  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

  // silhouette of all parts grown by pad (round joins) -> one connected die-cut sheet
  function shape(g, P, S, pad, cx0, cy) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    let x = cx0;
    const xs = [];
    for (const p of P) {
      xs.push(x);
      if (p.type === 'text') {
        g.font = p.font; g.textBaseline = 'middle'; g.lineWidth = pad * 2;
        g.strokeText(p.str, x, cy); g.fillText(p.str, x, cy);
      } else {
        const h = S * 1.08;
        roundRect(g, x - pad, cy - h / 2 - pad, p.w + pad * 2, h + pad * 2, h / 2 + pad); g.fill();
      }
      x += p.w + S * .26;
    }
    // bridge the gaps so the sheet never splits between words
    g.fillRect(cx0, cy - S * .26, x - S * .26 - cx0, S * .52);
    return xs;
  }

  function specks(g, w, h, n, seed, cols, rmax) {
    const r = rng(seed);
    for (let k = 0; k < n; k++) {
      g.globalAlpha = .35 + r() * .65;
      g.fillStyle = cols[Math.floor(r() * cols.length)];
      const s = r() < .12 ? rmax : rmax * (.45 + r() * .4);
      g.fillRect(r() * w, r() * h, s, s);
    }
    g.globalAlpha = 1;
  }

  function rainbow(g, x0, x1, phase) {
    const gr = g.createLinearGradient(x0, 0, x1, 0);
    const n = RAINBOW.length;
    for (let k = 0; k <= 12; k++) {
      const u = k / 12, f = ((u * n * .9 + phase) % n + n) % n, a = Math.floor(f), b = (a + 1) % n;
      gr.addColorStop(u, mix(RAINBOW[a], RAINBOW[b], f - a));
    }
    return gr;
  }
  function mix(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  // ---- make one sticker ----
  // spec: {id, kind: plain|hero|hand|neg|badge, text, emoji, num, check, q, size}
  function make(spec) {
    const kind = spec.kind || 'plain';
    let S = spec.size || { hero: 128, hand: 62, badge: 44, plain: 70, neg: 66 }[kind] || 70;
    // fit the frame: shrink until the sheet is at most maxw wide (default 1000 px)
    const maxw = spec.maxw || 1000;
    for (let k = 0; k < 8; k++) {
      const P0 = parts(spec, S), w0 = P0.reduce((a, p) => a + p.w, 0) + S * .26 * (P0.length - 1) + S * (kind === 'hero' ? .52 : .42);
      if (w0 <= maxw) break;
      S *= Math.max(.7, maxw / w0);
    }
    const pad = S * (kind === 'hero' ? .26 : kind === 'badge' ? .2 : .21);
    const P = parts(spec, S);
    const inner = P.reduce((a, p) => a + p.w, 0) + S * .26 * (P.length - 1);
    const m = pad + S * .45;                       // margin for paper + shadow
    const cw = Math.ceil(inner + m * 2), ch = Math.ceil(S * 1.3 + m * 2);
    const cy = ch / 2 + (kind === 'hand' ? S * .02 : S * .03), cx0 = m;
    const seed = hash(spec.id || spec.text || 'x');

    const mk = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
    // 1. paper silhouette
    const sh = mk(), sg = sh.getContext('2d');
    sg.fillStyle = sg.strokeStyle = '#000';
    const xs = shape(sg, P, S, pad, cx0, cy);
    const paper = mk(), pg = paper.getContext('2d');
    // soft shadow under the sheet
    pg.save(); pg.shadowColor = kind === 'hero' ? 'rgba(40,40,90,.22)' : 'rgba(40,40,90,.17)';
    pg.shadowBlur = S * .28; pg.shadowOffsetY = S * .07; pg.drawImage(sh, 0, 0); pg.restore();
    pg.globalCompositeOperation = 'source-in';
    if (kind === 'hero') {
      // holographic silver sheet
      const gr = pg.createLinearGradient(0, 0, cw, ch);
      ['#c9ccd8', '#e2c9ea', '#c6dfe6', '#dfe3c4', '#cdc8ec', '#d9d3e2'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
      pg.fillStyle = gr; pg.fillRect(0, 0, cw, ch);
    } else {
      // pearl die-cut paper: tinted rim, near-white centre
      const gr = pg.createLinearGradient(0, 0, cw, ch * .6);
      ['#ffd9f1', '#d6f2ff', '#dcfbe4', '#e7defc', '#ffe3ee'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
      pg.fillStyle = gr; pg.fillRect(0, 0, cw, ch);
      pg.globalCompositeOperation = 'source-atop';
      const core = mk(), cg = core.getContext('2d');
      cg.fillStyle = cg.strokeStyle = '#fdfcff';
      shape(cg, P, S, pad * .58, cx0, cy);
      pg.globalAlpha = .93; pg.drawImage(core, 0, 0); pg.globalAlpha = 1;
    }
    pg.globalCompositeOperation = 'source-atop';
    specks(pg, cw, ch, Math.round(cw * ch / (kind === 'hero' ? 55 : 1400)), seed, kind === 'hero' ? ['#ffffff', '#fff6c8', '#d8f4ff', '#ffd8f4'] : ['#ffffff', '#e8dcff'], kind === 'hero' ? 2.2 : 1.6);
    pg.globalCompositeOperation = 'source-over';

    // 2. ink (static for all but hero)
    const ink = mk(), ig = ink.getContext('2d');
    const drawInk = (t = 0) => {
      ig.clearRect(0, 0, cw, ch);
      ig.lineJoin = 'round'; ig.lineCap = 'round'; ig.textBaseline = 'middle';
      P.forEach((p, k) => {
        const x = xs[k];
        if (p.type === 'text') {
          ig.font = p.font;
          if (kind === 'hero') {
            ig.lineWidth = S * .12; ig.strokeStyle = C.line; ig.strokeText(p.str, x, cy);
            ig.fillStyle = rainbow(ig, x, x + p.w, t * .22 + (seed % 7));
            ig.fillText(p.str, x, cy);
          } else {
            let fill;
            if (kind === 'hand') fill = C.hand;
            else if (kind === 'neg') fill = C.coral;
            else { fill = ig.createLinearGradient(x, cy - S * .5, x + p.w, cy + S * .5); fill.addColorStop(0, C.deep); fill.addColorStop(.55, C.blue); fill.addColorStop(1, C.lite); }
            ig.fillStyle = fill; ig.fillText(p.str, x, cy);
            if (kind === 'neg') {  // a hand-drawn strike through the word
              ig.strokeStyle = C.coral; ig.lineWidth = S * .085;
              ig.beginPath(); ig.moveTo(x - S * .12, cy + S * .08); ig.lineTo(x + p.w + S * .12, cy - S * .06); ig.stroke();
            }
          }
        } else if (p.type === 'num') {
          const h = S * 1.08;
          ig.fillStyle = kind === 'hero' ? C.line : C.blue; roundRect(ig, x, cy - h / 2, p.w, h, h / 2); ig.fill();
          ig.fillStyle = '#fff'; ig.font = `900 ${S * .72}px ${ROUND}`; ig.textAlign = 'center';
          ig.fillText(p.str, x + p.w / 2, cy + S * .03); ig.textAlign = 'left';
        } else if (p.type === 'q') {
          ig.fillStyle = C.blue; ig.beginPath(); ig.arc(x + p.w / 2, cy, S * .46, 0, 7); ig.fill();
          ig.fillStyle = '#fff'; ig.font = `900 ${S * .62}px ${ROUND}`; ig.textAlign = 'center';
          ig.fillText('?', x + p.w / 2, cy + S * .03); ig.textAlign = 'left';
        } else if (p.type === 'check') {
          ig.strokeStyle = C.blue; ig.lineWidth = S * .13;
          ig.beginPath(); ig.moveTo(x + S * .06, cy + S * .02); ig.lineTo(x + S * .3, cy + S * .26); ig.lineTo(x + S * .74, cy - S * .3); ig.stroke();
        } else if (p.type === 'emoji') {
          ig.font = `${S * .92}px ${EMO}`; ig.fillText(p.str, x + S * .04, cy + S * .04);
        }
      });
      if (kind === 'hero') {
        // wide soft sheen + glitter that sits on the letters, slowly breathing
        ig.globalCompositeOperation = 'source-atop';
        const u = ((t * .12 + (seed % 100) / 100) % 1.6) - .3;
        const sh2 = ig.createLinearGradient(cw * (u - .25), 0, cw * (u + .25), ch);
        sh2.addColorStop(0, 'rgba(255,255,255,0)'); sh2.addColorStop(.5, 'rgba(255,255,255,.38)'); sh2.addColorStop(1, 'rgba(255,255,255,0)');
        ig.fillStyle = sh2; ig.fillRect(0, 0, cw, ch);
        const r = rng(seed ^ 0x9e37);
        for (let k = 0, n = Math.round(cw * ch / 70); k < n; k++) {
          const px = r() * cw, py = r() * ch, ph = r() * 6.28, s = r() < .1 ? 2.4 : 1.3;
          ig.globalAlpha = clamp(.25 + .55 * (.5 + .5 * Math.sin(t * 1.3 + ph)));
          ig.fillStyle = '#fff'; ig.fillRect(px, py, s, s);
        }
        ig.globalAlpha = 1; ig.globalCompositeOperation = 'source-over';
      }
    };
    drawInk(0);

    const box = document.createElement('div');
    box.style.cssText = `position:absolute;left:0;top:0;width:${cw}px;height:${ch}px;transform-origin:50% 50%;will-change:transform`;
    paper.style.cssText = ink.style.cssText = 'position:absolute;left:0;top:0';
    box.append(paper, ink);
    const r = rng(seed ^ 0x51ed);
    return {
      el: box, w: cw, h: ch, kind, S, seed, drawInk, hero: kind === 'hero',
      ph: [r() * 6.28, r() * 6.28, r() * 6.28], per: 3.4 + r() * 2.2, base: spec.rot != null ? spec.rot : (r() - .5) * (kind === 'hand' ? 7 : 3),
      cx: 0, cy: 0,
    };
  }

  // icon sticker: pearl rounded tile with the app's official mark (library icons) + optional label sticker below
  function icon(spec) {
    const ic = iconFind(spec.icon);
    if (!ic) return null;
    const size = spec.size || 170;
    const box = document.createElement('div');
    const lab = spec.text ? make({ id: spec.id + ':l', text: spec.text, size: spec.label_size || 50, rot: 0 }) : null;
    const w = Math.max(size + 40, lab ? lab.w : 0), h = size + 40 + (lab ? lab.h - 40 : 0);
    box.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 40%`;
    const tile = el('div', `position:absolute;left:${(w - size) / 2}px;top:20px;width:${size}px;height:${size}px;border-radius:${size * .26}px;box-sizing:border-box;padding:${size * .2}px;
      background:linear-gradient(135deg,#ffffff 0%,#fbf6ff 45%,#effaff 75%,#fff4fa 100%);box-shadow:0 0 0 ${size * .05}px #fff, 0 0 0 ${size * .075}px rgba(214,206,250,.9), 0 ${size * .07}px ${size * .16}px rgba(40,40,90,.2)`,
      iconSvg(ic, ic.kind === 'logo' ? null : ic.hex));
    box.appendChild(tile);
    if (lab) { lab.el.style.left = (w - lab.w) / 2 + 'px'; lab.el.style.top = (size + 20 - 30) + 'px'; box.appendChild(lab.el); }
    const r = rng(hash(spec.id) ^ 0x77);
    return { el: box, w, h, kind: 'icon', S: 60, seed: hash(spec.id), drawInk() {}, hero: false, ph: [r() * 6.28, r() * 6.28, r() * 6.28], per: 3.6 + r() * 2, base: spec.rot != null ? spec.rot : (r() - .5) * 6, cx: 0, cy: 0 };
  }

  function place(s, x, y) { s.cx = x; s.cy = y; s.el.style.left = (x - s.w / 2) + 'px'; s.el.style.top = (y - s.h / 2) + 'px'; }
  function clampX(s, x, m = 34) { return Math.min(W - m - s.w / 2 + s.S * .45, Math.max(m + s.w / 2 - s.S * .45, x)); }

  // entrance (t0 = first visible frame) + continuous gentle sway; out = 0..1 visibility from the caller
  // amp: 1 normal sticker, .55 list row, .2 badge
  function animate(s, t, t0, out = 1, amp = 1) {
    const dur = s.hero ? .34 : .24, p = clamp((t - t0) / dur);
    if (s.hero) s.drawInk(Math.max(0, t));
    const e = s.hero ? ease.back(p) : ease.out(p);
    const w = 2 * Math.PI / s.per, tt = t;
    const rot = s.base * Math.min(1, e) + amp * 1.0 * Math.sin(tt * w + s.ph[0]);
    const dy = amp * 2.4 * Math.sin(tt * w * .83 + s.ph[1]) + (1 - Math.min(1, e)) * 14;
    const ry = amp * 2.2 * Math.sin(tt * w * .67 + s.ph[2]);
    const sc = lerp(s.hero ? .82 : .95, 1, e);
    s.el.style.opacity = Math.min(clamp(p * 2.2), out);
    s.el.style.transform = `translateY(${dy.toFixed(2)}px) perspective(900px) rotateY(${ry.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    return p;
  }

  // ---- person: cutout with white outline on the paper background ----
  function stage(ctx, name) {
    ctx.L.bg.style.background = bg(name || 'cream');
    ctx.base.style.opacity = 0;
    ctx.personCv.style.filter = outline(24, '#fff', false) || 'none';
  }
  // which frame edge the body is cut by (an arm or shoulder touching the side): that edge must stay glued to the frame
  let edgeMemo = null;
  function edge() {
    if (edgeMemo) return edgeMemo;
    const cnt = x => { const d = pctx.getImageData(x, 0, 1, H).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 128) n++; return n; };
    const l = cnt(0), r = cnt(W - 1);
    edgeMemo = l > 40 && l >= r ? 'left' : r > 40 ? 'right' : 'none';
    return edgeMemo;
  }
  // layout: {s: scale, x: wanted head x}; returns the head's position on screen
  const LAY = { center: { s: .86, x: 540 }, left: { s: .72, x: 300 }, big: { s: 1, x: 540 } };
  function personAt(ctx, from, to, k) {
    const A = LAY[from] || LAY.center, B = LAY[to] || A, s = lerp(A.s, B.s, k), want = lerp(A.x, B.x, k);
    const g = edge(), fx = ctx.focus[0] * W, fy = ctx.focus[1] * H;
    let ox, tx = 0;
    if (g === 'left') ox = 0; else if (g === 'right') ox = W;
    else { ox = W / 2; tx = want - W / 2 - (fx - W / 2) * s; }
    ctx.person.style.transformOrigin = `${ox}px ${H}px`;
    ctx.person.style.transform = `translateX(${tx.toFixed(1)}px) scale(${s.toFixed(4)})`;
    // head centre + head top on screen (focus y is ~10% below the head top)
    const hx = ox + (fx - ox) * s + tx, top = H - (H - (fy - H * .1)) * s;
    return { x: hx, top, s };
  }

  // chapter badge "03 context" (top-left, nearly still)
  function badge(spec) {
    if (!spec) return null;
    let num = spec.num, text = spec.text;
    if (typeof spec === 'string') { const m = spec.match(/^\s*(\d+)\s+(.*)$/); num = m ? m[1] : null; text = m ? m[2] : spec; }
    const b = make({ id: 'badge:' + text, kind: 'badge', num, text, size: 44, rot: 0 });
    place(b, 46 + b.w / 2 - b.S * .45, 128);
    return b;
  }

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  return { make, icon, place, clampX, animate, stage, personAt, badge, bg, at, hash, C, W, H, resetEdge() { edgeMemo = null; } };
})();
