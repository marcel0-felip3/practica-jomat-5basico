/* Utilidades: azar con semilla, formato chileno de números, fracciones y dibujo SVG. */
(function (root) {
  'use strict';
  var J = root.J = root.J || {};

  /* ---------- Azar con semilla (mulberry32): misma semilla = mismas preguntas ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  J.rng = function (seed) {
    var f = mulberry32(seed >>> 0);
    var r = {
      rand: f,
      int: function (a, b) { a = Math.ceil(a); b = Math.floor(b); if (b < a) b = a; return a + Math.floor(f() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      },
      chance: function (p) { return f() < p; },
      sample: function (arr, k) { return r.shuffle(arr).slice(0, k); }
    };
    return r;
  };
  J.nuevaSemilla = function () { return (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0; };

  /* ---------- Números en formato es-CL: 12.345,67 ---------- */
  J.f = function (n) {
    if (typeof n !== 'number') return String(n);
    var neg = n < 0; n = Math.abs(n);
    var s = String(Math.round(n * 1e6) / 1e6);
    var p = s.split('.');
    var ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + ent + (p[1] ? ',' + p[1] : '');
  };
  J.plata = function (n) { return '$' + J.f(n); };
  J.redo = function (x) { return Math.round(x * 1e6) / 1e6; };

  /* ---------- Fracciones ---------- */
  J.mcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  J.mcm = function (a, b) { return a / J.mcd(a, b) * b; };
  J.fr = function (n, d, mixto) { return { n: n, d: d, mixto: !!mixto }; };
  J.simp = function (n, d) { var g = J.mcd(n, d) || 1; return J.fr(n / g, d / g); };
  J.esFr = function (x) { return x !== null && typeof x === 'object' && 'n' in x && 'd' in x; };
  J.valor = function (x) { return J.esFr(x) ? x.n / x.d : x; };
  J.frTxt = function (x) {
    if (x.mixto && x.n >= x.d) {
      var e = Math.floor(x.n / x.d), r = x.n % x.d;
      return r ? e + ' ' + r + '/' + x.d : String(e);
    }
    return x.n + '/' + x.d;
  };
  function frStack(n, d) {
    return '<span class="fr"><span class="fr-n">' + n + '</span><span class="fr-d">' + d + '</span></span>';
  }
  J.frHTML = function (x) {
    if (x.mixto && x.n >= x.d) {
      var e = Math.floor(x.n / x.d), r = x.n % x.d;
      return r ? '<span class="mix">' + e + '</span>' + frStack(r, x.d) : String(e);
    }
    return frStack(x.n, x.d);
  };
  /* Fracción escrita dentro de un texto: F(3,4) */
  J.F = function (n, d) { return frStack(n, d); };

  /* ---------- Texto ---------- */
  J.NOMBRES_A = ['Sofía', 'Tamara', 'Valentina', 'Isidora', 'Josefa', 'Florencia', 'Antonia', 'Catalina',
    'Martina', 'Amanda', 'Emilia', 'Trinidad', 'Agustina', 'Fernanda', 'Javiera', 'Camila', 'Renata'];
  J.NOMBRES_O = ['Tomás', 'Benjamín', 'Vicente', 'Martín', 'Matías', 'Joaquín', 'Agustín', 'Lucas', 'Diego',
    'Gaspar', 'Maximiliano', 'Felipe', 'Pedro', 'Juan', 'Cristóbal', 'Simón', 'Ignacio', 'Bruno'];
  J.nombre = function (r) { return r.chance(0.5) ? r.pick(J.NOMBRES_A) : r.pick(J.NOMBRES_O); };
  J.nombres = function (r, k) { return r.sample(J.NOMBRES_A.concat(J.NOMBRES_O), k); };
  J.DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  J.mayus = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  J.pl = function (n, uno, varios) { return J.f(n) + ' ' + (n === 1 ? uno : varios); };

  /* Normaliza texto para comparar respuestas abiertas no numéricas */
  J.norm = function (s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[\s()°º.]/g, '').replace(/;/g, ',');
  };

  /* Lee un número escrito por un niño: 1.500 · 1500 · 2,5 · 2.5 · 3/4 · 2 3/4 · $1.200 · 36 cm² */
  J.leerNumero = function (txt) {
    if (txt === null || txt === undefined) return null;
    var s = String(txt).trim().replace(/^\$\s*/, '').replace(/−/g, '-');
    s = s.replace(/(\d)\s+(?=\d{3}(?!\d|\s*\/))/g, '$1'); // 1 500 -> 1500
    var m = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)/);
    if (m) { var d1 = +m[3]; if (!d1) return null; return +m[1] + (+m[2]) / d1; }
    m = s.match(/^(-?\d+)\s*\/\s*(\d+)/);
    if (m) { var d2 = +m[2]; if (!d2) return null; return +m[1] / d2; }
    m = s.match(/^-?[\d.,]*\d/);
    if (!m) return null;
    var t = m[0];
    var tienePunto = t.indexOf('.') >= 0, tieneComa = t.indexOf(',') >= 0;
    if (tienePunto && tieneComa) {
      if (t.lastIndexOf(',') < t.lastIndexOf('.')) return null;
      t = t.replace(/\./g, '').replace(',', '.');
    } else if (tieneComa) {
      if ((t.match(/,/g) || []).length > 1) return null;
      t = t.replace(',', '.');
    } else if (tienePunto) {
      if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
      else if ((t.match(/\./g) || []).length > 1) return null;
    }
    var v = Number(t);
    return isFinite(v) ? v : null;
  };

  /* ---------- SVG ---------- */
  var S = J.svg = {};
  S.abre = function (w, h, extra) {
    return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
      '" xmlns="http://www.w3.org/2000/svg" role="img" ' + (extra || '') + '>';
  };
  S.txt = function (x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 14) + '" text-anchor="' + (o.anchor || 'middle') +
      '" fill="' + (o.fill || '#222') + '"' + (o.bold ? ' font-weight="700"' : '') + '>' + s + '</text>';
  };
  S.rect = function (x, y, w, h, fill, stroke) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (fill || 'none') +
      '" stroke="' + (stroke || '#333') + '" stroke-width="1.5"/>';
  };
  S.linea = function (x1, y1, x2, y2, color, ancho, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || '#333') +
      '" stroke-width="' + (ancho || 1.5) + '" ' + (extra || '') + '/>';
  };
  S.poli = function (pts, fill, stroke) {
    return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' +
      (fill || 'none') + '" stroke="' + (stroke || '#333') + '" stroke-width="1.8"/>';
  };
  S.COLOR = '#7ec4f2';
  S.COLORES = ['#ef6f6c', '#5aa9e6', '#7bc96f', '#f6c445', '#b48ef0', '#f59e5b'];
})(typeof window !== 'undefined' ? window : globalThis);
