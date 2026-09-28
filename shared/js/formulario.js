/* =====================================================================
   Formulario de un curso (data/<curso>/formulario.js) en una hoja
   imprimible. Cada sección enlaza a las sesiones donde se explica.
   "Elegir temas" arma un formulario a la medida: solo las sesiones
   marcadas (o un atajo de parcial). La selección viaja en la URL
   (?s=6-10, &b=0 sin los básicos) para compartirla o imprimirla.
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

  // "1-3,6,9-10" ⇄ [1, 2, 3, 6, 9, 10]
  function parseList(s) {
    var out = [];
    String(s || '').split(',').forEach(function (part) {
      var m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return;
      for (var i = +m[1]; i <= +(m[2] || m[1]); i++) if (out.indexOf(i) < 0) out.push(i);
    });
    return out.sort(function (a, b) { return a - b; });
  }
  function listToString(list) {
    var out = [], i = 0;
    while (i < list.length) {
      var j = i;
      while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
      out.push(j > i ? list[i] + '-' + list[j] : String(list[i]));
      i = j + 1;
    }
    return out.join(',');
  }
  function rangeLabel(list) {
    return listToString(list).split(',').map(function (p) { return p.split('-').map(function (n) { return 'S' + pad(+n); }).join('–'); }).join(', ');
  }

  // Parte una fórmula en sus piezas de primer nivel ("A,\quad B" o "A:\ \ B") para que, si no
  // caben en un renglón, se acomoden en varios en vez de mostrar una barra de desplazamiento.
  var SEP = /^[,:;]\s*(\\qquad|\\quad|\\ \\ )\s*/;
  function pieces(tex) {
    var out = [], depth = 0, start = 0, i = 0;
    while (i < tex.length) {
      var c = tex[i];
      if (c === '\\' && /^\\left\b/.test(tex.slice(i))) { depth++; i += 5; continue; }
      if (c === '\\' && /^\\right\b/.test(tex.slice(i))) { depth--; i += 6; continue; }
      if (c === '\\') { i += 2; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 0) {
        var m = tex.slice(i).match(SEP);
        if (m) { out.push(tex.slice(start, i + 1).trim()); i += m[0].length; start = i; continue; }
      }
      i++;
    }
    out.push(tex.slice(start).trim());
    return out.filter(Boolean);
  }
  function texNode(tex) {
    return h('div', { class: 'form-tex' }, pieces(tex).map(function (p) {
      return h('span', { class: 'form-tex__part', html: '$\\displaystyle ' + p + '$' });
    }));
  }

  function render(root, F, meta, base) {
    var tag = {}, all = [];
    meta.groups.forEach(function (g) { g.sessions.forEach(function (s) { tag[s.n] = s; all.push(s.n); }); });
    var hasBasics = F.sections.some(function (sec) { return !(sec.sessions && sec.sessions.length); });
    var params = new URLSearchParams(location.search);
    var picked = params.get('s') ? parseList(params.get('s')).filter(function (n) { return tag[n]; }) : all.slice();
    if (!picked.length) picked = all.slice();
    var basics = params.get('b') !== '0';

    function link(n) {
      var s = tag[n];
      if (!s) return null;
      var label = 'S' + pad(n) + (s.tag ? ' · ' + s.tag : '');
      return s.ready ? h('a', { class: 'form-sess', href: base + meta.slug + '/sesiones/sesion-' + pad(n) + '/' }, [label]) : h('span', { class: 'form-sess is-soon' }, [label]);
    }
    function isAll() { return picked.length === all.length && (basics || !hasBasics); }

    /* ---------- Selector de temas (solo en pantalla) ---------- */
    var boxes = {}, basicsBox = null;
    var presets = ((window.QUIZ_PRESETS && window.QUIZ_PRESETS.presets) || []).filter(function (p) { return p.kind === 'exam' && p.id !== 'final'; });
    var summary = h('span', { class: 'form-pick__summary mono' });
    var pick = h('details', { class: 'form-pick' }, [
      h('summary', {}, [
        h('span', { class: 'form-pick__btn', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span>Elegir temas</span>' }),
        h('span', { class: 'form-pick__now' }, ['Mostrando: ', summary])
      ]),
      h('div', { class: 'form-pick__body' }, [
        h('div', { class: 'form-pick__presets' }, [shortcut('Todo el curso', all)].concat(presets.map(function (p) {
          return shortcut(p.label + ' · S' + pad(p.sessions[0]) + '–S' + pad(p.sessions[p.sessions.length - 1]), p.sessions);
        })).concat(meta.groups.map(function (g) {
          return shortcut('Bloque ' + g.id, g.sessions.map(function (s) { return s.n; }));
        }))),
        hasBasics ? h('label', { class: 'form-pick__basics' }, [basicsBox = h('input', { type: 'checkbox' }), ' Incluir los básicos (álgebra, trigonometría y otras fórmulas generales)']) : null
      ].concat(meta.groups.map(function (g) {
        return h('div', { class: 'form-pick__group' }, [
          h('p', { class: 'crumb' }, ['Bloque ' + g.id + ' · ' + g.label]),
          h('div', { class: 'form-pick__sessions' }, g.sessions.map(function (s) {
            var cb = boxes[s.n] = h('input', { type: 'checkbox' });
            cb.addEventListener('change', fromBoxes);
            return h('label', { class: 'sess-chip', title: s.title }, [cb, h('span', { class: 'sess-chip__n mono' }, ['S' + pad(s.n)]), s.tag ? h('span', { class: 'sess-chip__tag' }, [s.tag]) : null]);
          }))
        ]);
      })))
    ]);
    if (basicsBox) basicsBox.addEventListener('change', fromBoxes);
    function shortcut(label, list) {
      var b = h('button', { type: 'button', class: 'btn btn--ghost btn--small' }, [label]);
      b.addEventListener('click', function () { picked = list.filter(function (n) { return tag[n]; }); update(); });
      return b;
    }
    function fromBoxes() {
      var next = all.filter(function (n) { return boxes[n].checked; });
      if (basicsBox) basics = basicsBox.checked;
      if (!next.length && !basics) { boxes[picked[0] || all[0]].checked = true; return; }   // nunca una hoja vacía
      picked = next;
      update();
    }

    var scope = h('p', { class: 'form-scope mono' });
    var pageStyle = document.head.appendChild(h('style', { id: 'form-page-head' }));
    // Marco impreso. Chrome/Edge 131+ lo dibujan con las cajas de margen de @page (formulario.css).
    // Firefox y Safari no las soportan: ahí el marco son dos franjas fijas que el navegador repite
    // en cada hoja, y la página va sin margen para que no imprima su propio encabezado.
    var chrome = (navigator.userAgent.match(/Chrom(?:e|ium)\/(\d+)/) || [])[1];
    var fallback = params.get('impresion') === 'simple' || !(+chrome >= 131);
    var frameTitle = h('span', { class: 'print-frame__title' });
    if (fallback) {
      document.documentElement.classList.add('print-fallback');
      document.head.appendChild(h('style', {}, ['@media print { @page { margin: 0; } }']));
      document.body.appendChild(h('div', { class: 'print-frame print-frame--top', 'aria-hidden': 'true' }, [
        h('span', { class: 'print-frame__brand' }, [h('img', { src: base + 'shared/img/marca-impresion.svg', alt: '' }), 'Cuaderno del Borrego']), frameTitle
      ]));
      document.body.appendChild(h('div', { class: 'print-frame print-frame--bottom', 'aria-hidden': 'true' }, [
        h('span', {}, ['Clases universitarias · proyecto de alumnos, no oficial'])
      ]));
    }
    var grid = h('div', { class: 'form-grid' });
    root.appendChild(pick);
    root.appendChild(scope);
    root.appendChild(grid);

    function draw() {
      grid.innerHTML = '';
      var on = {};
      picked.forEach(function (n) { on[n] = true; });
      F.sections.forEach(function (sec) {
        var secSess = sec.sessions || [];
        if (secSess.length ? !secSess.some(function (n) { return on[n]; }) : !basics) return;
        var items = sec.items.filter(function (it) { return it.s == null || on[it.s]; });
        if (!items.length) return;
        var list = h('ul', { class: 'form-list' }, items.map(function (it) {
          // Etiqueta arriba (y la sesión, si la sección abarca varias); la fórmula abajo, sin partirse.
          var own = it.s && !(secSess.length === 1) ? link(it.s) : null;
          var sub = it.label || own ? h('div', { class: 'form-label' }, [it.label || null, own]) : null;
          return h('li', {}, [sub, texNode(it.tex)]);
        }));
        var shown = secSess.filter(function (n) { return on[n]; });
        var sess = shown.length ? h('p', { class: 'form-sessions' }, shown.map(link)) : null;
        grid.appendChild(h('section', { class: 'form-sec' }, [h('h2', {}, [sec.title]), sess, list]));
      });
      if (window.CBMath) window.CBMath.render(grid);
    }
    function update() {
      all.forEach(function (n) { boxes[n].checked = picked.indexOf(n) >= 0; });
      if (basicsBox) basicsBox.checked = basics;
      var label = picked.length === all.length ? 'todo el curso' : picked.length ? rangeLabel(picked) : 'solo básicos';
      summary.textContent = isAll() ? 'todo el curso' : label + (hasBasics && !basics ? ' · sin básicos' : '');
      // En la hoja (y en papel) queda escrito qué temas trae cuando no es el curso completo.
      scope.textContent = isAll() ? '' : 'Temas: ' + label + (hasBasics ? (basics ? ' · con básicos' : ' · sin básicos') : '');
      scope.hidden = isAll();
      // Encabezado impreso (caja de margen de @page): curso y temas de esta hoja.
      var head = (F.title || 'Formulario') + ' · ' + (isAll() ? 'todo el curso' : label);
      pageStyle.textContent = '@media print { @page { @top-right { content: "' + head.replace(/["\\]/g, '') + '"; } } }';
      frameTitle.textContent = head;
      var q = new URLSearchParams(location.search);
      if (picked.length === all.length) q.delete('s'); else q.set('s', listToString(picked));
      if (hasBasics && !basics) q.set('b', '0'); else q.delete('b');
      var qs = q.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) { /* file:// */ }
      draw();
    }
    if (!isAll()) pick.open = true;
    update();
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

  window.CBFormulario = { render: render, pieces: pieces, parseList: parseList, listToString: listToString };
})();
