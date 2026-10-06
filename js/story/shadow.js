import { BREATH } from '../config.js';
import { CONTENT } from '../content.js';
import { animate } from '../util/async.js';
import { easeInOut } from '../util/math.js';

/** Yesterday, told plainly, while the sky is in the dark and the heart is racing. */
export async function runShadow(app) {
  const { sky, sound, heart, hud, fragments } = app;
  hud.showControls();
  sound.cue('calm');
  sound.setLevel(0.5);
  app.heartOn = true;
  heart.start(BREATH.bpmStart);
  animate(sky, 'calm', 0.05, 2600, easeInOut);
  await fragments.play(CONTENT.ayer);
}
