/* =====================================================================
   Banco · Física 1 · S08 · Leyes de Newton y diagrama de cuerpo libre.
   100 preguntas propias. g = 9.81 m/s², SI.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '08'), C = K.C;
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    if (o.mistakes) {
      var base = o.where;
      q.where = function (v) {
        if (base && !base(v)) return false;
        var vals = [answer(v)].concat(Object.keys(o.mistakes).map(function (k) { return o.mistakes[k](v); }));
        for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
        }
        return true;
      };
    }
    return q;
  }
  function fb(key, say) { return [{ when: key, say: say }]; }
  function sum(list) { var x = 0, y = 0; list.forEach(function (f) { x += f[0] * Math.cos(f[1] * RAD); y += f[0] * Math.sin(f[1] * RAD); }); return { x: x, y: y, mag: Math.hypot(x, y), ang: ((Math.atan2(y, x) * DEG) % 360 + 360) % 360 }; }
  var EX = { abs: 0.01 };

  var Q = [
    /* ---------------- Segunda ley ---------------- */
    N('se-a', 'segunda', 1, { F: [5, 200, 5], m: [1, 50, 1] }, function (v) { return 'Una fuerza neta de $' + v.F + '\\ \\text{N}$ actúa sobre un objeto de $' + v.m + '\\ \\text{kg}$. ¿Qué aceleración le produce?'; },
      function (v) { return v.F / v.m; }, '$a = \\Sigma F/m$.', { unit: 'm/s²', mistakes: { byWeight: function (v) { return v.F / (v.m * g); } }, feedback: fb('byWeight', 'Dividiste entre el peso; la segunda ley usa la masa.') }),
    N('se-F', 'segunda', 2, { m: [1, 50, 1], a: [0.5, 10, 0.5] }, function (v) { return '¿Qué fuerza neta se necesita para acelerar $' + v.m + '\\ \\text{kg}$ a $' + v.a + '\\ \\text{m/s}^2$?'; },
      function (v) { return v.m * v.a; }, '$\\Sigma F = ma$.', { unit: 'N' }),
    N('se-m', 'segunda', 2, { F: [5, 200, 5], ac: [0.5, 10, 0.5] }, function (v) { return 'Una fuerza neta de $' + v.F + '\\ \\text{N}$ produce una aceleración de $' + v.ac + '\\ \\text{m/s}^2$. ¿Cuál es la masa del objeto?'; },
      function (v) { return v.F / v.ac; }, '$m = \\Sigma F/a$.', { unit: 'kg' }),
    N('se-opuestas', 'segunda', 1, { F1: [5, 100, 5], F2: [5, 100, 5], m: [1, 30, 1] }, function (v) { return 'Sobre un carrito de $' + v.m + '\\ \\text{kg}$ actúan $' + v.F1 + '\\ \\text{N}$ hacia la derecha y $' + v.F2 + '\\ \\text{N}$ hacia la izquierda. ¿Cuánto vale la magnitud de su aceleración?'; },
      function (v) { return Math.abs(v.F1 - v.F2) / v.m; }, 'Las fuerzas opuestas se restan.', { unit: 'm/s²', where: function (v) { return v.F1 !== v.F2; }, mistakes: { added: function (v) { return (v.F1 + v.F2) / v.m; } }, feedback: fb('added', 'Apuntan en sentidos opuestos: la fuerza neta es la diferencia.') }),
    N('se-friccion', 'segunda', 1, { F: [20, 200, 10], f: [5, 100, 5], m: [2, 40, 1] }, function (v) { return 'Empujas una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ y la fricción la frena con $' + v.f + '\\ \\text{N}$. ¿Qué aceleración tiene?'; },
      function (v) { return (v.F - v.f) / v.m; }, 'Fuerza neta: tu fuerza menos la fricción.', { unit: 'm/s²', where: function (v) { return v.F > v.f + 5; }, mistakes: { noFriction: function (v) { return v.F / v.m; } }, feedback: fb('noFriction', 'Te faltó restar la fricción.') }),
    N('se-frenar-d', 'segunda', 3, { m: [500, 2000, 100], v: [10, 30, 1], d: [10, 80, 5] }, function (v) { return '¿Qué fuerza de frenado constante detiene un auto de $' + v.m + '\\ \\text{kg}$ que va a $' + v.v + '\\ \\text{m/s}$ en $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return v.m * v.v * v.v / (2 * v.d); }, 'Con $v^2 = 2ad$ sale $a$; luego $F = ma$.', { unit: 'N', mistakes: { noTwo: function (v) { return v.m * v.v * v.v / v.d; } }, feedback: fb('noTwo', 'Falta el 2: $a = v^2/2d$.') }),
    N('se-frenar-t', 'segunda', 2, { m: [500, 2000, 100], v: [10, 30, 1], t: [2, 10, 1] }, function (v) { return 'Un auto de $' + v.m + '\\ \\text{kg}$ a $' + v.v + '\\ \\text{m/s}$ frena hasta detenerse en $' + v.t + '\\ \\text{s}$. ¿Qué fuerza neta (magnitud) actúa sobre él?'; },
      function (v) { return v.m * v.v / v.t; }, '$a = v/t$ y $F = ma$.', { unit: 'N' }),
    N('se-v', 'segunda', 2, { F: [5, 100, 5], m: [1, 20, 1], t: [1, 10, 1] }, function (v) { return 'Una fuerza neta de $' + v.F + '\\ \\text{N}$ actúa $' + v.t + '\\ \\text{s}$ sobre un cuerpo de $' + v.m + '\\ \\text{kg}$ que estaba en reposo. ¿Qué rapidez alcanza?'; },
      function (v) { return v.F * v.t / v.m; }, '$a = F/m$ y $v = at$.', { unit: 'm/s' }),
    N('se-x', 'segunda', 2, { F: [5, 100, 5], m: [1, 20, 1], t: [1, 10, 1] }, function (v) { return 'Un robot de $' + v.m + '\\ \\text{kg}$ parte del reposo empujado por una fuerza neta de $' + v.F + '\\ \\text{N}$. ¿Qué distancia recorre en $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.F / v.m * v.t * v.t / 2; }, '$a = F/m$ y $x = \\tfrac{1}{2}at^2$.', { unit: 'm', mistakes: { noHalf: function (v) { return v.F / v.m * v.t * v.t; } }, feedback: fb('noHalf', 'Falta el $\\tfrac{1}{2}$ de $\\tfrac{1}{2}at^2$.') }),
    N('se-kmh', 'segunda', 3, { m: [800, 2000, 100], vk: [36, 108, 9], t: [4, 15, 1] }, function (v) { return 'Un auto de $' + v.m + '\\ \\text{kg}$ pasa de 0 a $' + v.vk + '\\ \\text{km/h}$ en $' + v.t + '\\ \\text{s}$. ¿Qué fuerza neta media actuó?'; },
      function (v) { return v.m * (v.vk / 3.6) / v.t; }, 'Pasa la rapidez a m/s antes de calcular $a$.', { unit: 'N', mistakes: { noConvert: function (v) { return v.m * v.vk / v.t; } }, feedback: fb('noConvert', 'Usaste km/h: divide entre 3.6.') }),
    N('se-doble-m', 'segunda', 1, {}, function () { return 'Con la misma fuerza neta, ¿por qué factor se multiplica la aceleración si la masa se duplica?'; },
      function () { return 0.5; }, '$a = F/m$: el doble de masa da la mitad de aceleración.', { tol: EX }),
    N('se-cohete', 'segunda', 2, { T: [200, 2000, 100], m: [10, 100, 5] }, function (v) { return 'Un cohete de $' + v.m + '\\ \\text{kg}$ recibe un empuje vertical de $' + v.T + '\\ \\text{N}$. ¿Con qué aceleración sube?'; },
      function (v) { return (v.T - v.m * g) / v.m; }, 'El peso también actúa: $a = (T - mg)/m$.', { unit: 'm/s²', where: function (v) { return v.T > 1.2 * v.m * g; }, mistakes: { noWeight: function (v) { return v.T / v.m; } }, feedback: fb('noWeight', 'Olvidaste el peso, que actúa hacia abajo.') }),
    N('se-grua-a', 'segunda', 2, { T: [500, 5000, 100], m: [40, 400, 10] }, function (v) { return 'Un cable jala hacia arriba con $' + v.T + '\\ \\text{N}$ una carga de $' + v.m + '\\ \\text{kg}$. ¿Qué aceleración tiene (positiva hacia arriba)?'; },
      function (v) { return v.T / v.m - g; }, '$T - mg = ma$.', { unit: 'm/s²', tol: EX, where: function (v) { return Math.abs(v.T / v.m - g) > 0.3; } }),
    N('se-dist-frenado', 'segunda', 3, { m: [500, 2000, 100], v: [10, 30, 1], F: [2000, 12000, 500] }, function (v) { return 'Un auto de $' + v.m + '\\ \\text{kg}$ va a $' + v.v + '\\ \\text{m/s}$ y sus frenos aplican $' + v.F + '\\ \\text{N}$. ¿En qué distancia se detiene?'; },
      function (v) { return v.m * v.v * v.v / (2 * v.F); }, '$a = F/m$ y $d = v^2/2a$.', { unit: 'm' }),

    /* ---------------- Masa, peso y normal ---------------- */
    N('pe-w', 'peso', 1, { m: [1, 120, 1] }, function (v) { return '¿Cuánto pesa, en newtons, un objeto de $' + v.m + '\\ \\text{kg}$ en la Tierra?'; },
      function (v) { return v.m * g; }, '$w = mg$.', { unit: 'N' }),
    N('pe-m', 'peso', 2, { w: [10, 1200, 10] }, function (v) { return 'Un objeto pesa $' + v.w + '\\ \\text{N}$ en la Tierra. ¿Cuál es su masa?'; },
      function (v) { return v.w / g; }, '$m = w/g$.', { unit: 'kg' }),
    N('pe-luna', 'peso', 2, { m: [1, 120, 1] }, function (v) { return 'En la Luna $g = 1.62\\ \\text{m/s}^2$. ¿Cuánto pesa ahí un astronauta de $' + v.m + '\\ \\text{kg}$?'; },
      function (v) { return v.m * 1.62; }, 'La masa no cambia; el peso sí: $w = mg_{Luna}$.', { unit: 'N' }),
    N('pe-luna-tierra', 'peso', 2, { wL: [10, 200, 5] }, function (v) { return 'Una roca pesa $' + v.wL + '\\ \\text{N}$ en la Luna ($1.62\\ \\text{m/s}^2$). ¿Cuánto pesaría en la Tierra?'; },
      function (v) { return v.wL / 1.62 * g; }, 'Primero la masa, $w/g_{Luna}$; luego por $9.81$.', { unit: 'N' }),
    N('pe-marte', 'peso', 1, { mm: [1, 120, 1] }, function (v) { return 'En Marte $g = 3.71\\ \\text{m/s}^2$. ¿Cuánto pesa ahí un robot de $' + v.mm + '\\ \\text{kg}$?'; },
      function (v) { return v.mm * 3.71; }, '$w = mg$ con la $g$ de Marte.', { unit: 'N' }),
    N('pe-libros', 'peso', 2, { m1: [0.5, 5, 0.5], m2: [0.5, 5, 0.5] }, function (v) { return 'Un libro de $' + v.m2 + '\\ \\text{kg}$ está encima de otro de $' + v.m1 + '\\ \\text{kg}$, sobre una mesa. ¿Qué normal ejerce la mesa sobre el libro de abajo?'; },
      function (v) { return (v.m1 + v.m2) * g; }, 'La mesa sostiene a los dos libros.', { unit: 'N', mistakes: { onlyBottom: function (v) { return v.m1 * g; } }, feedback: fb('onlyBottom', 'El libro de abajo también carga al de arriba: la mesa sostiene los dos.') }),
    N('pe-empuja-abajo', 'peso', 1, { m: [1, 30, 1], F: [5, 100, 5] }, function (v) { return 'Empujas verticalmente hacia abajo con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$ que está en el piso. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g + v.F; }, '$N = mg + F$: el piso sostiene el peso y tu empujón.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Tu empujón también aprieta la caja contra el piso.') }),
    N('pe-jala-arriba', 'peso', 1, { m: [5, 30, 1], F: [5, 40, 5] }, function (v) { return 'Jalas verticalmente hacia arriba con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$, sin levantarla. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g - v.F; }, '$N + F - mg = 0$.', { unit: 'N', where: function (v) { return v.F < v.m * g - 5; }, mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Tu jalón ayuda a sostener la caja: la normal disminuye.') }),
    N('pe-angulo', 'peso', 2, { m: [5, 30, 1], F: [10, 100, 5], th: [15, 60, 5] }, function (v) { return 'Jalas una caja de $' + v.m + '\\ \\text{kg}$ con una cuerda a $' + v.th + '^\\circ$ sobre la horizontal y $' + v.F + '\\ \\text{N}$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g - v.F * Math.sin(v.th * RAD); }, 'La componente vertical de la cuerda, $F\\sin\\theta$, reduce la normal.', { unit: 'N', where: function (v) { return v.m * g - v.F * Math.sin(v.th * RAD) > 5; }, mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Usaste $N = mg$; la cuerda inclinada levanta un poco la caja.') }),

    /* ---------------- Elevador ---------------- */
    N('el-sube', 'elevador', 1, { m: [30, 100, 5], a: [0.5, 4, 0.5] }, function (v) { return 'Un elevador acelera hacia arriba a $' + v.a + '\\ \\text{m/s}^2$ con una persona de $' + v.m + '\\ \\text{kg}$. ¿Qué normal recibe la persona?'; },
      function (v) { return v.m * (g + v.a); }, '$N - mg = ma$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Acelerando hacia arriba, la normal supera al peso.') }),
    N('el-baja', 'elevador', 2, { m: [30, 100, 5], a: [0.5, 4, 0.5] }, function (v) { return 'Un elevador acelera hacia abajo a $' + v.a + '\\ \\text{m/s}^2$. ¿Qué normal recibe una persona de $' + v.m + '\\ \\text{kg}$?'; },
      function (v) { return v.m * (g - v.a); }, 'Con $a$ negativa: $N = m(g - a)$.', { unit: 'N', mistakes: { plusA: function (v) { return v.m * (g + v.a); } }, feedback: fb('plusA', 'La aceleración apunta hacia abajo: la normal es menor que el peso.') }),
    N('el-constante', 'elevador', 2, { m: [30, 100, 5], v: [1, 5, 0.5] }, function (v) { return 'Un elevador sube a velocidad constante de $' + v.v + '\\ \\text{m/s}$. ¿Qué normal recibe una persona de $' + v.m + '\\ \\text{kg}$?'; },
      function (v) { return v.m * g; }, 'Velocidad constante: $a = 0$ y $N = mg$.', { unit: 'N' }),
    N('el-a', 'elevador', 3, { m: [40, 100, 5], Nb: [200, 1300, 10] }, function (v) { return 'Una báscula en un elevador marca $' + v.Nb + '\\ \\text{N}$ bajo una persona de $' + v.m + '\\ \\text{kg}$. ¿Cuál es la aceleración del elevador (positiva hacia arriba)?'; },
      function (v) { return v.Nb / v.m - g; }, '$a = N/m - g$.', { unit: 'm/s²', tol: EX, where: function (v) { return Math.abs(v.Nb / v.m - g) > 0.3 && Math.abs(v.Nb / v.m - g) < 6; } }),
    N('el-kg', 'elevador', 2, { m: [40, 100, 5], a: [0.5, 4, 0.5] }, function (v) { return 'Una báscula calibrada en kg marca $N/g$. ¿Qué marca para una persona de $' + v.m + '\\ \\text{kg}$ en un elevador que acelera hacia arriba a $' + v.a + '\\ \\text{m/s}^2$?'; },
      function (v) { return v.m * (g + v.a) / g; }, 'Marca $m(g + a)/g$: más que la masa real.', { unit: 'kg' }),
    N('el-libre', 'elevador', 1, { m: [40, 100, 5] }, function (v) { return 'Si el cable de un elevador se rompe y cae libremente, ¿qué normal recibe una persona de $' + v.m + '\\ \\text{kg}$ que va dentro?'; },
      function () { return 0; }, 'Con $a = -g$: $N = m(g - g) = 0$. Se siente sin peso.', { unit: 'N', tol: EX }),
    N('el-cable', 'elevador', 2, { M: [400, 1500, 50], a: [0.5, 3, 0.5] }, function (v) { return 'Un elevador cargado de $' + v.M + '\\ \\text{kg}$ acelera hacia arriba a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuál es la tensión del cable?'; },
      function (v) { return v.M * (g + v.a); }, '$T - Mg = Ma$.', { unit: 'N' }),
    N('el-max', 'elevador', 3, { Tmax: [6000, 20000, 500], m: [300, 1200, 50] }, function (v) { return 'El cable de un elevador de $' + v.m + '\\ \\text{kg}$ aguanta hasta $' + v.Tmax + '\\ \\text{N}$. ¿Cuál es la máxima aceleración hacia arriba que puede tener?'; },
      function (v) { return v.Tmax / v.m - g; }, '$a_{máx} = T_{máx}/m - g$.', { unit: 'm/s²', where: function (v) { return v.Tmax / v.m - g > 0.5; }, mistakes: { noG: function (v) { return v.Tmax / v.m; } }, feedback: fb('noG', 'Parte de la tensión solo sostiene el peso: resta $g$.') }),

    /* ---------------- Varias fuerzas por componentes ---------------- */
    N('co-perp-a', 'componentes', 2, { F1: [5, 50, 1], F2: [5, 50, 1], m: [1, 20, 1] }, function (v) { return 'Dos fuerzas perpendiculares de $' + v.F1 + '$ y $' + v.F2 + '\\ \\text{N}$ actúan sobre un disco de $' + v.m + '\\ \\text{kg}$ en hielo liso. ¿Qué aceleración tiene?'; },
      function (v) { return Math.hypot(v.F1, v.F2) / v.m; }, 'Fuerza neta por Pitágoras y luego $a = F/m$.', { unit: 'm/s²', mistakes: { added: function (v) { return (v.F1 + v.F2) / v.m; } }, feedback: fb('added', 'Son perpendiculares: se suman como vectores.') }),
    N('co-x', 'componentes', 2, { F1: [5, 40, 1], F2: [5, 40, 1], F3: [5, 40, 1], b: [100, 170, 10] }, function (v) { return 'Sobre un bloque actúan $' + v.F1 + '\\ \\text{N}$ a $0^\\circ$, $' + v.F2 + '\\ \\text{N}$ a $90^\\circ$ y $' + v.F3 + '\\ \\text{N}$ a $' + v.b + '^\\circ$. ¿Cuánto vale $\\Sigma F_x$?'; },
      function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).x; }, 'Suma $F\\cos\\theta$ de cada fuerza.', { unit: 'N', tol: { abs: 0.05 } }),
    N('co-mag', 'componentes', 2, { F1: [5, 40, 1], F2: [5, 40, 1], F3: [5, 40, 1], b: [190, 260, 10] }, function (v) { return 'Tres fuerzas de $' + v.F1 + '\\ \\text{N}$ ($0^\\circ$), $' + v.F2 + '\\ \\text{N}$ ($90^\\circ$) y $' + v.F3 + '\\ \\text{N}$ ($' + v.b + '^\\circ$) actúan sobre un cuerpo. ¿Cuánto mide la fuerza neta?'; },
      function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).mag; }, 'Componentes y luego Pitágoras.', { unit: 'N', where: function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).mag > 1; } }),
    N('co-ang', 'componentes', 3, { F1: [5, 40, 1], F2: [5, 40, 1], F3: [5, 40, 1], b: [120, 170, 10] }, function (v) { return 'Con $' + v.F1 + '\\ \\text{N}$ a $0^\\circ$, $' + v.F2 + '\\ \\text{N}$ a $90^\\circ$ y $' + v.F3 + '\\ \\text{N}$ a $' + v.b + '^\\circ$, ¿hacia qué ángulo (desde $+x$) acelera el cuerpo?'; },
      function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).ang; }, 'La aceleración apunta como la fuerza neta; cuida el cuadrante.', { unit: '°', tol: { abs: 0.5 }, where: function (v) { var s = sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]); return s.mag > 2 && Math.abs(s.x) > 1; } }),
    N('co-angulo-entre', 'componentes', 3, { F1: [5, 40, 1], F2: [5, 40, 1], phi: [20, 160, 10], m: [1, 20, 1] }, function (v) { return 'Dos cuerdas jalan un trineo de $' + v.m + '\\ \\text{kg}$ sobre hielo con $' + v.F1 + '$ y $' + v.F2 + '\\ \\text{N}$, formando $' + v.phi + '^\\circ$ entre ellas. ¿Qué aceleración tiene?'; },
      function (v) { return Math.sqrt(v.F1 * v.F1 + v.F2 * v.F2 + 2 * v.F1 * v.F2 * Math.cos(v.phi * RAD)) / v.m; }, 'Pon una cuerda en $0^\\circ$ y la otra en $\\varphi$; suma componentes.', { unit: 'm/s²' }),
    N('co-equilibrio', 'componentes', 1, { P: [5, 50, 1], Qf: [5, 50, 1] }, function (v) { return 'Dos fuerzas perpendiculares de $' + v.P + '$ y $' + v.Qf + '\\ \\text{N}$ actúan sobre un anillo. ¿Qué magnitud debe tener una tercera fuerza para dejarlo en equilibrio?'; },
      function (v) { return Math.hypot(v.P, v.Qf); }, 'La tercera cancela la resultante de las otras dos.', { unit: 'N' }),
    N('co-tercera-x', 'componentes', 2, { F1: [5, 40, 1], F2: [5, 40, 1], b: [100, 170, 10] }, function (v) { return 'Un cuerpo está en equilibrio bajo tres fuerzas: $' + v.F1 + '\\ \\text{N}$ a $0^\\circ$, $' + v.F2 + '\\ \\text{N}$ a $' + v.b + '^\\circ$ y $\\vec{F}_3$. ¿Cuánto vale la componente $x$ de $\\vec{F}_3$?'; },
      function (v) { return -sum([[v.F1, 0], [v.F2, v.b]]).x; }, '$F_{3x} = -(F_{1x} + F_{2x})$.', { unit: 'N', tol: { abs: 0.05 }, where: function (v) { return Math.abs(sum([[v.F1, 0], [v.F2, v.b]]).x) > 1; } }),
    N('co-disco', 'componentes', 2, { F1: [5, 30, 1], a1: [0, 80, 10], F2: [5, 30, 1], a2: [100, 260, 20], m: [1, 10, 0.5] }, function (v) { return 'Sobre un disco de $' + v.m + '\\ \\text{kg}$ en hielo liso actúan $' + v.F1 + '\\ \\text{N}$ a $' + v.a1 + '^\\circ$ y $' + v.F2 + '\\ \\text{N}$ a $' + v.a2 + '^\\circ$. ¿Cuánto vale la magnitud de su aceleración?'; },
      function (v) { return sum([[v.F1, v.a1], [v.F2, v.a2]]).mag / v.m; }, 'Suma las fuerzas por componentes y divide entre $m$.', { unit: 'm/s²', where: function (v) { return sum([[v.F1, v.a1], [v.F2, v.a2]]).mag > 1; } }),

    /* ---------------- DCL: contar fuerzas ---------------- */
    N('dc-libro', 'dcl', 1, {}, function () { return '¿Cuántas fuerzas actúan sobre un libro en reposo sobre una mesa horizontal?'; },
      function () { return 2; }, 'Su peso y la normal de la mesa.', { tol: EX }),
    N('dc-caja', 'dcl', 2, {}, function () { return 'Empujas horizontalmente una caja que desliza por un piso con fricción. ¿Cuántas fuerzas actúan sobre la caja?'; },
      function () { return 4; }, 'Peso, normal, tu empujón y la fricción.', { tol: EX }),
    N('dc-lampara', 'dcl', 2, {}, function () { return 'Una lámpara cuelga de dos cables inclinados. ¿Cuántas fuerzas actúan sobre la lámpara?'; },
      function () { return 3; }, 'Su peso y una tensión por cada cable.', { tol: EX }),

    /* ---------------- Primera y tercera ley ---------------- */
    N('le-pared', 'leyes', 2, { F: [10, 300, 10] }, function (v) { return 'Empujas una pared con $' + v.F + '\\ \\text{N}$. ¿Con qué fuerza te empuja la pared a ti?'; },
      function (v) { return v.F; }, 'Tercera ley: igual y opuesta.', { unit: 'N' }),
    N('le-patinadores', 'leyes', 2, { m1: [30, 90, 5], a1: [0.5, 4, 0.5], m2: [30, 90, 5] }, function (v) { return 'Dos patinadores se empujan. El de $' + v.m1 + '\\ \\text{kg}$ sale con $' + v.a1 + '\\ \\text{m/s}^2$. ¿Qué aceleración tiene el de $' + v.m2 + '\\ \\text{kg}$?'; },
      function (v) { return v.m1 * v.a1 / v.m2; }, 'Misma fuerza sobre los dos: $m_1a_1 = m_2a_2$.', { unit: 'm/s²', where: function (v) { return v.m1 !== v.m2; }, mistakes: { same: function (v) { return v.a1; } }, feedback: fb('same', 'La fuerza es la misma, no la aceleración: el más pesado acelera menos.') }),
    N('le-tierra', 'leyes', 3, { m: [0.5, 10, 0.5] }, function (v) { return 'Una pelota de $' + v.m + '\\ \\text{kg}$ cae hacia la Tierra ($5.97\\times 10^{24}\\ \\text{kg}$). ¿Con qué aceleración "cae" la Tierra hacia la pelota? (Puedes escribir en notación <code>1e-24</code>.)'; },
      function (v) { return v.m * g / 5.97e24; }, 'La pelota jala a la Tierra con $mg$: $a = mg/M_T$, diminuta.', { unit: 'm/s²' }),

    /* ---------------- Más práctica ---------------- */
    N('se-contacto', 'segunda', 3, { F: [10, 120, 5], m1: [1, 20, 1], m2: [1, 20, 1] }, function (v) { return 'Empujas con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m1 + '\\ \\text{kg}$ que a su vez empuja otra de $' + v.m2 + '\\ \\text{kg}$, sobre un piso liso. ¿Con qué fuerza empuja la primera caja a la segunda?'; },
      function (v) { return v.m2 * v.F / (v.m1 + v.m2); }, 'Las dos aceleran con $a = F/(m_1 + m_2)$; a la segunda solo la empuja la primera: $m_2a$.', { unit: 'N', where: function (v) { return v.m1 !== v.m2; }, mistakes: { gaveF: function (v) { return v.F; } }, feedback: fb('gaveF', 'Tu fuerza acelera a las dos cajas; a la segunda le llega solo $m_2a$.') }),
    N('se-tiempo', 'segunda', 2, { m: [1, 50, 1], v: [2, 30, 1], F: [5, 200, 5] }, function (v) { return '¿Cuánto tarda una fuerza neta de $' + v.F + '\\ \\text{N}$ en llevar un cuerpo de $' + v.m + '\\ \\text{kg}$ del reposo a $' + v.v + '\\ \\text{m/s}$?'; },
      function (v) { return v.m * v.v / v.F; }, '$a = F/m$ y $t = v/a$.', { unit: 's' }),
    N('se-media', 'segunda', 2, { m: [0.1, 2, 0.1], v1: [2, 20, 1], v2: [21, 50, 1], t: [0.05, 0.5, 0.05] }, function (v) { return 'Una raqueta cambia la rapidez de una pelota de $' + v.m + '\\ \\text{kg}$ de $' + v.v1 + '$ a $' + v.v2 + '\\ \\text{m/s}$ (mismo sentido) en $' + v.t + '\\ \\text{s}$. ¿Qué fuerza media aplicó?'; },
      function (v) { return v.m * (v.v2 - v.v1) / v.t; }, '$F = m\\,\\Delta v/\\Delta t$.', { unit: 'N' }),
    N('se-dos-cuerdas', 'segunda', 3, { T: [50, 400, 10], th: [10, 50, 5], m: [50, 500, 10] }, function (v) { return 'Dos cuerdas jalan una lancha de $' + v.m + '\\ \\text{kg}$, cada una con $' + v.T + '\\ \\text{N}$ y a $' + v.th + '^\\circ$ a cada lado de la proa. Sin resistencia del agua, ¿qué aceleración tiene?'; },
      function (v) { return 2 * v.T * Math.cos(v.th * RAD) / v.m; }, 'Las componentes laterales se cancelan; hacia adelante quedan $2T\\cos\\theta$.', { unit: 'm/s²', mistakes: { full: function (v) { return 2 * v.T / v.m; } }, feedback: fb('full', 'Solo $T\\cos\\theta$ de cada cuerda jala hacia adelante.') }),
    N('pe-empuja-angulo', 'peso', 2, { m: [5, 30, 1], F: [10, 100, 5], th: [15, 60, 5] }, function (v) { return 'Empujas una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ dirigidos $' + v.th + '^\\circ$ por debajo de la horizontal. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g + v.F * Math.sin(v.th * RAD); }, '$N = mg + F\\sin\\theta$: empujar hacia abajo aprieta la caja.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'La componente vertical de tu empujón aumenta la normal.') }),
    N('el-cable-baja', 'elevador', 2, { M: [400, 1500, 50], a: [0.5, 3, 0.5] }, function (v) { return 'Un elevador de $' + v.M + '\\ \\text{kg}$ acelera hacia abajo a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuál es la tensión del cable?'; },
      function (v) { return v.M * (g - v.a); }, '$T - Mg = M(-a)$.', { unit: 'N', mistakes: { plusA: function (v) { return v.M * (g + v.a); } }, feedback: fb('plusA', 'Acelerando hacia abajo, el cable sostiene menos que el peso.') }),
    N('co-tres-a', 'componentes', 3, { F1: [5, 40, 1], F2: [5, 40, 1], F3: [5, 40, 1], b: [190, 260, 10], m: [1, 10, 0.5] }, function (v) { return 'Sobre un disco de $' + v.m + '\\ \\text{kg}$ en hielo liso actúan $' + v.F1 + '\\ \\text{N}$ ($0^\\circ$), $' + v.F2 + '\\ \\text{N}$ ($90^\\circ$) y $' + v.F3 + '\\ \\text{N}$ ($' + v.b + '^\\circ$). ¿Qué aceleración tiene?'; },
      function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).mag / v.m; }, 'Fuerza neta por componentes; luego $a = F/m$.', { unit: 'm/s²', where: function (v) { return sum([[v.F1, 0], [v.F2, 90], [v.F3, v.b]]).mag > 1; } }),
    N('le-astronauta', 'leyes', 2, { m1: [60, 120, 5], m2: [5, 300, 5] }, function (v) { return 'En el espacio, un astronauta de $' + v.m1 + '\\ \\text{kg}$ empuja una caja de $' + v.m2 + '\\ \\text{kg}$. ¿Cuántas veces es mayor la aceleración de la caja que la del astronauta?'; },
      function (v) { return v.m1 / v.m2; }, 'Misma fuerza: $a_{caja}/a_{astronauta} = m_{astronauta}/m_{caja}$.', { where: function (v) { return v.m1 !== v.m2; }, mistakes: { inverted: function (v) { return v.m2 / v.m1; } }, feedback: fb('inverted', 'El más ligero acelera más: la razón es $m_1/m_2$.') }),
    N('dc-rampa-cuerda', 'dcl', 2, {}, function () { return 'Un bloque está en reposo sobre una rampa sin fricción, sujeto por una cuerda paralela a la rampa. ¿Cuántas fuerzas actúan sobre él?'; },
      function () { return 3; }, 'Peso, normal y tensión.', { tol: EX }),

    /* ---------------- Conceptuales ---------------- */
    C('k-inercia', 'leyes', 1, 'La primera ley de Newton dice que un cuerpo sin fuerza neta…', 'mantiene su velocidad constante (o sigue en reposo)', [['se detiene poco a poco'], ['acelera en la dirección en que se mueve'], ['siempre está en reposo']], 'La inercia mantiene la velocidad; no hace falta una fuerza para moverse.'),
    C('k-mantener', 'leyes', 2, 'Para que un disco siga deslizando a velocidad constante sobre hielo perfectamente liso hace falta…', 'ninguna fuerza neta', [['una fuerza constante hacia adelante'], ['una fuerza que crezca con el tiempo'], ['una fuerza igual a su peso']], 'Sin fricción, la velocidad no cambia sola.'),
    C('k-reposo', 'leyes', 2, 'Si un cuerpo está en reposo, la fuerza neta sobre él es…', 'cero', [['igual a su peso'], ['igual a la normal'], ['positiva']], 'Sin aceleración, $\\Sigma\\vec{F} = \\vec{0}$.'),
    C('k-frenon', 'leyes', 1, 'Un camión frena de golpe y los pasajeros se van hacia adelante. ¿Por qué?', 'Por inercia: sus cuerpos tienden a seguir a la misma velocidad', [['Una fuerza los empuja hacia adelante'], ['El camión los jala'], ['La gravedad cambia de dirección']], 'Nada los empuja hacia adelante; el camión frena y ellos siguen.'),
    C('k-direccion-a', 'leyes', 2, 'La aceleración de un cuerpo apunta…', 'en la dirección de la fuerza neta', [['en la dirección de la velocidad'], ['en la dirección de la fuerza más grande'], ['siempre hacia abajo']], '$\\vec{a} = \\Sigma\\vec{F}/m$.'),
    C('k-doble-F', 'leyes', 1, 'Si duplicas la fuerza neta sobre un cuerpo, su aceleración…', 'se duplica', [['se cuadruplica'], ['no cambia'], ['se reduce a la mitad']], '$a \\propto F$.'),
    C('k-pares', 'leyes', 2, 'Las dos fuerzas de un par acción-reacción…', 'actúan sobre cuerpos distintos', [['actúan sobre el mismo cuerpo y se cancelan'], ['tienen distinta magnitud'], ['apuntan en la misma dirección']], 'Por eso no se cancelan entre sí.'),
    C('k-caballo', 'leyes', 3, 'Un caballo jala una carreta y la carreta jala al caballo con la misma fuerza. ¿Cómo se mueven?', 'Se mueven porque el caballo empuja el suelo y el suelo lo empuja hacia adelante', [['No pueden moverse: las fuerzas se cancelan'], ['Solo si el caballo jala más fuerte que la carreta'], ['Solo si la carreta es más ligera que el caballo']], 'Las fuerzas del par actúan sobre cuerpos distintos; al caballo lo mueve la fricción del suelo.'),
    C('k-mosquito', 'leyes', 2, 'Un mosquito choca con el parabrisas de un camión. ¿Quién recibe la fuerza mayor?', 'Los dos reciben la misma fuerza', [['El mosquito'], ['El camión'], ['Ninguno recibe fuerza']], 'Tercera ley; lo distinto es la aceleración.'),
    C('k-newton-u', 'leyes', 1, 'Un newton es…', '$1\\ \\text{kg·m/s}^2$', [['$1\\ \\text{kg·m/s}$'], ['$1\\ \\text{kg}$'], ['$9.81\\ \\text{kg}$']], 'Fuerza = masa por aceleración.'),
    C('k-inercia-masa', 'leyes', 2, 'La masa de un cuerpo mide…', 'qué tanto se resiste a cambiar su velocidad', [['qué tan rápido cae'], ['cuánto pesa en cualquier planeta'], ['su volumen']], 'Es la medida de la inercia.'),
    C('k-espacio', 'leyes', 3, 'En el espacio, lejos de todo, empujas un satélite enorme. ¿Qué pasa?', 'Se mueve, pero acelera muy poco por su gran masa', [['No se mueve porque no pesa nada'], ['Sale disparado porque no tiene peso'], ['Solo se mueve si hay gravedad']], 'Sin peso sigue teniendo masa: inercia.'),
    C('k-luna-masa', 'peso', 1, 'Al llevar un objeto a la Luna, su masa…', 'no cambia', [['disminuye'], ['aumenta'], ['se vuelve cero']], 'Cambia el peso, no la masa.'),
    C('k-peso-unidad', 'peso', 1, 'El peso se mide en…', 'newtons', [['kilogramos'], ['metros por segundo cuadrado'], ['joules']], 'Es una fuerza.'),
    C('k-normal-dir', 'peso', 1, 'La fuerza normal siempre es…', 'perpendicular a la superficie de contacto', [['vertical hacia arriba'], ['igual al peso'], ['paralela a la superficie']], 'Solo es vertical si la superficie es horizontal.'),
    C('k-normal-mg', 'peso', 2, '¿En cuál caso la normal NO es igual a $mg$?', 'Una caja jalada con una cuerda inclinada hacia arriba', [['Un libro en reposo sobre una mesa'], ['Una caja empujada horizontalmente'], ['Una persona en un elevador a velocidad constante']], 'La componente vertical de la cuerda cambia la normal.'),
    C('k-reaccion-peso', 'peso', 3, 'Un libro descansa en una mesa. ¿Cuál es la reacción (tercera ley) a su peso?', 'La fuerza con que el libro atrae a la Tierra', [['La normal de la mesa'], ['La fricción'], ['No tiene reacción']], 'El peso es la atracción Tierra→libro; su par es libro→Tierra. La normal es otro par.'),
    C('k-normal-par', 'peso', 3, 'El peso de un libro y la normal de la mesa…', 'son iguales en este caso, pero no son un par de acción-reacción', [['son un par de acción-reacción'], ['siempre son iguales'], ['apuntan hacia el mismo lado']], 'Actúan sobre el mismo cuerpo y tienen orígenes distintos.'),
    C('k-kg', 'peso', 2, 'Si una etiqueta dice "5 kg", indica…', 'la masa', [['el peso'], ['la fuerza normal'], ['el volumen']], 'kg es unidad de masa.'),
    C('k-bascula', 'peso', 2, 'Una báscula de baño mide…', 'la fuerza normal con que te sostiene', [['tu masa directamente'], ['la gravedad'], ['tu volumen']], 'Por eso marca distinto en un elevador que acelera.'),
    C('k-dcl-que', 'dcl', 1, 'En el diagrama de cuerpo libre de un objeto se dibujan…', 'solo las fuerzas que actúan sobre ese objeto', [['las fuerzas que el objeto ejerce sobre otros'], ['todas las fuerzas del sistema'], ['la velocidad y la aceleración']], 'Las que él ejerce van en el DCL de los otros cuerpos.'),
    C('k-movimiento', 'dcl', 1, 'Una pelota sube después de lanzarla. En su DCL, ¿qué fuerzas hay (sin aire)?', 'Solo el peso', [['El peso y la fuerza del lanzamiento'], ['La fuerza del movimiento hacia arriba'], ['Ninguna']], 'Tu mano ya no la toca.'),
    C('k-cuerda', 'dcl', 1, 'Una cuerda tensa ejerce sobre un objeto una fuerza que…', 'jala a lo largo de la cuerda', [['empuja hacia el objeto'], ['es perpendicular a la cuerda'], ['siempre es vertical']], 'Las cuerdas solo jalan.'),
    C('k-friccion-dir', 'dcl', 1, 'La fricción cinética sobre un objeto que desliza apunta…', 'contra el deslizamiento', [['en la dirección del movimiento'], ['hacia abajo'], ['perpendicular a la superficie']], 'Se opone al movimiento relativo.'),
    C('k-auto-constante', 'dcl', 2, 'Un auto va por la carretera a velocidad constante. En su DCL, la suma de fuerzas es…', 'cero', [['hacia adelante'], ['hacia atrás'], ['igual a su peso']], 'Velocidad constante: $a = 0$; el motor compensa la resistencia.'),
    C('k-ejes', 'dcl', 2, 'Conviene elegir los ejes de modo que…', 'uno apunte en la dirección de la aceleración', [['siempre sean horizontal y vertical'], ['ninguna fuerza quede sobre un eje'], ['el peso sea positivo']], 'Así una de las ecuaciones da cero.'),
    C('k-paracaidista', 'dcl', 3, 'Un paracaidista cae a velocidad constante (velocidad terminal). La fuerza del aire sobre él es…', 'igual a su peso', [['mayor que su peso'], ['menor que su peso'], ['cero']], 'Velocidad constante: fuerza neta cero.'),
    C('k-pared', 'dcl', 3, 'Presionas un libro contra una pared vertical y no cae. ¿Qué fuerza sostiene su peso?', 'La fricción estática de la pared', [['La normal de la pared'], ['Tu empujón horizontal'], ['Ninguna: no pesa']], 'La normal es horizontal; la fricción, vertical.'),
    C('k-donde', 'dcl', 1, 'En un DCL sencillo, el cuerpo se representa…', 'como un punto o una caja con las fuerzas saliendo de él', [['con todo su entorno'], ['sin ejes ni fuerzas'], ['solo con su velocidad']], 'Se aísla el cuerpo.'),
    C('k-tension-dir', 'dcl', 2, 'Un bloque cuelga de una cuerda. En su DCL la tensión apunta…', 'hacia arriba, a lo largo de la cuerda', [['hacia abajo'], ['horizontal'], ['hacia el bloque, desde arriba']], 'La cuerda jala al bloque hacia el techo.'),
    C('k-fuerza-quien', 'dcl', 2, 'Para cada fuerza del DCL debes poder decir…', 'qué otro cuerpo la ejerce', [['qué tan rápido se mueve el cuerpo'], ['su dirección de movimiento'], ['su energía']], 'Si no hay responsable, esa fuerza no existe.'),
    C('k-mas-fuerzas', 'dcl', 2, 'Un bloque desliza hacia abajo por una rampa con fricción. ¿Qué fuerzas actúan sobre él?', 'Peso, normal y fricción', [['Peso, normal, fricción y la fuerza de la rampa hacia abajo'], ['Peso y fricción'], ['Normal y fricción']], 'La componente del peso ya es la que lo jala hacia abajo.'),
    C('k-ascensor-v', 'elevador', 1, 'En un elevador que sube a velocidad constante, la báscula marca…', 'tu peso normal', [['más que tu peso'], ['menos que tu peso'], ['cero']], 'Sin aceleración, $N = mg$.'),
    C('k-frena-sube', 'elevador', 2, 'Un elevador que sube empieza a frenar. Durante el frenado, la báscula marca…', 'menos que tu peso', [['más que tu peso'], ['tu peso'], ['cero']], 'Frenar al subir es aceleración hacia abajo.'),
    C('k-arranca-baja', 'elevador', 2, 'Un elevador arranca hacia abajo desde el reposo. La báscula marca…', 'menos que tu peso', [['más que tu peso'], ['tu peso'], ['el doble de tu peso']], 'Acelera hacia abajo: $N = m(g - a)$.'),
    C('k-frena-baja', 'elevador', 3, 'Un elevador que baja empieza a frenar para detenerse. La báscula marca…', 'más que tu peso', [['menos que tu peso'], ['tu peso'], ['cero']], 'Frenar al bajar es aceleración hacia arriba.'),
    C('k-roto', 'elevador', 2, 'Si el elevador cae libremente, la báscula marca…', 'cero', [['tu peso'], ['el doble de tu peso'], ['un número negativo']], 'Todo cae con $g$: no hay normal.'),
    C('k-peso-real', 'elevador', 2, 'En un elevador que acelera hacia arriba, tu peso real $mg$…', 'no cambia; lo que cambia es la normal', [['aumenta'], ['disminuye'], ['se vuelve cero']], 'La gravedad no depende del elevador.'),
    C('k-arriba-a', 'elevador', 1, 'Un elevador acelera hacia arriba. La normal sobre ti es…', 'mayor que tu peso', [['menor que tu peso'], ['igual a tu peso'], ['cero']], '$N = m(g + a)$.'),
    C('k-componentes', 'componentes', 1, 'La segunda ley se aplica por componentes así:', '$\\Sigma F_x = ma_x$ y $\\Sigma F_y = ma_y$', [['$\\Sigma F = m(a_x + a_y)$'], ['$F_x + F_y = ma$'], ['$\\Sigma F_x = ma_y$']], 'Una ecuación por eje.'),
    C('k-perp-suma', 'componentes', 1, 'Dos fuerzas perpendiculares de 3 N y 4 N dan una fuerza neta de…', '5 N', [['7 N'], ['1 N'], ['12 N']], 'Pitágoras.'),
    C('k-equilibrio', 'componentes', 1, 'Un cuerpo está en equilibrio cuando…', 'la suma de fuerzas es cero', [['no hay fuerzas'], ['solo actúa su peso'], ['se mueve muy lento']], 'Puede haber muchas fuerzas que se cancelan.'),
    C('k-a-apunta', 'componentes', 2, 'Sobre un cuerpo actúan 10 N hacia el este y 10 N hacia el norte. Su aceleración apunta…', 'hacia el noreste', [['hacia el este'], ['hacia el norte'], ['no acelera']], 'Hacia donde apunta la fuerza neta, a $45^\\circ$.'),
    C('k-tres-equilibrio', 'componentes', 2, 'Tres fuerzas dejan un cuerpo en equilibrio. Cualquiera de ellas es igual a…', 'la suma de las otras dos, con signo contrario', [['la suma de las otras dos'], ['cero'], ['la más grande de las otras dos']], '$\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)$.'),
    C('k-iguales-opuestas', 'componentes', 1, 'Dos fuerzas iguales y opuestas sobre el mismo cuerpo…', 'se cancelan: la fuerza neta es cero', [['forman un par de la tercera ley'], ['lo aceleran al doble'], ['lo hacen girar siempre']], 'Sobre el mismo cuerpo sí se suman (y se cancelan).'),
    C('k-perp-v', 'componentes', 3, 'Una fuerza siempre perpendicular a la velocidad de un cuerpo…', 'cambia su dirección pero no su rapidez', [['aumenta su rapidez'], ['lo frena'], ['no hace nada']], 'Es el caso del movimiento circular (S07 y S11).')
  ];

  K.register({
    'f1.S08.leyes': 'Primera y tercera ley',
    'f1.S08.segunda': 'Segunda ley',
    'f1.S08.peso': 'Masa, peso y normal',
    'f1.S08.dcl': 'Diagrama de cuerpo libre',
    'f1.S08.elevador': 'Elevador y peso aparente',
    'f1.S08.componentes': 'Varias fuerzas por componentes'
  }, Q);
})();
