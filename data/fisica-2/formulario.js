/* =====================================================================
   Formulario de Física 2. Cada sección enlaza a la sesión donde se explica.
   Algunas fórmulas llevan una comprobación numérica que corre en
   scripts/formulario.test.js (la variable es x; lo demás, valores fijos):
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   ===================================================================== */
(function () {
  window.FORMULARIO = {
    code: 'f2', course: 'fisica-2', title: 'Formulario de Física 2',
    sections: [
      {
        title: 'Constantes, carga y Coulomb', sessions: [1, 2], items: [
          { tex: 'k = \\dfrac{1}{4\\pi\\varepsilon_0},\\quad k = 8.99\\times 10^{9}\\ \\text{N·m}^2/\\text{C}^2,\\quad \\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)' },
          { tex: 'e = 1.60\\times 10^{-19}\\ \\text{C},\\quad m_e = 9.11\\times 10^{-31}\\ \\text{kg},\\quad m_p = 1.67\\times 10^{-27}\\ \\text{kg}' },
          { label: 'Prefijos', tex: '\\text{m} = 10^{-3},\\quad \\mu = 10^{-6},\\quad \\text{n} = 10^{-9},\\quad \\text{p} = 10^{-12}' },
          { label: 'Cuantización', tex: 'q = ne', s: 1 },
          { label: 'Ley de Coulomb', tex: 'F = k\\,\\dfrac{|q_1q_2|}{r^2},\\quad \\vec F_{12} = k\\,\\dfrac{q_1q_2}{r^2}\\,\\hat r_{12}', s: 2 },
          { label: 'Fuerza neta cero (cargas del mismo signo)', tex: 'x = \\dfrac{d}{1 + \\sqrt{|q_2|/|q_1|}}', s: 2, check: { eq: ['2/(0.3/(1 + sqrt(x/2)))^2', 'x/(0.3 - 0.3/(1 + sqrt(x/2)))^2'] } }
        ]
      },
      {
        title: 'Campo eléctrico', sessions: [3, 4], items: [
          { label: 'Definición', tex: '\\vec E = \\dfrac{\\vec F}{q_0},\\quad \\vec F = q\\vec E,\\quad a = \\dfrac{|q|E}{m}', s: 3 },
          { label: 'Carga puntual', tex: '\\vec E = \\dfrac{kQ}{r^2}\\,\\hat r,\\quad \\text{sale de } +,\\ \\text{entra a } -', s: 3 },
          { label: 'Distribución continua', tex: '\\vec E = \\int \\dfrac{k\\,dq}{r^2}\\,\\hat r,\\quad dq = \\lambda\\,dx,\\ \\ \\sigma\\,dA,\\ \\ \\rho\\,dV', s: 4 },
          { label: 'Varilla, en su eje', tex: 'E = \\dfrac{kQ}{d\\,(d + L)}', s: 4, check: { eq: ['(1/x - 1/(x + 0.5))/0.5', '1/(x*(x + 0.5))'] } },
          { label: 'Varilla infinita', tex: 'E = \\dfrac{2k\\lambda}{r}', s: 4 },
          { label: 'Anillo, en su eje', tex: 'E_z = \\dfrac{kQz}{(z^2 + R^2)^{3/2}}', s: 4, check: { d: ['-1/sqrt(x^2 + 0.25)', 'x/(x^2 + 0.25)^(3/2)'] } },
          { label: 'Disco, en su eje', tex: 'E = \\dfrac{\\sigma}{2\\varepsilon_0}\\left(1 - \\dfrac{z}{\\sqrt{z^2 + R^2}}\\right)', s: 4, check: { d: ['x - sqrt(x^2 + 0.25)', '1 - x/sqrt(x^2 + 0.25)'] } },
          { label: 'Plano infinito', tex: 'E = \\dfrac{\\sigma}{2\\varepsilon_0}', s: 4 }
        ]
      },
      {
        title: 'Energía y potencial', sessions: [5, 6], items: [
          { label: 'Energía de un par', tex: 'U = \\dfrac{k\\,q_1q_2}{r},\\quad \\text{un término por cada par}', s: 5 },
          { label: 'Potencial', tex: 'V = \\dfrac{U}{q_0},\\quad V_P = \\sum_i \\dfrac{kq_i}{r_i}', s: 5 },
          { label: 'Trabajo del campo', tex: 'W_{A\\to B} = -\\Delta U = -q\\,\\Delta V', s: 5, check: { eq: ['3*(1/0.5 - 1/x)', '-(3/x - 3/0.5)'] } },
          { label: 'Conservación', tex: 'K_A + qV_A = K_B + qV_B,\\quad 1\\ \\text{eV} = 1.60\\times 10^{-19}\\ \\text{J}', s: 5 },
          { label: 'Distribución continua', tex: 'V = \\int \\dfrac{k\\,dq}{r}', s: 6 },
          { label: 'Anillo y disco, en su eje', tex: 'V = \\dfrac{kQ}{\\sqrt{z^2 + R^2}},\\quad V = 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right)', s: 6 },
          { label: 'Varilla, en su eje', tex: 'V = \\dfrac{kQ}{L}\\ln\\left(1 + \\dfrac{L}{d}\\right)', s: 6, check: { eq: ['log(1 + 0.5/x)', 'log(x + 0.5) - log(x)'] } },
          { label: 'Campo desde el potencial', tex: 'E_x = -\\dfrac{\\partial V}{\\partial x},\\quad E_y = -\\dfrac{\\partial V}{\\partial y},\\quad E_z = -\\dfrac{\\partial V}{\\partial z}', s: 6, check: { d: ['-1/x', '1/x^2'] } },
          { tex: '|E| \\approx \\dfrac{|\\Delta V|}{\\Delta s},\\quad \\Delta V = -E\\,d\\cos\\theta\\ \\ (\\vec E\\ \\text{uniforme})', s: 6 }
        ]
      },
      {
        title: 'Flujo y ley de Gauss', sessions: [7, 8], items: [
          { label: 'Flujo', tex: '\\Phi = EA\\cos\\theta,\\quad \\Phi = \\int \\vec E\\cdot d\\vec A', s: 7 },
          { label: 'Carga puntual, cualquier esfera', tex: '\\Phi = \\dfrac{kq}{r^2}\\cdot 4\\pi r^2 = \\dfrac{q}{\\varepsilon_0}', s: 7, check: { eq: ['(1/(4*pi))/x^2*4*pi*x^2', '1'] } },
          { label: 'Ley de Gauss', tex: '\\oint \\vec E\\cdot d\\vec A = \\dfrac{q_{\\text{enc}}}{\\varepsilon_0}', s: 8 },
          { label: 'Esfera de radio R', tex: 'E = \\dfrac{Q}{4\\pi\\varepsilon_0 r^2}\\ \\ (r > R),\\quad E = \\dfrac{Qr}{4\\pi\\varepsilon_0 R^3}\\ \\ (\\text{sólida},\\ r < R)', s: 8, check: { eq: ['x/(4*pi*1.5^3)*4*pi*x^2', 'x^3/1.5^3'] } },
          { label: 'Línea o cilindro', tex: 'E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r} = \\dfrac{2k\\lambda}{r}\\ \\ (r > R),\\quad E = \\dfrac{\\lambda r}{2\\pi\\varepsilon_0 R^2}\\ \\ (\\text{sólido})', s: 8, check: { eq: ['1/(2*pi*x)', '2*(1/(4*pi))/x'] } },
          { label: 'Plano y conductor', tex: 'E = \\dfrac{\\sigma}{2\\varepsilon_0}\\ \\ (\\text{plano}),\\quad E = \\dfrac{\\sigma}{\\varepsilon_0}\\ \\ (\\text{junto a un conductor})', s: 8 },
          { label: 'Conductor en equilibrio', tex: 'E = 0\\ \\text{adentro},\\quad \\vec E \\perp \\text{superficie},\\quad V\\ \\text{constante}', s: 8 }
        ]
      },
      {
        title: 'Capacitores', sessions: [9, 10], items: [
          { label: 'Definición', tex: 'C = \\dfrac{Q}{V},\\quad C = \\kappa\\,C_0', s: 9 },
          { label: 'Placas paralelas y esfera sola', tex: 'C = \\dfrac{\\varepsilon_0 A}{d},\\quad C = 4\\pi\\varepsilon_0 R', s: 9 },
          { label: 'Cilíndrico y esférico', tex: 'C = \\dfrac{2\\pi\\varepsilon_0 L}{\\ln(b/a)},\\quad C = \\dfrac{4\\pi\\varepsilon_0\\,ab}{b - a}', s: 9, check: { eq: ['1/((1/0.1 - 1/(x + 0.2))/(4*pi))', '4*pi*0.1*(x + 0.2)/(x + 0.1)'] } },
          { label: 'Batería', tex: '\\text{conectada: } V\\ \\text{fija};\\quad \\text{desconectada: } Q\\ \\text{fija}', s: 9 },
          { label: 'Paralelo y serie', tex: 'C_{eq} = C_1 + C_2 + \\cdots,\\quad \\dfrac{1}{C_{eq}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2} + \\cdots', s: 10, check: { eq: ['1/(1/x + 1/3)', '3x/(x + 3)'] } },
          { label: 'Energía', tex: 'U = \\int_0^Q \\dfrac{q}{C}\\,dq = \\dfrac{Q^2}{2C},\\quad U = \\tfrac{1}{2}CV^2 = \\tfrac{1}{2}QV', s: 10, check: { i: ['x/2.5', 'x^2/5'] } },
          { label: 'Densidad de energía', tex: 'u = \\tfrac{1}{2}\\varepsilon_0E^2', s: 10 }
        ]
      },
      {
        title: 'Corriente y resistencia', sessions: [11, 12], items: [
          { label: 'Corriente', tex: 'I = \\dfrac{dQ}{dt},\\quad I = nqv_dA,\\quad J = \\dfrac{I}{A}', s: 11 },
          { label: 'Resistencia de un alambre', tex: 'R = \\dfrac{\\rho L}{A},\\quad A = \\dfrac{\\pi d^2}{4},\\quad R = R_0(1 + \\alpha\\,\\Delta T)', s: 11 },
          { label: 'Ohm y potencia', tex: 'V = IR,\\quad P = IV = I^2R = \\dfrac{V^2}{R}', s: 11, check: { eq: ['x*(4x)', '(4x)^2/4'] } },
          { label: 'Energía', tex: 'E = Pt,\\quad 1\\ \\text{kWh} = 3.6\\times 10^{6}\\ \\text{J}', s: 11 },
          { label: 'Serie', tex: 'R_{eq} = R_1 + R_2 + \\cdots,\\quad V_k = V\\,\\dfrac{R_k}{R_{eq}}', s: 12 },
          { label: 'Paralelo', tex: '\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\cdots', s: 12, check: { eq: ['1/(1/x + 1/6)', '6x/(x + 6)'] } },
          { label: 'Fuente real (fem y r)', tex: 'I = \\dfrac{\\varepsilon}{R_{eq} + r},\\quad V = \\varepsilon - Ir,\\quad \\varepsilon I = I^2r + I^2R_{eq}', s: 12, check: { eq: ['12*12/(x + 0.5)', '(12/(x + 0.5))^2*0.5 + (12/(x + 0.5))^2*x'] } },
          { label: 'Potencia máxima en la carga', tex: 'R = r,\\quad P_{\\text{máx}} = \\dfrac{\\varepsilon^2}{4r}', s: 12, check: { eq: ['(12/(x + x))^2*x', '144/(4x)'] } }
        ]
      },
      {
        title: 'Leyes de Kirchhoff', sessions: [13, 14], items: [
          { label: 'Nodos y mallas', tex: '\\sum I_{\\text{entran}} = \\sum I_{\\text{salen}},\\quad \\sum \\Delta V = 0\\ \\ (\\text{vuelta cerrada})', s: 13 },
          { label: 'Signos al recorrer la malla', tex: 'R\\ \\text{a favor de } I\\text{: } -IR,\\quad R\\ \\text{en contra: } +IR,\\quad \\text{batería de } (-) \\text{ a } (+)\\text{: } +\\varepsilon', s: 13 },
          { label: 'Balance de energía', tex: '\\sum \\varepsilon I = \\sum I^2R,\\quad I < 0\\text{: va al revés de tu flecha}', s: 13 },
          { label: 'Cuántas ecuaciones', tex: 'n - 1\\ \\text{de nodo},\\quad b - n + 1\\ \\text{de malla}', s: 14 },
          { label: 'Sistema y Cramer', tex: 'A\\,\\vec I = \\vec b,\\quad I_j = \\dfrac{D_j}{D}', s: 14 },
          { label: 'Corrientes de malla', tex: '\\text{rama compartida: } I_1 - I_2', s: 14 },
          { label: 'Capacitor en estado estable', tex: 'I = 0\\ \\text{en su rama},\\quad Q = CV_{\\text{nodos}}', s: 14 }
        ]
      },
      {
        title: 'Circuito RC', sessions: [15], items: [
          { label: 'Ecuación y constante de tiempo', tex: 'R\\,\\dfrac{dq}{dt} + \\dfrac{q}{C} = \\varepsilon,\\quad \\tau = RC,\\quad \\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}' },
          { label: 'Al cerrar y al final (carga)', tex: 'i(0) = \\dfrac{\\varepsilon}{R}\\ \\ (\\text{cable}),\\quad i(\\infty) = 0,\\ \\ V_C = \\varepsilon\\ \\ (\\text{rama abierta})' },
          { label: 'Carga', tex: 'q = C\\varepsilon\\left(1 - e^{-t/\\tau}\\right),\\quad i = \\dfrac{\\varepsilon}{R}\\,e^{-t/\\tau}', check: { d: ['2*(1 - exp(-x/1.5))', '(2/1.5)*exp(-x/1.5)'] } },
          { tex: 'V_C = \\varepsilon\\left(1 - e^{-t/\\tau}\\right),\\quad V_R = \\varepsilon\\,e^{-t/\\tau}' },
          { label: 'Descarga', tex: 'q = Q_0\\,e^{-t/\\tau},\\quad i = -\\dfrac{V_0}{R}\\,e^{-t/\\tau}', check: { d: ['3*exp(-x/0.8)', '-(3/0.8)*exp(-x/0.8)'] } },
          { label: 'Hitos', tex: 'q(\\tau) = (1 - e^{-1})\\,C\\varepsilon \\approx 0.632\\,C\\varepsilon,\\quad q(5\\tau) > 0.99\\,C\\varepsilon' },
          { label: 'Tiempo para un voltaje', tex: 't = -\\tau\\ln\\left(1 - \\dfrac{V}{\\varepsilon}\\right)\\ (\\text{carga}),\\quad t = \\tau\\ln\\dfrac{V_0}{V}\\ (\\text{descarga})', check: { eq: ['-2*log(1 - (10*(1 - exp(-x/2)))/10)', 'x'] } },
          { label: 'Energía en una carga completa', tex: 'W_{bat} = C\\varepsilon^2,\\quad U_C = \\tfrac{1}{2}C\\varepsilon^2,\\quad \\int_0^\\infty i^2R\\,dt = \\tfrac{1}{2}C\\varepsilon^2', check: { i: ['exp(-2x/1.5)', '-0.75*exp(-2x/1.5)'] } }
        ]
      }
    ]
  };
})();
