/* Pruebas de los generadores: node tests/test.js
   Revisa, para cada generador, nivel y dificultad, muchas semillas:
   - que la pregunta tenga texto, respuesta y solución sin "undefined" ni "NaN";
   - que las alternativas sean 4, distintas y con la correcta incluida;
   - que la respuesta correcta escrita «como la escribiría un niño» se corrija como correcta;
   - que los simulacros se armen con la cantidad pedida. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var SRC = fs.existsSync(path.join(__dirname, '..', 'src', 'js')) ? path.join(__dirname, '..', 'src', 'js') : path.join(__dirname, '..', 'js');
var ctx = { console: console };
ctx.globalThis = ctx;
vm.createContext(ctx);
var archivos = ['util.js', 'motor.js'].concat(fs.readdirSync(path.join(SRC, 'gen')).map(function (f) { return 'gen/' + f; }));
archivos.forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f }); });
var J = ctx.J;

var errores = [], total = 0, SEMILLAS = +(process.env.SEMILLAS || 300);
function err(g, L, d, s, msg, q) {
  if (errores.length < 60) errores.push(g.id + ' L' + L + ' d' + d + ' s' + s + ': ' + msg + (q ? ' | ' + String(q.t).slice(0, 140) : ''));
}
function malo(x) { return /undefined|NaN|Infinity|\[object/.test(String(x)); }

// Respuestas canónicas que debe aceptar la corrección de respuesta abierta
function comoEscribe(q) {
  var a = q.ans;
  if (J.esFr(a)) return J.frTxt(a);
  if (typeof a === 'number') return J.f(a);
  return a;
}

J.GENS.forEach(function (g) {
  g.niv.forEach(function (L) {
    g.difs.forEach(function (d) {
      for (var s = 1; s <= SEMILLAS; s++) {
        ['alt', 'abierta'].forEach(function (pref) {
          var q;
          try { q = J.crear(g, s * 7919 + d, d, L, pref); } catch (e) { err(g, L, d, s, 'EXCEPCIÓN ' + e.message); return; }
          total++;
          if (!q.t || malo(q.t)) err(g, L, d, s, 'texto inválido', q);
          if (q.ans === undefined || q.ans === null || (typeof q.ans === 'number' && (!isFinite(q.ans) || q.ans < 0))) err(g, L, d, s, 'respuesta inválida: ' + q.ans, q);
          if (typeof q.ans === 'number' && Math.abs(q.ans * 1000 - Math.round(q.ans * 1000)) > 1e-6) err(g, L, d, s, 'respuesta con muchos decimales: ' + q.ans, q);
          if (!q.sol || malo(q.sol)) err(g, L, d, s, 'solución inválida', q);
          if (malo(q.svg)) err(g, L, d, s, 'svg inválido', q);
          if (q.tipo === 'alt') {
            if (!q.alts || q.alts.length !== 4) err(g, L, d, s, 'no hay 4 alternativas', q);
            else {
              var txts = q.alts.map(function (a) { return J.textoPlano(a); });
              if (new Set(txts).size !== 4) err(g, L, d, s, 'alternativas repetidas: ' + txts.join(' | '), q);
              if (txts.some(malo)) err(g, L, d, s, 'alternativa inválida: ' + txts.join(' | '), q);
              if (!J.corregir(q, q.ok) || J.corregir(q, (q.ok + 1) % 4)) err(g, L, d, s, 'corrección de alternativa', q);
              var vals = q.alts.filter(function (a) { return typeof a === 'number' || J.esFr(a); }).map(function (a) { return Math.round(J.valor(a) * 1e6); });
              if (new Set(vals).size !== vals.length) err(g, L, d, s, 'alternativas con el mismo valor: ' + txts.join(' | '), q);
            }
          } else {
            var w = comoEscribe(q);
            if (!J.corregir(q, w)) err(g, L, d, s, 'no acepta su propia respuesta «' + w + '»', q);
            if (typeof q.ans === 'string' && /[🔴🔵🟢🟡🟣▲■●★◆⬆➡⬇⬅]/.test(q.ans)) err(g, L, d, s, 'respuesta abierta imposible de escribir', q);
            if (typeof q.ans === 'number' && J.corregir(q, J.f(q.ans + 1))) err(g, L, d, s, 'acepta una respuesta incorrecta', q);
          }
        });
      }
    });
  });
});

// Lectura de números
var casos = [['1.500', 1500], ['1500', 1500], ['2,5', 2.5], ['2.5', 2.5], ['3/4', 0.75], ['2 3/4', 2.75], ['$1.200', 1200], ['36 cm²', 36],
  ['1.234,5', 1234.5], ['0,05', 0.05], ['12.345.678', 12345678], ['1 500', 1500], ['0.500', 0.5], ['abc', null]];
casos.forEach(function (c) { var v = J.leerNumero(c[0]); if (v !== c[1]) errores.push('leerNumero(' + c[0] + ') = ' + v + ', se esperaba ' + c[1]); });

// Simulacros
[4, 5].forEach(function (L) {
  [1, 2, 3].forEach(function (d) {
    [12, 20, 40].forEach(function (n) {
      for (var s = 1; s <= 20; s++) {
        var p = J.plan(L, n, d, s * 31 + n);
        if (p.length !== n) errores.push('plan L' + L + ' d' + d + ' n' + n + ': ' + p.length + ' preguntas');
        var alt = p.filter(function (q) { return q.tipo === 'alt'; }).length;
        if (Math.abs(alt - n / 2) > n / 4) errores.push('plan L' + L + ' d' + d + ' n' + n + ' s' + s + ': ' + alt + ' de alternativas');
      }
    });
  });
});

var porNivel = { 4: 0, 5: 0 };
J.GENS.forEach(function (g) { g.niv.forEach(function (L) { porNivel[L]++; }); });
console.log('Generadores: ' + J.GENS.length + ' (4º básico: ' + porNivel[4] + ', 5º básico: ' + porNivel[5] + '). Preguntas revisadas: ' + total + '.');
if (errores.length) { console.log('ERRORES (' + errores.length + '):\n' + errores.join('\n')); process.exit(1); }
console.log('OK: sin errores.');
