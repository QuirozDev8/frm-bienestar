import assert from 'node:assert/strict'
import test from 'node:test'
import { debeMostrarRespuestaFinal } from './formFlow.js'

test('muestra la respuesta final únicamente después de un envío exitoso', () => {
  assert.equal(
    debeMostrarRespuestaFinal('enviado', 'estres'),
    true,
  )
  assert.equal(
    debeMostrarRespuestaFinal('enviando', 'estres'),
    false,
  )
  assert.equal(
    debeMostrarRespuestaFinal('error', 'estres'),
    false,
  )
  assert.equal(
    debeMostrarRespuestaFinal('idle', 'estres'),
    false,
  )
})

test('no muestra la respuesta final sin una dimensión válida', () => {
  assert.equal(debeMostrarRespuestaFinal('enviado', null), false)
  assert.equal(
    debeMostrarRespuestaFinal('enviado', 'desconocida'),
    false,
  )
})
