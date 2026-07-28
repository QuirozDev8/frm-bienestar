import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calcularResultadosDass21,
  obtenerDimensionPrincipalDass21,
} from './dass21.js'

const PREGUNTAS = {
  depresion: [3, 5, 10, 13, 16, 17, 21],
  ansiedad: [2, 4, 7, 9, 15, 19, 20],
  estres: [1, 6, 8, 11, 12, 14, 18],
}

function crearRespuestas(pesos = {}) {
  return Array.from({ length: 21 }, (_, indice) => {
    const idPregunta = indice + 1
    return {
      idPregunta,
      pesoRespuesta: pesos[idPregunta] ?? 0,
    }
  })
}

function crearRespuestasConPuntaje(dimension, puntaje) {
  const pesos = {}
  let puntajePendiente = puntaje

  PREGUNTAS[dimension].forEach((idPregunta) => {
    const peso = Math.min(puntajePendiente, 3)
    pesos[idPregunta] = peso
    puntajePendiente -= peso
  })

  return crearRespuestas(pesos)
}

test('clasifica como normal cuando todos los pesos son cero', () => {
  assert.deepEqual(calcularResultadosDass21(crearRespuestas()), {
    cont_depresion: 0,
    cont_ansiedad: 0,
    cont_estres: 0,
    categoria_depresion: 'normal',
    categoria_ansiedad: 'normal',
    categoria_estres: 'normal',
  })
})

test('cada dimensión alcanza un máximo bruto de 21 puntos', () => {
  assert.deepEqual(
    calcularResultadosDass21(
      crearRespuestas(
        Object.fromEntries(
          Array.from({ length: 21 }, (_, indice) => [indice + 1, 3]),
        ),
      ),
    ),
    {
      cont_depresion: 21,
      cont_ansiedad: 21,
      cont_estres: 21,
      categoria_depresion: 'extremadamente severa',
      categoria_ansiedad: 'extremadamente severa',
      categoria_estres: 'extremadamente severa',
    },
  )
})

test('distribuye correctamente las 21 preguntas entre las dimensiones', () => {
  Object.entries(PREGUNTAS).forEach(([dimensionEsperada, preguntas]) => {
    preguntas.forEach((idPregunta) => {
      const resultado = calcularResultadosDass21(
        crearRespuestas({ [idPregunta]: 1 }),
      )

      assert.equal(
        resultado[`cont_${dimensionEsperada}`],
        1,
        `La pregunta ${idPregunta} debe sumar a ${dimensionEsperada}.`,
      )

      Object.keys(PREGUNTAS)
        .filter((dimension) => dimension !== dimensionEsperada)
        .forEach((dimension) => {
          assert.equal(resultado[`cont_${dimension}`], 0)
        })
    })
  })
})

test('respeta los límites de las categorías de depresión', () => {
  const casos = [
    [4, 'normal'],
    [5, 'leve'],
    [6, 'leve'],
    [7, 'moderada'],
    [10, 'moderada'],
    [11, 'severa'],
    [13, 'severa'],
    [14, 'extremadamente severa'],
  ]

  casos.forEach(([puntaje, categoria]) => {
    const resultado = calcularResultadosDass21(
      crearRespuestasConPuntaje('depresion', puntaje),
    )
    assert.equal(resultado.categoria_depresion, categoria)
  })
})

test('respeta los límites de las categorías de ansiedad', () => {
  const casos = [
    [3, 'normal'],
    [4, 'leve'],
    [5, 'moderada'],
    [7, 'moderada'],
    [8, 'severa'],
    [9, 'severa'],
    [10, 'extremadamente severa'],
  ]

  casos.forEach(([puntaje, categoria]) => {
    const resultado = calcularResultadosDass21(
      crearRespuestasConPuntaje('ansiedad', puntaje),
    )
    assert.equal(resultado.categoria_ansiedad, categoria)
  })
})

test('respeta los límites de las categorías de estrés', () => {
  const casos = [
    [7, 'normal'],
    [8, 'leve'],
    [9, 'leve'],
    [10, 'moderada'],
    [12, 'moderada'],
    [13, 'severa'],
    [16, 'severa'],
    [17, 'extremadamente severa'],
  ]

  casos.forEach(([puntaje, categoria]) => {
    const resultado = calcularResultadosDass21(
      crearRespuestasConPuntaje('estres', puntaje),
    )
    assert.equal(resultado.categoria_estres, categoria)
  })
})

test('rechaza formularios con preguntas faltantes', () => {
  assert.throws(
    () => calcularResultadosDass21(crearRespuestas().slice(0, 20)),
    /exactamente 21 respuestas/,
  )
})

test('rechaza preguntas duplicadas', () => {
  const respuestas = crearRespuestas()
  respuestas[20] = { idPregunta: 20, pesoRespuesta: 0 }

  assert.throws(
    () => calcularResultadosDass21(respuestas),
    /pregunta 20 está duplicada/,
  )
})

test('rechaza pesos fuera del rango permitido', () => {
  assert.throws(
    () =>
      calcularResultadosDass21(
        crearRespuestas({
          1: 4,
        }),
      ),
    /debe ser un entero entre 0 y 3/,
  )
})

test('selecciona la dimensión que tiene el mayor puntaje', () => {
  const casos = [
    ['estres', { cont_estres: 12, cont_ansiedad: 8, cont_depresion: 4 }],
    ['ansiedad', { cont_estres: 5, cont_ansiedad: 14, cont_depresion: 9 }],
    ['depresion', { cont_estres: 3, cont_ansiedad: 7, cont_depresion: 11 }],
  ]

  casos.forEach(([dimensionEsperada, resultados]) => {
    assert.equal(
      obtenerDimensionPrincipalDass21(resultados),
      dimensionEsperada,
    )
  })
})

test('resuelve empates con prioridad estrés, ansiedad y depresión', () => {
  assert.equal(
    obtenerDimensionPrincipalDass21({
      cont_estres: 10,
      cont_ansiedad: 10,
      cont_depresion: 10,
    }),
    'estres',
  )
  assert.equal(
    obtenerDimensionPrincipalDass21({
      cont_estres: 4,
      cont_ansiedad: 9,
      cont_depresion: 9,
    }),
    'ansiedad',
  )
  assert.equal(
    obtenerDimensionPrincipalDass21({
      cont_estres: 0,
      cont_ansiedad: 0,
      cont_depresion: 0,
    }),
    'estres',
  )
})
