# Verificación de buenas prácticas: semanas 1, 2 y 3

> **Organización de la entrega final:** este informe es histórico. Sus líneas, estados y comandos describen la versión revisada en esa semana. Los enlaces al código apuntan a su ubicación actual; los scripts de pruebas se retiraron de la entrega final. Consulta [README.md](README.md) para ejecutar la versión actual.

> **Revisión histórica:** este informe describe el estado anterior a las mejoras de la semana 4. Para las correcciones y pruebas posteriores, consulta [SEMANA_4.md](SEMANA_4.md). Sus números de línea y estados corresponden a la versión auditada originalmente.

**Proyecto:** Válora — catering empresarial  
**Estudiante:** Joel Robalino · Paralelo 2  
**Fecha de revisión:** 7 de octubre de 2026  
**Tipo de trabajo:** revisión del código, comparación con la teoría y pruebas locales. No se modificó la página.

## 1. Resultado general

La página sí aplica muchas de las buenas prácticas de las tres semanas. Tiene una estructura HTML organizada, imágenes adaptables, navegación con teclado, mensajes de error, diseño para celulares y separación entre contenido, presentación y comportamiento.

**De los ocho hallazgos de las fotografías, seis están resueltos y dos están parcialmente resueltos.** No sería correcto afirmar que todo está aplicado al 100 %: falta la tercera capa de validación del formulario, y el respaldo del enlace para saltar al contenido tiene un problema de compatibilidad. También hay mejoras pendientes en legibilidad, organización del formulario y evidencia de pruebas y del proceso de desarrollo.

| Hallazgo de las fotos | Resultado actual | Motivo principal |
| --- | --- | --- |
| H-01. Tabla inaccesible con teclado | Resuelto | Su contenedor recibe foco y se desplaza con las flechas. |
| H-02. Nombre de marca repetido | Resuelto | La imagen es decorativa y el enlace tiene un único nombre accesible. |
| H-03. Semántica complementaria | Resuelto | Existen `aside`, `details`, `summary`, `figure`, `figcaption` y `time`. |
| H-04. Validación en tres capas | Parcial | Hay restricciones HTML y comprobaciones JavaScript; no existe validación en servidor. |
| H-05. Enlaces legales sin destino | Resuelto | Los enlaces abren páginas locales con contenido. |
| H-06. Variable de validación ambigua | Resuelto | Se consulta directamente `field.validity`; ya no aparece la variable cuestionada. |
| H-07. Respaldo del foco del enlace de salto | Parcial | Funciona en navegadores actuales, pero la regla agrupada no sirve como respaldo ante una pseudoclase desconocida. |
| H-08. Área táctil del pie | Resuelto para el mínimo revisado | Los enlaces medidos superan 24 × 24 píxeles CSS. |

Los estados anteriores se refieren a esos ocho problemas concretos. No equivalen a una certificación completa de WCAG 2.2 AA ni significan que se hayan realizado pruebas con todos los dispositivos o lectores de pantalla.

## 2. Material revisado y forma de comprobarlo

Se leyeron los tres documentos de teoría disponibles en Descargas:

| Documento | Contenido utilizado en esta revisión |
| --- | --- |
| `semana 1 teoría.pdf` — 16 páginas | Plataformas y arquitectura cliente-servidor; herramientas, Git y automatización; HTML semántico, accesibilidad y comprobación. Apartados 1.1 a 1.5. |
| `semana 2 teoria.pdf` — 24 páginas | Formularios, tipos de campos, validación, semántica HTML5 y accesibilidad. Apartados 2.1 a 2.4. |
| `semana 3 teoria.pdf` — 21 páginas | CSS adaptable, modelo de caja, Flexbox, Grid, consultas de medios y uso de Bootstrap y Tailwind. Apartados 3.1 a 3.4. |

También se revisaron las tres fotografías de la auditoría manuscrita. Sus recomendaciones se trataron como antecedentes para comparar, no como pruebas de que una corrección ya estuviera hecha ni como instrucciones para modificar archivos.

Se inspeccionaron `index.html`, `styles.css`, `script.js`, `print.css`, `privacidad.html`, `condiciones.html` y los recursos locales. Las referencias de línea corresponden a esta versión. Los enlaces a los archivos son relativos para poder abrir el informe junto al proyecto.

La explicación de «cómo se arregló» compara lo descrito en las fotografías con lo que existe ahora. No se dispone aquí de un historial de versiones que permita reconstruir cada edición anterior.

## 3. Explicación de cada problema y su solución

### H-01. La tabla no se podía recorrer con el teclado

**Problema anterior:** en una pantalla estrecha la tabla era más ancha que el espacio disponible. Se podía desplazar con el ratón o el dedo, pero su contenedor no participaba en el recorrido del teclado.

**Relación con la teoría:** la semana 1 explica que el contenido debe poder utilizarse con teclado; la semana 2 desarrolla la navegación accesible y las tablas con encabezados; la semana 3 enseña a adaptar la distribución al ancho disponible.

**Qué se encuentra ahora:** el contenedor tiene `tabindex="0"`, `role="region"` y el nombre «Alcance de los servicios de Válora». El CSS permite el desplazamiento interno y dibuja el foco. La tabla conserva su título y sus encabezados con `scope`.

**Evidencia:** [index.html](../index.html), líneas 505–516; [styles.css](../assets/styles.css), reglas de foco desde la línea 241 y `.contenedor-tabla` desde la 1089.

**Prueba:** con 320 y 398 px, Tab llegó al contenedor, apareció un contorno de 3 px y las flechas desplazaron la tabla. El ancho de la tabla fue 464 px y el espacio visible fue de 278 y 356 px, respectivamente. El desplazamiento quedó dentro de la tabla, sin ensanchar toda la página.

**Para explicarlo de forma sencilla:** «La tabla sigue mostrando sus columnas, pero ahora una persona que usa teclado puede entrar en ella y moverse hacia los lados para leerlas».

**Estado: resuelto.** Una tabla de datos puede necesitar desplazamiento horizontal propio; el problema era que no se podía controlar con teclado.

### H-02. El lector de pantalla repetía el nombre de la marca

**Problema anterior:** la imagen del logotipo y el texto que estaba a su lado podían aportar el mismo nombre, produciendo una lectura repetida.

**Relación con la teoría:** semanas 1 y 2, nombres accesibles e imágenes decorativas. Una imagen que repite la información del control no necesita volver a anunciarla.

**Qué se encuentra ahora:** la imagen tiene `alt=""` y `aria-hidden="true"`. El enlace declara `aria-label="Válora, inicio"`.

**Evidencia:** [index.html](../index.html), líneas 79–89. La consulta del enlace por su nombre accesible encontró una única coincidencia exacta.

**Para explicarlo de forma sencilla:** «Se evitó que la imagen y el texto dijeran lo mismo dos veces. El enlace comunica una sola vez que lleva al inicio de Válora».

**Estado: resuelto.** La solución actual usa el nombre definido en el enlace; no depende únicamente del texto visible, como proponía la fotografía. Ambas vías pueden resolver la duplicación.

### H-03. Faltaban elementos que explicaran mejor la estructura

**Problema anterior:** la auditoría proponía identificar mejor el contenido complementario, las preguntas frecuentes, la imagen destacada y la fecha.

**Relación con la teoría:** semana 1, apartado 1.5; semana 2, apartado 2.2. Las etiquetas semánticas indican qué función cumple cada contenido y facilitan su interpretación.

**Qué se encuentra ahora:** las preguntas frecuentes están en un `aside` identificado por su título; cada respuesta utiliza `details` y `summary`. La imagen principal está dentro de `figure` y tiene `figcaption`. El año del pie utiliza `time` con `datetime`, actualizado por JavaScript.

**Evidencia:** [index.html](../index.html), líneas 183, 219, 583, 604 y 943; [script.js](../js/app.js), actualización del año en las líneas 53–56.

**Para explicarlo de forma sencilla:** «Se usaron etiquetas que explican el contenido: cuáles son las preguntas, qué imagen se está describiendo y qué texto representa una fecha. Las respuestas pueden abrirse sin crear un componente complejo».

**Estado: resuelto.** Conviene precisar que no todas las páginas necesitan un `aside` o una figura. Su ausencia, por sí sola, no constituye un incumplimiento de accesibilidad; deben utilizarse cuando el contenido lo justifique.

### H-04. El formulario no tenía las tres capas de validación

**Problema anterior:** se cuestionaban la dependencia de JavaScript, la ausencia de un patrón de teléfono y la falta de un destino de servidor.

**Relación con la teoría:** semana 2, apartados 2.1 y 2.3. HTML ayuda a definir el formato, JavaScript explica los errores y aplica reglas adicionales, y el servidor vuelve a revisar los datos antes de aceptarlos.

**Qué se encuentra ahora:**

1. **Capa HTML aplicada:** los campos tienen tipos apropiados, etiquetas, campos obligatorios y límites. El teléfono incorpora `pattern`, `minlength` y `maxlength`.
2. **Capa JavaScript aplicada:** se revisan campos vacíos, correo, teléfono, cantidad de personas y fecha. Los errores se relacionan con cada campo y el foco se dirige al primero que necesita corrección.
3. **Capa servidor no implementada:** el formulario no tiene `action` ni `method="post"`; el manejador cancela el envío normal y prepara un mensaje para WhatsApp o correo. No existe un servicio propio que reciba y valide la solicitud.

**Evidencia:** [index.html](../index.html), formulario en la línea 690 y teléfono en las líneas 742–752; [script.js](../js/app.js), `getError`, `validateField` y manejador de envío, aproximadamente líneas 329–448.

**Prueba:** un teléfono con letras incumplió el patrón nativo; al intentar continuar con campos vacíos el foco pasó a `nombre`. Con datos de prueba válidos apareció el resumen con el aviso «Aún no se ha enviado». Volver a editar conservó los datos. No se enviaron mensajes durante la revisión.

El código activa `noValidate` para gestionar sus propios mensajes. Eso no elimina las restricciones de HTML: JavaScript sigue consultando `field.validity`. Sin JavaScript se ocultan los campos y se explica cómo contactar directamente; no existe un envío alternativo al servidor.

**Para explicarlo de forma sencilla:** «La página ya revisa los datos antes de preparar el mensaje, pero todavía no hay un servidor que los reciba y los vuelva a comprobar. Por eso hay dos capas aplicadas, no tres».

**Estado: parcial respecto a la teoría de tres capas.** El flujo manual actual es coherente con lo que informa al visitante. Si la entrega académica exige las tres capas, falta implementar un servicio real y sus comprobaciones. Agregar solamente `method="post"` no lo resuelve. Además, POST no cifra los datos: el cifrado del transporte corresponde a HTTPS.

### H-05. Los enlaces legales no llevaban a ningún documento

**Problema anterior:** los enlaces de privacidad y condiciones tenían un destino vacío `#` y no ofrecían información útil.

**Relación con la teoría:** semanas 1 y 2, navegación comprensible y uso correcto de enlaces. Un enlace debe llevar a un destino relacionado con su nombre.

**Qué se encuentra ahora:** el pie enlaza a `privacidad.html` y `condiciones.html`; ambos archivos existen y contienen información. La revisión no encontró enlaces cuyo destino fuera únicamente `#` en las tres páginas.

**Evidencia:** [index.html](../index.html), líneas 948–950; [privacidad.html](../privacidad.html) y [condiciones.html](../condiciones.html).

**Para explicarlo de forma sencilla:** «Los enlaces dejaron de ser decorativos: ahora abren los documentos que anuncian».

**Estado: resuelto en navegación y disponibilidad del contenido.** Esta comprobación no es una evaluación jurídica de esos documentos.

### H-06. El nombre de una variable no explicaba lo que contenía

**Problema anterior:** la auditoría describía una variable llamada `valid` que guardaba el objeto de estado de validación. Ese nombre podía confundirse con un simple resultado verdadero o falso.

**Relación con la teoría:** organización y mantenimiento del código de la semana 1; uso de `ValidityState` en la semana 2. Un nombre claro ayuda a entender qué se está comprobando.

**Qué se encuentra ahora:** `getError(field)` consulta directamente propiedades como `field.validity.typeMismatch`. La variable ambigua descrita en las fotos ya no está en esta lógica. `validateField` devuelve el resultado de la comprobación.

**Evidencia:** [script.js](../js/app.js), funciones `getError` y `validateField`, desde las líneas 329 y 374.

**Para explicarlo de forma sencilla:** «La validación se expresa de una manera más clara: se consulta directamente el estado del campo, evitando un nombre que podía prestarse a confusión».

**Estado: resuelto.** Es una mejora de claridad y mantenimiento, no un criterio WCAG independiente.

### H-07. El enlace de salto no tiene un respaldo completamente fiable

**Problema anterior:** la visibilidad del enlace dependía únicamente de `:focus-visible`.

**Relación con la teoría:** navegación con teclado y compatibilidad, semanas 1 y 2. Una persona debe poder ver dónde se encuentra el foco y saltar al contenido principal.

**Qué se encuentra ahora:** se añadieron ambos selectores, pero quedaron en una misma regla:

```css
.skip-link:focus, .skip-link:focus-visible {
  top: 1rem;
}
```

**Evidencia:** [styles.css](../assets/styles.css), líneas 262–273. En el navegador actual, el primer Tab muestra el enlace a 16 px del borde superior, con foco visible.

**Qué falta:** cuando un navegador no reconoce uno de los selectores de una lista CSS normal, puede descartar la regla completa. Así, el `:focus` de esa misma lista no proporciona el respaldo pretendido. Esto se explica en la documentación de [listas de selectores de MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Selector_list).

**Prueba específica:** se simuló una pseudoclase no reconocida, sustituyéndola solamente en la respuesta temporal del servidor de pruebas. Al pulsar Tab, el enlace recibió foco, pero permaneció en `top: -100px`, fuera de la vista. No se alteró `styles.css`. Esta simulación comprueba el problema de la regla; no representa una prueba completa en un navegador antiguo.

**Corrección propuesta:** dejar una regla independiente para `.skip-link:focus` que muestre el enlace y su contorno. Si se mantiene otra para `:focus-visible`, debe estar separada.

**Para explicarlo de forma sencilla:** «En los navegadores actuales el enlace funciona. Para que el respaldo sea real, las dos reglas deben separarse; de lo contrario, un navegador que no entienda la nueva puede ignorar las dos».

**Estado: parcial.** Es una limitación del respaldo anunciado, no un fallo observado al usar Tab normalmente en Brave o Edge actuales.

### H-08. Los enlaces del pie eran difíciles de tocar

**Problema anterior:** el área activa de algunos enlaces dependía demasiado del tamaño del texto y del espacio de la lista.

**Relación con la teoría:** accesibilidad de controles de la semana 2 y modelo de caja de la semana 3. El espacio interior y las dimensiones del control influyen en la facilidad para pulsarlo.

**Qué se encuentra ahora:** los enlaces de navegación del pie usan `display: block`, altura mínima y relleno vertical. Los enlaces legales usan alineación flexible y altura mínima de 2 rem.

**Evidencia:** [styles.css](../assets/styles.css), `.pie-grid nav a` desde la línea 1461 y `.pie-legal a` desde la 1492.

**Prueba:** en 320 y 398 px los enlaces de navegación midieron aproximadamente 38,4 px de alto y los legales 32 px. Todos los enlaces del pie medidos superaron 24 px de ancho y alto.

**Para explicarlo de forma sencilla:** «Ahora el enlace tiene una zona de contacto más amplia que las letras, por lo que es más fácil pulsarlo con el dedo».

**Estado: resuelto para el mínimo comprobado.** WCAG 2.2 AA establece un mínimo de 24 × 24 píxeles CSS, con las excepciones que describe su [criterio 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum). El tamaño de 44 × 44 pertenece al [criterio mejorado 2.5.5, nivel AAA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced); puede recomendarse para mayor comodidad, pero no debe confundirse con el mínimo AA.

## 4. Verificación de las buenas prácticas de las tres semanas

**Cómo leer las tablas:** «Aplicada» significa que existe evidencia en esta versión; «Parcial» identifica un punto incompleto; «No demostrado» significa que los archivos o las pruebas no permiten asegurarlo. «No necesario» distingue tecnologías de contexto de necesidades reales del proyecto.

### Semana 1: plataforma, organización y accesibilidad inicial

Referencia: apartados 1.1–1.3, páginas 1–8; 1.4, páginas 9–11; 1.5, páginas 12–14.

| Práctica o tema | Estado | Evidencia y explicación sencilla |
| --- | --- | --- |
| Elegir una plataforma adecuada al objetivo | Aplicada | Un sitio web permite presentar servicios y preparar contactos sin instalar una aplicación. La página corresponde a ese objetivo. |
| Separar responsabilidades | Aplicada | `index.html` organiza el contenido, `styles.css` define su presentación y `script.js` gestiona las interacciones. |
| Entender cliente y servidor | Parcial como implementación | La interacción sucede en el navegador. No hay un servidor de negocio propio: no se debe presentar el proyecto como una aplicación con procesamiento completo de solicitudes. |
| HTML semántico y regiones identificables | Aplicada | Hay `header`, `nav`, un `main`, secciones, tarjetas `article`, `aside` y `footer`. Véase también H-03. |
| Jerarquía de encabezados | Aplicada en la estructura revisada | Cada documento tiene un solo `h1`; las secciones principales emplean `h2` y sus apartados `h3`. |
| Idioma, título y adaptación inicial | Aplicada | Los documentos declaran español; la página incluye título y `meta viewport`. |
| Nombres, etiquetas e imágenes alternativas | Aplicada, con una mejora pendiente | Los campos tienen etiquetas y las imágenes distinguen contenido y decoración. Falta dar nombre accesible al formulario como región, explicado más adelante. |
| Teclado y foco | Aplicada en los controles probados; respaldo parcial | Funcionaron tabla, menú, diálogo y enlace de salto en navegadores actuales. H-07 sigue abierto para compatibilidad. |
| Contraste y lectura | Parcial | La revisión automática detectó una alerta en el descriptor de la marca en modo oscuro. Hay textos muy pequeños. Véase sección 5. |
| Validadores y pruebas de accesibilidad | Aplicada durante esta revisión | Se validaron HTML y sintaxis JavaScript; se ejecutaron axe y pruebas de interacción. Esto no sustituye la revisión con personas y tecnología de apoyo. |
| Herramientas de desarrollo e IDE | Evidencia parcial | El proyecto puede trabajarse en el editor y se comprobó localmente. La presencia del código no demuestra por sí sola un proceso completo de desarrollo. |
| Git, revisión de versiones y automatización | No demostrado en esta entrega | No se encontró repositorio `.git` en el proyecto ni en los directorios superiores revisados, ni configuración de integración continua en los archivos entregados. Esto no prueba que nunca se hayan usado en otro lugar. |
| HTTPS y configuración de publicación | No demostrado | Las pruebas se realizaron en un servidor local. No se verificó un alojamiento público, su certificado ni sus cabeceras. |
| Microservicios, contenedores, OAuth, JWT, GraphQL o WebSockets | No necesarios para el alcance actual | La teoría presenta alternativas. Un sitio informativo sin cuentas, sesiones ni comunicación en tiempo real no necesita incorporarlas todas. |

### Semana 2: formularios, semántica y accesibilidad

Referencia: apartado 2.1, páginas 2–7; 2.2, páginas 7–13; 2.3, páginas 13–18; 2.4, páginas 19–24.

| Buena práctica | Estado | Evidencia y explicación sencilla |
| --- | --- | --- |
| Un propósito claro por formulario | Aplicada | El formulario prepara una consulta sobre un servicio. Explica que la solicitud aún no se ha enviado. |
| Etiquetas reales, sin depender del placeholder | Aplicada | Los ocho campos tienen `label` asociado; se comprobó la relación en el navegador. |
| Tipos de campo apropiados | Aplicada | Se usan correo, teléfono, número, fecha, selección de servicio y área de mensaje. |
| Restricciones HTML y autocompletado | Aplicada | Hay `required`, límites, patrón de teléfono y `autocomplete` para datos de contacto. |
| Agrupar los campos relacionados | Aplicada | El formulario usa `fieldset` y `legend`. |
| Nombre accesible del formulario completo | Parcial | El título «Hagamos tu propuesta» es visible, pero el `form` no lo referencia mediante `aria-labelledby` ni tiene `aria-label`. |
| Colocar primero los campos obligatorios | Parcial | «Personas» y «Fecha», opcionales, aparecen antes de «Mensaje», obligatorio. No sigue exactamente el orden recomendado en la página 2 de la teoría. |
| Mostrar errores comprensibles junto al campo | Aplicada | `getError` genera mensajes; `aria-describedby` relaciona las ayudas y los errores con sus campos. |
| Indicar el estado inválido sin depender solo del color | Aplicada | Se usan mensajes y `aria-invalid`, además del estilo visual. |
| Validar al salir del campo y al continuar | Aplicada | Hay manejadores `blur`, `input`, `change` y `submit`; se enfoca el primer campo inválido. |
| Permitir revisar y corregir los datos | Aplicada | Aparece un resumen y un botón para volver a editar conservando los datos. |
| Validación HTML, JavaScript y servidor | Parcial | Las dos primeras están aplicadas. Falta la tercera; véase H-04. |
| No interpretar como HTML los datos del visitante | Aplicada en el resumen | El resumen usa `textContent` y los enlaces de envío codifican el mensaje con `encodeURIComponent`. Esto no sustituye una futura validación de servidor. |
| Semántica de tablas, fechas, imágenes y preguntas | Aplicada | Tabla con `caption` y encabezados; `time`; `figure` y `figcaption`; preguntas con `details` y `summary`. |
| Preferir controles nativos y ARIA justificada | Aplicada con observaciones menores | Se usan controles HTML, botones y `dialog`. Hay estados como `aria-expanded`, `aria-pressed` y regiones de aviso. La presencia de ARIA no garantiza por sí sola accesibilidad completa. |
| Diferenciar enlaces y acciones | Aplicada en el flujo revisado | La navegación y los documentos usan enlaces; menú, tema, filtros y preparación usan controles de acción. Los accesos a detalles se adaptan por JavaScript cuando hay soporte de diálogo. |
| Diálogo y recuperación del foco | Aplicada en la prueba realizada | Se abrió con Espacio, se cerró con Escape y el foco volvió al elemento que lo abrió. Falta revisar la experiencia con un lector de pantalla real. |
| Anunciar cambios de contenido | Aplicada en el código | Los resultados de filtros y el estado del formulario usan regiones de estado; el resumen de errores usa `role="alert"`. Falta confirmar los anuncios con NVDA o VoiceOver. |
| Objetivos táctiles y navegación móvil | Aplicada en el alcance probado | El menú abre y cierra; los enlaces del pie cumplen las dimensiones mínimas medidas. No se midieron todos los controles en todos los estados posibles. |
| Ampliación y adaptación | Parcialmente comprobada | No hubo desbordamiento global en los cuatro anchos ni al duplicar el tamaño raíz del texto. Sigue pendiente el zoom real del navegador al 200 % y 400 %. |
| Lectores de pantalla y pruebas entre motores | Pendiente de completar | Se probaron Brave y Edge, ambos basados en Chromium. No se probaron NVDA, VoiceOver, Firefox ni Safari. |
| Formularios multipaso, archivos, contraseñas y validación remota | No necesarios actualmente | No existen carga de archivos, cuentas ni solicitudes a una API. No corresponde agregar estos mecanismos solo para mencionar todas las tecnologías. |

### Semana 3: CSS y diseño adaptable

Referencia: apartado 3.1, páginas 1–6; 3.2, páginas 7–12; 3.3, páginas 12–16; 3.4, páginas 17–20.

| Buena práctica | Estado | Evidencia y explicación sencilla |
| --- | --- | --- |
| Separar CSS del contenido | Aplicada | Hojas de estilo externas y una hoja adicional para impresión. |
| Mantener una identidad visual coherente | Aplicada | Las variables de color conservan los tonos marrones y dorados, con variantes clara y oscura. |
| Variables y medidas relativas | Aplicada | Se emplean propiedades personalizadas, `rem`, porcentajes y `clamp()` en los títulos. |
| Modelo de caja predecible | Aplicada | `box-sizing: border-box` evita que borde y relleno aumenten inesperadamente los anchos declarados. |
| Flexbox para alineaciones | Aplicada | Barra de navegación, acciones y otros grupos usan `display: flex`. |
| Grid para distribuciones | Aplicada | La cabecera visual, tarjetas y distintas secciones usan `display: grid`. |
| Base para pantallas pequeñas y ampliación progresiva | Aplicada | Existen consultas `min-width` a 600, 768, 992 y 1200 px. También hay ajustes puntuales para pantallas pequeñas. |
| Adaptar el contenido sin provocar desbordamiento global | Aplicada en los tamaños probados | La página y los documentos legales conservaron el ancho de 320, 398, 768 y 1440 px. La tabla mantiene desplazamiento interno accesible. |
| Imágenes adaptables y recursos adecuados | Aplicada | Hay límites de ancho, dimensiones declaradas y variantes de la imagen principal; los recursos de imagen se cargaron correctamente. |
| Espaciado y lectura cómoda | Parcial | Se usan espacios consistentes y un interlineado general de 1,75, pero algunos textos secundarios son demasiado pequeños para una lectura cómoda. |
| Preferencia de tema claro u oscuro | Aplicada con contraste pendiente | Existen `prefers-color-scheme`, tema manual y persistencia local. Debe revisarse el descriptor pequeño de la marca en oscuro. |
| Reducir movimiento cuando se solicita | Aplicada en el CSS | La consulta `prefers-reduced-motion: reduce` reduce animaciones y transiciones. No se realizó una evaluación con usuarios sensibles al movimiento. |
| Considerar orientación y capacidad del dispositivo | Aplicada en el código | Hay consultas de orientación, altura, relación de aspecto, resolución y tipo de puntero. Su existencia no prueba todos los dispositivos físicos. |
| Usar frameworks con criterio y personalizarlos | Aplicada | Se incluyen Bootstrap Grid y utilidades de Tailwind localmente; las clases propias mantienen la identidad del proyecto. |
| Evitar CSS innecesario en producción | Parcial | Se distribuye la hoja general de Bootstrap Grid con utilidades que no aparecen en el sitio, por ejemplo familias de desplazamiento de columnas. No se encontró un proceso de compilación o depuración en esta entrega. |
| Comprobar rendimiento real | No demostrado con una medición completa | Los recursos son locales y no fallaron al cargar, pero no se midieron tiempos en red móvil ni métricas completas de rendimiento. |
| Mantener estilos de impresión | Aplicada en el código | `print.css` está enlazado con `media="print"`. En esta revisión no se certificó el resultado de todas las páginas impresas. |

Usar Bootstrap y Tailwind no demuestra automáticamente un buen diseño. Aquí lo relevante es que la distribución funciona en los tamaños probados y que sus estilos conviven con la paleta del proyecto. Tampoco es obligatorio incorporar todos los frameworks mencionados en clase.

## 5. Qué falta o conviene mejorar

### 5.1. Cerrar los dos hallazgos originales parciales

- **H-04:** si la actividad exige validación completa en tres capas, implementar un servicio real que reciba y vuelva a validar los datos. Debe confirmar el resultado y manejar los errores. Mientras se mantenga el contacto manual, describir honestamente el alcance actual.
- **H-07:** separar la regla clásica de foco de la regla con `:focus-visible`, o utilizar una regla independiente de `:focus` suficiente para mostrar y destacar el enlace.

Estas propuestas no se aplicaron, porque la solicitud actual es verificar y documentar.

### 5.2. Revisar el contraste del descriptor de la marca en modo oscuro

**Evidencia concreta:** `.marca-wordmark small`, en [styles.css](../assets/styles.css), líneas 360–368, muestra «CATERING EMPRESARIAL». Al desplazarse hasta la sección de beneficios en modo oscuro, axe calculó aproximadamente **3,21:1**, con texto `#835f22`, fondo `#16120e` y tamaño de 6,88 px. La misma alerta apareció en los cuatro anchos probados. Se reprodujo por separado después de interactuar con la tabla; no apareció en una comprobación inicial sin ese desplazamiento.

**Interpretación:** es una limitación de legibilidad comprobable que conviene corregir. La clasificación normativa necesita considerar si ese texto forma parte esencial del logotipo: WCAG contempla una excepción para texto de marca, pero esa excepción no debe extenderse automáticamente a cualquier descripción comercial. Por ello, no se presenta aquí como cuatro errores diferentes ni como un incumplimiento definitivo sin esa consideración. Véase [W3C: contraste mínimo y logotipos](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

**Recomendación:** usar para este texto una variante más clara del dorado en el tema oscuro y volver a medirlo sobre los distintos fondos de la cabecera durante el desplazamiento. Así se conserva la paleta y se mejora su lectura.

### 5.3. Aumentar algunos textos secundarios

En el navegador, con tamaño base normal, se midieron 6,88 px en el descriptor de la marca, 9,28 px en `.servicio-chip`, 8,48 px en `.numero-servicio` y 9,76 px en `.pie-legal`. Los campos del formulario, en cambio, se presentaron a 16 px.

**Recomendación:** aumentar los textos secundarios que necesitan leerse y revisar que el contenido siga cabiendo en 320 px. Esto responde a la buena práctica de legibilidad de la semana 3. No se afirma que WCAG imponga un tamaño mínimo universal de fuente: el problema señalado es de comodidad de lectura.

### 5.4. Dar nombre al formulario y ordenar mejor sus campos

En [index.html](../index.html), líneas 690–691, el formulario tiene un título visible, pero no un nombre accesible propio. La consulta por región `form` no lo encontró como formulario nombrado. Sus campos sí tienen etiquetas: no deben confundirse ambos niveles.

**Recomendación:** asignar un identificador al título «Hagamos tu propuesta» y referenciarlo con `aria-labelledby` desde el `form`. Después, mover «Mensaje» antes de «Personas» y «Fecha», o agrupar claramente los datos opcionales al final. Estos últimos están en las líneas 783 y 798 y el mensaje empieza en la 809.

Son mejoras de organización y orientación. No impidieron completar la prueba de preparación de la solicitud.

### 5.5. Completar la evidencia de mantenimiento y pruebas

- Revisar las utilidades CSS realmente utilizadas y generar una versión de producción ajustada, conservando las licencias. No hay una medición que permita afirmar cuánto mejoraría el rendimiento.
- Documentar el uso de Git y, si forma parte de la entrega, automatizar la validación de HTML, la sintaxis JavaScript y las pruebas esenciales. Su ausencia documental no significa que la página deje de funcionar.
- Realizar pruebas con lector de pantalla, zoom real, dispositivos físicos y navegadores de motores diferentes. Comprobar también la publicación con HTTPS si se despliega el sitio.

## 6. Pruebas realizadas y resultados

Se usó un servidor HTTP temporal local y automatización del navegador. Los datos introducidos fueron de prueba; no se activó el envío externo por WhatsApp o correo.

| Prueba | Resultado observado |
| --- | --- |
| Existencia de los archivos y recursos del sitio | Se revisaron los 17 archivos originales. No se detectaron recursos de imagen rotos en las páginas cargadas. |
| Sintaxis de `script.js` con `node --check` | Correcta; el comando finalizó sin errores. |
| HTML de las tres páginas con `html-validate`, preset `standard` | La validación finalizó sin errores. |
| Matriz adaptable | 24 escenarios: 3 páginas × 4 anchos —320, 398, 768 y 1440 px— × 2 temas. Altura de ventana: 900 px. |
| Desbordamiento horizontal global | No apareció en ninguno de esos 24 escenarios. |
| Errores de JavaScript, consola y carga | No aparecieron en los escenarios ejecutados. Esto no demuestra ausencia de errores en todos los estados posibles. |
| Encabezado principal y contenido principal | Un `h1` y un `main` por documento en los escenarios revisados. |
| Referencias ARIA y enlaces vacíos | Sin referencias a identificadores inexistentes en los atributos comprobados; sin enlaces con destino únicamente `#`. |
| axe: reglas etiquetadas WCAG A/AA hasta 2.2 | 20 escenarios sin infracciones detectadas; 4 con la misma alerta de contraste del descriptor de marca en oscuro. Las comprobaciones incompletas de axe requieren revisión manual. |
| Tabla con teclado | Tab alcanzó el contenedor; foco visible; desplazamiento mediante flechas cuando las columnas no cabían. |
| Enlace de salto en navegador actual | Visible y enfocado con el primer Tab. |
| Simulación de pseudoclase no reconocida | Confirmó que la regla agrupada deja oculto el enlace; véase H-07. |
| Menú móvil | Abrió y cambió `aria-expanded`; Escape lo cerró. |
| Diálogo de servicio | Abrió con Espacio; Escape lo cerró; el foco volvió al activador. |
| Formulario inválido y válido | Detectó datos incorrectos, enfocó el primer error y preparó el resumen con datos válidos. Editar conservó los valores. |
| Documentos legales | Los enlaces abrieron sus páginas locales. |
| Página con JavaScript desactivado, 320 px | Navegación visible; aviso de contacto alternativo; campos del formulario ocultos; sin desbordamiento global. |
| Tamaño raíz del texto duplicado | Sin desbordamiento global en los cuatro anchos. Es una prueba de ampliación del texto por CSS, no una prueba equivalente a todo el zoom del navegador. |
| Comprobación adicional en Edge | En 320 y 1440 px cargó la página, abrió el diálogo y no hubo errores JavaScript ni desbordamiento global. |

**Límites:** Brave y Edge comparten el motor Chromium. No se probaron aquí Safari, Firefox, lectores de pantalla ni todos los estados de cada control con axe. Una ventana de 320 px no equivale por sí sola a utilizar un teléfono real. No se realizaron pruebas de servidor porque el proyecto no tiene uno propio para procesar solicitudes.

### Pruebas que deben repetirse después de corregir

1. Recorrer toda la página con Tab, Mayús + Tab, Enter, Espacio, flechas y Escape. Confirmar orden, visibilidad del foco y retorno desde los diálogos.
2. Repetir el enlace de salto con y sin reconocimiento de `:focus-visible`.
3. Medir el contraste de la marca en oscuro al inicio y durante el desplazamiento, y volver a ejecutar axe.
4. Probar 320, 398, 768 y 1440 px en ambos temas, incluida la tabla abierta, menú, diálogo, formulario con errores y resumen preparado.
5. Revisar zoom real al 200 % y 400 %, ampliación del texto y espaciado personalizado, comprobando que no se pierdan contenidos ni controles.
6. Comprobar nombres, regiones, errores y anuncios con NVDA o VoiceOver; añadir Firefox y Safari a la revisión.
7. Si se incorpora servidor, enviar datos válidos e inválidos, incluso saltándose JavaScript, y verificar rechazos, confirmaciones y errores de red. Hacerlo en un entorno de pruebas.
8. Repetir la validación HTML, la comprobación de sintaxis JavaScript y la carga de recursos después de cualquier cambio.

## 7. Explicación breve para presentar el trabajo

«Revisé la página con la teoría de las tres semanas y comparé los resultados con la auditoría anterior. La primera semana se refleja en la organización del proyecto y en una estructura que se entiende mejor. La segunda se aplica en las etiquetas del formulario, los mensajes de error, la navegación con teclado y el uso de elementos HTML adecuados. La tercera se observa en el uso de Flexbox, Grid, medidas adaptables y cambios de distribución según el tamaño de la pantalla.

»La tabla ahora se puede recorrer con teclado; el nombre de la marca no se repite; las preguntas y las imágenes tienen una estructura más clara; los documentos legales tienen destinos reales; la validación se entiende mejor en el código; y los enlaces del pie tienen un área más cómoda para pulsarlos.

»No todos los puntos están terminados. El formulario revisa los datos en el navegador, pero todavía no tiene validación en servidor. El enlace de salto necesita una regla de respaldo independiente para navegadores que no entiendan el selector moderno. También conviene mejorar algunos textos pequeños y el contraste del descriptor de la marca en oscuro. Las pruebas en los cuatro anchos no mostraron errores de JavaScript ni desbordamiento global, pero falta completar la revisión con lectores de pantalla y otros navegadores».

## 8. Registro de esta revisión

Se creó únicamente este informe dentro del proyecto. Los archivos HTML, CSS, JavaScript y recursos originales se conservaron; su integridad se comprobó comparando sus huellas SHA-256 anteriores y posteriores a la revisión. Las herramientas, capturas y resultados auxiliares de prueba quedaron en una carpeta temporal, fuera del sitio.

Las recomendaciones descritas son pendientes documentados, no modificaciones realizadas. El resultado permite explicar qué está aplicado y qué falta sin presentar como implementadas funciones que el proyecto todavía no tiene.
