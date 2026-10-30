// 文章荧光高亮 · 素材：一张文章/文件截图铺满屏幕慢慢推近，荧光笔扫过其中一句，其余部分变暗
TEMPLATES.c17 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    // highlighted sentence: given, or what she says in this shot; nothing at all → render nothing
    const hlText = P.highlight || ctx.words.map(w => w.w).filter(Boolean).join(' ');
    if (!hlText) { this.off = true; return; }
    // body paragraphs not given → neutral grey placeholder lines (no made-up article text)
    const bars = (n, seed) => Array.from({ length: n }, (_, i) => `<span style="display:block;height:22px;margin:0 0 30px;border-radius:11px;background:#d9d6cc;width:${i === n - 1 ? 40 + (seed * 37 + i * 13) % 35 : 92 + (seed * 7 + i * 5) % 8}%"></span>`).join('');
    const before = P.before || [bars(4, 1), bars(3, 2)];
    const after = P.after || [bars(3, 3)];
    this.page = el('div', `position:absolute;left:50%;top:50%;width:980px;margin-left:-490px;height:1700px;margin-top:-850px;background:#fbfaf6;
      box-shadow:0 30px 80px rgba(0,0,0,.5);padding:90px 74px;box-sizing:border-box;color:#1b1b1b;font-family:Georgia,'Times New Roman',serif;transform-origin:50% 55%`);
    const p = s => `<p class="dimme" style="font-size:40px;line-height:1.55;margin:0 0 34px">${s}</p>`;
    this.page.innerHTML = `<div class="dimme" style="font:700 30px var(--font-body);letter-spacing:.18em;color:#b3261e;margin-bottom:26px">${P.kicker || ''}</div>
      <div class="dimme" style="font-size:84px;line-height:1.05;font-weight:700;margin-bottom:30px">${P.headline || '<span style="display:block;height:64px;width:86%;border-radius:12px;background:#cfcabd"></span>'}</div>
      <div class="dimme" style="font:400 30px var(--font-body);color:#777;border-bottom:2px solid #ddd;padding-bottom:26px;margin-bottom:40px">By Staff Writer · 6 min read</div>
      ${before.map(p).join('')}
      <p style="font-size:40px;line-height:1.55;margin:0 0 34px"><span class="hl" style="background-image:linear-gradient(transparent 12%, ${P.color || 'var(--accent)'} 12%, ${P.color || 'var(--accent)'} 88%, transparent 88%);
        background-repeat:no-repeat;background-size:0% 100%;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 4px">${hlText}</span></p>
      ${after.map(p).join('')}`;
    ctx.L.front.appendChild(this.page);
    this.bgc = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#3a3a40,#121214)');
    ctx.L.back.appendChild(this.bgc);
    this.hl = this.page.querySelector('.hl');
    this.dims = [...this.page.querySelectorAll('.dimme')];
    this.page.querySelectorAll('p:not(:has(.hl))').forEach(e => this.dims.push(e));
    this.t0 = P.at != null ? P.at : Math.min(1.1, ctx.d * .3);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3);
    const pin = ease.out(enter(t, 0, .4));
    this.bgc.style.opacity = Math.min(pin, out);
    this.page.style.opacity = Math.min(pin, out);
    // slow push towards the highlighted sentence
    const hlY = this.hl.offsetTop + this.hl.offsetHeight / 2;
    const zoom = lerp(.95, 1.2, ease.inOut(clamp(t / ctx.d)));
    const dy = (850 - hlY) * clamp((zoom - .95) / .25) * zoom * .7;
    this.page.style.transform = `translateY(${lerp(120, 0, pin) + dy}px) scale(${zoom}) rotate(${lerp(-2, -.6, pin)}deg)`;
    const sw = ease.inOut(enter(t, this.t0, .9));
    this.hl.style.backgroundSize = `${sw * 100}% 100%`;
    const dm = 1 - .72 * ease.out(enter(t, this.t0 + .3, .6));
    for (const e of this.dims) e.style.opacity = dm;
  },
};
