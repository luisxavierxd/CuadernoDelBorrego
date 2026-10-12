/* =====================================================================
   Lab polar-element (Cálculo 2 · S13): «elemento r dr dθ».
   Una región polar (disco, anillo, sector, pétalo de rosa, cardioide o
   entre dos círculos) cubierta por la malla polar. Cada «rectángulo polar»
   se dibuja con su forma real y su área r Δr Δθ: el resaltado muestra que,
   con el mismo Δr y Δθ, los de lejos del origen son más grandes. La suma
   Σ f(r*, θ*) r* Δr Δθ se compara con el valor exacto, y el interruptor
   «olvidar la r» muestra cuánto se equivoca la suma sin el factor.
   Reto: el alumno escribe el valor de ∬_R f dA; el lab lo compara contra
   una cuadratura en coordenadas RECTANGULARES sobre la región (oráculo en
   el sistema original) y da el «casi»: olvidó la r, usó r², integró θ de
   0 a 2π en una región que no da la vuelta, o sacó la mitad o el doble.
   LabMath.polarElement es puro (sin DOM y sin math.js).
   ===================================================================== */
(function () {
  var PI = Math.PI, TAU = 2 * PI;

  /* ------------------------- Cuadraturas ------------------------- */
  // Gauss-Legendre de n puntos en [-1, 1] (Newton sobre P_n).
  function glNodes(n) {
    var X = [], Wt = [];
    for (var i = 1; i <= n; i++) {
      var z = Math.cos(PI * (i - 0.25) / (n + 0.5)), p1, p2, pp;
      for (var it = 0; it < 100; it++) {
        p1 = 1; p2 = 0;
        for (var j = 1; j <= n; j++) { var p3 = p2; p2 = p1; p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j; }
        pp = n * (z * p1 - p2) / (z * z - 1);
        var z1 = z; z = z1 - p1 / pp;
        if (Math.abs(z - z1) < 1e-16) break;
      }
      p1 = 1; p2 = 0;
      for (var k = 1; k <= n; k++) { var q3 = p2; p2 = p1; p1 = ((2 * k - 1) * z * p2 - (k - 1) * q3) / k; }
      pp = n * (z * p1 - p2) / (z * z - 1);
      X.push(z); Wt.push(2 / ((1 - z * z) * pp * pp));
    }
    return { x: X, w: Wt };
  }
  var GL = glNodes(20);
  // ∫_a^b f con Gauss-Legendre compuesto (panels tramos de 20 puntos).
  function gauss(f, a, b, panels) {
    panels = panels || 8;
    var hw = (b - a) / panels / 2, s = 0;
    for (var p = 0; p < panels; p++) {
      var c = a + (2 * p + 1) * hw, sp = 0;
      for (var i = 0; i < GL.x.length; i++) sp += GL.w[i] * f(c + hw * GL.x[i]);
      s += sp * hw;
    }
    return s;
  }
  // Tanh-sinh (doble exponencial): aguanta raíces en los extremos (√(a² − r²) en r = a).
  var TS = (function () {
    var hstep = 1 / 16, out = [];
    for (var k = -48; k <= 48; k++) {
      var t = k * hstep, u = PI / 2 * Math.sinh(t), ch = Math.cosh(u);
      var d = 1 / (Math.exp(Math.abs(u)) * ch);           // 1 − tanh|u|, sin cancelación
      out.push({ s: t < 0 ? -1 : 1, d: d, w: hstep * PI / 2 * Math.cosh(t) / (ch * ch) });
    }
    return out;
  })();
  function tanhSinh(f, a, b) {
    if (a === b) return 0;
    var half = (b - a) / 2, s = 0;
    for (var i = 0; i < TS.length; i++) {
      var n = TS[i], x = n.s > 0 ? b - half * n.d : a + half * n.d;
      if (n.w < 1e-300) continue;
      var y = f(x);
      if (isFinite(y)) s += n.w * y;
    }
    return s * half;
  }
  // Gauss-Kronrod 7-15 adaptativo global (se parte el tramo con más error).
  var XK = [0.991455371120812639206854697526329, 0.949107912342758524526189684047851, 0.864864423359769072789712788640926, 0.741531185599394439863864773280788,
    0.586087235467691130294144845693013, 0.405845151377397166906606412076961, 0.207784955007898467600689403773245, 0];
  var WK = [0.022935322010529224963732008058970, 0.063092092629978553290700663189204, 0.104790010322250183839876322541518, 0.140653259715525918745189590510238,
    0.169004726639267902826583426598550, 0.190350578064785409913256402421014, 0.204432940075298892414161999234649, 0.209482141084727828012999174891714];
  var WG = [0.129484966168869693270611432679082, 0.279705391489276667901467771423780, 0.381830050505118944950369775488975, 0.417959183673469387755102040816327];
  function gk(f, a, b) {
    var c = (a + b) / 2, hw = (b - a) / 2, fc = f(c), K = WK[7] * fc, G = WG[3] * fc;
    for (var i = 0; i < 7; i++) {
      var dx = hw * XK[i], s = f(c - dx) + f(c + dx);
      K += WK[i] * s;
      if (i % 2 === 1) G += WG[(i - 1) / 2] * s;
    }
    return { a: a, b: b, I: K * hw, e: Math.abs(K - G) * hw };
  }
  function adaptive(f, a, b, tol, maxIt, cuts) {
    var list = [], n0 = cuts || 8;
    for (var i = 0; i < n0; i++) list.push(gk(f, a + (b - a) * i / n0, a + (b - a) * (i + 1) / n0));
    for (var it = 0; it < (maxIt || 300); it++) {
      var I = 0, E = 0, worst = 0;
      for (var j = 0; j < list.length; j++) { I += list[j].I; E += list[j].e; if (list[j].e > list[worst].e) worst = j; }
      if (E <= tol * Math.max(1, Math.abs(I))) break;
      var w = list[worst], m = (w.a + w.b) / 2;
      list.splice(worst, 1, gk(f, w.a, m), gk(f, m, w.b));
    }
    return list.reduce(function (s, q) { return s + q.I; }, 0);
  }

  /* ------------------------- Regiones polares ------------------------- */
  // α ≤ θ ≤ β, r1(θ) ≤ r ≤ r2(θ), con 0 ≤ r1 ≤ r2 en ese intervalo. R: radio máximo.
  function nm(x) { return String(+(+x).toFixed(3)); }
  function angTex(t) {
    var q = t / (PI / 12), k = Math.round(q);
    if (Math.abs(q - k) > 1e-9) return nm(t);
    if (k === 0) return '0';
    var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(Math.abs(k), 12), p = k / g, d = 12 / g;
    var top = (Math.abs(p) === 1 ? (p < 0 ? '-' : '') : p) + '\\pi';
    return d === 1 ? top : (p < 0 ? '-' : '') + '\\frac{' + (Math.abs(p) === 1 ? '' : Math.abs(p)) + '\\pi}{' + d + '}';
  }
  function cst(c) { return function () { return c; }; }
  function card(a) { return a === 1 ? '1 + \\cos\\theta' : nm(a) + '(1 + \\cos\\theta)'; }
  var REGIONS = {
    disk: function (p) {
      return { name: 'Disco', alpha: 0, beta: TAU, r1: cst(0), r2: cst(p.a), R: p.a, full: true,
        polar: '0 \\le r \\le ' + nm(p.a) + ',\\ 0 \\le \\theta \\le 2\\pi', rect: 'x^2 + y^2 \\le ' + nm(p.a * p.a),
        desc: 'el disco $x^2 + y^2 \\le ' + nm(p.a * p.a) + '$' };
    },
    annulus: function (p) {
      return { name: 'Anillo', alpha: 0, beta: TAU, r1: cst(p.a), r2: cst(p.b), R: p.b, full: true,
        polar: nm(p.a) + ' \\le r \\le ' + nm(p.b) + ',\\ 0 \\le \\theta \\le 2\\pi', rect: nm(p.a * p.a) + ' \\le x^2 + y^2 \\le ' + nm(p.b * p.b),
        desc: 'el anillo $' + nm(p.a * p.a) + ' \\le x^2 + y^2 \\le ' + nm(p.b * p.b) + '$' };
    },
    sector: function (p) {
      var t0 = p.t0 || 0, t1 = p.t1;
      return { name: 'Sector', alpha: t0, beta: t1, r1: cst(0), r2: cst(p.a), R: p.a, full: false,
        polar: '0 \\le r \\le ' + nm(p.a) + ',\\ ' + angTex(t0) + ' \\le \\theta \\le ' + angTex(t1),
        rect: 'x^2 + y^2 \\le ' + nm(p.a * p.a) + '\\text{, entre los rayos } \\theta = ' + angTex(t0) + ' \\text{ y } \\theta = ' + angTex(t1),
        desc: 'el sector del disco $x^2 + y^2 \\le ' + nm(p.a * p.a) + '$ entre los rayos $\\theta = ' + angTex(t0) + '$ y $\\theta = ' + angTex(t1) + '$' };
    },
    petal: function (p) {
      var n = p.n, w = PI / (2 * n);
      return { name: 'Pétalo de rosa', alpha: -w, beta: w, r1: cst(0), r2: function (t) { return p.a * Math.cos(n * t); }, R: p.a, full: false,
        polar: '0 \\le r \\le ' + nm(p.a) + '\\cos ' + n + '\\theta,\\ ' + angTex(-w) + ' \\le \\theta \\le ' + angTex(w),
        rect: '\\text{un pétalo de } r = ' + nm(p.a) + '\\cos ' + n + '\\theta',
        desc: 'un pétalo de la rosa $r = ' + nm(p.a) + '\\cos ' + n + '\\theta$ (el que está sobre el eje $x$ positivo)' };
    },
    cardioid: function (p) {
      return { name: 'Cardioide', alpha: 0, beta: TAU, r1: cst(0), r2: function (t) { return p.a * (1 + Math.cos(t)); }, R: 2 * p.a, full: true,
        polar: '0 \\le r \\le ' + card(p.a) + ',\\ 0 \\le \\theta \\le 2\\pi',
        rect: '\\text{dentro de la cardioide } r = ' + card(p.a),
        desc: 'la región dentro de la cardioide $r = ' + card(p.a) + '$' };
    },
    between: function (p) {
      return { name: 'Entre dos círculos', alpha: -PI / 3, beta: PI / 3, r1: cst(p.a), r2: function (t) { return 2 * p.a * Math.cos(t); }, R: 2 * p.a, full: false,
        polar: nm(p.a) + ' \\le r \\le ' + nm(2 * p.a) + '\\cos\\theta,\\ -\\frac{\\pi}{3} \\le \\theta \\le \\frac{\\pi}{3}',
        rect: '\\text{dentro de } r = ' + nm(2 * p.a) + '\\cos\\theta \\text{ y fuera de } r = ' + nm(p.a),
        desc: 'la región dentro del círculo $r = ' + nm(2 * p.a) + '\\cos\\theta$ y fuera del círculo $r = ' + nm(p.a) + '$' };
    },
    offset: function (p) {
      return { name: 'Disco por el origen', alpha: -PI / 2, beta: PI / 2, r1: cst(0), r2: function (t) { return 2 * p.a * Math.cos(t); }, R: 2 * p.a, full: false,
        polar: '0 \\le r \\le ' + nm(2 * p.a) + '\\cos\\theta,\\ -\\frac{\\pi}{2} \\le \\theta \\le \\frac{\\pi}{2}',
        rect: '(x - ' + nm(p.a) + ')^2 + y^2 \\le ' + nm(p.a * p.a),
        desc: 'el disco $(x - ' + nm(p.a) + ')^2 + y^2 \\le ' + nm(p.a * p.a) + '$' };
    }
  };
  function region(key, p) {
    var g = REGIONS[key](p || {});
    g.key = key; g.p = p;
    return g;
  }

  /* ------------------------- Integrandos f(x, y) ------------------------- */
  var INTEGRANDS = {
    one: function (p) { var k = p.k == null ? 1 : p.k; return { f: function () { return k; }, tex: nm(k), name: k === 1 ? '1 (área)' : nm(k) }; },
    r2: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x, y) { return k * (x * x + y * y); }, tex: (k === 1 ? '' : nm(k)) + '(x^2 + y^2)', name: 'x² + y²' }; },
    gauss: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x, y) { return Math.exp(-k * (x * x + y * y)); }, tex: 'e^{-' + (k === 1 ? '' : nm(k)) + '(x^2 + y^2)}', name: 'e^(−(x² + y²))' }; },
    r: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x, y) { return k * Math.sqrt(x * x + y * y); }, tex: (k === 1 ? '' : nm(k)) + '\\sqrt{x^2 + y^2}', name: '√(x² + y²)' }; },
    para: function (p) { var c = p.c == null ? 9 : p.c; return { f: function (x, y) { return c - x * x - y * y; }, tex: '(' + nm(c) + ' - x^2 - y^2)', name: nm(c) + ' − x² − y²' }; },
    sphere: function (p) { var a2 = p.a * p.a; return { f: function (x, y) { return Math.sqrt(Math.max(0, a2 - x * x - y * y)); }, tex: '\\sqrt{' + nm(a2) + ' - x^2 - y^2}', name: '√(a² − x² − y²)' }; },
    x: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x) { return k * x; }, tex: (k === 1 ? '' : nm(k)) + 'x', name: 'x' }; },
    y2: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x, y) { return k * y * y; }, tex: (k === 1 ? '' : nm(k)) + 'y^2', name: 'y²' }; },
    inv: function (p) { var k = p.k == null ? 1 : p.k; return { f: function (x, y) { return k / Math.sqrt(x * x + y * y); }, tex: '\\frac{' + nm(k) + '}{\\sqrt{x^2 + y^2}}', name: '1/√(x² + y²)' }; }
  };
  function integrand(key, p) { var g = INTEGRANDS[key](p || {}); g.key = key; return g; }

  /* ------------------------- Integrales y sumas ------------------------- */
  // ∫_α^β ∫_{r1}^{r2} f(r cos θ, r sin θ) r^power dr dθ. power = 1 es lo correcto;
  // 0 = «olvidó la r»; 2 = «usó r²». full: θ de α a α + 2π con las mismas r1, r2.
  function polarIntegral(f, reg, opts) {
    opts = opts || {};
    var pw = opts.power == null ? 1 : opts.power;
    var a = reg.alpha, b = opts.full ? reg.alpha + TAU : reg.beta;
    return gauss(function (t) {
      var c = Math.cos(t), s = Math.sin(t), lo = reg.r1(t), hi = reg.r2(t);
      return tanhSinh(function (r) { return f(r * c, r * s) * (pw === 1 ? r : pw === 0 ? 1 : Math.pow(r, pw)); }, lo, hi);
    }, a, b, opts.panels || 12);
  }
  function integral(rk, rp, fk, fp, opts) { return polarIntegral(integrand(fk, fp).f, region(rk, rp), opts); }
  // Área por la fórmula A = ½ ∫ (r2² − r1²) dθ (otro camino que ∬ 1 · r dr dθ).
  function areaOf(reg) { return gauss(function (t) { var a = reg.r2(t), b = reg.r1(t); return (a * a - b * b) / 2; }, reg.alpha, reg.beta, 12); }
  function area(rk, rp) { return areaOf(region(rk, rp)); }
  // Área de un rectángulo polar: resta de dos sectores, ½(r_ext² − r_int²) Δθ = r* Δr Δθ.
  function cellArea(rin, rout, dth) { return (rout * rout - rin * rin) / 2 * dth; }

  // Suma Σ f(r*, θ*) (r*)^power Δr Δθ con nt columnas de θ y nr anillos por columna
  // (r* y θ* en el punto medio; en cada columna r va de r1(θ*) a r2(θ*)).
  function polarSum(f, reg, nr, nt, power) {
    var pw = power == null ? 1 : power, dt = (reg.beta - reg.alpha) / nt, s = 0, cells = [];
    for (var j = 0; j < nt; j++) {
      var t0 = reg.alpha + j * dt, tm = t0 + dt / 2, lo = reg.r1(tm), hi = reg.r2(tm), dr = (hi - lo) / nr;
      var c = Math.cos(tm), sn = Math.sin(tm);
      for (var i = 0; i < nr; i++) {
        var rin = lo + i * dr, rm = rin + dr / 2, fv = f(rm * c, rm * sn);
        s += fv * Math.pow(rm, pw) * dr * dt;
        cells.push({ i: i, j: j, t0: t0, t1: t0 + dt, tm: tm, rin: rin, rout: rin + dr, rm: rm, dr: dr, f: fv, area: rm * dr * dt });
      }
    }
    return { sum: s, cells: cells, dt: dt };
  }

  // ¿(x, y) está en la región? Se prueba θ, θ ± 2π contra [α, β] y r1 ≤ ρ ≤ r2.
  function inside(reg, x, y) {
    var rho = Math.hypot(x, y);
    if (rho < 1e-13) return reg.r1(reg.alpha) <= 1e-12;
    var phi = Math.atan2(y, x);
    for (var k = -1; k <= 1; k++) {
      var t = phi + TAU * k;
      if (t >= reg.alpha - 1e-12 && t <= reg.beta + 1e-12) {
        var lo = reg.r1(t), hi = reg.r2(t);
        if (rho >= lo - 1e-12 && rho <= hi + 1e-12) return true;
      }
    }
    return false;
  }
  // Tramos de y dentro de la región sobre la recta vertical x (muestreo en y y a lo largo
  // de rayos, para no perder las cuñas angostas junto al origen; bisección en los bordes).
  function ySegments(reg, x, ny, nang) {
    var R = reg.R * 1.0001, ys = [], i;
    for (i = 0; i <= ny; i++) ys.push(-R + 2 * R * i / ny);
    if (Math.abs(x) > 1e-12) {
      for (i = 0; i <= nang; i++) {
        var t = reg.alpha + (reg.beta - reg.alpha) * i / nang, c = Math.cos(t);
        if (c * x > 1e-9) { var y = x * Math.tan(t); if (Math.abs(y) < R) ys.push(y); }
      }
    }
    ys.sort(function (a, b) { return a - b; });
    var segs = [], prevY = ys[0], prevIn = inside(reg, x, prevY), start = prevIn ? prevY : null;
    function edge(a, b, inA) {
      for (var k = 0; k < 60; k++) { var m = (a + b) / 2; if (inside(reg, x, m) === inA) a = m; else b = m; }
      return (a + b) / 2;
    }
    for (i = 1; i < ys.length; i++) {
      var yy = ys[i];
      if (yy === prevY) continue;
      var nowIn = inside(reg, x, yy);
      if (nowIn !== prevIn) {
        var e = edge(prevY, yy, prevIn);
        if (nowIn) start = e; else { segs.push([start, e]); start = null; }
      }
      prevY = yy; prevIn = nowIn;
    }
    if (start !== null) segs.push([start, prevY]);
    return segs;
  }
  // ∬_R f dx dy en coordenadas rectangulares: por cada x, ∫ f dy sobre los tramos de la
  // región (tanh-sinh) y luego ∫ dx con Gauss-Kronrod adaptativo. Oráculo del sistema original.
  function rectIntegral(f, reg, opts) {
    opts = opts || {};
    var ny = opts.ny || 600, nang = opts.nang || 600, R = reg.R * 1.0001;
    var g = function (x) {
      // Se parte en y = 0: los integrandos radiales (√(x² + y²)) tienen un pico en el origen.
      var fy = function (y) { return f(x, y); };
      return ySegments(reg, x, ny, nang).reduce(function (s, sg) {
        return s + (sg[0] < 0 && sg[1] > 0 ? tanhSinh(fy, sg[0], 0) + tanhSinh(fy, 0, sg[1]) : tanhSinh(fy, sg[0], sg[1]));
      }, 0);
    };
    return adaptive(g, -R, R, opts.tol || 1e-8, opts.maxIt || 300, 8);
  }
  function rect(rk, rp, fk, fp, opts) { return rectIntegral(integrand(fk, fp).f, region(rk, rp), opts); }
  // Monte Carlo en (x, y) sobre el cuadrado [−R, R]²: tercer camino, con tolerancia declarada.
  function monteCarlo(f, reg, n, rand) {
    rand = rand || Math.random;
    var R = reg.R, s = 0;
    for (var i = 0; i < n; i++) {
      var x = (2 * rand() - 1) * R, y = (2 * rand() - 1) * R;
      if (inside(reg, x, y)) s += f(x, y);
    }
    return s / n * 4 * R * R;
  }

  // Lo que sale con cada error típico (para el «casi» del lab).
  function candidates(f, reg) {
    return {
      forgot: polarIntegral(f, reg, { power: 0 }),
      rsq: polarIntegral(f, reg, { power: 2 }),
      fullTurn: reg.full ? null : polarIntegral(f, reg, { full: true })
    };
  }
  // Misma tolerancia que el calificador: ±0.01 con respuestas de 0.1 o más, si no ±1 %.
  function close(s, t) {
    var d = Math.abs(s - t);
    return (Math.abs(t) >= 0.1 && d <= 0.01 + 1e-9) || d <= 0.01 * Math.abs(t);
  }
  function diagnose(s, exact, cand) {
    if (!isFinite(s)) return { kind: 'bad', key: 'nan' };
    if (close(s, exact)) return { kind: 'ok', key: 'ok' };
    var list = [['forgot', cand && cand.forgot], ['rsq', cand && cand.rsq], ['fullTurn', cand && cand.fullTurn], ['half', exact / 2], ['double', 2 * exact]];
    for (var i = 0; i < list.length; i++) {
      var v = list[i][1];
      if (v != null && isFinite(v) && !close(v, exact) && close(s, v)) return { kind: 'warn', key: list[i][0], value: v };
    }
    if (close(s, -exact)) return { kind: 'warn', key: 'sign', value: -exact };
    return { kind: 'bad', key: 'bad' };
  }

  // Retos: región y función al azar con parámetros cómodos (R ≤ 3 para el paraboloide 9 − r²).
  var SETS = {
    disk: [{ a: 1 }, { a: 1.5 }, { a: 2 }, { a: 2.5 }, { a: 3 }],
    annulus: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 3 }, { a: 0.5, b: 2 }],
    sector: [{ a: 2, t0: 0, t1: PI / 3 }, { a: 3, t0: 0, t1: PI / 2 }, { a: 2, t0: PI / 4, t1: 3 * PI / 4 }, { a: 1.5, t0: 0, t1: PI }],
    petal: [{ a: 2, n: 3 }, { a: 3, n: 3 }, { a: 2, n: 2 }, { a: 3, n: 5 }],
    cardioid: [{ a: 1 }, { a: 1.5 }],
    between: [{ a: 1 }, { a: 1.5 }]
  };
  var FKEYS = ['one', 'r2', 'gauss', 'r', 'para'];
  function randomChallenge(rand, rk) {
    rand = rand || Math.random;
    var keys = Object.keys(SETS);
    rk = rk || keys[Math.floor(rand() * keys.length)];
    var opts = SETS[rk], rp = opts[Math.floor(rand() * opts.length)];
    var fk = FKEYS[Math.floor(rand() * FKEYS.length)];
    return { rk: rk, rp: rp, fk: fk, fp: fk === 'para' ? { c: 9 } : {} };
  }

  window.LabMath.polarElement = {
    gauss: gauss, tanhSinh: tanhSinh, adaptive: adaptive, region: region, integrand: integrand, REGIONS: REGIONS, INTEGRANDS: INTEGRANDS,
    polarIntegral: polarIntegral, integral: integral, areaOf: areaOf, area: area, cellArea: cellArea, polarSum: polarSum,
    inside: inside, ySegments: ySegments, rectIntegral: rectIntegral, rect: rect, monteCarlo: monteCarlo,
    candidates: candidates, close: close, diagnose: diagnose, randomChallenge: randomChallenge, SETS: SETS, angTex: angTex
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var W = 440, H = 400, PAD = 34;
  var PRESETS = [
    { rk: 'disk', rp: { a: 2 } },
    { rk: 'annulus', rp: { a: 1, b: 2 } },
    { rk: 'sector', rp: { a: 2, t0: 0, t1: PI / 3 } },
    { rk: 'petal', rp: { a: 2, n: 3 } },
    { rk: 'cardioid', rp: { a: 1 } },
    { rk: 'between', rp: { a: 1 } }
  ];
  var FUNS = [{ fk: 'one', fp: {} }, { fk: 'r2', fp: {} }, { fk: 'gauss', fp: {} }, { fk: 'r', fp: {} }, { fk: 'para', fp: { c: 9 } }];
  var MSG = {
    ok: ['Es el valor de la integral', 'Coincide con la integral calculada en rectangulares sobre la misma región.'],
    forgot: ['Casi: olvidaste la r del elemento', 'En polares dA = r dr dθ, no dr dθ. Tu número es justo lo que sale sin esa r.'],
    rsq: ['Casi: usaste r² en lugar de r', 'El elemento de área es r dr dθ (una sola r). La r² aparece solo si el integrando trae x² + y².'],
    fullTurn: ['Casi: integraste θ de 0 a 2π', 'Esta región no da la vuelta completa: los límites de θ son los rayos que la encierran.'],
    half: ['Casi: te salió la mitad', 'Revisa la simetría: si integraste media región, multiplica por 2, o revisa el factor ½.'],
    double: ['Casi: te salió el doble', 'Revisa la simetría: quizá contaste dos veces la misma mitad, o te sobró un factor 2.'],
    sign: ['Casi: tu signo está al revés', 'Revisa el orden de los límites: r va del borde interior al exterior y θ crece en sentido antihorario.'],
    bad: ['No coincide', 'Plantea la integral: límites de θ (rayos), límites de r (de la curva interior a la exterior), integrando en polares y la r del elemento.'],
    nan: ['Escribe un número', 'Usa punto decimal; por ejemplo 12.57. También puedes escribir 4*pi.']
  };

  window.Labs['polar-element'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var start = Math.max(0, Math.min(PRESETS.length - 1, cfg.start || 0));
    var cur = { rk: PRESETS[start].rk, rp: PRESETS[start].rp, fk: FUNS[cfg.f || 0].fk, fp: FUNS[cfg.f || 0].fp };
    var reg = null, fn = null, exact = 0, cand = null, rectCache = {};

    var regSel = UI.select({ label: 'Región', options: PRESETS.map(function (p) { return REGIONS[p.rk](p.rp).name; }) });
    var funSel = UI.select({ label: 'Función f(x, y)', options: FUNS.map(function (f) { return integrand(f.fk, f.fp).name; }) });
    var given = h('p', { class: 'lab-given pe-given' });
    var nrS = UI.slider({ label: 'Divisiones en r', min: 1, max: 12, step: 1, value: 4 }, function () { hiS.input.max = String(nrS.get()); if (hiS.get() > nrS.get()) hiS.set(nrS.get()); draw(); });
    var ntS = UI.slider({ label: 'Divisiones en θ', min: 2, max: 36, step: 1, value: 12 }, function () { draw(); });
    var hiS = UI.slider({ label: 'Anillo resaltado (de adentro hacia afuera)', min: 1, max: 4, step: 1, value: 4 }, function () { draw(); });
    var forgetBox = h('input', { type: 'checkbox', id: UI.id('pe-forget') });
    var forgetRow = h('label', { class: 'pe-check', for: forgetBox.id }, [forgetBox, ' Olvidar la r: sumar f · Δr Δθ']);
    var sumNote = h('p', { class: 'lab-note' });

    var ask = h('p', { class: 'lab-given pe-ask' });
    var ans = UI.input({ label: 'Tu valor de la integral', type: 'text', inputmode: 'decimal', mono: false, hint: 'Redondea a 2 decimales (o escribe algo como 4*pi).' });
    var run = UI.button('Comprobar', 'primary', function () { verify(); });
    var other = UI.button('Otro reto', 'ghost', function () { var c = randomChallenge(); setCase(c.rk, c.rp, c.fk, c.fp, true); });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var svg = UI.svg(W, H, 'Región polar cubierta por rectángulos polares');
    var facts = h('dl', { class: 'lab-facts pe-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls pe-controls', novalidate: true }, [
        regSel.node, funSel.node, given, nrS.node, ntS.node, hiS.node, forgetRow, sumNote,
        h('p', { class: 'lab-stack__label' }, ['Reto']), ask, ans.node, h('div', { class: 'lab-buttons' }, [run, other]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Rectángulos polares: área r Δr Δθ']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'borde de la región']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'rectángulos polares (más oscuro: f más grande)']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'el resaltado']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'el más cercano al origen en su columna'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
    ans.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verify(); } });
    ans.input.addEventListener('input', function () { note.textContent = ''; });
    regSel.input.addEventListener('change', function () { var p = PRESETS[+regSel.input.value]; setCase(p.rk, p.rp, cur.fk, cur.fp); });
    funSel.input.addEventListener('change', function () { var f = FUNS[+funSel.input.value]; setCase(cur.rk, cur.rp, f.fk, f.fp); });
    forgetBox.addEventListener('change', draw);

    function keyOf() { return JSON.stringify([cur.rk, cur.rp, cur.fk, cur.fp]); }
    function rectValue() {
      var k = keyOf();
      if (rectCache[k] == null) rectCache[k] = rectIntegral(fn.f, reg, { tol: 1e-7, maxIt: 160, ny: 400, nang: 400 });
      return rectCache[k];
    }

    function setCase(rk, rp, fk, fp, fromRandom) {
      cur = { rk: rk, rp: rp, fk: fk, fp: fp };
      reg = region(rk, rp); fn = integrand(fk, fp);
      exact = polarIntegral(fn.f, reg); cand = candidates(fn.f, reg);
      var pi = -1;
      PRESETS.forEach(function (p, i) { if (p.rk === rk) pi = i; });
      if (pi >= 0) regSel.input.value = String(pi);
      FUNS.forEach(function (f, i) { if (f.fk === fk) funSel.input.value = String(i); });
      given.innerHTML = 'En polares: $' + reg.polar + '$.';
      ask.innerHTML = 'Calcula $\\displaystyle\\iint_R ' + fn.tex + '\\,dA$, donde $R$ es ' + reg.desc + '.';
      UI.renderMath(given); UI.renderMath(ask);
      verdict.hidden = true;
      if (fromRandom) { ans.input.value = ''; note.textContent = 'Reto nuevo: plantea la integral en polares y escribe su valor.'; }
      draw();
    }

    /* ---------- Dibujo ---------- */
    function el(name, attrs, parent, txt) {
      if (!UI.svgOk(attrs)) return document.createElementNS(NS, name);
      var n = document.createElementNS(NS, name);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      (parent || svg).appendChild(n);
      return n;
    }
    // Borde de la región en coordenadas (x, y): r2 de α a β y r1 de regreso.
    function boundary() {
      var pts = [], n = 240, i, t;
      for (i = 0; i <= n; i++) { t = reg.alpha + (reg.beta - reg.alpha) * i / n; pts.push([reg.r2(t) * Math.cos(t), reg.r2(t) * Math.sin(t)]); }
      if (reg.full) return { outer: pts, inner: reg.r1(0) > 0 ? (function () { var q = []; for (var j = 0; j <= n; j++) { var u = TAU * j / n; q.push([reg.r1(u) * Math.cos(u), reg.r1(u) * Math.sin(u)]); } return q; })() : null };
      for (i = n; i >= 0; i--) { t = reg.alpha + (reg.beta - reg.alpha) * i / n; pts.push([reg.r1(t) * Math.cos(t), reg.r1(t) * Math.sin(t)]); }
      return { outer: pts, inner: null };
    }
    function cellPts(c) {
      var pts = [], m = Math.max(2, Math.ceil((c.t1 - c.t0) / 0.05)), k;
      for (k = 0; k <= m; k++) { var t = c.t0 + (c.t1 - c.t0) * k / m; pts.push([c.rout * Math.cos(t), c.rout * Math.sin(t)]); }
      for (k = m; k >= 0; k--) { var u = c.t0 + (c.t1 - c.t0) * k / m; pts.push([c.rin * Math.cos(u), c.rin * Math.sin(u)]); }
      return pts;
    }

    function draw() {
      svg.innerHTML = '';
      var g = el('g', { class: 'sketch' });
      // La suma va primero: sus rectángulos (escalones) pueden salirse un poco de la región
      // y el encuadre debe incluirlos.
      var nr = nrS.get(), nt = ntS.get(), forget = forgetBox.checked;
      var S = polarSum(fn.f, reg, nr, nt, 1), S0 = polarSum(fn.f, reg, nr, nt, 0);
      var B = boundary(), all = B.outer.concat(B.inner || [], [[0, 0]]);
      S.cells.forEach(function (q) { if (q.i === nr - 1) all = all.concat(cellPts(q)); });
      var x0 = Math.min.apply(null, all.map(function (p) { return p[0]; })), x1 = Math.max.apply(null, all.map(function (p) { return p[0]; }));
      var y0 = Math.min.apply(null, all.map(function (p) { return p[1]; })), y1 = Math.max.apply(null, all.map(function (p) { return p[1]; }));
      var k = Math.min((W - 2 * PAD) / Math.max(x1 - x0, 1e-6), (H - 2 * PAD) / Math.max(y1 - y0, 1e-6));
      var ox = W / 2 - k * (x0 + x1) / 2, oy = H / 2 + k * (y0 + y1) / 2;
      function P(p) { return (ox + k * p[0]).toFixed(1) + ' ' + (oy - k * p[1]).toFixed(1); }
      function dOf(pts, close) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + P(p); }).join('') + (close ? 'Z' : ''); }

      // Rejilla polar tenue y ejes.
      var Rg = reg.R, step = Rg <= 2 ? 0.5 : 1, d = '';
      for (var c = step; c <= Rg * 1.001; c += step) d += 'M' + (ox + c * k).toFixed(1) + ' ' + oy.toFixed(1) + 'A' + (c * k).toFixed(1) + ' ' + (c * k).toFixed(1) + ' 0 1 0 ' + (ox - c * k).toFixed(1) + ' ' + oy.toFixed(1) + 'A' + (c * k).toFixed(1) + ' ' + (c * k).toFixed(1) + ' 0 1 0 ' + (ox + c * k).toFixed(1) + ' ' + oy.toFixed(1);
      el('path', { d: d, class: 'plot-grid', fill: 'none' }, g);
      el('path', { d: 'M8 ' + oy.toFixed(1) + 'H' + (W - 22) + 'M' + ox.toFixed(1) + ' ' + (H - 8) + 'V22', class: 'axis', 'stroke-width': 1.3, fill: 'none' }, g);
      el('text', { x: W - 10, y: oy + 5, class: 'lab-tick', 'text-anchor': 'end' }, g, 'x');
      el('text', { x: ox, y: 15, class: 'lab-tick', 'text-anchor': 'middle' }, g, 'y');

      // Región.
      el('path', { d: dOf(B.outer, true) + (B.inner ? dOf(B.inner.slice().reverse(), true) : ''), class: 'area-fill', 'fill-rule': 'evenodd' }, g);

      // Rectángulos polares, sombreados según f(r*, θ*).
      var fmax = Math.max.apply(null, S.cells.map(function (q) { return Math.abs(q.f); })) || 1;
      var outline = '';
      S.cells.forEach(function (q) {
        var pts = cellPts(q);
        el('path', { d: dOf(pts, true), class: 'area-fill--aux', opacity: (0.15 + 0.85 * Math.abs(q.f) / fmax).toFixed(2) }, g);
        outline += dOf(pts, true);
      });
      el('path', { d: outline, class: 'aux', 'stroke-width': 1, fill: 'none' }, g);
      el('path', { d: dOf(B.outer, true) + (B.inner ? dOf(B.inner, true) : ''), class: 'ref', 'stroke-width': 2.5, fill: 'none', 'stroke-linejoin': 'round' }, g);

      // Columna resaltada: cerca de θ = π/4 si la región da la vuelta; si no, la de en medio.
      var target = reg.full ? PI / 4 : (reg.alpha + reg.beta) / 2, j0 = 0, best = Infinity;
      for (var j = 0; j < nt; j++) { var tm = reg.alpha + (j + 0.5) * S.dt, dd = Math.abs(tm - target); if (dd < best) { best = dd; j0 = j; } }
      var ring = Math.min(hiS.get(), nr) - 1;
      var col = S.cells.filter(function (q) { return q.j === j0; });
      var hi = col[ring], lo = col[0];
      if (ring > 0) el('path', { d: dOf(cellPts(lo), true), class: 'box-err', 'stroke-width': 2 }, g);
      el('path', { d: dOf(cellPts(hi), true), class: 'box-trace', 'stroke-width': 2.5 }, g);
      var pm = [hi.rm * Math.cos(hi.tm), hi.rm * Math.sin(hi.tm)];
      el('circle', { cx: ox + k * pm[0], cy: oy - k * pm[1], r: 4, class: 'dot-trace' }, g);

      // Datos.
      var err = S.sum - exact, err0 = S0.sum - exact;
      var rows = [
        ['Δr y Δθ del resaltado', UI.fmt(hi.dr, 4) + ' y ' + UI.fmt(S.dt, 4)],
        ['su área r* Δr Δθ', UI.fmt(hi.area, 4) + ' (r* = ' + UI.fmt(hi.rm, 4) + ')']
      ];
      if (ring > 0) rows.push(['el más cercano al origen', UI.fmt(lo.area, 4) + ' (' + UI.fmt(hi.area / lo.area, 3) + ' veces menor)']);
      rows.push(['Σ f · r* Δr Δθ', UI.fmt(S.sum, 6) + ' (error ' + pct(err) + ')']);
      if (forget) rows.push(['Σ f · Δr Δθ (sin la r)', UI.fmt(S0.sum, 6) + ' (error ' + pct(err0) + ')']);
      rows.push(['valor exacto ∬ f dA', UI.fmt(exact, 6)]);
      facts.innerHTML = '';
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      sumNote.textContent = forget
        ? 'Sin la r, todos los rectángulos «pesan» Δr Δθ aunque los de afuera sean más grandes. Esa suma se va a ' + UI.fmt(cand.forgot, 5) + ', no al valor exacto, por más divisiones que pongas.'
        : 'Con más divisiones, la suma con r se acerca al valor exacto.';
    }
    function pct(e) { return Math.abs(exact) < 1e-12 ? UI.fmt(e, 3) : (Math.abs(e / exact) * 100 < 0.01 ? '< 0.01 %' : UI.fmt(Math.abs(e / exact) * 100, 3) + ' %'); }

    function verify() {
      var raw = String(ans.input.value || '').trim();
      var s = raw ? (window.CBExercises ? window.CBExercises.parseNumber(raw, window.math) : parseFloat(raw.replace('−', '-'))) : NaN;
      if (!isFinite(s) && window.CBExercises && /π/.test(raw)) s = window.CBExercises.parseNumber(raw.replace(/π/g, 'pi'), window.math);
      if (!isFinite(s)) { UI.verdict(verdict, 'bad', MSG.nan[0], MSG.nan[1]); return; }
      var E = rectValue(), r = diagnose(s, E, cand), m = MSG[r.key] || MSG.bad;
      var tail = r.kind === 'ok' ? ' Valor: ' + UI.fmt(E, 6) + '.' : r.kind === 'warn' ? '' : (isFinite(s) ? ' Tu valor: ' + UI.fmt(s, 6) + '.' : '');
      UI.verdict(verdict, r.kind, m[0], m[1] + tail);
    }

    // Ejemplo cargado: así respondió un compañero (olvidó la r).
    setCase(cur.rk, cur.rp, cur.fk, cur.fp);
    hiS.input.max = String(nrS.get());
    if (cfg.answer !== false) {
      ans.input.value = String(+cand.forgot.toFixed(2));
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Escribe tu propio valor.';
    }
    document.addEventListener('cb:themechange', draw);
    // math.js solo hace falta para leer respuestas como 4*pi; el lab funciona sin él.
    UI.loadMath().catch(function () {});
    return new Promise(function (resolve) {
      setTimeout(function () { if (cfg.answer !== false) verify(); resolve(); }, 0);
    });
  };
})();
