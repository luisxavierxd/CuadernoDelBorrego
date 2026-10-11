/* =====================================================================
   Lab polar-check (Cálculo 2 · S02): «¿Es tu curva polar?».
   Modo reto: el lab muestra una curva objetivo y el alumno escribe r(θ).
   Las dos se comparan como conjuntos de puntos (distancia de Hausdorff
   aproximada), así que cualquier representación equivalente cuenta como
   correcta. «Casi»: curva girada (cos ↔ sin), reflejada (signo), otro
   número de pétalos o un factor de escala de más o de menos.
   Modo explorar: un deslizador de θ traza la curva poco a poco y muestra
   el punto (r, θ) ↔ (x, y), incluso cuando r < 0.
   LabMath.polar es puro (sin DOM): conversiones con atan2 y θ en [0, 2π),
   muestreo, Hausdorff, conteo de pétalos y simetrías.
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  // Ángulo equivalente en [0, 2π).
  function normAngle(t) {
    t = t % TAU;
    if (t < 0) t += TAU;
    if (t >= TAU - 1e-12) t = 0;
    return t;
  }
  function toRect(r, th) { return { x: r * Math.cos(th), y: r * Math.sin(th) }; }
  // r ≥ 0 y θ en [0, 2π) con el cuadrante correcto (atan2). El origen da (0, 0).
  function toPolar(x, y) {
    var r = Math.hypot(x, y);
    if (r < 1e-15) return { r: 0, theta: 0 };
    return { r: r, theta: normAngle(Math.atan2(y, x)) };
  }
  // Lo que da la calculadora con arctan(y/x): solo sirve en los cuadrantes I y IV.
  function naiveTheta(x, y) { return x === 0 ? (y >= 0 ? Math.PI / 2 : -Math.PI / 2) : Math.atan(y / x); }
  function quadrant(x, y) {
    if (Math.abs(x) < 1e-12 || Math.abs(y) < 1e-12) return 0;
    return x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3);
  }
  // Otras coordenadas del mismo punto: (r, θ + 2πk) y (−r, θ + π + 2πk), k = −1, 0, 1.
  function representations(r, th) {
    var out = [];
    for (var k = -1; k <= 1; k++) { out.push({ r: r, theta: th + TAU * k }); out.push({ r: -r, theta: th + Math.PI + TAU * k }); }
    return out;
  }
  function samePoint(r1, t1, r2, t2, tol) {
    var a = toRect(r1, t1), b = toRect(r2, t2);
    return Math.hypot(a.x - b.x, a.y - b.y) <= (tol || 1e-9) * Math.max(1, Math.abs(r1), Math.abs(r2));
  }

  // r(θ) compilada con math.js. Acepta «θ» escrito a mano.
  function compile(math, src) {
    var s = String(src).replace(/θ/g, 'theta');
    return window.LabMath.core.build(math, s, ['theta']).fn;
  }
  // Puntos [x, y] de la curva en [a, b]; null marca un corte (fuera de dominio o |r| > cap).
  function sample(fn, a, b, n, cap) {
    n = n || 900; cap = cap || 1e6;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var th = a + (b - a) * i / n, r = fn(th);
      if (!isFinite(r) || Math.abs(r) > cap) { if (pts.length && pts[pts.length - 1] !== null) pts.push(null); continue; }
      pts.push([r * Math.cos(th), r * Math.sin(th)]);
    }
    return pts;
  }
  function finite(pts) { return pts.filter(function (p) { return p !== null; }); }
  function extent(pts) { var m = 0; pts.forEach(function (p) { if (p) m = Math.max(m, Math.hypot(p[0], p[1])); }); return m; }

  function segDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    var t = L > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  // Distancia dirigida: el punto de A más lejano de la poligonal B.
  function directed(A, B) {
    var a = finite(A), step = Math.max(1, Math.ceil(a.length / 400)), worst = 0;
    var segs = [], lone = [];
    for (var i = 0; i < B.length; i++) {
      var p = B[i];
      if (!p) continue;
      var q = B[i + 1];
      if (q) segs.push([p[0], p[1], q[0], q[1]]);
      else if (!B[i - 1]) lone.push(p);
    }
    if (!segs.length && !lone.length) return Infinity;
    for (var j = 0; j < a.length; j += step) {
      var x = a[j][0], y = a[j][1], best = Infinity;
      for (var s = 0; s < segs.length && best > 0; s++) {
        var g = segs[s], d = segDist(x, y, g[0], g[1], g[2], g[3]);
        if (d < best) best = d;
      }
      lone.forEach(function (l) { best = Math.min(best, Math.hypot(x - l[0], y - l[1])); });
      if (best > worst) worst = best;
    }
    return worst;
  }
  function hausdorff(A, B) {
    if (!finite(A).length || !finite(B).length) return Infinity;
    return Math.max(directed(A, B), directed(B, A));
  }
  function transform(pts, f) { return pts.map(function (p) { return p ? f(p[0], p[1]) : null; }); }
  function rotate(pts, ang) { var c = Math.cos(ang), s = Math.sin(ang); return transform(pts, function (x, y) { return [c * x - s * y, s * x + c * y]; }); }
  function reflect(pts, axis) {
    return transform(pts, function (x, y) { return axis === 'x' ? [x, -y] : axis === 'y' ? [-x, y] : [-x, -y]; });
  }
  function scale(pts, k) { return transform(pts, function (x, y) { return [k * x, k * y]; }); }

  // Pétalos: grupos de direcciones donde la curva llega a su distancia máxima.
  // Una circunferencia centrada (todas las direcciones) da 0.
  function petals(pts) {
    var P = finite(pts), M = extent(P);
    if (M < 1e-12) return 0;
    var angs = P.filter(function (p) { return Math.hypot(p[0], p[1]) >= 0.92 * M; })
      .map(function (p) { return normAngle(Math.atan2(p[1], p[0])); }).sort(function (a, b) { return a - b; });
    if (!angs.length) return 0;
    var gaps = 0;
    for (var i = 1; i < angs.length; i++) if (angs[i] - angs[i - 1] > 0.08) gaps++;
    if (angs[0] + TAU - angs[angs.length - 1] > 0.08) gaps++;
    return gaps;
  }
  // Fórmula cerrada para r = a cos(nθ) o a sin(nθ): n pétalos si n es impar, 2n si es par.
  function roseCount(n) { return n % 2 ? n : 2 * n; }

  // Simetrías del conjunto de puntos: eje polar (eje x), eje y (θ = π/2) y origen.
  function symmetry(pts, tol) {
    var t = (tol || 0.01) * Math.max(extent(pts), 1e-9);
    return {
      polar: hausdorff(pts, reflect(pts, 'x')) <= t,
      yaxis: hausdorff(pts, reflect(pts, 'y')) <= t,
      origin: hausdorff(pts, reflect(pts, 'o')) <= t
    };
  }

  function curveOf(math, src, a, b, n) { return sample(compile(math, src), a == null ? 0 : a, b == null ? TAU : b, n || 1200); }
  function petalsOf(math, src, a, b) { return petals(curveOf(math, src, a, b, 6000)); }
  function symmetryOf(math, src, a, b) { return symmetry(curveOf(math, src, a, b, 1500)); }
  function sameCurve(math, srcA, srcB, a, b) {
    var A = curveOf(math, srcA, a, b), B = curveOf(math, srcB, a, b);
    return hausdorff(A, B) <= 0.01 * Math.max(extent(A), 1e-9);
  }
  // ¿Todos los puntos de la curva polar cumplen la ecuación rectangular F(x, y) = 0?
  function onImplicit(math, polarSrc, implicitSrc, a, b) {
    var pts = finite(curveOf(math, polarSrc, a, b, 800));
    var F = window.LabMath.core.build(math, implicitSrc, ['x', 'y']).fn, s = Math.max(extent(pts), 1e-9);
    return pts.length > 10 && pts.every(function (p) { return Math.abs(F(p[0], p[1])) <= 1e-9 * (1 + s * s); });
  }

  // Compara la curva del alumno S con la objetivo T (como conjuntos de puntos).
  // → { kind: 'ok'|'warn'|'bad', key, err (relativo al tamaño de T), k? }
  function diagnose(T, S, opts) {
    opts = opts || {};
    var size = Math.max(extent(T), 1e-9), tol = (opts.tol || 0.03) * size;
    if (finite(S).length < 10) return { kind: 'bad', key: 'domain', err: Infinity };
    var d = hausdorff(T, S), err = d / size;
    if (d <= tol) return { kind: 'ok', key: 'ok', err: err };
    var pT = petals(T), pS = petals(S);
    var angs = [90, -90];
    if (pT >= 2) angs.push(90 / pT, -90 / pT, 180 / pT, -180 / pT);
    for (var i = 0; i < angs.length; i++) {
      if (hausdorff(T, rotate(S, angs[i] * Math.PI / 180)) <= tol) return { kind: 'warn', key: 'rotated', err: err };
    }
    var axes = ['x', 'y', 'o'];
    for (var j = 0; j < axes.length; j++) if (hausdorff(T, reflect(S, axes[j])) <= tol) return { kind: 'warn', key: 'reflected', err: err };
    var k = extent(S) / size;
    if (Math.abs(k - 1) > 0.05 && k > 0 && hausdorff(T, scale(S, 1 / k)) <= tol) return { kind: 'warn', key: 'scale', err: err, k: k };
    if (pT >= 2 && pS >= 2 && pS !== pT && Math.abs(k - 1) <= 0.05) return { kind: 'warn', key: 'petals', err: err, pT: pT, pS: pS };
    return { kind: 'bad', key: 'bad', err: err };
  }

  // Curvas de reto. to: fin del intervalo de θ. sample*: respuesta de ejemplo con un error típico.
  var CHALLENGES = [
    { name: 'Cardioide', expr: '1 + cos(theta)', tex: 'r = 1 + \\cos\\theta', to: TAU, hint: 'Pasa por el origen y llega a 2 sobre el eje polar.', sampleTex: '1+\\sin\\left(\\theta\\right)', sampleMath: '1+sin(theta)' },
    { name: 'Circunferencia por el origen', expr: '4*cos(theta)', tex: 'r = 4\\cos\\theta', to: TAU, hint: 'Su diámetro va del origen a (4, 0).', sampleTex: '2\\cos\\left(\\theta\\right)', sampleMath: '2*cos(theta)' },
    { name: 'Rosa de 3 pétalos', expr: '3*cos(3*theta)', tex: 'r = 3\\cos 3\\theta', to: TAU, hint: 'Un pétalo apunta sobre el eje polar.', sampleTex: '3\\cos\\left(6\\theta\\right)', sampleMath: '3*cos(6*theta)' },
    { name: 'Rosa de 4 pétalos', expr: '2*sin(2*theta)', tex: 'r = 2\\sin 2\\theta', to: TAU, hint: 'Los pétalos apuntan a las diagonales.', sampleTex: '2\\cos\\left(2\\theta\\right)', sampleMath: '2*cos(2*theta)' },
    { name: 'Limaçon con lazo', expr: '1 + 2*cos(theta)', tex: 'r = 1 + 2\\cos\\theta', to: TAU, hint: 'Llega a 3 a la derecha y el lazo interior llega a 1.', sampleTex: '1-2\\cos\\left(\\theta\\right)', sampleMath: '1-2*cos(theta)' },
    { name: 'Cardioide hacia abajo', expr: '2 - 2*sin(theta)', tex: 'r = 2 - 2\\sin\\theta', to: TAU, hint: 'Pasa por el origen arriba y llega a 4 abajo.', sampleTex: '2-2\\cos\\left(\\theta\\right)', sampleMath: '2-2*cos(theta)' },
    { name: 'Circunferencia centrada', expr: '3', tex: 'r = 3', to: TAU, hint: 'Todos sus puntos están a la misma distancia del origen.', sampleTex: '9', sampleMath: '9' },
    { name: 'Espiral (dos vueltas)', expr: 'theta/2', tex: 'r = \\tfrac{\\theta}{2},\\ 0 \\le \\theta \\le 4\\pi', to: 2 * TAU, hint: 'Cada vuelta se aleja lo mismo del origen.', sampleTex: '\\theta', sampleMath: 'theta' }
  ];

  // Curva al azar: circunferencia, cardioide, limaçon o rosa con parámetros enteros.
  function randomCurve(rand) {
    rand = rand || Math.random;
    var pick = function (a, b) { return a + Math.floor(rand() * (b - a + 1)); };
    var trig = rand() < 0.5 ? 'cos' : 'sin', sg = rand() < 0.5 ? 1 : -1, s = sg > 0 ? '+' : '-';
    var fam = pick(0, 4), a = pick(1, 3), b, n;
    var T = '\\' + trig;
    if (fam === 0) return { name: 'Al azar', expr: String(a + 1), tex: 'r = ' + (a + 1), to: TAU, hint: 'Lee la distancia al origen.' };
    if (fam === 1) return { name: 'Al azar', expr: (sg * 2 * a) + '*' + trig + '(theta)', tex: 'r = ' + (sg * 2 * a) + T + '\\theta', to: TAU, hint: 'Pasa por el origen: ¿hacia qué eje está su diámetro?' };
    if (fam === 2) return { name: 'Al azar', expr: a + s + a + '*' + trig + '(theta)', tex: 'r = ' + a + ' ' + s + ' ' + a + T + '\\theta', to: TAU, hint: 'Busca el punto donde toca el origen.' };
    if (fam === 3) {
      b = pick(1, 3); if (b === a) b = a + 1;
      return { name: 'Al azar', expr: a + s + b + '*' + trig + '(theta)', tex: 'r = ' + a + ' ' + s + ' ' + b + T + '\\theta', to: TAU, hint: 'Lee r en θ = 0, π/2, π y 3π/2.' };
    }
    n = pick(2, 5);
    return { name: 'Al azar', expr: a + '*' + trig + '(' + n + '*theta)', tex: 'r = ' + a + T + ' ' + n + '\\theta', to: TAU, hint: 'Cuenta los pétalos y mide su largo.' };
  }

  window.LabMath.polar = {
    TAU: TAU, normAngle: normAngle, toRect: toRect, toPolar: toPolar, naiveTheta: naiveTheta, quadrant: quadrant,
    representations: representations, samePoint: samePoint, compile: compile, sample: sample, extent: extent,
    hausdorff: hausdorff, rotate: rotate, reflect: reflect, scale: scale, petals: petals, roseCount: roseCount,
    symmetry: symmetry, curveOf: curveOf, petalsOf: petalsOf, symmetryOf: symmetryOf, sameCurve: sameCurve,
    onImplicit: onImplicit, diagnose: diagnose, randomCurve: randomCurve, CHALLENGES: CHALLENGES
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var W = 420, H = 360, CX = 210, CY = 180, RPX = 140;
  var MSG = {
    ok: ['Es la misma curva', 'Coinciden como conjuntos de puntos, aunque tu fórmula se vea distinta.'],
    rotated: ['Casi: tu curva está girada', '¿Intercambiaste cos θ y sin θ? Con cos θ la curva se acomoda sobre el eje polar; con sin θ, sobre el eje y.'],
    reflected: ['Casi: tu curva es el reflejo', 'Revisa el signo: cambiar + por − (o cos θ por −cos θ) refleja la curva.'],
    scale: ['Casi: la forma es correcta, pero no el tamaño', 'Revisa el número que multiplica: tu curva es más grande o más chica.'],
    petals: ['Casi: es una rosa, pero con otro número de pétalos', 'r = a cos nθ tiene n pétalos si n es impar y 2n si n es par.'],
    bad: ['No es la misma curva', 'Lee la curva en θ = 0, π/2, π y 3π/2 y compara con lo que da tu r(θ).'],
    domain: ['No pude evaluar tu r(θ)', 'Usa θ de la paleta (o escribe theta) y revisa los paréntesis.']
  };
  function niceStep(span) {
    var raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function deg(t) { return Math.round(t * 180 / Math.PI); }

  window.Labs['polar-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var math = null;
    var list = (cfg.challenges || CHALLENGES).slice();
    var startIdx = Math.max(0, Math.min(list.length - 1, cfg.start || 0));
    var cur = list[startIdx];
    var pristine = true, ePristine = true;
    var EX_TEX = '1+2\\cos\\left(\\theta\\right)', EX_MATH = '1+2*cos(theta)';

    var modeSel = UI.select({ label: '¿Qué quieres hacer?', options: ['¿Es tu curva? (reto)', 'Explorar: traza r(θ) poco a poco'] });
    var chSel = UI.select({ label: 'Curva objetivo', options: list.map(function (c, i) { return (i + 1) + ' · ' + c.name; }).concat(['Al azar']) });
    var hintP = h('p', { class: 'lab-note' });
    var given = h('div', { class: 'lab-given', hidden: true });
    var btnShow = UI.button('Ver la ecuación', 'ghost', function () {
      given.hidden = !given.hidden;
      btnShow.textContent = given.hidden ? 'Ver la ecuación' : 'Ocultar la ecuación';
    });
    var btnRand = UI.button('Otra al azar', 'ghost', function () { chSel.input.value = String(list.length); setChallenge(randomCurve()); });
    var rIn = UI.mathField({ label: 'Tu r(θ)', palette: 'multi', hint: 'Escribe como en papel y usa θ de la paleta. Ejemplo: 1 + 2cos θ.', onEnter: function () { check(); } });
    var run = UI.button('Comprobar', 'primary', function () { check(); });
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var eIn = UI.mathField({ label: 'Curva a trazar r(θ)', palette: 'multi', hint: 'Prueba una cardioide, una rosa o una espiral.', onEnter: function () { drawExplore(); } });
    var eRun = UI.button('Trazar', 'primary', function () { drawExplore(); });
    var turns = UI.select({ label: 'Intervalo de θ', options: ['Una vuelta: 0 ≤ θ ≤ 2π', 'Dos vueltas: 0 ≤ θ ≤ 4π'] });
    var thS = UI.slider({ label: 'Ángulo θ', min: 0, max: +TAU.toFixed(4), step: 0.01, value: 2.4, fmt: function (t) { return t.toFixed(2) + ' rad (' + deg(t) + '°)'; } }, function () { drawExplore(); });
    var eNote = h('p', { class: 'lab-note' });

    var checkBox = h('div', { class: 'lab-controls' }, [chSel.node, hintP, h('div', { class: 'lab-buttons' }, [btnShow, btnRand]), given, rIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict]);
    var exploreBox = h('div', { class: 'lab-controls', hidden: true }, [eIn.node, h('div', { class: 'lab-buttons' }, [eRun]), turns.node, thS.node, eNote]);

    var svg = UI.svg(W, H, 'Plano polar con la curva objetivo y la tuya');
    var title = h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tu curva contra la objetivo']);
    var legend = h('ul', { class: 'lab-legend' });
    var facts = h('dl', { class: 'lab-facts' });

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [modeSel.node, checkBox, exploreBox]),
      h('figure', { class: 'lab-board' }, [title, svg, legend, facts])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
    if (rIn.onInput) rIn.onInput(function () { pristine = false; });
    if (eIn.onInput) eIn.onInput(function () { ePristine = false; });

    function isExplore() { return modeSel.input.value === '1'; }
    modeSel.input.addEventListener('change', syncMode);
    chSel.input.addEventListener('change', function () {
      var i = +chSel.input.value;
      setChallenge(i >= list.length ? randomCurve() : list[i]);
    });
    turns.input.addEventListener('change', function () {
      var max = turns.input.value === '1' ? 2 * TAU : TAU;
      thS.input.max = String(+max.toFixed(4));
      if (thS.get() > max) thS.set(+max.toFixed(4));
      drawExplore();
    });

    function syncMode() {
      var ex = isExplore();
      checkBox.hidden = ex; exploreBox.hidden = !ex;
      title.textContent = ex ? 'El punto (r, θ) recorre la curva' : 'Tu curva contra la objetivo';
      legend.innerHTML = '';
      (ex ? [['aux', 'curva completa'], ['ref', 'lo trazado hasta θ'], ['trace', 'segmento de largo |r|']] : [['ref', 'curva objetivo'], ['student', 'tu curva']])
        .forEach(function (l) { legend.appendChild(h('li', {}, [h('i', { class: 'sw sw--' + l[0] }), l[1]])); });
      if (ex) drawExplore(); else check();
    }

    function setChallenge(c) {
      cur = c;
      hintP.textContent = 'Pista: ' + c.hint;
      given.innerHTML = '$' + c.tex + '$';
      UI.renderMath(given);
      verdict.hidden = true;
      note.textContent = '';
      draw(null, null);
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
    function frame(R) {
      svg.innerHTML = '';
      var g = el('g', { class: 'sketch' });
      var k = RPX / R, step = niceStep(R * 4 / 3), d = '';
      for (var c = step; c <= R + 1e-9; c += step) d += 'M' + (CX + c * k).toFixed(1) + ' ' + CY + 'A' + (c * k).toFixed(1) + ' ' + (c * k).toFixed(1) + ' 0 1 0 ' + (CX - c * k).toFixed(1) + ' ' + CY + 'A' + (c * k).toFixed(1) + ' ' + (c * k).toFixed(1) + ' 0 1 0 ' + (CX + c * k).toFixed(1) + ' ' + CY;
      for (var a = 0; a < 12; a++) {
        if (a % 3 === 0) continue;
        var t = a * Math.PI / 6;
        d += 'M' + CX + ' ' + CY + 'L' + (CX + RPX * Math.cos(t)).toFixed(1) + ' ' + (CY - RPX * Math.sin(t)).toFixed(1);
      }
      el('path', { d: d, class: 'plot-grid', fill: 'none' }, g);
      el('path', { d: 'M' + (CX - RPX - 6) + ' ' + CY + 'H' + (CX + RPX + 6) + 'M' + CX + ' ' + (CY - RPX - 6) + 'V' + (CY + RPX + 6), class: 'axis', 'stroke-width': 1.3, fill: 'none' }, g);
      for (var c2 = step; c2 <= R + 1e-9; c2 += step) el('text', { x: CX + c2 * k - 3, y: CY + 14, class: 'lab-tick', 'text-anchor': 'end' }, g, UI.fmt(c2, 3));
      el('text', { x: CX + RPX + 10, y: CY + 4, class: 'lab-tick' }, g, '0');
      el('text', { x: CX + 6, y: CY - RPX - 10, class: 'lab-tick' }, g, 'π/2');
      el('text', { x: CX - RPX - 10, y: CY + 4, class: 'lab-tick', 'text-anchor': 'end' }, g, 'π');
      el('text', { x: CX + 6, y: CY + RPX + 20, class: 'lab-tick' }, g, '3π/2');
      return { g: g, k: k };
    }
    function pathOf(pts, k) {
      var d = '', pen = false;
      pts.forEach(function (p) {
        if (!p) { pen = false; return; }
        d += (pen ? 'L' : 'M') + (CX + p[0] * k).toFixed(1) + ' ' + (CY - p[1] * k).toFixed(1); pen = true;
      });
      return d;
    }
    function niceR(m) { var s = niceStep(m * 1.1); return Math.max(s, Math.ceil(m * 1.08 / s) * s); }

    function targetPts() { return math ? sample(compile(math, cur.expr), 0, cur.to, 900) : null; }

    // Modo reto: objetivo (ref) y la curva del alumno (student).
    function draw(T, S) {
      if (!math) { frame(4); return; }
      T = T || targetPts();
      var m = extent(T);
      if (S) m = Math.max(m, Math.min(extent(S), 4 * m));
      var R = niceR(m || 1), f = frame(R);
      // Recorta lo del alumno que se sale mucho del cuadro.
      var Sc = S ? S.map(function (p) { return p && Math.hypot(p[0], p[1]) <= 1.15 * R ? p : null; }) : null;
      el('path', { d: pathOf(T, f.k), class: 'ref', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, f.g);
      if (Sc) el('path', { d: pathOf(Sc, f.k), class: 'student', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, f.g);
      var sy = symmetry(T, 0.01), names = [];
      if (sy.polar) names.push('eje polar');
      if (sy.yaxis) names.push('eje y');
      if (sy.origin) names.push('origen');
      var pt = petals(T);
      facts.innerHTML = '';
      [['simetrías de la objetivo', names.length ? names.join(', ') : 'ninguna'], ['intervalo de θ', cur.to > TAU + 1e-9 ? '0 a 4π' : '0 a 2π']]
        .concat(pt >= 2 ? [['pétalos de la objetivo', String(pt)]] : [])
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function readSrc(field, isPristine, fallback) {
      var s = field.get();
      return s || (isPristine ? fallback : '');
    }

    function check(src) {
      if (!math) return;
      try { src = src || readSrc(rIn, pristine, startSample); }
      catch (e) { UI.verdict(verdict, 'bad', 'Completa tu r(θ)', e.message); return; }
      var T = targetPts();
      if (!src) { verdict.hidden = true; draw(T, null); return; }
      var S;
      try { S = sample(compile(math, src), 0, cur.to, 900, 1e4 * Math.max(extent(T), 1)); }
      catch (e) { UI.verdict(verdict, 'bad', MSG.domain[0], MSG.domain[1]); draw(T, null); return; }
      var r = diagnose(T, S);
      var msg = MSG[r.key] || MSG.bad;
      var tail = r.kind === 'ok' ? '' : (isFinite(r.err) ? ' Distancia máxima entre las curvas: ' + Math.round(r.err * 100) + ' % del tamaño de la objetivo.' : '');
      if (r.key === 'scale') tail = ' Tu curva sale ' + UI.fmt(r.k, 3) + ' veces la objetivo.';
      if (r.key === 'petals') tail = ' La objetivo tiene ' + r.pT + ' pétalos y la tuya ' + r.pS + '.';
      UI.verdict(verdict, r.kind, msg[0], msg[1] + tail);
      draw(T, r.key === 'domain' ? null : S);
    }

    // Modo explorar: traza r(θ) hasta el ángulo del deslizador.
    function drawExplore() {
      if (!math) { frame(4); return; }
      var src = '', fn;
      try { src = readSrc(eIn, ePristine, EX_MATH); } catch (e) { eNote.textContent = e.message; return; }
      if (!src) { frame(4); eNote.textContent = 'Escribe una r(θ) para trazarla.'; facts.innerHTML = ''; return; }
      try { fn = compile(math, src); } catch (e) { eNote.textContent = 'No pude leer tu r(θ): ' + e.message; return; }
      var max = turns.input.value === '1' ? 2 * TAU : TAU, th = Math.min(thS.get(), max);
      var full = sample(fn, 0, max, 900, 1e3), m = extent(full);
      if (!(m > 0)) { frame(4); eNote.textContent = 'Tu r(θ) no da valores para graficar.'; facts.innerHTML = ''; return; }
      var R = niceR(m), f = frame(R), k = f.k;
      el('path', { d: pathOf(full, k), class: 'aux', 'stroke-width': 1.6, 'stroke-dasharray': '4 6', fill: 'none' }, f.g);
      var part = th > 0 ? sample(fn, 0, th, Math.max(2, Math.round(900 * th / max)), 1e3) : [];
      if (part.length) el('path', { d: pathOf(part, k), class: 'ref', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, f.g);
      // Rayo en la dirección θ y arco del ángulo.
      var ux = Math.cos(th), uy = Math.sin(th);
      el('path', { d: 'M' + CX + ' ' + CY + 'L' + (CX + RPX * ux).toFixed(1) + ' ' + (CY - RPX * uy).toFixed(1), class: 'axis', 'stroke-width': 1.3, 'stroke-dasharray': '3 5', fill: 'none' }, f.g);
      var ta = normAngle(th), big = ta > Math.PI ? 1 : 0;
      if (ta > 0.05) el('path', { d: 'M' + (CX + 24) + ' ' + CY + 'A24 24 0 ' + big + ' 0 ' + (CX + 24 * Math.cos(ta)).toFixed(1) + ' ' + (CY - 24 * Math.sin(ta)).toFixed(1), class: 'axis', 'stroke-width': 1.5, fill: 'none' }, f.g);
      var r = fn(th), x = r * ux, y = r * uy, px = CX + x * k, py = CY - y * k;
      if (isFinite(r)) {
        el('path', { d: 'M' + CX + ' ' + CY + 'L' + px.toFixed(1) + ' ' + py.toFixed(1), class: r < 0 ? 'error' : 'trace', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, f.g);
        el('circle', { cx: px, cy: py, r: 6, class: 'dot-trace' }, f.g);
        // Etiqueta arriba del punto (las marcas del eje van abajo), del lado contrario al origen.
        var lx = px + (px >= CX ? 14 : -14), ly = py - 12;
        el('text', { x: Math.max(12, Math.min(W - 12, lx)), y: Math.max(16, Math.min(H - 6, ly)), class: 'ann', 'font-size': 18, 'text-anchor': 'middle' }, f.g, 'P');
      }
      eNote.textContent = !isFinite(r) ? 'En este θ tu r(θ) no está definida.' :
        r < 0 ? 'Aquí r < 0: el punto P cae en el rayo opuesto a θ (segmento rojo). Es el mismo punto que (|r|, θ + π).' :
        'P está a una distancia r del origen, en la dirección θ.';
      facts.innerHTML = '';
      [['θ', th.toFixed(3) + ' rad (' + deg(th) + '°)'], ['r(θ)', UI.fmt(r, 4)], ['x = r cos θ', UI.fmt(x, 4)], ['y = r sin θ', UI.fmt(y, 4)]]
        .forEach(function (row) { facts.appendChild(h('dt', {}, [row[0]])); facts.appendChild(h('dd', {}, [row[1]])); });
    }

    // Ejemplo cargado al abrir: la respuesta de un compañero con un error típico.
    var startSample = cfg.answer != null ? cfg.answer : cur.sampleMath || '';
    setChallenge(cur);
    chSel.input.value = String(startIdx);
    if (cfg.answerTex || cur.sampleTex) rIn.setLatex(cfg.answerTex || cur.sampleTex);
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Escribe tu propia r(θ).';
    eIn.setLatex(EX_TEX);
    if (cfg.mode === 'explore') modeSel.input.value = '1';
    syncMode();
    frame(4);
    document.addEventListener('cb:themechange', function () { if (isExplore()) drawExplore(); else check(); });
    return UI.loadMath().then(function (m) { math = m; syncMode(); }).catch(function () {});
  };
})();
