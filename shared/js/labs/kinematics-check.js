/* =====================================================================
   Lab kinematics-check (§8.3): tiro vertical y caída libre (MRUA).
   El alumno escribe su y(t) para un objeto lanzado desde h0 con v0
   (positiva hacia arriba); se compara contra la solución analítica
     y(t) = h0 + v0 t − ½ g t²
   y se grafica el error y_alumno − y_real en el tiempo. Errores típicos:
     plusG   +½gt² (el signo de g con el eje y hacia arriba)
     noHalf  −g t² (olvidó el ½)
     noH0    olvidó la altura inicial
     signV0  el signo de v0 al revés
   ===================================================================== */
(function () {
  var G = 9.81;

  /* ------------------------- Matemática pura ------------------------- */
  function acc(p) { return p.a != null ? p.a : -(p.g || G); }
  function pos(p, t) { return (p.h0 || 0) + p.v0 * t + acc(p) * t * t / 2; }
  function vel(p, t) { return p.v0 + acc(p) * t; }
  // Para tiro vertical (a = −g): instante de la cima, altura máxima, llegada al piso y velocidad al llegar.
  function vertical(p) {
    var g = p.g || G, h0 = p.h0 || 0, v0 = p.v0;
    var disc = Math.sqrt(v0 * v0 + 2 * g * h0);
    return {
      tTop: Math.max(0, v0 / g),
      H: v0 > 0 ? h0 + v0 * v0 / (2 * g) : h0,
      T: (v0 + disc) / g,
      vImpact: -disc
    };
  }
  // Frenado con aceleración constante (a < 0 o su magnitud): tiempo y distancia hasta parar.
  function stop(v0, a) { var m = Math.abs(a); return { t: v0 / m, d: v0 * v0 / (2 * m) }; }
  // v² = v0² + 2aΔx → |v| final.
  function speedAfter(v0, a, dx) { return Math.sqrt(v0 * v0 + 2 * a * dx); }
  function mistakes(p) {
    var g = p.g || G, h0 = p.h0 || 0, v0 = p.v0;
    return {
      plusG: function (t) { return h0 + v0 * t + g * t * t / 2; },
      noHalf: function (t) { return h0 + v0 * t - g * t * t; },
      noH0: function (t) { return v0 * t - g * t * t / 2; },
      signV0: function (t) { return h0 - v0 * t - g * t * t / 2; }
    };
  }
  // Compara la y(t) del alumno en [0, T]; error relativo a la escala de la gráfica.
  function diagnose(math, src, p, tol) {
    tol = tol || 1e-3;
    var fn = window.LabMath.core.build(math, src, ['t']).fn;
    var info = vertical(p), tEnd = isFinite(info.T) && info.T > 0 ? info.T : 2, n = 80;
    var scale = Math.max(Math.abs(info.H), Math.abs(p.h0 || 0), 1), samples = [], maxErr = 0;
    var ms = mistakes(p), near = {};
    Object.keys(ms).forEach(function (k) { near[k] = 0; });
    for (var i = 0; i <= n; i++) {
      var t = tEnd * i / n, yr = pos(p, t), ys = fn(t);
      samples.push({ t: t, y: yr, ys: ys });
      maxErr = Math.max(maxErr, isFinite(ys) ? Math.abs(ys - yr) / scale : Infinity);
      Object.keys(ms).forEach(function (k) { near[k] = Math.max(near[k], isFinite(ys) ? Math.abs(ys - ms[k](t)) / scale : Infinity); });
    }
    var kind = maxErr < tol ? 'ok' : 'bad';
    if (kind === 'bad') {
      Object.keys(ms).some(function (k) {
        // El error típico debe ser distinto de la respuesta (p. ej. con h0 = 0, noH0 es la correcta).
        var differs = false;
        for (var j = 0; j <= 10; j++) { var tt = tEnd * j / 10; if (Math.abs(ms[k](tt) - pos(p, tt)) / scale > tol) differs = true; }
        if (differs && near[k] < tol) { kind = k; return true; }
        return false;
      });
    }
    return { kind: kind, maxErr: maxErr, samples: samples, tEnd: tEnd };
  }

  window.LabMath.kinematics = { G: G, pos: pos, vel: vel, vertical: vertical, stop: stop, speedAfter: speedAfter, mistakes: mistakes, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var MSG = {
    ok: ['Tu y(t) coincide con la real', 'La curva punteada queda encima de la real y el error es cero.'],
    plusG: ['El signo de g está al revés', 'Con el eje y hacia arriba, la aceleración es −g: el término es −½gt². Con +½gt² el objeto nunca bajaría.'],
    noHalf: ['Te falta el ½', 'El término de la aceleración es ½at² = −4.905t², no −9.81t².'],
    noH0: ['Olvidaste la altura inicial', 'y(0) debe ser h0: el objeto no sale del piso.'],
    signV0: ['El signo de v0 está al revés', 'Si lo lanzas hacia arriba, v0 es positiva; hacia abajo, negativa.'],
    bad: ['Tu y(t) se separa de la real', 'Revisa los tres términos: y(0) = h0, la pendiente inicial es v0 y la curvatura es −g.']
  };

  window.Labs['kinematics-check'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { h0: 20, v0: 15 };
    var math = null, last = null;
    var h0 = UI.slider({ label: 'Altura inicial h₀', min: 0, max: 60, step: 1, value: s.h0, unit: 'm' }, recheck);
    var v0 = UI.slider({ label: 'Velocidad inicial v₀ (+ hacia arriba)', min: -20, max: 30, step: 1, value: s.v0, unit: 'm/s' }, recheck);
    var yIn = UI.mathField({ label: 'Tu y(t) en metros', palette: 'fisica', hint: 'Usa t como variable y g = 9.81.', onEnter: check });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 340, 'Altura contra tiempo: la real y la tuya');
    var svgE = UI.svg(640, 160, 'Error de tu y(t) respecto a la real, en el tiempo');

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        h0.node, v0.node, yIn.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tu y(t) contra la real']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'y(t) real']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'tu y(t)']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'error'])
        ]),
        svgE
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });

    function params() { return { h0: h0.get(), v0: v0.get() }; }
    function recheck() { if (last) check(); else draw(null); }

    function draw(res) {
      var p = params(), info = vertical(p), tEnd = res ? res.tEnd : (info.T > 0 ? info.T : 2);
      var ys = [];
      for (var i = 0; i <= 80; i++) ys.push(pos(p, tEnd * i / 80));
      if (res) res.samples.forEach(function (q) { if (isFinite(q.ys)) ys.push(q.ys); });
      var yr = window.LabPlot.range(ys);
      var plot = window.LabPlot(svg, { x: [0, tEnd * 1.05], y: yr });
      plot.clear(); plot.grid(); plot.axes();
      plot.curve(function (t) { return pos(p, t); }, 'ref', 3.5, null, 0, tEnd);
      if (res) {
        var sm = res.samples;
        plot.curve(function (t) { var k = Math.round(t / tEnd * (sm.length - 1)); return sm[Math.max(0, Math.min(sm.length - 1, k))].ys; }, 'student', 3, null, 0, tEnd);
      }
      if (info.tTop > 0) {
        plot.point(info.tTop, info.H, 'dot-ref');
        plot.label(info.tTop, info.H, 'cima', 'middle', 15, 0, -10);
      }
      plot.point(info.T, 0, 'dot-trace');
      plot.label(tEnd * 1.05, yr[1], 'y (m) contra t (s)', 'end', 15, -6, 14);

      var pe = window.LabPlot(svgE, { x: [0, tEnd * 1.05], y: res ? window.LabPlot.range(res.samples.map(function (q) { return q.ys - q.y; })) : [-1, 1] });
      pe.clear(); pe.grid(); pe.axes();
      if (res) {
        var sm2 = res.samples;
        pe.curve(function (t) { var k = Math.round(t / tEnd * (sm2.length - 1)); var q = sm2[Math.max(0, Math.min(sm2.length - 1, k))]; return q.ys - q.y; }, 'error', 3, null, 0, tEnd);
      }
      pe.label(tEnd * 1.05, pe.yr[1], 'y_tuya − y_real (m)', 'end', 15, -6, 14);

      facts.innerHTML = '';
      [['sube durante', info.tTop > 0 ? UI.fmt(info.tTop, 4) + ' s' : 'no sube'], ['altura máxima', UI.fmt(info.H, 4) + ' m'],
        ['llega al piso en', UI.fmt(info.T, 4) + ' s'], ['velocidad al llegar', UI.fmt(info.vImpact, 4) + ' m/s']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function check() {
      if (!math) return;
      var src;
      try { src = String(yIn.get() || '').trim(); } catch (e) { UI.verdict(verdict, 'bad', 'Completa tu y(t)', e.message); return; }
      if (!src) { UI.verdict(verdict, 'bad', 'Escribe tu y(t)', 'Por ejemplo, h0 + v0·t − 4.905t².'); return; }
      try {
        var r = diagnose(math, src, params());
        var msg = MSG[r.kind] || MSG.bad;
        UI.verdict(verdict, r.kind === 'ok' ? 'ok' : r.kind === 'bad' ? 'bad' : 'warn', msg[0],
          msg[1] + (r.kind !== 'ok' && isFinite(r.maxErr) ? ' Error máximo: ' + UI.fmt(r.maxErr * Math.max(vertical(params()).H, params().h0, 1), 3) + ' m.' : ''));
        last = r;
        draw(r);
      } catch (e) { UI.verdict(verdict, 'bad', 'No pude leer tu y(t)', e.message); last = null; draw(null); }
    }

    draw(null);
    document.addEventListener('cb:themechange', function () { draw(last); });
    return UI.loadMath().then(function (m) {
      math = m;
      // Ejemplo cargado: un compañero olvidó el ½.
      var p = params();
      yIn.setMath(p.h0 + ' + ' + p.v0 + 't - 9.81t^2');
      note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Escribe tu y(t) o cambia h₀ y v₀.';
      // El editor (MathLive) puede tardar en cargar: se revisa cuando el campo ya tiene la expresión.
      return new Promise(function (resolve) {
        var n = 0;
        (function poll() {
          var v = '';
          try { v = String(yIn.get() || '').trim(); } catch (e) { v = 'x'; }
          if (v || ++n > 26) { check(); resolve(); } else setTimeout(poll, 150);
        })();
      });
    });
  };
})();
