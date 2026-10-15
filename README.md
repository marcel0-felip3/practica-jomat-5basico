# Práctica JOMAT · 5º básico

Web para practicar matemática pensando en las olimpiadas **JOMAT** (Jornadas Matemáticas), categoría **5º básico**. Las preguntas se crean al azar con código, así que **cambian en cada intento**, y cada una trae su solución explicada.

> Proyecto personal y **no oficial**. No tiene relación con la organización de JOMAT ni con la Universidad de La Serena.

**Abrir en línea:** https://marcel0-felip3.github.io/practica-jomat-5basico/

También está la versión de 4º básico: https://marcel0-felip3.github.io/practica-jomat-4basico/

## Qué se puede hacer

| Modo | Descripción |
|---|---|
| 🎯 Práctica por tema | Se elige tema y dificultad (Fácil, Medio, Olímpico). Sin reloj, con pista y solución inmediata. Cuenta la racha de respuestas correctas. |
| ⏱️ Ronda de 1 minuto | 12 preguntas (6 de alternativas y 6 abiertas) con 60 segundos cada una. Una respuesta correcta da entre 500 y 1.000 puntos según la rapidez, como en la plataforma que usó JOMAT en 2020. Guarda el récord. |
| 📝 Simulacro | Mini (10 preguntas, 20 min), Corto (20, 45 min) o Completo (40, 90 min, el formato de la clasificatoria 2022). Mitad alternativas y mitad respuesta abierta, navegador de preguntas, marcas para revisar y entrega automática al terminar el tiempo. Si se cierra la página, se puede continuar. |
| 📈 Mi avance | Porcentaje de respuestas correctas por tema (total y últimas 20), temas para reforzar e historial de intentos. |
| 🖨️ Hoja para imprimir | Arma una guía de 10, 20 o 30 preguntas nuevas con su solucionario en una hoja aparte. |

Las respuestas abiertas aceptan el formato chileno: `1.500` o `1500`, coma decimal (`2,5`), fracciones (`3/4`) y números mixtos (`2 1/3`).

El avance se guarda **solo en el navegador** (localStorage), separado por nombre. Varias personas pueden usar el mismo computador.

## Temas (77 generadores de preguntas)

Siguen los Objetivos de Aprendizaje de Matemática de 5º básico de las Bases Curriculares del Mineduc, más problemas típicos de olimpiada (lógica, conteo, patrones, peor caso).

| Tema | Generadores | Tipos de pregunta |
|---|---|---|
| 🔢 Números y valor posicional | 8 | Valor de una cifra · Componer números · Formar el mayor o menor número · Redondear · Número más cercano · Comparar números · Contar cifras escritas · Números con suma de cifras dada |
| ➗ Cálculo y operaciones | 8 | Sumas y restas · Multiplicaciones · Divisiones · Operaciones combinadas · Pienso un número · Problemas con dinero · Interpretar el resto · Encontrar el dividendo |
| 🍕 Fracciones | 8 | Fracción de una figura · Comparar fracciones · Sumar y restar con igual denominador · Sumar y restar con distinto denominador · Fracción de una cantidad · Fracciones equivalentes · Números mixtos e impropias · Encontrar el total a partir de lo que queda |
| 🔟 Números decimales | 6 | Leer y escribir decimales · Comparar y ordenar decimales · Sumar y restar decimales · Fracción a decimal · Decimales en medidas · Decimal que está a la mitad |
| 🧩 Patrones y ecuaciones | 8 | Continuar una secuencia · Término lejano de una secuencia · Ecuaciones de un paso · Inecuaciones · Tabla con una regla · Secuencia de figuras con palitos · Figuras que valen números · Patrones que se repiten |
| 📐 Geometría | 10 | Caras, aristas y vértices · Simetría · Ángulos en el reloj · Giros · Ubicación en un mapa o plano · Plano cartesiano · Ángulos y sus partes · Contar figuras · Caras y aristas paralelas · Reflexión de letras |
| 📏 Medición y tiempo | 10 | Hora de término y duración · Hora a.m., p.m. y 24 horas · Convertir unidades de tiempo · Días de la semana y calendario · Unidades de longitud · Perímetro y área de rectángulos · Área y perímetro en cuadrícula · Área de triángulos, paralelogramos y trapecios · Figura con una esquina recortada · Cubrir una superficie |
| 📊 Datos y probabilidades | 8 | Gráfico de barras · Pictogramas · Tablas de datos · Probabilidades (comparar) · Peor caso (estar seguro) · Promedio · Diagrama de tallo y hojas · Gráfico de línea |
| 🧠 Lógica y conteo | 11 | Saludos y partidos · Contar números que se pueden formar · Cabezas y patas · Monedas · Edades · Ordenar con pistas · El caracol que sube y resbala · Cifras para numerar páginas · Cubo pintado · Cuadrado mágico · Verdades y mentiras |

Cada generador tiene versiones Fácil, Medio u Olímpico. Las alternativas incorrectas corresponden a errores típicos (por ejemplo, operar sin respetar la prioridad o sumar numeradores y denominadores).

## Cómo funciona

HTML, CSS y JavaScript sin dependencias, sin servidor y sin llamadas a internet. Para usarla sin conexión basta abrir `index.html` con doble clic.

```
index.html
css/estilos.css
js/config.js     nivel del sitio (5º básico) y colores
js/util.js       azar con semilla, formato de números es-CL, fracciones, dibujos SVG
js/motor.js      temas, armado de alternativas, corrección y planes de prueba
js/gen/*.js      generadores de preguntas, un archivo por tema
js/datos.js      usuarios, avance e historial (localStorage)
js/app.js        interfaz
tests/test.js    pruebas de los generadores (node tests/test.js)
```

Las pruebas crean cientos de preguntas por generador y dificultad y revisan que tengan texto, respuesta y solución válidas, cuatro alternativas distintas con la correcta incluida, y que la respuesta correcta escrita a mano se acepte.

Este repositorio se genera desde una carpeta de trabajo común para 4º y 5º básico; el código de los generadores es el mismo y `js/config.js` elige el nivel.
