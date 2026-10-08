/* Borrador opcional en la sesión de esta pestaña; nunca se envía a un servidor. */
const CLAVE_BORRADOR = "valora-borrador-v1";

export function inicializarBorrador(formulario, campos, alRestaurar, {
  clave = CLAVE_BORRADOR, recordarId = "recordar-borrador",
  borrarId = "borrar-borrador", estadoId = "estado-borrador",
} = {}) {
  const recordar = document.getElementById(recordarId);
  const borrar = document.getElementById(borrarId);
  const estado = document.getElementById(estadoId);
  if (!recordar || !borrar || !estado) return;
  let temporizador;
  let disponible = true;
  const avisar = (mensaje) => {
    if (estado.textContent !== mensaje) estado.textContent = mensaje;
  };
  function falloAlmacenamiento() {
    disponible = false;
    recordar.checked = false;
    avisar("No pudimos acceder al borrador de esta pestaña. Puedes seguir completando tu solicitud. Si ya había uno guardado, puedes borrar los datos del sitio desde tu navegador.");
  }
  function guardar() {
    clearTimeout(temporizador);
    if (!recordar.checked || !disponible) return;
    try {
      const valores = Object.fromEntries(campos.map(campo => [campo.name, campo.value]));
      sessionStorage.setItem(clave, JSON.stringify({ version: 1, actualizadoEn: new Date().toISOString(), valores }));
      borrar.disabled = false;
      avisar("Borrador guardado en esta pestaña. Aún no has enviado tu solicitud.");
    } catch { falloAlmacenamiento(); }
  }
  function eliminar() {
    clearTimeout(temporizador);
    try {
      sessionStorage.removeItem(clave);
      recordar.checked = false;
      if (document.activeElement === borrar) recordar.focus();
      borrar.disabled = true;
      disponible = true;
      avisar("Borrador eliminado. El texto que estás editando se conserva y ya no se guardará al recargar.");
    } catch { falloAlmacenamiento(); }
  }
  try {
    const guardado = sessionStorage.getItem(clave);
    if (guardado) {
      borrar.disabled = false;
      let borrador;
      try { borrador = JSON.parse(guardado); } catch { /* Se descarta más abajo. */ }
      const valido = guardado.length <= 20000 && borrador?.version === 1 &&
        borrador.valores && !Array.isArray(borrador.valores) &&
        campos.every(campo => typeof borrador.valores[campo.name] === "string" &&
          borrador.valores[campo.name].length <= (campo.maxLength > 0 ? campo.maxLength : 200));
      if (valido) {
        for (const campo of campos) campo.value = borrador.valores[campo.name];
        recordar.checked = true;
        avisar("Recuperamos el borrador de esta pestaña. Revisa tus datos antes de continuar.");
        alRestaurar();
      } else {
        sessionStorage.removeItem(clave);
        borrar.disabled = true;
        avisar("El borrador anterior no se pudo recuperar. Puedes completar una nueva solicitud.");
      }
    }
  } catch { falloAlmacenamiento(); }

  // Un solo listener por evento; agrupa escrituras mientras la persona escribe.
  formulario.addEventListener("input", (evento) => {
    if (!campos.includes(evento.target) || !recordar.checked) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(guardar, 400);
  });
  formulario.addEventListener("change", (evento) => {
    if (campos.includes(evento.target)) guardar();
  });
  formulario.addEventListener("submit", guardar);
  formulario.addEventListener("focusout", (evento) => {
    if (campos.includes(evento.target)) guardar();
  });
  recordar.addEventListener("change", () => {
    disponible = true;
    if (recordar.checked) guardar();
    else eliminar();
  });
  borrar.addEventListener("click", eliminar);
  window.addEventListener("pagehide", guardar);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") guardar();
  });
}
