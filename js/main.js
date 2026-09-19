/* ============================================================
   Page behaviour: loader, menu, scroll indicator, sticky works,
   statement text fill, about frame, footer scramble.
   ============================================================ */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- loader ---------- */
  var loader = $('#loader');
  var readyDone = false;
  function ready() {
    if (readyDone) return;
    readyDone = true;
    doc.classList.add('is-ready');
    if (loader) {
      loader.setAttribute('data-hidden', '');
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
    }
    update();
  }
  if (loader) {
    /* stagger the name letters */
    $$('.loader__name span', loader).forEach(function (el, i) { el.style.animationDelay = (0.25 + i * 0.05) + 's'; });
  }
  window.addEventListener('load', function () { setTimeout(ready, reduce ? 50 : 1750); });
  setTimeout(ready, 4200); /* never trap the visitor behind the loader */

  /* ---------- side menu ---------- */
  var burger = $('.burger');
  var menu = $('.sidemenu');
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.setAttribute('data-open', open ? 'true' : 'false');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.getAttribute('data-open') !== 'true'); });
    $('.sidemenu__backdrop', menu).addEventListener('click', function () { setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- scramble text on hover ---------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#_';
  $$('[data-scramble]').forEach(function (el) {
    var original = el.textContent;
    var timer = null;
    el.addEventListener('mouseenter', function () {
      if (reduce) return;
      var frame = 0, total = 14;
      clearInterval(timer);
      timer = setInterval(function () {
        frame++;
        var out = '';
        for (var i = 0; i < original.length; i++) {
          var ch = original[i];
          if (ch === ' ') { out += ' '; continue; }
          var reveal = (i / original.length) * total * 0.7;
          out += frame > reveal ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (frame >= total) { clearInterval(timer); el.textContent = original; }
      }, 32);
    });
  });

  /* ---------- sections ---------- */
  var sectionEls = $$('[data-section]');
  var indicatorItems = $$('.indicator__item');
  var menuItems = $$('.sidemenu__item');
  indicatorItems.forEach(function (it) {
    it.addEventListener('click', function () {
      var t = document.getElementById(it.getAttribute('data-target'));
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  var activeSection = '';
  function setActive(id) {
    if (id === activeSection) return;
    activeSection = id;
    indicatorItems.forEach(function (it) { it.setAttribute('data-active', it.getAttribute('data-target') === id ? 'true' : 'false'); });
    menuItems.forEach(function (it) { it.setAttribute('data-active', it.getAttribute('data-target') === id ? 'true' : 'false'); });
  }

  /* ---------- works (sticky swap) ---------- */
  var works = $('#work');
  var workItems = $$('.work');
  var workCount = workItems.length;
  var workCurrent = -1;
  var counterEl = $('[data-current]');
  var totalEl = $('[data-total]');
  var progressEl = $('.works__progress');
  if (works) works.style.setProperty('--count', workCount);
  if (totalEl) totalEl.textContent = workCount < 10 ? '0' + workCount : String(workCount);

  function setWork(idx) {
    if (idx === workCurrent) return;
    workCurrent = idx;
    workItems.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-past', i < idx);
    });
    if (counterEl) counterEl.textContent = idx + 1 < 10 ? '0' + (idx + 1) : String(idx + 1);
  }
  function scrollToWork(idx) {
    if (!works) return;
    idx = clamp(idx, 0, workCount - 1);
    var vh = window.innerHeight;
    var top = works.getBoundingClientRect().top + window.pageYOffset;
    /* land in the middle of that item's scroll band */
    window.scrollTo({ top: top + (idx + 0.5) * vh, behavior: reduce ? 'auto' : 'smooth' });
  }
  var prevBtn = $('[data-work-prev]'), nextBtn = $('[data-work-next]');
  if (prevBtn) prevBtn.addEventListener('click', function () { scrollToWork(workCurrent - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollToWork(workCurrent + 1); });

  /* ---------- statements (text fill) ---------- */
  var statements = $$('.statement').map(function (el) {
    return { el: el, inner: $('.statement__inner', el), lines: $$('.fill', el), en: $('.statement__en', el) };
  });

  /* ---------- services reveal ---------- */
  var services = $$('.service');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    services.forEach(function (s) { io.observe(s); });
  } else {
    services.forEach(function (s) { s.classList.add('is-in'); });
  }

  /* ---------- about frame ---------- */
  var about = $('#about');

  /* ---------- scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  function update() {
    ticking = false;
    var sy = window.pageYOffset;
    var vh = window.innerHeight;

    /* hero */
    var heroP = clamp(sy / vh, 0, 1);
    doc.style.setProperty('--hero-p', heroP.toFixed(3));
    doc.classList.toggle('is-scrolled', heroP > 0.08);

    /* works */
    if (works) {
      var wr = works.getBoundingClientRect();
      var wp = clamp(-wr.top / (wr.height - vh), 0, 1);
      var idx = Math.min(workCount - 1, Math.floor(wp * workCount));
      if (wr.top < vh && wr.bottom > 0) setWork(idx);
      if (progressEl) progressEl.style.setProperty('--p', ((idx + 1) / workCount).toFixed(3));
    }

    /* statements */
    statements.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var p = clamp(-r.top / (r.height - vh), 0, 1);
      var visible = r.top < vh && r.bottom > 0;
      /* fade in as the section enters the viewport, not only once it is pinned */
      var enter = clamp((vh - r.top) / (vh * 0.6), 0, 1);
      s.inner.style.setProperty('--in', visible ? enter.toFixed(3) : '0');
      s.lines.forEach(function (line, i) {
        var lp = clamp((p * 1.35 - 0.12 - i * 0.28) / 0.45, 0, 1);
        line.style.setProperty('--p', lp.toFixed(3));
      });
      if (s.en) s.en.style.setProperty('--p2', clamp((p - 0.45) / 0.3, 0, 1).toFixed(3));
    });

    /* about frame */
    var aboutP = 0;
    if (about) {
      var ar = about.getBoundingClientRect();
      aboutP = clamp((vh * 0.92 - ar.top) / (vh * 0.7), 0, 1);
      about.style.setProperty('--p', aboutP.toFixed(3));
    }

    /* active section */
    var current = sectionEls[0] ? sectionEls[0].getAttribute('data-section') : '';
    for (var i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i].getBoundingClientRect().top <= vh * 0.5) current = sectionEls[i].getAttribute('data-section');
    }
    setActive(current);
    doc.classList.toggle('is-footer', current === 'contact');

    /* background scene: full in the hero, ambient afterwards, gone at "about" */
    if (window.HERO) {
      var fade = 1 - 0.72 * heroP;
      fade *= 1 - aboutP;
      window.HERO.setScroll({ hero: heroP, fade: clamp(fade, 0, 1) });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
