# Válora · Reto 1: carrito de paquetes de catering

Proyecto académico de Joel Robalino, paralelo 2. Docente: Marco Vinicio Vásquez Chávez.

Válora presenta servicios de catering y permite armar un pedido. El visitante elige entre seis paquetes, indica el número de personas, cambia el menú, añade extras y revisa el total. Después completa los datos del evento y pulsa «Finalizar compra». La pantalla muestra «Compra exitosa», vacía el carrito y ofrece «Seguir comprando».

**Alcance técnico para la defensa:** los precios siguen siendo importes académicos. La interfaz presenta la vista del cliente, pero no existe una pasarela de pago ni se cobra dinero. «Compra exitosa» confirma que se completó el recorrido local; no acredita un pago ni una reserva. El envío de pedidos al negocio queda para una integración futura. La compra no abre WhatsApp ni pide al cliente enviar su pedido.

## Cómo abrir el proyecto

1. Extrae el proyecto completo en una carpeta; no abras archivos dentro del ZIP.
2. Abre la carpeta en Visual Studio Code.
3. Instala o activa la extensión **Live Server** si está permitida en el entorno de clase.
4. Abre `index.html`, pulsa **Go Live** y usa la dirección local que abre el navegador.

La página necesita servirse por HTTP para que los módulos y Fetch puedan leer los JSON. Live Server solo entrega los archivos al navegador; el proyecto no tiene un backend propio, no recibe compras y no procesa pagos. Para publicar el sitio, el proveedor web entrega directamente HTML, CSS, JavaScript y JSON.

## Recorrido de uso

1. Revisa los seis paquetes y su precio por persona: buffet empresarial, coffee break, bienestar, parrillada, cocina ecuatoriana y pastas. Cada uno ofrece ocho menús y ocho complementos.
2. Configura un paquete con entre 10 y 200 personas, menú, extras y observaciones.
3. Añádelo al carrito. Puedes continuar con otros paquetes, cambiar personas, editar una configuración, eliminar una línea o vaciar el carrito.
4. Revisa el subtotal y el total. El retiro no tiene cargo; el domicilio suma USD 8 por pedido.
5. Completa tus datos y la fecha y hora del evento. Para domicilio, completa también la dirección.
6. Corrige los errores que indique el formulario y pulsa «Finalizar compra».
7. La confirmación muestra «Compra exitosa». Las líneas, el contador y los totales quedan en cero; el carrito se guarda vacío. También se limpian los datos del evento y su borrador. Puedes pulsar «Seguir comprando» para empezar un pedido nuevo.

Si el navegador impide guardar el carrito vacío, se intenta eliminar únicamente su clave. Cuando ambas operaciones fallan y puede existir un carrito anterior, se conserva el pedido y se pide reintentar; no se muestra una confirmación engañosa de vaciado. Si el almacenamiento no estuvo disponible desde el inicio, el recorrido puede completarse en memoria con un aviso de esa limitación.

Para la exposición, utiliza datos ficticios. Las observaciones sirven para comunicar preferencias; no garantizan disponibilidad ni ausencia de alérgenos.

## Estructura principal

```text
Proyecto/
├── index.html                 Página principal y flujo de compra
├── privacidad.html            Explicación del uso de datos locales
├── condiciones.html           Condiciones de uso de la demostración
├── assets/
│   ├── styles.css             Identidad visual y estilos generales
│   ├── tienda.css             Estilos del catálogo y carrito
│   ├── print.css              Presentación al imprimir
│   ├── paquetes/              Una imagen distinta por paquete
│   ├── imagenes/              Imagen de preparación en cocina
│   └── ...                    Portada adaptable, logotipos, fuentes y licencias
├── data/
│   ├── productos.json         Paquetes, menús, extras y precios de demostración
│   └── servicios.json         Tarjetas y detalle de los servicios
├── js/
│   ├── app.js                 Inicio y funciones generales de la página
│   ├── tienda.js              Controlador del flujo de compra
│   ├── cart.js                Reglas del carrito y cálculo de importes
│   ├── repo.js                Lectura y almacenamiento de datos de la tienda
│   ├── view.js                Creación y actualización de la interfaz
│   ├── solicitud.js           Validaciones y resumen del formulario de contacto
│   ├── borrador.js            Borradores opcionales de contacto y compra
│   └── catalogo.js            Lectura, validación y normalización de servicios
├── documentacion/
│   ├── README.md              Uso, tecnologías, persistencia y publicación
│   ├── GUIA_DEFENSA.md        Guion para la exposición
│   └── ...                    Auditorías e informes de las semanas anteriores
└── README.md                  Entrada breve a la documentación
```

Los informes de semanas anteriores conservan la historia del trabajo y están reunidos en `documentacion/`. Sus nombres de archivo, números de línea y comandos de pruebas pueden corresponder a versiones anteriores. Las pruebas de desarrollo se retiraron de la carpeta y del ZIP por petición del autor; no son necesarias para ejecutar la web. Las licencias se conservan junto a los recursos en `assets/`.

Las rutas y los comandos de esta guía se interpretan desde la raíz del proyecto, donde está `index.html`, no desde la carpeta `documentacion/`.

## Tecnologías y organización

HTML5 aporta estructura semántica, formularios y controles nativos. CSS3 organiza la distribución adaptable mediante Flexbox y Grid y conserva la paleta del proyecto. JavaScript ES6+ utiliza módulos, funciones, eventos y operaciones asíncronas. Los recursos de estilos de Bootstrap y Tailwind que ya existían siguen siendo archivos locales; no se introduce un framework de JavaScript.

La aplicación separa las responsabilidades por capas (MVC):

- **Datos:** `data/productos.json` contiene paquetes, menús, complementos y precios; `data/servicios.json` contiene categorías, textos e información de detalle. Son datos semiestructurados que pueden migrarse después a una API o base de datos sin reescribir la presentación.
- **Modelo:** `cart.js` contiene las reglas del carrito y los cálculos; `repo.js` carga y conserva los datos de la tienda; `catalogo.js` carga y valida los servicios.
- **Vista:** `index.html` define la estructura y `view.js` crea las tarjetas de servicios y paquetes desde los datos recibidos. Los textos del catálogo no se duplican dentro del HTML.
- **Controlador:** `tienda.js` recibe las acciones de compra y coordina modelo y vista; `app.js` coordina filtros, diálogos, formularios y navegación general.

Fetch lee archivos JSON del mismo proyecto; no se utiliza una API comercial inventada. Se comprueba su estructura antes de usarla y se muestra una alternativa de reintento cuando falla la carga. Los importes se calculan con centavos enteros y se presentan en dólares. Un extra de USD 2 por persona para 10 personas suma USD 20. La interfaz usa JavaScript modular nativo; jQuery no es una dependencia del proyecto.

### Contrato de datos de los catálogos

| Fuente | Estructura principal | Campos que consume la aplicación |
| --- | --- | --- |
| `data/productos.json` | Versión 1: objeto con `moneda`, `demostracion` y una lista `productos`. | Cada paquete tiene `id`, `nombre`, `descripcion`, `imagen`, `imagenAlt`, `precioCentavos`, `minPersonas`, `maxPersonas`, `incluye`, `menus`, `extras` y `etiqueta`. Los menús y extras incluyen identificador, nombre y precio en centavos. |
| `data/servicios.json` | Versión 3: objeto con `servicios` agrupados por identificador. | Cada servicio tiene `categoria`, `etiqueta`, `frase`, `icono`, `estilo`, `nombre`, `resumen`, `descripcion` e `incluye`. |

`repo.js` y `catalogo.js` leen cada fuente por separado, comprueban su versión y campos, y entregan objetos normalizados. La vista recibe esos objetos; no conoce la ruta del archivo ni decide cómo se obtienen. Los precios se expresan como centavos enteros para evitar errores de redondeo.

Los nombres, notas y datos guardados se insertan como texto, no como código HTML. Las expresiones regulares ayudan a comprobar formatos de contacto, pero no verifican que un correo exista ni que un teléfono pertenezca al visitante.

## Persistencia y privacidad

| Mecanismo | Uso | Duración y límites |
|---|---|---|
| `localStorage` | Carrito con configuraciones y marca de última actualización; preferencia de tema ya existente | Se conserva entre recargas. El usuario puede vaciar el carrito o eliminar datos del sitio. Los importes se recalculan con el catálogo. |
| `sessionStorage` | Borradores de formularios, cuando el visitante activa recordarlos | Mantiene datos en esa pestaña. Es opcional; no se guardan datos personales del formulario sin activarlo. |
| `IndexedDB` | Copia del catálogo público y su fecha | Permite recuperar una copia válida de hasta siete días si falla la carga del catálogo. No garantiza que toda la web funcione sin conexión. |
| Cookie `valora-entrega` | Preferencia de retiro o domicilio | Hasta 30 días. No contiene nombres, teléfono ni dirección y no se utiliza para publicidad. |

Estos mecanismos pertenecen al navegador y al origen de la página. Lo guardado en `localhost` o en un puerto no se comparte automáticamente con Neocities u otro origen. El modo privado, la configuración del navegador o el borrado de datos pueden impedir la persistencia. La aplicación informa cuando no puede conservar la información.

Los datos de la compra no se envían a un servidor del proyecto ni a WhatsApp. Los canales del formulario general de contacto son independientes del carrito: al abrir allí WhatsApp con una consulta, ese servicio recibe el texto preparado y el visitante confirma el envío. Consulta también [la página de privacidad](../privacidad.html).

## Accesibilidad

La estructura utiliza encabezados, regiones y controles nativos. Los campos tienen etiquetas; los errores se relacionan mediante `aria-describedby` y su estado mediante `aria-invalid`. Los avisos dinámicos comunican cambios de carga o del carrito. El teclado permite recorrer los controles y el foco permanece visible. Los diálogos deben mantener el foco en su contenido y devolverlo al cerrarse.

Las imágenes incluyen alternativas, la distribución se adapta a pantallas pequeñas y los efectos respetan la preferencia de movimiento reducido. Las pruebas automáticas ayudan a detectar fallos, pero no equivalen por sí solas a una certificación WCAG ni reemplazan el uso con lector de pantalla.

## Publicación en Neocities

1. Entra en [Neocities](https://neocities.org/) y crea tu cuenta. Elige el nombre del sitio y completa las verificaciones que te pida el servicio. Conserva tus credenciales de forma privada.
2. Entra en el panel de archivos del sitio y utiliza la opción de subir archivos. Reemplaza el `index.html` de bienvenida por el de este proyecto.
3. Sube también `privacidad.html`, `condiciones.html` y las carpetas `assets`, `data` y `js`, conservando nombres, mayúsculas y estructura. Si el panel no conserva carpetas al arrastrarlas, créalas y sube los archivos dentro de cada una, incluidas las subcarpetas `fonts` y `vendor` de `assets`.
4. No hace falta subir el README ni la carpeta `documentacion/` para que funcione la web.
5. Abre la dirección pública que te indique Neocities y comprueba catálogo, imágenes, cantidades, compra y carrito vacío después de recargar. Por ejemplo, la dirección tendrá el formato `https://nombre-elegido.neocities.org/`; este texto es un ejemplo, no una dirección publicada por esta entrega.

Neocities admite HTML, CSS, JavaScript y JSON, además de los formatos de imagen y fuentes utilizados. [Lista oficial de formatos](https://neocities.org/site_files/allowed_types). Esta entrega prepara los archivos; **no significa que el sitio ya esté publicado**. El ZIP se entrega en el aula virtual; subir un ZIP a Neocities no publica automáticamente sus archivos.

## Comprobaciones antes de entregar

En el navegador, repite el recorrido de compra a 320, 398, 768 y 1440 píxeles, usando teclado y los dos temas. Comprueba recarga, cantidades fuera del rango, fecha pasada, JSON no disponible y almacenamiento bloqueado. Verifica que los totales correspondan a los platos elegidos y que el carrito siga vacío después de comprar y recargar.

**Antecedentes de validación del desarrollo:** los siguientes resultados corresponden a etapas previas, incluida la versión que preparaba pedidos para WhatsApp. Esa función se retiró del cierre de compra.

- Sintaxis de los ocho módulos JavaScript y del servidor local comprobada; tres páginas HTML validadas sin errores.
- Antes de renovar las imágenes se verificaron 60 referencias locales, incluidas imágenes, `srcset`, fuentes, módulos y archivos JSON, con nombres y mayúsculas correctos para publicar. El ZIP actualizado incluye la documentación y los nuevos recursos visuales, sin scripts de pruebas.
- Antes de retirar los archivos de pruebas, se aprobaron 25 pruebas unitarias de catálogos, carrito, precios, almacenamiento, formatos, fechas y portapapeles. Sus resultados se conservan como antecedente; sus scripts ya no forman parte de la entrega.
- Compra completa probada con dos configuraciones del mismo paquete, edición, cantidades, eliminación, entrega y mensaje completo para WhatsApp. El total de un caso de prueba fue USD 385; no se abrió ni envió el mensaje a una persona.
- 40 estados de la tienda revisados con axe: cinco anchos (320, 398, 768, 992 y 1440 px), dos temas y cuatro estados (carrito, configuración, errores y comprobante), sin infracciones automáticas detectadas. También se revisaron errores y comprobante durante el recorrido funcional.
- Recarga, precios manipulados en localStorage, borrador dañado, cookies bloqueadas, copia caducada, recuperación de red y cambios entre pestañas comprobados.
- Corregidos y comprobados dos casos de interacción: editar cantidades conserva el foco y el primer clic; reintentar el catálogo conserva el carrito en memoria aunque falle el almacenamiento.
- Texto al 200 % probado a 320, 398 y 768 px con el carrito lleno y el diálogo abierto, sin desbordamiento horizontal global. La tabla comparativa conserva su desplazamiento interno previsto.
- Servidor local verificado en 14 casos de rutas, métodos HTTP, tipos de archivo y errores de puerto.

**Comprobación después de organizar la entrega:** se verificó que los 29 archivos de código, recursos, licencias e inicio local conservaran exactamente su contenido. Se volvió a validar la sintaxis de los ocho módulos y del servidor, se comprobaron 38 enlaces locales de la documentación y pasaron cuatro recorridos funcionales del carrito en el navegador. Estas comprobaciones se ejecutaron con herramientas externas a la carpeta del proyecto.

**Comprobación después de renovar imágenes y confirmación:** sintaxis de ocho módulos y servidor válida, tres HTML válidos, cuatro recorridos funcionales aprobados y 40 estados de accesibilidad revisados en 320, 398, 768, 992 y 1440 px, en ambos temas, sin infracciones automáticas detectadas. Se verificaron 60 referencias locales hacia 28 recursos distintos, la carga de las siete imágenes visibles en 320 y 1440 px y la ausencia de desbordamiento horizontal o errores JavaScript. Se comprobó que el mensaje de WhatsApp conserve los datos y totales, que el foco llegue a «Compra exitosa» y que ya no aparezca el comprobante largo. Los scripts y capturas de validación permanecen fuera del proyecto.

Las rutas de las imágenes, su procedencia y los prompts están en [RECURSOS_VISUALES.md](RECURSOS_VISUALES.md).

Estas pruebas se realizaron con herramientas de desarrollo ya disponibles; no añaden dependencias de ejecución al sitio. Las comprobaciones de navegador usan Chromium. Quedan fuera de esta entrega una certificación completa WCAG, pruebas manuales con todos los lectores de pantalla, Safari/Firefox y la validación del sitio ya publicado en Neocities.

La explicación para exponer el proyecto está en [GUIA_DEFENSA.md](GUIA_DEFENSA.md).

## Entrega al aula virtual

El archivo preparado se llama **`Reto1_Robalino_Joel.zip`**. Contiene la página, sus recursos y la documentación separada en `documentacion/`, sin la carpeta de pruebas ni un iniciador de Node propio. Extrae una copia para comprobarla antes de subir el ZIP al aula. Para Neocities, utiliza los archivos web extraídos siguiendo los pasos anteriores.
