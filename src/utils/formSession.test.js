import assert from 'node:assert/strict'
import test from 'node:test'
import {
  guardarFormTokenEnSesion,
  guardarProgresoFormulario,
  leerFormTokenDeSesion,
  leerProgresoFormulario,
  limpiarFormTokenDeSesion,
  limpiarProgresoFormulario,
} from './formSession.js'

function crearStorage() {
  const datos = new Map()

  return {
    getItem(clave) {
      return datos.get(clave) ?? null
    },
    setItem(clave, valor) {
      datos.set(clave, String(valor))
    },
    removeItem(clave) {
      datos.delete(clave)
    },
  }
}

test('conserva el token y el progreso durante la sesión', () => {
  const storage = crearStorage()

  guardarFormTokenEnSesion(storage, 'token-sesion')
  guardarProgresoFormulario(storage, {
    token: 'token-sesion',
    pasoActual: 3,
    respuestasSeleccionadas: {
      0: 2,
      1: 4,
      6: 1,
    },
  })

  assert.equal(
    leerFormTokenDeSesion(storage),
    'token-sesion',
  )
  assert.deepEqual(
    leerProgresoFormulario(storage, 'token-sesion'),
    {
      pasoActual: 3,
      respuestasSeleccionadas: {
        0: 2,
        1: 4,
        6: 1,
      },
    },
  )
})

test('no restaura respuestas pertenecientes a otro token', () => {
  const storage = crearStorage()

  guardarProgresoFormulario(storage, {
    token: 'token-anterior',
    pasoActual: 5,
    respuestasSeleccionadas: { 0: 3 },
  })

  assert.equal(
    leerProgresoFormulario(storage, 'token-nuevo'),
    null,
  )
})

test('descarta datos alterados sin interrumpir el formulario', () => {
  const storage = crearStorage()

  guardarProgresoFormulario(storage, {
    token: 'token-sesion',
    pasoActual: 2,
    respuestasSeleccionadas: {
      0: 2,
      21: 3,
      texto: 1,
      3: 8,
    },
  })

  assert.deepEqual(
    leerProgresoFormulario(storage, 'token-sesion'),
    {
      pasoActual: 2,
      respuestasSeleccionadas: {
        0: 2,
      },
    },
  )
})

test('elimina token y progreso después de completar el flujo', () => {
  const storage = crearStorage()

  guardarFormTokenEnSesion(storage, 'token-sesion')
  guardarProgresoFormulario(storage, {
    token: 'token-sesion',
    pasoActual: 1,
    respuestasSeleccionadas: { 0: 1 },
  })

  limpiarFormTokenDeSesion(storage)
  limpiarProgresoFormulario(storage)

  assert.equal(leerFormTokenDeSesion(storage), null)
  assert.equal(
    leerProgresoFormulario(storage, 'token-sesion'),
    null,
  )
})
