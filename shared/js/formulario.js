/* =====================================================================
   Formulario de un curso (data/<curso>/formulario.js) en una hoja
   imprimible. Cada sección enlaza a las sesiones donde se explica.
   Al imprimir se usa siempre el tema claro (cuaderno) y se regresa después.
   ===================================================================== */
(function () {
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'html') n.innerHTML = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function render(root, F, meta, base) {
    var tag = {};
    meta.groups.forEach(function (g) { g.sessions.forEach(function (s) { tag[s.n] = s; }); });
    function link(n) {
      var s = tag[n];
      if (!s) return null;
      var label = 'S' + pad(n) + (s.tag ? ' · ' + s.tag : '');
      return s.ready ? h('a', { class: 'form-sess', href: base + meta.slug + '/sesiones/sesion-' + pad(n) + '/' }, [label]) : h('span', { class: 'form-sess is-soon' }, [label]);
    }
    var grid = h('div', { class: 'form-grid' });
    F.sections.forEach(function (sec) {
      var list = h('ul', { class: 'form-list' }, sec.items.map(function (it) {
        // Etiqueta arriba (y la sesión, si la sección abarca varias); la fórmula abajo, sin partirse.
        var own = it.s && !(sec.sessions && sec.sessions.length === 1) ? link(it.s) : null;
        var sub = it.label || own ? h('div', { class: 'form-label' }, [it.label || null, own]) : null;
        return h('li', {}, [sub, h('div', { class: 'form-tex', html: '$' + it.tex + '$' })]);
      }));
      var sess = sec.sessions && sec.sessions.length ? h('p', { class: 'form-sessions' }, sec.sessions.map(link)) : null;
      grid.appendChild(h('section', { class: 'form-sec' }, [h('h2', {}, [sec.title]), sess, list]));
    });
    root.appendChild(grid);
    if (window.CBMath) window.CBMath.render(root);
  }

  // Imprimir siempre en tema claro: el pizarrón gasta tinta y se lee peor en papel.
  // Algunos navegadores disparan beforeprint dos veces: solo se guarda el tema la primera.
  var saved = null, printing = false;
  window.addEventListener('beforeprint', function () {
    if (printing) return;
    printing = true;
    saved = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  window.addEventListener('afterprint', function () {
    if (!printing) return;
    printing = false;
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  });

  window.CBFormulario = { render: render };
})();
