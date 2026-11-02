/* =====================================================================
   Formulario de Cálculo 3 (ecuaciones diferenciales). Cada sección enlaza a la
   sesión donde se explica. Algunas fórmulas llevan una comprobación numérica que
   corre en scripts/formulario.test.js (la variable es x; lo demás, valores fijos):
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   Las piezas largas van separadas por ",\quad" o ":\quad" para que en celular se
   acomoden en varios renglones (shared/js/formulario.js).
   ===================================================================== */
(function () {
  window.FORMULARIO = {
    code: 'c3', course: 'calculo-3', title: 'Formulario de Cálculo 3',
    sections: [
      {
        title: 'Conceptos básicos', sessions: [1], items: [
          { label: 'Lineal de orden n', tex: "a_ny^{(n)} + \\dots + a_1y' + a_0y = g(x)", s: 1 },
          { label: 'PVI', tex: "y' = f(x,y),\\quad y(x_0) = y_0", s: 1 },
          { label: 'Existencia y unicidad', tex: 'f,\\ f_y\\ \\text{continuas en}\\ (x_0,y_0):\\quad \\text{solución única}', s: 1 }
        ]
      },
      {
        title: 'Separables y cambios de variable', sessions: [2, 3], items: [
          { label: 'Separable', tex: '\\dfrac{dy}{dx} = g(x)h(y):\\quad \\int\\dfrac{dy}{h(y)} = \\int g\\,dx', s: 2, check: { i: ['2*x', 'x^2'] } },
          { label: 'Crecimiento y decaimiento', tex: "N' = kN,\\quad N = N_0e^{kt},\\quad T_{1/2} = \\dfrac{\\ln 2}{k}", s: 2, check: { d: ['3*e^(0.5*x)', '0.5*3*e^(0.5*x)'] } },
          { label: 'Enfriamiento de Newton', tex: 'T = T_a + (T_0 - T_a)e^{-kt}', s: 2, check: { d: ['20 + 50*e^(-0.3*x)', '-0.3*(20 + 50*e^(-0.3*x) - 20)'] } },
          { label: 'Homogénea', tex: "y' = F(y/x):\\quad y = ux,\\quad y' = u + xu',\\quad \\dfrac{du}{F(u) - u} = \\dfrac{dx}{x}", s: 3 },
          { label: 'Combinación lineal', tex: "y' = G(ax + by + c):\\quad u = ax + by + c,\\quad u' = a + bG(u)", s: 3 }
        ]
      },
      {
        title: 'Lineales de primer orden y Bernoulli', sessions: [4, 5], items: [
          { label: 'Forma estándar', tex: "y' + P(x)\\,y = Q(x)", s: 4 },
          { label: 'Factor integrante', tex: '\\mu = e^{\\int P\\,dx},\\quad y = \\dfrac{1}{\\mu}\\left(\\int\\mu Q\\,dx + C\\right)', s: 4, check: { d: ['e^(x^2)', '2*x*e^(x^2)'] } },
          { label: 'Tanque', tex: "A' = r_{in}c_{in} - r_{out}\\dfrac{A}{V},\\quad V = V_0 + (r_{in} - r_{out})t", s: 4 },
          { label: 'Bernoulli', tex: "y' + Py = Qy^n:\\quad v = y^{1-n},\\quad v' + (1-n)Pv = (1-n)Q", s: 5 },
          { label: 'Logística', tex: "P' = rP\\left(1 - \\dfrac{P}{K}\\right),\\quad P = \\dfrac{K}{1 + \\left(\\frac{K}{P_0} - 1\\right)e^{-rt}}", s: 5, check: { d: ['10/(1 + 4*e^(-x))', '0.1*(10/(1 + 4*e^(-x)))*(10 - 10/(1 + 4*e^(-x)))'] } }
        ]
      },
      {
        title: 'Exactas y factor integrante', sessions: [6, 7], items: [
          { label: 'Exactitud', tex: 'M\\,dx + N\\,dy = 0\\ \\text{exacta}:\\quad M_y = N_x', s: 6 },
          { label: 'Función potencial', tex: 'F_x = M,\\quad F_y = N,\\quad F = \\int M\\,dx + h(y),\\quad F(x,y) = C', s: 6 },
          { label: 'Factor en x', tex: '\\mu(x) = e^{\\int \\frac{M_y - N_x}{N}dx}', s: 7 },
          { label: 'Factor en y', tex: '\\mu(y) = e^{\\int \\frac{N_x - M_y}{M}dy}', s: 7 }
        ]
      },
      {
        title: 'Modelos de primer orden', sessions: [8], items: [
          { label: 'RC', tex: "Rq' + \\dfrac{q}{C} = \\varepsilon,\\quad q = C\\varepsilon(1 - e^{-t/RC})", s: 8, check: { d: ['6*(1 - e^(-x/2))', '6/2*e^(-x/2)'] } },
          { label: 'RL', tex: "Li' + Ri = \\varepsilon,\\quad i = \\dfrac{\\varepsilon}{R}(1 - e^{-Rt/L})", s: 8 },
          { label: 'Velocidad terminal', tex: "mv' = mg - cv:\\quad v_t = \\dfrac{mg}{c},\\quad mv' = mg - kv^2:\\quad v_t = \\sqrt{\\dfrac{mg}{k}}", s: 8 }
        ]
      },
      {
        title: 'Teoría lineal', sessions: [9], items: [
          { label: 'Superposición', tex: 'L(y_1) = L(y_2) = 0:\\quad L(c_1y_1 + c_2y_2) = 0', s: 9 },
          { label: 'Wronskiano', tex: "W = y_1y_2' - y_1'y_2,\\quad W \\neq 0 \\iff \\text{independientes}", s: 9, check: { eq: ['cos(x)*cos(x) + sin(x)*sin(x)', '1'] } },
          { label: 'Abel', tex: 'W(x) = C\\,e^{-\\int P\\,dx}', s: 9 },
          { label: 'Reducción de orden', tex: 'y_2 = y_1\\int \\dfrac{e^{-\\int P\\,dx}}{y_1^2}\\,dx', s: 9 },
          { label: 'Solución general', tex: 'y = c_1y_1 + \\dots + c_ny_n + y_p', s: 9 }
        ]
      },
      {
        title: 'Coeficientes constantes', sessions: [10, 11], items: [
          { label: 'Característica', tex: "ay'' + by' + cy = 0:\\quad ar^2 + br + c = 0", s: 10 },
          { label: 'Reales distintas', tex: 'y = c_1e^{r_1x} + c_2e^{r_2x}', s: 10 },
          { label: 'Raíz doble', tex: 'y = (c_1 + c_2x)e^{rx}', s: 10, check: { d: ['x*e^(2*x)', 'e^(2*x) + 2*x*e^(2*x)'] } },
          { label: 'Complejas α ± βi', tex: 'y = e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)', s: 10 },
          { label: 'Orden n', tex: 'r\\ \\text{repetida}\\ m\\ \\text{veces}:\\quad e^{rx},\\quad xe^{rx},\\quad \\dots,\\quad x^{m-1}e^{rx}', s: 11 }
        ]
      },
      {
        title: 'No homogéneas', sessions: [12, 13, 14], items: [
          { label: 'Forma de yₚ', tex: 'P_n(x) \\to A_nx^n + \\dots + A_0,\\quad e^{kx} \\to Ae^{kx}', s: 12 },
          { tex: '\\sin\\omega x \\to A\\cos\\omega x + B\\sin\\omega x,\\quad P_n(x)e^{kx} \\to Q_n(x)e^{kx}', s: 12 },
          { label: 'Duplicación', tex: 'y_p = x^s(\\text{propuesta}),\\quad s = \\text{multiplicidad de la raíz}', s: 13 },
          { label: 'Variación de parámetros', tex: "u_1' = -\\dfrac{y_2\\,g}{W},\\quad u_2' = \\dfrac{y_1\\,g}{W},\\quad y_p = u_1y_1 + u_2y_2", s: 14 },
          { label: 'Ojo', tex: "g:\\quad \\text{con coeficiente 1 en}\\ y''", s: 14 }
        ]
      },
      {
        title: 'Resortes y circuitos', sessions: [15], items: [
          { label: 'Modelos', tex: "mx'' + cx' + kx = F(t),\\quad Lq'' + Rq' + \\dfrac{q}{C} = E(t)", s: 15 },
          { label: 'Frecuencia natural', tex: '\\omega_0 = \\sqrt{k/m} = 1/\\sqrt{LC}', s: 15, check: { eq: ['sqrt(4*x/x)', '2'] } },
          { label: 'Regímenes', tex: 'c^2 < 4mk:\\ \\text{sub},\\quad c^2 = 4mk:\\ \\text{crítico},\\quad c^2 > 4mk:\\ \\text{sobre}', s: 15 },
          { label: 'Frecuencia amortiguada', tex: '\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2}', s: 15 },
          { label: 'Amplitud forzada', tex: '|x_p| = \\dfrac{F_0}{\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}}', s: 15 },
          { label: 'Resonancia (c = 0)', tex: "x'' + \\omega_0^2x = F_0\\cos\\omega_0t,\\quad x_p = \\dfrac{F_0}{2\\omega_0}t\\sin\\omega_0t", s: 15, check: { eq: ['(2*cos(2*x) - 4*x*sin(2*x)) + 4*(x*sin(2*x))', '2*cos(2*x)'] } }
        ]
      }
    ]
  };
})();
