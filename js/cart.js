const MAX_LINEAS = 12;
const MAX_PRECIO_CENTAVOS = 10000000;
const identificadorValido = (valor) => typeof valor === "string" && /^[a-zA-Z0-9_-]{1,80}$/u.test(valor);
const textoValido = (valor, maximo) => typeof valor === "string" && valor.trim().length > 0 && valor.length <= maximo;
const centavosValidos = (valor) => Number.isSafeInteger(valor) && valor >= 0 && valor <= MAX_PRECIO_CENTAVOS;
const moneda = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

function exigir(condicion, mensaje) {
  if (!condicion) throw new TypeError(mensaje);
}

function validarOpciones(opciones, tipo) {
  exigir(Array.isArray(opciones) && opciones.length <= 20, `La lista de ${tipo} no es válida.`);
  if (tipo === "menús") exigir(opciones.length > 0, "Cada paquete necesita al menos un menú.");
  const identificadores = new Set();
  return opciones.map((opcion) => {
    exigir(opcion && identificadorValido(opcion.id) && !identificadores.has(opcion.id), `Hay un identificador de ${tipo} inválido o repetido.`);
    exigir(textoValido(opcion.nombre, 100), `El nombre de ${tipo} no es válido.`);
    const clavePrecio = tipo === "menús" ? "extraCentavos" : "precioCentavos";
    exigir(centavosValidos(opcion[clavePrecio]), `El precio de ${tipo} no es válido.`);
    identificadores.add(opcion.id);
    return { id: opcion.id, nombre: opcion.nombre.trim(), [clavePrecio]: opcion[clavePrecio] };
  });
}

/** Comprueba el JSON local antes de utilizar sus datos en la interfaz. */
export function validarProductos(datos) {
  exigir(datos && datos.version === 1 && datos.moneda === "USD" && datos.demostracion === true, "El formato del catálogo de demostración no es válido.");
  exigir(Array.isArray(datos.productos) && datos.productos.length > 0 && datos.productos.length <= 30, "El catálogo debe contener entre 1 y 30 paquetes.");
  const identificadores = new Set();
  return datos.productos.map((producto) => {
    exigir(producto && identificadorValido(producto.id) && !identificadores.has(producto.id), "Hay un identificador de paquete inválido o repetido.");
    exigir(textoValido(producto.nombre, 120) && textoValido(producto.descripcion, 1200), "El nombre o la descripción del paquete no es válido.");
    exigir(typeof producto.imagen === "string" && /^assets\/[a-zA-Z0-9_./-]+\.(?:avif|webp|png|jpe?g|svg)$/iu.test(producto.imagen) && !producto.imagen.includes(".."), "La imagen debe ser un recurso local de assets.");
    exigir(textoValido(producto.imagenAlt, 200) && textoValido(producto.etiqueta, 80), "La imagen o la etiqueta necesitan un texto descriptivo.");
    exigir(centavosValidos(producto.precioCentavos), "El precio del paquete no es válido.");
    exigir(Number.isInteger(producto.minPersonas) && Number.isInteger(producto.maxPersonas) && producto.minPersonas >= 10 && producto.maxPersonas <= 200 && producto.minPersonas <= producto.maxPersonas, "La cantidad de personas debe estar entre 10 y 200.");
    exigir(Array.isArray(producto.incluye) && producto.incluye.length > 0 && producto.incluye.length <= 20 && producto.incluye.every((texto) => textoValido(texto, 300)), "La lista de servicios incluidos no es válida.");
    identificadores.add(producto.id);
    return {
      id: producto.id,
      nombre: producto.nombre.trim(),
      descripcion: producto.descripcion.trim(),
      imagen: producto.imagen,
      imagenAlt: producto.imagenAlt.trim(),
      precioCentavos: producto.precioCentavos,
      minPersonas: producto.minPersonas,
      maxPersonas: producto.maxPersonas,
      incluye: producto.incluye.map((texto) => texto.trim()),
      menus: validarOpciones(producto.menus, "menús"),
      extras: validarOpciones(producto.extras, "extras"),
      etiqueta: producto.etiqueta.trim(),
    };
  });
}

function nuevoId() {
  return globalThis.crypto?.randomUUID?.() ?? `linea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Guarda opciones, nunca precios: los importes proceden del catálogo validado. */
export function crearLinea(producto, opciones, id = nuevoId()) {
  exigir(producto && identificadorValido(producto.id) && opciones && identificadorValido(id), "No se pudo identificar el paquete.");
  exigir(Number.isInteger(opciones.personas) && opciones.personas >= producto.minPersonas && opciones.personas <= producto.maxPersonas && opciones.personas >= 10 && opciones.personas <= 200, `Indica entre ${producto.minPersonas} y ${producto.maxPersonas} personas, sin decimales.`);
  exigir(producto.menus.some((menu) => menu.id === opciones.menuId), "Selecciona un menú disponible.");
  const extrasIds = opciones.extrasIds ?? [];
  exigir(Array.isArray(extrasIds) && extrasIds.length <= producto.extras.length && new Set(extrasIds).size === extrasIds.length && extrasIds.every((idExtra) => producto.extras.some((extra) => extra.id === idExtra)), "Selecciona extras disponibles sin repetirlos.");
  const notas = opciones.notas ?? "";
  exigir(typeof notas === "string" && notas.length <= 180, "Las indicaciones del paquete admiten hasta 180 caracteres.");
  return { id, productoId: producto.id, personas: opciones.personas, menuId: opciones.menuId, extrasIds: [...extrasIds], notas: notas.trim() };
}

/** Recupera únicamente líneas válidas y descarta datos almacenados ajenos al modelo. */
export function normalizarCarrito(datos, productos) {
  const carrito = { version: 1, actualizadoEn: null, lineas: [] };
  if (!datos || datos.version !== 1 || !Array.isArray(datos.lineas) || !Array.isArray(productos)) return carrito;
  if (typeof datos.actualizadoEn === "string" && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?Z$/u.test(datos.actualizadoEn) && fechaValida(datos.actualizadoEn.slice(0, 10))) {
    carrito.actualizadoEn = new Date(datos.actualizadoEn).toISOString();
  }
  const identificadores = new Set();
  for (const linea of datos.lineas.slice(0, 100)) {
    if (carrito.lineas.length === MAX_LINEAS) break;
    if (!linea || !identificadorValido(linea.id) || identificadores.has(linea.id)) continue;
    const producto = productos.find((actual) => actual.id === linea.productoId);
    if (!producto) continue;
    try {
      carrito.lineas.push(crearLinea(producto, linea, linea.id));
      identificadores.add(linea.id);
    } catch {
      // Una línea dañada no impide recuperar las demás.
    }
  }
  return carrito;
}

export function calcularLinea(linea, productos) {
  const producto = productos.find((actual) => actual.id === linea?.productoId);
  exigir(producto, "El paquete ya no está disponible.");
  const opciones = crearLinea(producto, linea, linea.id);
  const menu = producto.menus.find((actual) => actual.id === opciones.menuId);
  const extras = opciones.extrasIds.map((id) => producto.extras.find((actual) => actual.id === id));
  exigir(centavosValidos(producto.precioCentavos) && centavosValidos(menu.extraCentavos) && extras.every((extra) => centavosValidos(extra.precioCentavos)), "El catálogo contiene un precio inválido.");
  const precioPersonaCentavos = producto.precioCentavos + menu.extraCentavos + extras.reduce((suma, extra) => suma + extra.precioCentavos, 0);
  const subtotalCentavos = precioPersonaCentavos * opciones.personas;
  exigir(Number.isSafeInteger(subtotalCentavos), "El importe del paquete supera el límite permitido.");
  return { producto, menu, extras, precioPersonaCentavos, subtotalCentavos };
}

export function calcularTotales(lineas, productos, entrega = "retiro") {
  exigir(Array.isArray(lineas) && lineas.length <= MAX_LINEAS, "El carrito admite hasta 12 paquetes.");
  exigir(entrega === "retiro" || entrega === "domicilio", "Selecciona una forma de entrega válida.");
  const identificadores = new Set();
  const subtotalCentavos = lineas.reduce((suma, linea) => {
    exigir(!identificadores.has(linea.id), "El carrito contiene una línea repetida.");
    identificadores.add(linea.id);
    return suma + calcularLinea(linea, productos).subtotalCentavos;
  }, 0);
  const entregaCentavos = lineas.length > 0 && entrega === "domicilio" ? 800 : 0;
  const totalCentavos = subtotalCentavos + entregaCentavos;
  exigir(Number.isSafeInteger(totalCentavos), "El total supera el límite permitido.");
  return { subtotalCentavos, entregaCentavos, totalCentavos, personas: lineas.reduce((suma, linea) => suma + linea.personas, 0) };
}

export function formatoMoneda(centavos) {
  exigir(Number.isSafeInteger(centavos) && centavos >= 0, "El importe debe expresarse en centavos enteros.");
  return moneda.format(centavos / 100);
}

function fechaLocal() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
}

function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaUTC = new Date(`${fecha}T12:00:00Z`);
  return anio >= 1900 && fechaUTC.getUTCFullYear() === anio && fechaUTC.getUTCMonth() + 1 === mes && fechaUTC.getUTCDate() === dia;
}

/** Los textos de este mapa se relacionan con cada campo mediante aria-describedby. */
export function validarCliente(valores, hoy = fechaLocal()) {
  const errores = {};
  const texto = (clave) => typeof valores?.[clave] === "string" ? valores[clave].trim() : "";
  const nombre = texto("nombre");
  if (nombre.length < 3 || nombre.length > 80 || !/^[\p{L}\p{M}][\p{L}\p{M} '\u2019-]*[\p{L}\p{M}]$/u.test(nombre)) errores.nombre = "Escribe tu nombre: entre 3 y 80 caracteres, sin números.";
  const correo = texto("correo");
  if (correo.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(correo)) errores.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
  const telefono = texto("telefono");
  if (telefono.length > 30 || !/^\+?[\d ()-]+$/u.test(telefono) || !/^\d{9,15}$/u.test(telefono.replace(/\D/gu, ""))) errores.telefono = "Escribe un teléfono de 9 a 15 dígitos; puedes incluir el código de país.";
  const fecha = texto("fecha");
  if (!fechaValida(fecha) || !fechaValida(hoy) || fecha < hoy) errores.fecha = "Elige una fecha válida a partir de hoy.";
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(texto("hora"))) errores.hora = "Elige la hora del evento en formato de 24 horas.";
  const entrega = texto("entrega");
  if (entrega !== "retiro" && entrega !== "domicilio") errores.entrega = "Elige retiro o entrega a domicilio.";
  const direccion = texto("direccion");
  if ((entrega === "domicilio" && direccion.length < 8) || direccion.length > 180) errores.direccion = "Para domicilio, escribe una dirección de entre 8 y 180 caracteres.";
  if (texto("notas").length > 300) errores.notas = "Las indicaciones generales admiten hasta 300 caracteres.";
  return errores;
}
