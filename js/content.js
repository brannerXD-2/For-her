/**
 * Every word of the experience lives here. A "fragment" is an array of lines:
 * the lines of one fragment appear one after another and the next fragment waits for a tap.
 */

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const CONTENT = {
  gate: {
    kicker: () => {
      const now = new Date();
      return `para camila · ${now.getDate()} de ${MONTHS[now.getMonth()]}`;
    },
    title: 'No vengo a pedirte nada.',
    sub: 'Solo a explicarte, a mi manera, lo que pasó.',
    enter: 'entrar',
    soundOn: 'con sonido',
    soundOff: 'en silencio',
    note: 'puedes salir cuando quieras',
  },

  /** What happened, said plainly. */
  ayer: [
    ['Ayer te pedí que te alejaras.'],
    ['Lo dije en medio de un ataque de pánico.', 'Cuando eso me pasa, el miedo habla más fuerte que yo.'],
    ['Mi cabeza me llevó a un lugar viejo', 'y respondí desde ahí.', 'No desde lo que tú eres hoy.'],
    ['No lo cuento para justificarme.', 'Lo que dije estuvo mal, y la forma en que lo dije, peor.'],
    ['Lo siento, Camila.', 'De verdad. Sin peros.'],
    ['Un eclipse no apaga el sol.', 'Solo se pone algo en medio, y por unos minutos no se ve.'],
    ['Ayer ese algo fue mi miedo.', 'No fuiste tú.'],
  ],

  breath: {
    intro: [['Así se siente desde adentro.', 'Si quieres, respira conmigo.']],
    hintIdle: 'mantén presionado para inhalar',
    hintInhale: 'inhala…',
    hintLetGo: 'suelta, y exhala despacio',
    hintExhale: 'exhala…',
    hintTooShort: 'un poco más, sin prisa',
    skip: 'saltar',
    outro: [
      ['Esto es lo que quiero hacer la próxima vez,', 'antes de decir una sola palabra.'],
      ['Me voy a ocupar de esto.', 'No por ti. Por mí.'],
    ],
  },

  light: {
    dragHint: 'desliza para mover la luna',
    moreHint: 'sigue deslizando',
    /** `p` is where the moon rests while the fragments play (0 = covering the sun, 1 = far away). */
    stations: [
      {
        p: 0.03,
        fragments: [
          ['Cuando lo que se interpone se aparta,', 'vuelve lo que siempre estuvo ahí.'],
          ['Y lo que yo veo cuando te miro a ti es esto.'],
        ],
      },
      {
        p: 0.14,
        fragments: [
          ['Te veo elegir la calma', 'incluso cuando el ruido sería más fácil.'],
          ['Comer bien, entrenar, darte tiempo.', 'Nada de eso pasa por casualidad: pasa por decisiones, y las veo todas.'],
          ['Hay una versión de ti que quizá todavía no alcanzas a ver completa.', 'Yo la veo asomarse.'],
        ],
      },
      {
        p: 0.3,
        fragments: [
          ['Veo cómo volviste a tu familia,', 'a ese lugar donde te conocen desde siempre.'],
          ['Nadie crece del todo solo.', 'Y tú lo estás haciendo acompañada.'],
        ],
      },
      {
        p: 0.46,
        fragments: [
          ['A veces uno empieza a dudar del camino que imaginó.', 'Dudar no es perderse.'],
          ['Un sueño puede cambiar de forma', 'sin dejar de significar lo mismo.'],
          ['Eso que te hizo imaginarte psicóloga —querer entender, acompañar, escuchar sin juzgar— no vive en un diploma.', 'Vive en ti.'],
          ['Siga el camino que siga,', 'mi admiración por ti no cambia.'],
        ],
      },
      {
        p: 0.66,
        fragments: [
          ['Hablar contigo otra vez ha sido de lo mejor que me ha pasado este tiempo.'],
          ['Y justo por eso no quiero que decidas por pena, ni por presión.', 'Si algún día vuelves, que sea porque tú quieres.'],
          ['Si necesitas distancia, la entiendo.', 'Quererte también es dejar que tú decidas.'],
        ],
      },
      {
        p: 1,
        fragments: [
          ['Los planes que hicimos —Medellín, conocernos por fin sin una pantalla en medio, Mylo y Tammy esperando a su mamá—', 'los guardo. Sin fecha y sin deuda.'],
          ['No lo digo como una promesa.', 'Lo digo como algo bonito que me gusta saber que existe.'],
          ['No sé qué forma tendrá el futuro.', 'Pero me gusta pensar que todavía quedan caminos por recorrer.'],
        ],
      },
    ],
  },

  final: {
    lines: [['La sombra ya pasó.', 'Lo que ves es lo que siempre estuvo.'], ['Lo que sigue es tuyo.']],
    kicker: 'sin presión · tú decides',
    choices: [
      {
        id: 'tiempo',
        label: 'Necesito tiempo',
        reply: [['Entonces tómalo.', 'No voy a escribirte para apurarte ni a insistir.'], ['Gracias por haber llegado hasta aquí.']],
        message: 'Vi la página. Necesito tiempo.',
      },
      {
        id: 'hablar',
        label: 'Hablemos',
        reply: [['Gracias por darme esa oportunidad.'], ['Cuando tú quieras y como tú quieras.', 'Voy a escuchar sin ponerme a la defensiva.']],
        message: 'Vi la página. Hablemos.',
      },
      {
        id: 'camino',
        label: 'Prefiero que cada quien siga su camino',
        reply: [['Gracias por decírmelo con claridad.', 'Lo respeto, de verdad.'], ['Gracias por todo lo que fuimos.', 'Cuídate mucho, Camila.']],
        message: 'Vi la página. Prefiero que cada quien siga su camino.',
      },
    ],
    tell: 'decírselo a Branner',
    name: 'Camila.',
    sign: '— Branner',
    footer: 'hecho con cariño por Branner',
    credits: 'créditos',
    again: 'volver a empezar',
  },

  hud: {
    mark: 'eclipse',
    soundLabelOn: 'Silenciar la música',
    soundLabelOff: 'Activar la música',
  },
};
