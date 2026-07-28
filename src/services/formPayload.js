import { normalizarFormToken } from '../utils/formToken.js'

export function construirPayloadFormulario(datosFormulario, token) {
  const payload = {
    ...datosFormulario,
  }
  const tokenNormalizado = normalizarFormToken(token)

  if (tokenNormalizado) {
    payload.token = tokenNormalizado
  }

  return payload
}
