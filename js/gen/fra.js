/* Tema: fracciones. */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, F = J.F, S = J.svg;

  function barra(n, k) {
    var w = Math.min(360, n * 40), h = 46, cw = w / n, s = S.abre(w + 4, h + 4);
    for (var i = 0; i < n; i++) s += S.rect(2 + i * cw, 2, cw, h, i < k ? S.COLOR : '#fff');
    return s + '</svg>';
  }
  function circulo(n, k) {
    var R = 70, cx = 74, cy = 74, s = S.abre(148, 148);
    for (var i = 0; i < n; i++) {
      var a1 = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = a1 + 2 * Math.PI / n;
      var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      s += '<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' A' + R + ',' + R + ' 0 0,1 ' +
        x2.toFixed(2) + ',' + y2.toFixed(2) + ' Z" fill="' + (i < k ? S.COLOR : '#fff') + '" stroke="#333" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }

  J.reg({
    id: 'fra.figura', tema: 'fra', nombre: 'Fracción de una figura', difs: [1, 2],
    gen: function (r, d, L) {
      var n = r.pick(d === 1 ? [2, 3, 4, 5, 6, 8] : [6, 8, 10, 12]);
      var k = r.int(1, n - 1);
      var pideBlanca = d === 2 && r.chance(0.5);
      var ans = pideBlanca ? J.fr(n - k, n) : J.fr(k, n);
      return {
        t: '¿Qué fracción de la figura está ' + (pideBlanca ? '<b>sin pintar</b>' : '<b>pintada</b>') + '?',
        svg: r.chance(0.5) || n > 8 ? barra(n, k) : circulo(n, k),
        ans: ans, mal: [pideBlanca ? J.fr(k, n) : J.fr(n - k, n), J.fr(ans.n, n - ans.n || 1), J.fr(n, ans.n), J.fr(ans.n, n + 1)],
        sol: 'La figura tiene ' + n + ' partes iguales (denominador) y ' + ans.n + (ans.n === 1 ? ' está ' + (pideBlanca ? 'sin pintar' : 'pintada') : ' están ' + (pideBlanca ? 'sin pintar' : 'pintadas')) +
          ' (numerador): ' + J.frTxt(ans) + '.' + (J.mcd(ans.n, n) > 1 ? ' También vale la fracción equivalente ' + J.frTxt(J.simp(ans.n, n)) + '.' : '')
      };
    }
  });

  J.reg({
    id: 'fra.comparar', tema: 'fra', nombre: 'Comparar fracciones',
    gen: function (r, d, L) {
      var quiere = r.pick(['mayor', 'menor']), fs = [], tipo;
      if (d === 1) {
        tipo = r.pick(['unit', 'mismoden']);
        if (tipo === 'unit') fs = r.sample([2, 3, 4, 5, 6, 8, 10, 12], 4).map(function (x) { return J.fr(1, x); });
        else { var den = r.pick([5, 6, 8, 10, 12]); fs = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(function (x) { return x < den; }), 4).map(function (x) { return J.fr(x, den); }); }
      } else {
        tipo = d === 2 && L === 4 ? 'mismonum' : 'distintas';
        if (tipo === 'mismonum') { var num = r.int(2, 4); fs = r.sample([5, 6, 7, 8, 9, 10, 12], 4).map(function (x) { return J.fr(num, x); }); }
        else {
          var vistos = {};
          while (fs.length < 4) {
            var dd = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), nn = r.int(1, dd - 1), v = Math.round(nn / dd * 1e6);
            if (!vistos[v]) { vistos[v] = 1; fs.push(J.fr(nn, dd)); }
          }
        }
      }
      var ord = fs.slice().sort(function (a, b) { return J.valor(a) - J.valor(b); });
      var ans = quiere === 'mayor' ? ord[3] : ord[0];
      var expl = {
        unit: 'Con numerador 1, mientras más grande el denominador, más chicos son los trozos.',
        mismoden: 'Con el mismo denominador, se comparan los numeradores.',
        mismonum: 'Con el mismo numerador, es mayor la que tiene el denominador más chico (trozos más grandes).',
        distintas: 'Se pueden comparar amplificando a un denominador común, o pensando qué tan cerca están de 0, de 1/2 o de 1.'
      }[tipo];
      return {
        t: '¿Qué fracción es la <b>' + quiere + '</b>?', ans: ans, mal: fs.filter(function (x) { return x !== ans; }), soloAlt: true,
        sol: expl + ' Ordenadas de menor a mayor: ' + ord.map(J.frTxt).join(' < ') + '.'
      };
    }
  });

  J.reg({
    id: 'fra.suma_igual', tema: 'fra', nombre: 'Sumar y restar con igual denominador', difs: [1, 2],
    gen: function (r, d, L) {
      var den = r.pick([5, 6, 7, 8, 9, 10, 12]);
      var a = r.int(1, den - 2), b = r.int(1, den - 1 - a);
      var resta = r.chance(0.5);
      if (resta) { var t = a + b; b = a; a = t; }
      var ans = J.fr(resta ? a - b : a + b, den);
      if (d === 2) {
        var nom = J.nombre(r);
        var txt = resta ? nom + ' tenía ' + F(a, den) + ' de una torta y regaló ' + F(b, den) + ' de la torta. ¿Qué fracción de la torta le queda?'
          : 'Una pizza se corta en ' + den + ' trozos iguales. ' + nom + ' come ' + a + ' trozos y su hermana ' + b + '. ¿Qué fracción de la pizza queda?';
        if (!resta) ans = J.fr(den - a - b, den);
        return {
          t: txt, ans: ans, mal: [J.fr(a + b, den), J.fr(ans.n, den * 2), J.fr(a, den), J.fr(den - a, den)],
          sol: resta ? 'Igual denominador: se restan los numeradores, ' + a + ' − ' + b + ' = ' + (a - b) + '. Queda ' + J.frTxt(ans) + '.'
            : 'Comieron ' + (a + b) + '/' + den + '. Queda ' + den + '/' + den + ' − ' + (a + b) + '/' + den + ' = ' + J.frTxt(ans) + '.'
        };
      }
      return {
        t: 'Calcula ' + F(a, den) + (resta ? ' − ' : ' + ') + F(b, den) + '.', ans: ans,
        mal: [resta ? J.fr(a - b + 1, den) : J.fr(a + b, den * 2), J.fr(resta ? a + b : Math.abs(a - b), den), J.fr(ans.n + 1, den), J.fr(ans.n, den + 1)],
        sol: 'Con igual denominador se ' + (resta ? 'restan' : 'suman') + ' los numeradores y el denominador se mantiene: ' + J.frTxt(ans) +
          '. (Error típico: ' + (resta ? 'restar también los denominadores' : 'sumar también los denominadores, ' + (a + b) + '/' + (2 * den)) + '.)'
      };
    }
  });

  var PARES = [[2, 3], [2, 4], [3, 6], [4, 8], [2, 5], [3, 4], [2, 6], [4, 6], [6, 12], [5, 10], [2, 10], [3, 9], [4, 12], [2, 8], [3, 12]];
  J.reg({
    id: 'fra.suma_distinta', tema: 'fra', nombre: 'Sumar y restar con distinto denominador', niv: [5], difs: [2, 3],
    gen: function (r, d) {
      var p = r.pick(PARES), b = p[0], dd = p[1];
      if (r.chance(0.5)) { b = p[1]; dd = p[0]; }
      var a = r.int(1, b - 1), c = r.int(1, dd - 1);
      var m = J.mcm(b, dd), A = a * m / b, C = c * m / dd;
      var resta = r.chance(0.5);
      if (resta && A < C) { var t = a; a = c; c = t; t = b; b = dd; dd = t; t = A; A = C; C = t; }
      if (resta && A === C) resta = false;
      var num = resta ? A - C : A + C;
      var ans = J.simp(num, m);
      var malo = J.simp(resta ? Math.abs(a - c) || 1 : a + c, resta ? Math.abs(b - dd) || b : b + dd);
      if (d === 3) {
        var nom = J.nombre(r);
        var txt = resta ? 'Un estanque tenía ' + F(a, b) + ' de su capacidad y se usó ' + F(c, dd) + ' de la capacidad total. ¿Qué fracción del estanque queda con agua?'
          : nom + ' pintó ' + F(a, b) + ' de un mural el lunes y ' + F(c, dd) + ' del mural el martes. ¿Qué fracción del mural pintó en total?';
        return {
          t: txt, ans: ans, mal: [malo, J.simp(num + 1, m), J.fr(resta ? A - C : A + C, m * 2), J.simp(m - num > 0 ? m - num : num + 2, m)],
          sol: 'Denominador común ' + m + ': ' + A + '/' + m + (resta ? ' − ' : ' + ') + C + '/' + m + ' = ' + num + '/' + m +
            (J.mcd(num, m) > 1 ? ' = ' + J.frTxt(ans) : '') + '.'
        };
      }
      return {
        t: 'Calcula ' + F(a, b) + (resta ? ' − ' : ' + ') + F(c, dd) + '.', ans: ans,
        mal: [malo, J.simp(num + 1, m), J.simp(Math.max(1, num - 1), m), J.fr(a * c, b * dd)],
        sol: 'Se amplifica a denominador común ' + m + ': ' + F(a, b) + ' = ' + F(A, m) + ' y ' + F(c, dd) + ' = ' + F(C, m) +
          '. ' + (resta ? 'Resta' : 'Suma') + ': ' + num + '/' + m + (J.mcd(num, m) > 1 ? ' = ' + J.frTxt(ans) : '') +
          '. (Error típico: ' + (resta ? 'restar' : 'sumar') + ' numeradores y denominadores por separado.)'
      };
    }
  });

  J.reg({
    id: 'fra.de_cantidad', tema: 'fra', nombre: 'Fracción de una cantidad',
    gen: function (r, d, L) {
      var den = r.pick(L === 4 ? [2, 3, 4, 5, 6, 8, 10] : [3, 4, 5, 6, 8, 10, 12]);
      var unidad = r.int(2, L === 4 ? 9 : 25), N = den * unidad;
      var num = d === 1 ? 1 : r.int(2, den - 1);
      if (d === 1 || d === 2) {
        var cosa = r.pick(['dulces', 'láminas', 'bolitas', 'estudiantes', 'libros']);
        return {
          t: (d === 1 ? '¿Cuánto es ' : 'En una caja hay ' + N + ' ' + cosa + '. ¿Cuánto es ') + F(num, den) + ' de ' + N + (d === 1 ? '?' : '?'),
          ans: num * unidad, mal: [unidad, N - num * unidad, N * num, num * unidad + den],
          sol: 'Primero se divide en ' + den + ' partes: ' + N + ' : ' + den + ' = ' + unidad + '. ' +
            (num > 1 ? 'Luego se toman ' + num + ' partes: ' + num + ' × ' + unidad + ' = ' + (num * unidad) + '.' : 'La respuesta es ' + unidad + '.')
        };
      }
      if (L === 4 || r.chance(0.5)) {
        var parte = num * unidad;
        return {
          t: 'Las ' + F(num, den) + ' partes de un número son ' + parte + '. ¿Cuál es el número?',
          ans: N, mal: [parte * num, parte + den, unidad, Math.round(parte * num / den) || parte + 1],
          sol: 'Si ' + num + ' partes son ' + parte + ', una parte es ' + parte + ' : ' + num + ' = ' + unidad + '. Las ' + den + ' partes son ' + den + ' × ' + unidad + ' = ' + N + '.'
        };
      }
      var d1 = r.pick([3, 4, 5]), d2 = r.pick([2, 3, 4]);
      var T = d1 * d2 * r.int(2, 6);
      var a1 = T / d1, quedan = T - a1, b1 = quedan / d2;
      return {
        t: 'En una bolsa hay ' + T + ' caramelos. ' + F(1, d1) + ' son de frutilla y ' + F(1, d2) + ' <b>de los que quedan</b> son de menta. ¿Cuántos son de menta?',
        ans: b1, mal: [T / d2, a1, quedan, quedan - b1],
        sol: 'Frutilla: ' + T + ' : ' + d1 + ' = ' + a1 + '. Quedan ' + quedan + '. Menta: ' + quedan + ' : ' + d2 + ' = ' + b1 + '.'
      };
    }
  });

  J.reg({
    id: 'fra.equivalente', tema: 'fra', nombre: 'Fracciones equivalentes', difs: [1, 2],
    gen: function (r, d, L) {
      var b = r.pick([2, 3, 4, 5, 6]), a = r.int(1, b - 1);
      while (J.mcd(a, b) > 1) a = r.int(1, b - 1);
      var k = r.int(2, d === 1 ? 3 : 6);
      if (d === 1 || r.chance(0.5)) {
        var ans = J.fr(a * k, b * k);
        return {
          t: '¿Qué fracción es equivalente a ' + F(a, b) + '?', ans: ans, soloAlt: true,
          mal: [J.fr(a + k, b + k), J.fr(a * k, b), J.fr(b, a), J.fr(a, b * k), J.fr(a * k + 1, b * k)],
          sol: 'Se amplifica multiplicando numerador y denominador por el mismo número (' + k + '): ' + F(a, b) + ' = ' + F(a * k, b * k) + '.'
        };
      }
      return {
        t: 'Completa: ' + F(a, b) + ' = ' + F('☐', b * k), ans: a * k, mal: [a + k, a * k + 1, b * k - a, a],
        sol: 'El denominador se multiplicó por ' + k + ' (' + b + ' × ' + k + ' = ' + (b * k) + '), así que el numerador también: ' + a + ' × ' + k + ' = ' + (a * k) + '.'
      };
    }
  });

  J.reg({
    id: 'fra.mixto', tema: 'fra', nombre: 'Números mixtos e impropias', difs: [2, 3],
    gen: function (r, d, L) {
      var den = r.pick([2, 3, 4, 5, 6, 8]), e = r.int(1, L === 4 ? 4 : 6), resto = r.int(1, den - 1);
      var imp = e * den + resto;
      if (r.chance(0.5)) {
        return {
          t: 'Escribe ' + F(imp, den) + ' como <b>número mixto</b>.', forma: 'mixto', ans: J.fr(imp, den, true),
          mal: [J.fr((e + 1) * den + resto, den, true), J.fr(e * den + (den - resto), den, true), J.fr((e - 1 > 0 ? e - 1 : e + 2) * den + resto, den, true)],
          sol: imp + ' : ' + den + ' = ' + e + ' y sobran ' + resto + ': son ' + e + ' enteros y ' + resto + '/' + den + '. (Se escribe «' + e + ' ' + resto + '/' + den + '».)'
        };
      }
      return {
        t: 'Escribe ' + e + ' ' + F(resto, den) + ' como <b>fracción impropia</b>.', forma: 'fraccion', ans: J.fr(imp, den),
        mal: [J.fr(e + resto, den), J.fr(e * resto + den, den), J.fr(e * den, den + resto), J.fr(imp + den, den)],
        sol: e + ' enteros son ' + (e * den) + '/' + den + '; más ' + resto + '/' + den + ' son ' + imp + '/' + den + '.'
      };
    }
  });

  J.reg({
    id: 'fra.problema_total', tema: 'fra', nombre: 'Encontrar el total a partir de lo que queda', difs: [3],
    gen: function (r, d, L) {
      var b, dd, a, c, m;
      if (L === 4) { m = r.pick([6, 8, 10, 12]); b = dd = m; a = r.int(1, m / 2 - 1); c = r.int(1, m - a - 2); }
      else {
        var p = r.pick([[5, 3], [4, 3], [6, 4], [5, 2], [3, 4], [2, 5], [4, 6]]); b = p[0]; dd = p[1]; m = J.mcm(b, dd);
        do { a = r.int(1, b - 1); c = r.int(1, dd - 1); } while (a * m / b + c * m / dd >= m);
      }
      var usado = a * m / b + c * m / dd, queda = m - usado, k = r.int(2, 9), total = m * k;
      var nom = J.nombre(r);
      return {
        t: nom + ' leyó ' + F(a, b) + ' de un libro el lunes y ' + F(c, dd) + ' del libro el martes. Le quedan ' + (queda * k) + ' páginas. ¿Cuántas páginas tiene el libro?',
        ans: total, mal: [queda * k * 2, total + k, usado * k, queda * k + usado],
        sol: 'Leyó ' + (a * m / b) + '/' + m + ' + ' + (c * m / dd) + '/' + m + ' = ' + usado + '/' + m + '. Quedan ' + queda + '/' + m + ', que son ' + (queda * k) +
          ' páginas, así que 1/' + m + ' son ' + k + ' páginas. El libro tiene ' + m + ' × ' + k + ' = ' + total + ' páginas.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
