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
  function answerInput(kind, opts, v, unit, q) {
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
    if (isExpr && window.CBMathInput) {
      var anti = !!(q && q.integrand);
      var mi = window.CBMathInput.create({
        label: anti ? 'Tu antiderivada F(x)' : (q && q.implicit ? 'Tu dy/dx' : 'Tu respuesta'),
        hint: anti ? 'Escribe como en papel; la constante C es opcional.' : (q && q.implicit ? 'Puedes usar x y y. Escribe como en papel.' : 'Escribe como en papel; usa la paleta para fracciones, raíces y funciones.')
      });
      return { node: mi.node, get: mi.get, lock: mi.lock, input: null };
    }
    var inp = h('input', { id: id, type: 'text', class: 'lab-input ' + (isExpr ? 'lab-input--mono' : 'lab-input--num'), inputmode: isExpr ? null : 'decimal', spellcheck: 'false', autocomplete: 'off' });
    var node = h('div', { class: 'lab-field' }, [
      h('label', { for: id, class: 'lab-field__label' }, [isExpr ? (q && q.integrand ? 'Tu antiderivada F(x)' : 'Tu respuesta') : 'Tu resultado']),
      h('div', { class: 'exercise__inputrow' }, [inp, unit ? h('span', { class: 'exercise__unit' }, [unit]) : null]),
      h('p', { class: 'lab-field__hint', html: isExpr ? (q && q.integrand ? 'La constante C es opcional. Ej.:' : 'Ej.:') + ' <code>x^3/3</code>, <code>e^(2x)/2</code>, <code>ln(x)</code>.' : 'Usa punto decimal; se acepta ±1 %.' })
    ]);
    return { node: node, input: inp, get: function () { return inp.value; }, lock: function () { inp.readOnly = true; } };
  }

  // Confirmación dentro de la página (sin diálogos del navegador).
  function confirmInline(host, text, onYes, yesLabel) {
    if (host.querySelector('.confirm')) return;
    var box = h('div', { class: 'confirm', role: 'alertdialog', 'aria-label': 'Confirmar' }, [h('p', {}, [text])]);
    var yes = window.LabUI.button(yesLabel || 'Ver solución', 'primary', function () { box.remove(); onYes(); });
    var no = window.LabUI.button('Cancelar', 'ghost', function () { box.remove(); });
    box.appendChild(h('div', { class: 'lab-buttons' }, [yes, no]));
    host.appendChild(box);
    no.focus();
  }

  function safeGet(get) { try { return get(); } catch (e) { return ''; } }

  function questionCard(q, v, n, mode, onResult) {
    var card = h('article', { class: 'qcard', id: 'q-' + q.id + '-' + n });
    var head = h('header', { class: 'qcard__head' }, [
      h('span', { class: 'qcard__n mono' }, ['Pregunta ' + n]),
      h('span', { class: 'qcard__meta mono' }, [['', 'fácil', 'media', 'difícil'][q.difficulty] || ''])
    ]);
    var inp = answerInput(q.type, q.options ? q.options(v) : null, v, q.unit, q);
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
        var input;
        try { input = inp.get(); } catch (e) { window.LabUI.verdict(verdict, 'bad', e.message, null); return; }
        var r = Q().grade(q, v, input, { math: window.math });
        if (r.kind === 'invalid') { window.LabUI.verdict(verdict, 'bad', r.say || 'Escribe tu respuesta.', null); return; }
        state.done = true; state.input = input;
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
          if (rev) rev.disabled = true;
          render(why);
        });
      });
      // Examen con revisión inmediata: se califica al contestar; ver el porqué después
      // de contestar no descuenta (solo "Ver solución" antes de contestar lo hace).
      var rev = mode === 'exam-review' ? window.LabUI.button('Revisar', 'primary', function () {
        var input;
        try { input = inp.get(); } catch (e) { window.LabUI.verdict(verdict, 'bad', e.message, null); return; }
        var r = Q().grade(q, v, input, { math: window.math });
        if (r.kind === 'invalid') { window.LabUI.verdict(verdict, 'bad', r.say || 'Escribe tu respuesta.', null); return; }
        state.reviewed = true;
        inp.lock(); rev.disabled = true; sol.disabled = true;
        window.LabUI.verdict(verdict, r.kind, VERDICT_TITLE[r.kind], r.say || null);
        why.hidden = false;
        render(card);
      }) : null;
      if (rev) {
        buttons.appendChild(rev);
        if (inp.input) inp.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); rev.click(); } });
      }
      buttons.appendChild(sol);
    }
    return { node: card, state: state, get: function () { return safeGet(inp.get); }, lock: inp.lock, q: q, v: v };
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
    var ck = opts.minutes > 0 ? clock(opts.minutes, 'Reloj') : null;
    root.appendChild(h('div', { class: 'quiz-run' }, [ck && ck.node, progress, list, h('div', { class: 'lab-buttons quiz-actions' }, [finish]), out]));
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
      if (ck) { ck.stop(); ck.node.hidden = true; }
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
  function clock(minutes, label) {
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
      h('span', { class: 'clock__label' }, [label || 'Reloj sugerido']), out, note, pause, off
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

  function problemCard(p, v, n, review) {
    var parts = [];
    p.parts.forEach(function (part, i) {
      var inp = answerInput(part.type || 'numeric', null, v, part.unit);
      var sol = h('div', { class: 'qcard__why', hidden: true });
      var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
      var st = { seen: false, reviewed: false };
      var btns = h('div', { class: 'lab-buttons' });
      var b = window.LabUI.button('Ver solución', 'ghost', function () {
        confirmInline(btns, 'Ver la solución te deja máximo el 30 % de este inciso.', function () {
          st.seen = true; b.disabled = true; if (rev) rev.disabled = true;
          sol.hidden = false; sol.innerHTML = '<strong>Solución.</strong> ' + part.solution(v);
          render(sol);
        });
      });
      // Revisión inmediata por inciso: se califica con las respuestas del alumno en los
      // incisos anteriores, así el arrastre de error cuenta igual que al final.
      var rev = review ? window.LabUI.button('Revisar inciso', 'primary', function () {
        var answers = parts.map(function (x) { return String(safeGet(x.inp.get)).trim(); });
        if (!answers[i]) { window.LabUI.verdict(verdict, 'bad', 'Escribe tu resultado.', null); return; }
        var missing = answers.slice(0, i).some(function (a) { return !a; });
        if (missing) { window.LabUI.verdict(verdict, 'warn', 'Contesta primero los incisos anteriores.', 'Este inciso usa sus resultados.'); return; }
        var r = Q().gradeProblem(p, v, answers, parts.map(function (x) { return x.st.seen; }), { math: window.math }).parts[i];
        st.reviewed = true; inp.lock(); rev.disabled = true; b.disabled = true;
        var full = r.correct;
        window.LabUI.verdict(verdict, full ? 'ok' : 'bad', full ? 'Correcto' : 'No coincide',
          full && r.carried ? 'Con tu resultado del inciso anterior, este inciso está bien: cuenta completo (arrastre de error).' : null);
        sol.hidden = false; sol.innerHTML = '<strong>Solución.</strong> ' + part.solution(v);
        render(verdict.parentNode);
      }) : null;
      if (rev) btns.appendChild(rev);
      btns.appendChild(b);
      var node = h('li', { class: 'part' }, [
        h('p', { class: 'part__prompt', html: '<strong>' + part.label + ')</strong> ' + part.prompt(v) + ' <span class="part__pts mono">(' + part.points + ' pts)</span>' }),
        inp.node, btns, verdict, sol
      ]);
      parts.push({ node: node, inp: inp, st: st });
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
    var minutes = opts.minutes != null ? opts.minutes : Q().suggestedMinutes(opts.presetId);
    var ck = minutes > 0 ? clock(minutes, opts.clockLabel) : null;
    var both = questions.length && problems.length;
    var qBox = h('div', { class: 'quiz-list' });
    var pBox = h('div', { class: 'quiz-list' });
    var finish = window.LabUI.button(opts.finishLabel || 'Terminar simulacro', 'primary', done);
    var out = h('div', { class: 'quiz-results', hidden: true });
    root.appendChild(h('div', { class: 'sim-run' }, [
      ck && ck.node,
      h('p', { class: 'muted' }, [opts.review
        ? 'Revisión inmediata: al contestar cada pregunta o inciso, pulsa “Revisar” y verás si está bien y por qué, sin descuento. “Ver solución” antes de contestar deja máximo el 30 %.'
        : 'No hay revisión hasta que termines. “Ver solución” está disponible en cualquier momento, pero deja máximo el 30 % de esa pregunta o inciso.']),
      questions.length ? h('h3', { class: 'sim-run__title' }, ['Preguntas cortas · ' + (both ? '40' : '100') + ' %']) : null, qBox,
      problems.length ? h('h3', { class: 'sim-run__title' }, ['Problemas · ' + (both ? '60' : '100') + ' %']) : null, pBox,
      h('div', { class: 'lab-buttons quiz-actions' }, [finish]), out
    ]));
    var qCards = questions.map(function (q, i) { var c = questionCard(q, window.CBExercises.instance(q), i + 1, opts.review ? 'exam-review' : 'exam'); qBox.appendChild(c.node); return c; });
    var pCards = problems.map(function (p, i) { var c = problemCard(p, window.CBExercises.instance(p), i + 1, !!opts.review); pBox.appendChild(c.node); return c; });
    render(root);

    function done() {
      if (ck) { ck.stop(); ck.node.hidden = true; }
      finish.disabled = true;
      var deps = { math: window.math };
      var shortRes = qCards.map(function (c) {
        var r = Q().gradeShort(c.q, c.v, c.get(), c.state.seen, deps);
        c.lock();
        return Object.assign(r, { q: c.q, v: c.v, score: r.earned });
      });
      var examRes = pCards.map(function (c) {
        var r = Q().gradeProblem(c.p, c.v, c.parts.map(function (x) { return safeGet(x.inp.get); }), c.parts.map(function (x) { return x.st.seen; }), deps);
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
      var partsTxt = [];
      if (score.weights.short) partsTxt.push('Preguntas cortas ' + fmtPts(score.short) + ' / ' + score.weights.short);
      if (score.weights.exam) partsTxt.push('Problemas ' + fmtPts(score.exam) + ' / ' + score.weights.exam);
      out.appendChild(h('p', { class: 'mono' }, [partsTxt.join(' · ')]));
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
      Q().saveHistory('cb-exam-history', { date: new Date().toISOString(), score: Math.round(score.total), topics: (opts.kind ? opts.kind + ' · ' : '') + opts.topics.join(', ') });
      if (opts.onFinish) opts.onFinish();
    }
  }

  function sessionsOf(meta) { return meta.groups.reduce(function (a, g) { return a.concat(g.sessions.map(function (s) { return Object.assign({ group: g }, s); })); }, []); }

  /* ---------- Lanzador (/quiz/) ----------
     1. Curso · 2. Tipo (práctica, simulacro o personalizado) · 3. Temas · 4. Opciones */
  function launcher(root) {
    var M = metas(), codes = Object.keys(M);
    var params = new URLSearchParams(location.search);
    var presets = (window.QUIZ_PRESETS && window.QUIZ_PRESETS.presets) || [];
    var modoParam = params.get('modo');
    var state = {
      code: codes.indexOf(params.get('curso')) >= 0 ? params.get('curso') : codes[0],
      kind: modoParam === 'simulacro' ? 'sim' : modoParam === 'personalizado' ? 'custom' : 'quiz',
      preset: null
    };
    var boxes = [];

    function radioCards(name, items, current, onChange) {
      var group = uid(name);
      var fs = h('div', { class: 'launcher__cards', role: 'radiogroup' }, items.map(function (it) {
        var input = h('input', { type: 'radio', name: group, value: it.value, checked: it.value === current });
        input.addEventListener('change', function () { onChange(it.value); });
        return h('label', { class: 'mode-opt' }, [input, h('span', {}, [h('strong', {}, [it.title]), it.text ? h('small', {}, [it.text]) : null])]);
      }));
      return fs;
    }
    function step(n, title, body) {
      return h('section', { class: 'launcher__step', 'aria-labelledby': 'step-' + n }, [
        h('h2', { class: 'launcher__step-title', id: 'step-' + n }, [h('span', { class: 'launcher__num mono' }, [String(n)]), title])
      ].concat(body));
    }

    // 1. Curso
    var courseCards = radioCards('curso', codes.map(function (c) {
      var n = sessionsOf(M[c]).filter(function (s) { return s.bank; }).length;
      return { value: c, title: M[c].fullName || M[c].name, text: n + (n === 1 ? ' sesión' : ' sesiones') + ' con banco de preguntas' };
    }), state.code, function (v) { state.code = v; state.preset = null; drawTopics(); upd(); });

    // 2. Tipo
    var kindCards = radioCards('tipo', [
      { value: 'quiz', title: 'Quiz de práctica', text: 'Preguntas cortas con retroalimentación inmediata.' },
      { value: 'sim', title: 'Simulacro de examen', text: 'Formato de parcial: 40 % preguntas y 60 % problemas, con reloj sugerido.' },
      { value: 'custom', title: 'Personalizado', text: 'Tú eliges cuántas preguntas y problemas, el reloj y cuándo ver la revisión.' }
    ], state.kind, function (v) { state.kind = v; state.preset = null; drawTopics(); drawOptions(); upd(); });

    // 3. Temas del curso elegido
    var presetNote = h('p', { class: 'crumb' }, ['Atajos · ' + ((window.QUIZ_PRESETS && window.QUIZ_PRESETS.note) || '')]);
    var presetRow = h('div', { class: 'launcher__presets' });
    var availability = h('p', { class: 'launcher__avail muted', 'aria-live': 'polite' });
    var sessionsBox = h('div', { class: 'launcher__course' });
    function drawTopics() {
      var meta = M[state.code];
      presetRow.innerHTML = '';
      availability.textContent = '';
      presets.filter(function (p) {
        return state.kind === 'custom' || (state.kind === 'sim' ? p.kind === 'exam' : p.kind === 'quiz');
      }).forEach(function (p) {
        presetRow.appendChild(window.LabUI.button(p.label + ' · S' + pad(p.sessions[0]) + '–S' + pad(p.sessions[p.sessions.length - 1]), 'ghost', function () { applyPreset(p); }));
      });
      boxes = [];
      sessionsBox.innerHTML = '';
      meta.groups.forEach(function (g) {
        sessionsBox.appendChild(h('div', { class: 'launcher__group' }, [
          h('p', { class: 'crumb' }, ['Bloque ' + g.id + ' · ' + g.label]),
          h('div', { class: 'launcher__sessions' }, g.sessions.map(function (s) {
            var id = uid('s');
            var cb = h('input', { type: 'checkbox', id: id, disabled: !s.bank });
            cb.addEventListener('change', function () { state.preset = null; upd(); });
            boxes.push({ cb: cb, code: state.code, n: s.n, bank: !!s.bank });
            return h('label', { class: 'sess-chip' + (s.bank ? '' : ' is-soon'), for: id, title: s.title + (s.bank ? '' : ' · banco en preparación') }, [
              cb, h('span', { class: 'sess-chip__n mono' }, ['S' + pad(s.n)]), s.tag ? h('span', { class: 'sess-chip__tag' }, [s.tag]) : null
            ]);
          }))
        ]));
      });
    }
    function applyPreset(p) {
      boxes.forEach(function (b) { b.cb.checked = b.bank && p.sessions.indexOf(b.n) >= 0; });
      state.preset = p.id;
      var have = boxes.filter(function (b) { return b.cb.checked; }).length;
      availability.textContent = have
        ? 'De ' + p.label + ' ya hay banco para ' + have + ' de ' + p.sessions.length + ' sesiones de ' + M[state.code].name + '; las demás llegan pronto.'
        : 'Todavía no hay preguntas de ' + M[state.code].name + ' para ' + p.label + '. Llegan pronto.';
      upd();
    }

    // 4. Opciones según el tipo
    var options = h('div', { class: 'launcher__options' });
    var countSel = window.LabUI.select({ label: 'Número de preguntas', options: ['5', '8', '10', '15'] });
    countSel.input.value = '1';
    function numField(label, min, max, value, unit) {
      var id = uid('n');
      var input = h('input', { id: id, type: 'number', min: min, max: max, step: 1, value: value, inputmode: 'numeric', class: 'lab-input lab-input--num' });
      input.addEventListener('input', upd);
      return { node: h('div', { class: 'lab-field' }, [h('label', { for: id, class: 'lab-field__label' }, [label]), h('div', { class: 'exercise__inputrow' }, [input, unit ? h('span', { class: 'exercise__unit' }, [unit]) : null])]), input: input,
        get: function () { var v = Math.round(+input.value); return isFinite(v) ? Math.max(min, Math.min(max, v)) : min; } };
    }
    var cQ = numField('Preguntas cortas', 0, 30, 6);
    var cP = numField('Problemas de examen', 0, 3, 1);
    var cMin = numField('Reloj', 0, 240, 30, 'min · 0 = sin reloj');
    var cFeed = window.LabUI.select({ label: 'Revisión', options: ['Al terminar el examen completo', 'Al contestar cada pregunta o inciso'] });
    cFeed.input.addEventListener('change', upd);
    function drawOptions() {
      options.innerHTML = '';
      if (state.kind === 'quiz') options.appendChild(countSel.node);
      else if (state.kind === 'sim') options.appendChild(h('p', { class: 'muted' }, ['4 preguntas cortas (40 %) y hasta 3 problemas (60 %). Reloj sugerido de 90 min, o 120 en el final; se puede pausar o apagar.']));
      else [cQ.node, cP.node, cMin.node, cFeed.node].forEach(function (n) { options.appendChild(n); });
    }

    var start = window.LabUI.button('Empezar', 'primary', go);
    var summary = h('p', { class: 'launcher__summary mono', 'aria-live': 'polite' });
    function selected() { return boxes.filter(function (b) { return b.cb.checked; }); }
    function upd() {
      var n = selected().length, msg = '';
      if (!n) msg = 'Elige al menos una sesión o un atajo.';
      else msg = n + (n === 1 ? ' sesión elegida' : ' sesiones elegidas');
      if (state.kind === 'custom') {
        if (n && cQ.get() + cP.get() === 0) msg = 'Pide al menos una pregunta o un problema.';
      }
      summary.textContent = msg;
      start.disabled = !n || (state.kind === 'custom' && cQ.get() + cP.get() === 0);
    }

    var stage = h('div', { class: 'launcher__stage' });
    var form = h('div', { class: 'sheet launcher' }, [
      step(1, 'Curso', [courseCards]),
      step(2, 'Tipo', [kindCards]),
      step(3, 'Temas', [presetNote, presetRow, availability, h('p', { class: 'lab-field__label' }, ['O elige tus sesiones']), sessionsBox]),
      step(4, 'Opciones', [options, h('div', { class: 'launcher__go' }, [summary, start])])
    ]);
    root.appendChild(form);
    root.appendChild(stage);
    root.appendChild(historyPanel());
    drawTopics();
    drawOptions();

    // Parámetros: ?curso=c1&modo=simulacro&preset=parcial-2 · ?curso=f1&tags=f1.S06
    var pre = presets.filter(function (p) { return p.id === params.get('preset'); })[0];
    if (pre) applyPreset(pre);
    (params.get('tags') || '').split(',').forEach(function (t) {
      var m = t.match(/^(\w+)\.S(\d\d)$/);
      if (m && m[1] === state.code) boxes.forEach(function (b) { if (b.n === +m[2] && b.bank) b.cb.checked = true; });
    });
    upd();

    function loadAll(sel, needExams) {
      var meta = M[state.code];
      var loads = [window.LabUI.loadMath()];
      sel.forEach(function (b) {
        if (!(window.CB_BANK && window.CB_BANK[b.code] && window.CB_BANK[b.code]['S' + pad(b.n)])) loads.push(window.LabUI.loadScript('../data/' + meta.slug + '/bank/sesion-' + pad(b.n) + '.js'));
      });
      if (needExams && !(window.CB_EXAMS && window.CB_EXAMS[state.code])) loads.push(window.LabUI.loadScript('../data/' + meta.slug + '/exam-problems.js'));
      return Promise.all(loads);
    }

    function go() {
      var sel = selected();
      if (!sel.length) return;
      var custom = state.kind === 'custom';
      var needExams = state.kind === 'sim' || (custom && cP.get() > 0);
      start.disabled = true;
      stage.innerHTML = '<p class="muted">Cargando preguntas…</p>';
      loadAll(sel, needExams).then(function () {
        start.disabled = false;
        var code = state.code, meta = M[code];
        var pool = Q().pool(window.CB_BANK, [{ code: code, sessions: sel.map(function (b) { return b.n; }) }]);
        var tags = sel.map(function (b) { return code + '.S' + pad(b.n); });
        var probs = needExams ? Q().eligibleProblems((window.CB_EXAMS || {})[code], tags) : [];
        var tagOf = {}; sessionsOf(meta).forEach(function (s) { tagOf[s.n] = s.tag; });
        var topics = sel.map(function (b) { return meta.name + ' S' + pad(b.n) + (tagOf[b.n] ? ' · ' + tagOf[b.n] : ''); });
        var common = { topics: topics, root: '../', onFinish: showBack };
        if (state.kind === 'quiz') {
          form.hidden = true;
          runPractice(stage, Q().pick(pool, [5, 8, 10, 15][+countSel.input.value]), Object.assign({ tagFilter: function (t) { return t.split('.').length === 2 || sel.length === 1; }, again: go }, common));
        } else if (state.kind === 'sim') {
          var comp = Q().composeSimulacro(pool, probs);
          if (comp.questions.length < 3 || comp.problems.length < 1) {
            stage.innerHTML = '<p class="verdict verdict--warn">Con estas sesiones todavía no alcanza para un simulacro (hacen falta 3 preguntas y al menos 1 problema). Agrega sesiones, prueba el modo personalizado o el quiz de práctica.</p>';
            return;
          }
          form.hidden = true;
          runSimulacro(stage, comp.questions, comp.problems, Object.assign({ presetId: state.preset, kind: 'Simulacro' }, common));
        } else {
          var qs = Q().pick(pool, cQ.get());
          var ps = probs.slice().sort(function () { return Math.random() - 0.5; }).slice(0, cP.get());
          var note = [];
          if (qs.length < cQ.get()) note.push('solo hay ' + qs.length + ' preguntas');
          if (ps.length < cP.get()) note.push('solo hay ' + ps.length + ' problemas');
          if (!qs.length && !ps.length) { stage.innerHTML = '<p class="verdict verdict--warn">Con estas sesiones todavía no hay preguntas ni problemas.</p>'; return; }
          form.hidden = true;
          stage.innerHTML = '';
          var run = h('div', {});
          if (note.length) stage.appendChild(h('p', { class: 'verdict verdict--warn' }, ['Con estas sesiones ' + note.join(' y ') + '; el examen usa las que hay.']));
          stage.appendChild(run);
          runSimulacro(run, qs, ps, Object.assign({ minutes: cMin.get(), clockLabel: 'Reloj', finishLabel: 'Terminar examen', kind: 'Personalizado', review: cFeed.input.value === '1' }, common));
        }
        stage.scrollIntoView({ block: 'start' });
      }, function (e) {
        start.disabled = false;
        stage.innerHTML = '<p class="verdict verdict--bad">No se pudieron cargar las preguntas: ' + e.message + '</p>';
      });
    }
    function showBack() {
      var back = window.LabUI.button('Volver al lanzador', 'ghost', function () { form.hidden = false; stage.innerHTML = ''; refreshHistory(); form.scrollIntoView({ block: 'start' }); });
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
    if (quiz.length || exam.length) {
      var bar = h('div', { class: 'lab-buttons history__actions' });
      var clear = window.LabUI.button('Borrar historial', 'ghost', function () {
        confirmInline(bar, 'Se borrarán los quizzes y simulacros guardados en este navegador. No se puede deshacer.', function () {
          Q().clearHistory('cb-quiz-history');
          Q().clearHistory('cb-exam-history');
          refreshHistory();
          var msg = historyNode.querySelector('h2');
          if (msg) { msg.setAttribute('tabindex', '-1'); msg.focus(); }
        }, 'Sí, borrar');
      });
      bar.appendChild(clear);
      historyNode.appendChild(bar);
    }
  }

  window.CBQuizUI = { semaforo: semaforo, questionCard: questionCard, runPractice: runPractice, sessionQuiz: sessionQuiz, runSimulacro: runSimulacro, launcher: launcher };
})();
