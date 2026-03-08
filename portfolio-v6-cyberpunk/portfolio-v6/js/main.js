/**
 * main.js
 * Boot sequence orchestrator for Deepak Sharma v5
 *
 * Order:
 *   1. DOMContentLoaded → Loader.init()
 *   2. Loader finishes  → App.boot()
 *   3. App.boot()       → all modules in order
 */

'use strict';

/* ============================================================
   CINEMATIC LOADER
   ============================================================ */
const Loader = (() => {
  const MESSAGES = [
    'Initializing neural networks…',
    'Loading ML pipelines…',
    'Compiling data systems…',
    'Almost ready…'
  ];

  const init = () => {
    const bar    = document.getElementById('loader-bar');
    const text   = document.getElementById('loader-text');
    const pct    = document.getElementById('loader-pct');
    const loader = document.getElementById('loader');
    let progress = 0, msgIdx = 0;

    const setMsg = newIdx => {
      if (newIdx === msgIdx || newIdx >= MESSAGES.length) return;
      msgIdx = newIdx;
      anime({
        targets: text,
        opacity: [1,0], translateY: [0,-8], duration: 160, easing: 'easeInSine',
        complete: () => {
          text.textContent = MESSAGES[msgIdx];
          anime({ targets: text, opacity: [0,1], translateY: [8,0], duration: 160, easing: 'easeOutSine' });
        }
      });
    };

    /* Animated intro for the loader logo */
    anime({
      targets: '#loader-logo span',
      translateY: ['100%', '0%'],
      opacity: [0, 1],
      delay: anime.stagger(80),
      duration: 600,
      easing: 'cubicBezier(0.16, 1, 0.3, 1)'
    });

    const interval = setInterval(() => {
      progress += Math.random() * 13 + 4;
      if (progress > 100) progress = 100;
      bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';
      setMsg(Math.min(Math.floor(progress / 25), MESSAGES.length - 1));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          anime({
            targets: '#loader',
            opacity: [1, 0],
            duration: 700,
            easing: 'easeInCubic',
            complete: () => { document.getElementById('loader').style.display = 'none'; App.boot(); }
          });
        }, 320);
      }
    }, 55);
  };

  return { init };
})();

/* ============================================================
   2D HERO PARTICLE OVERLAY
   Mouse-repulsion networked dots on a canvas
   ============================================================ */
const ParticleOverlay = (() => {
  let canvas, ctx, dots;
  let mx = -9999, my = -9999;

  const init = () => {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    const count = window.innerWidth < 768 ? 45 : 80;
    // Cyberpunk duality: 60% red, 40% blue
    const palette = ['255,0,51','204,0,34','255,0,51','0,153,255','0,102,204'];
    dots = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      sz: Math.random() * 1.4 + 0.4,
      col: palette[Math.floor(Math.random() * palette.length)]
    }));

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('resize', resize);
    draw();
  };

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

  const draw = () => {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(d => {
      /* Repel from cursor */
      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) { const f = (100-dist)/100; d.vx += (dx/dist)*f*0.32; d.vy += (dy/dist)*f*0.32; }
      d.vx *= 0.982; d.vy *= 0.982;
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = canvas.width;  if (d.x > canvas.width)  d.x = 0;
      if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.sz, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${d.col},0.35)`;
      ctx.fill();
    });
    /* Connections */
    for (let i = 0; i < dots.length; i++) {
      for (let j = i+1; j < dots.length; j++) {
        const dx = dots[i].x-dots[j].x, dy = dots[i].y-dots[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          const alpha = 0.07 * (1-d/90);
          // Gradient effect: close pairs get red-tint, far pairs get blue-tint
          const blueShift = d / 90;
          const r = Math.round(255 * (1 - blueShift * 0.7));
          const g = 0;
          const b = Math.round(255 * blueShift * 0.8);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  return { init };
})();

/* ============================================================
   BACKGROUND GRID CANVAS
   Cyberpunk circuit-board style:
   • Thin red grid lines
   • Random "circuit trace" highlights in blue
   • Glowing red nodes at every intersection
   ============================================================ */
const BackgroundGrid = {
  init() {
    const gc = document.getElementById('bg-grid');
    if (!gc) return;
    const ctx = gc.getContext('2d');
    const W   = window.innerWidth;
    const H   = document.documentElement.scrollHeight || 12000;
    gc.width  = W;
    gc.height = H;

    const cell = 72;
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);

    // ── Base grid lines — very dark red ──────────────────
    ctx.strokeStyle = 'rgba(255,0,51,0.055)';
    ctx.lineWidth   = 0.4;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath(); ctx.moveTo(c*cell, 0); ctx.lineTo(c*cell, H); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r*cell); ctx.lineTo(W, r*cell); ctx.stroke();
    }

    // ── Circuit trace highlights — electric blue ──────────
    // Random L-shaped "trace" paths like a PCB
    const traceCount = Math.floor((cols * rows) / 28);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < traceCount; i++) {
      const c1 = Math.floor(Math.random() * cols);
      const r1 = Math.floor(Math.random() * rows);
      const len = 2 + Math.floor(Math.random() * 4); // 2–5 cells
      const horiz = Math.random() > 0.5;
      const isRed = Math.random() > 0.65; // 35% red, 65% blue traces

      ctx.strokeStyle = isRed
        ? `rgba(255,0,51,${0.12 + Math.random() * 0.1})`
        : `rgba(0,153,255,${0.08 + Math.random() * 0.09})`;

      ctx.beginPath();
      if (horiz) {
        ctx.moveTo(c1 * cell, r1 * cell);
        ctx.lineTo((c1 + len) * cell, r1 * cell);
      } else {
        ctx.moveTo(c1 * cell, r1 * cell);
        ctx.lineTo(c1 * cell, (r1 + len) * cell);
      }
      ctx.stroke();

      // End-cap dot
      ctx.beginPath();
      ctx.arc(
        horiz ? (c1 + len) * cell : c1 * cell,
        horiz ? r1 * cell : (r1 + len) * cell,
        2, 0, Math.PI * 2
      );
      ctx.fillStyle = isRed ? 'rgba(255,0,51,0.25)' : 'rgba(0,153,255,0.25)';
      ctx.fill();
    }

    // ── Intersection nodes — subtle red dots ─────────────
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        const isHighlight = Math.random() > 0.88; // 12% highlighted
        if (isHighlight) {
          // Glowing node
          const grad = ctx.createRadialGradient(c*cell, r*cell, 0, c*cell, r*cell, 4);
          const useBlue = Math.random() > 0.55;
          grad.addColorStop(0, useBlue ? 'rgba(0,153,255,0.45)' : 'rgba(255,0,51,0.45)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(c*cell, r*cell, 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          // Regular dot
          ctx.beginPath();
          ctx.arc(c*cell, r*cell, 1.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,0,51,0.07)';
          ctx.fill();
        }
      }
    }
  }
};

/* ============================================================
   PARALLAX HERO
   ============================================================ */
const ParallaxHero = {
  init() {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      const hc = document.querySelector('.hero-content');
      if (hc) { hc.style.transform = `translateY(${s * 0.18}px)`; hc.style.opacity = `${Math.max(0, 1 - s/480)}`; }
      const si = document.getElementById('scroll-indicator');
      if (si) si.style.opacity = `${Math.max(0, 1 - s/160)}`;
    }, { passive: true });
  }
};

/* ============================================================
   APP MASTER BOOT
   ============================================================ */
const App = {
  boot() {
    /* 3D */
    ThreeScene.init(document.getElementById('three-canvas'));

    /* 2D canvas */
    ParticleOverlay.init();
    BackgroundGrid.init();

    /* Smooth scroll + horizontal scroll */
    SmoothScroll.init();
    HorizontalScroll.init();

    /* Cursor */
    Cursor.init();
    Cursor.bindHovers();

    /* Navbar */
    Navbar.init();

    /* Split all chars that need splitting */
    CharSplit.splitAll('.hero-title, .hero-role, .section-title');

    /* Animations */
    HeroAnim.run();
    Typewriter.init();
    ManifestoAnim.init();
    SectionHeaders.init();
    SkillRings.init();
    StatCounters.init();
    CardEntrance.init();
    TimelineAnim.init();
    FadeUp.init();
    InfoItems.init();
    ContactAnim.init();
    CodeTerminal.init();
    ProjectFilter.init();
    CardTilt.init('.tilt-card');
    MagneticBtn.init('.magnetic');
    ContactForm.init();
    ParallaxHero.init();
  }
};

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => Loader.init());
