/* =====================================================================
   Problemas de examen · Cálculo 2. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Bloque A (S01–S05): 8 problemas. Ángulos en radianes; en esféricas
   (ρ, θ, φ), φ se mide desde el eje z positivo (como en las sesiones).
   Las respuestas se comprueban por otro camino en scripts/labs-math/c2-exam.js.
   ===================================================================== */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var TAU = 2 * Math.PI, R_GAS = 8.31;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // Término con signo para un polinomio: term(-4, 'x') → ' - 4x'; term(1, 'y') → ' + y'; 0 → ''.
  function term(c, s) {
    if (!c) return '';
    var a = Math.abs(c);
    return (c < 0 ? ' - ' : ' + ') + (a === 1 && s ? '' : a) + s;
  }
  // Coeficiente al inicio: 1 → '', -1 → '-', 3 → '3'.
  function lead(c, s) { return (c === 1 ? '' : c === -1 ? '-' : c) + s; }
  // (x − c)² con el signo bien escrito; si c = 0, solo x².
  function sq(s, c) { return c ? '(' + s + term(-c, '') + ')^2' : s + '^2'; }
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  // mπ/d en LaTeX, simplificado.
  function piTex(m, d) {
    var g = gcd(m, d), M = m / g, Dd = d / g;
    if (!M) return '0';
    var n = (M === 1 ? '' : M === -1 ? '-' : M) + '\\pi';
    return Dd === 1 ? n : '\\dfrac{' + n + '}{' + Dd + '}';
  }
  function norm2pi(t) { var u = t % TAU; if (u < 0) u += TAU; return u > TAU - 1e-12 ? 0 : u; }
  function clamp1(x) { return Math.max(-1, Math.min(1, x)); }

  /* ---------- Cálculos de referencia (los usan answer y solution) ---------- */
  // Esfera de centro (h, k, l) y radio R, desarrollada: x² + y² + z² + Dx + Ey + Fz + G = 0.
  function esf(v) {
    var G = v.h * v.h + v.k * v.k + v.l * v.l - v.R * v.R, c = v.l + v.dz, rc = Math.sqrt(v.R * v.R - v.dz * v.dz);
    var dC = Math.sqrt(v.h * v.h + v.k * v.k + v.l * v.l);
    return { D: -2 * v.h, E: -2 * v.k, F: -2 * v.l, G: G, c: c, rc: rc, A: Math.PI * rc * rc, dC: dC, gap: dC - v.R };
  }
  // Rectangulares → cilíndricas y esféricas.
  function rce(v) {
    var r = Math.hypot(v.x, v.y), rho = Math.hypot(r, v.z);
    return { r: r, th: norm2pi(Math.atan2(v.y, v.x)), rho: rho, phi: Math.acos(v.z / rho) };
  }
  // Esféricas (ρ, θ = mπ/6, φ = jπ/6) → rectangulares, y la distancia a Q.
  function erd(v) {
    var th = v.m * Math.PI / 6, ph = v.j * Math.PI / 6;
    var z = v.rho * Math.cos(ph), r = v.rho * Math.sin(ph), x = r * Math.cos(th), y = r * Math.sin(th);
    return { th: th, ph: ph, z: z, r: r, x: x, y: y, d: Math.sqrt(Math.pow(x - v.qx, 2) + Math.pow(y - v.qy, 2) + Math.pow(z - v.qz, 2)) };
  }
  // Circunferencia polar r = 2a cos θ + 2b sin θ en θ0 = mπ/6.
  function pol(v) {
    var t = v.m * Math.PI / 6, r0 = 2 * v.a * Math.cos(t) + 2 * v.b * Math.sin(t);
    return { t: t, r0: r0, x: r0 * Math.cos(t), y: r0 * Math.sin(t), R: Math.hypot(v.a, v.b) };
  }
  // f(x, y) = p x² y + q y² en (a, b), con incrementos dx, dy.
  function tpl(v) {
    var f = function (x, y) { return v.p * x * x * y + v.q * y * y; };
    var f0 = f(v.a, v.b), fxv = 2 * v.p * v.a * v.b, fyv = v.p * v.a * v.a + 2 * v.q * v.b;
    return { f: f, f0: f0, fx: fxv, fy: fyv, L: f0 + fxv * v.dx + fyv * v.dy, real: f(v.a + v.dx, v.b + v.dy) };
  }
  // Cono V = πr²h/3 con incertidumbres dr, dh (cm).
  function con(v) {
    var V = Math.PI * v.r * v.r * v.h / 3, Vr = 2 * Math.PI * v.r * v.h / 3, Vh = Math.PI * v.r * v.r / 3, dV = Vr * v.dr + Vh * v.dh;
    return { V: V, Vr: Vr, Vh: Vh, dV: dV, pct: dV / V * 100 };
  }
  // Gas ideal con V en litros: P en kPa.
  function gas(v) {
    var P = v.n * R_GAS * v.T / v.V, PT = v.n * R_GAS / v.V, PV = -P / v.V;
    return { P: P, PT: PT, PV: PV, dP: PT * v.dT + PV * v.dV, real: v.n * R_GAS * (v.T + v.dT) / (v.V + v.dV) - P };
  }
  // Placa T(x, y) = 20 + a x² + b y² y su curva de nivel por (x0, y0).
  function plc(v) {
    var k = 20 + v.a * v.x0 * v.x0 + v.b * v.y0 * v.y0, Tx = 2 * v.a * v.x0, Ty = 2 * v.b * v.y0;
    return { k: k, A: Math.sqrt((k - 20) / v.a), B: Math.sqrt((k - 20) / v.b), Tx: Tx, Ty: Ty, m: -Tx / Ty };
  }

  ex.c2 = (ex.c2 || []).concat([
    /* ================= Bloque A · Espacio y derivada parcial (S01–S05) ================= */
    {
      id: 'c2-ex-esfera', tags: ['c2.S01'], block: 'A', title: 'Una esfera cortada por un plano',
      vars: { h: [-4, 4, 1], k: [-4, 4, 1], l: [-3, 3, 1], R: [2, 4, 1], dz: [-2, 2, 1] },
      where: function (v) { return v.dz !== 0 && Math.abs(v.dz) < v.R && v.h * v.h + v.k * v.k + v.l * v.l >= (v.R + 2) * (v.R + 2); },
      statement: function (v) {
        var s = esf(v);
        return '<p>Una esfera tiene la ecuación $x^2 + y^2 + z^2' + term(s.D, 'x') + term(s.E, 'y') + term(s.F, 'z') + term(s.G, '') + ' = 0$. El plano horizontal $z = ' + s.c + '$ la corta.</p>';
      },
      diagram: { id: 'c2exam-esfera', state: function (v) { return { h: v.h, k: v.k, l: v.l, R: v.R, c: v.l + v.dz }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return 'Completa cuadrados. ¿Cuánto mide el radio de la esfera?'; },
          answer: function (v) { return v.R; },
          solution: function (v) {
            return 'Completando cuadrados: $' + sq('x', v.h) + ' + ' + sq('y', v.k) + ' + ' + sq('z', v.l) + ' = ' + (v.R * v.R) + '$. Centro $(' + v.h + ', ' + v.k + ', ' + v.l + ')$ y radio $\\sqrt{' + (v.R * v.R) + '} = ' + v.R + '$.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function (v) { return 'El plano $z = ' + (v.l + v.dz) + '$ corta la esfera en una circunferencia. Con tu radio del inciso a), ¿cuál es el radio de esa circunferencia?'; },
          answer: function (v, prev) { return Math.sqrt(Math.max(0, prev[0] * prev[0] - v.dz * v.dz)); },
          solution: function (v) {
            var s = esf(v);
            return 'El plano queda a $|' + s.c + ' - ' + par(v.l) + '| = ' + Math.abs(v.dz) + '$ del centro. Por Pitágoras: $\\sqrt{' + v.R + '^2 - ' + Math.abs(v.dz) + '^2} = \\sqrt{' + (v.R * v.R - v.dz * v.dz) + '} \\approx ' + fx(s.rc) + '$.';
          }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu resultado del inciso b), ¿cuál es el área del círculo que el plano encierra dentro de la esfera?'; },
          answer: function (v, prev) { return Math.PI * prev[1] * prev[1]; },
          solution: function (v) { var s = esf(v); return 'Con $r^2 = ' + (v.R * v.R - v.dz * v.dz) + '$: $\\pi r^2 = ' + (v.R * v.R - v.dz * v.dz) + '\\pi \\approx ' + fx(s.A) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'El origen queda fuera de la esfera. Con tu radio del inciso a), ¿a qué distancia está el origen del punto más cercano de la esfera?'; },
          answer: function (v, prev) { return esf(v).dC - prev[0]; },
          solution: function (v) {
            var s = esf(v), q = v.h * v.h + v.k * v.k + v.l * v.l;
            return 'El punto más cercano está sobre la recta que une el origen con el centro: distancia al centro menos el radio, $\\sqrt{' + par(v.h) + '^2 + ' + par(v.k) + '^2 + ' + par(v.l) + '^2} - ' + v.R + ' = \\sqrt{' + q + '} - ' + v.R + ' \\approx ' + fx(s.gap) + '$.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-rect-esfericas', tags: ['c2.S03', 'c2.S02'], block: 'A', title: 'Un punto en los tres sistemas',
      vars: { x: [-4, 4, 1], y: [-4, 4, 1], z: [-4, 4, 1] },
      where: function (v) { return v.x !== 0 && v.y !== 0 && v.z !== 0; },
      statement: function (v) { return '<p>Un dron está en el punto $P(' + v.x + ', ' + v.y + ', ' + v.z + ')$ en coordenadas rectangulares (en metros). Usa radianes; en esféricas, $\\varphi$ se mide desde el eje $z$ positivo.</p>'; },
      diagram: { id: 'c2exam-punto', state: function (v) { return { x: v.x, y: v.y, z: v.z }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'En cilíndricas, ¿cuánto vale $r$ (la distancia de $P$ al eje $z$)?'; },
          answer: function (v) { return Math.hypot(v.x, v.y); },
          solution: function (v) { return '$r = \\sqrt{x^2 + y^2} = \\sqrt{' + par(v.x) + '^2 + ' + par(v.y) + '^2} = \\sqrt{' + (v.x * v.x + v.y * v.y) + '} \\approx ' + fx(rce(v).r) + '$ m.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'rad',
          prompt: function () { return '¿Cuánto vale $\\theta$, en el intervalo $[0, 2\\pi)$? Cuida el cuadrante.'; },
          answer: function (v) { return rce(v).th; },
          solution: function (v) {
            var t = Math.atan(v.y / v.x), th = rce(v).th;
            var how = v.x < 0 ? 'Como $x < 0$, el punto está a la izquierda: se suma $\\pi$.' : v.y < 0 ? 'Como $x > 0$ y $y < 0$ (cuadrante IV), se suma $2\\pi$ para quedar en $[0, 2\\pi)$.' : 'El punto está en el cuadrante I: ese ángulo ya sirve.';
            return '$\\arctan\\left(\\dfrac{' + v.y + '}{' + v.x + '}\\right) \\approx ' + fx(t) + '$. ' + how + ' $\\theta \\approx ' + fx(th) + '$ rad.';
          }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu $r$ del inciso a), ¿cuánto vale $\\rho$ (la distancia de $P$ al origen)?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], v.z); },
          solution: function (v) { var s = rce(v); return '$\\rho = \\sqrt{r^2 + z^2} = \\sqrt{' + (v.x * v.x + v.y * v.y) + ' + ' + (v.z * v.z) + '} \\approx ' + fx(s.rho) + '$ m.'; }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'rad',
          prompt: function () { return 'Con tu $\\rho$ del inciso c), ¿cuánto vale $\\varphi$?'; },
          answer: function (v, prev) { return Math.acos(clamp1(v.z / prev[2])); },
          solution: function (v) {
            var s = rce(v);
            return '$\\cos\\varphi = \\dfrac{z}{\\rho} = \\dfrac{' + v.z + '}{' + fx(s.rho) + '}$, así que $\\varphi \\approx ' + fx(s.phi) + '$ rad' + (v.z < 0 ? ' (mayor que $\\pi/2$: el punto está debajo del plano $xy$).' : ' (menor que $\\pi/2$: el punto está arriba del plano $xy$).');
          }
        }
      ]
    },
    {
      id: 'c2-ex-esfericas-dist', tags: ['c2.S03', 'c2.S01'], block: 'A', title: 'De esféricas a rectangulares',
      vars: { rho: [2, 6, 1], m: [1, 11, 1], j: [1, 5, 1], qx: [-3, 3, 1], qy: [-3, 3, 1], qz: [-3, 3, 1] },
      where: function (v) {
        // Q lejos de P, de la recta OP y de la vertical por P (para que la figura no encime trazos).
        var s = erd(v), u = [s.x / v.rho, s.y / v.rho, s.z / v.rho], t = v.qx * u[0] + v.qy * u[1] + v.qz * u[2];
        var off = Math.sqrt(Math.max(0, v.qx * v.qx + v.qy * v.qy + v.qz * v.qz - t * t));
        return v.j !== 3 && v.m % 3 !== 0 && s.d > 1.5 && off >= 1.5 && Math.hypot(v.qx - s.x, v.qy - s.y) >= 1;
      },
      statement: function (v) {
        return '<p>Una antena está en el punto con coordenadas esféricas $(\\rho, \\theta, \\varphi) = \\left(' + v.rho + ', ' + piTex(v.m, 6) + ', ' + piTex(v.j, 6) + '\\right)$ (en metros; $\\varphi$ desde el eje $z$ positivo). Un receptor está en $Q(' + v.qx + ', ' + v.qy + ', ' + v.qz + ')$, en rectangulares.</p>';
      },
      diagram: { id: 'c2exam-punto', state: function (v) { var s = erd(v); return { x: s.x, y: s.y, z: s.z, Q: [v.qx, v.qy, v.qz] }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿Cuánto vale $r$, la distancia de la antena al eje $z$ (la $r$ de cilíndricas)?'; },
          answer: function (v) { return erd(v).r; },
          solution: function (v) { return '$r = \\rho\\sin\\varphi = ' + v.rho + '\\sin\\left(' + piTex(v.j, 6) + '\\right) \\approx ' + fx(erd(v).r) + '$ m.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿Cuánto vale la altura $z$ de la antena?'; },
          answer: function (v) { return erd(v).z; },
          solution: function (v) { return '$z = \\rho\\cos\\varphi = ' + v.rho + '\\cos\\left(' + piTex(v.j, 6) + '\\right) \\approx ' + fx(erd(v).z) + '$ m.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu $r$ del inciso a), ¿cuánto vale la coordenada $x$?'; },
          answer: function (v, prev) { return prev[0] * Math.cos(v.m * Math.PI / 6); },
          solution: function (v) { return '$x = r\\cos\\theta = ' + fx(erd(v).r) + '\\cos\\left(' + piTex(v.m, 6) + '\\right) \\approx ' + fx(erd(v).x) + '$ m.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu $r$ del inciso a), ¿cuánto vale la coordenada $y$?'; },
          answer: function (v, prev) { return prev[0] * Math.sin(v.m * Math.PI / 6); },
          solution: function (v) { return '$y = r\\sin\\theta = ' + fx(erd(v).r) + '\\sin\\left(' + piTex(v.m, 6) + '\\right) \\approx ' + fx(erd(v).y) + '$ m.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tus coordenadas de los incisos b), c) y d), ¿a qué distancia está la antena del receptor $Q$?'; },
          answer: function (v, prev) { return Math.sqrt(Math.pow(prev[2] - v.qx, 2) + Math.pow(prev[3] - v.qy, 2) + Math.pow(prev[1] - v.qz, 2)); },
          solution: function (v) {
            var s = erd(v);
            return '$d = \\sqrt{(' + fx(s.x) + ' - ' + par(v.qx) + ')^2 + (' + fx(s.y) + ' - ' + par(v.qy) + ')^2 + (' + fx(s.z) + ' - ' + par(v.qz) + ')^2} \\approx ' + fx(s.d) + '$ m.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-polar-circulo', tags: ['c2.S02'], block: 'A', title: 'Una circunferencia en polares',
      vars: { a: [-3, 3, 1], b: [1, 4, 1], m: [1, 5, 1] },
      where: function (v) { return v.a !== 0 && pol(v).r0 >= 0.8; },
      statement: function (v) { return '<p>Una pista de patinaje tiene la forma $r = ' + lead(2 * v.a, '\\cos\\theta') + term(2 * v.b, '\\sin\\theta') + '$ (en decámetros, $\\theta$ en radianes). Una patinadora está en el punto de la pista con $\\theta = ' + piTex(v.m, 6) + '$.</p>'; },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var s = pol(v), R = s.R, a = v.a, b = v.b, rr = Math.min(0.22 * R, 0.6 * s.r0);
          return {
            x: [Math.min(a - R, 0) - 0.6, Math.max(a + R, 0) + 0.6], y: [Math.min(b - R, 0) - 0.6, Math.max(b + R, 0) + 0.6], equal: true,
            curves: [
              { xy: function (t) { return [a + R * Math.cos(t), b + R * Math.sin(t)]; }, t0: 0, t1: TAU },
              { xy: function (t) { return [t * s.x, t * s.y]; }, t0: 0, t1: 1, cls: 'aux', w: 2.4 },
              { xy: function (t) { return [rr * Math.cos(t), rr * Math.sin(t)]; }, t0: 0, t1: s.t, cls: 'aux', w: 2 }
            ],
            pts: [{ x: s.x, y: s.y, label: 'P' }], xlab: 'x', ylab: 'y',
            label: 'La pista es una circunferencia que pasa por el origen; el rayo desde el origen llega al punto P de la patinadora.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'dam',
          prompt: function (v) { return '¿Cuánto vale $r$ en $\\theta = ' + piTex(v.m, 6) + '$?'; },
          answer: function (v) { return pol(v).r0; },
          solution: function (v) { var s = pol(v); return '$r = ' + 2 * v.a + '\\cos\\left(' + piTex(v.m, 6) + '\\right) + ' + 2 * v.b + '\\sin\\left(' + piTex(v.m, 6) + '\\right) = ' + fx(2 * v.a * Math.cos(s.t)) + ' + ' + fx(2 * v.b * Math.sin(s.t)) + ' \\approx ' + fx(s.r0) + '$ dam.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'dam',
          prompt: function () { return 'Con tu $r$ del inciso a), ¿cuál es la coordenada $x$ de la patinadora?'; },
          answer: function (v, prev) { return prev[0] * Math.cos(v.m * Math.PI / 6); },
          solution: function (v) { var s = pol(v); return '$x = r\\cos\\theta = ' + fx(s.r0) + '\\cos\\left(' + piTex(v.m, 6) + '\\right) \\approx ' + fx(s.x) + '$ dam.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'dam',
          prompt: function () { return 'Con tu $r$ del inciso a), ¿cuál es su coordenada $y$?'; },
          answer: function (v, prev) { return prev[0] * Math.sin(v.m * Math.PI / 6); },
          solution: function (v) { var s = pol(v); return '$y = r\\sin\\theta = ' + fx(s.r0) + '\\sin\\left(' + piTex(v.m, 6) + '\\right) \\approx ' + fx(s.y) + '$ dam.'; }
        },
        {
          label: 'd', type: 'numeric', points: 4, unit: 'dam',
          prompt: function () { return 'Pasa la ecuación de la pista a rectangulares (multiplica por $r$). ¿Cuál es el radio de la circunferencia?'; },
          answer: function (v) { return pol(v).R; },
          solution: function (v) {
            return '$r^2 = ' + 2 * v.a + 'r\\cos\\theta + ' + 2 * v.b + 'r\\sin\\theta$ da $x^2 + y^2 = ' + lead(2 * v.a, 'x') + term(2 * v.b, 'y') + '$. Completando cuadrados: $' + sq('x', v.a) + ' + ' + sq('y', v.b) + ' = ' + (v.a * v.a + v.b * v.b) + '$, radio $\\sqrt{' + (v.a * v.a + v.b * v.b) + '} \\approx ' + fx(pol(v).R) + '$ dam.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-plano-tangente', tags: ['c2.S05', 'c2.S04'], block: 'A', title: 'Aproximar con el plano tangente',
      vars: { p: [1, 3, 1], q: [-3, 3, 1], a: [1, 3, 1], b: [-2, 2, 1], dx: [-0.2, 0.2, 0.1], dy: [-0.2, 0.2, 0.1] },
      where: function (v) { var s = tpl(v); return v.q !== 0 && v.b !== 0 && v.dx !== 0 && v.dy !== 0 && Math.abs(s.f0) >= 1 && Math.abs(s.fy) >= 1 && Math.abs(s.L) >= 1 && Math.abs(s.L - s.f0) >= 0.5; },
      statement: function (v) { return '<p>Considera $f(x, y) = ' + lead(v.p, 'x^2y') + term(v.q, 'y^2') + '$ y el punto $(' + v.a + ', ' + v.b + ')$. Se quiere estimar $f(' + fx(v.a + v.dx, 1) + ', ' + fx(v.b + v.dy, 1) + ')$ sin calcularla directamente.</p>'; },
      diagram: { id: 'c2exam-plano', state: function (v) { return { p: v.p, q: v.q, a: v.a, b: v.b }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function (v) { return 'Calcula $f(' + v.a + ', ' + v.b + ')$.'; },
          answer: function (v) { return tpl(v).f0; },
          solution: function (v) { return '$f(' + v.a + ', ' + v.b + ') = ' + lead(v.p, '(' + v.a + ')^2(' + v.b + ')') + (v.q < 0 ? ' - ' : ' + ') + (Math.abs(v.q) === 1 ? '' : Math.abs(v.q)) + '(' + v.b + ')^2 = ' + tpl(v).f0 + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function (v) { return 'Calcula $f_x(' + v.a + ', ' + v.b + ')$.'; },
          answer: function (v) { return tpl(v).fx; },
          solution: function (v) { return '$f_x = ' + lead(2 * v.p, 'xy') + '$ (la $y$ se trata como constante), así que $f_x(' + v.a + ', ' + v.b + ') = ' + tpl(v).fx + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function (v) { return 'Calcula $f_y(' + v.a + ', ' + v.b + ')$.'; },
          answer: function (v) { return tpl(v).fy; },
          solution: function (v) { return '$f_y = ' + lead(v.p, 'x^2') + term(2 * v.q, 'y') + '$, así que $f_y(' + v.a + ', ' + v.b + ') = ' + tpl(v).fy + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 4,
          prompt: function (v) { return 'Con tus incisos a), b) y c), usa el plano tangente $L(x, y) = f(a, b) + f_x\\,(x - a) + f_y\\,(y - b)$ para estimar $f(' + fx(v.a + v.dx, 1) + ', ' + fx(v.b + v.dy, 1) + ')$.'; },
          answer: function (v, prev) { return prev[0] + prev[1] * v.dx + prev[2] * v.dy; },
          solution: function (v) {
            var s = tpl(v);
            return '$L = ' + s.f0 + ' + (' + s.fx + ')(' + fx(v.dx, 1) + ') + (' + s.fy + ')(' + fx(v.dy, 1) + ') = ' + fx(s.L) + '$. El valor exacto es $' + fx(s.real, 4) + '$: el plano tangente aproxima bien cerca del punto.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-cono', tags: ['c2.S05', 'c2.S04'], block: 'A', title: 'El error en el volumen de un cono',
      vars: { r: [3, 9, 1], h: [8, 20, 2], dr: [0.05, 0.2, 0.05], dh: [0.1, 0.4, 0.1] },
      statement: function (v) { return '<p>Un embudo cónico mide $r = ' + v.r + '$ cm de radio y $h = ' + v.h + '$ cm de altura, con incertidumbres de $\\pm ' + v.dr + '$ cm en el radio y $\\pm ' + v.dh + '$ cm en la altura. Su volumen es $V = \\dfrac{1}{3}\\pi r^2 h$.</p>'; },
      diagram: { id: 'c2exam-cono', state: function (v) { return { r: v.r, h: v.h }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'cm³',
          prompt: function () { return '¿Cuál es el volumen calculado con las medidas?'; },
          answer: function (v) { return con(v).V; },
          solution: function (v) { return '$V = \\dfrac{1}{3}\\pi(' + v.r + ')^2(' + v.h + ') \\approx ' + fx(con(v).V) + '$ cm³.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'cm²',
          prompt: function () { return 'Calcula $\\dfrac{\\partial V}{\\partial r}$ con esas medidas.'; },
          answer: function (v) { return con(v).Vr; },
          solution: function (v) { return '$\\dfrac{\\partial V}{\\partial r} = \\dfrac{2}{3}\\pi r h = \\dfrac{2}{3}\\pi(' + v.r + ')(' + v.h + ') \\approx ' + fx(con(v).Vr) + '$ cm².'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'cm²',
          prompt: function () { return 'Calcula $\\dfrac{\\partial V}{\\partial h}$ con esas medidas.'; },
          answer: function (v) { return con(v).Vh; },
          solution: function (v) { return '$\\dfrac{\\partial V}{\\partial h} = \\dfrac{1}{3}\\pi r^2 = \\dfrac{1}{3}\\pi(' + v.r + ')^2 \\approx ' + fx(con(v).Vh) + '$ cm².'; }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'cm³',
          prompt: function () { return 'Con tus incisos b) y c), estima con la diferencial total el error máximo del volumen.'; },
          answer: function (v, prev) { return Math.abs(prev[1]) * v.dr + Math.abs(prev[2]) * v.dh; },
          solution: function (v) { var s = con(v); return 'En el peor caso los errores se suman: $|dV| = ' + fx(s.Vr) + '(' + v.dr + ') + ' + fx(s.Vh) + '(' + v.dh + ') \\approx ' + fx(s.dV) + '$ cm³.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: '%',
          prompt: function () { return 'Con tus incisos a) y d), ¿qué error porcentual tiene el volumen?'; },
          answer: function (v, prev) { return prev[3] / prev[0] * 100; },
          solution: function (v) { var s = con(v); return '$\\dfrac{' + fx(s.dV) + '}{' + fx(s.V) + '}\\times 100 \\approx ' + fx(s.pct) + '\\,\\%$. Atajo: $2\\dfrac{' + v.dr + '}{' + v.r + '} + \\dfrac{' + v.dh + '}{' + v.h + '}$, por 100: el radio pesa el doble porque va al cuadrado.'; }
        }
      ]
    },
    {
      id: 'c2-ex-gas', tags: ['c2.S04', 'c2.S05'], block: 'A', title: 'Un gas que se calienta y cambia de volumen',
      vars: { n: [1, 4, 1], T: [280, 360, 20], V: [10, 40, 5], dT: [2, 6, 1], dV: [-1.5, 1.5, 0.5] },
      where: function (v) { return v.dV !== 0 && Math.abs(gas(v).dP) >= 1; },
      statement: function (v) { return '<p>Un gas ideal cumple $P = \\dfrac{nRT}{V}$, con $R = 8.31$ J/(mol·K); si $V$ está en litros, $P$ sale en kPa. Un tanque tiene $n = ' + v.n + '$ mol a $T = ' + v.T + '$ K en $V = ' + v.V + '$ L. Se calienta $' + v.dT + '$ K y su volumen cambia $' + fx(v.dV, 1) + '$ L.</p>'; },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var P = function (V) { return v.n * R_GAS * v.T / V; }, P1 = v.n * R_GAS * (v.T + v.dT) / (v.V + v.dV);
          return {
            x: [v.V * 0.5, v.V * 1.6], fns: [{ f: P, label: 'T = ' + v.T + ' K' }], tangent: { f: P, x0: v.V, len: v.V * 0.25 },
            pts: [{ x: v.V, y: P(v.V), label: 'inicio' }, { x: v.V + v.dV, y: P1, label: 'final' }],
            xlab: 'V (L)', ylab: 'P (kPa)', label: 'La isoterma P = nRT/V con su tangente en el estado inicial y el estado final del gas.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'kPa',
          prompt: function () { return '¿Cuál es la presión inicial?'; },
          answer: function (v) { return gas(v).P; },
          solution: function (v) { return '$P = \\dfrac{' + v.n + '(8.31)(' + v.T + ')}{' + v.V + '} \\approx ' + fx(gas(v).P) + '$ kPa.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'kPa/K',
          prompt: function () { return 'Calcula $\\dfrac{\\partial P}{\\partial T}$ en el estado inicial.'; },
          answer: function (v) { return gas(v).PT; },
          solution: function (v) { return 'Con $V$ fijo, $P$ es una recta en $T$: $\\dfrac{\\partial P}{\\partial T} = \\dfrac{nR}{V} = \\dfrac{' + v.n + '(8.31)}{' + v.V + '} \\approx ' + fx(gas(v).PT, 3) + '$ kPa/K.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'kPa/L',
          prompt: function () { return 'Calcula $\\dfrac{\\partial P}{\\partial V}$ en el estado inicial. (Fíjate que $-\\dfrac{nRT}{V^2} = -\\dfrac{P}{V}$: puedes usar tu presión del inciso a).)'; },
          answer: function (v, prev) { return -prev[0] / v.V; },
          solution: function (v) { return '$\\dfrac{\\partial P}{\\partial V} = -\\dfrac{nRT}{V^2} = -\\dfrac{' + fx(gas(v).P) + '}{' + v.V + '} \\approx ' + fx(gas(v).PV, 3) + '$ kPa/L.'; }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'kPa',
          prompt: function () { return 'Con tus incisos b) y c), estima con la diferencial total cuánto cambia la presión.'; },
          answer: function (v, prev) { return prev[1] * v.dT + prev[2] * v.dV; },
          solution: function (v) {
            var s = gas(v);
            return '$dP = P_T\\,dT + P_V\\,dV = (' + fx(s.PT, 3) + ')(' + v.dT + ') + (' + fx(s.PV, 3) + ')(' + fx(v.dV, 1) + ') \\approx ' + fx(s.dP) + '$ kPa. El cambio exacto es $' + fx(s.real) + '$ kPa.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-placa', tags: ['c2.S04', 'c2.S01'], block: 'A', title: 'Las isotermas de una placa',
      vars: { a: [1, 4, 1], b: [1, 4, 1], x0: [-3, 3, 1], y0: [-3, 3, 1] },
      where: function (v) { return v.a !== v.b && v.x0 !== 0 && v.y0 !== 0; },
      statement: function (v) { return '<p>La temperatura de una placa es $T(x, y) = 20 + ' + lead(v.a, 'x^2') + ' + ' + lead(v.b, 'y^2') + '$ °C, con $x$, $y$ en cm. Un sensor está en $P(' + v.x0 + ', ' + v.y0 + ')$.</p>'; },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var s = plc(v), cs = [];
          [0.2, 0.5, 1].forEach(function (f) {
            var A = s.A * Math.sqrt(f), B = s.B * Math.sqrt(f);
            cs.push({ xy: function (t) { return [A * Math.cos(t), B * Math.sin(t)]; }, t0: 0, t1: TAU, cls: f === 1 ? 'ref' : 'aux', w: f === 1 ? 3 : 1.6 });
          });
          return {
            x: [-s.A - 0.8, s.A + 0.8], y: [-s.B - 0.8, s.B + 1.6], equal: true, curves: cs,
            pts: [{ x: v.x0, y: v.y0, label: 'P' }], xlab: 'x (cm)', ylab: 'y (cm)',
            label: 'Mapa de isotermas de la placa: elipses centradas en el origen; la gruesa pasa por el sensor P.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: '°C',
          prompt: function () { return '¿Qué temperatura marca el sensor?'; },
          answer: function (v) { return plc(v).k; },
          solution: function (v) { return '$T(' + v.x0 + ', ' + v.y0 + ') = 20 + ' + v.a + '(' + v.x0 + ')^2 + ' + v.b + '(' + v.y0 + ')^2 = ' + plc(v).k + '$ °C.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'cm',
          prompt: function () { return 'La isoterma que pasa por $P$ es la curva de nivel $T(x, y) = k$ con tu temperatura del inciso a). Es una elipse: ¿hasta qué $x > 0$ llega sobre el eje $x$?'; },
          answer: function (v, prev) { return Math.sqrt(Math.max(0, (prev[0] - 20) / v.a)); },
          solution: function (v) { var s = plc(v); return 'Sobre el eje $x$, $y = 0$: $20 + ' + lead(v.a, 'x^2') + ' = ' + s.k + '$, así que $x = \\sqrt{' + (s.k - 20) + '/' + v.a + '} \\approx ' + fx(s.A) + '$ cm.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: '°C/cm',
          prompt: function () { return 'Calcula $T_x$ en $P$.'; },
          answer: function (v) { return plc(v).Tx; },
          solution: function (v) { return '$T_x = ' + 2 * v.a + 'x$, así que $T_x(' + v.x0 + ', ' + v.y0 + ') = ' + plc(v).Tx + '$ °C/cm.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '°C/cm',
          prompt: function () { return 'Calcula $T_y$ en $P$.'; },
          answer: function (v) { return plc(v).Ty; },
          solution: function (v) { return '$T_y = ' + 2 * v.b + 'y$, así que $T_y(' + v.x0 + ', ' + v.y0 + ') = ' + plc(v).Ty + '$ °C/cm.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3,
          prompt: function () { return 'Sobre la isoterma la temperatura no cambia: $T_x\\,dx + T_y\\,dy = 0$. Con tus incisos c) y d), ¿cuál es la pendiente $dy/dx$ de la isoterma en $P$?'; },
          answer: function (v, prev) { return -prev[2] / prev[3]; },
          solution: function (v) { var s = plc(v); return '$\\dfrac{dy}{dx} = -\\dfrac{T_x}{T_y} = -\\dfrac{' + s.Tx + '}{' + s.Ty + '} \\approx ' + fx(s.m) + '$.'; }
        }
      ]
    }
  ]);
})();
