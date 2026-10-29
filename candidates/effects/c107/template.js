// 跟踪模糊打码 · 镜头特效：画面里一块区域（这里是聊天截图上的名字和头像）被圆角模糊框盖住，从清楚变模糊，框跟着目标一起移动
TEMPLATES.c107 = {
  setup(ctx) {
    const P = ctx.params;
    this.amount = P.blur || 18;
    this.t0 = P.start ?? .7;
    this.card = el('div', `position:absolute;left:110px;top:${P.y || 1010}px;width:860px;padding:30px 34px 36px;box-sizing:border-box;background:#fff;
      border-radius:36px;box-shadow:0 26px 60px rgba(0,0,0,.4);transform-origin:50% 50%`);
    this.card.innerHTML = `<div style="display:flex;align-items:center;gap:22px;margin-bottom:22px">
        <div style="width:96px;height:96px;border-radius:50%;flex:none;background:linear-gradient(135deg,#7f8cff,#c36bff);display:flex;align-items:center;
          justify-content:center;font:800 46px var(--font-body);color:#fff">${(P.name || 'Jessica Moreno')[0]}</div>
        <div><div style="font:800 46px var(--font-body);color:#111">${P.name || 'Jessica Moreno'}</div>
          <div style="font:500 30px var(--font-body);color:#20b050">online</div></div>
        <div style="margin-left:auto;font:500 30px var(--font-body);color:#999">11:42 PM</div></div>
      <div style="background:#eef0f4;border-radius:10px 34px 34px 34px;padding:24px 30px;font:500 40px/1.3 var(--font-body);color:#222">${P.text ||
        'hey… I know it’s late but I really need to talk about what happened today 😞'}</div>`;
    // the blur box: a small rounded rect over the name + avatar, child of the card so it tracks it
    this.box = el('div', `position:absolute;left:20px;top:18px;width:${P.box_w || 540}px;height:120px;border-radius:26px;background:rgba(255,255,255,.08)`);
    this.card.appendChild(this.box);
    ctx.L.front.appendChild(this.card);
  },
  frame(ctx) {
    const t = ctx.t, p = enter(t, 0, .45);
    // the target drifts and tilts (stands in for a moving object); the box rides along with it
    const x = Math.sin(t * 1.4) * 34, y = Math.cos(t * 1.1) * 26 + lerp(220, 0, ease.out(p));
    this.card.style.transform = `translate(${x}px, ${y}px) rotate(${Math.sin(t * 1.2) * 3.5 - 1}deg)`;
    this.card.style.opacity = Math.min(clamp(p * 3), leave(ctx));
    const b = ease.inOut(enter(t, this.t0, .5)) * this.amount;
    this.box.style.backdropFilter = this.box.style.webkitBackdropFilter = `blur(${b.toFixed(1)}px)`;
  },
};
