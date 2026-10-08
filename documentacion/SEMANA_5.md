# Semana 5: buenas prácticas aplicadas a Válora

> **Organización de la entrega final:** este informe es histórico. Sus líneas, estados y comandos describen la versión revisada en esa semana. Los enlaces al código apuntan a su ubicación actual; los scripts de pruebas se retiraron de la entrega final. Consulta [README.md](README.md) para ejecutar la versión actual.

**Fecha:** 7 de octubre de 2026.  
**Material revisado:** `semana 5 teoría (2).pdf`, 32 páginas, asignatura Desarrollo en plataformas.  
**Objetivo:** mejorar la interacción, la validación y el manejo de datos del sitio, conservando sus textos, servicios y paleta marrón y dorada.

## 1. Relación entre la teoría y el proyecto

| Tema del PDF | Cambio concreto | Explicación sencilla |
| --- | --- | --- |
| 5.1. DOM y eventos, páginas 1–7 | `script.js` agrupa los eventos de filtros, tarjetas y campos en sus contenedores. | Un mismo controlador atiende elementos relacionados y evita repetir lógica. |
| Creación y actualización de elementos | Los detalles del servicio usan `createElement`, `DocumentFragment`, `replaceChildren` y `textContent`. | Se construye la lista de forma ordenada. Los textos del catálogo se muestran como texto, sin ejecutarse como HTML. |
| 5.2. Validación dinámica, páginas 7–14 | El formulario relaciona las reglas de `solicitud.js` con `setCustomValidity`, `aria-invalid` y mensajes vinculados a cada campo. | La persona sabe qué debe corregir. Cuando corrige el dato, desaparece también el estado de error. |
| Eventos `input`, `change` y pérdida de foco | Se valida al salir del campo y se vuelve a comprobar mientras se corrige un campo inválido. Al preparar la solicitud se revisan todos los campos. | Se evita mostrar errores en todos los campos antes de que la persona intente completarlos. |
| Almacenamiento web y JSON | `borrador.js` permite activar un borrador en `sessionStorage`. | Al recargar esa pestaña se recupera lo escrito, solamente si se activó la opción. |
| Reducir trabajo repetido | Se guardan referencias al DOM, se evitan cambios de texto idénticos y se agrupan las escrituras del borrador durante 400 ms al escribir. | No hace falta guardar ni reconstruir todo por cada tecla. Al cambiar de campo o salir de la página se intenta guardar lo pendiente. |
| 5.3. Fetch y manejo de respuestas, páginas 14–22 | `catalogo.js` carga el archivo real `assets/servicios.json`, comprueba el estado HTTP y valida su contenido. | La página obtiene los detalles de sus propios servicios y puede explicar si la lectura falla. |
| IndexedDB y transacciones | Se guarda una copia del catálogo público y se confirma la operación al completar la transacción. | Si falla una lectura posterior, se puede recuperar una copia válida guardada durante los últimos siete días. |
| Operaciones asíncronas y errores | Hay avisos de carga, reintento, cancelación y un límite de ocho segundos para la petición Fetch. | Un fallo no deja la ventana esperando indefinidamente. También se puede continuar hacia el contacto. |
| 5.4. Accesibilidad en interfaces dinámicas, páginas 22–29 | Se conserva el diálogo nativo y se añaden estados con `role="status"`, `aria-atomic`, `aria-busy` y gestión del foco. | Los cambios tienen mensajes visibles y una forma de comunicarse a tecnologías de asistencia. |

Las preguntas finales del PDF se utilizaron como referencia para revisar los conceptos. No se incorporaron como contenido del sitio.

## 2. Qué cambia para quien visita la página

### Detalles de los servicios

Al abrir un servicio aparece un aviso de carga. La página lee su catálogo local y muestra los mismos títulos, descripciones y prestaciones que tenía antes. Si hay un fallo, ofrece reintentar o continuar hacia la solicitud.

Si existe una copia válida en IndexedDB, se identifica como una copia guardada. Si es demasiado antigua o está dañada, no se utiliza. Cerrar la ventana cancela la carga; una respuesta anterior no puede reemplazar los detalles de otro servicio abierto después.

Fetch no considera por sí solo que una respuesta HTTP 404 sea un rechazo de la promesa. Por eso el código revisa `response.ok` antes de leer los datos. Referencia: [documentación de Fetch en MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

### Validación del formulario

Los mensajes explican el problema junto al campo y se relacionan con sus instrucciones accesibles. Se mantienen las restricciones nativas y las reglas del proyecto para correo, teléfono, longitud del mensaje, personas y fecha.

Al intentar preparar una solicitud inválida, el foco llega al primer campo que necesita corrección. Los cambios de validez tienen un aviso accesible. También se evita que la aparición de un error durante un clic desplace una casilla o un botón y haga perder esa acción.

### Borrador opcional

La casilla «Recordar mis datos en esta pestaña» está desactivada inicialmente. Al activarla, se guarda el contenido de los campos, incluso si todavía está incompleto. Recuperarlo no equivale a validarlo: se vuelve a revisar al preparar la solicitud.

«Borrar borrador guardado» elimina esa copia y desactiva el guardado, pero conserva el texto que se está editando. El foco vuelve a la casilla antes de deshabilitar el botón. Un borrador dañado se descarta con un aviso. Si el navegador bloquea el almacenamiento o se agota su espacio, el formulario sigue disponible.

`sessionStorage` permite conservar datos durante la sesión de la pestaña y al recargar. Algunos navegadores pueden recuperarlos al restaurar una sesión; por eso se ofrece un borrado explícito y se explica esta situación en privacidad. Referencia: [documentación de sessionStorage en MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

## 3. Dónde se guardan los datos

| Información | Almacenamiento | Condición |
| --- | --- | --- |
| Tema claro u oscuro | `localStorage`, ya existente | Preferencia visual del visitante. |
| Borrador del formulario | `sessionStorage` | Solo si se activa la casilla o ya existe un borrador activado en esa sesión. Se puede borrar desde el formulario. |
| Catálogo público de servicios | IndexedDB | Copia opcional para recuperar los detalles si falla Fetch. No contiene los datos del formulario. |

La escritura en IndexedDB es opcional: si falla, el catálogo obtenido por Fetch sigue funcionando. Las transacciones se crean cuando los datos necesarios ya están disponibles y se cierran las conexiones al terminar. Referencia: [uso de IndexedDB en MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).

No se añadieron cookies: el sitio no tiene inicio de sesión ni una necesidad nueva que las justifique. Tampoco se inventó un servidor de recepción. Preparar la solicitud sigue siendo una operación local; la persona decide si la comparte por los canales existentes.

`privacidad.html` explica estos comportamientos. La copia del catálogo no convierte el sitio completo en una aplicación disponible sin conexión: para abrir inicialmente sus páginas siguen siendo necesarios sus recursos.

## 4. Archivos y responsabilidades

- `index.html`: controles del borrador y mensajes accesibles de validación y carga.
- `styles.css`: presentación del borrador y de los nuevos estados, con la paleta existente y adaptación a móvil.
- `print.css`: oculta los nuevos controles interactivos al imprimir.
- `script.js`: eventos agrupados, validación dinámica e integración del catálogo y del borrador.
- `borrador.js`, nuevo: guardado, recuperación, borrado y manejo de fallos del borrador.
- `catalogo.js`, nuevo: Fetch, validación del catálogo y copia opcional en IndexedDB.
- `assets/servicios.json`, nuevo: los cuatro servicios que antes estaban definidos dentro de `script.js`.
- `privacidad.html`: información sobre el almacenamiento realmente utilizado.
- `tests/catalogo.test.mjs`, nuevo: comprobaciones del catálogo y de respuestas válidas e inválidas.

Se reutilizan `solicitud.js` y sus pruebas. No se instalaron bibliotecas ni frameworks nuevos. Los módulos y Fetch se deben ejecutar mediante un servidor HTTP o HTTPS; abrir el HTML directamente como archivo local no es la forma de probar estas funciones.

## 5. Pruebas realizadas

| Comprobación | Resultado |
| --- | --- |
| Sintaxis de `script.js`, `solicitud.js`, `catalogo.js` y `borrador.js` con Node.js | Sin errores. |
| Pruebas unitarias con `node --test` | Nueve pruebas aprobadas: seis existentes y tres nuevas. |
| Validación HTML de inicio, privacidad y condiciones | Sin errores con el preset `standard` de HTML Validate. |
| Archivos, rutas y contenido | Existen los 13 archivos esperados de implementación, documentación y pruebas. Se comprobaron 41 referencias locales de HTML, CSS y módulos, sin rutas faltantes. Los cuatro servicios del JSON coinciden con los datos originales. |
| Tres páginas, anchos de 320, 398, 768 y 1440 px, temas claro y oscuro | 24 combinaciones sin desbordamiento horizontal global, errores JavaScript ni recursos fallidos. |
| Revisión automatizada de accesibilidad con axe | Sin infracciones detectadas en las 24 combinaciones anteriores, 24 estados de formulario/resumen/diálogo y cinco estados nuevos de borrador/catálogo. No equivale a una certificación WCAG. |
| Teclado | Enlace de salto, tabla desplazable, diálogo, cierre con Escape, retorno del foco y eliminación del borrador comprobados. |
| Formulario | Correo inválido, corrección posterior, foco en el primer error, resumen válido y conservación de los datos comprobados. Preparar el resumen no realizó un envío de red. |
| Borrador | Desactivado por defecto, guardado voluntario, recarga, recuperación, borrado, datos dañados, almacenamiento bloqueado y falta de espacio comprobados. |
| Catálogo | Fetch real del JSON, escritura real en IndexedDB, recuperación al fallar la red, HTTP 404, JSON inválido, estructura incorrecta y reintento comprobados. |
| Casos de espera y cancelación | Petición sin respuesta, cierre durante la carga, respuesta antigua y copia de más de siete días comprobados. |
| Contenido no confiable | Un texto con apariencia de HTML se mostró como texto y no se ejecutó. |
| Degradación y presentación | Navegación sin JavaScript, fallo del módulo, texto ampliado mediante tamaño raíz al 200 %, espaciado de texto y ocultación del borrador al imprimir comprobados. |
| Navegadores | Pruebas principales con Brave y comprobación básica en Edge. Ambos usan Chromium. |

Las pruebas de navegador utilizaron herramientas de verificación ya disponibles fuera del proyecto y datos ficticios. No se enviaron solicitudes reales por correo ni WhatsApp.

Comandos para repetir las comprobaciones locales, con Node.js disponible en el entorno:

```powershell
node --check script.js
node --check solicitud.js
node --check catalogo.js
node --check borrador.js
node --test tests/solicitud.test.mjs tests/catalogo.test.mjs
```

### Límites de la verificación

Los resultados automáticos y la revisión por teclado respaldan los cambios concretos indicados. Queda pendiente una evaluación manual completa con lectores de pantalla, otros motores de navegador, dispositivos físicos y zoom real del navegador al 400 %. No se afirma cumplimiento absoluto de todos los criterios WCAG a partir de axe.

Los informes de semanas anteriores conservan su carácter histórico; este documento describe los cambios y las pruebas de la semana 5.
