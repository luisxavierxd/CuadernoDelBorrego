/* =====================================================================
   Problemas de examen · Física 3. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   μ₀ = 4π × 10⁻⁷ T·m/A, e = 1.60 × 10⁻¹⁹ C, mₑ = 9.11 × 10⁻³¹ kg,
   mₚ = 1.67 × 10⁻²⁷ kg (los mismos valores que las sesiones y los labs).
   Bloque A (S01–S05): 8 problemas. Bloque B (S06–S10): 8 problemas. Bloque C (S11–S15): 8 problemas.
   Cada bloque va en su propia función, con sus ayudantes, y se concatena a CB_EXAMS.f3.
   Las unidades de cada inciso se eligen para que las respuestas queden,
   casi siempre, entre 0.1 y 10⁴.
   ===================================================================== */

/* ══════════════════════ Bloque A ══════════════════════ */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var e = 1.60e-19, mp = 1.67e-27, u = 1.66e-27, g = 9.81, DEG = 180 / Math.PI, RAD = Math.PI / 180;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sci(v, d) {
    d = d == null ? 2 : d;
    if (v === 0) return '0';
    var p = Math.floor(Math.log10(Math.abs(v)));
    if (p >= -1 && p <= 3) return fx(v, d);
    var m = v / Math.pow(10, p);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; p += 1; }
    return m.toFixed(d) + ' \\times 10^{' + p + '}';
  }
  function sg(n) { return n < 0 ? '(' + fx(n) + ')' : fx(n); }
  var ANG = { abs: 0.5 };

  /* ---------- Cálculos de referencia (los usan answer y solution) ---------- */
  // Brújula: imán A da a µT al este, imán B da b µT al sur, Tierra 50 µT al norte.
  function bru(v) { var N = 50 - v.b, M = Math.hypot(v.a, N); return { N: N, M: M, ang: Math.atan2(v.a, N) * DEG, G: M / 100 }; }
  // Lorentz: q en μC, v = (vx, vy, 0) km/s, B = (0, 0, Bz) T → F en mN; m en mg.
  function lor(v) { var Fx = v.q * v.vy * v.Bz, Fy = -v.q * v.vx * v.Bz, F = Math.hypot(Fx, Fy); return { Fx: Fx, Fy: Fy, F: F, a: F * 1e-3 / (v.m * 1e-6) }; }
  // Espectrómetro: masa A u, carga e, V en kV, B en T. v en 10⁵ m/s, r y d en cm, t en μs.
  function esp(v) { var m = v.A * u, s = Math.sqrt(2 * e * v.V * 1e3 / m), r = m * s / (e * v.B); return { v: s / 1e5, r: r * 100, d: 2 * r * 100, t: Math.PI * m / (e * v.B) * 1e6 }; }
  // Selector (E en kN/C, B1 en T) y luego B2: v en km/s, F en N, r en cm, T en ns.
  function sel(v) { var s = v.E / v.B1; return { v: s, F: e * s * 1e3 * v.B1, r: mp * s * 1e3 / (e * v.B2) * 100, T: 2 * Math.PI * mp / (e * v.B2) * 1e9 }; }
  // Ciclotrón de protones: B en T, R en cm, dV en kV. f en MHz, K en MeV, vueltas, tiempo en μs.
  function cic(v) { var f = e * v.B / (2 * Math.PI * mp) / 1e6, K = Math.pow(e * v.B * v.R / 100, 2) / (2 * mp) / (e * 1e6), n = K * 1e6 / (2 * v.dV * 1e3); return { f: f, K: K, n: n, t: n / f }; }
  // Varilla: m en g, L en cm, B en T.
  function var_(v) { var I = v.m / 1000 * g / (v.L / 100 * v.B), F = 2 * I * v.L / 100 * v.B; return { I: I, F: F, a: (F - v.m / 1000 * g) / (v.m / 1000) }; }
  // Espira semicircular cerrada: I en A, R en cm, B en T.
  function semi(v) { var R = v.R / 100, F = v.I * 2 * R * v.B, mu = v.I * Math.PI * R * R / 2; return { F: F, mu: mu, tau: mu * v.B }; }
  // Bobina rectangular: N, a y b en cm, I en A, B en T, plano a al° del campo. μ en A·m², τ en mN·m, W en mJ.
  function bob(v) { var mu = v.N * v.I * v.a * v.b * 1e-4, th = 90 - v.al; return { mu: mu, th: th, tau: mu * v.B * Math.sin(th * RAD) * 1000, W: mu * v.B * (Math.cos(th * RAD) + 1) * 1000 }; }

  ex.f3 = (ex.f3 || []).concat([
    /* ---------------- S01 · La brújula con dos imanes y la Tierra ---------------- */
    {
      id: 'f3-ex-brujula', tags: ['f3.S01'], block: 'A', title: 'Una brújula entre dos imanes',
      vars: { a: [20, 150, 10], b: [5, 40, 5] },
      where: function (v) { return 50 - v.b >= 10; },
      statement: function (v) {
        return '<p>Sobre una brújula actúan tres campos: el de la Tierra, $50\\ \\mu\\text{T}$ hacia el norte; el de un imán A, $' + v.a + '\\ \\mu\\text{T}$ hacia el este; y el de un imán B, $' + v.b + '\\ \\mu\\text{T}$ hacia el sur.</p>';
      },
      diagram: { id: 'f3exam-brujula', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto vale la componente norte del campo total?'; },
          answer: function (v) { return 50 - v.b; },
          solution: function (v) { return 'Hacia el norte suma la Tierra y resta el imán B: $B_N = 50 - ' + v.b + ' = ' + bru(v).N + '\\ \\mu\\text{T}$.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'µT',
          prompt: function () { return 'Con tu componente de a), ¿cuánto vale la magnitud del campo total?'; },
          answer: function (v, prev) { return Math.hypot(v.a, prev[0]); },
          solution: function (v) { var r = bru(v); return 'Hacia el este solo aporta el imán A. $$|\\vec B| = \\sqrt{B_E^2 + B_N^2} = \\sqrt{' + v.a + '^2 + ' + r.N + '^2} = ' + fx(r.M, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'Con tu componente de a), ¿a cuántos grados del norte hacia el este apunta la aguja?'; },
          answer: function (v, prev) { return Math.atan2(v.a, prev[0]) * DEG; },
          solution: function (v) { var r = bru(v); return '$$\\theta = \\tan^{-1}\\frac{B_E}{B_N} = \\tan^{-1}\\frac{' + v.a + '}{' + r.N + '} = ' + fx(r.ang, 1) + '^\\circ$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'G',
          prompt: function () { return 'Con tu magnitud de b), ¿cuánto vale el campo total en gauss?'; },
          answer: function (v, prev) { return prev[1] / 100; },
          solution: function (v) { return '$1\\ \\text{G} = 100\\ \\mu\\text{T}$: $$|\\vec B| = \\frac{' + fx(bru(v).M, 1) + '}{100} = ' + fx(bru(v).G, 3) + '\\ \\text{G}$$'; } }
      ]
    },

    /* ---------------- S02 · Fuerza de Lorentz por componentes ---------------- */
    {
      id: 'f3-ex-lorentz', tags: ['f3.S02'], block: 'A', title: 'La fuerza sobre una carga, por componentes',
      vars: { q: [-5, 5, 1], vx: [1, 6, 1], vy: [1, 6, 1], Bz: [0.2, 1, 0.2], m: [1, 9, 1] },
      where: function (v) { return v.q !== 0; },
      statement: function (v) {
        return '<p>Una partícula de masa $' + v.m + '\\ \\text{mg}$ y carga $q = ' + v.q + '\\ \\mu\\text{C}$ se mueve con $\\vec v = (' + v.vx + ',\\ ' + v.vy + ',\\ 0)\\ \\text{km/s}$ en un campo magnético $\\vec B = (0,\\ 0,\\ ' + fx(v.Bz, 1) + ')\\ \\text{T}$. Ignora la gravedad. (Con μC, km/s y T, la fuerza sale en mN.)</p>';
      },
      diagram: { id: 'f3exam-lorentz', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'mN',
          prompt: function () { return '¿Qué magnitud tiene la fuerza magnética?'; },
          answer: function (v) { return lor(v).F; },
          solution: function (v) { var r = lor(v); return '$\\vec v$ está en el plano $xy$ y $\\vec B$ sobre $z$: son perpendiculares. $$|\\vec F| = |q|vB = (' + Math.abs(v.q) + ')\\sqrt{' + v.vx + '^2 + ' + v.vy + '^2}\\,(' + fx(v.Bz, 1) + ') = ' + fx(r.F, 3) + '\\ \\text{mN}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'mN',
          prompt: function () { return '¿Cuánto vale $F_x$? (con signo)'; },
          answer: function (v) { return v.q * v.vy * v.Bz; },
          solution: function (v) { return '$$F_x = q(v_yB_z - v_zB_y) = (' + v.q + ')(' + v.vy + ')(' + fx(v.Bz, 1) + ') = ' + fx(lor(v).Fx) + '\\ \\text{mN}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'mN',
          prompt: function () { return '¿Cuánto vale $F_y$? (con signo)'; },
          answer: function (v) { return -v.q * v.vx * v.Bz; },
          solution: function (v) { var r = lor(v); return '$$F_y = q(v_zB_x - v_xB_z) = -(' + v.q + ')(' + v.vx + ')(' + fx(v.Bz, 1) + ') = ' + fx(r.Fy) + '\\ \\text{mN}$$ Comprueba: $\\sqrt{F_x^2 + F_y^2} = ' + fx(r.F, 3) + '$ mN.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu magnitud de a), ¿qué aceleración tiene la partícula?'; },
          answer: function (v, prev) { return prev[0] * 1e-3 / (v.m * 1e-6); },
          solution: function (v) { var r = lor(v); return 'Pasa a SI: $F$ en N y $m$ en kg. $$a = \\frac{F}{m} = \\frac{' + fx(r.F, 3) + '\\times 10^{-3}}{' + v.m + '\\times 10^{-6}} = ' + fx(r.a, 1) + '\\ \\text{m/s}^2$$ Es perpendicular a $\\vec v$: solo la hace girar.'; } }
      ]
    },

    /* ---------------- S03 · Espectrómetro de masas ---------------- */
    {
      id: 'f3-ex-espectro', tags: ['f3.S03'], block: 'A', title: 'El ion en el espectrómetro',
      vars: { A: [10, 40, 1], V: [1, 5, 0.5], B: [0.2, 0.8, 0.1] },
      statement: function (v) {
        return '<p>Un ion de carga $+e$ y masa $' + v.A + 'u$ parte del reposo, se acelera por $' + fx(v.V, 1) + '\\ \\text{kV}$ y entra perpendicular a un campo de $' + fx(v.B, 1) + '\\ \\text{T}$, donde da media vuelta hasta el detector. Usa $e = 1.60\\times 10^{-19}$ C y $u = 1.66\\times 10^{-27}$ kg.</p>';
      },
      diagram: { id: 'f3exam-espectro', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: '×10⁵ m/s',
          prompt: function () { return '¿Con qué rapidez entra al campo? Da el resultado en unidades de $10^{5}$ m/s.'; },
          answer: function (v) { return esp(v).v; },
          solution: function (v) { return '$eV = \\tfrac{1}{2}mv^2$: $$v = \\sqrt{\\frac{2eV}{m}} = \\sqrt{\\frac{2(1.60\\times 10^{-19})(' + fx(v.V * 1e3, 0) + ')}{' + v.A + '(1.66\\times 10^{-27})}} = ' + fx(esp(v).v, 3) + '\\times 10^{5}\\ \\text{m/s}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'cm',
          prompt: function () { return 'Con tu rapidez de a), ¿qué radio describe?'; },
          answer: function (v, prev) { return v.A * u * prev[0] * 1e5 / (e * v.B) * 100; },
          solution: function (v) { var r = esp(v); return '$$r = \\frac{mv}{eB} = \\frac{' + v.A + '(1.66\\times 10^{-27})(' + fx(r.v, 3) + '\\times 10^{5})}{(1.60\\times 10^{-19})(' + fx(v.B, 1) + ')} = ' + fx(r.r, 2) + '\\ \\text{cm}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'cm',
          prompt: function () { return 'Con tu radio de b), ¿a qué distancia de la entrada llega al detector?'; },
          answer: function (v, prev) { return 2 * prev[1]; },
          solution: function (v) { return 'Media vuelta lleva al otro extremo del diámetro: $d = 2r = ' + fx(esp(v).d, 2) + '\\ \\text{cm}$.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'μs',
          prompt: function () { return '¿Cuánto tarda en dar la media vuelta?'; },
          answer: function (v) { return esp(v).t; },
          solution: function (v) { return 'Media vuelta es $T/2$ y no depende de la rapidez: $$\\frac{T}{2} = \\frac{\\pi m}{eB} = \\frac{\\pi(' + v.A + ')(1.66\\times 10^{-27})}{(1.60\\times 10^{-19})(' + fx(v.B, 1) + ')} = ' + fx(esp(v).t, 3) + '\\ \\mu\\text{s}$$'; } }
      ]
    },

    /* ---------------- S03 + S02 · Selector y órbita ---------------- */
    {
      id: 'f3-ex-selector', tags: ['f3.S03', 'f3.S02'], block: 'A', title: 'Del selector a la órbita',
      vars: { E: [10, 90, 10], B1: [0.1, 0.5, 0.1], B2: [0.2, 1, 0.2] },
      statement: function (v) {
        return '<p>Unos protones pasan sin desviarse por un selector de velocidades con $E = ' + v.E + '\\ \\text{kN/C}$ y $B_1 = ' + fx(v.B1, 1) + '\\ \\text{T}$, perpendiculares. Después entran a una región con solo un campo $B_2 = ' + fx(v.B2, 1) + '\\ \\text{T}$, perpendicular a su velocidad. Usa $e = 1.60\\times 10^{-19}$ C y $m_p = 1.67\\times 10^{-27}$ kg.</p>';
      },
      diagram: { id: 'f3exam-selector', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'km/s',
          prompt: function () { return '¿Con qué rapidez salen del selector?'; },
          answer: function (v) { return sel(v).v; },
          solution: function (v) { return '$qE = qvB_1$: $$v = \\frac{E}{B_1} = \\frac{' + v.E + '\\times 10^{3}}{' + fx(v.B1, 1) + '} = ' + fx(sel(v).v, 1) + '\\ \\text{km/s}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu rapidez de a), ¿qué magnitud tiene la fuerza magnética sobre un protón dentro del selector?'; },
          answer: function (v, prev) { return e * prev[0] * 1e3 * v.B1; },
          solution: function (v) { return '$$F_B = evB_1 = (1.60\\times 10^{-19})(' + fx(sel(v).v, 1) + '\\times 10^{3})(' + fx(v.B1, 1) + ') = ' + sci(sel(v).F) + '\\ \\text{N}$$ Es igual a la eléctrica, $eE$.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'cm',
          prompt: function () { return 'Con tu rapidez de a), ¿qué radio describe en $B_2$?'; },
          answer: function (v, prev) { return mp * prev[0] * 1e3 / (e * v.B2) * 100; },
          solution: function (v) { return '$$r = \\frac{m_pv}{eB_2} = \\frac{(1.67\\times 10^{-27})(' + fx(sel(v).v, 1) + '\\times 10^{3})}{(1.60\\times 10^{-19})(' + fx(v.B2, 1) + ')} = ' + fx(sel(v).r, 3) + '\\ \\text{cm}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'ns',
          prompt: function () { return '¿Cuánto tarda un protón en dar una vuelta completa en $B_2$?'; },
          answer: function (v) { return sel(v).T; },
          solution: function (v) { return '$$T = \\frac{2\\pi m_p}{eB_2} = \\frac{2\\pi(1.67\\times 10^{-27})}{(1.60\\times 10^{-19})(' + fx(v.B2, 1) + ')} = ' + fx(sel(v).T, 1) + '\\ \\text{ns}$$ No depende de la rapidez.'; } }
      ]
    },

    /* ---------------- S03 · Ciclotrón ---------------- */
    {
      id: 'f3-ex-ciclotron', tags: ['f3.S03'], block: 'A', title: 'Un ciclotrón de protones',
      vars: { B: [0.5, 2, 0.1], R: [20, 80, 10], dV: [10, 50, 5] },
      statement: function (v) {
        return '<p>Un ciclotrón de protones tiene un campo de $' + fx(v.B, 1) + '\\ \\text{T}$, un radio de $' + v.R + '\\ \\text{cm}$ y un voltaje de $' + v.dV + '\\ \\text{kV}$ entre las des. Usa $e = 1.60\\times 10^{-19}$ C y $m_p = 1.67\\times 10^{-27}$ kg.</p>';
      },
      diagram: { id: 'f3exam-ciclotron', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'MHz',
          prompt: function () { return '¿Con qué frecuencia debe alternar el voltaje?'; },
          answer: function (v) { return cic(v).f; },
          solution: function (v) { return '$$f = \\frac{eB}{2\\pi m_p} = \\frac{(1.60\\times 10^{-19})(' + fx(v.B, 1) + ')}{2\\pi(1.67\\times 10^{-27})} = ' + fx(cic(v).f, 2) + '\\ \\text{MHz}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'MeV',
          prompt: function () { return '¿Qué energía cinética tienen los protones al salir?'; },
          answer: function (v) { return cic(v).K; },
          solution: function (v) { return '$$K = \\frac{e^2B^2R^2}{2m_p} = \\frac{(1.60\\times 10^{-19})^2(' + fx(v.B, 1) + ')^2(' + fx(v.R / 100, 2) + ')^2}{2(1.67\\times 10^{-27})} = ' + fx(cic(v).K, 3) + '\\ \\text{MeV}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'vueltas',
          prompt: function () { return 'Con tu energía de b), ¿cuántas vueltas dan los protones?'; },
          answer: function (v, prev) { return prev[1] * 1e6 / (2 * v.dV * 1e3); },
          solution: function (v) { return 'Cada vuelta cruza el hueco dos veces y gana $2e\\Delta V = ' + fx(2 * v.dV, 0) + '\\ \\text{keV}$: $$N = \\frac{' + fx(cic(v).K * 1000, 0) + '\\ \\text{keV}}{' + fx(2 * v.dV, 0) + '\\ \\text{keV}} = ' + fx(cic(v).n, 1) + '$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'μs',
          prompt: function () { return 'Con tus resultados de a) y c), ¿cuánto tiempo pasan dentro del ciclotrón?'; },
          answer: function (v, prev) { return prev[2] / prev[0]; },
          solution: function (v) { return 'Cada vuelta dura $1/f$: $$t = \\frac{N}{f} = \\frac{' + fx(cic(v).n, 1) + '}{' + fx(cic(v).f, 2) + '\\times 10^{6}\\ \\text{Hz}} = ' + fx(cic(v).t, 2) + '\\ \\mu\\text{s}$$'; } }
      ]
    },

    /* ---------------- S04 · La varilla que flota ---------------- */
    {
      id: 'f3-ex-varilla', tags: ['f3.S04'], block: 'A', title: 'La varilla que flota y luego sube',
      vars: { m: [10, 100, 10], L: [10, 50, 5], B: [0.1, 0.9, 0.1] },
      statement: function (v) {
        return '<p>Una varilla horizontal de $' + v.m + '\\ \\text{g}$ y $' + v.L + '\\ \\text{cm}$ está en un campo magnético horizontal de $' + fx(v.B, 1) + '\\ \\text{T}$, perpendicular a ella. La corriente va en el sentido en que la fuerza magnética apunta hacia arriba. Usa $g = 9.81\\ \\text{m/s}^2$.</p>';
      },
      diagram: { id: 'f3exam-varilla', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'A',
          prompt: function () { return '¿Qué corriente hace que la varilla flote?'; },
          answer: function (v) { return var_(v).I; },
          solution: function (v) { return '$ILB = mg$: $$I = \\frac{mg}{LB} = \\frac{(' + fx(v.m / 1000, 3) + ')(9.81)}{(' + fx(v.L / 100, 2) + ')(' + fx(v.B, 1) + ')} = ' + fx(var_(v).I, 3) + '\\ \\text{A}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Ahora se duplica la corriente de a). Con tu corriente de a), ¿qué fuerza magnética siente la varilla?'; },
          answer: function (v, prev) { return 2 * prev[0] * v.L / 100 * v.B; },
          solution: function (v) { return '$$F = (2I)LB = 2(' + fx(var_(v).I, 3) + ')(' + fx(v.L / 100, 2) + ')(' + fx(v.B, 1) + ') = ' + fx(var_(v).F, 4) + '\\ \\text{N}$$'; } },
        { label: 'c', type: 'numeric', points: 4, unit: 'm/s²',
          prompt: function () { return 'Con tu fuerza de b), ¿qué aceleración tiene la varilla hacia arriba?'; },
          answer: function (v, prev) { return (prev[1] - v.m / 1000 * g) / (v.m / 1000); },
          solution: function (v) { return 'Segunda ley de Newton con el peso: $$a = \\frac{F - mg}{m} = \\frac{' + fx(var_(v).F, 4) + ' - (' + fx(v.m / 1000, 3) + ')(9.81)}{' + fx(v.m / 1000, 3) + '} = ' + fx(var_(v).a, 2) + '\\ \\text{m/s}^2$$ Sale $g$: al duplicar la corriente, la fuerza magnética es $2mg$.'; } }
      ]
    },

    /* ---------------- S04 + S05 · Espira semicircular cerrada ---------------- */
    {
      id: 'f3-ex-semicirculo', tags: ['f3.S04', 'f3.S05'], block: 'A', title: 'La espira en forma de D',
      vars: { I: [1, 10, 1], R: [5, 30, 5], B: [0.1, 1, 0.1] },
      statement: function (v) {
        return '<p>Una espira de una vuelta tiene forma de D: un semicírculo de radio $' + v.R + '\\ \\text{cm}$ cerrado por su diámetro. Lleva $' + v.I + '\\ \\text{A}$ y está en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$.</p>';
      },
      diagram: { id: 'f3exam-semicirculo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Si el campo es perpendicular al plano de la espira, ¿qué fuerza siente el tramo recto (el diámetro)?'; },
          answer: function (v) { return semi(v).F; },
          solution: function (v) { return '$$F = I(2R)B = (' + v.I + ')(' + fx(2 * v.R / 100, 2) + ')(' + fx(v.B, 1) + ') = ' + fx(semi(v).F, 3) + '\\ \\text{N}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return 'Con tu resultado de a), ¿qué magnitud tiene la fuerza sobre el tramo curvo?'; },
          answer: function (v, prev) { return prev[0]; },
          solution: function (v) { return 'En un campo uniforme, el arco siente lo mismo que la cuerda que une sus extremos (el diámetro), pero con la corriente en sentido contrario: misma magnitud, $' + fx(semi(v).F, 3) + '$ N, y la fuerza neta sobre la espira cerrada es cero.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'A·m²',
          prompt: function () { return '¿Cuánto vale el momento dipolar de la espira?'; },
          answer: function (v) { return semi(v).mu; },
          solution: function (v) { return 'El área de medio círculo es $\\pi R^2/2$: $$\\mu = I\\frac{\\pi R^2}{2} = (' + v.I + ')\\frac{\\pi(' + fx(v.R / 100, 2) + ')^2}{2} = ' + sci(semi(v).mu, 3) + '\\ \\text{A·m}^2$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'N·m',
          prompt: function () { return 'Ahora el campo (el mismo) se pone en el plano de la espira, paralelo al diámetro. Con tu momento de c), ¿qué torque siente?'; },
          answer: function (v, prev) { return prev[2] * v.B; },
          solution: function (v) { return 'Con el campo en el plano, la normal es perpendicular a $\\vec B$: $\\theta = 90^\\circ$. $$\\tau = \\mu B = (' + sci(semi(v).mu, 3) + ')(' + fx(v.B, 1) + ') = ' + sci(semi(v).tau, 3) + '\\ \\text{N·m}$$'; } }
      ]
    },

    /* ---------------- S05 · Bobina en un campo ---------------- */
    {
      id: 'f3-ex-espira', tags: ['f3.S05'], block: 'A', title: 'El torque y la energía de una bobina',
      vars: { N: [10, 100, 10], a: [4, 12, 1], b: [4, 12, 1], I: [0.5, 3, 0.5], B: [0.2, 1, 0.1], al: [10, 80, 10] },
      where: function (v) { return v.al !== 45; },
      statement: function (v) {
        return '<p>Una bobina rectangular de $' + v.a + '\\ \\text{cm}\\times ' + v.b + '\\ \\text{cm}$ tiene ' + v.N + ' vueltas y lleva $' + fx(v.I, 1) + '\\ \\text{A}$ en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$. El <strong>plano</strong> de la bobina forma $' + v.al + '^\\circ$ con el campo, con $\\vec\\mu$ del lado del campo.</p>';
      },
      diagram: { id: 'f3exam-espira', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'A·m²',
          prompt: function () { return '¿Cuánto vale el momento dipolar de la bobina?'; },
          answer: function (v) { return bob(v).mu; },
          solution: function (v) { return '$$\\mu = NIA = (' + v.N + ')(' + fx(v.I, 1) + ')(' + fx(v.a / 100, 2) + ')(' + fx(v.b / 100, 2) + ') = ' + fx(bob(v).mu, 4) + '\\ \\text{A·m}^2$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: '°', tol: ANG,
          prompt: function () { return '¿Qué ángulo $\\theta$ forma $\\vec\\mu$ con el campo?'; },
          answer: function (v) { return 90 - v.al; },
          solution: function (v) { return '$\\vec\\mu$ es perpendicular al plano: $\\theta = 90^\\circ - ' + v.al + '^\\circ = ' + bob(v).th + '^\\circ$.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'mN·m',
          prompt: function () { return 'Con tus resultados de a) y b), ¿qué torque siente la bobina?'; },
          answer: function (v, prev) { return prev[0] * v.B * Math.sin(prev[1] * RAD) * 1000; },
          solution: function (v) { var r = bob(v); return '$$\\tau = \\mu B\\sin\\theta = (' + fx(r.mu, 4) + ')(' + fx(v.B, 1) + ')\\sin ' + r.th + '^\\circ = ' + fx(r.tau, 2) + '\\ \\text{mN·m}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mJ',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto trabajo hay que hacer para girarla hasta que $\\vec\\mu$ apunte exactamente al revés del campo?'; },
          answer: function (v, prev) { return prev[0] * v.B * (Math.cos(prev[1] * RAD) + 1) * 1000; },
          solution: function (v) { var r = bob(v); return '$U = -\\mu B\\cos\\theta$: de $\\theta = ' + r.th + '^\\circ$ a $180^\\circ$. $$W = U_{180} - U_{\\theta} = \\mu B(1 + \\cos\\theta) = (' + fx(r.mu, 4) + ')(' + fx(v.B, 1) + ')(1 + \\cos ' + r.th + '^\\circ) = ' + fx(r.W, 2) + '\\ \\text{mJ}$$'; } }
      ]
    }
  ]);
})();

/* ══════════════════════ fin Bloque A ══════════════════════ */

/* ══════════════════════ Bloque B ══════════════════════ */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var MU0 = 4 * Math.PI * 1e-7, DEG = 180 / Math.PI;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sg(n, d) { return n < 0 ? '(' + fx(n, d) + ')' : fx(n, d); }
  var ANG = { abs: 0.5 };

  /* ---------- Cálculos de referencia (los usan answer y solution) ---------- */
  // Tramo: I en A, a, x1 (< 0) y x2 en cm. B en µT.
  function tra(v) { var s1 = v.x1 / Math.hypot(v.x1, v.a), s2 = v.x2 / Math.hypot(v.x2, v.a), B = 1e-7 * v.I / (v.a / 100) * (s2 - s1) * 1e6, Bi = 2e-7 * v.I / (v.a / 100) * 1e6; return { s1: s1, s2: s2, B: B, Bi: Bi, r: B / Bi }; }
  // Horquilla: I en A, R en cm. Campos en µT.
  function hor(v) { var Bs = MU0 * v.I / (4 * v.R / 100) * 1e6, Bw = 1e-7 * v.I / (v.R / 100) * 1e6, B = Bs + 2 * Bw; return { Bs: Bs, Bw: Bw, B: B, ang: Math.atan(50 / B) * DEG }; }
  // Bobina plana: N vueltas, I en A, R y z en cm. Campos en µT.
  function bob(v) { var B0 = v.N * MU0 * v.I / (2 * v.R / 100) * 1e6, f = Math.pow(v.R, 3) / Math.pow(v.z * v.z + v.R * v.R, 1.5); return { B0: B0, Bz: B0 * f, f: f, z8: v.R * Math.sqrt(3) }; }
  // Dos alambres con corrientes opuestas, P entre ellos a x cm del primero. µT, µN/m y mN.
  function par(v) { var B1 = 20 * v.I1 / v.x, B2 = 20 * v.I2 / (v.d - v.x), f = 2e-7 * v.I1 * v.I2 / (v.d / 100) * 1e6; return { B1: B1, B2: B2, B: B1 + B2, f: f, F: f * v.L / 1000 }; }
  // Esquina: alambre 1 en (0, 0) saliendo, alambre 2 en (d, 0) entrando, P en (0, h) cm. µT.
  function esq(v) { var r = Math.hypot(v.d, v.h), B1 = 20 * v.I1 / v.h, B2 = 20 * v.I2 / r, Bx = -B1 + B2 * v.h / r, By = B2 * v.d / r; return { r: r, B1: B1, B2: B2, Bx: Bx, By: By, B: Math.hypot(Bx, By) }; }
  // Coaxial: I en A; a, b, b + 1 en mm; r1 = a/2, r2 entre núcleo y forro, r3 = b + 0.5 en el forro. µT.
  function cox(v) { var c = v.b + 1, J = v.I / (Math.PI * v.a * v.a), r1 = v.a / 2, I1 = J * Math.PI * r1 * r1, r3 = v.b + 0.5, I3 = v.I * (c * c - r3 * r3) / (c * c - v.b * v.b); return { c: c, J: J, r1: r1, I1: I1, B1: 2e-7 * I1 / (r1 / 1000) * 1e6, B2: 2e-7 * v.I / (v.r2 / 1000) * 1e6, r3: r3, I3: I3, B3: 2e-7 * I3 / (r3 / 1000) * 1e6 }; }
  // Solenoide: N, L y R en cm, I en A, núcleo K. n en vueltas/m, B en mT, Φ en µWb.
  function sol(v) { var n = v.N / (v.L / 100), B = MU0 * n * v.I * 1000, A = Math.PI * v.R * v.R; return { n: n, B: B, A: A, F: 0.1 * B * A, Bk: v.K * B }; }
  // Espira junto a un alambre: I en A; a, w y h en cm. B en µT, Φ en µWb.
  function flu(v) { var b = v.a + v.w, Ba = 20 * v.I / v.a, Bb = 20 * v.I / b, F = 2e-7 * v.I * (v.h / 100) * Math.log(b / v.a) * 1e6, Fp = 0.5 * (Ba + Bb) * v.h * v.w * 1e-4; return { b: b, Ba: Ba, Bb: Bb, F: F, Fp: Fp, err: (Fp - F) / F * 100 }; }

  ex.f3 = (ex.f3 || []).concat([
    /* ---------------- S06 · Tramo recto ---------------- */
    {
      id: 'f3-ex-tramo', tags: ['f3.S06'], block: 'B', title: 'El campo de un tramo recto',
      vars: { I: [2, 10, 1], a: [2, 6, 1], x1: [-8, -2, 1], x2: [2, 10, 1] },
      statement: function (v) {
        return '<p>Un tramo recto de alambre lleva $' + v.I + '\\ \\text{A}$ hacia la derecha. El punto P está a $a = ' + v.a + '\\ \\text{cm}$ arriba del alambre. Medidos desde el pie de la perpendicular que baja de P, el extremo izquierdo está en $x_1 = ' + v.x1 + '\\ \\text{cm}$ y el derecho en $x_2 = ' + v.x2 + '\\ \\text{cm}$.</p>';
      },
      diagram: { id: 'f3exam-tramo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: '',
          prompt: function () { return '¿Cuánto vale $\\sin\\theta_2$ para el extremo derecho? ($\\theta$ medido desde la perpendicular.)'; },
          answer: function (v) { return v.x2 / Math.hypot(v.x2, v.a); },
          solution: function (v) { return '$$\\sin\\theta_2 = \\frac{x_2}{\\sqrt{x_2^2 + a^2}} = \\frac{' + v.x2 + '}{\\sqrt{' + v.x2 + '^2 + ' + v.a + '^2}} = ' + fx(tra(v).s2, 4) + '$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: '',
          prompt: function () { return '¿Cuánto vale $\\sin\\theta_1$ para el extremo izquierdo, con su signo?'; },
          answer: function (v) { return v.x1 / Math.hypot(v.x1, v.a); },
          solution: function (v) { return '$$\\sin\\theta_1 = \\frac{' + v.x1 + '}{\\sqrt{(' + v.x1 + ')^2 + ' + v.a + '^2}} = ' + fx(tra(v).s1, 4) + '$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'µT',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale $B$ en P?'; },
          answer: function (v, prev) { return 1e-7 * v.I / (v.a / 100) * (prev[0] - prev[1]) * 1e6; },
          solution: function (v) { var t = tra(v); return '$$B = \\frac{\\mu_0 I}{4\\pi a}(\\sin\\theta_2 - \\sin\\theta_1) = \\frac{10^{-7}(' + v.I + ')}{' + fx(v.a / 100, 2) + '}(' + fx(t.s2, 4) + ' - ' + sg(t.s1, 4) + ') = ' + fx(t.B, 2) + '\\ \\mu\\text{T}$$ Con la mano derecha, sale de la página.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: '',
          prompt: function () { return 'Con tu campo de c), ¿qué fracción es del campo de un alambre infinito con la misma corriente, a la misma distancia?'; },
          answer: function (v, prev) { return prev[2] / (2e-7 * v.I / (v.a / 100) * 1e6); },
          solution: function (v) { var t = tra(v); return '$$\\frac{B}{\\mu_0 I/2\\pi a} = \\frac{' + fx(t.B, 2) + '}{' + fx(t.Bi, 2) + '} = ' + fx(t.r, 3) + '$$'; } }
      ]
    },

    /* ---------------- S06 · Horquilla ---------------- */
    {
      id: 'f3-ex-horquilla', tags: ['f3.S06'], block: 'B', title: 'Un alambre en forma de horquilla',
      vars: { I: [2, 10, 1], R: [1, 5, 1] },
      statement: function (v) {
        return '<p>Un alambre largo está doblado en forma de horquilla: dos tramos rectos, paralelos y muy largos, unidos por un semicírculo de radio $R = ' + v.R + '\\ \\text{cm}$. Lleva $' + v.I + '\\ \\text{A}$. Interesa el campo en el centro C del semicírculo, donde también terminan, a la altura de C, los dos tramos rectos.</p>';
      },
      diagram: { id: 'f3exam-horquilla', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto campo produce el semicírculo en C?'; },
          answer: function (v) { return hor(v).Bs; },
          solution: function (v) { return 'Un arco de $\\varphi = \\pi$: $$B_s = \\frac{\\mu_0 I}{4R} = \\frac{(4\\pi\\times 10^{-7})(' + v.I + ')}{4(' + fx(v.R / 100, 2) + ')} = ' + fx(hor(v).Bs, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto campo produce en C <strong>uno</strong> de los tramos rectos?'; },
          answer: function (v) { return hor(v).Bw; },
          solution: function (v) { return 'Cada tramo es semiinfinito y termina al pie de la perpendicular desde C (a distancia $R$): $\\theta_1 = 0$, $\\theta_2 = 90^\\circ$. $$B_w = \\frac{\\mu_0 I}{4\\pi R} = \\frac{10^{-7}(' + v.I + ')}{' + fx(v.R / 100, 2) + '} = ' + fx(hor(v).Bw, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'µT',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale el campo total en C? (Los tres aportes van en el mismo sentido.)'; },
          answer: function (v, prev) { return prev[0] + 2 * prev[1]; },
          solution: function (v) { var h = hor(v); return '$$B = B_s + 2B_w = ' + fx(h.Bs, 2) + ' + 2(' + fx(h.Bw, 2) + ') = ' + fx(h.B, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'En C se suma el campo de la Tierra, $50\\ \\mu\\text{T}$, perpendicular al de la horquilla. Con tu campo de c), ¿qué ángulo forma el campo total con el de la horquilla?'; },
          answer: function (v, prev) { return Math.atan(50 / prev[2]) * DEG; },
          solution: function (v) { var h = hor(v); return '$$\\theta = \\tan^{-1}\\frac{50}{' + fx(h.B, 2) + '} = ' + fx(h.ang, 1) + '^\\circ$$'; } }
      ]
    },

    /* ---------------- S06 · Bobina en su eje ---------------- */
    {
      id: 'f3-ex-bobina', tags: ['f3.S06'], block: 'B', title: 'Una bobina plana, en su centro y en su eje',
      vars: { N: [10, 100, 10], I: [0.5, 3, 0.5], R: [3, 10, 1], z: [2, 12, 2] },
      statement: function (v) {
        return '<p>Una bobina plana de $' + v.N + '$ vueltas apretadas y radio $R = ' + v.R + '\\ \\text{cm}$ lleva $' + fx(v.I, 1) + '\\ \\text{A}$.</p>';
      },
      diagram: { id: 'f3exam-bobina-eje', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto vale $B$ en el centro de la bobina?'; },
          answer: function (v) { return bob(v).B0; },
          solution: function (v) { return '$$B_0 = \\frac{N\\mu_0 I}{2R} = \\frac{' + v.N + '(4\\pi\\times 10^{-7})(' + fx(v.I, 1) + ')}{2(' + fx(v.R / 100, 2) + ')} = ' + fx(bob(v).B0, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'µT',
          prompt: function (v) { return 'Con tu resultado de a), ¿cuánto vale $B$ en el eje, a $z = ' + v.z + '\\ \\text{cm}$ del centro?'; },
          answer: function (v, prev) { return prev[0] * Math.pow(v.R, 3) / Math.pow(v.z * v.z + v.R * v.R, 1.5); },
          solution: function (v) { var b = bob(v); return 'Dividiendo la fórmula del eje entre la del centro: $$B = B_0\\frac{R^3}{(z^2 + R^2)^{3/2}} = ' + fx(b.B0, 1) + '\\cdot\\frac{' + v.R + '^3}{(' + v.z + '^2 + ' + v.R + '^2)^{3/2}} = ' + fx(b.Bz, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '',
          prompt: function () { return 'Con tus resultados de a) y b), ¿qué fracción del campo del centro queda en ese punto?'; },
          answer: function (v, prev) { return prev[1] / prev[0]; },
          solution: function (v) { return '$$\\frac{B}{B_0} = \\frac{' + fx(bob(v).Bz, 2) + '}{' + fx(bob(v).B0, 1) + '} = ' + fx(bob(v).f, 4) + '$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'cm',
          prompt: function () { return '¿A qué distancia del centro, sobre el eje, el campo baja a la octava parte del campo del centro?'; },
          answer: function (v) { return bob(v).z8; },
          solution: function (v) { return '$\\frac{R^3}{(z^2 + R^2)^{3/2}} = \\frac{1}{8}$ da $(z^2 + R^2)^{3/2} = 8R^3$, o sea $z^2 + R^2 = 4R^2$: $$z = \\sqrt 3\\,R = ' + fx(bob(v).z8, 2) + '\\ \\text{cm}$$'; } }
      ]
    },

    /* ---------------- S07 · Dos alambres paralelos ---------------- */
    {
      id: 'f3-ex-paralelos', tags: ['f3.S07'], block: 'B', title: 'Dos alambres con corrientes opuestas',
      vars: { I1: [2, 10, 1], I2: [2, 10, 1], d: [4, 12, 2], x: [1, 3, 1], L: [0.5, 3, 0.5] },
      statement: function (v) {
        return '<p>Dos alambres largos y paralelos, separados $d = ' + v.d + '\\ \\text{cm}$, llevan corrientes en sentidos opuestos: $I_1 = ' + v.I1 + '\\ \\text{A}$ e $I_2 = ' + v.I2 + '\\ \\text{A}$. El punto P está entre ellos, sobre la línea que los une, a $' + v.x + '\\ \\text{cm}$ del alambre 1.</p>';
      },
      diagram: { id: 'f3exam-paralelos', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto campo produce el alambre 1 en P?'; },
          answer: function (v) { return par(v).B1; },
          solution: function (v) { return '$$B_1 = \\frac{\\mu_0 I_1}{2\\pi x} = \\frac{2\\times 10^{-7}(' + v.I1 + ')}{' + fx(v.x / 100, 2) + '} = ' + fx(par(v).B1, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto campo produce el alambre 2 en P?'; },
          answer: function (v) { return par(v).B2; },
          solution: function (v) { return 'El alambre 2 está a $d - x = ' + (v.d - v.x) + '\\ \\text{cm}$: $$B_2 = \\frac{2\\times 10^{-7}(' + v.I2 + ')}{' + fx((v.d - v.x) / 100, 2) + '} = ' + fx(par(v).B2, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale el campo total en P?'; },
          answer: function (v, prev) { return prev[0] + prev[1]; },
          solution: function (v) { var p = par(v); return 'Con corrientes opuestas, entre los alambres los dos campos apuntan igual: $$B = ' + fx(p.B1, 1) + ' + ' + fx(p.B2, 1) + ' = ' + fx(p.B, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'µN/m',
          prompt: function () { return '¿Qué fuerza por metro sienten los alambres? (Solo la magnitud.)'; },
          answer: function (v) { return par(v).f; },
          solution: function (v) { return 'Se repelen (corrientes opuestas). $$\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d} = \\frac{2\\times 10^{-7}(' + v.I1 + ')(' + v.I2 + ')}{' + fx(v.d / 100, 2) + '} = ' + fx(par(v).f, 1) + '\\ \\mu\\text{N/m}$$'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'mN',
          prompt: function (v) { return 'Con tu resultado de d), ¿qué fuerza siente un tramo de $' + fx(v.L, 1) + '\\ \\text{m}$ de cada alambre?'; },
          answer: function (v, prev) { return prev[3] * v.L / 1000; },
          solution: function (v) { return '$$F = \\frac{F}{L}\\cdot L = (' + fx(par(v).f, 1) + '\\ \\mu\\text{N/m})(' + fx(v.L, 1) + '\\ \\text{m}) = ' + fx(par(v).F, 4) + '\\ \\text{mN}$$'; } }
      ]
    },

    /* ---------------- S07 · Campo en la esquina de un triángulo ---------------- */
    {
      id: 'f3-ex-esquina', tags: ['f3.S07'], block: 'B', title: 'Dos alambres y un punto fuera de la línea',
      vars: { I1: [2, 10, 1], I2: [2, 10, 1], d: [3, 8, 1], h: [3, 8, 1] },
      statement: function (v) {
        return '<p>El alambre 1, en el origen, lleva $' + v.I1 + '\\ \\text{A}$ saliendo de la página. El alambre 2, en $(' + v.d + ', 0)\\ \\text{cm}$, lleva $' + v.I2 + '\\ \\text{A}$ entrando. El punto P está en $(0, ' + v.h + ')\\ \\text{cm}$.</p>';
      },
      diagram: { id: 'f3exam-esquina', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto vale la magnitud del campo del alambre 1 en P?'; },
          answer: function (v) { return esq(v).B1; },
          solution: function (v) { return '$$B_1 = \\frac{2\\times 10^{-7}(' + v.I1 + ')}{' + fx(v.h / 100, 2) + '} = ' + fx(esq(v).B1, 2) + '\\ \\mu\\text{T}$$, hacia $-x$ (saliendo gira antihorario; P está arriba).'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto vale la magnitud del campo del alambre 2 en P?'; },
          answer: function (v) { return esq(v).B2; },
          solution: function (v) { var e = esq(v); return '$r_2 = \\sqrt{' + v.d + '^2 + ' + v.h + '^2} = ' + fx(e.r, 3) + '\\ \\text{cm}$: $$B_2 = \\frac{2\\times 10^{-7}(' + v.I2 + ')}{' + fx(e.r / 100, 4) + '} = ' + fx(e.B2, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale la componente $B_x$ del campo total? (con signo)'; },
          answer: function (v, prev) { var r = Math.hypot(v.d, v.h); return -prev[0] + prev[1] * v.h / r; },
          solution: function (v) { var e = esq(v); return 'Como $I_2$ entra, su campo es $B_2(h, d)/r_2$: $$B_x = -B_1 + B_2\\frac{h}{r_2} = -' + fx(e.B1, 2) + ' + ' + fx(e.B2, 2) + '\\cdot\\frac{' + v.h + '}{' + fx(e.r, 3) + '} = ' + fx(e.Bx, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return 'Con tu resultado de b), ¿cuánto vale la componente $B_y$ del campo total?'; },
          answer: function (v, prev) { return prev[1] * v.d / Math.hypot(v.d, v.h); },
          solution: function (v) { var e = esq(v); return 'Solo aporta el alambre 2: $$B_y = B_2\\frac{d}{r_2} = ' + fx(e.B2, 2) + '\\cdot\\frac{' + v.d + '}{' + fx(e.r, 3) + '} = ' + fx(e.By, 2) + '\\ \\mu\\text{T}$$'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return 'Con tus componentes de c) y d), ¿cuánto vale $|\\vec B|$ en P?'; },
          answer: function (v, prev) { return Math.hypot(prev[2], prev[3]); },
          solution: function (v) { var e = esq(v); return '$$|\\vec B| = \\sqrt{' + sg(e.Bx, 2) + '^2 + ' + fx(e.By, 2) + '^2} = ' + fx(e.B, 2) + '\\ \\mu\\text{T}$$'; } }
      ]
    },

    /* ---------------- S08 · Cable coaxial con Ampère ---------------- */
    {
      id: 'f3-ex-coaxial', tags: ['f3.S08'], block: 'B', title: 'Un cable coaxial con la ley de Ampère',
      vars: { I: [1, 10, 1], a: [1, 3, 1], b: [5, 8, 1], r2: [3.5, 4.5, 0.5] },
      where: function (v) { return v.r2 > v.a && v.r2 < v.b; },
      statement: function (v) {
        return '<p>Un cable coaxial tiene un núcleo sólido de radio $a = ' + v.a + '\\ \\text{mm}$ y un forro entre $b = ' + v.b + '\\ \\text{mm}$ y $c = ' + (v.b + 1) + '\\ \\text{mm}$. Lleva $' + v.I + '\\ \\text{A}$ de ida por el núcleo y de vuelta por el forro, repartidos de manera uniforme en cada uno.</p>';
      },
      diagram: { id: 'f3exam-coaxial', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'A/mm²',
          prompt: function () { return '¿Cuánto vale la densidad de corriente en el núcleo?'; },
          answer: function (v) { return cox(v).J; },
          solution: function (v) { return '$$J = \\frac{I}{\\pi a^2} = \\frac{' + v.I + '}{\\pi(' + v.a + ')^2} = ' + fx(cox(v).J, 4) + '\\ \\text{A/mm}^2$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'A',
          prompt: function (v) { return 'Con tu resultado de a), ¿cuánta corriente encierra un círculo de radio $' + fx(v.a / 2, 1) + '\\ \\text{mm}$?'; },
          answer: function (v, prev) { return prev[0] * Math.PI * Math.pow(v.a / 2, 2); },
          solution: function (v) { var c = cox(v); return '$$I_{\\text{enc}} = J\\,\\pi r^2 = ' + fx(c.J, 4) + '\\cdot\\pi(' + fx(c.r1, 1) + ')^2 = ' + fx(c.I1, 3) + '\\ \\text{A}$$ (la cuarta parte de $I$).'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'µT',
          prompt: function (v) { return 'Con tu resultado de b), ¿cuánto vale $B$ a $' + fx(v.a / 2, 1) + '\\ \\text{mm}$ del eje?'; },
          answer: function (v, prev) { return 2e-7 * prev[1] / (v.a / 2000) * 1e6; },
          solution: function (v) { var c = cox(v); return '$$B\\cdot 2\\pi r = \\mu_0 I_{\\text{enc}} \\Rightarrow B = \\frac{2\\times 10^{-7}(' + fx(c.I1, 3) + ')}{' + fx(c.r1 / 1000, 4) + '} = ' + fx(c.B1, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'µT',
          prompt: function (v) { return '¿Cuánto vale $B$ a $' + fx(v.r2, 1) + '\\ \\text{mm}$ del eje (entre núcleo y forro)?'; },
          answer: function (v) { return cox(v).B2; },
          solution: function (v) { return 'Encierra toda la corriente del núcleo: $$B = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + fx(v.r2 / 1000, 4) + '} = ' + fx(cox(v).B2, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'e', type: 'numeric', points: 3, unit: 'µT',
          prompt: function (v) { return '¿Cuánto vale $B$ a $' + fx(v.b + 0.5, 1) + '\\ \\text{mm}$ del eje (dentro del forro)?'; },
          answer: function (v) { return cox(v).B3; },
          solution: function (v) { var c = cox(v); return 'El forro ya regresó parte de la corriente: $$I_{\\text{enc}} = I\\,\\frac{c^2 - r^2}{c^2 - b^2} = ' + v.I + '\\cdot\\frac{' + c.c + '^2 - ' + fx(c.r3, 1) + '^2}{' + c.c + '^2 - ' + v.b + '^2} = ' + fx(c.I3, 3) + '\\ \\text{A},\\qquad B = \\frac{2\\times 10^{-7}(' + fx(c.I3, 3) + ')}{' + fx(c.r3 / 1000, 4) + '} = ' + fx(c.B3, 1) + '\\ \\mu\\text{T}$$'; } }
      ]
    },

    /* ---------------- S09 + S10 · Solenoide, flujo y núcleo ---------------- */
    {
      id: 'f3-ex-solenoide', tags: ['f3.S09', 'f3.S10'], block: 'B', title: 'Un solenoide: campo, flujo y núcleo',
      vars: { N: [200, 1000, 100], L: [10, 40, 5], R: [1, 3, 0.5], I: [0.1, 1, 0.1], K: [20, 200, 20] },
      where: function (v) { return sol(v).Bk < 1500; },
      statement: function (v) {
        return '<p>Un solenoide largo tiene $' + v.N + '$ vueltas en $' + v.L + '\\ \\text{cm}$, radio $' + fx(v.R, 1) + '\\ \\text{cm}$, y lleva $' + fx(v.I, 1) + '\\ \\text{A}$.</p>';
      },
      diagram: { id: 'f3exam-solenoide-nucleo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'vueltas/m',
          prompt: function () { return '¿Cuántas vueltas por metro tiene?'; },
          answer: function (v) { return sol(v).n; },
          solution: function (v) { return '$$n = \\frac{N}{L} = \\frac{' + v.N + '}{' + fx(v.L / 100, 2) + '\\ \\text{m}} = ' + fx(sol(v).n, 0) + '\\ \\text{vueltas/m}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'mT',
          prompt: function () { return 'Con tu resultado de a), ¿cuánto vale $B$ adentro?'; },
          answer: function (v, prev) { return MU0 * prev[0] * v.I * 1000; },
          solution: function (v) { return '$$B = \\mu_0 n I = (4\\pi\\times 10^{-7})(' + fx(sol(v).n, 0) + ')(' + fx(v.I, 1) + ') = ' + fx(sol(v).B, 4) + '\\ \\text{mT}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'µWb',
          prompt: function () { return 'Con tu campo de b), ¿cuánto flujo pasa por la sección transversal del solenoide?'; },
          answer: function (v, prev) { return 0.1 * prev[1] * Math.PI * v.R * v.R; },
          solution: function (v) { var s = sol(v); return '$$\\Phi = BA = (' + fx(s.B / 1000, 6) + '\\ \\text{T})\\cdot\\pi(' + fx(v.R / 100, 3) + ')^2 = ' + fx(s.F, 4) + '\\ \\mu\\text{Wb}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mT',
          prompt: function (v) { return 'Llenas el solenoide con una ferrita de $K_m = ' + v.K + '$. Con tu campo de b), ¿cuánto vale ahora $B$ adentro?'; },
          answer: function (v, prev) { return v.K * prev[1]; },
          solution: function (v) { var s = sol(v); return '$$B = K_m B_0 = ' + v.K + '(' + fx(s.B, 4) + '\\ \\text{mT}) = ' + fx(s.Bk, 2) + '\\ \\text{mT}$$'; } }
      ]
    },

    /* ---------------- S10 · Flujo de un alambre por una espira ---------------- */
    {
      id: 'f3-ex-flujo', tags: ['f3.S10', 'f3.S06'], block: 'B', title: 'El flujo de un alambre por una espira',
      vars: { I: [5, 50, 5], a: [1, 5, 1], w: [2, 10, 1], h: [5, 20, 5] },
      statement: function (v) {
        return '<p>Un alambre largo lleva $' + v.I + '\\ \\text{A}$. En su mismo plano hay una espira rectangular de $' + v.h + '\\ \\text{cm}$ de alto y $' + v.w + '\\ \\text{cm}$ de ancho, con su lado cercano paralelo al alambre y a $a = ' + v.a + '\\ \\text{cm}$ de él.</p>';
      },
      diagram: { id: 'f3exam-flujo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Cuánto vale el campo del alambre en el lado cercano de la espira?'; },
          answer: function (v) { return flu(v).Ba; },
          solution: function (v) { return '$$B_a = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + fx(v.a / 100, 2) + '} = ' + fx(flu(v).Ba, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'µT',
          prompt: function () { return '¿Y en el lado lejano?'; },
          answer: function (v) { return flu(v).Bb; },
          solution: function (v) { return 'El lado lejano está a $b = a + w = ' + flu(v).b + '\\ \\text{cm}$: $$B_b = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + fx(flu(v).b / 100, 2) + '} = ' + fx(flu(v).Bb, 1) + '\\ \\mu\\text{T}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'µWb',
          prompt: function () { return '¿Cuánto flujo pasa por la espira? (Integra: el campo no es uniforme.)'; },
          answer: function (v) { return flu(v).F; },
          solution: function (v) { var f = flu(v); return '$$\\Phi = \\int_a^b\\frac{\\mu_0 I}{2\\pi r}h\\,dr = \\frac{\\mu_0 I h}{2\\pi}\\ln\\frac{b}{a} = (2\\times 10^{-7})(' + v.I + ')(' + fx(v.h / 100, 2) + ')\\ln\\frac{' + f.b + '}{' + v.a + '} = ' + fx(f.F, 4) + '\\ \\mu\\text{Wb}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'µWb',
          prompt: function () { return 'Con tus campos de a) y b), estima el flujo como el promedio de los dos campos por el área de la espira.'; },
          answer: function (v, prev) { return 0.5 * (prev[0] + prev[1]) * v.h * v.w * 1e-4; },
          solution: function (v) { var f = flu(v); return '$$\\Phi \\approx \\frac{B_a + B_b}{2}A = \\frac{' + fx(f.Ba, 1) + ' + ' + fx(f.Bb, 1) + '}{2}\\ \\mu\\text{T}\\times(' + fx(v.h * v.w * 1e-4, 4) + '\\ \\text{m}^2) = ' + fx(f.Fp, 4) + '\\ \\mu\\text{Wb}$$'; } },
        { label: 'e', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Con tus resultados de c) y d), ¿en qué porcentaje se pasa la estimación del valor exacto?'; },
          answer: function (v, prev) { return (prev[3] - prev[2]) / prev[2] * 100; },
          solution: function (v) { var f = flu(v); return '$$\\frac{' + fx(f.Fp, 4) + ' - ' + fx(f.F, 4) + '}{' + fx(f.F, 4) + '}\\times 100 = ' + fx(f.err, 2) + '\\ \\%$$ Como $1/r$ es curva, el promedio de los bordes sobreestima.'; } }
      ]
    }
  ]);
})();

/* ══════════════════════ fin Bloque B ══════════════════════ */

/* ══════════════════════ Bloque C ══════════════════════ */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var MU0 = 4 * Math.PI * 1e-7, TAU = 2 * Math.PI;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function area(r) { return Math.PI * Math.pow(r / 100, 2); }

  /* ---------- Cálculos de referencia (los usan answer y solution) ---------- */
  // Rieles: B en T, L en cm, v en m/s, R en Ω. ε en V, I en A, F en mN, P en mW.
  function rie(v) { var e = v.B * v.L / 100 * v.v, I = e / v.R, F = I * v.L / 100 * v.B * 1000; return { e: e, I: I, F: F, P: F * v.v }; }
  // Bobina: N, r en cm, B1 → B2 en T, dt en ms, R en Ω. ΔΦ en mWb, ε en V, I en A, Q en mC.
  function bob(v) { var dP = (v.B2 - v.B1) * area(v.r) * 1000, e = v.N * dP / 1000 / (v.dt / 1000), I = e / v.R; return { dP: dP, e: e, I: I, Q: I * v.dt }; }
  // Generador: N, lado a en cm, B en T, rpm, t en ms, R en Ω. ω en rad/s, ε en V, I en A.
  function gen(v) { var w = v.rpm * TAU / 60, pk = v.N * v.B * Math.pow(v.a / 100, 2) * w; return { w: w, pk: pk, e: pk * Math.sin(w * v.t / 1000), I: pk / v.R }; }
  // Región: R, r2 en cm, k = dB/dt en T/s, r1 = f·R (cm, a una décima). ε en mV, E en mV/m.
  function r1Of(v) { return Math.round(v.f * v.R * 10) / 10; }
  function reg(v) { var e2 = Math.PI * Math.pow(v.R / 100, 2) * v.k * 1000, r1 = r1Of(v), E1 = r1 / 100 * v.k / 2 * 1000; return { e2: e2, E2: e2 / (TAU * v.r2 / 100), r1: r1, E1: E1, e1: E1 * TAU * r1 / 100 }; }
  // Inductor: N, r y ℓ en cm, k = dI/dt en A/s, I en A. L en mH, ε en mV, B en mT, NΦ en mWb.
  function ind(v) { var L = MU0 * v.N * v.N * area(v.r) / (v.l / 100) * 1000; return { L: L, e: L * v.k, B: MU0 * v.N * v.I / (v.l / 100) * 1000, NP: L * v.I }; }
  // RL que crece: ε en V, R en Ω, L en mH; t = m·τ redondeado (ms). τ en ms, I en A, V_L en V, U en mJ.
  function tRL(v) { return Number((v.m * v.L / v.R).toPrecision(2)); }
  function rlc(v) { var T = v.L / v.R, If = v.e / v.R, t = tRL(v), I = If * (1 - Math.exp(-t / T)); return { T: T, If: If, t: t, I: I, VL: v.e - I * v.R, U: 0.5 * v.L * I * I }; }
  // Descarga de un solenoide: N, r y ℓ en cm, R en Ω, I₀ en A. L en mH, τ en ms, t½ en ms, calor en mJ.
  function rld(v) { var L = MU0 * v.N * v.N * area(v.r) / (v.l / 100) * 1000, T = L / v.R; return { L: L, T: T, th: T * Math.LN2, Q: 0.5 * L * v.I0 * v.I0 }; }
  // Energía de un solenoide: N, r, ℓ en cm, I en A. B en mT, u en J/m³, U en mJ, L en mH.
  function ene(v) { var B = MU0 * v.N * v.I / (v.l / 100), u = B * B / (2 * MU0), U = u * area(v.r) * v.l / 100 * 1000; return { B: B * 1000, u: u, U: U, L: 2 * U / (v.I * v.I) }; }

  ex.f3 = (ex.f3 || []).concat([
    /* ---------------- S11 · Barra sobre rieles ---------------- */
    {
      id: 'f3-ex-rieles', tags: ['f3.S11'], block: 'C', title: 'La barra sobre rieles',
      vars: { B: [0.2, 1.2, 0.1], L: [10, 60, 5], v: [1, 8, 0.5], R: [0.5, 5, 0.5] },
      where: function (v) { var r = rie(v); return r.e >= 0.1 && r.F >= 0.5; },
      statement: function (v) {
        return '<p>Una barra conductora de $' + v.L + '\\ \\text{cm}$ se desliza sin fricción a $' + fx(v.v, 1) + '\\ \\text{m/s}$ sobre dos rieles unidos por un resistor de $' + fx(v.R, 1) + '\\ \\Omega$. Todo está en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$ perpendicular al plano de los rieles.</p>';
      },
      diagram: { id: 'f3exam-rieles', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'V',
          prompt: function () { return '¿Cuánto vale la fem inducida en la barra?'; },
          answer: function (v) { return rie(v).e; },
          solution: function (v) { return 'Fem de movimiento, con $L$ en metros: $$\\varepsilon = BLv = (' + fx(v.B, 1) + ')(' + fx(v.L / 100) + ')(' + fx(v.v, 1) + ') = ' + fx(rie(v).e, 3) + '\\ \\text{V}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'A',
          prompt: function () { return 'Con tu fem de a), ¿qué corriente circula?'; },
          answer: function (v, prev) { return prev[0] / v.R; },
          solution: function (v) { return '$$I = \\frac{\\varepsilon}{R} = \\frac{' + fx(rie(v).e, 3) + '}{' + fx(v.R, 1) + '} = ' + fx(rie(v).I, 4) + '\\ \\text{A}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'mN',
          prompt: function () { return 'Con tu corriente de b), ¿con qué fuerza hay que empujar la barra para que su rapidez no cambie? En mN.'; },
          answer: function (v, prev) { return prev[1] * v.L / 100 * v.B * 1000; },
          solution: function (v) { return 'La fuerza magnética $ILB$ frena la barra; hay que igualarla: $$F = ILB = (' + fx(rie(v).I, 4) + ')(' + fx(v.L / 100) + ')(' + fx(v.B, 1) + ') = ' + fx(rie(v).F, 3) + '\\ \\text{mN}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mW',
          prompt: function () { return 'Con tu fuerza de c), ¿qué potencia entrega quien empuja? En mW.'; },
          answer: function (v, prev) { return prev[2] * v.v; },
          solution: function (v) { var r = rie(v); return 'mN × m/s = mW: $$P = Fv = (' + fx(r.F, 3) + ')(' + fx(v.v, 1) + ') = ' + fx(r.P, 3) + '\\ \\text{mW}$$ Es igual a $I^2R$: toda se disipa en el resistor.'; } }
      ]
    },

    /* ---------------- S11 · Bobina en un campo que cambia ---------------- */
    {
      id: 'f3-ex-bobina-rampa', tags: ['f3.S11', 'f3.S12'], block: 'C', title: 'La bobina en un campo que crece',
      vars: { N: [50, 400, 50], r: [1, 6, 0.5], B1: [0.1, 0.5, 0.1], B2: [0.6, 1.2, 0.1], dt: [20, 200, 20], R: [2, 20, 2] },
      where: function (v) { var b = bob(v); return b.e >= 0.2 && b.Q >= 0.1; },
      statement: function (v) {
        return '<p>Una bobina de $' + v.N + '$ vueltas y $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio, con resistencia total de $' + v.R + '\\ \\Omega$, tiene su eje paralelo a un campo uniforme. El campo crece de manera uniforme de $' + fx(v.B1, 1) + '\\ \\text{T}$ a $' + fx(v.B2, 1) + '\\ \\text{T}$ en $' + v.dt + '\\ \\text{ms}$.</p>';
      },
      diagram: { id: 'f3exam-c-bobina', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'mWb',
          prompt: function () { return '¿Cuánto cambia el flujo por <strong>cada vuelta</strong>? En mWb.'; },
          answer: function (v) { return bob(v).dP; },
          solution: function (v) { return 'Con el radio en metros: $$\\Delta\\Phi = (B_2 - B_1)\\pi r^2 = (' + fx(v.B2 - v.B1, 1) + ')\\pi(' + fx(v.r / 100, 3) + ')^2 = ' + fx(bob(v).dP, 4) + '\\ \\text{mWb}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'V',
          prompt: function () { return 'Con tu cambio de flujo de a), ¿cuánto vale la fem inducida (en valor absoluto)?'; },
          answer: function (v, prev) { return v.N * prev[0] / 1000 / (v.dt / 1000); },
          solution: function (v) { return '$$|\\varepsilon| = N\\,\\frac{\\Delta\\Phi}{\\Delta t} = ' + v.N + '\\cdot\\frac{' + fx(bob(v).dP / 1000, 6) + '}{' + fx(v.dt / 1000, 3) + '} = ' + fx(bob(v).e, 3) + '\\ \\text{V}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'A',
          prompt: function () { return 'Con tu fem de b), ¿qué corriente circula por la bobina?'; },
          answer: function (v, prev) { return prev[1] / v.R; },
          solution: function (v) { return '$$I = \\frac{\\varepsilon}{R} = \\frac{' + fx(bob(v).e, 3) + '}{' + v.R + '} = ' + fx(bob(v).I, 4) + '\\ \\text{A}$$ Por Lenz, circula en el sentido que produce un campo contrario al aumento.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mC',
          prompt: function () { return 'Con tu corriente de c), ¿cuánta carga pasa por la bobina durante el cambio? En mC.'; },
          answer: function (v, prev) { return prev[2] * v.dt; },
          solution: function (v) { return 'A × ms = mC: $$Q = I\\,\\Delta t = (' + fx(bob(v).I, 4) + ')(' + v.dt + ') = ' + fx(bob(v).Q, 3) + '\\ \\text{mC}$$ También es $N\\Delta\\Phi/R$: no depende de $\\Delta t$.'; } }
      ]
    },

    /* ---------------- S12 · Generador ---------------- */
    {
      id: 'f3-ex-generador', tags: ['f3.S12'], block: 'C', title: 'El generador',
      vars: { N: [50, 300, 50], a: [5, 20, 5], B: [0.1, 0.8, 0.1], rpm: [600, 3600, 300], t: [1, 9, 1], R: [10, 100, 10] },
      where: function (v) { var g = gen(v); return Math.abs(Math.sin(g.w * v.t / 1000)) > 0.2 && g.pk >= 1 && g.I >= 0.1; },
      statement: function (v) {
        return '<p>Un generador tiene una bobina cuadrada de $' + v.N + '$ vueltas y $' + v.a + '\\ \\text{cm}$ de lado que gira a $' + v.rpm + '\\ \\text{rpm}$ en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$. En $t = 0$ la normal de la bobina es paralela al campo. Está conectado a una carga de $' + v.R + '\\ \\Omega$ (ignora la resistencia de la bobina).</p>';
      },
      diagram: { id: 'f3exam-generador', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'rad/s',
          prompt: function () { return '¿Cuánto vale la rapidez angular de la bobina?'; },
          answer: function (v) { return gen(v).w; },
          solution: function (v) { return '$$\\omega = \\frac{2\\pi(' + v.rpm + ')}{60} = ' + fx(gen(v).w, 2) + '\\ \\text{rad/s}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'V',
          prompt: function () { return 'Con tu $\\omega$ de a), ¿cuánto vale la fem máxima?'; },
          answer: function (v, prev) { return v.N * v.B * Math.pow(v.a / 100, 2) * prev[0]; },
          solution: function (v) { var g = gen(v); return '$$\\varepsilon_{\\max} = NBA\\omega = ' + v.N + '(' + fx(v.B, 1) + ')(' + fx(Math.pow(v.a / 100, 2), 4) + ')(' + fx(g.w, 2) + ') = ' + fx(g.pk, 2) + '\\ \\text{V}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'V',
          prompt: function (v) { return 'Con tus resultados de a) y b), ¿cuánto vale la fem en $t = ' + v.t + '\\ \\text{ms}$? (Puede ser negativa.)'; },
          answer: function (v, prev) { return prev[1] * Math.sin(prev[0] * v.t / 1000); },
          solution: function (v) { var g = gen(v); return 'Como $\\Phi = BA\\cos\\omega t$, la fem va con el seno (calculadora en radianes): $$\\varepsilon = ' + fx(g.pk, 2) + '\\sin(' + fx(g.w * v.t / 1000, 3) + ') = ' + fx(g.e, 2) + '\\ \\text{V}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'A',
          prompt: function () { return 'Con tu fem máxima de b), ¿cuánto vale la corriente máxima en la carga?'; },
          answer: function (v, prev) { return prev[1] / v.R; },
          solution: function (v) { var g = gen(v); return '$$I_{\\max} = \\frac{\\varepsilon_{\\max}}{R} = \\frac{' + fx(g.pk, 2) + '}{' + v.R + '} = ' + fx(g.I, 3) + '\\ \\text{A}$$'; } }
      ]
    },

    /* ---------------- S12 · Campo eléctrico inducido ---------------- */
    {
      id: 'f3-ex-region', tags: ['f3.S12', 'f3.S11'], block: 'C', title: 'El campo eléctrico inducido',
      vars: { R: [2, 6, 1], r2: [8, 20, 2], k: [0.5, 5, 0.5], f: [0.3, 0.9, 0.1] },
      where: function (v) { var g = reg(v); return g.e2 >= 0.5 && g.E1 >= 0.5 && g.e1 >= 0.1; },
      statement: function (v) {
        return '<p>Dentro de un solenoide largo de $' + v.R + '\\ \\text{cm}$ de radio, el campo magnético es uniforme y crece a razón de $' + fx(v.k, 1) + '\\ \\text{T/s}$; afuera es prácticamente cero. Una espira circular de $' + v.r2 + '\\ \\text{cm}$ de radio rodea al solenoide, coaxial con él.</p>';
      },
      diagram: { id: 'f3exam-region', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'mV',
          prompt: function () { return '¿Cuánto vale la fem inducida en la espira (en valor absoluto)? En mV.'; },
          answer: function (v) { return reg(v).e2; },
          solution: function (v) { return 'Solo hay flujo dentro del solenoide: $$|\\varepsilon| = \\pi R^2\\frac{dB}{dt} = \\pi(' + fx(v.R / 100) + ')^2(' + fx(v.k, 1) + ') = ' + fx(reg(v).e2, 3) + '\\ \\text{mV}$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'mV/m',
          prompt: function () { return 'Con tu fem de a), ¿qué campo eléctrico inducido hay en la espira? En mV/m.'; },
          answer: function (v, prev) { return prev[0] / (TAU * v.r2 / 100); },
          solution: function (v) { return 'Por simetría $E$ es tangente y uniforme en el círculo: $E(2\\pi r_2) = |\\varepsilon|$. $$E = \\frac{' + fx(reg(v).e2, 3) + '}{2\\pi(' + fx(v.r2 / 100) + ')} = ' + fx(reg(v).E2, 3) + '\\ \\text{mV/m}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'mV/m',
          prompt: function (v) { return '¿Qué campo eléctrico inducido hay dentro del solenoide, a $r_1 = ' + fx(r1Of(v), 1) + '\\ \\text{cm}$ del eje? En mV/m.'; },
          answer: function (v) { return reg(v).E1; },
          solution: function (v) { return 'Adentro, el círculo de radio $r_1$ encierra $\\pi r_1^2B$: $$E = \\frac{r_1}{2}\\frac{dB}{dt} = \\frac{' + fx(r1Of(v) / 100, 3) + '}{2}(' + fx(v.k, 1) + ') = ' + fx(reg(v).E1, 3) + '\\ \\text{mV/m}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mV',
          prompt: function (v) { return 'Con tu campo de c), ¿cuánto vale la fem en una espira de radio $r_1$ dentro del solenoide? En mV.'; },
          answer: function (v, prev) { return prev[2] * TAU * r1Of(v) / 100; },
          solution: function (v) { var g = reg(v); return '$$|\\varepsilon| = E\\,(2\\pi r_1) = (' + fx(g.E1, 3) + ')(2\\pi)(' + fx(g.r1 / 100, 3) + ') = ' + fx(g.e1, 3) + '\\ \\text{mV}$$ Es $\\pi r_1^2\\,dB/dt$, como debe ser.'; } }
      ]
    },

    /* ---------------- S13 · Inductancia de un solenoide ---------------- */
    {
      id: 'f3-ex-inductor', tags: ['f3.S13'], block: 'C', title: 'La inductancia de un solenoide',
      vars: { N: [200, 1000, 100], r: [0.5, 2, 0.5], l: [10, 40, 5], k: [5, 100, 5], I: [0.5, 5, 0.5] },
      where: function (v) { var d = ind(v); return d.L >= 0.1 && d.e >= 0.5 && d.NP >= 0.1; },
      statement: function (v) {
        return '<p>Un solenoide de aire tiene $' + v.N + '$ vueltas, $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo.</p>';
      },
      diagram: { id: 'f3exam-c-solenoide', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'mH',
          prompt: function () { return '¿Cuánto vale su inductancia? En mH.'; },
          answer: function (v) { return ind(v).L; },
          solution: function (v) { return '$$L = \\frac{\\mu_0N^2A}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + v.N + ')^2\\,\\pi(' + fx(v.r / 100, 3) + ')^2}{' + fx(v.l / 100) + '} = ' + fx(ind(v).L, 4) + '\\ \\text{mH}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'mV',
          prompt: function (v) { return 'Con tu $L$ de a), ¿qué fem autoinducida aparece cuando la corriente crece a razón de $' + v.k + '\\ \\text{A/s}$? En mV (valor absoluto).'; },
          answer: function (v, prev) { return prev[0] * v.k; },
          solution: function (v) { return 'mH × A/s = mV: $$|\\varepsilon| = L\\,\\frac{dI}{dt} = (' + fx(ind(v).L, 4) + ')(' + v.k + ') = ' + fx(ind(v).e, 3) + '\\ \\text{mV}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'mT',
          prompt: function (v) { return '¿Cuánto vale el campo dentro del solenoide cuando lleva $' + fx(v.I, 1) + '\\ \\text{A}$? En mT.'; },
          answer: function (v) { return ind(v).B; },
          solution: function (v) { return '$$B = \\frac{\\mu_0NI}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + v.N + ')(' + fx(v.I, 1) + ')}{' + fx(v.l / 100) + '} = ' + fx(ind(v).B, 3) + '\\ \\text{mT}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mWb',
          prompt: function (v) { return 'Con tu $L$ de a), ¿cuánto vale el enlace de flujo $N\\Phi$ con $' + fx(v.I, 1) + '\\ \\text{A}$? En mWb.'; },
          answer: function (v, prev) { return prev[0] * v.I; },
          solution: function (v) { return 'mH × A = mWb: $$N\\Phi = LI = (' + fx(ind(v).L, 4) + ')(' + fx(v.I, 1) + ') = ' + fx(ind(v).NP, 4) + '\\ \\text{mWb}$$'; } }
      ]
    },

    /* ---------------- S14 · Circuito RL que crece ---------------- */
    {
      id: 'f3-ex-rl', tags: ['f3.S14', 'f3.S15'], block: 'C', title: 'El circuito RL',
      vars: { e: [6, 24, 2], R: [10, 100, 10], L: [100, 900, 100], m: [0.5, 2.5, 0.5] },
      where: function (v) { var c = rlc(v); return c.T >= 1 && c.I >= 0.1 && c.U >= 0.1; },
      statement: function (v) {
        return '<p>Una batería de $' + v.e + '\\ \\text{V}$ se conecta en $t = 0$ a un resistor de $' + v.R + '\\ \\Omega$ en serie con un inductor de $' + v.L + '\\ \\text{mH}$.</p>';
      },
      diagram: { id: 'f3exam-rl', state: function (v) { return { e: v.e, R: v.R, L: v.L, sw: 'a' }; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'ms',
          prompt: function () { return '¿Cuánto vale la constante de tiempo? En ms.'; },
          answer: function (v) { return v.L / v.R; },
          solution: function (v) { return '$$\\tau = \\frac{L}{R} = \\frac{' + v.L + '\\ \\text{mH}}{' + v.R + '\\ \\Omega} = ' + fx(rlc(v).T, 3) + '\\ \\text{ms}$$'; } },
        { label: 'b', type: 'numeric', points: 1, unit: 'A',
          prompt: function () { return '¿Cuánto vale la corriente final?'; },
          answer: function (v) { return v.e / v.R; },
          solution: function (v) { return '$$I_f = \\frac{\\varepsilon}{R} = ' + fx(rlc(v).If, 4) + '\\ \\text{A}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'A',
          prompt: function (v) { return 'Con tus resultados de a) y b), ¿cuánta corriente circula en $t = ' + tRL(v) + '\\ \\text{ms}$?'; },
          answer: function (v, prev) { return prev[1] * (1 - Math.exp(-tRL(v) / prev[0])); },
          solution: function (v) { var c = rlc(v); return '$$I = I_f\\left(1 - e^{-t/\\tau}\\right) = ' + fx(c.If, 4) + '\\left(1 - e^{-' + c.t + '/' + fx(c.T, 3) + '}\\right) = ' + fx(c.I, 4) + '\\ \\text{A}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'V',
          prompt: function () { return 'Con tu corriente de c), ¿qué voltaje tiene el inductor en ese instante?'; },
          answer: function (v, prev) { return v.e - prev[2] * v.R; },
          solution: function (v) { var c = rlc(v); return 'Por la regla de mallas: $$V_L = \\varepsilon - IR = ' + v.e + ' - (' + fx(c.I, 4) + ')(' + v.R + ') = ' + fx(c.VL, 3) + '\\ \\text{V}$$'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'mJ',
          prompt: function () { return 'Con tu corriente de c), ¿cuánta energía guarda el inductor en ese instante? En mJ.'; },
          answer: function (v, prev) { return 0.5 * v.L * prev[2] * prev[2]; },
          solution: function (v) { var c = rlc(v); return 'mH × A² = mJ: $$U = \\tfrac{1}{2}LI^2 = \\tfrac{1}{2}(' + v.L + ')(' + fx(c.I, 4) + ')^2 = ' + fx(c.U, 3) + '\\ \\text{mJ}$$'; } }
      ]
    },

    /* ---------------- S13 + S14 · Un solenoide que se descarga ---------------- */
    {
      id: 'f3-ex-rl-descarga', tags: ['f3.S14', 'f3.S13', 'f3.S15'], block: 'C', title: 'El solenoide que se descarga',
      vars: { N: [500, 2000, 100], r: [1, 3, 0.5], l: [10, 30, 5], R: [1, 10, 1], I0: [0.5, 5, 0.5] },
      where: function (v) { var d = rld(v); return d.L >= 1 && d.T >= 0.2 && d.Q >= 0.1; },
      statement: function (v) {
        return '<p>Un solenoide de aire de $' + v.N + '$ vueltas, $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo lleva $' + fx(v.I0, 1) + '\\ \\text{A}$. En $t = 0$ se desconecta la fuente y la corriente decae a través de un resistor de $' + v.R + '\\ \\Omega$ (ignora la resistencia del alambre).</p>';
      },
      diagram: { id: 'f3exam-rl', state: function (v) { return { e: v.I0 * v.R, R: v.R, L: rld(v).L, sw: 'b' }; } },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'mH',
          prompt: function () { return '¿Cuánto vale la inductancia del solenoide? En mH.'; },
          answer: function (v) { return rld(v).L; },
          solution: function (v) { return '$$L = \\frac{\\mu_0N^2A}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + v.N + ')^2\\,\\pi(' + fx(v.r / 100, 3) + ')^2}{' + fx(v.l / 100) + '} = ' + fx(rld(v).L, 3) + '\\ \\text{mH}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'ms',
          prompt: function () { return 'Con tu $L$ de a), ¿cuánto vale la constante de tiempo de la descarga? En ms.'; },
          answer: function (v, prev) { return prev[0] / v.R; },
          solution: function (v) { return '$$\\tau = \\frac{L}{R} = \\frac{' + fx(rld(v).L, 3) + '}{' + v.R + '} = ' + fx(rld(v).T, 4) + '\\ \\text{ms}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'ms',
          prompt: function () { return 'Con tu $\\tau$ de b), ¿en cuánto tiempo baja la corriente a la mitad? En ms.'; },
          answer: function (v, prev) { return prev[1] * Math.LN2; },
          solution: function (v) { return 'De $I_0e^{-t/\\tau} = I_0/2$: $$t = \\tau\\ln 2 = (' + fx(rld(v).T, 4) + ')(0.693) = ' + fx(rld(v).th, 4) + '\\ \\text{ms}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mJ',
          prompt: function () { return 'Con tu $L$ de a), ¿cuánto calor se produce en el resistor durante toda la descarga? En mJ.'; },
          answer: function (v, prev) { return 0.5 * prev[0] * v.I0 * v.I0; },
          solution: function (v) { return 'Toda la energía del campo termina en $R$; mH × A² = mJ: $$Q = \\tfrac{1}{2}LI_0^2 = \\tfrac{1}{2}(' + fx(rld(v).L, 3) + ')(' + fx(v.I0, 1) + ')^2 = ' + fx(rld(v).Q, 3) + '\\ \\text{mJ}$$'; } }
      ]
    },

    /* ---------------- S15 · Energía del campo de un solenoide ---------------- */
    {
      id: 'f3-ex-energia', tags: ['f3.S15', 'f3.S13'], block: 'C', title: 'La energía guardada en el campo',
      vars: { N: [200, 1000, 100], r: [1, 3, 0.5], l: [10, 40, 5], I: [1, 10, 1] },
      where: function (v) { var g = ene(v); return g.U >= 0.1 && g.L >= 0.1; },
      statement: function (v) {
        return '<p>Un solenoide de aire de $' + v.N + '$ vueltas, $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo lleva $' + v.I + '\\ \\text{A}$. Considera el campo uniforme adentro y cero afuera.</p>';
      },
      diagram: { id: 'f3exam-c-solenoide', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'mT',
          prompt: function () { return '¿Cuánto vale el campo dentro del solenoide? En mT.'; },
          answer: function (v) { return ene(v).B; },
          solution: function (v) { return '$$B = \\frac{\\mu_0NI}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + v.N + ')(' + v.I + ')}{' + fx(v.l / 100) + '} = ' + fx(ene(v).B, 3) + '\\ \\text{mT}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'J/m³',
          prompt: function () { return 'Con tu campo de a), ¿cuánto vale la densidad de energía magnética?'; },
          answer: function (v, prev) { return Math.pow(prev[0] / 1000, 2) / (2 * MU0); },
          solution: function (v) { return 'Con $B$ en teslas: $$u = \\frac{B^2}{2\\mu_0} = \\frac{(' + fx(ene(v).B / 1000, 5) + ')^2}{2(4\\pi\\times 10^{-7})} = ' + fx(ene(v).u, 2) + '\\ \\text{J/m}^3$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'mJ',
          prompt: function () { return 'Con tu densidad de b), ¿cuánta energía guarda el campo? En mJ.'; },
          answer: function (v, prev) { return prev[1] * area(v.r) * v.l / 100 * 1000; },
          solution: function (v) { return 'Por el volumen $A\\ell$: $$U = u\\,\\pi r^2\\ell = (' + fx(ene(v).u, 2) + ')\\pi(' + fx(v.r / 100, 3) + ')^2(' + fx(v.l / 100) + ') = ' + fx(ene(v).U, 3) + '\\ \\text{mJ}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'mH',
          prompt: function () { return 'Con tu energía de c), ¿cuánto vale la inductancia del solenoide? En mH.'; },
          answer: function (v, prev) { return 2 * prev[2] / (v.I * v.I); },
          solution: function (v) { return 'De $U = \\tfrac{1}{2}LI^2$, con mJ/A² = mH: $$L = \\frac{2U}{I^2} = \\frac{2(' + fx(ene(v).U, 3) + ')}{' + v.I + '^2} = ' + fx(ene(v).L, 4) + '\\ \\text{mH}$$ Coincide con $\\mu_0N^2A/\\ell$.'; } }
      ]
    }
  ]);
})();

/* ══════════════════════ fin Bloque C ══════════════════════ */
