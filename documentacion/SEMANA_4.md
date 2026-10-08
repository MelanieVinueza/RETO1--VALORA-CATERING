# Semana 4: buenas prácticas aplicadas a Válora

> **Organización de la entrega final:** este informe es histórico. Sus líneas, estados y comandos describen la versión revisada en esa semana. Los enlaces al código apuntan a su ubicación actual; los scripts de pruebas se retiraron de la entrega final. Consulta [README.md](README.md) para ejecutar la versión actual.

**Fecha:** 7 de octubre de 2026.  
**Fuente principal:** `semana 4 teoria.pdf`, 24 páginas, asignatura Desarrollo en plataformas.  
**Objetivo:** aplicar JavaScript moderno y reforzar HTML semántico, diseño adaptable y accesibilidad, conservando la paleta marrón y dorada del proyecto.

## Qué enseña la semana y cómo se aplicó

El PDF se concentra en JavaScript moderno, funciones, estructuras de control, promesas y manejo de errores. HTML5, Flexbox, Grid y accesibilidad complementan esa lógica con lo trabajado en las semanas anteriores.

| Tema de la teoría | Aplicación real | Explicación sencilla |
| --- | --- | --- |
| `let`, `const` y ámbito de bloque — 4.1 y 4.2, páginas 2–7 | Los valores estables usan `const`; los estados que cambian usan `let`. Las constantes de validación se agrupan en `LIMITES`. | Cada dato tiene un nombre y un lugar definido; se evitan variables globales accidentales. |
| Funciones con una responsabilidad — 4.2, páginas 8–11 | `script.js` tiene inicializadores separados para tema, cabecera, navegación, anclas, filtros, diálogo y formulario. | Es más fácil encontrar qué parte controla cada comportamiento. |
| Funciones reutilizables y parámetros predeterminados | `fechaLocal`, `obtenerErrorCampo` y `crearResumenSolicitud` están en `solicitud.js`. | Las reglas del formulario se pueden revisar y probar sin abrir toda la interfaz. |
| Desestructuración y plantillas de texto — 4.1, páginas 4–6 | Se extraen propiedades de los campos y datos de la solicitud; el resumen usa plantillas literales. | El código expresa qué datos necesita y cómo aparecen en el mensaje. |
| Módulos `import` / `export` — 4.1, páginas 5–6 | `script.js` importa las operaciones de `solicitud.js`. Los tres HTML cargan el script como módulo nativo. | Se separa la lógica reutilizable de la interacción con la página, sin instalar bibliotecas. |
| Condiciones, `switch` y retornos anticipados — 4.2 | La validación diferencia correo, teléfono, personas y fecha. Un campo incorrecto devuelve un mensaje claro. | Cada tipo de dato tiene su comprobación, sin mezclar todas las reglas. |
| Promesas y `async` / `await` — 4.3, páginas 11–17 | La copia del resumen espera la promesa real de `navigator.clipboard.writeText`. | El usuario puede seguir utilizando la página mientras el navegador resuelve la operación. |
| Estado de espera y prevención de repeticiones | El botón muestra «Copiando…», comunica `aria-busy` y bloquea nuevas activaciones con `aria-disabled` y una comprobación del estado. | Se evita iniciar varias copias a la vez y se conserva el foco del teclado. |
| Errores personalizados — 4.4, página 20 | `ErrorPortapapeles` distingue una función no disponible de una copia rechazada por el navegador. | El programa puede responder de forma adecuada a cada situación. |
| `try`, `catch` y `finally` — 4.4, páginas 18–22 | Si la copia falla, se ofrece selección y copia manual; al terminar se restaura el botón. | Un error de permisos no deja el control inutilizable ni hace perder la solicitud. |
| Evitar resultados fuera de contexto | Se comprueba la revisión de la solicitud antes de mostrar el resultado de una copia pendiente. | Si la persona edita sus datos mientras se copia, una respuesta anterior no modifica el aviso de la nueva solicitud. |
| Validar y depurar — 4.4, páginas 21–22 | Se añadieron pruebas ejecutables para las reglas, fechas y operaciones asíncronas. | Las correcciones se verifican con casos válidos, inválidos y fallos controlados. |

Se utiliza una operación asíncrona que la página necesita de verdad: copiar el resumen. No se añadieron servidores ficticios, consultas a APIs de ejemplo, tiempos de espera artificiales ni dependencias nuevas. Las respuestas simuladas de las pruebas están fuera del funcionamiento del sitio.

## HTML5 y formulario

- Se mantienen `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `figcaption`, `time`, `details`, `summary` y `dialog`, según el contenido que representan.
- El formulario ahora tiene nombre accesible mediante `aria-labelledby="titulo-formulario"` y sus instrucciones se relacionan con `aria-describedby`.
- Los campos obligatorios aparecen primero. «Personas» y «Fecha», opcionales, quedan después del mensaje.
- Se mantienen las etiquetas de los campos, los tipos de entrada, el autocompletado y las restricciones nativas. JavaScript consulta `ValidityState` y explica los errores.
- Se valida el día local y se actualiza el mínimo de fecha al continuar. La regla también rechaza fechas inexistentes, como el 29 de febrero de un año no bisiesto.
- El resumen puede recibir foco y desplazarse con teclado. Los datos del visitante se insertan con `textContent`, sin interpretarlos como HTML.
- El aviso de contacto alternativo permanece disponible si JavaScript está desactivado o si no se carga el módulo. No depende exclusivamente de `noscript`.

## Diseño adaptable y accesibilidad

Las mejoras se orientan a WCAG 2.1 AA. Las comprobaciones realizadas no sustituyen una evaluación completa con tecnologías de apoyo.

| Mejora | Comportamiento actual | Relación con accesibilidad |
| --- | --- | --- |
| Foco de teclado | La regla `:focus` es independiente de `:focus-visible`. El enlace de salto se muestra incluso al simular una pseudoclase moderna no reconocida. | Teclado, salto de bloques y foco visible: 2.1.1, 2.4.1 y 2.4.7. |
| Contraste oscuro | El descriptor de la marca, los botones de borde al pasar el puntero y los filtros usan un tono de la paleta adecuado al tema. | Contraste mínimo: 1.4.3. |
| Nombre del formulario y mensajes | Se relacionan el título, las instrucciones y los errores con sus elementos. Los avisos de copia se presentan en una región de estado. | Relaciones, identificación de errores y mensajes de estado: 1.3.1, 3.3.1 y 4.1.3. |
| Textos secundarios | Se aumentó el descriptor de la marca de 6,88 a 10 px, los rótulos de servicio a 12 px, los enlaces legales a 13 px y las instrucciones del formulario a 14 px, con tamaño base normal. | Mejora de legibilidad; WCAG no establece un mínimo universal de fuente. |
| Cabecera pequeña | Flexbox permite que el texto de marca se ajuste, conservando espacio para los botones. En 320 px el descriptor puede ocupar dos líneas. | Adaptación del contenido y lectura en pantallas estrechas. |
| Acciones del resumen | Los botones se distribuyen con `flex-wrap`, una base flexible y texto que puede ajustarse. | Evitar que las acciones salgan del espacio disponible. |
| Pie de página | Los enlaces legales tienen una altura mínima de 44 px con tamaño base normal. | Mejora de comodidad táctil; no se presenta como un requisito mínimo de WCAG 2.1 AA. |
| Tabla, imágenes y distribución | Se conservan el desplazamiento interno accesible de la tabla, las imágenes adaptables y la combinación de Grid y Flexbox. | Relaciones semánticas, teclado y redistribución: 1.3.1, 2.1.1 y 1.4.10. |
| Preferencias | Se mantiene la preferencia de movimiento reducido, el tema del sistema y la elección manual. El tema funciona aunque el almacenamiento local esté bloqueado. | Respeto a las preferencias y continuidad de la interacción. |

## Archivos

| Archivo | Función o cambio |
| --- | --- |
| [index.html](../index.html) | Formulario nombrado, orden de campos, resumen enfocable y contacto alternativo. |
| [styles.css](../assets/styles.css) | Foco, contraste, legibilidad y ajustes de Flexbox para cabecera y acciones. |
| [script.js](../js/app.js) | Inicializadores por función e interacción asíncrona con estados y recuperación. |
| [solicitud.js](../js/solicitud.js) | Nuevo módulo útil: validación, fechas, resumen y copia mediante la función real del navegador. |
| [privacidad.html](../privacidad.html) y [condiciones.html](../condiciones.html) | Carga del script como módulo; se conserva su contenido. |
| `tests/solicitud.test.mjs` (archivo retirado de la entrega final) | Seis pruebas automatizadas sin bibliotecas externas. |

Los recursos gráficos, las fuentes, las bibliotecas CSS existentes y sus licencias se conservaron. La auditoría de semanas 1–3 queda identificada como revisión anterior a estos cambios.

## Cómo abrir y comprobar el proyecto

Los módulos ES6 se cargan desde un servidor HTTP/HTTPS. Para trabajar localmente, sirve esta carpeta con el servidor local de tu editor o con un servidor estático disponible. Abre `index.html` desde esa dirección. Abrirlo mediante doble clic como `file://` no es la forma de ejecutar los módulos; el contenido y los enlaces de contacto siguen disponibles como alternativa. Este comportamiento está explicado en la [documentación de módulos de MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

Para copiar automáticamente, el navegador necesita un contexto seguro y permitir la operación. Cuando no es posible, el sitio ofrece la copia manual. Referencia: [Clipboard.writeText en MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).

Con Node.js 24 disponible, desde la carpeta del proyecto:

```powershell
node --check script.js
node --check solicitud.js
node --test tests/solicitud.test.mjs
```

Node.js se usa para estas comprobaciones de desarrollo; la web no necesita instalar paquetes para funcionar. En esta revisión se utilizó el ejecutable local ya disponible en el equipo.

## Pruebas realizadas

| Comprobación | Resultado |
| --- | --- |
| Sintaxis de ambos JavaScript | Correcta. |
| HTML de las tres páginas | `html-validate`, configuración `standard`, sin errores. |
| Pruebas de reglas y asincronía | 6 pruebas aprobadas: campos obligatorios, teléfono, correo/cantidades, fechas, resumen y promesas de copia. |
| Matriz de páginas | 24 escenarios: tres páginas, anchos de 320, 398, 768 y 1440 px, temas claro y oscuro. Sin errores JavaScript, recursos fallidos ni desbordamiento horizontal global. |
| Accesibilidad automática de la matriz | Sin infracciones detectadas por las reglas A/AA ejecutadas con axe. Incluyeron etiquetas WCAG hasta 2.2. |
| Estados adicionales del formulario y diálogo | 24 escenarios: errores, resumen preparado y diálogo abierto, en cuatro anchos y ambos temas. Sin infracciones detectadas por las reglas WCAG 2.1 A/AA ejecutadas. |
| Estados de puntero y menú | Se verificaron filtros al pasar el puntero y menú móvil abierto, en ambos temas, sin infracciones detectadas. |
| Teclado | Enlace de salto, desplazamiento de tabla, menú, diálogo y recuperación del foco comprobados. Al recorrer el diálogo no se activaron controles del contenido de fondo. |
| Copia del resumen | Se verificaron éxito, rechazo, falta de soporte, espera, doble activación, respuesta antigua después de editar y alternativa sin selección disponible. Se simularon permisos y respuestas sin alterar el portapapeles personal. |
| Seguridad del resumen | Un texto de prueba con etiquetas HTML se mostró literalmente y no generó elementos ejecutables. Preparar la solicitud no produjo envíos de red. |
| Recuperación | Tema y menú funcionaron con almacenamiento bloqueado; el contacto alternativo se mostró al impedir la carga del módulo. |
| Ampliación y espaciado | Al duplicar el tamaño raíz del texto no hubo desbordamiento global. Tampoco al aplicar espaciado de letras y palabras, interlineado y separación de párrafos en los escenarios adicionales. |
| Segundo navegador | Comprobación adicional en Edge a 320 y 1440 px: carga y diálogo correctos, sin errores JavaScript ni desbordamiento global. |
| Revisión visual | Se inspeccionaron capturas de la cabecera y sección principal a 320 y 1440 px. |

Las pruebas de navegador se realizaron con Playwright y axe ya disponibles en el equipo. Sus scripts auxiliares y capturas se guardaron fuera del proyecto, en una carpeta temporal. Las seis pruebas de lógica sí quedan en `tests` para poder repetirlas.

## Alcance pendiente

El formulario prepara un mensaje que el visitante decide compartir por WhatsApp o correo. No existe un servidor propio que reciba solicitudes ni una tercera capa de validación. La semana 4 se aplica a la lógica del navegador; no se simula un backend ni se anuncia que una solicitud fue enviada cuando solo se preparó.

Quedan por realizar pruebas con lectores de pantalla reales, Firefox/Safari, dispositivos físicos y zoom real del navegador al 200 % y 400 %. Brave y Edge comparten Chromium; las comprobaciones automáticas y la ampliación mediante CSS no cubren por sí solas todo WCAG 2.1 AA.
