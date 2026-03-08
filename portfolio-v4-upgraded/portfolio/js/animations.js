/**
 * ANIMATIONS.JS
 * All animation controllers for Deepak Sharma's Portfolio
 * ─────────────────────────────────────────────────────────
 * Modules:
 *  • TextScramble       — cyberpunk character scramble effect
 *  • ScrollTrigger      — IntersectionObserver-based trigger manager
 *  • FadeAnimations     — section entrance animations
 *  • SkillBars          — animated skill progress bars
 *  • CountUp            — number roll animation
 *  • CardTilt           — 3D perspective tilt on cards
 *  • MagneticButton     — magnetic pull effect on CTA buttons
 *  • Timeline           — animated experience timeline
 *  • SkillChips         — staggered chip entrance
 *  • ProjectFilter      — filter cards with animation
 *  • ScrollProgress     — top progress bar
 *  • Parallax           — scroll parallax
 *  • ContactForm        — form validation & submission
 */

'use strict';

/* ============================================================
   TEXT SCRAMBLE
   Cyberpunk character scramble → reveal final text
   ============================================================ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const length = Math.max(this.el.innerText.length, newText.length);
    const promise = new Promise(res => (this.resolve = res));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from  = this.el.innerText[i] || '';
      const to    = newText[i] || '';
      const start = Math.floor(Math.random() * 25);
      const end   = start + Math.floor(Math.random() * 25);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let done   = 0;
    for (const item of this.queue) {
      const { to, start, end } = item;
      if (this.frame >= end) {
        done++;
        output += to;
      } else if (this.frame >= start) {
        if (!item.char || Math.random() < 0.3) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }
    this.el.innerHTML = output;
    if (done === this.queue.length) {
      this.resolve();
    } else {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

/* ============================================================
   SCROLL TRIGGER MANAGER
   ============================================================ */
const ScrollTrigger = (() => {
  const map = new Map();
  let observer;

  const ensureObserver = () => {
    if (observer) return;
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cb = map.get(entry.target);
        if (cb) {
          cb(entry.target);
          if (!entry.target.dataset.stRepeat) {
            observer.unobserve(entry.target);
            map.delete(entry.target);
          }
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  };

  const on = (el, cb) => {
    if (!el) return;
    ensureObserver();
    map.set(el, cb);
    observer.observe(el);
  };

  const onAll = (selector, cb, staggerMs = 0) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      on(el, () => setTimeout(() => cb(el, i), staggerMs * i));
    });
  };

  return { on, onAll };
})();

/* ============================================================
   FADE ANIMATIONS — section entrance
   ============================================================ */
const FadeAnimations = {
  init() {
    /* section labels slide in from left */
    ScrollTrigger.onAll('.section-label', (el) => {
      anime({ targets: el, opacity: [0, 1], translateX: [-32, 0], duration: 700, easing: 'easeOutExpo' });
    }, 80);

    /* section titles — word-by-word reveal */
    ScrollTrigger.onAll('.section-title', (el) => {
      const raw = el.innerText;
      const words = raw.split(/\s+/);
      el.innerHTML = words
        .map(w => `<span class="st-wrap"><span class="st-word">${w}</span></span>`)
        .join(' ');
      anime({
        targets: el.querySelectorAll('.st-word'),
        translateY: ['105%', '0%'],
        opacity: [0, 1],
        duration: 900,
        delay: anime.stagger(100),
        easing: 'easeOutExpo'
      });
    });

    /* decorative line */
    ScrollTrigger.onAll('.section-line', (el) => {
      anime({ targets: el, width: [0, 60], opacity: [0, 1], duration: 900, delay: 350, easing: 'easeOutExpo' });
    });

    /* generic fade-up */
    ScrollTrigger.onAll('.fade-up', (el) => {
      anime({ targets: el, translateY: [50, 0], opacity: [0, 1], duration: 800, easing: 'easeOutExpo' });
    }, 60);

    /* stat items */
    ScrollTrigger.onAll('.stat-item', (el, i) => {
      anime({ targets: el, opacity: [0, 1], translateY: [30, 0], scale: [0.96, 1], duration: 700, delay: i * 100, easing: 'easeOutExpo' });
    }, 100);

    /* info items */
    ScrollTrigger.onAll('.info-item', (el, i) => {
      anime({ targets: el, opacity: [0, 1], translateX: [-20, 0], duration: 600, delay: i * 80, easing: 'easeOutCubic' });
    }, 80);

    /* exp cards */
    ScrollTrigger.onAll('.exp-card', (el, i) => {
      anime({ targets: el, opacity: [0, 1], translateY: [40, 0], duration: 700, delay: i * 120, easing: 'easeOutExpo' });
    }, 120);

    /* contact items */
    ScrollTrigger.onAll('.contact-item', (el, i) => {
      anime({ targets: el, opacity: [0, 1], translateX: [-30, 0], duration: 600, delay: i * 90, easing: 'easeOutExpo' });
    }, 90);
  }
};

/* ============================================================
   SKILL BARS
   ============================================================ */
const SkillBars = {
  init() {
    document.querySelectorAll('.skill-fill').forEach(bar => {
      const w = bar.dataset.width;
      bar.style.width = '0%';
      ScrollTrigger.on(bar, () => {
        anime({ targets: bar, width: w + '%', duration: 1800, easing: 'easeOutExpo', delay: 200 });
        // Glow tip pulse
        bar.classList.add('bar-animating');
        setTimeout(() => bar.classList.remove('bar-animating'), 2200);
      });
    });
  }
};

/* ============================================================
   COUNT UP
   ============================================================ */
const CountUp = {
  run(el, target, suffix = '') {
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  init() {
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      el.textContent = '0' + suffix;
      ScrollTrigger.on(el, () => this.run(el, target, suffix));
    });
  }
};

/* ============================================================
   3D CARD TILT
   ============================================================ */
const CardTilt = {
  init(selector = '.tilt-card') {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r   = card.getBoundingClientRect();
        const x   = e.clientX - r.left;
        const y   = e.clientY - r.top;
        const cx  = r.width  / 2;
        const cy  = r.height / 2;
        const rX  = ((y - cy) / cy) * -10;
        const rY  = ((x - cx) / cx) *  10;

        card.style.transform    = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(8px)`;
        card.style.transition   = 'transform 0.08s linear';

        const shine = card.querySelector('.card-shine');
        if (shine) {
          const px = (x / r.width)  * 100;
          const py = (y / r.height) * 100;
          shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.07), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
        const shine = card.querySelector('.card-shine');
        if (shine) shine.style.background = 'none';
      });
    });
  }
};

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
const MagneticButton = {
  init(selector = '.magnetic') {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r   = btn.getBoundingClientRect();
        const x   = e.clientX - r.left - r.width  / 2;
        const y   = e.clientY - r.top  - r.height / 2;
        anime({ targets: btn, translateX: x * 0.35, translateY: y * 0.35, duration: 300, easing: 'easeOutCubic' });
      });
      btn.addEventListener('mouseleave', () => {
        anime({ targets: btn, translateX: 0, translateY: 0, duration: 600, easing: 'easeOutElastic(1, .5)' });
      });
    });
  }
};

/* ============================================================
   EXPERIENCE TIMELINE
   ============================================================ */
const Timeline = {
  init() {
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.style.opacity = '0';
      ScrollTrigger.on(item, () => {
        anime({
          targets: item,
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 700,
          delay: i * 150,
          easing: 'easeOutExpo'
        });
        const dot = item.querySelector('.tl-dot');
        if (dot) {
          setTimeout(() => {
            anime({ targets: dot, scale: [0, 1], duration: 500, easing: 'easeOutBack' });
          }, 300 + i * 150);
        }
      });
    });

    /* Animated vertical line */
    const line = document.querySelector('.tl-line-fill');
    if (line) {
      ScrollTrigger.on(document.querySelector('.timeline-track'), () => {
        anime({ targets: line, height: ['0%', '100%'], duration: 1400, easing: 'easeOutExpo' });
      });
    }
  }
};

/* ============================================================
   SKILL CHIPS — staggered entrance from centre
   ============================================================ */
const SkillChips = {
  init() {
    const container = document.querySelector('.skill-chips');
    if (!container) return;
    const chips = [...container.querySelectorAll('.skill-chip')];
    chips.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(20px) scale(0.88)'; });
    ScrollTrigger.on(container, () => {
      anime({
        targets: chips,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.88, 1],
        delay: anime.stagger(45, { from: 'center' }),
        duration: 500,
        easing: 'easeOutBack'
      });
    });
  }
};

/* ============================================================
   PROJECT FILTER (with animation)
   ============================================================ */
const ProjectFilter = {
  init() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach(card => {
          const cats = card.dataset.category || '';
          const show = filter === 'all' || cats.split(' ').includes(filter);
          if (show) {
            card.style.display = '';
            anime({ targets: card, opacity: [0, 1], scale: [0.94, 1], translateY: [20, 0], duration: 420, easing: 'easeOutCubic' });
          } else {
            anime({
              targets: card, opacity: 0, scale: 0.94, duration: 280, easing: 'easeInCubic',
              complete() { card.style.display = 'none'; }
            });
          }
        });
      });
    });

    /* Mouse glow tracking */
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
   SCROLL PROGRESS BAR
   ============================================================ */
const ScrollProgress = {
  init() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${pct})`;
    }, { passive: true });
  }
};

/* ============================================================
   PARALLAX
   ============================================================ */
const Parallax = {
  init() {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;

      const hc = document.querySelector('.hero-content');
      if (hc) { hc.style.transform = `translateY(${s * 0.22}px)`; hc.style.opacity = Math.max(0, 1 - s / 550); }

      const si = document.getElementById('scroll-indicator');
      if (si) { si.style.opacity = Math.max(0, 1 - s / 180); }
    }, { passive: true });
  }
};

/* ============================================================
   CODE TERMINAL — animated line-by-line reveal
   ============================================================ */
const CodeTerminal = {
  typeLines(terminal) {
    const lines = terminal.querySelectorAll('.term-line');
    lines.forEach((line, i) => {
      line.style.opacity = '0';
      const text = line.dataset.text || line.textContent.trim();
      line.textContent = '';
      line.dataset.text = text;

      setTimeout(() => {
        line.style.opacity = '1';
        let idx = 0;
        const type = () => {
          if (idx < text.length) {
            line.textContent += text[idx++];
            setTimeout(type, 22 + Math.random() * 28);
          }
        };
        type();
      }, i * 500);
    });
  },

  init() {
    const terminal = document.querySelector('.code-terminal');
    if (!terminal) return;
    ScrollTrigger.on(terminal, () => this.typeLines(terminal));
  }
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
const ContactForm = {
  init() {
    const form      = document.getElementById('contact-form');
    const status    = document.getElementById('form-status');
    const submitBtn = document.getElementById('form-submit');
    if (!form) return;

    const shake = (el) => anime({ targets: el, translateX: [-6, 6, -4, 4, -2, 2, 0], duration: 450, easing: 'easeOutCubic' });

    const validate = (el, errId, check) => {
      const err = document.getElementById(errId);
      const ok  = check(el.value);
      if (err) err.style.display = ok ? 'none' : 'block';
      el.style.borderColor = ok ? '' : 'rgba(239,68,68,0.55)';
      if (!ok) shake(el);
      return ok;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name    = document.getElementById('cf-name');
      const email   = document.getElementById('cf-email');
      const subject = document.getElementById('cf-subject');
      const msg     = document.getElementById('cf-message');

      const v1 = validate(name,    'err-name',    v => v.trim().length > 1);
      const v2 = validate(email,   'err-email',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      const v3 = validate(subject, 'err-subject', v => v.trim().length > 1);
      const v4 = validate(msg,     'err-message', v => v.trim().length > 10);

      if (!(v1 && v2 && v3 && v4)) return;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled    = true;

      await new Promise(r => setTimeout(r, 1800));

      status.className  = 'status-success';
      status.textContent = '✓ Message sent! I\'ll reply within 24 hours.';
      status.style.display = 'block';
      anime({ targets: status, opacity: [0, 1], translateY: [10, 0], duration: 400, easing: 'easeOutCubic' });
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled    = false;
    });

    /* Live clear status */
    ['cf-name','cf-email','cf-subject','cf-message'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => { if (status) status.style.display = 'none'; });
    });
  }
};

/* ============================================================
   CARD HOVER GLOW (exp + contact cards)
   ============================================================ */
const CardGlow = {
  init() {
    document.querySelectorAll('.exp-card, .contact-item').forEach(card => {
      card.addEventListener('mouseenter', () =>
        anime({ targets: card, boxShadow: '0 24px 64px rgba(0,245,255,0.09)', duration: 300, easing: 'easeOutCubic' })
      );
      card.addEventListener('mouseleave', () =>
        anime({ targets: card, boxShadow: '0 0 0 rgba(0,245,255,0)', duration: 300, easing: 'easeOutCubic' })
      );
    });
  }
};
