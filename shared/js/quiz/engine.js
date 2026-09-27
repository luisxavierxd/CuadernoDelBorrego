/* =====================================================================
   Motor de quizzes y simulacros (§10). Puro: no toca el DOM (lo prueba
   scripts/quiz-engine.test.js). Reutiliza CBExercises para instanciar
   variables y calificar, así preguntas y ejercicios comparten esquema.

   Banco:   window.CB_BANK[code]['S10'] = { subtopics: { tag: nombre }, questions: [...] }
   Examen:  window.CB_EXAMS[code] = [ problema, … ]   (§10.3)
   ===================================================================== */
(function () {
  var MIX = { 1: 0.3, 2: 0.5, 3: 0.2 };           // mezcla de dificultad (§10.1)
  var WEIGHTS = { short: 40, exam: 60 };           // simulacro (§10.4)
  var SOLUTION_KEEPS = 0.3;                         // ver la solución quita el 70 %
  var HISTORY_MAX = 10;
  var STATE_LABEL = { ok: 'Listo', warn: 'Casi', bad: 'Reforzar' };

  function state(pct) { return pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'bad'; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function subtopic(q) { return q.tags[1] || q.tags[0]; }
  function shuffle(list, rnd) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Preguntas de las sesiones elegidas: sels = [{ code: 'c1', sessions: [10, 11] }, …]
  function pool(bank, sels) {
    var out = [];
    (sels || []).forEach(function (s) {
      var byCode = (bank || {})[s.code] || {};
      (s.sessions || []).forEach(function (n) {
        var sess = byCode['S' + pad(n)];
        if (sess) out = out.concat(sess.questions);
      });
    });
    return out;
  }

  // Cuántas de cada dificultad para n preguntas (resto mayor), solo entre las permitidas.
  function targets(n, allowed) {
    var total = allowed.reduce(function (s, d) { return s + MIX[d]; }, 0);
    var raw = allowed.map(function (d) { return { d: d, x: n * MIX[d] / total }; });
    var t = {}, used = 0;
    raw.forEach(function (r) { t[r.d] = Math.floor(r.x); used += t[r.d]; });
    raw.sort(function (a, b) { return (b.x - Math.floor(b.x)) - (a.x - Math.floor(a.x)); });
    for (var i = 0; used < n && raw.length; i = (i + 1) % raw.length) { t[raw[i].d]++; used++; }
    return t;
  }

  // Elige n preguntas sin repetir, con la mezcla de dificultad y repartiendo subtemas.
  function pick(list, n, rnd, opts) {
    rnd = rnd || Math.random;
    opts = opts || {};
    var allowed = opts.difficulties || [1, 2, 3];
    var cand = shuffle(list.filter(function (q) { return allowed.indexOf(q.difficulty) >= 0; }), rnd);
    if (n >= cand.length) return cand;
    var tg = targets(n, allowed);
    var taken = {}, perSub = {}, out = [];
    function take(filter) {
      // Subtema menos usado hasta ahora (empates al azar gracias al barajado previo).
      var best = null;
      cand.forEach(function (q) {
        if (taken[q.id] || !filter(q)) return;
        var c = perSub[subtopic(q)] || 0;
        if (!best || c < (perSub[subtopic(best)] || 0)) best = q;
      });
      if (!best) return false;
      taken[best.id] = true;
      perSub[subtopic(best)] = (perSub[subtopic(best)] || 0) + 1;
      out.push(best);
      return true;
    }
    allowed.forEach(function (d) {
      for (var k = 0; k < tg[d]; k++) if (!take(function (q) { return q.difficulty === d; })) break;
    });
    while (out.length < n && take(function () { return true; })) { /* rellena si faltó alguna dificultad */ }
    return shuffle(out, rnd);
  }

  function asExercise(q) { return Object.assign({}, q, { check: q.type }); }
  function grade(q, v, input, deps) { return window.CBExercises.grade(asExercise(q), v, input, deps); }

  function gradeShort(q, v, input, seen, deps) {
    var r = grade(q, v, input, deps);
    var ok = r.kind === 'ok';
    return { kind: r.kind, say: r.say, correct: ok, withSolution: !!seen, earned: (ok ? 1 : 0) * (seen ? SOLUTION_KEEPS : 1), total: 1 };
  }

  // results: [{ q, score (0–1) }] → { tag: { earned, total, pct, state } }
  function scoreByTag(results) {
    var map = {};
    results.forEach(function (r) {
      r.q.tags.forEach(function (t) {
        var m = map[t] = map[t] || { earned: 0, total: 0 };
        m.earned += r.score; m.total += 1;
      });
    });
    Object.keys(map).forEach(function (t) {
      var m = map[t];
      m.pct = m.total ? m.earned / m.total * 100 : 0;
      m.state = state(m.pct);
    });
    return map;
  }

  /* ---------- Problemas encadenados (§10.3) ----------
     part.answer(v, prev) recibe las respuestas DEL ALUMNO en los incisos anteriores:
     si a) está mal pero b) es correcto con ese valor, b) cuenta completo (arrastre). */
  function gradeProblem(p, v, answers, seen, deps) {
    var E = window.CBExercises, math = deps && deps.math;
    var prevStudent = [], prevTrue = [], parts = [], earned = 0, total = 0;
    p.parts.forEach(function (part, i) {
      var expectedTrue = part.answer(v, prevTrue.slice());
      var expected = part.answer(v, prevStudent.slice());
      var raw = answers[i], ok, value;
      if (part.type === 'choice') {
        value = raw;
        ok = raw != null && raw === expected;
      } else {
        value = E.parseNumber(raw, math);
        ok = isFinite(value) && isFinite(expected) && E.withinTol(value, expected, part.tol);
      }
      var carried = ok && (part.type === 'choice' ? expected !== expectedTrue : !E.withinTol(expected, expectedTrue, part.tol));
      var got = (ok ? part.points : 0) * (seen[i] ? SOLUTION_KEEPS : 1);
      parts.push({ label: part.label, points: part.points, earned: got, correct: ok, carried: carried, withSolution: !!seen[i], expected: expected, expectedTrue: expectedTrue, answer: raw });
      earned += got; total += part.points;
      // Para el siguiente inciso: la respuesta del alumno si es válida; si la dejó vacía, la real.
      prevTrue.push(expectedTrue);
      prevStudent.push(part.type === 'choice' ? (raw != null ? raw : expectedTrue) : (isFinite(value) ? value : expectedTrue));
    });
    return { parts: parts, earned: earned, total: total };
  }

  function frac(list) {
    var e = 0, t = 0;
    list.forEach(function (r) { e += r.earned; t += r.total; });
    return t ? e / t : 0;
  }
  // 40/60 si hay de las dos partes; si un examen personalizado solo trae una, esa vale 100.
  function simulacroScore(shortResults, examResults) {
    var ws = WEIGHTS.short, wx = WEIGHTS.exam;
    if (!examResults.length) { ws = 100; wx = 0; }
    else if (!shortResults.length) { ws = 0; wx = 100; }
    var s = ws * frac(shortResults), x = wx * frac(examResults);
    return { short: s, exam: x, total: s + x, weights: { short: ws, exam: wx } };
  }

  function suggestedMinutes(presetId) { return presetId === 'final' ? 120 : 90; }

  // Problemas elegibles: todas sus etiquetas de sesión están entre las elegidas.
  function eligibleProblems(problems, sessionTags) {
    return (problems || []).filter(function (p) {
      return p.tags.every(function (t) { return sessionTags.indexOf(t) >= 0; });
    });
  }
  function composeSimulacro(questions, problems, rnd) {
    rnd = rnd || Math.random;
    return {
      questions: pick(questions, 4, rnd, { difficulties: [2, 3] }),
      problems: shuffle(problems, rnd).slice(0, 3)
    };
  }

  /* ---------- Historial (solo este navegador) ---------- */
  function loadHistory(key) {
    try {
      var v = JSON.parse(window.localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function saveHistory(key, entry) {
    try {
      var list = loadHistory(key);
      list.unshift(entry);
      window.localStorage.setItem(key, JSON.stringify(list.slice(0, HISTORY_MAX)));
    } catch (e) { /* sin historial: el sitio funciona igual */ }
  }

  window.CBQuiz = {
    STATE_LABEL: STATE_LABEL, WEIGHTS: WEIGHTS, SOLUTION_KEEPS: SOLUTION_KEEPS,
    state: state, pool: pool, pick: pick, grade: grade, gradeShort: gradeShort,
    scoreByTag: scoreByTag, gradeProblem: gradeProblem, simulacroScore: simulacroScore,
    suggestedMinutes: suggestedMinutes, eligibleProblems: eligibleProblems, composeSimulacro: composeSimulacro,
    loadHistory: loadHistory, saveHistory: saveHistory, subtopic: subtopic
  };
})();
