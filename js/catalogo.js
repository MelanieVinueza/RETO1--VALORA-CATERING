/* Catálogo público del proyecto: Fetch con validación y copia opcional en IndexedDB. */
const URL_CATALOGO = new URL("../data/servicios.json", import.meta.url);
const NOMBRE_DB = "valora-catalogo";
const ALMACEN = "catalogos";
const CLAVE_CACHE = "servicios-v3";
const VIGENCIA_CACHE = 7 * 24 * 60 * 60 * 1000;

export function validarCatalogo(datos) {
  const textoValido = (valor, maximo) =>
    typeof valor === "string" && valor.trim().length > 0 && valor.length <= maximo;
  if (datos?.version !== 3 || !datos.servicios || typeof datos.servicios !== "object" ||
      Array.isArray(datos.servicios)) throw new Error("Catálogo no válido.");
  const entradas = Object.entries(datos.servicios);
  if (!entradas.length || entradas.length > 30) throw new Error("Catálogo no válido.");
  const categorias = ["diario", "eventos", "bienestar", "abastecimiento"];
  const iconos = ["i-plate", "i-cup", "i-leaf", "i-box"];
  const visuales = ["visual-azul", "visual-morado", "visual-dorado", "visual-suave"];
  return Object.fromEntries(entradas.map(([id, servicio]) => {
    if (!/^[a-z]+(?:-[a-z]+)+$/.test(id) || !servicio ||
        !categorias.includes(servicio.categoria) || !iconos.includes(servicio.icono) ||
        !visuales.includes(servicio.estilo) || !textoValido(servicio.etiqueta, 80) ||
        !textoValido(servicio.frase, 120) || !textoValido(servicio.nombre, 140) ||
        !textoValido(servicio.resumen, 300) || !textoValido(servicio.descripcion, 1200) ||
        !Array.isArray(servicio.incluye) || !servicio.incluye.length ||
        servicio.incluye.length > 12 || !servicio.incluye.every(item => textoValido(item, 300))) {
      throw new Error("El catálogo contiene un servicio no válido.");
    }
    return [id, {
      categoria: servicio.categoria,
      etiqueta: servicio.etiqueta,
      frase: servicio.frase,
      icono: servicio.icono,
      estilo: servicio.estilo,
      nombre: servicio.nombre.trim(),
      resumen: servicio.resumen.trim(),
      descripcion: servicio.descripcion.trim(),
      incluye: servicio.incluye.map(item => item.trim()),
    }];
  }));
}

function abrirCache() {
  return new Promise((resolve, reject) => {
    let terminada = false;
    const solicitud = indexedDB.open(NOMBRE_DB, 1);
    const limite = setTimeout(() => finalizar(new Error("Almacenamiento no disponible.")), 1500);
    function finalizar(error, db) {
      if (terminada) { db?.close(); return; }
      terminada = true;
      clearTimeout(limite);
      if (error) reject(error);
      else resolve(db);
    }
    solicitud.onupgradeneeded = () => {
      if (!solicitud.result.objectStoreNames.contains(ALMACEN)) {
        solicitud.result.createObjectStore(ALMACEN);
      }
    };
    solicitud.onsuccess = () => {
      const db = solicitud.result;
      db.onversionchange = () => db.close();
      finalizar(null, db);
    };
    solicitud.onerror = () => finalizar(new Error("No se pudo abrir la copia local."));
    solicitud.onblocked = () => finalizar(new Error("La copia local está ocupada."));
  });
}

async function usarCache(modo, datos) {
  const db = await abrirCache();
  try {
    return await new Promise((resolve, reject) => {
      const transaccion = db.transaction(ALMACEN, modo);
      const almacen = transaccion.objectStore(ALMACEN);
      const solicitud = modo === "readwrite"
        ? almacen.put({ datos, fecha: Date.now() }, CLAVE_CACHE)
        : almacen.get(CLAVE_CACHE);
      const limite = setTimeout(() => {
        try { transaccion.abort(); } catch { /* Puede haber terminado al vencer el plazo. */ }
        reject(new Error("La copia local tardó demasiado."));
      }, 1500);
      // Se confirma al terminar la transacción, no antes de guardar realmente.
      transaccion.oncomplete = () => { clearTimeout(limite); resolve(solicitud.result); };
      transaccion.onabort = transaccion.onerror = () => {
        clearTimeout(limite);
        reject(new Error("No se pudo utilizar la copia local."));
      };
    });
  } finally {
    db.close();
  }
}

export async function cargarCatalogo({ signal } = {}) {
  const controlador = new AbortController();
  const cancelar = () => controlador.abort();
  if (signal?.aborted) throw new DOMException("Carga cancelada.", "AbortError");
  signal?.addEventListener("abort", cancelar, { once: true });
  const limite = setTimeout(cancelar, 8000);
  try {
    const respuesta = await fetch(URL_CATALOGO, {
      signal: controlador.signal,
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    const servicios = validarCatalogo(datos);
    if (signal?.aborted) throw new DOMException("Carga cancelada.", "AbortError");
    // La caché es opcional: una restricción del navegador no bloquea el catálogo.
    void usarCache("readwrite", { version: 3, servicios }).catch(() => {});
    return { servicios, desdeCache: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    try {
      const copia = await usarCache("readonly");
      const antiguedad = Date.now() - copia?.fecha;
      if (Number.isFinite(antiguedad) && antiguedad >= 0 && antiguedad <= VIGENCIA_CACHE) {
        const servicios = validarCatalogo(copia.datos);
        if (!signal?.aborted) return { servicios, desdeCache: true };
      }
    } catch {
      // Sin una copia válida, la interfaz ofrecerá reintentar o contactar.
    }
    throw error;
  } finally {
    clearTimeout(limite);
    signal?.removeEventListener("abort", cancelar);
  }
}
