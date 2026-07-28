import { useCallback, useEffect, useState } from 'react'
import {
  limpiarFormTokenDeUrl,
  resolverFormToken,
} from '../utils/formToken.js'
import {
  guardarFormTokenEnSesion,
  leerFormTokenDeSesion,
  limpiarFormTokenDeSesion,
  obtenerSessionStorage,
} from '../utils/formSession.js'

const viteEnv = import.meta.env ?? {}
const isDevelopment = viteEnv.DEV === true

function obtenerSesionInicial() {
  if (typeof window === 'undefined') {
    return {
      token: null,
      origen: null,
    }
  }

  return resolverFormToken({
    url: window.location.href,
    sessionToken: leerFormTokenDeSesion(
      obtenerSessionStorage(),
    ),
    isDevelopment,
    testToken: viteEnv.VITE_FORM_TEST_TOKEN,
  })
}

export function useFormToken() {
  const [sesion] = useState(obtenerSesionInicial)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      guardarFormTokenEnSesion(
        obtenerSessionStorage(),
        sesion.token,
      )
      limpiarFormTokenDeUrl(window.location, window.history)
    }
  }, [sesion.token])

  const limpiarTokenDeSesion = useCallback(() => {
    limpiarFormTokenDeSesion(obtenerSessionStorage())
  }, [])

  return {
    token: sesion.token,
    origenToken: sesion.origen,
    isDevelopment,
    limpiarTokenDeSesion,
  }
}
