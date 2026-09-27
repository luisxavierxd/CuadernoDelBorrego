/* =====================================================================
   Problemas de examen · Física 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error. g = 9.81 m/s².
   Bloque A (S01–S03): 6 problemas. Bloque B (S04–S07): 7 problemas.
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

  /* ======================= Bloques A y B (lote 1 de F4) ======================= */
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function cx(m, a) { return m * Math.cos(a * RAD); }
  function cy(m, a) { return m * Math.sin(a * RAD); }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function v3(a) { return '(' + a.join(',\\ ') + ')'; }
  var ABS = { abs: 0.1 }, ANG = { abs: 0.5 };
  // Tiro vertical desde una azotea: tiempo a la cima, altura sobre el suelo y caída.
  function azotea(v) { var tu = v.v0 / g, H = v.h0 + v.v0 * v.v0 / (2 * g), tf = Math.sqrt(2 * H / g); return { tu: tu, H: H, tf: tf }; }

  ex.f1 = ex.f1.concat([
    /* ---------------- Bloque A · Herramientas ---------------- */
    {
      id: 'f1-ex-dron', tags: ['f1.S02'], block: 'A', title: 'El dron de reparto',
      vars: { d1: [20, 80, 5], a1: [10, 70, 10], d2: [20, 80, 5], a2: [100, 170, 10] },
      where: function (v) { var x = cx(v.d1, v.a1) + cx(v.d2, v.a2), y = cy(v.d1, v.a1) + cy(v.d2, v.a2); return Math.abs(x) >= 5 && Math.abs(y) >= 5 && Math.abs(x) >= 0.35 * Math.hypot(x, y); },
      statement: function (v) { return '<p>Un dron vuela $' + v.d1 + '$ m en la dirección $' + v.a1 + '^\\circ$ (medida desde el este, antihorario) y luego $' + v.d2 + '$ m en la dirección $' + v.a2 + '^\\circ$. Toma el este como $+x$ y el norte como $+y$.</p>'; },
      diagram: { id: 'exam-dron', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm', tol: ABS,
          prompt: function () { return '¿Cuánto vale la componente $x$ de su desplazamiento total?'; },
          answer: function (v) { return cx(v.d1, v.a1) + cx(v.d2, v.a2); },
          solution: function (v) { return '$R_x = ' + v.d1 + '\\cos ' + v.a1 + '^\\circ + ' + v.d2 + '\\cos ' + v.a2 + '^\\circ = ' + fx(cx(v.d1, v.a1) + cx(v.d2, v.a2)) + '$ m.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'm', tol: ABS,
          prompt: function () { return '¿Cuánto vale la componente $y$?'; },
          answer: function (v) { return cy(v.d1, v.a1) + cy(v.d2, v.a2); },
          solution: function (v) { return '$R_y = ' + v.d1 + '\\sin ' + v.a1 + '^\\circ + ' + v.d2 + '\\sin ' + v.a2 + '^\\circ = ' + fx(cy(v.d1, v.a1) + cy(v.d2, v.a2)) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tus componentes de a) y b), ¿a qué distancia quedó del punto de partida?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var x = cx(v.d1, v.a1) + cx(v.d2, v.a2), y = cy(v.d1, v.a1) + cy(v.d2, v.a2); return '$R = \\sqrt{R_x^2 + R_y^2} = ' + fx(Math.hypot(x, y)) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'Con tus componentes, ¿en qué dirección quedó (ángulo desde el este, entre $0^\\circ$ y $360^\\circ$)?'; },
          answer: function (v, prev) { return n360(Math.atan2(prev[1], prev[0]) * DEG); },
          solution: function (v) { var x = cx(v.d1, v.a1) + cx(v.d2, v.a2), y = cy(v.d1, v.a1) + cy(v.d2, v.a2); return '$\\arctan(R_y/R_x)$ corrigiendo el cuadrante con los signos de $R_x$ y $R_y$: $\\theta = ' + fx(n360(Math.atan2(y, x) * DEG), 1) + '^\\circ$.'; } }
      ]
    },
    {
      id: 'f1-ex-anillo', tags: ['f1.S02'], block: 'A', title: 'Tres fuerzas sobre un anillo',
      vars: { F1: [10, 50, 5], F2: [10, 50, 5], a2: [60, 150, 10], F3: [10, 50, 5], a3: [190, 300, 10] },
      where: function (v) { var x = v.F1 + cx(v.F2, v.a2) + cx(v.F3, v.a3), y = cy(v.F2, v.a2) + cy(v.F3, v.a3); return Math.abs(x) >= 5 && Math.abs(y) >= 5 && Math.abs(x) >= 0.35 * Math.hypot(x, y); },
      statement: function (v) { return '<p>Tres cuerdas jalan un anillo: $F_1 = ' + v.F1 + '$ N a $0^\\circ$, $F_2 = ' + v.F2 + '$ N a $' + v.a2 + '^\\circ$ y $F_3 = ' + v.F3 + '$ N a $' + v.a3 + '^\\circ$ (ángulos desde $+x$, antihorario).</p>'; },
      diagram: { id: 'exam-fuerzas', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N', tol: ABS,
          prompt: function () { return '¿Cuánto vale la suma de las componentes $x$?'; },
          answer: function (v) { return v.F1 + cx(v.F2, v.a2) + cx(v.F3, v.a3); },
          solution: function (v) { return '$\\Sigma F_x = ' + v.F1 + ' + ' + v.F2 + '\\cos ' + v.a2 + '^\\circ + ' + v.F3 + '\\cos ' + v.a3 + '^\\circ = ' + fx(v.F1 + cx(v.F2, v.a2) + cx(v.F3, v.a3)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N', tol: ABS,
          prompt: function () { return '¿Cuánto vale la suma de las componentes $y$?'; },
          answer: function (v) { return cy(v.F2, v.a2) + cy(v.F3, v.a3); },
          solution: function (v) { return '$\\Sigma F_y = ' + v.F2 + '\\sin ' + v.a2 + '^\\circ + ' + v.F3 + '\\sin ' + v.a3 + '^\\circ = ' + fx(cy(v.F2, v.a2) + cy(v.F3, v.a3)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tus sumas de a) y b), ¿cuánto mide la fuerza resultante?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var x = v.F1 + cx(v.F2, v.a2) + cx(v.F3, v.a3), y = cy(v.F2, v.a2) + cy(v.F3, v.a3); return '$R = \\sqrt{(\\Sigma F_x)^2 + (\\Sigma F_y)^2} = ' + fx(Math.hypot(x, y)) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'Una cuarta cuerda debe dejar el anillo en equilibrio. Con tus sumas, ¿hacia qué ángulo (entre $0^\\circ$ y $360^\\circ$) debe jalar?'; },
          answer: function (v, prev) { return n360(Math.atan2(prev[1], prev[0]) * DEG + 180); },
          solution: function (v) { var x = v.F1 + cx(v.F2, v.a2) + cx(v.F3, v.a3), y = cy(v.F2, v.a2) + cy(v.F3, v.a3); return 'Debe ser opuesta a la resultante: la dirección de $\\vec{R}$ más $180^\\circ$, es decir $' + fx(n360(Math.atan2(y, x) * DEG + 180), 1) + '^\\circ$.'; } }
      ]
    },
    {
      id: 'f1-ex-trabajo-vec', tags: ['f1.S03'], block: 'A', title: 'Trabajo con vectores',
      vars: { fx: [-9, 9, 1], fy: [-9, 9, 1], fz: [-9, 9, 1], dx: [1, 9, 1], dy: [-9, 9, 1], dz: [-9, 9, 1] },
      where: function (v) {
        var d = v.fx * v.dx + v.fy * v.dy + v.fz * v.dz, mf = Math.hypot(v.fx, v.fy, v.fz), md = Math.hypot(v.dx, v.dy, v.dz);
        return v.fx * v.fy * v.fz * v.dy * v.dz !== 0 && Math.abs(d / (mf * md)) >= 0.25 && Math.abs(d / (mf * md)) < 0.9;
      },
      statement: function (v) { return '<p>Un robot empuja una caja con $\\vec{F} = ' + v3([v.fx, v.fy, v.fz]) + '$ N mientras la caja se desplaza $\\vec{d} = ' + v3([v.dx, v.dy, v.dz]) + '$ m.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'J', tol: { abs: 0.01 },
          prompt: function () { return '¿Cuánto trabajo hace la fuerza, $W = \\vec{F}\\cdot\\vec{d}$?'; },
          answer: function (v) { return v.fx * v.dx + v.fy * v.dy + v.fz * v.dz; },
          solution: function (v) { return '$W = (' + v.fx + ')(' + v.dx + ') + (' + v.fy + ')(' + v.dy + ') + (' + v.fz + ')(' + v.dz + ') = ' + (v.fx * v.dx + v.fy * v.dy + v.fz * v.dz) + '$ J.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto mide la fuerza?'; },
          answer: function (v) { return Math.hypot(v.fx, v.fy, v.fz); },
          solution: function (v) { return '$|\\vec{F}| = \\sqrt{' + v.fx + '^2 + ' + v.fy + '^2 + ' + v.fz + '^2} = ' + fx(Math.hypot(v.fx, v.fy, v.fz), 3) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿Cuánto mide el desplazamiento?'; },
          answer: function (v) { return Math.hypot(v.dx, v.dy, v.dz); },
          solution: function (v) { return '$|\\vec{d}| = \\sqrt{' + v.dx + '^2 + ' + v.dy + '^2 + ' + v.dz + '^2} = ' + fx(Math.hypot(v.dx, v.dy, v.dz), 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'Con tus resultados de a), b) y c), ¿qué ángulo forman la fuerza y el desplazamiento?'; },
          answer: function (v, prev) { return Math.acos(Math.max(-1, Math.min(1, prev[0] / (prev[1] * prev[2])))) * DEG; },
          solution: function (v) {
            var d = v.fx * v.dx + v.fy * v.dy + v.fz * v.dz, mf = Math.hypot(v.fx, v.fy, v.fz), md = Math.hypot(v.dx, v.dy, v.dz);
            return '$\\cos\\theta = \\frac{W}{Fd} = \\frac{' + d + '}{(' + fx(mf, 3) + ')(' + fx(md, 3) + ')}$, así que $\\theta = ' + fx(Math.acos(d / (mf * md)) * DEG, 1) + '^\\circ$.';
          } }
      ]
    },
    {
      id: 'f1-ex-llave', tags: ['f1.S03'], block: 'A', title: 'Torque sobre un tornillo',
      vars: { x: [-6, 6, 1], y: [-6, 6, 1], fx: [-9, 9, 1], fy: [-9, 9, 1] },
      where: function (v) { return v.x * v.y * v.fx * v.fy !== 0 && Math.abs(v.x * v.fy - v.y * v.fx) >= 3; },
      statement: function (v) { return '<p>Sobre una placa que gira alrededor del origen se aplica $\\vec{F} = ' + v3([v.fx, v.fy, 0]) + '$ N en el punto $\\vec{r} = ' + v3([v.x, v.y, 0]) + '$ cm. Trabaja en N·cm.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N·cm', tol: { abs: 0.01 },
          prompt: function () { return '¿Cuánto vale la componente $z$ del torque $\\vec{\\tau} = \\vec{r}\\times\\vec{F}$?'; },
          answer: function (v) { return v.x * v.fy - v.y * v.fx; },
          solution: function (v) { return '$\\tau_z = xF_y - yF_x = (' + v.x + ')(' + v.fy + ') - (' + v.y + ')(' + v.fx + ') = ' + (v.x * v.fy - v.y * v.fx) + '$ N·cm.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'cm',
          prompt: function () { return '¿A qué distancia del eje se aplica la fuerza?'; },
          answer: function (v) { return Math.hypot(v.x, v.y); },
          solution: function (v) { return '$|\\vec{r}| = \\sqrt{' + v.x + '^2 + ' + v.y + '^2} = ' + fx(Math.hypot(v.x, v.y), 3) + '$ cm.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale la componente de la fuerza perpendicular a $\\vec{r}$?'; },
          answer: function (v, prev) { return Math.abs(prev[0]) / prev[1]; },
          solution: function (v) { var t = v.x * v.fy - v.y * v.fx, r = Math.hypot(v.x, v.y); return '$|\\tau| = rF_\\perp$, así que $F_\\perp = ' + Math.abs(t) + '/' + fx(r, 3) + ' = ' + fx(Math.abs(t) / r, 3) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'N·cm',
          prompt: function () { return 'Con tu $|\\vec{r}|$ de b), ¿cuánto torque haría la misma fuerza (misma magnitud) si se aplicara perpendicular a $\\vec{r}$?'; },
          answer: function (v, prev) { return prev[1] * Math.hypot(v.fx, v.fy); },
          solution: function (v) { var r = Math.hypot(v.x, v.y), F = Math.hypot(v.fx, v.fy); return 'Máximo torque: $rF = (' + fx(r, 3) + ')(' + fx(F, 3) + ') = ' + fx(r * F, 3) + '$ N·cm.'; } }
      ]
    },
    {
      id: 'f1-ex-viaje', tags: ['f1.S01', 'f1.S02'], block: 'A', title: 'Un viaje en línea recta',
      vars: { vk: [36, 108, 6], tm: [2, 15, 1], th: [10, 80, 5] },
      statement: function (v) { return '<p>Un robot de exploración avanza a $' + v.vk + '$ km/h constantes durante $' + v.tm + '$ minutos, en línea recta a $' + v.th + '^\\circ$ al norte del este.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return '¿Cuál es su rapidez en m/s?'; },
          answer: function (v) { return v.vk / 3.6; },
          solution: function (v) { return '$' + v.vk + '\\ \\text{km/h} \\div 3.6 = ' + fx(v.vk / 3.6, 3) + '$ m/s.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu rapidez de a), ¿cuántos metros recorre?'; },
          answer: function (v, prev) { return prev[0] * v.tm * 60; },
          solution: function (v) { return '$d = vt = (' + fx(v.vk / 3.6, 3) + ')(' + (v.tm * 60) + '\\ \\text{s}) = ' + fx(v.vk / 3.6 * v.tm * 60, 1) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu distancia de b), ¿cuántos metros avanzó hacia el este?'; },
          answer: function (v, prev) { return prev[1] * Math.cos(v.th * RAD); },
          solution: function (v) { var d = v.vk / 3.6 * v.tm * 60; return '$d\\cos\\theta = ' + fx(d, 1) + '\\cos ' + v.th + '^\\circ = ' + fx(d * Math.cos(v.th * RAD), 1) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu distancia de b), ¿cuántos metros avanzó hacia el norte?'; },
          answer: function (v, prev) { return prev[1] * Math.sin(v.th * RAD); },
          solution: function (v) { var d = v.vk / 3.6 * v.tm * 60; return '$d\\sin\\theta = ' + fx(d, 1) + '\\sin ' + v.th + '^\\circ = ' + fx(d * Math.sin(v.th * RAD), 1) + '$ m.'; } }
      ]
    },
    {
      id: 'f1-ex-panel', tags: ['f1.S03'], block: 'A', title: 'La normal de un panel solar',
      vars: { a1: [-5, 5, 1], a2: [-5, 5, 1], a3: [-5, 5, 1], b1: [-5, 5, 1], b2: [-5, 5, 1], b3: [-5, 5, 1] },
      where: function (v) { var c = cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3]); return v.a1 * v.a2 * v.a3 * v.b1 * v.b2 * v.b3 !== 0 && Math.abs(c[0]) >= 0.35 * Math.hypot(c[0], c[1], c[2]) && c[1] !== 0 && Math.abs(c[2]) >= 2; },
      statement: function (v) { return '<p>Dos bordes de un panel solar son $\\vec{A} = ' + v3([v.a1, v.a2, v.a3]) + '$ m y $\\vec{B} = ' + v3([v.b1, v.b2, v.b3]) + '$ m. El vector $\\vec{A}\\times\\vec{B}$ es perpendicular al panel.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm²', tol: { abs: 0.01 },
          prompt: function () { return '¿Cuánto vale la componente $x$ de $\\vec{A}\\times\\vec{B}$?'; },
          answer: function (v) { return cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[0]; },
          solution: function (v) { return '$A_yB_z - A_zB_y = (' + v.a2 + ')(' + v.b3 + ') - (' + v.a3 + ')(' + v.b2 + ') = ' + cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[0] + '$.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'm²', tol: { abs: 0.01 },
          prompt: function () { return '¿Y la componente $y$? (Cuida el signo del determinante.)'; },
          answer: function (v) { return cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[1]; },
          solution: function (v) { return '$-(A_xB_z - A_zB_x) = -[(' + v.a1 + ')(' + v.b3 + ') - (' + v.a3 + ')(' + v.b1 + ')] = ' + cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[1] + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm²', tol: { abs: 0.01 },
          prompt: function () { return '¿Y la componente $z$?'; },
          answer: function (v) { return cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[2]; },
          solution: function (v) { return '$A_xB_y - A_yB_x = (' + v.a1 + ')(' + v.b2 + ') - (' + v.a2 + ')(' + v.b1 + ') = ' + cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3])[2] + '$.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm²',
          prompt: function () { return 'Con tus componentes, ¿cuál es el área del panel (un paralelogramo)?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1], prev[2]); },
          solution: function (v) { var c = cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3]); return '$|\\vec{A}\\times\\vec{B}| = \\sqrt{' + c[0] + '^2 + ' + c[1] + '^2 + ' + c[2] + '^2} = ' + fx(Math.hypot(c[0], c[1], c[2]), 3) + '$ m².'; } },
        { label: 'e', type: 'numeric', points: 2, tol: { abs: 0.005 },
          prompt: function () { return 'Con tus resultados de c) y d), ¿cuánto vale la componente $z$ del vector unitario perpendicular al panel?'; },
          answer: function (v, prev) { return prev[2] / prev[3]; },
          solution: function (v) { var c = cross([v.a1, v.a2, v.a3], [v.b1, v.b2, v.b3]), m = Math.hypot(c[0], c[1], c[2]); return '$\\hat{n}_z = ' + c[2] + '/' + fx(m, 3) + ' = ' + fx(c[2] / m, 4) + '$.'; } }
      ]
    },

    /* ---------------- Bloque B · Cinemática ---------------- */
    {
      id: 'f1-ex-rampa', tags: ['f1.S04'], block: 'B', title: 'La pelota en la rampa',
      vars: { x0: [0, 10, 1], b: [4, 16, 2], c: [0.5, 2, 0.5], T: [3, 20, 1] },
      where: function (v) { return v.T > v.b / (2 * v.c) + 0.5 && v.T < v.b / v.c; },
      statement: function (v) { return '<p>Una pelota rueda cuesta arriba por una rampa larga con $x(t) = ' + v.x0 + ' + ' + v.b + 't - ' + v.c + 't^2$ (m y s), hasta que se regresa.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return '¿En qué instante se detiene para regresar?'; },
          answer: function (v) { return v.b / (2 * v.c); },
          solution: function (v) { return '$v = ' + v.b + ' - ' + (2 * v.c) + 't = 0$, así que $t = ' + fx(v.b / (2 * v.c), 3) + '$ s.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu instante de a), ¿cuál es la posición más alta que alcanza?'; },
          answer: function (v, prev) { return v.x0 + v.b * prev[0] - v.c * prev[0] * prev[0]; },
          solution: function (v) { var t = v.b / (2 * v.c); return '$x(' + fx(t, 3) + ') = ' + fx(v.x0 + v.b * t - v.c * t * t, 3) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function (v) { return '¿Dónde está en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return v.x0 + v.b * v.T - v.c * v.T * v.T; },
          solution: function (v) { return '$x(' + v.T + ') = ' + v.x0 + ' + ' + v.b + '(' + v.T + ') - ' + v.c + '(' + v.T + ')^2 = ' + fx(v.x0 + v.b * v.T - v.c * v.T * v.T, 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm',
          prompt: function (v) { return 'Con tus resultados de b) y c), ¿qué distancia recorre entre $t = 0$ y $t = ' + v.T + '$ s?'; },
          answer: function (v, prev) { return (prev[1] - v.x0) + (prev[1] - prev[2]); },
          solution: function (v) { var t = v.b / (2 * v.c), xm = v.x0 + v.b * t - v.c * t * t, xT = v.x0 + v.b * v.T - v.c * v.T * v.T; return 'Sube $' + fx(xm - v.x0, 3) + '$ m y baja $' + fx(xm - xT, 3) + '$ m: $d = ' + fx(2 * xm - v.x0 - xT, 3) + '$ m.'; } }
      ]
    },
    {
      id: 'f1-ex-frenado', tags: ['f1.S01', 'f1.S05'], block: 'B', title: '¿Alcanza a frenar?',
      vars: { vk: [36, 126, 6], tr: [0.5, 1.5, 0.1], a: [4, 9, 0.5], D: [30, 150, 5] },
      where: function (v) { var s = v.vk / 3.6; return Math.abs(v.D - (s * v.tr + s * s / (2 * v.a))) > 1; },
      statement: function (v) { return '<p>Una conductora va a $' + v.vk + '$ km/h y ve un obstáculo a $' + v.D + '$ m. Tarda $' + v.tr + '$ s en reaccionar y luego frena con una desaceleración constante de $' + v.a + '$ m/s².</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return '¿A cuántos m/s iba?'; },
          answer: function (v) { return v.vk / 3.6; },
          solution: function (v) { return '$' + v.vk + ' \\div 3.6 = ' + fx(v.vk / 3.6, 3) + '$ m/s.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu rapidez de a), ¿cuánto avanza mientras reacciona?'; },
          answer: function (v, prev) { return prev[0] * v.tr; },
          solution: function (v) { return 'A velocidad constante: $(' + fx(v.vk / 3.6, 3) + ')(' + v.tr + ') = ' + fx(v.vk / 3.6 * v.tr, 3) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu rapidez de a), ¿qué distancia necesita para frenar?'; },
          answer: function (v, prev) { return prev[0] * prev[0] / (2 * v.a); },
          solution: function (v) { var s = v.vk / 3.6; return '$v_0^2/2a = ' + fx(s, 3) + '^2/(2\\cdot ' + v.a + ') = ' + fx(s * s / (2 * v.a), 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tus resultados de b) y c), ¿qué distancia total recorre hasta detenerse?'; },
          answer: function (v, prev) { return prev[1] + prev[2]; },
          solution: function (v) { var s = v.vk / 3.6; return '$' + fx(s * v.tr, 3) + ' + ' + fx(s * s / (2 * v.a), 3) + ' = ' + fx(s * v.tr + s * s / (2 * v.a), 3) + '$ m.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'm', tol: ABS,
          prompt: function () { return 'Con tu distancia total de d), ¿cuántos metros le sobran antes del obstáculo? (Negativo si choca.)'; },
          answer: function (v, prev) { return v.D - prev[3]; },
          solution: function (v) { var s = v.vk / 3.6, m = v.D - (s * v.tr + s * s / (2 * v.a)); return '$' + v.D + ' - ' + fx(s * v.tr + s * s / (2 * v.a), 3) + ' = ' + fx(m, 2) + '$ m: ' + (m > 0 ? 'alcanza a frenar.' : 'choca.'); } }
      ]
    },
    {
      id: 'f1-ex-azotea', tags: ['f1.S05'], block: 'B', title: 'La pelota desde la azotea',
      vars: { v0: [5, 20, 1], h0: [10, 50, 5] },
      statement: function (v) { return '<p>Desde una azotea de $' + v.h0 + '$ m lanzas una pelota verticalmente hacia arriba a $' + v.v0 + '$ m/s. Sin aire, $g = 9.81$ m/s².</p>'; },
      diagram: { id: 'exam-azotea', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return '¿Cuánto tarda en llegar a lo más alto?'; },
          answer: function (v) { return v.v0 / g; },
          solution: function (v) { return '$t_{sub} = v_0/g = ' + v.v0 + '/9.81 = ' + fx(azotea(v).tu, 3) + '$ s.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu tiempo de a), ¿a qué altura sobre el suelo llega?'; },
          answer: function (v, prev) { return v.h0 + v.v0 * prev[0] - g * prev[0] * prev[0] / 2; },
          solution: function (v) { return '$y = h_0 + v_0t - \\tfrac{1}{2}gt^2 = ' + fx(azotea(v).H, 3) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return 'Con tu altura de b), ¿cuánto tarda en caer desde lo más alto hasta el suelo?'; },
          answer: function (v, prev) { return Math.sqrt(2 * prev[1] / g); },
          solution: function (v) { return 'Desde el reposo: $t = \\sqrt{2H/g} = ' + fx(azotea(v).tf, 3) + '$ s.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return 'Con tus tiempos de a) y c), ¿cuánto tiempo pasa en el aire en total?'; },
          answer: function (v, prev) { return prev[0] + prev[2]; },
          solution: function (v) { var z = azotea(v); return '$' + fx(z.tu, 3) + ' + ' + fx(z.tf, 3) + ' = ' + fx(z.tu + z.tf, 3) + '$ s.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu tiempo de c), ¿con qué rapidez llega al suelo?'; },
          answer: function (v, prev) { return g * prev[2]; },
          solution: function (v) { return '$v = g\\,t = 9.81(' + fx(azotea(v).tf, 3) + ') = ' + fx(g * azotea(v).tf, 3) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-rio', tags: ['f1.S07'], block: 'B', title: 'Cruzar el río',
      vars: { w: [40, 200, 10], vb: [2, 8, 0.5], vc: [0.5, 4, 0.5] },
      where: function (v) { return v.vb !== v.vc; },
      statement: function (v) { return '<p>Una lancha que va a $' + v.vb + '$ m/s respecto al agua cruza un río de $' + v.w + '$ m apuntando siempre perpendicular a la orilla. La corriente va a $' + v.vc + '$ m/s.</p>'; },
      diagram: { id: 'exam-rio', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return '¿Cuánto tarda en cruzar?'; },
          answer: function (v) { return v.w / v.vb; },
          solution: function (v) { return '$t = w/v_b = ' + v.w + '/' + v.vb + ' = ' + fx(v.w / v.vb, 3) + '$ s.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu tiempo de a), ¿cuántos metros río abajo llega?'; },
          answer: function (v, prev) { return v.vc * prev[0]; },
          solution: function (v) { return '$x = v_c t = (' + v.vc + ')(' + fx(v.w / v.vb, 3) + ') = ' + fx(v.vc * v.w / v.vb, 3) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu resultado de b), ¿cuánto mide su desplazamiento total?'; },
          answer: function (v, prev) { return Math.hypot(v.w, prev[1]); },
          solution: function (v) { var x = v.vc * v.w / v.vb; return '$\\sqrt{' + v.w + '^2 + ' + fx(x, 3) + '^2} = ' + fx(Math.hypot(v.w, x), 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tus resultados de a) y c), ¿qué rapidez tiene respecto a la orilla?'; },
          answer: function (v, prev) { return prev[2] / prev[0]; },
          solution: function (v) { return 'Desplazamiento entre tiempo: $' + fx(Math.hypot(v.vb, v.vc), 3) + '$ m/s, que es $\\sqrt{v_b^2 + v_c^2}$.'; } }
      ]
    },
    {
      id: 'f1-ex-centrifuga', tags: ['f1.S07'], block: 'B', title: 'La centrífuga del laboratorio',
      vars: { rpm: [300, 3000, 100], r: [0.05, 0.2, 0.01] },
      statement: function (v) { return '<p>Una centrífuga gira a $' + v.rpm + '$ rpm y la muestra está a $' + v.r + '$ m del eje.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'rad/s',
          prompt: function () { return '¿Cuánto vale su rapidez angular?'; },
          answer: function (v) { return v.rpm * 2 * Math.PI / 60; },
          solution: function (v) { return '$\\omega = ' + v.rpm + '\\cdot\\frac{2\\pi}{60} = ' + fx(v.rpm * 2 * Math.PI / 60, 3) + '$ rad/s.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu $\\omega$ de a), ¿qué rapidez tiene la muestra?'; },
          answer: function (v, prev) { return prev[0] * v.r; },
          solution: function (v) { var w = v.rpm * 2 * Math.PI / 60; return '$v = \\omega r = ' + fx(w * v.r, 3) + '$ m/s.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu rapidez de b), ¿cuál es su aceleración centrípeta?'; },
          answer: function (v, prev) { return prev[1] * prev[1] / v.r; },
          solution: function (v) { var s = v.rpm * 2 * Math.PI / 60 * v.r; return '$a_c = v^2/r = ' + fx(s * s / v.r, 1) + '$ m/s².'; } },
        { label: 'd', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu aceleración de c), ¿cuántas veces $g$ es?'; },
          answer: function (v, prev) { return prev[2] / g; },
          solution: function (v) { var s = v.rpm * 2 * Math.PI / 60 * v.r; return '$a_c/g = ' + fx(s * s / v.r / g, 1) + '$: la muestra "siente" ese múltiplo de su peso.'; } }
      ]
    }
  ]);
})();
