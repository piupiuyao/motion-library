// 纸片展开图形 · 素材：Ali Abdaal 式剪纸拼贴：一个词由「勒索信」式的纸片字母拼成（每个字母不同纸、不同字体、歪歪的毛边），
// 一张张翻下来；旁边一个剪纸信封一步步展开：盖子翻开、信纸升起、对话泡弹出。
TEMPLATES.c31 = {
  setup(ctx) {
    const P = ctx.params;
    const word = (P.text || 'REPLY').toUpperCase();
    let sd = 17;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const jag = (n = 5) => {          // ragged scissor-cut rectangle
      const p = [];
      for (let i = 0; i < n; i++) p.push(`${(i / n * 100 + rnd() * 6).toFixed(1)}% ${(rnd() * 7).toFixed(1)}%`);
      for (let i = 0; i < n; i++) p.push(`${(100 - rnd() * 7).toFixed(1)}% ${(i / n * 100 + rnd() * 6).toFixed(1)}%`);
      for (let i = 0; i < n; i++) p.push(`${(100 - i / n * 100 - rnd() * 6).toFixed(1)}% ${(100 - rnd() * 7).toFixed(1)}%`);
      for (let i = 0; i < n; i++) p.push(`${(rnd() * 7).toFixed(1)}% ${(100 - i / n * 100 - rnd() * 6).toFixed(1)}%`);
      return `polygon(${p.join(',')})`;
    };
    const papers = [['#fbfaf5', '#111'], ['#111', '#fff'], ['#ffd31a', '#111'], ['#e3342f', '#fff'], ['#f1e4c6', '#2a2a2a'], ['#2f6fe0', '#fff'], ['#fbfaf5', '#e3342f']];
    const fonts = ["900 150px Impact,'Arial Narrow',sans-serif", "700 160px Georgia,serif", "700 150px 'Courier New',monospace", "800 150px 'Avenir Next',sans-serif",
      "700 150px 'American Typewriter',serif", "italic 700 160px Didot,'Times New Roman',serif", "700 150px 'Marker Felt',cursive"];
    this.row = el('div', 'position:absolute;left:0;right:0;top:170px;display:flex;justify-content:center;align-items:center;gap:6px;perspective:900px');
    const wpx = Math.min(180, 960 / word.length);
    this.letters = [...word].map((ch, k) => {
      const [bg, ink] = papers[(k * 3 + 1) % papers.length];
      const h = 190 + Math.round(rnd() * 40);
      const wrap = el('div', `filter:drop-shadow(0 8px 6px rgba(0,0,0,.35));transform-origin:50% 0%`);
      const c = el('div', `width:${wpx}px;height:${h}px;background:${bg};clip-path:${jag()};display:flex;align-items:center;justify-content:center;
        font:${fonts[(k * 2 + 3) % fonts.length]};font-size:${Math.round(wpx * .85)}px;line-height:1;color:${ink};
        background-image:linear-gradient(170deg, rgba(255,255,255,.12), transparent 50%, rgba(0,0,0,.08))`, ch);
      wrap.appendChild(c);
      this.row.appendChild(wrap);
      return { e: wrap, rot: (rnd() - .5) * 14, dy: (rnd() - .5) * 30 };
    });
    ctx.L.front.appendChild(this.row);
    // paper-cut envelope on the free side of the frame
    const fx = ctx.focus[0] * 1080, left = fx > 540 ? 40 : 640;
    this.art = el('div', `position:absolute;left:${left}px;top:640px;width:400px;height:560px;perspective:1100px`);
    const kraft = '#c9a46a', kraft2 = '#b48b50';
    this.paper = el('div', `position:absolute;left:50px;top:300px;width:300px;height:250px;background:#fbfaf5;clip-path:${jag(4)};
      background-image:repeating-linear-gradient(0deg, transparent 0 34px, rgba(60,110,200,.35) 34px 37px);padding:0`);
    this.paper.innerHTML = `<div style="position:absolute;left:30px;top:26px;font:700 40px 'Marker Felt',cursive;color:#e3342f">Re:</div>`;
    this.body = el('div', `position:absolute;left:0;top:330px;width:400px;height:230px;background:${kraft};clip-path:${jag(6)};
      box-shadow:inset 0 0 0 1000px rgba(0,0,0,0)`,
      `<div style="position:absolute;inset:0;background:linear-gradient(155deg, transparent 49.5%, ${kraft2} 50%, transparent 51%), linear-gradient(25deg, transparent 49.5%, ${kraft2} 50%, transparent 51%)"></div>`);
    this.flap = el('div', `position:absolute;left:0;top:330px;width:400px;height:170px;transform-origin:50% 0%;transform-style:preserve-3d`,
      `<div style="position:absolute;inset:0;background:${kraft2};clip-path:polygon(0 0,100% 0,52% 100%,48% 100%);backface-visibility:hidden"></div>
       <div style="position:absolute;inset:0;background:#a37b42;clip-path:polygon(0 0,100% 0,52% 100%,48% 100%);transform:rotateX(180deg);backface-visibility:hidden"></div>`);
    this.bubble = el('div', `position:absolute;left:150px;top:30px;width:240px;height:170px;filter:drop-shadow(0 8px 6px rgba(0,0,0,.35))`,
      `<div style="position:absolute;inset:0;background:#ffd31a;clip-path:${jag(4)}"></div>
       <div style="position:absolute;left:30px;bottom:-34px;width:60px;height:50px;background:#ffd31a;clip-path:polygon(0 0,100% 0,10% 100%)"></div>
       <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:16px">${[0, 1, 2].map(() => '<i style="display:block;width:34px;height:34px;border-radius:50%;background:#111"></i>').join('')}</div>`);
    this.art.append(this.paper, this.body, this.flap, this.bubble);
    ctx.L.front.appendChild(this.art);
  },
  frame(ctx) {
    const t = ctx.t, out = leave(ctx, .3);
    this.letters.forEach(({ e, rot, dy }, k) => {
      const q = enter(t, .1 + k * .13, .45);
      // each scrap flips down like a folded card opening, with a little overshoot
      e.style.transform = `translateY(${dy}px) rotateX(${lerp(-100, 0, ease.back(q))}deg) rotate(${rot * ease.out(q)}deg)`;
      e.style.opacity = Math.min(q > 0 ? 1 : 0, out);
    });
    // envelope: body pops in, flap opens, the letter slides up, the bubble unfolds
    const a = enter(t, .35, .35), b = enter(t, .7, .45), c = enter(t, 1.05, .45), d = enter(t, 1.45, .4);
    this.body.style.transform = `scale(${ease.pop(a)})`; this.body.style.opacity = a > 0 ? out : 0;
    this.flap.style.transform = `scale(${ease.pop(a)}) rotateX(${lerp(0, 175, ease.back(b))}deg)`; this.flap.style.opacity = a > 0 ? out : 0;
    this.paper.style.transform = `translateY(${lerp(30, -150, ease.back(c))}px) rotate(${lerp(0, -5, c)}deg)`;
    this.paper.style.opacity = c > 0 ? out : 0;
    this.bubble.style.transformOrigin = '20% 100%';
    this.bubble.style.transform = `rotateY(${lerp(-90, 0, ease.back(d))}deg) rotate(4deg)`;
    this.bubble.style.opacity = d > 0 ? out : 0;
    this.art.style.transform = `translateY(${Math.sin(t * 1.8) * 6}px) rotate(${Math.sin(t * 1.2) * 1.2}deg)`;
  },
};
