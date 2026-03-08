/**
 * animations.js
 * All Anime.js–powered animation controllers
 *
 * Philosophy (animejs.com-inspired):
 *  • Spring / elastic easings everywhere
 *  • Staggered sequenced timelines
 *  • Scroll reveals feel cinematic, not just fades
 *  • Text is the hero — characters animate individually
 */

'use strict';

/* ============================================================
   CHARACTER SPLITTER
   Wraps each letter in a <span class="char"> inside a
   <span class="char-mask"> so we can clip-reveal text
   ============================================================ */
const CharSplit = {
  split(el) {
    const text = el.textContent.trim();
    el.innerHTML = [...text].map(ch =>
      ch === ' '
        ? ' '
        : `<span class="char-mask"><span class="char">${ch}</span></span>`
    ).join('');
  },

  splitAll(selector) {
    document.querySelectorAll(selector).forEach(el => this.split(el));
  }
};

/* ============================================================
   HERO ENTRANCE  — runs once after loader exits
   ============================================================ */
const HeroAnim = {
  run() {
    const tl = anime.timeline({ easing: 'easeOutExpo' });

    /* Eye brow */
    tl.add({ targets: '.hero-eyebrow', opacity: [0, 1], translateY: [16, 0], duration: 700 }, 0);

    /* Name — chars slide up from clip mask */
    tl.add({
      targets: '.hero-title .char',
      translateY: ['105%', '0%'],
      opacity: [0, 1],
      duration: 900,
      delay: anime.stagger(38, { start: 0 }),
      easing: 'cubicBezier(0.16, 1, 0.3, 1)'
    }, 200);

    /* Role line */
    tl.add({
      targets: '.hero-role .char',
      translateY: ['100%', '0%'],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(28),
      easing: 'cubicBezier(0.16, 1, 0.3, 1)'
    }, 550);

    /* CTA */
    tl.add({
      targets: '.hero-cta > *',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: anime.stagger(100)
    }, 900);

    /* Scroll indicator */
    tl.add({ targets: '#scroll-indicator', opacity: [0, 0.7], duration: 500 }, 1200);

    /* Metrics strip */
    tl.add({
      targets: '.metric',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 700,
      delay: anime.stagger(80)
    }, 1100);
  }
};

/* ============================================================
   TYPEWRITER  — hero sub-role cycling text
   ============================================================ */
const Typewriter = {
  phrases: [
    'Data Science Engineer',
    'Machine Learning Specialist',
    'Apache Spark Developer',
    'AI Systems Builder'
  ],
  pi: 0, ci: 0, del: false, el: null,

  init() {
    this.el = document.getElementById('typing-text');
    if (!this.el) return;
    setTimeout(() => this.tick(), 2200);
  },

  tick() {
    const p = this.phrases[this.pi];
    if (!this.del) {
      this.el.textContent = p.substring(0, this.ci + 1);
      this.ci++;
      if (this.ci === p.length) { this.del = true; setTimeout(() => this.tick(), 2000); return; }
      setTimeout(() => this.tick(), 55 + Math.random() * 40);
    } else {
      this.el.textContent = p.substring(0, this.ci - 1);
      this.ci--;
      if (this.ci === 0) { this.del = false; this.pi = (this.pi + 1) % this.phrases.length; }
      setTimeout(() => this.tick(), 30);
    }
  }
};

/* ============================================================
   MANIFESTO WORDS  — each word slides up on scroll reveal
   ============================================================ */
const ManifestoAnim = {
  init() {
    ScrollTriggers.add(document.querySelector('.manifesto-inner'), () => {
      anime({
        targets: '.manifesto-word .word-inner',
        translateY: ['110%', '0%'],
        opacity: [0, 1],
        duration: 1100,
        delay: anime.stagger(120),
        easing: 'cubicBezier(0.16, 1, 0.3, 1)'
      });
    }, 0.7);
  }
};

/* ============================================================
   SECTION HEADER ANIM  — label + title + line
   ============================================================ */
const SectionHeaders = {
  init() {
    document.querySelectorAll('.section-header').forEach(header => {
      ScrollTriggers.add(header, (el) => {
        const tl = anime.timeline({ easing: 'easeOutExpo' });
        tl.add({ targets: el.querySelector('.section-label'), opacity: [0,1], translateX: [-28,0], duration: 600 })
          .add({
            targets: el.querySelectorAll('.section-title .char'),
            translateY: ['105%','0%'],
            opacity: [0,1],
            duration: 900,
            delay: anime.stagger(28),
            easing: 'cubicBezier(0.16, 1, 0.3, 1)'
          }, '-=300')
          .add({ targets: el.querySelector('.section-line'), width: [0, 80], opacity: [0,1], duration: 800 }, '-=400');
      }, 0.75);
    });
  }
};

/* ============================================================
   SKILL RINGS  — SVG stroke-dashoffset animation
   The circumference of a circle r=82 = 2π×82 ≈ 515.22
   ============================================================ */
const SkillRings = {
  CIRC: 2 * Math.PI * 82, // ~515.2

  init() {
    document.querySelectorAll('.skill-orb').forEach(orb => {
      const ring = orb.querySelector('.ring-fill');
      const pctEl = orb.querySelector('.skill-pct');
      if (!ring) return;

      const pct = parseInt(orb.dataset.skill);
      const offset = this.CIRC * (1 - pct / 100);

      // Reset
      ring.style.strokeDasharray  = this.CIRC;
      ring.style.strokeDashoffset = this.CIRC;
      if (pctEl) pctEl.textContent = '0';

      ScrollTriggers.add(orb, () => {
        // Ring fill
        anime({
          targets: ring,
          strokeDashoffset: [this.CIRC, offset],
          duration: 1800,
          easing: 'easeInOutSine',
          delay: 100
        });
        // Counter
        anime({
          targets: pctEl,
          innerHTML: [0, pct],
          round: 1,
          duration: 1600,
          easing: 'easeOutExpo'
        });
        // Orb entrance
        anime({ targets: orb, opacity: [0, 1], scale: [0.88, 1], duration: 700, easing: 'easeOutBack' });
      }, 0.85);

      // Hover pulse
      orb.addEventListener('mouseenter', () => {
        anime({ targets: ring, strokeOpacity: [1, 0.6, 1], duration: 600, easing: 'easeInOutSine' });
      });
    });
  }
};

/* ============================================================
   STAT COUNTERS  — the stats strip
   ============================================================ */
const StatCounters = {
  init() {
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      el.textContent = '0';
      ScrollTriggers.add(el, () => {
        anime({
          targets: el,
          innerHTML: [0, target],
          round: 1,
          duration: 1800,
          easing: 'easeOutExpo'
        });
      }, 0.9);
    });
  }
};

/* ============================================================
   CARD ENTRANCES  — project + exp cards
   ============================================================ */
const CardEntrance = {
  init() {
    // Project cards — set invisible first
    document.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px)';
      ScrollTriggers.add(card, () => {
        anime({
          targets: card,
          opacity: [0, 1],
          translateY: [60, 0],
          duration: 800,
          easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        });
      }, 0.9);
    });
  }
};

/* ============================================================
   TIMELINE ITEMS
   ============================================================ */
const TimelineAnim = {
  init() {
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.style.opacity = '0';
      ScrollTriggers.add(item, () => {
        anime({
          targets: item,
          opacity: [0, 1],
          translateX: [-40, 0],
          duration: 800,
          delay: i * 100,
          easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        });
        const dot = item.querySelector('.tl-dot');
        if (dot) anime({ targets: dot, scale: [0, 1], duration: 500, delay: 300, easing: 'easeOutBack(1.4)' });
        const line = document.querySelector('.tl-line-fill');
        if (line) anime({ targets: line, height: ['0%', '100%'], duration: 1200, easing: 'easeOutExpo' });
      }, 0.8);
    });
  }
};

/* ============================================================
   FADE-UP ELEMENTS  — generic
   ============================================================ */
const FadeUp = {
  init() {
    document.querySelectorAll('.fade-up').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      ScrollTriggers.add(el, () => {
        anime({ targets: el, opacity: [0,1], translateY: [40,0], duration: 700, easing: 'easeOutExpo' });
      }, 0.82);
    });
  }
};

/* ============================================================
   INFO ITEMS  — about section grid
   ============================================================ */
const InfoItems = {
  init() {
    const container = document.querySelector('.about-info');
    if (!container) return;
    const items = container.querySelectorAll('.info-item');
    items.forEach(i => { i.style.opacity = '0'; });
    ScrollTriggers.add(container, () => {
      anime({
        targets: items,
        opacity: [0,1],
        translateY: [20,0],
        duration: 600,
        delay: anime.stagger(80),
        easing: 'easeOutExpo'
      });
    }, 0.8);
  }
};

/* ============================================================
   CONTACT ITEMS STAGGER
   ============================================================ */
const ContactAnim = {
  init() {
    const items = document.querySelectorAll('.contact-item');
    items.forEach(i => { i.style.opacity = '0'; });
    if (!items.length) return;
    ScrollTriggers.add(items[0], () => {
      anime({
        targets: items,
        opacity: [0,1],
        translateX: [-30, 0],
        duration: 700,
        delay: anime.stagger(90),
        easing: 'easeOutExpo'
      });
    }, 0.8);
  }
};

/* ============================================================
   3D CARD TILT  — hover perspective transform
   ============================================================ */
const CardTilt = {
  init(selector = '.tilt-card') {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        const rX = (y / r.height) * -12;
        const rY = (x / r.width)  *  12;
        card.style.transform    = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(10px)`;
        card.style.transition   = 'transform 0.06s linear';
        const shine = card.querySelector('.card-shine');
        if (shine) {
          const px = ((e.clientX - r.left) / r.width)  * 100;
          const py = ((e.clientY - r.top)  / r.height) * 100;
          shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.07), transparent 60%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        card.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
        const shine = card.querySelector('.card-shine');
        if (shine) shine.style.background = 'none';
      });
    });
  }
};

/* ============================================================
   MAGNETIC BUTTONS  — elastic pull towards cursor
   ============================================================ */
const MagneticBtn = {
  init(selector = '.magnetic') {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        anime({ targets: btn, translateX: x * 0.38, translateY: y * 0.38, duration: 350, easing: 'easeOutCubic' });
      });
      btn.addEventListener('mouseleave', () => {
        anime({ targets: btn, translateX: 0, translateY: 0, duration: 700, easing: 'easeOutElastic(1, 0.5)' });
      });
    });
  }
};

/* ============================================================
   PROJECT FILTER
   ============================================================ */
const ProjectFilter = {
  init() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach(card => {
          const cats = card.dataset.category || '';
          const show = f === 'all' || cats.split(' ').includes(f);
          if (show) {
            card.style.display = '';
            anime({ targets: card, opacity: [0,1], scale: [0.92,1], translateY: [20,0], duration: 450, easing: 'easeOutCubic' });
          } else {
            anime({ targets: card, opacity: 0, scale: 0.92, duration: 300, easing: 'easeInCubic',
              complete() { card.style.display = 'none'; } });
          }
        });
      });
    });

    /* Glow follow */
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const gw = card.querySelector('.project-glow');
        if (gw) { gw.style.left = (e.clientX - r.left - 60) + 'px'; gw.style.top = (e.clientY - r.top - 60) + 'px'; }
      });
    });
  }
};

/* ============================================================
   CODE TERMINAL  — type lines on reveal
   ============================================================ */
const CodeTerminal = {
  init() {
    const term = document.querySelector('.code-terminal');
    if (!term) return;
    ScrollTriggers.add(term, () => {
      const lines = term.querySelectorAll('.term-line');
      lines.forEach((line, i) => {
        const text = line.dataset.text || line.textContent;
        line.dataset.text = text;
        line.textContent  = '';
        line.style.opacity = '0';
        setTimeout(() => {
          line.style.opacity = '1';
          let idx = 0;
          const type = () => {
            if (idx < text.length) { line.textContent += text[idx++]; setTimeout(type, 22 + Math.random() * 22); }
          };
          type();
        }, i * 480);
      });
    }, 0.7);
  }
};

/* ============================================================
   NAVBAR
   ============================================================ */
const Navbar = {
  init() {
    const nav = document.getElementById('navbar');
    const ham = document.getElementById('hamburger');
    const links = document.getElementById('nav-links');
    let open = false, lastY = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 80);
      if (y > lastY + 16 && y > 160) nav.classList.add('nav-hidden');
      else if (y < lastY - 16) nav.classList.remove('nav-hidden');
      lastY = y;
    }, { passive: true });

    ham?.addEventListener('click', () => {
      open = !open;
      links.classList.toggle('open', open);
      ham.classList.toggle('open', open);
    });
    links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      open = false; links.classList.remove('open'); ham?.classList.remove('open');
    }));
  }
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
const ContactForm = {
  init() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const btn    = document.getElementById('form-submit');
    if (!form) return;

    const shake = el => anime({ targets: el, translateX: [-6,6,-4,4,-2,2,0], duration: 400, easing: 'easeOutCubic' });

    const check = (el, errId, fn) => {
      const err = document.getElementById(errId);
      const ok  = fn(el.value);
      if (err) err.style.display = ok ? 'none' : 'block';
      el.style.borderColor = ok ? '' : 'rgba(239,68,68,0.5)';
      if (!ok) shake(el);
      return ok;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const n = document.getElementById('cf-name');
      const em = document.getElementById('cf-email');
      const s  = document.getElementById('cf-subject');
      const m  = document.getElementById('cf-message');
      if (!(
        check(n,  'err-name',    v => v.trim().length > 1) &
        check(em, 'err-email',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) &
        check(s,  'err-subject', v => v.trim().length > 1) &
        check(m,  'err-message', v => v.trim().length > 10)
      )) return;

      btn.textContent = 'Sending…'; btn.disabled = true;
      await new Promise(r => setTimeout(r, 1800));
      status.className = 'status-success';
      status.textContent = '✓ Sent! I\'ll reply within 24 hours.';
      status.style.display = 'block';
      anime({ targets: status, opacity: [0,1], translateY: [10,0], duration: 400 });
      form.reset();
      btn.textContent = 'Send Message →'; btn.disabled = false;
    });
  }
};
