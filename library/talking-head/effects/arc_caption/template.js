// 弧形字托头像 · 字体：纯黑底中间一个硬边圆形头像窗，上方一行大标题；一行小字沿圆窗下半圈外侧弯成笑脸弧，从左往右逐字出现
TEMPLATES.arc_caption = {
  setup(ctx) {
    const P = ctx.params;
    const text = String(P.text || '').trim();
    this.off = !text;                              // 必填: no arc text → render nothing (person stays full screen)
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w㐀-鿿]/g, '');
    const at = a => { const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    ctx.L.bg.style.background = '#000';
    this.D = P.diameter || 400;
    this.c = [540, P.y || 860];
    this.fx = ctx.focus[0] * 1080; this.fy = ctx.focus[1] * 1920 + 70;
    this.r = P.radius || 380;
    this.ring = el('div', `position:absolute;left:${this.c[0] - this.D / 2}px;top:${this.c[1] - this.D / 2}px;width:${this.D}px;height:${this.D}px;border-radius:50%;
      box-shadow:0 0 0 4px rgba(255,255,255,.9)`);
    ctx.L.front.appendChild(this.ring);
    const color = P.color || 'var(--accent)';
    const css = getComputedStyle(document.getElementById('stage'));
    const font = css.getPropertyValue('--font-display').trim() || 'sans-serif';
    if (P.title) {
      this.title = el('div', `position:absolute;left:40px;right:40px;top:${this.c[1] - this.D / 2 - 70}px;transform:translateY(-100%);text-align:center;
        white-space:nowrap;font-size:${String(P.title).length > 12 ? 84 : String(P.title).length > 7 ? 112 : 140}px;color:${color};text-transform:uppercase;letter-spacing:.06em;text-shadow:0 6px 20px rgba(0,0,0,.6)`, P.title);
      this.title.className = 'display';
      ctx.L.front.appendChild(this.title);
    }
    // arc text: measure each character, lay them out along the lower half of a circle outside the window
    const chars = Array.from(P.upper === false ? text : text.toUpperCase());
    const R0 = this.D / 2 + 26;                    // baseline radius (letters' tops face the circle)
    const span = Math.PI * .85;                    // widest arc allowed (~150°)
    let size = P.size || 62;
    const cv = document.createElement('canvas').getContext('2d');
    const track = .12;                             // extra letter spacing (em)
    let widths, total;
    const measure = () => {
      cv.font = `900 ${size}px ${font}`;
      widths = chars.map(ch => cv.measureText(ch).width + size * track);
      total = widths.reduce((a, b) => a + b, 0);
    };
    measure();
    while (total / (R0 + size * .8) > span && size > 30) { size -= 2; measure(); }
    const Rc = R0 + size * .8;                     // radius through letter centres
    let a = Math.PI / 2 + total / Rc / 2;          // start angle (left side), y axis points down
    const tstart = P.at != null ? at(P.at) : null;
    this.t0 = tstart != null ? tstart : .35;
    this.per = (P.type || .8) / chars.length;
    this.chars = chars.map((ch, j) => {
      const da = widths[j] / Rc, mid = a - da / 2;
      a -= da;
      const x = this.c[0] + Math.cos(mid) * Rc, y = this.c[1] + Math.sin(mid) * Rc;
      const e = el('div', `position:absolute;left:0;top:0;font:900 ${size}px ${font};color:${color};white-space:pre;line-height:1;text-shadow:0 3px 10px rgba(0,0,0,.6)`, ch);
      ctx.L.front.appendChild(e);
      return { e, x, y, rot: (mid - Math.PI / 2) * 180 / Math.PI, j };
    });
  },
  frame(ctx) {
    if (this.off) return;
    const z = ctx.seg.zoom || 1;
    const k = ease.out(enter(ctx.t, 0, .25));
    const S1 = this.D / 2 / this.r, S = lerp(z, S1, k);
    const [cx, cy] = this.c, { fx, fy } = this;
    ctx.base.style.transformOrigin = '0 0';
    ctx.base.style.transform = `translate(${lerp(540 - 540 * z, cx - fx * S1, k)}px,${lerp(960 - 960 * z, cy - fy * S1, k)}px) scale(${S})`;
    ctx.base.style.clipPath = `circle(${lerp(1400, this.r, k)}px at ${fx}px ${fy}px)`;
    const out = leave(ctx, .2);
    this.ring.style.opacity = Math.min(clamp((k - .7) * 4), out);
    if (this.title) {
      const q = enter(ctx.t, .1, .4);
      this.title.style.opacity = Math.min(clamp(q * 3), out);
      this.title.style.transform = `translateY(-100%) scale(${lerp(.5, 1, ease.pop(q))})`;
    }
    for (const c of this.chars) {
      const q = enter(ctx.t, this.t0 + c.j * this.per, .16);
      c.e.style.opacity = Math.min(q, out);
      c.e.style.transform = `translate(${c.x}px,${c.y}px) translate(-50%,-50%) rotate(${c.rot}deg) scale(${lerp(1.6, 1, ease.out(q))})`;
    }
  },
};
