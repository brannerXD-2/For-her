/**
 * Every word of the experience lives here. A "fragment" is an array of lines:
 * the lines of one fragment appear one after another and the next fragment waits for a tap.
 */

import { sixesSince, todayLabel } from './util/dates.js';

const now = new Date();
const isSix = now.getDate() === 6;
const sixes = sixesSince(now);

export const CONTENT = {
  gate: {
    kicker: todayLabel(now),
    title: isSix ? 'Hoy es 6.' : 'Hay un 6 que no se me pasa.',
    sub: 'Hay fechas que no dejo pasar.',
    enter: 'entrar',
    soundOn: 'con sonido',
    soundOff: 'en silencio',
    note: 'puedes salir cuando quieras',
  },

  /** The 6th, and the only thing that needs saying about yesterday. */
  seis: [
    ['Un 6 de febrero de 2024 empezó algo.'],
    [
      isSix ? `Hoy se cumplen ${sixes} meses de aquel día.` : `Han pasado ${sixes} meses de aquel día.`,
      'Y entre medias pasó de todo: distancia, silencios, caminos distintos.',
    ],
    ['Aun así, cada 6 me detengo.', 'Aunque no lo diga, llevo la cuenta.'],
    // the shadow comes back for two short fragments: the panic is named and apologised for, nothing more
    ['Ayer, en medio de un ataque de pánico, te pedí que te alejaras.', 'Fue el miedo hablando, no lo que siento.'],
    ['Lo siento, Camila.', 'Sin peros.'],
    ['Un eclipse no apaga el sol.', 'Solo se pone algo en medio, y por un rato no se ve.'],
    ['Déjame enseñarte lo que hay detrás.'],
  ],

  light: {
    dragHint: 'desliza para mover la luna',
    moreHint: 'sigue deslizando',
    /** `p` is where the moon rests while the fragments play (0 = covering the sun, 1 = far away). */
    stations: [
      {
        p: 0.03,
        fragments: [
          ['Esto es lo que veo cuando miro hacia ti.'],
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
    lines: [
      ['La sombra ya pasó.', 'Lo que ves es lo que siempre estuvo.'],
      ['Y el próximo 6, y el que venga,', 'ojalá nos encuentre más cerca de lo que estamos hoy.'],
      ['Lo que sigue es tuyo.'],
    ],
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
  },

  hud: {
    soundLabelOn: 'Silenciar la música',
    soundLabelOff: 'Activar la música',
  },
};
