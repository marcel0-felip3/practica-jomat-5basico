/* Tema: patrones, secuencias, ecuaciones, inecuaciones y balanzas. */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, S = J.svg;

  J.reg({
    id: 'pat.siguiente', tema: 'pat', nombre: 'Continuar una secuencia',
    gen: function (r, d, L) {
      var xs = [], regla, n = 5, sig;
      if (d === 1) {
        var a = r.int(1, 40), k = r.int(2, L === 4 ? 12 : 25), baja = r.chance(0.3);
        if (baja) a += k * 6;
        for (var i = 0; i < n; i++) xs.push(baja ? a - k * i : a + k * i);
        sig = baja ? a - k * n : a + k * n; regla = (baja ? 'Se resta ' : 'Se suma ') + k + ' cada vez.';
      } else if (d === 2) {
        var t = r.pick(['x2', 'x3', 'x2+1', 'cuad']);
        if (t === 'cuad') { var s = r.int(1, 4); for (i = 0; i < n; i++) xs.push((s + i) * (s + i)); sig = (s + n) * (s + n); regla = 'Son los números multiplicados por sí mismos: ' + s + '×' + s + ', ' + (s + 1) + '×' + (s + 1) + ', … Sigue ' + (s + n) + ' × ' + (s + n) + '.'; }
        else {
          var v = r.int(1, 5); n = 4;
          for (i = 0; i < n; i++) { xs.push(v); v = t === 'x2' ? v * 2 : t === 'x3' ? v * 3 : v * 2 + 1; }
          sig = v; regla = { x2: 'Cada término es el doble del anterior.', x3: 'Cada término se multiplica por 3.', 'x2+1': 'Cada término es el doble del anterior más 1.' }[t];
        }
      } else {
        var t3 = r.pick(['difcrece', 'alterna', 'triang', 'fib']);
        if (t3 === 'difcrece') { var b = r.int(1, 10), dd = r.int(1, 3), p = r.int(1, 3); xs = [b]; for (i = 1; i < 6; i++) xs.push(xs[i - 1] + dd + p * (i - 1)); sig = xs[5] + dd + p * 5; n = 6; regla = 'Las diferencias aumentan de ' + p + ' en ' + p + ': ' + xs.slice(1).map(function (x, j) { return x - xs[j]; }).join(', ') + ', luego ' + (dd + p * 5) + '.'; }
        else if (t3 === 'alterna') { var c = r.int(10, 30), up = r.int(3, 9), down = r.int(1, up - 1); xs = [c]; for (i = 1; i < 7; i++) xs.push(i % 2 ? xs[i - 1] + up : xs[i - 1] - down); sig = xs[6] + up; n = 7; regla = 'Se alterna: +' + up + ', −' + down + ', +' + up + ', −' + down + '… Después de ' + xs[6] + ' toca sumar ' + up + '.'; }
        else if (t3 === 'triang') { var m = r.int(1, 3); xs = []; for (i = 1; i <= 6; i++) xs.push(m * i * (i + 1)); sig = m * 7 * 8; n = 6; regla = 'Las diferencias son ' + xs.slice(1).map(function (x, j) { return x - xs[j]; }).join(', ') + ': aumentan de ' + (2 * m) + ' en ' + (2 * m) + '. Sigue ' + xs[5] + ' + ' + (sig - xs[5]) + ' = ' + sig + '.'; }
        else { var u = r.int(1, 3), w = r.int(1, 4); xs = [u, w]; for (i = 2; i < 7; i++) xs.push(xs[i - 1] + xs[i - 2]); sig = xs[5] + xs[6]; n = 7; regla = 'Cada término es la suma de los dos anteriores: ' + xs[5] + ' + ' + xs[6] + ' = ' + sig + '.'; }
      }
      var dif = xs[xs.length - 1] - xs[xs.length - 2];
      return {
        t: 'Continúa la secuencia: ' + xs.map(f).join(', ') + ', ___', ans: sig,
        mal: [xs[xs.length - 1] + dif, sig + 1, sig - 2, xs[xs.length - 1] * 2, sig + dif],
        sol: regla + ' La respuesta es ' + f(sig) + '.'
      };
    }
  });

  J.reg({
    id: 'pat.termino', tema: 'pat', nombre: 'Término lejano de una secuencia', difs: [2, 3],
    gen: function (r, d, L) {
      var a = r.int(1, 15), k = r.int(2, 9), n = d === 2 ? r.int(10, 20) : r.int(25, L === 4 ? 50 : 100);
      var ans = a + (n - 1) * k;
      return {
        t: 'En la secuencia ' + [0, 1, 2, 3].map(function (i) { return f(a + i * k); }).join(', ') + ', … ¿cuál es el término número <b>' + n + '</b>?',
        ans: ans, mal: [a + n * k, n * k, ans - 1, ans + 1, a * n],
        sol: 'Se suma ' + k + ' cada vez. Del 1º al ' + n + 'º hay ' + (n - 1) + ' saltos: ' + a + ' + ' + (n - 1) + ' × ' + k + ' = ' + f(ans) + '.'
      };
    }
  });

  J.reg({
    id: 'pat.ecuacion', tema: 'pat', nombre: 'Ecuaciones de un paso',
    gen: function (r, d, L) {
      var max = L === 4 ? 100 : (d === 1 ? 100 : 1000);
      var x = r.int(2, max * 0.6), a = r.int(2, max * 0.4), tipo = d === 1 ? r.pick(['x+a', 'a+x']) : r.pick(['x+a', 'x-a', 'a-x']);
      if (tipo === 'a-x' && a <= x) { var t = a; a = x + a; x = t; a = Math.max(a, x + 1); }
      var b, txt, sol, malo;
      if (tipo === 'x+a' || tipo === 'a+x') { b = x + a; txt = tipo === 'x+a' ? 'x + ' + f(a) + ' = ' + f(b) : f(a) + ' + x = ' + f(b); sol = 'x = ' + f(b) + ' − ' + f(a) + ' = ' + f(x) + '.'; malo = a + b; }
      else if (tipo === 'x-a') { b = x - a; if (b < 0) { b = x; x = b + a; } txt = 'x − ' + f(a) + ' = ' + f(b); sol = 'x = ' + f(b) + ' + ' + f(a) + ' = ' + f(x) + '.'; malo = Math.abs(b - a); }
      else { b = a - x; txt = f(a) + ' − x = ' + f(b); sol = 'x es lo que se le quitó a ' + f(a) + ' para que quede ' + f(b) + ': x = ' + f(a) + ' − ' + f(b) + ' = ' + f(x) + '.'; malo = a + b; }
      return {
        t: 'Resuelve: <b>' + txt + '</b>', ans: x, mal: [malo, x + 1, x - 10 > 0 ? x - 10 : x + 10, b],
        sol: sol + ' Comprobación: reemplaza x en la ecuación.'
      };
    }
  });

  J.reg({
    id: 'pat.inecuacion', tema: 'pat', nombre: 'Inecuaciones', difs: [2, 3],
    gen: function (r, d, L) {
      var a = r.int(10, L === 4 ? 60 : 300), c = a + r.int(5, 40);
      if (d === 2) {
        return {
          t: '¿Cuál es el <b>mayor</b> número natural n que cumple <b>' + f(a) + ' + n &lt; ' + f(c) + '</b>?',
          ans: c - a - 1, mal: [c - a, c - a + 1, c + a, c - a - 2],
          sol: f(a) + ' + ' + (c - a) + ' = ' + f(c) + ', que no es menor que ' + f(c) + '. Con n = ' + (c - a - 1) + ': ' + f(a) + ' + ' + (c - a - 1) + ' = ' + f(c - 1) + ' &lt; ' + f(c) + '.'
        };
      }
      var lim = c - a;
      var noCumple = lim - r.int(0, 3);
      var cumplen = [lim + 1, lim + r.int(2, 8), lim + r.int(9, 20)];
      return {
        t: '¿Qué valor de n <b>NO</b> cumple <b>' + f(a) + ' + n &gt; ' + f(c) + '</b>?', ans: noCumple, mal: cumplen, soloAlt: true,
        sol: 'Para que ' + f(a) + ' + n sea mayor que ' + f(c) + ', n tiene que ser mayor que ' + lim + '. ' + noCumple + ' no lo es: ' + f(a) + ' + ' + noCumple + ' = ' + f(a + noCumple) + '.'
      };
    }
  });

  J.reg({
    id: 'pat.tabla', tema: 'pat', nombre: 'Tabla con una regla', difs: [2, 3],
    gen: function (r, d, L) {
      var m = r.int(2, d === 2 ? 5 : 9), b = r.int(0, 9) * (r.chance(0.5) ? 1 : 1), N = d === 2 ? r.int(8, 12) : r.int(15, 40);
      var filas = [1, 2, 3, 4].map(function (x) { return [x, m * x + b]; });
      var tabla = '<table class="tbl"><tr><th>Entrada</th>' + filas.map(function (p) { return '<td>' + p[0] + '</td>'; }).join('') + '<td>' + N + '</td></tr>' +
        '<tr><th>Salida</th>' + filas.map(function (p) { return '<td>' + p[1] + '</td>'; }).join('') + '<td>?</td></tr></table>';
      var ans = m * N + b;
      return {
        t: 'Observa la tabla. ¿Qué número va en lugar de <b>?</b>' + tabla, ans: ans,
        mal: [filas[3][1] + m, m * N, ans + m, (m + b) * N],
        sol: 'La salida aumenta de ' + m + ' en ' + m + ', y la regla es «multiplicar por ' + m + (b ? ' y sumar ' + b : '') + '». Con ' + N + ': ' +
          N + ' × ' + m + (b ? ' + ' + b : '') + ' = ' + ans + '.'
      };
    }
  });

  function fosforos(tipo, k) {
    var s = '', w, h = 50;
    if (tipo === 'cuad') {
      w = k * 30 + 10;
      for (var i = 0; i < k; i++) s += S.rect(5 + i * 30, 10, 30, 30, 'none', '#c0392b');
    } else {
      w = (k + 1) * 18 + 10;
      var pts = [];
      for (var j = 0; j < k; j++) {
        var x = 5 + j * 18;
        if (j % 2 === 0) s += S.poli([[x, 42], [x + 36, 42], [x + 18, 10]], 'none', '#c0392b');
        else s += S.poli([[x, 10], [x + 36, 10], [x + 18, 42]], 'none', '#c0392b');
      }
    }
    return { w: w, h: h, s: s };
  }

  J.reg({
    id: 'pat.figuras', tema: 'pat', nombre: 'Secuencia de figuras con palitos', difs: [2, 3],
    gen: function (r, d, L) {
      var tipo = r.pick(['cuad', 'tri']);
      var por = tipo === 'cuad' ? 3 : 2, ini = tipo === 'cuad' ? 4 : 3;
      var total = 0, partes = [];
      for (var k = 1; k <= 3; k++) { var g = fosforos(tipo, k); partes.push(g); total += g.w + 30; }
      var svg = S.abre(total, 80), x = 0;
      partes.forEach(function (g, i) { svg += '<g transform="translate(' + x + ',0)">' + g.s + '</g>' + S.txt(x + g.w / 2, 72, 'Figura ' + (i + 1), { size: 12 }); x += g.w + 30; });
      svg += '</svg>';
      var nom = tipo === 'cuad' ? 'cuadrados' : 'triángulos';
      var N = d === 2 ? r.int(6, 12) : r.int(15, 40);
      var palitos = ini + (N - 1) * por;
      if (d === 3 && r.chance(0.5)) {
        return {
          t: 'Con palitos se arman ' + nom + ' en fila, como en el dibujo. ¿Qué número de figura usa exactamente <b>' + palitos + '</b> palitos?', svg: svg,
          ans: N, mal: [Math.round(palitos / ini), Math.round(palitos / por), N + 1, N - 1],
          sol: 'La figura 1 usa ' + ini + ' palitos y cada figura agrega ' + por + '. ' + palitos + ' − ' + ini + ' = ' + (palitos - ini) + '; ' +
            (palitos - ini) + ' : ' + por + ' = ' + (N - 1) + ' figuras más. Es la figura ' + N + '.'
        };
      }
      return {
        t: 'Con palitos se arman ' + nom + ' en fila, como en el dibujo. ¿Cuántos palitos tiene la figura <b>' + N + '</b>?', svg: svg,
        ans: palitos, mal: [ini * N, por * N, palitos + por, palitos - 1],
        sol: 'La figura 1 usa ' + ini + ' palitos y cada figura nueva agrega ' + por + ' (un lado se comparte). Figura ' + N + ': ' + ini + ' + ' + (N - 1) + ' × ' + por + ' = ' + palitos + '.'
      };
    }
  });

  J.reg({
    id: 'pat.balanza', tema: 'pat', nombre: 'Figuras que valen números', difs: [2, 3],
    gen: function (r, d, L) {
      var A = r.int(2, 12), B = r.int(2, 15);
      if (d === 2) {
        var e1 = 2 * A + B, e2 = A + B, pide = r.pick(['△', '□']);
        return {
          t: 'Si <b>△ + △ + □ = ' + e1 + '</b> y <b>△ + □ = ' + e2 + '</b>, ¿cuánto vale ' + pide + '?', ans: pide === '△' ? A : B,
          mal: [pide === '△' ? B : A, e1 - e2 + 1, e2, Math.round(e1 / 3)],
          sol: 'La primera igualdad tiene un △ más que la segunda: △ = ' + e1 + ' − ' + e2 + ' = ' + A + '. Entonces □ = ' + e2 + ' − ' + A + ' = ' + B + '.'
        };
      }
      if (r.chance(0.5)) {
        var k = r.int(2, 3), tot = A * (k + 1);
        return {
          t: 'Si <b>' + Array(k + 1).join('△ + ').slice(0, -3) + ' = □</b> y <b>□ + △ = ' + tot + '</b>, ¿cuánto vale □?', ans: A * k,
          mal: [A, tot - A + 1, tot / 2, A * (k + 1)],
          sol: '□ equivale a ' + k + ' triángulos, así que □ + △ son ' + (k + 1) + ' triángulos = ' + tot + '. △ = ' + tot + ' : ' + (k + 1) + ' = ' + A + ' y □ = ' + k + ' × ' + A + ' = ' + (A * k) + '.'
        };
      }
      var m = r.int(2, 4), n = r.pick([2, 4, 6]);
      return {
        t: 'En una balanza, ' + m + ' manzanas pesan lo mismo que 1 piña, y 1 piña más 1 manzana pesan lo mismo que ' + (n * (m + 1)) + ' nueces. ¿Cuántas nueces pesan lo mismo que 1 piña?',
        ans: n * m, mal: [n * (m + 1), n, n * (m + 1) - 1, m],
        sol: 'Cambiando la piña por ' + m + ' manzanas: ' + (m + 1) + ' manzanas = ' + (n * (m + 1)) + ' nueces, así que 1 manzana = ' + n + ' nueces. La piña = ' + m + ' manzanas = ' + (n * m) + ' nueces.'
      };
    }
  });

  J.reg({
    id: 'pat.ciclo', tema: 'pat', nombre: 'Patrones que se repiten', difs: [2, 3],
    gen: function (r, d, L) {
      var largo = r.int(3, 5);
      var pool = r.pick([['A', 'B', 'C', 'D', 'E'], ['🔴', '🔵', '🟢', '🟡', '🟣'], ['▲', '■', '●', '★', '◆']]);
      var simb = pool.slice(0, largo);
      if (d === 3 && largo < 5 && r.chance(0.5)) { simb = simb.concat([simb[0]]); largo++; }
      var N = d === 2 ? r.int(15, 40) : r.int(50, 200);
      var pos = (N - 1) % largo;
      var ans = simb[pos];
      var uniq = pool.filter(function (s) { return s !== ans; });
      var serie = [];
      for (var i = 0; i < largo * 2 + 1; i++) serie.push(simb[i % largo]);
      return {
        t: 'Los símbolos se repiten así: ' + serie.join(' ') + ' … ¿Qué símbolo está en el lugar <b>' + N + '</b>?',
        ans: ans, mal: uniq, soloAlt: true,
        sol: 'El grupo que se repite tiene ' + largo + ' símbolos. ' + N + ' = ' + largo + ' × ' + Math.floor((N - 1) / largo) + ' + ' + (pos + 1) +
          ': después de ' + Math.floor((N - 1) / largo) + ' grupos completos toca el lugar ' + (pos + 1) + ' del grupo, que es ' + ans + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
