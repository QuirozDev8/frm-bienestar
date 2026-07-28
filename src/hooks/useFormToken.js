import { useEffect, useState } from 'react'
import {
  limpiarFormTokenDeUrl,
  resolverFormToken,
} from '../utils/formToken.js'

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
    isDevelopment,
    testToken: viteEnv.VITE_FORM_TEST_TOKEN,
  })
}

export function useFormToken() {
  const [sesion] = useState(obtenerSesionInicial)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      limpiarFormTokenDeUrl(window.location, window.history)
    }
  }, [])

  return {
    token: sesion.token,
    origenToken: sesion.origen,
    isDevelopment,
  }
}
