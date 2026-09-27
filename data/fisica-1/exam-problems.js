/* =====================================================================
   Problemas de examen · Física 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error. g = 9.81 m/s².
   Bloque A (S01–S03): 6 problemas. Bloque B (S04–S07): 7. Bloque C (S08–S11): 6. Bloque D (S12–S13): 6. Bloque E (S14–S15): 6.
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

  /* ======================= Bloque C · Dinámica (lote 2 de F4) ======================= */
  function sn(t) { return Math.sin(t * RAD); }
  function cs(t) { return Math.cos(t * RAD); }

  ex.f1 = ex.f1.concat([
    {
      id: 'f1-ex-jalon', tags: ['f1.S10'], block: 'C', title: 'La caja jalada con ángulo',
      vars: { m: [5, 30, 1], F: [30, 150, 10], th: [15, 45, 5], muk: [0.1, 0.5, 0.05], t: [2, 6, 1] },
      where: function (v) { var N0 = v.m * g - v.F * sn(v.th); return N0 > 10 && (v.F * cs(v.th) - v.muk * N0) / v.m > 0.5; },
      statement: function (v) { return '<p>Jalas una caja de $' + v.m + '$ kg con una cuerda de $' + v.F + '$ N que forma $' + v.th + '^\\circ$ con la horizontal. La caja ya desliza y $\\mu_k = ' + v.muk + '$.</p>'; },
      diagram: { id: 'exam-jalon', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal?'; },
          answer: function (v) { return v.m * g - v.F * sn(v.th); },
          solution: function (v) { return '$N = mg - F\\sin\\theta = ' + fx(v.m * g) + ' - ' + v.F + '\\sin ' + v.th + '^\\circ = ' + fx(v.m * g - v.F * sn(v.th)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu normal de a), ¿cuánto vale la fricción?'; },
          answer: function (v, prev) { return v.muk * prev[0]; },
          solution: function (v) { return '$f_k = \\mu_kN = ' + fx(v.muk * (v.m * g - v.F * sn(v.th))) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu fricción de b), ¿qué aceleración tiene la caja?'; },
          answer: function (v, prev) { return (v.F * cs(v.th) - prev[1]) / v.m; },
          solution: function (v) { var f = v.muk * (v.m * g - v.F * sn(v.th)); return '$a = \\frac{F\\cos\\theta - f_k}{m} = \\frac{' + fx(v.F * cs(v.th)) + ' - ' + fx(f) + '}{' + v.m + '} = ' + fx((v.F * cs(v.th) - f) / v.m, 3) + '$ m/s².'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function (v) { return 'Si partió del reposo, con tu aceleración de c), ¿qué rapidez tiene a los $' + v.t + '$ s?'; },
          answer: function (v, prev) { return prev[2] * v.t; },
          solution: function (v) { var a = (v.F * cs(v.th) - v.muk * (v.m * g - v.F * sn(v.th))) / v.m; return '$v = at = ' + fx(a * v.t, 3) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-atwood', tags: ['f1.S09'], block: 'C', title: 'La máquina de Atwood',
      vars: { m1: [1, 8, 0.5], m2: [1.5, 10, 0.5], h: [0.5, 3, 0.5] },
      where: function (v) { return v.m2 - v.m1 >= 1; },
      statement: function (v) { return '<p>Una máquina de Atwood tiene masas de $' + v.m1 + '$ kg y $' + v.m2 + '$ kg, parte del reposo y la masa de $' + v.m2 + '$ kg baja $' + v.h + '$ m hasta el piso.</p>'; },
      diagram: { id: 'exam-atwood', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return '¿Qué aceleración tienen las masas?'; },
          answer: function (v) { return (v.m2 - v.m1) * g / (v.m1 + v.m2); },
          solution: function (v) { return '$a = \\frac{(m_2 - m_1)g}{m_1 + m_2} = ' + fx((v.m2 - v.m1) * g / (v.m1 + v.m2), 3) + '$ m/s².'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu aceleración de a), ¿cuánto vale la tensión?'; },
          answer: function (v, prev) { return v.m1 * (g + prev[0]); },
          solution: function (v) { var a = (v.m2 - v.m1) * g / (v.m1 + v.m2); return '$T = m_1(g + a) = ' + fx(v.m1 * (g + a)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 's',
          prompt: function () { return 'Con tu aceleración, ¿cuánto tarda la masa pesada en llegar al piso?'; },
          answer: function (v, prev) { return Math.sqrt(2 * v.h / prev[0]); },
          solution: function (v) { var a = (v.m2 - v.m1) * g / (v.m1 + v.m2); return '$t = \\sqrt{2h/a} = ' + fx(Math.sqrt(2 * v.h / a), 3) + '$ s.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tus resultados de a) y c), ¿con qué rapidez llega al piso?'; },
          answer: function (v, prev) { return prev[0] * prev[2]; },
          solution: function (v) { var a = (v.m2 - v.m1) * g / (v.m1 + v.m2); return '$v = at = ' + fx(Math.sqrt(2 * a * v.h), 3) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-plano', tags: ['f1.S11'], block: 'C', title: 'El bloque que resbala',
      vars: { m: [2, 20, 1], th: [30, 55, 5], mus: [0.2, 0.5, 0.05], muk: [0.1, 0.4, 0.05], L: [1, 8, 0.5] },
      where: function (v) { return Math.tan(v.th * RAD) > v.mus + 0.05 && v.muk < v.mus && sn(v.th) - v.muk * cs(v.th) > 0.15; },
      statement: function (v) { return '<p>Un bloque de $' + v.m + '$ kg se suelta en lo alto de una rampa de $' + v.th + '^\\circ$ y $' + v.L + '$ m de largo ($\\mu_s = ' + v.mus + '$, $\\mu_k = ' + v.muk + '$). Como $\\tan\\theta > \\mu_s$, resbala.</p>'; },
      diagram: { id: 'exam-plano', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal?'; },
          answer: function (v) { return v.m * g * cs(v.th); },
          solution: function (v) { return '$N = mg\\cos\\theta = ' + fx(v.m * g * cs(v.th)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu normal de a), ¿cuánto vale la fricción mientras baja?'; },
          answer: function (v, prev) { return v.muk * prev[0]; },
          solution: function (v) { return '$f_k = \\mu_kN = ' + fx(v.muk * v.m * g * cs(v.th)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu fricción de b), ¿qué aceleración tiene plano abajo?'; },
          answer: function (v, prev) { return (v.m * g * sn(v.th) - prev[1]) / v.m; },
          solution: function (v) { return '$a = \\frac{mg\\sin\\theta - f_k}{m} = ' + fx(g * (sn(v.th) - v.muk * cs(v.th)), 3) + '$ m/s².'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return 'Con tu aceleración de c), ¿cuánto tarda en llegar abajo?'; },
          answer: function (v, prev) { return Math.sqrt(2 * v.L / prev[2]); },
          solution: function (v) { var a = g * (sn(v.th) - v.muk * cs(v.th)); return '$t = \\sqrt{2L/a} = ' + fx(Math.sqrt(2 * v.L / a), 3) + '$ s.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tus resultados de c) y d), ¿con qué rapidez llega abajo?'; },
          answer: function (v, prev) { return prev[2] * prev[3]; },
          solution: function (v) { var a = g * (sn(v.th) - v.muk * cs(v.th)); return '$v = at = ' + fx(Math.sqrt(2 * a * v.L), 3) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-elevador', tags: ['f1.S08'], block: 'C', title: 'La báscula en el elevador',
      vars: { m: [40, 100, 5], a1: [0.5, 3, 0.5], a2: [0.5, 3, 0.5] },
      statement: function (v) { return '<p>Una persona de $' + v.m + '$ kg está parada sobre una báscula en un elevador. Al arrancar hacia arriba, el elevador acelera a $' + v.a1 + '$ m/s²; al llegar a su piso frena con $' + v.a2 + '$ m/s² (aceleración hacia abajo).</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal mientras arranca?'; },
          answer: function (v) { return v.m * (g + v.a1); },
          solution: function (v) { return '$N = m(g + a_1) = ' + fx(v.m * (g + v.a1), 1) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'kg',
          prompt: function () { return 'La báscula está calibrada en kg (marca $N/g$). Con tu normal de a), ¿qué marca al arrancar?'; },
          answer: function (v, prev) { return prev[0] / g; },
          solution: function (v) { return '$' + fx(v.m * (g + v.a1), 1) + '/9.81 = ' + fx(v.m * (g + v.a1) / g, 2) + '$ kg.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal mientras frena?'; },
          answer: function (v) { return v.m * (g - v.a2); },
          solution: function (v) { return 'Frenar al subir es acelerar hacia abajo: $N = m(g - a_2) = ' + fx(v.m * (g - v.a2), 1) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tus resultados de a) y c), ¿cuánto cambia la normal entre el arranque y el frenado?'; },
          answer: function (v, prev) { return prev[0] - prev[2]; },
          solution: function (v) { return '$' + fx(v.m * (g + v.a1), 1) + ' - ' + fx(v.m * (g - v.a2), 1) + ' = ' + fx(v.m * (v.a1 + v.a2), 1) + '$ N.'; } }
      ]
    },
    {
      id: 'f1-ex-curva', tags: ['f1.S11'], block: 'C', title: '¿Derrapa en la curva?',
      vars: { m: [600, 2000, 100], r: [20, 150, 10], mus: [0.3, 0.9, 0.05], v: [8, 30, 1] },
      where: function (v) { return Math.abs(v.mus * g * v.r - v.v * v.v) > 0.05 * v.v * v.v; },
      statement: function (v) { return '<p>Un auto de $' + v.m + '$ kg toma una curva plana de $' + v.r + '$ m de radio a $' + v.v + '$ m/s. El coeficiente de fricción estática entre llantas y pavimento es $' + v.mus + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return '¿Qué fuerza hacia el centro necesita el auto para dar la vuelta?'; },
          answer: function (v) { return v.m * v.v * v.v / v.r; },
          solution: function (v) { return '$F = mv^2/r = ' + fx(v.m * v.v * v.v / v.r, 0) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuál es la fricción estática máxima que puede dar el pavimento?'; },
          answer: function (v) { return v.mus * v.m * g; },
          solution: function (v) { return '$f_{s,máx} = \\mu_s mg = ' + fx(v.mus * v.m * g, 0) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N', tol: { abs: 20 },
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánta fricción le sobra? (Negativo si derrapa.)'; },
          answer: function (v, prev) { return prev[1] - prev[0]; },
          solution: function (v) { var s = v.mus * v.m * g - v.m * v.v * v.v / v.r; return '$' + fx(v.mus * v.m * g, 0) + ' - ' + fx(v.m * v.v * v.v / v.r, 0) + ' = ' + fx(s, 0) + '$ N: ' + (s > 0 ? 'no derrapa.' : 'derrapa.'); } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tu fricción máxima de b), ¿cuál es la velocidad máxima para esa curva?'; },
          answer: function (v, prev) { return Math.sqrt(prev[1] * v.r / v.m); },
          solution: function (v) { return '$v_{máx} = \\sqrt{f_{s,máx}\\,r/m} = \\sqrt{\\mu_s gr} = ' + fx(Math.sqrt(v.mus * g * v.r), 2) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-rampa-polea', tags: ['f1.S09', 'f1.S11'], block: 'C', title: 'Rampa con polea',
      vars: { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: [15, 45, 5], d: [0.5, 3, 0.5] },
      where: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2) > 0.8; },
      statement: function (v) { return '<p>Un bloque de $' + v.m1 + '$ kg está sobre un plano liso de $' + v.th + '^\\circ$, unido por una cuerda que pasa por una polea en lo alto a una masa de $' + v.m2 + '$ kg que cuelga. El sistema parte del reposo y la masa colgante baja.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto vale la componente del peso del bloque a lo largo del plano?'; },
          answer: function (v) { return v.m1 * g * sn(v.th); },
          solution: function (v) { return '$m_1g\\sin\\theta = ' + fx(v.m1 * g * sn(v.th)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu resultado de a), ¿qué aceleración tiene el sistema?'; },
          answer: function (v, prev) { return (v.m2 * g - prev[0]) / (v.m1 + v.m2); },
          solution: function (v) { return '$a = \\frac{m_2g - m_1g\\sin\\theta}{m_1 + m_2} = ' + fx((v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2), 3) + '$ m/s².'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu aceleración de b), ¿cuánto vale la tensión?'; },
          answer: function (v, prev) { return v.m2 * (g - prev[1]); },
          solution: function (v) { var a = (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); return '$T = m_2(g - a) = ' + fx(v.m2 * (g - a)) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function (v) { return 'Con tu aceleración, ¿qué rapidez tienen cuando se han movido $' + v.d + '$ m?'; },
          answer: function (v, prev) { return Math.sqrt(2 * Math.abs(prev[1]) * v.d); },
          solution: function (v) { var a = (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); return '$v = \\sqrt{2ad} = ' + fx(Math.sqrt(2 * a * v.d), 3) + '$ m/s.'; } }
      ]
    }
  ]);

  /* ================= Bloques D–E · Energía y estática (lote 3 de F4) ================= */
  function tn(t) { return Math.tan(t * RAD); }

  ex.f1 = ex.f1.concat([
    {
      id: 'f1-ex-trineo', tags: ['f1.S10', 'f1.S12', 'f1.S13'], block: 'D', title: 'La caja jalada: de la fricción a la rapidez',
      vars: { m: [5, 30, 1], F: [40, 160, 10], th: [15, 40, 5], muk: [0.1, 0.4, 0.05], d: [2, 12, 1] },
      where: function (v) { var N = v.m * g - v.F * sn(v.th); return N > 10 && v.F * cs(v.th) - v.muk * N > 5; },
      statement: function (v) { return '<p>Jalas desde el reposo una caja de $' + v.m + '$ kg con una cuerda de $' + v.F + '$ N a $' + v.th + '^\\circ$ sobre la horizontal, a lo largo de $' + v.d + '$ m de piso con $\\mu_k = ' + v.muk + '$.</p>'; },
      diagram: { id: 'exam-jalon', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal?'; },
          answer: function (v) { return v.m * g - v.F * sn(v.th); },
          solution: function (v) { return '$N = mg - F\\sin\\theta = ' + fx(v.m * g - v.F * sn(v.th)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu normal, ¿cuánto vale la fricción cinética?'; },
          answer: function (v, prev) { return v.muk * prev[0]; },
          solution: function (v) { return '$f_k = \\mu_kN = ' + fx(v.muk * (v.m * g - v.F * sn(v.th))) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'J',
          prompt: function (v) { return 'Con tu fricción, ¿cuánto trabajo neto se hace sobre la caja en los $' + v.d + '$ m?'; },
          answer: function (v, prev) { return (v.F * cs(v.th) - prev[1]) * v.d; },
          solution: function (v) { var f = v.muk * (v.m * g - v.F * sn(v.th)); return '$W = (F\\cos\\theta - f_k)d = (' + fx(v.F * cs(v.th)) + ' - ' + fx(f) + ')(' + v.d + ') = ' + fx((v.F * cs(v.th) - f) * v.d) + '$ J. La normal y el peso no trabajan.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu trabajo neto, ¿qué rapidez tiene al final?'; },
          answer: function (v, prev) { return Math.sqrt(2 * Math.abs(prev[2]) / v.m); },
          solution: function (v) { var W = (v.F * cs(v.th) - v.muk * (v.m * g - v.F * sn(v.th))) * v.d; return '$\\tfrac{1}{2}mv^2 = W$: $v = \\sqrt{2W/m} = ' + fx(Math.sqrt(2 * W / v.m), 3) + '$ m/s.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return 'Con tu fricción, ¿cuánta energía se convirtió en calor?'; },
          answer: function (v, prev) { return prev[1] * v.d; },
          solution: function (v) { return '$f_kd = ' + fx(v.muk * (v.m * g - v.F * sn(v.th)) * v.d) + '$ J.'; } }
      ]
    },
    {
      id: 'f1-ex-rampa-resorte', tags: ['f1.S13'], block: 'D', title: 'Rampa, tramo áspero y resorte',
      vars: { m: [0.5, 4, 0.5], h: [1, 4, 0.5], mu: [0.1, 0.4, 0.05], d: [0.5, 2, 0.5], k: [200, 1500, 100] },
      where: function (v) { return v.h - v.mu * v.d > 0.4; },
      statement: function (v) { return '<p>Un carrito de $' + v.m + '$ kg se suelta desde $' + v.h + '$ m en una rampa lisa, cruza un tramo horizontal de $' + v.d + '$ m con $\\mu_k = ' + v.mu + '$ y choca con un resorte de $k = ' + v.k + '$ N/m.</p>'; },
      diagram: { id: 'exam-rampa-resorte', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return '¿Con qué rapidez llega al pie de la rampa?'; },
          answer: function (v) { return Math.sqrt(2 * g * v.h); },
          solution: function (v) { return '$v = \\sqrt{2gh} = ' + fx(Math.sqrt(2 * g * v.h), 3) + '$ m/s.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return '¿Cuánta energía pierde en el tramo áspero?'; },
          answer: function (v) { return v.mu * v.m * g * v.d; },
          solution: function (v) { return '$\\mu_k mgd = ' + fx(v.mu * v.m * g * v.d, 3) + '$ J.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tus resultados de a) y b), ¿con qué rapidez llega al resorte?'; },
          answer: function (v, prev) { return Math.sqrt(Math.abs(prev[0] * prev[0] - 2 * prev[1] / v.m)); },
          solution: function (v) { return '$\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}mv_a^2 - \\mu_kmgd$: $v = ' + fx(Math.sqrt(2 * g * (v.h - v.mu * v.d)), 3) + '$ m/s.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu rapidez de c), ¿cuánto comprime el resorte?'; },
          answer: function (v, prev) { return prev[2] * Math.sqrt(v.m / v.k); },
          solution: function (v) { var u = Math.sqrt(2 * g * (v.h - v.mu * v.d)); return '$\\tfrac{1}{2}kx^2 = \\tfrac{1}{2}mv^2$: $x = v\\sqrt{m/k} = ' + fx(u * Math.sqrt(v.m / v.k), 4) + '$ m.'; } }
      ]
    },
    {
      id: 'f1-ex-montacargas', tags: ['f1.S12'], block: 'D', title: 'El motor del montacargas',
      vars: { m: [100, 800, 50], h: [3, 25, 1], t: [5, 40, 1], e: [60, 90, 5] },
      statement: function (v) { return '<p>Un montacargas sube $' + v.m + '$ kg a velocidad constante una altura de $' + v.h + '$ m en $' + v.t + '$ s. Su motor tiene una eficiencia del $' + v.e + '\\,\\%$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return '¿Cuánto trabajo hace el motor sobre la carga?'; },
          answer: function (v) { return v.m * g * v.h; },
          solution: function (v) { return '$W = mgh = ' + fx(v.m * g * v.h) + '$ J.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'W',
          prompt: function () { return 'Con tu trabajo, ¿qué potencia útil entrega?'; },
          answer: function (v, prev) { return prev[0] / v.t; },
          solution: function (v) { return '$P = W/t = ' + fx(v.m * g * v.h / v.t) + '$ W.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'W',
          prompt: function () { return 'Con tu potencia útil, ¿qué potencia eléctrica consume?'; },
          answer: function (v, prev) { return prev[1] / (v.e / 100); },
          solution: function (v) { return '$P_{elec} = P/\\eta = ' + fx(v.m * g * v.h / v.t / (v.e / 100)) + '$ W.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tu potencia útil, ¿a qué velocidad sube la carga? (Usa $P = Fv$.)'; },
          answer: function (v, prev) { return prev[1] / (v.m * g); },
          solution: function (v) { return '$v = P/(mg) = ' + fx(v.h / v.t, 3) + '$ m/s (igual a $h/t$).'; } }
      ]
    },
    {
      id: 'f1-ex-frenado-energia', tags: ['f1.S12'], block: 'D', title: 'Frenar con energía',
      vars: { m: [600, 2000, 100], kmh: [30, 110, 10], mu: [0.4, 0.9, 0.05] },
      statement: function (v) { return '<p>Un auto de $' + v.m + '$ kg va a $' + v.kmh + '$ km/h y frena con las llantas derrapando sobre un pavimento con $\\mu_k = ' + v.mu + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return '¿Cuánta energía cinética tiene antes de frenar?'; },
          answer: function (v) { return 0.5 * v.m * Math.pow(v.kmh / 3.6, 2); },
          solution: function (v) { return '$v = ' + fx(v.kmh / 3.6, 3) + '$ m/s y $K = \\tfrac{1}{2}mv^2 = ' + fx(0.5 * v.m * Math.pow(v.kmh / 3.6, 2)) + '$ J.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Qué fuerza de fricción actúa?'; },
          answer: function (v) { return v.mu * v.m * g; },
          solution: function (v) { return '$f = \\mu_kmg = ' + fx(v.mu * v.m * g) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tus resultados de a) y b), ¿qué distancia recorre hasta detenerse?'; },
          answer: function (v, prev) { return prev[0] / prev[1]; },
          solution: function (v) { return '$fd = K$: $d = ' + fx(Math.pow(v.kmh / 3.6, 2) / (2 * v.mu * g), 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu distancia de c), ¿en qué distancia frenaría si fuera al doble de rapidez?'; },
          answer: function (v, prev) { return 4 * prev[2]; },
          solution: function (v) { return 'La distancia va con $v^2$: $4d = ' + fx(4 * Math.pow(v.kmh / 3.6, 2) / (2 * v.mu * g), 3) + '$ m.'; } }
      ]
    },
    {
      id: 'f1-ex-pendulo', tags: ['f1.S11', 'f1.S13'], block: 'D', title: 'El péndulo que se suelta',
      vars: { m: [0.2, 3, 0.1], L: [0.5, 2.5, 0.1], th: [20, 80, 5] },
      where: function (v) { return v.th !== 60; },
      statement: function (v) { return '<p>Un péndulo de $' + v.L + '$ m con una masa de $' + v.m + '$ kg se suelta desde el reposo con la cuerda a $' + v.th + '^\\circ$ de la vertical.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿Cuánto baja la masa hasta el punto más bajo?'; },
          answer: function (v) { return v.L * (1 - cs(v.th)); },
          solution: function (v) { return '$h = L(1 - \\cos\\theta) = ' + fx(v.L * (1 - cs(v.th)), 4) + '$ m.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tu altura, ¿qué rapidez tiene en el punto más bajo?'; },
          answer: function (v, prev) { return Math.sqrt(2 * g * Math.abs(prev[0])); },
          solution: function (v) { return '$v = \\sqrt{2gh} = ' + fx(Math.sqrt(2 * g * v.L * (1 - cs(v.th))), 3) + '$ m/s.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu rapidez, ¿qué tensión tiene la cuerda en el punto más bajo?'; },
          answer: function (v, prev) { return v.m * g + v.m * prev[1] * prev[1] / v.L; },
          solution: function (v) { return 'Al centro: $T - mg = mv^2/L$, así que $T = ' + fx(v.m * g * (3 - 2 * cs(v.th))) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu rapidez de b), ¿qué rapidez tiene cuando la cuerda pasa por la mitad del ángulo inicial? (Usa energía.)'; },
          answer: function (v, prev) { return Math.sqrt(Math.abs(prev[1] * prev[1] - 2 * g * v.L * (1 - cs(v.th / 2)))); },
          solution: function (v) { return '$v^2 = 2gL(\\cos(\\theta/2) - \\cos\\theta)$: $v = ' + fx(Math.sqrt(2 * g * v.L * (cs(v.th / 2) - cs(v.th))), 3) + '$ m/s.'; } }
      ]
    },
    {
      id: 'f1-ex-lanzador', tags: ['f1.S13'], block: 'D', title: 'El lanzador de resorte',
      vars: { k: [200, 1500, 50], x: [3, 15, 1], m: [20, 200, 10] },
      where: function (v) { var H = 0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g); return H > 0.3 && H < 60; },
      statement: function (v) { return '<p>Un lanzador de juguete tiene un resorte de $k = ' + v.k + '$ N/m que se comprime $' + v.x + '$ cm y dispara verticalmente una pelota de $' + v.m + '$ g. Desprecia la altura que sube mientras el resorte se expande.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return '¿Cuánta energía guarda el resorte comprimido?'; },
          answer: function (v) { return 0.5 * v.k * Math.pow(v.x / 100, 2); },
          solution: function (v) { return '$U = \\tfrac{1}{2}kx^2 = ' + fx(0.5 * v.k * Math.pow(v.x / 100, 2), 4) + '$ J.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tu energía, ¿con qué rapidez sale la pelota?'; },
          answer: function (v, prev) { return Math.sqrt(2 * Math.abs(prev[0]) / (v.m / 1000)); },
          solution: function (v) { return '$v = \\sqrt{2U/m} = ' + fx((v.x / 100) * Math.sqrt(v.k / (v.m / 1000)), 3) + '$ m/s.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu rapidez, ¿qué altura máxima alcanza?'; },
          answer: function (v, prev) { return prev[1] * prev[1] / (2 * g); },
          solution: function (v) { return '$H = v^2/(2g) = ' + fx(0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g), 3) + '$ m.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu rapidez de b), ¿qué rapidez lleva a la mitad de la altura máxima?'; },
          answer: function (v, prev) { return prev[1] / Math.SQRT2; },
          solution: function (v) { return 'A $H/2$ queda la mitad de la energía cinética: $v/\\sqrt 2 = ' + fx((v.x / 100) * Math.sqrt(v.k / (v.m / 1000)) / Math.SQRT2, 3) + '$ m/s.'; } }
      ]
    },

    /* ----------------------------- Bloque E · Estática ----------------------------- */
    {
      id: 'f1-ex-cables', tags: ['f1.S14'], block: 'E', title: 'El peso colgado de dos cables',
      vars: { m: [2, 40, 1], a: [20, 70, 5], b: [20, 70, 5] },
      where: function (v) { return v.a !== v.b && v.a + v.b !== 90; },
      statement: function (v) { return '<p>Una masa de $' + v.m + '$ kg cuelga de un nudo sostenido por dos cables que forman $' + v.a + '^\\circ$ (izquierdo) y $' + v.b + '^\\circ$ (derecho) con el techo.</p>'; },
      diagram: { id: 'exam-cables', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto vale el peso que sostiene el nudo?'; },
          answer: function (v) { return v.m * g; },
          solution: function (v) { return '$mg = ' + fx(v.m * g) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu peso, ¿qué tensión tiene el cable izquierdo?'; },
          answer: function (v, prev) { return prev[0] * cs(v.b) / sn(v.a + v.b); },
          solution: function (v) { return '$T_1 = \\frac{mg\\cos\\theta_2}{\\sin(\\theta_1 + \\theta_2)} = ' + fx(v.m * g * cs(v.b) / sn(v.a + v.b)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu $T_1$ y $\\Sigma F_x = 0$, ¿qué tensión tiene el cable derecho?'; },
          answer: function (v, prev) { return prev[1] * cs(v.a) / cs(v.b); },
          solution: function (v) { return '$T_2 = T_1\\cos\\theta_1/\\cos\\theta_2 = ' + fx(v.m * g * cs(v.a) / sn(v.a + v.b)) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tus tensiones, ¿cuánto suman sus componentes verticales? (Comprobación.)'; },
          answer: function (v, prev) { return prev[1] * sn(v.a) + prev[2] * sn(v.b); },
          solution: function (v) { return 'Debe dar el peso: $' + fx(v.m * g) + '$ N.'; } }
      ]
    },
    {
      id: 'f1-ex-letrero', tags: ['f1.S14'], block: 'E', title: 'El letrero con cable horizontal',
      vars: { m: [2, 50, 1], th: [20, 70, 5] },
      where: function (v) { return v.th !== 45; },
      statement: function (v) { return '<p>Un letrero de $' + v.m + '$ kg cuelga de un nudo. Un cable va horizontal a la pared y otro sube al techo formando $' + v.th + '^\\circ$ con la horizontal.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return '¿Qué tensión tiene el cable inclinado?'; },
          answer: function (v) { return v.m * g / sn(v.th); },
          solution: function (v) { return 'Solo él sostiene el peso: $T\\sin\\theta = mg$, $T = ' + fx(v.m * g / sn(v.th)) + '$ N.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu tensión, ¿qué tensión tiene el cable horizontal?'; },
          answer: function (v, prev) { return prev[0] * cs(v.th); },
          solution: function (v) { return '$T_h = T\\cos\\theta = ' + fx(v.m * g / tn(v.th)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu resultado de b), si cuelgas el doble de masa, ¿qué tensión tendría el cable horizontal?'; },
          answer: function (v, prev) { return 2 * prev[1]; },
          solution: function (v) { return 'Todo escala con la masa: $' + fx(2 * v.m * g / tn(v.th)) + '$ N.'; } }
      ]
    },
    {
      id: 'f1-ex-viga', tags: ['f1.S15'], block: 'E', title: 'La viga sobre dos apoyos',
      vars: { L: [4, 10, 1], M: [10, 80, 5], a: [0, 1.5, 0.5], db: [0, 1.5, 0.5], F: [200, 1500, 50], p: [20, 80, 5] },
      where: function (v) { return v.p !== 50; },
      statement: function (v) { var b = v.L - v.db, x = Number((v.a + (b - v.a) * v.p / 100).toFixed(2)); return '<p>Una viga uniforme de $' + v.L + '$ m y $' + v.M + '$ kg descansa en apoyos $A$ ($x = ' + v.a + '$ m) y $B$ ($x = ' + b + '$ m). Lleva una carga de $' + v.F + '$ N en $x = ' + x + '$ m.</p>'; },
      diagram: { id: 'exam-viga', state: function (v) { return { L: v.L, M: v.M, a: v.a, b: v.L - v.db, F: v.F, x: Number((v.a + (v.L - v.db - v.a) * v.p / 100).toFixed(2)) }; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto pesa la viga?'; },
          answer: function (v) { return v.M * g; },
          solution: function (v) { return '$Mg = ' + fx(v.M * g) + '$ N, en su centro ($x = ' + (v.L / 2) + '$ m).'; } },
        { label: 'b', type: 'numeric', points: 4, unit: 'N',
          prompt: function () { return 'Con tu peso de la viga y torques respecto a $A$, ¿cuánto vale $R_B$?'; },
          answer: function (v, prev) { var b = v.L - v.db, x = Number((v.a + (b - v.a) * v.p / 100).toFixed(2)); return (v.F * (x - v.a) + prev[0] * (v.L / 2 - v.a)) / (b - v.a); },
          solution: function (v) { var b = v.L - v.db, x = Number((v.a + (b - v.a) * v.p / 100).toFixed(2)); return '$R_B = \\frac{F(x - a) + Mg(L/2 - a)}{b - a} = ' + fx((v.F * (x - v.a) + v.M * g * (v.L / 2 - v.a)) / (b - v.a)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 4, unit: 'N',
          prompt: function () { return 'Con tus resultados, ¿cuánto vale $R_A$?'; },
          answer: function (v, prev) { return v.F + prev[0] - prev[1]; },
          solution: function (v) { var b = v.L - v.db, x = Number((v.a + (b - v.a) * v.p / 100).toFixed(2)), RB = (v.F * (x - v.a) + v.M * g * (v.L / 2 - v.a)) / (b - v.a); return '$R_A = F + Mg - R_B = ' + fx(v.F + v.M * g - RB) + '$ N.'; } }
      ]
    },
    {
      id: 'f1-ex-pluma', tags: ['f1.S15'], block: 'E', title: 'La pluma con cable',
      vars: { L: [1, 4, 0.5], M: [5, 60, 5], W: [100, 1500, 50], th: [20, 60, 5] },
      where: function (v) { return v.th !== 45; },
      statement: function (v) { return '<p>Una viga uniforme horizontal de $' + v.L + '$ m y $' + v.M + '$ kg tiene bisagra en la pared. Un cable atado a su punta sube a la pared formando $' + v.th + '^\\circ$ con la viga, y de la punta cuelga una carga de $' + v.W + '$ N.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N·m',
          prompt: function () { return '¿Qué torque total producen la carga y el peso de la viga respecto a la bisagra?'; },
          answer: function (v) { return v.W * v.L + v.M * g * v.L / 2; },
          solution: function (v) { return '$WL + Mg\\,L/2 = ' + fx(v.W * v.L + v.M * g * v.L / 2) + '$ N·m.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu torque, ¿qué tensión tiene el cable?'; },
          answer: function (v, prev) { return prev[0] / (v.L * sn(v.th)); },
          solution: function (v) { return '$TL\\sin\\theta = \\tau$: $T = ' + fx((v.W + v.M * g / 2) / sn(v.th)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu tensión, ¿qué fuerza horizontal hace la bisagra?'; },
          answer: function (v, prev) { return prev[1] * cs(v.th); },
          solution: function (v) { return '$H = T\\cos\\theta = ' + fx((v.W + v.M * g / 2) / tn(v.th)) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu tensión, ¿qué fuerza vertical hace la bisagra?'; },
          answer: function (v, prev) { return v.W + v.M * g - prev[1] * sn(v.th); },
          solution: function (v) { return '$V = W + Mg - T\\sin\\theta = ' + fx(v.M * g / 2) + '$ N.'; } }
      ]
    },
    {
      id: 'f1-ex-balancin', tags: ['f1.S15'], block: 'E', title: 'El balancín',
      vars: { m1: [15, 60, 5], x1: [0.5, 2.5, 0.25], m2: [20, 90, 5], M: [5, 30, 5] },
      where: function (v) { return v.m1 !== v.m2 && v.m1 * v.x1 / v.m2 < 2.5; },
      statement: function (v) { return '<p>Un balancín uniforme de $' + v.M + '$ kg tiene el pivote en su centro. Una niña de $' + v.m1 + '$ kg se sienta a $' + v.x1 + '$ m del pivote y su hermano, de $' + v.m2 + '$ kg, se sienta del otro lado.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N·m',
          prompt: function () { return '¿Qué torque produce el peso de la niña respecto al pivote?'; },
          answer: function (v) { return v.m1 * g * v.x1; },
          solution: function (v) { return '$\\tau = m_1gx_1 = ' + fx(v.m1 * g * v.x1) + '$ N·m.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu torque, ¿a qué distancia del pivote debe sentarse el hermano para equilibrar?'; },
          answer: function (v, prev) { return prev[0] / (v.m2 * g); },
          solution: function (v) { return '$x_2 = \\tau/(m_2g) = ' + fx(v.m1 * v.x1 / v.m2, 3) + '$ m. El peso del balancín está en el pivote: no hace torque.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Con qué fuerza empuja el pivote hacia arriba?'; },
          answer: function (v) { return (v.m1 + v.m2 + v.M) * g; },
          solution: function (v) { return '$\\Sigma F = 0$: $(m_1 + m_2 + M)g = ' + fx((v.m1 + v.m2 + v.M) * g) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu resultado de b), si la niña se recorre $0.5$ m más lejos del pivote, ¿cuánto debe alejarse el hermano?'; },
          answer: function (v, prev) { return prev[1] * 0.5 / v.x1; },
          solution: function (v) { return 'La distancia del hermano es proporcional a la de la niña: $\\Delta x_2 = 0.5\\,m_1/m_2 = ' + fx(0.5 * v.m1 / v.m2, 3) + '$ m.'; } }
      ]
    },
    {
      id: 'f1-ex-escalera', tags: ['f1.S15'], block: 'E', title: 'La escalera contra la pared',
      vars: { L: [2, 6, 0.5], m: [8, 25, 1], Mp: [50, 90, 5], p: [30, 90, 10], th: [55, 75, 5] },
      statement: function (v) { return '<p>Una escalera uniforme de $' + v.L + '$ m y $' + v.m + '$ kg se apoya en una pared lisa formando $' + v.th + '^\\circ$ con el piso. Una persona de $' + v.Mp + '$ kg está parada al $' + v.p + '\\,\\%$ de su largo, medido desde el piso.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'N·m',
          prompt: function () { return '¿Qué torque producen los pesos (escalera y persona) respecto al pie de la escalera?'; },
          answer: function (v) { return (v.m * g * v.L / 2 + v.Mp * g * v.L * v.p / 100) * cs(v.th); },
          solution: function (v) { return 'Brazos horizontales: $(mg\\,L/2 + Mg\\,pL)\\cos\\theta = ' + fx((v.m * g * v.L / 2 + v.Mp * g * v.L * v.p / 100) * cs(v.th)) + '$ N·m.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu torque, ¿qué fuerza horizontal hace la pared?'; },
          answer: function (v, prev) { return prev[0] / (v.L * sn(v.th)); },
          solution: function (v) { return '$N_pL\\sin\\theta = \\tau$: $N_p = ' + fx((v.m * g / 2 + v.Mp * g * v.p / 100) / tn(v.th)) + '$ N.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Cuánto vale la normal del piso?'; },
          answer: function (v) { return (v.m + v.Mp) * g; },
          solution: function (v) { return 'La pared lisa no sostiene nada vertical: $N = (m + M)g = ' + fx((v.m + v.Mp) * g) + '$ N.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tus resultados de b) y c), ¿qué coeficiente de fricción estática mínimo necesita el piso?'; },
          answer: function (v, prev) { return prev[1] / prev[2]; }, tol: { abs: 0.005 },
          solution: function (v) { return '$\\mu_s = N_p/N = ' + fx((v.m / 2 + v.Mp * v.p / 100) / tn(v.th) / (v.m + v.Mp), 3) + '$.'; } }
      ]
    }
  ]);

})();
