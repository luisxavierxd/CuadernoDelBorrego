/* =====================================================================
   Problemas de examen · Cálculo 2. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Bloque A (S01–S05): 8 problemas. Ángulos en radianes; en esféricas
   (ρ, θ, φ), φ se mide desde el eje z positivo (como en las sesiones).
   Bloque B (S06–S10): 8 problemas. Las direcciones en el plano, en grados
   desde el eje x positivo en sentido antihorario (como en S08); Lagrange con
   ∇f = λ∇g (+ μ∇h), como en S09 y S10.
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

  /* ---------- Bloque B ---------- */
  var DEG = 180 / Math.PI;
  function n360(d) { var u = d % 360; if (u < 0) u += 360; return u > 360 - 1e-9 ? 0 : u; }
  // El examen prueba el arrastre con a) mal (a × 1.37 + 1): se descartan las a) donde ese error caería en la tolerancia.
  function farA(x) { return Math.abs(0.37 * x + 1) > 0.05 + 0.02 * Math.abs(x); }
  // Ventana [lo − m, hi + m] que contiene los valores dados.
  function win(list, m) { return [Math.min.apply(null, list) - m, Math.max.apply(null, list) + m]; }
  // Ángulo de referencia y cuadrante de ⟨u, w⟩, para explicar el ángulo en grados desde +x.
  function quadTex(u, w) {
    var ref = Math.atan(Math.abs(w / u)) * DEG, r = fx(ref);
    if (u > 0 && w > 0) return 'Las dos componentes son positivas (cuadrante I): $\\theta \\approx ' + r + '°$.';
    if (u < 0 && w > 0) return 'Componente $x$ negativa y $y$ positiva (cuadrante II): $\\theta \\approx 180° - ' + r + '° = ' + fx(180 - ref) + '°$.';
    if (u < 0) return 'Las dos componentes son negativas (cuadrante III): $\\theta \\approx 180° + ' + r + '° = ' + fx(180 + ref) + '°$.';
    return 'Componente $x$ positiva y $y$ negativa (cuadrante IV): $\\theta \\approx 360° - ' + r + '° = ' + fx(360 - ref) + '°$.';
  }
  // z = p x y² + q x² sobre x = t² + m, y = k t, en t0; estimación en t0 + 0.1.
  function cad(v) {
    var X = function (t) { return t * t + v.m; }, Y = function (t) { return v.k * t; };
    var f = function (x, y) { return v.p * x * y * y + v.q * x * x; };
    var x0 = X(v.t0), y0 = Y(v.t0), f0 = f(x0, y0), fxv = v.p * y0 * y0 + 2 * v.q * x0, fyv = 2 * v.p * x0 * y0;
    var xp = 2 * v.t0, dz = fxv * xp + fyv * v.k, DT = 0.1;
    return {
      f: f, x0: x0, y0: y0, f0: f0, fx: fxv, fy: fyv, xp: xp, dz: dz, dt: DT, est: f0 + dz * DT,
      real: f(X(v.t0 + DT), Y(v.t0 + DT)), z: function (t) { return f(X(t), Y(t)); }
    };
  }
  // f = p x² + q x y + r y² en P(x0, y0), hacia Q(x1, y1).
  function drc(v) {
    var fxv = 2 * v.p * v.x0 + v.q * v.y0, fyv = v.q * v.x0 + 2 * v.r * v.y0, dx = v.x1 - v.x0, dy = v.y1 - v.y0, L = Math.hypot(dx, dy);
    var du = (fxv * dx + fyv * dy) / L, M = Math.hypot(fxv, fyv);
    return {
      f: function (x, y) { return v.p * x * x + v.q * x * y + v.r * y * y; },
      fx: fxv, fy: fyv, dx: dx, dy: dy, L: L, du: du, M: M, ang: Math.acos(clamp1(du / M)) * DEG
    };
  }
  // Placa T = T0 + c x − a x² − b y² en P(x0, y0): dirección y razón de máximo enfriamiento.
  function enf(v) {
    var f = function (x, y) { return v.T0 + v.c * x - v.a * x * x - v.b * y * y; };
    var Tx = v.c - 2 * v.a * v.x0, Ty = -2 * v.b * v.y0, M = Math.hypot(Tx, Ty);
    return { f: f, T: f(v.x0, v.y0), Tx: Tx, Ty: Ty, M: M, deg: n360(Math.atan2(-Ty, -Tx) * DEG), rate: -M, perS: -M * v.s };
  }
  // Curva de nivel F = a x² + b x y + y² = k por P(x0, y0): pendientes y ordenada al origen de la tangente.
  function niv(v) {
    var F = function (x, y) { return v.a * x * x + v.b * x * y + y * y; };
    var k = F(v.x0, v.y0), Fx = 2 * v.a * v.x0 + v.b * v.y0, Fy = v.b * v.x0 + 2 * v.y0, m = -Fx / Fy;
    return { F: F, k: k, Fx: Fx, Fy: Fy, m: m, n: Fy / Fx, b0: v.y0 - m * v.x0 };
  }
  // Terreno: máx A = xy con (k + 1) x + 2y = L.
  function cer(v) {
    var K = v.k + 1, x = v.L / (2 * K), y = v.L / 4;
    return { K: K, x: x, y: y, A: x * y, lam: x / 2, est: x * y + x / 2 * v.dL, real: (v.L + v.dL) * (v.L + v.dL) / (8 * K) };
  }
  // Canal y = a x², dron en (0, d): punto más cercano con f = x² + (y − d)².
  function can(v) {
    var lam = -1 / v.a, y = v.d + lam / 2, x = Math.sqrt(y / v.a), dist = Math.hypot(x, y - v.d);
    return { lam: lam, x: x, y: y, dist: dist, gain: v.d - dist };
  }
  // Plano a x + b y + z = c ∩ cilindro x² + y² = R²: puntos más alto y más bajo, y μ.
  function pci(v) {
    var N = Math.hypot(v.a, v.b);
    return { N: N, x: -v.R * v.a / N, y: -v.R * v.b / N, hi: v.c + v.R * N, mu: N / (2 * v.R), lo: v.c - v.R * N };
  }
  // Recta x + y + k z = c1, x − y = c2: punto más cercano al origen.
  function rct(v) {
    var lam = 2 * v.c1 / (2 + v.k * v.k), mu = v.c2, x = (lam + mu) / 2, y = (lam - mu) / 2, z = v.k * lam / 2;
    return { lam: lam, mu: mu, x: x, y: y, z: z, d: Math.sqrt(x * x + y * y + z * z) };
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
    },

    /* ================= Bloque B · Cadena, direccional, gradiente y Lagrange (S06–S10) ================= */
    {
      id: 'c2-ex-cadena', tags: ['c2.S06', 'c2.S04'], block: 'B', title: 'Una función que cambia a lo largo de una curva',
      vars: { p: [1, 3, 1], q: [-3, 3, 1], m: [0, 2, 1], k: [-3, 3, 1], t0: [0.5, 1.5, 0.5] },
      where: function (v) {
        var s = cad(v);
        return v.q !== 0 && v.k !== 0 && Math.abs(s.f0) >= 1 && Math.abs(s.fx) >= 1 && Math.abs(s.fy) >= 1 && Math.abs(s.dz) >= 1 && farA(s.f0);
      },
      statement: function (v) {
        return '<p>Sea $z = f(x, y) = ' + lead(v.p, 'xy^2') + term(v.q, 'x^2') + '$. Un punto recorre la curva $x = t^2' + term(v.m, '') + '$, $y = ' + lead(v.k, 't') + '$, así que $z$ depende de $t$ a través de $x$ y de $y$. Estudia el instante $t = ' + v.t0 + '$.</p>';
      },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var s = cad(v);
          return {
            x: [Math.max(0, v.t0 - 0.8), v.t0 + 0.8], fns: [{ f: s.z, label: 'z(t)' }], tangent: { f: s.z, x0: v.t0, len: 0.3 },
            pts: [{ x: v.t0, y: s.f0, label: 't = ' + v.t0 }], xlab: 't', ylab: 'z',
            label: 'La composición z(t) = f(x(t), y(t)) y su recta tangente en el instante estudiado: su pendiente es dz/dt.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function (v) { return '¿Cuánto vale $z$ en $t = ' + v.t0 + '$? (Primero calcula $x$ y $y$ en ese instante.)'; },
          answer: function (v) { return cad(v).f0; },
          solution: function (v) {
            var s = cad(v);
            return '$x = (' + v.t0 + ')^2' + term(v.m, '') + ' = ' + fx(s.x0, 4) + '$ y $y = ' + v.k + '(' + v.t0 + ') = ' + fx(s.y0, 4) + '$. Entonces $z = ' + lead(v.p, '(' + fx(s.x0, 4) + ')(' + fx(s.y0, 4) + ')^2') + (v.q < 0 ? ' - ' : ' + ') + (Math.abs(v.q) === 1 ? '' : Math.abs(v.q)) + '(' + fx(s.x0, 4) + ')^2 \\approx ' + fx(s.f0) + '$.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $\\dfrac{\\partial z}{\\partial x}$ en ese punto.'; },
          answer: function (v) { return cad(v).fx; },
          solution: function (v) { var s = cad(v); return '$f_x = ' + lead(v.p, 'y^2') + term(2 * v.q, 'x') + '$ (la $y$ queda fija), así que en $(' + fx(s.x0, 4) + ', ' + fx(s.y0, 4) + ')$ vale $' + fx(s.fx) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $\\dfrac{\\partial z}{\\partial y}$ en ese punto.'; },
          answer: function (v) { return cad(v).fy; },
          solution: function (v) { var s = cad(v); return '$f_y = ' + lead(2 * v.p, 'xy') + '$, así que en $(' + fx(s.x0, 4) + ', ' + fx(s.y0, 4) + ')$ vale $' + fx(s.fy) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tus incisos b) y c), usa la regla de la cadena: ¿cuánto vale $\\dfrac{dz}{dt}$ en $t = ' + v.t0 + '$?'; },
          answer: function (v, prev) { return prev[1] * 2 * v.t0 + prev[2] * v.k; },
          solution: function (v) {
            var s = cad(v);
            return '$\\dfrac{dx}{dt} = 2t = ' + fx(s.xp) + '$ y $\\dfrac{dy}{dt} = ' + v.k + '$. Por el árbol: $\\dfrac{dz}{dt} = f_x\\dfrac{dx}{dt} + f_y\\dfrac{dy}{dt} = (' + fx(s.fx) + ')(' + fx(s.xp) + ') + (' + fx(s.fy) + ')(' + v.k + ') \\approx ' + fx(s.dz) + '$.';
          }
        },
        {
          label: 'e', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tus incisos a) y d), estima $z$ en $t = ' + fx(v.t0 + 0.1) + '$ con $z(t_0 + \\Delta t) \\approx z(t_0) + \\dfrac{dz}{dt}\\,\\Delta t$.'; },
          answer: function (v, prev) { return prev[0] + prev[3] * 0.1; },
          solution: function (v) {
            var s = cad(v);
            return '$z \\approx ' + fx(s.f0) + ' + (' + fx(s.dz) + ')(0.1) \\approx ' + fx(s.est) + '$. El valor exacto es $' + fx(s.real) + '$: en un paso corto, la derivada predice bien el cambio.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-direccional', tags: ['c2.S07', 'c2.S08'], block: 'B', title: 'Caminar de P hacia Q',
      vars: { p: [1, 3, 1], q: [-3, 3, 1], r: [-2, 2, 1], x0: [-2, 2, 1], y0: [-2, 2, 1], x1: [-3, 3, 1], y1: [-3, 3, 1] },
      where: function (v) {
        var s = drc(v);
        return v.q !== 0 && v.r !== 0 && Math.abs(s.fx) >= 1 && Math.abs(s.fy) >= 1 && s.L >= 2 && Math.abs(s.du) >= 0.5 && s.ang >= 10 && s.ang <= 170 && farA(s.fx);
      },
      statement: function (v) {
        return '<p>Considera $f(x, y) = ' + lead(v.p, 'x^2') + term(v.q, 'xy') + term(v.r, 'y^2') + '$. Estás en $P(' + v.x0 + ', ' + v.y0 + ')$ y vas a caminar en línea recta hacia $Q(' + v.x1 + ', ' + v.y1 + ')$.</p>';
      },
      diagram: {
        id: 'c2exam-mapa', state: function (v) {
          var s = drc(v);
          return {
            f: s.f, x: win([v.x0, v.x1, 0], 1.3), y: win([v.y0, v.y1, 0], 1.3), hl: s.f(v.x0, v.y0),
            pts: [{ x: v.x0, y: v.y0, label: 'P' }, { x: v.x1, y: v.y1, label: 'Q' }], segs: [{ a: [v.x0, v.y0], b: [v.x1, v.y1], label: 'de P a Q' }],
            hlLabel: 'nivel de P', otherLabel: 'otros niveles',
            label: 'Mapa de curvas de nivel de f con el punto P, el punto Q y el camino recto de P a Q.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $f_x(P)$.'; },
          answer: function (v) { return drc(v).fx; },
          solution: function (v) { return '$f_x = ' + lead(2 * v.p, 'x') + term(v.q, 'y') + '$, así que $f_x(' + v.x0 + ', ' + v.y0 + ') = ' + drc(v).fx + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $f_y(P)$.'; },
          answer: function (v) { return drc(v).fy; },
          solution: function (v) { return '$f_y = ' + lead(v.q, 'x') + term(2 * v.r, 'y') + '$, así que $f_y(' + v.x0 + ', ' + v.y0 + ') = ' + drc(v).fy + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tus incisos a) y b), ¿cuánto vale la derivada direccional $D_{\\mathbf u}f(P)$, con $\\mathbf u$ el vector unitario que apunta de $P$ hacia $Q$?'; },
          answer: function (v, prev) { var dx = v.x1 - v.x0, dy = v.y1 - v.y0; return (prev[0] * dx + prev[1] * dy) / Math.hypot(dx, dy); },
          solution: function (v) {
            var s = drc(v);
            return '$\\vec{PQ} = \\langle ' + s.dx + ', ' + s.dy + '\\rangle$ mide $\\sqrt{' + (s.dx * s.dx + s.dy * s.dy) + '} \\approx ' + fx(s.L) + '$; hay que dividir entre ese largo para tener $\\mathbf u$. $D_{\\mathbf u}f = \\nabla f \\cdot \\mathbf u = \\dfrac{(' + s.fx + ')(' + s.dx + ') + (' + s.fy + ')(' + s.dy + ')}{' + fx(s.L) + '} \\approx ' + fx(s.du) + '$.';
          }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tus incisos a) y b), ¿cuál es la razón de cambio más grande de $f$ en $P$ (en cualquier dirección)?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var s = drc(v); return 'Es $|\\nabla f(P)| = \\sqrt{' + par(s.fx) + '^2 + ' + par(s.fy) + '^2} = \\sqrt{' + (s.fx * s.fx + s.fy * s.fy) + '} \\approx ' + fx(s.M) + '$, en la dirección del gradiente.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: '°',
          prompt: function () { return 'Con tus incisos c) y d), ¿qué ángulo forma la dirección hacia $Q$ con el gradiente $\\nabla f(P)$? Es el ángulo entre los dos vectores, en grados, entre 0° y 180°.'; },
          answer: function (v, prev) { return Math.acos(clamp1(prev[2] / prev[3])) * DEG; },
          solution: function (v) { var s = drc(v); return 'Como $D_{\\mathbf u}f = |\\nabla f|\\cos\\alpha$: $\\cos\\alpha = \\dfrac{' + fx(s.du) + '}{' + fx(s.M) + '}$, así que $\\alpha \\approx ' + fx(s.ang) + '°$.' + (s.ang > 90 ? ' Es mayor que 90°: hacia $Q$, $f$ baja.' : ' Es menor que 90°: hacia $Q$, $f$ sube.'); }
        }
      ]
    },
    {
      id: 'c2-ex-enfriamiento', tags: ['c2.S08', 'c2.S07'], block: 'B', title: 'Por dónde se enfría más rápido una placa',
      vars: { T0: [60, 100, 10], a: [1, 3, 1], b: [1, 4, 1], c: [-4, 4, 2], x0: [-2, 2, 1], y0: [-2, 2, 1], s: [0.5, 2, 0.5] },
      where: function (v) {
        // Que un error en a) se note en c): si T_y domina, el ángulo casi no cambia.
        var s = enf(v), bad = n360(Math.atan2(-s.Ty, -(1.37 * s.Tx + 1)) * DEG);
        return v.a !== v.b && Math.abs(s.Tx) >= 1 && Math.abs(s.Ty) >= 1 && s.deg >= 8 && s.deg <= 352 && farA(s.Tx) && Math.abs(bad - s.deg) > 0.015 * s.deg + 0.05;
      },
      statement: function (v) {
        return '<p>La temperatura de una placa es $T(x, y) = ' + v.T0 + term(v.c, 'x') + ' - ' + lead(v.a, 'x^2') + ' - ' + lead(v.b, 'y^2') + '$ (en °C, con $x$, $y$ en cm). Una hormiga está en $P(' + v.x0 + ', ' + v.y0 + ')$. Mide los ángulos en grados, desde el eje $x$ positivo en sentido antihorario, entre 0° y 360°.</p>';
      },
      diagram: {
        id: 'c2exam-mapa', state: function (v) {
          var s = enf(v), xc = v.c / (2 * v.a);
          return {
            f: s.f, x: win([v.x0, xc, 0], 1.5), y: win([v.y0, 0], 1.5), hl: s.T,
            pts: [{ x: v.x0, y: v.y0, label: 'P' }], hlLabel: 'isoterma de P', otherLabel: 'isotermas',
            label: 'Isotermas de la placa: elipses alrededor del punto más caliente; la gruesa pasa por la hormiga en P.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: '°C/cm',
          prompt: function () { return 'Calcula $T_x(P)$.'; },
          answer: function (v) { return enf(v).Tx; },
          solution: function (v) { return '$T_x = ' + (v.c ? v.c + ' - ' : '-') + lead(2 * v.a, 'x') + '$, así que $T_x(' + v.x0 + ', ' + v.y0 + ') = ' + enf(v).Tx + '$ °C/cm.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: '°C/cm',
          prompt: function () { return 'Calcula $T_y(P)$.'; },
          answer: function (v) { return enf(v).Ty; },
          solution: function (v) { return '$T_y = ' + lead(-2 * v.b, 'y') + '$, así que $T_y(' + v.x0 + ', ' + v.y0 + ') = ' + enf(v).Ty + '$ °C/cm.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: '°',
          prompt: function () { return 'Con tus incisos a) y b): desde $P$, ¿en qué dirección se enfría la placa lo más rápido posible? Da su ángulo.'; },
          answer: function (v, prev) { return n360(Math.atan2(-prev[1], -prev[0]) * DEG); },
          solution: function (v) {
            var s = enf(v);
            return '$T$ baja más rápido en la dirección de $-\\nabla T(P) = \\langle ' + (-s.Tx) + ', ' + (-s.Ty) + '\\rangle$. Ángulo de referencia: $\\arctan\\left|\\dfrac{' + (-s.Ty) + '}{' + (-s.Tx) + '}\\right| \\approx ' + fx(Math.atan(Math.abs(s.Ty / s.Tx)) * DEG) + '°$. ' + quadTex(-s.Tx, -s.Ty);
          }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '°C/cm',
          prompt: function () { return 'Con tus incisos a) y b), ¿a qué razón cambia la temperatura en esa dirección?'; },
          answer: function (v, prev) { return -Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var s = enf(v); return 'En la dirección de $-\\nabla T$ la razón es $-|\\nabla T| = -\\sqrt{' + par(s.Tx) + '^2 + ' + par(s.Ty) + '^2} \\approx ' + fx(s.rate) + '$ °C/cm: negativa, porque la temperatura baja.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: '°C/s',
          prompt: function (v) { return 'La hormiga camina en esa dirección a ' + v.s + ' cm/s. Con tu inciso d), ¿a qué razón cambia la temperatura que siente, en °C por segundo?'; },
          answer: function (v, prev) { return prev[3] * v.s; },
          solution: function (v) { var s = enf(v); return 'Regla de la cadena: $\\dfrac{dT}{dt} = \\dfrac{dT}{ds}\\cdot\\dfrac{ds}{dt} = (' + fx(s.rate) + ')(' + v.s + ') \\approx ' + fx(s.perS) + '$ °C/s.'; }
        }
      ]
    },
    {
      id: 'c2-ex-curva-nivel', tags: ['c2.S08', 'c2.S06'], block: 'B', title: 'Tangente y normal a una curva de nivel',
      vars: { a: [1, 4, 1], b: [-3, 3, 1], x0: [-2, 2, 1], y0: [-2, 2, 1] },
      where: function (v) {
        if (!v.b || v.b * v.b >= 4 * v.a || !v.x0 || !v.y0) return false;
        var s = niv(v);
        return Math.abs(s.Fx) >= 1 && Math.abs(s.Fy) >= 1 && Math.abs(s.m) >= 0.15 && Math.abs(s.m) <= 6 && farA(s.Fx);
      },
      statement: function (v) {
        var s = niv(v);
        return '<p>La elipse $' + lead(v.a, 'x^2') + term(v.b, 'xy') + ' + y^2 = ' + s.k + '$ es la curva de nivel de $F(x, y) = ' + lead(v.a, 'x^2') + term(v.b, 'xy') + ' + y^2$ que pasa por $P(' + v.x0 + ', ' + v.y0 + ')$.</p>';
      },
      diagram: {
        id: 'c2exam-mapa', state: function (v) {
          var s = niv(v), D = 4 * v.a - v.b * v.b, X = Math.sqrt(4 * s.k / D), Y = Math.sqrt(4 * v.a * s.k / D);
          return {
            f: s.F, x: [-X - 1, X + 1], y: [-Y - 1, Y + 1], hl: s.k, only: true,
            pts: [{ x: v.x0, y: v.y0, label: 'P' }], hlLabel: 'F(x, y) = ' + s.k,
            label: 'La elipse F(x, y) = ' + s.k + ' y el punto P sobre ella.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $F_x(P)$.'; },
          answer: function (v) { return niv(v).Fx; },
          solution: function (v) { return '$F_x = ' + lead(2 * v.a, 'x') + term(v.b, 'y') + '$, así que $F_x(' + v.x0 + ', ' + v.y0 + ') = ' + niv(v).Fx + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $F_y(P)$.'; },
          answer: function (v) { return niv(v).Fy; },
          solution: function (v) { return '$F_y = ' + lead(v.b, 'x') + ' + 2y$, así que $F_y(' + v.x0 + ', ' + v.y0 + ') = ' + niv(v).Fy + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tus incisos a) y b), deriva implícitamente: ¿cuánto vale la pendiente $\\dfrac{dy}{dx}$ de la curva en $P$?'; },
          answer: function (v, prev) { return -prev[0] / prev[1]; },
          solution: function (v) { var s = niv(v); return 'Sobre la curva $F$ no cambia: $F_x + F_y\\dfrac{dy}{dx} = 0$, así que $\\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y} = -\\dfrac{' + s.Fx + '}{' + s.Fy + '} \\approx ' + fx(s.m) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'La recta normal a la curva en $P$ va en la dirección de $\\nabla F(P)$. Con tus incisos a) y b), ¿cuál es su pendiente?'; },
          answer: function (v, prev) { return prev[1] / prev[0]; },
          solution: function (v) { var s = niv(v); return '$\\nabla F(P) = \\langle ' + s.Fx + ', ' + s.Fy + '\\rangle$, pendiente $\\dfrac{' + s.Fy + '}{' + s.Fx + '} \\approx ' + fx(s.n) + '$. Comprueba: por la pendiente de la tangente da $-1$, son perpendiculares.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tu inciso c), la recta tangente en $P$ es $y = ' + v.y0 + ' + m\\,(x - ' + par(v.x0) + ')$. ¿En qué valor de $y$ corta al eje $y$?'; },
          answer: function (v, prev) { return v.y0 - prev[2] * v.x0; },
          solution: function (v) { var s = niv(v); return 'En $x = 0$: $y = ' + v.y0 + ' + (' + fx(s.m) + ')(0 - ' + par(v.x0) + ') \\approx ' + fx(s.b0) + '$.'; }
        }
      ]
    },
    {
      id: 'c2-ex-cerca', tags: ['c2.S09'], block: 'B', title: 'El terreno de área máxima',
      vars: { L: [60, 240, 20], k: [2, 4, 1], dL: [5, 20, 5] },
      statement: function (v) {
        var K = v.k + 1;
        return '<p>Con $' + v.L + '$ m de malla se cerca un terreno rectangular de frente $x$ y fondo $y$ (en metros). El frente da a la calle y lleva ' + v.k + ' vueltas de malla; el lado de atrás y los dos laterales llevan una. Así, $' + K + 'x + 2y = ' + v.L + '$. Se busca el área $A = xy$ más grande con $\\nabla A = \\lambda\\nabla g$, donde $g(x, y) = ' + K + 'x + 2y$.</p>';
      },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var s = cer(v), xm = v.L / s.K * 1.05, ym = v.L / 2 * 1.12;
          var hyp = function (A) { return function (x) { var y = A / x; return x > 0 && y <= ym ? y : NaN; }; };
          return {
            x: [0, xm], y: [0, ym],
            fns: [{ f: function (x) { var y = (v.L - s.K * x) / 2; return y >= 0 ? y : NaN; }, label: 'malla', at: xm * 0.15 }, { f: hyp(s.A), cls: 'aux', w: 2.4, label: 'A = cte', at: xm * 0.9 }, { f: hyp(s.A * 0.45), cls: 'aux', w: 1.6, dash: '6 5' }],
            xlab: 'x (m)', ylab: 'y (m)',
            label: 'La recta de la malla y dos curvas de nivel del área, xy = constante: el área máxima está donde una de ellas apenas toca la recta.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Plantea el sistema de Lagrange. ¿Cuánto mide el frente $x$ del terreno de área máxima?'; },
          answer: function (v) { return cer(v).x; },
          solution: function (v) {
            var s = cer(v);
            return '$A_x = \\lambda g_x$: $y = ' + s.K + '\\lambda$. $A_y = \\lambda g_y$: $x = 2\\lambda$. Entonces $y = \\dfrac{' + s.K + 'x}{2}$ y, en la restricción, $' + s.K + 'x + ' + s.K + 'x = ' + v.L + '$: $x = \\dfrac{' + v.L + '}{' + 2 * s.K + '} \\approx ' + fx(s.x) + '$ m.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu $x$ del inciso a) y la restricción, ¿cuánto mide el fondo $y$?'; },
          answer: function (v, prev) { return (v.L - (v.k + 1) * prev[0]) / 2; },
          solution: function (v) { var s = cer(v); return '$y = \\dfrac{' + v.L + ' - ' + s.K + '(' + fx(s.x) + ')}{2} = ' + fx(s.y) + '$ m.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm²',
          prompt: function () { return 'Con tus incisos a) y b), ¿cuál es el área máxima?'; },
          answer: function (v, prev) { return prev[0] * prev[1]; },
          solution: function (v) { var s = cer(v); return '$A = (' + fx(s.x) + ')(' + fx(s.y) + ') \\approx ' + fx(s.A) + '$ m².'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm²/m',
          prompt: function () { return 'De $A_y = \\lambda g_y$ sale $x = 2\\lambda$. Con tu inciso a), ¿cuánto vale $\\lambda$?'; },
          answer: function (v, prev) { return prev[0] / 2; },
          solution: function (v) { var s = cer(v); return '$\\lambda = \\dfrac{x}{2} = \\dfrac{' + fx(s.x) + '}{2} \\approx ' + fx(s.lam) + '$ m² por metro de malla.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: 'm²',
          prompt: function (v) { return 'Consigues ' + v.dL + ' m más de malla. $\\lambda$ dice cuánto crece el área máxima por cada metro extra. Con tus incisos c) y d), estima la nueva área máxima.'; },
          answer: function (v, prev) { return prev[2] + prev[3] * v.dL; },
          solution: function (v) {
            var s = cer(v);
            return '$A \\approx ' + fx(s.A) + ' + (' + fx(s.lam) + ')(' + v.dL + ') \\approx ' + fx(s.est) + '$ m². Resolviendo de nuevo con $' + (v.L + v.dL) + '$ m sale $' + fx(s.real) + '$ m²: $\\lambda$ es una buena estimación.';
          }
        }
      ]
    },
    {
      id: 'c2-ex-canal', tags: ['c2.S09', 'c2.S08'], block: 'B', title: 'El punto del canal más cercano a un dron',
      vars: { a: [0.5, 2, 0.5], d: [2, 6, 1] },
      statement: function (v) {
        return '<p>Un canal tiene el perfil $y = ' + lead(v.a, 'x^2') + '$ (en metros). Un dron está quieto en $D(0, ' + v.d + ')$. Para hallar el punto del canal más cercano al dron, minimiza $f(x, y) = x^2 + (y - ' + v.d + ')^2$ (el cuadrado de la distancia) con la restricción $g(x, y) = y - ' + lead(v.a, 'x^2') + ' = 0$ y $\\nabla f = \\lambda\\nabla g$.</p>';
      },
      diagram: {
        id: 'exam-fn', state: function (v) {
          var s = can(v), X = Math.max(s.x + 1.3, s.dist + 0.7), top = v.d + s.dist + 0.5;
          return {
            x: [-X, X], y: [-0.6, top], equal: true,
            fns: [{ f: function (x) { var y = v.a * x * x; return y <= top + 0.5 ? y : NaN; }, label: 'canal', at: -X * 0.85 }],
            curves: [
              { xy: function (t) { return [s.dist * Math.cos(t), v.d + s.dist * Math.sin(t)]; }, t0: 0, t1: TAU, cls: 'aux', w: 1.6 },
              { xy: function (t) { return [t * s.x, v.d + t * (s.y - v.d)]; }, t0: 0, t1: 1, cls: 'error', w: 2.4 }
            ],
            pts: [{ x: 0, y: v.d, label: 'D' }, { x: s.x, y: s.y, label: 'M' }, { x: -s.x, y: s.y }], xlab: 'x (m)', ylab: 'y (m)',
            label: 'El canal, el dron D y la circunferencia más grande alrededor de D que no cruza el canal: lo toca en los puntos más cercanos.'
          };
        }
      },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function (v) { return 'La ecuación de $x$ es $2x = -' + lead(2 * v.a, '') + '\\lambda x$. Como el punto buscado no es el fondo del canal ($x \\neq 0$), ¿cuánto vale $\\lambda$?'; },
          answer: function (v) { return can(v).lam; },
          solution: function (v) { return '$\\nabla f = \\langle 2x, 2(y - ' + v.d + ')\\rangle$ y $\\nabla g = \\langle -' + lead(2 * v.a, 'x') + ', 1\\rangle$. Si $x \\neq 0$, se divide entre $x$: $2 = -' + lead(2 * v.a, '') + '\\lambda$, así que $\\lambda = -\\dfrac{1}{' + v.a + '} \\approx ' + fx(can(v).lam) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'm',
          prompt: function (v) { return 'La ecuación de $y$ es $2(y - ' + v.d + ') = \\lambda$. Con tu $\\lambda$ del inciso a), ¿cuánto vale la $y$ del punto más cercano?'; },
          answer: function (v, prev) { return v.d + prev[0] / 2; },
          solution: function (v) { var s = can(v); return '$y = ' + v.d + ' + \\dfrac{\\lambda}{2} = ' + v.d + ' + \\dfrac{' + fx(s.lam) + '}{2} \\approx ' + fx(s.y) + '$ m.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu $y$ del inciso b) y la restricción, ¿cuánto vale su $x$ (la positiva)?'; },
          answer: function (v, prev) { return Math.sqrt(Math.max(0, prev[1] / v.a)); },
          solution: function (v) { var s = can(v); return '$x^2 = \\dfrac{y}{' + v.a + '} = \\dfrac{' + fx(s.y) + '}{' + v.a + '}$, así que $x \\approx ' + fx(s.x) + '$ m (y su espejo, $-' + fx(s.x) + '$, está a la misma distancia).'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tus incisos b) y c), ¿cuál es la distancia mínima del dron al canal?'; },
          answer: function (v, prev) { return Math.hypot(prev[2], prev[1] - v.d); },
          solution: function (v) { var s = can(v); return '$\\sqrt{' + fx(s.x) + '^2 + (' + fx(s.y) + ' - ' + v.d + ')^2} \\approx ' + fx(s.dist) + '$ m.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3, unit: 'm',
          prompt: function (v) { return 'El fondo del canal, $(0, 0)$, queda a ' + v.d + ' m del dron. Con tu inciso d), ¿cuántos metros más cerca está el punto que encontraste?'; },
          answer: function (v, prev) { return v.d - prev[3]; },
          solution: function (v) { var s = can(v); return '$' + v.d + ' - ' + fx(s.dist) + ' \\approx ' + fx(s.gain) + '$ m. El fondo no es el punto más cercano: ahí $x = 0$, el caso que se descartó en el inciso a).'; }
        }
      ]
    },
    {
      id: 'c2-ex-plano-cilindro', tags: ['c2.S10', 'c2.S09'], block: 'B', title: 'Lo más alto y lo más bajo de una elipse inclinada',
      vars: { a: [-2, 2, 1], b: [-2, 2, 1], c: [2, 6, 1], R: [1, 2, 1] },
      where: function (v) { return v.a !== 0 && v.b !== 0 && !(Math.abs(v.a) === 2 && Math.abs(v.b) === 2) && farA(pci(v).x); },
      statement: function (v) {
        var pl = lead(v.a, 'x') + term(v.b, 'y') + ' + z';
        return '<p>El plano $' + pl + ' = ' + v.c + '$ corta al cilindro $x^2 + y^2 = ' + v.R * v.R + '$ en una elipse. Buscas sus puntos más alto y más bajo: $f(x, y, z) = z$, con $g = ' + pl + '$, $h = x^2 + y^2$ y $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$.</p>';
      },
      diagram: { id: 'c2exam-plano-cil', state: function (v) { return { a: v.a, b: v.b, c: v.c, R: v.R }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function (v) { return 'La ecuación de $z$ da $\\lambda = 1$; las de $x$ y $y$ quedan $0 = ' + v.a + ' + 2\\mu x$ y $0 = ' + v.b + ' + 2\\mu y$. Con el cilindro, ¿cuál es la $x$ del punto más alto?'; },
          answer: function (v) { return pci(v).x; },
          solution: function (v) {
            var s = pci(v), q = v.a * v.a + v.b * v.b;
            return '$x = -\\dfrac{' + v.a + '}{2\\mu}$, $y = -\\dfrac{' + v.b + '}{2\\mu}$. En el cilindro: $\\dfrac{' + q + '}{4\\mu^2} = ' + v.R * v.R + '$, $\\mu = \\pm\\dfrac{\\sqrt{' + q + '}}{' + 2 * v.R + '}$. Como $z = ' + v.c + ' - ' + par(v.a) + 'x - ' + par(v.b) + 'y = ' + v.c + ' + \\dfrac{' + q + '}{2\\mu}$, lo más alto es con $\\mu > 0$: $x = -\\dfrac{' + v.R + '(' + v.a + ')}{\\sqrt{' + q + '}} \\approx ' + fx(s.x) + '$.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function (v) { return 'Divide las dos ecuaciones: $\\dfrac{y}{x} = \\dfrac{' + v.b + '}{' + v.a + '}$. Con tu $x$ del inciso a), ¿cuál es la $y$ del punto más alto?'; },
          answer: function (v, prev) { return prev[0] * v.b / v.a; },
          solution: function (v) { var s = pci(v); return '$y = ' + fx(s.x) + '\\cdot\\dfrac{' + v.b + '}{' + v.a + '} \\approx ' + fx(s.y) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tus incisos a) y b), ¿cuál es la altura máxima $z$?'; },
          answer: function (v, prev) { return v.c - v.a * prev[0] - v.b * prev[1]; },
          solution: function (v) { var s = pci(v); return 'Del plano: $z = ' + v.c + ' - ' + par(v.a) + '(' + fx(s.x) + ') - ' + par(v.b) + '(' + fx(s.y) + ') \\approx ' + fx(s.hi) + '$ (es $' + v.c + ' + ' + v.R + '\\sqrt{' + (v.a * v.a + v.b * v.b) + '}$).'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu inciso a) y la ecuación $0 = ' + v.a + ' + 2\\mu x$, ¿cuánto vale $\\mu$ en el punto más alto?'; },
          answer: function (v, prev) { return -v.a / (2 * prev[0]); },
          solution: function (v) { var s = pci(v); return '$\\mu = -\\dfrac{' + v.a + '}{2(' + fx(s.x) + ')} \\approx ' + fx(s.mu) + '$. Positivo, como se pidió para el máximo.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3,
          prompt: function () { return 'El punto más bajo es el opuesto, $(-x, -y)$, sobre el mismo plano (la otra raíz, $\\mu < 0$). Con tus incisos a) y b), ¿cuál es la altura mínima?'; },
          answer: function (v, prev) { return v.c + v.a * prev[0] + v.b * prev[1]; },
          solution: function (v) { var s = pci(v); return '$z = ' + v.c + ' - ' + par(v.a) + '(' + fx(-s.x) + ') - ' + par(v.b) + '(' + fx(-s.y) + ') \\approx ' + fx(s.lo) + '$. Los dos extremos quedan a la misma distancia de $z = ' + v.c + '$, la altura del plano sobre el eje del cilindro.'; }
        }
      ]
    },
    {
      id: 'c2-ex-recta-origen', tags: ['c2.S10', 'c2.S09'], block: 'B', title: 'La recta donde se cortan dos planos',
      vars: { k: [-2, 2, 1], c1: [2, 8, 1], c2: [-4, 4, 1] },
      where: function (v) { return v.k !== 0 && v.c2 !== 0; },
      statement: function (v) {
        return '<p>Los planos $x + y' + term(v.k, 'z') + ' = ' + v.c1 + '$ y $x - y = ' + v.c2 + '$ se cortan en una recta. Buscas el punto de la recta más cercano al origen: minimiza $f = x^2 + y^2 + z^2$ con $g = x + y' + term(v.k, 'z') + '$, $h = x - y$ y $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$.</p>';
      },
      diagram: { id: 'c2exam-recta', state: function (v) { return { k: v.k, c1: v.c1, c2: v.c2 }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return 'Despeja $x$, $y$, $z$ en términos de $\\lambda$ y $\\mu$, y sustituye en la primera restricción. ¿Cuánto vale $\\lambda$?'; },
          answer: function (v) { return rct(v).lam; },
          solution: function (v) {
            var s = rct(v), K = 2 + v.k * v.k;
            return 'Las componentes: $2x = \\lambda + \\mu$, $2y = \\lambda - \\mu$, $2z = ' + lead(v.k, '\\lambda') + '$. En $x + y' + term(v.k, 'z') + ' = ' + v.c1 + '$: $\\lambda + \\dfrac{' + v.k * v.k + '\\lambda}{2} = \\dfrac{' + K + '\\lambda}{2} = ' + v.c1 + '$, así que $\\lambda = \\dfrac{' + 2 * v.c1 + '}{' + K + '} \\approx ' + fx(s.lam) + '$.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Sustituye en la segunda restricción. ¿Cuánto vale $\\mu$?'; },
          answer: function (v) { return rct(v).mu; },
          solution: function (v) { return '$x - y = \\dfrac{\\lambda + \\mu}{2} - \\dfrac{\\lambda - \\mu}{2} = \\mu$, así que $\\mu = ' + v.c2 + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tus incisos a) y b), ¿cuál es la $x$ del punto más cercano?'; },
          answer: function (v, prev) { return (prev[0] + prev[1]) / 2; },
          solution: function (v) { var s = rct(v); return '$x = \\dfrac{\\lambda + \\mu}{2} = \\dfrac{' + fx(s.lam) + ' + ' + par(v.c2) + '}{2} \\approx ' + fx(s.x) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu inciso a), ¿cuál es su $z$?'; },
          answer: function (v, prev) { return v.k * prev[0] / 2; },
          solution: function (v) { var s = rct(v); return '$z = \\dfrac{' + lead(v.k, '\\lambda') + '}{2} = \\dfrac{' + v.k + '(' + fx(s.lam) + ')}{2} \\approx ' + fx(s.z) + '$.'; }
        },
        {
          label: 'e', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tus incisos c) y d) (y $y = x - ' + par(v.c2) + '$, de la segunda restricción), ¿a qué distancia del origen está la recta?'; },
          answer: function (v, prev) { return Math.sqrt(prev[2] * prev[2] + Math.pow(prev[2] - v.c2, 2) + prev[3] * prev[3]); },
          solution: function (v) { var s = rct(v); return '$y = ' + fx(s.x) + ' - ' + par(v.c2) + ' = ' + fx(s.y) + '$; $d = \\sqrt{' + fx(s.x) + '^2 + ' + par(fx(s.y)) + '^2 + ' + par(fx(s.z)) + '^2} \\approx ' + fx(s.d) + '$.'; }
        }
      ]
    }
  ]);
})();
