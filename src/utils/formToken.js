export const MAX_FORM_TOKEN_LENGTH = 512

export function normalizarFormToken(valor) {
  if (typeof valor !== 'string') return null

  const token = valor.trim()

  if (!token || token.length > MAX_FORM_TOKEN_LENGTH) return null

  return token
}

function convertirEnUrl(url) {
  if (url instanceof URL) return new URL(url.href)

  return new URL(url)
}

export function resolverFormToken({
  url,
  sessionToken,
  isDevelopment = false,
  testToken,
}) {
  const urlActual = convertirEnUrl(url)
  const tokenDeUrl = normalizarFormToken(
    urlActual.searchParams.get('token'),
  )

  if (tokenDeUrl) {
    return {
      token: tokenDeUrl,
      origen: 'url',
    }
  }

  const tokenDeSesion = normalizarFormToken(sessionToken)

  if (tokenDeSesion) {
    return {
      token: tokenDeSesion,
      origen: 'sesion',
    }
  }

  const tokenDePrueba = isDevelopment
    ? normalizarFormToken(testToken)
    : null

  if (tokenDePrueba) {
    return {
      token: tokenDePrueba,
      origen: 'desarrollo',
    }
  }

  return {
    token: null,
    origen: null,
  }
}

export function crearUrlSinFormToken(url) {
  const urlActual = convertirEnUrl(url)
  urlActual.searchParams.delete('token')

  return `${urlActual.pathname}${urlActual.search}${urlActual.hash}`
}

export function limpiarFormTokenDeUrl(location, history) {
  const urlActual = convertirEnUrl(location.href)

  if (!urlActual.searchParams.has('token')) return false

  history.replaceState(
    history.state ?? null,
    '',
    crearUrlSinFormToken(urlActual),
  )

  return true
}
