/* =====================================================================
   Menú lateral del sitio (☰). En celular reemplaza a los enlaces del
   encabezado, que no caben; en las sesiones aparece siempre, porque su
   encabezado solo trae los puntos de sesión.
   Trae los enlaces del sitio y, si la página es de un curso
   (window.COURSE_META), los de ese curso: inicio, temario, formulario y quiz.
   Se cierra con Esc, tocando fuera o con la ✕; el foco regresa al botón.
   ===================================================================== */
(function () {
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/shared\/js\/site-menu\.js(\?.*)?$/, '') : '/';

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'html') n.innerHTML = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  // ¿Esta página es la del enlace? Compara rutas sin el index.html ni el #.
  function here(url) {
    var a = new URL(url, location.href), b = location;
    function clean(p) { return p.replace(/index\.html$/, ''); }
    return clean(a.pathname) === clean(b.pathname) && (!a.hash || a.hash === b.hash) && (!a.search || a.search === b.search);
  }
  function item(label, url, note) {
    var cur = here(url);
    return h('li', {}, [h('a', { href: url, 'aria-current': cur ? 'page' : null }, [h('span', {}, [label]), note ? h('small', {}, [note]) : null])]);
  }

  var panel = null, button = null, last = null;
  function build() {
    // Solo si la página es de ese curso: el lanzador de quizzes carga las metas de todos.
    var M = window.COURSE_META && location.pathname.indexOf('/' + window.COURSE_META.slug + '/') >= 0 ? window.COURSE_META : null;
    var groups = [];
    if (M) {
      groups.push(h('p', { class: 'site-menu__label' }, [M.name]));
      groups.push(h('ul', { class: 'site-menu__list' }, [
        item('Inicio del curso', ROOT + M.slug + '/'),
        item('Temario', ROOT + M.slug + '/#temario', M.sessions + ' sesiones'),
        item('Formulario', ROOT + 'formularios/' + M.slug + '/', 'para imprimir'),
        item('Quiz y simulacro', ROOT + 'quiz/?curso=' + M.code)
      ]));
    }
    groups.push(h('p', { class: 'site-menu__label' }, ['Cuaderno del Borrego']));
    groups.push(h('ul', { class: 'site-menu__list' }, [
      item('Inicio', ROOT),
      item('Cursos', ROOT + '#biblioteca', 'Cálculo y Física'),
      item('Practicar', ROOT + 'quiz/', 'quizzes y simulacros'),
      item('Formularios', ROOT + 'formularios/'),
      item('Créditos y licencias', ROOT + 'creditos/')
    ]));
    var close = h('button', { type: 'button', class: 'site-menu__close', 'aria-label': 'Cerrar menú', html: ICON.close });
    close.addEventListener('click', hide);
    panel = h('div', { class: 'site-menu', id: 'site-menu', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menú', hidden: true }, [
      h('div', { class: 'site-menu__backdrop', 'data-close': '' }),
      h('nav', { class: 'site-menu__panel', 'aria-label': 'Menú del sitio' }, [
        h('div', { class: 'site-menu__head' }, [h('strong', {}, ['Menú']), close]),
        h('div', { class: 'site-menu__body' }, groups)
      ])
    ]);
    panel.querySelector('[data-close]').addEventListener('click', hide);
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
      if (e.key !== 'Tab') return;
      // El foco no sale del menú mientras está abierto.
      var f = panel.querySelectorAll('a, button'), first = f[0], end = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
    });
    // Un enlace al mismo documento (#temario) solo cierra el menú y deja que el navegador baje.
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) hide(); });
    document.body.appendChild(panel);
  }
  function show() {
    if (!panel) build();
    last = document.activeElement;
    panel.hidden = false;
    document.documentElement.classList.add('site-menu-open');
    button.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { panel.classList.add('is-open'); (panel.querySelector('[aria-current]') || panel.querySelector('a')).focus(); });
  }
  function hide() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('site-menu-open');
    button.setAttribute('aria-expanded', 'false');
    var done = function () { panel.hidden = true; };
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else setTimeout(done, 200);
    if (last && last.focus) last.focus();
  }

  function mount() {
    var head = document.querySelector('.site-header .container');
    if (!head || head.querySelector('.site-menu-btn')) return;
    button = h('button', { type: 'button', class: 'site-menu-btn', 'aria-label': 'Abrir menú', 'aria-expanded': 'false', 'aria-controls': 'site-menu', html: ICON.menu });
    button.addEventListener('click', function () { if (panel && !panel.hidden) hide(); else show(); });
    // En las sesiones va junto al menú de sesiones; en las demás, al final del encabezado.
    var end = head.querySelector('.session-header__end') || head.querySelector('.site-nav') || head;
    end.appendChild(button);
    if (head.closest('.session-header')) document.documentElement.classList.add('has-session-header');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.CBMenu = { mount: mount, show: function () { mount(); show(); }, hide: hide };
})();
