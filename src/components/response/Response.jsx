import imagenAnsiedad from '../../assests/img/response-ansiedad.png'
import imagenDepresion from '../../assests/img/response-depresion.png'
import imagenEstres from '../../assests/img/response-estres.png'
import styles from './Response.module.css'

const RESPUESTAS_POR_DIMENSION = {
  estres: {
    imagen: imagenEstres,
    textoAlternativo:
      'Recibimos tu respuesta. Recomendaciones para manejar el estrés: haz pausas para desconectarte y respirar, cambia de ambiente para liberar tensión, organiza tus prioridades y dedica tiempo al descanso.',
  },
  ansiedad: {
    imagen: imagenAnsiedad,
    textoAlternativo:
      'Recibimos tu respuesta. Recomendaciones para manejar la ansiedad: respira y haz pausas conscientes, vuelve al presente, realiza actividad física y escribe lo que sientes para despejar tu mente.',
  },
  depresion: {
    imagen: imagenDepresion,
    textoAlternativo:
      'Recibimos tu respuesta. Recomendaciones para cuidar tu estado de ánimo: disfruta momentos al aire libre, conecta con otras personas, cuida tu descanso y avanza paso a paso.',
  },
}

export default function Response({ dimension }) {
  const respuesta = RESPUESTAS_POR_DIMENSION[dimension]

  if (!respuesta) return null

  return (
    <main className={styles.response}>
      <span
        aria-hidden="true"
        className={`${styles.orbe} ${styles.orbeAzul}`}
      />
      <span
        aria-hidden="true"
        className={`${styles.orbe} ${styles.orbeRojo}`}
      />

      <p
        aria-live="polite"
        className={styles.soloLectores}
        role="status"
      >
        {respuesta.textoAlternativo}
      </p>

      <div
        aria-hidden="true"
        className={styles.marcoEscritorio}
      >
        <img
          alt=""
          className={styles.imagenEscritorio}
          decoding="async"
          height="4500"
          src={respuesta.imagen}
          width="6812"
        />
      </div>

      <div
        aria-hidden="true"
        className={styles.tarjetasMoviles}
      >
        <div
          className={`${styles.tarjetaMovil} ${styles.tarjetaPresentacion}`}
        >
          <img
            alt=""
            className={`${styles.imagenMovil} ${styles.mitadIzquierda}`}
            decoding="async"
            height="4500"
            src={respuesta.imagen}
            width="6812"
          />
        </div>

        <div
          className={`${styles.tarjetaMovil} ${styles.tarjetaRecomendaciones}`}
        >
          <img
            alt=""
            className={`${styles.imagenMovil} ${styles.mitadDerecha}`}
            decoding="async"
            height="4500"
            src={respuesta.imagen}
            width="6812"
          />
        </div>
      </div>
    </main>
  )
}
