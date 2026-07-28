import { useState } from 'react'
import { useFormToken } from '../../hooks/useFormToken.js'
import {
  calcularResultadosDass21,
  obtenerDimensionPrincipalDass21,
} from '../../services/dass21.js'
import { construirPayloadFormulario } from '../../services/formPayload.js'
import { debeMostrarRespuestaFinal } from '../../services/formFlow.js'
import { enviarRespuestasAlWebhook } from '../../services/n8nWebhook.js'
import Response from '../response/Response.jsx'
import styles from './Formulario.module.css'

const PREGUNTAS_POR_PASO = 2

const preguntas = [
  { id: 1, pregunta: 'Me ha costado mucho descargar la tensión' },
  { id: 2, pregunta: 'Me di cuenta que tenía la boca seca' },
  { id: 3, pregunta: 'No podía sentir ningún sentimiento positivo' },
  { id: 4, pregunta: 'Se me hizo difícil respirar' },
  { id: 5, pregunta: 'Se me hizo difícil tomar la iniciativa para hacer cosas' },
  { id: 6, pregunta: 'Reaccioné exageradamente en ciertas situaciones' },
  { id: 7, pregunta: 'Sentí que mis manos temblaban' },
  { id: 8, pregunta: 'He sentido que estaba gastando una gran cantidad de energía' },
  { id: 9, pregunta: 'Estaba preocupado por situaciones en las cuales podía tener pánico o en las que podría hacer el ridículo' },
  { id: 10, pregunta: 'He sentido que no había nada que me ilusionara' },
  { id: 11, pregunta: 'Me he sentido inquieto' },
  { id: 12, pregunta: 'Se me hizo difícil relajarme ' },
  { id: 13, pregunta: 'Me sentí triste y deprimido' },
  { id: 14, pregunta: 'No toleré nada que no me permitiera continuar con lo que estaba haciendo' },
  { id: 15, pregunta: 'Sentí que estaba al punto de pánico' },
  { id: 16, pregunta: 'No me pude entusiasmar por nada' },
  { id: 17, pregunta: 'Sentí que valía muy poco como persona' },
  { id: 18, pregunta: 'He tendido a sentirme enfadado con facilidad ' },
  { id: 19, pregunta: 'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico ' },
  { id: 20, pregunta: 'Tuve miedo sin razón' },
  { id: 21, pregunta: 'Sentí que la vida no tenía ningún sentido' },
]

const opcionesRespuesta = [
  {
    id: 1,
    respuesta: 'No me ha ocurrido',
    apoyo: 'En ningún momento',
    tono: 'bg-[#11101d]',
    pesoRespuesta: 0,
  },
  {
    id: 2,
    respuesta: 'Me ha ocurrido un poco',
    apoyo: 'De forma ocasional',
    tono: 'bg-[#0001f3]',
    pesoRespuesta: 1,
  },
  {
    id: 3,
    respuesta: 'Me ha ocurrido bastante',
    apoyo: 'Con frecuencia',
    tono: 'bg-[#df2a25]',
    pesoRespuesta: 2,
  },
  {
    id: 4,
    respuesta: 'Me ha ocurrido mucho',
    apoyo: 'Casi todo el tiempo',
    tono: 'bg-[#e1ff00]',
    pesoRespuesta: 3,
  },
]


export default function Formularo() {
  const { token, isDevelopment } = useFormToken()
  const [pasoActual, setPasoActual] = useState(0)
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({})
  const [formularioCompletado, setFormularioCompletado] = useState(false)
  const [estadoEnvio, setEstadoEnvio] = useState('idle')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [dimensionPrincipal, setDimensionPrincipal] = useState(null)

  const totalPasos = Math.ceil(preguntas.length / PREGUNTAS_POR_PASO)
  const indiceInicial = pasoActual * PREGUNTAS_POR_PASO
  const preguntasDelPaso = preguntas.slice(
    indiceInicial,
    indiceInicial + PREGUNTAS_POR_PASO,
  )

  const totalRespondidas = preguntas.reduce(
    (total, _, indice) =>
      total + (respuestasSeleccionadas[indice] ? 1 : 0),
    0,
  )

  const pasoCompleto = preguntasDelPaso.every(
    (_, indice) => respuestasSeleccionadas[indiceInicial + indice],
  )
  const progreso = Math.round((totalRespondidas / preguntas.length) * 100)
  const esUltimoPaso = pasoActual === totalPasos - 1

  const actualizarRespuesta = (indicePregunta, valor) => {
    setRespuestasSeleccionadas((respuestasAnteriores) => ({
      ...respuestasAnteriores,
      [indicePregunta]: valor,
    }))
    setFormularioCompletado(false)
    setEstadoEnvio('idle')
    setErrorEnvio('')
  }

  const irAlPasoAnterior = () => {
    setPasoActual((paso) => Math.max(paso - 1, 0))
    setFormularioCompletado(false)
    setEstadoEnvio('idle')
    setErrorEnvio('')
  }

  const irAlPasoSiguiente = () => {
    if (!pasoCompleto) return
    setPasoActual((paso) => Math.min(paso + 1, totalPasos - 1))
  }

  const enviarFormulario = async (evento) => {
    evento.preventDefault()

    if (
      totalRespondidas !== preguntas.length ||
      estadoEnvio === 'enviando'
    ) {
      return
    }

    if (!token && !isDevelopment) {
      setEstadoEnvio('error')
      setErrorEnvio(
        'No fue posible enviar las respuestas. inténtalo nuevamente abriendo desde el link que te llego al correo.',
      )
      setFormularioCompletado(false)
      return
    }

    const respuestas = preguntas.map((pregunta, indicePregunta) => {
      const idOpcion = respuestasSeleccionadas[indicePregunta]
      const opcionSeleccionada = opcionesRespuesta.find(
        (opcion) => opcion.id === idOpcion,
      )

      return {
        idPregunta: pregunta.id,
        pregunta: pregunta.pregunta,
        idRespuesta: opcionSeleccionada.id,
        respuesta: opcionSeleccionada.respuesta,
        pesoRespuesta: opcionSeleccionada.pesoRespuesta,
      }
    })
    const resultadosDass21 = calcularResultadosDass21(respuestas)
    const dimensionPrincipalCalculada =
      obtenerDimensionPrincipalDass21(resultadosDass21)

    setEstadoEnvio('enviando')
    setErrorEnvio('')
    setFormularioCompletado(false)

    try {
      const payload = construirPayloadFormulario(
        {
          formulario: 'dass-21-2',
          fechaEnvio: new Date().toISOString(),
          totalPreguntas: preguntas.length,
          ...resultadosDass21,
          respuestas,
        },
        token,
      )

      await enviarRespuestasAlWebhook(payload)

      setDimensionPrincipal(dimensionPrincipalCalculada)
      setEstadoEnvio('enviado')
      setFormularioCompletado(true)
    } catch (error) {
      setEstadoEnvio('error')
      setErrorEnvio(
        error instanceof Error
          ? error.message
          : 'No fue posible enviar las respuestas. Intenta nuevamente.',
      )
    }
  }

  if (
    debeMostrarRespuestaFinal(
      estadoEnvio,
      dimensionPrincipal,
    )
  ) {
    return <Response dimension={dimensionPrincipal} />
  }

  return (
    <main className={`${styles.formulario} px-3 py-5 sm:px-6 sm:py-8`}>
      <section
        aria-labelledby="titulo-formulario"
        className={`${styles.panel} mx-auto overflow-hidden rounded-[28px] bg-white text-[#11101d] shadow-[0_30px_100px_rgba(0,0,0,0.48)] sm:rounded-[36px]`}
      >
        <div aria-hidden="true" className="grid h-2 grid-cols-3">
          <span className="bg-[#0001f3]" />
          <span className="bg-[#df2a25]" />
          <span className="bg-[#e1ff00]" />
        </div>

        <div
          className={`${styles.contenido} px-4 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7 lg:px-10`}
        >
          <header className="border-b border-[#11101d]/10 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0001f3] sm:text-xs">
                    Evaluación de bienestar
                  </p>
                  <span className="h-1 w-1 rounded-full bg-[#df2a25]" />
                  <span className="rounded-full bg-[#e1ff00] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#11101d]">
                    Confidencial
                  </span>
                </div>
                <h1
                  className="text-2xl font-black leading-tight tracking-[-0.035em] sm:text-3xl"
                  id="titulo-formulario"
                >
                  Cuéntanos cómo te has sentido
                </h1>
                <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-[#11101d]/60">
                  Por favor lea las siguientes afirmaciones e indique en
                  qué grado le ha ocurrido a usted esta afirmación durante la semana pasada.
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <span className="inline-flex items-baseline gap-1 rounded-full bg-[#11101d] px-4 py-2 text-white">
                  <strong className="text-lg font-black text-[#e1ff00]">
                    {pasoActual + 1}
                  </strong>
                  <span className="text-xs font-bold text-white/55">
                    de {totalPasos}
                  </span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#11101d]/45">
                  Sección actual
                </span>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#11101d]/55">
                  {totalRespondidas} de {preguntas.length} respondidas
                </span>
                <span className="font-black text-[#0001f3]">{progreso}%</span>
              </div>
              <div
                aria-label={`Progreso del formulario: ${progreso}%`}
                aria-valuemax="100"
                aria-valuemin="0"
                aria-valuenow={progreso}
                className="h-2.5 overflow-hidden rounded-full bg-[#11101d]/10"
                role="progressbar"
              >
                <div
                  className={`${styles.barraProgreso} h-full rounded-full`}
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </header>

          <form className="mt-5" onSubmit={enviarFormulario}>
            <fieldset className="space-y-4">
              <legend className="sr-only">
                Preguntas de la sección {pasoActual + 1}
              </legend>

              {preguntasDelPaso.map((pregunta, indiceDelPaso) => {
                const indicePregunta = indiceInicial + indiceDelPaso
                const idPregunta = `pregunta-${indicePregunta + 1}`

                return (
                  <div
                    className="rounded-2xl border border-[#11101d]/10 bg-[#11101d]/[0.025] p-3.5 sm:p-4"
                    key={idPregunta}
                    role="group"
                    aria-labelledby={`${idPregunta}-titulo`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0001f3] text-xs font-black text-white shadow-[0_6px_16px_rgba(0,1,243,0.24)]">
                        {indicePregunta + 1}
                      </span>
                      <p
                        className="text-sm font-extrabold leading-snug sm:text-base"
                        id={`${idPregunta}-titulo`}
                      >
                        {pregunta.pregunta}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {opcionesRespuesta.map((opcion) => {
                        const idOpcion = `${idPregunta}-opcion-${opcion.id}`
                        const seleccionada =
                          respuestasSeleccionadas[indicePregunta] === opcion.id

                        return (
                          <label
                            className={`${styles.opcion} ${
                              seleccionada ? styles.opcionSeleccionada : ''
                            } relative flex min-h-[72px] cursor-pointer items-center gap-3 rounded-xl border-2 border-[#11101d]/10 bg-white px-3 py-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#0001f3]/35 hover:shadow-[0_8px_20px_rgba(17,16,29,0.08)] focus-within:border-[#0001f3] focus-within:ring-4 focus-within:ring-[#0001f3]/10`}
                            htmlFor={idOpcion}
                            key={opcion.id}
                          >
                            <input
                              checked={seleccionada}
                              className="sr-only"
                              disabled={estadoEnvio === 'enviando'}
                              id={idOpcion}
                              name={idPregunta}
                              onChange={() =>
                                actualizarRespuesta(indicePregunta, opcion.id)
                              }
                              required
                              type="radio"
                              value={opcion.id}
                            />
                            <span
                              aria-hidden="true"
                              className={`${styles.indicador} inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#11101d]/15 bg-white`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${opcion.tono}`}
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-extrabold leading-tight">
                                {opcion.respuesta}
                              </span>
                              <span className="mt-1 block text-[10px] font-semibold leading-tight text-[#11101d]/45">
                                {opcion.apoyo}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </fieldset>

            <div className="mt-4 flex flex-col gap-3 border-t border-[#11101d]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                aria-live="polite"
                className={`flex items-center gap-2 text-xs font-bold sm:text-sm ${
                  estadoEnvio === 'error'
                    ? 'text-[#df2a25]'
                    : formularioCompletado
                      ? 'text-[#11101d]'
                      : pasoCompleto
                        ? 'text-[#0001f3]'
                        : 'text-[#11101d]/50'
                }`}
                role="status"
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    estadoEnvio === 'error'
                      ? 'bg-[#df2a25] text-white'
                      : formularioCompletado
                        ? 'bg-[#e1ff00] text-[#11101d]'
                        : pasoCompleto
                          ? 'bg-[#0001f3] text-white'
                          : 'bg-[#11101d]/10 text-[#11101d]/50'
                  }`}
                >
                  {estadoEnvio === 'error'
                    ? '!'
                    : estadoEnvio === 'enviando'
                      ? '…'
                      : pasoCompleto || formularioCompletado
                        ? '✓'
                        : '!'}
                </span>
                {estadoEnvio === 'enviando'
                  ? 'Enviando tus respuestas...'
                  : estadoEnvio === 'error'
                    ? errorEnvio
                    : formularioCompletado
                      ? '¡Listo! Tus respuestas fueron enviadas correctamente.'
                      : pasoCompleto
                        ? 'Sección completa. Ya puedes continuar.'
                        : 'Responde ambas preguntas para continuar.'}
              </p>

              <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:flex">
                <button
                  className={`min-w-28 cursor-pointer rounded-xl border-2 border-[#11101d] bg-white px-5 py-3 text-sm font-black text-[#11101d] transition hover:bg-[#11101d] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#11101d]/15 disabled:cursor-not-allowed disabled:opacity-35 ${
                    pasoActual === 0 ? 'invisible' : ''
                  }`}
                  disabled={pasoActual === 0 || estadoEnvio === 'enviando'}
                  onClick={irAlPasoAnterior}
                  type="button"
                >
                  ← Anterior
                </button>

                {esUltimoPaso ? (
                  <button
                    className="min-w-28 cursor-pointer rounded-xl bg-[#df2a25] px-5 py-3 text-sm font-black text-white shadow-[0_8px_22px_rgba(223,42,37,0.24)] transition hover:-translate-y-0.5 hover:bg-[#11101d] focus:outline-none focus:ring-4 focus:ring-[#df2a25]/25 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                    disabled={!pasoCompleto || estadoEnvio === 'enviando'}
                    type="submit"
                  >
                    {estadoEnvio === 'enviando'
                      ? 'Enviando...'
                      : 'Finalizar ✓'}
                  </button>
                ) : (
                  <button
                    className="min-w-28 cursor-pointer rounded-xl bg-[#0001f3] px-5 py-3 text-sm font-black text-white shadow-[0_8px_22px_rgba(0,1,243,0.22)] transition hover:-translate-y-0.5 hover:bg-[#11101d] focus:outline-none focus:ring-4 focus:ring-[#0001f3]/20 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                    disabled={!pasoCompleto}
                    onClick={irAlPasoSiguiente}
                    type="button"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
