/* Tema: números y valor posicional. */
(function (root) {
  'use strict';
  var J = root.J, f = J.f;
  var POS = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil',
    'unidades de millón', 'decenas de millón', 'centenas de millón'];
  var POS1 = ['unidad', 'decena', 'centena', 'unidad de mil', 'decena de mil', 'centena de mil',
    'unidad de millón', 'decena de millón', 'centena de millón'];

  function digitosDistintos(r, k) {
    var ds = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k);
    if (ds[0] === 0) { var j = r.int(1, k - 1); ds[0] = ds[j]; ds[j] = 0; }
    return ds;
  }
  function deDigitos(ds) { return ds.reduce(function (a, d) { return a * 10 + d; }, 0); }
  function permutaciones(arr) {
    if (arr.length <= 1) return [arr.slice()];
    var out = [];
    arr.forEach(function (x, i) {
      var resto = arr.slice(0, i).concat(arr.slice(i + 1));
      permutaciones(resto).forEach(function (p) { out.push([x].concat(p)); });
    });
    return out;
  }

  J.reg({
    id: 'num.valor', tema: 'num', nombre: 'Valor de una cifra',
    gen: function (r, d, L) {
      var k = L === 4 ? 4 : [6, 7, 9][d - 1];
      var ds = digitosDistintos(r, k);
      var p = r.int(d === 1 ? 1 : 0, k - 1);
      while (ds[k - 1 - p] === 0) p = r.int(0, k - 1);
      var c = ds[k - 1 - p], n = deDigitos(ds), ans = c * Math.pow(10, p);
      return {
        t: '¿Cuánto vale la cifra <b>' + c + '</b> en el número <b>' + f(n) + '</b>?',
        ans: ans,
        mal: [c, c * Math.pow(10, p + 1), p > 0 ? c * Math.pow(10, p - 1) : c * 100, c * Math.pow(10, p + 2)],
        sol: 'El ' + c + ' está en la posición de las ' + POS[p] + ', así que vale ' + c + ' × ' + f(Math.pow(10, p)) +
          ' = ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'num.componer', tema: 'num', nombre: 'Componer números',
    gen: function (r, d, L) {
      var k = L === 4 ? 4 : r.int(6, 7);
      var ds = [];
      for (var i = 0; i < k; i++) ds.push(i === 0 ? r.int(1, 9) : r.int(0, 9));
      if (d >= 2) { ds[r.int(1, k - 1)] = 0; }
      if (d === 3 && L === 5) ds[r.int(1, k - 1)] = 0;
      var n = deDigitos(ds);
      var partes = [], comps = [];
      for (var p = k - 1; p >= 0; p--) {
        var c = ds[k - 1 - p];
        if (c) { partes.push(c + ' ' + (c === 1 ? POS1[p] : POS[p])); comps.push(c * Math.pow(10, p)); }
      }
      var orden = d === 3 ? r.shuffle(partes.map(function (_, i) { return i; })) : partes.map(function (_, i) { return i; });
      var txt;
      if (d === 1 && L === 4) txt = '¿Qué número es ' + comps.map(f).join(' + ') + '?';
      else txt = '¿Qué número tiene ' + orden.map(function (i) { return partes[i]; }).join(', ').replace(/, ([^,]*)$/, ' y $1') + '?';
      var sinCeros = deDigitos(ds.filter(function (x) { return x; }));
      var cambio = ds.slice(); var a = r.int(0, k - 2); var t = cambio[a]; cambio[a] = cambio[a + 1]; cambio[a + 1] = t;
      return {
        t: txt, ans: n,
        mal: [sinCeros, cambio[0] ? deDigitos(cambio) : n + Math.pow(10, k - 2), n * 10, n + Math.pow(10, r.int(1, k - 2))],
        sol: 'Se ubica cada cifra en su posición' + (ds.indexOf(0) > 0 ? ' y las posiciones vacías se completan con 0' : '') +
          ': ' + comps.map(f).join(' + ') + ' = ' + f(n) + '.'
      };
    }
  });

  J.reg({
    id: 'num.mayor_menor', tema: 'num', nombre: 'Formar el mayor o menor número',
    gen: function (r, d, L) {
      var k = L === 4 ? 4 : (d === 1 ? 5 : 6);
      var ds = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k);
      if (d >= 2 && ds.indexOf(0) < 0) ds[r.int(0, k - 1)] = 0;
      var quiere = r.pick(['mayor', 'menor']);
      var cond = d === 3 ? r.pick(['par', 'impar']) : null;
      var pares = ds.filter(function (x) { return x % 2 === 0; }).length;
      if (cond === 'par' && !pares) cond = 'impar';
      if (cond === 'impar' && pares === k) cond = 'par';
      var nums = permutaciones(ds).filter(function (p) { return p[0] !== 0; }).map(deDigitos);
      var todos = nums.slice();
      if (cond) nums = nums.filter(function (n) { return (n % 2 === 0) === (cond === 'par'); });
      var ans = quiere === 'mayor' ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      var sinCond = quiere === 'mayor' ? Math.max.apply(null, todos) : Math.min.apply(null, todos);
      var asc = ds.slice().sort(), desc = asc.slice().reverse();
      var conCeroAdelante = deDigitos(asc);
      var cifrasTxt = ds.slice().sort(function () { return 0; }).join(', ').replace(/, (\d)$/, ' y $1');
      var expl;
      if (quiere === 'mayor') expl = 'Para el mayor, las cifras van de mayor a menor';
      else expl = 'Para el menor, las cifras van de menor a mayor, pero el 0 no puede ir primero' +
        (ds.indexOf(0) >= 0 ? ' (va en la segunda posición)' : '');
      if (cond) expl += '. Además debe ser ' + cond + ', así que la última cifra tiene que ser ' + cond;
      return {
        t: 'Usando una sola vez cada una de las cifras ' + cifrasTxt + ', forma el <b>' + quiere + '</b> número' +
          (cond ? ' <b>' + cond + '</b>' : '') + ' de ' + k + ' cifras posible.',
        ans: ans,
        mal: [sinCond, conCeroAdelante, deDigitos(desc), quiere === 'mayor' ? Math.min.apply(null, nums) : Math.max.apply(null, nums)],
        sol: expl + '. Resultado: ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'num.redondeo', tema: 'num', nombre: 'Redondear', difs: [1, 2],
    gen: function (r, d, L) {
      var k = L === 4 ? 4 : 7;
      var n = r.int(Math.pow(10, k - 1), Math.pow(10, k) - 1);
      var opciones = L === 4 ? [1, 2, 3] : [3, 5, 6];
      var p = r.pick(opciones);
      var b = Math.pow(10, p);
      if (d === 2 && r.chance(0.6)) n = Math.floor(n / b) * b + 5 * b / 10 + r.int(0, b / 10 - 1) * (b >= 100 ? 1 : 0);
      var ans = Math.round(n / b) * b;
      var abajo = Math.floor(n / b) * b, arriba = abajo + b;
      return {
        t: 'Redondea <b>' + f(n) + '</b> a la ' + POS1[p] + ' más cercana.',
        ans: ans,
        mal: [ans === abajo ? arriba : abajo, Math.round(n / (b * 10)) * b * 10 || arriba + b, Math.round(n / (b / 10)) * (b / 10)],
        sol: 'Se mira la cifra que está a la derecha de las ' + POS[p] + ': ' + Math.floor((n % b) / (b / 10)) +
          (Math.floor((n % b) / (b / 10)) >= 5 ? ' (5 o más: se sube)' : ' (menos de 5: se mantiene)') +
          '. ' + f(n) + ' está entre ' + f(abajo) + ' y ' + f(arriba) + ', y queda ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'num.cercano', tema: 'num', nombre: 'Número más cercano',
    gen: function (r, d, L) {
      var esc = L === 4 ? 1000 : r.pick([10000, 100000]);
      var T = r.int(L === 4 ? 2 : 2, 9) * esc;
      var dist = r.sample(d === 1 ? [10, 30, 60, 90, 120, 150] : [12, 25, 40, 47, 58, 75, 110], 4).map(function (x) {
        return x * esc / 1000;
      });
      var cands = dist.map(function (x) { return r.chance(0.5) ? T + x : T - x; });
      var iMin = 0;
      dist.forEach(function (x, i) { if (x < dist[iMin]) iMin = i; });
      return {
        t: '¿Cuál de estos números está más cerca de <b>' + f(T) + '</b>?',
        ans: cands[iMin], mal: cands.filter(function (_, i) { return i !== iMin; }), soloAlt: true,
        sol: 'Se calcula la distancia de cada número a ' + f(T) + ': ' +
          cands.map(function (c, i) { return f(c) + ' → ' + f(dist[i]); }).join('; ') + '. La menor distancia es la de ' +
          f(cands[iMin]) + '.'
      };
    }
  });

  J.reg({
    id: 'num.comparar', tema: 'num', nombre: 'Comparar números',
    gen: function (r, d, L) {
      var k = L === 4 ? 4 : 6;
      var base = Math.pow(10, k);
      var quiere = r.pick(['mayor', 'menor']);
      var c;
      if (d === 1) {
        var x = r.int(base / 10, base / 2);
        c = [x, x + r.int(1, 9) * base / 100, x - r.int(1, 9) * base / 1000, x + r.int(1, 9) * base / 10];
      } else {
        var ds = digitosDistintos(r, k);
        var n = deDigitos(ds);
        var sw = ds.slice(); var t = sw[1]; sw[1] = sw[2]; sw[2] = t;
        var sw2 = ds.slice(); t = sw2[k - 1]; sw2[k - 1] = sw2[k - 2]; sw2[k - 2] = t;
        c = [n, deDigitos(sw), deDigitos(sw2), d === 3 ? base - r.int(1, 9) : n + base / 100];
        if (d === 3) c[0] = base + r.int(1, 9);
      }
      var uniq = c.filter(function (v, i) { return c.indexOf(v) === i && v > 0; });
      while (uniq.length < 4) uniq.push(uniq[0] + uniq.length * 7);
      var ans = quiere === 'mayor' ? Math.max.apply(null, uniq) : Math.min.apply(null, uniq);
      return {
        t: '¿Cuál es el número <b>' + quiere + '</b>?', ans: ans,
        mal: uniq.filter(function (v) { return v !== ans; }), soloAlt: true,
        sol: 'Primero se compara la cantidad de cifras; si es igual, se comparan las cifras de izquierda a derecha ' +
          'hasta encontrar una distinta. El ' + quiere + ' es ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'num.contar_cifra', tema: 'num', nombre: 'Contar cifras escritas', difs: [3],
    gen: function (r, d, L) {
      var N = L === 4 ? 100 : r.pick([200, 300, 500]);
      var c = r.int(1, 9);
      var cuenta = [0, 0, 0];
      for (var n = 1; n <= N; n++) {
        var s = String(n);
        for (var i = 0; i < s.length; i++) if (+s[s.length - 1 - i] === c) cuenta[i]++;
      }
      var ans = cuenta[0] + cuenta[1] + cuenta[2];
      return {
        t: 'Si escribes todos los números del 1 al ' + f(N) + ', ¿cuántas veces escribes la cifra <b>' + c + '</b>?',
        ans: ans, mal: [cuenta[0], ans - 1, ans + 1, cuenta[0] + cuenta[1] - 1],
        sol: 'Como unidad aparece ' + cuenta[0] + ' veces, como decena ' + cuenta[1] + ' veces' +
          (cuenta[2] ? ' y como centena ' + cuenta[2] + ' veces' : '') + '. Total: ' + ans +
          '. Ojo: un número como ' + (c * 11) + ' tiene la cifra dos veces.'
      };
    }
  });

  J.reg({
    id: 'num.suma_cifras', tema: 'num', nombre: 'Números con suma de cifras dada', difs: [2, 3],
    gen: function (r, d, L) {
      var k = d === 2 ? 2 : 3;
      var S = d === 2 ? r.int(4, 9) : r.int(3, L === 4 ? 6 : 8);
      var lista = [];
      for (var n = Math.pow(10, k - 1); n < Math.pow(10, k); n++) {
        var s = String(n).split('').reduce(function (a, x) { return a + (+x); }, 0);
        if (s === S) lista.push(n);
      }
      var ans = lista.length;
      return {
        t: '¿Cuántos números de ' + k + ' cifras tienen cifras que suman <b>' + S + '</b>?',
        ans: ans, mal: [ans - 1, ans + 1, S, ans + k],
        sol: 'Se hace una lista ordenada, empezando por la primera cifra más chica: ' +
          (lista.length <= 15 ? lista.join(', ') : lista.slice(0, 8).join(', ') + ', …, ' + lista[lista.length - 1]) +
          '. Son ' + ans + '. Ojo: la primera cifra no puede ser 0.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
