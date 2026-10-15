/* Tema: lógica y conteo (problemas tipo olimpiada). */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, S = J.svg;

  J.reg({
    id: 'log.saludos', tema: 'log', nombre: 'Saludos y partidos', difs: [2, 3],
    gen: function (r, d, L) {
      var n = d === 2 ? r.int(4, 6) : r.int(6, L === 4 ? 8 : 12);
      var ans = n * (n - 1) / 2, partido = r.chance(0.5);
      var lst = []; for (var i = n - 1; i >= 1; i--) lst.push(i);
      return {
        t: partido ? 'En un torneo de ' + n + ' equipos, cada equipo juega una vez contra cada uno de los otros. ¿Cuántos partidos se juegan?'
          : 'En una reunión hay ' + n + ' personas y cada una saluda con la mano a todas las demás una sola vez. ¿Cuántos saludos hay?',
        ans: ans, mal: [n * (n - 1), n * n, n - 1, ans + n],
        sol: 'Lista ordenada: el primero ' + (partido ? 'juega' : 'saluda') + ' con ' + (n - 1) + ', el segundo con ' + (n - 2) + ' nuevos, y así: ' + lst.join(' + ') + ' = ' + ans +
          '. (También: ' + n + ' × ' + (n - 1) + ' : 2, porque cada ' + (partido ? 'partido' : 'saludo') + ' se contaría dos veces.)'
      };
    }
  });

  J.reg({
    id: 'log.numeros_cifras', tema: 'log', nombre: 'Contar números que se pueden formar', difs: [2, 3],
    gen: function (r, d, L) {
      var k = d === 2 ? 3 : 4, conCero = d === 3 && r.chance(0.6);
      var ds = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], conCero ? k - 1 : k);
      if (conCero) ds.push(0);
      ds.sort();
      var largo = d === 2 ? 3 : (r.chance(0.5) ? 3 : k);
      var cuenta = 0, ej = [];
      (function rec(pref, resto) {
        if (pref.length === largo) { if (pref[0] !== 0) { cuenta++; if (ej.length < 6) ej.push(pref.join('')); } return; }
        resto.forEach(function (x, i) { rec(pref.concat([x]), resto.slice(0, i).concat(resto.slice(i + 1))); });
      })([], ds);
      var sinRestr = 1; for (var i = 0; i < largo; i++) sinRestr *= ds.length - i;
      return {
        t: '¿Cuántos números de ' + largo + ' cifras <b>distintas</b> se pueden formar con las cifras ' + ds.join(', ').replace(/, (\d)$/, ' y $1') + '?',
        ans: cuenta, mal: [sinRestr === cuenta ? cuenta + largo : sinRestr, cuenta - 1, Math.pow(ds.length, largo), ds.length * largo],
        sol: conCero ? 'La primera cifra no puede ser 0: ' + (ds.length - 1) + ' opciones. Después quedan ' + (ds.length - 1) + ', ' + (ds.length - 2) + '… opciones. Total: ' + cuenta + '.'
          : 'Para la primera cifra hay ' + ds.length + ' opciones, para la segunda ' + (ds.length - 1) + (largo > 2 ? ', para la tercera ' + (ds.length - 2) : '') + (largo > 3 ? ' y para la cuarta ' + (ds.length - 3) : '') +
          ': se multiplican y dan ' + cuenta + '. Ejemplos: ' + ej.join(', ') + '…'
      };
    }
  });

  J.reg({
    id: 'log.cabezas_patas', tema: 'log', nombre: 'Cabezas y patas', difs: [3],
    gen: function (r, d, L) {
      var H = r.int(6, L === 4 ? 15 : 30), c = r.int(1, H - 1), g = H - c, P = 4 * c + 2 * g, pide = r.pick(['conejos', 'gallinas']);
      return {
        t: 'En un corral hay gallinas y conejos. En total hay ' + H + ' cabezas y ' + P + ' patas. ¿' + (pide === 'conejos' ? 'Cuántos' : 'Cuántas') + ' <b>' + pide + '</b> hay?',
        ans: pide === 'conejos' ? c : g, mal: [pide === 'conejos' ? g : c, Math.round(P / 4), P / 2 - H, H / 2 === Math.floor(H / 2) ? H / 2 : H - 1],
        sol: 'Si todos fueran gallinas habría ' + (2 * H) + ' patas. Faltan ' + (P - 2 * H) + ', y cada conejo agrega 2 patas más: ' + (P - 2 * H) + ' : 2 = ' + c + ' conejos. Gallinas: ' + H + ' − ' + c + ' = ' + g + '.'
      };
    }
  });

  J.reg({
    id: 'log.monedas', tema: 'log', nombre: 'Monedas', difs: [2, 3],
    gen: function (r, d, L) {
      var par = r.pick([[10, 50], [50, 100], [100, 500], [10, 100]]), n = r.int(5, 12), b = r.int(1, n - 1), a = n - b;
      var S0 = a * par[0] + b * par[1];
      return {
        t: 'Tengo solo monedas de $' + par[0] + ' y de $' + f(par[1]) + ': son ' + n + ' monedas que suman ' + J.plata(S0) + '. ¿Cuántas monedas de <b>$' + f(par[1]) + '</b> tengo?',
        ans: b, mal: [a, Math.floor(S0 / par[1]), b + 1, n - b + 1],
        sol: 'Si todas fueran de $' + par[0] + ' tendría ' + J.plata(n * par[0]) + '. Faltan ' + J.plata(S0 - n * par[0]) + ', y cada moneda de $' + f(par[1]) + ' aporta ' + J.plata(par[1] - par[0]) +
          ' más: ' + f(S0 - n * par[0]) + ' : ' + f(par[1] - par[0]) + ' = ' + b + '. Comprobación: ' + a + ' × ' + par[0] + ' + ' + b + ' × ' + f(par[1]) + ' = ' + f(S0) + '.'
      };
    }
  });

  J.reg({
    id: 'log.edades', tema: 'log', nombre: 'Edades',
    gen: function (r, d, L) {
      var tipo = d === 1 ? 'dif' : d === 2 ? r.pick(['suma', 'consec']) : r.pick(['veces', 'consec']);
      var nom = J.nombre(r);
      if (tipo === 'dif') {
        var e = r.int(6, 11), p = e + r.int(22, 35), k = r.int(3, 10);
        return { t: nom + ' tiene ' + e + ' años y su mamá ' + p + '. ¿Cuántos años tendrá la mamá cuando ' + nom + ' tenga ' + (e + k) + '?', ans: p + k, mal: [p, p + k + 1, e + k + p - e - k + e, p - k],
          sol: 'La diferencia de edad no cambia: ' + p + ' − ' + e + ' = ' + (p - e) + ' años. Cuando ' + nom + ' tenga ' + (e + k) + ', la mamá tendrá ' + (e + k) + ' + ' + (p - e) + ' = ' + (p + k) + '.' };
      }
      if (tipo === 'suma') {
        var s = r.int(30, 60), k2 = r.int(2, 10), m = r.int(2, 3);
        return { t: 'Hoy ' + (m === 2 ? nom + ' y su papá' : nom + ', su papá y su mamá') + ' suman ' + s + ' años entre ' + (m === 2 ? 'los dos' : 'los tres') + '. ¿Cuánto sumarán sus edades dentro de ' + k2 + ' años?',
          ans: s + m * k2, mal: [s + k2, s + 2 * k2 === s + m * k2 ? s + 3 * k2 + 1 : s + 2 * k2, s * 2, s + k2 + 1], sol: 'Cada persona cumple ' + k2 + ' años más: ' + s + ' + ' + m + ' × ' + k2 + ' = ' + (s + m * k2) + '.' };
      }
      if (tipo === 'consec') {
        var n = r.int(3, 4), x = r.int(4, 12), sum = 0; for (var i = 0; i < n; i++) sum += x + i;
        var pideMayor = r.chance(0.5);
        return { t: 'La suma de las edades de ' + n + ' hermanos es ' + sum + ' y sus edades son números consecutivos. ¿Cuántos años tiene el <b>' + (pideMayor ? 'mayor' : 'menor') + '</b>?',
          ans: pideMayor ? x + n - 1 : x, mal: [pideMayor ? x : x + n - 1, Math.round(sum / n), sum / n + n, x + 1 === (pideMayor ? x + n - 1 : x) ? x + 2 : x + 1],
          sol: 'Si todos tuvieran la edad del menor, sobrarían ' + (n * (n - 1) / 2) + ' años (0 + 1' + (n > 2 ? ' + 2' : '') + (n > 3 ? ' + 3' : '') + '). ' + sum + ' − ' + (n * (n - 1) / 2) + ' = ' + (n * x) +
            ', y ' + (n * x) + ' : ' + n + ' = ' + x + '. Edades: ' + Array.from({ length: n }, function (_, j) { return x + j; }).join(', ') + '.' };
      }
      var hijo = r.int(4, 10), v = r.int(3, 5), papa = hijo * v, anos = r.int(2, 6);
      return { t: 'Hoy el papá de ' + nom + ' tiene ' + v + ' veces la edad de ' + nom + '. Si ' + nom + ' tiene ' + hijo + ' años, ¿cuántos años tendrá el papá dentro de ' + anos + ' años?',
        ans: papa + anos, mal: [(hijo + anos) * v, papa, papa + anos * v, hijo * (v + anos)], sol: 'Hoy el papá tiene ' + v + ' × ' + hijo + ' = ' + papa + ' años. Dentro de ' + anos + ' años tendrá ' + (papa + anos) + '. (No se multiplica de nuevo: los dos cumplen la misma cantidad de años.)' };
    }
  });

  J.reg({
    id: 'log.ordenar', tema: 'log', nombre: 'Ordenar con pistas',
    gen: function (r, d, L) {
      var n = d === 1 ? 3 : 4, noms = J.NOMBRES_A.length ? r.sample(J.NOMBRES_A, n) : [];
      var rasgo = r.pick([['alta', 'baja', 'más alta', 'más baja'], ['rápida', 'lenta', 'más rápida', 'más lenta']]);
      var orden = r.shuffle(noms); // de mayor a menor
      var pistas = [];
      for (var i = 0; i < n - 1; i++) {
        if (r.chance(0.5)) pistas.push(orden[i] + ' es más ' + rasgo[0] + ' que ' + orden[i + 1] + '.');
        else pistas.push(orden[i + 1] + ' es más ' + rasgo[1] + ' que ' + orden[i] + '.');
      }
      pistas = r.shuffle(pistas);
      var pide = d === 3 ? r.pick(['segunda', 'tercera']) : r.pick(['primera', 'ultima']);
      var idx = { primera: 0, ultima: n - 1, segunda: 1, tercera: 2 }[pide];
      var pregunta = { primera: 'la ' + rasgo[2], ultima: 'la ' + rasgo[3], segunda: 'la segunda ' + rasgo[2], tercera: 'la tercera ' + rasgo[2] }[pide];
      return {
        t: pistas.join(' ') + ' ¿Quién es <b>' + pregunta + '</b>?', ans: orden[idx], mal: orden.filter(function (_, k) { return k !== idx; }).concat(['No se puede saber']), soloAlt: true,
        sol: 'Ordenando de la ' + rasgo[2] + ' a la ' + rasgo[3] + ': ' + orden.join(' > ') + '. ' + J.mayus(pregunta) + ' es ' + orden[idx] + '.'
      };
    }
  });

  J.reg({
    id: 'log.caracol', tema: 'log', nombre: 'El caracol que sube y resbala', difs: [3],
    gen: function (r, d, L) {
      var sube = r.int(3, 6), baja = r.int(1, sube - 1), H = r.int(sube + 3, L === 4 ? 15 : 30);
      var avance = sube - baja, dia = 1, pos = 0;
      while (true) { if (pos + sube >= H) break; pos += avance; dia++; }
      return {
        t: 'Un caracol está al pie de un muro de ' + H + ' m. De día sube ' + sube + ' m y de noche resbala ' + baja + ' m. ¿En qué día llega arriba?',
        ans: dia, mal: [Math.ceil(H / avance), dia + 1, dia - 1, Math.ceil(H / sube)],
        sol: 'Cada día completo avanza ' + avance + ' m. Al empezar el día ' + dia + ' está a ' + pos + ' m, y ese día sube ' + sube + ' m: llega a ' + (pos + sube) + ' m ≥ ' + H + ' m, sin alcanzar a resbalar. ' +
          '(Error típico: dividir ' + H + ' : ' + avance + ', olvidando que el último día no resbala.)'
      };
    }
  });

  J.reg({
    id: 'log.paginas', tema: 'log', nombre: 'Cifras para numerar páginas', difs: [3],
    gen: function (r, d, L) {
      var N = L === 4 ? r.int(20, 99) : r.int(100, 300), c = 0;
      for (var i = 1; i <= N; i++) c += String(i).length;
      var t1 = Math.min(N, 9), t2 = Math.max(0, Math.min(N, 99) - 9), t3 = Math.max(0, N - 99);
      return {
        t: 'Para numerar las páginas de un libro de la 1 a la ' + N + ', ¿cuántas cifras se escriben en total?', ans: c, mal: [N, 2 * N, c - 9, c + t2],
        sol: 'Del 1 al 9: ' + t1 + ' cifras. Del 10 al ' + Math.min(N, 99) + ': ' + t2 + ' números de 2 cifras = ' + (2 * t2) + '.' + (t3 ? ' Del 100 al ' + N + ': ' + t3 + ' números de 3 cifras = ' + (3 * t3) + '.' : '') + ' Total: ' + c + '.'
      };
    }
  });

  J.reg({
    id: 'log.cubo_pintado', tema: 'log', nombre: 'Cubo pintado', difs: [3],
    gen: function (r, d, L) {
      var n = L === 4 ? 3 : r.int(3, 5);
      var caras = r.pick(n === 3 ? [0, 1, 3, 2] : [0, 1, 2, 3]);
      var res = { 3: 8, 2: 12 * (n - 2), 1: 6 * (n - 2) * (n - 2), 0: (n - 2) * (n - 2) * (n - 2) };
      var donde = { 3: 'las esquinas (un cubo siempre tiene 8)', 2: 'las aristas sin contar las esquinas: 12 aristas × ' + (n - 2) + ' = ' + res[2], 1: 'el centro de cada cara: 6 caras × ' + (n - 2) + ' × ' + (n - 2) + ' = ' + res[1], 0: 'el interior, un cubo de ' + (n - 2) + ' × ' + (n - 2) + ' × ' + (n - 2) + ' = ' + res[0] }[caras];
      return {
        t: 'Un cubo grande se arma con ' + (n * n * n) + ' cubitos (' + n + ' × ' + n + ' × ' + n + ') y se pinta por fuera. ¿Cuántos cubitos tienen ' + (caras === 0 ? '<b>ninguna</b> cara pintada' : 'exactamente <b>' + caras + '</b> cara' + (caras > 1 ? 's' : '') + ' pintada' + (caras > 1 ? 's' : '')) + '?',
        ans: res[caras], mal: [res[0], res[1], res[2], res[3], n * n, 6 * n],
        sol: 'Están en ' + donde + '. Comprobación: ' + res[3] + ' + ' + res[2] + ' + ' + res[1] + ' + ' + res[0] + ' = ' + (n * n * n) + ' cubitos.'
      };
    }
  });

  var MAGICO = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  function transformar(m, r) {
    var g = m.slice();
    var rot = function (a) { return [a[6], a[3], a[0], a[7], a[4], a[1], a[8], a[5], a[2]]; };
    for (var i = r.int(0, 3); i > 0; i--) g = rot(g);
    if (r.chance(0.5)) g = [g[2], g[1], g[0], g[5], g[4], g[3], g[8], g[7], g[6]];
    return g;
  }
  J.reg({
    id: 'log.magico', tema: 'log', nombre: 'Cuadrado mágico', difs: [3],
    gen: function (r, d, L) {
      var k = L === 4 ? 0 : r.int(0, 10), g = transformar(MAGICO, r).map(function (x) { return x + k; });
      var suma = 15 + 3 * k, q = r.int(0, 8), fq = Math.floor(q / 3), cq = q % 3;
      var otras = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(function (i) { return i !== q && Math.floor(i / 3) !== fq && i % 3 !== cq; });
      var h = r.pick(otras);
      var lado = 46, s = S.abre(3 * lado + 10, 3 * lado + 10);
      for (var i = 0; i < 9; i++) {
        var x = 5 + (i % 3) * lado, y = 5 + Math.floor(i / 3) * lado;
        s += S.rect(x, y, lado, lado, i === q ? '#fff3c4' : '#fff') + S.txt(x + lado / 2, y + lado / 2 + 7, i === q ? '?' : i === h ? '' : g[i], { size: 20, bold: i === q });
      }
      s += '</svg>';
      var fila = [fq * 3, fq * 3 + 1, fq * 3 + 2].filter(function (i) { return i !== q; });
      return {
        t: 'En este cuadrado mágico, cada fila, columna y diagonal suma lo mismo. ¿Qué número va en la casilla marcada con <b>?</b>', svg: s,
        ans: g[q], mal: [g[h], suma - g[q], g[q] + 1, g[q] - 1 > 0 ? g[q] - 1 : g[q] + 2],
        sol: 'Primero se busca la suma mágica en una fila completa: ' + suma + '. En la fila de la casilla marcada están ' + g[fila[0]] + ' y ' + g[fila[1]] + ': ' + suma + ' − ' + g[fila[0]] + ' − ' + g[fila[1]] + ' = ' + g[q] + '.'
      };
    }
  });

  J.reg({
    id: 'log.verdad', tema: 'log', nombre: 'Verdades y mentiras', difs: [3],
    gen: function (r, d, L) {
      var n = r.sample(J.NOMBRES_A, 3), A = n[0], B = n[1], C = n[2];
      if (r.chance(0.5)) {
        return {
          t: A + ' dice: «' + B + ' miente». ' + B + ' dice: «' + C + ' miente». ' + C + ' dice: «' + A + ' y ' + B + ' mienten». ¿Quién dice la verdad?',
          ans: 'Solo ' + B, mal: ['Solo ' + A, 'Solo ' + C, A + ' y ' + C, 'Las tres'], soloAlt: true,
          sol: 'Si ' + C + ' dijera la verdad, ' + A + ' mentiría, y entonces ' + B + ' diría la verdad: pero ' + C + ' dijo que ' + B + ' miente. Contradicción. Así que ' + C + ' miente, ' + B + ' dice la verdad («' + C + ' miente» es cierto) y ' + A + ' miente.'
        };
      }
      var objetos = r.pick([['gato', 'perro', 'pez'], ['piano', 'violín', 'tambor'], ['lápiz', 'cuaderno', 'libro']]);
      var asign = r.shuffle(objetos);
      return {
        t: A + ', ' + B + ' y ' + C + ' tienen un ' + objetos.join(', un ').replace(/, un ([^,]*)$/, ' y un $1') + ' (uno cada una). ' + A + ' no tiene ' + (asign[0] === objetos[0] ? objetos[1] : objetos[0]) +
          ' ni ' + (asign[0] === objetos[2] ? objetos[1] : objetos[2]) + '. ' + B + ' no tiene ' + asign[2] + '. ¿Qué tiene ' + C + '?',
        ans: J.mayus(asign[2]), mal: objetos.filter(function (o) { return o !== asign[2]; }).map(J.mayus).concat(['No se puede saber']), soloAlt: true,
        sol: 'A ' + A + ' le descartan dos opciones: tiene ' + asign[0] + '. ' + B + ' no tiene ' + asign[2] + ' ni ' + asign[0] + ', así que tiene ' + asign[1] + '. A ' + C + ' le queda ' + asign[2] + '. (Ayuda hacer una tabla.)'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
