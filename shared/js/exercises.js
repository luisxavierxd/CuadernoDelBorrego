/* =====================================================================
   Ejercicios autocalificables (§9).
   Esquema de un ejercicio (en data/<curso>/sesion-NN.js):
     id, title?
     vars:     { a: [min, max, step], … }        where?(v) → bool (restricción)
     derive?(v) → { … }                          valores extra calculados
     prompt(v) → HTML con $…$                    diagram?: { id, state(v) }
     check:    'numeric' | 'expr' | 'choice'
     answer(v) → número | expresión (string)
     unit?, tol?: { rel } | { abs }              (numeric; por omisión rel 1 %)
     integrand?(v) → string, domain?: [a, b]     (expr: la respuesta es una antiderivada, se acepta + C)
     options?(v) → [{ text, correct?, say? }]    (choice)
     mistakes?: { clave: v → valor típico erróneo }
     feedback?: [{ when: 'clave', say: string | v → string }]   mensaje "casi"
     hint, solution(v) → HTML con $…$
   La parte pura (instance, grade) no toca el DOM: la prueba scripts/examples.test.js.
   ===================================================================== */
(function () {
  /* ------------------------- Parte pura ------------------------- */
  function decimals(step) { var s = String(step); return s.indexOf('.') < 0 ? 0 : s.length - s.indexOf('.') - 1; }

  function instance(ex, rnd) {
    rnd = rnd || Math.random;
    for (var tries = 0; tries < 200; tries++) {
      var v = {};
      Object.keys(ex.vars || {}).forEach(function (k) {
        var r = ex.vars[k], min = r[0], max = r[1], step = r[2] || 1;
        var n = Math.round((max - min) / step);
        v[k] = +(min + step * Math.floor(rnd() * (n + 1))).toFixed(decimals(step));
      });
      if (!ex.where || ex.where(v)) {
        if (ex.derive) { var d = ex.derive(v); for (var key in d) v[key] = d[key]; }
        return v;
      }
    }
    throw new Error('No encontré valores que cumplan la restricción de ' + ex.id);
  }

  // Notación científica como la escriba el alumno: 8.3e-5, 8.3×10^-5, 8.3x10^(-5), 8.3*10^-5,
  // 8.3·10⁻⁵ o 8.3 × 10 ^ −5. Todo se convierte a 8.3e-5 antes de leer el número.
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  function sciToE(t) {
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (m) { return '^' + m.split('').map(function (c) { return SUP[c]; }).join(''); });
    var m = t.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:[x×X*·]|\\times|\\cdot)10\^?\(?([+-]?\d+)\)?$/);
    if (m) return m[1] + 'e' + m[2];
    m = t.match(/^([+-]?)10\^\(?([+-]?\d+)\)?$/);          // 10^-5 → 1e-5
    return m ? m[1] + '1e' + m[2] : t;
  }
  function parseNumber(s, math) {
    var t = String(s == null ? '' : s).trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/−/g, '-');
    if (t === '') return NaN;
    t = sciToE(t);
    var n = Number(t);
    if (isFinite(n)) return n;
    if (math) { try { var e = math.evaluate(t); if (typeof e === 'number') return e; } catch (err) {} }
    return NaN;
  }

  // Se pide redondear a 2 decimales: además de la tolerancia, vale una respuesta a una centésima
  // o menos (0.567 escrito como 0.57 o 0.56). Solo si el resultado es de 0.1 o más: los muy chicos
  // (8.3e-5 m³/s) se escriben con más cifras y siguen con ±1 %. Desde 1 el ±1 % ya es mayor.
  var ROUND2 = 0.01 + 1e-9;
  function withinTol(val, ans, tol) {
    tol = tol || { rel: 0.01 };
    var d = Math.abs(val - ans);
    if (Math.abs(ans) >= 0.1 && d <= ROUND2) return true;
    if (tol.abs != null) return d <= tol.abs;
    return d <= tol.rel * Math.max(Math.abs(ans), 1e-9);
  }

  function sayFor(ex, key, v) {
    var fb = (ex.feedback || []).filter(function (f) { return f.when === key; })[0];
    if (!fb) return null;
    return typeof fb.say === 'function' ? fb.say(v) : fb.say;
  }

  // ¿Dos expresiones en x son iguales en `n` puntos del dominio? (upToC: se permite una constante)
  function sameExpr(math, e1, e2, dom, upToC) {
    var prep = window.LabMath && window.LabMath.antiderivative ? window.LabMath.antiderivative.prep : function (s) { return s; };
    var c1 = math.parse(prep(e1)).compile(), c2 = math.parse(prep(e2)).compile();
    var a = dom[0], b = dom[1], diffs = [], n = 30;
    for (var i = 0; i < n; i++) {
      var x = a + (b - a) * (i + 0.5) / n, y1, y2;
      try { y1 = c1.evaluate({ x: x }); y2 = c2.evaluate({ x: x }); } catch (e) { continue; }
      if (typeof y1 !== 'number' || typeof y2 !== 'number' || !isFinite(y1) || !isFinite(y2)) continue;
      diffs.push({ d: y1 - y2, s: 1 + Math.abs(y2) });
    }
    if (diffs.length < 10) return false;
    var shift = upToC ? diffs[0].d : 0;
    return diffs.every(function (p) { return Math.abs(p.d - shift) / p.s < 1e-6; });
  }

  // → { kind: 'ok'|'warn'|'bad'|'invalid', key?, say? }
  function grade(ex, v, input, deps) {
    deps = deps || {};
    var math = deps.math, LM = deps.LabMath || window.LabMath;
    if (ex.check === 'choice') {
      var opt = ex.options(v).filter(function (o) { return o.text === input; })[0];
      if (!opt) return { kind: 'invalid', say: 'Elige una opción.' };
      return opt.correct ? { kind: 'ok' } : { kind: 'bad', say: opt.say || null };
    }
    if (ex.check === 'numeric') {
      var val = parseNumber(input, math);
      if (!isFinite(val)) return { kind: 'invalid', say: 'Escribe un número (usa punto decimal).' };
      if (withinTol(val, ex.answer(v), ex.tol)) return { kind: 'ok' };
      for (var k in (ex.mistakes || {})) {
        if (withinTol(val, ex.mistakes[k](v), ex.tol)) return { kind: 'warn', key: k, say: sayFor(ex, k, v) };
      }
      return { kind: 'bad' };
    }
    if (ex.check === 'expr') {
      if (!math) return { kind: 'invalid', say: 'Cargando el verificador…' };
      if (!String(input || '').trim()) return { kind: 'invalid', say: 'Escribe una expresión.' };
      var dom = ex.domain || [0.2, 2.2];
      try {
        // La respuesta es la derivada de derivativeOf(v): se compara con math.derivative.
        if (ex.derivativeOf) {
          var rd = LM.derivative.verify(math, ex.derivativeOf(v), input, dom[0], dom[1]);
          if (rd.reason === 'correct') return { kind: 'ok' };
          for (var dm in (ex.mistakes || {})) {
            if (sameExpr(math, input, ex.mistakes[dm](v), dom, false)) return { kind: 'warn', key: dm, say: sayFor(ex, dm, v) };
          }
          if (rd.reason === 'sign') return { kind: 'warn', key: 'sign', say: sayFor(ex, 'sign', v) || 'Casi: tu signo está invertido.' };
          if (rd.reason === 'factor') return { kind: 'warn', key: 'factor', say: sayFor(ex, 'factor', v) || 'Casi: tu derivada sale ' + (+rd.k.toPrecision(4)) + ' veces la real. ¿Te faltó la derivada de adentro?' };
          if (rd.reason === 'domain') return { kind: 'invalid', say: 'No pude evaluar tu expresión; revisa paréntesis y dominio.' };
          return { kind: 'bad' };
        }
        // dy/dx implícita en x y y: se compara con −F_x/F_y sobre la curva cerca del punto.
        if (ex.implicit) {
          var im = ex.implicit(v);
          var ri = LM.implicit.verify(math, im.eq, input, im.x0, im.y0);
          if (ri.reason === 'correct') return { kind: 'ok' };
          if (ri.reason === 'sign') return { kind: 'warn', key: 'sign', say: sayFor(ex, 'sign', v) || 'Casi: tu signo está invertido; revisa el despeje de y′.' };
          if (ri.reason === 'factor') return { kind: 'warn', key: 'factor', say: sayFor(ex, 'factor', v) || 'Casi: te sobra un factor constante.' };
          if (ri.reason === 'domain') return { kind: 'invalid', say: 'No pude evaluar tu expresión cerca del punto.' };
          return { kind: 'bad' };
        }
        if (ex.integrand) {
          var r = LM.antiderivative.verify(math, ex.integrand(v), input, dom[0], dom[1]);
          if (r.reason === 'correct') return { kind: 'ok' };
          for (var m in (ex.mistakes || {})) {
            if (sameExpr(math, input, ex.mistakes[m](v), dom, true)) return { kind: 'warn', key: m, say: sayFor(ex, m, v) };
          }
          if (r.reason === 'sign') return { kind: 'warn', key: 'sign', say: sayFor(ex, 'sign', v) || 'Casi: tu signo está invertido. Deriva tu respuesta y compárala.' };
          if (r.reason === 'factor') return { kind: 'warn', key: 'factor', say: sayFor(ex, 'factor', v) || 'Casi: tu derivada sale ' + (+r.k.toPrecision(4)) + ' veces el integrando. Revisa la regla de la cadena.' };
          if (r.reason === 'domain') return { kind: 'invalid', say: 'No pude evaluar tu expresión en el intervalo; revisa paréntesis y dominio.' };
          return { kind: 'bad' };
        }
        if (sameExpr(math, input, ex.answer(v), dom, false)) return { kind: 'ok' };
        for (var q in (ex.mistakes || {})) {
          if (sameExpr(math, input, ex.mistakes[q](v), dom, false)) return { kind: 'warn', key: q, say: sayFor(ex, q, v) };
        }
        return { kind: 'bad' };
      } catch (e) {
        return { kind: 'invalid', say: 'No pude leer la expresión: ' + e.message };
      }
    }
    throw new Error('check desconocido: ' + ex.check);
  }

  /* Aviso bajo cada respuesta numérica: formato, redondeo y constantes, para que nadie pierda
     puntos por tecnicismos. g en todas las de Física; π solo si la pregunta lo usa (en el
     enunciado o en la cuenta de la respuesta). ctx: { fis, parts: [funciones o textos] }. */
  function usesPi(parts) {
    return (parts || []).some(function (p) { return p && /\\pi\b|π|Math\.PI|\bPI\b/.test(String(p)); });
  }
  function numberHint(ctx) {
    ctx = ctx || {};
    var consts = [];
    if (ctx.fis) consts.push('g = 9.81 m/s²');
    if (usesPi(ctx.parts)) consts.push('π = 3.14');
    return 'Usa punto decimal y redondea a 2 decimales. Si es muy chico o muy grande, usa notación científica: <code>8.3e-5</code> o <code>8.3×10^-5</code>.' +
      (consts.length ? ' Toma ' + consts.join(' y ') + '.' : '');
  }

  var api = { instance: instance, grade: grade, parseNumber: parseNumber, sameExpr: sameExpr, withinTol: withinTol, numberHint: numberHint };
  window.CBExercises = api;

  /* ------------------------------ UI ------------------------------ */
  var TITLES = { ok: '¡Bien!', warn: 'Vas cerca', bad: 'Todavía no' };

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function mountOne(ex, n) {
    var UI = window.LabUI, h = UI.h;
    var v, attempts = 0, math = null;
    var inputId = UI.id('ej');
    var prompt = h('div', { class: 'exercise__prompt' });
    var diagram = h('div', { class: 'exercise__diagram', hidden: !ex.diagram });
    var answer = h('div', { class: 'exercise__answer' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var hint = h('div', { class: 'exercise__hint', hidden: true });
    var sol = h('div', { class: 'exercise__solution', hidden: true });
    var btnCheck = UI.button('Revisar', 'primary', check);
    var btnHint = UI.button('Pista', 'ghost', function () {
      hint.hidden = !hint.hidden;
      btnHint.setAttribute('aria-expanded', String(!hint.hidden));
    });
    var btnSol = UI.button('Ver solución', 'ghost', function () {
      sol.hidden = !sol.hidden;
      btnSol.setAttribute('aria-expanded', String(!sol.hidden));
    });
    btnHint.setAttribute('aria-expanded', 'false');
    btnSol.setAttribute('aria-expanded', 'false');
    btnSol.disabled = true;
    btnSol.title = 'Disponible después de tu primer intento';
    var btnNew = UI.button('Otro ejercicio', 'ghost', function () { fresh(); });
    var get = function () { return ''; };

    var card = h('article', { class: 'exercise', id: 'ej-' + (ex.id || n) }, [
      h('header', { class: 'exercise__head' }, [
        h('h3', { class: 'exercise__title' }, ['Ejercicio ' + n + (ex.title ? ' · ' + ex.title : '')]),
        btnNew
      ]),
      prompt, diagram, answer,
      h('div', { class: 'lab-buttons' }, [btnCheck, btnHint, btnSol]),
      verdict, hint, sol
    ]);

    function buildAnswer() {
      answer.innerHTML = '';
      if (ex.check === 'choice') {
        var name = UI.id('opt');
        var fs = h('fieldset', { class: 'exercise__options' }, [h('legend', { class: 'visually-hidden' }, ['Opciones'])]);
        shuffle(ex.options(v)).forEach(function (o) {
          var oid = UI.id('o');
          fs.appendChild(h('div', { class: 'exercise__option' }, [
            h('input', { type: 'radio', name: name, id: oid, value: o.text }),
            h('label', { for: oid, html: o.text })
          ]));
        });
        answer.appendChild(fs);
        get = function () { var c = fs.querySelector('input:checked'); return c ? c.value : ''; };
        return;
      }
      // Respuestas simbólicas: editor matemático estilo WebAssign (MathLive).
      if (ex.check === 'expr' && window.CBMathInput) {
        var mi = window.CBMathInput.create({
          label: ex.integrand ? 'Tu antiderivada F(x)' : 'Tu respuesta',
          hint: ex.integrand ? 'Escribe como en papel: la barra “/” hace una fracción y “^” un exponente. La constante C es opcional.' : 'Escribe como en papel; usa la paleta para fracciones, raíces y funciones.',
          onEnter: check
        });
        answer.appendChild(mi.node);
        get = mi.get;
        return;
      }
      var inp = h('input', {
        id: inputId, type: 'text', class: 'lab-input lab-input--num',
        inputmode: 'decimal', spellcheck: 'false', autocomplete: 'off',
        'aria-describedby': inputId + '-help'
      });
      answer.appendChild(h('div', { class: 'lab-field' }, [
        h('label', { for: inputId, class: 'lab-field__label' }, ['Tu resultado']),
        h('div', { class: 'exercise__inputrow' }, [inp, ex.unit ? h('span', { class: 'exercise__unit' }, [ex.unit]) : null]),
        h('p', { id: inputId + '-help', class: 'lab-field__hint', html: numberHint({ fis: /^f\d/.test(ex.id || ''), parts: [ex.prompt, ex.answer, ex.solution] }) })
      ]));
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      get = function () { return inp.value; };
    }

    function fresh() {
      v = instance(ex);
      attempts = 0;
      prompt.innerHTML = ex.prompt(v);
      if (ex.diagram && window.Diagrams && window.Diagrams[ex.diagram.id]) {
        diagram.innerHTML = window.Diagrams[ex.diagram.id](ex.diagram.state ? ex.diagram.state(v) : {});
      }
      hint.innerHTML = '<strong>Pista.</strong> ' + (typeof ex.hint === 'function' ? ex.hint(v) : ex.hint || '');
      sol.innerHTML = '<strong>Solución.</strong> ' + ex.solution(v);
      hint.hidden = true; sol.hidden = true; verdict.hidden = true;
      btnSol.disabled = true;
      btnHint.setAttribute('aria-expanded', 'false');
      btnSol.setAttribute('aria-expanded', 'false');
      buildAnswer();
      if (window.CBMath) window.CBMath.render(card);
    }

    function check() {
      var input;
      try { input = get(); } catch (e) { UI.verdict(verdict, 'bad', e.message, 'Completa los espacios del editor y vuelve a revisar.'); return; }
      var r = grade(ex, v, input, { math: math });
      if (r.kind === 'invalid') { UI.verdict(verdict, 'bad', r.say || 'Revisa tu respuesta.', null); return; }
      attempts++;
      btnSol.disabled = false;
      btnSol.removeAttribute('title');
      var note = r.say || (r.kind === 'ok' ? 'Puedes pedir otro ejercicio para practicar con otros números.' : 'Intenta de nuevo, pide una pista o mira la solución.');
      UI.verdict(verdict, r.kind, TITLES[r.kind], note);
      if (window.CBMath) window.CBMath.render(verdict);
    }

    fresh();
    if (ex.check === 'expr' || ex.check === 'numeric') {
      UI.loadMath().then(function (m) { math = m; }).catch(function () {});
    }
    return card;
  }

  api.mount = function (container, list) {
    list.forEach(function (ex, i) { container.appendChild(mountOne(ex, i + 1)); });
  };
})();
