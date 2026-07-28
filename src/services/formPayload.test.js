import assert from 'node:assert/strict'
import test from 'node:test'
import { construirPayloadFormulario } from './formPayload.js'

test('agrega el token al JSON sin modificar las respuestas existentes', () => {
  const respuestas = {
    question1: 'Respuesta 1',
    question2: 'Respuesta 2',
  }
  const payload = construirPayloadFormulario(
    {
      responses: respuestas,
      submittedAt: '2026-07-28T14:30:00.000Z',
    },
    ' abc123xyz ',
  )

  assert.deepEqual(payload, {
    responses: respuestas,
    submittedAt: '2026-07-28T14:30:00.000Z',
    token: 'abc123xyz',
  })
  assert.equal(payload.responses, respuestas)
})

test('nunca agrega un token vacío al JSON', () => {
  const payload = construirPayloadFormulario(
    {
      responses: {
        question1: 'Respuesta 1',
      },
    },
    '   ',
  )

  assert.equal(Object.hasOwn(payload, 'token'), false)
})
