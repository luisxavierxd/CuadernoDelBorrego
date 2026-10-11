/* =====================================================================
   Lab gauss-surface (Física 2 · S08): elige tu superficie gaussiana.
   Eliges una distribución de carga y una superficie cerrada (esfera, cilindro
   o cubo), su tamaño r y cuánto la descentras. El lab dibuja el corte, sombrea
   la carga encerrada, calcula el flujo ∮E·dA con cuadratura sobre la superficie
   y lo compara con q_enc/ε₀. Si E·n̂ no es constante donde hay flujo, la
   superficie «sirve para el flujo pero no para despejar E».
   El alumno escribe E a la distancia r y el lab da el «casi»:
     totalCharge    usó la carga total en vez de q_enc (adentro)
     wrongRegion    usó la fórmula de adentro estando afuera (o al revés)
     conductorZero  dentro del conductor usó la fórmula de la esfera sólida
     area           área de esfera (4π) contra la de cilindro (2π)
     double         σ/ε₀ en lugar de σ/(2ε₀) en el plano
   Convenciones (SI): las esferas tienen su centro en el origen; la línea y el
   cilindro van sobre el eje y; el plano es x = 0. La superficie se descentra
   sobre x. Cilindro gaussiano: radio r y largo 2r, con su eje sobre y (sobre x
   si la distribución es el plano). Cubo: lado 2r.
   ε₀ = 8.85 × 10⁻¹² C²/(N·m²); el campo se escribe con ε₀ (k = 1/(4πε₀)).
   ===================================================================== */
(function () {
  var EPS0 = 8.85e-12, PI = Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  // Fórmulas cerradas (las que salen de Gauss).
  function pointE(Q, r) { return Q / (4 * PI * EPS0 * r * r); }
  function solidE(Q, R, r) { return r < R ? Q * r / (4 * PI * EPS0 * R * R * R) : pointE(Q, r); }
  function shellE(Q, R, r) { return r < R ? 0 : pointE(Q, r); }
  function lineE(lam, r) { return lam / (2 * PI * EPS0 * r); }
  function cylinderE(lam, R, r) { return r < R ? lam * r / (2 * PI * EPS0 * R * R) : lineE(lam, r); }
  function planeE(sig) { return sig / (2 * EPS0); }
  function plateE(sig) { return sig / EPS0; }               // junto a un conductor (σ de esa cara)
  function chargeFromFlux(flux) { return EPS0 * flux; }

  function kind(dist) { return dist === 'line' || dist === 'cylinder' ? 'cyl' : dist === 'plane' ? 'pla' : 'sph'; }

  // Por Gauss, con la superficie simétrica: q_enc (por unidad de largo o de área en cyl y pla)
  // entre ε₀ por el área (4πr², 2πr por metro, 2 tapas por m²).
  function qEncSym(dist, p, r) {
    if (dist === 'point') return p.Q;
    if (dist === 'solid') return r < p.R ? p.Q * Math.pow(r / p.R, 3) : p.Q;
    if (dist === 'shell' || dist === 'conductor') return r < p.R ? 0 : p.Q;
    if (dist === 'line') return p.lam;
    if (dist === 'cylinder') return r < p.R ? p.lam * (r * r) / (p.R * p.R) : p.lam;
    if (dist === 'plane') return p.sig;
    return NaN;
  }
  function areaSym(dist, r) { var k = kind(dist); return k === 'sph' ? 4 * PI * r * r : k === 'cyl' ? 2 * PI * r : 2; }
  function E(dist, p, r) { return qEncSym(dist, p, r) / (EPS0 * areaSym(dist, r)); }

  // Campo vectorial en (x, y, z).
  function field(dist, p, x, y, z) {
    var k = kind(dist), e, d;
    if (k === 'sph') { d = Math.sqrt(x * x + y * y + z * z); if (d < 1e-15) return [0, 0, 0]; e = E(dist, p, d) / d; return [e * x, e * y, e * z]; }
    if (k === 'cyl') { d = Math.sqrt(x * x + z * z); if (d < 1e-15) return [0, 0, 0]; e = E(dist, p, d) / d; return [e * x, 0, e * z]; }
    return [x > 0 ? planeE(p.sig) : x < 0 ? -planeE(p.sig) : 0, 0, 0];
  }

  // La superficie: { type, r, s, axis }. Cilindro con eje x solo para el plano.
  function surface(dist, type, r, s) { return { type: type, r: r, s: s || 0, axis: type === 'cylinder' && dist === 'plane' ? 'x' : 'y' }; }
  // ¿El punto queda adentro? Lo que está justo sobre la superficie cuenta como adentro
  // (la superficie queda apenas afuera), igual que E(r) usa el valor de afuera en r = R.
  function inside(S, x, y, z) {
    var r2 = S.r * S.r * (1 + 1e-9), rr = S.r * (1 + 1e-9), dx = x - S.s;
    if (S.type === 'sphere') return dx * dx + y * y + z * z <= r2;
    if (S.type === 'cylinder') return S.axis === 'y' ? dx * dx + z * z <= r2 && Math.abs(y) <= rr : y * y + z * z <= r2 && Math.abs(dx) <= rr;
    return Math.abs(dx) <= rr && Math.abs(y) <= rr && Math.abs(z) <= rr;
  }

  // Volumen de la intersección de dos esferas (radios a y b, centros a distancia d).
  function lensVolume(a, b, d) {
    if (d >= a + b) return 0;
    if (d <= Math.abs(a - b)) return 4 / 3 * PI * Math.pow(Math.min(a, b), 3);
    return PI * Math.pow(a + b - d, 2) * (d * d + 2 * d * (a + b) - 3 * (a - b) * (a - b)) / (12 * d);
  }
  // Área de la esfera de radio a (centro en el origen) que queda dentro de una esfera de radio b
  // con centro a distancia d.
  function capArea(a, b, d) {
    if (d + a <= b * (1 + 1e-9)) return 4 * PI * a * a;
    if (d >= a + b || d + b <= a) return 0;
    var c0 = (a * a + d * d - b * b) / (2 * a * d);
    return 2 * PI * a * a * (1 - Math.max(-1, Math.min(1, c0)));
  }
  // Área de la intersección de dos círculos (radios a y b, centros a distancia d).
  function circleLens(a, b, d) {
    if (d >= a + b) return 0;
    if (d <= Math.abs(a - b)) return PI * Math.pow(Math.min(a, b), 2);
    var t1 = Math.acos((d * d + a * a - b * b) / (2 * d * a)), t2 = Math.acos((d * d + b * b - a * a) / (2 * d * b));
    return a * a * t1 + b * b * t2 - 0.5 * Math.sqrt((-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b));
  }

  // Volumen de (distribución sólida ∩ superficie) como integral doble en el plano xz de la
  // altura en y que comparten: ∫∫ 2·min(Ys, Yd) dx dz, con Gauss–Legendre partido en cada quiebre.
  function sq(v) { return v > 0 ? Math.sqrt(v) : 0; }
  function solidVolume(dist, R, S, n) {
    var r = S.r, s = S.s, cyl = dist === 'cylinder', disk = S.type !== 'box';
    function Ys(x, z) { return S.type === 'sphere' ? sq(r * r - (x - s) * (x - s) - z * z) : r; }
    function Yd(x, z) { return cyl ? (x * x + z * z <= R * R ? Infinity : 0) : sq(R * R - x * x - z * z); }
    var xa = s - r, xb = s + r, xbr = [-R, R, Math.sqrt(Math.max(0, R * R - r * r)), -Math.sqrt(Math.max(0, R * R - r * r))];
    if (S.type === 'sphere' && Math.abs(s) > 1e-15) xbr.push((R * R - r * r + s * s) / (2 * s));   // donde las dos esferas se cortan
    var tot = 0;
    nodes(xa, xb, xbr, n).forEach(function (qx) {
      var x = qx[0], w = disk ? sq(r * r - (x - s) * (x - s)) : r;
      if (w <= 0) return;
      var zb = [sq(R * R - x * x), -sq(R * R - x * x), sq(R * R - r * r - x * x), -sq(R * R - r * r - x * x)];
      nodes(-w, w, zb, n).forEach(function (qz) {
        var y = Math.min(Ys(x, qz[0]), Yd(x, qz[0]));
        if (y > 0 && isFinite(y)) tot += 2 * y * qx[1] * qz[1];
      });
    });
    return tot;
  }

  // Carga encerrada por integración numérica sobre la distribución (sirve para cualquier superficie).
  function qEncNum(dist, p, S, n) {
    n = n || 1;
    var i, j, k, cnt = 0, tot = 0;
    if (dist === 'solid') return p.Q * solidVolume('solid', p.R, S, 40 * n) / (4 / 3 * PI * Math.pow(p.R, 3));
    if (dist === 'cylinder') return p.lam * solidVolume('cylinder', p.R, S, 40 * n) / (PI * p.R * p.R);
    if (dist === 'shell' || dist === 'conductor') {
      var m2 = 512 * n, m3 = 512 * n;
      for (j = 0; j < m2; j++) {
        var mu2 = -1 + 2 * (j + 0.5) / m2, st2 = Math.sqrt(1 - mu2 * mu2);
        for (k = 0; k < m3; k++) { var ph2 = 2 * PI * (k + 0.5) / m3; if (inside(S, p.R * mu2, p.R * st2 * Math.cos(ph2), p.R * st2 * Math.sin(ph2))) cnt++; tot++; }
      }
      return p.Q * cnt / tot;
    }
    return qEnc(dist, p, S);
  }

  // Carga encerrada: exacta cuando la geometría lo permite; si no, contando celdas.
  function qEnc(dist, p, S) {
    var r = S.r, s = Math.abs(S.s), T = S.type;
    if (dist === 'point') return inside(S, 0, 0, 0) ? p.Q : 0;
    if (dist === 'line') {                                   // largo del eje y dentro de S
      if (T === 'sphere') return s < r ? p.lam * 2 * Math.sqrt(r * r - s * s) : 0;
      return s < r ? p.lam * 2 * r : 0;
    }
    if (dist === 'plane') {                                  // área del corte x = 0 dentro de S
      if (s >= r) return 0;
      if (T === 'sphere') return p.sig * PI * (r * r - s * s);
      if (T === 'cylinder') return S.axis === 'x' ? p.sig * PI * r * r : p.sig * 4 * r * Math.sqrt(r * r - s * s);
      return p.sig * 4 * r * r;
    }
    if (T === 'sphere' && dist === 'solid') return p.Q * lensVolume(p.R, r, s) / (4 / 3 * PI * Math.pow(p.R, 3));
    if (T === 'sphere' && (dist === 'shell' || dist === 'conductor')) {
      if (s < 1e-12) return r * (1 + 1e-9) >= p.R ? p.Q : 0;
      return p.Q * capArea(p.R, r, s) / (4 * PI * p.R * p.R);
    }
    if (T === 'cylinder' && S.axis === 'y' && dist === 'cylinder') return p.lam * 2 * r * circleLens(p.R, r, s) / (PI * p.R * p.R);
    return qEncNum(dist, p, S);
  }

  // Nodos de Gauss–Legendre en [−1, 1] (Newton sobre P_n), en caché.
  var GL = {};
  function gl(n) {
    if (GL[n]) return GL[n];
    var x = [], w = [];
    for (var i = 0; i < n; i++) {
      var t = Math.cos(PI * (i + 0.75) / (n + 0.5)), dp = 1;
      for (var it = 0; it < 100; it++) {
        var p0 = 1, p1 = t;
        for (var k = 2; k <= n; k++) { var p2 = ((2 * k - 1) * t * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
        dp = n * (t * p1 - p0) / (t * t - 1);
        var dt = p1 / dp; t -= dt;
        if (Math.abs(dt) < 1e-15) break;
      }
      x.push(t); w.push(2 / ((1 - t * t) * dp * dp));
    }
    return (GL[n] = { x: x, w: w });
  }
  // Nodos (t, peso) en [a, b], partido en los quiebres de breaks (donde el campo tiene un pico o un salto).
  function nodes(a, b, breaks, n) {
    var cuts = [a].concat((breaks || []).filter(function (c) { return c > a + 1e-12 * (b - a) && c < b - 1e-12 * (b - a); }).sort(function (u, v) { return u - v; }), [b]);
    var g = gl(n), out = [];
    for (var i = 1; i < cuts.length; i++) {
      var lo = cuts[i - 1], hi = cuts[i], h = (hi - lo) / 2, m = (hi + lo) / 2;
      for (var j = 0; j < g.x.length; j++) out.push([m + h * g.x[j], h * g.w[j]]);
    }
    return out;
  }

  // Flujo por cuadratura: ∮ E·n̂ dA. También reporta cómo varía E·n̂ y si la superficie
  // sirve para despejar E (E·n̂ constante y E perpendicular donde hay flujo; flujo cero en lo demás).
  function flux(dist, p, S, opt) {
    opt = opt || {};
    var n = opt.n || 40, nph = opt.nph || 96, r = S.r, s = S.s, sum = 0, area = 0, samples = [], emax = 0;
    function add(x, y, z, nx, ny, nz, dA) {
      var e = field(dist, p, x, y, z), en = e[0] * nx + e[1] * ny + e[2] * nz;
      var et = Math.sqrt(Math.max(0, e[0] * e[0] + e[1] * e[1] + e[2] * e[2] - en * en));
      sum += en * dA; area += dA;
      emax = Math.max(emax, Math.abs(en), et);
      samples.push([en, et, dA]);
    }
    // Quiebres sobre la recta o + t·d: donde se cruza la superficie de la distribución (r = R o ρ = R,
    // ahí E salta o se dobla) o el plano x = 0. Partir ahí deja a Gauss–Legendre con trozos suaves.
    function cuts(o, d) {
      var out = [], kd = kind(dist);
      if (dist === 'plane') { if (d[0]) out.push(-o[0] / d[0]); return out; }
      if (!p.R || dist === 'point') return out;
      var m = kd === 'cyl' ? [1, 0, 1] : [1, 1, 1];
      var A = m[0] * d[0] * d[0] + m[1] * d[1] * d[1] + m[2] * d[2] * d[2], B = 2 * (m[0] * o[0] * d[0] + m[1] * o[1] * d[1] + m[2] * o[2] * d[2]);
      var C = m[0] * o[0] * o[0] + m[1] * o[1] * o[1] + m[2] * o[2] * o[2] - p.R * p.R, D = B * B - 4 * A * C;
      if (A > 0 && D > 0) out.push((-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A));
      return out;
    }
    var phs = [], i, j, k;
    for (k = 0; k < nph; k++) phs.push(2 * PI * (k + 0.5) / nph);
    var dph = 2 * PI / nph;
    if (S.type === 'sphere' && kind(dist) === 'cyl') {
      // Línea o cilindro: rebanadas perpendiculares al eje y (dA = r dy dφ, Arquímedes). La línea
      // atraviesa la esfera donde el radio de la rebanada vale s: ahí se parte.
      var yb = Math.abs(s) < r ? [Math.sqrt(r * r - s * s), -Math.sqrt(r * r - s * s)] : [];
      if (p.R) { var t2 = r * r - Math.pow(Math.max(0, p.R - Math.abs(s)), 2), t3 = r * r - Math.pow(p.R + Math.abs(s), 2); [t2, t3].forEach(function (t) { if (t > 0) yb.push(Math.sqrt(t), -Math.sqrt(t)); }); }
      nodes(-r, r, yb, n).forEach(function (q) {
        var a = Math.sqrt(Math.max(0, r * r - q[0] * q[0]));
        phs.forEach(function (ph) {
          var c = Math.cos(ph), sn = Math.sin(ph);
          add(s + a * c, q[0], a * sn, a * c / r, q[0] / r, a * sn / r, r * q[1] * dph);
        });
      });
    } else if (S.type === 'sphere') {
      // Eje polar sobre x: la distancia al origen solo depende de μ.
      var br = [];
      if (Math.abs(s) > 1e-15) {
        if (kind(dist) === 'sph' && p.R) br.push((p.R * p.R - s * s - r * r) / (2 * s * r));
        if (dist === 'plane') br.push(-s / r);
      }
      nodes(-1, 1, br, n).forEach(function (q) {
        var mu = q[0], st = Math.sqrt(Math.max(0, 1 - mu * mu));
        phs.forEach(function (ph) {
          var c = Math.cos(ph), sn = Math.sin(ph);
          add(s + r * mu, r * st * c, r * st * sn, mu, st * c, st * sn, r * r * q[1] * dph);
        });
      });
    } else if (S.type === 'cylinder') {
      if (S.axis === 'y') {
        phs.forEach(function (ph) {
          var c = Math.cos(ph), sn = Math.sin(ph);
          nodes(-r, r, cuts([s + r * c, 0, r * sn], [0, 1, 0]), n).forEach(function (q) { add(s + r * c, q[0], r * sn, c, 0, sn, r * q[1] * dph); });
          [-1, 1].forEach(function (sg) {
            nodes(0, r, cuts([s, sg * r, 0], [c, 0, sn]), n).forEach(function (q) { add(s + q[0] * c, sg * r, q[0] * sn, 0, sg, 0, q[0] * q[1] * dph); });
          });
        });
      } else {
        phs.forEach(function (ph) {
          var c = Math.cos(ph), sn = Math.sin(ph);
          nodes(s - r, s + r, cuts([0, r * c, r * sn], [1, 0, 0]), n).forEach(function (q) { add(q[0], r * c, r * sn, 0, c, sn, r * q[1] * dph); });
          [-1, 1].forEach(function (sg) {
            nodes(0, r, cuts([s + sg * r, 0, 0], [0, c, sn]), n).forEach(function (q) { add(s + sg * r, q[0] * c, q[0] * sn, sg, 0, 0, q[0] * q[1] * dph); });
          });
        });
      }
    } else {
      var X = nodes(s - r, s + r, dist === 'plane' ? [0] : [], n), U = nodes(-r, r, [], n);
      [-1, 1].forEach(function (sg) {
        U.forEach(function (a) { nodes(-r, r, cuts([s + sg * r, a[0], 0], [0, 0, 1]), n).forEach(function (b) { add(s + sg * r, a[0], b[0], sg, 0, 0, a[1] * b[1]); }); });   // caras x = s ± r
        X.forEach(function (a) { nodes(-r, r, cuts([a[0], sg * r, 0], [0, 0, 1]), n).forEach(function (b) { add(a[0], sg * r, b[0], 0, sg, 0, a[1] * b[1]); }); });       // caras y = ± r
        X.forEach(function (a) { nodes(-r, r, cuts([a[0], 0, sg * r], [0, 1, 0]), n).forEach(function (b) { add(a[0], b[0], sg * r, 0, 0, sg, a[1] * b[1]); }); });       // caras z = ± r
      });
    }
    // ¿Sirve para despejar E? Donde E·n̂ ≠ 0, E debe ser perpendicular y E·n̂ igual en todos lados.
    var tol = 1e-7 * (emax || 1), active = samples.filter(function (q) { return Math.abs(q[0]) > tol; });
    var enMin = Infinity, enMax = -Infinity, aAct = 0, useful = true;
    active.forEach(function (q) { enMin = Math.min(enMin, q[0]); enMax = Math.max(enMax, q[0]); aAct += q[2]; if (q[1] > tol) useful = false; });
    if (active.length && enMax - enMin > 1e-6 * Math.max(Math.abs(enMin), Math.abs(enMax))) useful = false;
    if (!active.length) { enMin = 0; enMax = 0; }
    var all = samples.map(function (q) { return q[0]; });
    return {
      flux: sum, area: area, activeArea: aAct, useful: useful,
      enMin: enMin, enMax: enMax, min: Math.min.apply(null, all), max: Math.max.apply(null, all), emax: emax
    };
  }

  // Errores típicos al dar E a la distancia r (solo los que aplican).
  function mistakes(dist, p, r) {
    var m = {}, k = kind(dist), e = E(dist, p, r);
    if (k === 'sph') {
      var outside = dist === 'point' || !(r < p.R);
      if (!outside) m.totalCharge = pointE(p.Q, r);
      if (dist === 'solid' && outside) m.wrongRegion = p.Q * r / (4 * PI * EPS0 * Math.pow(p.R, 3));
      if (dist === 'conductor' && !outside) m.conductorZero = p.Q * r / (4 * PI * EPS0 * Math.pow(p.R, 3));
      if (e !== 0) m.area = 2 * e;
    } else if (k === 'cyl') {
      if (dist === 'cylinder' && r < p.R) m.totalCharge = lineE(p.lam, r);
      if (dist === 'cylinder' && r >= p.R) m.wrongRegion = p.lam * r / (2 * PI * EPS0 * p.R * p.R);
      m.area = e / 2;
    } else m.double = plateE(p.sig);
    return m;
  }
  // Veredicto: 'ok', la clave del error típico o 'bad'. Un error solo cuenta si se separa > 3 % de la respuesta.
  function diagnose(dist, p, r, student, tol) {
    tol = tol || 0.01;
    if (!isFinite(student)) return 'bad';
    var e = E(dist, p, r);
    // E = 0 (dentro del cascarón o del conductor): la escala es el campo junto a la superficie.
    var scale = e === 0 ? pointE(p.Q, p.R) : Math.abs(e);
    if (Math.abs(student - e) <= tol * scale) return 'ok';
    var m = mistakes(dist, p, r);
    for (var key in m) {
      if (Math.abs(m[key] - e) <= 0.03 * Math.max(Math.abs(e), Math.abs(m[key]))) continue;
      if (Math.abs(student - m[key]) <= tol * Math.abs(m[key])) return key;
    }
    return 'bad';
  }

  window.LabMath.gaussSurface = {
    EPS0: EPS0,
    pointE: pointE, solidE: solidE, shellE: shellE, lineE: lineE, cylinderE: cylinderE, planeE: planeE, plateE: plateE,
    chargeFromFlux: chargeFromFlux, kind: kind, qEncSym: qEncSym, areaSym: areaSym, E: E, field: field,
    surface: surface, inside: inside, lensVolume: lensVolume, capArea: capArea, circleLens: circleLens,
    qEnc: qEnc, qEncNum: qEncNum, gl: gl, flux: flux, mistakes: mistakes, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var DISTS = [
    { id: 'point', name: 'Carga puntual', q: 'Carga Q', u: 'nC', R: false },
    { id: 'solid', name: 'Esfera sólida (aislante)', q: 'Carga Q', u: 'nC', R: true },
    { id: 'shell', name: 'Cascarón esférico', q: 'Carga Q', u: 'nC', R: true },
    { id: 'conductor', name: 'Esfera conductora', q: 'Carga Q', u: 'nC', R: true },
    { id: 'line', name: 'Línea infinita', q: 'Densidad λ', u: 'nC/m', R: false },
    { id: 'cylinder', name: 'Cilindro sólido infinito', q: 'Densidad λ', u: 'nC/m', R: true },
    { id: 'plane', name: 'Plano infinito', q: 'Densidad σ', u: 'nC/m²', R: false }
  ];
  var SURFS = [{ id: 'sphere', name: 'Esfera' }, { id: 'cylinder', name: 'Cilindro' }, { id: 'box', name: 'Cubo' }];
  var MSG = {
    ok: ['Tu E coincide con la ley de Gauss', 'La diferencia es menor al 1 %.'],
    totalCharge: ['Usaste la carga total', 'Adentro de la distribución, la superficie gaussiana solo encierra una parte: q_enc, no Q. Mira la parte sombreada.'],
    wrongRegion: ['Usaste la fórmula de adentro', 'Afuera la superficie ya encierra toda la carga: q_enc = Q (o λ por metro). La fórmula proporcional a r solo vale adentro.'],
    conductorZero: ['Dentro del conductor E = 0', 'En equilibrio, la carga de un conductor se va a su superficie. Una esfera gaussiana adentro no encierra nada: E = 0. Esa fórmula es la de la esfera aislante.'],
    area: ['Revisa el área de la superficie', 'La esfera tiene área 4πr²; el lado de un cilindro de largo L, 2πrL. Cambiar uno por otro deja el resultado al doble o a la mitad.'],
    double: ['Te sobra un factor de 2', 'Para una hoja de carga aislada el flujo sale por las dos tapas: E·2A = σA/ε₀ y E = σ/(2ε₀). σ/ε₀ es junto a un conductor.'],
    bad: ['Tu E no coincide', 'Sigue los pasos: simetría, superficie, flujo en función de E, q_enc y despeja. Revisa también cm → m y nC → C.']
  };
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v, plain) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-12) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(3)) >= 10) { m /= 10; e += 1; }
    if (e >= -2 && e <= 3) return Number(v.toPrecision(4)).toString();
    return plain ? m.toFixed(3) + 'e' + e : m.toFixed(3) + ' × 10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function niceUnit(v) {
    var a = Math.abs(v);
    if (a >= 1e6) return { f: 1e-6, u: 'MN/C' };
    if (a >= 1e3) return { f: 1e-3, u: 'kN/C' };
    return { f: 1, u: 'N/C' };
  }

  window.Labs['gauss-surface'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h, G = window.LabMath.gaussSurface;
    var s0 = cfg.start || { dist: 'solid', surf: 'sphere', R: 6, Q: 8, r: 3, s: 0 };
    var unit = 'nC';
    var distSel = UI.select({ label: 'Distribución de carga', options: DISTS.map(function (d) { return d.name; }) });
    var surfSel = UI.select({ label: 'Superficie gaussiana', options: SURFS.map(function (d) { return d.name; }) });
    var RS = UI.slider({ label: 'Radio de la distribución', min: 2, max: 10, step: 1, value: s0.R, unit: 'cm' }, refresh);
    var qS = UI.slider({ label: 'Carga Q', min: 1, max: 20, step: 1, value: s0.Q, fmt: function (v) { return v + ' ' + unit; } }, refresh);
    var rS = UI.slider({ label: 'Tamaño de la superficie', min: 0.5, max: 20, step: 0.5, value: s0.r, unit: 'cm' }, refresh);
    var sS = UI.slider({ label: 'Descentrar la superficie', min: 0, max: 80, step: 10, value: s0.s, fmt: function (v) { return v + ' %'; } }, refresh);
    var eIn = UI.input({ label: 'Tu E en la superficie (N/C)', type: 'text', inputmode: 'decimal', mono: false, hint: 'Acepta notación científica: <code>3.2e4</code> o <code>3.2×10^4</code>.' });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var useNote = h('p', { class: 'lab-note gs-use' });
    var facts = h('dl', { class: 'lab-facts' });
    var scene = UI.svg(640, 440, 'Corte de la distribución de carga y de la superficie gaussiana; la carga encerrada va sombreada y las flechas son el campo sobre la superficie');
    var graph = UI.svg(640, 250, 'Campo E contra la distancia r, con el punto de la superficie actual');
    var student = null, uid = 'gs' + Math.floor(Math.random() * 1e9).toString(36);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        distSel.node, surfSel.node, RS.node, qS.node, rS.node, sS.node, eIn.node,
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Corte: la carga y tu superficie']),
        scene,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'carga encerrada (q_enc)']),
          h('li', {}, [h('i', { class: 'sw sw--trace sw--dashed' }), 'superficie gaussiana']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'E sobre la superficie'])
        ]),
        useNote,
        graph,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'E(r) por Gauss']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'tu superficie']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu E'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    distSel.input.value = String(Math.max(0, DISTS.map(function (d) { return d.id; }).indexOf(s0.dist)));
    surfSel.input.value = String(Math.max(0, SURFS.map(function (d) { return d.id; }).indexOf(s0.surf)));
    function reset() { student = null; verdict.hidden = true; eIn.input.value = ''; note.textContent = ''; sync(); draw(); }
    distSel.input.addEventListener('change', reset);
    surfSel.input.addEventListener('change', function () { sync(); refresh(); });
    eIn.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function D() { return DISTS[+distSel.input.value] || DISTS[0]; }
    function Sf() { return SURFS[+surfSel.input.value] || SURFS[0]; }
    function params() { var q = qS.get() * 1e-9; return { Q: q, lam: q, sig: q, R: D().R ? RS.get() / 100 : 0 }; }
    function surf() { var r = rS.get() / 100; return G.surface(D().id, Sf().id, r, r * sS.get() / 100); }
    function setLabel(sl, txt) { var l = sl.node.querySelector('label'); if (l) l.textContent = txt; }
    function where() { var k = G.kind(D().id); return k === 'sph' ? 'del centro' : k === 'cyl' ? 'del eje' : 'del plano'; }
    function sync() {
      var d = D(), t = Sf().id;
      RS.node.hidden = !d.R;
      unit = d.u; setLabel(qS, d.q); qS.set(qS.get());
      setLabel(rS, t === 'sphere' ? 'Radio de la esfera gaussiana' : t === 'box' ? 'Medio lado del cubo' : d.id === 'plane' ? 'Distancia del plano a cada tapa' : 'Radio del cilindro gaussiano');
      var lab = eIn.node.querySelector('label'); if (lab) lab.textContent = 'Tu E a esa distancia ' + where() + ' (N/C)';
    }

    function el(name, attrs, parent, text) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      parent.appendChild(n);
      return n;
    }
    function f1(v) { return (+v).toFixed(1); }
    function arrowD(x, y, dx, dy, hh) {
      var L = Math.hypot(dx, dy);
      if (!(L > 3)) return '';
      var ux = dx / L, uy = dy / L, k = Math.min(hh || 9, L * 0.45), ex = x + dx, ey = y + dy;
      return 'M' + f1(x) + ' ' + f1(y) + 'L' + f1(ex) + ' ' + f1(ey) +
        'M' + f1(ex - ux * k - uy * k * 0.55) + ' ' + f1(ey - uy * k + ux * k * 0.55) + 'L' + f1(ex) + ' ' + f1(ey) + 'L' + f1(ex - ux * k + uy * k * 0.55) + ' ' + f1(ey - uy * k - ux * k * 0.55);
    }
    function ellD(cx, cy, rx, ry) { return 'M' + f1(cx - rx) + ' ' + f1(cy) + 'A' + f1(rx) + ' ' + f1(ry) + ' 0 1 0 ' + f1(cx + rx) + ' ' + f1(cy) + 'A' + f1(rx) + ' ' + f1(ry) + ' 0 1 0 ' + f1(cx - rx) + ' ' + f1(cy); }

    function draw() {
      var d = D(), dist = d.id, p = params(), S = surf(), r = S.r, k = G.kind(dist);
      var q = G.qEnc(dist, p, S), F = G.flux(dist, p, S), Er = G.E(dist, p, r);
      // Mundo (m) → pantalla: el origen en (320, 200); cabe la superficie con margen para las flechas.
      var ext = Math.max(r, p.R || 0), extX = Math.max(r + Math.abs(S.s), p.R || 0);
      var sc = Math.min(172 / ext, 272 / extX), O = [320, 220];
      function P(x, y) { return [O[0] + x * sc, O[1] - y * sc]; }
      scene.innerHTML = '';
      var defs = el('defs', {}, scene), clip = el('clipPath', { id: uid + '-clip' }, defs);
      var lay = el('g', { class: 'sketch' }, scene);
      // Forma de la superficie en el corte z = 0.
      var c = P(S.s, 0), rp = r * sc, shape;
      if (S.type === 'sphere') shape = ['circle', { cx: f1(c[0]), cy: f1(c[1]), r: f1(rp) }];
      else shape = ['rect', { x: f1(c[0] - rp), y: f1(c[1] - rp), width: f1(2 * rp), height: f1(2 * rp) }];
      el(shape[0], shape[1], clip);

      // La distribución: tenue completa y fuerte la parte encerrada (recortada por la superficie).
      function body(parent, op) {
        var g = el('g', { opacity: op }, parent);
        if (dist === 'point') { el('circle', { cx: O[0], cy: O[1], r: 12, class: 'box-err' }, g); }
        else if (dist === 'solid') el('circle', { cx: O[0], cy: O[1], r: f1(p.R * sc), class: 'box-err' }, g);
        else if (dist === 'shell') el('circle', { cx: O[0], cy: O[1], r: f1(p.R * sc), class: 'error', fill: 'none', 'stroke-width': 7 }, g);
        else if (dist === 'conductor') el('circle', { cx: O[0], cy: O[1], r: f1(p.R * sc), class: 'error', fill: 'none', 'stroke-width': 7 }, g);
        else if (dist === 'line') el('rect', { x: O[0] - 4, y: 8, width: 8, height: 424, rx: 3, class: 'box-err' }, g);
        else if (dist === 'cylinder') el('rect', { x: f1(O[0] - p.R * sc), y: 8, width: f1(2 * p.R * sc), height: 424, class: 'box-err' }, g);
        else el('rect', { x: O[0] - 5, y: 8, width: 10, height: 424, rx: 3, class: 'box-err' }, g);
        return g;
      }
      if (dist === 'conductor') el('circle', { cx: O[0], cy: O[1], r: f1(p.R * sc - 3.5), class: 'box-ref', 'stroke-width': 0 }, lay);
      body(lay, 0.3);
      var inG = body(lay, 1);
      inG.setAttribute('clip-path', 'url(#' + uid + '-clip)');
      if (dist === 'point') el('text', { x: O[0], y: O[1] + 6, class: 'ann', 'font-size': 18, 'text-anchor': 'middle' }, lay, '+');

      // Pistas 3D tenues: tapas del cilindro o el fondo del cubo.
      var cue = el('g', { opacity: 0.5 }, lay);
      if (S.type === 'cylinder') {
        if (S.axis === 'y') { [-1, 1].forEach(function (sg) { el('path', { d: ellD(c[0], c[1] - sg * rp, rp, rp * 0.22), class: 'trace', fill: 'none', 'stroke-width': 1.4 }, cue); }); }
        else { [-1, 1].forEach(function (sg) { el('path', { d: ellD(c[0] + sg * rp, c[1], rp * 0.22, rp), class: 'trace', fill: 'none', 'stroke-width': 1.4 }, cue); }); }
      } else if (S.type === 'box') {
        var o = Math.min(rp * 0.3, 30);
        el('path', { d: 'M' + f1(c[0] - rp) + ' ' + f1(c[1] - rp) + 'l' + f1(o) + ' ' + f1(-o) + 'h' + f1(2 * rp) + 'v' + f1(2 * rp) + 'l' + f1(-o) + ' ' + f1(o) + 'M' + f1(c[0] + rp) + ' ' + f1(c[1] - rp) + 'l' + f1(o) + ' ' + f1(-o), class: 'trace', fill: 'none', 'stroke-width': 1.4 }, cue);
      }
      // El contorno de la superficie en el corte.
      var out = Object.assign({ class: 'trace', fill: 'none', 'stroke-width': 3, 'stroke-dasharray': '9 6' }, shape[1]);
      el(shape[0], out, lay);

      // Flechas de E en puntos del contorno (en el corte, E no tiene componente z).
      var pts = [];
      if (S.type === 'sphere') for (var i = 0; i < 16; i++) { var a = (i + 0.5) * PI / 8; pts.push([S.s + r * Math.cos(a), r * Math.sin(a)]); }
      else [0.125, 0.375, 0.625, 0.875].forEach(function (t) {
        var u = -r + 2 * r * t;
        pts.push([S.s - r, u], [S.s + r, u], [S.s + u, -r], [S.s + u, r]);
      });
      var vec = pts.map(function (q2) { return G.field(dist, p, q2[0], q2[1], 0); });
      var emax = Math.max.apply(null, vec.map(function (e) { return Math.hypot(e[0], e[1]); }));
      if (emax > 0) vec.forEach(function (e, j) {
        var L = 40 * Math.hypot(e[0], e[1]) / emax, a0 = P(pts[j][0], pts[j][1]), m = Math.hypot(e[0], e[1]);
        if (m > 0) el('path', { d: arrowD(a0[0], a0[1], e[0] / m * L, -e[1] / m * L, 9), class: 'ref', fill: 'none', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, lay);
      });

      // ¿Sirve para despejar E?
      var span = F.enMin === F.enMax ? sci(F.enMax) + ' N/C' : sci(F.enMin) + ' a ' + sci(F.enMax) + ' N/C';
      useNote.textContent = F.useful
        ? (F.emax === 0 ? 'Sirve para despejar E: no encierra carga y E = 0 en toda la superficie.' : 'Sirve para despejar E: donde hay flujo, E es perpendicular y vale lo mismo (' + sci(F.enMax) + ' N/C). Así E · A = q_enc/ε₀.')
        : 'Sirve para el flujo, pero no para despejar E: E · n̂ cambia sobre la superficie (' + span + '). El flujo total sigue siendo q_enc/ε₀.';

      // Gráfica E contra r.
      var rmax = 20, Rc = p.R ? p.R * 100 : 0;
      var ref = Math.max(Er, G.E(dist, p, Math.max(Rc, 2) / 100), 1e-30);
      var gu = niceUnit(ref * 1.3), top = ref * 1.3 * gu.f;
      var plot = window.LabPlot(graph, { x: [0, rmax], y: [-0.12 * top, top] });
      plot.clear(); plot.grid(); plot.axes();
      if (Rc) plot.segments([[[Rc, 0], [Rc, top]]], 'axis', 1.4);
      plot.curve(function (x) { return x <= 0 ? NaN : G.E(dist, p, x / 100) * gu.f; }, 'ref', 3, null, 0.02, rmax);
      plot.segments([[[r * 100, 0], [r * 100, top]]], 'trace', 1.6);
      plot.point(r * 100, Er * gu.f, 'dot-trace', 6);
      if (student != null && isFinite(student) && student * gu.f <= top && student >= 0) plot.point(r * 100, student * gu.f, 'dot-student', 6);
      plot.label(0, top, 'E (' + gu.u + ')', 'start', 15, 6, 4);
      plot.label(rmax, -0.12 * top, 'r (cm)', 'end', 15, 0, 0);
      if (Rc && Rc < 17) plot.label(Rc, top, 'R', 'start', 15, 6, 4);

      facts.innerHTML = '';
      var diff = q === 0 ? (Math.abs(F.flux) < 1e-9 * (F.emax * F.area || 1) ? 0 : NaN) : (F.flux * EPS0 / q - 1) * 100;
      [['q_enc', sci(q * 1e9) + ' nC'], ['q_enc / ε₀', sci(q / EPS0) + ' N·m²/C'], ['flujo ∮E·dA (numérico)', sci(Math.abs(F.flux) < 1e-9 * (F.emax * F.area || 1) ? 0 : F.flux) + ' N·m²/C'],
        ['diferencia', (isFinite(diff) ? (Math.abs(diff) < 0.005 ? '0.00' : (diff > 0 ? '+' : '') + diff.toFixed(2)) : '—') + ' %'],
        ['E a r = ' + sci(r * 100) + ' cm ' + where(), sci(Er) + ' N/C']]
        .forEach(function (row) { facts.appendChild(h('dt', {}, [row[0]])); facts.appendChild(h('dd', {}, [row[1]])); });
    }

    function readStudent() { var t = eIn.input.value; return window.CBExercises ? window.CBExercises.parseNumber(t) : parseFloat(t); }
    function refresh() { if (student != null) check(); else draw(); }
    function check() {
      var dist = D().id, p = params(), r = surf().r, val = readStudent();
      if (!isFinite(val)) { student = null; verdict.hidden = true; draw(); return; }
      student = val;
      var kd = diagnose(dist, p, r, val), msg = MSG[kd] || MSG.bad, Er = G.E(dist, p, r), err = Er === 0 ? NaN : (val - Er) / Er * 100;
      UI.verdict(verdict, kd === 'ok' ? 'ok' : kd === 'bad' ? 'bad' : 'warn', msg[0],
        msg[1] + (kd !== 'ok' && isFinite(err) ? ' Tu error: ' + (err > 0 ? '+' : '') + err.toFixed(1) + ' %.' : ''));
      draw();
    }

    // Ejemplo cargado: dentro de la esfera sólida, un compañero usó la carga total.
    sync();
    (function loadExample() {
      var m = mistakes(D().id, params(), surf().r), sample = m.totalCharge != null ? m.totalCharge : m.area;
      if (sample != null) {
        eIn.input.value = sci(sample, true);
        note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia la distribución, la superficie o r y escribe tu E.';
      }
    })();
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
