/**
 * scroll.js
 * Custom smooth scroll with momentum interpolation
 * Scroll-trigger system for section animations
 * Horizontal scroll handler for the Projects section
 */

'use strict';

/* ============================================================
   SCROLL TRIGGER REGISTRY
   Works with the smooth-scroll offset so triggers fire at the
   right visual moment even though the real scrollY is ahead.
   ============================================================ */
const ScrollTriggers = (() => {
  const list = [];

  /**
   * Register an element + callback.
   * `viewportFraction` — how far into the viewport the element
   * must be before firing (0 = top edge, 1 = bottom edge).
   */
  const add = (el, cb, viewportFraction = 0.82) => {
    if (!el) return;
    list.push({ el, cb, vf: viewportFraction, fired: false });
  };

  const addAll = (selector, cb, vf = 0.82) => {
    document.querySelectorAll(selector).forEach(el => add(el, cb, vf));
  };

  /* Called every frame with the current smooth scroll value */
  const update = (smoothY) => {
    const vh = window.innerHeight;
    list.forEach(t => {
      if (t.fired) return;
      // Element's position relative to the smoothly-scrolled page
      const rect = t.el.getBoundingClientRect();
      const trueTop = rect.top + smoothY;      // absolute top
      const triggerAt = smoothY + vh * t.vf;  // current trigger line
      if (trueTop <= triggerAt) {
        t.cb(t.el);
        t.fired = true;
      }
    });
  };

  const reset = () => list.forEach(t => (t.fired = false));

  return { add, addAll, update, reset };
})();

/* ============================================================
   SMOOTH SCROLL ENGINE
   Fixed-position wrapper approach — silky momentum feel
   ============================================================ */
const SmoothScroll = (() => {
  let current   = 0;   // rendered position
  let target    = 0;   // real scroll position
  const EASE    = 0.072;
  let wrapper;
  let enabled   = true;

  const init = () => {
    wrapper = document.getElementById('smooth-wrapper');
    if (!wrapper || window.innerWidth < 768) {
      enabled = false;
      return;
    }

    // Fix the wrapper so the page "slides" under it
    wrapper.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      will-change: transform;
    `;

    const sync = () => {
      document.body.style.height = wrapper.scrollHeight + 'px';
    };
    sync();
    new ResizeObserver(sync).observe(wrapper);

    window.addEventListener('scroll', () => { target = window.scrollY; }, { passive: true });

    raf();
  };

  const raf = () => {
    requestAnimationFrame(raf);
    if (!enabled) return;

    current += (target - current) * EASE;
    if (Math.abs(current - target) < 0.08) current = target;

    wrapper.style.transform = `translateY(${-current}px)`;

    // Feed triggers
    ScrollTriggers.update(current);

    // Scroll progress bar
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const prog = maxScroll > 0 ? current / maxScroll : 0;
    const bar = document.getElementById('scroll-progress');
    if (bar) bar.style.transform = `scaleX(${prog})`;

    // Update horizontal scroll
    HorizontalScroll.update(current);
  };

  const getY = () => current;

  return { init, getY, enabled: () => enabled };
})();

/* ============================================================
   HORIZONTAL SCROLL — Projects section
   The section is extra tall so the user scrolls vertically
   while the card track translates horizontally.
   ============================================================ */
const HorizontalScroll = (() => {
  let section, track, enabled = false;
  let sectionTop = 0;
  let sectionH   = 0;
  let maxTranslate = 0;

  const init = () => {
    section = document.getElementById('projects');
    track   = document.querySelector('.projects-track');
    if (!section || !track) return;

    compute();
    window.addEventListener('resize', compute);
    enabled = true;
  };

  const compute = () => {
    sectionTop   = section.offsetTop;
    sectionH     = section.offsetHeight;
    maxTranslate = track.scrollWidth - window.innerWidth + 140; // 140 = side padding
  };

  const update = (smoothY) => {
    if (!enabled) return;
    const end = sectionTop + sectionH - window.innerHeight;
    if (smoothY < sectionTop || smoothY > end) return;

    const progress  = (smoothY - sectionTop) / (end - sectionTop);
    const translate = -maxTranslate * progress;
    track.style.transform = `translateX(${translate}px)`;
  };

  return { init, update };
})();
