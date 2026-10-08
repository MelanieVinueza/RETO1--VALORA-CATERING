# Auditoría de la Semana 6 — Válora

**Fecha:** 7 de octubre de 2026  
**Referencia académica:** `semana 6 teoría (1).pdf`, clase 6, en especial las páginas 5–6 y 28–33: separación MVC, lectura de fuentes JSON, validación, normalización, tratamiento de errores y documentación de estructuras.  
**Alcance:** catálogos JSON, módulos que los leen y presentan, responsabilidades MVC y documentación del proyecto.

## 1. Resumen ejecutivo

El proyecto ya separaba buena parte de sus responsabilidades: los paquetes se leen desde `productos.json`; `repo.js` valida y carga ese catálogo; `cart.js` concentra las reglas del carrito; `view.js` crea la interfaz; y `tienda.js` coordina el flujo de compra. Los servicios también se cargan mediante Fetch y pasan por validación en `catalogo.js`.

La revisión encontró una inconsistencia de nivel medio: los campos del catálogo de servicios estaban en inglés mientras el catálogo de paquetes usaba nombres en español. Eso obligaba a mantener dos contratos distintos para información que se presenta en la misma aplicación. Se normalizaron los nombres del JSON y se adaptaron su validador, la vista y el detalle de servicio. También se documentó el contrato de ambos archivos para facilitar su mantenimiento y una migración futura.

| Gravedad | Hallazgos identificados | Estado al cierre |
| --- | ---: | --- |
| Crítica | 0 | No se identificaron en la revisión estática. |
| Alta | 0 | No se identificaron en la revisión estática. |
| Media | 1 | Corregido: esquema de servicios normalizado. |
| Baja | 1 | Corregido: estructuras de datos documentadas. |

La teoría usa jQuery para enseñar la conexión entre Vista, Controlador y Modelo. No exige que el proyecto dependa de jQuery: el sitio ya usa módulos de JavaScript nativo y separa esas funciones. JSON es una de las fuentes que el material recomienda para catálogos sencillos; no es necesario añadir SQLite o Firestore para este alcance.

**Verificación y límites:** Python pudo leer ambos JSON, comprobar sus campos esperados y confirmar que las seis imágenes del catálogo de paquetes existen. No se pudieron ejecutar comprobaciones de Node ni una revisión interactiva en navegador: Node no está disponible en este entorno. El proyecto se abre ahora con Live Server, sin un iniciador propio de Node. Por ello, este informe no afirma haber probado el comportamiento en ejecución.

## 2. Hallazgos críticos, altos, medios y bajos

### 2.1. Hallazgos críticos

**No se identificaron hallazgos críticos en el alcance estático revisado.** No se encontró una instrucción en el material académico que requiera almacenar o enviar información sensible para esta demostración.

### 2.2. Hallazgos altos

**No se identificaron hallazgos altos en el alcance estático revisado.** Los catálogos principales están fuera del HTML y tienen funciones de lectura y validación identificables. La ejecución del sitio queda pendiente de comprobación en navegador por la falta de Node en este entorno.

### 2.3. Hallazgos medios

#### H6-01. Los dos catálogos usaban nombres de campos diferentes para conceptos similares

**Estado: corregido.**

**Archivo y elemento afectado:** `data/productos.json`, objeto `productos`; `data/servicios.json`, objeto `servicios`; `js/cart.js`, función `validarProductos`; `js/catalogo.js`, función `validarCatalogo`; y `js/view.js`, función `mostrarServicios`.

**Evidencia encontrada:** el JSON de productos utilizaba campos como `nombre`, `descripcion` e `incluye`, mientras que los servicios utilizaban `title`, `description` e `includes`. En consecuencia, el modelo y la vista tenían que manejar dos vocabularios para representar nombre, descripción y elementos incluidos.

**Por qué importa:** si se migra el catálogo a una API o se agrega otra fuente, los nombres distintos aumentan el trabajo de adaptación y facilitan errores al conectar los datos con la vista.



**Corrección aplicada:** el catálogo de servicios ahora usa `categoria`, `etiqueta`, `frase`, `icono`, `estilo`, `nombre`, `resumen`, `descripcion` e `incluye`. `catalogo.js` valida la versión 3, comprueba los valores permitidos y devuelve datos normalizados. `view.js` y el detalle de servicio consumen esos campos. La caché usa la clave `servicios-v3` para no confundir registros antiguos con el formato actualizado.

### 2.4. Hallazgos bajos

#### H6-02. La guía enumeraba los JSON, pero no explicaba sus estructuras esperadas

**Estado: corregido.**

**Archivo y elemento afectado:** `documentacion/README.md`, secciones «Estructura principal» y «Contrato de datos de los catálogos».

**Evidencia encontrada:** la guía mencionaba `productos.json` y `servicios.json`, pero no resumía su estructura, versiones ni campos consumidos por el proyecto.

**Por qué importa:** cuando alguien edita el JSON no tiene una referencia rápida para saber qué campos son necesarios ni qué módulo los interpreta.



**Corrección aplicada:** se agregó una tabla que indica la estructura principal de ambos catálogos, sus campos y la responsabilidad de `repo.js` y `catalogo.js` al leerlos y validarlos.



## 3. Resolución teórica individual de los hallazgos

A continuación se explica, hallazgo por hallazgo, el criterio de solución desde las buenas prácticas, sin instrucciones de código.

#### H6-01 — Estructuras distintas para los catálogos

**Resolución teórica:** La solución consiste en acordar una forma común de describir los productos y servicios cuando contienen información equivalente. Así cada parte del sistema sabe qué esperar, hay menos confusiones al presentar los datos y sería más fácil cambiar después de dónde vienen.

**En palabras sencillas:** Productos y servicios deben describir datos parecidos de forma consistente para evitar confusiones.

#### H6-02 — Estructura JSON no documentada

**Resolución teórica:** La solución consiste en acompañar cada archivo de datos con una explicación de qué contiene y qué información necesita conservar. De ese modo, otra persona puede actualizar el catálogo con seguridad y entender cómo se relaciona con el resto del proyecto.

**En palabras sencillas:** La guía debe explicar qué contiene cada JSON y qué información debe conservar quien lo edite.

## 4. Buenas prácticas revisadas como evidencia complementaria

### Evidencia por práctica

| Práctica de la Semana 6 | Evidencia en el proyecto | Resultado y explicación sencilla |
| --- | --- | --- |
| Modelo separado de la interfaz | `data/productos.json`, `data/servicios.json`, `js/repo.js` y `js/catalogo.js`. | Los catálogos viven fuera del HTML y se leen a través de módulos que comprueban sus datos. La vista no decide de dónde vienen. |
| Vista y controlador con tareas distintas | `js/view.js` crea tarjetas y presenta los datos; `js/tienda.js` atiende acciones del carrito; `js/app.js` coordina filtros, detalles y formularios. | La pantalla muestra información; los controladores reaccionan a clics y coordinan el flujo. |
| Validar la estructura antes de mostrar datos | `js/cart.js`, `validarProductos`; `js/catalogo.js`, `validarCatalogo`. | Un archivo incompleto o con tipos incorrectos no se procesa como si fuera un catálogo válido. |
| Normalizar los datos | `validarProductos` y `validarCatalogo` devuelven objetos limpios; el esquema de servicios ahora usa nombres en español acordes con productos. | Las capas reciben campos coherentes y se reducen confusiones al cambiar el catálogo. |
| Manejar errores de lectura y parseo | `js/repo.js` y `js/catalogo.js` verifican `response.ok`, procesan JSON dentro de `try/catch` y presentan reintentos desde la interfaz. | Si falla el archivo, la red local o el formato, la página puede explicar el problema en vez de dejar una vista rota. |
| Mantener coherencia entre Modelo y Vista | `view.js` consume los objetos normalizados; `catalogo.js` restringe categorías, estilos e iconos a valores permitidos. | Los datos que acepta el modelo coinciden con lo que la vista sabe representar. |
| Leer la fuente sin depender de un backend propio | Los módulos usan Fetch sobre los JSON del proyecto. IndexedDB conserva copias locales opcionales de catálogos. | El JSON sigue siendo la fuente del catálogo; la caché del navegador ayuda a recuperarlo si una lectura posterior falla. No se escriben pedidos en un servidor. |
| Documentar rutas y contratos | `documentacion/README.md`, apartado «Contrato de datos de los catálogos». | Se indican las rutas, estructuras principales y campos consumidos por cada catálogo. |

