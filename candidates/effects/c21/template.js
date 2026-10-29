// 玻璃卡绕身 · 素材：一张半透明发光的紫色玻璃卡（标题 + 往上跳的数字 + 淡淡的大图标）绕着人转一圈：
// 从侧面进来，经过头后面时被人挡住，再从胸前绕回来，停在头旁边。Kallaway 风格。
TEMPLATES.c21 = {
  setup(ctx) {
    const P = ctx.params;
    this.num = P.number ?? 12453;
    const col = P.color || '#8b5cff';
    const icon = P.icon && !/^(eye|mail|people)$/.test(P.icon)
      ? `<div style="font-size:150px;line-height:1;opacity:.45">${P.icon}</div>`
      : ({
        eye: '<path d="M8 60 Q60 8 112 60 Q60 112 8 60Z"/><circle cx="60" cy="60" r="20"/>',
        people: '<circle cx="42" cy="42" r="18"/><path d="M12 100 Q12 66 42 66 Q72 66 72 100Z"/><circle cx="84" cy="36" r="15"/><path d="M78 60 Q108 58 110 92 L80 92"/>',
        mail: '<rect x="10" y="24" width="100" height="72" rx="12"/><path d="M14 30 L60 66 L106 30" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="8"/>',
      }[P.icon || 'mail'] || '').replace(/^(.+)$/, '<svg width="170" height="170" viewBox="0 0 120 120" fill="rgba(215,195,255,.42)">$1</svg>');
    this.card = el('div', `position:absolute;left:0;top:0;width:500px;height:280px;padding:34px 40px;border-radius:30px;box-sizing:border-box;overflow:hidden;
      background:linear-gradient(135deg, color-mix(in srgb, ${col} 72%, transparent), color-mix(in srgb, ${col} 38%, rgba(30,10,80,.3)));
      border:3px solid color-mix(in srgb, ${col} 45%, #fff);
      box-shadow:0 0 50px color-mix(in srgb, ${col} 75%, transparent), inset 0 0 40px rgba(255,255,255,.14), 0 30px 60px rgba(0,0,0,.35);
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;font-family:var(--font-body)`);
    this.card.innerHTML = `
      <div style="position:absolute;right:22px;top:50%;margin-top:-85px">${icon}</div>
      <div style="position:absolute;inset:0;background:linear-gradient(115deg, rgba(255,255,255,.28), transparent 38%)"></div>
      <div style="position:relative;font:600 44px var(--font-body);opacity:.95">${P.label || 'Unread messages'}</div>
      <div style="position:relative;display:flex;align-items:baseline;gap:14px;margin-top:22px">
        <span class="n" style="font:800 96px/1 var(--font-body);letter-spacing:-.02em;text-shadow:0 0 26px color-mix(in srgb, ${col} 90%, #fff)">0</span>
        <span style="font:600 34px var(--font-body);opacity:.85">${P.unit || ''}</span></div>
      <div style="position:relative;margin-top:18px;font:700 32px var(--font-body);color:#d9ccff">${P.delta || ''}</div>`;
    this.n = this.card.querySelector('.n');
    this.R = P.radius || 330;
    this.fallback = [ctx.focus[0] * 1080, ctx.focus[1] * 1920 - 300];
    ctx.L.front.appendChild(this.card);
  },
  // top of the head from the cut-out (sampled), mapped through the jump-cut zoom
  head(ctx) {
    const c = ctx.personCv.getContext('2d', { willReadFrequently: true });
    const d = c.getImageData(0, 0, 1080, 1100).data;
    let top = -1;
    for (let y = 0; y < 1100 && top < 0; y += 6)
      for (let x = 200; x < 880; x += 10) if (d[(y * 1080 + x) * 4 + 3] > 140) { top = y; break; }
    if (top < 0) return this.fallback;
    let sx = 0, n = 0;
    const yb = Math.min(1099, top + 120);
    for (let x = 100; x < 980; x += 6) if (d[(yb * 1080 + x) * 4 + 3] > 140) { sx += x; n++; }
    const z = ctx.seg.zoom || 1;
    return [540 + ((n ? sx / n : 540) - 540) * z, 960 + (top - 960) * z];
  },
  frame(ctx) {
    const t = ctx.t, P = ctx.params;
    const [hx, hy] = this.head(ctx);
    // one turn: enter at the right side, pass behind the head, around the left, across the chest, settle front-right
    const dur = Math.max(2.2, ctx.d * .62);
    const u = ease.inOut(clamp((t - .1) / dur));
    const th = Math.PI * .5 + u * Math.PI * 1.85;
    const z = Math.cos(th);                               // 1 = nearest the camera, -1 = behind the person
    const x = hx + this.R * Math.sin(th);
    const y = hy + 300 + 230 * z;                         // tilted ring: far side at the forehead, near side at the chest
    const layer = z < 0 ? ctx.L.back : ctx.L.front;
    if (this.card.parentNode !== layer) layer.appendChild(this.card);
    const s = .62 + .4 * (z + 1) / 2;
    const pin = ease.out(enter(t, 0, .35));
    this.card.style.transform = `translate(${x - 250}px,${y - 140}px) perspective(1100px) rotateY(${-Math.sin(th) * 38}deg) rotateX(${8 * z}deg) scale(${s * lerp(.4, 1, pin)})`;
    this.card.style.opacity = Math.min(pin, leave(ctx, .3)) * (z < 0 ? lerp(1, .8, -z) : 1);
    this.card.style.filter = z < 0 ? `brightness(${lerp(1, .75, -z)})` : '';
    const v = Math.round(this.num * ease.out(clamp((t - .2) / (dur + .4))));
    this.n.textContent = (P.prefix || '') + v.toLocaleString('en-US') + (P.suffix || '');
  },
};
