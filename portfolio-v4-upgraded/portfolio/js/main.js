/**
 * MAIN.JS
 * Core application controller for Deepak Sharma's Portfolio
 * ─────────────────────────────────────────────────────────
 * Boot sequence:
 *   1. DOMContentLoaded → Loader.init()
 *   2. Loader finishes  → App.boot()
 *   3. App.boot()       → initialise all modules
 */

'use strict';

/* ============================================================
   LOADER
   Cinematic page-load animation with progress bar + messages
   ============================================================ */
const Loader = (() => {
  const MESSAGES = [
    'Initializing neural networks…',
    'Loading data pipelines…',
    'Compiling ML models…',
    'Almost ready…'
  ];

  const init = () => {
    const bar    = document.getElementById('loader-bar');
    const text   = document.getElementById('loader-text');
    const pct    = document.getElementById('loader-pct');
    const loader = document.getElementById('loader');
    let progress = 0, msgIdx = 0;

    const setMsg = (idx) => {
      if (idx === msgIdx) return;
      msgIdx = idx;
      anime({
        targets: text,
        opacity: [1, 0], translateY: [0, -10], duration: 180,
        complete: () => {
          text.textContent = MESSAGES[msgIdx];
          anime({ targets: text, opacity: [0, 1], translateY: [10, 0], duration: 180 });
        }
      });
    };

    const interval = setInterval(() => {
      progress += Math.random() * 14 + 3;
      if (progress > 100) progress = 100;

      bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';

      setMsg(Math.min(Math.floor(progress / 25), MESSAGES.length - 1));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          anime({
            targets: '#loader',
            opacity: 0,
            duration: 700,
            easing: 'easeInCubic',
            complete: () => {
              loader.style.display = 'none';
              App.boot();
            }
          });
        }, 350);
      }
    }, 52);
  };

  return { init };
})();

/* ============================================================
   CUSTOM CURSOR
   Dot + ring with velocity-based stretch, magnetic on hover
   ============================================================ */
const Cursor = (() => {
  let dot, ring;
  let mx = 0, my = 0, rx = 0, ry = 0;
  let vx = 0, vy = 0;
  let hovering = false;

  const init = () => {
    dot  = document.getElementById('cursor');
    ring = document.getElementById('cursor-trail');
    if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;

    document.addEventListener('mousemove', e => {
      vx = e.clientX - mx;
      vy = e.clientY - my;
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    const interactEls = 'a, button, .project-card, .exp-card, .skill-chip, .filter-btn, .contact-item, .stat-item, label';
    document.querySelectorAll(interactEls).forEach(el => {
      el.addEventListener('mouseenter', () => {
        hovering = true;
        ring.style.transform     = 'translate(-50%,-50%) scale(2.4)';
        ring.style.borderColor   = 'rgba(0,245,255,0.85)';
        ring.style.background    = 'rgba(0,245,255,0.04)';
        dot.style.transform      = 'translate(-50%,-50%) scale(0.45)';
        dot.style.background     = '#fff';
      });
      el.addEventListener('mouseleave', () => {
        hovering = false;
        ring.style.transform   = 'translate(-50%,-50%) scale(1)';
        ring.style.borderColor = 'rgba(0,245,255,0.4)';
        ring.style.background  = 'transparent';
        dot.style.transform    = 'translate(-50%,-50%) scale(1)';
        dot.style.background   = 'var(--cyan)';
      });
    });

    animateCursor();
  };

  const animateCursor = () => {
    // Stretch dot in direction of travel
    if (!hovering) {
      const speed  = Math.sqrt(vx * vx + vy * vy);
      const angle  = Math.atan2(vy, vx) * (180 / Math.PI);
      const stretch = Math.min(speed * 0.28, 9);
      dot.style.width  = (12 + stretch) + 'px';
      dot.style.height = Math.max(5, 12 - stretch * 0.4) + 'px';
      dot.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
    }
    vx *= 0.78;
    vy *= 0.78;

    // Lag ring
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(animateCursor);
  };

  return { init };
})();

/* ============================================================
   NAVBAR
   Scroll-aware hide/show, active link highlight, mobile menu
   ============================================================ */
const Navbar = (() => {
  const init = () => {
    const nav       = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('nav-links');
    let menuOpen    = false;
    let lastY       = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 80);
      if (y > lastY + 12 && y > 200) nav.classList.add('nav-hidden');
      else if (y < lastY - 12)       nav.classList.remove('nav-hidden');
      lastY = y;
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
      menuOpen = !menuOpen;
      navLinks.classList.toggle('open', menuOpen);
      hamburger.classList.toggle('open', menuOpen);
    });

    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menuOpen = false;
        navLinks.classList.remove('open');
        hamburger?.classList.remove('open');
      });
    });

    /* Active link highlight */
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a');
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { threshold: 0.35 }).observe !== undefined &&
      sections.forEach(s => new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        });
      }, { threshold: 0.35 }).observe(s));
  };

  return { init };
})();

/* ============================================================
   HERO
   Staggered entrance animation + typewriter effect
   ============================================================ */
const Hero = (() => {
  const init = () => {
    /* Staggered cinematic reveal */
    const tl = anime.timeline({ easing: 'easeOutExpo' });
    tl.add({ targets: '.hero-badge',     opacity: [0,1], translateY: [24,0], duration: 800,  delay: 100  })
      .add({ targets: '.hero-name .line',opacity: [0,1], translateY: [70,0], duration: 1000, delay: anime.stagger(140) }, '-=500')
      .add({ targets: '.hero-typing',    opacity: [0,1], duration: 500 }, '-=300')
      .add({ targets: '.hero-cta',       opacity: [0,1], translateY: [24,0], duration: 700  }, '-=200')
      .add({ targets: '#scroll-indicator', opacity: [0, 0.75], duration: 500 }, '-=100');

    /* Typewriter */
    const phrases = [
      'Data Science Engineer',
      'Machine Learning Specialist',
      'Apache Spark Developer',
      'AI Systems Builder'
    ];
    let pi = 0, ci = 0, del = false;
    const el = document.getElementById('typing-text');
    if (!el) return;

    const type = () => {
      const p = phrases[pi];
      if (!del) {
        el.textContent = p.substring(0, ci + 1);
        ci++;
        if (ci === p.length) { del = true; setTimeout(type, 2000); return; }
        setTimeout(type, 55 + Math.random() * 45);
      } else {
        el.textContent = p.substring(0, ci - 1);
        ci--;
        if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
        setTimeout(type, 32);
      }
    };
    setTimeout(type, 1900);
  };

  return { init };
})();

/* ============================================================
   2D PARTICLE CANVAS (hero overlay)
   Mouse-repulsion networked particles
   ============================================================ */
const ParticleCanvas = (() => {
  let ctx, canvas, dots, raf;
  let mx = -9999, my = -9999;

  const init = () => {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    const count = window.innerWidth < 768 ? 50 : 95;
    dots = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      sz: Math.random() * 1.4 + 0.5,
      a:  Math.random() * 0.28 + 0.06,
      col: Math.random() > 0.5 ? '0,245,255' : '124,58,237'
    }));

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('resize', resize);
    draw();
  };

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(d => {
      /* repulsion */
      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 110) { const f = (110-dist)/110; d.vx += (dx/dist)*f*0.28; d.vy += (dy/dist)*f*0.28; }
      d.vx *= 0.985; d.vy *= 0.985;
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = canvas.width;  if (d.x > canvas.width)  d.x = 0;
      if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.col},${d.a})`;
      ctx.fill();
    });

    /* connections */
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 95) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,245,255,${0.055 * (1 - d/95)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  return { init };
})();

/* ============================================================
   BACKGROUND GRID
   Static canvas grid drawn once across full page height
   ============================================================ */
const BackgroundGrid = {
  init() {
    const gc = document.getElementById('bg-grid');
    if (!gc) return;
    const ctx = gc.getContext('2d');
    const W   = window.innerWidth;
    const H   = document.documentElement.scrollHeight;
    gc.width  = W;
    gc.height = H;

    const cell = 62;
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);

    ctx.strokeStyle = 'rgba(0,245,255,0.028)';
    ctx.lineWidth   = 0.5;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath(); ctx.moveTo(c*cell, 0); ctx.lineTo(c*cell, H); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r*cell); ctx.lineTo(W, r*cell); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,245,255,0.045)';
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath(); ctx.arc(c*cell, r*cell, 1.2, 0, Math.PI*2); ctx.fill();
      }
    }
  }
};

/* ============================================================
   APP — master boot
   ============================================================ */
const App = {
  boot() {
    /* Three.js hero scene */
    const threeCanvas = document.getElementById('three-canvas');
    if (threeCanvas && typeof ThreeScene !== 'undefined') ThreeScene.init(threeCanvas);

    /* Core UI */
    ParticleCanvas.init();
    Cursor.init();
    Navbar.init();
    Hero.init();
    BackgroundGrid.init();

    /* Animations */
    FadeAnimations.init();
    SkillBars.init();
    CountUp.init();
    CardTilt.init('.tilt-card');
    MagneticButton.init('.magnetic');
    Timeline.init();
    SkillChips.init();
    CodeTerminal.init();
    ProjectFilter.init();
    ScrollProgress.init();
    Parallax.init();
    ContactForm.init();
    CardGlow.init();

    /* Project cards scroll reveal */
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(44px)'; });
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        anime({ targets: entry.target, opacity: [0,1], translateY: [44,0], duration: 700, easing: 'easeOutExpo' });
        entry.target._obs?.unobserve(entry.target);
      });
    }, { threshold: 0.06 }).observe !== undefined &&
    (() => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          anime({ targets: entry.target, opacity: [0,1], translateY: [44,0], duration: 700, easing: 'easeOutExpo' });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.06 });
      projectCards.forEach(c => obs.observe(c));
    })();
  }
};

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => Loader.init());
