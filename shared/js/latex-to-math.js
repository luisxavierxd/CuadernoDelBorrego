/* =====================================================================
   LaTeX (el que escribe MathLive) → sintaxis de math.js. Puro, sin DOM
   (lo prueba scripts/latex.test.js).
   Convenciones de libro: \sin 2x = sin(2x); \sin x\cos x = sin(x)·cos(x);
   \cos^2 x = cos(x)^2; \sin^{-1} x = asin(x); \ln = log natural; \log = log10.
   Lanza un Error con mensaje en español si falta completar algo.
   ===================================================================== */
(function () {
  var FUNCS = {
    sin: 'sin', cos: 'cos', tan: 'tan', sec: 'sec', csc: 'csc', cot: 'cot',
    sen: 'sin', tg: 'tan', ctg: 'cot', cosec: 'csc',
    arcsin: 'asin', arccos: 'acos', arctan: 'atan', arcsec: 'asec', arccsc: 'acsc', arccot: 'acot',
    sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
    ln: 'log', log: 'log10', exp: 'exp'
  };
  var INVERSE = { sin: 'asin', cos: 'acos', tan: 'atan', sec: 'asec', csc: 'acsc', cot: 'acot' };
  var SYMBOLS = { pi: 'pi', infty: 'Infinity', exponentialE: 'e', theta: 'theta', alpha: 'alpha', beta: 'beta', omega: 'omega', mu: 'mu' };
  var SKIP = { ',': 1, ';': 1, ':': 1, '!': 1, ' ': 1, '~': 1, quad: 1, qquad: 1, displaystyle: 1, textstyle: 1, limits: 1, mleft: 0, mright: 0 };

  function tokenize(src) {
    var t = [], i = 0, s = String(src);
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c) || c === '~') { i++; continue; }            // ~ = espacio en el LaTeX de math.js
      if (c === '\\') {
        var m = s.slice(i + 1).match(/^[a-zA-Z]+/);
        if (m) { t.push({ k: 'cmd', v: m[0] }); i += 1 + m[0].length; }
        else { t.push({ k: 'cmd', v: s[i + 1] || '' }); i += 2; }
        continue;
      }
      var n = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
      if (n) { t.push({ k: 'num', v: n[0] }); i += n[0].length; continue; }
      if (/[a-zA-Z]/.test(c)) { t.push({ k: 'let', v: c }); i++; continue; }
      t.push({ k: 'op', v: c }); i++;
    }
    return t.filter(function (x) { return !(x.k === 'cmd' && SKIP[x.v] === 1); });
  }

  function Parser(tokens) { this.t = tokens; this.i = 0; }
  Parser.prototype.peek = function () { return this.t[this.i]; };
  Parser.prototype.next = function () { return this.t[this.i++]; };
  Parser.prototype.isOp = function (v) { var x = this.peek(); return x && x.k === 'op' && x.v === v; };
  Parser.prototype.isCmd = function (v) { var x = this.peek(); return x && x.k === 'cmd' && x.v === v; };
  Parser.prototype.expect = function (v) {
    var x = this.next();
    if (!x || x.v !== v) throw new Error('Falta cerrar “' + v + '”.');
  };

  // Termina en el cierre del grupo actual.
  Parser.prototype.atEnd = function (close) {
    var x = this.peek();
    if (!x) return true;
    if (x.k === 'cmd' && (x.v === 'right' || x.v === 'mright')) return true;
    if (x.k === 'op' && (x.v === ')' || x.v === ']' || x.v === '}')) return true;
    if (close === '|' && x.k === 'op' && x.v === '|') return true;
    return false;
  };

  Parser.prototype.expr = function (close) {
    var out = '';
    while (!this.atEnd(close)) {
      if (this.isOp('+') || this.isOp('-')) { out += this.next().v; continue; }
      var term = this.term(close);
      if (term === '') break;
      out += term;
    }
    return out;
  };

  Parser.prototype.term = function (close) {
    var parts = [], op = '';
    while (!this.atEnd(close) && !this.isOp('+') && !this.isOp('-')) {
      if (this.isCmd('cdot') || this.isCmd('times') || this.isOp('*')) { this.next(); op = '*'; continue; }
      if (this.isOp('/') || this.isCmd('div')) { this.next(); op = '/'; continue; }
      if (this.isOp(',')) { this.next(); continue; }
      var f = this.factor(close);
      if (f === '') break;
      if (!parts.length) parts.push(f);
      else parts.push((op || '*') + f);
      op = '';
    }
    if (op) throw new Error('Falta algo después de “' + (op === '*' ? '·' : '/') + '”.');
    return parts.join('');
  };

  // Base con sus exponentes (y subíndices, que se ignoran).
  Parser.prototype.factor = function (close) {
    var base = this.atom(close);
    if (base === '') return '';
    for (;;) {
      if (this.isOp('^') && this.isDegree()) { base = '(' + base + '*pi/180)'; continue; }
      if (this.isOp('^')) { this.next(); base = '(' + base + ')^(' + this.script() + ')'; continue; }
      if (this.isOp('_')) { this.next(); this.script(); continue; }
      break;
    }
    return base;
  };

  // ^\circ o ^{\circ}: grados → radianes. Consume los tokens si aplica.
  Parser.prototype.isDegree = function () {
    var a = this.t[this.i + 1], b = this.t[this.i + 2], c = this.t[this.i + 3];
    if (a && a.k === 'cmd' && a.v === 'circ') { this.i += 2; return true; }
    if (a && a.k === 'op' && a.v === '{' && b && b.k === 'cmd' && b.v === 'circ' && c && c.v === '}') { this.i += 4; return true; }
    return false;
  };

  Parser.prototype.script = function () {
    var x = this.peek();
    if (!x) throw new Error('Falta el exponente.');
    if (x.k === 'op' && x.v === '{') {
      this.next();
      var e = this.expr('}');
      this.expect('}');
      if (e === '') throw new Error('Falta el exponente.');
      return e;
    }
    this.next();
    if (x.k === 'num') {
      // x^23 en LaTeX es x^{2}3: el resto del número vuelve a la cola
      if (x.v.length > 1) { this.t.splice(this.i, 0, { k: 'num', v: x.v.slice(1) }); return x.v[0]; }
      return x.v;
    }
    if (x.k === 'let') return x.v;
    if (x.k === 'cmd' && SYMBOLS[x.v]) return SYMBOLS[x.v];
    if (x.k === 'op' && x.v === '-') return '-' + this.script();
    throw new Error('No entendí el exponente.');
  };

  Parser.prototype.group = function (what) {
    if (this.isOp('{')) {
      this.next();
      var e = this.expr('}');
      this.expect('}');
      if (e === '') throw new Error('Falta completar ' + what + '.');
      return e;
    }
    var a = this.atom();
    if (a === '') throw new Error('Falta completar ' + what + '.');
    return a;
  };

  // Argumento sin paréntesis: factores seguidos hasta +, −, ·, otra función o un cierre.
  Parser.prototype.funcArg = function (close) {
    var parts = [];
    for (;;) {
      var x = this.peek();
      if (!x || this.atEnd(close)) break;
      if (x.k === 'op' && '+-*/,'.indexOf(x.v) >= 0) break;
      if (x.k === 'cmd' && (FUNCS[x.v] || x.v === 'cdot' || x.v === 'times' || x.v === 'operatorname')) break;
      var f = this.factor(close);
      if (f === '') break;
      parts.push(f);
    }
    if (!parts.length) throw new Error('Falta el argumento de la función.');
    return parts.join('*');
  };

  Parser.prototype.func = function (name, close) {
    var pow = null, fn = FUNCS[name];
    if (this.isOp('^')) {
      this.next();
      pow = this.script();
      if (pow === '-1' || pow === '(-1)') { fn = INVERSE[name] || fn; pow = null; }
    }
    var arg;
    var x = this.peek();
    if (x && ((x.k === 'op' && (x.v === '(' || x.v === '[' || x.v === '{')) || (x.k === 'cmd' && (x.v === 'left' || x.v === 'mleft')))) arg = this.atom();
    else arg = this.funcArg(close);
    var call = fn + '(' + arg + ')';
    return pow ? '(' + call + ')^(' + pow + ')' : call;
  };

  Parser.prototype.atom = function (close) {
    var x = this.peek();
    if (!x || this.atEnd(close)) return '';
    if (x.k === 'num') { this.next(); return x.v; }
    if (x.k === 'let') { this.next(); return x.v; }
    if (x.k === 'op') {
      if (x.v === '(' || x.v === '[') {
        this.next();
        var e = this.expr();
        this.expect(x.v === '(' ? ')' : ']');
        if (e === '') throw new Error('Hay unos paréntesis vacíos.');
        return '(' + e + ')';
      }
      if (x.v === '{') { return '(' + this.group('un espacio') + ')'; }
      if (x.v === '|') {
        this.next();
        var a = this.expr('|');
        this.expect('|');
        if (a === '') throw new Error('Falta lo de adentro del valor absoluto.');
        return 'abs(' + a + ')';
      }
      if (x.v === '!' || x.v === '\'') { this.next(); return this.atom(close); }
      return '';
    }
    // Comandos
    this.next();
    var c = x.v;
    if (c === 'left' || c === 'mleft') {
      var d = this.next();
      var open = d ? (d.k === 'cmd' ? d.v : d.v) : '(';
      var inner = this.expr(open === '|' || open === 'vert' ? '|' : null);
      var r = this.next();
      if (!r || (r.v !== 'right' && r.v !== 'mright')) throw new Error('Falta cerrar un paréntesis.');
      this.next();                                   // delimitador de cierre
      if (inner === '') throw new Error('Hay unos paréntesis vacíos.');
      return (open === '|' || open === 'vert' || open === 'lvert') ? 'abs(' + inner + ')' : '(' + inner + ')';
    }
    if (c === 'frac' || c === 'dfrac' || c === 'tfrac' || c === 'cfrac') {
      var num = this.group('el numerador'), den = this.group('el denominador');
      return '((' + num + ')/(' + den + '))';
    }
    if (c === 'sqrt') {
      var idx = null;
      if (this.isOp('[')) { this.next(); idx = this.expr(); this.expect(']'); if (idx === '') throw new Error('Falta el índice de la raíz.'); }
      var rad = this.group('la raíz');
      return idx ? '((' + rad + ')^(1/(' + idx + ')))' : 'sqrt(' + rad + ')';
    }
    if (c === 'mathrm' || c === 'operatorname' || c === 'text' || c === 'mathit') {
      this.expect('{');
      var word = '';
      while (this.peek() && !this.isOp('}')) word += this.next().v;
      this.expect('}');
      if (FUNCS[word]) return this.func(word, close);
      return word === 'e' ? 'e' : word;
    }
    if (FUNCS[c]) return this.func(c, close);
    if (SYMBOLS[c]) return SYMBOLS[c];
    if (c === 'placeholder') { throw new Error('Falta completar un espacio.'); }
    if (c === 'lvert' || c === 'vert') {
      var v = this.expr('|');
      this.next();
      return 'abs(' + v + ')';
    }
    if (c === '{' || c === '}') return '';
    return c;                                          // letras griegas y otros símbolos: se dejan como nombre
  };

  function toMath(latex) {
    var src = String(latex == null ? '' : latex).replace(/\\placeholder\{\}/g, '\\placeholder');
    if (/\\placeholder/.test(src)) throw new Error('Falta completar un espacio.');
    var p = new Parser(tokenize(src));
    var out = p.expr();
    if (p.peek()) throw new Error('Sobra un “' + p.peek().v + '”.');
    if (out === '') throw new Error('Escribe tu respuesta.');
    return out;
  }

  window.CBLatex = { toMath: toMath, tokenize: tokenize };
})();
