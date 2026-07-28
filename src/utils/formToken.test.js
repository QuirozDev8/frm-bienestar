import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_FORM_TOKEN_LENGTH,
  limpiarFormTokenDeUrl,
  normalizarFormToken,
  resolverFormToken,
} from './formToken.js'

test('obtiene y normaliza un token válido desde la URL', () => {
  const sesion = resolverFormToken({
    url: 'http://localhost:5173/formulario?token=%20abc123xyz%20',
    isDevelopment: true,
    testToken: 'token-local',
  })

  assert.deepEqual(sesion, {
    token: 'abc123xyz',
    origen: 'url',
  })
})

test('elimina el token de la URL sin recargar la página', () => {
  const llamadas = []
  const history = {
    state: { paso: 1 },
    replaceState(...argumentos) {
      llamadas.push(argumentos)
    },
  }

  const limpio = limpiarFormTokenDeUrl(
    {
      href: 'http://localhost:5173/formulario?token=abc123xyz',
    },
    history,
  )

  assert.equal(limpio, true)
  assert.deepEqual(llamadas, [
    [{ paso: 1 }, '', '/formulario'],
  ])
})

test('restaura el token de sesión después de limpiar la URL', () => {
  const sesion = resolverFormToken({
    url: 'http://localhost:5173/formulario',
    sessionToken: 'abc123xyz',
  })
  let pasoActual = 0

  pasoActual += 1
  pasoActual += 1

  assert.equal(pasoActual, 2)
  assert.equal(sesion.token, 'abc123xyz')
  assert.equal(sesion.origen, 'sesion')
})

test('usa el token configurado únicamente cuando está en desarrollo', () => {
  const sesionDesarrollo = resolverFormToken({
    url: 'http://localhost:5173/formulario',
    isDevelopment: true,
    testToken: 'token-local',
  })
  const sesionProduccion = resolverFormToken({
    url: 'https://formulario.example/formulario',
    isDevelopment: false,
    testToken: 'token-local',
  })

  assert.equal(sesionDesarrollo.token, 'token-local')
  assert.equal(sesionDesarrollo.origen, 'desarrollo')
  assert.equal(sesionProduccion.token, null)
})

test('el token de la URL tiene prioridad sobre sesión y desarrollo', () => {
  const sesion = resolverFormToken({
    url: 'http://localhost:5173/formulario?token=token-url',
    sessionToken: 'token-sesion',
    isDevelopment: true,
    testToken: 'token-local',
  })

  assert.equal(sesion.token, 'token-url')
  assert.equal(sesion.origen, 'url')
})

test('el token de sesión tiene prioridad sobre el de desarrollo', () => {
  const sesion = resolverFormToken({
    url: 'http://localhost:5173/formulario',
    sessionToken: 'token-sesion',
    isDevelopment: true,
    testToken: 'token-local',
  })

  assert.equal(sesion.token, 'token-sesion')
  assert.equal(sesion.origen, 'sesion')
})

test('maneja la ausencia del token sin inventar un valor', () => {
  const sesion = resolverFormToken({
    url: 'http://localhost:5173/formulario',
    isDevelopment: true,
  })

  assert.deepEqual(sesion, {
    token: null,
    origen: null,
  })
})

test('conserva la ruta, los demás parámetros y el hash al limpiar', () => {
  const llamadas = []

  limpiarFormTokenDeUrl(
    {
      href: 'http://localhost:5173/formulario?campana=salud&token=abc&idioma=es#pregunta-3',
    },
    {
      state: null,
      replaceState(...argumentos) {
        llamadas.push(argumentos)
      },
    },
  )

  assert.deepEqual(llamadas, [
    [
      null,
      '',
      '/formulario?campana=salud&idioma=es#pregunta-3',
    ],
  ])
})

test('rechaza tokens vacíos o demasiado largos', () => {
  assert.equal(normalizarFormToken('   '), null)
  assert.equal(
    normalizarFormToken('a'.repeat(MAX_FORM_TOKEN_LENGTH + 1)),
    null,
  )
  assert.equal(
    normalizarFormToken('a'.repeat(MAX_FORM_TOKEN_LENGTH)),
    'a'.repeat(MAX_FORM_TOKEN_LENGTH),
  )
})
