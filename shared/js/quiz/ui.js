/* =====================================================================
   UI de quizzes (§10): tarjeta de pregunta, semáforo, quiz de práctica,
   simulacro de examen y lanzador (/quiz/). La lógica vive en engine.js.
   ===================================================================== */
(function () {
  var Q = function () { return window.CBQuiz; };
  var STATE_LABEL = { ok: 'Listo', warn: 'Casi', bad: 'Reforzar' };
  var VERDICT_TITLE = { ok: '¡Bien!', warn: 'Casi', bad: 'Todavía no' };

  function h(tag, attrs, kids) { return window.LabUI.h(tag, attrs, kids); }
  function uid(p) { return window.LabUI.id(p); }
  function render(el) { if (window.CBMath) window.CBMath.render(el); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function str(x, v) { return typeof x === 'function' ? x(v) : x; }
  function fmtPts(x) { return Number(x.toFixed(2)).toString(); }
  function metas() { return window.CB_METAS || {}; }

  // Etiqueta → nombre legible y liga a la sesión.
  function tagInfo(tag, root) {
    var m = tag.match(/^(\w+)\.S(\d\d)(?:\.(.+))?$/);
    if (!m) return { name: tag, href: null };
    var meta = metas()[m[1]], n = +m[2];
    var sess = meta && meta.groups.reduce(function (a, g) { return a.concat(g.sessions); }, []).filter(function (s) { return s.n === n; })[0];
    var sub = m[3] && window.CB_BANK && window.CB_BANK[m[1]] && window.CB_BANK[m[1]]['S' + m[2]];
    var name = sub ? sub.subtopics[tag] || tag : (meta ? meta.name + ' · S' + m[2] + (sess ? ' · ' + (sess.short || sess.title) : '') : tag);
    var href = meta && sess && sess.ready ? (root || '../') + meta.slug + '/sesiones/sesion-' + m[2] + '/' : null;
    return { name: name, href: href, session: 'S' + m[2] };
  }

  /* ---------- Semáforo por tema (§5.5, §10.5) ---------- */
  function semaforo(scores, opts) {
    opts = opts || {};
    var tags = Object.keys(scores).filter(opts.filter || function () { return true; });
    tags.sort(function (a, b) { return scores[a].pct - scores[b].pct; });
    return h('ul', { class: 'semaforo' }, tags.map(function (t) {
      var s = scores[t], info = tagInfo(t, opts.root);
      var link = s.state === 'bad' && info.href ? h('a', { href: info.href + (opts.anchor || '') }, ['Repasar ' + info.session]) : null;
      return h('li', { class: 'semaforo__row semaforo__row--' + s.state }, [
        h('span', { class: 'semaforo__name', html: info.name }),
        h('span', { class: 'semaforo__bar', role: 'img', 'aria-label': Math.round(s.pct) + ' %' }, [h('span', { class: 'semaforo__fill', style: 'width:' + Math.max(2, s.pct).toFixed(0) + '%' })]),
        h('span', { class: 'semaforo__pct mono' }, [Math.round(s.pct) + ' %']),
        h('span', { class: 'semaforo__state' }, [STATE_LABEL[s.state]]),
        link
      ]);
    }));
  }

  /* ---------- Tarjeta de pregunta ----------
     mode 'practice': retroalimentación inmediata con why.
     mode 'exam': sin revisar; "Ver solución" con confirmación en la página. */
  function answerInput(kind, opts, v, unit) {
    var id = uid('qa');
    if (kind === 'choice') {
      var name = uid('opt');
      var list = opts.slice();
      for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
      var fs = h('fieldset', { class: 'exercise__options' }, [h('legend', { class: 'visually-hidden' }, ['Opciones'])].concat(list.map(function (o) {
        var oid = uid('o');
        return h('div', { class: 'exercise__option' }, [h('input', { type: 'radio', name: name, id: oid, value: o.text }), h('label', { for: oid, html: o.text })]);
      })));
      return { node: fs, get: function () { var c = fs.querySelector('input:checked'); return c ? c.value : ''; }, lock: function () { fs.disabled = true; } };
    }
    var isExpr = kind === 'expr';
    var inp = h('input', { id: id, type: 'text', class: 'lab-input ' + (isExpr ? 'lab-input--mono' : 'lab-input--num'), inputmode: isExpr ? null : 'decimal', spellcheck: 'false', autocomplete: 'off' });
    var node = h('div', { class: 'lab-field' }, [
      h('label', { for: id, class: 'lab-field__label' }, [isExpr ? 'Tu antiderivada F(x)' : 'Tu resultado']),
      h('div', { class: 'exercise__inputrow' }, [inp, unit ? h('span', { class: 'exercise__unit' }, [unit]) : null]),
      h('p', { class: 'lab-field__hint', html: isExpr ? 'La constante C es opcional. Ej.: <code>x^3/3</code>, <code>e^(2x)/2</code>, <code>ln(x)</code>.' : 'Usa punto decimal; se acepta ±1 %.' })
    ]);
    return { node: node, input: inp, get: function () { return inp.value; }, lock: function () { inp.readOnly = true; } };
  }

  // Confirmación dentro de la página (sin diálogos del navegador).
  function confirmInline(host, text, onYes) {
    if (host.querySelector('.confirm')) return;
    var box = h('div', { class: 'confirm', role: 'alertdialog', 'aria-label': 'Confirmar' }, [h('p', {}, [text])]);
    var yes = window.LabUI.button('Ver solución', 'primary', function () { box.remove(); onYes(); });
    var no = window.LabUI.button('Cancelar', 'ghost', function () { box.remove(); });
    box.appendChild(h('div', { class: 'lab-buttons' }, [yes, no]));
    host.appendChild(box);
    no.focus();
  }

  function questionCard(q, v, n, mode, onResult) {
    var card = h('article', { class: 'qcard', id: 'q-' + q.id + '-' + n });
    var head = h('header', { class: 'qcard__head' }, [
      h('span', { class: 'qcard__n mono' }, ['Pregunta ' + n]),
      h('span', { class: 'qcard__meta mono' }, [['', 'fácil', 'media', 'difícil'][q.difficulty] || ''])
    ]);
    var inp = answerInput(q.type, q.options ? q.options(v) : null, v, q.unit);
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var why = h('div', { class: 'qcard__why', hidden: true, html: '<strong>Por qué.</strong> ' + str(q.why, v) });
    var state = { done: false, seen: false, input: '' };
    var buttons = h('div', { class: 'lab-buttons' });
    card.appendChild(head);
    card.appendChild(h('div', { class: 'qcard__prompt', html: q.prompt(v) }));
    card.appendChild(inp.node);
    card.appendChild(buttons);
    card.appendChild(verdict);
    card.appendChild(why);

    if (mode === 'practice') {
      var check = window.LabUI.button('Revisar', 'primary', function () {
        var r = Q().grade(q, v, inp.get(), { math: window.math });
        if (r.kind === 'invalid') { window.LabUI.verdict(verdict, 'bad', r.say || 'Escribe tu respuesta.', null); return; }
        state.done = true; state.input = inp.get();
        inp.lock(); check.disabled = true;
        window.LabUI.verdict(verdict, r.kind, VERDICT_TITLE[r.kind], r.say || null);
        why.hidden = false;
        render(card);
        onResult({ q: q, v: v, score: r.kind === 'ok' ? 1 : 0, kind: r.kind });
      });
      buttons.appendChild(check);
      if (inp.input) inp.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check.click(); } });
    } else {
      var sol = window.LabUI.button('Ver solución', 'ghost', function () {
        confirmInline(buttons, 'Ver la solución te deja máximo el 30 % de esta pregunta.', function () {
          state.seen = true; sol.disabled = true; why.hidden = false;
          card.classList.add('is-seen');
          render(why);
        });
      });
      buttons.appendChild(sol);
    }
    return { node: card, state: state, get: inp.get, lock: inp.lock, q: q, v: v };
  }

  /* ---------- Quiz de práctica ---------- */
  function runPractice(root, questions, opts) {
    opts = opts || {};
    root.innerHTML = '';
    var results = [];
    var progress = h('p', { class: 'quiz-progress mono', 'aria-live': 'polite' });
    var list = h('div', { class: 'quiz-list' });
    var finish = window.LabUI.button('Terminar y ver mi semáforo', 'primary', done);
    var out = h('div', { class: 'quiz-results', hidden: true });
    root.appendChild(h('div', { class: 'quiz-run' }, [progress, list, h('div', { class: 'lab-buttons quiz-actions' }, [finish]), out]));
    var cards = questions.map(function (q, i) {
      var v = window.CBExercises.instance(q);
      var c = questionCard(q, v, i + 1, 'practice', function (r) { results.push(r); upd(); });
      list.appendChild(c.node);
      return c;
    });
    function upd() { progress.textContent = results.length + ' de ' + questions.length + ' respondidas'; }
    upd();
    render(list);

    function done() {
      // Las que no respondió cuentan como no logradas.
      var all = cards.map(function (c) {
        var r = results.filter(function (x) { return x.q === c.q; })[0];
        return r || { q: c.q, score: 0, kind: 'skip' };
      });
      var scores = Q().scoreByTag(all);
      var total = all.reduce(function (s, r) { return s + r.score; }, 0);
      var pct = total / all.length * 100;
      out.hidden = false;
      out.innerHTML = '';
      out.appendChild(h('h3', { class: 'quiz-results__title' }, ['Tu resultado: ' + total + ' de ' + all.length + ' (' + Math.round(pct) + ' %)']));
      out.appendChild(h('p', { class: 'muted' }, ['Semáforo por tema: Listo ≥ 80 %, Casi 50–79 %, Reforzar < 50 %.']));
      out.appendChild(semaforo(scores, { filter: opts.tagFilter, root: opts.root, anchor: opts.anchor }));
      out.appendChild(h('div', { class: 'lab-buttons' }, [window.LabUI.button('Otro quiz con preguntas nuevas', 'ghost', function () { if (opts.again) opts.again(); })]));
      finish.disabled = true;
      render(out);
      out.scrollIntoView({ behavior: window.CBAnim && window.CBAnim.canAnimate() ? 'smooth' : 'auto', block: 'start' });
      Q().saveHistory('cb-quiz-history', {
        date: new Date().toISOString(), score: Math.round(pct), n: all.length,
        topics: (opts.topics || []).join(', ')
      });
      if (opts.onFinish) opts.onFinish();
    }
  }

  /* ---------- Quiz de sesión (dentro de la página de la sesión) ---------- */
  function sessionQuiz(root, cfg) {
    var sess = window.CB_BANK && window.CB_BANK[cfg.code] && window.CB_BANK[cfg.code]['S' + pad(cfg.session)];
    if (!sess) return false;
    function start() {
      var picked = Q().pick(sess.questions, cfg.count || 8);
      runPractice(root, picked, {
        tagFilter: function (t) { return t.split('.').length === 3; },
        root: cfg.root, anchor: '#sec-1', again: start,
        topics: [cfg.name + ' S' + pad(cfg.session)]
      });
    }
    window.LabUI.loadMath().then(start, start);
    return true;
  }

  // Expresión de math.js → LaTeX para mostrar la respuesta correcta.
  function exprTex(src) {
    try {
      var prep = window.LabMath.antiderivative.prep;
      return '$' + window.math.parse(prep(src)).toTex({ implicit: 'hide', parenthesis: 'auto' }) + ' + C$';
    } catch (e) { return '<code>' + src + '</code>'; }
  }

  /* ---------- Simulacro de examen (§10.4) ---------- */
  function clock(minutes) {
    var left = minutes * 60, timer = null, paused = false;
    var out = h('span', { class: 'clock__time mono', 'aria-live': 'off' });
    var note = h('span', { class: 'clock__note' });
    var pause = window.LabUI.button('Pausar', 'ghost', function () {
      paused = !paused; pause.textContent = paused ? 'Reanudar' : 'Pausar';
    });
    var off = window.LabUI.button('Apagar reloj', 'ghost', function () {
      clearInterval(timer); node.classList.add('is-off'); out.textContent = 'sin reloj'; pause.disabled = true; off.disabled = true; note.textContent = '';
    });
    var node = h('div', { class: 'clock', role: 'timer', 'aria-label': 'Reloj sugerido' }, [
      h('span', { class: 'clock__label' }, ['Reloj sugerido']), out, note, pause, off
    ]);
    function show() {
      var m = Math.floor(Math.abs(left) / 60), s = Math.abs(left) % 60;
      out.textContent = (left < 0 ? '+' : '') + m + ':' + pad(s);
      if (left <= 0) { node.classList.add('is-over'); note.textContent = 'Se acabó el tiempo sugerido; puedes seguir.'; }
    }
    show();
    timer = setInterval(function () { if (!paused) { left--; show(); } }, 1000);
    return { node: node, stop: function () { clearInterval(timer); } };
  }

  function problemCard(p, v, n) {
    var parts = p.parts.map(function (part, i) {
      var inp = answerInput(part.type || 'numeric', null, v, part.unit);
      var sol = h('div', { class: 'qcard__why', hidden: true });
      var st = { seen: false };
      var btns = h('div', { class: 'lab-buttons' });
      var b = window.LabUI.button('Ver solución', 'ghost', function () {
        confirmInline(btns, 'Ver la solución te deja máximo el 30 % de este inciso.', function () {
          st.seen = true; b.disabled = true;
          sol.hidden = false; sol.innerHTML = '<strong>Solución.</strong> ' + part.solution(v);
          render(sol);
        });
      });
      btns.appendChild(b);
      var node = h('li', { class: 'part' }, [
        h('p', { class: 'part__prompt', html: '<strong>' + part.label + ')</strong> ' + part.prompt(v) + ' <span class="part__pts mono">(' + part.points + ' pts)</span>' }),
        inp.node, btns, sol
      ]);
      return { node: node, inp: inp, st: st };
    });
    var diagram = p.diagram && window.Diagrams && window.Diagrams[p.diagram.id]
      ? h('figure', { class: 'figure sheet problem__figure', html: window.Diagrams[p.diagram.id](p.diagram.state(v)) }) : null;
    var node = h('article', { class: 'problem' }, [
      h('header', { class: 'qcard__head' }, [h('span', { class: 'qcard__n mono' }, ['Problema ' + n + ' · ' + p.title])]),
      h('div', { class: 'problem__statement', html: p.statement(v) }),
      diagram,
      h('ol', { class: 'problem__parts' }, parts.map(function (x) { return x.node; }))
    ]);
    return { node: node, parts: parts, p: p, v: v };
  }

  function runSimulacro(root, questions, problems, opts) {
    root.innerHTML = '';
    var minutes = Q().suggestedMinutes(opts.presetId);
    var ck = clock(minutes);
    var qBox = h('div', { class: 'quiz-list' });
    var pBox = h('div', { class: 'quiz-list' });
    var finish = window.LabUI.button('Terminar simulacro', 'primary', done);
    var out = h('div', { class: 'quiz-results', hidden: true });
    root.appendChild(h('div', { class: 'sim-run' }, [
      ck.node,
      h('p', { class: 'muted' }, ['No hay revisión durante el simulacro. “Ver solución” está disponible en cualquier momento, pero deja máximo el 30 % de esa pregunta o inciso.']),
      h('h3', { class: 'sim-run__title' }, ['Preguntas cortas · 40 %']), qBox,
      h('h3', { class: 'sim-run__title' }, ['Problemas · 60 %']), pBox,
      h('div', { class: 'lab-buttons quiz-actions' }, [finish]), out
    ]));
    var qCards = questions.map(function (q, i) { var c = questionCard(q, window.CBExercises.instance(q), i + 1, 'exam'); qBox.appendChild(c.node); return c; });
    var pCards = problems.map(function (p, i) { var c = problemCard(p, window.CBExercises.instance(p), i + 1); pBox.appendChild(c.node); return c; });
    render(root);

    function done() {
      ck.stop();
      ck.node.hidden = true;
      finish.disabled = true;
      var deps = { math: window.math };
      var shortRes = qCards.map(function (c) {
        var r = Q().gradeShort(c.q, c.v, c.get(), c.state.seen, deps);
        c.lock();
        return Object.assign(r, { q: c.q, v: c.v, score: r.earned });
      });
      var examRes = pCards.map(function (c) {
        var r = Q().gradeProblem(c.p, c.v, c.parts.map(function (x) { return x.inp.get(); }), c.parts.map(function (x) { return x.st.seen; }), deps);
        c.parts.forEach(function (x) { x.inp.lock(); });
        return Object.assign(r, { p: c.p, v: c.v });
      });
      var score = Q().simulacroScore(shortRes, examRes);
      // Semáforo: preguntas cortas por etiqueta + cada problema cuenta en sus etiquetas.
      var tagRows = shortRes.map(function (r) { return { q: r.q, score: r.earned }; })
        .concat(examRes.map(function (r) { return { q: { tags: r.p.tags }, score: r.total ? r.earned / r.total : 0 }; }));
      var scores = Q().scoreByTag(tagRows);

      out.hidden = false;
      out.innerHTML = '';
      out.appendChild(h('h3', { class: 'quiz-results__title' }, ['Calificación: ' + fmtPts(score.total) + ' / 100']));
      out.appendChild(h('p', { class: 'mono' }, ['Preguntas cortas ' + fmtPts(score.short) + ' / 40 · Problemas ' + fmtPts(score.exam) + ' / 60']));
      out.appendChild(h('h4', {}, ['Semáforo por tema']));
      out.appendChild(semaforo(scores, { filter: function (t) { return t.split('.').length === 2; }, root: opts.root }));
      out.appendChild(h('h4', {}, ['Desglose y soluciones']));
      var rows = h('ol', { class: 'breakdown' });
      shortRes.forEach(function (r, i) {
        rows.appendChild(h('li', {}, [
          h('p', { html: '<strong>Pregunta ' + (i + 1) + '</strong> · ' + fmtPts(r.earned) + ' / 1' + (r.withSolution ? ' · <span class="tag">con solución</span>' : '') + (r.correct ? '' : ' · respuesta correcta: ' + (r.q.type === 'choice' ? r.q.answer(r.v) : r.q.type === 'expr' ? exprTex(r.q.answer(r.v)) : fmtPts(r.q.answer(r.v)) + (r.q.unit ? ' ' + r.q.unit : ''))) }),
          h('p', { class: 'muted', html: str(r.q.why, r.v) })
        ]));
      });
      examRes.forEach(function (r, i) {
        rows.appendChild(h('li', {}, [h('p', { html: '<strong>Problema ' + (i + 1) + ' · ' + r.p.title + '</strong> · ' + fmtPts(r.earned) + ' / ' + r.total })].concat(r.parts.map(function (pr, k) {
          var flags = [];
          if (pr.carried) flags.push('<span class="tag">arrastre de error: contó completo</span>');
          if (pr.withSolution) flags.push('<span class="tag">con solución</span>');
          return h('p', { class: 'breakdown__part', html: pr.label + ') ' + fmtPts(pr.earned) + ' / ' + pr.points + ' ' + flags.join(' ') + '<br><span class="muted">' + r.p.parts[k].solution(r.v) + '</span>' });
        }))));
      });
      out.appendChild(rows);
      render(out);
      out.scrollIntoView({ behavior: 'auto', block: 'start' });
      Q().saveHistory('cb-exam-history', { date: new Date().toISOString(), score: Math.round(score.total), topics: opts.topics.join(', ') });
      if (opts.onFinish) opts.onFinish();
    }
  }

  /* ---------- Lanzador (/quiz/) ---------- */
  function sessionsOf(meta) { return meta.groups.reduce(function (a, g) { return a.concat(g.sessions.map(function (s) { return Object.assign({ group: g }, s); })); }, []); }

  function launcher(root) {
    var M = metas(), codes = Object.keys(M);
    var params = new URLSearchParams(location.search);
    var presets = (window.QUIZ_PRESETS && window.QUIZ_PRESETS.presets) || [];
    var modeName = uid('modo');
    var modeSim = params.get('modo') === 'simulacro';
    var mode = h('fieldset', { class: 'launcher__mode' }, [
      h('legend', { class: 'lab-field__label' }, ['Modo']),
      h('label', { class: 'mode-opt' }, [h('input', { type: 'radio', name: modeName, value: 'quiz', checked: !modeSim }), h('span', {}, [h('strong', {}, ['Quiz de práctica']), h('small', {}, ['Preguntas cortas con retroalimentación inmediata.'])])]),
      h('label', { class: 'mode-opt' }, [h('input', { type: 'radio', name: modeName, value: 'sim', checked: modeSim }), h('span', {}, [h('strong', {}, ['Simulacro de examen']), h('small', {}, ['Formato de parcial: 40 % preguntas, 60 % problemas, reloj sugerido.'])])])
    ]);
    var isSim = function () { return mode.querySelector('input:checked').value === 'sim'; };

    // Sesiones: casillas agrupadas por curso y bloque; sin banco = deshabilitada.
    var boxes = [];
    var courses = h('div', { class: 'launcher__courses' }, codes.map(function (code) {
      var meta = M[code];
      return h('fieldset', { class: 'launcher__course' }, [h('legend', {}, [meta.fullName || meta.name])].concat(meta.groups.map(function (g) {
        return h('div', { class: 'launcher__group' }, [h('p', { class: 'crumb' }, ['Bloque ' + g.id + ' · ' + g.label]), h('div', { class: 'launcher__sessions' }, g.sessions.map(function (s) {
          var id = uid('s');
          var cb = h('input', { type: 'checkbox', id: id, value: code + ':' + s.n, disabled: !s.bank });
          boxes.push({ cb: cb, code: code, n: s.n, bank: !!s.bank });
          return h('label', { class: 'sess-chip' + (s.bank ? '' : ' is-soon'), for: id, title: s.title + (s.bank ? '' : ' · banco en preparación') }, [cb, h('span', {}, ['S' + pad(s.n)])]);
        }))]);
      })));
    }));

    var presetNote = h('p', { class: 'crumb' }, ['Atajos · ' + ((window.QUIZ_PRESETS && window.QUIZ_PRESETS.note) || '')]);
    var presetRow = h('div', { class: 'launcher__presets' });
    var availability = h('p', { class: 'launcher__avail muted', 'aria-live': 'polite' });
    function drawPresets() {
      presetRow.innerHTML = '';
      presets.filter(function (p) { return isSim() ? p.kind === 'exam' : p.kind === 'quiz'; }).forEach(function (p) {
        presetRow.appendChild(window.LabUI.button(p.label + ' · S' + pad(p.sessions[0]) + '–S' + pad(p.sessions[p.sessions.length - 1]), 'ghost', function () { applyPreset(p); }));
      });
    }
    function applyPreset(p) {
      boxes.forEach(function (b) { b.cb.checked = b.bank && p.sessions.indexOf(b.n) >= 0; });
      root.dataset.preset = p.id;
      var want = p.sessions.length * codes.length, have = boxes.filter(function (b) { return b.cb.checked; }).length;
      availability.textContent = have ? 'De ' + p.label + ' ya hay banco para ' + have + ' de ' + want + ' sesiones; las demás llegan pronto.' : 'Todavía no hay preguntas para ' + p.label + '. Llegan pronto.';
      upd();
    }
    var countSel = window.LabUI.select({ label: 'Número de preguntas', options: ['5', '8', '10', '15'] });
    countSel.input.value = '1';
    var start = window.LabUI.button('Empezar', 'primary', go);
    var summary = h('p', { class: 'launcher__summary mono' });
    function selected() { return boxes.filter(function (b) { return b.cb.checked; }); }
    function upd() {
      var n = selected().length;
      summary.textContent = n ? n + (n === 1 ? ' sesión elegida' : ' sesiones elegidas') : 'Elige al menos una sesión o un atajo.';
      start.disabled = !n;
      countSel.node.hidden = isSim();
    }
    boxes.forEach(function (b) { b.cb.addEventListener('change', function () { delete root.dataset.preset; upd(); }); });
    mode.addEventListener('change', function () { drawPresets(); upd(); });

    var stage = h('div', { class: 'launcher__stage' });
    var form = h('section', { class: 'sheet launcher' }, [
      mode,
      h('div', { class: 'launcher__block' }, [presetNote, presetRow, availability]),
      h('div', { class: 'launcher__block' }, [h('p', { class: 'lab-field__label' }, ['O elige tus sesiones']), courses]),
      h('div', { class: 'launcher__go' }, [countSel.node, summary, start])
    ]);
    root.appendChild(form);
    root.appendChild(stage);
    root.appendChild(historyPanel());
    drawPresets();

    // Parámetros: ?preset=…, ?curso=c1&tags=c1.S10
    var pre = presets.filter(function (p) { return p.id === params.get('preset'); })[0];
    if (pre) applyPreset(pre);
    (params.get('tags') || '').split(',').forEach(function (t) {
      var m = t.match(/^(\w+)\.S(\d\d)$/);
      if (m) boxes.forEach(function (b) { if (b.code === m[1] && b.n === +m[2] && b.bank) b.cb.checked = true; });
    });
    upd();

    function loadAll(sel) {
      var loads = [window.LabUI.loadMath()];
      sel.forEach(function (b) {
        var meta = M[b.code];
        if (!(window.CB_BANK && window.CB_BANK[b.code] && window.CB_BANK[b.code]['S' + pad(b.n)])) loads.push(window.LabUI.loadScript('../data/' + meta.slug + '/bank/sesion-' + pad(b.n) + '.js'));
        if (isSim() && !(window.CB_EXAMS && window.CB_EXAMS[b.code])) loads.push(window.LabUI.loadScript('../data/' + meta.slug + '/exam-problems.js'));
      });
      return Promise.all(loads);
    }

    function go() {
      var sel = selected();
      if (!sel.length) return;
      start.disabled = true;
      stage.innerHTML = '<p class="muted">Cargando preguntas…</p>';
      loadAll(sel).then(function () {
        start.disabled = false;
        var byCode = {};
        sel.forEach(function (b) { (byCode[b.code] = byCode[b.code] || []).push(b.n); });
        var sels = Object.keys(byCode).map(function (c) { return { code: c, sessions: byCode[c] }; });
        var pool = Q().pool(window.CB_BANK, sels);
        var topics = sel.map(function (b) { return M[b.code].name + ' S' + pad(b.n); });
        if (isSim()) {
          var tags = sel.map(function (b) { return b.code + '.S' + pad(b.n); });
          var probs = [];
          Object.keys(byCode).forEach(function (c) { probs = probs.concat(Q().eligibleProblems((window.CB_EXAMS || {})[c], tags)); });
          var comp = Q().composeSimulacro(pool, probs);
          if (comp.questions.length < 3 || comp.problems.length < 2) {
            stage.innerHTML = '<p class="verdict verdict--warn">Con estas sesiones todavía no alcanza para un simulacro completo (hacen falta 3 preguntas y 2 problemas). Agrega sesiones o usa el quiz de práctica.</p>';
            return;
          }
          form.hidden = true;
          runSimulacro(stage, comp.questions, comp.problems, { presetId: root.dataset.preset, topics: topics, root: '../', onFinish: showBack });
        } else {
          form.hidden = true;
          var n = [5, 8, 10, 15][+countSel.input.value];
          runPractice(stage, Q().pick(pool, n), { tagFilter: function (t) { return t.split('.').length === 2 || sel.length === 1; }, root: '../', topics: topics, again: go, onFinish: showBack });
        }
        stage.scrollIntoView({ block: 'start' });
      }, function (e) {
        start.disabled = false;
        stage.innerHTML = '<p class="verdict verdict--bad">No se pudieron cargar las preguntas: ' + e.message + '</p>';
      });
    }
    function showBack() {
      var back = window.LabUI.button('Volver al lanzador', 'ghost', function () { form.hidden = false; stage.innerHTML = ''; back.remove(); refreshHistory(); form.scrollIntoView({ block: 'start' }); });
      stage.appendChild(h('div', { class: 'lab-buttons' }, [back]));
      refreshHistory();
    }
  }

  var historyNode = null;
  function historyPanel() {
    historyNode = h('section', { class: 'history', 'aria-labelledby': 'hist-h' });
    refreshHistory();
    return historyNode;
  }
  function refreshHistory() {
    if (!historyNode) return;
    var quiz = Q().loadHistory('cb-quiz-history'), exam = Q().loadHistory('cb-exam-history');
    historyNode.innerHTML = '';
    historyNode.appendChild(h('h2', { id: 'hist-h' }, ['Tu historial']));
    historyNode.appendChild(h('p', { class: 'muted' }, ['Solo se guarda en este navegador: los últimos 10 quizzes y 10 simulacros.']));
    function table(title, list) {
      if (!list.length) return h('p', { class: 'muted' }, [title + ': todavía no hay intentos.']);
      return h('div', { class: 'history__block' }, [h('h3', {}, [title]), h('ul', { class: 'history__list' }, list.map(function (e) {
        var d = new Date(e.date);
        return h('li', {}, [h('span', { class: 'mono' }, [isNaN(d) ? '' : d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })]), h('strong', {}, [e.score + (title === 'Simulacros' ? ' / 100' : ' %')]), h('span', { class: 'muted' }, [e.topics || ''])]);
      }))]);
    }
    historyNode.appendChild(table('Quizzes', quiz));
    historyNode.appendChild(table('Simulacros', exam));
  }

  window.CBQuizUI = { semaforo: semaforo, questionCard: questionCard, runPractice: runPractice, sessionQuiz: sessionQuiz, runSimulacro: runSimulacro, launcher: launcher };
})();
