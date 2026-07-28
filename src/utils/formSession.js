import { normalizarFormToken } from './formToken.js'

const TOKEN_SESSION_KEY = 'semana-salud:form-token:v1'
const PROGRESS_SESSION_KEY = 'semana-salud:form-progress:v1'
const ULTIMO_PASO = 10
const ULTIMA_PREGUNTA = 20

export function obtenerSessionStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function leerFormTokenDeSesion(storage) {
  if (!storage) return null

  try {
    return normalizarFormToken(storage.getItem(TOKEN_SESSION_KEY))
  } catch {
    return null
  }
}

export function guardarFormTokenEnSesion(storage, token) {
  if (!storage) return false

  const tokenNormalizado = normalizarFormToken(token)

  if (!tokenNormalizado) return false

  try {
    storage.setItem(TOKEN_SESSION_KEY, tokenNormalizado)
    return true
  } catch {
    return false
  }
}

export function limpiarFormTokenDeSesion(storage) {
  if (!storage) return

  try {
    storage.removeItem(TOKEN_SESSION_KEY)
  } catch {
    // La aplicación continúa aunque el navegador bloquee el almacenamiento.
  }
}

function normalizarRespuestas(respuestas) {
  if (
    !respuestas ||
    typeof respuestas !== 'object' ||
    Array.isArray(respuestas)
  ) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(respuestas).filter(([indice, respuesta]) => {
      const indiceNumerico = Number(indice)

      return (
        Number.isInteger(indiceNumerico) &&
        indiceNumerico >= 0 &&
        indiceNumerico <= ULTIMA_PREGUNTA &&
        Number.isInteger(respuesta) &&
        respuesta >= 1 &&
        respuesta <= 4
      )
    }),
  )
}

export function leerProgresoFormulario(storage, tokenActual) {
  if (!storage) return null

  try {
    const contenido = storage.getItem(PROGRESS_SESSION_KEY)

    if (!contenido) return null

    const progreso = JSON.parse(contenido)
    const tokenGuardado =
      progreso.token === null
        ? null
        : normalizarFormToken(progreso.token)
    const tokenNormalizado = normalizarFormToken(tokenActual)

    if (
      (progreso.token !== null && !tokenGuardado) ||
      tokenGuardado !== tokenNormalizado ||
      !Number.isInteger(progreso.pasoActual) ||
      progreso.pasoActual < 0 ||
      progreso.pasoActual > ULTIMO_PASO
    ) {
      return null
    }

    return {
      pasoActual: progreso.pasoActual,
      respuestasSeleccionadas: normalizarRespuestas(
        progreso.respuestasSeleccionadas,
      ),
    }
  } catch {
    return null
  }
}

export function guardarProgresoFormulario(
  storage,
  {
    token,
    pasoActual,
    respuestasSeleccionadas,
  },
) {
  if (
    !storage ||
    !Number.isInteger(pasoActual) ||
    pasoActual < 0 ||
    pasoActual > ULTIMO_PASO
  ) {
    return false
  }

  try {
    storage.setItem(
      PROGRESS_SESSION_KEY,
      JSON.stringify({
        token: normalizarFormToken(token),
        pasoActual,
        respuestasSeleccionadas: normalizarRespuestas(
          respuestasSeleccionadas,
        ),
      }),
    )
    return true
  } catch {
    return false
  }
}

export function limpiarProgresoFormulario(storage) {
  if (!storage) return

  try {
    storage.removeItem(PROGRESS_SESSION_KEY)
  } catch {
    // La aplicación continúa aunque el navegador bloquee el almacenamiento.
  }
}
