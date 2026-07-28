const PREGUNTAS_POR_DIMENSION = {
  depresion: [3, 5, 10, 13, 16, 17, 21],
  ansiedad: [2, 4, 7, 9, 15, 19, 20],
  estres: [1, 6, 8, 11, 12, 14, 18],
}

const DIMENSION_POR_PREGUNTA = Object.fromEntries(
  Object.entries(PREGUNTAS_POR_DIMENSION).flatMap(([dimension, preguntas]) =>
    preguntas.map((idPregunta) => [idPregunta, dimension]),
  ),
)

const UMBRALES = {
  depresion: [
    [4, 'normal'],
    [6, 'leve'],
    [10, 'moderada'],
    [13, 'severa'],
  ],
  ansiedad: [
    [3, 'normal'],
    [4, 'leve'],
    [7, 'moderada'],
    [9, 'severa'],
  ],
  estres: [
    [7, 'normal'],
    [9, 'leve'],
    [12, 'moderada'],
    [16, 'severa'],
  ],
}

const PRIORIDAD_DIMENSIONES = ['estres', 'ansiedad', 'depresion']

function categorizarPuntaje(puntaje, umbrales) {
  const categoria = umbrales.find(([limite]) => puntaje <= limite)
  return categoria?.[1] ?? 'extremadamente severa'
}

function validarRespuestas(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== 21) {
    throw new Error('El cálculo DASS-21 requiere exactamente 21 respuestas.')
  }

  const preguntasRecibidas = new Set()

  respuestas.forEach(({ idPregunta, pesoRespuesta }) => {
    if (
      !Number.isInteger(idPregunta) ||
      !DIMENSION_POR_PREGUNTA[idPregunta]
    ) {
      throw new Error(`La pregunta ${idPregunta} no pertenece al DASS-21.`)
    }

    if (preguntasRecibidas.has(idPregunta)) {
      throw new Error(`La pregunta ${idPregunta} está duplicada.`)
    }

    if (
      !Number.isInteger(pesoRespuesta) ||
      pesoRespuesta < 0 ||
      pesoRespuesta > 3
    ) {
      throw new Error(
        `El peso de la pregunta ${idPregunta} debe ser un entero entre 0 y 3.`,
      )
    }

    preguntasRecibidas.add(idPregunta)
  })
}

export function obtenerDimensionPrincipalDass21(resultados) {
  PRIORIDAD_DIMENSIONES.forEach((dimension) => {
    const puntaje = resultados?.[`cont_${dimension}`]

    if (!Number.isFinite(puntaje)) {
      throw new Error(
        `El puntaje de ${dimension} debe ser un número válido.`,
      )
    }
  })

  return PRIORIDAD_DIMENSIONES.reduce(
    (dimensionPrincipal, dimension) =>
      resultados[`cont_${dimension}`] >
      resultados[`cont_${dimensionPrincipal}`]
        ? dimension
        : dimensionPrincipal,
  )
}

export function calcularResultadosDass21(respuestas) {
  validarRespuestas(respuestas)

  const puntajes = {
    depresion: 0,
    ansiedad: 0,
    estres: 0,
  }

  respuestas.forEach(({ idPregunta, pesoRespuesta }) => {
    const dimension = DIMENSION_POR_PREGUNTA[idPregunta]
    puntajes[dimension] += pesoRespuesta
  })

  return {
    cont_depresion: puntajes.depresion,
    cont_ansiedad: puntajes.ansiedad,
    cont_estres: puntajes.estres,
    categoria_depresion: categorizarPuntaje(
      puntajes.depresion,
      UMBRALES.depresion,
    ),
    categoria_ansiedad: categorizarPuntaje(
      puntajes.ansiedad,
      UMBRALES.ansiedad,
    ),
    categoria_estres: categorizarPuntaje(puntajes.estres, UMBRALES.estres),
  }
}
