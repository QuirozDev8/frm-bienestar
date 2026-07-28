const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

export async function enviarRespuestasAlWebhook(datosFormulario) {
  if (!WEBHOOK_URL) {
    throw new Error(
      'La URL del webhook de n8n no está configurada. Define VITE_N8N_WEBHOOK_URL.',
    )
  }

  const respuesta = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosFormulario),
  })

  if (!respuesta.ok) {
    throw new Error(
      `El webhook respondió con el estado ${respuesta.status}. Intenta nuevamente.`,
    )
  }

  const tipoContenido = respuesta.headers.get('content-type')

  if (tipoContenido?.includes('application/json')) {
    return respuesta.json()
  }

  return null
}
