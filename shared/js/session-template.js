/* =====================================================================
   Plantilla de sesión (§7.2–7.3): renderiza window.SESSION_DATA con los
   metadatos de window.COURSE_META. Patrón CadTemplate de MadRams.
   Secciones: hero · lección (concept, explainer, example, callout) · lab ·
   fórmulas · ejercicios · quiz · errores comunes · guía del instructor ·
   bibliografía · anterior/siguiente. Rieles laterales ≥ 1360 px.
   ===================================================================== */
(function () {
  var META = window.COURSE_META;
  var ROOT = '../../../';
  var HOOF = 'M-1.4 -9 C-6.2 -9 -7.8 -2 -7.2 3.4 C-6.6 7.8 -3.8 9.8 -1.6 8.8 C-0.8 4.4 -0.6 -3.4 -1.4 -9 Z M1.4 -9 C6.2 -9 7.8 -2 7.2 3.4 C6.6 7.8 3.8 9.8 1.6 8.8 C0.8 4.4 0.6 -3.4 1.4 -9 Z';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function reduced() { return window.CBAnim ? !window.CBAnim.canAnimate() : true; }
  function sessions() {
    return META.groups.reduce(function (acc, g) {
      return acc.concat(g.sessions.map(function (s) { return Object.assign({ group: g }, s); }));
    }, []);
  }
  function sessionUrl(n) { return '../sesion-' + pad(n) + '/'; }
  function diagramSvg(id, state) {
    var fn = window.Diagrams && window.Diagrams[id];
    return fn ? fn(state || {}) : '<p class="muted">Diagrama “' + id + '” en preparación.</p>';
  }
  function section(id, heading, kids, cls) {
    return el('section', { class: 'session-section' + (cls ? ' ' + cls : ''), id: id, 'aria-labelledby': id + '-h' }, [
      el('div', { class: 'container' }, [heading ? el('h2', { id: id + '-h', class: 'reveal', html: heading }) : null].concat(kids))
    ]);
  }

  /* ---------- Header con puntos agrupados ---------- */
  function themeToggle() {
    return el('button', { class: 'theme-toggle', type: 'button', 'data-theme-toggle': true, 'aria-pressed': 'false', 'aria-label': 'Cambiar a pizarrón (tema oscuro)',
      html: '<span class="to-dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M7 21h10M9 17v4M15 17v4M7 9c2-2 4 2 6 0s3-1 4 0"/></svg><span class="label">Pizarrón</span></span>' +
        '<span class="to-light"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="15" height="18" rx="1.5"/><path d="M9 3v18M3 7h4M3 12h4M3 17h4M12 8h5M12 12h5"/></svg><span class="label">Cuaderno</span></span>' });
  }

  function renderHeader(data) {
    var cur = parseInt(data.number, 10);
    var groups = META.groups.map(function (g) {
      return el('li', { class: 'dot-group' }, [
        el('span', { class: 'dot-group__id', 'aria-hidden': 'true' }, [g.id]),
        el('ol', { class: 'dots', 'aria-label': 'Bloque ' + g.id + ' · ' + g.label }, g.sessions.map(function (s) {
          var label = 'S' + pad(s.n) + ' · ' + (s.short || s.title);
          var cls = 'dot' + (s.n === cur ? ' is-current' : '') + (s.ready ? '' : ' is-soon');
          if (s.n === cur) return el('li', {}, [el('a', { class: cls, href: './', 'aria-current': 'page', title: label }, [el('span', { class: 'visually-hidden' }, [label])])]);
          if (s.ready) return el('li', {}, [el('a', { class: cls, href: sessionUrl(s.n), title: label }, [el('span', { class: 'visually-hidden' }, [label])])]);
          return el('li', {}, [el('span', { class: cls, title: label + ' · próximamente' }, [el('span', { class: 'visually-hidden' }, [label + ' · próximamente'])])]);
        }))
      ]);
    });
    var menu = el('details', { class: 'session-menu' }, [
      el('summary', { 'aria-label': 'Sesión ' + cur + ' de ' + META.sessions + '. Abrir la lista de sesiones' }, ['S' + pad(cur) + ' / ' + META.sessions]),
      el('div', { class: 'session-menu__panel' }, META.groups.map(function (g) {
        return el('div', { class: 'session-menu__group' }, [
          el('p', { class: 'crumb' }, ['Bloque ' + g.id + ' · ' + g.label]),
          el('ul', {}, g.sessions.map(function (s) {
            var txt = 'S' + pad(s.n) + ' · ' + (s.short || s.title);
            if (s.n === cur) return el('li', {}, [el('a', { href: './', 'aria-current': 'page' }, [txt])]);
            return el('li', {}, [s.ready ? el('a', { href: sessionUrl(s.n) }, [txt]) : el('span', { class: 'muted' }, [txt + ' · pronto'])]);
          }))
        ]);
      }))
    ]);
    return el('header', { class: 'site-header session-header' }, [
      el('div', { class: 'container' }, [
        el('a', { class: 'brand', href: ROOT, html: '<svg viewBox="-12 -12 24 24" fill="currentColor" aria-hidden="true"><path d="' + HOOF + '"/></svg><span><span class="brand__name">Cuaderno del Borrego</span><small>' + META.name + '</small></span>' }),
        el('nav', { class: 'session-dots', 'aria-label': 'Sesiones de ' + META.name }, [el('ol', { class: 'dot-groups' }, groups)]),
        el('div', { class: 'session-header__end' }, [menu, themeToggle()])
      ])
    ]);
  }

  /* ---------- Hero ---------- */
  function renderHero(data) {
    var s = sessions().filter(function (x) { return x.n === parseInt(data.number, 10); })[0] || {};
    var chips = [];
    if (data.minutes) chips.push(el('span', { class: 'chip chip--line' }, ['≈ ' + (data.minutes >= 90 ? (Math.round(data.minutes / 30) / 2) + ' h' : data.minutes + ' min')]));
    (data.temario || []).forEach(function (t) { chips.push(el('span', { class: 'chip chip--line' }, ['Tema ' + t])); });
    if (data.lab) chips.push(el('span', { class: 'chip' }, ['lab · ' + data.lab.type]));
    return el('section', { class: 'session-hero' }, [
      el('div', { class: 'container' }, [
        el('div', { class: 'sheet session-hero__sheet', 'data-intro': true }, [
          el('p', { class: 'crumb' }, [
            el('a', { href: '../../' }, [META.name]), ' · S' + data.number + ' · Bloque ' + (data.group || (s.group && s.group.id + ' · ' + s.group.label))
          ]),
          el('div', { class: 'session-hero__title' }, [
            el('span', { class: 'session-hero__num', 'aria-hidden': 'true' }, [data.number]),
            el('h1', {}, [el('span', { class: 'visually-hidden' }, ['Sesión ' + data.number + ': ']), data.title])
          ]),
          data.quote ? el('p', { class: 'session-hero__quote', html: data.quote }) : null,
          chips.length ? el('div', { class: 'session-hero__chips' }, chips) : null,
          (data.badges || []).length ? el('ul', { class: 'session-hero__goals' }, data.badges.map(function (b) { return el('li', { html: b }); })) : null
        ])
      ])
    ]);
  }

  /* ---------- Lección ---------- */
  function figure(id, state, caption) {
    return el('figure', { class: 'sheet figure reveal' }, [
      el('div', { class: 'figure__svg', html: diagramSvg(id, state) }),
      caption ? el('figcaption', { class: 'figure__cap', html: caption }) : null
    ]);
  }

  function renderConcept(b, id) {
    var text = [];
    (b.body || []).forEach(function (p) { text.push(el('p', { html: p })); });
    if (b.list && b.list.length) text.push(el('ul', { class: 'concept__list' }, b.list.map(function (x) { return el('li', { html: x }); })));
    if (b.teacher) text.push(el('details', { class: 'teacher-note' }, [el('summary', {}, ['Para el instructor']), el('p', { html: b.teacher })]));
    var kids = [el('div', { class: 'concept__text' }, text)];
    if (b.diagram) kids.push(figure(b.diagram, b.state, b.caption));
    return section(id, b.heading, [el('div', { class: 'concept reveal' + (b.diagram ? ' concept--figure' : '') }, kids)]);
  }

  function renderCallout(b, id) {
    return section(id, null, [el('aside', { class: 'callout reveal', 'aria-label': b.heading || 'Nota' }, [
      b.heading ? el('h3', { class: 'callout__title sheet__title', html: b.heading }) : null,
      el('div', { html: (Array.isArray(b.body) ? b.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') : '<p>' + b.body + '</p>') })
    ])], 'session-section--tight');
  }

  function renderExplainer(b, id) {
    var steps = b.steps;
    var idx = 0, cur = Object.assign({}, steps[0].state), anim = null, timer = null;
    var stage = el('div', { class: 'figure__svg explainer__stage' });
    var live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    var items = steps.map(function (s, i) {
      var btn = el('button', { type: 'button', class: 'explainer__step', html: '<span class="explainer__n">' + (i + 1) + '</span><span>' + s.text + '</span>' });
      btn.addEventListener('click', function () { stop(); go(i); });
      return el('li', {}, [btn]);
    });
    var prev = el('button', { type: 'button', class: 'btn btn--small btn--ghost' }, ['← Anterior']);
    var next = el('button', { type: 'button', class: 'btn btn--small btn--primary' }, ['Siguiente →']);
    var play = el('button', { type: 'button', class: 'btn btn--small btn--ghost', 'aria-pressed': 'false' }, ['Reproducir']);
    var count = el('span', { class: 'explainer__count mono' });

    function drawNow() { stage.innerHTML = diagramSvg(steps[idx].diagram || b.diagram, cur); }
    function go(i) {
      idx = Math.max(0, Math.min(steps.length - 1, i));
      var target = steps[idx].state || {};
      var numeric = {};
      Object.keys(target).forEach(function (k) { if (typeof target[k] === 'number' && typeof cur[k] === 'number') numeric[k] = target[k]; else cur[k] = target[k]; });
      if (anim) anim.pause();
      if (reduced() || !Object.keys(numeric).length) { Object.assign(cur, numeric); drawNow(); }
      else anim = anime(Object.assign({ targets: cur, duration: 900, easing: 'easeInOutQuad', update: drawNow }, numeric));
      items.forEach(function (li, j) {
        var btn = li.firstChild;
        if (j === idx) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
      });
      prev.disabled = idx === 0;
      next.disabled = idx === steps.length - 1;
      count.textContent = 'Paso ' + (idx + 1) + ' de ' + steps.length;
      var tmp = document.createElement('div'); tmp.innerHTML = steps[idx].text;
      live.textContent = 'Paso ' + (idx + 1) + ': ' + tmp.textContent;
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      play.textContent = 'Reproducir'; play.setAttribute('aria-pressed', 'false');
    }
    prev.addEventListener('click', function () { stop(); go(idx - 1); });
    next.addEventListener('click', function () { stop(); go(idx + 1); });
    play.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (idx === steps.length - 1) go(0);
      play.textContent = 'Pausar'; play.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { if (idx >= steps.length - 1) stop(); else go(idx + 1); }, 2600);
    });
    var box = el('div', { class: 'explainer reveal' }, [
      el('figure', { class: 'sheet figure explainer__figure' }, [
        b.title ? el('figcaption', { class: 'figure__title sheet__title', html: b.title }) : null,
        stage
      ]),
      el('div', { class: 'explainer__side' }, [
        el('ol', { class: 'explainer__steps' }, items),
        el('div', { class: 'explainer__controls' }, [prev, next, play, count]),
        live
      ])
    ]);
    box.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { stop(); go(idx + 1); }
      if (e.key === 'ArrowLeft') { stop(); go(idx - 1); }
    });
    go(0);
    document.addEventListener('cb:themechange', drawNow);
    return section(id, b.heading, [b.intro ? el('p', { class: 'reveal', html: b.intro }) : null, box]);
  }

  function renderExample(b, id, n) {
    var shown = 0;
    var list = el('ol', { class: 'example__steps' }, b.steps.map(function (s) {
      return el('li', { hidden: true }, [el('p', { html: s.text }), s.math ? el('div', { class: 'example__math', html: '$$' + s.math + '$$' }) : null]);
    }));
    var answer = el('div', { class: 'example__answer', hidden: true, html: '<strong>Resultado.</strong> ' + b.answer });
    var nextBtn = el('button', { type: 'button', class: 'btn btn--small btn--primary' }, ['Ver paso 1']);
    var allBtn = el('button', { type: 'button', class: 'btn btn--small btn--ghost' }, ['Mostrar todo']);
    function reveal(k) {
      shown = Math.min(b.steps.length, k);
      Array.prototype.forEach.call(list.children, function (li, i) { li.hidden = i >= shown; });
      answer.hidden = shown < b.steps.length;
      nextBtn.textContent = shown < b.steps.length ? 'Ver paso ' + (shown + 1) : 'Resuelto';
      nextBtn.disabled = allBtn.disabled = shown >= b.steps.length;
      if (shown > 0 && list.children[shown - 1]) list.children[shown - 1].setAttribute('tabindex', '-1');
    }
    nextBtn.addEventListener('click', function () { reveal(shown + 1); var li = list.children[shown - 1]; if (li) li.focus({ preventScroll: true }); });
    allBtn.addEventListener('click', function () { reveal(b.steps.length); });
    var kids = [
      el('p', { class: 'example__tag crumb' }, ['Ejemplo resuelto ' + n]),
      el('div', { class: 'example__problem', html: b.problem }),
      b.diagram ? figure(b.diagram, b.state, null) : null,
      el('p', { class: 'example__try muted' }, ['Intenta resolverlo antes de ver los pasos.']),
      list, answer,
      el('div', { class: 'lab-buttons' }, [nextBtn, allBtn])
    ];
    reveal(0);
    return section(id, b.heading, [el('article', { class: 'card example reveal' }, kids)]);
  }

  function renderLesson(data, main, spy) {
    var nEx = 0;
    (data.lesson || []).forEach(function (b, i) {
      var id = 'sec-' + (i + 1), node;
      if (b.type === 'explainer') node = renderExplainer(b, id);
      else if (b.type === 'example') node = renderExample(b, id, ++nEx);
      else if (b.type === 'callout') node = renderCallout(b, id);
      else node = renderConcept(b, id);
      main.appendChild(node);
      if (b.type !== 'callout' && b.heading) {
        var tmp = document.createElement('div'); tmp.innerHTML = b.short || b.heading;
        spy.push({ id: id, label: (b.type === 'example' ? 'Ejemplo ' + nEx + ': ' : '') + tmp.textContent });
      }
    });
  }

  /* ---------- Lab, fórmulas, ejercicios, quiz ---------- */
  function renderLab(data) {
    var lab = data.lab;
    if (!lab) return null;
    var mount = el('div', { class: 'lab', 'data-lab': lab.type });
    var node = section('sec-lab', 'Lab · ' + (lab.title || lab.type), [
      lab.intro ? el('p', { class: 'reveal', html: lab.intro }) : null,
      el('div', { class: 'sheet lab-sheet reveal' }, [mount])
    ]);
    setTimeout(function () { window.LabUI.mount(mount, lab.type, lab.cfg || {}); }, 0);
    return node;
  }

  function formulaList(data) {
    return el('dl', { class: 'formulas' }, (data.formulas || []).reduce(function (acc, f) {
      acc.push(el('dt', { html: f.label }), el('dd', { html: '$' + f.tex + '$' }));
      return acc;
    }, []));
  }
  function renderFormulas(data) {
    if (!data.formulas || !data.formulas.length) return null;
    return section('sec-formulas', 'Fórmulas clave', [el('div', { class: 'card formulas-card reveal' }, [formulaList(data)])], 'formulas-inline');
  }

  function renderExercises(data) {
    if (!data.exercises || !data.exercises.length) return null;
    var box = el('div', { class: 'exercises' });
    window.CBExercises.mount(box, data.exercises);
    return section('sec-ejercicios', 'Ejercicios', [
      el('p', { class: 'reveal' }, ['Cada ejercicio cambia sus números con “Otro ejercicio”. La solución se habilita después de tu primer intento.']),
      el('div', { class: 'sheet exercises-sheet reveal' }, [box])
    ]);
  }

  function renderQuiz(data) {
    if (!data.quiz) return null;
    var tags = (data.quiz.tags || []).join(',');
    var n = parseInt(data.number, 10);
    // Con banco cargado, el quiz corre aquí mismo; si no, se invita al lanzador.
    if (window.CBQuizUI && window.CB_BANK && window.CB_BANK[META.code] && window.CB_BANK[META.code]['S' + pad(n)]) {
      var box = el('div', { class: 'session-quiz' });
      setTimeout(function () {
        window.CBQuizUI.sessionQuiz(box, { code: META.code, session: n, count: data.quiz.count, name: META.name, root: ROOT });
      }, 0);
      return section('sec-quiz', 'Quiz de la sesión', [
        el('p', { class: 'reveal' }, [data.quiz.count + ' preguntas de esta sesión, distintas cada vez, con la explicación al responder. Al terminar ves tu semáforo por subtema.']),
        el('div', { class: 'sheet quiz-sheet reveal' }, [box]),
        el('p', { class: 'muted' }, [el('a', { href: ROOT + 'quiz/?curso=' + META.code + '&tags=' + encodeURIComponent(tags) }, ['Más opciones en el lanzador de quizzes y simulacros'])])
      ]);
    }
    return section('sec-quiz', 'Quiz de la sesión', [el('div', { class: 'card quiz-cta reveal' }, [
      el('p', {}, [data.quiz.count + ' preguntas cortas de esta sesión, con retroalimentación inmediata y tu semáforo por tema.']),
      el('a', { class: 'btn btn--primary', href: ROOT + 'quiz/?curso=' + META.code + '&tags=' + encodeURIComponent(tags) }, ['Hacer el quiz']),
      el('p', { class: 'muted quiz-cta__note' }, ['El banco de preguntas se está armando; el lanzador te avisará cuando esté listo.'])
    ])]);
  }

  /* ---------- Cierre ---------- */
  function renderErrors(data) {
    if (!data.errors || !data.errors.length) return null;
    return section('sec-errores', 'Errores comunes', [el('ul', { class: 'errors reveal' }, data.errors.map(function (e) { return el('li', { html: e }); }))]);
  }
  function renderTeacher(data) {
    var t = data.teacher;
    if (!t) return null;
    var list = function (xs) { return el('ul', {}, (xs || []).map(function (x) { return el('li', { html: x }); })); };
    var kids = [el('summary', {}, ['Guía para el instructor (opcional)'])];
    if (t.plan && t.plan.length) kids.push(el('h3', {}, ['Cómo llevar la sesión']), list(t.plan));
    if (t.check && t.check.length) kids.push(el('h3', {}, ['Qué revisar']), list(t.check));
    if (t.note) kids.push(el('p', { html: t.note }));
    return section('sec-guia', null, [el('details', { class: 'teacher-guide reveal' }, kids)], 'session-section--tight');
  }
  function renderBiblio(data) {
    if (!data.bibliography || !data.bibliography.length) return null;
    return section('sec-biblio', 'Bibliografía', [el('ul', { class: 'biblio reveal' }, data.bibliography.map(function (b) { return el('li', { html: b }); }))]);
  }
  function navLink(slug, dir) {
    if (!slug) return el('span', {});
    var n = parseInt(String(slug).replace(/\D/g, ''), 10);
    var s = sessions().filter(function (x) { return x.n === n; })[0];
    var label = (dir < 0 ? '← ' : '') + 'S' + pad(n) + ' · ' + (s ? (s.short || s.title) : '') + (dir > 0 ? ' →' : '');
    if (s && s.ready) return el('a', { class: 'btn ' + (dir > 0 ? 'btn--primary' : 'btn--ghost') + ' session-nav__link', href: sessionUrl(n) }, [label]);
    return el('span', { class: 'btn btn--ghost session-nav__link is-disabled', 'aria-disabled': 'true' }, [label + ' · pronto']);
  }
  function renderNav(data) {
    return el('nav', { class: 'session-nav container', 'aria-label': 'Sesión anterior y siguiente' }, [navLink(data.prev, -1), navLink(data.next, 1)]);
  }
  function renderFooter() {
    return el('footer', { class: 'site-footer', html:
      '<div class="container"><div class="site-footer__row"><a class="site-footer__brand" href="' + ROOT + '">Cuaderno del Borrego</a>' +
      '<nav aria-label="Pie de página"><a href="../../">' + META.name + '</a><a href="' + ROOT + 'quiz/">Practicar</a><a href="' + ROOT + 'formularios/">Formularios</a><a href="' + ROOT + 'creditos/">Créditos y licencias</a></nav></div>' +
      '<div class="site-footer__row"><p class="site-footer__note">Proyecto de alumnos, no oficial</p><p>Código bajo licencia MIT. Contenido basado en OpenStax (CC BY-NC-SA 4.0).</p></div></div>' });
  }

  /* ---------- Rieles ---------- */
  function buildSpy(list) {
    var links = [];
    var ul = el('ul', { class: 'spy' }, list.map(function (s) {
      var a = el('a', { href: '#' + s.id, 'data-spy': s.id }, [s.label]);
      links.push(a);
      return el('li', {}, [a]);
    }));
    var fill = el('span', { class: 'rail-progress__fill' });
    var nav = el('nav', { class: 'side-rail side-rail--left', 'aria-label': 'Índice de la sesión' }, [
      el('p', { class: 'side-rail__label' }, ['En esta sesión']), ul,
      el('div', { class: 'rail-progress', 'aria-hidden': 'true' }, [el('span', { class: 'side-rail__label' }, ['Avance']), el('div', { class: 'rail-progress__track' }, [fill])])
    ]);
    function progress() {
      var d = document.documentElement, max = d.scrollHeight - d.clientHeight;
      fill.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0).toFixed(1) + '%';
    }
    window.addEventListener('scroll', progress, { passive: true });
    setTimeout(function () {
      progress();
      if (!('IntersectionObserver' in window)) return;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            var on = a.getAttribute('data-spy') === en.target.id;
            a.classList.toggle('is-active', on);
            if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      list.forEach(function (s) { var t = document.getElementById(s.id); if (t) obs.observe(t); });
    }, 0);
    return nav;
  }
  function buildFormulaRail(data) {
    if (!data.formulas || !data.formulas.length) return null;
    return el('aside', { class: 'side-rail side-rail--right', 'aria-label': 'Fórmulas clave' }, [
      el('p', { class: 'side-rail__label' }, ['Fórmulas clave']), formulaList(data)
    ]);
  }

  function render(data) {
    document.body.setAttribute('data-subject', META.subject);
    document.title = 'S' + data.number + ' · ' + data.title + ' · ' + META.name + ' · Cuaderno del Borrego';
    var root = document.getElementById('session-root');
    root.appendChild(renderHeader(data));
    var main = el('main', { id: 'contenido' });
    root.appendChild(main);
    main.appendChild(renderHero(data));

    var spy = [];
    function add(node, id, label) { if (!node) return; main.appendChild(node); if (id) spy.push({ id: id, label: label }); }
    renderLesson(data, main, spy);
    add(renderLab(data), 'sec-lab', 'Lab');
    add(renderFormulas(data), null);
    add(renderExercises(data), 'sec-ejercicios', 'Ejercicios');
    add(renderQuiz(data), 'sec-quiz', 'Quiz');
    add(renderErrors(data), 'sec-errores', 'Errores comunes');
    add(renderTeacher(data), null);
    add(renderBiblio(data), 'sec-biblio', 'Bibliografía');
    main.appendChild(renderNav(data));
    root.appendChild(renderFooter());
    root.appendChild(buildSpy(spy));
    var rail = buildFormulaRail(data);
    if (rail) root.appendChild(rail);

    if (window.CBTheme) window.CBTheme.init();
    if (window.CBMath) window.CBMath.render(root);
    if (window.CBAnim) window.CBAnim.init({ noticeWhat: 'los diagramas se muestran' });
  }

  window.CBTemplate = { render: render };
})();
