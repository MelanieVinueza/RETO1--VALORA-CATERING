/* Acceso a datos públicos y preferencias. No guarda datos de pago ni envía pedidos. */
import { normalizarCarrito, validarProductos } from "./cart.js";

const URL_PRODUCTOS = new URL("../data/productos.json", import.meta.url);
const CLAVE_CARRITO = "valora-carrito-v1";
const NOMBRE_DB = "valora-tienda";
const ALMACEN = "catalogos";
const CLAVE_CATALOGO = "productos";
const VIGENCIA_CACHE = 7 * 24 * 60 * 60 * 1000;
const LIMITE_CARGA = 8000;
const LIMITE_ALMACENAMIENTO = 1500;
// Acota el trabajo al leer datos que alguien puede modificar desde el navegador.
const MAXIMO_CARRITO_GUARDADO = 100000;
// Recuerda si hay datos anteriores que no deben reaparecer tras finalizar.
let hayCarritoGuardado = false;

function errorCancelacion() {
  return new DOMException("Carga cancelada.", "AbortError");
}

function abrirCache() {
  return new Promise((resolve, reject) => {
    let terminada = false;
    const solicitud = globalThis.indexedDB.open(NOMBRE_DB, 1);
    const limite = setTimeout(() => terminar(new Error("La copia local tardó demasiado.")), LIMITE_ALMACENAMIENTO);
    function terminar(error, db) {
      if (terminada) {
        db?.close();
        return;
      }
      terminada = true;
      clearTimeout(limite);
      if (error) reject(error);
      else resolve(db);
    }
    solicitud.onupgradeneeded = () => {
      try {
        if (!solicitud.result.objectStoreNames.contains(ALMACEN)) {
          solicitud.result.createObjectStore(ALMACEN);
        }
      } catch {
        try { solicitud.transaction?.abort(); } catch { /* El navegador puede haber abortado ya. */ }
        terminar(new Error("No se pudo crear la copia del catálogo."));
      }
    };
    solicitud.onsuccess = () => {
      const db = solicitud.result;
      db.onversionchange = () => db.close();
      terminar(null, db);
    };
    solicitud.onerror = () => terminar(new Error("No se pudo abrir la copia del catálogo."));
    solicitud.onblocked = () => terminar(new Error("La copia del catálogo está ocupada."));
  });
}

async function usarCache(modo, datos) {
  const db = await abrirCache();
  try {
    return await new Promise((resolve, reject) => {
      // La transacción empieza después de disponer de los datos, sin un fetch pendiente.
      const transaccion = db.transaction(ALMACEN, modo);
      const almacen = transaccion.objectStore(ALMACEN);
      const solicitud = modo === "readwrite"
        ? almacen.put(datos, CLAVE_CATALOGO)
        : almacen.get(CLAVE_CATALOGO);
      const limite = setTimeout(() => {
        try { transaccion.abort(); } catch { /* Puede haber terminado entre ambos eventos. */ }
        reject(new Error("La copia del catálogo tardó demasiado."));
      }, LIMITE_ALMACENAMIENTO);
      // Solo oncomplete confirma que IndexedDB realmente terminó la escritura.
      transaccion.oncomplete = () => {
        clearTimeout(limite);
        resolve(solicitud.result);
      };
      transaccion.onabort = transaccion.onerror = () => {
        clearTimeout(limite);
        reject(new Error("No se pudo utilizar la copia del catálogo."));
      };
    });
  } finally {
    db.close();
  }
}

export async function cargarProductos({ signal } = {}) {
  if (signal?.aborted) throw errorCancelacion();
  const controlador = new AbortController();
  const cancelar = () => controlador.abort();
  signal?.addEventListener("abort", cancelar, { once: true });
  const limite = setTimeout(cancelar, LIMITE_CARGA);
  try {
    const respuesta = await fetch(URL_PRODUCTOS, {
      signal: controlador.signal,
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    if (!respuesta.ok) throw new Error(`No se pudo cargar el catálogo (HTTP ${respuesta.status}).`);
    const datos = await respuesta.json();
    const productos = validarProductos(datos);
    if (signal?.aborted) throw errorCancelacion();
    const actualizadoEn = new Date().toISOString();
    // IndexedDB es una mejora opcional: si está bloqueado, la carga sigue funcionando.
    void usarCache("readwrite", { datos, actualizadoEn }).catch(() => {});
    return { productos, desdeCache: false, actualizadoEn };
  } catch (error) {
    if (signal?.aborted) throw errorCancelacion();
    try {
      const copia = await usarCache("readonly");
      const fecha = typeof copia?.actualizadoEn === "string" ? Date.parse(copia.actualizadoEn) : NaN;
      const antiguedad = Date.now() - fecha;
      if (Number.isFinite(antiguedad) && antiguedad >= 0 && antiguedad <= VIGENCIA_CACHE) {
        const productos = validarProductos(copia.datos);
        if (signal?.aborted) throw errorCancelacion();
        return { productos, desdeCache: true, actualizadoEn: new Date(fecha).toISOString() };
      }
    } catch {
      // La interfaz mostrará el fallo original y ofrecerá reintentar, sin catálogo ficticio.
    }
    if (signal?.aborted) throw errorCancelacion();
    throw error;
  } finally {
    clearTimeout(limite);
    signal?.removeEventListener("abort", cancelar);
  }
}

export function leerCarrito(productos) {
  const vacio = () => normalizarCarrito(null, productos);
  let guardado;
  try {
    guardado = globalThis.localStorage.getItem(CLAVE_CARRITO);
    hayCarritoGuardado = Boolean(guardado);
  } catch {
    return { carrito: vacio(), aviso: "El navegador no permite leer el carrito guardado. Puedes seguir preparando el pedido en esta sesión, pero los cambios podrían perderse al recargar." };
  }
  if (!guardado) return { carrito: vacio(), aviso: "" };
  try {
    if (guardado.length > MAXIMO_CARRITO_GUARDADO) throw new Error("Carrito demasiado grande.");
    const datos = JSON.parse(guardado);
    if (datos?.version !== 1 || !Array.isArray(datos.lineas)) throw new Error("Formato de carrito no válido.");
    const carrito = normalizarCarrito(datos, productos);
    const descartadas = Math.max(0, datos.lineas.length - carrito.lineas.length);
    const ajustadas = !descartadas && datos.lineas.some((linea, indice) => {
      const recuperada = carrito.lineas[indice];
      return ["id", "productoId", "personas", "menuId", "notas"].some(clave => linea[clave] !== recuperada[clave]) ||
        JSON.stringify(linea.extrasIds) !== JSON.stringify(recuperada.extrasIds);
    });
    const aviso = descartadas
      ? "Recuperamos el carrito, pero descartamos paquetes que ya no eran válidos. Revisa sus opciones y el total antes de continuar."
      : ajustadas
        ? "Recuperamos el carrito y ajustamos los datos guardados a su formato válido. Revisa las opciones antes de continuar."
      : "";
    return { carrito, aviso };
  } catch {
    // No se toca el almacenamiento: un fallo al leer no se presenta como un borrado exitoso.
    return { carrito: vacio(), aviso: "El carrito guardado no tenía un formato válido. Se muestra uno vacío; agrega de nuevo los paquetes que necesitas." };
  }
}

export function guardarCarrito(carrito) {
  try {
    if (carrito?.version !== 1 || !Array.isArray(carrito.lineas)) return false;
    const datos = JSON.stringify(carrito);
    if (datos.length > MAXIMO_CARRITO_GUARDADO) return false;
    globalThis.localStorage.setItem(CLAVE_CARRITO, datos);
    hayCarritoGuardado = carrito.lineas.length > 0;
    return true;
  } catch {
    // Puede ocurrir por cuota o configuración de privacidad; la UI conserva el carrito en memoria.
    return false;
  }
}

/** Confirma el borrado persistente antes de quitar de la vista una compra finalizada. */
export function vaciarCarritoGuardado(carritoVacio) {
  if (carritoVacio?.version !== 1 || !Array.isArray(carritoVacio.lineas) || carritoVacio.lineas.length) {
    throw new TypeError("Se necesita un carrito vacío para finalizar.");
  }
  if (guardarCarrito(carritoVacio)) return { completado: true, aviso: "" };
  try {
    // Con la cuota agotada puede fallar una escritura y seguir siendo posible borrar.
    globalThis.localStorage.removeItem(CLAVE_CARRITO);
    if (globalThis.localStorage.getItem(CLAVE_CARRITO) === null) {
      hayCarritoGuardado = false;
      return { completado: true, aviso: "" };
    }
  } catch { /* Se comprueba abajo si sigue existiendo una copia anterior. */ }
  try {
    const guardado = globalThis.localStorage.getItem(CLAVE_CARRITO);
    hayCarritoGuardado = Boolean(guardado);
    if (!guardado) return { completado: true, aviso: "El carrito quedó vacío. El navegador no permite guardar cambios en este momento." };
  } catch { /* Si el almacenamiento siempre estuvo bloqueado, solo existe la sesión actual. */ }
  if (hayCarritoGuardado) {
    return { completado: false, aviso: "No pudimos vaciar el carrito guardado y no se completó la compra. Conservamos tus paquetes y tus datos. Permite el almacenamiento de este sitio en tu navegador y vuelve a finalizar." };
  }
  return { completado: true, aviso: "El carrito quedó vacío en esta sesión. El almacenamiento del navegador está bloqueado." };
}

export function leerPreferenciaEntrega() {
  try {
    const cookie = document.cookie.split(";").map(parte => parte.trim())
      .find(parte => parte.startsWith("valora-entrega="));
    return cookie?.slice("valora-entrega=".length) === "domicilio" ? "domicilio" : "retiro";
  } catch {
    return "retiro";
  }
}

export function guardarPreferenciaEntrega(entrega) {
  if (!["retiro", "domicilio"].includes(entrega)) return false;
  try {
    const seguro = globalThis.location?.protocol === "https:" ? "; Secure" : "";
    document.cookie = `valora-entrega=${entrega}; Max-Age=2592000; Path=/; SameSite=Lax${seguro}`;
    // Las cookies pueden estar bloqueadas sin lanzar una excepción.
    return document.cookie.split(";").some(parte => parte.trim() === `valora-entrega=${entrega}`);
  } catch {
    return false;
  }
}
