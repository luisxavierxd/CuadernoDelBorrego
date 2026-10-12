/* =====================================================================
   Lab region-order (Cálculo 2 · S12): «¿Es tu región?». Una región entre
   curvas con rebanadas verticales (tipo I) u horizontales (tipo II). El
   alumno escribe los límites de la integral iterada en el orden pedido
   (los de afuera, números; los de adentro, expresiones en la otra
   variable) y el lab dibuja la región que describen sus límites encima de
   la verdadera: lo que sobra y lo que falta. Compara también el área o la
   integral. «Casi»: límites invertidos (área negativa), usar la variable
   de adentro en sus propios límites, copiar la curva sin despejar, olvidar
   partir la región en dos o escribir el otro orden.
   ===================================================================== */
(function () {
  /* ------------------------- Matemática pura ------------------------- */
  function prep(s) { return window.LabMath.core.prep(s); }
  var OUTER = { I: 'x', II: 'y' }, INNER = { I: 'y', II: 'x' };
  function other(kind) { return kind === 'I' ? 'II' : 'I'; }

  // Cuadratura tanh-sinh en [−1, 1]: aguanta raíces en los extremos (√x, √(4 − x²)).
  var TS = (function () {
    var h = 1 / 8, xs = [], ws = [];
    for (var k = -26; k <= 26; k++) {
      var t = k * h, u = Math.PI / 2 * Math.sinh(t), ch = Math.cosh(u);
      xs.push(Math.tanh(u)); ws.push(h * Math.PI / 2 * Math.cosh(t) / (ch * ch));
    }
    return { x: xs, w: ws };
  })();
  // ∫_a^b fn (con signo si b < a). Un valor no finito con peso apreciable devuelve NaN.
  function quad(fn, a, b) {
    if (!(isFinite(a) && isFinite(b))) return NaN;
    if (a === b) return 0;
    var m = (a + b) / 2, r = (b - a) / 2, s = 0;
    for (var i = 0; i < TS.x.length; i++) {
      var x = m + r * TS.x[i];
      if (x < Math.min(a, b)) x = Math.min(a, b); else if (x > Math.max(a, b)) x = Math.max(a, b);
      var v = fn(x);
      if (!isFinite(v)) { if (TS.w[i] > 1e-12) return NaN; continue; }
      s += TS.w[i] * v;
    }
    return s * r;
  }

  // Variables libres de una expresión (sin funciones ni constantes).
  var CONST = { pi: 1, e: 1, E: 1, PI: 1, tau: 1, Infinity: 1 };
  function symbols(math, src) {
    var node = math.parse(prep(src)), out = [];
    node.traverse(function (n, path, parent) {
      if (!n.isSymbolNode) return;
      if (parent && parent.isFunctionNode && path === 'fn') return;
      if (CONST[n.name] || out.indexOf(n.name) >= 0) return;
      out.push(n.name);
    });
    return out;
  }
  // Función de una variable a partir de un número o de una expresión de math.js.
  function fn1(math, src, v) {
    if (typeof src === 'number') return function () { return src; };
    if (typeof src === 'function') return src;
    return window.LabMath.core.build(math, src, [v]).fn;
  }
  function fn2(math, src) {
    if (typeof src === 'function') return src;
    return window.LabMath.core.build(math, String(src), ['x', 'y']).fn;
  }

  // Región: { kind: 'I' | 'II', pieces: [{ a, b, lo, hi }] }.
  //  tipo I : a ≤ x ≤ b, lo(x) ≤ y ≤ hi(x)   (rebanadas verticales, dy dx)
  //  tipo II: a ≤ y ≤ b, lo(y) ≤ x ≤ hi(y)   (rebanadas horizontales, dx dy)
  function compile(math, desc) {
    if (desc.compiled) return desc;
    var v = OUTER[desc.kind];
    return {
      kind: desc.kind, compiled: true,
      pieces: desc.pieces.map(function (p) {
        return { a: +p.a, b: +p.b, lo: fn1(math, p.lo, v), hi: fn1(math, p.hi, v), loSrc: p.lo, hiSrc: p.hi };
      })
    };
  }
  // (x, y) en coordenadas de la descripción: u = variable de afuera, w = la de adentro.
  function uw(kind, x, y) { return kind === 'I' ? [x, y] : [y, x]; }
  function xy(kind, u, w) { return kind === 'I' ? [u, w] : [w, u]; }
  // ¿Está (x, y) en la región? Con límites invertidos cuenta el tramo entre los dos.
  function contains(R, x, y, eps) {
    eps = eps == null ? 1e-12 : eps;
    var q = uw(R.kind, x, y), u = q[0], w = q[1];
    for (var i = 0; i < R.pieces.length; i++) {
      var p = R.pieces[i];
      if (u < Math.min(p.a, p.b) - eps || u > Math.max(p.a, p.b) + eps) continue;
      var lo = p.lo(u), hi = p.hi(u);
      if (!(isFinite(lo) && isFinite(hi))) continue;
      if (w >= Math.min(lo, hi) - eps && w <= Math.max(lo, hi) + eps) return true;
    }
    return false;
  }
  // Integral iterada ∬ f dA de cada pieza, con signo (límites invertidos → negativa).
  function iteratedMany(R, fs) {
    var out = fs.map(function () { return 0; }), per = [];
    R.pieces.forEach(function (p) {
      var acc = fs.map(function () { return 0; });
      fs.forEach(function (f, k) {
        acc[k] = quad(function (u) {
          var lo = p.lo(u), hi = p.hi(u);
          return quad(function (w) { var q = xy(R.kind, u, w); return f(q[0], q[1]); }, lo, hi);
        }, p.a, p.b);
      });
      per.push(acc);
      acc.forEach(function (v, k) { out[k] += v; });
    });
    return { total: out, per: per };
  }
  function integrate(math, desc, fSrc) {
    var R = compile(math, desc), f = fn2(math, fSrc == null ? '1' : fSrc);
    return iteratedMany(R, [f]).total[0];
  }
  function area(math, desc) { return integrate(math, desc, '1'); }
  // Masa, momentos y centro de masa de una lámina con densidad ρ(x, y).
  //  M_x = ∬ y ρ dA (momento respecto al eje x), M_y = ∬ x ρ dA; x̄ = M_y/m, ȳ = M_x/m.
  function moments(math, desc, rhoSrc) {
    var R = compile(math, desc), rho = fn2(math, rhoSrc == null ? '1' : rhoSrc);
    var t = iteratedMany(R, [rho, function (x, y) { return y * rho(x, y); }, function (x, y) { return x * rho(x, y); }]).total;
    return { m: t[0], Mx: t[1], My: t[2], xbar: t[2] / t[0], ybar: t[1] / t[0] };
  }

  // Caja que contiene la región (muestreando las curvas).
  function bbox(R) {
    var xs = [], ys = [];
    R.pieces.forEach(function (p) {
      for (var i = 0; i <= 96; i++) {
        var u = p.a + (p.b - p.a) * i / 96;
        [p.lo(u), p.hi(u)].forEach(function (w) { if (isFinite(w)) { var q = xy(R.kind, u, w); xs.push(q[0]); ys.push(q[1]); } });
      }
    });
    if (!xs.length) return null;
    return [Math.min.apply(null, xs), Math.max.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, ys)];
  }

  // Corte de la región con la recta x = t (axis 'x') o y = t (axis 'y'): intervalos [desde, hasta].
  function slice(R, axis, t, box) {
    var out = [];
    if (OUTER[R.kind] === axis) {
      R.pieces.forEach(function (p) {
        if (t < Math.min(p.a, p.b) - 1e-12 || t > Math.max(p.a, p.b) + 1e-12) return;
        var lo = p.lo(t), hi = p.hi(t);
        if (isFinite(lo) && isFinite(hi)) out.push([Math.min(lo, hi), Math.max(lo, hi)]);
      });
      out.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [];
      out.forEach(function (iv) {
        var last = merged[merged.length - 1];
        if (last && iv[0] <= last[1] + 1e-9) last[1] = Math.max(last[1], iv[1]); else merged.push(iv.slice());
      });
      return merged;
    }
    box = box || bbox(R);
    var lo0 = axis === 'x' ? box[2] : box[0], hi0 = axis === 'x' ? box[3] : box[1], span = hi0 - lo0, n = 240;
    var a0 = lo0 - 0.01 * span, a1 = hi0 + 0.01 * span, d = (a1 - a0) / n;
    function inside(s) { return axis === 'x' ? contains(R, t, s) : contains(R, s, t); }
    function edge(inS, outS) {
      for (var k = 0; k < 64; k++) { var m = (inS + outS) / 2; if (inside(m)) inS = m; else outS = m; }
      return inS;
    }
    var prev = inside(a0), start = null;
    if (prev) start = a0;
    for (var i = 1; i <= n; i++) {
      var s = a0 + d * i, cur = inside(s);
      if (cur && !prev) start = edge(s, s - d);
      if (!cur && prev) out.push([start, edge(s - d, s)]);
      prev = cur;
    }
    if (prev) out.push([start, a1]);
    return out;
  }

  // Conversión tipo I ↔ tipo II (numérica): los cortes con la otra variable dan las curvas de
  // entrada y salida; la región se parte donde alguna de ellas cambia de fórmula (una esquina).
  function convert(R) {
    var to = other(R.kind), axis = OUTER[to], box = bbox(R);
    var t0 = axis === 'x' ? box[0] : box[2], t1 = axis === 'x' ? box[1] : box[3], span = t1 - t0;
    // Candidatos: valores de la nueva variable de afuera en las esquinas y en los extremos locales de las curvas.
    var cand = [t0, t1];
    R.pieces.forEach(function (p) {
      [p.lo, p.hi].forEach(function (g) {
        cand.push(g(p.a), g(p.b));
        var n = 200, prev = g(p.a), cur = g(p.a + (p.b - p.a) / n);
        for (var i = 1; i < n; i++) {
          var nx = g(p.a + (p.b - p.a) * (i + 1) / n);
          if ((cur - prev) * (nx - cur) < 0) {
            var lo = p.a + (p.b - p.a) * (i - 1) / n, hi = p.a + (p.b - p.a) * (i + 1) / n, sgn = cur > prev ? -1 : 1;
            for (var k = 0; k < 80; k++) { var m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (sgn * g(m1) < sgn * g(m2)) hi = m2; else lo = m1; }
            cand.push(g((lo + hi) / 2));
          }
          prev = cur; cur = nx;
        }
      });
    });
    cand = cand.filter(function (c) { return isFinite(c) && c >= t0 - 1e-9 && c <= t1 + 1e-9; }).sort(function (a, b) { return a - b; });
    var uniq = [];
    cand.forEach(function (c) { if (!uniq.length || c - uniq[uniq.length - 1] > 1e-7 * (1 + span)) uniq.push(c); });
    function cut(t) { return slice(R, axis, t, box); }
    for (var i = 0; i < uniq.length - 1; i++) {
      var mid = cut((uniq[i] + uniq[i + 1]) / 2);
      if (mid.length !== 1) return { ok: false, kind: to, reason: mid.length ? 'notSimple' : 'empty', at: (uniq[i] + uniq[i + 1]) / 2 };
    }
    var left = function (t) { var c = cut(t); return c.length ? c[0][0] : NaN; };
    var right = function (t) { var c = cut(t); return c.length ? c[c.length - 1][1] : NaN; };
    var dl = 1e-5 * span;
    function kink(e, c) {
      var l2 = e(c - 2 * dl), l1 = e(c - dl), r1 = e(c + dl), r2 = e(c + 2 * dl);
      if (![l2, l1, r1, r2].every(isFinite)) return false;
      var sL = (l1 - l2) / dl, sR = (r2 - r1) / dl;
      return Math.abs(sL - sR) > 0.05 * (1 + Math.abs(sL) + Math.abs(sR)) || Math.abs((l1 + sL * dl) - (r1 - sR * dl)) > 1e-6 * (1 + span);
    }
    var breaks = [uniq[0]];
    for (i = 1; i < uniq.length - 1; i++) if (kink(left, uniq[i]) || kink(right, uniq[i])) breaks.push(uniq[i]);
    breaks.push(uniq[uniq.length - 1]);
    var pieces = [];
    for (i = 0; i < breaks.length - 1; i++) pieces.push({ a: breaks[i], b: breaks[i + 1], lo: left, hi: right });
    return { ok: true, kind: to, compiled: true, pieces: pieces, breaks: breaks };
  }

  /* ---------- Comparar regiones en una malla (diferencia simétrica) ---------- */
  function mask(R, box, G) {
    var M = new Uint8Array(G * G), dx = (box[1] - box[0]) / G, dy = (box[3] - box[2]) / G;
    for (var i = 0; i < G; i++) {
      var u = R.kind === 'I' ? box[0] + (i + 0.5) * dx : box[2] + (i + 0.5) * dy;
      R.pieces.forEach(function (p) {
        if (u < Math.min(p.a, p.b) || u > Math.max(p.a, p.b)) return;
        var lo = p.lo(u), hi = p.hi(u);
        if (!(isFinite(lo) && isFinite(hi))) return;
        var w0 = Math.min(lo, hi), w1 = Math.max(lo, hi);
        for (var j = 0; j < G; j++) {
          var w = R.kind === 'I' ? box[2] + (j + 0.5) * dy : box[0] + (j + 0.5) * dx;
          if (w >= w0 && w <= w1) M[R.kind === 'I' ? j * G + i : i * G + j] = 1;   // índice fila·G + columna
        }
      });
    }
    return M;
  }
  // Caja común: la de la verdadera con margen, ampliada (hasta cierto punto) para ver lo del alumno.
  function commonBox(T, S) {
    var bt = bbox(T), bs = S ? bbox(S) : null, mx = 0.12 * (bt[1] - bt[0] || 1), my = 0.12 * (bt[3] - bt[2] || 1);
    var b = [bt[0] - mx, bt[1] + mx, bt[2] - my, bt[3] + my];
    if (bs) {
      var wx = bt[1] - bt[0], wy = bt[3] - bt[2];
      b[0] = Math.max(Math.min(b[0], bs[0] - mx), bt[0] - wx); b[1] = Math.min(Math.max(b[1], bs[1] + mx), bt[1] + wx);
      b[2] = Math.max(Math.min(b[2], bs[2] - my), bt[2] - wy); b[3] = Math.min(Math.max(b[3], bs[3] + my), bt[3] + wy);
    }
    return b;
  }
  function compare(T, S, box, G) {
    G = G || 160; box = box || commonBox(T, S);
    var A = mask(T, box, G), B = mask(S, box, G), cell = (box[1] - box[0]) * (box[3] - box[2]) / (G * G);
    var nt = 0, ns = 0, extra = 0, miss = 0;
    for (var k = 0; k < G * G; k++) {
      nt += A[k]; ns += B[k];
      if (B[k] && !A[k]) extra++; else if (A[k] && !B[k]) miss++;
    }
    return { box: box, G: G, A: A, B: B, cell: cell, trueArea: nt * cell, studentArea: ns * cell, extra: extra * cell, missing: miss * cell };
  }
  // Renglones de celdas marcadas (para dibujar): [{ x0, x1, y0, y1 }] con celdas vecinas unidas.
  function runs(C, which) {
    var out = [], G = C.G, b = C.box, dx = (b[1] - b[0]) / G, dy = (b[3] - b[2]) / G;
    for (var j = 0; j < G; j++) {
      var start = -1;
      for (var i = 0; i <= G; i++) {
        var k = j * G + i, on = i < G && (which === 'extra' ? C.B[k] && !C.A[k] : C.A[k] && !C.B[k]);
        if (on && start < 0) start = i;
        if (!on && start >= 0) { out.push({ x0: b[0] + start * dx, x1: b[0] + i * dx, y0: b[2] + j * dy, y1: b[2] + (j + 1) * dy }); start = -1; }
      }
    }
    return out;
  }

  /* ---------- Diagnóstico de los límites del alumno ---------- */
  // Holgura de los ejercicios: ±0.01 (o ±1 %) desde 0.1; abajo, ±1 % o 0.0005.
  function near(s, t) {
    var d = Math.abs(s - t), at = Math.abs(t);
    if (at >= 0.1) return d <= Math.max(0.01, 0.01 * at) + 1e-9;
    return d <= Math.max(0.01 * at, 5e-4) + 1e-12;
  }
  // ¿Las funciones g y h coinciden en el tramo [a, b]? (al menos 70 % de puntos válidos)
  function sameFn(g, h, a, b) {
    var good = 0, n = 24;
    for (var i = 0; i <= n; i++) {
      var u = a + (b - a) * i / n, p = g(u), q = h(u);
      if (!(isFinite(p) && isFinite(q))) continue;
      if (Math.abs(p - q) > 1e-6 * (1 + Math.abs(q))) return false;
      good++;
    }
    return good >= 0.7 * (n + 1);
  }
  // input = { kind, pieces: [{ a, b, lo: 'texto', hi: 'texto' }] } (lo y hi como los escribió).
  // truth = { I: desc, II: desc }. f = integrando (texto). Devuelve { kind, reason, … }.
  // reason: correct · flipped · overlap · swappedOrder · innerVar · unknownVar · notSolved ·
  //         forgotSplit · missing · extra · mismatch · empty · number · domain · parse
  function diagnose(math, truth, input, fSrc) {
    var K = input.kind, O = other(K), ov = OUTER[K], iv = INNER[K];
    var T = compile(math, truth[K]), TO = compile(math, truth[O]);
    var tArea = area(math, T), f = fn2(math, fSrc || '1'), tI = iteratedMany(T, [f]).total[0];
    var base = { trueArea: tArea, trueI: tI, need: T.pieces.length };
    function res(kind, reason, extra) { return Object.assign({ kind: kind, reason: reason }, base, extra || {}); }
    var P = input.pieces;
    if (!P.length || P.some(function (p) { return String(p.lo).trim() === '' || String(p.hi).trim() === ''; })) return res('invalid', 'empty');
    if (P.some(function (p) { return !(isFinite(p.a) && isFinite(p.b)); })) return res('invalid', 'number');
    var used = [];
    try {
      P.forEach(function (p) { symbols(math, p.lo).concat(symbols(math, p.hi)).forEach(function (s) { if (used.indexOf(s) < 0) used.push(s); }); });
    } catch (e) { return res('invalid', 'parse'); }
    var strange = used.filter(function (s) { return s !== 'x' && s !== 'y'; });
    if (strange.length) return res('invalid', 'unknownVar', { names: strange });
    if (used.indexOf(iv) >= 0) {
      // ¿Escribió bien la región pero en el otro orden?
      if (used.indexOf(ov) < 0) {
        var Sw = compile(math, { kind: O, pieces: P.map(function (p) { return { a: p.a, b: p.b, lo: String(p.lo), hi: String(p.hi) }; }) });
        var Cw = compare(TO, Sw);
        if (Cw.extra + Cw.missing <= 0.015 * Cw.trueArea) return res('warn', 'swappedOrder');
      }
      return res('warn', 'innerVar');
    }
    var S;
    try { S = compile(math, { kind: K, pieces: P.map(function (p) { return { a: p.a, b: p.b, lo: String(p.lo), hi: String(p.hi) }; }) }); }
    catch (e) { return res('invalid', 'parse'); }
    var bad = S.pieces.some(function (p) {
      var ok = 0;
      for (var i = 0; i <= 20; i++) { var u = p.a + (p.b - p.a) * i / 20; if (isFinite(p.lo(u)) && isFinite(p.hi(u))) ok++; }
      return ok < 19;
    });
    if (bad) return res('bad', 'domain');
    var per = iteratedMany(S, [function () { return 1; }, f]).per;
    var sArea = per.reduce(function (s, q) { return s + q[0]; }, 0), sI = per.reduce(function (s, q) { return s + q[1]; }, 0);
    var C = compare(T, S), tol = 0.015 * C.trueArea;
    var info = { C: C, S: S, studentArea: sArea, studentI: sI };
    var neg = per.some(function (q) { return q[0] < 0; });
    if (C.extra + C.missing <= tol) {
      if (neg) return res('warn', 'flipped', info);
      var absSum = per.reduce(function (s, q) { return s + Math.abs(q[0]); }, 0);
      if (absSum > tArea * 1.01 + 1e-9) return res('bad', 'overlap', info);
      if (Math.abs(sI - tI) <= 1e-3 * Math.max(1, Math.abs(tI))) return res('ok', 'correct', info);
      return res('bad', 'mismatch', info);
    }
    // Copió las curvas cambiando la letra, sin despejar (y = x² → x = y²).
    if (TO.pieces.length === S.pieces.length && S.pieces.every(function (p, i) {
      var q = TO.pieces[i];
      return sameFn(p.lo, q.lo, Math.min(p.a, p.b), Math.max(p.a, p.b)) && sameFn(p.hi, q.hi, Math.min(p.a, p.b), Math.max(p.a, p.b));
    })) return res('warn', 'notSolved', info);
    if (T.pieces.length > S.pieces.length) {
      var A0 = Math.min.apply(null, T.pieces.map(function (p) { return p.a; })), B0 = Math.max.apply(null, T.pieces.map(function (p) { return p.b; }));
      var whole = S.pieces.some(function (p) { return Math.abs(Math.min(p.a, p.b) - A0) <= 0.02 * (B0 - A0) && Math.abs(Math.max(p.a, p.b) - B0) <= 0.02 * (B0 - A0); });
      if (whole || (C.extra <= tol && C.missing > tol)) return res('warn', 'forgotSplit', info);
    }
    if (C.extra <= tol) return res('bad', 'missing', info);
    if (C.missing <= tol) return res('bad', 'extra', info);
    return res('bad', 'mismatch', info);
  }

  // Presets del lab (también los usan las pruebas). ask: orden que se pide escribir.
  var PRESETS = [
    { name: 'Entre parábola y recta', text: 'Región entre y = x² y y = 2x', ask: 'II',
      I: { kind: 'I', pieces: [{ a: 0, b: 2, lo: 'x^2', hi: '2x' }] },
      II: { kind: 'II', pieces: [{ a: 0, b: 4, lo: 'y/2', hi: 'sqrt(y)' }] },
      fs: [['1', 'f = 1 (área)'], ['x*y', 'ρ = xy (masa)']] },
    { name: 'Triángulo (la de e^(x²))', text: 'Triángulo entre y = 0, y = x y x = 2', ask: 'I',
      I: { kind: 'I', pieces: [{ a: 0, b: 2, lo: '0', hi: 'x' }] },
      II: { kind: 'II', pieces: [{ a: 0, b: 2, lo: 'y', hi: '2' }] },
      fs: [['1', 'f = 1 (área)'], ['e^(x^2)', 'f = e^(x²)']] },
    { name: 'Hay que partir en dos', text: 'Región entre x = y² y y = x − 2', ask: 'I',
      I: { kind: 'I', pieces: [{ a: 0, b: 1, lo: '-sqrt(x)', hi: 'sqrt(x)' }, { a: 1, b: 4, lo: 'x - 2', hi: 'sqrt(x)' }] },
      II: { kind: 'II', pieces: [{ a: -1, b: 2, lo: 'y^2', hi: 'y + 2' }] },
      fs: [['1', 'f = 1 (área)'], ['x', 'ρ = x (masa)']] },
    { name: 'Cuarto de círculo', text: 'Cuarto de círculo x² + y² ≤ 4 con x ≥ 0, y ≥ 0', ask: 'II',
      I: { kind: 'I', pieces: [{ a: 0, b: 2, lo: '0', hi: 'sqrt(4 - x^2)' }] },
      II: { kind: 'II', pieces: [{ a: 0, b: 2, lo: '0', hi: 'sqrt(4 - y^2)' }] },
      fs: [['1', 'f = 1 (área)'], ['x^2 + y^2', 'ρ = x² + y² (masa)']] },
    { name: 'Triángulo que se parte', text: 'Triángulo con vértices (0, 0), (2, 0) y (1, 1)', ask: 'I',
      I: { kind: 'I', pieces: [{ a: 0, b: 1, lo: '0', hi: 'x' }, { a: 1, b: 2, lo: '0', hi: '2 - x' }] },
      II: { kind: 'II', pieces: [{ a: 0, b: 1, lo: 'y', hi: '2 - y' }] },
      fs: [['1', 'f = 1 (área)'], ['y', 'ρ = y (masa)']] }
  ];

  window.LabMath.region = {
    quad: quad, symbols: symbols, compile: compile, contains: contains, integrate: integrate, area: area,
    moments: moments, bbox: bbox, slice: slice, convert: convert, mask: mask, commonBox: commonBox,
    compare: compare, runs: runs, near: near, sameFn: sameFn, diagnose: diagnose, PRESETS: PRESETS
  };

  /* ------------------------------ UI ------------------------------ */
  window.Labs['region-order'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, LM = window.LabMath.region;
    var presets = cfg.presets || PRESETS, start = cfg.start != null ? cfg.start : 0;
    var math = null, pre = presets[start], T = null, last = null, cm = null;

    var preset = UI.select({ label: 'Región', options: presets.map(function (p) { return p.name; }) });
    var given = h('p', { class: 'lab-given' });
    var sliceSel = UI.select({ label: 'Rebanadas que se dibujan', options: ['Verticales (tipo I)', 'Horizontales (tipo II)'] });
    var posS = UI.slider({ label: 'Mueve la rebanada', min: 0, max: 1, step: 'any', value: 0.4, fmt: function (v) { return slicePos(v); } }, function () { draw(); });
    var orderSel = UI.select({ label: 'Orden que escribes', options: ['dy dx: afuera x, adentro y', 'dx dy: afuera y, adentro x'] });
    var fSel = UI.select({ label: 'Qué integras', options: ['x'] });
    var rows = [0, 1].map(function (k) {
      var out = UI.rangeField(['a', 'b'], ['', ''], function () { verify(); });
      var lo = UI.mathField({ label: 'lo', onEnter: function () { verify(); } });
      var hi = UI.mathField({ label: 'hi', onEnter: function () { verify(); } });
      var head = h('p', { class: 'lab-stack__label' }, [k ? 'Segunda integral' : 'Tu integral']);
      return { k: k, out: out, lo: lo, hi: hi, node: h('div', { class: 'ro-piece' }, [head, out.node, lo.node, hi.node]) };
    });
    var twoBox = h('input', { type: 'checkbox', id: UI.id('ro-two') });
    var twoRow = h('label', { class: 'ro-check', for: twoBox.id }, [twoBox, ' Partir en dos integrales']);
    var check = UI.button('Comprobar', 'primary', function () { verify(); });
    var show = UI.button('Ver los límites correctos', 'ghost', function () { fillAnswer(); });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var written = h('div', { class: 'ro-written', hidden: true });

    var board = UI.svg(520, 440, 'La región verdadera con sus rebanadas y, encima, la región que describen tus límites');
    var facts = h('dl', { class: 'lab-facts' });
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--ref' }), 'región verdadera']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'rebanadas']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'la rebanada que mueves']),
      h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu región']),
      h('li', {}, [h('i', { class: 'ro-sw ro-sw--extra' }), 'te sobra']),
      h('li', {}, [h('i', { class: 'ro-sw ro-sw--miss' }), 'te falta']),
      h('li', {}, [h('i', { class: 'ro-sw ro-sw--cm' }), 'centro de masa (si integras ρ)'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls ro-controls', novalidate: true }, [
        preset.node, given, sliceSel.node, posS.node, orderSel.node, fSel.node,
        rows[0].node, twoRow, rows[1].node, h('div', { class: 'lab-buttons' }, [check, show]), verdict, written
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['¿Es tu región?']),
        board, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); verify(); });
    preset.input.addEventListener('change', function () { load(+preset.input.value); });
    sliceSel.input.addEventListener('change', function () { draw(); });
    orderSel.input.addEventListener('change', function () { relabel(); reset(); draw(); });
    fSel.input.addEventListener('change', function () { reset(); computeTruth(); draw(); });
    twoBox.addEventListener('change', function () { rows[1].node.hidden = !twoBox.checked; });

    function fm(v, d) {
      if (!isFinite(v)) return '—';
      if (Math.abs(v) < 1e-10) return '0';
      return Number(v.toPrecision(d || 4)).toString().replace('-', '−');
    }
    // Texto del deslizador: la recta de la rebanada (x = … o y = …).
    function slicePos(v) {
      if (!T) return fm(v, 3);
      var vert = sliceSel.input.value !== '1', tb = LM.bbox(T), t0 = vert ? tb[0] : tb[2], t1 = vert ? tb[1] : tb[3];
      return (vert ? 'x' : 'y') + ' = ' + fm(t0 + (t1 - t0) * inset(v), 3);
    }
    // La rebanada nunca cae justo en un extremo (ahí la región es un punto o un borde).
    function inset(v) { return 0.02 + 0.96 * v; }
    function kindNow() { return orderSel.input.value === '1' ? 'II' : 'I'; }
    function fNow() { return pre.fs[+fSel.input.value || 0][0]; }
    function setLabel(node, idx, text) { var ls = node.querySelectorAll('label'); if (ls[idx]) ls[idx].textContent = text; }
    function relabel() {
      var K = kindNow(), o = OUTER[K], i = INNER[K];
      rows.forEach(function (r) {
        setLabel(r.out.node, 0, o + ' desde (número)');
        setLabel(r.out.node, 1, o + ' hasta (número)');
        setLabel(r.lo.node, 0, (K === 'I' ? 'y de abajo' : 'x de la izquierda') + ', en función de ' + o);
        setLabel(r.hi.node, 0, (K === 'I' ? 'y de arriba' : 'x de la derecha') + ', en función de ' + o);
      });
    }
    function reset() { verdict.hidden = true; written.hidden = true; last = null; }
    function clearInputs() {
      rows.forEach(function (r) {
        Array.prototype.forEach.call(r.out.node.querySelectorAll('input'), function (n) { n.value = ''; });
        r.lo.setLatex(''); r.hi.setLatex('');
      });
      twoBox.checked = false; rows[1].node.hidden = true;
    }
    function load(i) {
      pre = presets[i];
      given.textContent = pre.text + '. Escribe la integral en el orden ' + (pre.ask === 'I' ? 'dy dx' : 'dx dy') + '.';
      fSel.input.innerHTML = '';
      pre.fs.forEach(function (f, k) { fSel.input.appendChild(h('option', { value: String(k) }, [f[1]])); });
      orderSel.input.value = pre.ask === 'II' ? '1' : '0';
      sliceSel.input.value = pre.ask === 'II' ? '1' : '0';
      clearInputs(); relabel(); reset();
      computeTruth(); posS.set(0.4); draw();
    }
    function computeTruth() {
      if (!math) return;
      T = LM.compile(math, pre.I);
      cm = LM.moments(math, pre.I, fNow());
    }
    function fillAnswer() {
      if (!math) return;
      var K = kindNow(), d = pre[K];
      clearInputs();
      d.pieces.forEach(function (p, k) {
        var r = rows[k];
        r.out.set(p.a, p.b); r.lo.setMath(String(p.lo)); r.hi.setMath(String(p.hi));
      });
      if (d.pieces.length > 1) { twoBox.checked = true; rows[1].node.hidden = false; }
      verify();
    }
    function readPieces() {
      var used = twoBox.checked ? rows : rows.slice(0, 1), out = [];
      for (var k = 0; k < used.length; k++) {
        var r = used[k], ab = r.out.get(), lo, hi;
        try { lo = String(r.lo.get() || '').trim(); hi = String(r.hi.get() || '').trim(); }
        catch (e) { return { error: e.message }; }
        out.push({ a: ab[0], b: ab[1], lo: lo, hi: hi });
      }
      return { pieces: out };
    }
    function tex(src) { return UI.tex(math, src).replace(/^\$|\$$/g, ''); }
    function writeIntegral(K, pieces) {
      var o = OUTER[K], i = INNER[K], f = fNow() === '1' ? '1' : tex(fNow());
      var s = pieces.map(function (p) {
        return '\\int_{' + fm(p.a, 6).replace('−', '-') + '}^{' + fm(p.b, 6).replace('−', '-') + '}\\int_{' + tex(p.lo) + '}^{' + tex(p.hi) + '} ' + f + '\\,d' + i + '\\,d' + o;
      }).join(' + ');
      written.innerHTML = '';
      written.appendChild(h('p', { class: 'lab-stack__label' }, ['Lo que escribiste']));
      written.appendChild(h('p', { class: 'ro-tex', html: '$' + s + '$' }));
      written.hidden = false;
      UI.renderMath(written);
    }

    function verify() {
      if (!math || !T) return;
      var K = kindNow(), rd = readPieces();
      if (rd.error) { UI.verdict(verdict, 'bad', 'Completa tus límites', rd.error); return; }
      var r;
      try { r = LM.diagnose(math, pre, { kind: K, pieces: rd.pieces }, fNow()); }
      catch (e) { UI.verdict(verdict, 'bad', 'No pude leer tus límites', 'Revisa que cada límite de adentro sea una expresión válida.'); return; }
      var o = OUTER[K], iv = INNER[K];
      var msgs = {
        correct: ['Correcto: tus límites describen la región', 'Tu integral da ' + fm(r.studentI, 6) + ', igual que la real.' + (r.need > 1 ? ' En este orden hacen falta ' + r.need + ' integrales, y las escribiste.' : '')],
        flipped: ['Casi: la región es la correcta, pero sale con signo menos', 'Invertiste algún par de límites (el de abajo debe ir abajo y el de arriba, arriba). Tu área da ' + fm(r.studentArea, 5) + '; un área nunca es negativa.'],
        overlap: ['Tus integrales se enciman', 'Las dos integrales cubren la región, pero una parte la cuentas dos veces. Haz que los tramos de ' + o + ' no se traslapen.'],
        swappedOrder: ['Casi: es la región correcta, pero en el otro orden', 'Tus límites de adentro dependen de ' + iv + ', así que en realidad escribiste la integral d' + o + ' d' + iv + '. Aquí se pide d' + iv + ' d' + o + ': afuera va ' + o + ' y los límites de adentro dependen de ' + o + '.'],
        innerVar: ['Casi: un límite de adentro usa ' + iv, 'Los límites de ' + iv + ' no pueden depender de ' + iv + ' (es la variable que estás integrando). Despeja ' + iv + ' de cada curva en función de ' + o + '.'],
        unknownVar: ['Usa solo ' + o, 'Tus límites de adentro tienen una letra que no es ' + o + (r.names ? ' (' + r.names.join(', ') + ')' : '') + '.'],
        notSolved: ['Casi: cambiaste la letra sin despejar', 'Copiaste las curvas del otro orden poniendo ' + o + ' donde iba ' + iv + '. Hay que despejar: por ejemplo, de y = x² sale x = √y, no x = y².'],
        forgotSplit: ['Casi: en este orden hay que partir la región', 'La curva por donde ' + (K === 'I' ? 'entran o salen las rebanadas verticales' : 'entran o salen las rebanadas horizontales') + ' cambia a la mitad. Parte en el valor de ' + o + ' donde cambia y escribe dos integrales (marca «Partir en dos integrales»).'],
        missing: ['Te falta un pedazo de la región', 'Lo marcado con «te falta» no lo cubren tus límites. Revisa los límites de afuera (las intersecciones) y las curvas de entrada y salida.'],
        extra: ['Te sobra región', 'Lo marcado con «te sobra» no es parte de la región. Revisa las intersecciones y cuál curva va abajo (o a la izquierda).'],
        mismatch: ['Tus límites describen otra región', 'Compara el dibujo: mueve una rebanada y fíjate por qué curva entra y por cuál sale.'],
        empty: ['Escribe los cuatro límites', 'Dos números para ' + o + ' y dos expresiones en ' + o + ' para ' + iv + '.'],
        number: ['Los límites de afuera son números', 'Escribe ' + o + ' desde y ' + o + ' hasta con punto decimal.'],
        parse: ['No pude leer un límite', 'Revisa paréntesis y operaciones.'],
        domain: ['Un límite no está definido en todo el tramo', 'Por ejemplo, √ de un número negativo. Revisa los límites de afuera.']
      };
      var m = msgs[r.reason] || msgs.mismatch;
      UI.verdict(verdict, r.kind === 'invalid' ? 'bad' : r.kind, m[0], m[1]);
      last = r;
      if (r.kind !== 'invalid' && r.reason !== 'innerVar' && r.reason !== 'swappedOrder') writeIntegral(K, rd.pieces); else written.hidden = true;
      draw();
    }

    /* ---------- Dibujo ---------- */
    function piecePoly(R, p, n) {
      var pts = [], i, u;
      for (i = 0; i <= n; i++) { u = p.a + (p.b - p.a) * i / n; pts.push(xy(R.kind, u, p.lo(u))); }
      for (i = n; i >= 0; i--) { u = p.a + (p.b - p.a) * i / n; pts.push(xy(R.kind, u, p.hi(u))); }
      return pts;
    }
    function draw() {
      if (!math || !T) return;
      posS.set(posS.get());                       // refresca el texto (x = … o y = …)
      var S = last && last.S ? last.S : null, C = last && last.C ? last.C : null;
      var box = C ? C.box : LM.commonBox(T, null);
      var plt = window.LabPlot(board, { x: [box[0], box[1]], y: [box[2], box[3]], equal: true });
      plt.clear(); plt.grid();
      T.pieces.forEach(function (p) { plt.poly(piecePoly(T, p, 120), 'area-fill'); });
      if (C) {
        LM.runs(C, 'extra').forEach(function (q) { plt.poly([[q.x0, q.y0], [q.x1, q.y0], [q.x1, q.y1], [q.x0, q.y1]], 'ro-extra'); });
        LM.runs(C, 'miss').forEach(function (q) { plt.poly([[q.x0, q.y0], [q.x1, q.y0], [q.x1, q.y1], [q.x0, q.y1]], 'ro-miss'); });
      }
      plt.axes();
      // Rebanadas en la dirección elegida.
      var vert = sliceSel.input.value !== '1', axis = vert ? 'x' : 'y', tb = LM.bbox(T);
      var t0 = vert ? tb[0] : tb[2], t1 = vert ? tb[1] : tb[3], segs = [], k;
      for (k = 1; k <= 9; k++) {
        var tt = t0 + (t1 - t0) * k / 10;
        LM.slice(T, axis, tt, tb).forEach(function (iv) { segs.push(vert ? [[tt, iv[0]], [tt, iv[1]]] : [[iv[0], tt], [iv[1], tt]]); });
      }
      plt.segments(segs, 'aux', 1.4);
      // Borde de la región verdadera.
      T.pieces.forEach(function (p) {
        var pts = piecePoly(T, p, 120), bs = [];
        for (var i = 0; i < pts.length; i++) bs.push([pts[i], pts[(i + 1) % pts.length]]);
        plt.segments(bs, 'ref', 2.6);
      });
      // La rebanada que se mueve, con su entrada y su salida.
      var tc = t0 + (t1 - t0) * inset(posS.get()), cut = LM.slice(T, axis, tc, tb), sel = [];
      cut.forEach(function (iv) { sel.push(vert ? [[tc, iv[0]], [tc, iv[1]]] : [[iv[0], tc], [iv[1], tc]]); });
      plt.segments(sel, 'trace', 3.4);
      cut.forEach(function (iv) {
        var p0 = vert ? [tc, iv[0]] : [iv[0], tc], p1 = vert ? [tc, iv[1]] : [iv[1], tc];
        plt.point(p0[0], p0[1], 'dot-aux', 5); plt.point(p1[0], p1[1], 'dot-trace', 5);
      });
      // Lo del alumno: el borde de su región.
      if (S) S.pieces.forEach(function (p) {
        var pts = piecePoly(S, p, 120).filter(function (q) { return isFinite(q[0]) && isFinite(q[1]); }), bs = [];
        for (var i = 0; i < pts.length; i++) bs.push([pts[i], pts[(i + 1) % pts.length]]);
        if (bs.length > 2) plt.segments(bs, 'student', 2.6);
      });
      // Centro de masa (si se integra una densidad).
      if (fNow() !== '1' && cm && isFinite(cm.xbar)) plt.point(cm.xbar, cm.ybar, 'dot-error', 6);

      // Tablero.
      var tA = LM.area(math, pre.I), conv = { I: pre.I.pieces.length, II: pre.II.pieces.length };
      var rowsF = [
        ['rebanada en ' + axis + ' = ' + fm(tc, 3), cut.length ? 'entra en ' + (vert ? 'y' : 'x') + ' = ' + fm(cut[0][0], 4) + ', sale en ' + (vert ? 'y' : 'x') + ' = ' + fm(cut[cut.length - 1][1], 4) : 'fuera de la región'],
        ['integrales en dy dx', String(conv.I) + (conv.I > 1 ? ' (hay que partir)' : '')],
        ['integrales en dx dy', String(conv.II) + (conv.II > 1 ? ' (hay que partir)' : '')],
        ['área de la región', fm(tA, 6)]
      ];
      if (fNow() !== '1') {
        rowsF.push(['masa ∬ ρ dA', fm(cm.m, 6)]);
        rowsF.push(['centro de masa (x̄, ȳ)', '(' + fm(cm.xbar, 4) + ', ' + fm(cm.ybar, 4) + ')']);
      }
      if (last && isFinite(last.studentI)) {
        rowsF.push(['∬ ' + (fNow() === '1' ? '1' : 'f') + ' dA real', fm(last.trueI, 6)]);
        rowsF.push(['tu integral', fm(last.studentI, 6)]);
        if (last.C) rowsF.push(['te sobra / te falta (área)', fm(last.C.extra, 3) + ' / ' + fm(last.C.missing, 3)]);
      }
      facts.innerHTML = '';
      rowsF.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    preset.input.value = String(start);
    rows[1].node.hidden = true;
    relabel();
    document.addEventListener('cb:themechange', function () { draw(); });
    return UI.loadMath().then(function (m) { math = m; load(start); });
  };
})();
