/**
 * cursor.js
 * Custom magnetic cursor with canvas-painted particle trail
 * Inspired by animejs.com's precision interaction design
 */

'use strict';

const Cursor = (() => {

  /* ── DOM refs ──────────────────────────────────────── */
  const dot    = document.getElementById('cursor-dot');
  const ring   = document.getElementById('cursor-ring');
  const canvas = document.getElementById('cursor-canvas');
  let ctx;

  /* ── State ─────────────────────────────────────────── */
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX, ringY = mouseY;
  let isActive   = false;    // clicking
  let isHovering = false;    // over interactive el
  const trail = [];          // { x, y, alpha } path history

  /* ── Initialise ────────────────────────────────────── */
  const init = () => {
    // Bail on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    ctx = canvas.getContext('2d');
    resize();

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', () => { isActive = true;  ring.classList.add('click'); });
    document.addEventListener('mouseup',   () => { isActive = false; ring.classList.remove('click'); });
    window.addEventListener('resize', resize);

    loop();
  };

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  /* ── Mouse move ────────────────────────────────────── */
  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    // Record trail
    trail.push({ x: mouseX, y: mouseY, alpha: 0.6 });
    if (trail.length > 28) trail.shift();
  };

  /* ── Hover interactables ───────────────────────────── */
  const bindHovers = () => {
    document.querySelectorAll(
      'a, button, .project-card, .skill-orb, .filter-btn, .contact-item, .tl-card, label'
    ).forEach(el => {
      el.addEventListener('mouseenter', () => {
        isHovering = true;
        ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        isHovering = false;
        ring.classList.remove('hover');
      });
    });
  };

  /* ── RAF loop ──────────────────────────────────────── */
  const loop = () => {
    requestAnimationFrame(loop);

    /* Lag the ring */
    ringX += (mouseX - ringX) * 0.10;
    ringY += (mouseY - ringY) * 0.10;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    /* Paint trail */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, i) => {
      const t = i / trail.length;
      const r = t * 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 51, ${t * 0.18})`;
      ctx.fill();
    });
  };

  return { init, bindHovers };
})();
