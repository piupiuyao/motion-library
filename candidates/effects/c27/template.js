// 复古电视框 · 素材：黑白做旧画面：一台老式显像管电视立在亮白烟雾前，屏幕里放截图/视频（黑白、扫描线、闪烁），
// 电视下面压一行粗大白字，整个画面慢慢推近。
TEMPLATES.c27 = {
  setup(ctx) {
    const P = ctx.params;
    // film grain tile
    const nc = el('canvas'); nc.width = nc.height = 256;
    const c = nc.getContext('2d'), im = c.createImageData(256, 256);
    let s = 5;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s % 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 34; }
    c.putImageData(im, 0, 0);
    this.grain = nc.toDataURL();
    this.scene = el('div', 'position:absolute;inset:0;transform-origin:50% 45%');
    // bright smoke behind the set, dark floor and corners
    this.scene.appendChild(el('div', `position:absolute;inset:0;background:
      radial-gradient(ellipse 75% 40% at 50% 40%, #ffffff, rgba(240,240,240,.9) 40%, rgba(140,140,140,.45) 72%, transparent 100%),
      linear-gradient(#2a2a2a, #111 60%, #050505)`));
    this.smoke = [0, 1, 2, 3, 4, 5].map(k => {
      const e = el('div', `position:absolute;left:${[60, 560, 180, 640, 20, 420][k]}px;top:${[420, 380, 700, 650, 560, 520][k]}px;width:${520 + k * 40}px;height:${380 + k * 30}px;border-radius:50%;
        background:radial-gradient(ellipse, rgba(255,255,255,${k % 2 ? .55 : .4}), transparent 68%)`);
      this.scene.appendChild(e); return e;
    });
    this.scene.appendChild(el('div', 'position:absolute;left:0;right:0;top:1060px;bottom:0;background:linear-gradient(transparent, rgba(0,0,0,.85) 30%, #000)'));
    // the CRT set: dark plastic box, rounded screen, side panel with knobs, rabbit ears
    this.tv = el('div', 'position:absolute;left:150px;top:470px;width:780px;height:640px');
    this.tv.innerHTML = `
      <div style="position:absolute;left:300px;top:-170px;width:180px;height:180px">
        <div style="position:absolute;left:86px;bottom:0;width:7px;height:210px;background:linear-gradient(90deg,#888,#222);transform-origin:50% 100%;transform:rotate(-28deg)"></div>
        <div style="position:absolute;left:86px;bottom:0;width:7px;height:190px;background:linear-gradient(90deg,#888,#222);transform-origin:50% 100%;transform:rotate(24deg)"></div>
        <div style="position:absolute;left:50px;bottom:-14px;width:80px;height:34px;border-radius:40px 40px 6px 6px;background:#1c1c1c"></div></div>
      <div style="position:absolute;inset:0;border-radius:46px;background:linear-gradient(170deg,#3c3c3c,#1d1d1d 45%,#0c0c0c);
        box-shadow:0 50px 80px rgba(0,0,0,.75), inset 0 4px 0 rgba(255,255,255,.18), inset 0 -12px 20px rgba(0,0,0,.6)"></div>
      <div style="position:absolute;left:36px;top:40px;width:560px;height:520px;border-radius:64px/56px;background:#060606;box-shadow:inset 0 0 0 10px #262626, inset 0 0 30px #000"></div>
      <div class="scr" style="position:absolute;left:60px;top:64px;width:512px;height:472px;border-radius:56px/48px;overflow:hidden;background:#111">
        <img class="im" style="position:absolute;inset:-4%;width:108%;height:108%;object-fit:cover;filter:grayscale(1) brightness(1.9) contrast(1.25)">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.32) 0 2px, transparent 2px 5px)"></div>
        <div class="roll" style="position:absolute;left:0;right:0;height:90px;background:linear-gradient(transparent, rgba(255,255,255,.16), transparent)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 35% 25%, rgba(255,255,255,.28), transparent 40%), radial-gradient(ellipse, transparent 50%, rgba(0,0,0,.75))"></div></div>
      <div style="position:absolute;left:622px;top:60px;width:130px;display:flex;flex-direction:column;align-items:center;gap:30px">
        ${[0, 1].map(k => `<div style="width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9a9a9a,#2a2a2a 70%);box-shadow:0 6px 10px rgba(0,0,0,.6);position:relative">
          <div style="position:absolute;left:44px;top:6px;width:8px;height:40px;background:#0c0c0c;border-radius:4px;transform-origin:4px 42px;transform:rotate(${k ? 70 : -40}deg)"></div></div>`).join('')}
        <div style="width:110px;height:190px;border-radius:10px;background:repeating-linear-gradient(0deg,#0e0e0e 0 7px,#2b2b2b 7px 14px)"></div></div>
      <div style="position:absolute;left:90px;bottom:-34px;width:70px;height:40px;background:#0e0e0e;border-radius:0 0 10px 10px"></div>
      <div style="position:absolute;right:90px;bottom:-34px;width:70px;height:40px;background:#0e0e0e;border-radius:0 0 10px 10px"></div>`;
    this.scene.appendChild(this.tv);
    this.im = this.tv.querySelector('.im'); this.roll = this.tv.querySelector('.roll');
    this.media = P.media || { frames: 'assets/broll_inbox', fps: 30, count: 165 };
    this.title = el('div', `position:absolute;left:30px;right:30px;top:${P.top || 1130}px;text-align:center;font:900 ${P.size || 150}px/.9 Impact,'Avenir Next Condensed','Arial Narrow',sans-serif;
      color:#fff;letter-spacing:.01em;text-transform:uppercase;text-shadow:0 8px 30px rgba(0,0,0,.8)`, P.text || 'MY INBOX');
    this.scene.appendChild(this.title);
    this.grainEl = el('div', `position:absolute;inset:-60px;background:url(${this.grain});opacity:.9`);
    this.vig = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,.7) 100%)');
    ctx.L.back.append(this.scene, this.vig, this.grainEl);
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3), pin = enter(t, 0, .3);
    const o = Math.min(pin, out);
    this.scene.style.opacity = this.vig.style.opacity = o;
    this.grainEl.style.opacity = .9 * o;
    // grain jumps every frame (seeded by frame number), slow push-in on the whole set
    const f = Math.round(t * 30);
    this.grainEl.style.transform = `translate(${(f * 37) % 60 - 30}px,${(f * 61) % 60 - 30}px)`;
    this.scene.style.transform = `scale(${lerp(1, 1.14, ease.inOut(clamp(t / ctx.d)))})`;
    this.smoke.forEach((e, k) => { e.style.transform = `translate(${Math.sin(t * .6 + k) * 40}px,${Math.cos(t * .5 + k * 2) * 25}px) scale(${1 + .08 * Math.sin(t + k)})`; });
    setImg(this.im, mediaSrc(this.media, t));
    this.roll.style.top = (((t * 240) % 620) - 100) + 'px';
    this.im.style.opacity = .85 + .15 * Math.sin(t * 53) * Math.sin(t * 17);
    this.tv.style.transform = `translateY(${lerp(80, 0, ease.out(enter(t, 0, .5)))}px)`;
    const q = enter(t, .3, .35);
    this.title.style.opacity = q;
    this.title.style.transform = `scale(${lerp(1.25, 1, ease.out(q))})`;
  },
};
