/* Controlador: conecta el catálogo, el modelo del carrito y la vista. */
import { crearLinea, calcularLinea, calcularTotales, formatoMoneda, validarCliente, normalizarCarrito } from "./cart.js";
import { cargarProductos, leerCarrito, guardarCarrito, vaciarCarritoGuardado, leerPreferenciaEntrega, guardarPreferenciaEntrega } from "./repo.js";
import { mostrarProductos, mostrarConfiguracion, mostrarCarrito, mostrarTotales, actualizarLineaCarrito, mostrarActualizacion } from "./view.js";
import { inicializarBorrador } from "./borrador.js";
import { fechaLocal } from "./solicitud.js";

export function inicializarTienda() {
  const buscar = id => document.getElementById(id);
  const catalogo = buscar("catalogo-productos");
  if (!catalogo) return;
  const dialogo = buscar("configurar-paquete");
  const configuracion = buscar("formulario-paquete");
  const lineas = buscar("lineas-carrito");
  const formulario = buscar("datos-pedido");
  const campos = [...formulario.querySelectorAll("[name]")];
  const entrega = buscar("pedido-entrega");
  const fecha = buscar("pedido-fecha");
  const contenido = buscar("carrito-contenido");
  const vacio = buscar("carrito-vacio");
  const comprobante = buscar("comprobante-pedido");
  const reintentar = buscar("reintentar-productos");
  const aviso = buscar("aviso-almacenamiento");
  let productos = [];
  let carrito = { version: 1, actualizadoEn: null, lineas: [] };
  let cargando = false;
  let productoActual = null;
  let editando = null;
  let origenFoco = null;
  let intentoCompra = false;
  let finalizandoCompra = false;

  function enfocar(elemento) {
    if (!elemento) return;
    if (!elemento.matches("button, input, select, textarea, a[href], [tabindex]")) elemento.tabIndex = -1;
    elemento.focus();
  }
  function anunciar(mensaje) { buscar("estado-carrito").textContent = mensaje; }
  function avisarAlmacenamiento(mensaje) {
    aviso.hidden = !mensaje;
    aviso.textContent = mensaje;
  }
  function invalidarComprobante() {
    comprobante.hidden = true;
  }
  function actualizarVisibilidad() {
    vacio.hidden = carrito.lineas.length > 0 || !comprobante.hidden;
    contenido.hidden = carrito.lineas.length === 0 || !comprobante.hidden;
  }
  function guardarCambio(mensaje, reconstruir = true) {
    invalidarComprobante();
    carrito.actualizadoEn = new Date().toISOString();
    const guardado = guardarCarrito(carrito);
    avisarAlmacenamiento(guardado ? "" : "El navegador no pudo guardar este cambio. Tu pedido sigue disponible aquí, pero puede perderse al recargar. Si había un carrito anterior, puede seguir guardado en este dispositivo.");
    if (reconstruir) mostrarCarrito(carrito, productos, entrega.value);
    else {
      mostrarTotales(carrito.lineas, productos, entrega.value);
      mostrarActualizacion(carrito);
    }
    actualizarVisibilidad();
    buscar("confirmar-vaciado").hidden = true;
    anunciar(mensaje);
  }
  function actualizarEntrega() {
    const domicilio = entrega.value === "domicilio";
    buscar("campo-direccion").hidden = !domicilio;
    buscar("pedido-direccion").required = domicilio;
    buscar("pedido-direccion").disabled = !domicilio;
    if (productos.length) mostrarTotales(carrito.lineas, productos, entrega.value);
  }

  entrega.value = leerPreferenciaEntrega();
  fecha.min = fechaLocal();
  actualizarEntrega();
  inicializarBorrador(formulario, campos, actualizarEntrega, {
    clave: "valora-pedido-v1", recordarId: "recordar-pedido",
    borrarId: "borrar-pedido", estadoId: "estado-borrador-pedido",
  });
  // Un valor de select almacenado que ya no exista no debe bloquear los cálculos.
  if (!["retiro", "domicilio"].includes(entrega.value)) entrega.value = leerPreferenciaEntrega();
  actualizarEntrega();
  fecha.addEventListener("focus", () => { fecha.min = fechaLocal(); });

  async function cargar() {
    if (cargando) return;
    cargando = true;
    catalogo.setAttribute("aria-busy", "true");
    reintentar.setAttribute("aria-disabled", "true");
    buscar("estado-catalogo").textContent = "Estamos preparando tus opciones de catering…";
    if (!productos.length) vacio.querySelector("h3").textContent = "Tu carrito estará disponible al cargar los paquetes.";
    try {
      const resultado = await cargarProductos();
      const habiaProductos = productos.length > 0;
      productos = resultado.productos;
      // Un reintento no debe sustituir cambios en memoria que no pudieron guardarse.
      const recuperado = habiaProductos
        ? { carrito: normalizarCarrito(carrito, productos), aviso: aviso.hidden ? "" : aviso.textContent }
        : leerCarrito(productos);
      if (habiaProductos && recuperado.carrito.lineas.length < carrito.lineas.length) {
        recuperado.aviso += " Algunos paquetes ya no estaban disponibles y se quitaron. Revisa el carrito actualizado.";
      }
      carrito = recuperado.carrito;
      mostrarProductos(productos);
      mostrarCarrito(carrito, productos, entrega.value);
      invalidarComprobante();
      actualizarVisibilidad();
      vacio.querySelector("h3").textContent = "Todavía no hay paquetes en tu carrito.";
      avisarAlmacenamiento(recuperado.aviso);
      buscar("estado-catalogo").textContent = resultado.desdeCache
        ? "Mostramos la última copia guardada de los paquetes. Puedes reintentar la carga; confirma precios y disponibilidad con Válora."
        : `${productos.length} paquetes para personalizar a tu gusto.`;
      if (!resultado.desdeCache && document.activeElement === reintentar) enfocar(buscar("titulo-paquetes"));
      reintentar.hidden = !resultado.desdeCache;
      if (carrito.lineas.length) anunciar(`Recuperamos ${carrito.lineas.length} ${carrito.lineas.length === 1 ? "paquete" : "paquetes"}. Revisa las opciones y los precios actuales antes de continuar.`);
    } catch {
      buscar("estado-catalogo").textContent = "No pudimos cargar los paquetes. Reintenta la carga o consulta con nosotros en la sección de contacto. Tu carrito guardado no se ha borrado.";
      reintentar.hidden = false;
    } finally {
      cargando = false;
      catalogo.setAttribute("aria-busy", "false");
      reintentar.removeAttribute("aria-disabled");
    }
  }
  reintentar.addEventListener("click", () => { void cargar(); });

  function opcionesConfiguracion() {
    return {
      personas: Number(buscar("paquete-personas").value),
      menuId: buscar("paquete-menu").value,
      extrasIds: [...buscar("opciones-extras").querySelectorAll("input:checked")].map(campo => campo.value),
      notas: buscar("paquete-notas").value,
    };
  }
  function calcularConfiguracion() {
    try {
      const linea = crearLinea(productoActual, opcionesConfiguracion(), editando ?? "vista-previa");
      buscar("precio-configuracion").textContent = formatoMoneda(calcularLinea(linea, productos).subtotalCentavos);
      buscar("error-configuracion").hidden = true;
      for (const campo of configuracion.querySelectorAll("[aria-invalid]")) campo.removeAttribute("aria-invalid");
      return linea;
    } catch {
      buscar("precio-configuracion").textContent = "Revisa las opciones";
      return null;
    }
  }
  function abrirConfiguracion(producto, boton, linea = null) {
    if (!producto) return;
    if (typeof dialogo.showModal !== "function") {
      anunciar("Tu navegador no permite abrir la configuración. Puedes usar el formulario de contacto para solicitar tu paquete.");
      enfocar(buscar("titulo-carrito"));
      return;
    }
    productoActual = producto;
    editando = linea?.id ?? null;
    origenFoco = boton;
    mostrarConfiguracion(producto, linea);
    calcularConfiguracion();
    dialogo.showModal();
    buscar("paquete-personas").focus();
  }
  catalogo.addEventListener("click", event => {
    const boton = event.target.closest("button[data-producto]");
    if (boton && catalogo.contains(boton)) abrirConfiguracion(productos.find(producto => producto.id === boton.dataset.producto), boton);
  });
  buscar("cerrar-configuracion").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("close", () => {
    if (origenFoco?.isConnected) origenFoco.focus({ preventScroll: true });
    else enfocar(buscar("titulo-carrito"));
  });
  dialogo.addEventListener("click", event => {
    if (event.target !== dialogo) return;
    const limites = dialogo.getBoundingClientRect();
    if (event.clientX < limites.left || event.clientX > limites.right || event.clientY < limites.top || event.clientY > limites.bottom) dialogo.close();
  });
  configuracion.addEventListener("input", calcularConfiguracion);
  configuracion.addEventListener("change", calcularConfiguracion);
  configuracion.noValidate = true;
  configuracion.addEventListener("submit", event => {
    event.preventDefault();
    try {
      if (!editando && carrito.lineas.length >= 12) throw new Error("Puedes combinar hasta 12 paquetes. Edita uno existente o quítalo antes de agregar otro.");
      if (editando && !carrito.lineas.some(linea => linea.id === editando)) throw new Error("Este paquete cambió en otra pestaña. Cierra la configuración y revisa el carrito.");
      const linea = crearLinea(productoActual, opcionesConfiguracion(), editando ?? undefined);
      carrito.lineas = editando ? carrito.lineas.map(actual => actual.id === editando ? linea : actual) : [...carrito.lineas, linea];
      guardarCambio(`${productoActual.nombre}: ${linea.personas} personas. ${editando ? "Cambios guardados." : "Paquete agregado al carrito."}`);
      if (editando) origenFoco = lineas.querySelector(`[data-linea="${linea.id}"] [data-accion="editar"]`);
      dialogo.close();
    } catch (error) {
      buscar("error-configuracion").textContent = error.message;
      buscar("error-configuracion").hidden = false;
      const cantidad = buscar("paquete-personas");
      if (!cantidad.validity.valid || !Number.isInteger(Number(cantidad.value))) cantidad.setAttribute("aria-invalid", "true");
      cantidad.focus();
    }
  });

  function actualizarPersonas(id, valor, accion = null) {
    const linea = carrito.lineas.find(actual => actual.id === id);
    if (!linea) return;
    const producto = productos.find(actual => actual.id === linea.productoId);
    const fila = lineas.querySelector(`[data-linea="${id}"]`);
    try {
      const actualizada = crearLinea(producto, { ...linea, personas: valor }, id);
      carrito.lineas = carrito.lineas.map(actual => actual.id === id ? actualizada : actual);
      guardarCambio(`${producto.nombre}: cantidad actualizada a ${valor} personas.`, false);
      actualizarLineaCarrito(actualizada, productos);
      if (accion) fila.querySelector(`[data-accion="${accion}"]`).focus({ preventScroll: true });
    } catch (error) {
      const campo = fila.querySelector("input");
      const mensaje = fila.querySelector(".linea-error");
      campo.setAttribute("aria-invalid", "true");
      mensaje.textContent = `${error.message} El total conserva la última cantidad válida (${linea.personas}).`;
      mensaje.hidden = false;
      anunciar(mensaje.textContent);
    }
  }
  lineas.addEventListener("change", event => {
    if (event.target.matches("input.cantidad-personas")) actualizarPersonas(event.target.closest("[data-linea]").dataset.linea, Number(event.target.value));
  });
  lineas.addEventListener("click", event => {
    const boton = event.target.closest("button[data-accion]");
    if (!boton || !lineas.contains(boton) || boton.getAttribute("aria-disabled") === "true") return;
    const id = boton.closest("[data-linea]").dataset.linea;
    const linea = carrito.lineas.find(actual => actual.id === id);
    if (!linea) return;
    const producto = productos.find(actual => actual.id === linea.productoId);
    switch (boton.dataset.accion) {
      case "mas": actualizarPersonas(id, linea.personas + 1, "mas"); break;
      case "menos": actualizarPersonas(id, linea.personas - 1, "menos"); break;
      case "editar": abrirConfiguracion(producto, boton, linea); break;
      case "eliminar": {
        const indice = carrito.lineas.indexOf(linea);
        carrito.lineas = carrito.lineas.filter(actual => actual.id !== id);
        guardarCambio(`${producto.nombre} se quitó del carrito.`);
        const siguiente = lineas.children[Math.min(indice, lineas.children.length - 1)];
        enfocar(siguiente?.querySelector('[data-accion="eliminar"]') ?? buscar("titulo-carrito"));
        break;
      }
    }
  });
  buscar("vaciar-carrito").addEventListener("click", () => {
    buscar("confirmar-vaciado").hidden = false;
    buscar("cancelar-vaciado").focus();
  });
  buscar("cancelar-vaciado").addEventListener("click", () => {
    buscar("confirmar-vaciado").hidden = true;
    buscar("vaciar-carrito").focus();
  });
  buscar("confirmar-vaciar").addEventListener("click", () => {
    carrito.lineas = [];
    guardarCambio("Carrito vacío. Los datos que estás editando del evento se conservan.");
    enfocar(buscar("titulo-carrito"));
  });

  function leerCliente() {
    const datos = Object.fromEntries(campos.map(campo => [campo.name, campo.value.trim()]));
    if (datos.entrega === "retiro") datos.direccion = "";
    return datos;
  }
  function erroresCliente() {
    const datos = leerCliente();
    const errores = validarCliente(datos);
    if (!errores.fecha && !errores.hora && new Date(`${datos.fecha}T${datos.hora}`).getTime() <= Date.now()) errores.hora = "Elige una hora futura para tu evento.";
    return errores;
  }
  function validarCampo(campo, errores, anunciarCambio = false) {
    const error = errores[campo.name] || "";
    const mensaje = buscar(`error-${campo.id}`);
    const anterior = mensaje.textContent;
    mensaje.textContent = error;
    mensaje.hidden = !error;
    campo.setAttribute("aria-invalid", String(Boolean(error)));
    campo.setCustomValidity(error);
    if (anunciarCambio && anterior !== error) buscar("estado-validacion-pedido").textContent = `${campo.labels[0].textContent.replace("*", "").trim()}: ${error || "dato corregido."}`;
  }
  function resumenErrores(errores) {
    const cantidad = Object.keys(errores).length;
    buscar("errores-pedido").hidden = cantidad === 0;
    buscar("errores-pedido").textContent = cantidad ? `Revisa ${cantidad === 1 ? "el campo indicado" : `los ${cantidad} campos indicados`} antes de continuar.` : "";
  }
  function actualizarValidacion(event) {
    const campo = event.target;
    if (!campos.includes(campo)) return;
    if (campo === entrega) {
      actualizarEntrega();
      if (!guardarPreferenciaEntrega(entrega.value)) avisarAlmacenamiento("La preferencia de entrega se aplicó, pero el navegador no permitió recordarla con una cookie.");
      if (carrito.lineas.length) {
        carrito.actualizadoEn = new Date().toISOString();
        mostrarActualizacion(carrito);
        if (!guardarCarrito(carrito)) avisarAlmacenamiento("Tu pedido sigue en esta página, pero el navegador no pudo guardar la última actualización.");
      }
    }
    const errores = erroresCliente();
    if (intentoCompra || campo.getAttribute("aria-invalid") === "true") validarCampo(campo, errores, true);
    if (campo === fecha || campo === entrega) {
      for (const otro of [buscar("pedido-hora"), buscar("pedido-direccion")]) {
        if (intentoCompra || otro.getAttribute("aria-invalid") === "true") validarCampo(otro, errores, true);
      }
    }
    if (intentoCompra) resumenErrores(errores);
  }
  formulario.addEventListener("input", actualizarValidacion);
  formulario.addEventListener("change", actualizarValidacion);
  formulario.addEventListener("focusout", event => {
    if (!campos.includes(event.target) || event.relatedTarget?.closest('button, a, input[type="checkbox"]')) return;
    const errores = erroresCliente();
    validarCampo(event.target, errores, true);
    if (intentoCompra) resumenErrores(errores);
  });
  formulario.noValidate = true;
  function limpiarDatosPedido() {
    // Usa el controlador del borrador para cancelar también sus escrituras pendientes.
    const recordar = buscar("recordar-pedido");
    recordar.checked = false;
    recordar.dispatchEvent(new Event("change"));
    const borradorPendiente = !buscar("borrar-pedido").disabled;
    formulario.reset();
    entrega.value = leerPreferenciaEntrega();
    for (const campo of campos) {
      campo.removeAttribute("aria-invalid");
      campo.setCustomValidity("");
      const error = buscar(`error-${campo.id}`);
      error.textContent = "";
      error.hidden = true;
    }
    intentoCompra = false;
    resumenErrores({});
    buscar("estado-validacion-pedido").textContent = "";
    actualizarEntrega();
    return borradorPendiente;
  }
  formulario.addEventListener("submit", event => {
    event.preventDefault();
    if (finalizandoCompra || !comprobante.hidden) return;
    intentoCompra = true;
    fecha.min = fechaLocal();
    const errores = erroresCliente();
    for (const campo of campos) validarCampo(campo, errores);
    resumenErrores(errores);
    const invalido = campos.find(campo => errores[campo.name]);
    if (invalido) { invalido.focus(); return; }
    const cantidadInvalida = lineas.querySelector('[aria-invalid="true"]');
    if (cantidadInvalida) {
      anunciar("Corrige la cantidad del paquete indicada antes de finalizar la compra.");
      cantidadInvalida.focus();
      return;
    }
    if (!carrito.lineas.length) { anunciar("Agrega al menos un paquete antes de continuar."); enfocar(buscar("titulo-carrito")); return; }
    finalizandoCompra = true;
    buscar("finalizar-compra").disabled = true;
    try {
      // Valida de nuevo cantidades, opciones y precios antes de modificar el carrito.
      calcularTotales(carrito.lineas, productos, entrega.value);
      const carritoVacio = { version: 1, actualizadoEn: new Date().toISOString(), lineas: [] };
      const resultado = vaciarCarritoGuardado(carritoVacio);
      if (!resultado.completado) {
        avisarAlmacenamiento(resultado.aviso);
        enfocar(aviso);
        return;
      }
      carrito = carritoVacio;
      const borradorPendiente = limpiarDatosPedido();
      mostrarCarrito(carrito, productos, entrega.value);
      buscar("confirmar-vaciado").hidden = true;
      avisarAlmacenamiento([resultado.aviso, borradorPendiente ? "El navegador no permitió borrar el borrador del evento. Puedes eliminarlo desde los datos del sitio en tu navegador." : ""].filter(Boolean).join(" "));
      contenido.hidden = true;
      vacio.hidden = true;
      comprobante.hidden = false;
      anunciar("");
      enfocar(buscar("titulo-comprobante"));
    } catch {
      anunciar("No pudimos completar tu compra. Revisa tus paquetes y vuelve a intentar.");
      enfocar(buscar("titulo-carrito"));
    } finally {
      finalizandoCompra = false;
      buscar("finalizar-compra").disabled = false;
    }
  });
  buscar("seguir-comprando").addEventListener("click", () => {
    invalidarComprobante();
    actualizarVisibilidad();
    enfocar(buscar("titulo-paquetes"));
  });
  window.addEventListener("storage", event => {
    if (!productos.length || (event.key !== "valora-carrito-v1" && event.key !== null)) return;
    const moverFoco = contenido.contains(document.activeElement) || comprobante.contains(document.activeElement);
    const recuperado = leerCarrito(productos);
    carrito = recuperado.carrito;
    invalidarComprobante();
    mostrarCarrito(carrito, productos, entrega.value);
    actualizarVisibilidad();
    avisarAlmacenamiento(recuperado.aviso);
    anunciar("El carrito cambió en otra pestaña. Revisa el pedido actualizado.");
    if (moverFoco) enfocar(buscar("titulo-carrito"));
  });
  void cargar();
}
