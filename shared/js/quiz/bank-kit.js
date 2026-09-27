/* =====================================================================
   Kit para escribir bancos de preguntas (§10.1) sin repetir constructores.
     var K = CBBankKit('c1', '03');
     K.D(id, subtema, dificultad, vars, texF(v), fSrc(v), derivada(v), why, opts)   derivada escrita
     K.N(id, subtema, dificultad, vars, enunciado(v), respuesta(v), why, opts)      numérica
     K.C(id, subtema, dificultad, enunciado, correcta, [[incorrecta, explicación]], why, opts)  opción múltiple
     K.IM(id, subtema, dificultad, vars, enunciado(v), implicita(v), respuesta(v), why)          dy/dx implícita
     K.register(subtemas, preguntas)
   Todas las preguntas son propias (source: 'propia').
   ===================================================================== */
(function () {
  function str(x, v) { return typeof x === 'function' ? x(v) : x; }

  window.CBBankKit = function (code, session) {
    var S = code + '.S' + session, prefix = code + '-s' + session + '-';
    function tags(sub) { return [S, S + '.' + sub]; }
    function base(id, sub, d, type, vars) {
      return { id: prefix + id, tags: tags(sub), difficulty: d, type: type, vars: vars || {}, source: 'propia' };
    }
    return {
      tags: tags,
      D: function (id, sub, d, vars, texF, fSrc, answer, why, o) {
        o = o || {};
        return Object.assign(base(id, sub, d, 'expr', vars), {
          prompt: function (v) { return '<p>' + (o.lead ? o.lead(v, texF(v)) : 'Deriva $f(x) = ' + texF(v) + '$.') + '</p>'; },
          derivativeOf: fSrc, answer: answer, domain: o.domain, where: o.where, mistakes: o.mistakes, feedback: o.feedback, why: why
        });
      },
      N: function (id, sub, d, vars, prompt, answer, why, o) {
        o = o || {};
        return Object.assign(base(id, sub, d, 'numeric', vars), {
          prompt: function (v) { return '<p>' + prompt(v) + '</p>'; }, answer: answer, why: why,
          tol: o.tol, unit: o.unit, where: o.where, mistakes: o.mistakes, feedback: o.feedback
        });
      },
      C: function (id, sub, d, prompt, correct, wrongs, why, o) {
        o = o || {};
        return Object.assign(base(id, sub, d, 'choice', o.vars), {
          concept: o.concept !== false,
          prompt: function (v) { return '<p>' + str(prompt, v) + '</p>'; },
          options: function (v) {
            return [{ text: str(correct, v), correct: true }].concat(wrongs.map(function (w) { return { text: str(w[0], v), say: w[1] }; }));
          },
          answer: function (v) { return str(correct, v); },
          where: o.where, why: why
        });
      },
      IM: function (id, sub, d, vars, prompt, implicit, answer, why, o) {
        o = o || {};
        return Object.assign(base(id, sub, d, 'expr', vars), {
          prompt: function (v) { return '<p>' + prompt(v) + '</p>'; },
          implicit: implicit, answer: answer, where: o.where, why: why
        });
      },
      register: function (subtopics, questions) {
        var bank = (window.CB_BANK = window.CB_BANK || {});
        bank[code] = bank[code] || {};
        bank[code]['S' + session] = { subtopics: subtopics, questions: questions };
      }
    };
  };
})();
