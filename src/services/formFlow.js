const DIMENSIONES_VALIDAS = new Set([
  'estres',
  'ansiedad',
  'depresion',
])

export function debeMostrarRespuestaFinal(estadoEnvio, dimension) {
  return (
    estadoEnvio === 'enviado' &&
    DIMENSIONES_VALIDAS.has(dimension)
  )
}
