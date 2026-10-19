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
