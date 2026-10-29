// 复古电视框 · 素材：一段截图/视频装进老式显像管电视里播放，背景做旧，电视上压大字，慢慢推近
TEMPLATES.c27 = {
  setup(ctx) {
    const P = ctx.params;
    this.bgc = el('div', `position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(40,20,5,.75) 100%),
      repeating-linear-gradient(90deg, rgba(90,60,30,.06) 0 3px, transparent 3px 9px), ${pattern('paper')}`);
    this.bgc.appendChild(el('div', 'position:absolute;inset:0;background:rgba(170,120,60,.32);mix-blend-mode:multiply'));
    ctx.L.back.appendChild(this.bgc);
    this.tv = el('div', `position:absolute;left:90px;top:520px;width:900px;height:780px;transform-origin:50% 50%`);
    this.tv.innerHTML = `
      <div style="position:absolute;left:330px;top:-150px;width:240px;height:160px">
        <div style="position:absolute;left:110px;bottom:0;width:10px;height:180px;background:#333;transform-origin:50% 100%;transform:rotate(-32deg);border-radius:5px"></div>
        <div style="position:absolute;left:110px;bottom:0;width:10px;height:180px;background:#333;transform-origin:50% 100%;transform:rotate(28deg);border-radius:5px"></div></div>
      <div style="position:absolute;inset:0;border-radius:60px;background:linear-gradient(160deg,#9a6a3c,#6b4224 55%,#4a2c17);box-shadow:0 40px 70px rgba(30,15,5,.6), inset 0 6px 0 rgba(255,255,255,.18), inset 0 -10px 20px rgba(0,0,0,.35)"></div>
      <div style="position:absolute;left:44px;top:50px;width:620px;height:560px;border-radius:70px/60px;background:#1a1a1a;box-shadow:inset 0 0 0 14px #2a2a2a, inset 0 0 0 18px #111"></div>
      <div class="scr" style="position:absolute;left:70px;top:76px;width:568px;height:508px;border-radius:60px/52px;overflow:hidden;background:#000">
        <img class="im" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.7) contrast(1.15) sepia(.25)">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 3px, transparent 3px 6px)"></div>
        <div class="roll" style="position:absolute;left:0;right:0;height:120px;background:linear-gradient(transparent, rgba(255,255,255,.14), transparent)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 30%, rgba(255,255,255,.22), transparent 45%), radial-gradient(ellipse, transparent 55%, rgba(0,0,0,.65))"></div></div>
      <div style="position:absolute;left:700px;top:70px;width:160px;display:flex;flex-direction:column;align-items:center;gap:34px">
        ${[0, 1].map(k => `<div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8dcc4,#8a7a60 70%);box-shadow:0 6px 10px rgba(0,0,0,.45);position:relative">
          <div style="position:absolute;left:55px;top:8px;width:10px;height:50px;background:#3a2a1a;border-radius:4px;transform-origin:5px 52px;transform:rotate(${k ? 60 : -30}deg)"></div></div>`).join('')}
        <div style="width:130px;height:150px;border-radius:12px;background:repeating-linear-gradient(0deg,#3a2414 0 8px,#5a3a20 8px 16px)"></div></div>
      <div style="position:absolute;left:120px;bottom:-60px;width:60px;height:70px;background:#3a2414;border-radius:0 0 12px 12px"></div>
      <div style="position:absolute;right:120px;bottom:-60px;width:60px;height:70px;background:#3a2414;border-radius:0 0 12px 12px"></div>`;
    ctx.L.back.appendChild(this.tv);
    this.im = this.tv.querySelector('.im'); this.roll = this.tv.querySelector('.roll');
    this.media = P.media || { frames: 'assets/broll_inbox', fps: 30, count: 165 };
    this.title = el('div', `position:absolute;left:40px;right:40px;top:200px;text-align:center;font-size:${P.size || 170}px;color:#fff3d6;
      -webkit-text-stroke:8px #2a160a;paint-order:stroke fill;text-shadow:0 12px 0 #2a160a;transform:rotate(-3deg)`, P.text || 'MY INBOX');
    this.title.className = 'display';
    ctx.L.front.appendChild(this.title);
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .35);
    this.bgc.style.opacity = Math.min(pin, out);
    setImg(this.im, mediaSrc(this.media, t));
    const zoom = lerp(.92, 1.12, ease.inOut(clamp(t / ctx.d)));
    this.tv.style.opacity = Math.min(pin, out);
    this.tv.style.transform = `translateY(${lerp(200, 0, ease.out(pin))}px) scale(${zoom})`;
    this.roll.style.top = (((t * 260) % 700) - 120) + 'px';
    // tiny flicker on the picture
    this.im.style.opacity = .88 + .12 * Math.sin(t * 53) * Math.sin(t * 17);
    const q = enter(t, .35, .35);
    this.title.style.opacity = Math.min(q, out);
    this.title.style.transform = `rotate(-3deg) scale(${lerp(1.6, 1, ease.out(q)) * lerp(1, 1.06, clamp(t / ctx.d))})`;
  },
};
