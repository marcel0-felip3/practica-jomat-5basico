/* Tema: datos y probabilidades (gráficos, pictogramas, tablas, promedio, tallo y hojas, azar). */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, S = J.svg;

  var CATS = [
    ['Fútbol', 'Básquetbol', 'Natación', 'Tenis', 'Vóleibol'],
    ['Manzana', 'Plátano', 'Pera', 'Uva', 'Frutilla'],
    ['Perro', 'Gato', 'Pez', 'Conejo', 'Hámster'],
    ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Morado']
  ];
  var TITULOS = ['Deporte favorito', 'Fruta favorita', 'Mascota preferida', 'Libros prestados en la biblioteca', 'Color favorito'];

  function barras(cats, vals, paso, titulo) {
    var max = Math.ceil(Math.max.apply(null, vals) / paso) * paso + paso;
    var W = 70 + cats.length * 64, H = 210, x0 = 50, y0 = 30, alto = 140;
    var s = S.abre(W, H) + S.txt(W / 2, 16, titulo, { size: 13, bold: true });
    for (var v = 0; v <= max; v += paso) {
      var y = y0 + alto - v / max * alto;
      s += S.linea(x0, y, W - 10, y, '#ddd', 1) + S.txt(x0 - 6, y + 4, f(v), { size: 11, anchor: 'end' });
    }
    cats.forEach(function (c, i) {
      var h = vals[i] / max * alto, x = x0 + 12 + i * 64;
      s += S.rect(x, y0 + alto - h, 40, h, S.COLORES[i % 6], '#555') + S.txt(x + 20, y0 + alto + 16, c, { size: 11 });
    });
    return s + S.linea(x0, y0, x0, y0 + alto, '#333', 1.5) + S.linea(x0, y0 + alto, W - 10, y0 + alto, '#333', 1.5) + '</svg>';
  }

  J.reg({
    id: 'dat.barras', tema: 'dat', nombre: 'Gráfico de barras',
    gen: function (r, d, L) {
      var ic = r.int(0, CATS.length - 1), n = 4, cats = CATS[ic].slice(0, n);
      var paso = d === 1 ? r.pick([1, 2]) : r.pick([2, 5, 10]);
      var vals, mitad = d >= 2 && paso >= 2;
      do {
        vals = cats.map(function () { return r.int(1, 8) * paso + (mitad && r.chance(0.35) ? paso / 2 : 0); });
      } while (new Set(vals).size < n || vals.some(function (v) { return v % 1; }));
      var svg = barras(cats, vals, paso, TITULOS[ic]);
      var tipo = d === 1 ? r.pick(['valor', 'mayor']) : d === 2 ? r.pick(['valor', 'dif', 'total']) : r.pick(['dif', 'total', 'veces']);
      var i = r.int(0, n - 1), j = (i + r.int(1, n - 1)) % n;
      if (tipo === 'veces') {
        var bi = vals.indexOf(Math.max.apply(null, vals)), si = vals.indexOf(Math.min.apply(null, vals));
        if (vals[bi] % vals[si] !== 0 || vals[bi] === vals[si]) tipo = 'dif'; else { i = bi; j = si; }
      }
      var cat = function (k) { return '«' + cats[k] + '»'; };
      if (tipo === 'valor') return { t: 'Según el gráfico, ¿cuánto marca la barra ' + cat(i) + '?', svg: svg, ans: vals[i], mal: [vals[i] + paso, vals[i] - paso / (mitad ? 2 : 1), vals[i] + paso / 2 % 1 ? vals[i] + 1 : vals[i] + paso / 2, vals[j]], sol: 'La escala va de ' + paso + ' en ' + paso + '. La barra ' + cat(i) + ' llega a ' + f(vals[i]) + '.' };
      if (tipo === 'mayor') { var m = vals.indexOf(Math.max.apply(null, vals)); return { t: '¿Qué opción tiene el valor más alto en el gráfico?', svg: svg, ans: cats[m], mal: cats.filter(function (_, k) { return k !== m; }), soloAlt: true, sol: 'La barra más alta es ' + cat(m) + ', con ' + f(vals[m]) + '.' }; }
      if (tipo === 'dif') { var a = Math.max(vals[i], vals[j]), b = Math.min(vals[i], vals[j]); return { t: '¿Cuánto más marca ' + cat(vals.indexOf(a)) + ' que ' + cat(vals.indexOf(b)) + '?', svg: svg, ans: a - b, mal: [a + b, a, a - b + paso, b], sol: f(a) + ' − ' + f(b) + ' = ' + f(a - b) + '.' }; }
      if (tipo === 'total') { var tot = vals.reduce(function (x, y) { return x + y; }, 0); return { t: '¿Cuál es el total de todos los datos del gráfico?', svg: svg, ans: tot, mal: [tot + paso, tot - paso, n, Math.max.apply(null, vals)], sol: 'Se suman todas las barras: ' + vals.map(f).join(' + ') + ' = ' + f(tot) + '.' }; }
      return { t: '¿Cuántas veces cabe ' + cat(j) + ' en ' + cat(i) + '? (¿Cuántas veces mayor es?)', svg: svg, ans: vals[i] / vals[j], mal: [vals[i] - vals[j], vals[i] / vals[j] + 1, vals[i] / vals[j] * 2], sol: f(vals[i]) + ' : ' + f(vals[j]) + ' = ' + f(vals[i] / vals[j]) + ' veces.' };
    }
  });

  function iconos(n, medio) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<span class="ico">☺</span>';
    if (medio) s += '<span class="ico medio">☺</span>';
    return s;
  }
  J.reg({
    id: 'dat.pictograma', tema: 'dat', nombre: 'Pictogramas', niv: [4, 5], difs: [1, 2],
    gen: function (r, d, L) {
      var ic = r.int(0, 2), cats = CATS[ic].slice(0, 4), k = r.pick(d === 1 ? [2, 5, 10] : [4, 6, 10]);
      var cant = cats.map(function () { return r.int(1, 6); }), medios = cats.map(function () { return d === 2 && r.chance(0.5); });
      var vals = cant.map(function (c, i) { return c * k + (medios[i] ? k / 2 : 0); });
      var html = '<table class="tbl picto"><caption>' + TITULOS[ic] + ' — cada ☺ representa ' + k + ' niños' + (d === 2 ? ' (medio ☺ representa ' + (k / 2) + ')' : '') + '</caption>' +
        cats.map(function (c, i) { return '<tr><th>' + c + '</th><td>' + iconos(cant[i], medios[i]) + '</td></tr>'; }).join('') + '</table>';
      var i = r.int(0, 3);
      if (d === 2 && r.chance(0.5)) {
        var tot = vals.reduce(function (a, b) { return a + b; }, 0);
        return { t: '¿Cuántos niños respondieron en total?' + html, ans: tot, mal: [cant.reduce(function (a, b) { return a + b; }, 0), tot + k, tot - k / 2, tot * 2],
          sol: 'Valores: ' + vals.map(f).join(' + ') + ' = ' + f(tot) + ' niños.' };
      }
      return {
        t: '¿Cuántos niños eligieron <b>' + cats[i] + '</b>?' + html, ans: vals[i], mal: [cant[i] + (medios[i] ? 1 : 0), vals[i] + k, cant[i] * k + k, vals[i] - 1],
        sol: cats[i] + ' tiene ' + cant[i] + ' símbolo' + (cant[i] > 1 ? 's' : '') + (medios[i] ? ' y medio' : '') + ': ' + cant[i] + ' × ' + k + (medios[i] ? ' + ' + (k / 2) : '') + ' = ' + vals[i] + ' niños.'
      };
    }
  });

  J.reg({
    id: 'dat.tabla', tema: 'dat', nombre: 'Tablas de datos', difs: [1, 2],
    gen: function (r, d, L) {
      var ic = r.int(0, 2), cats = CATS[ic].slice(0, 4);
      var vals = cats.map(function () { return r.int(3, d === 1 ? 15 : 40); });
      while (new Set(vals).size < 4) vals[r.int(0, 3)] += 1;
      var html = '<table class="tbl"><caption>' + TITULOS[ic] + '</caption><tr><th>Opción</th><th>Votos</th></tr>' +
        cats.map(function (c, i) { return '<tr><td>' + c + '</td><td>' + vals[i] + '</td></tr>'; }).join('') + '</table>';
      var tot = vals.reduce(function (a, b) { return a + b; }, 0);
      if (r.chance(0.5)) return { t: 'Según la tabla, ¿cuántas personas votaron en total?' + html, ans: tot, mal: [4, tot - 1, tot + 10, Math.max.apply(null, vals)], sol: vals.join(' + ') + ' = ' + tot + '. (4 es la cantidad de opciones, no de personas.)' };
      var a = r.int(0, 3), b = (a + 1 + r.int(0, 2)) % 4, mx = Math.max(vals[a], vals[b]), mn = Math.min(vals[a], vals[b]);
      var A = cats[vals.indexOf(mx)], B = cats[vals.indexOf(mn)];
      return { t: '¿Cuántos votos más tiene <b>' + A + '</b> que <b>' + B + '</b>?' + html, ans: mx - mn, mal: [mx + mn, mx, mn, mx - mn + 1], sol: mx + ' − ' + mn + ' = ' + (mx - mn) + '.' };
    }
  });

  var COLORES = ['rojas', 'azules', 'verdes', 'amarillas', 'blancas'];
  var MASC = { rojas: ['rojo', 'rojos'], azules: ['azul', 'azules'], verdes: ['verde', 'verdes'], amarillas: ['amarillo', 'amarillos'], blancas: ['blanco', 'blancos'] };
  J.reg({
    id: 'dat.probabilidad', tema: 'dat', nombre: 'Probabilidades (comparar)',
    gen: function (r, d, L) {
      var tipo = d === 1 ? r.pick(['bolsa', 'clasifica']) : d === 2 ? r.pick(['bolsa', 'dado', 'clasifica']) : r.pick(['dado', 'compara', 'dos_dados']);
      if (tipo === 'bolsa') {
        var cs = r.sample(COLORES, 3), ns = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3), mx = ns.indexOf(Math.max.apply(null, ns));
        var menos = r.chance(0.4) && d === 2, mn = ns.indexOf(Math.min.apply(null, ns)), k = menos ? mn : mx;
        return {
          t: 'En una bolsa hay ' + cs.map(function (c, i) { return ns[i] + ' bolitas ' + c; }).join(', ').replace(/, ([^,]*)$/, ' y $1') + '. Sin mirar, ¿de qué color es <b>' + (menos ? 'menos' : 'más') + ' probable</b> sacar una bolita?',
          ans: J.mayus(cs[k]), mal: cs.filter(function (_, i) { return i !== k; }).map(J.mayus).concat(['Todos son igual de probables']), soloAlt: true,
          sol: 'Es ' + (menos ? 'menos' : 'más') + ' probable el color que tiene ' + (menos ? 'menos' : 'más') + ' bolitas: ' + cs[k] + ' (' + ns[k] + ').'
        };
      }
      if (tipo === 'clasifica') {
        var casos = [['sacar un 7 al lanzar un dado común', 'Imposible'], ['sacar un número menor que 7 al lanzar un dado común', 'Seguro'], ['sacar un número par al lanzar un dado común', 'Posible'],
          ['que mañana el sol salga por el oeste', 'Imposible'], ['sacar una bolita roja de una bolsa que solo tiene bolitas rojas', 'Seguro'], ['sacar cara al lanzar una moneda', 'Posible'],
          ['sacar una bolita azul de una bolsa con 9 rojas y 1 azul', 'Poco posible'], ['sacar una bolita verde de una bolsa con solo bolitas amarillas', 'Imposible']];
        var c = r.pick(casos);
        return { t: '¿Cómo es el suceso «' + c[0] + '»?', ans: c[1], mal: ['Seguro', 'Posible', 'Imposible', 'Poco posible'].filter(function (x) { return x !== c[1]; }), soloAlt: true,
          sol: 'Seguro: siempre ocurre. Imposible: nunca ocurre. Posible: puede ocurrir o no. En este caso es «' + c[1].toLowerCase() + '».' };
      }
      if (tipo === 'dado') {
        var evs = [['sacar un número par', [2, 4, 6]], ['sacar un número mayor que 4', [5, 6]], ['sacar un número menor que 3', [1, 2]], ['sacar un 6', [6]], ['sacar un número impar', [1, 3, 5]], ['sacar un número mayor que 2', [3, 4, 5, 6]], ['sacar un múltiplo de 3', [3, 6]]];
        var e = r.sample(evs, 2);
        while (e[0][1].length === e[1][1].length) e = r.sample(evs, 2);
        var gana = e[0][1].length > e[1][1].length ? 0 : 1;
        return { t: 'Al lanzar un dado común, ¿qué es más probable: <b>' + e[0][0] + '</b> o <b>' + e[1][0] + '</b>?', ans: J.mayus(e[gana][0]), mal: [J.mayus(e[1 - gana][0]), 'Son igual de probables', 'No se puede saber'], soloAlt: true,
          sol: 'Se cuentan los casos favorables: «' + e[0][0] + '» tiene ' + e[0][1].length + ' (' + e[0][1].join(', ') + ') y «' + e[1][0] + '» tiene ' + e[1][1].length + ' (' + e[1][1].join(', ') + '). Gana el que tiene más casos.' };
      }
      if (tipo === 'dos_dados') {
        var cuenta = {}; for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) cuenta[a + b] = (cuenta[a + b] || 0) + 1;
        var x = r.sample([2, 3, 4, 5, 6, 8, 9, 10, 11, 12], 3).concat([7]);
        return { t: 'Se lanzan dos dados y se suman los puntos. ¿Qué suma es la más probable?', ans: 7, mal: x.filter(function (v) { return v !== 7; }), soloAlt: true,
          sol: 'El 7 se puede formar de 6 maneras (1+6, 2+5, 3+4, 4+3, 5+2, 6+1); por ejemplo, el ' + x[0] + ' se forma de ' + cuenta[x[0]] + ' manera' + (cuenta[x[0]] > 1 ? 's' : '') + '. Ninguna otra suma tiene tantas.' };
      }
      var A = [r.int(2, 5), r.int(2, 5)], B = [A[0] * 2, A[1] * 2 + (r.chance(0.5) ? 1 : -1)];
      var pa = A[0] / (A[0] + A[1]), pb = B[0] / (B[0] + B[1]);
      var ganaA = pa > pb;
      return {
        t: 'La bolsa A tiene ' + A[0] + ' bolitas rojas y ' + A[1] + ' azules. La bolsa B tiene ' + B[0] + ' rojas y ' + B[1] + ' azules. ¿En qué bolsa es más probable sacar una bolita <b>roja</b>?',
        ans: ganaA ? 'En la bolsa A' : 'En la bolsa B', mal: [ganaA ? 'En la bolsa B' : 'En la bolsa A', 'En las dos es igual de probable', 'No se puede saber'], soloAlt: true,
        sol: 'Hay que comparar las rojas con el total de cada bolsa, no solo la cantidad de rojas. A: ' + A[0] + ' de ' + (A[0] + A[1]) + '. B: ' + B[0] + ' de ' + (B[0] + B[1]) +
          '. Si B tuviera ' + (A[1] * 2) + ' azules sería igual que A (el doble de todo); como tiene ' + (B[1] > A[1] * 2 ? 'más' : 'menos') + ' azules, la roja es ' + (ganaA ? 'menos' : 'más') + ' probable en B.'
      };
    }
  });

  J.reg({
    id: 'dat.peor_caso', tema: 'dat', nombre: 'Peor caso (estar seguro)', difs: [3],
    gen: function (r, d, L) {
      var cs = r.sample(COLORES, r.int(2, 3)), ns = cs.map(function () { return r.int(3, 9); });
      var tipo = r.pick(['uno', 'par', 'dos']);
      var lista = cs.map(function (c, i) { return ns[i] + ' calcetines ' + MASC[c][1]; });
      var nomC = cs.map(function (c) { return MASC[c][1]; }), sing = cs.map(function (c) { return MASC[c][0]; });
      var tot = ns.reduce(function (a, b) { return a + b; }, 0), ans, sol, t;
      var intro = 'En un cajón hay ' + lista.join(', ').replace(/, ([^,]*)$/, ' y $1') + ', mezclados. A oscuras, ';
      if (tipo === 'uno') {
        var k = r.int(0, cs.length - 1); ans = tot - ns[k] + 1;
        t = intro + '¿cuántos calcetines hay que sacar, como mínimo, para estar seguros de tener al menos uno <b>' + sing[k] + '</b>?';
        sol = 'Peor caso: salen primero todos los que no son ' + nomC[k] + ' (' + (tot - ns[k]) + '). El siguiente tiene que ser ' + sing[k] + ': ' + ans + '.';
      } else if (tipo === 'par') {
        ans = cs.length + 1;
        t = intro + '¿cuántos calcetines hay que sacar, como mínimo, para estar seguros de tener <b>un par del mismo color</b>?';
        sol = 'Peor caso: sale uno de cada color (' + cs.length + '). El siguiente repite algún color: ' + ans + '.';
      } else {
        var k2 = r.int(0, cs.length - 1); ans = tot - ns[k2] + 2;
        t = intro + '¿cuántos calcetines hay que sacar, como mínimo, para estar seguros de tener <b>dos ' + nomC[k2] + '</b>?';
        sol = 'Peor caso: salen primero todos los otros (' + (tot - ns[k2]) + '); después hacen falta 2 ' + nomC[k2] + ': ' + ans + '.';
      }
      return { t: t, ans: ans, mal: [ans - 1, tot, 2, ans + 1, cs.length], sol: sol };
    }
  });

  J.reg({
    id: 'dat.promedio', tema: 'dat', nombre: 'Promedio', niv: [5],
    gen: function (r, d) {
      var n = r.int(3, 6), prom = r.int(4, 20), xs = [];
      for (var i = 0; i < n - 1; i++) xs.push(prom + r.int(-4, 4));
      var ultimo = prom * n - xs.reduce(function (a, b) { return a + b; }, 0);
      if (ultimo < 1) { xs = xs.map(function () { return prom; }); ultimo = prom; }
      xs.push(ultimo); xs = r.shuffle(xs);
      var suma = prom * n;
      if (d === 1) return { t: 'Calcula el promedio de: ' + xs.join(', ') + '.', ans: prom, mal: [suma, prom + 1, Math.max.apply(null, xs), J.redo(suma / (n + 1))], sol: 'Se suman los datos (' + suma + ') y se divide por la cantidad (' + n + '): ' + suma + ' : ' + n + ' = ' + prom + '.' };
      if (d === 2) {
        if (r.chance(0.5)) {
          var notas = [r.int(50, 68), r.int(50, 68), r.int(45, 70)], pn = r.int(52, 65), cuarta = pn * 4 - notas.reduce(function (a, b) { return a + b; }, 0);
          if (cuarta >= 10 && cuarta <= 70) {
            return { t: 'El promedio de 4 notas es ' + f(pn / 10) + '. Tres de ellas son ' + notas.map(function (x) { return f(x / 10); }).join('; ') + '. ¿Cuál es la cuarta nota?', ans: J.redo(cuarta / 10),
              mal: [J.redo(pn / 10), J.redo(cuarta / 10 + 0.1), J.redo((pn * 3 - notas[0] - notas[1]) / 10 > 0 ? (pn * 3 - notas[0] - notas[1]) / 10 : 1), J.redo(cuarta / 10 - 0.5)],
              sol: 'Las 4 notas suman 4 × ' + f(pn / 10) + ' = ' + f(pn * 4 / 10) + '. Las tres conocidas suman ' + f(notas.reduce(function (a, b) { return a + b; }, 0) / 10) + '. Falta ' + f(cuarta / 10) + '.' };
          }
        }
        var falt = xs.pop();
        return { t: 'El promedio de ' + n + ' números es ' + prom + '. Si ' + (n - 1) + ' de ellos son ' + xs.join(', ') + ', ¿cuál es el que falta?', ans: falt,
          mal: [prom, suma, falt + 1, Math.abs(suma - falt - prom)], sol: 'Los ' + n + ' números suman ' + n + ' × ' + prom + ' = ' + suma + '. Los conocidos suman ' + (suma - falt) + '. Falta ' + suma + ' − ' + (suma - falt) + ' = ' + falt + '.' };
      }
      var nuevo = r.int(prom + 1, prom + 12), nTot = suma + nuevo;
      while (nTot % (n + 1)) { nuevo++; nTot++; }
      return { t: 'El promedio de ' + n + ' números es ' + prom + '. Si se agrega el número ' + nuevo + ', ¿cuál es el nuevo promedio?', ans: nTot / (n + 1),
        mal: [J.redo((prom + nuevo) / 2), prom + 1 === nTot / (n + 1) ? prom + 2 : prom + 1, nTot, prom], sol: 'Los ' + n + ' números suman ' + suma + '. Con el ' + nuevo + ' suman ' + nTot + ', y ' + nTot + ' : ' + (n + 1) + ' = ' + (nTot / (n + 1)) + '. (No sirve promediar ' + prom + ' y ' + nuevo + '.)' };
    }
  });

  J.reg({
    id: 'dat.tallo', tema: 'dat', nombre: 'Diagrama de tallo y hojas', niv: [5], difs: [1, 2, 3],
    gen: function (r, d) {
      var tallos = d === 1 ? [1, 2, 3] : [1, 2, 3, 4], datos = [];
      tallos.forEach(function (t) { var k = r.int(1, 4); for (var i = 0; i < k; i++) datos.push(t * 10 + r.int(0, 9)); });
      datos.sort(function (a, b) { return a - b; });
      var html = '<table class="tbl tallo"><tr><th>Tallo</th><th>Hojas</th></tr>' + tallos.map(function (t) {
        return '<tr><td>' + t + '</td><td>' + datos.filter(function (x) { return Math.floor(x / 10) === t; }).map(function (x) { return x % 10; }).join(' ') + '</td></tr>';
      }).join('') + '</table><p class="nota">Ejemplo: 2 | 5 representa 25.</p>';
      var tipo = d === 1 ? r.pick(['max', 'min', 'n']) : d === 2 ? r.pick(['mayores', 'rango']) : r.pick(['mayores', 'mediana']);
      if (tipo === 'mediana' && datos.length % 2 === 0) tipo = 'mayores';
      var xs = datos;
      if (tipo === 'max') return { t: '¿Cuál es el dato mayor?' + html, ans: xs[xs.length - 1], mal: [xs[xs.length - 2], Math.floor(xs[xs.length - 1] / 10), xs[0]], sol: 'Último tallo y última hoja: ' + xs[xs.length - 1] + '.' };
      if (tipo === 'min') return { t: '¿Cuál es el dato menor?' + html, ans: xs[0], mal: [xs[1], xs[0] % 10, xs[xs.length - 1]], sol: 'Primer tallo y primera hoja: ' + xs[0] + '.' };
      if (tipo === 'n') return { t: '¿Cuántos datos hay en el diagrama?' + html, ans: xs.length, mal: [tallos.length, xs.length + 1, xs.length - 1], sol: 'Cada hoja es un dato: hay ' + xs.length + '.' };
      if (tipo === 'rango') return { t: '¿Cuál es la diferencia entre el dato mayor y el menor?' + html, ans: xs[xs.length - 1] - xs[0], mal: [xs[xs.length - 1], xs[xs.length - 1] + xs[0], tallos.length], sol: xs[xs.length - 1] + ' − ' + xs[0] + ' = ' + (xs[xs.length - 1] - xs[0]) + '.' };
      if (tipo === 'mediana') { var m = xs[(xs.length - 1) / 2]; return { t: 'Si se ordenan todos los datos, ¿cuál queda justo en el medio?' + html, ans: m, mal: [xs[(xs.length - 1) / 2 + 1], xs[(xs.length - 1) / 2 - 1], J.redo(xs.reduce(function (a, b) { return a + b; }, 0) / xs.length)], sol: 'Hay ' + xs.length + ' datos ya ordenados en el diagrama; el del medio es el número ' + ((xs.length + 1) / 2) + ': ' + m + '.' }; }
      var lim = r.pick(xs.slice(1, -1).concat([tallos[1] * 10]));
      var c = xs.filter(function (x) { return x > lim; }).length;
      return { t: '¿Cuántos datos son <b>mayores que ' + lim + '</b>?' + html, ans: c, mal: [c + 1, c - 1, xs.length - c], sol: 'Se cuentan los datos que superan a ' + lim + ' (sin contar el ' + lim + '): ' + xs.filter(function (x) { return x > lim; }).join(', ') + '. Son ' + c + '.' };
    }
  });

  J.reg({
    id: 'dat.linea', tema: 'dat', nombre: 'Gráfico de línea', niv: [5], difs: [2, 3],
    gen: function (r, d) {
      var horas = ['8:00', '10:00', '12:00', '14:00', '16:00'], temps = [r.int(5, 12)];
      for (var i = 1; i < 5; i++) temps.push(Math.max(0, temps[i - 1] + (i < 3 ? r.int(1, 7) : r.int(-6, 4))));
      var difs = temps.slice(1).map(function (t, i) { return t - temps[i]; });
      var mx = Math.max.apply(null, difs);
      while (difs.filter(function (x) { return x === mx; }).length > 1) { temps[1] += 1; difs = temps.slice(1).map(function (t, k) { return t - temps[k]; }); mx = Math.max.apply(null, difs); }
      var max = Math.ceil((Math.max.apply(null, temps) + 2) / 5) * 5, W = 340, H = 200, x0 = 45, y0 = 25, alto = 140, ancho = 270;
      var s = S.abre(W, H) + S.txt(W / 2, 14, 'Temperatura (°C) durante el día', { size: 13, bold: true });
      for (var v = 0; v <= max; v += 5) { var y = y0 + alto - v / max * alto; s += S.linea(x0, y, x0 + ancho, y, '#ddd', 1) + S.txt(x0 - 6, y + 4, v, { size: 11, anchor: 'end' }); }
      var pts = temps.map(function (t, k) { return [x0 + 20 + k * 58, y0 + alto - t / max * alto]; });
      s += '<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="none" stroke="#c0392b" stroke-width="2.5"/>';
      pts.forEach(function (p, k) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#c0392b"/>' + S.txt(p[0], p[1] - 9, temps[k], { size: 11 }) + S.txt(p[0], y0 + alto + 16, horas[k], { size: 11 }); });
      s += '</svg>';
      var k = difs.indexOf(mx);
      var tramos = difs.map(function (_, j) { return 'Entre las ' + horas[j] + ' y las ' + horas[j + 1]; });
      if (d === 2 && r.chance(0.5)) {
        var a = r.int(0, 3), b = r.int(a + 1, 4);
        return { t: '¿Cuántos grados cambió la temperatura entre las ' + horas[a] + ' y las ' + horas[b] + '?', svg: s, ans: Math.abs(temps[b] - temps[a]),
          mal: [temps[b], temps[a], temps[a] + temps[b], Math.abs(temps[b] - temps[a]) + 1], sol: 'A las ' + horas[a] + ' había ' + temps[a] + ' °C y a las ' + horas[b] + ', ' + temps[b] + ' °C. Diferencia: ' + Math.abs(temps[b] - temps[a]) + ' °C.' };
      }
      return { t: '¿En qué tramo <b>subió más</b> la temperatura?', svg: s, ans: tramos[k], mal: tramos.filter(function (_, j) { return j !== k; }), soloAlt: true,
        sol: 'Cambios: ' + difs.map(function (x, j) { return horas[j] + '→' + horas[j + 1] + ': ' + (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x); }).join('; ') + '. El mayor aumento es ' + mx + ' °C (el tramo más empinado hacia arriba).' };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
