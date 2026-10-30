// 搜索框打字 · 素材：画面虚化，一个 Google 样式的搜索框出现，光标一个字一个字打出问题，接着出联想词
TEMPLATES.c16 = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    if (!P.query) { this.off = true; return; }   // 必填: no query → render nothing
    this.q = P.query;
    this.sugs = P.suggestions || [];
    this.dim = el('div', 'position:absolute;inset:0;background:rgba(255,255,255,.18)');
    ctx.L.back.appendChild(this.dim);
    this.wrap = el('div', `position:absolute;left:60px;right:60px;top:560px;font-family:Arial,'Helvetica Neue',sans-serif`);
    const logo = ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'].map((c, j) => `<span style="color:${c}">${'Google'[j]}</span>`).join('');
    this.logo = el('div', 'text-align:center;font:500 150px/1 "Product Sans",Arial,sans-serif;letter-spacing:-4px;margin-bottom:46px;text-shadow:0 4px 20px rgba(255,255,255,.6)', logo);
    this.box = el('div', `background:#fff;border-radius:60px;box-shadow:0 14px 40px rgba(0,0,0,.3);overflow:hidden`);
    this.bar = el('div', 'display:flex;align-items:center;gap:26px;height:120px;padding:0 40px;font-size:44px;color:#202124');
    this.bar.innerHTML = `<svg width="46" height="46" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" stroke="#9aa0a6" stroke-width="2.4" fill="none"/><path d="m15 15 6 6" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/></svg>
      <div style="flex:1;white-space:nowrap;overflow:hidden"><span class="tx"></span><span class="cur" style="display:inline-block;width:4px;height:52px;background:#1a73e8;vertical-align:-10px;margin-left:3px"></span></div>
      <svg width="40" height="52" viewBox="0 0 24 32"><rect x="7" y="2" width="10" height="18" rx="5" fill="#4285f4"/><path d="M3 15a9 9 0 0 0 18 0" stroke="#34a853" stroke-width="2.6" fill="none"/><path d="M12 24v6" stroke="#fbbc05" stroke-width="2.6"/></svg>`;
    this.tx = this.bar.querySelector('.tx'); this.cur = this.bar.querySelector('.cur');
    this.list = el('div', 'border-top:1px solid #e8eaed');
    this.rows = this.sugs.map(s => {
      const r = el('div', 'display:flex;align-items:center;gap:26px;height:96px;padding:0 40px;font-size:40px;color:#202124',
        `<svg width="40" height="40" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" stroke="#9aa0a6" stroke-width="2.4" fill="none"/><path d="m15 15 6 6" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/></svg>
         <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.startsWith(this.q) ? this.q + '<b>' + s.slice(this.q.length) + '</b>' : s}</span>`);
      this.list.appendChild(r); return r;
    });
    this.box.append(this.bar, this.list);
    this.wrap.append(this.logo, this.box);
    ctx.L.front.appendChild(this.wrap);
    this.typeEnd = Math.min(ctx.d * .6, .5 + this.q.length * .055);
  },
  frame(ctx) {
    if (this.off) return;
    const t = ctx.t, out = leave(ctx, .3);
    const b = ease.out(enter(t, 0, .4));
    ctx.base.style.filter = `blur(${b * 22}px)`;
    ctx.base.style.transform = `scale(${(ctx.seg.zoom || 1) * 1.06})`;
    if (out < 1) ctx.base.style.filter = `blur(${b * 22 * out}px)`;
    this.dim.style.opacity = b * out;
    const pin = enter(t, .1, .45);
    this.wrap.style.opacity = Math.min(clamp(pin * 2), out);
    this.wrap.style.transform = `translateY(${lerp(60, 0, ease.back(pin))}px) scale(${lerp(.9, 1, ease.out(pin))})`;
    const n = Math.floor(this.q.length * clamp((t - .5) / (this.typeEnd - .5)));
    this.tx.textContent = this.q.slice(0, Math.max(0, n));
    this.cur.style.opacity = (n < this.q.length || Math.floor(t * 2.5) % 2 === 0) ? 1 : 0;
    this.rows.forEach((r, j) => {
      const q = enter(t, this.typeEnd + .1 + j * .12, .25);
      r.style.display = q > 0 ? 'flex' : 'none';
      r.style.opacity = q;
    });
  },
};
