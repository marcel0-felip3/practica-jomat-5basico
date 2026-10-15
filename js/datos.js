/* Datos guardados solo en este navegador: usuarios, avance por tema, historial y récords. */
(function (root) {
  'use strict';
  var J = root.J, CFG = root.CFG;
  var CLAVE = 'jomat-practica-' + CFG.nivel + 'b-v1';
  var memoria = null;

  function leer() {
    try { var s = root.localStorage.getItem(CLAVE); if (s) return JSON.parse(s); } catch (e) { /* sin almacenamiento */ }
    return memoria;
  }
  function escribir() {
    memoria = BD;
    try { root.localStorage.setItem(CLAVE, JSON.stringify(BD)); } catch (e) { /* queda solo en memoria */ }
  }
  var BD = leer() || { perfiles: {}, actual: null, enCurso: null };
  if (!BD.perfiles) BD.perfiles = {};

  function nuevoPerfil(nombre) { return { nombre: nombre, creado: Date.now(), stats: {}, hist: [], mejores: {} }; }

  J.datos = {
    actual: function () { return BD.actual && BD.perfiles[BD.actual] ? BD.perfiles[BD.actual] : null; },
    lista: function () { return Object.keys(BD.perfiles).sort(); },
    entrar: function (nombre) {
      nombre = String(nombre).trim().slice(0, 30);
      if (!nombre) return null;
      if (!BD.perfiles[nombre]) BD.perfiles[nombre] = nuevoPerfil(nombre);
      BD.actual = nombre; escribir();
      return BD.perfiles[nombre];
    },
    salir: function () { BD.actual = null; escribir(); },
    registrar: function (tema, ok) {
      var p = this.actual(); if (!p) return;
      var s = p.stats[tema] || (p.stats[tema] = { n: 0, ok: 0, ult: [] });
      s.n++; if (ok) s.ok++;
      s.ult.push(ok ? 1 : 0); if (s.ult.length > 20) s.ult.shift();
      escribir();
    },
    historial: function (e) {
      var p = this.actual(); if (!p) return;
      e.fecha = Date.now(); p.hist.unshift(e); if (p.hist.length > 60) p.hist.pop();
      escribir();
    },
    mejor: function (clave, valor) {
      var p = this.actual(); if (!p) return false;
      var antes = p.mejores[clave];
      if (antes === undefined || valor > antes) { p.mejores[clave] = valor; escribir(); return antes !== undefined || valor > 0; }
      return false;
    },
    borrarAvance: function () {
      var p = this.actual(); if (!p) return;
      BD.perfiles[p.nombre] = nuevoPerfil(p.nombre); escribir();
    },
    enCurso: function (v) {
      if (v === undefined) return BD.enCurso && BD.enCurso.usuario === BD.actual ? BD.enCurso : null;
      BD.enCurso = v; escribir();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
