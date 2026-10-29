// 人走过显字 · 字体：大字藏在人身后，跟着人身体的轮廓边缘被「带」出来——从人的左右轮廓处向两边擦开，字始终在人后面
// 演示素材里人几乎不横向移动，所以默认用「从人身后向两侧拉出」（mode:"emerge"，擦除边缘从人的实际轮廓开始）；
// 有横向移动的素材可用 mode:"wipe"：擦除边缘跟随人的右侧轮廓从左往右走。
TEMPLATES.c89 = {
  setup(ctx) {
    const P = ctx.params;
    const txt = String(P.text || 'HARDER').toUpperCase();
    this.size = P.size || Math.min(330, Math.floor(980 / (txt.length * .78)));
    this.y = P.y || Math.round(ctx.focus[1] * 1920 - this.size * .45);
    this.word = el('div', `position:absolute;left:0;right:0;top:${this.y}px;text-align:center;font-size:${this.size}px;line-height:1;white-space:nowrap;
      color:${P.color || 'var(--accent)'};-webkit-text-stroke:5px var(--ink);paint-order:stroke fill;text-shadow:0 10px 30px rgba(0,0,0,.35)`, txt);
    this.word.className = 'display';
    ctx.L.back.appendChild(this.word);
    this.t0 = P.t0 != null ? P.t0 : .15;
    this.dur = P.dur || 1.3;
    this.mode = P.mode || 'emerge';
    this.row = Math.round(this.y + this.size * .5);
  },
  // left / right edge of the person on the text's row, read from the cut-out canvas
  edges(ctx) {
    const z = ctx.seg.zoom || 1;
    const yy = Math.round(960 + (this.row - 960) / z);
    const d = ctx.personCv.getContext('2d', { willReadFrequently: true }).getImageData(0, clamp(yy, 0, 1919), 1080, 1).data;
    let l = -1, r = -1;
    for (let x = 0; x < 1080; x++) if (d[x * 4 + 3] > 128) { if (l < 0) l = x; r = x; }
    if (l < 0) return [440, 640];
    return [540 + (l - 540) * z, 540 + (r - 540) * z];
  },
  frame(ctx) {
    const [l, r] = this.edges(ctx);
    const p = ease.inOut(enter(ctx.t, this.t0, this.dur));
    const out = leave(ctx, .3);
    this.word.style.opacity = out;
    const soft = 40;
    let a, b;
    if (this.mode === 'wipe') { a = -soft; b = lerp(l, 1080 + soft, p); }      // reveal trails the body from left to right
    else { a = lerp(l + 30, -soft, p); b = lerp(r - 30, 1080 + soft, p); }      // pulled out from behind both sides of the body
    const pa = a / 10.8, pb = b / 10.8, s = soft / 10.8;
    const m = `linear-gradient(90deg, transparent ${pa - s}%, #000 ${pa}%, #000 ${pb}%, transparent ${pb + s}%)`;
    this.word.style.webkitMaskImage = m; this.word.style.maskImage = m;
    // a slight drift outwards while it comes out, so it feels dragged by the body
    this.word.style.transform = `scale(${lerp(.94, 1, p)})`;
  },
};
