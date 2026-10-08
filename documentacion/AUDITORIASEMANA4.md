# Auditoría no destructiva — Semana 4

> **Organización de la entrega final:** este informe es histórico. Sus líneas, estados y comandos describen la versión revisada en esa semana. Los enlaces al código apuntan a su ubicación actual; los scripts de pruebas se retiraron de la entrega final. Consulta [README.md](README.md) para ejecutar la versión actual.

**Proyecto:** Válora · Catering empresarial  
**Fecha:** 7 de octubre de 2026  
**Archivos principales:** `index.html`, `styles.css` y `script.js`.  
**Material de referencia:** `semana 4 teoria.pdf`, especialmente los apartados 4.1 a 4.4; buenas prácticas de HTML semántico, diseño adaptable y accesibilidad incorporadas al proyecto.

## 1. Resumen ejecutivo

**Las prácticas principales de la semana 4 están aplicadas y funcionan en los escenarios comprobados.** El proyecto utiliza módulos, funciones separadas por responsabilidad, `let` y `const`, plantillas de texto, desestructuración, una operación asíncrona real y recuperación ante errores del portapapeles.

No se encontraron hallazgos críticos, altos ni medios en el alcance revisado. Se identificaron **tres observaciones de prioridad baja**: algunos textos secundarios pequeños, estilos propios sin uso en los documentos actuales y repetición del límite del mensaje en distintos lugares. Son mejoras de legibilidad y mantenimiento; no impidieron completar las tareas probadas.

| Severidad | Cantidad | Interpretación |
| --- | ---: | --- |
| Crítica | 0 | No se identificaron fallos de esta gravedad en las pruebas realizadas. |
| Alta | 0 | No se observaron bloqueos de las tareas principales comprobadas. |
| Media | 0 | No se confirmó un problema que justificara esta clasificación. |
| Baja | 3 | Mejoras concretas de lectura y mantenimiento, detalladas en la sección 2. |

Este resultado no demuestra que todos los estados posibles estén libres de errores ni constituye una certificación completa de WCAG 2.1 AA. Las herramientas automáticas y las pruebas de teclado cubren una parte de la evaluación.

## 2. Hallazgos críticos, altos, medios y bajos

La severidad se asigna según el impacto comprobado. No se añaden problemas a una categoría solo para que tenga contenido.

### 2.1. Hallazgos críticos

**No se identificaron en el alcance revisado.** No hubo evidencia de pérdida de datos durante las tareas probadas ni ejecución de las etiquetas introducidas en el mensaje de prueba.

Esto no representa una auditoría integral de seguridad ni una evaluación de un servidor: el proyecto prepara mensajes en el navegador.

### 2.2. Hallazgos altos

**No se identificaron.** Las pruebas permitieron navegar, consultar servicios, abrir y cerrar el diálogo, corregir el formulario y preparar la solicitud. La alternativa manual de copia funcionó ante los fallos simulados.

### 2.3. Hallazgos medios

**No se confirmó ningún hallazgo de severidad media.** Las limitaciones de cobertura —por ejemplo, no haber probado un lector de pantalla real— se indican como pruebas pendientes, no como defectos demostrados del código.

### 2.4. Hallazgos bajos

#### S4-B01. Persisten algunos textos secundarios pequeños

**Tipo:** legibilidad y experiencia de uso.

**Evidencia concreta:**

| Archivo y elemento | Declaración o ubicación | Medición con tamaño base normal |
| --- | --- | --- |
| `styles.css`, `.contacto-persona small` | Selector desde la línea 1290; `font-size: 0.61rem`. Es el cargo de la persona de contacto. | 9,76 px. |
| `styles.css`, `.pie-grid h2` | Selector desde la línea 1473; `font-size: 0.61rem`. Afecta «EXPLORA» y «CONVERSEMOS». | 9,76 px. |
| `styles.css`, `.filtro span` | Selector desde la línea 850; `font-size: 0.58rem`. Afecta al contador de servicios. | 9,28 px. |

Se comprobó que estos elementos están presentes y visibles en la distribución de 398 px. No se usó como evidencia el texto de `.hero-nota`, porque está oculto en ese ancho.

**Por qué importa:** aunque el contraste sea suficiente y la página permita ampliar, los detalles muy pequeños pueden exigir un esfuerzo adicional de lectura. No se demuestra un incumplimiento WCAG únicamente por esos tamaños; esta observación es de comodidad de uso.

**Relación con la teoría:** complementa las prácticas de legibilidad y CSS adaptable de las semanas anteriores. La separación entre estilo y comportamiento de la semana 4 permite corregir este detalle en CSS sin alterar la lógica del formulario.




**Qué comprobar después:** que los textos sigan completos, no se superpongan, conserven contraste y se adapten a 320, 398 y 768 px y a la ampliación del texto.

#### S4-B02. Hay reglas CSS propias sin uso en los documentos actuales

**Tipo:** mantenimiento del código.

**Evidencia concreta:** [styles.css](../assets/styles.css) contiene reglas para `.topbar` desde la línea 281, `.logo` desde la 334 y `.marca-texto` desde la 399. También hay ajustes de `.topbar` desde la línea 2165. No se encontraron esas clases en los tres HTML ni en el JavaScript que genera o modifica elementos. La consulta del DOM de `index.html` devolvió cero coincidencias para esos tres selectores.

No deben confundirse `.logo` con las clases realmente usadas `.logo-hd`, `.logo-simbolo` o `.logo-pie`.

**Por qué importa:** estos estilos no están provocando un fallo visual demostrado, pero aumentan la cantidad de código que una persona debe revisar. Pueden hacer creer que todavía existe una parte de la página que ya no está en esta entrega.

**Relación con la teoría:** semana 4, apartado 4.1, página 6, y apartado 4.2, página 11: claridad, evitar repeticiones y facilitar el mantenimiento. En CSS se aplica el mismo principio de conservar código con una función identificable.



No se atribuye a esta limpieza una mejora de velocidad cuantificada: no se midió un problema de rendimiento causado por esas reglas.


**Qué comprobar después:** comparar la apariencia de las tres páginas, ambos temas y los cuatro anchos. Revisar especialmente cabecera y logotipos para evitar eliminar una clase de nombre parecido.

#### S4-B03. El límite del mensaje está repetido en HTML y JavaScript

**Tipo:** mantenimiento y prevención de inconsistencias futuras.

**Evidencia concreta:**

- [index.html](../index.html), línea 792: el campo `#mensaje` tiene `maxlength="1200"`.
- `index.html`, línea 798: el contador comienza con el texto `0 / 1200`.
- [script.js](../js/app.js), línea 382: el manejador del contador vuelve a escribir el número `1200` directamente.

**Situación actual:** los tres valores coinciden. No se encontró una discrepancia visible ni un fallo de validación. La observación se refiere a lo que habría que mantener sincronizado al cambiar el límite.

**Por qué importa:** si se modifica la restricción del campo y se olvida el contador, la página podría anunciar una cantidad distinta de la que acepta.

**Relación con la teoría:** semana 4, apartado 4.1, página 6: evitar repeticiones; apartado 4.2, páginas 8–11: reutilizar funciones y mantener instrucciones claras.




**Qué comprobar después:** mensaje vacío, escritura normal, pegado de texto y llegada al límite. En un entorno de prueba, cambiar temporalmente el máximo para confirmar que el contador se adapta sin editar JavaScript.



### 2.5. Resolución teórica individual de los hallazgos

A continuación se explica, hallazgo por hallazgo, el criterio de solución desde las buenas prácticas, sin instrucciones de código.

#### S4-B01 — Textos secundarios pequeños

**Resolución teórica:** La solución consiste en hacer que todos los textos secundarios tengan un tamaño cómodo de leer y conservar una diferencia clara entre títulos, texto principal y detalles. Después se revisa la página en pantallas pequeñas. Así la persona puede leer la información sin esfuerzo, aunque esté consultando desde un celular.

**En palabras sencillas:** Se ajustan los tamaños de letra para que los detalles también se lean cómodamente.

#### S4-B02 — Reglas de estilo sin uso

**Resolución teórica:** La solución consiste en mantener los estilos que corresponden a elementos que el sitio realmente usa. Antes de retirar alguno, se revisa si otra página o parte dinámica todavía depende de él. Esto reduce reglas innecesarias y hace más fácil entender y mantener el diseño.

**En palabras sencillas:** Se quitan los estilos que ya no sirven, después de comprobar que no se usen en otra parte.

#### S4-B03 — Límite del mensaje repetido

**Resolución teórica:** La solución consiste en definir el límite del mensaje una sola vez y usar ese mismo criterio tanto para aceptar el texto como para informar cuánto se puede escribir. Así el formulario y el contador no se contradicen si el límite cambia.

**En palabras sencillas:** El formulario y su contador deben seguir la misma regla para no mostrar límites distintos.

### 2.6. Aspectos que no se clasifican como defectos

- **Servidor y envío:** el formulario prepara un mensaje para compartir por WhatsApp o correo. No hay una tercera capa de validación en servidor. Es un límite funcional documentado, no un fallo del flujo manual actual. Sería trabajo pendiente si se exigiera recibir solicitudes directamente en un backend.
- **Módulos:** la ejecución completa requiere servir el proyecto por HTTP/HTTPS. Abrirlo como `file://` no es el entorno previsto para sus módulos; el contacto alternativo queda disponible. No se interpreta el uso de módulos como un error.
- **Permisos del portapapeles:** que el navegador no permita copiar automáticamente es un caso previsto; se verificó la recuperación manual.
- **Desplazamiento de la tabla:** que una tabla ancha tenga desplazamiento interno no implica que toda la página falle en móvil. Se comprobó que ese contenedor se puede enfocar y controlar con teclado.
- **Pruebas manuales pendientes:** no haber ejecutado NVDA, VoiceOver o Safari limita lo que se puede afirmar, pero no demuestra por sí solo que la página funcione mal en ellos.

### 2.7. Orden recomendado para una corrección posterior

1. Mejorar los tamaños de texto indicados en S4-B01 y revisar la lectura en móvil.
2. Unificar la referencia al límite del mensaje de S4-B03.
3. Limpiar las reglas propias sin uso confirmadas en S4-B02.
4. Repetir sintaxis, validación HTML, pruebas de lógica, teclado, contraste y los cuatro anchos; completar lector de pantalla y zoom real.

**Estas correcciones son recomendaciones. No se realizaron durante la auditoría.**

## 3. Alcance y evidencia complementaria

### 3.1. Alcance y carácter no destructivo

Se interpretó «styles, css» como el archivo existente `styles.css`. También se revisó `solicitud.js`, porque `script.js` importa de él la validación y la operación de copia: omitirlo habría dejado fuera una parte importante de la semana 4.

Las páginas `privacidad.html` y `condiciones.html` se comprobaron como complemento, ya que comparten estilos y JavaScript. Se ejecutaron las pruebas existentes en `tests/solicitud.test.mjs` y pruebas locales de navegador.

**No se aplicó ninguna corrección.** Solo se creó este informe dentro del proyecto. Las huellas SHA-256 de los archivos preexistentes se compararon al finalizar para comprobar que permanecieran intactos. Los resultados auxiliares se guardaron fuera de la carpeta del proyecto.

### 3.2. Buenas prácticas que sí cumplen en el alcance revisado

| Práctica | Evidencia concreta | Resultado y explicación sencilla |
| --- | --- | --- |
| Variables y alcance — teoría 4.1 y 4.2 | [script.js](../js/app.js), por ejemplo `savedTheme`, `revisionSolicitud` y las variables locales de cada inicializador; [solicitud.js](../js/solicitud.js), `LIMITES`. | Se usan `let` y `const`. Los valores y estados tienen un ámbito definido, sin depender de variables globales creadas accidentalmente. |
| Organización por responsabilidad — teoría 4.2 | `script.js`: `inicializarTema`, `inicializarCabecera`, `inicializarNavegacion`, `inicializarFiltros`, `inicializarDialogo` e `inicializarFormulario`. | Cada bloque principal controla una función reconocible de la página. |
| Módulos ES6 — teoría 4.1, páginas 5–6 | `script.js`, líneas 2–8; exportaciones de `solicitud.js`; [index.html](../index.html), línea 18. | Hay importaciones y exportaciones reales. HTML carga el código como módulo nativo. |
| Reutilización, parámetros y desestructuración — teoría 4.1 y 4.2 | `solicitud.js`: `fechaLocal`, `obtenerErrorCampo` y `crearResumenSolicitud`. | Las reglas se separan de la actualización visual; pueden probarse de forma independiente. |
| Asincronía — teoría 4.3 | `solicitud.js`, `copiarTexto`; `script.js`, manejador de `#copiar-solicitud`, desde la línea 422. | Se espera la promesa real del portapapeles con `await`; se anuncia el estado de espera. No se utiliza una API remota inventada. |
| Manejo de errores — teoría 4.4 | `ErrorPortapapeles` en `solicitud.js`; `try`, `catch` y `finally` en la operación de copia de `script.js`. | Si la copia automática falla, se ofrece una alternativa manual y el botón vuelve a estar disponible. |
| Control del estado asíncrono | `script.js`, `revisionSolicitud`, `revisionAlCopiar` y comprobación de `aria-disabled`. | Se evita la doble copia y que una respuesta antigua actualice los avisos de una solicitud recién editada. |
| HTML semántico | `index.html`: `main`, secciones con títulos, `article`, `aside`, tabla con encabezados, `figure`, `figcaption`, `time`, `details`, `summary` y `dialog`. | La estructura expresa la función del contenido. Las tres páginas tienen un `h1` y un `main` cada una. |
| Formulario y nombres accesibles | `index.html`, líneas 690–698: `aria-labelledby`, `aria-describedby`, `fieldset` y `legend`; campos con etiquetas asociadas. | El formulario tiene nombre propio y los campos se relacionan con sus ayudas y errores. Los obligatorios aparecen antes de los opcionales. |
| Validación y presentación de datos | `solicitud.js`, `obtenerErrorCampo`; `script.js`, `validateField` y asignación mediante `textContent`. | Se revisan entradas y fechas, se identifica el primer error y el resumen muestra los datos como texto, sin ejecutarlos como HTML. |
| Teclado y foco visible | `styles.css`: reglas independientes de `:focus` y `:focus-visible`, y `.skip-link:focus`; `index.html`, contenedor de tabla en la línea 505. | El enlace de salto se ve al enfocarlo. La tabla recibe foco y permite desplazarse con flechas. |
| Diálogo y menú | `script.js`, `inicializarDialogo` e `inicializarNavegacion`. | Se comprobó apertura, cierre con Escape y recuperación del foco. El recorrido del diálogo no activó controles del contenido de fondo. |
| Diseño adaptable | `styles.css`: `.barra-navegacion`, `.grid-servicios`, `.acciones-solicitud`, medidas relativas y consultas de medios. | Flexbox y Grid organizan el contenido. No apareció desbordamiento horizontal global en los cuatro anchos probados. |
| Contraste de los estados revisados | `styles.css`: `.marca-wordmark small`, `.boton-borde:hover` y `.filtro:hover:not(.activo)` usan el color de foco adaptado al tema. | Las alertas anteriores de contraste de la marca y los estados revisados del resumen no se reprodujeron en esta matriz. |
| Alternativas cuando falla una capacidad | `script.js`, protección del almacenamiento local; `index.html`, `.aviso-sin-js`. | El tema y el menú funcionan con almacenamiento bloqueado. Si el módulo no carga, siguen disponibles el contenido y el contacto alternativo. |

### 3.3. Pruebas repetidas durante esta auditoría

| Prueba | Resultado |
| --- | --- |
| Existencia de los archivos solicitados y del módulo importado | Archivos encontrados. |
| `node --check script.js` y `node --check solicitud.js` | Sintaxis correcta. |
| `node --test tests/solicitud.test.mjs` | 6 pruebas aprobadas, 0 fallidas. Cubren campos obligatorios, teléfono, correo y cantidades, fechas, resumen y copia asíncrona. |
| Validación HTML de las tres páginas | `html-validate`, configuración `standard`: sin errores. |
| Matriz de páginas | 24 escenarios: tres páginas × cuatro anchos —320, 398, 768 y 1440 px— × temas claro y oscuro. |
| Accesibilidad automática de esa matriz | Sin infracciones detectadas por las reglas A/AA ejecutadas con axe, incluidas etiquetas WCAG hasta 2.2. |
| Estados adicionales | 24 escenarios de formulario con errores, resumen preparado y diálogo abierto; cuatro anchos y ambos temas. Sin infracciones detectadas por las reglas WCAG 2.1 A/AA ejecutadas. |
| Errores y recursos | Sin errores JavaScript ni fallos de carga en la matriz de páginas. |
| Redistribución | Sin desbordamiento horizontal global en la matriz. La tabla conserva su desplazamiento interno. |
| Copia del resumen | Comprobados éxito, rechazo, función ausente, espera, doble activación, respuesta antigua después de editar y alternativa sin selección disponible. Los permisos y las respuestas se simularon en el entorno de prueba. |
| Formulario | Datos inválidos muestran errores; datos válidos preparan el resumen. Volver a editar conserva los valores. Preparar la solicitud no envió datos por la red. |
| Seguridad del contenido | Un mensaje de prueba que contenía una etiqueta HTML se mostró literalmente; no creó una imagen ni ejecutó código. |
| Navegación por secciones | En los cuatro anchos, al llegar a Inicio, Servicios, Nosotros, Beneficios y Contacto, se actualizó el enlace marcado con `aria-current`. |
| Sin JavaScript o con módulo bloqueado | Se mantuvieron navegación, contenido y contacto alternativo. |
| Ampliación y espaciado | No hubo desbordamiento global al duplicar el tamaño raíz del texto ni al aplicar el espaciado personalizado probado. |
| Edge | Comprobación adicional de carga y diálogo a 320 y 1440 px, sin errores JavaScript ni desbordamiento global. |

**Límites:** Brave y Edge comparten Chromium. No se realizó una prueba con NVDA, VoiceOver, Firefox, Safari ni dispositivos físicos. Duplicar la fuente mediante CSS no equivale a probar todos los efectos del zoom real al 200 % o 400 %. Los resultados automáticos incompletos no se interpretan como criterios aprobados.
