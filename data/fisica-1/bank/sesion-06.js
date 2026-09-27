/* =====================================================================
   Banco de preguntas · Física 1 · S06 · Tiro parabólico
   100 plantillas parametrizadas, todas propias (source: 'propia').
   Sin resistencia del aire, g = 9.81 m/s², SI. concept: true = conceptual (§10.1).
   ===================================================================== */
(function () {
  var S = 'f1.S06', g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var bank = (window.CB_BANK = window.CB_BANK || {});
  bank.f1 = bank.f1 || {};

  function tags(sub) { return [S, S + '.' + sub]; }
  function str(x, v) { return typeof x === 'function' ? x(v) : x; }
  function vx(v) { return v.v0 * Math.cos(v.th * RAD); }
  function vy(v) { return v.v0 * Math.sin(v.th * RAD); }
  function T(v) { return 2 * vy(v) / g; }
  function R(v) { return v.v0 * v.v0 * Math.sin(2 * v.th * RAD) / g; }
  function H(v) { return vy(v) * vy(v) / (2 * g); }
  function yAt(v, x) { var c = vx(v); return x * Math.tan(v.th * RAD) - g * x * x / (2 * c * c); }
  var tiro = function (v) { return 'Un proyectil sale del piso con $v_0 = ' + v.v0 + '\\ \\text{m/s}$ a $' + v.th + '^\\circ$ sobre la horizontal.'; };

  // La respuesta y cada error típico difieren al menos 3 % entre sí (mensajes "casi" sin ambigüedad).
  function distinct(q) {
    return function (v) {
      if (q.baseWhere && !q.baseWhere(v)) return false;
      var vals = [q.answer(v)].concat(Object.keys(q.mistakes).map(function (k) { return q.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = {
      id: 'f1-s06-' + id, tags: tags(sub), difficulty: d, type: 'numeric', vars: vars, source: 'propia',
      prompt: function (v) { return '<p>' + prompt(v) + '</p>'; }, answer: answer, why: why,
      unit: o.unit, tol: o.tol, mistakes: o.mistakes, feedback: o.feedback, where: o.where
    };
    if (o.mistakes) { q.baseWhere = o.where; q.where = distinct(q); }
    return q;
  }
  function C(id, sub, d, prompt, correct, wrongs, why, o) {
    o = o || {};
    return {
      id: 'f1-s06-' + id, tags: tags(sub), difficulty: d, type: 'choice', concept: true, vars: o.vars || {}, source: 'propia',
      prompt: function (v) { return '<p>' + str(prompt, v) + '</p>'; },
      options: function (v) { return [{ text: str(correct, v), correct: true }].concat(wrongs.map(function (w) { return { text: str(w[0], v) }; })); },
      answer: function (v) { return str(correct, v); },
      why: why
    };
  }

  var V0 = [10, 30, 1], TH = [15, 75, 5];
  var inFlight = function (v) { return v.t < 0.95 * T(v); };
  var beforeR = function (v) { return v.x < 0.95 * R(v); };

  var Q = [
    /* ---------------- Componentes ---------------- */
    N('co-vx', 'componentes', 1, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Cuánto vale $v_{0x}$?'; },
      vx, '$v_{0x} = v_0\\cos\\theta$: el coseno va con el lado adyacente, que es el horizontal.',
      { unit: 'm/s', mistakes: { usedSin: vy }, feedback: [{ when: 'usedSin', say: 'Usaste el seno; la componente horizontal lleva coseno.' }] }),
    N('co-vy', 'componentes', 1, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Cuánto vale $v_{0y}$?'; },
      vy, '$v_{0y} = v_0\\sin\\theta$.',
      { unit: 'm/s', mistakes: { usedCos: vx }, feedback: [{ when: 'usedCos', say: 'Usaste el coseno; la componente vertical lleva seno.' }] }),
    N('co-rapidez', 'componentes', 2, { vx: [3, 15, 1], vy: [3, 15, 1] },
      function (v) { return 'Las componentes de la velocidad inicial son $v_{0x} = ' + v.vx + '$ y $v_{0y} = ' + v.vy + '$ m/s. ¿Cuál es la rapidez inicial?'; },
      function (v) { return Math.hypot(v.vx, v.vy); }, 'Pitágoras: $v_0 = \\sqrt{v_{0x}^2 + v_{0y}^2}$.', { unit: 'm/s' }),
    N('co-angulo', 'componentes', 2, { vx: [3, 15, 1], vy: [3, 15, 1] },
      function (v) { return 'Si $v_{0x} = ' + v.vx + '$ y $v_{0y} = ' + v.vy + '$ m/s, ¿con qué ángulo sobre la horizontal se lanzó?'; },
      function (v) { return Math.atan(v.vy / v.vx) * DEG; }, '$\\theta = \\arctan(v_{0y}/v_{0x})$.', { unit: '°' }),
    N('co-vx-t', 'componentes', 1, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿Cuánto vale $v_x$ a los $' + v.t + '$ s?'; },
      vx, 'No hay aceleración horizontal: $v_x = v_0\\cos\\theta$ en todo el vuelo.', { unit: 'm/s', where: inFlight }),
    N('co-vy-t', 'componentes', 2, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿Cuánto vale $v_y$ a los $' + v.t + '$ s? (Positiva hacia arriba.)'; },
      function (v) { return vy(v) - g * v.t; }, '$v_y = v_0\\sin\\theta - g\\,t$; se vuelve negativa después de la cima.',
      { unit: 'm/s', tol: { abs: 0.1 }, where: function (v) { return inFlight(v) && Math.abs(vy(v) - g * v.t) > 0.5; } }),
    N('co-rapidez-t', 'componentes', 3, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿Qué rapidez tiene a los $' + v.t + '$ s?'; },
      function (v) { return Math.hypot(vx(v), vy(v) - g * v.t); }, 'Combina $v_x$ (constante) y $v_y = v_{0y} - g t$ con Pitágoras.', { unit: 'm/s', where: inFlight }),
    N('co-angulo-t', 'componentes', 3, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' A los $' + v.t + '$ s, ¿qué ángulo forma su velocidad con la horizontal? (Positivo si sube, negativo si baja.)'; },
      function (v) { return Math.atan2(vy(v) - g * v.t, vx(v)) * DEG; }, '$\\tan\\alpha = v_y / v_x$ con $v_y = v_{0y} - g t$.',
      { unit: '°', tol: { abs: 0.5 }, where: function (v) { return inFlight(v) && Math.abs(vy(v) - g * v.t) > 0.5; } }),
    N('co-desplx', 'componentes', 1, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿Cuánto avanzó horizontalmente en $' + v.t + '$ s?'; },
      function (v) { return vx(v) * v.t; }, 'En $x$ es MRU: $x = v_0\\cos\\theta\\;t$.', { unit: 'm', where: inFlight }),
    N('co-v0-desde', 'componentes', 3, { vx: [5, 15, 1], tup: [0.5, 2, 0.1] },
      function (v) { return 'Un proyectil tiene $v_{0x} = ' + v.vx + '$ m/s y tarda $' + v.tup + '$ s en llegar a la cima. ¿Con qué rapidez se lanzó?'; },
      function (v) { return Math.hypot(v.vx, g * v.tup); }, 'En la cima $v_y = 0$, así que $v_{0y} = g\\,t_{sub}$; luego Pitágoras.', { unit: 'm/s' }),

    /* ---------------- Tiempo ---------------- */
    N('ti-subida', 'tiempo', 1, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Cuánto tarda en llegar a la cima?'; },
      function (v) { return vy(v) / g; }, 'En la cima $v_y = 0$: $t = v_0\\sin\\theta / g$.', { unit: 's' }),
    N('ti-vuelo', 'tiempo', 2, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Cuánto tiempo está en el aire si cae a la misma altura?'; },
      T, 'Sube y baja en el mismo tiempo: $T = 2v_0\\sin\\theta/g$.',
      { unit: 's', mistakes: { onlyUp: function (v) { return T(v) / 2; } }, feedback: [{ when: 'onlyUp', say: 'Ese es solo el tiempo de subida; multiplícalo por 2.' }] }),
    N('ti-subida-vy', 'tiempo', 1, { vy: [5, 25, 1] },
      function (v) { return 'Un proyectil sale con $v_{0y} = ' + v.vy + '$ m/s. ¿Cuánto tarda en llegar a la cima?'; },
      function (v) { return v.vy / g; }, '$v_y$ baja 9.81 m/s cada segundo hasta llegar a 0.', { unit: 's' }),
    N('ti-vuelo-vy', 'tiempo', 1, { vy: [5, 25, 1] },
      function (v) { return 'Un proyectil sale con $v_{0y} = ' + v.vy + '$ m/s y cae a la altura de la que salió. ¿Cuánto tiempo vuela?'; },
      function (v) { return 2 * v.vy / g; }, '$T = 2v_{0y}/g$: el doble del tiempo de subida.', { unit: 's' }),
    N('ti-altura-h', 'tiempo', 3, { vy: [15, 25, 1], h: [3, 10, 1] },
      function (v) { return 'Un balón sale con $v_{0y} = ' + v.vy + '$ m/s. ¿En qué instante, ya de bajada, pasa por $' + v.h + '$ m de altura?'; },
      function (v) { return (v.vy + Math.sqrt(v.vy * v.vy - 2 * g * v.h)) / g; }, 'Resuelve $h = v_{0y}t - \\tfrac{1}{2}gt^2$; de las dos raíces, la mayor es la de bajada.',
      { unit: 's', where: function (v) { return v.vy * v.vy > 2 * g * v.h; } }),
    N('ti-pared', 'tiempo', 2, { v0: V0, th: TH, D: [5, 20, 1] },
      function (v) { return tiro(v) + ' ¿Cuánto tarda en recorrer $' + v.D + '$ m horizontales?'; },
      function (v) { return v.D / vx(v); }, 'En $x$ la velocidad es constante: $t = D / v_0\\cos\\theta$.', { unit: 's', where: function (v) { return v.D < 0.95 * R(v); } }),
    N('ti-desde-h0', 'tiempo', 3, { v0: [5, 15, 1], th: [20, 60, 5], h0: [5, 20, 1] },
      function (v) { return 'Desde una azotea de $' + v.h0 + '$ m lanzas una pelota con $v_0 = ' + v.v0 + '$ m/s a $' + v.th + '^\\circ$ hacia arriba. ¿Cuánto tarda en llegar al piso?'; },
      function (v) { return (vy(v) + Math.sqrt(vy(v) * vy(v) + 2 * g * v.h0)) / g; }, 'Resuelve $0 = h_0 + v_{0y}t - \\tfrac{1}{2}gt^2$ y toma la raíz positiva. Aquí no vale $T = 2v_0\\sin\\theta/g$.', { unit: 's' }),
    N('ti-vy-desde-T', 'tiempo', 2, { Tv: [1, 5, 0.5] },
      function (v) { return 'Un proyectil pasa $' + v.Tv + '$ s en el aire y cae a la misma altura. ¿Cuál fue su $v_{0y}$?'; },
      function (v) { return g * v.Tv / 2; }, 'De $T = 2v_{0y}/g$ despejas $v_{0y} = gT/2$.', { unit: 'm/s' }),
    N('ti-desde-H', 'tiempo', 2, { H: [2, 20, 1] },
      function (v) { return 'Un proyectil alcanzó una altura máxima de $' + v.H + '$ m. ¿Cuánto tardó en subir?'; },
      function (v) { return Math.sqrt(2 * v.H / g); }, 'Bajar desde $H$ tarda lo mismo que subir: $H = \\tfrac{1}{2}gt^2$.', { unit: 's' }),
    N('ti-desde-R', 'tiempo', 2, { Rr: [10, 60, 5], vx: [5, 20, 1] },
      function (v) { return 'Un proyectil recorrió $' + v.Rr + '$ m horizontales con $v_x = ' + v.vx + '$ m/s. ¿Cuánto tiempo voló?'; },
      function (v) { return v.Rr / v.vx; }, 'En $x$ es MRU: $T = R / v_x$.', { unit: 's' }),

    /* ---------------- Altura máxima ---------------- */
    N('al-H', 'altura', 2, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Qué altura máxima alcanza?'; },
      H, '$H = \\frac{(v_0\\sin\\theta)^2}{2g}$.',
      {
        unit: 'm',
        mistakes: {
          forgotHalf: function (v) { return 2 * H(v); },
          noSquare: function (v) { return v.v0 * v.v0 * Math.sin(v.th * RAD) / (2 * g); }
        },
        feedback: [{ when: 'forgotHalf', say: 'Falta el 2 del denominador.' }, { when: 'noSquare', say: 'El seno también va al cuadrado: $v_{0y}^2 = v_0^2\\sin^2\\theta$.' }]
      }),
    N('al-H-vy', 'altura', 1, { vy: [5, 25, 1] },
      function (v) { return 'Un proyectil sale con $v_{0y} = ' + v.vy + '$ m/s. ¿Qué altura máxima alcanza sobre su punto de salida?'; },
      function (v) { return v.vy * v.vy / (2 * g); }, 'Con $v_y^2 = v_{0y}^2 - 2g\\,\\Delta y$ y $v_y = 0$ en la cima.', { unit: 'm' }),
    N('al-vertical', 'altura', 1, { v0: V0 },
      function (v) { return 'Lanzas una pelota verticalmente hacia arriba con $' + v.v0 + '$ m/s. ¿Qué altura alcanza?'; },
      function (v) { return v.v0 * v.v0 / (2 * g); }, 'Es el caso $\\theta = 90^\\circ$: toda la velocidad es vertical.', { unit: 'm' }),
    N('al-H45', 'altura', 1, { v0: V0 },
      function (v) { return 'Con $v_0 = ' + v.v0 + '$ m/s a $45^\\circ$, ¿qué altura máxima alcanza un proyectil?'; },
      function (v) { return v.v0 * v.v0 / (4 * g); }, 'Con $\\sin^2 45^\\circ = 1/2$: $H = v_0^2/4g$.', { unit: 'm' }),
    N('al-vy-necesaria', 'altura', 2, { H: [2, 20, 1] },
      function (v) { return '¿Qué componente vertical inicial necesita un proyectil para subir $' + v.H + '$ m?'; },
      function (v) { return Math.sqrt(2 * g * v.H); }, 'Despeja de $H = v_{0y}^2/2g$: $v_{0y} = \\sqrt{2gH}$.', { unit: 'm/s' }),
    N('al-v0-necesaria', 'altura', 3, { H: [3, 20, 1], th: [30, 75, 5] },
      function (v) { return '¿Con qué rapidez hay que lanzar a $' + v.th + '^\\circ$ para que la altura máxima sea $' + v.H + '$ m?'; },
      function (v) { return Math.sqrt(2 * g * v.H) / Math.sin(v.th * RAD); }, 'Primero $v_{0y} = \\sqrt{2gH}$ y luego $v_0 = v_{0y}/\\sin\\theta$.', { unit: 'm/s' }),
    N('al-plataforma', 'altura', 2, { vy: [5, 20, 1], h0: [2, 15, 1] },
      function (v) { return 'Desde una plataforma de $' + v.h0 + '$ m sale un proyectil con $v_{0y} = ' + v.vy + '$ m/s. ¿A qué altura sobre el piso llega en la cima?'; },
      function (v) { return v.h0 + v.vy * v.vy / (2 * g); }, 'Suma la altura de la plataforma a lo que sube: $h_0 + v_{0y}^2/2g$.', { unit: 'm' }),
    N('al-razon', 'altura', 3, {},
      function () { return 'Dos proyectiles salen con la misma rapidez, uno a $60^\\circ$ y otro a $30^\\circ$. ¿Cuántas veces más alto sube el de $60^\\circ$?'; },
      function () { return 3; }, '$H \\propto \\sin^2\\theta$ y $\\sin^2 60^\\circ / \\sin^2 30^\\circ = (3/4)/(1/4) = 3$.', { tol: { abs: 0.01 } }),
    N('al-cuarto', 'altura', 3, { v0: V0, th: TH },
      function (v) { return tiro(v) + ' ¿A qué altura está cuando ha avanzado la cuarta parte de su alcance?'; },
      function (v) { return 3 * H(v) / 4; }, 'La parábola da $y(R/4) = \\tfrac{3}{4}H$; compruébalo con $y(x)$.', { unit: 'm' }),
    N('al-baja', 'altura', 2, { dt: [0.5, 2, 0.1] },
      function (v) { return '¿Cuántos metros baja un proyectil en los $' + v.dt + '$ s que siguen a la cima?'; },
      function (v) { return g * v.dt * v.dt / 2; }, 'Desde la cima es caída libre: $\\Delta y = \\tfrac{1}{2}g\\,t^2$.', { unit: 'm' }),

    /* ---------------- Alcance ---------------- */
    N('ac-R', 'alcance', 2, { v0: V0, th: TH }, function (v) { return tiro(v) + ' ¿Cuál es su alcance si cae a la misma altura?'; },
      R, '$R = v_0^2\\sin 2\\theta/g$.',
      {
        unit: 'm',
        mistakes: {
          usedSinTheta: function (v) { return v.v0 * v.v0 * Math.sin(v.th * RAD) / g; },
          forgotTwo: function (v) { return R(v) / 2; }
        },
        feedback: [{ when: 'usedSinTheta', say: 'Usaste sin θ en lugar de sin 2θ.' }, { when: 'forgotTwo', say: 'Te falta un factor de 2 en el tiempo de vuelo.' }]
      }),
    N('ac-R45', 'alcance', 1, { v0: V0 },
      function (v) { return '¿Cuál es el alcance de un proyectil lanzado a $45^\\circ$ con $' + v.v0 + '$ m/s, en suelo plano?'; },
      function (v) { return v.v0 * v.v0 / g; }, 'A $45^\\circ$, $\\sin 2\\theta = 1$: $R = v_0^2/g$.', { unit: 'm' }),
    N('ac-v0-45', 'alcance', 2, { Rr: [10, 80, 5] },
      function (v) { return '¿Con qué rapidez mínima hay que lanzar para llegar a $' + v.Rr + '$ m en suelo plano?'; },
      function (v) { return Math.sqrt(v.Rr * g); }, 'El mínimo es a $45^\\circ$, con $R = v_0^2/g$.', { unit: 'm/s' }),
    N('ac-v0-theta', 'alcance', 3, { Rr: [10, 80, 5], th: [20, 70, 5] },
      function (v) { return '¿Con qué rapidez hay que lanzar a $' + v.th + '^\\circ$ para que caiga a $' + v.Rr + '$ m, a la misma altura?'; },
      function (v) { return Math.sqrt(v.Rr * g / Math.sin(2 * v.th * RAD)); }, 'Despeja de $R = v_0^2\\sin 2\\theta/g$.', { unit: 'm/s' }),
    N('ac-vxT', 'alcance', 1, { vx: [5, 20, 1], Tv: [1, 5, 0.5] },
      function (v) { return 'Un proyectil tiene $v_x = ' + v.vx + '$ m/s y vuela $' + v.Tv + '$ s. ¿A qué distancia horizontal cae?'; },
      function (v) { return v.vx * v.Tv; }, 'En $x$ es MRU: $R = v_x T$.', { unit: 'm' }),
    N('ac-comps', 'alcance', 2, { vx: [3, 15, 1], vy: [3, 15, 1] },
      function (v) { return 'Con $v_{0x} = ' + v.vx + '$ y $v_{0y} = ' + v.vy + '$ m/s, ¿cuál es el alcance en suelo plano?'; },
      function (v) { return 2 * v.vx * v.vy / g; }, '$R = v_{0x}\\cdot T = v_{0x}\\cdot 2v_{0y}/g$.', { unit: 'm' }),
    N('ac-complementario', 'alcance', 1, { th: [15, 40, 5] },
      function (v) { return 'Un proyectil a $' + v.th + '^\\circ$ cae a cierta distancia. ¿Con qué otro ángulo, con la misma rapidez, cae en el mismo lugar?'; },
      function (v) { return 90 - v.th; }, '$\\sin 2\\theta = \\sin(180^\\circ - 2\\theta)$: el ángulo complementario da el mismo alcance.', { unit: '°', tol: { abs: 0.5 } }),
    N('ac-luna', 'alcance', 3, { v0: [5, 20, 1], th: TH },
      function (v) { return 'En la Luna ($g = 1.62\\ \\text{m/s}^2$) lanzas con $' + v.v0 + '$ m/s a $' + v.th + '^\\circ$. ¿Cuál es el alcance?'; },
      function (v) { return v.v0 * v.v0 * Math.sin(2 * v.th * RAD) / 1.62; }, 'Misma fórmula con otra $g$: $R = v_0^2\\sin 2\\theta/g_{Luna}$.', { unit: 'm' }),
    N('ac-fraccion', 'alcance', 2, { th: TH },
      function (v) { return 'Con la misma rapidez, ¿qué fracción del alcance máximo logra un tiro a $' + v.th + '^\\circ$? (Da un número entre 0 y 1.)'; },
      function (v) { return Math.sin(2 * v.th * RAD); }, '$R/R_{máx} = \\sin 2\\theta$, porque el máximo es a $45^\\circ$.', { tol: { abs: 0.01 } }),
    N('ac-20-70', 'alcance', 2, { v0: V0 },
      function (v) { return 'Con $' + v.v0 + '$ m/s, ¿a qué distancia cae un tiro a $70^\\circ$? (Pista: compáralo con uno a $20^\\circ$.)'; },
      function (v) { return v.v0 * v.v0 * Math.sin(40 * RAD) / g; }, '$\\sin 140^\\circ = \\sin 40^\\circ$: igual que a $20^\\circ$.', { unit: 'm' }),
    N('ac-desde-h0', 'alcance', 3, { v0: [5, 15, 1], th: [20, 60, 5], h0: [5, 20, 1] },
      function (v) { return 'Desde una azotea de $' + v.h0 + '$ m lanzas con $' + v.v0 + '$ m/s a $' + v.th + '^\\circ$ hacia arriba. ¿A qué distancia horizontal del edificio cae?'; },
      function (v) { return vx(v) * (vy(v) + Math.sqrt(vy(v) * vy(v) + 2 * g * v.h0)) / g; }, 'Primero el tiempo con $0 = h_0 + v_{0y}t - \\tfrac{1}{2}gt^2$; luego $x = v_{0x}t$.', { unit: 'm' }),
    N('ac-doble', 'alcance', 2, {},
      function () { return 'Si duplicas la rapidez inicial sin cambiar el ángulo, ¿por qué factor se multiplica el alcance?'; },
      function () { return 4; }, '$R \\propto v_0^2$: el doble de rapidez da cuatro veces el alcance.', { tol: { abs: 0.01 } }),

    /* ---------------- Posición en un instante ---------------- */
    N('po-y-t', 'posicion', 2, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿A qué altura está a los $' + v.t + '$ s?'; },
      function (v) { return vy(v) * v.t - g * v.t * v.t / 2; }, '$y = v_0\\sin\\theta\\,t - \\tfrac{1}{2}g t^2$.', { unit: 'm', where: inFlight }),
    N('po-dist', 'posicion', 3, { v0: V0, th: TH, t: [0.5, 3, 0.5] },
      function (v) { return tiro(v) + ' ¿A qué distancia en línea recta del punto de lanzamiento está a los $' + v.t + '$ s?'; },
      function (v) { return Math.hypot(vx(v) * v.t, vy(v) * v.t - g * v.t * v.t / 2); }, 'Calcula $x(t)$ y $y(t)$ y usa Pitágoras.', { unit: 'm', where: inFlight }),
    N('po-y-x', 'posicion', 3, { v0: V0, th: TH, x: [2, 20, 1] },
      function (v) { return tiro(v) + ' ¿A qué altura está cuando ha avanzado $' + v.x + '$ m?'; },
      function (v) { return yAt(v, v.x); }, '$y = x\\tan\\theta - \\frac{g x^2}{2v_0^2\\cos^2\\theta}$.', { unit: 'm', where: beforeR }),
    N('po-barda', 'posicion', 3, { v0: [15, 25, 1], th: [30, 60, 5], D: [8, 20, 1], h: [1, 4, 0.5] },
      function (v) { return tiro(v) + ' A $' + v.D + '$ m hay una barda de $' + v.h + '$ m. ¿Por cuántos metros pasa arriba de ella? (Negativo si choca.)'; },
      function (v) { return yAt(v, v.D) - v.h; }, 'Calcula $y(D)$ con la ecuación de la trayectoria y réstale la altura de la barda.',
      { unit: 'm', tol: { abs: 0.05 }, where: function (v) { return v.D < 0.95 * R(v) && Math.abs(yAt(v, v.D) - v.h) > 0.2; } }),
    N('po-vy-x', 'posicion', 3, { v0: V0, th: TH, x: [2, 20, 1] },
      function (v) { return tiro(v) + ' ¿Cuánto vale $v_y$ cuando ha avanzado $' + v.x + '$ m? (Positiva hacia arriba.)'; },
      function (v) { return vy(v) - g * v.x / vx(v); }, 'Primero $t = x / v_{0x}$ y luego $v_y = v_{0y} - g t$.',
      { unit: 'm/s', tol: { abs: 0.1 }, where: function (v) { return beforeR(v) && Math.abs(vy(v) - g * v.x / vx(v)) > 0.5; } }),
    N('po-x-T3', 'posicion', 2, { v0: V0, th: TH },
      function (v) { return tiro(v) + ' ¿Cuánto ha avanzado horizontalmente cuando ha pasado un tercio de su tiempo de vuelo?'; },
      function (v) { return R(v) / 3; }, 'Como $v_x$ es constante, un tercio del tiempo es un tercio del alcance.', { unit: 'm' }),
    N('po-rapidez-cae', 'posicion', 1, { v0: V0, th: TH },
      function (v) { return tiro(v) + ' ¿Con qué rapidez llega al piso, si cae a la misma altura?'; },
      function (v) { return v.v0; }, '$v_x$ no cambia y $v_y$ llega con la misma magnitud, hacia abajo: la rapidez es $v_0$.', { unit: 'm/s' }),
    N('po-tiempo-arriba', 'posicion', 3, { vy: [10, 25, 1], h: [2, 10, 1] },
      function (v) { return 'Un proyectil sale con $v_{0y} = ' + v.vy + '$ m/s. ¿Cuánto tiempo pasa por encima de $' + v.h + '$ m de altura?'; },
      function (v) { return 2 * Math.sqrt(v.vy * v.vy - 2 * g * v.h) / g; }, 'Es la diferencia entre las dos raíces de $h = v_{0y}t - \\tfrac{1}{2}gt^2$.',
      { unit: 's', where: function (v) { return v.vy * v.vy > 2 * g * v.h + 4; } }),

    /* ---------------- Tiro horizontal ---------------- */
    N('ho-tiempo', 'horizontal', 1, { h: [0.5, 20, 0.5] },
      function (v) { return 'Una pelota sale horizontalmente de una mesa de $' + v.h + '$ m. ¿Cuánto tarda en llegar al piso?'; },
      function (v) { return Math.sqrt(2 * v.h / g); }, 'Sin velocidad vertical inicial: $h = \\tfrac{1}{2}g t^2$.', { unit: 's' }),
    N('ho-distancia', 'horizontal', 2, { v0: [1, 10, 0.5], h: [0.5, 10, 0.5] },
      function (v) { return 'Una canica sale horizontalmente a $' + v.v0 + '$ m/s de una repisa de $' + v.h + '$ m. ¿A qué distancia horizontal cae?'; },
      function (v) { return v.v0 * Math.sqrt(2 * v.h / g); }, 'Tiempo de caída $\\sqrt{2h/g}$ y luego $x = v_0 t$.',
      {
        unit: 'm',
        mistakes: { forgotTwo: function (v) { return v.v0 * Math.sqrt(v.h / g); }, noSqrt: function (v) { return v.v0 * 2 * v.h / g; } },
        feedback: [{ when: 'forgotTwo', say: 'De $h = \\tfrac{1}{2}gt^2$ sale $t = \\sqrt{2h/g}$: falta el 2.' }, { when: 'noSqrt', say: 'Falta sacar la raíz: $t^2 = 2h/g$.' }]
      }),
    N('ho-v0', 'horizontal', 2, { D: [1, 10, 0.5], h: [0.5, 10, 0.5] },
      function (v) { return '¿Con qué rapidez horizontal debe salir un objeto de $' + v.h + '$ m de altura para caer a $' + v.D + '$ m?'; },
      function (v) { return v.D / Math.sqrt(2 * v.h / g); }, 'El tiempo lo fija la altura; luego $v_0 = D/t$.', { unit: 'm/s' }),
    N('ho-altura', 'horizontal', 3, { D: [1, 8, 0.5], v0: [2, 8, 0.5] },
      function (v) { return 'Una pelota sale horizontalmente a $' + v.v0 + '$ m/s y cae a $' + v.D + '$ m. ¿De qué altura salió?'; },
      function (v) { return g * v.D * v.D / (2 * v.v0 * v.v0); }, '$t = D/v_0$ y $h = \\tfrac{1}{2}g t^2$.', { unit: 'm' }),
    N('ho-vy', 'horizontal', 2, { h: [0.5, 20, 0.5] },
      function (v) { return 'Un objeto sale horizontalmente desde $' + v.h + '$ m. ¿Qué rapidez vertical tiene al tocar el piso?'; },
      function (v) { return Math.sqrt(2 * g * v.h); }, 'Es una caída libre en $y$: $v_y = \\sqrt{2gh}$.', { unit: 'm/s' }),
    N('ho-rapidez', 'horizontal', 2, { v0: [1, 10, 0.5], h: [0.5, 10, 0.5] },
      function (v) { return 'Un objeto sale horizontalmente a $' + v.v0 + '$ m/s desde $' + v.h + '$ m. ¿Con qué rapidez toca el piso?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 + 2 * g * v.h); }, 'Combina $v_x = v_0$ y $v_y = \\sqrt{2gh}$ con Pitágoras.', { unit: 'm/s' }),
    N('ho-angulo', 'horizontal', 3, { v0: [1, 10, 0.5], h: [0.5, 10, 0.5] },
      function (v) { return 'Un objeto sale horizontalmente a $' + v.v0 + '$ m/s desde $' + v.h + '$ m. ¿Con qué ángulo bajo la horizontal choca con el piso?'; },
      function (v) { return Math.atan(Math.sqrt(2 * g * v.h) / v.v0) * DEG; }, '$\\tan\\alpha = v_y/v_x = \\sqrt{2gh}/v_0$.', { unit: '°', tol: { abs: 0.5 } }),
    N('ho-caida-x', 'horizontal', 2, { v0: [2, 10, 0.5], x: [1, 6, 0.5] },
      function (v) { return 'Un objeto sale horizontalmente a $' + v.v0 + '$ m/s. ¿Cuánto ha bajado cuando avanzó $' + v.x + '$ m?'; },
      function (v) { return g * v.x * v.x / (2 * v.v0 * v.v0); }, '$t = x/v_0$ y $\\Delta y = \\tfrac{1}{2}g t^2$.', { unit: 'm' }),
    N('ho-avion', 'horizontal', 2, { H: [100, 500, 50], v: [40, 90, 5] },
      function (v) { return 'Un avión vuela horizontal a $' + v.v + '$ m/s y $' + v.H + '$ m de altura. ¿A qué distancia horizontal antes del blanco debe soltar un paquete?'; },
      function (v) { return v.v * Math.sqrt(2 * v.H / g); }, 'El paquete sale con la velocidad del avión: es un tiro horizontal.', { unit: 'm' }),
    N('ho-cuadruple', 'horizontal', 2, {},
      function () { return 'Si una mesa fuera cuatro veces más alta, ¿por qué factor se multiplicaría el tiempo de caída de una pelota lanzada horizontalmente?'; },
      function () { return 2; }, '$t = \\sqrt{2h/g}$: cuatro veces la altura da el doble de tiempo.', { tol: { abs: 0.01 } }),
    N('ho-mitad', 'horizontal', 3, { v0: [2, 10, 0.5], h: [1, 10, 0.5] },
      function (v) { return 'Un objeto sale horizontalmente a $' + v.v0 + '$ m/s desde $' + v.h + '$ m. ¿Cuánto avanzó cuando ha bajado la mitad de la altura?'; },
      function (v) { return v.v0 * Math.sqrt(v.h / g); }, 'Bajar $h/2$ tarda $\\sqrt{h/g}$; luego $x = v_0 t$.', { unit: 'm' }),
    N('ho-30', 'horizontal', 3, { h: [1, 20, 1] },
      function (v) { return 'Desde $' + v.h + '$ m, ¿con qué rapidez horizontal hay que lanzar para que choque con el piso a $30^\\circ$ bajo la horizontal?'; },
      function (v) { return Math.sqrt(2 * g * v.h) / Math.tan(30 * RAD); }, '$\\tan 30^\\circ = v_y/v_x$ con $v_y = \\sqrt{2gh}$.', { unit: 'm/s' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-aceleracion', 'componentes', 1, 'Sin aire, ¿qué aceleración tiene un proyectil durante todo su vuelo?',
      '$g$ hacia abajo', [['Cero'], ['$g$ en la dirección de la velocidad'], ['Depende del ángulo de lanzamiento']],
      'La única fuerza es el peso, así que la aceleración es $g$ hacia abajo en todo momento.'),
    C('k-vx', 'componentes', 1, '¿Qué pasa con $v_x$ durante el vuelo?',
      'Se mantiene constante', [['Disminuye hasta cero en la cima'], ['Aumenta al bajar'], ['Cambia de signo en la cima']],
      'No hay aceleración horizontal, así que $v_x$ no cambia.'),
    C('k-vy-cima', 'altura', 1, '¿Cuánto vale $v_y$ en la cima de la trayectoria?',
      'Cero', [['$v_0\\sin\\theta$'], ['$-g$'], ['$v_0$']],
      'En la cima deja de subir y aún no baja: $v_y = 0$.'),
    C('k-v-cima', 'altura', 2, 'En la cima, la velocidad del proyectil es…',
      'horizontal, igual a $v_0\\cos\\theta$', [['cero'], ['vertical hacia abajo'], ['igual a $v_0$']],
      'Solo $v_y$ es cero en la cima; $v_x$ sigue igual.'),
    C('k-a-cima', 'altura', 2, 'En la cima, la aceleración del proyectil es…',
      '$g$ hacia abajo, como en todo el vuelo', [['cero, porque se detiene'], ['horizontal'], ['igual a $v_0/t$']],
      'La velocidad vertical es cero en la cima, pero sigue cambiando: la aceleración nunca es cero.'),
    C('k-45', 'alcance', 1, 'En suelo plano y con la misma rapidez, ¿qué ángulo da el mayor alcance?',
      '$45^\\circ$', [['$30^\\circ$'], ['$60^\\circ$'], ['$90^\\circ$']],
      '$R = v_0^2\\sin 2\\theta/g$ es máximo cuando $\\sin 2\\theta = 1$.'),
    C('k-complementarios', 'alcance', 2, 'Con la misma rapidez, ¿qué pasa con los tiros a $30^\\circ$ y a $60^\\circ$?',
      'Caen en el mismo punto', [['El de $60^\\circ$ llega más lejos'], ['El de $30^\\circ$ llega más lejos'], ['Depende de la rapidez']],
      '$\\sin 60^\\circ = \\sin 120^\\circ$, así que el alcance es el mismo.'),
    C('k-mas-alto', 'altura', 2, 'Con la misma rapidez, si aumentas el ángulo (sin pasar de $90^\\circ$), la altura máxima…',
      'aumenta', [['disminuye'], ['no cambia'], ['primero aumenta y luego disminuye']],
      '$H \\propto \\sin^2\\theta$, que crece hasta $90^\\circ$.'),
    C('k-t-depende', 'tiempo', 2, 'El tiempo de vuelo de un proyectil que cae a la misma altura depende de…',
      'solo la componente vertical $v_{0y}$', [['solo la componente horizontal $v_{0x}$'], ['la masa del proyectil'], ['el alcance']],
      '$T = 2v_{0y}/g$: el movimiento vertical decide cuánto tiempo vuela.'),
    C('k-soltar-lanzar', 'horizontal', 2, 'Desde la misma altura, sueltas una pelota y lanzas otra horizontalmente al mismo tiempo. ¿Cuál llega primero al piso?',
      'Llegan al mismo tiempo', [['La que se soltó'], ['La que se lanzó'], ['Depende de qué tan fuerte se lance']],
      'Las dos empiezan con $v_y = 0$ y caen con la misma $g$.'),
    C('k-doble-R', 'alcance', 2, 'Si duplicas $v_0$ sin cambiar el ángulo, el alcance…',
      'se multiplica por 4', [['se duplica'], ['no cambia'], ['se multiplica por $\\sqrt{2}$']],
      '$R \\propto v_0^2$.'),
    C('k-doble-H', 'altura', 2, 'Si duplicas $v_0$ sin cambiar el ángulo, la altura máxima…',
      'se multiplica por 4', [['se duplica'], ['no cambia'], ['se reduce a la mitad']],
      '$H \\propto v_0^2$.'),
    C('k-doble-T', 'tiempo', 2, 'Si duplicas $v_0$ sin cambiar el ángulo, el tiempo de vuelo…',
      'se duplica', [['se multiplica por 4'], ['no cambia'], ['se reduce a la mitad']],
      '$T \\propto v_0$.'),
    C('k-luna', 'alcance', 1, 'En la Luna la gravedad es menor. Con el mismo tiro, el alcance…',
      'es mayor', [['es menor'], ['es igual'], ['es cero']],
      '$R = v_0^2\\sin 2\\theta/g$: con $g$ menor, $R$ crece.'),
    C('k-forma', 'posicion', 1, 'Sin aire, la trayectoria de un proyectil es…',
      'una parábola', [['una recta'], ['un arco de círculo'], ['una curva que siempre sube']],
      '$y(x)$ es una función cuadrática de $x$.'),
    C('k-validez', 'alcance', 2, 'La fórmula $R = v_0^2\\sin 2\\theta/g$ solo vale cuando…',
      'el proyectil cae a la misma altura de la que salió', [['el ángulo es $45^\\circ$'], ['la rapidez es menor a 20 m/s'], ['se lanza desde una altura $h_0$']],
      'Se dedujo con $y(T) = 0$; si sale de una altura, hay que resolver $y(t)$ completa.'),
    C('k-formula-R', 'alcance', 1, '¿Cuál es el alcance de un tiro en suelo plano?',
      '$R = \\frac{v_0^2\\sin 2\\theta}{g}$', [['$R = \\frac{v_0^2\\sin\\theta}{g}$'], ['$R = \\frac{v_0^2\\sin^2\\theta}{2g}$'], ['$R = \\frac{2v_0\\sin\\theta}{g}$']],
      'Sale de $R = v_{0x}T$ y de $2\\sin\\theta\\cos\\theta = \\sin 2\\theta$. Las otras son el error de $\\sin\\theta$, la altura máxima y el tiempo de vuelo.'),
    C('k-aire', 'alcance', 2, 'En la realidad, con resistencia del aire, el alcance comparado con el de la fórmula es…',
      'menor', [['mayor'], ['igual'], ['el doble']],
      'El aire frena al proyectil; este curso lo desprecia, por eso las respuestas reales son un poco menores.'),
    C('k-rapidez-cae', 'posicion', 2, 'Si cae a la misma altura de la que salió, ¿con qué rapidez llega?',
      'Con la misma rapidez $v_0$', [['Con más rapidez que $v_0$'], ['Con menos rapidez que $v_0$'], ['Con rapidez cero']],
      '$v_x$ no cambia y $v_y$ llega con la misma magnitud que al salir.'),
    C('k-direccion-cae', 'posicion', 2, 'Al caer a la misma altura, su velocidad apunta…',
      '$\\theta$ grados por debajo de la horizontal', [['verticalmente hacia abajo'], ['horizontalmente'], ['$\\theta$ grados por encima de la horizontal']],
      'La trayectoria es simétrica: llega con el mismo ángulo con el que salió, pero hacia abajo.'),
    C('k-subida-bajada', 'tiempo', 1, 'Si cae a la misma altura, el tiempo de subida comparado con el de bajada es…',
      'igual', [['mayor'], ['menor'], ['el doble']],
      'La trayectoria es simétrica respecto a la cima.'),
    C('k-horizontal-vy', 'horizontal', 1, 'En un tiro horizontal, ¿cuánto vale la velocidad vertical inicial?',
      'Cero', [['$v_0$'], ['$g$'], ['$v_0\\sin 45^\\circ$']],
      'Sale horizontal: toda la velocidad inicial es $v_x$.'),
    C('k-horizontal-t', 'horizontal', 2, 'En un tiro horizontal, el tiempo de caída depende de…',
      'solo la altura', [['solo la rapidez horizontal'], ['la altura y la rapidez horizontal'], ['la masa del objeto']],
      '$t = \\sqrt{2h/g}$: la rapidez horizontal no influye en cuánto tarda en caer.'),
    C('k-horizontal-doble', 'horizontal', 2, 'En un tiro horizontal desde la misma altura, si duplicas $v_0$, la distancia a la que cae…',
      'se duplica', [['se multiplica por 4'], ['no cambia'], ['se multiplica por $\\sqrt{2}$']],
      'El tiempo de caída es el mismo; $x = v_0 t$ crece igual que $v_0$.'),
    C('k-horizontal-altura', 'horizontal', 2, 'Si duplicas la altura de un tiro horizontal, el tiempo de caída…',
      'se multiplica por $\\sqrt{2}$', [['se duplica'], ['se multiplica por 4'], ['no cambia']],
      '$t = \\sqrt{2h/g}$ crece con la raíz de la altura.'),
    C('k-grados', 'componentes', 1, 'Calculas $v_0\\cos 30^\\circ$ y te sale un número negativo. ¿Qué pasó?',
      'La calculadora está en radianes', [['Así debe salir'], ['El coseno de $30^\\circ$ es negativo'], ['Olvidaste multiplicar por $g$']],
      '$\\cos 30^\\circ \\approx 0.866$; $\\cos(30\\text{ rad}) \\approx 0.154$ y otros ángulos dan negativos.'),
    C('k-signo-g', 'posicion', 1, 'Con el eje $y$ hacia arriba, ¿cómo va $g$ en $y(t)$?',
      '$y = h_0 + v_{0y}t - \\tfrac{1}{2}g t^2$', [['$y = h_0 + v_{0y}t + \\tfrac{1}{2}g t^2$'], ['$y = h_0 - v_{0y}t - \\tfrac{1}{2}g t^2$'], ['$y = h_0 + v_{0y}t - g t$']],
      'La aceleración apunta hacia abajo: $a_y = -g$.'),
    C('k-grafica-vy', 'tiempo', 2, '¿Cómo es la gráfica de $v_y$ contra $t$ durante el vuelo?',
      'Una recta con pendiente $-g$', [['Una parábola'], ['Una recta horizontal'], ['Una curva que se aplana en la cima']],
      '$v_y = v_{0y} - g t$ es lineal en $t$.'),
    C('k-grafica-x', 'posicion', 2, '¿Cómo es la gráfica de $x$ contra $t$?',
      'Una recta con pendiente $v_{0x}$', [['Una parábola'], ['Una recta horizontal'], ['Una curva que se aplana']],
      'En $x$ es MRU: $x = v_{0x}t$.'),
    C('k-grafica-y', 'posicion', 2, '¿Cómo es la gráfica de $y$ contra $t$?',
      'Una parábola que abre hacia abajo', [['Una recta'], ['Una parábola que abre hacia arriba'], ['Una recta horizontal']],
      '$y = v_{0y}t - \\tfrac{1}{2}g t^2$ es cuadrática con coeficiente negativo.'),
    C('k-90', 'alcance', 1, 'Si lanzas a $90^\\circ$ en suelo plano, el alcance es…',
      'cero', [['el máximo'], ['igual que a $45^\\circ$'], ['infinito']],
      '$\\sin 180^\\circ = 0$: sube y baja en el mismo lugar.'),
    C('k-componentes-a', 'componentes', 1, '¿Cuáles son las componentes de la aceleración de un proyectil (eje $y$ hacia arriba)?',
      '$a_x = 0$ y $a_y = -g$', [['$a_x = g$ y $a_y = 0$'], ['$a_x = 0$ y $a_y = 0$'], ['$a_x = -g$ y $a_y = -g$']],
      'Horizontal sin aceleración; vertical, la gravedad.'),
    C('k-mas-tiempo', 'tiempo', 2, 'Con la misma rapidez, ¿cuál tarda más en el aire: el tiro a $30^\\circ$ o el de $60^\\circ$?',
      'El de $60^\\circ$', [['El de $30^\\circ$'], ['Tardan lo mismo'], ['Depende de la rapidez']],
      'Aunque caen en el mismo punto, el de $60^\\circ$ tiene más $v_{0y}$: $T = 2v_0\\sin\\theta/g$.'),
    C('k-acantilado', 'horizontal', 2, 'Desde un acantilado lanzas dos piedras con la misma rapidez: una hacia arriba a $30^\\circ$ y otra hacia abajo a $30^\\circ$. Sin aire, ¿cuál llega al mar con más rapidez?',
      'Llegan con la misma rapidez', [['La que lanzaste hacia arriba'], ['La que lanzaste hacia abajo'], ['Depende de la altura del acantilado']],
      'Misma rapidez inicial y misma caída total: en S13 verás que la energía lo explica. Aquí se ve con $v_y^2 = v_{0y}^2 + 2gh$.'),
    C('k-carro', 'posicion', 2, 'Desde un carro que avanza a velocidad constante lanzas una pelota verticalmente hacia arriba. Visto desde la banqueta, la pelota…',
      'describe una parábola y cae de nuevo en tu mano', [['sube y baja en línea recta y cae atrás del carro'], ['describe una parábola y cae adelante del carro'], ['sube en línea recta y cae atrás del carro']],
      'La pelota conserva la velocidad horizontal del carro: es un tiro parabólico para quien está en la banqueta.'),
    C('k-vy-cae', 'componentes', 2, 'Si cae a la misma altura, ¿cuánto vale $v_y$ al llegar? (Eje $y$ hacia arriba.)',
      '$-v_0\\sin\\theta$', [['$0$'], ['$v_0\\sin\\theta$'], ['$-g\\,T$']],
      'Misma magnitud que al salir, pero hacia abajo.'),
    C('k-rapidez-min', 'altura', 1, '¿En qué punto de la trayectoria es mínima la rapidez?',
      'En la cima', [['Al salir'], ['Al caer'], ['Es igual en todos los puntos']],
      'En la cima $v_y = 0$ y solo queda $v_x$.'),
    C('k-masa', 'componentes', 1, 'Sin aire, ¿cómo afecta la masa a la trayectoria de un proyectil?',
      'No la afecta', [['Más masa, menor alcance'], ['Más masa, mayor alcance'], ['Más masa, mayor altura']],
      'Todos los cuerpos caen con la misma $g$; la masa no aparece en ninguna ecuación del tiro.')
  ];

  bank.f1.S06 = {
    subtopics: {
      'f1.S06.componentes': 'Componentes de la velocidad',
      'f1.S06.tiempo': 'Tiempo de subida y de vuelo',
      'f1.S06.altura': 'Altura máxima',
      'f1.S06.alcance': 'Alcance',
      'f1.S06.posicion': 'Posición y velocidad en un instante',
      'f1.S06.horizontal': 'Tiro horizontal y desde altura'
    },
    questions: Q
  };
})();
