/* Reglas y operaciones de la solicitud, sin modificar la interfaz. */
export const LIMITES = Object.freeze({
  TELEFONO_MINIMO: 9,
  TELEFONO_MAXIMO: 15,
  PERSONAS_MAXIMO: 100000,
});

export function fechaLocal(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function obtenerErrorCampo(campo, hoy = fechaLocal()) {
  const { id, required, minLength, maxLength, validity } = campo;
  const valor = campo.value.trim();
  if (validity.badInput) return "Introduce un valor válido.";
  if (required && !valor) return "Completa este campo.";
  if (!valor) return "";
  if (minLength > 0 && valor.length < minLength) {
    return `Escribe al menos ${minLength} caracteres, sin contar espacios al inicio o al final.`;
  }
  if (maxLength > 0 && valor.length > maxLength) {
    return `El máximo es ${maxLength} caracteres.`;
  }

  switch (id) {
    case "correo":
      if (validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        return "Escribe un correo válido. Ejemplo: nombre@empresa.com.";
      }
      break;
    case "telefono": {
      const digitos = valor.replace(/\D/g, "");
      if (!/^\+?[\d\s()-]+$/.test(valor) ||
          digitos.length < LIMITES.TELEFONO_MINIMO ||
          digitos.length > LIMITES.TELEFONO_MAXIMO) {
        return `Usa entre ${LIMITES.TELEFONO_MINIMO} y ${LIMITES.TELEFONO_MAXIMO} dígitos. Ejemplo: +593 99 588 3856.`;
      }
      break;
    }
    case "personas":
      if (!Number.isInteger(Number(valor)) || Number(valor) < 1 ||
          Number(valor) > LIMITES.PERSONAS_MAXIMO) {
        return `Indica un número entero entre 1 y ${LIMITES.PERSONAS_MAXIMO}.`;
      }
      break;
    case "fecha": {
      const fecha = new Date(`${valor}T12:00:00`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
          Number.isNaN(fecha.getTime()) || fechaLocal(fecha) !== valor || valor < hoy) {
        return "Selecciona una fecha válida, hoy o posterior.";
      }
      break;
    }
  }

  if (validity.patternMismatch || validity.rangeOverflow ||
      validity.rangeUnderflow || validity.stepMismatch || validity.typeMismatch) {
    return "Revisa el formato o el rango de este campo.";
  }
  return "";
}

export function crearResumenSolicitud(datos, servicio) {
  const { nombre, empresa, correo, telefono, personas, fecha, mensaje } = datos;
  const fechaLegible = fecha
    ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(new Date(`${fecha}T12:00:00`))
    : "Por definir";
  return [
    "Hola, Válora. Me gustaría solicitar una cotización.",
    "",
    `Nombre: ${nombre}`,
    `Empresa: ${empresa}`,
    `Correo: ${correo}`,
    `Teléfono: ${telefono}`,
    `Servicio: ${servicio}`,
    `Personas: ${personas || "Por definir"}`,
    `Fecha: ${fechaLegible}`,
    "",
    mensaje,
  ].join("\n");
}

// Distingue una función no disponible de un permiso rechazado, sin exponer datos.
export class ErrorPortapapeles extends Error {
  constructor(motivo) {
    super("No se pudo copiar el resumen automáticamente.");
    this.name = "ErrorPortapapeles";
    this.motivo = motivo;
  }
}

export async function copiarTexto(texto) {
  if (!globalThis.isSecureContext || typeof navigator.clipboard?.writeText !== "function") {
    throw new ErrorPortapapeles("no-disponible");
  }
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    throw new ErrorPortapapeles("permiso-denegado");
  }
}
