/* Tema: medición (tiempo, calendario, longitud, perímetro, área y volumen). */
(function (root) {
  'use strict';
  var J = root.J, f = J.f, S = J.svg;
  function hhmm(min) { min = ((min % 1440) + 1440) % 1440; var h = Math.floor(min / 60), m = min % 60; return h + ':' + (m < 10 ? '0' : '') + m; }
  function durTxt(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? J.pl(h, 'hora', 'horas') : '') + (h && r ? ' y ' : '') + (r ? J.pl(r, 'minuto', 'minutos') : ''); }

  J.reg({
    id: 'med.duracion', tema: 'med', nombre: 'Hora de término y duración',
    gen: function (r, d, L) {
      var ini = r.int(7, 19) * 60 + r.int(0, 11) * 5;
      var dur = d === 1 ? r.int(2, 11) * 5 : d === 2 ? r.int(13, 23) * 5 : r.int(7, 30) * 5 + 60;
      if (d === 1 && (ini % 60) + dur >= 60) ini -= (ini % 60);
      var fin = ini + dur, evento = r.pick(['Una película', 'Un partido', 'Un viaje en bus', 'Una clase de natación', 'Una obra de teatro']);
      if (d === 3 && r.chance(0.5)) {
        return {
          t: evento + ' termina a las <b>' + hhmm(fin) + '</b> y duró ' + durTxt(dur) + '. ¿A qué hora empezó?',
          ans: hhmm(ini), normDig: true, mal: [hhmm(fin + dur), hhmm(ini + 60), hhmm(ini - 60), hhmm(ini + 10)],
          sol: 'Se resta la duración hacia atrás desde ' + hhmm(fin) + ': ' + durTxt(dur) + ' antes son las ' + hhmm(ini) + '.'
        };
      }
      var malMin = Math.floor(ini / 60) * 100 + (ini % 60) + dur; // error de sumar minutos sin pasar a horas
      var malTxt = Math.floor(malMin / 100) + ':' + (malMin % 100 < 10 ? '0' : '') + (malMin % 100);
      return {
        t: evento + ' comienza a las <b>' + hhmm(ini) + '</b> y dura ' + durTxt(dur) + '. ¿A qué hora termina?',
        ans: hhmm(fin), normDig: true, mal: [malTxt === hhmm(fin) ? hhmm(fin + 10) : malTxt, hhmm(fin - 60), hhmm(fin + 60), hhmm(fin - 5)],
        sol: 'Se avanza por partes: ' + hhmm(ini) + (60 - ini % 60 <= dur && ini % 60 ? ' + ' + (60 - ini % 60) + ' min = ' + hhmm(ini + 60 - ini % 60) + ', y luego se suma el resto' : '') +
          '. Termina a las ' + hhmm(fin) + '. (Recuerda: 60 minutos forman 1 hora.)'
      };
    }
  });

  J.reg({
    id: 'med.formato24', tema: 'med', nombre: 'Hora a.m., p.m. y 24 horas', niv: [4, 5], difs: [1, 2],
    gen: function (r, d, L) {
      var h = r.int(1, 11), m = r.int(0, 11) * 5, pm = d === 1 ? true : r.chance(0.6);
      var mm = (m < 10 ? '0' : '') + m;
      if (r.chance(0.5)) {
        var h24 = pm ? h + 12 : h;
        return {
          t: 'Son las ' + h + ':' + mm + ' ' + (pm ? 'p.m.' : 'a.m.') + ' ¿Cómo se escribe esta hora en el formato de 24 horas?',
          ans: h24 + ':' + mm, normDig: true, mal: [(pm ? h : h + 12) + ':' + mm, (h + 10) + ':' + mm, (h24 === 23 ? 13 : h24 + 1) + ':' + mm],
          sol: pm ? 'Las horas p.m. son después del mediodía: se suma 12. ' + h + ' + 12 = ' + h24 + ', así que es ' + h24 + ':' + mm + '.' : 'Las horas a.m. (antes del mediodía) quedan igual: ' + h + ':' + mm + '.'
        };
      }
      var H = r.int(13, 23);
      return {
        t: 'Un reloj digital marca <b>' + H + ':' + mm + '</b>. ¿Qué hora es en el formato de 12 horas?',
        ans: (H - 12) + ':' + mm + ' p.m.', mal: [(H - 12) + ':' + mm + ' a.m.', (H - 10) + ':' + mm + ' p.m.', (H - 2) + ':' + mm + ' p.m.'], soloAlt: true,
        sol: 'Después de las 12:00 se resta 12: ' + H + ' − 12 = ' + (H - 12) + '. Es después del mediodía, así que es p.m.'
      };
    }
  });

  J.reg({
    id: 'med.tiempo', tema: 'med', nombre: 'Convertir unidades de tiempo',
    gen: function (r, d, L) {
      var tipos = d === 1 ? ['h-min', 'sem-dias', 'min-s'] : d === 2 ? ['hmin-min', 'dias-h', 'h-s', 'min-h'] : ['dias-min', 'semdias-dias', 'año-dias'];
      var t = r.pick(tipos), a, ans, txt, sol, mal;
      if (t === 'h-min') { a = r.int(2, 9); ans = a * 60; txt = '¿Cuántos minutos hay en ' + a + ' horas?'; sol = a + ' × 60 = ' + ans + ' minutos.'; mal = [a * 100, a * 30, ans + 60]; }
      else if (t === 'sem-dias') { a = r.int(2, 12); ans = a * 7; txt = '¿Cuántos días hay en ' + a + ' semanas?'; sol = a + ' × 7 = ' + ans + ' días.'; mal = [a * 5, ans + 7, a * 10]; }
      else if (t === 'min-s') { a = r.int(2, 10); ans = a * 60; txt = '¿Cuántos segundos hay en ' + a + ' minutos?'; sol = a + ' × 60 = ' + ans + ' segundos.'; mal = [a * 100, ans - 60, a * 6]; }
      else if (t === 'hmin-min') { a = r.int(1, 5); var b = r.pick([15, 20, 30, 45, 10]); ans = a * 60 + b; txt = '¿Cuántos minutos hay en ' + J.pl(a, 'hora', 'horas') + ' y ' + b + ' minutos?'; sol = a + ' × 60 + ' + b + ' = ' + ans + ' minutos.'; mal = [a * 100 + b, a + b, ans + 60]; }
      else if (t === 'dias-h') { a = r.int(2, 7); ans = a * 24; txt = '¿Cuántas horas hay en ' + a + ' días?'; sol = a + ' × 24 = ' + ans + ' horas.'; mal = [a * 12, a * 60, ans + 24]; }
      else if (t === 'h-s') { a = r.pick([1, 2]); ans = a * 3600; txt = '¿Cuántos segundos hay en ' + J.pl(a, 'hora', 'horas') + '?'; sol = a + ' × 60 × 60 = ' + f(ans) + ' segundos.'; mal = [a * 60, a * 600, a * 6000]; }
      else if (t === 'min-h') { a = r.pick([90, 120, 150, 180, 210, 240, 300]); ans = a / 60; txt = '¿Cuántas horas son ' + a + ' minutos?'; sol = a + ' : 60 = ' + f(ans) + ' horas.'; mal = [a / 100, a / 30, ans + 1]; }
      else if (t === 'dias-min') { a = r.pick([1, 2]); ans = a * 1440; txt = '¿Cuántos minutos hay en ' + J.pl(a, 'día', 'días') + '?'; sol = a + ' × 24 × 60 = ' + f(ans) + ' minutos.'; mal = [a * 24, a * 240, a * 1000]; }
      else if (t === 'semdias-dias') { a = r.int(3, 9); var dd = r.int(1, 6); ans = a * 7 + dd; txt = '¿Cuántos días hay en ' + a + ' semanas y ' + J.pl(dd, 'día', 'días') + '?'; sol = a + ' × 7 + ' + dd + ' = ' + ans + ' días.'; mal = [a * 10 + dd, (a + dd) * 7, ans - 1]; }
      else { a = r.int(2, 4); ans = a * 365; txt = '¿Cuántos días hay en ' + a + ' años que no son bisiestos?'; sol = a + ' × 365 = ' + f(ans) + ' días.'; mal = [a * 360, a * 366, a * 12]; }
      return { t: txt, ans: ans, mal: mal, sol: sol };
    }
  });

  J.reg({
    id: 'med.calendario', tema: 'med', nombre: 'Días de la semana y calendario',
    gen: function (r, d, L) {
      var hoy = r.int(0, 6);
      if (d === 3 && r.chance(0.5)) {
        var largo = r.pick([28, 29, 30, 31]), dia1 = r.int(0, 6), pide = r.int(0, 6);
        var cuenta = 0; for (var k = 0; k < largo; k++) if ((dia1 + k) % 7 === pide) cuenta++;
        var lst = []; for (k = 1; k <= largo; k++) if ((dia1 + k - 1) % 7 === pide) lst.push(k);
        var plural = /s$/.test(J.DIAS[pide]) ? J.DIAS[pide] : J.DIAS[pide] + 's';
        return {
          t: 'Un mes de ' + largo + ' días empieza un <b>' + J.DIAS[dia1] + '</b>. ¿Cuántos <b>' + plural + '</b> tiene ese mes?', ans: cuenta, mal: [4, 5, 3, 6],
          sol: 'Los ' + plural + ' caen los días ' + lst.join(', ') + ': son ' + cuenta + '. (4 semanas completas son 28 días; los días que sobran se repiten una vez más.)'
        };
      }
      var n = d === 1 ? r.int(8, 20) : d === 2 ? r.int(15, 60) : r.int(60, 400);
      var futuro = d === 1 ? true : r.chance(0.6);
      var res = ((hoy + (futuro ? n : -n)) % 7 + 7) % 7;
      var resto = n % 7;
      return {
        t: 'Hoy es <b>' + J.DIAS[hoy] + '</b>. ¿Qué día de la semana ' + (futuro ? 'será dentro de ' : 'fue hace ') + n + ' días?',
        ans: J.DIAS[res], mal: [J.DIAS[(res + 1) % 7], J.DIAS[(res + 6) % 7], J.DIAS[hoy] === J.DIAS[res] ? J.DIAS[(res + 2) % 7] : J.DIAS[hoy], J.DIAS[(res + 3) % 7]],
        sol: 'Cada 7 días se repite el mismo día. ' + n + ' = ' + Math.floor(n / 7) + ' × 7 + ' + resto + ', así que basta ' + (futuro ? 'avanzar ' : 'retroceder ') + resto +
          ' día' + (resto === 1 ? '' : 's') + ' desde el ' + J.DIAS[hoy] + ': ' + J.DIAS[res] + '.'
      };
    }
  });

  J.reg({
    id: 'med.longitud', tema: 'med', nombre: 'Unidades de longitud',
    gen: function (r, d, L) {
      if (L === 4) {
        if (r.chance(0.5)) {
          var m = r.int(1, 9), cm = r.int(1, 99);
          return {
            t: '¿A cuántos centímetros equivalen ' + m + ' m ' + cm + ' cm?', ans: m * 100 + cm, u: 'cm', mal: [m * 10 + cm, m * 1000 + cm, Number(String(m) + String(cm)) === m * 100 + cm ? m * 100 + cm + 10 : Number(String(m) + String(cm))],
            sol: '1 m = 100 cm, así que ' + m + ' m = ' + (m * 100) + ' cm. Más ' + cm + ' cm: ' + (m * 100 + cm) + ' cm.'
          };
        }
        var c = r.int(1, 9) * 100 + (d >= 2 ? r.int(1, 9) * 10 : 0);
        return {
          t: '¿A cuántos metros equivalen ' + f(c) + ' cm?', ans: J.redo(c / 100), u: 'm', mal: [c / 10, c / 1000, c * 100],
          sol: '100 cm = 1 m: se divide por 100. ' + f(c) + ' : 100 = ' + f(c / 100) + ' m.'
        };
      }
      var conv = [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'mm', 1000], ['km', 'cm', 100000]];
      var cv = r.pick(d === 1 ? conv.slice(0, 3) : conv);
      var grande = d === 1 ? r.int(2, 9) : J.redo(r.int(11, 99) / 10);
      if (r.chance(0.5)) {
        var ans = J.redo(grande * cv[2]);
        return {
          t: '¿A cuántos <b>' + cv[1] + '</b> equivalen ' + f(grande) + ' ' + cv[0] + '?', ans: ans, u: cv[1], mal: [J.redo(ans / 10), J.redo(ans * 10), J.redo(grande + cv[2])],
          sol: '1 ' + cv[0] + ' = ' + f(cv[2]) + ' ' + cv[1] + '. Se multiplica: ' + f(grande) + ' × ' + f(cv[2]) + ' = ' + f(ans) + ' ' + cv[1] + '.'
        };
      }
      var chico = cv[2] === 100000 ? r.int(11, 99) * 10000 : r.int(12, 999) * (cv[2] >= 1000 ? 10 : 1);
      var a2 = J.redo(chico / cv[2]);
      return {
        t: '¿A cuántos <b>' + cv[0] + '</b> equivalen ' + f(chico) + ' ' + cv[1] + '?', ans: a2, u: cv[0], mal: [J.redo(a2 * 10), J.redo(a2 / 10), chico * cv[2]],
        sol: 'Para pasar de ' + cv[1] + ' a ' + cv[0] + ' se divide por ' + f(cv[2]) + ': ' + f(chico) + ' : ' + f(cv[2]) + ' = ' + f(a2) + ' ' + cv[0] + '.'
      };
    }
  });

  function rectSVG(w, h, et1, et2) {
    var esc = Math.min(200 / w, 110 / h, 22), W = w * esc, H = h * esc;
    return S.abre(W + 90, H + 50) + S.rect(40, 12, W, H, '#dff0fb') + S.txt(40 + W / 2, 12 + H + 22, et1) +
      S.txt(30, 12 + H / 2 + 5, et2, { anchor: 'end' }) + '</svg>';
  }

  J.reg({
    id: 'med.rectangulo', tema: 'med', nombre: 'Perímetro y área de rectángulos',
    gen: function (r, d, L) {
      if (d === 1) {
        var a = r.int(3, 12), b = r.int(2, a), area = r.chance(0.5);
        return {
          t: 'Un rectángulo mide ' + a + ' cm de largo y ' + b + ' cm de ancho. ¿Cuál es su <b>' + (area ? 'área' : 'perímetro') + '</b>?',
          svg: rectSVG(a, b, a + ' cm', b + ' cm'), ans: area ? a * b : 2 * (a + b), u: area ? 'cm²' : 'cm', mal: area ? [2 * (a + b), a + b, a * b * 2] : [a * b, a + b, 2 * a + b],
          sol: area ? 'Área = largo × ancho = ' + a + ' × ' + b + ' = ' + (a * b) + ' cm².' : 'Perímetro = suma de los 4 lados = ' + a + ' + ' + b + ' + ' + a + ' + ' + b + ' = ' + (2 * (a + b)) + ' cm.'
        };
      }
      if (d === 2) {
        if (r.chance(0.5)) {
          var l = r.int(3, 12);
          return {
            t: 'Un cuadrado tiene ' + (4 * l) + ' cm de perímetro. ¿Cuál es su área?', ans: l * l, u: 'cm²', mal: [4 * l, l * 4 * 2, (4 * l) * (4 * l) / 4, l * 2],
            sol: 'Los 4 lados son iguales: lado = ' + (4 * l) + ' : 4 = ' + l + ' cm. Área = ' + l + ' × ' + l + ' = ' + (l * l) + ' cm².'
          };
        }
        var A = r.int(3, 10), B = r.int(2, 9), Ar = A * B;
        return {
          t: 'Un rectángulo tiene ' + Ar + ' cm² de área y uno de sus lados mide ' + A + ' cm. ¿Cuál es su perímetro?', ans: 2 * (A + B), u: 'cm', mal: [A + B, Ar, 2 * A + B, 4 * A],
          sol: 'El otro lado mide ' + Ar + ' : ' + A + ' = ' + B + ' cm. Perímetro = 2 × (' + A + ' + ' + B + ') = ' + (2 * (A + B)) + ' cm.'
        };
      }
      var k = r.pick([2, 3]), u = r.int(2, 6), ancho = u, largo = k * u, P = 2 * (ancho + largo);
      return {
        t: 'Un rectángulo tiene ' + P + ' cm de perímetro y su largo es ' + (k === 2 ? 'el doble' : 'el triple') + ' de su ancho. ¿Cuál es su área?', ans: ancho * largo, u: 'cm²',
        mal: [P, P / 2, (P / 4) * (P / 4), ancho * largo * 2],
        sol: 'Largo + ancho = ' + P + ' : 2 = ' + (P / 2) + ' cm. Si el ancho es 1 parte y el largo ' + k + ' partes, ' + (k + 1) + ' partes = ' + (P / 2) + ', una parte = ' + u +
          '. Ancho ' + ancho + ' cm, largo ' + largo + ' cm, área = ' + (ancho * largo) + ' cm².'
      };
    }
  });

  function polyomino(r, k) {
    var celdas = [[0, 0]], key = function (c) { return c[0] + ',' + c[1]; }, set = { '0,0': 1 };
    while (celdas.length < k) {
      var c = r.pick(celdas), dir = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      var nc = [c[0] + dir[0], c[1] + dir[1]];
      if (Math.abs(nc[0]) > 3 || Math.abs(nc[1]) > 2 || set[key(nc)]) continue;
      set[key(nc)] = 1; celdas.push(nc);
    }
    var per = 0;
    celdas.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dd) { if (!set[(c[0] + dd[0]) + ',' + (c[1] + dd[1])]) per++; }); });
    return { celdas: celdas, per: per };
  }

  J.reg({
    id: 'med.cuadricula', tema: 'med', nombre: 'Área y perímetro en cuadrícula', difs: [1, 2],
    gen: function (r, d, L) {
      var k = d === 1 ? r.int(4, 7) : r.int(7, 11), p = polyomino(r, k), lado = 26;
      var minx = Math.min.apply(null, p.celdas.map(function (c) { return c[0]; })), miny = Math.min.apply(null, p.celdas.map(function (c) { return c[1]; }));
      var s = S.abre(9 * lado + 10, 6 * lado + 10);
      for (var i = 0; i <= 9; i++) s += S.linea(5 + i * lado, 5, 5 + i * lado, 5 + 6 * lado, '#ccc', 1);
      for (var j = 0; j <= 6; j++) s += S.linea(5, 5 + j * lado, 5 + 9 * lado, 5 + j * lado, '#ccc', 1);
      p.celdas.forEach(function (c) { s += S.rect(5 + (c[0] - minx + 1) * lado, 5 + (c[1] - miny) * lado, lado, lado, S.COLOR, '#2d6b9a'); });
      s += '</svg>';
      var area = d === 1 || r.chance(0.5);
      return {
        t: 'Cada cuadradito mide 1 cm de lado. ¿Cuál es el <b>' + (area ? 'área' : 'perímetro') + '</b> de la figura pintada?', svg: s,
        ans: area ? k : p.per, u: area ? 'cm²' : 'cm', mal: area ? [p.per, k + 1, k - 1] : [k, p.per + 2, p.per - 2],
        sol: area ? 'El área es la cantidad de cuadraditos que cubren la figura: ' + k + ' cm².'
          : 'El perímetro es el largo del borde: se cuentan los lados de cuadradito que están en el contorno, sin saltarse ninguno: ' + p.per + ' cm.'
      };
    }
  });

  J.reg({
    id: 'med.volumen', tema: 'med', nombre: 'Volumen con cubos', niv: [4], difs: [1, 2, 3],
    gen: function (r, d) {
      var a = r.int(2, 5), b = r.int(2, 4), c = r.int(2, d === 1 ? 2 : 4);
      if (d === 3) {
        var tot = a * b * c, capa = a * b;
        return {
          t: 'Una caja tiene una base de ' + a + ' × ' + b + ' cubitos. Si caben en total ' + tot + ' cubitos, ¿cuántas capas de cubitos tiene?', ans: c, mal: [tot / a, capa, c + 1, tot - capa],
          sol: 'Cada capa tiene ' + a + ' × ' + b + ' = ' + capa + ' cubitos. ' + tot + ' : ' + capa + ' = ' + c + ' capas.'
        };
      }
      return {
        t: 'En una caja caben ' + a + ' cubitos a lo largo, ' + b + ' a lo ancho y ' + c + ' hacia arriba. ¿Cuántos cubitos caben en total?', ans: a * b * c, u: 'cubitos',
        mal: [a + b + c, a * b, a * b + c, 2 * (a * b + b * c + a * c)],
        sol: 'Una capa tiene ' + a + ' × ' + b + ' = ' + (a * b) + ' cubitos; ' + c + ' capas: ' + (a * b) + ' × ' + c + ' = ' + (a * b * c) + ' cubitos.'
      };
    }
  });

  J.reg({
    id: 'med.areas5', tema: 'med', nombre: 'Área de triángulos, paralelogramos y trapecios', niv: [5],
    gen: function (r, d) {
      var tipo = d === 1 ? 'tri' : r.pick(['tri', 'para', 'trap']);
      var b = r.int(3, 14), h = r.int(2, 10), b2 = r.int(2, b - 1 > 2 ? b - 1 : 3), s, ans, sol, mal, t;
      if (tipo === 'trap' && b2 >= b) b = b2 + 2;
      if (tipo === 'tri' && (b * h) % 2) b++;
      if (tipo === 'trap' && ((b + b2) * h) % 2) h++;
      var esc = Math.min(180 / b, 100 / h, 14), W = b * esc, H = h * esc, x0 = 20, y0 = 10;
      s = S.abre(W + 80, H + 50);
      if (tipo === 'tri') {
        var tx = x0 + W * r.pick([0.3, 0.5, 0.7]);
        s += S.poli([[x0, y0 + H], [x0 + W, y0 + H], [tx, y0]], '#fdebd0') + S.linea(tx, y0, tx, y0 + H, '#c0392b', 1.5, 'stroke-dasharray="5,4"') +
          S.txt(x0 + W / 2, y0 + H + 20, 'base ' + b + ' cm') + S.txt(tx > x0 + W / 2 ? tx - 6 : tx + 6, y0 + H / 2 + 5, h + ' cm', { anchor: tx > x0 + W / 2 ? 'end' : 'start', fill: '#c0392b' });
        ans = b * h / 2; t = '¿Cuál es el área del triángulo?'; mal = [b * h, b + h, b * h / 2 + b];
        sol = 'Área del triángulo = base × altura : 2 = ' + b + ' × ' + h + ' : 2 = ' + f(ans) + ' cm². (Es la mitad del rectángulo de ' + b + ' × ' + h + '.)';
      } else if (tipo === 'para') {
        var off = Math.min(40, W * 0.3);
        s += S.poli([[x0, y0 + H], [x0 + W, y0 + H], [x0 + W + off, y0], [x0 + off, y0]], '#e8daef') + S.linea(x0 + off, y0, x0 + off, y0 + H, '#c0392b', 1.5, 'stroke-dasharray="5,4"') +
          S.txt(x0 + W / 2, y0 + H + 20, 'base ' + b + ' cm') + S.txt(x0 + off + 6, y0 + H / 2, h + ' cm', { anchor: 'start', fill: '#c0392b' });
        ans = b * h; t = '¿Cuál es el área del paralelogramo?'; mal = [b * h / 2, 2 * (b + h), b * h + h];
        sol = 'Área del paralelogramo = base × altura = ' + b + ' × ' + h + ' = ' + ans + ' cm². (Si se corta el triángulo de un lado y se pega al otro, queda un rectángulo.)';
      } else {
        var W2 = b2 * esc, o2 = (W - W2) / 2;
        s += S.poli([[x0, y0 + H], [x0 + W, y0 + H], [x0 + o2 + W2, y0], [x0 + o2, y0]], '#d5f5e3') + S.linea(x0 + o2, y0, x0 + o2, y0 + H, '#c0392b', 1.5, 'stroke-dasharray="5,4"') +
          S.txt(x0 + W / 2, y0 + H + 20, 'base mayor ' + b + ' cm') + S.txt(x0 + W / 2, y0 - 0 + 14, b2 + ' cm', { size: 13 }) + S.txt(x0 + o2 + 6, y0 + H / 2 + 8, h + ' cm', { anchor: 'start', fill: '#c0392b' });
        ans = (b + b2) * h / 2; t = '¿Cuál es el área del trapecio? (bases ' + b + ' cm y ' + b2 + ' cm, altura ' + h + ' cm)'; mal = [(b + b2) * h, b * b2 * h / 2, b * h];
        sol = 'Área del trapecio = (base mayor + base menor) × altura : 2 = (' + b + ' + ' + b2 + ') × ' + h + ' : 2 = ' + f(ans) + ' cm².';
      }
      s += '</svg>';
      return { t: t, svg: s, ans: ans, u: 'cm²', mal: mal, sol: sol };
    }
  });

  J.reg({
    id: 'med.recorte', tema: 'med', nombre: 'Figura con una esquina recortada', difs: [3],
    gen: function (r, d, L) {
      var a = r.int(6, 12), b = r.int(5, 9), c = r.int(2, Math.min(4, b - 2));
      var esc = 14, W = a * esc, H = b * esc, C = c * esc, x0 = 60, y0 = 10;
      var s = S.abre(W + 90, H + 50) + S.poli([[x0, y0], [x0 + W - C, y0], [x0 + W - C, y0 + C], [x0 + W, y0 + C], [x0 + W, y0 + H], [x0, y0 + H]], '#fcf3cf') +
        S.txt(x0 + W / 2, y0 + H + 20, a + ' cm') + S.txt(x0 - 6, y0 + H / 2, b + ' cm', { anchor: 'end' }) + S.txt(x0 + W - C / 2, y0 + C + 16, c + ' cm', { size: 12 }) + '</svg>';
      var area = r.chance(0.5);
      return {
        t: 'A un rectángulo de ' + a + ' cm × ' + b + ' cm se le recorta un cuadrado de ' + c + ' cm × ' + c + ' cm en una esquina. ¿Cuál es el <b>' + (area ? 'área' : 'perímetro') + '</b> de la figura que queda?',
        svg: s, ans: area ? a * b - c * c : 2 * (a + b), u: area ? 'cm²' : 'cm',
        mal: area ? [a * b, a * b - 4 * c, a * b - 2 * c] : [2 * (a + b) - 2 * c, 2 * (a + b) + 2 * c, 2 * (a + b) - c],
        sol: area ? 'Área del rectángulo menos el cuadrado: ' + (a * b) + ' − ' + (c * c) + ' = ' + (a * b - c * c) + ' cm².'
          : '¡El perímetro no cambia! Los dos lados nuevos del corte (' + c + ' + ' + c + ') reemplazan exactamente a los ' + c + ' + ' + c + ' cm quitados del borde. Perímetro = 2 × (' + a + ' + ' + b + ') = ' + (2 * (a + b)) + ' cm.'
      };
    }
  });

  J.reg({
    id: 'med.baldosas', tema: 'med', nombre: 'Cubrir una superficie', difs: [3],
    gen: function (r, d, L) {
      var lado = r.pick([20, 25, 50]), por = 100 / lado, A = r.int(2, 5), B = r.int(1, 4);
      var ans = A * por * B * por;
      return {
        t: '¿Cuántas baldosas cuadradas de ' + lado + ' cm de lado se necesitan para cubrir un piso rectangular de ' + A + ' m × ' + B + ' m?', ans: ans,
        mal: [A * B, A * B * por, 2 * (A + B) * por, ans / 2],
        sol: 'En 1 m caben ' + por + ' baldosas (' + lado + ' cm × ' + por + ' = 100 cm). A lo largo caben ' + (A * por) + ' y a lo ancho ' + (B * por) + ': ' + (A * por) + ' × ' + (B * por) + ' = ' + ans + ' baldosas.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
