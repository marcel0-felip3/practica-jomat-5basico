/* Tema: geometría (cuerpos, simetría, ángulos, giros, mapas y plano cartesiano, conteo de figuras). */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, S = J.svg;

  var BASES = { 3: 'triangular', 4: 'cuadrada', 5: 'pentagonal', 6: 'hexagonal' };
  J.reg({
    id: 'geo.cuerpos', tema: 'geo', nombre: 'Caras, aristas y vértices',
    gen: function (r, d, L) {
      var tipo = d === 1 ? r.pick(['cubo', 'prisma', 'piramide']) : r.pick(['prisma', 'piramide']);
      var n = d === 1 ? r.pick([3, 4]) : d === 2 ? r.pick([3, 4, 5]) : r.pick([5, 6, 8]);
      var c, a, v, nombre;
      if (tipo === 'cubo') { n = 4; nombre = 'un cubo'; c = 6; a = 12; v = 8; }
      else if (tipo === 'prisma') { nombre = n === 4 ? 'un prisma de base rectangular' : 'un prisma de base ' + (BASES[n] || 'octogonal'); c = n + 2; a = 3 * n; v = 2 * n; }
      else { nombre = 'una pirámide de base ' + (BASES[n] || 'octogonal'); c = n + 1; a = 2 * n; v = n + 1; }
      var pide = r.pick(['caras', 'aristas', 'vértices']);
      var ans = { caras: c, aristas: a, 'vértices': v }[pide];
      var expl = tipo === 'piramide'
        ? 'Una pirámide de base con ' + n + ' lados tiene ' + n + ' caras laterales + 1 base = ' + c + ' caras; ' + n + ' aristas en la base + ' + n + ' que suben a la punta = ' + a + ' aristas; ' + n + ' vértices en la base + 1 punta = ' + v + ' vértices.'
        : (tipo === 'cubo' ? 'El cubo es un prisma de base cuadrada. ' : '') + 'Un prisma de base con ' + n + ' lados tiene 2 bases + ' + n + ' caras laterales = ' + c + ' caras; ' + n + ' aristas arriba, ' + n + ' abajo y ' + n + ' verticales = ' + a + ' aristas; ' + n + ' vértices arriba y ' + n + ' abajo = ' + v + ' vértices.';
      return {
        t: '¿' + (pide === 'caras' ? 'Cuántas' : 'Cuántos') + ' <b>' + pide + '</b> tiene ' + nombre + '?', ans: ans, mal: [c, a, v, ans + 1, ans + 2],
        sol: expl + ' (Comprobación de Euler: caras + vértices − aristas = 2.)'
      };
    }
  });

  var VERT = 'AHIMOTUVWXY'.split(''), HORI = 'BCDEHIKOX'.split('');
  J.reg({
    id: 'geo.simetria', tema: 'geo', nombre: 'Simetría',
    gen: function (r, d, L) {
      if (d >= 2 && r.chance(0.5)) {
        var figs = [['un cuadrado', 4], ['un rectángulo (que no es cuadrado)', 2], ['un triángulo equilátero', 3], ['un hexágono regular', 6],
          ['un pentágono regular', 5], ['un rombo (que no es cuadrado)', 2], ['un triángulo isósceles (no equilátero)', 1], ['un octógono regular', 8]];
        var fg = r.pick(figs);
        return {
          t: '¿Cuántos ejes de simetría tiene ' + fg[0] + '?', ans: fg[1], mal: [fg[1] * 2, fg[1] + 1, Math.max(0, fg[1] - 1), fg[1] === 4 ? 2 : 4],
          sol: 'Un eje de simetría divide la figura en dos mitades que calzan al doblar. ' + J.mayus(fg[0].replace(/ \(.*\)/, '')) + ' tiene ' + fg[1] + '.' +
            (fg[1] >= 3 && fg[0].indexOf('regular') >= 0 || fg[1] === 3 ? ' En los polígonos regulares hay tantos ejes como lados.' : '')
        };
      }
      var tipo = d === 1 ? r.pick(['vertical', 'horizontal']) : r.pick(['ambos', 'ninguno', 'vertical', 'horizontal']);
      var cumple = function (l) {
        var v = VERT.indexOf(l) >= 0, h = HORI.indexOf(l) >= 0;
        return tipo === 'vertical' ? v : tipo === 'horizontal' ? h : tipo === 'ambos' ? v && h : !v && !h;
      };
      var cands = 'ABCDEFGHIKLMNOPRTUVWXYZ'.split('');
      var si = cands.filter(cumple), no = cands.filter(function (l) { return !cumple(l); });
      var ans = r.pick(si);
      var desc = { vertical: 'un eje de simetría <b>vertical</b>', horizontal: 'un eje de simetría <b>horizontal</b>', ambos: 'un eje vertical <b>y</b> uno horizontal', ninguno: '<b>ningún</b> eje de simetría' }[tipo];
      return {
        t: '¿Qué letra mayúscula tiene ' + desc + '?', ans: ans, mal: r.sample(no, 3), soloAlt: true,
        sol: 'Imagina un espejo sobre la línea: ' + ans + ' queda igual a ambos lados. Letras con eje vertical: ' + VERT.join(' ') + '. Con eje horizontal: ' + HORI.join(' ') + '.'
      };
    }
  });

  J.reg({
    id: 'geo.reloj', tema: 'geo', nombre: 'Ángulos en el reloj', difs: [2, 3],
    gen: function (r, d, L) {
      if (d === 2) {
        if (r.chance(0.5)) {
          var h = r.int(1, 11), ang = Math.min(h, 12 - h) * 30;
          return {
            t: '¿Qué ángulo (el menor) forman las agujas de un reloj a las <b>' + h + ':00</b>?', ans: ang, u: '°',
            mal: [h * 30 === ang ? 360 - ang : h * 30, h * 5, ang + 30, ang - 30 > 0 ? ang - 30 : 15],
            sol: 'Entre dos números seguidos del reloj hay 360° : 12 = 30°. Entre las agujas hay ' + Math.min(h, 12 - h) + ' espacios: ' + Math.min(h, 12 - h) + ' × 30° = ' + ang + '°.'
          };
        }
        var m = r.pick([15, 30, 45, 10, 20, 40, 50]);
        return {
          t: 'El minutero de un reloj avanza <b>' + m + ' minutos</b>. ¿Cuántos grados gira?', ans: m * 6, u: '°',
          mal: [m, m * 3, m * 6 + 30, 360 - m * 6],
          sol: 'En 60 minutos da una vuelta completa (360°): cada minuto gira 360° : 60 = 6°. En ' + m + ' minutos: ' + m + ' × 6° = ' + (m * 6) + '°.'
        };
      }
      var hh = r.int(1, 11), mm = L === 4 ? 30 : r.pick([30, 30, 15, 45]);
      var aH = (hh % 12) * 30 + mm * 0.5, aM = mm * 6, dlt = Math.abs(aH - aM), res = Math.min(dlt, 360 - dlt);
      return {
        t: '¿Qué ángulo (el menor) forman las agujas a las <b>' + hh + ':' + (mm < 10 ? '0' : '') + mm + '</b>? (Ojo: la aguja de la hora también se mueve.)',
        ans: res, u: '°', mal: [Math.abs(hh * 30 - aM) > 180 ? 360 - Math.abs(hh * 30 - aM) : Math.abs(hh * 30 - aM), res + 15, res + 30, Math.abs(res - 15)],
        sol: 'El horario avanza 30° por hora y medio grado por minuto: está en ' + f(aH) + '°. El minutero está en ' + aM + '°. Diferencia: ' + f(dlt) + '°' +
          (dlt > 180 ? '; el menor ángulo es 360° − ' + f(dlt) + '° = ' + f(res) + '°' : '') + '.'
      };
    }
  });

  var DIRS = ['arriba', 'la derecha', 'abajo', 'la izquierda'];
  var FLECHAS = ['⬆', '➡', '⬇', '⬅'];
  J.reg({
    id: 'geo.giros', tema: 'geo', nombre: 'Giros', difs: [1, 2],
    gen: function (r, d, L) {
      var ini = r.int(0, 3), q = d === 1 ? r.pick([1, 2]) : r.pick([1, 2, 3, 5]), horario = r.chance(0.5);
      var fin = ((ini + (horario ? q : -q)) % 4 + 4) % 4;
      var giroTxt = { 1: 'un cuarto de vuelta', 2: 'media vuelta', 3: 'tres cuartos de vuelta', 5: 'una vuelta y un cuarto' }[q];
      return {
        t: 'Una flecha apunta hacia ' + DIRS[ini] + ' ' + FLECHAS[ini] + '. Si gira <b>' + giroTxt + '</b> en sentido ' + (horario ? 'horario (como las agujas del reloj)' : 'antihorario (contrario a las agujas del reloj)') + ', ¿hacia dónde apunta?',
        ans: J.mayus(DIRS[fin]) + ' ' + FLECHAS[fin], mal: [0, 1, 2, 3].filter(function (i) { return i !== fin; }).map(function (i) { return J.mayus(DIRS[i]) + ' ' + FLECHAS[i]; }), soloAlt: true,
        sol: 'Cada cuarto de vuelta en sentido ' + (horario ? 'horario' : 'antihorario') + ' avanza una posición: ' + (horario ? 'arriba → derecha → abajo → izquierda' : 'arriba → izquierda → abajo → derecha') +
          '. Con ' + giroTxt + ' queda hacia ' + DIRS[fin] + '.' + (q === 5 ? ' (Una vuelta completa deja todo igual.)' : '')
      };
    }
  });

  function cuadricula(cols, filas, letras, marcas, celda) {
    celda = celda || 28;
    var x0 = 30, y0 = 10, w = cols * celda, h = filas * celda, s = S.abre(x0 + w + 10, y0 + h + 30);
    for (var i = 0; i <= cols; i++) s += S.linea(x0 + i * celda, y0, x0 + i * celda, y0 + h, '#bbb', 1);
    for (var j = 0; j <= filas; j++) s += S.linea(x0, y0 + j * celda, x0 + w, y0 + j * celda, '#bbb', 1);
    if (letras) {
      for (i = 0; i < cols; i++) s += S.txt(x0 + i * celda + celda / 2, y0 + h + 18, String.fromCharCode(65 + i), { size: 13 });
      for (j = 0; j < filas; j++) s += S.txt(x0 - 12, y0 + h - j * celda - celda / 2 + 5, String(j + 1), { size: 13 });
      (marcas || []).forEach(function (m) { s += S.txt(x0 + m[0] * celda + celda / 2, y0 + h - m[1] * celda - celda / 2 + 7, m[2], { size: 20 }); });
    } else {
      s += S.linea(x0, y0 + h, x0 + w, y0 + h, '#333', 2) + S.linea(x0, y0, x0, y0 + h, '#333', 2);
      for (i = 0; i <= cols; i++) s += S.txt(x0 + i * celda, y0 + h + 18, String(i), { size: 12 });
      for (j = 1; j <= filas; j++) s += S.txt(x0 - 12, y0 + h - j * celda + 4, String(j), { size: 12 });
      (marcas || []).forEach(function (m) {
        s += '<circle cx="' + (x0 + m[0] * celda) + '" cy="' + (y0 + h - m[1] * celda) + '" r="5" fill="#c0392b"/>' +
          S.txt(x0 + m[0] * celda + 10, y0 + h - m[1] * celda - 8, m[2], { size: 13, anchor: 'start', bold: true });
      });
    }
    return s + '</svg>';
  }
  J.cuadricula = cuadricula;

  J.reg({
    id: 'geo.mapa', tema: 'geo', nombre: 'Ubicación en un mapa o plano', difs: [1, 2],
    gen: function (r, d, L) {
      var cols = 8, filas = 7;
      var x = r.int(0, 4), y = r.int(0, 3), dx = r.int(1, 7 - x), dy = r.int(1, 6 - y), izq = false;
      if (d === 2 && r.chance(0.5) && x >= 2) { izq = true; dx = r.int(1, x); }
      var fx = izq ? x - dx : x + dx, fy = y + dy;
      if (L === 4) {
        var c0 = String.fromCharCode(65 + x) + (y + 1), c1 = String.fromCharCode(65 + fx) + (fy + 1);
        return {
          t: 'En el mapa, las columnas tienen letras y las filas números. ' + J.nombre(r) + ' está en <b>' + c0 + '</b> (★). Avanza ' + J.pl(dx, 'casilla', 'casillas') + ' hacia la ' + (izq ? 'izquierda' : 'derecha') +
            ' y luego ' + dy + ' hacia arriba. ¿En qué casilla queda?',
          svg: cuadricula(cols, filas, true, [[x, y, '★']]), ans: c1,
          mal: [String.fromCharCode(65 + Math.min(7, x + dy)) + (Math.min(7, y + dx + 1)), String.fromCharCode(65 + fx) + (y + 1), String.fromCharCode(65 + x) + (fy + 1), String.fromCharCode(65 + fx) + Math.min(7, fy + 2)],
          sol: 'Columnas: desde ' + c0[0] + ' se avanza ' + dx + ' hacia la ' + (izq ? 'izquierda' : 'derecha') + ' hasta ' + c1[0] + '. Filas: desde ' + (y + 1) + ', ' + dy + ' hacia arriba, hasta ' + (fy + 1) + '. Queda en ' + c1 + '.'
        };
      }
      return {
        t: 'El punto P está en (' + x + ', ' + y + '). Se traslada ' + J.pl(dx, 'unidad', 'unidades') + ' hacia la ' + (izq ? 'izquierda' : 'derecha') + ' y ' + dy + ' hacia arriba. ¿Cuáles son sus nuevas coordenadas?',
        svg: cuadricula(cols, filas, false, [[x, y, 'P']]), ans: '(' + fx + ', ' + fy + ')',
        mal: ['(' + fy + ', ' + fx + ')', '(' + (x + dy) + ', ' + (y + dx) + ')', '(' + fx + ', ' + y + ')', '(' + (fx + 1) + ', ' + fy + ')'],
        sol: 'La primera coordenada (x) cambia con los movimientos horizontales: ' + x + (izq ? ' − ' : ' + ') + dx + ' = ' + fx + '. La segunda (y) con los verticales: ' + y + ' + ' + dy + ' = ' + fy + '. Queda en (' + fx + ', ' + fy + '). Escríbelo como (x, y).'
      };
    }
  });

  J.reg({
    id: 'geo.plano', tema: 'geo', nombre: 'Plano cartesiano', niv: [5], difs: [2, 3],
    gen: function (r, d) {
      if (d === 2) {
        var x1 = r.int(0, 3), y1 = r.int(0, 3), w = r.int(2, 4), h = r.int(2, 3);
        var falta = r.int(0, 3), V = [[x1, y1], [x1 + w, y1], [x1 + w, y1 + h], [x1, y1 + h]];
        if (r.chance(0.5)) {
          return {
            t: 'Un rectángulo tiene vértices en ' + V.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '. ¿Cuál es su área?',
            ans: w * h, u: 'unidades²', mal: [2 * (w + h), w + h, (w + 1) * (h + 1), w * h + w],
            sol: 'Largo: de x = ' + x1 + ' a x = ' + (x1 + w) + ' son ' + w + '. Alto: de y = ' + y1 + ' a y = ' + (y1 + h) + ' son ' + h + '. Área = ' + w + ' × ' + h + ' = ' + (w * h) + '.'
          };
        }
        var dados = V.filter(function (_, i) { return i !== falta; });
        var P = V[falta];
        return {
          t: 'Tres vértices de un rectángulo son ' + dados.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '. ¿Cuál es el cuarto vértice?',
          svg: cuadricula(8, 7, false, dados.map(function (p, i) { return [p[0], p[1], 'ABC'[i]]; })),
          ans: '(' + P[0] + ', ' + P[1] + ')', mal: ['(' + P[1] + ', ' + P[0] + ')', '(' + (P[0] + 1) + ', ' + P[1] + ')', '(' + P[0] + ', ' + (P[1] + 1) + ')', '(' + (P[0] + w) + ', ' + (P[1] + h) + ')'],
          sol: 'En un rectángulo con lados paralelos a los ejes, cada x aparece dos veces y cada y aparece dos veces. Falta (' + P[0] + ', ' + P[1] + ').'
        };
      }
      var px = r.int(1, 4), py = r.int(1, 5), k = r.int(px + 1, 6), vertical = r.chance(0.5);
      var img = vertical ? [2 * k - px, py] : [px, 2 * (py + r.int(1, 2)) - py];
      var eje = vertical ? 'la recta vertical x = ' + k : 'la recta horizontal y = ' + ((img[1] + py) / 2);
      return {
        t: 'El punto (' + px + ', ' + py + ') se refleja respecto de ' + eje + '. ¿Cuáles son las coordenadas de su imagen?',
        ans: '(' + img[0] + ', ' + img[1] + ')', mal: ['(' + img[1] + ', ' + img[0] + ')', vertical ? '(' + k + ', ' + py + ')' : '(' + px + ', ' + ((img[1] + py) / 2) + ')', vertical ? '(' + (k + px) + ', ' + py + ')' : '(' + (px + 1) + ', ' + img[1] + ')', '(' + px + ', ' + py + ')'],
        sol: vertical ? 'El punto está a ' + (k - px) + ' unidades a la izquierda de la recta; su imagen queda a ' + (k - px) + ' unidades a la derecha: x = ' + k + ' + ' + (k - px) + ' = ' + img[0] + '. La y no cambia.'
          : 'El punto está ' + ((img[1] - py) / 2) + ' unidades bajo la recta; su imagen queda ' + ((img[1] - py) / 2) + ' unidades sobre ella: y = ' + img[1] + '. La x no cambia.'
      };
    }
  });

  J.reg({
    id: 'geo.angulo_partes', tema: 'geo', nombre: 'Ángulos y sus partes', difs: [2, 3],
    gen: function (r, d, L) {
      var total = r.pick(d === 2 ? [90, 180] : [90, 180, 360]);
      var nombre = { 90: 'Un ángulo recto', 180: 'Un ángulo extendido (media vuelta)', 360: 'Una vuelta completa' }[total];
      var p = r.pick([[1, 2], [1, 5], [2, 3], [1, 3], [4, 5], [1, 8]]);
      var partes = p[0] + p[1];
      if (total % partes) { p = [1, 2]; partes = 3; }
      var u = total / partes, chico = p[0] * u, grande = p[1] * u;
      var pideMenor = r.chance(0.5);
      var rel = p[0] === 1
        ? 'Uno mide ' + (p[1] === 2 ? 'el doble de' : p[1] === 3 ? 'el triple de' : p[1] + ' veces') + ' lo que mide el otro'
        : 'Si se piensa en ' + partes + ' partes iguales, uno de los ángulos ocupa ' + p[0] + ' partes y el otro ' + p[1];
      return {
        t: nombre + ' (' + total + '°) se divide en dos ángulos. ' + rel + '. ¿Cuánto mide el ángulo <b>' + (pideMenor ? 'menor' : 'mayor') + '</b>?',
        ans: pideMenor ? chico : grande, u: '°', mal: [pideMenor ? grande : chico, total / 2, u * (p[0] + 1), total - u],
        sol: 'Se reparte en ' + p[0] + ' + ' + p[1] + ' = ' + partes + ' partes iguales: ' + total + '° : ' + partes + ' = ' + f(u) + '°. Menor: ' + f(chico) + '°; mayor: ' + f(grande) + '°.'
      };
    }
  });

  J.reg({
    id: 'geo.contar', tema: 'geo', nombre: 'Contar figuras', difs: [2, 3],
    gen: function (r, d, L) {
      var tipo = r.pick(d === 2 ? ['tira', 'abanico'] : ['tablero', 'abanico', 'tira']);
      var s, ans, t, sol, mal;
      if (tipo === 'tira') {
        var n = d === 2 ? r.int(3, 4) : r.int(5, 7);
        s = S.abre(n * 34 + 10, 44); for (var i = 0; i < n; i++) s += S.rect(5 + i * 34, 5, 34, 34, '#fff'); s += '</svg>';
        ans = n * (n + 1) / 2;
        t = '¿Cuántos rectángulos hay en total en esta tira de ' + n + ' cuadrados? (Un cuadrado también es un rectángulo.)';
        var lst = []; for (i = 1; i <= n; i++) lst.push(n - i + 1);
        sol = 'Se cuentan por tamaño: de 1 cuadrado hay ' + n + ', de 2 hay ' + (n - 1) + ', …, de ' + n + ' hay 1. Total: ' + lst.join(' + ') + ' = ' + ans + '.';
        mal = [n, n + 1, ans + 1, 2 * n];
      } else if (tipo === 'abanico') {
        var k = d === 2 ? r.int(2, 3) : r.int(3, 5);
        var W = 260, H = 150; s = S.abre(W, H);
        var top = [W / 2, 10], bx = [];
        for (i = 0; i <= k + 1; i++) bx.push(20 + i * (W - 40) / (k + 1));
        s += S.poli([top, [20, H - 10], [W - 20, H - 10]], 'none');
        for (i = 1; i <= k; i++) s += S.linea(top[0], top[1], bx[i], H - 10);
        s += '</svg>';
        var piezas = k + 1; ans = piezas * (piezas + 1) / 2;
        t = 'Desde un vértice de un triángulo se trazan ' + k + ' líneas hasta el lado de enfrente. ¿Cuántos triángulos hay en total en la figura?';
        var l2 = []; for (i = 1; i <= piezas; i++) l2.push(piezas - i + 1);
        sol = 'Quedan ' + piezas + ' triángulos pequeños. Se cuentan por cantidad de piezas: ' + l2.join(' + ') + ' = ' + ans + '.';
        mal = [piezas, piezas + 1, ans - 1, 2 * piezas];
      } else {
        var m = r.int(3, L === 4 ? 3 : 4);
        s = S.abre(m * 34 + 10, m * 34 + 10); for (i = 0; i < m; i++) for (var j = 0; j < m; j++) s += S.rect(5 + i * 34, 5 + j * 34, 34, 34, '#fff'); s += '</svg>';
        ans = 0; var desglose = [];
        for (i = 1; i <= m; i++) { ans += (m - i + 1) * (m - i + 1); desglose.push('de ' + i + '×' + i + ': ' + ((m - i + 1) * (m - i + 1))); }
        t = '¿Cuántos cuadrados de cualquier tamaño hay en este tablero de ' + m + ' × ' + m + '?';
        sol = 'Por tamaño: ' + desglose.join('; ') + '. Total: ' + ans + '.';
        mal = [m * m, m * m + 1, ans - 1, ans + m];
      }
      return { t: t, svg: s, ans: ans, mal: mal, sol: sol };
    }
  });

  J.reg({
    id: 'geo.paralelas', tema: 'geo', nombre: 'Caras y aristas paralelas', niv: [5], difs: [2, 3],
    gen: function (r, d) {
      var c = r.pick([['un cubo', 3, 'arriba–abajo, adelante–atrás e izquierda–derecha'], ['un prisma rectangular', 3, 'arriba–abajo, adelante–atrás e izquierda–derecha'],
        ['un prisma de base triangular', 1, 'solo las dos bases; las caras laterales no son paralelas entre sí'],
        ['un prisma de base hexagonal', 4, 'las dos bases (1 par) y las 6 caras laterales, que forman 3 pares'],
        ['una pirámide de base cuadrada', 0, 'ninguno: todas las caras laterales se juntan en la punta']]);
      if (d === 3 && r.chance(0.5)) {
        return {
          t: 'En un cubo, ¿con cuántas aristas es <b>paralela</b> una arista cualquiera?', ans: 3, mal: [4, 2, 11, 8],
          sol: 'Las 12 aristas del cubo forman 3 grupos de 4 aristas paralelas (las de largo, las de ancho y las de alto). Cada arista es paralela a las otras 3 de su grupo.'
        };
      }
      return {
        t: '¿Cuántos pares de caras paralelas tiene ' + c[0] + '?', ans: c[1], mal: [c[1] + 1, c[1] + 3, c[1] === 0 ? 2 : c[1] - 1, 6, 2],
        sol: 'Dos caras son paralelas si nunca se juntan aunque se alarguen. En ' + c[0] + ': ' + c[2] + '. Total: ' + c[1] + '.'
      };
    }
  });

  J.reg({
    id: 'geo.reflejo_letra', tema: 'geo', nombre: 'Reflexión de letras', difs: [1, 2],
    gen: function (r, d, L) {
      var casos = [['b', 'd', 'vertical'], ['d', 'b', 'vertical'], ['p', 'q', 'vertical'], ['q', 'p', 'vertical'], ['b', 'p', 'horizontal'], ['p', 'b', 'horizontal'], ['d', 'q', 'horizontal'], ['q', 'd', 'horizontal']];
      var c = r.pick(casos);
      return {
        t: 'Si reflejas la letra <b>«' + c[0] + '»</b> en un espejo ' + (c[2] === 'vertical' ? 'puesto a su lado (eje vertical)' : 'puesto debajo de ella (eje horizontal)') + ', ¿qué letra ves?',
        ans: c[1], mal: ['b', 'd', 'p', 'q'].filter(function (x) { return x !== c[1]; }), soloAlt: true,
        sol: c[2] === 'vertical' ? 'El reflejo con eje vertical cambia izquierda por derecha: «' + c[0] + '» se ve como «' + c[1] + '».'
          : 'El reflejo con eje horizontal cambia arriba por abajo: «' + c[0] + '» se ve como «' + c[1] + '».'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
