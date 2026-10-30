// 评论关键词引导 · 片头片尾：仿社交评论的白色气泡从下方弹到胸前，「Comment 'XX'」关键词高亮，旁边箭头上下跳着指向评论区
TEMPLATES.comment_cta = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.keyword) { this.off = true; return; } // required: not shown without the keyword
    this.y = P.y || 1080;
    this.t0 = P.start ?? .25;
    this.wrap = el('div', `position:absolute;left:90px;right:90px;top:${this.y}px;display:flex;justify-content:center`);
    this.bub = el('div', `position:relative;display:flex;align-items:center;gap:26px;padding:26px 44px 28px 26px;background:#fff;border-radius:46px;
      box-shadow:0 22px 50px rgba(0,0,0,.35);white-space:nowrap;transform-origin:20% 100%`);
    // avatar letter: params.avatar, else first letter of the handle; no handle and no avatar -> no avatar circle
    const av = P.avatar || (P.handle ? String(P.handle).replace(/^@/, '')[0].toUpperCase() : '');
    if (av) this.bub.appendChild(el('div', `width:104px;height:104px;border-radius:50%;flex:none;background:linear-gradient(135deg,var(--accent),var(--accent-2));
      display:flex;align-items:center;justify-content:center;font:900 52px var(--font-body);color:var(--ink)`, av));
    const top = [P.handle, P.sub || 'reply below'].filter(Boolean).join(' · ');
    this.bub.appendChild(el('div', '', `<div style="font:600 32px var(--font-body);color:#8a8a8a;margin-bottom:6px">${top}</div>
      <div style="font:800 62px/1.05 var(--font-body);color:#111">${P.lead || 'Comment'} <span style="background:var(--accent);color:var(--ink);border-radius:12px;padding:0 14px 4px">“${P.keyword}”</span></div>`));
    // speech-bubble tail
    this.bub.appendChild(el('div', 'position:absolute;left:70px;bottom:-26px;width:0;height:0;border-left:0 solid transparent;border-right:40px solid transparent;border-top:34px solid #fff'));
    this.wrap.appendChild(this.bub);
    this.arrow = el('div', `position:absolute;left:${P.arrow_x || 860}px;top:${this.y + 190}px;width:150px;height:190px`);
    this.arrow.innerHTML = `<svg viewBox="0 0 60 75" width="150" height="190"><path d="M30 4 V52 M10 36 L30 58 L50 36" fill="none" stroke="#111" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 4 V52 M10 36 L30 58 L50 36" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    ctx.L.front.append(this.wrap, this.arrow);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, p = enter(t, this.t0, .5), out = leave(ctx, .3);
    this.bub.style.opacity = Math.min(clamp(p * 4), out);
    this.bub.style.transform = `translateY(${lerp(520, 0, ease.out(p))}px) scale(${lerp(.6, 1, ease.pop(p))})`;
    const q = enter(t, this.t0 + .45, .3);
    this.arrow.style.opacity = Math.min(q, out);
    this.arrow.style.transform = `translateY(${Math.abs(Math.sin((t - this.t0) * 6)) * 34}px) scale(${lerp(.3, 1, ease.pop(q))})`;
  },
};
