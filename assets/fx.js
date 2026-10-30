/* Motion layer. One signature moment (interactive hero network), plus restrained hover polish. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let mx = -999, my = -999;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  if (fine && !reduce) {
    const rect = (el, e) => { const r = el.getBoundingClientRect(); return [r, (e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5]; };
    document.addEventListener('pointermove', e => {
      const c = e.target.closest('.pcard:not(.soon),.vcard');
      if (c) { const [, px, py] = rect(c, e); c.classList.add('fx-tilt', 'fx-hot'); c.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`; }
      const b = e.target.closest('.btn-primary,.nav-cta');
      if (b) { const [r] = rect(b, e); b.classList.add('fx-mag'); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .25).toFixed(1)}px)`; }
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const c = e.target.closest('.pcard,.vcard,.btn-primary,.nav-cta');
      if (c && !c.contains(e.relatedTarget)) { c.style.transform = ''; c.classList.remove('fx-hot'); }
    }, { passive: true });
  }

  let ly = scrollY;
  addEventListener('scroll', () => {
    const nav = document.getElementById('nav'), y = scrollY;
    if (nav) nav.classList.toggle('fx-hide', y > ly + 4 && y > 240 && !document.getElementById('navlinks')?.classList.contains('open'));
    if (y < ly - 4 || y < 240) nav?.classList.remove('fx-hide');
    ly = y;
  }, { passive: true });

  document.getElementById('burger')?.addEventListener('click', () => document.querySelectorAll('#navlinks a').forEach((a, i) => a.style.setProperty('--k', i)));

  function net(host) {
    if (reduce || host.querySelector('canvas.fx-net')) return;
    const cv = host.insertBefore(Object.assign(document.createElement('canvas'), { className: 'fx-net' }), host.firstChild), g = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, P = [], vis = true;
    const size = () => {
      W = host.clientWidth; H = host.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = Array.from({ length: Math.min(W < 700 ? 28 : 64, Math.round(W / 20)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
    };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(host);
    (function draw() {
      if (!cv.isConnected) return;
      if (vis && !document.hidden) {
        g.clearRect(0, 0, W, H);
        const r = host.getBoundingClientRect(), lx = mx - r.left, ly2 = my - r.top;
        for (const p of P) {
          const dx = p.x - lx, dy = p.y - ly2, d = Math.hypot(dx, dy) || 1;
          if (d < 140) { p.vx += dx / d * .02; p.vy += dy / d * .02; }
          p.vx *= .995; p.vy *= .995; p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (let i = 0; i < P.length; i++) {
          g.fillStyle = 'rgba(180,170,255,.75)'; g.beginPath(); g.arc(P[i].x, P[i].y, 1.6, 0, 7); g.fill();
          for (let j = i + 1; j < P.length; j++) {
            const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
            if (d < 120) { g.strokeStyle = `rgba(20,212,180,${(1 - d / 120) * .35})`; g.beginPath(); g.moveTo(P[i].x, P[i].y); g.lineTo(P[j].x, P[j].y); g.stroke(); }
          }
        }
      }
      requestAnimationFrame(draw);
    })();
  }
  let q = 0;
  new MutationObserver(() => { cancelAnimationFrame(q); q = requestAnimationFrame(() => document.querySelectorAll('.hero,.phero').forEach(net)); }).observe(document.body, { childList: true, subtree: true });
})();
