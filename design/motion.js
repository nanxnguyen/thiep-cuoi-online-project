/* Mộc — lớp chuyển động dùng chung. Nhúng: <script src="motion.js"></script> (thêm data-lite để chỉ giữ chuyển trang + thanh tiến độ). */
(function () {
  if (window.__mocMotion) return; window.__mocMotion = true;
  const tag = document.currentScript || document.querySelector('script[src*="motion.js"]');
  const lite = !!(tag && tag.hasAttribute('data-lite'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const PETALS = ['#c9a86a', '#e0bb74', '#d8a977', '#a3161c', '#e9b7b0'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ready = fn => document.body ? fn() : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    /* 1. Màn chuyển trang */
    const veil = document.createElement('div');
    veil.setAttribute('data-moc-veil', '');
    Object.assign(veil.style, { position: 'fixed', inset: '0', zIndex: '2147483000', background: '#f8f4ee', display: 'grid', placeItems: 'center', pointerEvents: 'none' });
    veil.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:14px"><div style="font-family:\'Playfair Display\',serif;font-size:30px;letter-spacing:.42em;padding-left:.42em;color:#a3161c">MỘC</div><div style="width:64px;height:1px;background:#c9a86a;transform-origin:left"></div></div>';
    document.body.appendChild(veil);
    const mark = veil.firstChild, line = mark.lastChild;
    if (reduce) veil.style.opacity = '0';
    else {
      mark.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 420, easing: EASE, fill: 'both' });
      line.animate([{ scale: '0 1' }, { scale: '1 1' }], { duration: 520, easing: EASE, fill: 'both' });
      veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 380, easing: EASE, fill: 'forwards' });
    }
    document.addEventListener('click', e => {
      if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.dc\.html$/i.test(decodeURIComponent(url.pathname))) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      veil.style.pointerEvents = 'auto';
      veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE, fill: 'forwards' }).onfinish = () => { location.href = a.href; };
    });
    addEventListener('pageshow', ev => { if (ev.persisted) { veil.getAnimations().forEach(x => x.cancel()); veil.style.opacity = '0'; veil.style.pointerEvents = 'none'; } });

    /* 2. Thanh tiến độ cuộn */
    const bar = document.createElement('div');
    Object.assign(bar.style, { position: 'fixed', top: '0', left: '0', right: '0', height: '2px', zIndex: '2147482500', pointerEvents: 'none', background: 'linear-gradient(90deg,#a3161c,#c9a86a)', transformOrigin: 'left', transform: 'scaleX(0)' });
    document.body.appendChild(bar);
    let raf = 0;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; });
    }, { passive: true });

    if (lite || reduce) return;

    /* 3. Hiện dần khi cuộn */
    const seen = new WeakSet(), owned = new WeakSet(), anims = new WeakMap();
    const armed = new Set();
    const fire = el => { const an = anims.get(el); if (an) an.play(); armed.delete(el); };
    const check = () => {
      const lim = innerHeight * 0.94;
      armed.forEach(el => {
        if (!el.isConnected) { armed.delete(el); return; }
        const r = el.getBoundingClientRect();
        if (r.top < lim && r.bottom > 0) fire(el);
        else if (r.bottom <= 0) fire(el);
      });
    };
    let cr = 0;
    const queue = () => { if (!cr) cr = requestAnimationFrame(() => { cr = 0; check(); }); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    setInterval(check, 600);
    const skipZone = '[data-moc-veil],[data-no-reveal],header,nav';
    const hasOwnedAncestor = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (owned.has(p)) return true; return false; };
    const inFixed = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = p.style && p.style.position; if (s === 'fixed' || s === 'sticky') return true; } return false; };
    function arm(el, delay) {
      if (seen.has(el)) return; seen.add(el);
      if (el.closest(skipZone) || hasOwnedAncestor(el) || inFixed(el)) return;
      const r = el.getBoundingClientRect();
      if (!r.height || r.top < innerHeight * 0.94) return;
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none' || cs.display === 'none' || parseFloat(cs.opacity) < 1) return;
      owned.add(el);
      const t = el.tagName;
      let kf, dur = 950;
      if (t === 'H1' || t === 'H2') {
        kf = [{ opacity: 0, translate: '0 44px', clipPath: 'inset(100% -10% -30% -10%)' }, { opacity: 1, translate: '0 0', clipPath: 'inset(-30% -10% -30% -10%)' }]; dur = 1150;
      } else if (t === 'IMAGE-SLOT' || t === 'IMG') {
        kf = [{ opacity: 0, scale: '1.08', clipPath: 'inset(10% 10% 10% 10% round 14px)' }, { opacity: 1, scale: '1', clipPath: 'inset(0% 0% 0% 0% round 0px)' }]; dur = 1200;
      } else {
        kf = [{ opacity: 0, translate: '0 30px', filter: 'blur(4px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0px)' }];
      }
      const an = el.animate(kf, { duration: dur, delay, easing: EASE, fill: 'backwards' });
      an.pause(); an.currentTime = 0;
      anims.set(el, an); armed.add(el);
    }
    function scan() {
      document.querySelectorAll('[style*="grid"],[style*="wrap"]').forEach(box => {
        const d = box.style.display;
        if (!(d === 'grid' || d === 'inline-grid' || (d === 'flex' && box.style.flexWrap === 'wrap'))) return;
        Array.from(box.children).forEach((c, i) => arm(c, (i % 8) * 85));
      });
      document.querySelectorAll('h1,h2,h3,p,blockquote,image-slot,img,li,[data-reveal]').forEach(el => arm(el, 0));
    }
    let tmr = 0;
    const later = () => { clearTimeout(tmr); tmr = setTimeout(scan, 140); };
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    later();

    /* 4. Lớp cánh hoa (vệt chuột + bùng nổ khi bấm nút chính) */
    const layer = document.createElement('div');
    Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: '2147482000', pointerEvents: 'none', overflow: 'hidden' });
    document.body.appendChild(layer);
    function petal(x, y, size) {
      const p = document.createElement('div');
      Object.assign(p.style, { position: 'absolute', left: x - size / 2 + 'px', top: y - size / 2 + 'px', width: size + 'px', height: size * 1.3 + 'px', borderRadius: '100% 0 100% 0', background: PETALS[(Math.random() * PETALS.length) | 0], opacity: '.9' });
      layer.appendChild(p); return p;
    }
    if (fine) {
      let lx = 0, ly = 0, lt = 0;
      addEventListener('pointermove', e => {
        const now = performance.now();
        if (now - lt < 45 || Math.hypot(e.clientX - lx, e.clientY - ly) < 30 || layer.childElementCount > 36) return;
        lx = e.clientX; ly = e.clientY; lt = now;
        const p = petal(lx, ly, rnd(6, 10)), dx = rnd(-30, 30), rot = rnd(-200, 200);
        p.animate([{ opacity: .85, translate: '0 0', rotate: '0deg' }, { opacity: 0, translate: dx + 'px ' + rnd(50, 90) + 'px', rotate: rot + 'deg' }], { duration: rnd(1000, 1500), easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = () => p.remove();
      }, { passive: true });
    }
    const CTA = ['rgb(163, 22, 28)', 'rgb(142, 27, 31)', 'rgb(125, 15, 20)', 'rgb(110, 18, 22)'];
    const isCTA = el => el && (el.hasAttribute('data-burst') || CTA.includes(getComputedStyle(el).backgroundColor));
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('a,button,[data-burst]');
      if (!isCTA(b)) return;
      const n = 14;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + rnd(-.2, .2), d = rnd(46, 96), p = petal(e.clientX, e.clientY, rnd(7, 12));
        p.animate([{ opacity: 1, translate: '0 0', rotate: '0deg', scale: '.4' }, { opacity: 0, translate: Math.cos(ang) * d + 'px ' + (Math.sin(ang) * d + 24) + 'px', rotate: rnd(-240, 240) + 'deg', scale: '1' }], { duration: rnd(700, 1000), easing: 'cubic-bezier(.15,.7,.3,1)' }).onfinish = () => p.remove();
      }
    });

    /* 5. Nút chính hút theo chuột */
    if (fine) {
      let cur = null, tx = 0, ty = 0, x = 0, y = 0, loop = 0;
      const step = () => {
        x += (tx - x) * .18; y += (ty - y) * .18;
        if (cur) cur.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px';
        if (Math.abs(tx - x) + Math.abs(ty - y) > .05) loop = requestAnimationFrame(step);
        else { loop = 0; if (cur && !tx && !ty) { cur.style.translate = ''; cur = null; } }
      };
      const kick = () => { if (!loop) loop = requestAnimationFrame(step); };
      addEventListener('pointermove', e => {
        const b = e.target.closest && e.target.closest('a,button');
        if (b && isCTA(b)) {
          if (cur && cur !== b) { cur.style.translate = ''; x = y = 0; }
          cur = b;
          const r = b.getBoundingClientRect();
          tx = Math.max(-10, Math.min(10, (e.clientX - r.left - r.width / 2) * .22));
          ty = Math.max(-7, Math.min(7, (e.clientY - r.top - r.height / 2) * .3));
          kick();
        } else if (cur) { tx = ty = 0; kick(); }
      }, { passive: true });
    }

    /* 6. Chào khách quay lại */
    try {
      let n = +localStorage.getItem('moc_visits') || 0;
      if (!sessionStorage.getItem('moc_session')) { sessionStorage.setItem('moc_session', '1'); n++; localStorage.setItem('moc_visits', n); if (n > 1) setTimeout(welcome, 1800); }
    } catch (e) {}
    function welcome() {
      const t = document.createElement('div');
      Object.assign(t.style, { position: 'fixed', left: '24px', bottom: '24px', zIndex: '2147482600', maxWidth: 'calc(100vw - 48px)', background: '#1c1012', color: '#f1e7d6', borderRadius: '16px', padding: '16px 18px 16px 20px', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 30px 60px -24px rgba(0,0,0,.6)', fontFamily: "'Be Vietnam Pro',sans-serif", fontSize: '14px' });
      t.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px"><div style="font-family:\'Playfair Display\',serif;font-size:18px">Chào mừng bạn quay lại <span style="font-style:italic;color:#c9a86a">Mộc</span></div><a href="Studio Editor v3.dc.html" style="color:#e0bb74;text-decoration:none">Tiếp tục tạo thiệp →</a></div><button aria-label="Đóng" style="all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:999px;border:1px solid #4a3a36;color:#a8998c">✕</button>';
      document.body.appendChild(t);
      t.animate([{ opacity: 0, translate: '0 24px', scale: '.96' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: 600, easing: EASE, fill: 'both' });
      const close = () => t.animate([{ opacity: 1 }, { opacity: 0, translate: '0 16px' }], { duration: 350, easing: EASE, fill: 'forwards' }).onfinish = () => t.remove();
      t.querySelector('button').onclick = close;
      setTimeout(() => t.isConnected && close(), 7000);
    }
  });
})();
