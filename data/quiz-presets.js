/* =====================================================================
   Atajos del ritmo sugerido (§7.5, §10.2). Aplican a ambos cursos.
   Son sugerencias para un semestre de 15 semanas, no reglas: la selección
   libre de sesiones es la opción principal del lanzador.
     id, label, kind: 'quiz' | 'exam', week (semana sugerida), sessions [n]
   ===================================================================== */
(function () {
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  window.QUIZ_PRESETS = {
    note: 'sugerido · semestre de 15 semanas',
    presets: [
      { id: 'quiz-1',    label: 'Quiz 1',    kind: 'quiz', week: 3,  sessions: range(1, 3) },
      { id: 'quiz-2',    label: 'Quiz 2',    kind: 'quiz', week: 8,  sessions: range(6, 8) },
      { id: 'quiz-3',    label: 'Quiz 3',    kind: 'quiz', week: 13, sessions: range(11, 13) },
      { id: 'parcial-1', label: 'Parcial 1', kind: 'exam', week: 5,  sessions: range(1, 5) },
      { id: 'parcial-2', label: 'Parcial 2', kind: 'exam', week: 10, sessions: range(6, 10) },
      { id: 'parcial-3', label: 'Parcial 3', kind: 'exam', week: 15, sessions: range(11, 15) },
      { id: 'final',     label: 'Final',     kind: 'exam', week: 15, sessions: range(1, 15) }
    ]
  };
})();
