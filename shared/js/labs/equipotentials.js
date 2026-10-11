/* =====================================================================
   Lab equipotentials (Física 2 · S06): equipotenciales ⟂ campo.
   Cargas puntuales arrastrables (agregar, quitar, signo y magnitud), el mapa
   de equipotenciales (marching squares sobre V = cte, con la misma ΔV entre
   curvas) y las líneas de campo encimadas, para ver que se cruzan en ángulo
   recto. Un punto de prueba P muestra el vector E y la equipotencial que pasa
   por él.
   Retos:
     V en P        el alumno suma kq/r con signo. Errores: r2 (usó kq/r²),
                   noSign (todas las cargas positivas), cm (r en centímetros).
     E con dos equipotenciales
                   el lab marca dos puntos 1 y 2 sobre la línea de campo que pasa
                   por P, separados Δs, con sus potenciales. El alumno estima
                   |E| ≈ |ΔV|/Δs y su sentido. Errores: noDivide (no dividió
                   entre Δs), cm (Δs en cm), r2 (dividió entre Δs²) y dir (E
                   hacia el potencial mayor).
   LabMath.equipotential trabaja en SI (C, m, V, V/m). Además trae el potencial
   de distribuciones continuas (varilla, anillo, disco) en fórmula cerrada y
   como suma de cargas puntuales, el gradiente numérico (diferencias centradas)
   y las curvas de nivel.
   k = 8.99 × 10⁹ N·m²/C² y ε₀ = 8.85 × 10⁻¹² C²/(N·m²), como en los enunciados.
   ===================================================================== */
(function () {
  var K = 8.99e9, EPS0 = 8.85e-12, DEG = 180 / Math.PI, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  // Potencial de cargas puntuales [{ q, x, y }] en (px, py). opts.pow = 2 (error: kq/r²), opts.abs (sin signos).
  function V(charges, px, py, opts) {
    opts = opts || {};
    var s = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i], r = Math.hypot(px - c.x, py - c.y);
      if (r < 1e-12) return NaN;
      s += K * (opts.abs ? Math.abs(c.q) : c.q) / (opts.pow === 2 ? r * r : r);
    }
    return s;
  }
  // Campo de Coulomb (fórmula cerrada) en (px, py): { x, y, mag, ang }.
  function E(charges, px, py) {
    var x = 0, y = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i], dx = px - c.x, dy = py - c.y, r = Math.hypot(dx, dy);
      if (r < 1e-12) return { x: NaN, y: NaN, mag: NaN, ang: NaN };
      var m = K * c.q / (r * r * r);
      x += m * dx; y += m * dy;
    }
    var a = Math.atan2(y, x) * DEG;
    return { x: x, y: y, mag: Math.hypot(x, y), ang: a < 0 ? a + 360 : a };
  }
  // Gradiente numérico de f(x, y) con diferencias centradas (paso h).
  function gradient(f, x, y, h) {
    h = h || 1e-6;
    return { x: (f(x + h, y) - f(x - h, y)) / (2 * h), y: (f(x, y + h) - f(x, y - h)) / (2 * h) };
  }
  // E = −∇V numérico.
  function fieldFromV(f, x, y, h) {
    var g = gradient(f, x, y, h);
    return { x: -g.x, y: -g.y, mag: Math.hypot(g.x, g.y) };
  }
  // E = −∇V con derivadas exactas de math.js (expr en x, y; V en volts, x y y en metros).
  function fieldFromExpr(math, expr, x, y) {
    var src = window.LabMath.core ? window.LabMath.core.prep(expr) : expr;
    var dx = math.derivative(src, 'x').evaluate({ x: x, y: y }), dy = math.derivative(src, 'y').evaluate({ x: x, y: y });
    return { x: -dx, y: -dy, mag: Math.hypot(dx, dy) };
  }

  /* ---------- Distribuciones continuas (fórmula cerrada) ---------- */
  // Varilla de 0 a L sobre x, P en su eje a d del extremo: V = kλ ln(1 + L/d).
  function rodAxisV(L, Q, d) { return K * Q / L * Math.log(1 + L / d); }
  // Varilla de −L/2 a L/2, P a una altura y sobre su centro: V = 2kλ ln[(L/2 + √(y² + L²/4))/y].
  function rodBisectorV(L, Q, y) { return 2 * K * Q / L * Math.log((L / 2 + Math.sqrt(y * y + L * L / 4)) / y); }
  // Anillo de radio R, P sobre su eje: V = kQ/√(z² + R²).
  function ringV(R, Q, z) { return K * Q / Math.sqrt(z * z + R * R); }
  // Disco de radio R, P sobre su eje: V = 2πkσ(√(z² + R²) − z).
  function diskV(R, Q, z) { var sig = Q / (Math.PI * R * R); return 2 * Math.PI * K * sig * (Math.sqrt(z * z + R * R) - z); }
  // Campo uniforme: E = ΔV/d entre placas y ΔV = −E s cos θ al moverse s con ángulo θ (grados) respecto a E.
  function plates(dV, d) { return dV / d; }
  function deltaV(Ef, s, deg) { var c = Math.cos(deg * RAD); return -Ef * s * (Math.abs(c) < 1e-12 ? 0 : c); }

  function closedV(g, p) {
    if (g === 'rod-axis') return rodAxisV(p.L, p.Q, p.d);
    if (g === 'rod-bisector') return rodBisectorV(p.L, p.Q, p.y);
    if (g === 'ring') return ringV(p.R, p.Q, p.z);
    if (g === 'disk') return diskV(p.R, p.Q, p.z);
    return NaN;
  }
  // La misma distribución como N cargas puntuales (en el disco, N anillos de M cargas) y su V = Σ kq/r.
  // Las cargas viven en 3D; P está sobre el eje de simetría.
  function points(g, p, N, M) {
    N = Math.max(1, Math.round(N));
    var out = [], i, j;
    if (g === 'rod-axis') for (i = 0; i < N; i++) out.push([(i + 0.5) * p.L / N, 0, 0, p.Q / N]);
    else if (g === 'rod-bisector') for (i = 0; i < N; i++) out.push([-p.L / 2 + (i + 0.5) * p.L / N, 0, 0, p.Q / N]);
    else if (g === 'ring') for (i = 0; i < N; i++) { var a = (i + 0.5) * 2 * Math.PI / N; out.push([p.R * Math.cos(a), p.R * Math.sin(a), 0, p.Q / N]); }
    else if (g === 'disk') {
      var sig = p.Q / (Math.PI * p.R * p.R), dr = p.R / N;
      M = Math.max(1, Math.round(M || 12));
      for (i = 0; i < N; i++) {
        var r = (i + 0.5) * dr, qr = sig * 2 * Math.PI * r * dr;
        for (j = 0; j < M; j++) { var b = (j + 0.5) * 2 * Math.PI / M; out.push([r * Math.cos(b), r * Math.sin(b), 0, qr / M]); }
      }
    }
    return out;
  }
  function fieldPoint(g, p) {
    return g === 'rod-axis' ? [p.L + p.d, 0, 0] : g === 'rod-bisector' ? [0, p.y, 0] : [0, 0, p.z];
  }
  function discreteV(g, p, N, M) {
    var P = fieldPoint(g, p), s = 0;
    points(g, p, N, M).forEach(function (c) { s += K * c[3] / Math.hypot(P[0] - c[0], P[1] - c[1], P[2] - c[2]); });
    return s;
  }
  // E a lo largo del eje de simetría como −dV/ds (diferencia centrada en la variable de distancia).
  function axisField(g, p, h) {
    var key = g === 'rod-axis' ? 'd' : g === 'rod-bisector' ? 'y' : 'z', s = p[key];
    h = h || 1e-5 * s;
    var a = Object.assign({}, p), b = Object.assign({}, p);
    a[key] = s + h; b[key] = s - h;
    return -(closedV(g, a) - closedV(g, b)) / (2 * h);
  }

  /* ---------- Curvas de nivel (marching squares) ----------
     f(x, y) muestreada en una rejilla de nx × ny celdas dentro de box { x0, x1, y0, y1 }.
     Devuelve [{ level, segs: [[x1, y1, x2, y2], …] }]. Se saltan las celdas con algún vértice
     no finito o con |f| > cap (junto a una carga puntual V crece sin límite). */
  var CASES = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 11: [[1, 2]], 12: [[3, 1]], 13: [[0, 1]], 14: [[3, 0]] };
  function contours(f, box, nx, ny, levels, cap) {
    var W = nx + 1, G = new Array(W * (ny + 1)), xs = [], ys = [], i, j;
    for (i = 0; i <= nx; i++) xs.push(box.x0 + (box.x1 - box.x0) * i / nx);
    for (j = 0; j <= ny; j++) ys.push(box.y0 + (box.y1 - box.y0) * j / ny);
    for (j = 0; j <= ny; j++) for (i = 0; i <= nx; i++) G[j * W + i] = f(xs[i], ys[j]);
    cap = cap || Infinity;
    var out = levels.map(function (L) { return { level: L, segs: [] }; });
    for (j = 0; j < ny; j++) {
      for (i = 0; i < nx; i++) {
        var v = [G[j * W + i], G[j * W + i + 1], G[(j + 1) * W + i + 1], G[(j + 1) * W + i]];
        if (!v.every(function (z) { return isFinite(z) && Math.abs(z) <= cap; })) continue;
        var cx = [xs[i], xs[i + 1], xs[i + 1], xs[i]], cy = [ys[j], ys[j], ys[j + 1], ys[j + 1]];
        for (var n = 0; n < levels.length; n++) {
          var L = levels[n];
          var code = (v[0] > L ? 1 : 0) | (v[1] > L ? 2 : 0) | (v[2] > L ? 4 : 0) | (v[3] > L ? 8 : 0);
          if (code === 0 || code === 15) continue;
          var pairs = CASES[code];
          if (code === 5 || code === 10) {
            var up = (v[0] + v[1] + v[2] + v[3]) / 4 > L;
            pairs = code === 5 ? (up ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]]) : (up ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]]);
          }
          for (var p = 0; p < pairs.length; p++) {
            var a = edge(pairs[p][0]), b = edge(pairs[p][1]);
            out[n].segs.push([a[0], a[1], b[0], b[1]]);
          }
        }
      }
    }
    return out;
    // Punto de la arista e (0 abajo, 1 derecha, 2 arriba, 3 izquierda) donde f = L, interpolado.
    function edge(e) {
      var s = e, t = (e + 1) % 4, fa = v[s], fb = v[t], u = (L - fa) / (fb - fa);
      if (!isFinite(u)) u = 0.5;
      return [cx[s] + (cx[t] - cx[s]) * u, cy[s] + (cy[t] - cy[s]) * u];
    }
  }
  // Niveles con la misma separación ΔV, de −vmax a vmax (incluye el 0).
  function levels(step, vmax) {
    var out = [], n = Math.floor(vmax / step + 1e-9);
    for (var i = -n; i <= n; i++) out.push(+(i * step).toFixed(9));
    return out;
  }

  /* ---------- Líneas de campo ----------
     RK4 sobre la dirección unitaria de E (unidades libres: la forma no depende de k). Salen de las
     cargas positivas; de las negativas se trazan hacia atrás solo las que no vienen de una positiva. */
  function unitDir(charges, x, y) {
    var ex = 0, ey = 0;
    for (var i = 0; i < charges.length; i++) {
      var c = charges[i], dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
      if (r < 1e-12) return null;
      ex += c.q * dx / (r2 * r); ey += c.q * dy / (r2 * r);
    }
    var L = Math.hypot(ex, ey);
    return L > 0 ? [ex / L, ey / L] : null;
  }
  function traceLine(charges, x, y, dir, box, o) {
    var pts = [[x, y]], to = -1;
    function f(px, py) { var u = unitDir(charges, px, py); return u ? [dir * u[0], dir * u[1]] : null; }
    for (var n = 0; n < o.maxSteps; n++) {
      var dmin = Infinity;
      for (var j = 0; j < charges.length; j++) dmin = Math.min(dmin, Math.hypot(x - charges[j].x, y - charges[j].y));
      var h = Math.max(o.hMin, Math.min(o.hMax, 0.25 * dmin));
      var k1 = f(x, y); if (!k1) break;
      var k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1]); if (!k2) break;
      var k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1]); if (!k3) break;
      var k4 = f(x + h * k3[0], y + h * k3[1]); if (!k4) break;
      var nx = x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), ny = y + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (Math.hypot(nx - x, ny - y) < h * 0.2) break;         // punto nulo: no avanza
      x = nx; y = ny; pts.push([x, y]);
      for (j = 0; j < charges.length; j++) if (Math.hypot(x - charges[j].x, y - charges[j].y) < o.rStop) { to = j; break; }
      if (to >= 0) break;
      if (x < box.x0 - o.margin || x > box.x1 + o.margin || y < box.y0 - o.margin || y > box.y1 + o.margin) break;
    }
    return { pts: pts, to: to };
  }
  function lines(charges, box, opts) {
    var o = Object.assign({ perUnit: 3, rStart: 0.6, rStop: 0.55, hMin: 0.03, hMax: 0.25, maxSteps: 700, margin: 1 }, opts || {});
    var out = [];
    charges.forEach(function (c, i) {
      if (!(c.q > 0)) return;
      var n = Math.max(1, Math.round(o.perUnit * c.q)), base = 0.3 + i * 0.41;
      for (var k = 0; k < n; k++) {
        var t = base + 2 * Math.PI * k / n, tr = traceLine(charges, c.x + o.rStart * Math.cos(t), c.y + o.rStart * Math.sin(t), 1, box, o);
        out.push({ pts: tr.pts, from: i, to: tr.to });
      }
    });
    charges.forEach(function (c, i) {
      if (!(c.q < 0)) return;
      var n = Math.max(1, Math.round(o.perUnit * -c.q)), base = 0.3 + i * 0.41;
      for (var k = 0; k < n; k++) {
        var t = base + 2 * Math.PI * k / n, tr = traceLine(charges, c.x + o.rStart * Math.cos(t), c.y + o.rStart * Math.sin(t), -1, box, o);
        if (tr.to >= 0) continue;                               // ya la dibujó la positiva de la que sale
        out.push({ pts: tr.pts.slice().reverse(), from: -1, to: i });
      }
    });
    return out;
  }

  /* ---------- Retos ---------- */
  // Dos puntos sobre la línea de campo por P, separados ds (m): 1 a la izquierda (o abajo) y 2 a la derecha.
  // Sus potenciales se redondean a centésimas de volt, como los ve el alumno; est = |V1 − V2|/ds.
  function probe(charges, px, py, ds) {
    var e = E(charges, px, py), m = e.mag;
    if (!(m > 0)) return null;
    var ux = e.x / m, uy = e.y / m;
    if (ux < -1e-12 || (Math.abs(ux) <= 1e-12 && uy < 0)) { ux = -ux; uy = -uy; }
    var p1 = { x: px - ux * ds / 2, y: py - uy * ds / 2 }, p2 = { x: px + ux * ds / 2, y: py + uy * ds / 2 };
    var V1 = Math.round(V(charges, p1.x, p1.y) * 100) / 100, V2 = Math.round(V(charges, p2.x, p2.y) * 100) / 100;
    return { p1: p1, p2: p2, V1: V1, V2: V2, ds: ds, est: Math.abs(V1 - V2) / ds, exact: m, toward: V1 > V2 ? 2 : 1, u: { x: ux, y: uy } };
  }
  // Respuesta real y errores típicos. kind: 'V' (potencial en P) o 'E' (|E| con dos equipotenciales).
  function answers(kind, charges, px, py, ds) {
    if (kind === 'V') {
      var t = V(charges, px, py);
      return { truth: t, r2: V(charges, px, py, { pow: 2 }), noSign: V(charges, px, py, { abs: true }), cm: t / 100 };
    }
    var p = probe(charges, px, py, ds);
    if (!p) return { truth: 0 };
    var dv = Math.abs(p.V1 - p.V2);
    return { truth: p.est, noDivide: dv, cm: dv / (ds * 100), r2: dv / (ds * ds) };
  }
  // Veredicto: 'ok', 'dir' (magnitud bien, sentido no), la clave de un error típico o 'bad'.
  // dir: 1 si el alumno dice que E apunta hacia el punto 1, 2 si hacia el 2 (solo en 'E').
  function diagnose(kind, charges, px, py, ds, student, dir, tol) {
    tol = tol || 0.02;
    if (!isFinite(student)) return 'bad';
    var a = answers(kind, charges, px, py, ds), t = a.truth;
    var near = function (x, y) { return Math.abs(x - y) <= tol * Math.max(Math.abs(y), 1e-12); };
    var good = near(student, t);
    if (kind === 'E') {
      var s = Math.abs(student), p = probe(charges, px, py, ds);
      good = near(s, t) || (p && near(s, p.exact));
      if (good) return !p || dir === p.toward ? 'ok' : 'dir';
      student = s;
    }
    if (good) return 'ok';
    var keys = Object.keys(a).filter(function (k) { return k !== 'truth'; });
    for (var i = 0; i < keys.length; i++) {
      var w = a[keys[i]];
      if (Math.abs(w - t) <= 0.03 * Math.max(Math.abs(w), Math.abs(t))) continue;   // no se distingue de la respuesta
      if (near(student, w)) return keys[i];
    }
    return 'bad';
  }

  window.LabMath.equipotential = {
    K: K, EPS0: EPS0,
    V: V, E: E, gradient: gradient, fieldFromV: fieldFromV, fieldFromExpr: fieldFromExpr,
    rodAxisV: rodAxisV, rodBisectorV: rodBisectorV, ringV: ringV, diskV: diskV, plates: plates, deltaV: deltaV,
    closedV: closedV, points: points, discreteV: discreteV, axisField: axisField,
    contours: contours, levels: levels, unitDir: unitDir, lines: lines,
    probe: probe, answers: answers, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG = {
    ok: ['Tu respuesta coincide', 'Con 2 % de tolerancia.'],
    r2: ['Usaste r² como en el campo', 'El potencial de una carga puntual es V = kq/r, con r a la primera potencia. El r² es del campo y de la fuerza.'],
    noSign: ['Trataste todas las cargas como positivas', 'V es un escalar con signo: una carga negativa aporta potencial negativo y resta.'],
    cm: ['Revisa las unidades', 'Las distancias van en metros: 1 cm = 0.01 m. Si usas centímetros, el resultado sale 100 veces más chico.'],
    noDivide: ['Te faltó dividir entre la distancia', 'ΔV es la «subida» entre las dos equipotenciales; el campo es qué tan rápido cambia V: |E| ≈ |ΔV|/Δs, con Δs en metros.'],
    dir: ['La magnitud está bien; el sentido no', 'E apunta hacia donde el potencial BAJA (E = −∇V), como el agua que corre cuesta abajo.'],
    bad: ['Tu respuesta no coincide', 'Para V: suma kq/r de cada carga con su signo y r en metros. Para E: |E| ≈ |V₁ − V₂|/Δs.']
  };
  var MSG_E_CM = ['Revisa las unidades', 'Δs va en metros: 1 cm = 0.01 m. Con Δs en centímetros el campo sale 100 veces más chico.'];
  var MSG_E_R2 = ['Dividiste entre Δs²', 'E ≈ ΔV/Δs: es una pendiente (volts por metro), no una ley de inverso al cuadrado.'];
  var PRESETS = [
    { name: 'Dipolo', q: [[2, -3, 0], [-2, 3, 0]], P: [0, 3] },
    { name: 'Una carga positiva', q: [[3, 0, 0]], P: [4, 3] },
    { name: 'Dos cargas iguales', q: [[2, -3, 0], [2, 3, 0]], P: [0, 3] },
    { name: 'Positiva y negativa distintas', q: [[4, -3, 0], [-1, 3, 0]], P: [3, 4] },
    { name: 'Tres cargas', q: [[2, -4, -2], [-3, 0, 3], [1, 4, -2]], P: [0, -2] }
  ];
  var BOX = { x0: -10, x1: 10, y0: -6.5, y1: 6.5 };

  function snap(v) { return Math.round(v * 2) / 2; }
  function fnum(v) { return String(v).replace('-', '−'); }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    var ex = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, ex);
    if (Math.abs(+m.toFixed(3)) >= 10) { m /= 10; ex += 1; }
    if (ex >= -2 && ex <= 4) return fnum(Number(v.toPrecision(4)).toString());
    return fnum(m.toFixed(3)) + ' × 10' + String(ex).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function plain(v) {
    if (Math.abs(v) < 1e-12) return '0';
    return Math.abs(v) >= 1e5 || Math.abs(v) < 1e-2 ? v.toExponential(3) : String(Number(v.toPrecision(4)));
  }

  window.Labs.equipotentials = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, EQ = window.LabMath.equipotential;
    var start = cfg.start || {};
    var charges = [], P = { x: 0, y: 3 }, sel = 0, student = null, raf = 0, revealed = false;

    /* ---------- Controles ---------- */
    var preset = UI.select({ label: 'Configuración', options: PRESETS.map(function (p) { return p.name; }) });
    var sign = UI.select({ label: 'Signo de la carga elegida', options: ['Positiva (+)', 'Negativa (−)'] });
    var mag = UI.slider({ label: 'Magnitud de la carga elegida', min: 1, max: 5, step: 1, value: 2, unit: 'nC' }, function () { setQ(); });
    var addP = UI.button('Agregar +', 'ghost', function () { addCharge(1); });
    var addN = UI.button('Agregar −', 'ghost', function () { addCharge(-1); });
    var del = UI.button('Quitar la elegida', 'ghost', removeCharge);
    var stepS = UI.slider({ label: 'ΔV entre equipotenciales', min: 50, max: 400, step: 50, value: start.step || 150, unit: 'V' }, function () { refresh(); });
    var mode = UI.select({ label: 'Reto', options: ['E con dos equipotenciales', 'V en el punto P'] });
    var dsS = UI.slider({ label: 'Separación Δs (de 1 a 2)', min: 0.5, max: 2, step: 0.5, value: start.ds || 1, unit: 'cm' }, function () { refresh(); });
    var eIn = UI.input({ label: 'Tu |E| en P (V/m)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Acepta notación científica: <code>3.2e4</code> o <code>3.2×10^4</code>.' });
    var dirSel = UI.select({ label: 'E apunta', options: ['del punto 1 hacia el 2', 'del punto 2 hacia el 1'] });
    var vIn = UI.input({ label: 'Tu V en P (V)', type: 'text', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', function () { revealed = true; check(); });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var eBox = h('div', { class: 'lab-controls' }, [dsS.node, eIn.node, dirSel.node]);
    var vBox = h('div', { class: 'lab-controls', hidden: true }, [vIn.node]);

    var svg = UI.svg(640, 440, 'Cargas puntuales con sus equipotenciales, sus líneas de campo y el vector E en el punto P');
    svg.classList.add('lab-stage--drag');
    svg.setAttribute('tabindex', '0');
    var hint = h('p', { class: 'lab-note' }, ['Arrastra las cargas y el punto P (o muévelos con las flechas del teclado; la barra espaciadora cambia cuál). Medidas en cm.']);
    var legend = h('ul', { class: 'lab-legend' });
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        preset.node, sign.node, mag.node,
        h('div', { class: 'lab-buttons' }, [addP, addN, del]),
        stepS.node, mode.node, eBox, vBox,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Equipotenciales y líneas de campo']),
        svg, hint, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); revealed = true; check(); });
    [eIn.input, vIn.input].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); revealed = true; check(); } }); });

    function isV() { return mode.input.value === '1'; }
    function ds() { return dsS.get() / 100; }
    function parse(s) {
      if (window.CBExercises) return window.CBExercises.parseNumber(s);
      return parseFloat(String(s).replace(/−/g, '-'));
    }
    function SI() { return charges.map(function (c) { return { q: c.q * 1e-9, x: c.x / 100, y: c.y / 100 }; }); }
    function syncSel() {
      var c = charges[sel];
      if (!c) return;
      sign.input.value = c.q < 0 ? '1' : '0';
      mag.set(Math.abs(c.q));
    }
    function loadPreset(i) {
      var p = PRESETS[i] || PRESETS[0];
      charges = p.q.map(function (a) { return { q: a[0], x: a[1], y: a[2] }; });
      P = { x: p.P[0], y: p.P[1] };
      sel = 0; syncSel(); clearStudent();
    }
    function clearStudent() { student = null; verdict.hidden = true; }
    function setQ() {
      var c = charges[sel];
      if (!c) return;
      c.q = (sign.input.value === '1' ? -1 : 1) * mag.get();
      refresh();
    }
    function free(x, y, skip) {
      return charges.every(function (c, i) { return i === skip || Math.hypot(c.x - x, c.y - y) >= 1.5; }) &&
        (skip === 'P' || Math.hypot(P.x - x, P.y - y) >= 1.5);
    }
    function addCharge(s) {
      if (charges.length >= 4) { note.textContent = 'Máximo 4 cargas: quita una antes de agregar otra.'; return; }
      var spots = [[0, 0], [-5, 3], [5, -3], [-5, -3], [5, 3], [0, -4], [0, 5], [-8, 0], [8, 0]];
      var at = spots.filter(function (p) { return free(p[0], p[1], -1); })[0] || [0, 0];
      charges.push({ q: s * 2, x: at[0], y: at[1] });
      sel = charges.length - 1; syncSel(); refresh();
    }
    function removeCharge() {
      if (charges.length <= 1) { note.textContent = 'Deja al menos una carga.'; return; }
      charges.splice(sel, 1);
      sel = Math.max(0, Math.min(sel, charges.length - 1)); syncSel(); refresh();
    }
    sign.input.addEventListener('change', setQ);
    preset.input.addEventListener('change', function () { revealed = false; loadPreset(+preset.input.value); loadExample(); check(); });
    mode.input.addEventListener('change', function () {
      eBox.hidden = isV(); vBox.hidden = !isV();
      revealed = false; clearStudent(); loadExample(); check();
    });
    dirSel.input.addEventListener('change', function () { if (student) check(); });

    /* ---------- Arrastre ---------- */
    var plot = null, drag = null;
    function toWorld(ev) {
      var m = svg.getScreenCTM();
      if (!m || !plot) return null;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      var x0 = plot.X(0), x1 = plot.X(1), y0 = plot.Y(0), y1 = plot.Y(1);
      return { x: (q.x - x0) / (x1 - x0), y: (q.y - y0) / (y1 - y0) };
    }
    function pick(w) {
      var best = null, bd = 0.9;
      charges.forEach(function (c, i) { var d = Math.hypot(c.x - w.x, c.y - w.y); if (d < bd) { bd = d; best = i; } });
      if (Math.hypot(P.x - w.x, P.y - w.y) < Math.min(bd, 0.9)) best = 'P';
      return best;
    }
    // P a 1.5 cm o más de cada carga: así los puntos 1 y 2 (a Δs/2 ≤ 1 cm) nunca caen sobre una carga.
    function moveTo(item, x, y) {
      x = Math.max(BOX.x0 + 0.5, Math.min(BOX.x1 - 0.5, snap(x)));
      y = Math.max(BOX.y0 + 0.5, Math.min(BOX.y1 - 0.5, snap(y)));
      if (item === 'P') { if (charges.every(function (c) { return Math.hypot(c.x - x, c.y - y) >= 1.5; })) { P.x = x; P.y = y; } }
      else if (charges[item] && free(x, y, item)) { charges[item].x = x; charges[item].y = y; }
    }
    svg.addEventListener('pointerdown', function (ev) {
      var w = toWorld(ev); if (!w) return;
      var it = pick(w);
      if (it === null) return;
      drag = it;
      if (it !== 'P') { sel = it; syncSel(); }
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sin captura */ }
      ev.preventDefault();
      schedule();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (drag === null) return;
      var w = toWorld(ev); if (!w) return;
      moveTo(drag, w.x, w.y); schedule();
    });
    function endDrag() { if (drag === null) return; drag = null; refresh(); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    var kSel = 'P';
    svg.addEventListener('keydown', function (ev) {
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[ev.key];
      if (ev.key === 'Tab' || !d && ev.key !== ' ') return;
      ev.preventDefault();
      if (ev.key === ' ') { kSel = kSel === 'P' ? 0 : (kSel + 1 < charges.length ? kSel + 1 : 'P'); if (kSel !== 'P') { sel = kSel; syncSel(); } draw(); return; }
      var it = kSel === 'P' ? P : charges[kSel];
      if (!it) { kSel = 'P'; it = P; }
      moveTo(kSel, it.x + d[0], it.y + d[1]); refresh();
    });
    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () { raf = 0; draw(); });
    }
    function refresh() { if (student) check(); else draw(); }

    /* ---------- Dibujo ---------- */
    function el(tag, attrs, text) {
      if (!UI.svgOk(attrs)) return null;
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      svg.querySelector('g.sketch').appendChild(n);
      return n;
    }
    function f1(v) { return (+v).toFixed(1); }
    function arrowPx(cls, x, y, dx, dy, w, head) {
      var L = Math.hypot(dx, dy);
      if (!(L > 2)) return;
      var ux = dx / L, uy = dy / L, hh = Math.min(head || 12, L * 0.45), ex = x + dx, ey = y + dy;
      el('path', { class: cls, fill: 'none', 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        d: 'M' + f1(x) + ' ' + f1(y) + 'L' + f1(ex) + ' ' + f1(ey) +
          'M' + f1(ex - ux * hh - uy * hh * 0.6) + ' ' + f1(ey - uy * hh + ux * hh * 0.6) + 'L' + f1(ex) + ' ' + f1(ey) +
          'L' + f1(ex - ux * hh + uy * hh * 0.6) + ' ' + f1(ey - uy * hh - ux * hh * 0.6) });
    }
    // Segmentos [x1, y1, x2, y2] en cm → un solo path recortado al cuadro.
    function segPath(segs, cls, w, dash) {
      if (!segs.length) return;
      var d = segs.map(function (s) { return 'M' + f1(plot.X(s[0])) + ' ' + f1(plot.Y(s[1])) + 'L' + f1(plot.X(s[2])) + ' ' + f1(plot.Y(s[3])); }).join('');
      el('path', { d: d, class: cls, fill: 'none', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': dash });
    }
    function arrowLen(m) { return Math.max(26, Math.min(110, 26 + 30 * Math.log10(1 + m / 1500))); }

    function draw() {
      var ch = SI(), step = stepS.get();
      plot = window.LabPlot(svg, { x: [BOX.x0, BOX.x1], y: [BOX.y0, BOX.y1], equal: true });
      plot.clear(); plot.grid(); plot.axes();
      var box = { x0: plot.xr[0], x1: plot.xr[1], y0: plot.yr[0], y1: plot.yr[1] };
      var Vcm = function (x, y) { return EQ.V(ch, x / 100, y / 100); };
      var vmax = 10 * step;
      // Equipotenciales: la misma ΔV entre curvas (más juntas = campo más fuerte).
      EQ.contours(Vcm, box, 128, 88, EQ.levels(step, vmax), 2.2 * vmax).forEach(function (c) {
        segPath(c.segs, 'aux', c.level === 0 ? 2 : 1.3, c.level === 0 ? '6 5' : null);
      });
      // Líneas de campo con su flecha de sentido.
      EQ.lines(charges, BOX, { perUnit: 4 }).forEach(function (l) {
        plot.segments(l.pts.slice(1).map(function (p, i) { return [l.pts[i], p]; }), 'ref', 1.5);
        var mid = Math.floor(l.pts.length * 0.45);
        if (l.pts.length > 8) {
          var a = l.pts[mid - 1], b = l.pts[mid + 1];
          if (a[0] > BOX.x0 && a[0] < BOX.x1 && a[1] > BOX.y0 && a[1] < BOX.y1) {
            var x = plot.X(l.pts[mid][0]), y = plot.Y(l.pts[mid][1]), dx = plot.X(b[0]) - plot.X(a[0]), dy = plot.Y(b[1]) - plot.Y(a[1]), L = Math.hypot(dx, dy) || 1;
            var ux = dx / L, uy = dy / L;
            el('path', { class: 'ref', fill: 'none', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
              d: 'M' + f1(x - 7 * ux - 4.5 * uy) + ' ' + f1(y - 7 * uy + 4.5 * ux) + 'L' + f1(x) + ' ' + f1(y) + 'L' + f1(x - 7 * ux + 4.5 * uy) + ' ' + f1(y - 7 * uy - 4.5 * ux) });
          }
        }
      });

      var px = plot.X(P.x), py = plot.Y(P.y), e = EQ.E(ch, P.x / 100, P.y / 100), pr = isV() ? null : EQ.probe(ch, P.x / 100, P.y / 100, ds());
      // La equipotencial que pasa por P (o, en el reto de E, las de los puntos 1 y 2).
      var hl = pr ? [pr.V1, pr.V2] : [Vcm(P.x, P.y)];
      var near = { x0: Math.max(box.x0, P.x - 6), x1: Math.min(box.x1, P.x + 6), y0: Math.max(box.y0, P.y - 6), y1: Math.min(box.y1, P.y + 6) };
      EQ.contours(Vcm, near, 96, 96, hl, Infinity).forEach(function (c) { segPath(c.segs, 'trace', 2.6, pr ? null : '7 5'); });

      // Ángulo recto entre E y la equipotencial en P.
      var dE = null, dS = null;
      if (e.mag > 0) {
        var Lp = arrowLen(e.mag), ux2 = e.x / e.mag, uy2 = -e.y / e.mag, s = 11;
        dE = [Lp * ux2, Lp * uy2];
        el('path', { class: 'axis', fill: 'none', 'stroke-width': 1.6, d: 'M' + f1(px + s * ux2) + ' ' + f1(py + s * uy2) + 'l' + f1(-s * uy2) + ' ' + f1(s * ux2) + 'l' + f1(-s * ux2) + ' ' + f1(-s * uy2) });
        arrowPx('error', px, py, dE[0], dE[1], 4);
      }
      if (student && !isV() && isFinite(student.v) && student.v !== 0 && pr) {
        var sl = arrowLen(Math.abs(student.v)), sx = (student.dir === 2 ? 1 : -1) * pr.u.x, sy = -(student.dir === 2 ? 1 : -1) * pr.u.y;
        dS = [sl * sx, sl * sy];
        arrowPx('student', px, py, dS[0], dS[1], 3);
      }
      // Puntos 1 y 2 con su número del lado de afuera.
      if (pr) [[pr.p1, '1', -1], [pr.p2, '2', 1]].forEach(function (q) {
        var qx = plot.X(q[0].x * 100), qy = plot.Y(q[0].y * 100);
        el('circle', { cx: qx, cy: qy, r: 5, class: 'dot-ref' });
        // Número del lado de abajo de la línea de campo (P lleva su letra del lado de arriba).
        var nx = -pr.u.y, ny = -pr.u.x;
        if (ny < 0) { nx = -nx; ny = -ny; }
        el('text', { x: qx + 18 * nx, y: qy + 18 * ny + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 17 }, q[1]);
      });
      // Cargas: círculo con su valor dentro.
      charges.forEach(function (c, i) {
        var x = plot.X(c.x), y = plot.Y(c.y);
        if (i === sel) el('circle', { cx: x, cy: y, r: 21, class: 'axis', fill: 'none', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
        el('circle', { cx: x, cy: y, r: 15, class: c.q > 0 ? 'box-err' : 'box-aux' });
        el('text', { x: x, y: y + 5, class: 'ann', 'text-anchor': 'middle', 'font-size': 15 }, (c.q > 0 ? '+' : '−') + Math.abs(c.q));
      });
      el('circle', { cx: px, cy: py, r: 6, class: 'dot-trace' });
      var ax = (dE ? dE[0] : 0) + (dS ? dS[0] : 0), ay = (dE ? dE[1] : 0) + (dS ? dS[1] : 0), am = Math.hypot(ax, ay) || 1;
      var lx = -ax / am, ly = -ay / am;
      if (pr) { lx = ay / am; ly = -ax / am; if (ly > 0) { lx = -lx; ly = -ly; } }   // arriba, lejos de 1 y 2
      el('text', { x: px + 22 * lx, y: py + 22 * ly + 6, class: 'ann', 'text-anchor': 'middle', 'font-size': 18 }, 'P');

      legend.innerHTML = '';
      [['aux', 'equipotenciales (cada ' + step + ' V)'], ['ref', 'líneas de campo'], ['trace', isV() ? 'equipotencial por P' : 'equipotenciales por 1 y 2'], ['error', 'E en P'], ['student', 'tu E']]
        .filter(function (r) { return r[0] !== 'student' || !isV(); })
        .forEach(function (r) { legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + r[0] }), r[1]])); });
      facts.innerHTML = '';
      var rows = charges.map(function (c, i) { return ['q' + '₁₂₃₄'[i], (c.q > 0 ? '+' : '−') + Math.abs(c.q) + ' nC en (' + fnum(c.x) + ', ' + fnum(c.y) + ') cm']; });
      rows.push(['P', '(' + fnum(P.x) + ', ' + fnum(P.y) + ') cm']);
      if (pr) {
        rows.push(['V₁', fnum(pr.V1.toFixed(2)) + ' V'], ['V₂', fnum(pr.V2.toFixed(2)) + ' V'], ['Δs', dsS.get() + ' cm']);
        if (student && revealed) rows.push(['|ΔV|/Δs', sci(pr.est) + ' V/m'], ['|E| exacto', sci(pr.exact) + ' V/m'], ['E apunta', 'del ' + (pr.toward === 2 ? '1 al 2' : '2 al 1')]);
      } else if (student && revealed) {
        rows.push(['V real', sci(EQ.V(ch, P.x / 100, P.y / 100)) + ' V'], ['|E| en P', sci(e.mag) + ' V/m']);
      }
      rows.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    /* ---------- Revisar ---------- */
    function check() {
      var ch = SI(), kind = isV() ? 'V' : 'E';
      var val = parse(isV() ? vIn.input.value : eIn.input.value);
      if (!isFinite(val)) { student = null; verdict.hidden = true; draw(); return; }
      var dir = dirSel.input.value === '1' ? 1 : 2;
      student = { v: val, dir: dir };
      if (kind === 'E') {
        var pr = EQ.probe(ch, P.x / 100, P.y / 100, ds());
        if (!pr || Math.abs(pr.V1 - pr.V2) < 0.5) {
          UI.verdict(verdict, 'warn', 'Aquí el campo es casi cero', 'Entre los puntos 1 y 2 el potencial casi no cambia. Mueve P a un lugar donde las equipotenciales estén más juntas.');
          draw(); return;
        }
      }
      var k = EQ.diagnose(kind, ch, P.x / 100, P.y / 100, ds(), val, dir);
      var m = MSG[k] || MSG.bad;
      if (kind === 'E' && k === 'cm') m = MSG_E_CM;
      if (kind === 'E' && k === 'r2') m = MSG_E_R2;
      var a = EQ.answers(kind, ch, P.x / 100, P.y / 100, ds()), err = ((kind === 'E' ? Math.abs(val) : val) - a.truth) / Math.abs(a.truth) * 100;
      UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', m[0],
        m[1] + (k !== 'ok' && k !== 'dir' && isFinite(err) ? ' Tu error: ' + (err > 0 ? '+' : '') + err.toFixed(1) + ' %.' : ''));
      draw();
    }

    // Ejemplo cargado: la respuesta de un compañero con un error típico.
    function loadExample() {
      var ch = SI();
      if (isV()) {
        vIn.input.value = plain(EQ.answers('V', ch, P.x / 100, P.y / 100, ds()).r2);
        note.textContent = 'Ejemplo cargado: así calculó V un compañero. ¿Ves el error? Mueve las cargas o P y escribe tu V.';
      } else {
        var a = EQ.answers('E', ch, P.x / 100, P.y / 100, ds()), pr = EQ.probe(ch, P.x / 100, P.y / 100, ds());
        eIn.input.value = plain(a.noDivide);
        dirSel.input.value = pr && pr.toward === 2 ? '0' : '1';
        note.textContent = 'Ejemplo cargado: así estimó |E| un compañero con los potenciales de los puntos 1 y 2. ¿Ves el error? Escribe tu estimación.';
      }
    }

    var si = PRESETS.map(function (p) { return p.name; }).indexOf(start.preset);
    preset.input.value = String(si >= 0 ? si : 0);
    loadPreset(si >= 0 ? si : 0);
    loadExample();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
