// Menu overlay: open/close, Escape to close, keep focus inside while open.
(function () {
  var menu = document.getElementById('site-menu');
  var openBtn = document.querySelector('.menu-toggle');
  if (!menu || !openBtn) return;
  var closeBtn = menu.querySelector('.menu-close');

  function focusables() {
    return menu.querySelectorAll('a[href], button:not([disabled])');
  }

  function open() {
    menu.classList.add('is-open');
    menu.removeAttribute('aria-hidden');
    menu.inert = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeBtn.focus();
  }

  function close() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    openBtn.focus();
  }

  menu.inert = true;
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// Stats: count up from zero the first time each figure scrolls into view.
// The final figure stays in the HTML, so it still shows without JavaScript.
(function () {
  var values = document.querySelectorAll('.stat__value');
  if (!values.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var DURATION = 1600;
  var format = new Intl.NumberFormat('en-GB');

  function prepare(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return null;
    var match = node.nodeValue.match(/^(\D*)([\d,]+)$/);
    if (!match) return null;
    var target = parseInt(match[2].replace(/,/g, ''), 10);
    if (target === 0) return null;

    var num = document.createElement('span');
    num.className = 'stat__num';
    num.textContent = match[2];
    el.replaceChild(num, node);
    if (match[1]) el.insertBefore(document.createTextNode(match[1]), num);

    // Reserve the final width so the row does not shift while counting.
    num.style.minWidth = num.getBoundingClientRect().width + 'px';
    num.textContent = '0';
    return { el: num, target: target };
  }

  function run(stat) {
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      stat.el.textContent = format.format(Math.round(stat.target * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target._stat);
    });
  }, { threshold: 0.6 });

  // Wait for the web fonts so the reserved width matches the final figure.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    values.forEach(function (el) {
      var stat = prepare(el);
      if (!stat) return;
      el._stat = stat;
      observer.observe(el);
    });
  });
})();
