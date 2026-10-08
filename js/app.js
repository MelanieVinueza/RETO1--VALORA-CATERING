/* Válora · Cada inicializador se ocupa de una parte de la interfaz. */
import {
  fechaLocal,
  obtenerErrorCampo,
  crearResumenSolicitud,
  copiarTexto,
  ErrorPortapapeles,
} from "./solicitud.js";
import { cargarCatalogo } from "./catalogo.js";
import { inicializarBorrador } from "./borrador.js";
import { mostrarServicios } from "./view.js";

function inicializarTema() {
  const root = document.documentElement;
  const themeButton = document.getElementById("tema-toggle");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("valora-theme");
  } catch {
    /* Almacenamiento opcional. */
  }
  if (!["light", "dark"].includes(savedTheme)) savedTheme = null;

  let themeTransitionTimer;
  function applyTheme(theme, animate = false) {
    if (animate) {
      root.classList.add("cambio-tema");
      window.clearTimeout(themeTransitionTimer);
      themeTransitionTimer = window.setTimeout(() => {
        root.classList.remove("cambio-tema");
      }, 980);
    }
    root.dataset.theme = theme;
    if (!themeButton) return;
    const isDark = theme === "dark";
    themeButton.setAttribute("aria-pressed", String(isDark));
    // El nombre permanece estable: aria-pressed comunica si el tema oscuro está activo.
    themeButton.setAttribute("aria-label", "Tema oscuro");
    themeButton
      .querySelector("use")
      .setAttribute("href", isDark ? "#i-sun" : "#i-moon");
  }
  applyTheme(savedTheme || (systemTheme.matches ? "dark" : "light"));
  themeButton?.addEventListener("click", () => {
    savedTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(savedTheme, true);
    try {
      localStorage.setItem("valora-theme", savedTheme);
    } catch {
      /* Mantener tema en memoria. */
    }
  });
  systemTheme.addEventListener("change", (event) => {
    if (!savedTheme) applyTheme(event.matches ? "dark" : "light", true);
  });

}

function actualizarAnio() {
  const year = document.getElementById("copyright-year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
    year.dateTime = year.textContent;
  }

}

function inicializarCabecera() {
  const root = document.documentElement;
  // El espacio reservado al navegar sigue la altura real, incluso al ampliar el texto.
  const header = document.querySelector(".cabecera");
  if (header) {
    const updateHeaderHeight = () => {
      root.style.setProperty(
        "--altura-cabecera",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      );
    };
    updateHeaderHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(updateHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", updateHeaderHeight);
    }
  }

}

function inicializarNavegacion() {
  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("menu-principal");
  if (menuButton && navigation) {
    let lastFocusedElement = document.activeElement;
    function setMenu(open) {
      navigation.classList.toggle("menu-abierto", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute(
        "aria-label",
        open ? "Cerrar menú de navegación" : "Abrir menú de navegación",
      );
    }
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      setMenu(open);
      if (open) navigation.querySelector("a")?.focus();
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuButton.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)
      )
        setMenu(false);
    });
    document.addEventListener("focusin", (event) => {
      lastFocusedElement = event.target;
      if (
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)
      )
        setMenu(false);
    });
    window
      .matchMedia("(min-width: 992px)")
      .addEventListener("change", (event) => {
        // El navegador puede devolver el foco a body al ocultar un control por CSS.
        const focused = document.activeElement === document.body
          ? lastFocusedElement
          : document.activeElement;
        setMenu(false);
        if (!event.matches && navigation.contains(focused)) {
          menuButton.focus({ preventScroll: true });
        } else if (event.matches && focused === menuButton) {
          navigation.querySelector("a")?.focus({ preventScroll: true });
        }
      });

    // Se determina la sección más cercana a la cabecera, sin modificar el historial al desplazar.
    const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sections = [...document.querySelectorAll("main > section[id]")];
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            );
          if (!visible.length) return;
          const currentId = visible[0].target.id;
          sectionLinks.forEach((link) => {
            if (link.hash === `#${currentId}`)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        },
        { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
      );
      sections.forEach((section) => observer.observe(section));
    }
  }

}

function inicializarAnclas() {
  // Anclas nativas conservan historial, enlaces directos y comportamiento sin JavaScript.
  document
    .querySelectorAll('a[href^="#"]:not(.detalle-servicio):not(#cotizar-servicio)')
    .forEach((link) => {
      link.addEventListener("click", () => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;
        if (!target.hasAttribute("tabindex"))
          target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });

}

function inicializarFiltros() {
  const contenedor = document.querySelector(".filtros");
  if (!contenedor) return;
  const filterButtons = [...contenedor.querySelectorAll("[data-filter]")];
  const resultado = document.getElementById("resultado-filtro");
  contenedor.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button || !contenedor.contains(button)) return;
    const category = button.dataset.filter;
    filterButtons.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("activo", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    const serviceCards = [...document.querySelectorAll("#servicios [data-category]")];
    serviceCards.forEach((card) => {
      card.hidden = category !== "todos" && card.dataset.category !== category;
    });
    const count = serviceCards.filter((card) => !card.hidden).length;
    resultado.textContent =
      `${count} ${count === 1 ? "servicio disponible" : "servicios disponibles"}.`;
  });

}

async function inicializarServicios() {
  const tarjetas = document.querySelector(".grid-servicios");
  const estado = document.getElementById("estado-servicios");
  const reintentar = document.getElementById("reintentar-servicios");
  if (!tarjetas || !estado || !reintentar) return;

  async function cargar() {
    tarjetas.setAttribute("aria-busy", "true");
    reintentar.hidden = true;
    estado.textContent = "Cargando soluciones…";
    try {
      const catalogo = await cargarCatalogo();
      mostrarServicios(catalogo.servicios);
      const cantidad = Object.keys(catalogo.servicios).length;
      document.getElementById("cantidad-servicios").textContent = String(cantidad);
      const filtroActivo = document.querySelector(".filtros [data-filter].activo")?.dataset.filter ?? "todos";
      tarjetas.querySelectorAll("[data-category]").forEach((tarjeta) => {
        tarjeta.hidden = filtroActivo !== "todos" && tarjeta.dataset.category !== filtroActivo;
      });
      estado.textContent = catalogo.desdeCache
        ? "Mostramos la última copia guardada de las soluciones."
        : `${cantidad} soluciones para tu empresa.`;
    } catch {
      estado.replaceChildren("No pudimos cargar las soluciones. Puedes reintentar o ");
      const contacto = document.createElement("a");
      contacto.href = "#contacto";
      contacto.textContent = "contactarnos directamente";
      estado.append(contacto, ".");
      reintentar.hidden = false;
    } finally {
      tarjetas.setAttribute("aria-busy", "false");
    }
  }

  reintentar.addEventListener("click", () => { void cargar(); });
  await cargar();
}

function inicializarDialogo() {
  const dialog = document.getElementById("dialogo-servicio");
  const tarjetas = document.querySelector(".grid-servicios");
  if (!dialog || !tarjetas || typeof dialog.showModal !== "function") return;
  const titulo = document.getElementById("dialogo-titulo");
  const descripcion = document.getElementById("dialogo-descripcion");
  const lista = document.getElementById("dialogo-incluye");
  const panel = document.getElementById("contenido-dialogo");
  const estado = document.getElementById("estado-dialogo");
  const cerrar = document.getElementById("cerrar-dialogo");
  const reintentar = document.getElementById("reintentar-catalogo");
  const form = document.getElementById("formulario-cotizacion");
  const prepared = document.getElementById("solicitud-preparada");
  let selectedService = "";
  let dialogOpener = null;
  let catalogoEnMemoria = null;
  let controladorCarga = null;
  let revisionCarga = 0;

  function cancelarCarga() {
    revisionCarga += 1;
    controladorCarga?.abort();
    panel.setAttribute("aria-busy", "false");
  }

  async function mostrarDetalle({ forzarRecarga = false } = {}) {
    cancelarCarga();
    const revisionActual = revisionCarga;
    controladorCarga = new AbortController();
    panel.setAttribute("aria-busy", "true");
    estado.textContent = "Cargando los detalles del servicio…";
    reintentar.setAttribute("aria-disabled", "true");
    descripcion.textContent = "";
    lista.replaceChildren();
    try {
      const catalogo = (!forzarRecarga && catalogoEnMemoria) ||
        await cargarCatalogo({ signal: controladorCarga.signal });
      if (!dialog.open || revisionActual !== revisionCarga) return;
      if (!Object.hasOwn(catalogo.servicios, selectedService)) throw new Error("Servicio no disponible.");
      // La copia de respaldo permite leer; la próxima apertura vuelve a intentar Fetch.
      catalogoEnMemoria = catalogo.desdeCache ? null : catalogo;
      const { nombre, descripcion: detalle, incluye } = catalogo.servicios[selectedService];
      titulo.textContent = nombre;
      descripcion.textContent = detalle;
      const fragmento = document.createDocumentFragment();
      for (const texto of incluye) {
        const item = document.createElement("li");
        item.textContent = texto;
        fragmento.append(item);
      }
      lista.replaceChildren(fragmento);
      estado.textContent = catalogo.desdeCache
        ? "Mostramos la última copia guardada. Confirma el alcance al solicitar tu propuesta."
        : "Detalles del servicio disponibles.";
      if (document.activeElement === reintentar) cerrar.focus();
      reintentar.hidden = true;
    } catch {
      if (!dialog.open || revisionActual !== revisionCarga) return;
      estado.textContent = "No pudimos cargar los detalles. Puedes reintentar o continuar con tu solicitud usando el botón de abajo.";
      reintentar.hidden = false;
    } finally {
      if (revisionActual === revisionCarga) {
        panel.setAttribute("aria-busy", "false");
        reintentar.removeAttribute("aria-disabled");
      }
    }
  }

  // Las tarjetas conservan sus enlaces de contacto sin JavaScript.
  for (const link of tarjetas.querySelectorAll(".detalle-servicio")) {
    const nombre = link.closest("article").querySelector("h3").textContent;
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", `Conocer el servicio: ${nombre}`);
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", dialog.id);
  }
  tarjetas.addEventListener("keydown", (event) => {
    if (event.key === " " && event.target.closest(".detalle-servicio")) event.preventDefault();
  });
  tarjetas.addEventListener("keyup", (event) => {
    const link = event.target.closest(".detalle-servicio");
    if (event.key === " " && link) { event.preventDefault(); link.click(); }
  });
  tarjetas.addEventListener("click", (event) => {
    const link = event.target.closest(".detalle-servicio");
    if (!link || !tarjetas.contains(link)) return;
    event.preventDefault();
    selectedService = link.dataset.service;
    dialogOpener = link;
    titulo.textContent = link.closest("article").querySelector("h3").textContent;
    reintentar.hidden = true;
    dialog.showModal();
    void mostrarDetalle();
  });
  reintentar.addEventListener("click", () => {
    if (reintentar.getAttribute("aria-disabled") !== "true") {
      void mostrarDetalle({ forzarRecarga: true });
    }
  });
  cerrar.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    cancelarCarga();
    dialogOpener?.focus({ preventScroll: true });
  });
  document.getElementById("cotizar-servicio").addEventListener("click", () => {
    dialogOpener = null;
    cancelarCarga();
    dialog.close();
    if (!form) return;
    form.hidden = false;
    prepared.hidden = true;
    const serviceField = document.getElementById("servicio");
    serviceField.value = selectedService;
    serviceField.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("nombre").focus();
  });
}


function inicializarFormulario() {
  const form = document.getElementById("formulario-cotizacion");
  if (!form) return;
  const prepared = document.getElementById("solicitud-preparada");
  const fields = [...form.querySelectorAll("input[name], select[name], textarea[name]")];
  const conjuntoCampos = new Set(fields);
  const mensajesError = new Map(fields.map(field => [field, document.getElementById(`error-${field.id}`)]));
  const errorSummary = document.getElementById("resumen-errores");
  const status = document.getElementById("estado-formulario");
  const dateField = document.getElementById("fecha");
  const messageField = document.getElementById("mensaje");
  const contadorMensaje = document.getElementById("contador-mensaje");
  const estadoValidacion = document.getElementById("estado-validacion");
  let preparedMessage = "";
  let submitted = false;
  let revisionSolicitud = 0;

  dateField.min = fechaLocal();
  dateField.addEventListener("focus", () => {
    dateField.min = fechaLocal();
  });

  function validateField(field, anunciar = false) {
    const error = obtenerErrorCampo(field);
    const errorElement = mensajesError.get(field);
    const anterior = errorElement.textContent;
    if (anterior !== error) errorElement.textContent = error;
    errorElement.hidden = !error;
    field.setCustomValidity(error);
    field.classList.toggle("campo-invalido", Boolean(error));
    field.setAttribute("aria-invalid", String(Boolean(error)));
    if (anunciar && anterior !== error) {
      const etiqueta = field.labels[0].textContent.replace("*", "").trim();
      estadoValidacion.textContent = `${etiqueta}: ${error || "dato corregido."}`;
    }
    return !error;
  }

  function refreshErrorSummary() {
    const invalid = fields.filter((field) => field.getAttribute("aria-invalid") === "true");
    errorSummary.hidden = invalid.length === 0;
    const mensaje = invalid.length
      ? `Revisa ${invalid.length === 1 ? "el campo indicado" : `los ${invalid.length} campos indicados`} antes de continuar.`
      : "";
    if (errorSummary.textContent !== mensaje) errorSummary.textContent = mensaje;
  }
  form.addEventListener("focusout", (event) => {
    if (!conjuntoCampos.has(event.target)) return;
    // Un error nuevo puede desplazar un botón entre mousedown y click.
    // Al pasar a una acción, se mantiene estable; submit validará todos los campos.
    if (event.relatedTarget?.closest('button, a, input[type="checkbox"]')) return;
    validateField(event.target, true);
    if (submitted) refreshErrorSummary();
  });
  function actualizarCampo(event) {
    const field = event.target;
    if (!conjuntoCampos.has(field)) return;
    if (field.getAttribute("aria-invalid") === "true" || submitted) validateField(field, true);
    if (submitted) refreshErrorSummary();
    if (field === messageField) actualizarContadorMensaje();
  }
  form.addEventListener("input", actualizarCampo);
  form.addEventListener("change", actualizarCampo);
  function actualizarContadorMensaje() {
    contadorMensaje.textContent =
      `${messageField.value.length} / ${messageField.maxLength}`;
  }
  inicializarBorrador(form, fields, actualizarContadorMensaje);
  actualizarContadorMensaje();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // La página puede permanecer abierta durante un cambio de día.
    dateField.min = fechaLocal();
    estadoValidacion.textContent = "";
    submitted = true;
    const invalid = fields.filter((field) => !validateField(field));
    refreshErrorSummary();
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const values = Object.fromEntries(
      fields.map((field) => [field.name, field.value.trim()]),
    );
    const serviceLabel =
      document.getElementById("servicio").selectedOptions[0].textContent.trim();
    preparedMessage = crearResumenSolicitud(values, serviceLabel);
    revisionSolicitud += 1;
    // textContent evita interpretar como HTML los datos del visitante.
    document.getElementById("resumen-solicitud").textContent = preparedMessage;
    document.getElementById("enviar-whatsapp").href =
      `https://wa.me/593995883856?text=${encodeURIComponent(preparedMessage)}`;
    document.getElementById("enviar-correo").href =
      `mailto:valoragrup@gmail.com?subject=${encodeURIComponent(`Cotización Válora · ${values.empresa}`)}&body=${encodeURIComponent(preparedMessage)}`;
    status.textContent = "";
    form.hidden = true;
    prepared.hidden = false;
    document.getElementById("titulo-solicitud").focus();
  });

  document.getElementById("editar-solicitud").addEventListener("click", () => {
    revisionSolicitud += 1;
    status.textContent = "";
    prepared.hidden = true;
    form.hidden = false;
    document.getElementById("nombre").focus();
  });
  document
    .getElementById("copiar-solicitud")
    .addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (button.getAttribute("aria-disabled") === "true") return;
      const revisionAlCopiar = revisionSolicitud;
      // aria-disabled conserva el foco; la condición anterior evita copias duplicadas.
      button.setAttribute("aria-disabled", "true");
      button.setAttribute("aria-busy", "true");
      button.textContent = "Copiando…";
      status.textContent = "Copiando el resumen…";
      try {
        await copiarTexto(preparedMessage);
        if (revisionSolicitud !== revisionAlCopiar || prepared.hidden) return;
        status.textContent =
          "Resumen copiado. Puedes pegarlo en el canal que prefieras.";
      } catch (error) {
        if (revisionSolicitud !== revisionAlCopiar || prepared.hidden) return;
        const resumen = document.getElementById("resumen-solicitud");
        const selection = window.getSelection();
        resumen.focus();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(resumen);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        const motivo = error instanceof ErrorPortapapeles && error.motivo === "permiso-denegado"
          ? "El navegador no permitió la copia automática."
          : "La copia automática no está disponible.";
        status.textContent = `${motivo} ${selection ? "Seleccionamos el resumen." : "Selecciona el texto del resumen."} Usa Copiar en tu dispositivo o Ctrl+C (⌘C en Mac).`;
      } finally {
        button.removeAttribute("aria-disabled");
        button.removeAttribute("aria-busy");
        button.textContent = "Copiar resumen";
      }
    });
  form.noValidate = true;
}

inicializarTema();
actualizarAnio();
inicializarCabecera();
inicializarNavegacion();
inicializarAnclas();
inicializarFiltros();
inicializarDialogo();
void inicializarServicios();
inicializarFormulario();
document.documentElement.classList.add("js");
// La tienda es independiente: un fallo de su módulo conserva el sitio y sus contactos.
if (document.getElementById("catalogo-productos")) {
  void import("./tienda.js").then(({ inicializarTienda }) => inicializarTienda()).catch(() => {
    document.getElementById("estado-catalogo").textContent =
      "No pudimos iniciar los paquetes. Recarga la página o utiliza los canales de contacto.";
  });
}
