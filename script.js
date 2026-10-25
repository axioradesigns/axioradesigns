(function () {
  'use strict';
  var body = document.body;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Preloader */
  var pre = $('#preloader'), started = Date.now(), finished = false;
  function finish() {
    if (finished) return; finished = true;
    var wait = Math.max(0, 900 - (Date.now() - started));
    setTimeout(function () {
      pre.classList.add('done');
      body.classList.remove('loading');
      body.classList.add('ready');
      setTimeout(function () { pre.style.display = 'none'; }, 1000);
    }, wait);
  }
  if (document.readyState === 'complete') finish(); else window.addEventListener('load', finish);
  setTimeout(finish, 2500);

  /* Navbar scroll state */
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#mobileMenu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setMenu(false); });

  /* Scroll reveal */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('in'); });

  /* Active navigation */
  var links = $$('.nav-links a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = (en.target.id === 'why' || en.target.id === 'clients') ? 'services' : en.target.id === 'location' ? 'contact' : en.target.id === 'founder' ? 'about' : en.target.id;
      links.forEach(function (a) { a.classList.remove('active'); });
      if (map[id]) map[id].classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(function (s) { spy.observe(s); });

  /* Pause infinite animations while off-screen (saves CPU/battery on mobile) */
  if ('IntersectionObserver' in window) {
    var animIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.style.animationPlayState = en.isIntersecting ? 'running' : 'paused'; });
    });
    $$('.marquee-track, .cta .lines, .hero .dot, .scroll').forEach(function (el) { animIO.observe(el); });
  }

  /* Portfolio modal */
  /* Start loading a project's images as soon as the person shows intent, so the modal opens instantly */
  function warm(d) {
    if (!d || d.dataset.warm) return; d.dataset.warm = '1';
    $$('img[loading="lazy"]', d).forEach(function (im) { im.loading = 'eager'; });
  }
  $$('[data-modal]').forEach(function (btn) {
    ['pointerenter', 'touchstart', 'focus'].forEach(function (ev) {
      btn.addEventListener(ev, function () { warm(document.getElementById(btn.dataset.modal)); }, { passive: true });
    });
  });

  var lastBtn = null;
  $$('[data-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = document.getElementById(btn.dataset.modal);
      if (!d) return;
      lastBtn = btn; d.showModal(); body.classList.add('lock');
    });
  });
  $$('dialog.modal').forEach(function (d) {
    $('.close', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { body.classList.remove('lock'); if (lastBtn) lastBtn.focus(); });
  });

  /* Contact form -> WhatsApp */
  var form = $('#form');
  function setErr(id, msg) {
    var f = document.getElementById(id).closest('.f');
    f.classList.toggle('bad', !!msg);
    $('.err', f).textContent = msg || '';
    return !msg;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var name = v('name'), email = v('email'), business = v('business'), service = v('service'), msg = v('message');
    var ok = true;
    ok = setErr('name', name ? '' : 'Please enter your name.') && ok;
    ok = setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.') && ok;
    ok = setErr('service', service ? '' : 'Please select a service.') && ok;
    ok = setErr('message', msg ? '' : 'Please tell us about your project.') && ok;
    if (!ok) { var bad = $('.f.bad input, .f.bad select, .f.bad textarea', form); if (bad) bad.focus(); return; }
    var phone = '923219602630';
    var text = 'Hello Axiora Designs,\n\nI would like to discuss a project.\n\nName: ' + name + '\nEmail: ' + email +
      '\nBusiness: ' + (business || 'N/A') + '\nService: ' + service + '\n\nMessage:\n' + msg + '\n\nThank you.';
    var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url; /* popup blocked (some mobile browsers) */
  });
  $$('input,select,textarea', form).forEach(function (el) {
    el.addEventListener('input', function () { var f = el.closest('.f'); f.classList.remove('bad'); $('.err', f).textContent = ''; });
  });
})();
