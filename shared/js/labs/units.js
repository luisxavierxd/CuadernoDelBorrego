/* =====================================================================
   LabMath.units: conversión de unidades y análisis dimensional (Física S01).
   Sin UI: S01 no tiene lab (usa explicaciones gráficas), pero sus ejemplos
   y ejercicios se comprueban contra esta tabla en scripts/examples.test.js.
     parse('km/h')            → { k: 0.2777…, d: { M: 0, L: 1, T: -1 } }
     convert(90, 'km/h', 'm/s') → 25
     dims('kg*m/s^2')         → { M: 1, L: 1, T: -2 }
     sameDims('N', 'kg*m/s^2') → true
   Unidades compuestas: un solo '/', factores con '*' o '·' y exponentes '^n'.
   ===================================================================== */
(function () {
  window.LabMath = window.LabMath || {};

  // factor al SI y dimensiones [M, L, T]
  var BASE = {
    m: [1, 0, 1, 0], g: [1e-3, 1, 0, 0], s: [1, 0, 0, 1],
    min: [60, 0, 0, 1], h: [3600, 0, 0, 1], d: [86400, 0, 0, 1],
    L: [1e-3, 0, 3, 0], t: [1000, 1, 0, 0],                  // litro y tonelada
    N: [1, 1, 1, -2], J: [1, 1, 2, -2], W: [1, 1, 2, -3], Pa: [1, 1, -1, -2],
    Hz: [1, 0, 0, -1], rev: [1, 0, 0, 0], rad: [1, 0, 0, 0],
    in: [0.0254, 0, 1, 0], ft: [0.3048, 0, 1, 0], mi: [1609.344, 0, 1, 0], lb: [0.45359237, 1, 0, 0]
  };
  var PREFIX = { k: 1e3, M: 1e6, G: 1e9, c: 1e-2, m: 1e-3, 'μ': 1e-6, u: 1e-6, n: 1e-9 };
  // Unidades que no llevan prefijo aunque empiecen con una letra de prefijo.
  var NO_PREFIX = { min: 1, mi: 1, h: 1, d: 1, t: 1, rev: 1, rad: 1, in: 1, ft: 1, lb: 1 };

  function unit(sym) {
    if (BASE[sym]) return BASE[sym];
    var p = sym.charAt(0), rest = sym.slice(1);
    if (PREFIX[p] && BASE[rest] && !NO_PREFIX[rest]) {
      var b = BASE[rest];
      return [PREFIX[p] * b[0], b[1], b[2], b[3]];
    }
    throw new Error('Unidad desconocida: ' + sym);
  }

  function factorList(str, sign, acc) {
    str.split(/[*·]/).forEach(function (tok) {
      tok = tok.trim();
      if (!tok || tok === '1') return;
      var m = tok.match(/^([^\^]+)(?:\^(-?\d+(?:\.\d+)?))?$/);
      if (!m) throw new Error('No entiendo la unidad: ' + tok);
      var e = sign * (m[2] != null ? parseFloat(m[2]) : 1), u = unit(m[1]);
      acc.k *= Math.pow(u[0], e);
      acc.d.M += e * u[1]; acc.d.L += e * u[2]; acc.d.T += e * u[3];
    });
  }

  function parse(str) {
    var parts = String(str).replace(/\s+/g, '').split('/');
    if (parts.length > 2) throw new Error('Usa un solo "/" en la unidad: ' + str);
    var acc = { k: 1, d: { M: 0, L: 0, T: 0 } };
    factorList(parts[0], 1, acc);
    if (parts[1] != null) factorList(parts[1], -1, acc);
    return acc;
  }

  function sameD(a, b) {
    return Math.abs(a.M - b.M) < 1e-9 && Math.abs(a.L - b.L) < 1e-9 && Math.abs(a.T - b.T) < 1e-9;
  }
  function dims(str) { return parse(str).d; }
  function sameDims(a, b) { return sameD(parse(a).d, parse(b).d); }
  function convert(x, from, to) {
    var a = parse(from), b = parse(to);
    if (!sameD(a.d, b.d)) return NaN;
    return x * a.k / b.k;
  }
  // Dimensión de un producto de potencias: [[unidad, exponente], …].
  function product(list) {
    var d = { M: 0, L: 0, T: 0 };
    list.forEach(function (p) { var q = parse(p[0]).d; d.M += p[1] * q.M; d.L += p[1] * q.L; d.T += p[1] * q.T; });
    return d;
  }

  window.LabMath.units = { parse: parse, dims: dims, sameDims: sameDims, convert: convert, product: product };
})();
