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
    // La respuesta correcta se muestra siempre que la del alumno no lo sea.
    var right = h('p', { class: 'qcard__right', hidden: true, html: '<strong>Respuesta correcta:</strong> ' + correctText(q, v) });
    var state = { done: false, seen: false, input: '' };
    var buttons = h('div', { class: 'lab-buttons' });
    card.appendChild(head);
    card.appendChild(h('div', { class: 'qcard__prompt', html: q.prompt(v) }));
    card.appendChild(inp.node);
    card.appendChild(buttons);
    card.appendChild(verdict);
    card.appendChild(right);
    card.appendChild(why);
    function showRight(kind) { right.hidden = kind === 'ok'; card.classList.add(kind === 'ok' ? 'is-ok' : kind === 'warn' ? 'is-partial' : 'is-bad'); }

    if (mode === 'practice') {
      var check = window.LabUI.button('Revisar', 'primary', function () {
        var input;
        try { input = inp.get(); } catch (e) { window.LabUI.verdict(verdict, 'bad', e.message, null); return; }
        var r = Q().grade(q, v, input, { math: window.math });
        if (r.kind === 'invalid') { window.LabUI.verdict(verdict, 'bad', r.say || 'Escribe tu respuesta.', null); return; }
        state.done = true; state.input = input;
        inp.lock(); check.disabled = true;
        window.LabUI.verdict(verdict, r.kind, VERDICT_TITLE[r.kind], r.say || null);
        why.hidden = false; showRight(r.kind);
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
        state.reviewed = true; state.input = input;
        inp.lock(); rev.disabled = true; sol.disabled = true;
        window.LabUI.verdict(verdict, r.kind, VERDICT_TITLE[r.kind], r.say || null);
        why.hidden = false; showRight(r.kind);
        render(card);
        if (onResult) onResult({ q: q, v: v, kind: r.kind });
      }) : null;
      if (rev) {
        buttons.appendChild(rev);
        if (inp.input) inp.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); rev.click(); } });
      }
      buttons.appendChild(sol);
    }
    // Al entregar: marca la tarjeta como en Canvas (bien, parcial o mal) con la correcta y el porqué.
    function mark(res) {
      inp.lock();
      buttons.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      var kind = res.correct ? 'ok' : res.earned > 0 ? 'warn' : 'bad';
      if (!state.reviewed && !state.done) {
        window.LabUI.verdict(verdict, kind, res.correct ? '¡Bien!' : (String(safeGet(inp.get)).trim() ? 'Incorrecta' : 'Sin respuesta'),
          fmtPts(res.earned) + ' / 1' + (res.withSolution ? ' · viste la solución' : ''));
      }
      why.hidden = false; showRight(kind);
      render(card);
    }
    return { node: card, state: state, get: function () { return safeGet(inp.get); }, lock: inp.lock, mark: mark, q: q, v: v };
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
        return Object.assign(r || { q: c.q, score: 0, kind: 'skip' }, { card: c });
      });
      // Las que quedaron sin revisar también muestran la respuesta correcta.
      all.forEach(function (r) { if (!r.card.state.done) r.card.mark({ correct: false, earned: 0 }); });
      cards.forEach(function (c) { c.lock(); });
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
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind: 'quiz', scores: scores,
        date: new Date().toISOString(), score: Math.round(pct), n: all.length,
        topics: (opts.topics || []).join(', '),
        detail: all.map(function (r) { return shortDetail(r.q, r.card.v, r.card.state.input || r.card.get(), r.score, false); })
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
  function exprTex(src, withC) {
    try {
      var prep = window.LabMath.core.prep;
      return '$' + window.math.parse(prep(src)).toTex({ implicit: 'hide', parenthesis: 'auto' }) + (withC ? ' + C' : '') + '$';
    } catch (e) { return '<code>' + src + '</code>'; }
  }

  /* ---------- Detalle de un intento para el historial ----------
     Se guarda lo necesario para volver a verlo: enunciado, respuesta del alumno,
     respuesta correcta, puntos y porqué. HTML ya generado: no depende de las plantillas. */
  function correctText(q, v) {
    var a = q.answer(v);
    return q.type === 'choice' ? a : q.type === 'expr' ? exprTex(a, !!q.integrand) : fmtPts(a) + (q.unit ? ' ' + q.unit : '');
  }
  function studentText(q, raw) {
    raw = raw == null ? '' : String(raw).trim();
    if (!raw) return '<em>sin respuesta</em>';
    return q.type === 'expr' ? exprTex(raw, false) : raw.replace(/</g, '&lt;');
  }
  function shortDetail(q, v, raw, earned, seen) {
    return { p: q.prompt(v), a: studentText(q, raw), c: correctText(q, v), e: earned, s: !!seen, w: str(q.why, v) };
  }
  function problemDetail(p, v, res) {
    return {
      t: p.title, st: p.statement(v),
      parts: res.parts.map(function (pr, k) {
        var part = p.parts[k];
        return { l: pr.label, p: part.prompt(v, []), a: studentText({ type: part.type || 'numeric' }, pr.answer) + (part.unit && pr.answer ? ' ' + part.unit : ''),
          e: pr.earned, pts: pr.points, cr: !!pr.carried, s: !!pr.withSolution, sol: part.solution(v) };
      })
    };
  }
  function renderDetail(d) {
    var box = h('div', { class: 'history__detail' });
    if (!d || !d.length) { box.appendChild(h('p', { class: 'muted' }, ['Este intento se guardó antes de que el historial incluyera el detalle.'])); return box; }
    var ol = h('ol', { class: 'breakdown' });
    d.forEach(function (it, i) {
      if (it.parts) {
        ol.appendChild(h('li', {}, [h('p', { html: '<strong>Problema · ' + it.t + '</strong>' }), h('div', { class: 'muted', html: it.st })].concat(it.parts.map(function (pt) {
          var flags = (pt.cr ? ' <span class="tag">arrastre de error</span>' : '') + (pt.s ? ' <span class="tag">con solución</span>' : '');
          return h('div', { class: 'breakdown__part', html: '<strong>' + pt.l + ')</strong> ' + pt.p + '<br>Tu respuesta: ' + pt.a + ' · ' + fmtPts(pt.e) + ' / ' + pt.pts + flags + '<br><span class="muted">' + pt.sol + '</span>' });
        }))));
      } else {
        ol.appendChild(h('li', {}, [
          h('div', { html: it.p }),
          h('p', { html: 'Tu respuesta: ' + it.a + ' · ' + (it.e >= 1 - 1e-9 ? '<strong>bien</strong>' : 'correcta: ' + it.c) + ' · ' + fmtPts(it.e) + ' / 1' + (it.s ? ' <span class="tag">con solución</span>' : '') }),
          h('p', { class: 'muted', html: it.w })
        ]));
      }
    });
    box.appendChild(ol);
    return box;
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
      parts.push({ node: node, inp: inp, st: st, verdict: verdict, sol: sol, btns: btns, part: part });
    });
    var diagram = p.diagram && window.Diagrams && window.Diagrams[p.diagram.id]
      ? h('figure', { class: 'figure sheet problem__figure', html: window.Diagrams[p.diagram.id](p.diagram.state(v)) }) : null;
    var node = h('article', { class: 'problem' }, [
      h('header', { class: 'qcard__head' }, [h('span', { class: 'qcard__n mono' }, ['Problema ' + n + ' · ' + p.title])]),
      h('div', { class: 'problem__statement', html: p.statement(v) }),
      diagram,
      h('ol', { class: 'problem__parts' }, parts.map(function (x) { return x.node; }))
    ]);
    // Al entregar: cada inciso con su resultado, el valor correcto y la solución.
    // Si el alumno arrastró un error, se muestra el valor esperado con SUS datos y el de la solución.
    function mark(res) {
      res.parts.forEach(function (pr, k) {
        var x = parts[k], unit = x.part.unit ? ' ' + x.part.unit : '';
        x.inp.lock();
        x.btns.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        var kind = pr.correct ? 'ok' : 'bad';
        var fmtV = function (val) { return typeof val === 'number' && isFinite(val) ? fmtPts(val) + unit : String(val); };
        var note = fmtPts(pr.earned) + ' / ' + pr.points + ' pts';
        if (pr.carried) note += ' · con tu resultado anterior cuenta completo (arrastre de error)';
        if (!pr.correct) note += ' · resultado correcto: ' + (isFinite(pr.expected) && Math.abs(pr.expected - pr.expectedTrue) > 1e-9
          ? fmtV(pr.expected) + ' con tus datos (' + fmtV(pr.expectedTrue) + ' con los datos correctos)' : fmtV(pr.expectedTrue));
        if (!x.st.reviewed) window.LabUI.verdict(x.verdict, kind, pr.correct ? '¡Bien!' : (String(pr.answer || '').trim() ? 'Incorrecto' : 'Sin respuesta'), note);
        else if (!pr.correct) x.verdict.appendChild(h('p', { class: 'verdict__note' }, [note]));
        x.node.classList.add(pr.correct ? 'is-ok' : 'is-bad');
        x.sol.hidden = false; x.sol.innerHTML = '<strong>Solución.</strong> ' + x.part.solution(v);
      });
      render(node);
    }
    return { node: node, parts: parts, mark: mark, p: p, v: v };
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
        var raw = c.get();
        var r = Q().gradeShort(c.q, c.v, raw, c.state.seen, deps);
        c.lock();
        return Object.assign(r, { q: c.q, v: c.v, score: r.earned, raw: raw });
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
          h('p', { html: '<strong>Pregunta ' + (i + 1) + '</strong> · ' + fmtPts(r.earned) + ' / 1' + (r.withSolution ? ' · <span class="tag">con solución</span>' : '') + (r.correct ? '' : ' · respuesta correcta: ' + correctText(r.q, r.v)) }),
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
      Q().saveHistory('cb-exam-history', {
        date: new Date().toISOString(), score: Math.round(score.total), topics: (opts.kind ? opts.kind + ' · ' : '') + opts.topics.join(', '),
        detail: shortRes.map(function (r) { return shortDetail(r.q, r.v, r.raw, r.earned, r.withSolution); })
          .concat(examRes.map(function (r) { return problemDetail(r.p, r.v, r); }))
      });
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
      // Solo se avisa cuando falta algo: con el curso completo el mensaje no aporta.
      availability.textContent = have === p.sessions.length ? ''
        : have ? 'De ' + p.label + ' ya hay banco para ' + have + ' de ' + p.sessions.length + ' sesiones de ' + M[state.code].name + '; las demás llegan pronto.'
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

    var form = h('div', { class: 'sheet launcher' }, [
      step(1, 'Curso', [courseCards]),
      step(2, 'Tipo', [kindCards]),
      step(3, 'Temas', [presetNote, presetRow, availability, h('p', { class: 'lab-field__label' }, ['O elige tus sesiones']), sessionsBox]),
      step(4, 'Opciones', [options, h('div', { class: 'launcher__go' }, [summary, start])])
    ]);
    root.appendChild(form);
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

    // Empezar: el examen corre en su propia página (quiz/examen/), como en Canvas.
    // El plan viaja en sessionStorage y se consume al empezar: recargar cancela el intento.
    function go() {
      var sel = selected();
      if (!sel.length) return;
      var plan = {
        code: state.code, kind: state.kind, preset: state.preset,
        sessions: sel.map(function (b) { return b.n; }),
        count: [5, 8, 10, 15][+countSel.input.value],
        qN: cQ.get(), pN: cP.get(), minutes: cMin.get(), review: cFeed.input.value === '1'
      };
      try { sessionStorage.setItem('cb-exam-plan', JSON.stringify(plan)); }
      catch (e) { summary.textContent = 'Tu navegador no permite guardar el examen en esta pestaña.'; return; }
      window.location.href = 'examen/';
    }
  }

  /* ---------- Página del examen (quiz/examen/) ----------
     Dos modos: un intento nuevo (plan en sessionStorage) o la revisión de un intento
     guardado (?intento=ID). Preguntas a la izquierda; a la derecha los temas, el
     avance, el reloj y, al entregar, el semáforo. Salir a media prueba pide
     confirmación y cancela el intento (no se guarda). */
  var KIND_NAME = { quiz: 'Quiz de práctica', sim: 'Simulacro de examen', custom: 'Examen personalizado' };
  function historyKeyOf(kind) { return kind === 'quiz' ? 'cb-quiz-history' : 'cb-exam-history'; }

  function examPage(root) {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('intento');
    if (id) return reviewPage(root, id);
    var plan = null;
    try { plan = JSON.parse(sessionStorage.getItem('cb-exam-plan') || 'null'); sessionStorage.removeItem('cb-exam-plan'); } catch (e) {}
    if (!plan) {
      root.appendChild(h('div', { class: 'sheet exam-empty' }, [
        h('h1', {}, ['No hay un examen en curso']),
        h('p', {}, ['Los intentos se empiezan desde el lanzador. Si recargaste la página a media prueba, ese intento se canceló.']),
        h('p', {}, [h('a', { class: 'btn btn--primary', href: '../' }, ['Ir al lanzador'])])
      ]));
      return;
    }
    var M = metas(), meta = M[plan.code];
    if (!meta) { root.appendChild(h('p', { class: 'verdict verdict--bad' }, ['Curso desconocido.'])); return; }
    var tagOf = {}; sessionsOf(meta).forEach(function (s) { tagOf[s.n] = s.tag; });
    var topics = plan.sessions.map(function (n) { return meta.name + ' S' + pad(n) + (tagOf[n] ? ' · ' + tagOf[n] : ''); });
    root.appendChild(h('p', { class: 'muted' }, ['Cargando preguntas…']));
    var loads = [window.LabUI.loadMath()];
    plan.sessions.forEach(function (n) {
      if (!(window.CB_BANK && window.CB_BANK[plan.code] && window.CB_BANK[plan.code]['S' + pad(n)])) loads.push(window.LabUI.loadScript('../../data/' + meta.slug + '/bank/sesion-' + pad(n) + '.js'));
    });
    var needExams = plan.kind === 'sim' || (plan.kind === 'custom' && plan.pN > 0);
    if (needExams && !(window.CB_EXAMS && window.CB_EXAMS[plan.code])) loads.push(window.LabUI.loadScript('../../data/' + meta.slug + '/exam-problems.js'));
    Promise.all(loads).then(function () {
      root.innerHTML = '';
      var pool = Q().pool(window.CB_BANK, [{ code: plan.code, sessions: plan.sessions }]);
      var tags = plan.sessions.map(function (n) { return plan.code + '.S' + pad(n); });
      var probs = needExams ? Q().eligibleProblems((window.CB_EXAMS || {})[plan.code], tags) : [];
      var qs, ps, notes = [];
      if (plan.kind === 'quiz') { qs = Q().pick(pool, plan.count); ps = []; }
      else if (plan.kind === 'sim') {
        var comp = Q().composeSimulacro(pool, probs);
        if (comp.questions.length < 3 || comp.problems.length < 1) {
          root.appendChild(h('div', { class: 'sheet exam-empty' }, [h('p', { class: 'verdict verdict--warn' }, ['Con estas sesiones todavía no alcanza para un simulacro (hacen falta 3 preguntas y al menos 1 problema). Agrega sesiones o prueba el modo personalizado.']), h('p', {}, [h('a', { class: 'btn btn--ghost', href: '../' }, ['Volver al lanzador'])])]));
          return;
        }
        qs = comp.questions; ps = comp.problems;
      } else {
        qs = Q().pick(pool, plan.qN);
        ps = probs.slice().sort(function () { return Math.random() - 0.5; }).slice(0, plan.pN);
        if (qs.length < plan.qN) notes.push('solo hay ' + qs.length + ' preguntas');
        if (ps.length < plan.pN) notes.push('solo hay ' + ps.length + ' problemas');
      }
      if (!qs.length && !ps.length) { root.appendChild(h('p', { class: 'verdict verdict--warn' }, ['Con estas sesiones todavía no hay preguntas.'])); return; }
      runAttempt(root, plan, meta, qs, ps, topics, notes);
    }, function (e) {
      root.innerHTML = '';
      root.appendChild(h('p', { class: 'verdict verdict--bad' }, ['No se pudieron cargar las preguntas: ' + e.message]));
    });
  }

  function examLayout(root, title, sub) {
    var main = h('div', { class: 'exam__main' });
    var side = h('aside', { class: 'exam__side', 'aria-label': 'Temas y avance' });
    var head = h('header', { class: 'exam__head' }, [h('p', { class: 'crumb' }, [h('a', { href: '../' }, ['Practicar'])]), h('h1', {}, [title]), sub ? h('p', { class: 'muted' }, [sub]) : null]);
    var results = h('section', { class: 'exam__results', hidden: true, 'aria-live': 'polite' });
    root.appendChild(h('div', { class: 'exam' }, [h('div', { class: 'exam__col' }, [head, results, main]), side]));
    return { main: main, side: side, results: results, head: head };
  }
  function sideTopics(side, meta, sessions) {
    side.appendChild(h('h2', { class: 'exam__side-title' }, ['Temas']));
    side.appendChild(h('ul', { class: 'exam__topics' }, sessions.map(function (n) {
      var s = sessionsOf(meta).filter(function (x) { return x.n === n; })[0] || {};
      return h('li', {}, [h('span', { class: 'mono' }, ['S' + pad(n)]), ' ', s.tag || s.title || '']);
    })));
  }

  function runAttempt(root, plan, meta, questions, problems, topics, notes) {
    var immediate = plan.kind === 'quiz' || (plan.kind === 'custom' && plan.review);
    var L = examLayout(root, KIND_NAME[plan.kind] + ' · ' + meta.name, immediate
      ? 'Revisión inmediata: pulsa “Revisar” al contestar cada pregunta o inciso. “Ver solución” antes de contestar deja máximo el 30 %.'
      : 'No hay revisión hasta que entregues. “Ver solución” está disponible, pero deja máximo el 30 % de esa pregunta o inciso.');
    if (notes.length) L.main.appendChild(h('p', { class: 'verdict verdict--warn' }, ['Con estas sesiones ' + notes.join(' y ') + '; el examen usa las que hay.']));
    var both = questions.length && problems.length;
    var minutes = plan.kind === 'sim' ? Q().suggestedMinutes(plan.preset) : plan.kind === 'custom' ? plan.minutes : 0;
    var ck = minutes > 0 ? clock(minutes, plan.kind === 'sim' ? 'Reloj sugerido' : 'Reloj') : null;
    var progress = h('p', { class: 'exam__progress mono', 'aria-live': 'polite' });
    function submit(host) {
      var left = total - answered();
      if (left > 0) confirmInline(host, 'Te faltan ' + left + (left === 1 ? ' respuesta' : ' respuestas') + '. ¿Entregar de todos modos?', done, 'Entregar');
      else done();
    }
    var finish = window.LabUI.button('Entregar', 'primary', function () { submit(actions); });
    var leave = window.LabUI.button('Salir', 'ghost', function () {
      confirmInline(actions, '¿Salir del examen? Este intento se cancela y no se guarda.', function () { finished = true; window.location.href = '../'; }, 'Sí, salir');
    });
    var actions = h('div', { class: 'lab-buttons exam__actions' }, [finish, leave]);
    sideTopics(L.side, meta, plan.sessions);
    if (ck) L.side.appendChild(ck.node);
    L.side.appendChild(progress);
    L.side.appendChild(actions);
    var sem = h('div', { class: 'exam__sem' });
    L.side.appendChild(sem);

    var qBox = h('div', { class: 'quiz-list' }), pBox = h('div', { class: 'quiz-list' });
    if (questions.length) L.main.appendChild(h('h2', { class: 'sim-run__title' }, ['Preguntas' + (plan.kind === 'quiz' ? '' : ' cortas · ' + (both ? '40' : '100') + ' %')]));
    L.main.appendChild(qBox);
    if (problems.length) L.main.appendChild(h('h2', { class: 'sim-run__title' }, ['Problemas · ' + (both ? '60' : '100') + ' %']));
    L.main.appendChild(pBox);
    // Al final de las preguntas también se puede entregar (en móvil la barra queda arriba).
    var endBar = h('div', { class: 'lab-buttons exam__end' });
    endBar.appendChild(window.LabUI.button('Entregar examen', 'primary', function () { submit(endBar); }));
    L.main.appendChild(endBar);
    var qCards = questions.map(function (q, i) { var c = questionCard(q, window.CBExercises.instance(q), i + 1, immediate ? 'exam-review' : 'exam', upd); qBox.appendChild(c.node); return c; });
    var pCards = problems.map(function (p, i) { var c = problemCard(p, window.CBExercises.instance(p), i + 1, immediate); pBox.appendChild(c.node); return c; });
    var total = qCards.length + pCards.reduce(function (s, c) { return s + c.parts.length; }, 0);
    function answered() {
      return qCards.filter(function (c) { return String(c.get()).trim(); }).length +
        pCards.reduce(function (s, c) { return s + c.parts.filter(function (x) { return String(safeGet(x.inp.get)).trim(); }).length; }, 0);
    }
    function upd() { progress.textContent = answered() + ' de ' + total + ' contestadas'; }
    L.main.addEventListener('input', upd); L.main.addEventListener('change', upd); L.main.addEventListener('click', function () { setTimeout(upd, 0); });
    upd();
    render(L.main);

    // Salir a media prueba: el navegador pide confirmación; el intento no se guarda.
    var finished = false;
    function guard(e) { if (finished) return; e.preventDefault(); e.returnValue = ''; return ''; }
    window.addEventListener('beforeunload', guard);

    function done() {
      finished = true;
      window.removeEventListener('beforeunload', guard);
      if (ck) { ck.stop(); ck.node.hidden = true; }
      var deps = { math: window.math };
      var shortRes = qCards.map(function (c) {
        var raw = c.get(), r = Q().gradeShort(c.q, c.v, raw, c.state.seen, deps);
        c.mark(r);
        return Object.assign(r, { q: c.q, v: c.v, score: r.earned, raw: raw });
      });
      var examRes = pCards.map(function (c) {
        var r = Q().gradeProblem(c.p, c.v, c.parts.map(function (x) { return safeGet(x.inp.get); }), c.parts.map(function (x) { return x.st.seen; }), deps);
        c.mark(r);
        return Object.assign(r, { p: c.p, v: c.v });
      });
      var tagRows = shortRes.map(function (r) { return { q: r.q, score: r.earned }; })
        .concat(examRes.map(function (r) { return { q: { tags: r.p.tags }, score: r.total ? r.earned / r.total : 0 }; }));
      var scores = Q().scoreByTag(tagRows);
      var score, line;
      if (plan.kind === 'quiz') {
        var got = shortRes.reduce(function (s, r) { return s + r.earned; }, 0);
        score = shortRes.length ? got / shortRes.length * 100 : 0;
        line = fmtPts(got) + ' de ' + shortRes.length + ' preguntas';
      } else {
        var sc = Q().simulacroScore(shortRes, examRes);
        score = sc.total;
        var bits = [];
        if (sc.weights.short) bits.push('Preguntas ' + fmtPts(sc.short) + ' / ' + sc.weights.short);
        if (sc.weights.exam) bits.push('Problemas ' + fmtPts(sc.exam) + ' / ' + sc.weights.exam);
        line = bits.join(' · ');
      }
      var entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: new Date().toISOString(),
        kind: plan.kind, code: plan.code, sessions: plan.sessions, score: Math.round(score), line: line,
        topics: KIND_NAME[plan.kind] + ' · ' + topics.join(', '), scores: scores,
        detail: shortRes.map(function (r) { return shortDetail(r.q, r.v, r.raw, r.earned, r.withSolution); })
          .concat(examRes.map(function (r) { return problemDetail(r.p, r.v, r); }))
      };
      Q().saveHistory(historyKeyOf(plan.kind), entry);
      var sub = L.head.querySelector('.muted');
      if (sub) sub.remove();
      showResults(L, entry, meta);
      actions.innerHTML = '';
      actions.appendChild(h('a', { class: 'btn btn--primary', href: '../' }, ['Volver al lanzador']));
      endBar.remove();
      progress.textContent = 'Entregado';
      window.scrollTo(0, 0);
    }
  }

  // Encabezado de resultados (arriba, como en Canvas) y semáforo en la barra lateral.
  function showResults(L, entry, meta) {
    L.results.hidden = false;
    L.results.innerHTML = '';
    L.results.appendChild(h('p', { class: 'exam__score' }, [h('strong', {}, [entry.score + (entry.kind === 'quiz' ? ' %' : ' / 100')]), entry.line ? h('span', { class: 'muted' }, [' · ' + entry.line]) : null]));
    L.results.appendChild(h('p', { class: 'muted' }, ['Cada pregunta quedó marcada con la respuesta correcta y el porqué. Este intento se guardó en tu historial.']));
    var sem = L.side.querySelector('.exam__sem') || L.side.appendChild(h('div', { class: 'exam__sem' }));
    sem.innerHTML = '';
    sem.appendChild(h('h2', { class: 'exam__side-title' }, ['Semáforo por tema']));
    sem.appendChild(semaforo(entry.scores || {}, { filter: function (t) { return t.split('.').length === 2; }, root: '../../' }));
  }

  // Revisión de un intento guardado: misma página, solo lectura.
  function reviewPage(root, id) {
    var all = Q().loadHistory('cb-exam-history').concat(Q().loadHistory('cb-quiz-history'));
    var entry = all.filter(function (e) { return e.id === id; })[0];
    if (!entry) {
      root.appendChild(h('div', { class: 'sheet exam-empty' }, [h('h1', {}, ['No encontré ese intento']), h('p', {}, ['Quizá se borró del historial de este navegador.']), h('p', {}, [h('a', { class: 'btn btn--primary', href: '../' }, ['Ir al lanzador'])])]));
      return;
    }
    var meta = metas()[entry.code] || { name: '', groups: [] };
    var d = new Date(entry.date);
    var L = examLayout(root, 'Revisión · ' + (KIND_NAME[entry.kind] || 'Intento'), isNaN(d) ? '' : d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    if (entry.sessions && meta.groups.length) sideTopics(L.side, meta, entry.sessions);
    L.side.appendChild(h('div', { class: 'exam__sem' }));
    L.side.appendChild(h('div', { class: 'lab-buttons exam__actions' }, [h('a', { class: 'btn btn--primary', href: '../' }, ['Volver al lanzador'])]));
    showResults(L, entry, meta);
    L.main.appendChild(renderDetail(entry.detail));
    render(L.main);
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
        var sum = h('summary', { class: 'history__row' }, [h('span', { class: 'mono' }, [isNaN(d) ? '' : d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })]), h('strong', {}, [e.score + (title === 'Simulacros' ? ' / 100' : ' %')]), h('span', { class: 'muted' }, [e.topics || '']), h('span', { class: 'history__open' }, ['Ver intento'])]);
        // Intentos con id: se reabren en la página del examen, en modo revisión.
        if (e.id) return h('li', {}, [h('a', { class: 'history__item history__link', href: 'examen/?intento=' + encodeURIComponent(e.id) }, Array.prototype.slice.call(sum.childNodes))]);
        var det = h('details', { class: 'history__item' }, [sum]);
        det.addEventListener('toggle', function () {
          if (det.open && !det.querySelector('.history__detail')) { var body = renderDetail(e.detail); det.appendChild(body); render(body); }
        });
        return h('li', {}, [det]);
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

  window.CBQuizUI = { semaforo: semaforo, questionCard: questionCard, runPractice: runPractice, sessionQuiz: sessionQuiz, runSimulacro: runSimulacro, launcher: launcher, examPage: examPage };
})();
