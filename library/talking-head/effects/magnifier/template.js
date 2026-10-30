// 放大镜 · 镜头特效：截图卡片出现，一个放大镜图形在上面移动，镜片里显示放大后的细节
TEMPLATES.magnifier = {
  setup(ctx) {
    this.off = false;
    const P = ctx.params;
    this.off = !P.image; if (this.off) return; // material missing: render nothing
    const src = url(P.image);
    const cw = 960, ch = Math.round(cw * (P.ratio || 1));
    this.fixedRatio = !!P.ratio;
    this.card = { x: 60, y: P.top || 250, w: cw, h: ch };
    this.z = P.zoom || 2.3; this.R = P.lens || 175;
    this.path = P.path || [[.28, .38], [.66, .2]];
    this.dim = el('div', 'position:absolute;inset:0;background:rgba(10,10,14,.6);opacity:0');
    const c = this.card;
    this.cardEl = el('div', `position:absolute;left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;border-radius:26px;overflow:hidden;
      box-shadow:0 30px 80px rgba(0,0,0,.45);background:#fff;transform-origin:50% 60%`);
    const img = this.img = el('img', 'width:100%;height:100%;object-fit:cover;display:block');
    img.src = src; pending.push(img.decode().catch(() => {}));
    this.cardEl.appendChild(img);
    // lens: circular window with a zoomed copy of the screenshot inside
    const R = this.R;
    this.lens = el('div', `position:absolute;left:0;top:0;width:${2 * R}px;height:${2 * R}px;opacity:0`);
    this.handle = el('div', `position:absolute;left:${2 * R - 40}px;top:${2 * R - 40}px;width:46px;height:230px;border-radius:23px;
      background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 55%,#000),var(--accent),color-mix(in srgb,var(--accent) 55%,#000));transform-origin:23px 0;transform:rotate(-45deg);box-shadow:0 10px 24px rgba(0,0,0,.4)`);
    this.glass = el('div', `position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#fff;
      border:16px solid #1d1d1f;box-sizing:border-box;box-shadow:0 18px 40px rgba(0,0,0,.45), inset 0 0 0 4px rgba(255,255,255,.6)`);
    this.zimg = el('img', `position:absolute;width:${c.w * this.z}px;height:${c.h * this.z}px;max-width:none`);
    this.zimg.src = src; pending.push(this.zimg.decode().catch(() => {}));
    this.shine = el('div', 'position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), transparent 35%)');
    this.glass.append(this.zimg, this.shine);
    this.lens.append(this.handle, this.glass);
    ctx.L.front.append(this.dim, this.cardEl, this.lens);
  },
  frame(ctx) {
    if (this.off) return;
    if (!this.fixedRatio && this.img.naturalWidth) { // card height follows the image's own aspect ratio
      this.card.h = Math.round(this.card.w * this.img.naturalHeight / this.img.naturalWidth);
      this.cardEl.style.height = this.card.h + 'px';
      this.zimg.style.height = this.card.h * this.z + 'px';
    }
    const c = this.card, R = this.R, z = this.z, out = leave(ctx, .3);
    const pc = enter(ctx.t, 0, .45);
    this.dim.style.opacity = Math.min(clamp(pc * 2), out);
    this.cardEl.style.opacity = Math.min(clamp(pc * 3), out);
    this.cardEl.style.transform = `scale(${lerp(.85, 1, ease.back(pc))})`;
    // lens glides along the path, then rests on the last point
    const pl = enter(ctx.t, .45, .35);
    const pm = ease.inOut(enter(ctx.t, .9, Math.max(.8, ctx.d - 1.9)));
    const pts = this.path, seg = Math.min(pts.length - 2, Math.floor(pm * (pts.length - 1)));
    const q = pm * (pts.length - 1) - seg;
    const fx = lerp(pts[seg][0], pts[seg + 1][0], q), fy = lerp(pts[seg][1], pts[seg + 1][1], q);
    const lx = c.x + fx * c.w, ly = c.y + fy * c.h;
    this.lens.style.transform = `translate(${lx - R}px, ${ly - R}px) scale(${lerp(.6, 1, ease.back(pl))})`;
    this.lens.style.opacity = Math.min(clamp(pl * 3), out);
    // inner image: the point under the lens centre maps to the lens centre
    this.zimg.style.left = (R - 16 - fx * c.w * z) + 'px';
    this.zimg.style.top = (R - 16 - fy * c.h * z) + 'px';
  },
};
