/* =====================================================================
   Lab surface-contour (Cálculo 2 · S01): superficie 3D ↔ mapa de contorno.
   Modo 1: el alumno elige o escribe z = f(x, y); ve el mapa de contorno, el
   corte lateral y = b y, en PC, la superficie en 3D (manim-web). Un deslizador
   de nivel c resalta la curva f = c. Reto: «¿qué nivel pasa por P?».
   Modo 2: «¿qué cuádrica es?»: una ecuación al azar, sus trazas z = k y y = b
   (y el 3D en PC); el alumno elige el nombre y el lab da el «casi».
   En móvil, o si WebGL falla, quedan las dos vistas SVG (corte + contorno),
   que califican igual: el veredicto sale de LabMath, no del dibujo.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  var EPS = 1e-9;
  var AX = ['x', 'y', 'z'];
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  // Distancia entre dos puntos del espacio.
  function dist(P, Q) { var d = sub(Q, P); return Math.sqrt(dot(d, d)); }
  // Esfera x² + y² + z² + Dx + Ey + Fz + G = 0 → centro y radio (completando cuadrados).
  function sphere(D, E, F, G) {
    var c = [-D / 2, -E / 2, -F / 2], r2 = dot(c, c) - G;
    return { center: c, r2: r2, r: r2 >= 0 ? Math.sqrt(r2) : NaN };
  }
  // Plano ax + by + cz = d por un punto con normal n, o por tres puntos (n = PQ × PR).
  function planeFromNormal(n, P) { return { a: n[0], b: n[1], c: n[2], d: dot(n, P) }; }
  function planeFromPoints(P, Q, R) { return planeFromNormal(cross(sub(Q, P), sub(R, P)), P); }
  function onPlane(pl, P) { return pl.a * P[0] + pl.b * P[1] + pl.c * P[2] - pl.d; }
  // Intersecciones con los ejes: las otras dos coordenadas valen 0. null si el plano es paralelo al eje.
  function axisIntercept(pl, i) { var k = [pl.a, pl.b, pl.c][i]; return Math.abs(k) < EPS ? null : pl.d / k; }
  function intercepts(pl) { return { x: axisIntercept(pl, 0), y: axisIntercept(pl, 1), z: axisIntercept(pl, 2) }; }

  // f(x, y) escrita por el alumno, evaluada en un punto (math.js se inyecta).
  function evalAt(math, src, x, y) { return window.LabMath.core.build(math, src, ['x', 'y']).fn(x, y); }

  /* ---------- Curvas de nivel: muestreo en malla + marching squares ---------- */
  // grid(f, { x: [a, b], y: [c, d] }, n) → valores en una malla de (n + 1) × (n + 1) puntos.
  function grid(f, box, n) {
    n = n || 60;
    var xs = [], ys = [], v = [], i, j;
    for (i = 0; i <= n; i++) { xs.push(box.x[0] + (box.x[1] - box.x[0]) * i / n); ys.push(box.y[0] + (box.y[1] - box.y[0]) * i / n); }
    for (j = 0; j <= n; j++) {
      var row = [];
      for (i = 0; i <= n; i++) { var z = f(xs[i], ys[j]); row.push(typeof z === 'number' && isFinite(z) ? z : NaN); }
      v.push(row);
    }
    return { xs: xs, ys: ys, v: v, n: n };
  }
  // Segmentos [[x1, y1], [x2, y2]] de la curva f = c (interpolación lineal en cada celda).
  // En las celdas «silla» decide el valor del centro. Las celdas con huecos (NaN) se saltan.
  var TABLE = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]] };
  function contour(g, c) {
    var segs = [], xs = g.xs, ys = g.ys, v = g.v;
    for (var j = 0; j < g.n; j++) {
      for (var i = 0; i < g.n; i++) {
        var a = v[j][i] - c, b = v[j][i + 1] - c, cc = v[j + 1][i + 1] - c, d = v[j + 1][i] - c;
        if (!(isFinite(a) && isFinite(b) && isFinite(cc) && isFinite(d))) continue;
        var idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (cc > 0 ? 4 : 0) | (d > 0 ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        var x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
        // Punto de cruce sobre cada arista: 0 abajo (a–b), 1 derecha (b–c), 2 arriba (c–d), 3 izquierda (d–a).
        var E = [
          function () { var t = a / (a - b); return [x0 + t * (x1 - x0), y0]; },
          function () { var t = b / (b - cc); return [x1, y0 + t * (y1 - y0)]; },
          function () { var t = cc / (cc - d); return [x1 + t * (x0 - x1), y1]; },
          function () { var t = d / (d - a); return [x0, y1 + t * (y0 - y1)]; }
        ];
        var pairs = TABLE[idx];
        if (idx === 5 || idx === 10) {
          var mid = (a + b + cc + d) / 4 > 0;
          if (idx === 5) pairs = mid ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
          else pairs = mid ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]];
        }
        pairs.forEach(function (p) { segs.push([E[p[0]](), E[p[1]]()]); });
      }
    }
    return segs;
  }
  function levelSegments(f, box, c, n) { return contour(grid(f, box, n), c); }
  // Mínimo y máximo de la malla (sin huecos).
  function zRange(g) {
    var lo = Infinity, hi = -Infinity;
    g.v.forEach(function (row) { row.forEach(function (z) { if (isFinite(z)) { if (z < lo) lo = z; if (z > hi) hi = z; } }); });
    if (!isFinite(lo)) return [NaN, NaN];
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    return [lo, hi];
  }
  function niceStep(span, target) {
    var raw = span / (target || 8), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  // Niveles «redondos» igualmente espaciados dentro de [lo, hi].
  function niceLevels(lo, hi, target) {
    var s = niceStep(hi - lo, target), out = [];
    for (var c = Math.ceil(lo / s - 1e-9) * s; c <= hi + 1e-9 && out.length < 60; c += s) out.push(+c.toFixed(10));
    return { step: s, levels: out };
  }
  function nearest(levels, v) {
    var best = null;
    levels.forEach(function (c) { if (best === null || Math.abs(c - v) < Math.abs(best - v)) best = c; });
    return best;
  }
  // Veredicto del reto «¿qué nivel pasa por P?»: ok, intercambio de x y y, signo, la curva
  // dibujada más cercana o mal. Misma tolerancia que los ejercicios (±0.01 o ±1 %).
  function close(s, t) { return Math.abs(s - t) <= Math.max(0.01 + 1e-9, 0.01 * Math.abs(t)); }
  function judgeLevel(s, t, o) {
    o = o || {};
    if (!isFinite(s)) return 'invalid';
    if (close(s, t)) return 'ok';
    if (o.swapped != null && isFinite(o.swapped) && !close(o.swapped, t) && close(s, o.swapped)) return 'swap';
    if (Math.abs(t) > 0.02 && close(s, -t)) return 'sign';
    if (o.levels && o.levels.length) { var l = nearest(o.levels, t); if (!close(l, t) && close(s, l)) return 'grid'; }
    return 'bad';
  }

  /* ---------- Cuádricas: A x² + B y² + C z² + D x + E y + F z + G = 0 ---------- */
  var NAMES = {
    ellipsoid: 'Elipsoide', hyperboloid1: 'Hiperboloide de una hoja', hyperboloid2: 'Hiperboloide de dos hojas',
    cone: 'Cono elíptico', 'paraboloid-elliptic': 'Paraboloide elíptico', 'paraboloid-hyperbolic': 'Paraboloide hiperbólico (silla)',
    'cylinder-elliptic': 'Cilindro elíptico', 'cylinder-hyperbolic': 'Cilindro hiperbólico', 'cylinder-parabolic': 'Cilindro parabólico',
    plane: 'Plano', degenerate: 'Caso degenerado'
  };
  var KINDS = ['ellipsoid', 'hyperboloid1', 'hyperboloid2', 'cone', 'paraboloid-elliptic', 'paraboloid-hyperbolic', 'cylinder-elliptic', 'cylinder-parabolic'];
  function coefArrays(co) { return { q: [co.A || 0, co.B || 0, co.C || 0], l: [co.D || 0, co.E || 0, co.F || 0], g: co.G || 0 }; }
  function F(co, x, y, z) { return (co.A || 0) * x * x + (co.B || 0) * y * y + (co.C || 0) * z * z + (co.D || 0) * x + (co.E || 0) * y + (co.F || 0) * z + (co.G || 0); }

  // Clasifica completando cuadrados: cuenta las variables al cuadrado, sus signos, la que
  // falta o aparece solo lineal, y si la constante del otro lado es cero.
  // axis: el eje especial (el del signo distinto, el de la variable lineal o el que falta).
  function classify(co) {
    var c = coefArrays(co), q = c.q, l = c.l;
    var scale = Math.max.apply(null, q.concat(l, [c.g]).map(Math.abs)) || 1, tol = 1e-9 * scale;
    var K = -c.g, kScale = Math.abs(c.g) + 1, Q = [], lin = [], i;
    for (i = 0; i < 3; i++) {
      if (Math.abs(q[i]) > tol) { Q.push(i); K += l[i] * l[i] / (4 * q[i]); kScale += l[i] * l[i] / Math.abs(4 * q[i]); }
      else if (Math.abs(l[i]) > tol) lin.push(i);
    }
    var kZero = Math.abs(K) <= 1e-9 * kScale;
    function out(kind, axis, extra) {
      var r = { kind: kind, axis: axis == null ? null : AX[axis], name: NAMES[kind] };
      for (var k in (extra || {})) r[k] = extra[k];
      return r;
    }
    if (Q.length === 3) {
      if (kZero) {
        var posZ = Q.filter(function (j) { return q[j] > 0; });
        if (posZ.length === 3 || posZ.length === 0) return out('degenerate');
        return out('cone', posZ.length === 2 ? Q.filter(function (j) { return q[j] < 0; })[0] : posZ[0]);
      }
      var s = K > 0 ? 1 : -1, pos = Q.filter(function (j) { return q[j] * s > 0; });
      if (pos.length === 3) return out('ellipsoid', null, { sphere: Math.abs(q[0] - q[1]) <= tol && Math.abs(q[1] - q[2]) <= tol });
      if (pos.length === 2) return out('hyperboloid1', Q.filter(function (j) { return q[j] * s < 0; })[0]);
      if (pos.length === 1) return out('hyperboloid2', pos[0]);
      return out('degenerate');
    }
    if (Q.length === 2) {
      var miss = 3 - Q[0] - Q[1];
      if (lin.length) return out(q[Q[0]] * q[Q[1]] > 0 ? 'paraboloid-elliptic' : 'paraboloid-hyperbolic', miss);
      if (kZero) return out('degenerate');
      var s2 = K > 0 ? 1 : -1, pos2 = Q.filter(function (j) { return q[j] * s2 > 0; }).length;
      if (pos2 === 2) return out('cylinder-elliptic', miss, { circular: Math.abs(q[Q[0]] - q[Q[1]]) <= tol });
      if (pos2 === 1) return out('cylinder-hyperbolic', miss);
      return out('degenerate');
    }
    if (Q.length === 1) {
      if (lin.length) return out('cylinder-parabolic', lin.length === 1 ? 3 - Q[0] - lin[0] : null);
      return out('degenerate');
    }
    return out(lin.length ? 'plane' : 'degenerate');
  }
  function kindOf(co) { return classify(co).kind; }

  // Cónica a u² + b v² + d u + e v + g = 0 (la traza de una cuádrica en un plano).
  var CONIC_NAMES = { ellipse: 'elipse', circle: 'circunferencia', hyperbola: 'hipérbola', parabola: 'parábola', lines: 'dos rectas', line: 'una recta', point: 'un punto', empty: 'no hay traza', plane: 'todo el plano' };
  function conic(a, b, d, e, g) {
    var scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(d), Math.abs(e), Math.abs(g)) || 1, tol = 1e-9 * scale;
    var qa = Math.abs(a) > tol, qb = Math.abs(b) > tol, K = -g, kScale = Math.abs(g) + 1;
    if (qa) { K += d * d / (4 * a); kScale += d * d / Math.abs(4 * a); }
    if (qb) { K += e * e / (4 * b); kScale += e * e / Math.abs(4 * b); }
    var kZero = Math.abs(K) <= 1e-9 * kScale;
    if (qa && qb) {
      if (kZero) return a * b > 0 ? 'point' : 'lines';
      var s = K > 0 ? 1 : -1, pos = (a * s > 0 ? 1 : 0) + (b * s > 0 ? 1 : 0);
      if (pos === 2) return Math.abs(a - b) <= tol ? 'circle' : 'ellipse';
      return pos === 1 ? 'hyperbola' : 'empty';
    }
    if (qa || qb) {
      var other = qa ? e : d, coef = qa ? a : b;
      if (Math.abs(other) > tol) return 'parabola';
      if (kZero) return 'line';
      return K * coef > 0 ? 'lines' : 'empty';
    }
    if (Math.abs(d) > tol || Math.abs(e) > tol) return 'line';
    return Math.abs(g) <= tol ? 'plane' : 'empty';
  }
  // Traza en el plano x = k, y = k o z = k.
  function trace(co, which, k) {
    var c = coefArrays(co), q = c.q, l = c.l, i = AX.indexOf(which);
    var o = [0, 1, 2].filter(function (j) { return j !== i; });
    return conic(q[o[0]], q[o[1]], l[o[0]], l[o[1]], c.g + q[i] * k * k + l[i] * k);
  }

  // Ecuación en LaTeX: los cuadrados y los lineales a la izquierda y la constante a la derecha;
  // si una variable aparece solo lineal (paraboloides), se despeja: z = x² + y².
  function texPoly(terms) {
    var s = '';
    terms.forEach(function (t) {
      var c = t[0], m = t[1];
      if (Math.abs(c) < 1e-12) return;
      var mag = Math.abs(c), body = m ? ((mag === 1 ? '' : String(+mag.toFixed(6))) + m) : String(+mag.toFixed(6));
      s += s ? (c < 0 ? ' - ' : ' + ') + body : (c < 0 ? '-' : '') + body;
    });
    return s || '0';
  }
  function tex(co) {
    var c = coefArrays(co), q = c.q, l = c.l, g = c.g, i;
    var linOnly = [0, 1, 2].filter(function (j) { return Math.abs(q[j]) < EPS && Math.abs(l[j]) > EPS; });
    if (linOnly.length === 1) {
      var w = linOnly[0], k = -l[w], sg = k < 0 ? -1 : 1, right = [];
      for (i = 0; i < 3; i++) if (i !== w) right.push([sg * q[i], AX[i] + '^2']);
      for (i = 0; i < 3; i++) if (i !== w) right.push([sg * l[i], AX[i]]);
      right.push([sg * g, '']);
      return texPoly([[sg * k, AX[w]]]) + ' = ' + texPoly(right);
    }
    var left = [];
    for (i = 0; i < 3; i++) left.push([q[i], AX[i] + '^2']);
    for (i = 0; i < 3; i++) left.push([l[i], AX[i]]);
    return texPoly(left) + ' = ' + texPoly([[-g, '']]);
  }

  // Muestra al azar de una cuádrica de cada tipo, con su eje especial y quizá un centro corrido.
  // Local: (p, q, w), w = eje especial. PERM lleva p, q, w a x, y, z.
  var PERM = { z: [0, 1, 2], x: [1, 2, 0], y: [2, 0, 1] };
  function pick(rnd, arr) { return arr[Math.min(arr.length - 1, Math.floor(rnd() * arr.length))]; }
  function between(x, a, b) { return x >= a - 1e-9 && x <= b + 1e-9; }
  function sample(kind, rnd, o) {
    o = o || {}; rnd = rnd || Math.random;
    var axis = o.axis || pick(rnd, AX), shifted = o.shift != null ? o.shift : rnd() < 0.35;
    var al = 1, be = 1, ga = 1, K = 0, lam = 1, tries;
    var para = kind === 'paraboloid-elliptic' || kind === 'paraboloid-hyperbolic' || kind === 'cylinder-parabolic';
    for (tries = 0; tries < 400; tries++) {
      al = pick(rnd, para ? [1, 2, 4] : [1, 4, 9]); be = pick(rnd, para ? [1, 2, 4] : [1, 4, 9]); ga = pick(rnd, [1, 4, 9]);
      K = pick(rnd, [4, 9, 16, 36]); lam = pick(rnd, [1, 2, 4]) * (rnd() < 0.5 ? -1 : 1);
      var a = Math.sqrt(K / al), b = Math.sqrt(K / be), c = Math.sqrt(K / ga), ok = true;
      if (kind === 'ellipsoid') ok = between(a, 1, 3.5) && between(b, 1, 3.5) && between(c, 1, 3.5) && !(al === be && be === ga);
      else if (kind === 'hyperboloid1') ok = between(a, 1, 3) && between(b, 1, 3) && between(c, 0.5, 3);
      else if (kind === 'hyperboloid2') ok = between(c, 0.7, 2.5) && between(a, 0.5, 3) && between(b, 0.5, 3);
      else if (kind === 'cylinder-elliptic') ok = between(a, 1, 3.5) && between(b, 1, 3.5);
      if (ok) break;
    }
    var kap = [0, 0, 0], Lw = 0;
    if (kind === 'ellipsoid') kap = [al, be, ga];
    else if (kind === 'hyperboloid1') kap = [al, be, -ga];
    else if (kind === 'hyperboloid2') kap = [-al, -be, ga];
    else if (kind === 'cone') { kap = [al, be, -ga]; K = 0; }
    else if (kind === 'paraboloid-elliptic') { kap = [al, be, 0]; Lw = -lam; K = 0; }
    else if (kind === 'paraboloid-hyperbolic') { kap = [-al, be, 0]; Lw = -lam; K = 0; }
    else if (kind === 'cylinder-elliptic') kap = [al, be, 0];
    else if (kind === 'cylinder-parabolic') { kap = [al, 0, 0]; Lw = -lam; K = 0; }
    var s = [0, 0, 0];
    if (shifted) s = [pick(rnd, [-1, 0, 1]), pick(rnd, [-1, 0, 1]), pick(rnd, [-1, 0, 1])];
    if (kind === 'cylinder-elliptic') s[2] = 0;
    if (kind === 'cylinder-parabolic') s[1] = 0;
    var P = PERM[axis], q = [0, 0, 0], l = [0, 0, 0], g = -K, center = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      q[P[i]] = kap[i]; l[P[i]] = -2 * kap[i] * s[i]; g += kap[i] * s[i] * s[i]; center[P[i]] = s[i];
    }
    l[P[2]] += Lw; g -= Lw * s[2];
    return {
      kind: kind, axis: axis, center: center, local: { al: al, be: be, ga: ga, K: K, lam: lam, s: s },
      coef: { A: q[0], B: q[1], C: q[2], D: l[0], E: l[1], F: l[2], G: g }
    };
  }
  // Superficies paramétricas que recorren la cuádrica (para el 3D): [{ u, v, fn(u, v) → [x, y, z] }].
  function param(smp, W) {
    W = W || 3.5;
    var L = smp.local, P = PERM[smp.axis], sh = L.s, TAU = 2 * Math.PI, list = [];
    var a = Math.sqrt(L.K / L.al), b = Math.sqrt(L.K / L.be), c = Math.sqrt(L.K / L.ga);
    function put(fn, u, v) {
      list.push({ u: u, v: v, fn: function (uu, vv) {
        var p = fn(uu, vv), out = [0, 0, 0];
        for (var i = 0; i < 3; i++) out[P[i]] = p[i] + sh[i];
        return out;
      } });
    }
    var k = smp.kind;
    if (k === 'ellipsoid') put(function (ph, th) { return [a * Math.sin(ph) * Math.cos(th), b * Math.sin(ph) * Math.sin(th), c * Math.cos(ph)]; }, [0, Math.PI], [0, TAU]);
    else if (k === 'hyperboloid1') {
      var T1 = Math.min(Math.asinh(W / c), Math.acosh(Math.max(1.2 * W / Math.max(a, b), 1.05)));
      put(function (t, th) { return [a * Math.cosh(t) * Math.cos(th), b * Math.cosh(t) * Math.sin(th), c * Math.sinh(t)]; }, [-T1, T1], [0, TAU]);
    } else if (k === 'hyperboloid2') {
      var T2 = Math.min(Math.acosh(Math.max(W / c, 1.05)), Math.asinh(1.2 * W / Math.max(a, b)));
      [1, -1].forEach(function (sg) {
        put(function (t, th) { return [a * Math.sinh(t) * Math.cos(th), b * Math.sinh(t) * Math.sin(th), sg * c * Math.cosh(t)]; }, [0, T2], [0, TAU]);
      });
    } else if (k === 'cone') {
      var ra = Math.sqrt(L.ga / L.al), rb = Math.sqrt(L.ga / L.be);
      var TC = Math.min(W, 1.2 * W / Math.max(ra, rb));
      put(function (t, th) { return [t * ra * Math.cos(th), t * rb * Math.sin(th), t]; }, [-TC, TC], [0, TAU]);
    } else if (k === 'paraboloid-elliptic') {
      put(function (r, th) { return [r * Math.cos(th) / Math.sqrt(L.al), r * Math.sin(th) / Math.sqrt(L.be), r * r / L.lam]; }, [0, Math.sqrt(Math.abs(L.lam) * W)], [0, TAU]);
    } else if (k === 'paraboloid-hyperbolic') {
      var PH = Math.sqrt(Math.abs(L.lam) * W / Math.max(L.al, L.be));
      put(function (u, v) { return [u, v, (L.be * v * v - L.al * u * u) / L.lam]; }, [-PH, PH], [-PH, PH]);
    } else if (k === 'cylinder-elliptic') {
      put(function (t, th) { return [a * Math.cos(th), b * Math.sin(th), t]; }, [-W, W], [0, TAU]);
    } else if (k === 'cylinder-parabolic') {
      var PC = Math.sqrt(Math.abs(L.lam) * W / L.al);
      put(function (u, v) { return [u, v, L.al * u * u / L.lam]; }, [-PC, PC], [-W, W]);
    }
    return list;
  }
  // Pista del «casi» al confundir dos cuádricas parecidas (null si no hay una relación clara).
  function quadricHint(real, chosen) {
    if (real === chosen) return null;
    var hyp = { hyperboloid1: 1, hyperboloid2: 1 }, par = { 'paraboloid-elliptic': 1, 'paraboloid-hyperbolic': 1 };
    var cyl = { 'cylinder-elliptic': 1, 'cylinder-hyperbolic': 1, 'cylinder-parabolic': 1 };
    if (hyp[real] && hyp[chosen]) return 'sheets';
    if ((real === 'cone' && hyp[chosen]) || (hyp[real] && chosen === 'cone')) return 'cone';
    if (par[real] && par[chosen]) return 'saddle';
    if (cyl[real] && cyl[chosen]) return 'cylinder-type';
    if (cyl[real]) return 'cylinder';
    if (cyl[chosen]) return 'nocylinder';
    if (par[real]) return 'linear';
    if (par[chosen]) return 'squares';
    if (real === 'ellipsoid' || chosen === 'ellipsoid') return 'signs';
    return null;
  }

  window.LabMath.surface = {
    dist: dist, sphere: sphere, cross: cross, planeFromNormal: planeFromNormal, planeFromPoints: planeFromPoints,
    onPlane: onPlane, axisIntercept: axisIntercept, intercepts: intercepts, evalAt: evalAt,
    grid: grid, contour: contour, levelSegments: levelSegments, zRange: zRange, niceLevels: niceLevels, nearest: nearest, judgeLevel: judgeLevel,
    F: F, classify: classify, kindOf: kindOf, conic: conic, trace: trace, tex: tex, sample: sample, param: param, quadricHint: quadricHint,
    NAMES: NAMES, KINDS: KINDS, CONIC_NAMES: CONIC_NAMES
  };

  /* ------------------------------ UI ------------------------------ */
  var PRESETS = [
    { name: 'Paraboloide: x² + y²', f: 'x^2 + y^2', R: 3 },
    { name: 'Silla: x² − y²', f: 'x^2 - y^2', R: 3 },
    { name: 'Cono: √(x² + y²)', f: 'sqrt(x^2 + y^2)', R: 3 },
    { name: 'Plano: 6 − 2x − 3y', f: '6 - 2x - 3y', R: 3 },
    { name: 'Elipses: x² + 4y²', f: 'x^2 + 4y^2', R: 3 },
    { name: 'Colina: 4e^(−(x² + y²)/4)', f: '4e^(-(x^2 + y^2)/4)', R: 4 },
    { name: 'Media esfera: √(9 − x² − y²)', f: 'sqrt(9 - x^2 - y^2)', R: 3.5 },
    { name: 'Ondas: sin x · cos y', f: 'sin(x)*cos(y)', R: 4 }
  ];
  var HINTS = {
    sheets: ['warn', 'Es un hiperboloide; cuenta las hojas', 'Con un solo signo menos es de una hoja (tiene «cintura»); con dos signos menos es de dos hojas y hay un hueco: algunas trazas perpendiculares a su eje no existen.'],
    cone: ['warn', 'Cono e hiperboloide se parecen', 'Si después de completar cuadrados el lado derecho es 0, es un cono (la traza por el vértice es un punto o dos rectas). Si no es 0, es un hiperboloide.'],
    saddle: ['warn', 'Es un paraboloide; revisa los signos', 'Si los dos cuadrados tienen el mismo signo es elíptico (un tazón); con signos distintos es hiperbólico (una silla).'],
    'cylinder-type': ['warn', 'Sí es un cilindro, pero de otro tipo', 'Mira la traza perpendicular a la variable que falta: elipse → cilindro elíptico; parábola → cilindro parabólico.'],
    cylinder: ['bad', 'Falta una variable', 'Si una variable no aparece en la ecuación, la superficie es un cilindro: la misma curva repetida a lo largo de ese eje.'],
    nocylinder: ['bad', 'Aparecen las tres variables', 'Un cilindro no depende de una de las variables. Aquí están las tres, así que no es cilindro.'],
    linear: ['bad', 'Una variable no está al cuadrado', 'Si una variable aparece solo a la primera potencia, la superficie es un paraboloide (o un cilindro parabólico).'],
    squares: ['bad', 'Las tres variables están al cuadrado', 'Un paraboloide tiene una variable lineal. Con las tres al cuadrado es elipsoide, hiperboloide o cono.'],
    signs: ['bad', 'Revisa los signos de los cuadrados', 'Todos positivos (con constante positiva): elipsoide. Un signo distinto: hiperboloide o cono.']
  };

  window.Labs['surface-contour'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, S = window.LabMath.surface;
    var presets = cfg.presets || PRESETS;
    var math = null, f = null, R = 3, G = null, zr = [0, 1], lv = { step: 1, levels: [] }, P = cfg.point || [1, 0.5];
    var mode = cfg.mode === 'quadric' ? 'quadric' : 'fn', smp = null, QL = 5;
    var N = 64;

    /* ----- controles: z = f(x, y) ----- */
    var preset = UI.select({ label: 'Ejemplo', options: presets.map(function (p) { return p.name; }) });
    var fIn = UI.mathField({ label: 'Función f(x, y)', hint: 'Usa x y y; por ejemplo x^2 + y^2.', onEnter: function () { build(); } });
    var rS = UI.slider({ label: 'Ventana: −R ≤ x, y ≤ R', min: 1, max: 6, step: 0.5, value: 3 }, function () { build(); });
    var run = UI.button('Graficar', 'primary', function () { build(); });
    var status = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var two = function (v) { return UI.fmt(+(+v).toFixed(2)); };
    var cS = UI.slider({ label: 'Nivel c (curva f = c)', min: 0, max: 1, step: 'any', value: 0.5, fmt: two }, function () { draw(); });
    var bS = UI.slider({ label: 'Corte lateral y = b', min: -3, max: 3, step: 0.05, value: 0, fmt: two }, function () { draw(); });
    var givenP = h('p', { class: 'lab-given' });
    var newP = UI.button('Otro punto P', 'ghost', function () { newPoint(); });
    var cIn = UI.input({ label: 'Tu c para la curva que pasa por P', type: 'number', step: 'any', inputmode: 'decimal', mono: false, hint: 'Calcula f(P) a mano y escríbelo con punto decimal.' });
    cIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verifyLevel(); } });
    var checkC = UI.button('Comprobar', 'primary', function () { verifyLevel(); });
    var verdictC = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var panelFn = h('div', { class: 'lab-controls' }, [preset.node, fIn.node, rS.node, h('div', { class: 'lab-buttons' }, [run]), status, cS.node, bS.node,
      h('p', { class: 'lab-field__label' }, ['Reto: ¿qué nivel pasa por P?']), givenP, h('div', { class: 'lab-buttons' }, [newP]), cIn.node, h('div', { class: 'lab-buttons' }, [checkC]), verdictC, facts]);

    /* ----- controles: ¿qué cuádrica es? ----- */
    var qGiven = h('div', { class: 'lab-given' });
    var qNew = UI.button('Otra superficie', 'ghost', function () { newQuadric(); });
    var qSel = UI.select({ label: '¿Qué superficie es?', options: ['Elige una…'].concat(KINDS.map(function (k) { return NAMES[k]; })) });
    var qCheck = UI.button('Comprobar', 'primary', function () { verifyQuadric(); });
    var qVerdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var kS = UI.slider({ label: 'Traza horizontal z = k', min: -4, max: 4, step: 0.25, value: 0, fmt: two }, function () { draw(); });
    var qbS = UI.slider({ label: 'Traza lateral y = b', min: -4, max: 4, step: 0.25, value: 0, fmt: two }, function () { draw(); });
    var qFacts = h('dl', { class: 'lab-facts' });
    var panelQ = h('div', { class: 'lab-controls', hidden: true }, [h('p', { class: 'lab-field__label' }, ['Ecuación']), qGiven, h('div', { class: 'lab-buttons' }, [qNew]), kS.node, qbS.node, qFacts, qSel.node, h('div', { class: 'lab-buttons' }, [qCheck]), qVerdict]);

    /* ----- tablero ----- */
    var svgCut = UI.svg(640, 320, 'Corte lateral de la superficie con el plano y = b');
    var svgMap = UI.svg(520, 480, 'Mapa de contorno en el plano xy');
    var want3D = !!(window.matchMedia && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches);
    var stage3d = h('div', { class: 'lab-stage lab-stage--manim lab-stage--3d', hidden: true, role: 'img', 'aria-label': 'Superficie en 3D; arrastra para girarla' });
    var note3d = h('p', { class: 'lab-note', hidden: true }, ['Arrastra para girar; la rueda del mouse acerca y aleja. La escala vertical se ajusta a la ventana.']);
    var btn3d = UI.button('Vista 3D', 'ghost', function () { setView('3d'); });
    var btn2d = UI.button('Corte 2D', 'ghost', function () { setView('2d'); });
    var viewBar = h('div', { class: 'lab-buttons lab-viewbar', hidden: !want3D, role: 'group', 'aria-label': 'Tipo de vista' }, [btn3d, btn2d]);
    var capTop = h('p', { class: 'lab-stack__label' });
    var capMap = h('p', { class: 'lab-stack__label' });
    var legend = h('ul', { class: 'lab-legend' });
    var M3 = null, scene3 = null, view = '2d', pending3 = false;

    var form = h('form', { class: 'lab-controls', novalidate: true }, [panelFn, panelQ]);
    mount.appendChild(h('div', { class: 'lab-grid' }, [
      form,
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Superficie ↔ mapa de contorno']),
        viewBar,
        h('div', { class: 'sc-wrap' }, [h('div', { class: 'sc-views' }, [
          h('div', { class: 'lab-stack' }, [capTop, svgCut, stage3d, note3d]),
          h('div', { class: 'lab-stack' }, [capMap, svgMap])
        ])]),
        legend
      ])
    ]));
    var labMode = UI.select({ label: '¿Qué quieres hacer?', options: ['Explorar z = f(x, y)', 'Reto: ¿qué cuádrica es?'] });
    labMode.node.classList.add('lab-mode');
    mount.insertBefore(labMode.node, mount.firstChild);
    form.addEventListener('submit', function (e) { e.preventDefault(); if (mode === 'fn') build(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); build(); });
    labMode.input.addEventListener('change', function () { setMode(labMode.input.value === '1' ? 'quadric' : 'fn'); });

    function legendItems(items) {
      legend.innerHTML = '';
      items.forEach(function (it) { legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + it[0] + (it[2] ? ' sw--dashed' : '') }), it[1]])); });
    }
    function setMode(m) {
      mode = m;
      panelFn.hidden = m !== 'fn'; panelQ.hidden = m !== 'quadric';
      labMode.input.value = m === 'fn' ? '0' : '1';
      if (m === 'quadric' && !smp) newQuadric(); else draw();
    }
    function load(i) {
      var p = presets[i];
      fIn.setMath(p.f); rS.set(p.R || 3); verdictC.hidden = true;
    }
    load(cfg.start || 0);

    function build() {
      if (!math) return;
      try {
        var src = String(fIn.get() || '').trim();
        if (!src) throw new Error('Escribe f(x, y).');
        var fn = window.LabMath.core.build(math, src, ['x', 'y']).fn;
        R = rS.get();
        var g = S.grid(fn, { x: [-R, R], y: [-R, R] }, N), r = S.zRange(g);
        if (!isFinite(r[0])) throw new Error('f no está definida en la ventana. Revisa la fórmula o agranda R.');
        f = fn; G = g; zr = r; lv = S.niceLevels(r[0], r[1], 8);
        status.hidden = true;
      } catch (e) { UI.verdict(status, 'bad', 'No pude graficar', e.message); return; }
      cS.input.min = String(zr[0]); cS.input.max = String(zr[1]);
      var mid = S.nearest(lv.levels, (zr[0] + zr[1]) / 2);
      cS.set(mid != null ? mid : (zr[0] + zr[1]) / 2);
      bS.input.min = String(-R); bS.input.max = String(R);
      if (Math.abs(bS.get()) > R) bS.set(0);
      if (!pointOk(P)) newPoint(true); else showPoint();
      draw();
    }
    function pointOk(p) { return p && Math.abs(p[0]) <= R && Math.abs(p[1]) <= R && isFinite(f(p[0], p[1])); }
    function newPoint(quiet) {
      if (!f) return;
      var m = Math.floor(R * 0.8 * 2) / 2, k = Math.round(m * 2), tries = 0, p;
      do { p = [(Math.floor(Math.random() * (2 * k + 1)) - k) / 2, (Math.floor(Math.random() * (2 * k + 1)) - k) / 2]; tries++; }
      while (tries < 200 && (!isFinite(f(p[0], p[1])) || (p[0] === 0 && p[1] === 0) || p[0] === p[1]));
      P = p; cIn.input.value = ''; verdictC.hidden = true;
      showPoint();
      if (!quiet) draw();
    }
    function showPoint() { givenP.textContent = 'P = (' + UI.fmt(P[0]) + ', ' + UI.fmt(P[1]) + '). ¿Qué valor de c tiene la curva de nivel que pasa por P?'; }
    function verifyLevel() {
      if (!f) return;
      var s = parseFloat(String(cIn.input.value).replace(',', '.').replace('−', '-')), t = f(P[0], P[1]);
      var key = S.judgeLevel(s, t, { swapped: f(P[1], P[0]), levels: lv.levels });
      var tt = UI.fmt(+t.toFixed(4));
      if (key === 'invalid') { UI.verdict(verdictC, 'bad', 'Escribe un número', 'Usa punto decimal; por ejemplo 2.25.'); return; }
      if (key === 'ok') { UI.verdict(verdictC, 'ok', 'Correcto: c = f(P) = ' + tt, 'La curva f = ' + tt + ' ya está resaltada: pasa justo por P.'); cS.set(t); draw(); return; }
      if (key === 'swap') { UI.verdict(verdictC, 'warn', 'Intercambiaste x y y', 'P = (x, y): la primera coordenada va en x y la segunda en y.'); return; }
      if (key === 'sign') { UI.verdict(verdictC, 'warn', 'Revisa el signo', 'Cuidado con los cuadrados de números negativos y con los signos menos de f.'); return; }
      if (key === 'grid') { UI.verdict(verdictC, 'warn', 'Leíste la curva dibujada más cercana', 'Las curvas del mapa son solo algunos niveles. El nivel exacto sale de sustituir P en f.'); return; }
      UI.verdict(verdictC, 'bad', 'No coincide', 'Sustituye x = ' + UI.fmt(P[0]) + ' y y = ' + UI.fmt(P[1]) + ' en f(x, y) con cuidado. Mueve el deslizador de c hasta que la curva toque P para comprobar.');
    }

    /* ----- cuádricas ----- */
    function newQuadric() {
      var kinds = KINDS, k = kinds[Math.floor(Math.random() * kinds.length)];
      if (smp && k === smp.kind) k = kinds[(kinds.indexOf(k) + 1 + Math.floor(Math.random() * (kinds.length - 1))) % kinds.length];
      smp = S.sample(k, Math.random);
      qGiven.innerHTML = '$$' + S.tex(smp.coef) + '$$';
      UI.renderMath(qGiven);
      qSel.input.value = '0'; qVerdict.hidden = true;
      draw();
    }
    function verifyQuadric() {
      if (!smp) return;
      var i = +qSel.input.value;
      if (!i) { UI.verdict(qVerdict, 'bad', 'Elige una superficie', 'Usa las trazas: mueve k y b y fíjate qué curvas salen.'); return; }
      var chosen = KINDS[i - 1], real = S.classify(smp.coef);
      if (chosen === real.kind) {
        UI.verdict(qVerdict, 'ok', '¡Sí! Es un ' + real.name.toLowerCase(), real.axis ? 'Su eje especial es el eje ' + real.axis + '.' : 'Sus trazas son elipses en las tres direcciones.');
        return;
      }
      var key = S.quadricHint(real.kind, chosen), hint = key && HINTS[key];
      if (hint) UI.verdict(qVerdict, hint[0], hint[1], hint[2]);
      else UI.verdict(qVerdict, 'bad', 'No es esa', 'Completa cuadrados y cuenta: ¿cuántas variables al cuadrado, con qué signos, y alguna lineal o ausente?');
    }

    /* ----- dibujo ----- */
    function segsOf(g, c) { return S.contour(g, c); }
    function draw() {
      if (mode === 'quadric') drawQuadric(); else drawFn();
      if (view === '3d') schedule3D();
    }
    function drawFn() {
      capTop.textContent = 'Corte lateral con el plano y = b (x horizontal, z vertical)';
      capMap.textContent = 'Mapa de contorno en el plano xy';
      legendItems([['aux', 'curvas de nivel'], ['trace', 'nivel c'], ['ref', 'corte y = b'], ['error', 'punto P']]);
      if (!f || !G) return;
      var c = cS.get(), b = bS.get();
      var map = window.LabPlot(svgMap, { x: [-R, R], y: [-R, R], equal: true });
      map.clear(); map.grid();
      lv.levels.forEach(function (L) { if (Math.abs(L - c) > 1e-9) map.segments(segsOf(G, L), 'aux', 1.3); });
      map.axes();
      map.curve(function () { return b; }, 'ref', 2, '7 6', -R, R);
      map.segments(segsOf(G, c), 'trace', 3.2);
      map.point(P[0], P[1], 'dot-error', 6);

      var pad = (zr[1] - zr[0]) * 0.12;
      var cut = window.LabPlot(svgCut, { x: [-R, R], y: [zr[0] - pad, zr[1] + pad] });
      cut.clear(); cut.grid(); cut.axes();
      cut.curve(function () { return c; }, 'trace', 2.4, '8 6', -R, R);
      cut.curve(function (x) { return f(x, b); }, 'ref', 3, null, -R, R);
      var n = 400, prev = null;
      for (var i = 0; i <= n; i++) {
        var x = -R + 2 * R * i / n, z = f(x, b) - c;
        if (prev && isFinite(z) && isFinite(prev[1]) && (z === 0 || prev[1] * z < 0)) {
          var xs = z === 0 ? x : prev[0] + (x - prev[0]) * prev[1] / (prev[1] - z);
          cut.point(xs, c, 'dot-trace', 5);
        }
        prev = [x, z];
      }
      facts.innerHTML = '';
      [['f en la ventana', 'de ' + two(zr[0]) + ' a ' + two(zr[1])], ['curvas cada', UI.fmt(lv.step)], ['nivel c', two(c)]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }
    function qGrid(fn) { return S.grid(fn, { x: [-QL, QL], y: [-QL, QL] }, 72); }
    function drawQuadric() {
      capTop.textContent = 'Traza en el plano y = b (x horizontal, z vertical)';
      capMap.textContent = 'Trazas horizontales z = k vistas desde arriba (plano xy)';
      legendItems([['aux', 'trazas z = −4, …, 4'], ['trace', 'traza z = k'], ['ref', 'traza y = b']]);
      if (!smp) return;
      var co = smp.coef, k = kS.get(), b = qbS.get();
      var map = window.LabPlot(svgMap, { x: [-QL, QL], y: [-QL, QL], equal: true });
      map.clear(); map.grid();
      for (var kk = -4; kk <= 4; kk++) if (Math.abs(kk - k) > 1e-9) map.segments(segsOf(qGrid(function (x, y) { return S.F(co, x, y, kk); }), 0), 'aux', 1.2);
      map.axes();
      map.curve(function () { return b; }, 'ref', 2, '7 6', -QL, QL);
      map.segments(segsOf(qGrid(function (x, y) { return S.F(co, x, y, k); }), 0), 'trace', 3.2);

      var cut = window.LabPlot(svgCut, { x: [-QL, QL], y: [-QL, QL], equal: true });
      cut.clear(); cut.grid(); cut.axes();
      cut.curve(function () { return k; }, 'trace', 2.2, '8 6', -QL, QL);
      cut.segments(segsOf(qGrid(function (x, z) { return S.F(co, x, b, z); }), 0), 'ref', 3);
      qFacts.innerHTML = '';
      [['traza z = ' + two(k), S.CONIC_NAMES[S.trace(co, 'z', k)]], ['traza y = ' + two(b), S.CONIC_NAMES[S.trace(co, 'y', b)]], ['traza x = 0', S.CONIC_NAMES[S.trace(co, 'x', 0)]]]
        .forEach(function (r) { qFacts.appendChild(h('dt', {}, [r[0]])); qFacts.appendChild(h('dd', {}, [r[1]])); });
    }

    /* ---------- Vista 3D (solo PC) ---------- */
    function setView(v) {
      view = v === '3d' && scene3 ? '3d' : '2d';
      svgCut.style.display = view === '2d' ? '' : 'none';
      stage3d.hidden = note3d.hidden = view !== '3d';
      btn3d.setAttribute('aria-pressed', String(view === '3d'));
      btn2d.setAttribute('aria-pressed', String(view === '2d'));
      if (view === '3d') { capTop.hidden = true; schedule3D(); } else capTop.hidden = false;
    }
    function schedule3D() {
      if (pending3) return;
      pending3 = true;
      requestAnimationFrame(function () { pending3 = false; try { draw3D(); } catch (e) { console.error(e); setView('2d'); } });
    }
    function draw3D() {
      if (!scene3) return;
      var C = { ref: UI.color('--plot-ref'), aux: UI.color('--plot-aux'), trace: UI.color('--plot-trace'), axis: UI.color('--plot-axis'), err: UI.color('--plot-error') };
      var objs = [];
      function surf(func, u, v, res, color, opacity) {
        objs.push(new M3.Surface3D({ func: func, uRange: u, vRange: v, uResolution: res[0], vResolution: res[1], color: color, opacity: opacity, doubleSided: true }));
      }
      function line(p, q, color, w) { if (p.concat(q).every(isFinite)) objs.push(new M3.Line3D({ start: p, end: q, color: color, lineWidth: w || 3 })); }
      if (mode === 'fn') {
        if (!f || !G) return;
        var lo = zr[0], hi = zr[1], s = 9 / (2 * R), sz = 5.5 / (hi - lo), zc = (lo + hi) / 2, c = cS.get(), b = bS.get();
        var Z = function (z) { return (Math.max(lo, Math.min(hi, isFinite(z) ? z : lo)) - zc) * sz; };
        surf(function (u, v) { return [u * s, v * s, Z(f(u, v))]; }, [-R, R], [-R, R], [40, 40], C.aux, 0.5);
        surf(function (u, v) { return [u * s, v * s, Z(c)]; }, [-R, R], [-R, R], [2, 2], C.trace, 0.16);
        segsOf(G, c).forEach(function (sg) { line([sg[0][0] * s, sg[0][1] * s, Z(c)], [sg[1][0] * s, sg[1][1] * s, Z(c)], C.trace, 3); });
        var pv = null;
        for (var i = 0; i <= 80; i++) {
          var x = -R + 2 * R * i / 80, z = f(x, b), pt = isFinite(z) ? [x * s, b * s, Z(z)] : null;
          if (pv && pt) line(pv, pt, C.ref, 3);
          pv = pt;
        }
        line([-R * s, 0, Z(lo)], [R * s, 0, Z(lo)], C.axis, 2);
        line([0, -R * s, Z(lo)], [0, R * s, Z(lo)], C.axis, 2);
        line([0, 0, Z(lo)], [0, 0, Z(hi)], C.axis, 2);
        var zp = f(P[0], P[1]);
        if (isFinite(zp)) line([P[0] * s, P[1] * s, Z(lo)], [P[0] * s, P[1] * s, Z(zp)], C.err, 2);
      } else {
        if (!smp) return;
        var sq = 9 / (2 * QL), k = kS.get(), bq = qbS.get(), co = smp.coef;
        S.param(smp, 3.5).forEach(function (p) {
          surf(function (u, v) { var q = p.fn(u, v); return [q[0] * sq, q[1] * sq, q[2] * sq]; }, p.u, p.v, [40, 40], C.aux, 0.5);
        });
        surf(function (u, v) { return [u * sq, v * sq, k * sq]; }, [-QL, QL], [-QL, QL], [2, 2], C.trace, 0.14);
        segsOf(qGrid(function (x, y) { return S.F(co, x, y, k); }), 0).forEach(function (sg) { line([sg[0][0] * sq, sg[0][1] * sq, k * sq], [sg[1][0] * sq, sg[1][1] * sq, k * sq], C.trace, 3); });
        segsOf(qGrid(function (x, z) { return S.F(co, x, bq, z); }), 0).forEach(function (sg) { line([sg[0][0] * sq, bq * sq, sg[0][1] * sq], [sg[1][0] * sq, bq * sq, sg[1][1] * sq], C.ref, 3); });
        line([-QL * sq, 0, 0], [QL * sq, 0, 0], C.axis, 2);
        line([0, -QL * sq, 0], [0, QL * sq, 0], C.axis, 2);
        line([0, 0, -QL * sq], [0, 0, QL * sq], C.axis, 2);
      }
      scene3.clear();
      scene3.add.apply(scene3, objs);
      if (typeof scene3.render === 'function') scene3.render();
    }
    function init3D() {
      if (!want3D) return;
      UI.loadManim().then(function (mod) {
        M3 = mod;
        stage3d.hidden = false;
        var w = stage3d.clientWidth || 640;
        scene3 = new M3.ThreeDScene(stage3d, { width: w, height: Math.round(w * 0.66), backgroundOpacity: 0, phi: 65 * Math.PI / 180, theta: -60 * Math.PI / 180, enableOrbitControls: true });
        stage3d.setAttribute('data-3d-ready', 'true');
        setView('3d');
      }).catch(function (e) {
        console.error(e);
        stage3d.hidden = true; viewBar.hidden = true; scene3 = null; setView('2d');
      });
    }

    document.addEventListener('cb:themechange', function () { draw(); });
    setView('2d');
    if (mode === 'quadric') { panelFn.hidden = true; panelQ.hidden = false; labMode.input.value = '1'; }
    return UI.loadMath().then(function (m) {
      math = m; build(); setTimeout(build, 400);
      if (mode === 'quadric') newQuadric();
      UI.onVisible(mount, init3D);
    });
  };
})();
