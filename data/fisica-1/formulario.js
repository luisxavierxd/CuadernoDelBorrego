/* =====================================================================
   Formulario de Física 1. Cada sección enlaza a la sesión donde se explica.
   Algunas fórmulas llevan una comprobación numérica que corre en
   scripts/formulario.test.js (la variable es x; lo demás, valores fijos):
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   ===================================================================== */
(function () {
  window.FORMULARIO = {
    code: 'f1', course: 'fisica-1', title: 'Formulario de Física 1',
    sections: [
      {
        title: 'Unidades y constantes', sessions: [1], items: [
          { tex: 'g = 9.81\\ \\text{m/s}^2' },
          { label: 'Prefijos', tex: '\\text{k} = 10^{3},\\ \\text{M} = 10^{6},\\ \\text{c} = 10^{-2},\\ \\text{m} = 10^{-3},\\ \\mu = 10^{-6}' },
          { tex: '1\\ \\text{km/h} = \\tfrac{1}{3.6}\\ \\text{m/s},\\quad 1\\ \\text{hp} = 746\\ \\text{W},\\quad 1\\ \\text{kWh} = 3.6\\ \\text{MJ}' },
          { label: 'Unidades derivadas', tex: '1\\ \\text{N} = 1\\ \\text{kg·m/s}^2,\\quad 1\\ \\text{J} = 1\\ \\text{N·m},\\quad 1\\ \\text{W} = 1\\ \\text{J/s}' }
        ]
      },
      {
        title: 'Vectores', sessions: [2, 3], items: [
          { label: 'Componentes', tex: 'A_x = A\\cos\\theta,\\quad A_y = A\\sin\\theta', s: 2 },
          { label: 'Magnitud y dirección', tex: 'A = \\sqrt{A_x^2 + A_y^2},\\quad \\tan\\theta = \\dfrac{A_y}{A_x}', s: 2, check: { eq: ['sqrt((5*cos(x))^2 + (5*sin(x))^2)', '5'] } },
          { label: 'Suma', tex: '\\vec R = \\vec A + \\vec B:\\ R_x = A_x + B_x,\\ R_y = A_y + B_y', s: 2 },
          { label: 'Unitario', tex: '\\hat u = \\dfrac{\\vec A}{A}', s: 3 },
          { label: 'Producto escalar', tex: '\\vec A\\cdot\\vec B = AB\\cos\\theta = A_xB_x + A_yB_y + A_zB_z', s: 3, check: { eq: ['(3*cos(x))*(4*cos(0.5)) + (3*sin(x))*(4*sin(0.5))', '12*cos(x - 0.5)'] } },
          { label: 'Producto vectorial', tex: '|\\vec A\\times\\vec B| = AB\\sin\\theta,\\quad \\vec A\\times\\vec B = (A_yB_z - A_zB_y,\\ A_zB_x - A_xB_z,\\ A_xB_y - A_yB_x)', s: 3 },
          { label: 'Proyección de A sobre B', tex: 'A_B = \\dfrac{\\vec A\\cdot\\vec B}{B}', s: 3 }
        ]
      },
      {
        title: 'Cinemática en una dimensión', sessions: [4, 5], items: [
          { label: 'Velocidad y aceleración', tex: 'v = \\dfrac{dx}{dt},\\quad a = \\dfrac{dv}{dt}', s: 4, check: { d: ['5 + 3x + 2x^2', '3 + 4x'] } },
          { label: 'Promedios', tex: '\\bar v = \\dfrac{\\Delta x}{\\Delta t},\\quad \\bar a = \\dfrac{\\Delta v}{\\Delta t}', s: 4 },
          { label: 'Desplazamiento', tex: '\\Delta x = \\int v\\,dt\\ \\ (\\text{área bajo } v(t))', s: 4 },
          { label: 'MRU', tex: 'x = x_0 + vt', s: 4 },
          { label: 'MRUA', tex: 'v = v_0 + at,\\quad x = x_0 + v_0t + \\tfrac{1}{2}at^2', s: 5, check: { i: ['4 + 3x', '4x + 1.5x^2'] } },
          { tex: 'v^2 = v_0^2 + 2a\\,\\Delta x,\\quad \\Delta x = \\tfrac{1}{2}(v_0 + v)\\,t', s: 5, check: { eq: ['(4 + 3x)^2', '16 + 2*3*(4x + 1.5x^2)'] } },
          { label: 'Tiro vertical', tex: 't_{sub} = \\dfrac{v_0}{g},\\quad H = \\dfrac{v_0^2}{2g}', s: 5 }
        ]
      },
      {
        title: 'Tiro parabólico', sessions: [6], items: [
          { label: 'Posición', tex: 'x = v_0\\cos\\theta\\,t,\\quad y = v_0\\sin\\theta\\,t - \\tfrac{1}{2}gt^2' },
          { label: 'Trayectoria', tex: 'y = x\\tan\\theta - \\dfrac{gx^2}{2v_0^2\\cos^2\\theta}', check: { eq: ['x*tan(0.7) - 9.81*x^2/(2*400*cos(0.7)^2)', '20*sin(0.7)*(x/(20*cos(0.7))) - 4.905*(x/(20*cos(0.7)))^2'] } },
          { label: 'Tiempo, altura y alcance (mismo nivel)', tex: 'T = \\dfrac{2v_0\\sin\\theta}{g},\\quad H = \\dfrac{v_0^2\\sin^2\\theta}{2g},\\quad R = \\dfrac{v_0^2\\sin 2\\theta}{g}', check: { eq: ['(20*cos(x))*(2*20*sin(x)/9.81)', '400*sin(2x)/9.81'] } }
        ]
      },
      {
        title: 'Circular y relativo', sessions: [7], items: [
          { tex: '\\omega = \\dfrac{2\\pi}{T} = 2\\pi f,\\quad v = \\omega r' },
          { label: 'Aceleración centrípeta', tex: 'a_c = \\dfrac{v^2}{r} = \\omega^2 r,\\quad a = \\sqrt{a_c^2 + a_t^2}', check: { eq: ['(x*1.5)^2/1.5', 'x^2*1.5'] } },
          { label: 'Velocidad relativa', tex: '\\vec v_{A/C} = \\vec v_{A/B} + \\vec v_{B/C}' }
        ]
      },
      {
        title: 'Leyes de Newton', sessions: [8, 9], items: [
          { tex: '\\Sigma\\vec F = m\\vec a,\\quad w = mg,\\quad \\vec F_{AB} = -\\vec F_{BA}', s: 8 },
          { label: 'Elevador (a hacia arriba)', tex: 'N = m(g + a)', s: 8 },
          { label: 'Atwood', tex: 'a = \\dfrac{(m_2 - m_1)g}{m_1 + m_2},\\quad T = \\dfrac{2m_1m_2g}{m_1 + m_2}', s: 9, check: { eq: ['3*(9.81 + (x - 3)*9.81/(3 + x))', '2*3*x*9.81/(3 + x)'] } },
          { label: 'Bloque en mesa con masa colgante', tex: 'a = \\dfrac{(m_2 - \\mu_k m_1)g}{m_1 + m_2}', s: 9 }
        ]
      },
      {
        title: 'Resortes y fricción', sessions: [10], items: [
          { label: 'Hooke', tex: 'F = -kx' },
          { label: 'Serie y paralelo', tex: '\\dfrac{1}{k_s} = \\dfrac{1}{k_1} + \\dfrac{1}{k_2},\\quad k_p = k_1 + k_2', check: { eq: ['1/(1/x + 1/3)', '3x/(x + 3)'] } },
          { label: 'Fricción', tex: 'f_s \\le \\mu_sN,\\quad f_k = \\mu_kN' },
          { label: 'Fuerza con ángulo', tex: 'N = mg - F\\sin\\theta\\ (\\text{jalar}),\\quad N = mg + F\\sin\\theta\\ (\\text{empujar})' }
        ]
      },
      {
        title: 'Planos y dinámica circular', sessions: [11], items: [
          { label: 'Peso en el plano', tex: 'mg\\sin\\theta\\ (\\parallel),\\quad mg\\cos\\theta\\ (\\perp)' },
          { tex: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta),\\quad \\tan\\theta_c = \\mu_s' },
          { label: 'Al centro', tex: '\\Sigma F_c = \\dfrac{mv^2}{r},\\quad v_{máx} = \\sqrt{\\mu_s gr},\\quad \\tan\\theta_{peralte} = \\dfrac{v^2}{rg}' }
        ]
      },
      {
        title: 'Trabajo y energía', sessions: [12, 13], items: [
          { label: 'Trabajo', tex: 'W = Fd\\cos\\theta,\\quad W = \\int F\\,dx', s: 12 },
          { label: 'Resorte', tex: 'W = \\tfrac{1}{2}kx^2', s: 12, check: { i: ['400x', '200x^2'] } },
          { label: 'Trabajo-energía', tex: 'K = \\tfrac{1}{2}mv^2,\\quad W_{neto} = \\Delta K', s: 12 },
          { label: 'Potencia', tex: 'P = \\dfrac{W}{t} = Fv', s: 12 },
          { label: 'Potencial', tex: 'U_g = mgy,\\quad U_e = \\tfrac{1}{2}kx^2', s: 13 },
          { label: 'Conservación', tex: 'K_0 + U_0 - f_kd = K_f + U_f', s: 13 },
          { tex: 'v = \\sqrt{2gh},\\quad K = U \\text{ en } y = h/2', s: 13 }
        ]
      },
      {
        title: 'Estática', sessions: [14, 15], items: [
          { label: 'Partícula', tex: '\\Sigma F_x = 0,\\quad \\Sigma F_y = 0', s: 14 },
          { label: 'Dos cables', tex: 'T_1 = \\dfrac{mg\\cos\\theta_2}{\\sin(\\theta_1 + \\theta_2)},\\quad T_2 = \\dfrac{mg\\cos\\theta_1}{\\sin(\\theta_1 + \\theta_2)}', s: 14, check: { eq: ['98.1*cos(1)/sin(x + 1)*sin(x) + 98.1*cos(x)/sin(x + 1)*sin(1)', '98.1'], a: 0.2, b: 1.4 } },
          { label: 'Cable simétrico', tex: 'T = \\dfrac{mg}{2\\sin\\theta}', s: 14, check: { eq: ['98.1*cos(x)/sin(2x)', '98.1/(2*sin(x))'], a: 0.2, b: 1.4 } },
          { label: 'Torque', tex: '\\tau = rF\\sin\\theta', s: 15 },
          { label: 'Cuerpo rígido', tex: '\\Sigma\\vec F = 0,\\quad \\Sigma\\tau = 0,\\quad F_1x_1 = F_2x_2', s: 15 },
          { label: 'Viga en dos apoyos', tex: 'R_B = \\dfrac{\\Sigma F_i(x_i - x_A)}{x_B - x_A},\\quad R_A = \\Sigma F_i - R_B', s: 15 }
        ]
      }
    ]
  };
})();
