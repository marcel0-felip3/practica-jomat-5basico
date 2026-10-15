/* Tema: números decimales. Se trabaja con enteros (milésimos) para evitar errores de redondeo. */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, F = J.F;
  function dec(n, k) { return J.redo(n / Math.pow(10, k)); } // n milésimos (k=3) o centésimos (k=2)

  J.reg({
    id: 'dec.leer', tema: 'dec', nombre: 'Leer y escribir decimales', difs: [1, 2],
    gen: function (r, d, L) {
      var e = r.int(0, 9), dcm = r.int(0, 9), cen = r.int(1, 9), mil = L === 5 ? r.int(1, 9) : 0;
      if (d === 2) dcm = 0;
      var partes = [];
      if (e) partes.push(e + (e === 1 ? ' entero' : ' enteros'));
      if (dcm) partes.push(dcm + (dcm === 1 ? ' décimo' : ' décimos'));
      partes.push(cen + (cen === 1 ? ' centésimo' : ' centésimos'));
      if (mil) partes.push(mil + (mil === 1 ? ' milésimo' : ' milésimos'));
      var ans = J.redo(e + dcm / 10 + cen / 100 + mil / 1000);
      return {
        t: '¿Qué número decimal tiene ' + partes.join(', ').replace(/, ([^,]*)$/, ' y $1') + '?',
        ans: ans,
        mal: [J.redo(e + cen / 10 + dcm / 100 + mil / 1000), J.redo(e + (dcm * 10 + cen) / 1000 + mil / 10000),
          J.redo(e * 10 + dcm + cen / 10), J.redo(e + cen / 10 + mil / 100)],
        sol: 'Los décimos van en la primera posición después de la coma, los centésimos en la segunda' + (mil ? ' y los milésimos en la tercera' : '') +
          (dcm ? '' : '; como no hay décimos, ahí va un 0') + ': ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'dec.comparar', tema: 'dec', nombre: 'Comparar y ordenar decimales',
    gen: function (r, d, L) {
      var quiere = r.pick(['mayor', 'menor']);
      var base = r.int(1, 8), set = {}, xs = [];
      var forms = L === 4 ? [[1, 10], [2, 100]] : [[1, 10], [2, 100], [3, 1000]];
      while (xs.length < 4) {
        var fm = r.pick(forms), v;
        if (d === 1) v = r.int(1, fm[1] - 1) / fm[1];
        else v = (base * fm[1] / 10 + r.int(-fm[1] / 10 + 1, fm[1] / 10 - 1)) / fm[1];
        if (d === 3 && xs.length === 0) v = (base * 11) / 100 / (L === 4 ? 1 : 10);
        v = J.redo(Math.abs(v));
        if (v > 0 && !set[v]) { set[v] = 1; xs.push(v); }
      }
      var ord = xs.slice().sort(function (a, b) { return a - b; });
      var ans = quiere === 'mayor' ? ord[3] : ord[0];
      var k = L === 4 ? 2 : 3;
      return {
        t: '¿Cuál es el número <b>' + quiere + '</b>?', ans: ans, mal: xs.filter(function (x) { return x !== ans; }), soloAlt: true,
        sol: 'Se completan con ceros hasta tener ' + k + ' decimales: ' + xs.map(function (x) { return x.toFixed(k).replace('.', ','); }).join(' · ') +
          '. Así se comparan como números enteros. El ' + quiere + ' es ' + f(ans) + '. (No gana el que tiene más cifras.)'
      };
    }
  });

  J.reg({
    id: 'dec.operar', tema: 'dec', nombre: 'Sumar y restar decimales',
    gen: function (r, d, L) {
      var k = L === 4 ? 2 : 3, M = Math.pow(10, k);
      var ka = r.int(1, k), kb = d >= 2 ? (ka === k ? 1 : k) : ka;
      var a = r.int(1, 9 * Math.pow(10, ka)) * Math.pow(10, k - ka) + (d >= 2 ? r.int(1, 5) * M : 0);
      var b = r.int(1, 9 * Math.pow(10, kb)) * Math.pow(10, k - kb);
      var resta = r.chance(0.5);
      if (d === 3) { a = r.int(2, 9) * M; resta = true; }
      if (resta && b >= a) { var t = a; a = b; b = t; if (a === b) a += M; }
      var A = dec(a, k), B = dec(b, k), ans = dec(resta ? a - b : a + b, k);
      var desal = resta ? null : J.redo(A + B / 10);
      return {
        t: 'Calcula ' + f(A) + (resta ? ' − ' : ' + ') + f(B) + '.', ans: ans,
        mal: [desal, J.redo(ans + 0.1), J.redo(Math.abs(ans - 0.1)), J.redo(ans * 10), J.redo(ans + 1)],
        sol: 'Se ponen los números uno debajo del otro con las comas alineadas, completando con ceros: ' +
          A.toFixed(k).replace('.', ',') + (resta ? ' − ' : ' + ') + B.toFixed(k).replace('.', ',') + ' = ' + f(ans) + '.' +
          (resta ? ' Comprobación: ' + f(ans) + ' + ' + f(B) + ' = ' + f(A) + '.' : '')
      };
    }
  });

  J.reg({
    id: 'dec.fraccion', tema: 'dec', nombre: 'Fracción a decimal', difs: [1, 2],
    gen: function (r, d, L) {
      var opciones = L === 4 ? [[10, 1], [100, 2]] : (d === 1 ? [[10, 1], [100, 2], [2, 1], [5, 1]] : [[4, 2], [5, 1], [2, 1], [20, 2], [25, 2]]);
      var o = r.pick(opciones), den = o[0];
      var num = r.int(1, den - 1);
      while (J.mcd(num, den) > 1 && den <= 25 && den !== 10 && den !== 100) num = r.int(1, den - 1);
      var ans = J.redo(num / den);
      var dest = den === 10 || den === 100 ? den : (10 % den === 0 ? 10 : 100);
      var amp = den === dest ? null : dest / den;
      return {
        t: '¿Qué número decimal es igual a ' + F(num, den) + '?', ans: ans,
        mal: [J.leerNumero('0,' + num + den) || J.redo(ans + 0.1), J.redo(num / 10 === ans ? num / 100 : num / 10), J.redo(ans * 10), J.redo(ans + 0.1), J.redo(ans / 10)],
        sol: (amp ? 'Se amplifica para tener denominador ' + dest + ': ' + F(num, den) + ' = ' + F(num * amp, dest) + '. ' : '') +
          (dest === 10 ? 'Décimos: ' : 'Centésimos: ') + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'dec.medidas', tema: 'dec', nombre: 'Decimales en medidas', difs: [2, 3],
    gen: function (r, d, L) {
      if (L === 4) {
        var nom = J.nombre(r), x = r.int(5, 60), y = r.int(5, 95 - x);
        return {
          t: 'De una cinta de 1 metro, ' + nom + ' usa ' + f(x / 100) + ' m y su amiga ' + f(y / 100) + ' m. ¿Cuántos <b>centímetros</b> de cinta quedan?',
          ans: 100 - x - y, u: 'cm', mal: [J.redo((100 - x - y) / 100), x + y, 100 - x, 10 - (x + y) % 10],
          sol: 'Usan ' + f(x / 100) + ' + ' + f(y / 100) + ' = ' + f((x + y) / 100) + ' m. Quedan 1 − ' + f((x + y) / 100) + ' = ' + f((100 - x - y) / 100) +
            ' m, que son ' + (100 - x - y) + ' cm (1 m = 100 cm).'
        };
      }
      var a = r.int(1100, 2900), b = r.int(105, 990);
      if (d === 2) { a = r.int(11, 29) * 50; b = r.int(3, 19) * 25; }
      return {
        t: 'Un paquete pesa ' + f(a / 1000) + ' kg y otro ' + f(b / 1000) + ' kg. ¿Cuántos <b>gramos</b> pesan juntos?',
        ans: a + b, u: 'g', mal: [J.redo((a + b) / 1000), a + b * 10, (a + b) * 10, a + b + 1000],
        sol: 'Juntos pesan ' + f(a / 1000) + ' + ' + f(b / 1000) + ' = ' + f((a + b) / 1000) + ' kg. Como 1 kg = 1.000 g, son ' + f(a + b) + ' g.'
      };
    }
  });

  J.reg({
    id: 'dec.medio', tema: 'dec', nombre: 'Decimal que está a la mitad', difs: [3],
    gen: function (r, d, L) {
      var paso = L === 4 ? r.pick([10, 2]) : r.pick([10, 100, 2]);
      var a, b, ans;
      if (paso === 10) { a = r.int(1, 8) / 10; b = J.redo(a + 0.1); }
      else if (paso === 100) { a = r.int(11, 98) / 100; b = J.redo(a + 0.01); }
      else { a = r.int(2, 30) / 10; b = J.redo(a + 0.2); }
      ans = J.redo((a + b) / 2);
      return {
        t: '¿Qué número está exactamente a la mitad entre ' + f(a) + ' y ' + f(b) + '?', ans: ans,
        mal: [J.redo(a + (b - a) / 10), J.redo((a + b)), b, J.redo(ans + 0.1)],
        sol: 'Se agrega un decimal más para ver los números de en medio: ' + f(a) + ' = ' + (a).toFixed(paso === 100 ? 3 : 2).replace('.', ',') +
          ' y ' + f(b) + ' = ' + (b).toFixed(paso === 100 ? 3 : 2).replace('.', ',') + '. La mitad es ' + f(ans) + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
