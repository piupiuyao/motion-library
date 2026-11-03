// 资料卡飞入黑场 · 素材：纯黑底，人缩进左上角细白边圆窗，一张张白色资料/消息卡斜着从右下飞进来叠放；白菜的「真实资料就加资料引入」
TEMPLATES.baicai_doc_cards = {
  setup(ctx) {
    const P = ctx.params, cards = P.cards || [];
    this.off = !cards.length;
    if (this.off) return;
    const norm = s => String(s).toLowerCase().replace(/[^\w]/g, '');
    const at = a => { if (a == null) return null; const w = typeof a === 'number' ? ctx.words.find(w => w.i === a) : ctx.words.find(w => norm(w.w) === norm(a)); return w ? w.s : null; };
    // backdrop: black with the footage as a faint dark texture
    ctx.L.bg.style.background = '#000';
    ctx.base.style.filter = 'blur(30px) brightness(.22) saturate(.4)';
    const rots = [-7, 6, -4, 8], lefts = [150, 50, 160, 70];
    const top0 = P.top || 560, gap = P.gap || 300;
    this.cards = cards.map((c, k) => {
      const card = el('div', `position:absolute;left:${lefts[k % 4]}px;top:${top0 + k * gap}px;width:${P.width || 760}px;box-sizing:border-box;
        padding:30px 36px 34px;background:#fff;border-radius:8px;box-shadow:0 30px 70px rgba(0,0,0,.6);color:#111`);
      const head = el('div', 'display:flex;align-items:center;gap:18px;margin-bottom:18px');
      const tile = c.app ? iconTile(c.app, 64, { app: true }) : null;
      if (tile) head.appendChild(tile);
      head.appendChild(el('div', 'font:600 30px/1.1 var(--font-body);color:#222', c.from || c.app || ''));
      if (c.time) head.appendChild(el('div', 'margin-left:auto;font:400 26px var(--font-body);color:#999', c.time));
      card.appendChild(head);
      if (c.title) card.appendChild(el('div', 'font:600 44px/1.2 var(--font-body);color:#111;letter-spacing:-.005em', c.title));
      if (c.text) card.appendChild(el('div', 'margin-top:12px;font:400 30px/1.45 var(--font-body);color:#666', c.text));
      // faint article lines underneath, like a real screenshot
      const lines = c.lines != null ? c.lines : 2;
      for (let i = 0; i < lines; i++) card.appendChild(el('div', `margin-top:16px;height:14px;border-radius:7px;background:#e9e9e9;width:${[92, 78, 64][i % 3]}%`));
      card.className = 'bc-doc';
      ctx.L.front.appendChild(card);
      const s = at(c.at);
      return { card, s: s != null ? s - .1 : .25 + k * Math.max(.5, (ctx.d * .7) / cards.length), rot: rots[k % 4] };
    });
    // round face window, thin white rim (in front of the cards like the reference)
    if (P.pip !== false) {
      this.pip = el('div', 'position:absolute;left:70px;top:210px;width:320px;height:320px;border-radius:50%;overflow:hidden;border:5px solid rgba(255,255,255,.9);box-shadow:0 14px 40px rgba(0,0,0,.6)');
      this.pipImg = el('img', 'position:absolute;width:1080px;height:1920px;transform-origin:0 0;filter:brightness(.98) contrast(1.06) saturate(.86) sepia(.06)');
      this.pip.appendChild(this.pipImg);
      ctx.L.front.appendChild(this.pip);
    }
  },
  frame(ctx) {
    if (this.off) return;
    const out = leave(ctx, .2);
    for (const it of this.cards) {
      const p = ease.out(enter(ctx.t, it.s, .5));
      it.card.style.opacity = Math.min(clamp(p * 3), out);
      it.card.style.transform = `translate(${lerp(700, 0, p)}px, ${lerp(500, 0, p)}px) rotate(${lerp(it.rot + 24, it.rot, p)}deg)`;
    }
    if (this.pip) {
      setImg(this.pipImg, ctx.baseImg.getAttribute('src'));
      const s = .4, fx = ctx.focus[0] * 1080, fy = ctx.focus[1] * 1920 + 120;
      this.pipImg.style.transform = `translate(${155 - s * fx}px, ${155 - s * fy}px) scale(${s})`;
      const q = ease.out(enter(ctx.t, 0, .4));
      this.pip.style.opacity = Math.min(q, out);
      this.pip.style.transform = `scale(${lerp(.85, 1, q)})`;
    }
  },
};
