import { HEART } from '../config.js';
import { CONTENT } from '../content.js';
import { animate } from '../util/async.js';
import { easeInOut } from '../util/math.js';

/**
 * The 6th. It opens on the date and only goes dark for the two sentences about yesterday:
 * the heart starts racing when the panic is named, and settles as the eclipse is explained.
 */
export async function runSeis(app) {
  const { sky, sound, heart, hud, fragments } = app;
  hud.showControls();
  sound.cue('calm');
  sound.setLevel(0.5);

  await fragments.play(CONTENT.seis, {
    onShow(index) {
      if (index === 3) {
        // "Ayer, en medio de un ataque de pánico…"
        app.heartOn = true;
        heart.start(HEART.bpmStart);
        animate(sky, 'calm', 0.05, 1800, easeInOut);
      } else if (index === 5) {
        // "Un eclipse no apaga el sol."
        heart.setTarget(HEART.bpmEnd);
        animate(sky, 'calm', 1, 9000, easeInOut);
      } else if (index === 6) {
        app.heartFade().then(() => {
          heart.stop();
          app.heartOn = false;
        });
      }
    },
  });
}
