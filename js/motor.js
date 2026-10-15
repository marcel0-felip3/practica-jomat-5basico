/* Motor: registro de generadores, armado de preguntas, alternativas, corrección y planes de prueba. */
(function (root) {
  'use strict';
  var J = root.J;

  J.TEMAS = [
    { id: 'num', nombre: 'Números y valor posicional', icono: '🔢',
      pista: 'Escribe el número en una tabla de posiciones (unidades, decenas, centenas…).' },
    { id: 'ope', nombre: 'Cálculo y operaciones', icono: '➗',
      pista: 'Primero × y :, después + y −. Comprueba con la operación inversa.' },
    { id: 'fra', nombre: 'Fracciones', icono: '🍕',
      pista: 'Haz un dibujo: una barra o una pizza dividida en partes iguales.' },
    { id: 'dec', nombre: 'Números decimales', icono: '🔟',
      pista: 'Completa con ceros para que todos tengan la misma cantidad de decimales y alinea la coma.' },
    { id: 'pat', nombre: 'Patrones y ecuaciones', icono: '🧩',
      pista: 'Mira cuánto cambia de un término al siguiente. En una balanza, quita lo mismo de los dos lados.' },
    { id: 'geo', nombre: 'Geometría', icono: '📐',
      pista: 'Haz un dibujo o usa un objeto real para comprobar.' },
    { id: 'med', nombre: 'Medición y tiempo', icono: '📏',
      pista: 'Pasa todo a la misma unidad antes de calcular.' },
    { id: 'dat', nombre: 'Datos y probabilidades', icono: '📊',
      pista: 'Lee el título, la escala y la leyenda antes de mirar los datos.' },
    { id: 'log', nombre: 'Lógica y conteo', icono: '🧠',
      pista: 'Haz una lista ordenada o una tabla. Prueba primero con números pequeños.' }
  ];
  J.tema = function (id) { for (var i = 0; i < J.TEMAS.length; i++) if (J.TEMAS[i].id === id) return J.TEMAS[i]; return null; };
  J.DIFS = { 1: 'Fácil', 2: 'Medio', 3: 'Olímpico' };

  J.GENS = [];
  J.reg = function (g) {
    if (!g.niv) g.niv = [4, 5];
    if (!g.difs) g.difs = [1, 2, 3];
    J.GENS.push(g);
  };
  J.gensDe = function (tema, d, L) {
    return J.GENS.filter(function (g) {
      return (!tema || g.tema === tema) && g.niv.indexOf(L) >= 0 && (!d || g.difs.indexOf(d) >= 0);
    });
  };
  J.temasDe = function (L) {
    return J.TEMAS.filter(function (t) { return J.gensDe(t.id, 0, L).length > 0; });
  };
  J.gen = function (id) { for (var i = 0; i < J.GENS.length; i++) if (J.GENS[i].id === id) return J.GENS[i]; return null; };

  /* ---------- Mostrar respuestas ---------- */
  J.mostrar = function (x, u) {
    var s = J.esFr(x) ? J.frHTML(x) : (typeof x === 'number' ? J.f(x) : String(x));
    return u ? s + (u === '°' ? '' : ' ') + u : s;
  };
  J.textoPlano = function (x) { return J.esFr(x) ? J.frTxt(x) : (typeof x === 'number' ? J.f(x) : String(x)); };
  function clave(x) {
    if (J.esFr(x) || typeof x === 'number') return 'v:' + Math.round(J.valor(x) * 1e6);
    return 's:' + J.norm(x);
  }

  /* Alternativas cercanas para completar cuando el generador da pocas */
  function vecinos(ans, r) {
    var v = J.valor(ans), out = [];
    if (J.esFr(ans)) {
      out.push(J.fr(ans.n + 1, ans.d), J.fr(ans.d, ans.n || 1), J.fr(Math.max(1, ans.n - 1), ans.d), J.fr(ans.n, ans.d + 1));
      return out;
    }
    var entero = Math.abs(v - Math.round(v)) < 1e-9;
    if (entero) {
      var paso = v >= 1000 ? r.pick([100, 1000, 10]) : v >= 100 ? r.pick([10, 100, 1]) : v >= 20 ? r.pick([1, 10, 2]) : 1;
      out.push(v + paso, v - paso, v + 2 * paso, v * 10, v + 1, v - 1, v + 2);
    } else {
      out.push(J.redo(v + 0.1), J.redo(v - 0.1), J.redo(v * 10), J.redo(v / 10), J.redo(v + 0.01), J.redo(v + 1));
    }
    return out.filter(function (x) { return x >= 0; });
  }

  J.armarAlts = function (ans, mal, r) {
    var vistos = {}; vistos[clave(ans)] = 1;
    var elegidas = [];
    function prueba(x) {
      if (x === undefined || x === null || elegidas.length >= 3) return;
      if (typeof x === 'number' && (!isFinite(x) || x < 0)) return;
      if (J.esFr(x) && (x.d <= 0 || x.n < 0)) return;
      var k = clave(x);
      if (vistos[k]) return;
      vistos[k] = 1; elegidas.push(x);
    }
    (mal || []).forEach(prueba);
    if (elegidas.length < 3 && (typeof ans === 'number' || J.esFr(ans))) vecinos(ans, r).forEach(prueba);
    if (elegidas.length < 3) return null;
    var lista = r.shuffle([ans].concat(elegidas));
    var ok = -1;
    for (var i = 0; i < 4; i++) if (lista[i] === ans) ok = i;
    return { lista: lista, ok: ok };
  };

  /* pref: 'alt' | 'abierta' | null (al azar) */
  J.crear = function (g, seed, d, L, pref) {
    var r = J.rng(seed);
    var o = g.gen(r, d, L);
    var q = {
      gid: g.id, tema: g.tema, d: d, L: L, seed: seed,
      t: o.t, svg: o.svg || '', ans: o.ans, sol: o.sol, u: o.u || '',
      forma: o.forma || null, normDig: !!o.normDig, acepta: o.acepta || null, pista: o.pista || null
    };
    var puedeAlt = !o.soloAbierta, puedeAb = !o.soloAlt;
    var tipo;
    if (pref === 'alt') tipo = puedeAlt ? 'alt' : 'abierta';
    else if (pref === 'abierta') tipo = puedeAb ? 'abierta' : 'alt';
    else tipo = puedeAlt && puedeAb ? (r.chance(0.5) ? 'alt' : 'abierta') : (puedeAlt ? 'alt' : 'abierta');
    if (tipo === 'alt') {
      var a = J.armarAlts(o.ans, o.mal, r);
      if (a) { q.alts = a.lista; q.ok = a.ok; } else tipo = 'abierta';
    }
    q.tipo = tipo;
    return q;
  };
  J.rehacer = function (q) { return J.crear(J.gen(q.gid), q.seed, q.d, q.L, q.tipo); };

  /* ---------- Corrección ---------- */
  J.igual = function (q, txt) {
    if (txt === null || txt === undefined || String(txt).trim() === '') return false;
    var ans = q.ans;
    if (typeof ans === 'string') {
      var cands = [ans].concat(q.acepta || []);
      if (q.normDig) {
        var dig = function (s) { return String(s).replace(/\D/g, '').replace(/^0+(?=\d)/, ''); };
        return cands.some(function (c) { return dig(c) === dig(txt) && dig(txt) !== ''; });
      }
      return cands.some(function (c) { return J.norm(c) === J.norm(txt); });
    }
    var s = String(txt).trim();
    if (q.forma === 'mixto' && !/^\d+\s+\d+\s*\/\s*\d+/.test(s) && !/^\d+$/.test(s)) return false;
    if (q.forma === 'fraccion' && !/^\d+\s*\/\s*\d+/.test(s)) return false;
    var v = J.leerNumero(s);
    if (v === null) return false;
    return Math.abs(v - J.valor(ans)) < 1e-9;
  };
  J.corregir = function (q, resp) {
    if (q.tipo === 'alt') return resp === q.ok;
    return J.igual(q, resp);
  };

  /* ---------- Planes de prueba ---------- */
  /* Reparte las preguntas entre los temas y alterna dificultades según el nivel elegido. */
  J.MEZCLA = { 1: [1, 1, 1, 2], 2: [1, 2, 2, 2, 3], 3: [2, 3, 3, 3] };
  J.plan = function (L, n, dif, seed, opciones) {
    opciones = opciones || {};
    var r = J.rng(seed);
    var temas = opciones.tema ? [J.tema(opciones.tema)] : r.shuffle(J.temasDe(L));
    var usados = {}, preguntas = [];
    var mezcla = opciones.difFija ? [dif] : J.MEZCLA[dif];
    var nAlt = opciones.nAlt === undefined ? Math.ceil(n / 2) : opciones.nAlt;
    for (var i = 0; i < n; i++) {
      var tema = temas[i % temas.length].id;
      var d = mezcla[(i * 7 + r.int(0, 9)) % mezcla.length];
      var gs = J.gensDe(tema, d, L);
      if (!gs.length) { gs = J.gensDe(tema, 0, L); }
      var libres = gs.filter(function (g) { return !usados[g.id]; });
      var g = r.pick(libres.length ? libres : gs);
      usados[g.id] = 1;
      if (g.difs.indexOf(d) < 0) d = g.difs[g.difs.length - 1];
      preguntas.push({ g: g, d: d, s: r.int(1, 2147483646) });
    }
    preguntas = r.shuffle(preguntas);
    return preguntas.map(function (p, i) {
      var pref = opciones.pref || (i < nAlt ? 'alt' : 'abierta');
      return J.crear(p.g, p.s, p.d, L, pref);
    }).sort(function (a, b) { return (a.tipo === 'alt' ? 0 : 1) - (b.tipo === 'alt' ? 0 : 1); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
