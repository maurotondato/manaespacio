/* =========================================================
   Mana · Espacio Integral — interacciones
   Vanilla JS, sin dependencias. Respeta prefers-reduced-motion.
   ========================================================= */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------------------------------------------------
     1. Header: estado "stuck" + barra de progreso de lectura
     --------------------------------------------------------- */
  const header = $('.site-header');
  const bar = $('.scroll-bar');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 24);

    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    }

    if (heroBg && !reduced.matches) {
      heroBg.style.transform = `translate3d(0, ${Math.min(y * 0.28, 320)}px, 0) scale(1.06)`;
    }

    sweepReveals();
    ticking = false;
  }

  const heroBg = $('.hero-bg');

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------------------------------------------------------
     2. Navegación móvil
     --------------------------------------------------------- */
  const navToggle = $('.nav-toggle');
  const nav = $('#nav');
  const scrim = $('.nav-scrim');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    scrim && scrim.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  }

  navToggle && navToggle.addEventListener('click', () => {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  scrim && scrim.addEventListener('click', () => setNav(false));
  nav && nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------------------------------------------------------
     3. Revelado al hacer scroll (con escalonado por grupo)

     Se resuelve con un barrido enganchado al scroll ya existente en lugar de
     IntersectionObserver: un salto de scroll (una ancla, o recargar a mitad
     de página) puede llevar un elemento de "debajo del viewport" a "encima"
     sin cruzar ningún umbral, y entonces IO no emite callback y el contenido
     se queda invisible para siempre.
     --------------------------------------------------------- */
  const pendingReveal = new Set($$('[data-reveal]'));
  const quoteText = $('[data-words]');

  // Escalonado: los hijos de un [data-stagger] entran en cascada
  $$('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 90;
    $$('[data-reveal]', group).forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
    });
  });

  /* ---------------------------------------------------------
     4. Cita: encendido palabra por palabra
     --------------------------------------------------------- */
  let quoteWords = [];
  if (quoteText) {
    const words = quoteText.textContent.trim().split(/\s+/);
    quoteText.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.transitionDelay = `${i * 26}ms`;
      quoteText.append(span, document.createTextNode(' '));
    });
    quoteWords = $$('.word', quoteText);
  }

  function lightQuote() {
    if (!quoteWords.length) return;
    quoteWords.forEach((w) => w.classList.add('is-lit'));
    quoteWords = [];
  }

  function sweepReveals() {
    if (reduced.matches) return;
    const h = window.innerHeight;

    if (pendingReveal.size) {
      pendingReveal.forEach((el) => {
        if (el.getBoundingClientRect().top < h * 0.88) {
          el.classList.add('is-in');
          pendingReveal.delete(el);
        }
      });
    }

    if (quoteWords.length && quoteText.getBoundingClientRect().top < h * 0.7) lightQuote();
  }

  if (reduced.matches) {
    pendingReveal.forEach((el) => el.classList.add('is-in'));
    pendingReveal.clear();
    lightQuote();
  } else {
    sweepReveals();
    window.addEventListener('resize', sweepReveals, { passive: true });
  }

  /* ---------------------------------------------------------
     5. Tarjetas de servicio: "Leer más"
     --------------------------------------------------------- */
  $$('.card-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const open = !card.classList.contains('is-open');
      card.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------------------------------------------------------
     6. Carrusel de testimonios
     --------------------------------------------------------- */
  const stage = $('.t-stage');
  if (stage) {
    const slides = $$('.t-slide', stage);
    const dots = $$('.t-dots button');
    let index = 0;
    let timer = null;
    const DELAY = 6500;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === index)));
    }
    function start() { if (!reduced.matches) { stop(); timer = setInterval(() => show(index + 1), DELAY); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); start(); }));

    const region = stage.closest('.testimonials');
    region.addEventListener('mouseenter', stop);
    region.addEventListener('mouseleave', start);
    region.addEventListener('focusin', stop);
    region.addEventListener('focusout', start);

    // Swipe en táctil
    let x0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
      x0 = null; start();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

    show(0);
    start();
  }

  /* ---------------------------------------------------------
     7. Dock social flotante
     --------------------------------------------------------- */
  const dock = $('.dock');
  if (dock) setTimeout(() => dock.classList.add('is-visible'), 700);

  /* ---------------------------------------------------------
     8. Pétalos del hero
     --------------------------------------------------------- */
  const petals = $('.petals');
  if (petals && !reduced.matches) {
    const COUNT = window.innerWidth < 700 ? 9 : 16;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const size = 6 + Math.random() * 11;
      p.style.cssText = `
        left:${Math.random() * 100}%;
        width:${size}px; height:${size}px;
        --drift:${(Math.random() * 180 - 90).toFixed(0)}px;
        animation-duration:${(13 + Math.random() * 14).toFixed(1)}s;
        animation-delay:-${(Math.random() * 20).toFixed(1)}s;`;
      petals.appendChild(p);
    }
  }

  /* ---------------------------------------------------------
     9. Scrollspy del menú
     --------------------------------------------------------- */
  const spyLinks = $$('#nav a[href^="#"]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const sections = spyLinks
      .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);

    const sio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((a) =>
          a.setAttribute('aria-current', String(a.getAttribute('href') === `#${entry.target.id}`))
        );
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => sio.observe(s));
  }

  /* ---------------------------------------------------------
     10. Botones magnéticos (solo puntero fino)
     --------------------------------------------------------- */
  if (window.matchMedia('(pointer: fine)').matches && !reduced.matches) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) / r.width;
        const my = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.translate = `${(mx * 10).toFixed(2)}px ${(my * 7).toFixed(2)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  /* ---------------------------------------------------------
     11. Instagram: respaldo si el widget no carga
     --------------------------------------------------------- */
  const igWidget = $('#ft2q99je5h');
  const igFallback = $('#ig-fallback');
  if (igWidget && igFallback) {
    // El widget es de un tercero y puede quedar bloqueado por extensiones de
    // privacidad. Si a los 4 s no pintó nada, mostramos el enlace directo.
    setTimeout(() => {
      const loaded = igWidget.childElementCount > 0 || igWidget.offsetHeight > 120;
      igFallback.hidden = loaded;
    }, 4000);
  }

  /* ---------------------------------------------------------
     12. Año en el pie
     --------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Estado inicial: cabecera, barra de progreso, parallax y revelados.
  onScroll();
})();
