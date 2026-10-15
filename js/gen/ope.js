/* Tema: cálculo con las cuatro operaciones, operaciones combinadas, cálculo inverso y dinero. */
(function (root) {
  'use strict';
  var J = root.J, f = J.f;

  /* Error típico de resta: restar cifra a cifra «la mayor menos la menor» sin canjear */
  function restaSinCanje(a, b) {
    var sa = String(a), sb = String(b), res = '';
    while (sb.length < sa.length) sb = '0' + sb;
    for (var i = 0; i < sa.length; i++) res += Math.abs(+sa[i] - +sb[i]);
    return +res;
  }
  /* Error típico de suma: olvidar la reserva */
  function sumaSinReserva(a, b) {
    var sa = String(a), sb = String(b), res = '';
    var L = Math.max(sa.length, sb.length);
    while (sa.length < L) sa = '0' + sa;
    while (sb.length < L) sb = '0' + sb;
    for (var i = 0; i < L; i++) res += (+sa[i] + +sb[i]) % 10;
    return +res;
  }

  J.reg({
    id: 'ope.suma_resta', tema: 'ope', nombre: 'Sumas y restas',
    gen: function (r, d, L) {
      var max = L === 4 ? (d === 1 ? 999 : 9999) : (d === 1 ? 99999 : 999999);
      var a, b;
      if (d === 3) {
        b = r.int(max / 20, max / 3); var x = r.int(max / 20, max / 2);
        a = x + b;
        var ve = r.chance(0.5);
        return {
          t: ve ? 'Completa: ☐ + ' + f(b) + ' = ' + f(a) : 'Completa: ' + f(a) + ' − ☐ = ' + f(b),
          ans: x, mal: [a + b, x + 10, x - 10, restaSinCanje(a, b)],
          sol: ve ? 'El número que falta es ' + f(a) + ' − ' + f(b) + ' = ' + f(x) + '. Comprobación: ' + f(x) + ' + ' + f(b) + ' = ' + f(a) + '.'
            : 'Si a ' + f(a) + ' le quito algo y queda ' + f(b) + ', lo que quité es ' + f(a) + ' − ' + f(b) + ' = ' + f(x) + '.'
        };
      }
      if (r.chance(0.5)) {
        a = r.int(max / 10, max / 2); b = r.int(max / 10, max / 2);
        return {
          t: 'Calcula ' + f(a) + ' + ' + f(b) + '.', ans: a + b,
          mal: [sumaSinReserva(a, b), a + b + 10, a + b - 100, a + b + 1000],
          sol: 'Se suma por posiciones, de derecha a izquierda, llevando la reserva cuando una suma pasa de 9: ' + f(a + b) + '.'
        };
      }
      a = r.int(max / 3, max); b = r.int(max / 10, a - 1);
      if (d === 2 && L === 4 && r.chance(0.5)) { a = r.pick([1000, 2000, 5000, 10000]); b = r.int(101, a - 1); }
      return {
        t: 'Calcula ' + f(a) + ' − ' + f(b) + '.', ans: a - b,
        mal: [restaSinCanje(a, b), a - b + 10, a - b - 10, a - b + 100],
        sol: 'Se resta por posiciones canjeando cuando hace falta. Comprobación: ' + f(a - b) + ' + ' + f(b) + ' = ' + f(a) + '.'
      };
    }
  });

  J.reg({
    id: 'ope.multiplicar', tema: 'ope', nombre: 'Multiplicaciones',
    gen: function (r, d, L) {
      var a, b;
      if (d === 3) {
        if (L === 4) {
          var p = r.int(3, 9), q = r.int(3, 9), extra = r.int(1, 20);
          return {
            t: 'Completa: ' + p + ' × ☐ = ' + f(p * q + extra) + ' − ' + extra,
            ans: q, mal: [q + 1, p * q, q - 1, p * q + extra],
            sol: f(p * q + extra) + ' − ' + extra + ' = ' + f(p * q) + ', y ' + p + ' × ' + q + ' = ' + f(p * q) + '.'
          };
        }
        var par = r.pick([[25, 4], [125, 8], [50, 2], [20, 5]]);
        var k = r.int(3, 19);
        var ord = r.shuffle([par[0], par[1], k]);
        var ans = par[0] * par[1] * k;
        return {
          t: 'Calcula mentalmente ' + ord.join(' × ') + '.', ans: ans,
          mal: [ans * 10, ans / 10 % 1 === 0 ? ans / 10 : ans + 100, ans + par[0], par[0] * k],
          sol: 'Conviene juntar primero ' + par[0] + ' × ' + par[1] + ' = ' + f(par[0] * par[1]) + ', y después × ' + k + ' = ' + f(ans) + '.'
        };
      }
      if (L === 4) { a = d === 1 ? r.int(12, 99) : r.int(102, 999); b = r.int(3, 9); }
      else if (d === 1) { a = r.int(12, 99); b = r.pick([10, 100, 1000, r.int(3, 9)]); }
      else { a = r.int(12, 99); b = r.int(12, 99); }
      var res = a * b;
      var sol;
      if (b < 10) {
        var partes = String(a).split('').map(function (c, i, arr) { return +c * Math.pow(10, arr.length - 1 - i); }).filter(Boolean);
        sol = 'Por partes: ' + partes.map(function (x) { return f(x) + ' × ' + b + ' = ' + f(x * b); }).join('; ') + '. Suma: ' + f(res) + '.';
      } else if (b % 10 === 0 && b <= 1000 && /^10+$/.test(String(b))) {
        sol = 'Multiplicar por ' + f(b) + ' es agregar ' + (String(b).length - 1) + ' cero(s): ' + f(res) + '.';
      } else {
        var dec = Math.floor(b / 10) * 10, uni = b % 10;
        sol = a + ' × ' + dec + ' = ' + f(a * dec) + ' y ' + a + ' × ' + uni + ' = ' + f(a * uni) + '. Suma: ' + f(res) + '.';
      }
      var olvido = b >= 10 && b % 10 ? a * (b % 10) + a * Math.floor(b / 10) : res + 10;
      return {
        t: 'Calcula ' + f(a) + ' × ' + f(b) + '.', ans: res,
        mal: [olvido, res + b, res - 10 * b > 0 ? res - 10 * b : res + 100, res + 100],
        sol: sol
      };
    }
  });

  J.reg({
    id: 'ope.dividir', tema: 'ope', nombre: 'Divisiones',
    gen: function (r, d, L) {
      var b = r.int(2, 9);
      var q = L === 4 ? r.int(3, Math.floor(99 / b)) : r.int(Math.ceil(100 / b), Math.floor(999 / b));
      var resto = d >= 2 ? r.int(1, b - 1) : 0;
      if (L === 4 && b * q + resto > 99) resto = 0;
      if (L === 5 && b * q + resto > 999) resto = 0;
      var a = b * q + resto;
      if (resto === 0 || d === 1) {
        return {
          t: 'Calcula ' + f(a) + ' : ' + b + '.', ans: q, mal: [q + 1, q - 1, q * 10, a - b],
          sol: 'Busca el número que multiplicado por ' + b + ' da ' + f(a) + ': ' + b + ' × ' + q + ' = ' + f(a) + '.'
        };
      }
      var pideResto = r.chance(0.5);
      return {
        t: 'En la división ' + f(a) + ' : ' + b + ', ¿cuál es ' + (pideResto ? 'el <b>resto</b>' : 'el <b>cociente</b>') + '?',
        ans: pideResto ? resto : q,
        mal: pideResto ? [b - resto, q, resto + 1, 0] : [q + 1, resto, q - 1, q * 10],
        sol: b + ' × ' + q + ' = ' + f(b * q) + ' y ' + (resto === 1 ? 'falta 1' : 'faltan ' + resto) + ' para llegar a ' + f(a) + '. Cociente ' + q + ', resto ' + resto + '.'
      };
    }
  });

  J.reg({
    id: 'ope.combinadas', tema: 'ope', nombre: 'Operaciones combinadas',
    gen: function (r, d, L) {
      var tpls = L === 4 ? ['a+bc', 'ab-cd', 'a-b:c', 'ab+c:d'] : ['a+bc', 'ab-cd', 'a(b+c)-d', '(a+b):c×d', 'a+b:c×(d-e)'];
      if (d === 1) tpls = tpls.slice(0, 2);
      var t = r.pick(tpls), a, b, c, dd, e, ans, ltr, txt, sol;
      for (var intento = 0; intento < 50; intento++) {
        a = r.int(2, 12); b = r.int(2, 9); c = r.int(2, 9); dd = r.int(2, 9); e = r.int(1, 5);
        if (t === 'a+bc') {
          a = r.int(5, 60); ans = a + b * c; ltr = (a + b) * c;
          txt = a + ' + ' + b + ' × ' + c; sol = 'Primero la multiplicación: ' + b + ' × ' + c + ' = ' + (b * c) + '. Luego ' + a + ' + ' + (b * c) + ' = ' + ans + '.';
        } else if (t === 'ab-cd') {
          if (a * b <= c * dd) continue;
          ans = a * b - c * dd; ltr = (a * b - c) * dd;
          txt = a + ' × ' + b + ' − ' + c + ' × ' + dd;
          sol = 'Primero las multiplicaciones: ' + (a * b) + ' − ' + (c * dd) + ' = ' + ans + '.';
        } else if (t === 'a-b:c') {
          b = c * r.int(2, 9); a = r.int(b / c + 1, 60); ans = a - b / c; ltr = (a - b) / c;
          if (a - b < 0 || (a - b) % c) ltr = a - b / c + c;
          txt = a + ' − ' + b + ' : ' + c; sol = 'Primero la división: ' + b + ' : ' + c + ' = ' + (b / c) + '. Luego ' + a + ' − ' + (b / c) + ' = ' + ans + '.';
        } else if (t === 'ab+c:d') {
          c = dd * r.int(2, 9); ans = a * b + c / dd; ltr = (a * b + c) / dd;
          if ((a * b + c) % dd) ltr = a * b + c;
          txt = a + ' × ' + b + ' + ' + c + ' : ' + dd;
          sol = 'Primero × y :, en orden: ' + a + ' × ' + b + ' = ' + (a * b) + ' y ' + c + ' : ' + dd + ' = ' + (c / dd) + '. Suma: ' + ans + '.';
        } else if (t === 'a(b+c)-d') {
          dd = r.int(1, a * (b + c) - 1); ans = a * (b + c) - dd; ltr = a * b + c - dd;
          if (ltr < 0) continue;
          txt = a + ' × (' + b + ' + ' + c + ') − ' + dd;
          sol = 'Primero el paréntesis: ' + b + ' + ' + c + ' = ' + (b + c) + '. Luego ' + a + ' × ' + (b + c) + ' = ' + (a * (b + c)) + ', y al final − ' + dd + ' = ' + ans + '.';
        } else if (t === '(a+b):c×d') {
          if ((a + b) % c) continue;
          ans = (a + b) / c * dd; ltr = a + b / c * dd;
          if (b % c) ltr = (a + b) / (c * dd);
          if (ltr % 1) ltr = ans + c;
          txt = '(' + a + ' + ' + b + ') : ' + c + ' × ' + dd;
          sol = 'Paréntesis: ' + (a + b) + '. Luego, de izquierda a derecha: ' + (a + b) + ' : ' + c + ' = ' + ((a + b) / c) + ' y × ' + dd + ' = ' + ans + '.';
        } else {
          if (b % c || dd <= e) continue;
          ans = a + b / c * (dd - e); ltr = (a + b) / c * (dd - e);
          if (ltr % 1) ltr = a + b / c * dd - e;
          txt = a + ' + ' + b + ' : ' + c + ' × (' + dd + ' − ' + e + ')';
          sol = 'Paréntesis: ' + (dd - e) + '. Luego ' + b + ' : ' + c + ' = ' + (b / c) + ' y × ' + (dd - e) + ' = ' + (b / c * (dd - e)) + '. Al final ' + a + ' + ' + (b / c * (dd - e)) + ' = ' + ans + '.';
        }
        break;
      }
      return {
        t: 'Calcula: ' + txt, ans: ans, mal: [ltr, ans + 1, ans + 10, ans - 2],
        sol: sol + ' (Error típico: operar de izquierda a derecha sin respetar la prioridad, que da ' + f(ltr) + '.)'
      };
    }
  });

  J.reg({
    id: 'ope.inverso', tema: 'ope', nombre: 'Pienso un número',
    gen: function (r, d, L) {
      var x = r.int(2, L === 4 ? 15 : 30);
      var nOps = d;
      var ops = [], v = x;
      var tipos = r.shuffle(['+', '×', '−', '+', '×']);
      for (var i = 0; i < nOps; i++) {
        var tp = tipos[i], k;
        if (tp === '+') { k = r.int(3, 20); v += k; }
        else if (tp === '×') { k = r.int(2, L === 4 ? 5 : 9); v *= k; }
        else { k = r.int(1, Math.max(1, Math.min(v - 1, 15))); v -= k; }
        ops.push([tp, k]);
      }
      var frases = { '+': 'le sumo ', '×': 'lo multiplico por ', '−': 'le resto ' };
      var txt = 'Pienso un número, ' + ops.map(function (o) { return frases[o[0]] + o[1]; }).join(', luego ') +
        ' y obtengo <b>' + f(v) + '</b>. ¿Qué número pensé?';
      var w = v, pasos = [];
      ops.slice().reverse().forEach(function (o) {
        var antes = w;
        if (o[0] === '+') w -= o[1]; else if (o[0] === '×') w /= o[1]; else w += o[1];
        pasos.push(f(antes) + (o[0] === '+' ? ' − ' : o[0] === '×' ? ' : ' : ' + ') + o[1] + ' = ' + f(w));
      });
      var adelante = v;
      ops.forEach(function (o) { if (o[0] === '+') adelante += o[1]; else if (o[0] === '×') adelante *= o[1]; else adelante -= o[1]; });
      return {
        t: txt, ans: x, mal: [adelante, x + 1, v - ops[0][1], x * 2],
        sol: 'Se trabaja hacia atrás, deshaciendo cada operación en orden inverso: ' + pasos.join('; ') + '. Pensé el ' + x + '.'
      };
    }
  });

  J.reg({
    id: 'ope.dinero', tema: 'ope', nombre: 'Problemas con dinero',
    gen: function (r, d, L) {
      var nom = J.nombre(r);
      var cosas = [['cuaderno', 'cuadernos'], ['lápiz', 'lápices'], ['jugo', 'jugos'], ['helado', 'helados'], ['sticker', 'stickers'], ['pan de pascua', 'panes de pascua']];
      var c = r.pick(cosas);
      var n = r.int(2, d === 1 ? 4 : 6);
      var p = d === 1 ? r.int(2, 9) * 100 : r.pick([350, 450, 490, 590, 690, 790, 890, 990, 1250, 1490]);
      var tot = n * p;
      var billete = [1000, 2000, 5000, 10000, 20000].filter(function (b) { return b > tot; })[0];
      if (d < 3) {
        return {
          t: nom + ' tiene ' + J.plata(billete) + ' y compra ' + n + ' ' + c[1] + ' de ' + J.plata(p) + ' cada uno. ¿Cuánto dinero le queda?',
          ans: billete - tot, u: '', mal: [billete - p, tot, billete - tot + p, billete - tot - 100],
          sol: n + ' × ' + J.plata(p) + ' = ' + J.plata(tot) + '. Le queda ' + J.plata(billete) + ' − ' + J.plata(tot) + ' = ' + J.plata(billete - tot) + '.'
        };
      }
      var c2 = r.pick(cosas.filter(function (x) { return x !== c; }));
      var m = r.int(2, 4), p2 = r.pick([250, 380, 450, 600, 750, 1100]);
      var tot2 = tot + m * p2;
      var b2 = [5000, 10000, 20000].filter(function (b) { return b > tot2; })[0];
      return {
        t: nom + ' paga con ' + J.plata(b2) + ' ' + n + ' ' + c[1] + ' de ' + J.plata(p) + ' y ' + m + ' ' + c2[1] + ' de ' + J.plata(p2) + '. ¿Cuánto vuelto recibe?',
        ans: b2 - tot2, mal: [b2 - p - p2, tot2, b2 - tot, b2 - m * p2],
        sol: n + ' × ' + J.plata(p) + ' = ' + J.plata(tot) + '; ' + m + ' × ' + J.plata(p2) + ' = ' + J.plata(m * p2) + '. Total ' + J.plata(tot2) +
          '. Vuelto: ' + J.plata(b2) + ' − ' + J.plata(tot2) + ' = ' + J.plata(b2 - tot2) + '.'
      };
    }
  });

  J.reg({
    id: 'ope.resto_contexto', tema: 'ope', nombre: 'Interpretar el resto', difs: [2, 3],
    gen: function (r, d, L) {
      var b = r.int(4, 9), q = r.int(5, L === 4 ? 11 : 40), resto = r.int(1, b - 1), a = b * q + resto;
      var tipo = r.pick(['viajes', 'cajas', 'sobran']);
      var t, ans, sol;
      if (tipo === 'viajes') {
        t = 'Un furgón lleva ' + b + ' personas por viaje. ¿Cuántos viajes necesita, como mínimo, para llevar a ' + a + ' personas?';
        ans = q + 1; sol = a + ' : ' + b + ' = ' + q + ' y sobran ' + resto + '. Esas ' + resto + ' personas necesitan otro viaje: ' + (q + 1) + '.';
      } else if (tipo === 'cajas') {
        t = 'Se envasan ' + a + ' huevos en cajas de ' + b + '. ¿Cuántas cajas se llenan completas?';
        ans = q; sol = a + ' : ' + b + ' = ' + q + ' y sobran ' + resto + ', que no alcanzan a llenar otra caja: ' + q + ' cajas.';
      } else {
        t = 'Se reparten ' + a + ' láminas en partes iguales entre ' + b + ' niños, dando a cada uno la mayor cantidad posible. ¿Cuántas láminas sobran?';
        ans = resto; sol = a + ' : ' + b + ' = ' + q + ' y sobran ' + resto + '.';
      }
      return { t: t, ans: ans, mal: [q, q + 1, resto, b - resto], sol: sol };
    }
  });

  J.reg({
    id: 'ope.dividendo', tema: 'ope', nombre: 'Encontrar el dividendo', difs: [3],
    gen: function (r, d, L) {
      var b = r.int(3, 9), q = r.int(4, L === 4 ? 12 : 60), resto = r.int(1, b - 1);
      var ans = b * q + resto;
      return {
        t: 'Al dividir un número por ' + b + ' se obtiene ' + q + ' y sobran ' + resto + '. ¿Qué número es?',
        ans: ans, mal: [b * q, b * q - resto, b * (q + resto), q * resto + b],
        sol: 'Dividendo = divisor × cociente + resto = ' + b + ' × ' + q + ' + ' + resto + ' = ' + ans + '.'
      };
    }
  });

  J.reg({
    id: 'ope.propiedades', tema: 'ope', nombre: 'Propiedades del 0 y del 1', niv: [4], difs: [1],
    gen: function (r) {
      var n = r.int(13, 999);
      var tipo = r.int(0, 3);
      var t = ['Calcula ' + n + ' × 0.', 'Calcula ' + n + ' × 1.', 'Calcula ' + n + ' : 1.', 'Calcula 0 : ' + r.int(2, 9) + '.'][tipo];
      var ans = [0, n, n, 0][tipo];
      var sol = ['Todo número multiplicado por 0 da 0.', 'Todo número multiplicado por 1 da el mismo número.',
        'Todo número dividido por 1 da el mismo número.', '0 repartido en partes iguales da 0 a cada parte.'][tipo];
      return { t: t, ans: ans, mal: [n, 1, n + 1, 0, 10], sol: sol };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
