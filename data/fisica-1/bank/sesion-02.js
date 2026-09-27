/* =====================================================================
   Banco · Física 1 · S02 · Vectores: componentes y suma. 100 preguntas propias.
   Ángulos en grados desde +x, antihorario, en [0°, 360°) salvo que se diga otra cosa.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '02'), C = K.C;
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    if (o.mistakes) {
      var base = o.where;
      q.where = function (v) {
        if (base && !base(v)) return false;
        var vals = [answer(v)].concat(Object.keys(o.mistakes).map(function (k) { return o.mistakes[k](v); }));
        for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
        }
        return true;
      };
    }
    return q;
  }
  function fb(key, say) { return [{ when: key, say: say }]; }
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function ang(x, y) { return n360(Math.atan2(y, x) * DEG); }
  function cx(m, a) { return m * Math.cos(a * RAD); }
  function cy(m, a) { return m * Math.sin(a * RAD); }
  function sum2(A, a, B, b, s) { s = s == null ? 1 : s; return [cx(A, a) + s * cx(B, b), cy(A, a) + s * cy(B, b)]; }
  var ANG = { abs: 0.5 };
  var noAxis = function (x, y) { return x !== 0 && y !== 0; };

  var Q = [
    /* ---------------- Escalares y vectores ---------------- */
    N('es-media-vuelta', 'escalares', 1, { r: [5, 60, 5] }, function (v) { return 'Corres media vuelta en una pista circular de $' + v.r + '\\ \\text{m}$ de radio. ¿Cuánto mide tu desplazamiento?'; },
      function (v) { return 2 * v.r; }, 'Terminas en el punto opuesto: el desplazamiento es el diámetro.', { unit: 'm', mistakes: { distance: function (v) { return Math.PI * v.r; } }, feedback: fb('distance', 'Esa es la distancia recorrida (media circunferencia). El desplazamiento va en línea recta del inicio al final.') }),
    N('es-media-vuelta-d', 'escalares', 1, { R: [5, 60, 5] }, function (v) { return 'En una pista circular de $' + v.R + '\\ \\text{m}$ de radio recorres media vuelta. ¿Qué distancia recorriste?'; },
      function (v) { return Math.PI * v.R; }, 'La distancia sigue el camino: media circunferencia, $\\pi r$.', { unit: 'm' }),
    N('es-cuadra', 'escalares', 2, { a: [20, 90, 5], b: [20, 90, 5] }, function (v) { return 'Caminas $' + v.a + '$ m al este, $' + v.b + '$ m al norte y $' + v.a + '$ m al oeste. ¿Qué distancia recorriste?'; },
      function (v) { return 2 * v.a + v.b; }, 'La distancia suma todos los tramos, sin importar la dirección.', { unit: 'm' }),
    N('es-cuadra-d', 'escalares', 2, { e: [20, 90, 5], n: [20, 90, 5] }, function (v) { return 'Caminas $' + v.e + '$ m al este, $' + v.n + '$ m al norte y $' + v.e + '$ m al oeste. ¿Cuánto mide tu desplazamiento?'; },
      function (v) { return v.n; }, 'Los tramos este y oeste se cancelan; solo queda el tramo al norte.', { unit: 'm', mistakes: { distance: function (v) { return 2 * v.e + v.n; } }, feedback: fb('distance', 'Esa es la distancia. El desplazamiento compara solo el inicio con el final.') }),

    /* ---------------- Componentes ---------------- */
    N('co-ax', 'componentes', 1, { A: [4, 40, 1], th: [10, 80, 5] }, function (v) { return 'Un vector de magnitud $' + v.A + '$ apunta a $' + v.th + '^\\circ$ sobre el eje $+x$. ¿Cuánto vale su componente $x$?'; },
      function (v) { return cx(v.A, v.th); }, '$A_x = A\\cos\\theta$.', { mistakes: { usedSin: function (v) { return cy(v.A, v.th); } }, feedback: fb('usedSin', 'Usaste el seno; con el ángulo desde $+x$, la componente $x$ lleva coseno.') }),
    N('co-ay', 'componentes', 1, { A: [4, 40, 1], th: [10, 80, 5] }, function (v) { return 'Un vector de magnitud $' + v.A + '$ forma $' + v.th + '^\\circ$ con el eje $+x$. ¿Cuánto vale su componente $y$?'; },
      function (v) { return cy(v.A, v.th); }, '$A_y = A\\sin\\theta$.', { mistakes: { usedCos: function (v) { return cx(v.A, v.th); } }, feedback: fb('usedCos', 'Usaste el coseno; la componente $y$ lleva seno.') }),
    N('co-ax-q2', 'componentes', 2, { F: [5, 50, 1], th: [100, 170, 5] }, function (v) { return 'Una fuerza de $' + v.F + '\\ \\text{N}$ apunta a $' + v.th + '^\\circ$. ¿Cuánto vale $F_x$? (Con signo.)'; },
      function (v) { return cx(v.F, v.th); }, 'El coseno de un ángulo del 2.º cuadrante es negativo: la fuerza apunta a la izquierda.', { unit: 'N', tol: { abs: 0.05 }, mistakes: { noSign: function (v) { return -cx(v.F, v.th); } }, feedback: fb('noSign', 'Te falta el signo: apunta hacia $-x$.') }),
    N('co-ay-q3', 'componentes', 2, { F: [5, 50, 1], phi: [190, 260, 5] }, function (v) { return 'Un vector de magnitud $' + v.F + '$ apunta a $' + v.phi + '^\\circ$. ¿Cuánto vale su componente $y$? (Con signo.)'; },
      function (v) { return cy(v.F, v.phi); }, 'En el 3.er cuadrante las dos componentes son negativas.', { tol: { abs: 0.05 } }),
    N('co-desde-y', 'componentes', 2, { A: [5, 40, 1], al: [10, 80, 5] }, function (v) { return 'Un vector de magnitud $' + v.A + '$ forma $' + v.al + '^\\circ$ con el eje $+y$, inclinado hacia $+x$. ¿Cuánto vale $A_x$?'; },
      function (v) { return v.A * Math.sin(v.al * RAD); }, 'Si el ángulo se mide desde $y$, el cateto pegado es el vertical: $A_x = A\\sin\\alpha$.', { mistakes: { usedCos: function (v) { return v.A * Math.cos(v.al * RAD); } }, feedback: fb('usedCos', 'El ángulo está medido desde $y$, no desde $x$: aquí $A_x$ lleva seno.') }),
    N('co-rumbo', 'componentes', 2, { d: [2, 30, 1], th: [10, 80, 5] }, function (v) { return 'Un barco navega $' + v.d + '\\ \\text{km}$ con rumbo $' + v.th + '^\\circ$ al este del norte. ¿Cuántos km avanzó hacia el este?'; },
      function (v) { return v.d * Math.sin(v.th * RAD); }, 'Medido desde el norte, el cateto opuesto es el del este: $d\\sin\\theta$.', { unit: 'km', mistakes: { usedCos: function (v) { return v.d * Math.cos(v.th * RAD); } }, feedback: fb('usedCos', 'Esa es la componente hacia el norte; el ángulo se mide desde el norte.') }),
    N('co-bajo', 'componentes', 2, { F: [5, 60, 1], b: [10, 80, 5] }, function (v) { return 'Empujas un carrito con $' + v.F + '\\ \\text{N}$ a $' + v.b + '^\\circ$ por debajo de la horizontal. ¿Cuánto vale $F_y$? (Eje $y$ hacia arriba.)'; },
      function (v) { return -v.F * Math.sin(v.b * RAD); }, 'La fuerza apunta hacia abajo: su componente vertical es negativa.', { unit: 'N', tol: { abs: 0.05 }, mistakes: { noSign: function (v) { return v.F * Math.sin(v.b * RAD); } }, feedback: fb('noSign', 'La magnitud está bien, pero apunta hacia abajo: es negativa.') }),
    N('co-avion', 'componentes', 2, { v: [100, 250, 10], th: [10, 80, 5] }, function (v) { return 'Un avión vuela a $' + v.v + '\\ \\text{km/h}$ a $' + v.th + '^\\circ$ al norte del este. ¿Cuál es su componente hacia el norte?'; },
      function (v) { return cy(v.v, v.th); }, 'Con el este como eje $x$: $v_y = v\\sin\\theta$.', { unit: 'km/h' }),
    N('co-rampa', 'componentes', 1, { L: [1, 12, 0.5], th: [5, 40, 5] }, function (v) { return 'Una rampa de $' + v.L + '\\ \\text{m}$ de largo está inclinada $' + v.th + '^\\circ$. ¿Cuánto sube?'; },
      function (v) { return v.L * Math.sin(v.th * RAD); }, 'La altura es el cateto opuesto al ángulo.', { unit: 'm' }),
    N('co-escalera', 'componentes', 2, { Le: [2, 8, 0.5], th: [50, 80, 5] }, function (v) { return 'Una escalera de $' + v.Le + '\\ \\text{m}$ forma $' + v.th + '^\\circ$ con el piso. ¿A qué distancia de la pared está su base?'; },
      function (v) { return v.Le * Math.cos(v.th * RAD); }, 'La distancia horizontal es el cateto pegado al ángulo.', { unit: 'm' }),
    N('co-desde-ax', 'componentes', 3, { ax: [2, 30, 1], th: [10, 70, 5] }, function (v) { return 'La componente $x$ de un vector es $' + v.ax + '$ y el vector forma $' + v.th + '^\\circ$ con $+x$. ¿Cuánto mide el vector?'; },
      function (v) { return v.ax / Math.cos(v.th * RAD); }, 'De $A_x = A\\cos\\theta$ se despeja $A = A_x/\\cos\\theta$.', { mistakes: { multiplied: function (v) { return v.ax * Math.cos(v.th * RAD); } }, feedback: fb('multiplied', 'Hay que dividir entre $\\cos\\theta$, no multiplicar.') }),
    N('co-otra', 'componentes', 2, { A: [10, 30, 1], ax: [2, 9, 1] }, function (v) { return 'Un vector mide $' + v.A + '$ y su componente $x$ es $' + v.ax + '$. ¿Cuánto mide su componente $y$ (positiva)?'; },
      function (v) { return Math.sqrt(v.A * v.A - v.ax * v.ax); }, 'Pitágoras al revés: $A_y = \\sqrt{A^2 - A_x^2}$.', { mistakes: { subtracted: function (v) { return v.A - v.ax; } }, feedback: fb('subtracted', 'Las componentes no se restan así: usa $A^2 = A_x^2 + A_y^2$.') }),
    N('co-unitario', 'componentes', 1, { th: [10, 170, 10] }, function (v) { return '¿Cuánto vale la componente $x$ de un vector de magnitud 1 que apunta a $' + v.th + '^\\circ$?'; },
      function (v) { return Math.cos(v.th * RAD); }, 'Con magnitud 1, la componente es el coseno.', { tol: { abs: 0.005 }, where: function (v) { return v.th !== 90; } }),
    N('co-sombra', 'componentes', 2, { h: [2, 12, 0.5], th: [20, 70, 5] }, function (v) { return 'El Sol está a $' + v.th + '^\\circ$ sobre el horizonte. ¿Qué largo tiene la sombra de un poste de $' + v.h + '\\ \\text{m}$?'; },
      function (v) { return v.h / Math.tan(v.th * RAD); }, 'El poste es el cateto opuesto y la sombra el adyacente: sombra $= h/\\tan\\theta$.', { unit: 'm' }),
    N('co-tres-x', 'componentes', 2, { F1: [5, 30, 1], F2: [5, 30, 1], F3: [5, 30, 1] }, function (v) { return 'Tres fuerzas de $' + v.F1 + '$, $' + v.F2 + '$ y $' + v.F3 + '\\ \\text{N}$ apuntan a $0^\\circ$, $120^\\circ$ y $240^\\circ$. ¿Cuánto vale la suma de sus componentes $x$?'; },
      function (v) { return v.F1 + cx(v.F2, 120) + cx(v.F3, 240); }, '$\\cos 120^\\circ = \\cos 240^\\circ = -\\tfrac{1}{2}$.', { unit: 'N', tol: { abs: 0.05 } }),

    /* ---------------- Magnitud y dirección ---------------- */
    N('di-mag', 'direccion', 1, { ax: [-12, 12, 1], ay: [-12, 12, 1] }, function (v) { return '¿Cuánto mide el vector $(' + v.ax + ',\\ ' + v.ay + ')$?'; },
      function (v) { return Math.hypot(v.ax, v.ay); }, '$|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$.', { where: function (v) { return noAxis(v.ax, v.ay); }, mistakes: { sumAbs: function (v) { return Math.abs(v.ax) + Math.abs(v.ay); } }, feedback: fb('sumAbs', 'Sumaste las componentes; son catetos: usa Pitágoras.') }),
    N('di-ang-q1', 'direccion', 1, { px: [1, 12, 1], py: [1, 12, 1] }, function (v) { return '¿Qué ángulo forma $(' + v.px + ',\\ ' + v.py + ')$ con el eje $+x$?'; },
      function (v) { return ang(v.px, v.py); }, 'En el 1.er cuadrante basta $\\arctan(A_y/A_x)$.', { unit: '°', tol: ANG, mistakes: { inverted: function (v) { return Math.atan(v.px / v.py) * DEG; } }, feedback: fb('inverted', 'Invertiste la división: es $\\arctan(A_y/A_x)$.') }),
    N('di-ang-q2', 'direccion', 2, { qx: [-12, -1, 1], qy: [1, 12, 1] }, function (v) { return '¿Qué ángulo forma $(' + v.qx + ',\\ ' + v.qy + ')$ con $+x$, entre $0^\\circ$ y $360^\\circ$?'; },
      function (v) { return ang(v.qx, v.qy); }, '2.º cuadrante: el arco tangente de la calculadora más $180^\\circ$.', { unit: '°', tol: ANG, mistakes: { raw: function (v) { return Math.atan(v.qy / v.qx) * DEG; } }, feedback: fb('raw', 'Ese es el ángulo de la calculadora; como $A_x < 0$, suma $180^\\circ$.') }),
    N('di-ang-q3', 'direccion', 2, { rx: [-12, -1, 1], ry: [-12, -1, 1] }, function (v) { return 'Da la dirección de $(' + v.rx + ',\\ ' + v.ry + ')$ como ángulo desde $+x$, entre $0^\\circ$ y $360^\\circ$.'; },
      function (v) { return ang(v.rx, v.ry); }, '3.er cuadrante: $\\arctan(A_y/A_x)$ sale positivo, pero el vector apunta abajo a la izquierda: suma $180^\\circ$.', { unit: '°', tol: ANG, mistakes: { raw: function (v) { return Math.atan(v.ry / v.rx) * DEG; } }, feedback: fb('raw', 'Ese ángulo apunta al 1.er cuadrante; el vector está en el 3.º: suma $180^\\circ$.') }),
    N('di-ang-q4', 'direccion', 2, { sx: [1, 12, 1], sy: [-12, -1, 1] }, function (v) { return '¿Qué ángulo, entre $0^\\circ$ y $360^\\circ$, forma $(' + v.sx + ',\\ ' + v.sy + ')$ con $+x$?'; },
      function (v) { return ang(v.sx, v.sy); }, 'La calculadora da un ángulo negativo; súmale $360^\\circ$.', { unit: '°', tol: ANG, mistakes: { raw: function (v) { return Math.atan(v.sy / v.sx) * DEG; } }, feedback: fb('raw', 'El ángulo negativo apunta igual, pero se pide entre $0^\\circ$ y $360^\\circ$: súmale $360^\\circ$.') }),
    N('di-mag-3d', 'direccion', 2, { a: [-9, 9, 1], b: [-9, 9, 1], c: [-9, 9, 1] }, function (v) { return '¿Cuánto mide $\\vec{A} = (' + v.a + ',\\ ' + v.b + ',\\ ' + v.c + ')$?'; },
      function (v) { return Math.hypot(v.a, v.b, v.c); }, 'En 3D: $\\sqrt{A_x^2 + A_y^2 + A_z^2}$.', { where: function (v) { return v.a * v.b * v.c !== 0; } }),
    N('di-ang-z', 'direccion', 3, { a: [1, 9, 1], b: [1, 9, 1], c: [1, 9, 1] }, function (v) { return '¿Qué ángulo forma $\\vec{A} = (' + v.a + ',\\ ' + v.b + ',\\ ' + v.c + ')$ con el eje $+z$?'; },
      function (v) { return Math.acos(v.c / Math.hypot(v.a, v.b, v.c)) * DEG; }, '$\\cos\\gamma = A_z/|\\vec{A}|$.', { unit: '°', tol: ANG }),
    N('di-desde-y', 'direccion', 3, { ux: [1, 12, 1], uy: [1, 12, 1] }, function (v) { return '¿Qué ángulo forma $(' + v.ux + ',\\ ' + v.uy + ')$ con el eje $+y$?'; },
      function (v) { return Math.atan(v.ux / v.uy) * DEG; }, 'Desde el eje $y$, el cateto opuesto es $A_x$: $\\arctan(A_x/A_y)$.', { unit: '°', tol: ANG, where: function (v) { return v.ux !== v.uy; }, mistakes: { fromX: function (v) { return Math.atan(v.uy / v.ux) * DEG; } }, feedback: fb('fromX', 'Ese es el ángulo con el eje $x$; el que se pide es su complemento.') }),
    N('di-rampa', 'direccion', 2, { h: [0.2, 3, 0.2], d: [2, 12, 1] }, function (v) { return 'Una rampa sube $' + v.h + '\\ \\text{m}$ en $' + v.d + '\\ \\text{m}$ horizontales. ¿Qué ángulo tiene?'; },
      function (v) { return Math.atan(v.h / v.d) * DEG; }, '$\\tan\\theta = $ subida / avance.', { unit: '°', tol: ANG }),
    N('di-rapidez', 'direccion', 1, { vx: [1, 20, 1], vy: [1, 20, 1] }, function (v) { return 'Un balón tiene $v_x = ' + v.vx + '$ y $v_y = ' + v.vy + '$ m/s. ¿Cuál es su rapidez?'; },
      function (v) { return Math.hypot(v.vx, v.vy); }, 'La rapidez es la magnitud de la velocidad.', { unit: 'm/s' }),

    /* ---------------- Suma de vectores ---------------- */
    N('su-perp', 'suma', 1, { A: [2, 20, 1], B: [2, 20, 1] }, function (v) { return 'Caminas $' + v.A + '$ m al este y luego $' + v.B + '$ m al norte. ¿A qué distancia en línea recta quedaste del inicio?'; },
      function (v) { return Math.hypot(v.A, v.B); }, 'Los tramos son perpendiculares: Pitágoras.', { unit: 'm', mistakes: { added: function (v) { return v.A + v.B; } }, feedback: fb('added', 'Esa es la distancia recorrida; el desplazamiento es la hipotenusa.') }),
    N('su-general', 'suma', 2, { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 250, 10] }, function (v) { return '$\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$. ¿Cuánto mide $\\vec{A} + \\vec{B}$?'; },
      function (v) { var r = sum2(v.A, v.a, v.B, v.b); return Math.hypot(r[0], r[1]); }, 'Suma por componentes y luego Pitágoras.',
      { where: function (v) { var r = sum2(v.A, v.a, v.B, v.b); return Math.hypot(r[0], r[1]) > 0.5; }, mistakes: { added: function (v) { return v.A + v.B; } }, feedback: fb('added', 'Sumaste las magnitudes; solo vale si apuntan al mismo lado.') }),
    N('su-angulo', 'suma', 3, { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 170, 10] }, function (v) { return 'Con $\\vec{A}$ de $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ de $' + v.B + '$ a $' + v.b + '^\\circ$, ¿qué ángulo con $+x$ tiene $\\vec{A} + \\vec{B}$ (entre $0^\\circ$ y $360^\\circ$)?'; },
      function (v) { var r = sum2(v.A, v.a, v.B, v.b); return ang(r[0], r[1]); }, 'Calcula $R_x$ y $R_y$, y cuida el cuadrante.',
      { unit: '°', tol: ANG, where: function (v) { var r = sum2(v.A, v.a, v.B, v.b); return Math.hypot(r[0], r[1]) > 0.5 && Math.abs(r[0]) > 0.3; } }),
    N('su-rx', 'suma', 2, { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 250, 10] }, function (v) { return 'Si $\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$, ¿cuánto vale $R_x$ de su suma?'; },
      function (v) { return sum2(v.A, v.a, v.B, v.b)[0]; }, '$R_x = A\\cos\\alpha + B\\cos\\beta$.', { tol: { abs: 0.05 } }),
    N('su-ry', 'suma', 2, { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 250, 10] }, function (v) { return 'Con $\\vec{A}$ de $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ de $' + v.B + '$ a $' + v.b + '^\\circ$, ¿cuánto vale la componente $y$ de $\\vec{A} + \\vec{B}$?'; },
      function (v) { return sum2(v.A, v.a, v.B, v.b)[1]; }, '$R_y = A\\sin\\alpha + B\\sin\\beta$.', { tol: { abs: 0.05 } }),
    N('su-comps', 'suma', 2, { x1: [-9, 9, 1], y1: [-9, 9, 1], x2: [-9, 9, 1], y2: [-9, 9, 1] }, function (v) { return '¿Cuánto mide $(' + v.x1 + ',\\ ' + v.y1 + ') + (' + v.x2 + ',\\ ' + v.y2 + ')$?'; },
      function (v) { return Math.hypot(v.x1 + v.x2, v.y1 + v.y2); }, 'Suma $x$ con $x$ y $y$ con $y$; luego Pitágoras.', { where: function (v) { return Math.hypot(v.x1 + v.x2, v.y1 + v.y2) > 0.5; } }),
    N('su-tres', 'suma', 2, { e: [10, 60, 5], n: [10, 60, 5], w: [5, 40, 5] }, function (v) { return 'Un robot avanza $' + v.e + '$ m al este, $' + v.n + '$ m al norte y $' + v.w + '$ m al oeste. ¿A qué distancia del inicio terminó?'; },
      function (v) { return Math.hypot(v.e - v.w, v.n); }, 'Este y oeste se restan; luego Pitágoras con el tramo norte.', { unit: 'm', mistakes: { added: function (v) { return v.e + v.n + v.w; } }, feedback: fb('added', 'Esa es la distancia recorrida, no el desplazamiento.') }),
    N('su-mismo', 'suma', 1, { A: [2, 20, 1], B: [2, 20, 1] }, function (v) { return 'Dos fuerzas de $' + v.A + '$ y $' + v.B + '\\ \\text{N}$ jalan en la misma dirección y sentido. ¿Cuánto mide la fuerza resultante?'; },
      function (v) { return v.A + v.B; }, 'Si apuntan igual, las magnitudes sí se suman.', { unit: 'N' }),
    N('su-opuestas', 'suma', 1, { A: [2, 20, 1], B: [2, 20, 1] }, function (v) { return 'Dos equipos jalan una cuerda en sentidos opuestos con $' + v.A + '$ y $' + v.B + '\\ \\text{N}$. ¿Cuánto mide la fuerza resultante?'; },
      function (v) { return Math.abs(v.A - v.B); }, 'En sentidos opuestos se restan.', { unit: 'N', where: function (v) { return v.A !== v.B; } }),
    N('su-minimo', 'suma', 2, { P: [2, 20, 1], Qm: [2, 20, 1] }, function (v) { return 'Dos vectores miden $' + v.P + '$ y $' + v.Qm + '$. ¿Cuál es la menor magnitud que puede tener su suma?'; },
      function (v) { return Math.abs(v.P - v.Qm); }, 'La mínima es cuando apuntan en sentidos opuestos.', { where: function (v) { return v.P !== v.Qm; } }),
    N('su-fuerzas-perp', 'suma', 1, { F1: [3, 40, 1], F2: [3, 40, 1] }, function (v) { return 'Dos cables jalan un poste con $' + v.F1 + '$ y $' + v.F2 + '\\ \\text{N}$, perpendiculares entre sí. ¿Cuánto mide la fuerza total?'; },
      function (v) { return Math.hypot(v.F1, v.F2); }, 'Perpendiculares: $\\sqrt{F_1^2 + F_2^2}$.', { unit: 'N' }),
    N('su-dron-3d', 'suma', 2, { a: [5, 40, 1], b: [5, 40, 1], hz: [2, 20, 1] }, function (v) { return 'Un dron avanza $' + v.a + '$ m al este, $' + v.b + '$ m al norte y sube $' + v.hz + '$ m. ¿A qué distancia en línea recta quedó del despegue?'; },
      function (v) { return Math.hypot(v.a, v.b, v.hz); }, 'Pitágoras en 3D.', { unit: 'm' }),
    N('su-cosenos', 'suma', 3, { A: [3, 12, 1], B: [3, 12, 1], phi: [20, 160, 10] }, function (v) { return 'Dos vectores de magnitudes $' + v.A + '$ y $' + v.B + '$ forman $' + v.phi + '^\\circ$ entre sí. ¿Cuánto mide su suma?'; },
      function (v) { return Math.sqrt(v.A * v.A + v.B * v.B + 2 * v.A * v.B * Math.cos(v.phi * RAD)); }, 'Pon $\\vec{A}$ en $0^\\circ$ y $\\vec{B}$ en $\\varphi$; por componentes sale $\\sqrt{A^2 + B^2 + 2AB\\cos\\varphi}$.',
      { where: function (v) { return v.phi !== 90; }, mistakes: { minus: function (v) { return Math.sqrt(v.A * v.A + v.B * v.B - 2 * v.A * v.B * Math.cos(v.phi * RAD)); } }, feedback: fb('minus', 'Con el signo menos obtienes $|\\vec{A} - \\vec{B}|$. El ángulo dado es entre los vectores, no el del triángulo.') }),
    N('su-rumbo', 'suma', 2, { d1: [10, 90, 5], d2: [10, 90, 5] }, function (v) { return 'Caminas $' + v.d1 + '$ m al norte y luego $' + v.d2 + '$ m al este. ¿Cuántos grados al este del norte quedaste?'; },
      function (v) { return Math.atan(v.d2 / v.d1) * DEG; }, 'Desde el norte, el cateto opuesto es el tramo al este.', { unit: '°', tol: ANG, where: function (v) { return v.d1 !== v.d2; }, mistakes: { fromEast: function (v) { return Math.atan(v.d1 / v.d2) * DEG; } }, feedback: fb('fromEast', 'Ese ángulo se mide desde el este; aquí se pide desde el norte.') }),
    N('su-equilibrio-x', 'suma', 3, { ax: [-9, 9, 1], ay: [-9, 9, 1], bx: [-9, 9, 1], by: [-9, 9, 1] }, function (v) { return 'Si $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ')$, ¿qué componente $x$ debe tener $\\vec{C}$ para que $\\vec{A} + \\vec{B} + \\vec{C} = \\vec{0}$?'; },
      function (v) { return -(v.ax + v.bx); }, '$C_x = -(A_x + B_x)$: $\\vec{C}$ cancela la suma.', { tol: { abs: 0.01 }, where: function (v) { return v.ax + v.bx !== 0; } }),
    N('su-equilibrio-mag', 'suma', 3, { ax: [-9, 9, 1], ay: [-9, 9, 1], bx: [-9, 9, 1], by: [-9, 9, 1] }, function (v) { return 'Tres fuerzas están en equilibrio: $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ N, $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ')$ N y $\\vec{C}$. ¿Cuánto mide $\\vec{C}$?'; },
      function (v) { return Math.hypot(v.ax + v.bx, v.ay + v.by); }, '$\\vec{C} = -(\\vec{A} + \\vec{B})$: mide lo mismo que $\\vec{A} + \\vec{B}$.', { unit: 'N', where: function (v) { return Math.hypot(v.ax + v.bx, v.ay + v.by) > 0.5; } }),
    N('su-tres-tramos', 'suma', 3, { d1: [2, 10, 1], d2: [2, 10, 1], d3: [2, 10, 1] }, function (v) { return 'Un robot recorre $' + v.d1 + '$ m a $0^\\circ$, luego $' + v.d2 + '$ m a $90^\\circ$ y luego $' + v.d3 + '$ m a $225^\\circ$. ¿A qué distancia terminó de su punto de partida?'; },
      function (v) { return Math.hypot(v.d1 + cx(v.d3, 225), v.d2 + cy(v.d3, 225)); }, 'Suma las tres componentes $x$ y las tres $y$; $\\cos 225^\\circ = \\sin 225^\\circ = -0.707$.', { unit: 'm', where: function (v) { return Math.hypot(v.d1 + cx(v.d3, 225), v.d2 + cy(v.d3, 225)) > 0.5; } }),
    N('su-resultante-ang', 'suma', 3, { F1: [5, 30, 1], F2: [5, 30, 1], phi: [30, 150, 10] }, function (v) { return 'Una fuerza de $' + v.F1 + '\\ \\text{N}$ apunta a $0^\\circ$ y otra de $' + v.F2 + '\\ \\text{N}$ a $' + v.phi + '^\\circ$. ¿Qué ángulo con $+x$ tiene la resultante?'; },
      function (v) { return ang(v.F1 + cx(v.F2, v.phi), cy(v.F2, v.phi)); }, '$\\tan\\theta = R_y/R_x$ con $R_x = F_1 + F_2\\cos\\varphi$ y $R_y = F_2\\sin\\varphi$.', { unit: '°', tol: ANG }),

    N('su-tension', 'suma', 3, { T: [10, 60, 5], th: [20, 60, 10], Fh: [5, 40, 5] }, function (v) { return 'Un cable jala una caja con $' + v.T + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal hacia la derecha, y una persona la jala con $' + v.Fh + '\\ \\text{N}$ horizontales hacia la izquierda. ¿Cuánto vale la suma de las componentes horizontales? (Derecha positiva.)'; },
      function (v) { return v.T * Math.cos(v.th * RAD) - v.Fh; }, 'Solo la componente $T\\cos\\theta$ del cable es horizontal; la otra fuerza va en contra.', { unit: 'N', tol: { abs: 0.1 }, where: function (v) { return Math.abs(v.T * Math.cos(v.th * RAD) - v.Fh) > 1; }, mistakes: { usedT: function (v) { return v.T - v.Fh; } }, feedback: fb('usedT', 'Usaste toda la tensión; solo su componente $T\\cos\\theta$ es horizontal.') }),
    N('su-viento', 'suma', 3, { va: [150, 250, 10], vw: [20, 80, 10] }, function (v) { return 'Un avión vuela a $' + v.va + '\\ \\text{km/h}$ hacia el este respecto al aire, y el viento sopla a $' + v.vw + '\\ \\text{km/h}$ hacia el noreste ($45^\\circ$). ¿Con qué rapidez se mueve respecto al suelo?'; },
      function (v) { return Math.hypot(v.va + cx(v.vw, 45), cy(v.vw, 45)); }, 'Suma las velocidades como vectores: $(v_a + v_w\\cos 45^\\circ,\\ v_w\\sin 45^\\circ)$.', { unit: 'km/h', mistakes: { added: function (v) { return v.va + v.vw; } }, feedback: fb('added', 'El viento no apunta igual que el avión: suma por componentes.') }),
    N('co-elevacion', 'componentes', 2, { A: [5, 40, 1], el: [10, 80, 5] }, function (v) { return 'Un cohete de juguete sale con $' + v.A + '\\ \\text{m/s}$ a $' + v.el + '^\\circ$ sobre el suelo. ¿Cuánto vale su componente vertical?'; },
      function (v) { return v.A * Math.sin(v.el * RAD); }, 'El ángulo se mide desde el suelo: la vertical es el cateto opuesto.', { unit: 'm/s' }),
    N('re-vmedia', 'resta', 2, { x1: [-9, 9, 1], y1: [-9, 9, 1], x2: [-9, 9, 1], y2: [-9, 9, 1], t: [2, 10, 1] }, function (v) { return 'Un robot pasa del punto $(' + v.x1 + ',\\ ' + v.y1 + ')$ m al $(' + v.x2 + ',\\ ' + v.y2 + ')$ m en $' + v.t + '$ s. ¿Cuánto mide su velocidad media?'; },
      function (v) { return Math.hypot(v.x2 - v.x1, v.y2 - v.y1) / v.t; }, '$\\vec{v}_{media} = \\Delta\\vec{r}/\\Delta t$.', { unit: 'm/s', where: function (v) { return Math.hypot(v.x2 - v.x1, v.y2 - v.y1) > 0.5; } }),

    /* ---------------- Resta ---------------- */
    N('re-perp', 'resta', 1, { v1: [2, 20, 1], v2: [2, 20, 1] }, function (v) { return 'Un robot pasa de moverse a $' + v.v1 + '\\ \\text{m/s}$ al este a $' + v.v2 + '\\ \\text{m/s}$ al norte. ¿Cuánto mide su cambio de velocidad?'; },
      function (v) { return Math.hypot(v.v1, v.v2); }, '$\\Delta\\vec{v} = \\vec{v}_2 - \\vec{v}_1 = (-v_1,\\ v_2)$.', { unit: 'm/s', where: function (v) { return v.v1 !== v.v2; }, mistakes: { magDiff: function (v) { return Math.abs(v.v2 - v.v1); } }, feedback: fb('magDiff', 'Restaste rapideces; la dirección también cambió.') }),
    N('re-x', 'resta', 2, { ax: [-9, 9, 1], bx: [-9, 9, 1] }, function (v) { return 'Si $A_x = ' + v.ax + '$ y $B_x = ' + v.bx + '$, ¿cuánto vale la componente $x$ de $\\vec{A} - \\vec{B}$?'; },
      function (v) { return v.ax - v.bx; }, 'Se resta componente por componente.', { tol: { abs: 0.01 }, where: function (v) { return v.ax - v.bx !== 0 && v.bx !== 0; } }),
    N('re-mag', 'resta', 3, { ax: [-9, 9, 1], ay: [-9, 9, 1], bx: [-9, 9, 1], by: [-9, 9, 1] }, function (v) { return '¿Cuánto mide $\\vec{A} - \\vec{B}$ si $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ')$?'; },
      function (v) { return Math.hypot(v.ax - v.bx, v.ay - v.by); }, 'Resta componentes y usa Pitágoras.', { where: function (v) { return Math.hypot(v.ax - v.bx, v.ay - v.by) > 0.5 && Math.abs(Math.hypot(v.ax - v.bx, v.ay - v.by) - Math.hypot(v.ax + v.bx, v.ay + v.by)) > 0.5; }, mistakes: { added: function (v) { return Math.hypot(v.ax + v.bx, v.ay + v.by); } }, feedback: fb('added', 'Eso es $|\\vec{A} + \\vec{B}|$: a $\\vec{A}$ hay que sumarle $-\\vec{B}$.') }),
    N('re-opuesto', 'resta', 2, { th: [10, 170, 10] }, function (v) { return '$\\vec{A}$ apunta a $' + v.th + '^\\circ$. ¿Hacia qué ángulo (entre $0^\\circ$ y $360^\\circ$) apunta $-\\vec{A}$?'; },
      function (v) { return v.th + 180; }, 'El opuesto gira $180^\\circ$.', { unit: '°', tol: ANG }),
    N('re-general', 'resta', 2, { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 250, 10] }, function (v) { return 'Si $\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$, ¿cuánto mide $\\vec{A} - \\vec{B}$?'; },
      function (v) { var r = sum2(v.A, v.a, v.B, v.b, -1); return Math.hypot(r[0], r[1]); }, '$\\vec{A} - \\vec{B}$: resta componentes.', { where: function (v) { var r = sum2(v.A, v.a, v.B, v.b, -1); return Math.hypot(r[0], r[1]) > 0.5; } }),
    N('re-giro', 'resta', 3, { vr: [4, 30, 1], phi: [20, 160, 10] }, function (v) { return 'Un auto va a $' + v.vr + '\\ \\text{m/s}$ y da vuelta $' + v.phi + '^\\circ$ sin cambiar su rapidez. ¿Cuánto mide su cambio de velocidad?'; },
      function (v) { return 2 * v.vr * Math.sin(v.phi / 2 * RAD); }, 'Dos vectores de igual tamaño separados $\\varphi$: $|\\Delta\\vec{v}| = 2v\\sin(\\varphi/2)$.', { unit: 'm/s' }),
    N('re-puntos', 'resta', 1, { x1: [-9, 9, 1], y1: [-9, 9, 1], x2: [-9, 9, 1], y2: [-9, 9, 1] }, function (v) { return 'Un robot va del punto $(' + v.x1 + ',\\ ' + v.y1 + ')$ al $(' + v.x2 + ',\\ ' + v.y2 + ')$ (en m). ¿Cuánto mide su desplazamiento?'; },
      function (v) { return Math.hypot(v.x2 - v.x1, v.y2 - v.y1); }, '$\\Delta\\vec{r} = \\vec{r}_2 - \\vec{r}_1$.', { unit: 'm', where: function (v) { return Math.hypot(v.x2 - v.x1, v.y2 - v.y1) > 0.5; } }),
    N('re-doble', 'resta', 3, { ax: [-6, 6, 1], ay: [-6, 6, 1], bx: [-6, 6, 1], by: [-6, 6, 1] }, function (v) { return 'Con $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ')$, ¿cuánto mide $2\\vec{A} - \\vec{B}$?'; },
      function (v) { return Math.hypot(2 * v.ax - v.bx, 2 * v.ay - v.by); }, 'Multiplica cada componente de $\\vec{A}$ por 2 y luego resta.', { where: function (v) { return Math.hypot(2 * v.ax - v.bx, 2 * v.ay - v.by) > 0.5; } }),
    N('re-rebote', 'resta', 2, { vb: [2, 25, 1] }, function (v) { return 'Una pelota choca contra una pared a $' + v.vb + '\\ \\text{m/s}$ y rebota con la misma rapidez en sentido contrario. ¿Cuánto mide su cambio de velocidad?'; },
      function (v) { return 2 * v.vb; }, '$\\Delta v = (-v) - (+v) = -2v$.', { unit: 'm/s' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-vector', 'escalares', 1, '¿Cuál de estas cantidades es un vector?', 'La velocidad', [['La masa'], ['El tiempo'], ['La temperatura']], 'La velocidad tiene magnitud y dirección.'),
    C('k-escalar', 'escalares', 1, '¿Cuál de estas cantidades es un escalar?', 'La rapidez', [['El desplazamiento'], ['La fuerza'], ['La aceleración']], 'La rapidez es solo el tamaño de la velocidad.'),
    C('k-vuelta', 'escalares', 1, 'Das una vuelta completa a una pista y regresas al punto de salida. Tu desplazamiento es…', 'cero', [['la longitud de la pista'], ['el diámetro de la pista'], ['el doble del radio']], 'El desplazamiento compara el final con el inicio.'),
    C('k-mag-neg', 'escalares', 2, '¿Puede la magnitud de un vector ser negativa?', 'No, siempre es mayor o igual que cero', [['Sí, si apunta hacia la izquierda'], ['Sí, si su ángulo pasa de 180°'], ['Solo en 3D']], 'Es una raíz de una suma de cuadrados.'),
    C('k-comp-neg', 'escalares', 2, '¿Puede una componente de un vector ser negativa?', 'Sí: indica que apunta hacia el lado negativo del eje', [['No, las componentes son longitudes'], ['Solo la componente y'], ['Solo si la magnitud es negativa']], 'Las componentes tienen signo; la magnitud no.'),
    C('k-iguales', 'escalares', 2, 'Dos vectores son iguales cuando…', 'tienen la misma magnitud y la misma dirección', [['tienen la misma magnitud'], ['empiezan en el mismo punto'], ['tienen la misma componente x']], 'Un vector no depende de dónde se dibuje.'),
    C('k-trasladar', 'escalares', 2, 'Si trasladas un vector a otro lugar sin girarlo ni estirarlo…', 'sigue siendo el mismo vector', [['cambia su magnitud'], ['cambia su dirección'], ['se vuelve su opuesto']], 'Por eso se puede mover B a la cabeza de A.'),
    C('k-fuerza', 'escalares', 1, 'La fuerza es un vector porque…', 'importa hacia dónde se aplica', [['se mide en newtons'], ['siempre es positiva'], ['depende del tiempo']], 'Empujar hacia arriba o hacia abajo da efectos distintos.'),
    C('k-por-menos-dos', 'escalares', 2, 'Multiplicar un vector por $-2$…', 'duplica su magnitud e invierte su sentido', [['duplica su magnitud y conserva su sentido'], ['reduce su magnitud a la mitad'], ['lo gira $90^\\circ$']], 'El número multiplica la magnitud; el signo invierte el sentido.'),
    C('k-cos', 'componentes', 1, 'Con el ángulo $\\theta$ medido desde $+x$, la componente $A_x$ es…', '$A\\cos\\theta$', [['$A\\sin\\theta$'], ['$A\\tan\\theta$'], ['$A/\\cos\\theta$']], 'El coseno va con el cateto pegado al ángulo.'),
    C('k-desde-y', 'componentes', 3, 'Si el ángulo $\\alpha$ se mide desde el eje $+y$, la componente $A_x$ es…', '$A\\sin\\alpha$', [['$A\\cos\\alpha$'], ['$A\\tan\\alpha$'], ['$-A\\cos\\alpha$']], 'Ahora el cateto pegado al ángulo es el vertical.'),
    C('k-q2', 'componentes', 1, 'Un vector en el 2.º cuadrante tiene…', '$A_x < 0$ y $A_y > 0$', [['$A_x > 0$ y $A_y > 0$'], ['$A_x < 0$ y $A_y < 0$'], ['$A_x > 0$ y $A_y < 0$']], 'Arriba a la izquierda.'),
    C('k-q3', 'componentes', 2, 'Un vector que apunta a $220^\\circ$ tiene…', '$A_x < 0$ y $A_y < 0$', [['$A_x > 0$ y $A_y < 0$'], ['$A_x < 0$ y $A_y > 0$'], ['$A_x > 0$ y $A_y > 0$']], 'Entre $180^\\circ$ y $270^\\circ$: abajo a la izquierda.'),
    C('k-mayor', 'componentes', 2, '¿Puede una componente ser mayor que la magnitud del vector?', 'No, a lo más es igual', [['Sí, si el ángulo es mayor que $45^\\circ$'], ['Sí, en el 3.er cuadrante'], ['Solo en 3D']], 'Es un cateto: nunca supera a la hipotenusa.'),
    C('k-45', 'componentes', 1, 'Un vector a $45^\\circ$ tiene componentes…', 'iguales', [['una el doble de la otra'], ['una cero'], ['de signos opuestos']], '$\\cos 45^\\circ = \\sin 45^\\circ$.'),
    C('k-90', 'componentes', 1, 'Si un vector apunta justo hacia $+y$, ¿qué se cumple?', '$A_x = 0$', [['$A_y = 0$'], ['$A_x = A_y$'], ['$A_x = A$']], 'Apunta en $+y$: no tiene nada en $x$.'),
    C('k-ij', 'componentes', 2, 'En $\\vec{A} = 3\\,\\hat{\\imath} - 4\\,\\hat{\\jmath}$, ¿cuánto vale $A_y$?', '$-4$', [['4'], ['3'], ['5']], 'El número que acompaña a $\\hat{\\jmath}$, con su signo.'),
    C('k-arctan', 'direccion', 3, 'La función $\\arctan$ de la calculadora da ángulos entre…', '$-90^\\circ$ y $90^\\circ$', [['$0^\\circ$ y $360^\\circ$'], ['$0^\\circ$ y $180^\\circ$'], ['$-180^\\circ$ y $180^\\circ$']], 'Por eso no distingue $(3, 4)$ de $(-3, -4)$.'),
    C('k-corregir', 'direccion', 2, 'Si $A_x < 0$, al ángulo que da $\\arctan(A_y/A_x)$ hay que…', 'sumarle $180^\\circ$', [['sumarle $90^\\circ$'], ['cambiarle el signo'], ['dejarlo igual']], 'El vector está del lado izquierdo; la calculadora lo pone del derecho.'),
    C('k-dibujar', 'direccion', 2, 'Antes de dar el ángulo de un vector conviene…', 'dibujarlo para ver en qué cuadrante está', [['redondear las componentes'], ['cambiar la calculadora a radianes'], ['dividir entre la magnitud']], 'El dibujo evita el error del cuadrante.'),
    C('k-mismo-arctan', 'direccion', 3, '$(3, 4)$ y $(-3, -4)$ dan el mismo $\\arctan(A_y/A_x)$. ¿Qué ángulos tienen en realidad?', '$53.1^\\circ$ y $233.1^\\circ$', [['Los dos $53.1^\\circ$'], ['$53.1^\\circ$ y $-53.1^\\circ$'], ['$53.1^\\circ$ y $126.9^\\circ$']], 'Son opuestos: difieren $180^\\circ$.'),
    C('k-equivalente', 'direccion', 2, 'Un ángulo de $-30^\\circ$ apunta igual que…', '$330^\\circ$', [['$30^\\circ$'], ['$150^\\circ$'], ['$210^\\circ$']], 'Súmale $360^\\circ$.'),
    C('k-pitagoras', 'direccion', 1, 'La magnitud de $\\vec{A}$ en el plano es…', '$\\sqrt{A_x^2 + A_y^2}$', [['$A_x + A_y$'], ['$\\sqrt{A_x + A_y}$'], ['$A_x^2 + A_y^2$']], 'Pitágoras con los catetos $A_x$ y $A_y$.'),
    C('k-radianes', 'direccion', 1, 'Tu calculadora dice que $\\cos 60^\\circ = -0.952$. ¿Qué pasó?', 'Está en radianes', [['Así es el coseno de $60^\\circ$'], ['El ángulo está en el 2.º cuadrante'], ['Faltó multiplicar por la magnitud']], '$\\cos 60^\\circ = 0.5$; $\\cos(60\\ \\text{rad}) = -0.952$.'),
    C('k-cabeza-cola', 'suma', 1, 'En el método gráfico, para sumar $\\vec{A} + \\vec{B}$, el vector $\\vec{B}$ se coloca…', 'con su cola en la cabeza de $\\vec{A}$', [['con su cabeza en la cola de $\\vec{A}$'], ['perpendicular a $\\vec{A}$'], ['en el origen, encima de $\\vec{A}$']], 'La resultante va de la cola de $\\vec{A}$ a la cabeza de $\\vec{B}$.'),
    C('k-conmutativa', 'suma', 2, '$\\vec{A} + \\vec{B}$ comparado con $\\vec{B} + \\vec{A}$…', 'son iguales', [['son opuestos'], ['tienen la misma magnitud pero distinta dirección'], ['depende de los ángulos']], 'Sumar componentes no depende del orden.'),
    C('k-maximo', 'suma', 1, '¿Cuándo es máxima $|\\vec{A} + \\vec{B}|$ para magnitudes fijas?', 'Cuando apuntan en la misma dirección', [['Cuando son perpendiculares'], ['Cuando son opuestos'], ['Siempre vale lo mismo']], 'Entonces la suma vale $A + B$.'),
    C('k-minimo', 'suma', 2, '¿Cuándo es mínima $|\\vec{A} + \\vec{B}|$ para magnitudes fijas?', 'Cuando apuntan en sentidos opuestos', [['Cuando son perpendiculares'], ['Cuando apuntan igual'], ['Cuando forman $45^\\circ$']], 'Entonces vale $|A - B|$.'),
    C('k-rango', 'suma', 3, 'Si $|\\vec{A}| = 3$ y $|\\vec{B}| = 4$, ¿cuál de estos valores no puede ser $|\\vec{A} + \\vec{B}|$?', '8', [['1'], ['5'], ['7']], 'Siempre $|A - B| \\le |\\vec{A} + \\vec{B}| \\le A + B$, o sea entre 1 y 7.'),
    C('k-perpendiculares', 'suma', 1, 'Si $\\vec{A}$ y $\\vec{B}$ son perpendiculares, $|\\vec{A} + \\vec{B}|$ vale…', '$\\sqrt{A^2 + B^2}$', [['$A + B$'], ['$|A - B|$'], ['$AB$']], 'Forman los catetos de un triángulo rectángulo.'),
    C('k-rx', 'suma', 1, 'La componente $x$ de $\\vec{A} + \\vec{B}$ es…', '$A_x + B_x$', [['$\\sqrt{A_x^2 + B_x^2}$'], ['$A_x B_x$'], ['$A + B$']], 'Las componentes se suman como números.'),
    C('k-suma-cero', 'suma', 2, 'Si $\\vec{A} + \\vec{B} = \\vec{0}$, entonces…', '$\\vec{B}$ tiene la misma magnitud que $\\vec{A}$ y sentido opuesto', [['los dos son cero'], ['son perpendiculares'], ['$\\vec{B} = \\vec{A}$']], '$\\vec{B} = -\\vec{A}$.'),
    C('k-tres-120', 'suma', 3, 'Tres fuerzas de la misma magnitud separadas $120^\\circ$ entre sí suman…', 'cero', [['el triple de una de ellas'], ['lo mismo que una de ellas'], ['el doble de una de ellas']], 'Cabeza con cola forman un triángulo equilátero cerrado.'),
    C('k-menos-b', 'resta', 1, 'El vector $-\\vec{B}$…', 'tiene la misma magnitud que $\\vec{B}$ y sentido opuesto', [['tiene magnitud negativa'], ['es perpendicular a $\\vec{B}$'], ['es el vector cero']], 'Es $\\vec{B}$ girado $180^\\circ$.'),
    C('k-resta-grafica', 'resta', 2, 'Gráficamente, $\\vec{A} - \\vec{B}$ se obtiene…', 'sumando $\\vec{A}$ con $-\\vec{B}$ (cabeza con cola)', [['restando las longitudes de las flechas'], ['uniendo las colas de $\\vec{A}$ y $\\vec{B}$ y quedándose con la más larga'], ['girando $\\vec{A}$ $180^\\circ$']], 'Restar es sumar el opuesto.'),
    C('k-no-conmutativa', 'resta', 2, '$\\vec{A} - \\vec{B}$ comparado con $\\vec{B} - \\vec{A}$…', 'son opuestos', [['son iguales'], ['son perpendiculares'], ['no tienen relación']], '$\\vec{B} - \\vec{A} = -(\\vec{A} - \\vec{B})$.'),
    C('k-dv', 'resta', 2, 'Si un objeto conserva su rapidez pero cambia de dirección, su cambio de velocidad $\\Delta\\vec{v}$…', 'no es cero', [['es cero'], ['es igual a su rapidez'], ['apunta igual que su velocidad']], 'La velocidad es un vector: si cambia la dirección, cambia la velocidad.'),
    C('k-desplazamiento', 'resta', 2, 'Un objeto pasa de la posición $\\vec{r}_1$ a la posición $\\vec{r}_2$. Su desplazamiento es…', '$\\vec{r}_2 - \\vec{r}_1$', [['$\\vec{r}_1 - \\vec{r}_2$'], ['$\\vec{r}_1 + \\vec{r}_2$'], ['$|\\vec{r}_2| - |\\vec{r}_1|$']], 'Final menos inicial.'),
    C('k-resta-x', 'resta', 2, 'La componente $x$ de $\\vec{A} - \\vec{B}$ es…', '$A_x - B_x$', [['$A_x + B_x$'], ['$B_x - A_x$'], ['$|A_x - B_x|$']], 'Se resta componente por componente, con signo.'),
    C('k-rebote', 'resta', 3, 'Una pelota llega a una pared a $10$ m/s y rebota a $10$ m/s en sentido contrario. ¿Cuánto mide su cambio de velocidad?', '$20$ m/s', [['0'], ['$10$ m/s'], ['$14.1$ m/s']], 'De $+10$ a $-10$: el cambio es $-20$ m/s.')
  ];

  K.register({
    'f1.S02.escalares': 'Escalares y vectores',
    'f1.S02.componentes': 'Componentes de un vector',
    'f1.S02.direccion': 'Magnitud y dirección',
    'f1.S02.suma': 'Suma de vectores',
    'f1.S02.resta': 'Resta y cambio de velocidad'
  }, Q);
})();
