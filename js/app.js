/* Interfaz: inicio, práctica por tema, ronda de 1 minuto, simulacro, resultados, avance y hoja para imprimir. */
(function (root) {
  'use strict';
  var J = root.J, CFG = root.CFG, L = CFG.nivel, D = J.datos;
  var app = document.getElementById('app');
  var ACC = {}, timer = null, teclas = null;
  var LETRAS = 'ABCD';
  var ANIMOS_OK = ['¡Muy bien!', '¡Excelente!', '¡Correcto!', '¡Genial!', '¡Así se hace!', '¡Bien pensado!'];
  var ANIMOS_NO = ['Casi. Revisa la solución:', 'No era esa. Mira cómo se resuelve:', 'Esta vez no. Así se piensa:'];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pinta(html) {
    pararReloj(); teclas = null;
    app.innerHTML = html;
    root.scrollTo(0, 0);
    var foco = app.querySelector('[data-foco]'); if (foco) foco.focus();
  }
  function pararReloj() { if (timer) { clearInterval(timer); timer = null; } }
  app.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-acc]'); if (!el || el.disabled) return;
    var fn = ACC[el.getAttribute('data-acc')]; if (fn) { ev.preventDefault(); fn(el.getAttribute('data-v'), el); }
  });
  document.addEventListener('keydown', function (ev) {
    if (teclas && !ev.ctrlKey && !ev.metaKey && !ev.altKey) teclas(ev);
  });
  function boton(acc, txt, v, clase) {
    return '<button type="button" class="btn ' + (clase || '') + '" data-acc="' + acc + '"' + (v !== undefined ? ' data-v="' + esc(v) + '"' : '') + '>' + txt + '</button>';
  }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function fecha(t) { var d = new Date(t); return d.toLocaleDateString('es-CL') + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function modal(html) {
    var m = document.createElement('div'); m.className = 'modal'; m.innerHTML = '<div class="caja">' + html + '</div>';
    app.appendChild(m); var b = m.querySelector('[data-foco]'); if (b) b.focus();
    return m;
  }

  /* ---------- Cabecera ---------- */
  function cabecera() {
    var p = D.actual();
    document.getElementById('usuario').innerHTML = p ? '<span class="chip">👤 ' + esc(p.nombre) + '</span>' : '';
  }
  document.getElementById('marca').addEventListener('click', function (e) { e.preventDefault(); if (salirConfirmado()) inicio(); });
  function salirConfirmado() {
    if (E.modo === 'simulacro' && E.s && !E.s.entregado) {
      return root.confirm('Tienes un simulacro en curso. Quedará guardado y podrás continuarlo desde el inicio. ¿Ir al inicio?');
    }
    return true;
  }

  var E = { modo: null };

  /* ---------- Bienvenida ---------- */
  function bienvenida() {
    E.modo = 'bienvenida'; cabecera();
    var lista = D.lista();
    pinta('<section class="panel bienvenida"><div class="logo-grande">' + CFG.nivel + 'º</div>' +
      '<h1>¡Hola! Vamos a practicar para JOMAT</h1><p>Nivel <b>' + CFG.nombre + '</b>. Escribe tu nombre para guardar tu avance en este computador.</p>' +
      '<form id="fNombre" class="fila"><input id="nombre" maxlength="30" placeholder="Tu nombre" autocomplete="off" data-foco>' +
      '<button class="btn primario" type="submit">Entrar</button></form>' +
      (lista.length ? '<p class="sub">O sigue como:</p><div class="fila wrap">' + lista.map(function (n) { return boton('entrar', '👤 ' + esc(n), n, 'suave'); }).join('') + '</div>' : '') +
      '</section>');
    document.getElementById('fNombre').addEventListener('submit', function (e) {
      e.preventDefault(); if (D.entrar(document.getElementById('nombre').value)) inicio();
    });
  }
  ACC.entrar = function (n) { D.entrar(n); inicio(); };

  /* ---------- Inicio ---------- */
  function inicio() {
    var p = D.actual(); if (!p) return bienvenida();
    E = { modo: 'inicio' }; cabecera();
    var enc = D.enCurso();
    var tarjeta = function (acc, ico, tit, txt) { return '<button class="tarjeta" data-acc="' + acc + '"><span class="ico-t">' + ico + '</span><b>' + tit + '</b><span>' + txt + '</span></button>'; };
    pinta('<section class="hola"><h1>¡Hola, ' + esc(p.nombre) + '!</h1><p>¿Qué quieres hacer hoy?</p></section>' +
      (enc ? '<div class="aviso">Tienes un simulacro sin terminar. ' + boton('continuarSim', 'Continuar simulacro', '', 'primario') + '</div>' : '') +
      '<div class="tarjetas">' +
      tarjeta('irPractica', '🎯', 'Práctica por tema', 'Elige un tema y una dificultad. Sin reloj, con la solución de cada pregunta.') +
      tarjeta('irRonda', '⏱️', 'Ronda de 1 minuto', '12 preguntas con 60 segundos cada una, como en la plataforma de la competencia.') +
      tarjeta('irSimulacro', '📝', 'Simulacro', 'Prueba con reloj: mitad alternativas y mitad respuesta abierta.') +
      tarjeta('irAvance', '📈', 'Mi avance', 'Cómo te va en cada tema y tus intentos anteriores.') +
      tarjeta('irImprimir', '🖨️', 'Hoja para imprimir', 'Arma una guía con preguntas nuevas y su solucionario.') +
      '</div>' +
      '<details class="info"><summary>¿Qué es JOMAT y cómo es la prueba?</summary>' +
      '<p>JOMAT (Jornadas Matemáticas) es el programa de olimpiadas de matemática de la Universidad de La Serena para estudiantes de 4º, 5º y 6º básico. ' +
      'Los mejores de cada categoría representan a Chile en OLIMPRI. En 2022 la clasificatoria tuvo 40 preguntas (20 de alternativas y 20 de respuesta abierta) en 90 minutos; ' +
      'en 2020 cada pregunta se respondía con 1 minuto de reloj y el puntaje premiaba también la rapidez. El formato de cada año lo publica la organización.</p>' +
      '<p>Esta página es una <b>práctica personal y no oficial</b>. Sigue los Objetivos de Aprendizaje de Matemática de ' + CFG.nombre + ' (Mineduc) y agrega problemas tipo olimpiada. ' +
      'Las preguntas se crean al azar, así que cambian en cada intento.</p>' +
      (CFG.otro ? '<p>¿Quieres un desafío mayor o repasar? Prueba la práctica de <a href="' + CFG.otro.url + '">' + CFG.otro.nombre + '</a>.</p>' : '') +
      '</details>' +
      '<p class="pie-inicio">' + boton('cambiarUsuario', 'Cambiar de usuario', '', 'link') + '</p>');
  }
  ACC.cambiarUsuario = function () { D.salir(); bienvenida(); };
  ACC.irPractica = function () { configPractica(); };
  ACC.irRonda = function () { configRonda(); };
  ACC.irSimulacro = function () { configSimulacro(); };
  ACC.irAvance = function () { avance(); };
  ACC.irImprimir = function () { configImprimir(); };
  ACC.inicio = function () { inicio(); };

  /* ---------- Piezas comunes ---------- */
  function selDif(actual) {
    return '<div class="fila wrap seg" role="group" aria-label="Dificultad">' + [1, 2, 3].map(function (d) {
      return '<button type="button" class="opc' + (d === actual ? ' on' : '') + '" data-acc="dif" data-v="' + d + '">' + ['', '⭐ ', '⭐⭐ ', '⭐⭐⭐ '][d] + J.DIFS[d] + '</button>';
    }).join('') + '</div>';
  }
  ACC.dif = function (v) { E.cfg.d = +v; E.redibujar(); };

  function temaDe(q) { return J.tema(q.tema); }
  function ayudaAbierta(q) {
    if (q.forma === 'mixto') return 'Escribe el número mixto con un espacio, por ejemplo: 2 1/3';
    if (J.esFr(q.ans)) return 'Escribe la fracción con una barra, por ejemplo: 3/4';
    if (q.normDig) return 'Escribe la hora así: 17:35';
    if (typeof q.ans === 'string' && q.ans.charAt(0) === '(') return 'Escribe las coordenadas así: (3, 5)';
    if (typeof q.ans === 'string') return 'Escribe tu respuesta';
    if (q.ans % 1) return 'Usa coma para los decimales, por ejemplo: 2,5';
    return 'Escribe solo el número' + (q.u ? ' (la unidad ya está escrita)' : '');
  }
  function modoTeclado(q) { return typeof q.ans === 'number' && q.ans % 1 === 0 ? 'numeric' : 'text'; }

  /* Dibuja una pregunta. opts: {num, total, marcada, respuesta (simulacro), cabeza} */
  function htmlPregunta(q, opts) {
    opts = opts || {};
    var t = temaDe(q);
    var h = '<article class="pregunta"><div class="meta"><span>' + t.icono + ' ' + t.nombre + '</span><span>' + ['', '⭐', '⭐⭐', '⭐⭐⭐'][q.d] + ' ' + J.DIFS[q.d] + '</span>' +
      (opts.num ? '<span>Pregunta ' + opts.num + (opts.total ? ' de ' + opts.total : '') + '</span>' : '') + '</div>' +
      '<div class="enunciado">' + q.t + '</div>' + (q.svg ? '<div class="figura">' + q.svg + '</div>' : '');
    if (q.tipo === 'alt') {
      h += '<div class="alts">' + q.alts.map(function (a, i) {
        var sel = opts.respuesta === i ? ' sel' : '';
        return '<button type="button" class="alt' + sel + '" data-acc="alt" data-v="' + i + '"><span class="letra">' + LETRAS[i] + '</span><span class="valor">' + J.mostrar(a, q.u) + '</span></button>';
      }).join('') + '</div>';
    } else {
      h += '<form class="abierta" id="fResp"><label for="resp" class="sr">Tu respuesta</label><div class="fila">' +
        '<input id="resp" autocomplete="off" inputmode="' + modoTeclado(q) + '" value="' + esc(opts.respuesta || '') + '" placeholder="Tu respuesta" data-foco>' +
        (q.u ? '<span class="unidad">' + esc(q.u) + '</span>' : '') +
        (opts.sinBoton ? '' : '<button class="btn primario" type="submit">Comprobar</button>') + '</div><p class="ayuda">' + ayudaAbierta(q) + '</p></form>';
    }
    return h + '<div id="fb"></div></article>';
  }
  function htmlSolucion(q, ok, resp) {
    var correcta = J.mostrar(q.ans, q.u);
    var tuya = resp === null || resp === undefined || resp === '' ? '<i>sin responder</i>' : (q.tipo === 'alt' ? LETRAS[resp] + ') ' + J.mostrar(q.alts[resp], q.u) : esc(resp));
    return '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><p class="titulo-fb">' + (ok ? '✅ ' : '❌ ') + (ok ? J.rng(Date.now()).pick(ANIMOS_OK) : J.rng(Date.now()).pick(ANIMOS_NO)) + '</p>' +
      (ok ? '' : '<p>Tu respuesta: ' + tuya + '<br>Respuesta correcta: <b>' + (q.tipo === 'alt' ? LETRAS[q.ok] + ') ' : '') + correcta + '</b></p>') +
      '<p class="sol"><b>Solución:</b> ' + q.sol + '</p></div>';
  }

  /* ---------- Práctica por tema ---------- */
  function configPractica() {
    E = { modo: 'configPractica', cfg: E.cfg && E.cfg.d ? E.cfg : { d: 1, tema: null } };
    E.redibujar = configPractica.dibujar; configPractica.dibujar();
  }
  configPractica.dibujar = function () {
    var p = D.actual(), temas = J.temasDe(L);
    pinta('<section class="panel"><h2>🎯 Práctica por tema</h2><p>1. Elige un tema:</p><div class="temas">' +
      temas.map(function (t) {
        var s = p.stats[t.id], info = s && s.n ? pct(s.ok, s.n) + '% de ' + s.n : 'sin intentos';
        return '<button type="button" class="tema' + (E.cfg.tema === t.id ? ' on' : '') + '" data-acc="tema" data-v="' + t.id + '"><span class="ico-t">' + t.icono + '</span><b>' + t.nombre + '</b><small>' + info + '</small></button>';
      }).join('') +
      '<button type="button" class="tema' + (E.cfg.tema === 'mix' ? ' on' : '') + '" data-acc="tema" data-v="mix"><span class="ico-t">🎲</span><b>Todos mezclados</b><small>un poco de todo</small></button></div>' +
      '<p>2. Elige la dificultad:</p>' + selDif(E.cfg.d) +
      '<div class="fila acciones">' + boton('inicio', '← Volver') + '<button type="button" class="btn primario" data-acc="empezarPractica"' + (E.cfg.tema ? '' : ' disabled') + '>Empezar</button></div></section>');
  };
  ACC.tema = function (v) { E.cfg.tema = v; E.redibujar(); };
  ACC.empezarPractica = function () {
    E.modo = 'practica'; E.p = { n: 0, ok: 0, racha: 0, mejorRacha: 0, base: J.nuevaSemilla(), previas: [] };
    nuevaPractica();
  };
  function nuevaPractica() {
    var tema = E.cfg.tema === 'mix' ? null : E.cfg.tema, P = E.p;
    var gs = J.gensDe(tema, E.cfg.d, L);
    var r = J.rng(P.base + P.n * 977);
    var libres = gs.filter(function (g) { return P.previas.indexOf(g.id) < 0; });
    var g = r.pick(libres.length ? libres : gs);
    P.previas.push(g.id); if (P.previas.length > Math.min(4, gs.length - 1)) P.previas.shift();
    P.q = J.crear(g, r.int(1, 2147483646), E.cfg.d, L, null);
    P.respondida = false; P.respAlt = null;
    dibujarPractica();
  }
  function dibujarPractica() {
    var P = E.p, q = P.q;
    pinta('<div class="barra-sup"><span>✅ ' + P.ok + ' de ' + P.n + '</span><span>🔥 Racha: ' + P.racha + '</span>' + boton('terminarPractica', 'Terminar', '', 'suave') + '</div>' +
      htmlPregunta(q, { num: P.n + 1 }) +
      '<div class="fila acciones" id="accP">' + boton('pista', '💡 Pista', '', 'suave') + '</div>');
    var f = document.getElementById('fResp');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); responderPractica(document.getElementById('resp').value); });
    teclas = teclasPregunta(function (i) { responderPractica(i); }, function () { if (P.respondida) nuevaPractica(); });
  }
  function teclasPregunta(alAlt, alEnter) {
    return function (ev) {
      var tag = (ev.target.tagName || '').toLowerCase();
      if (ev.key === 'Enter' && tag !== 'input' && tag !== 'button') { alEnter(); ev.preventDefault(); return; }
      if (tag === 'input') return;
      var k = ev.key.toUpperCase(), i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'ABCD'.indexOf(k);
      if (i >= 0 && k.length === 1) alAlt(i);
    };
  }
  ACC.alt = function (v) {
    if (E.modo === 'practica') responderPractica(+v);
    else if (E.modo === 'ronda') responderRonda(+v);
    else if (E.modo === 'simulacro') elegirSim(+v);
  };
  ACC.pista = function () {
    var q = E.p.q, t = temaDe(q);
    document.getElementById('fb').innerHTML = '<div class="pista">💡 ' + (q.pista || t.pista) + '</div>';
  };
  function responderPractica(resp) {
    var P = E.p, q = P.q;
    if (P.respondida) return;
    if (q.tipo === 'abierta' && String(resp).trim() === '') { document.getElementById('resp').focus(); return; }
    if (q.tipo === 'alt' && (resp < 0 || resp >= q.alts.length)) return;
    var ok = J.corregir(q, resp);
    P.respondida = true; P.n++; if (ok) { P.ok++; P.racha++; P.mejorRacha = Math.max(P.mejorRacha, P.racha); } else P.racha = 0;
    D.registrar(q.tema, ok);
    marcarAlternativas(q, resp);
    var inp = document.getElementById('resp'); if (inp) { inp.disabled = true; inp.classList.add(ok ? 'bien' : 'mal'); }
    var bt = app.querySelector('#fResp button'); if (bt) bt.disabled = true;
    document.getElementById('fb').innerHTML = htmlSolucion(q, ok, resp) + (P.racha > 0 && P.racha % 5 === 0 ? '<p class="racha">🔥 ¡' + P.racha + ' seguidas correctas!</p>' : '');
    document.getElementById('accP').innerHTML = boton('siguientePractica', 'Siguiente →', '', 'primario');
    document.querySelector('.barra-sup span').textContent = '✅ ' + P.ok + ' de ' + P.n;
    document.querySelectorAll('.barra-sup span')[1].textContent = '🔥 Racha: ' + P.racha;
    var sig = app.querySelector('[data-acc="siguientePractica"]'); if (sig) sig.focus();
  }
  function marcarAlternativas(q, resp) {
    if (q.tipo !== 'alt') return;
    app.querySelectorAll('.alt').forEach(function (b, i) {
      b.disabled = true;
      if (i === q.ok) b.classList.add('correcta');
      else if (i === resp) b.classList.add('incorrecta');
    });
  }
  ACC.siguientePractica = function () { nuevaPractica(); };
  ACC.terminarPractica = function () {
    var P = E.p;
    if (P.n) D.historial({ modo: 'Práctica', detalle: (E.cfg.tema === 'mix' ? 'Todos los temas' : J.tema(E.cfg.tema).nombre) + ' · ' + J.DIFS[E.cfg.d], ok: P.ok, n: P.n });
    pinta('<section class="panel centro"><h2>¡Buen trabajo!</h2><p class="grande">' + P.ok + ' de ' + P.n + ' correctas</p>' +
      (P.n ? '<p>Mejor racha: ' + P.mejorRacha + ' 🔥</p>' : '') +
      '<div class="fila acciones">' + boton('inicio', 'Inicio') + boton('irPractica', 'Practicar otro tema', '', 'primario') + '</div></section>');
  };

  /* ---------- Ronda de 1 minuto ---------- */
  var SEG = 60, NRONDA = 12;
  function configRonda() {
    E = { modo: 'configRonda', cfg: { d: (E.cfg && E.cfg.d) || 1 } };
    E.redibujar = function () {
      var p = D.actual(), m = p.mejores;
      pinta('<section class="panel"><h2>⏱️ Ronda de 1 minuto</h2><p>' + NRONDA + ' preguntas de todos los temas (6 de alternativas y 6 de respuesta abierta). Tienes <b>60 segundos</b> para cada una. ' +
        'Una respuesta correcta da entre 500 y 1.000 puntos: mientras más rápido, más puntos.</p><p>Elige la dificultad:</p>' + selDif(E.cfg.d) +
        '<p class="sub">Récords: ' + [1, 2, 3].map(function (d) { return J.DIFS[d] + ' ' + (m['ronda' + d] !== undefined ? J.f(m['ronda' + d]) + ' pts' : '—'); }).join(' · ') + '</p>' +
        '<div class="fila acciones">' + boton('inicio', '← Volver') + boton('empezarRonda', '¡Empezar!', '', 'primario') + '</div></section>');
    };
    E.redibujar();
  }
  ACC.empezarRonda = function () {
    var seed = J.nuevaSemilla();
    var qs = J.rng(seed).shuffle(J.plan(L, NRONDA, E.cfg.d, seed, { nAlt: NRONDA / 2 }));
    E.modo = 'ronda'; E.r = { qs: qs, i: 0, pts: 0, ok: 0, res: [] };
    preguntaRonda();
  };
  function preguntaRonda() {
    var R = E.r, q = R.qs[R.i];
    R.respondida = false;
    pinta('<div class="barra-sup"><span>Pregunta ' + (R.i + 1) + ' de ' + R.qs.length + '</span><span>⭐ ' + J.f(R.pts) + ' pts</span><span id="seg" class="reloj">60</span></div>' +
      '<div class="tiempo"><div id="barraT"></div></div>' + htmlPregunta(q) + '<div class="fila acciones" id="accR"></div>');
    var f = document.getElementById('fResp');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); responderRonda(document.getElementById('resp').value); });
    R.fin = Date.now() + SEG * 1000;
    timer = setInterval(function () {
      var resta = R.fin - Date.now();
      var s = document.getElementById('seg'), b = document.getElementById('barraT');
      if (s) { s.textContent = Math.max(0, Math.ceil(resta / 1000)); s.className = 'reloj' + (resta < 10000 ? ' rojo' : resta < 20000 ? ' amarillo' : ''); }
      if (b) b.style.width = Math.max(0, resta / (SEG * 10)) + '%';
      if (resta <= 0) responderRonda(null);
    }, 200);
    teclas = teclasPregunta(function (i) { responderRonda(i); }, function () { if (R.respondida) ACC.siguienteRonda(); });
  }
  function responderRonda(resp) {
    var R = E.r, q = R.qs[R.i];
    if (R.respondida) return;
    if (resp !== null && q.tipo === 'abierta' && String(resp).trim() === '') return;
    pararReloj();
    var resta = Math.max(0, R.fin - Date.now());
    var ok = resp !== null && J.corregir(q, resp);
    var pts = ok ? 500 + Math.round(500 * resta / (SEG * 1000)) : 0;
    R.respondida = true; R.pts += pts; if (ok) R.ok++;
    R.res.push({ q: q, resp: resp, ok: ok, pts: pts, seg: Math.round((SEG * 1000 - resta) / 1000) });
    D.registrar(q.tema, ok);
    marcarAlternativas(q, resp);
    var inp = document.getElementById('resp'); if (inp) inp.disabled = true;
    var bt = app.querySelector('#fResp button'); if (bt) bt.disabled = true;
    document.getElementById('fb').innerHTML = (resp === null ? '<p class="titulo-fb">⏰ ¡Se acabó el tiempo!</p>' : '') + htmlSolucion(q, ok, resp) + (ok ? '<p class="pts">+' + pts + ' puntos</p>' : '');
    document.getElementById('accR').innerHTML = boton('siguienteRonda', R.i + 1 < R.qs.length ? 'Siguiente →' : 'Ver resultado', '', 'primario');
    app.querySelector('.barra-sup span:nth-child(2)').textContent = '⭐ ' + J.f(R.pts) + ' pts';
    var sig = app.querySelector('[data-acc="siguienteRonda"]'); if (sig) sig.focus();
  }
  ACC.siguienteRonda = function () {
    var R = E.r; R.i++;
    if (R.i < R.qs.length) return preguntaRonda();
    var record = D.mejor('ronda' + E.cfg.d, R.pts);
    D.historial({ modo: 'Ronda 1 minuto', detalle: J.DIFS[E.cfg.d], ok: R.ok, n: R.qs.length, pts: R.pts });
    pinta('<section class="panel centro"><h2>⏱️ Resultado de la ronda</h2><p class="grande">' + J.f(R.pts) + ' puntos</p><p>' + R.ok + ' de ' + R.qs.length + ' correctas' +
      (record ? ' · <b>🏆 ¡Nuevo récord!</b>' : '') + '</p>' + revision(R.res) +
      '<div class="fila acciones">' + boton('inicio', 'Inicio') + boton('empezarRonda', 'Otra ronda', '', 'primario') + '</div></section>');
  };
  function revision(lista) {
    return '<div class="revision">' + lista.map(function (x, i) {
      var q = x.q;
      return '<details class="rev ' + (x.ok ? 'ok' : 'no') + '"><summary><span>' + (x.ok ? '✅' : '❌') + ' ' + (i + 1) + '. ' + temaDe(q).nombre + '</span>' +
        (x.pts !== undefined ? '<span>' + x.pts + ' pts · ' + x.seg + ' s</span>' : '') + '</summary>' +
        '<div class="enunciado">' + q.t + '</div>' + (q.svg ? '<div class="figura">' + q.svg + '</div>' : '') + htmlSolucion(q, x.ok, x.resp) + '</details>';
    }).join('') + '</div>';
  }

  /* ---------- Simulacro ---------- */
  var FORMATOS = { mini: { n: 10, min: 20, nombre: 'Mini' }, corto: { n: 20, min: 45, nombre: 'Corto' }, completo: { n: 40, min: 90, nombre: 'Completo' } };
  function configSimulacro() {
    E = { modo: 'configSimulacro', cfg: { d: (E.cfg && E.cfg.d) || 1, f: 'corto' } };
    E.redibujar = function () {
      pinta('<section class="panel"><h2>📝 Simulacro</h2><p>Una prueba con reloj, con preguntas de todos los temas. La mitad son de alternativas y la otra mitad de respuesta abierta. ' +
        'Puedes avanzar, volver y marcar preguntas para revisarlas. Las respuestas se ven al final.</p><p>Elige el largo:</p><div class="fila wrap seg">' +
        Object.keys(FORMATOS).map(function (k) { var F = FORMATOS[k]; return '<button type="button" class="opc' + (E.cfg.f === k ? ' on' : '') + '" data-acc="formato" data-v="' + k + '">' + F.nombre + ': ' + F.n + ' preguntas · ' + F.min + ' min</button>'; }).join('') +
        '</div><p class="sub">El «Completo» tiene el formato de la clasificatoria 2022: 40 preguntas en 90 minutos.</p><p>Elige la dificultad:</p>' + selDif(E.cfg.d) +
        '<div class="fila acciones">' + boton('inicio', '← Volver') + boton('empezarSim', 'Empezar simulacro', '', 'primario') + '</div></section>');
    };
    E.redibujar();
  }
  ACC.formato = function (v) { E.cfg.f = v; E.redibujar(); };
  ACC.empezarSim = function (semilla) {
    var F = FORMATOS[E.cfg.f], seed = semilla ? +semilla : J.nuevaSemilla();
    var qs = J.plan(L, F.n, E.cfg.d, seed);
    E.modo = 'simulacro';
    E.s = { qs: qs, resp: qs.map(function () { return null; }), marcas: qs.map(function () { return false; }), i: 0, fin: Date.now() + F.min * 60000, seed: seed, f: E.cfg.f, d: E.cfg.d };
    guardarSim(); dibujarSim();
  };
  function guardarSim() {
    var S = E.s;
    D.enCurso({ usuario: D.actual().nombre, plan: S.qs.map(function (q) { return { gid: q.gid, seed: q.seed, d: q.d, tipo: q.tipo }; }), resp: S.resp, marcas: S.marcas, i: S.i, fin: S.fin, seed: S.seed, f: S.f, d: S.d });
  }
  ACC.continuarSim = function () {
    var c = D.enCurso(); if (!c) return inicio();
    E = { modo: 'simulacro', cfg: { d: c.d, f: c.f } };
    E.s = { qs: c.plan.map(function (p) { return J.crear(J.gen(p.gid), p.seed, p.d, L, p.tipo); }), resp: c.resp, marcas: c.marcas, i: c.i, fin: c.fin, seed: c.seed, f: c.f, d: c.d };
    if (Date.now() >= E.s.fin) return entregarSim(true);
    dibujarSim();
  };
  function dibujarSim() {
    var S = E.s, q = S.qs[S.i], n = S.qs.length;
    var resp = S.resp.filter(function (x) { return x !== null && x !== ''; }).length;
    pinta('<div class="barra-sup"><span>📝 Respondidas ' + resp + ' de ' + n + '</span><span id="reloj" class="reloj">' + mmss(S.fin - Date.now()) + '</span>' + boton('pedirEntrega', 'Entregar', '', 'suave') + '</div>' +
      '<nav class="navq" aria-label="Preguntas">' + S.qs.map(function (x, i) {
        var c = (i === S.i ? ' actual' : '') + (S.resp[i] !== null && S.resp[i] !== '' ? ' resp' : '') + (S.marcas[i] ? ' marca' : '');
        return '<button type="button" class="nq' + c + '" data-acc="irQ" data-v="' + i + '" title="' + (x.tipo === 'alt' ? 'Alternativas' : 'Respuesta abierta') + '">' + (i + 1) + '</button>';
      }).join('') + '</nav>' +
      htmlPregunta(q, { num: S.i + 1, total: n, respuesta: S.resp[S.i], sinBoton: true }) +
      '<div class="fila acciones">' + boton('antQ', '← Anterior', '', S.i === 0 ? 'oculto' : '') +
      boton('marcarQ', S.marcas[S.i] ? '🚩 Quitar marca' : '🚩 Marcar para revisar', '', 'suave') +
      (S.i + 1 < n ? boton('sigQ', 'Siguiente →', '', 'primario') : boton('pedirEntrega', 'Entregar', '', 'primario')) + '</div>');
    var inp = document.getElementById('resp');
    if (inp) {
      inp.addEventListener('input', function () { S.resp[S.i] = inp.value; actualizarContador(); guardarSim(); });
      document.getElementById('fResp').addEventListener('submit', function (e) { e.preventDefault(); ACC.sigQ(); });
    }
    timer = setInterval(function () {
      var resta = S.fin - Date.now(), el = document.getElementById('reloj');
      if (el) { el.textContent = mmss(resta); el.className = 'reloj' + (resta < 5 * 60000 ? ' rojo' : resta < 10 * 60000 ? ' amarillo' : ''); }
      if (resta <= 0) entregarSim(true);
    }, 500);
    teclas = teclasPregunta(function (i) { elegirSim(i); }, function () { ACC.sigQ(); });
  }
  function actualizarContador() {
    var S = E.s, resp = S.resp.filter(function (x) { return x !== null && x !== ''; }).length;
    var el = app.querySelector('.barra-sup span'); if (el) el.textContent = '📝 Respondidas ' + resp + ' de ' + S.qs.length;
    var nq = app.querySelectorAll('.nq')[S.i]; if (nq) nq.classList.toggle('resp', S.resp[S.i] !== null && S.resp[S.i] !== '');
  }
  function elegirSim(i) {
    var S = E.s; if (S.qs[S.i].tipo !== 'alt') return;
    S.resp[S.i] = S.resp[S.i] === i ? null : i;
    app.querySelectorAll('.alt').forEach(function (b, k) { b.classList.toggle('sel', S.resp[S.i] === k); });
    actualizarContador(); guardarSim();
  }
  ACC.irQ = function (v) { E.s.i = +v; guardarSim(); dibujarSim(); };
  ACC.antQ = function () { if (E.s.i > 0) { E.s.i--; guardarSim(); dibujarSim(); } };
  ACC.sigQ = function () { if (E.s.i + 1 < E.s.qs.length) { E.s.i++; guardarSim(); dibujarSim(); } else ACC.pedirEntrega(); };
  ACC.marcarQ = function () { E.s.marcas[E.s.i] = !E.s.marcas[E.s.i]; guardarSim(); dibujarSim(); };
  ACC.pedirEntrega = function () {
    var S = E.s, sin = S.resp.filter(function (x) { return x === null || x === ''; }).length, marc = S.marcas.filter(Boolean).length;
    modal('<h3>¿Entregar el simulacro?</h3><p>' + (sin ? 'Te quedan <b>' + sin + '</b> preguntas sin responder. ' : '¡Respondiste todas! ') + (marc ? 'Tienes ' + marc + ' marcada(s) para revisar.' : '') + '</p>' +
      '<div class="fila acciones">' + boton('cerrarModal', 'Seguir respondiendo', '', 'suave') + '<button type="button" class="btn primario" data-acc="entregar" data-foco>Entregar</button></div>');
  };
  ACC.cerrarModal = function () { var m = app.querySelector('.modal'); if (m) m.remove(); };
  ACC.entregar = function () { entregarSim(false); };
  function entregarSim(porTiempo) {
    var S = E.s; if (S.entregado) return;
    S.entregado = true; pararReloj(); D.enCurso(null);
    var res = S.qs.map(function (q, i) {
      var r = S.resp[i], ok = r !== null && r !== '' && J.corregir(q, r);
      D.registrar(q.tema, ok);
      return { q: q, resp: r, ok: ok };
    });
    var ok = res.filter(function (x) { return x.ok; }).length, n = res.length;
    var porTema = {};
    res.forEach(function (x) { var t = porTema[x.q.tema] || (porTema[x.q.tema] = { n: 0, ok: 0 }); t.n++; if (x.ok) t.ok++; });
    var F = FORMATOS[S.f];
    D.historial({ modo: 'Simulacro ' + F.nombre, detalle: J.DIFS[S.d], ok: ok, n: n });
    var record = D.mejor('sim_' + S.f + S.d, ok);
    var filas = Object.keys(porTema).map(function (k) { var t = porTema[k]; return { t: J.tema(k), n: t.n, ok: t.ok, p: pct(t.ok, t.n) }; }).sort(function (a, b) { return a.p - b.p; });
    var debiles = filas.filter(function (x) { return x.p < 70; }).slice(0, 3);
    E.modo = 'resultados';
    pinta('<section class="panel"><h2>📝 Resultado del simulacro</h2>' + (porTiempo ? '<p class="aviso">⏰ Se acabó el tiempo y la prueba se entregó sola.</p>' : '') +
      '<p class="grande centro">' + ok + ' de ' + n + ' correctas (' + pct(ok, n) + '%)</p>' + (record ? '<p class="centro">🏆 ¡Tu mejor resultado en este simulacro!</p>' : '') +
      '<h3>Por tema</h3><table class="tbl ancho"><tr><th>Tema</th><th>Correctas</th><th></th></tr>' + filas.map(function (x) {
        return '<tr><td>' + x.t.icono + ' ' + x.t.nombre + '</td><td>' + x.ok + ' / ' + x.n + '</td><td class="barra-celda"><div class="bar"><div style="width:' + x.p + '%"></div></div></td></tr>';
      }).join('') + '</table>' +
      (debiles.length ? '<p class="consejo">💡 Para la próxima, practica: ' + debiles.map(function (x) { return '<b>' + x.t.nombre + '</b>'; }).join(', ') + '.</p>' : '<p class="consejo">💡 ¡Muy parejo en todos los temas! Prueba una dificultad mayor.</p>') +
      '<h3>Revisión pregunta por pregunta</h3>' + revision(res) +
      '<div class="fila acciones">' + boton('inicio', 'Inicio') + boton('repetirSim', 'Repetir el mismo', S.seed, 'suave') + boton('irSimulacro', 'Otro simulacro', '', 'primario') + '</div></section>');
  }
  ACC.repetirSim = function (seed) { E.cfg = { d: E.s.d, f: E.s.f }; ACC.empezarSim(seed); };

  /* ---------- Mi avance ---------- */
  function avance() {
    E = { modo: 'avance' };
    var p = D.actual(), temas = J.temasDe(L);
    var filas = temas.map(function (t) { var s = p.stats[t.id] || { n: 0, ok: 0, ult: [] }; var u = s.ult || []; return { t: t, n: s.n, ok: s.ok, p: pct(s.ok, s.n), pu: pct(u.reduce(function (a, b) { return a + b; }, 0), u.length) }; });
    var conDatos = filas.filter(function (x) { return x.n >= 3; }).sort(function (a, b) { return a.pu - b.pu; });
    pinta('<section class="panel"><h2>📈 Mi avance</h2>' +
      '<table class="tbl ancho"><tr><th>Tema</th><th>Preguntas</th><th>Correctas</th><th>Últimas 20</th></tr>' + filas.map(function (x) {
        return '<tr><td>' + x.t.icono + ' ' + x.t.nombre + '</td><td>' + x.n + '</td><td>' + (x.n ? x.p + '%' : '—') + '</td><td class="barra-celda">' + (x.n ? '<div class="bar"><div style="width:' + x.pu + '%"></div></div>' : '') + '</td></tr>';
      }).join('') + '</table>' +
      (conDatos.length ? '<p class="consejo">💡 Temas para reforzar: ' + conDatos.slice(0, 3).map(function (x) { return '<b>' + x.t.nombre + '</b> (' + x.pu + '%)'; }).join(', ') + '.</p>' : '<p class="consejo">Responde algunas preguntas y aquí verás en qué temas te va mejor.</p>') +
      '<h3>Intentos anteriores</h3>' + (p.hist.length ? '<table class="tbl ancho"><tr><th>Fecha</th><th>Actividad</th><th>Resultado</th></tr>' + p.hist.slice(0, 25).map(function (h) {
        return '<tr><td>' + fecha(h.fecha) + '</td><td>' + esc(h.modo) + ' · ' + esc(h.detalle) + '</td><td>' + h.ok + ' / ' + h.n + (h.pts !== undefined ? ' · ' + J.f(h.pts) + ' pts' : '') + '</td></tr>';
      }).join('') + '</table>' : '<p>Todavía no hay intentos guardados.</p>') +
      '<div class="fila acciones">' + boton('inicio', '← Volver') + boton('pedirBorrar', 'Borrar mi avance', '', 'link') + '</div></section>');
  }
  ACC.pedirBorrar = function () {
    modal('<h3>¿Borrar tu avance?</h3><p>Se borran las estadísticas, el historial y los récords de <b>' + esc(D.actual().nombre) + '</b> en este navegador. No se puede deshacer.</p>' +
      '<div class="fila acciones">' + '<button type="button" class="btn suave" data-acc="cerrarModal" data-foco>Cancelar</button>' + boton('borrar', 'Sí, borrar', '', 'peligro') + '</div>');
  };
  ACC.borrar = function () { D.borrarAvance(); avance(); };

  /* ---------- Hoja para imprimir ---------- */
  function configImprimir() {
    E = { modo: 'configImprimir', cfg: { d: (E.cfg && E.cfg.d) || 1, tema: 'mix', n: 20 } };
    E.redibujar = function () {
      var temas = J.temasDe(L);
      pinta('<section class="panel"><h2>🖨️ Hoja para imprimir</h2><p>Arma una guía con preguntas nuevas y su solucionario en una página aparte.</p>' +
        '<label class="campo">Tema <select id="selTema"><option value="mix">Todos los temas</option>' + temas.map(function (t) { return '<option value="' + t.id + '"' + (E.cfg.tema === t.id ? ' selected' : '') + '>' + t.nombre + '</option>'; }).join('') + '</select></label>' +
        '<label class="campo">Cantidad <select id="selN">' + [10, 20, 30].map(function (n) { return '<option' + (E.cfg.n === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
        '<p>Dificultad:</p>' + selDif(E.cfg.d) +
        '<div class="fila acciones">' + boton('inicio', '← Volver') + boton('generarHoja', 'Generar hoja', '', 'primario') + '</div></section>');
      document.getElementById('selTema').addEventListener('change', function (e) { E.cfg.tema = e.target.value; });
      document.getElementById('selN').addEventListener('change', function (e) { E.cfg.n = +e.target.value; });
    };
    E.redibujar();
  }
  ACC.generarHoja = function () {
    var c = E.cfg, seed = J.nuevaSemilla();
    var qs = J.plan(L, c.n, c.d, seed, c.tema === 'mix' ? {} : { tema: c.tema });
    var titulo = 'Guía de práctica JOMAT · ' + CFG.nombre + ' · ' + (c.tema === 'mix' ? 'Todos los temas' : J.tema(c.tema).nombre) + ' · ' + J.DIFS[c.d];
    var p = D.actual();
    pinta('<div class="no-imprimir fila acciones">' + boton('irImprimir', '← Volver') + boton('imprimir', '🖨️ Imprimir', '', 'primario') + '</div>' +
      '<section class="hoja"><h2>' + titulo + '</h2><p class="datos-hoja">Nombre: ' + esc(p.nombre) + ' &nbsp;&nbsp; Fecha: ____________ &nbsp;&nbsp; Correctas: ____ / ' + qs.length + '</p>' +
      qs.map(function (q, i) {
        return '<div class="item"><div class="enunciado"><b>' + (i + 1) + '.</b> ' + q.t + '</div>' + (q.svg ? '<div class="figura">' + q.svg + '</div>' : '') +
          (q.tipo === 'alt' ? '<div class="alts-print">' + q.alts.map(function (a, k) { return '<span>' + LETRAS[k].toLowerCase() + ') ' + J.mostrar(a, q.u) + '</span>'; }).join('') + '</div>'
            : '<p class="linea-resp">Respuesta: ______________________ ' + esc(q.u) + '</p>') + '</div>';
      }).join('') + '</section>' +
      '<section class="hoja salto"><h2>Solucionario</h2>' + qs.map(function (q, i) {
        return '<p class="sol-item"><b>' + (i + 1) + '. ' + (q.tipo === 'alt' ? LETRAS[q.ok].toLowerCase() + ') ' : '') + J.mostrar(q.ans, q.u) + '</b> — ' + q.sol + '</p>';
      }).join('') + '</section>');
  };
  ACC.imprimir = function () { root.print(); };

  /* ---------- Arranque ---------- */
  document.title = 'Práctica JOMAT · ' + CFG.nombre;
  root.addEventListener('beforeunload', function (e) {
    if (E.modo === 'simulacro' && E.s && !E.s.entregado) { e.preventDefault(); e.returnValue = ''; }
  });
  if (D.actual()) inicio(); else bienvenida();
})(window);
