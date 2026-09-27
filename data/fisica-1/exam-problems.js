/* =====================================================================
   Problemas de examen · Física 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error. g = 9.81 m/s².
   Por ahora: bloque B (piloto S06). Se agregan 6–8 por bloque en F4.
   ===================================================================== */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function yAt(v, x) { var c = v.v0 * Math.cos(v.th * RAD); return x * Math.tan(v.th * RAD) - g * x * x / (2 * c * c); }

  ex.f1 = (ex.f1 || []).concat([
    {
      id: 'f1-ex-barda', tags: ['f1.S06'], block: 'B', title: '¿Pasa la barda?',
      vars: { v0: [15, 25, 1], th: [30, 55, 5], D: [8, 18, 1], h: [1, 3, 0.5] },
      where: function (v) {
        var R = v.v0 * v.v0 * Math.sin(2 * v.th * RAD) / g;
        return v.D < 0.9 * R && Math.abs(yAt(v, v.D) - v.h) > 0.3;
      },
      statement: function (v) {
        return '<p>Un balón sale del piso con $v_0 = ' + v.v0 + '$ m/s a $' + v.th + '^\\circ$. A $' + v.D + '$ m hay una barda de $' + v.h + '$ m de alto. Sin resistencia del aire.</p>';
      },
      diagram: { id: 'exam-barda', state: function (v) { return v; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return '¿Cuánto vale la componente horizontal de la velocidad inicial?'; },
          answer: function (v) { return v.v0 * Math.cos(v.th * RAD); },
          solution: function (v) { return '$v_{0x} = ' + v.v0 + '\\cos ' + v.th + '^\\circ = ' + fx(v.v0 * Math.cos(v.th * RAD)) + '$ m/s.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 's',
          prompt: function (v) { return 'Con tu $v_{0x}$ del inciso a), ¿cuánto tarda en llegar a la barda?'; },
          answer: function (v, prev) { return v.D / prev[0]; },
          solution: function (v) { var t = v.D / (v.v0 * Math.cos(v.th * RAD)); return '$t = D/v_{0x} = ' + v.D + '/' + fx(v.v0 * Math.cos(v.th * RAD)) + ' = ' + fx(t, 3) + '$ s.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu tiempo del inciso b), ¿a qué altura está el balón al llegar a la barda?'; },
          answer: function (v, prev) { var t = prev[1]; return v.v0 * Math.sin(v.th * RAD) * t - g * t * t / 2; },
          solution: function (v) {
            var t = v.D / (v.v0 * Math.cos(v.th * RAD));
            return '$y = v_0\\sin\\theta\\,t - \\tfrac{1}{2}gt^2 = (' + fx(v.v0 * Math.sin(v.th * RAD)) + ')(' + fx(t, 3) + ') - \\tfrac{1}{2}(9.81)(' + fx(t, 3) + ')^2 = ' + fx(yAt(v, v.D)) + '$ m.';
          }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm', tol: { abs: 0.05 },
          prompt: function () { return 'Con tu altura del inciso c), ¿por cuántos metros pasa arriba de la barda? (Negativo si choca.)'; },
          answer: function (v, prev) { return prev[2] - v.h; },
          solution: function (v) {
            var m = yAt(v, v.D) - v.h;
            return '$' + fx(yAt(v, v.D)) + ' - ' + v.h + ' = ' + fx(m) + '$ m: ' + (m > 0 ? 'sí la pasa.' : 'choca con la barda.');
          }
        }
      ]
    },
    {
      id: 'f1-ex-mesa', tags: ['f1.S06'], block: 'B', title: 'La canica que sale de la mesa',
      vars: { h: [0.8, 1.6, 0.1], v0: [1.5, 4, 0.5] },
      statement: function (v) {
        return '<p>Una canica rueda sobre una mesa de $' + v.h + '$ m de alto y sale del borde horizontalmente a $' + v.v0 + '$ m/s.</p>';
      },
      diagram: { id: 'exam-mesa', state: function (v) { return v; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 's',
          prompt: function () { return '¿Cuánto tarda en llegar al piso?'; },
          answer: function (v) { return Math.sqrt(2 * v.h / g); },
          solution: function (v) { return 'Sale con $v_{0y} = 0$: $t = \\sqrt{2h/g} = \\sqrt{2(' + v.h + ')/9.81} = ' + fx(Math.sqrt(2 * v.h / g), 3) + '$ s.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu tiempo del inciso a), ¿a qué distancia horizontal del borde cae?'; },
          answer: function (v, prev) { return v.v0 * prev[0]; },
          solution: function (v) { return '$x = v_0 t = (' + v.v0 + ')(' + fx(Math.sqrt(2 * v.h / g), 3) + ') = ' + fx(v.v0 * Math.sqrt(2 * v.h / g), 3) + '$ m.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu tiempo del inciso a), ¿qué rapidez vertical tiene al tocar el piso?'; },
          answer: function (v, prev) { return g * prev[0]; },
          solution: function (v) { return '$v_y = g\\,t = (9.81)(' + fx(Math.sqrt(2 * v.h / g), 3) + ') = ' + fx(g * Math.sqrt(2 * v.h / g)) + '$ m/s.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu $v_y$ del inciso c), ¿con qué rapidez total toca el piso?'; },
          answer: function (v, prev) { return Math.sqrt(v.v0 * v.v0 + prev[2] * prev[2]); },
          solution: function (v) { var vy = g * Math.sqrt(2 * v.h / g); return '$v = \\sqrt{v_0^2 + v_y^2} = \\sqrt{' + v.v0 + '^2 + ' + fx(vy) + '^2} = ' + fx(Math.hypot(v.v0, vy)) + '$ m/s.'; }
        },
        {
          label: 'e', type: 'numeric', points: 2, unit: '°', tol: { abs: 0.5 },
          prompt: function () { return 'Con tu $v_y$ del inciso c), ¿con qué ángulo bajo la horizontal toca el piso?'; },
          answer: function (v, prev) { return Math.atan(prev[2] / v.v0) * DEG; },
          solution: function (v) { var vy = g * Math.sqrt(2 * v.h / g); return '$\\alpha = \\arctan(v_y/v_0) = \\arctan(' + fx(vy) + '/' + v.v0 + ') = ' + fx(Math.atan(vy / v.v0) * DEG, 1) + '^\\circ$.'; }
        }
      ]
    }
  ]);
})();
