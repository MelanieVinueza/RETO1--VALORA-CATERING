# Auditoría de la semana 5 — Válora

> **Organización de la entrega final:** este informe es histórico. Sus líneas, estados y comandos describen la versión revisada en esa semana. Los enlaces al código apuntan a su ubicación actual; los scripts de pruebas se retiraron de la entrega final. Consulta [README.md](README.md) para ejecutar la versión actual.

**Fecha:** 7 de octubre de 2026.  
**Archivos principales:** `index.html`, `styles.css` y `script.js`.  
**Archivos relacionados revisados:** `solicitud.js`, `borrador.js`, `catalogo.js`, `assets/servicios.json`, `print.css`, `privacidad.html`, `condiciones.html` y las pruebas existentes.  
**Referencia académica:** `semana 5 teoría (2).pdf`, apartados 5.1 a 5.4: DOM y eventos, validación, almacenamiento, Fetch, IndexedDB y accesibilidad dinámica.

## 1. Resumen ejecutivo

La página aplica las prácticas principales de la semana 5: organiza sus eventos, valida los campos, permite guardar un borrador voluntario y carga un catálogo local con manejo de errores. Mantiene HTML semántico, navegación por teclado, estados accesibles y adaptación a diferentes tamaños de pantalla.

Se encontraron **tres problemas comprobables: uno medio y dos bajos**. Dos estaban relacionados con la reutilización del catálogo en memoria; el tercero, con la coherencia del nombre accesible del botón de tema. Se corrigieron y se repitieron las pruebas correspondientes. No se identificaron hallazgos críticos ni altos dentro del alcance evaluado.

La petición combinaba «no modifiques ningún archivo» con «de paso soluciona los errores». Se tomó esta última indicación como autorización para corregir los problemas comprobados. Primero se conservó evidencia del estado inicial; después se modificaron únicamente `index.html` y `script.js`. **`styles.css` no cambió**, porque la revisión no justificó una corrección en sus estilos. También se creó este informe.

| Gravedad | Hallazgos encontrados | Estado al cerrar esta revisión |
| --- | ---: | --- |
| Crítica | 0 | Ninguno identificado. |
| Alta | 0 | Ninguno identificado. |
| Media | 1 | Corregido y verificado. |
| Baja | 2 | Corregidos y verificados. |

## 2. Hallazgos críticos, altos, medios y bajos

Las líneas indicadas corresponden a los archivos después de esta revisión. Cada hallazgo distingue el comportamiento anterior, la recomendación y la evidencia de su corrección.

### 2.1. Hallazgos críticos

**No se identificaron hallazgos críticos.** En las pruebas realizadas no se observó pérdida general de funcionalidad ni envío automático de los datos del formulario. Esta conclusión se limita a los archivos y casos examinados.

### 2.2. Hallazgos altos

**No se identificaron hallazgos altos.** Las funciones principales de navegación, contacto y preparación de solicitudes permanecieron disponibles durante las pruebas normales y los fallos controlados.

### 2.3. Hallazgos medios

#### H5-01. «Reintentar» podía repetir el error sin volver a cargar el catálogo

**Estado: corregido y verificado.**

**Archivo y elemento:** `script.js:242`, función `mostrarDetalle`; `script.js:311`, controlador de `#reintentar-catalogo`; botón definido en `index.html` dentro de `#dialogo-servicio`.

**Evidencia anterior:** se elegía el catálogo mediante `catalogoEnMemoria || await cargarCatalogo(...)`. El botón llamaba de nuevo a la misma función, sin omitir esa copia. Se reprodujo con una respuesta que contenía solo el servicio de buffet: ese servicio se abría, pero al abrir eventos faltaban sus datos. Aunque el servidor ya ofrecía el catálogo completo, pulsar «Reintentar» dejaba el mismo error. El contador permanecía en **una petición** y la lista tenía **cero elementos**.

El JSON real del proyecto contiene los cuatro servicios. El fallo apareció al simular una respuesta incompleta pero válida para el esquema permitido; no se afirma que ocurra en cada visita normal.

**Por qué importa:** el botón promete volver a intentar una operación, pero solo revisaba otra vez los mismos datos. La persona no podía recuperar los detalles por ese camino. Se clasifica como medio porque el contacto seguía disponible.



**Cambio aplicado:** `mostrarDetalle` acepta `forzarRecarga`; el botón llama a `mostrarDetalle({ forzarRecarga: true })`. Esa opción omite el catálogo que quedó en memoria.

**Prueba posterior:** se repitió la misma secuencia. El reintento generó una **segunda petición**, aparecieron los **tres elementos** del servicio de eventos y el aviso cambió a «Detalles del servicio disponibles». El botón de reintento se oculta cuando la carga termina correctamente.

### 2.4. Hallazgos bajos

#### H5-02. La copia recuperada sin conexión no se volvía a consultar al abrir otro servicio

**Estado: corregido y verificado.**

**Archivo y elemento:** `script.js:257`, asignación de `catalogoEnMemoria` dentro de `mostrarDetalle`.

**Evidencia anterior:** se guardaba en memoria cualquier resultado, también uno marcado con `desdeCache: true`. En la prueba se precargó IndexedDB, se hizo fallar Fetch y se abrió un servicio. Después se restableció la respuesta de red y se abrió otro. Se mantuvo el aviso de copia guardada y el contador siguió en **una petición**, porque se reutilizaba el resultado de respaldo.

**Por qué importa:** la persona podía seguir leyendo, y el aviso identificaba la copia. Sin embargo, la siguiente apertura no intentaba recuperar información actualizada aunque la conexión ya estuviera disponible. Por eso se clasifica como bajo.



**Cambio aplicado:** ahora se asigna `catalogoEnMemoria = catalogo.desdeCache ? null : catalogo`. Los detalles recuperados siguen visibles, pero la siguiente apertura vuelve a intentar Fetch. La copia de IndexedDB sigue disponible si la red vuelve a fallar.

**Prueba posterior:** tras el fallo inicial se mostró la copia guardada; después de restablecer la respuesta y abrir otro servicio se registró una **segunda petición** y apareció «Detalles del servicio disponibles».

No se añadió actualización automática mientras el diálogo permanece abierto: la recuperación se comprueba en la siguiente apertura.

#### H5-03. El botón de tema cambiaba su nombre y también su estado de conmutación

**Estado: corregido y verificado.**

**Archivos y elemento:** `index.html:109`, nombre de `#tema-toggle`; `script.js:36`, actualización de su estado en `applyTheme`.

**Evidencia anterior:** al activar el tema oscuro, el botón pasaba a tener `aria-label="Activar tema claro"` y `aria-pressed="true"`. El nombre describía la siguiente acción, mientras el estado pulsado describía el tema ya seleccionado. El DOM de la prueba confirmó esa combinación.

**Por qué importa:** una persona que usa un lector de pantalla puede interpretar con dificultad qué opción está activa. Se trata de una mejora de coherencia del patrón accesible; no se presenta como un error de sintaxis ARIA ni como una infracción WCAG demostrada automáticamente.



**Cambio aplicado:** el nombre es ahora «Tema oscuro» tanto en el HTML como en JavaScript. `aria-pressed` sigue siendo `true` cuando el tema oscuro está activo y `false` cuando está desactivado. El icono y la paleta conservan su comportamiento.

**Prueba posterior:** al activar el tema oscuro se obtuvo el nombre «Tema oscuro» junto con `aria-pressed="true"`. La revisión de accesibilidad posterior no detectó infracciones automáticas en el control.



### 2.5. Resolución teórica individual de los hallazgos

A continuación se explica, hallazgo por hallazgo, el criterio de solución desde las buenas prácticas, sin instrucciones de código.

#### H5-01 — Reintento del catálogo

**Resolución teórica:** La solución consiste en que «Reintentar» vuelva a consultar la información original y después informe si tuvo éxito o sigue fallando. Si el botón solo repite el mismo resultado anterior, no ayuda a recuperarse del problema. Una nueva consulta le da a la persona una oportunidad real de continuar.

**En palabras sencillas:** Al volver a intentar, la página hace una nueva consulta para darle otra oportunidad de cargar los datos.

#### H5-02 — Uso de la copia local

**Resolución teórica:** La solución consiste en usar la copia local como respaldo cuando la fuente principal no está disponible y volver a revisar esa fuente en una consulta posterior. Así el sitio puede seguir mostrando información durante un corte y, cuando la conexión regresa, intentar obtener datos más recientes.

**En palabras sencillas:** La copia ayuda durante el fallo; luego se vuelve a buscar la información actualizada.

#### H5-03 — Nombre y estado del control de tema

**Resolución teórica:** La solución consiste en que el control conserve un nombre claro para la opción que cambia y que comunique por separado si esa opción está activada. Esto evita mensajes confusos para quienes navegan con lector de pantalla y hace que el comportamiento del control sea más fácil de entender.

**En palabras sencillas:** El botón identifica qué opción cambia y comunica aparte si está activada.

### 2.6. Pruebas ejecutadas después de corregir

| Prueba | Resultado observado |
| --- | --- |
| Sintaxis de `script.js`, `solicitud.js`, `catalogo.js` y `borrador.js` | Correcta con `node --check`. |
| Pruebas unitarias existentes | **9 aprobadas, 0 fallidas** con el ejecutor nativo de Node.js. |
| Validación HTML de las tres páginas | Sin errores con HTML Validate, preset `standard`. |
| Rutas y referencias | **45 referencias locales** comprobadas, incluyendo `srcset`, CSS, módulos y JSON; 18 destinos únicos existentes. Anclas y referencias ARIA internas comprobadas. |
| Página principal, privacidad y condiciones | **24 combinaciones**: tres páginas × cuatro anchos × dos temas. Sin errores JavaScript, recursos fallidos ni desbordamiento horizontal global. |
| Estados de formulario y diálogo | **24 estados adicionales**: errores, resumen y diálogo en cuatro anchos y dos temas. Sin infracciones de axe detectadas. |
| Estados propios de la semana 5 | **5 estados adicionales** de borrador, carga, éxito, recuperación y error. Sin infracciones de axe detectadas. |
| Pruebas funcionales de la semana 5 | 12 grupos comprobados: guardado voluntario, recuperación, borrado, datos dañados, validación, restricciones de almacenamiento, Fetch, IndexedDB, reintento, datos inválidos, texto seguro y cancelación. |
| Casos límite | Copia de ocho días rechazada; petición sin respuesta terminó con opción de reintento; controles del borrador ocultos al imprimir. |
| Regresiones de los hallazgos | Comparación antes/después para H5-01, H5-02 y H5-03, con comprobaciones automáticas de sus resultados. |
| Teclado y alternativas | Tabla, enlace de salto, menú, diálogo, Escape, retorno de foco, edición del resumen y alternativas del portapapeles comprobados. |
| Ampliación y espaciado | Sin desbordamiento global al aumentar el tamaño raíz del texto al 200 % ni al aplicar el espaciado de texto de la prueba. |
| Navegadores | Pruebas principales en Brave; comprobación básica de carga y diálogo en Edge a 320 y 1440 px. Ambos usan Chromium. |
| Conservación visual | El contenido comercial permanece. El SHA-256 de `styles.css` coincide con el guardado antes de la revisión. |

Las 53 evaluaciones de axe anteriores no detectaron infracciones automáticas. La matriz general incluyó reglas A/AA hasta WCAG 2.2; las 24 pruebas de estados del formulario y los cinco estados adicionales utilizaron reglas A/AA hasta WCAG 2.1. No se enviaron mensajes reales ni solicitudes de clientes durante las pruebas.

Para repetir las comprobaciones de sintaxis y las pruebas unitarias, con Node.js disponible:

```powershell
node --check script.js
node --check solicitud.js
node --check catalogo.js
node --check borrador.js
node --test tests/solicitud.test.mjs tests/catalogo.test.mjs
```

Las pruebas de navegador se realizaron mediante HTTP local y herramientas ya disponibles fuera del proyecto, sin añadir dependencias. Para repetir los hallazgos, seguir las secuencias descritas en H5-01 y H5-02 con respuestas controladas del catálogo, y comprobar el nombre y estado de `#tema-toggle` al cambiar el tema.

### 2.7. Límites y comprobaciones pendientes

No quedan pendientes los tres hallazgos concretos de este informe. **Eso no equivale a garantizar que el sitio carezca de cualquier error o que cumpla todos los criterios WCAG.** Axe deja verificaciones que requieren juicio humano, especialmente textos sobre imágenes y la experiencia real con tecnologías de asistencia.

Quedan por realizar una evaluación completa con lectores de pantalla, otros motores como Firefox y Safari, dispositivos físicos y zoom real del navegador al 400 %. La prueba de texto al 200 % no se presenta como sustituto de esa evaluación. Estas son limitaciones del alcance, no problemas inventados del código.

## 3. Buenas prácticas cumplidas como evidencia complementaria

### Evidencia de prácticas aplicadas

| Aspecto | Evidencia concreta | Resultado |
| --- | --- | --- |
| Estructura semántica y encabezados | `index.html`: `header`, `nav`, `main#main-content`, secciones con títulos, artículos, `aside`, `footer`, `figure`, `details` y `dialog`. | Un `h1` y un `main` por página revisada; contenido organizado con encabezados. HTML sin errores en el validador utilizado. |
| Etiquetas y nombres accesibles | `index.html`: los campos tienen `label`; el formulario usa `aria-labelledby="titulo-formulario"`; los botones de menú y cierre tienen nombre. | Referencias a identificadores existentes, sin IDs duplicados. El botón de tema recibió el ajuste H5-03. |
| Imágenes | `index.html`: imagen principal con `alt`, `srcset`, `sizes` y dimensiones; logotipo decorativo de cabecera con `alt=""` dentro de un enlace nombrado. | Las imágenes cargaron. No se encontró una ruta rota ni una imagen sin el atributo alternativo en las páginas examinadas. |
| Teclado y foco | `styles.css:244` y `styles.css:248`: reglas `:focus` y `:focus-visible`; `index.html`: enlace de salto y tabla con contenedor enfocable. | Enlace de salto visible al recibir foco; tabla desplazable con teclado; apertura del diálogo con Espacio y retorno al cerrar con Escape comprobados. |
| Navegación móvil | `script.js`, `inicializarNavegacion`; `index.html`, `#menu-toggle`. | Se actualiza `aria-expanded`; Escape cierra el menú y devuelve el foco. La navegación sigue disponible sin JavaScript. |
| Diseño adaptable | `styles.css`: Flexbox, Grid, contenedores fluidos y media queries. | Sin desbordamiento horizontal global en 320, 398, 768 y 1440 px. También se verificaron 600, 991, 992, 1024 y 1280 px en la página principal. |
| Controles táctiles | `styles.css`: botones principales con tamaño mínimo; `.opcion-borrador` incluye la casilla y su etiqueta pulsable. | Botones de menú y tema de 44 × 44 px en móvil; no se detectaron infracciones de tamaño de objetivo en las comprobaciones de axe que incluyeron WCAG 2.2 AA. Esto no significa que todo enlace de texto mida 44 px. |
| Contraste y movimiento | `styles.css`: variables de tema claro/oscuro, foco visible y `prefers-reduced-motion`. | Sin infracciones automáticas de contraste detectadas en los estados evaluados. También se comprobó que la animación de cambio de tema no genera desbordamiento horizontal a 320 px. |
| DOM y eventos | `script.js`: delegación en filtros, tarjetas y formulario; `createDocumentFragment` y `textContent` al mostrar servicios. | Un texto de catálogo con apariencia de HTML se mostró literalmente, sin ejecutarse. No se introducen los datos del visitante con `innerHTML`. |
| Validación dinámica | `script.js:371`: `setCustomValidity`; `solicitud.js`, `obtenerErrorCampo`; mensajes y `aria-invalid` en cada campo. | Se detectó un correo inválido, se avisó y se limpió el estado de error al corregirlo. Al preparar una solicitud inválida, el foco llegó al primer campo incorrecto. |
| Borrador voluntario | `borrador.js`: `sessionStorage`, lectura validada, guardado agrupado y borrado de su propia clave. | Desactivado por defecto; recuperación tras recarga, borrado sin perder la edición, datos dañados y falta de espacio comprobados. |
| Fetch y respuestas | `catalogo.js:89`: comprobación de `response.ok`; `validarCatalogo`; cancelación y límite de espera. | HTTP 404, JSON inválido, estructura incorrecta y petición sin respuesta tuvieron una salida controlada. H5-01 corrige un caso adicional del reintento. |
| IndexedDB | `catalogo.js:66`: confirmación mediante `transaccion.oncomplete`; validación de antigüedad en `catalogo.js:101`. | Recuperación real desde la base local y rechazo de una copia de ocho días comprobados. Un bloqueo del almacenamiento no impide usar el catálogo obtenido por Fetch. |
| Mensajes de estado | `index.html`: `#estado-dialogo`, `#estado-borrador` y `#estado-validacion`; `#contenido-dialogo` con `aria-busy`. | Los avisos tienen semántica programática. Falta una evaluación humana completa con lectores de pantalla para confirmar su experiencia de uso. |
| Privacidad del flujo | `script.js`: preparación local del resumen; `borrador.js`: guardado solo al activarlo; `privacidad.html`: explicación de los almacenamientos. | Preparar el resumen no envió datos por la red. IndexedDB guarda el catálogo público, no los campos del formulario. |

El uso de `role="status"` permite comunicar cambios sin mover el foco; no demuestra por sí solo cómo los anunciará cada lector de pantalla. Referencia: [W3C, mensajes de estado — criterio 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

No se considera un fallo que el formulario carezca de un servidor de recepción: el comportamiento previsto es preparar un resumen y permitir compartirlo. Tampoco se exige añadir cookies, una API externa o una aplicación completa sin conexión para cumplir los temas de la semana.

