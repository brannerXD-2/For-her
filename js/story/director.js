import { CONTENT } from '../content.js';
import { runBreath } from './breath.js';
import { runFinal } from './final.js';
import { runGate } from './gate.js';
import { runLight } from './light.js';
import { runShadow } from './shadow.js';

const ORDER = ['gate', 'shadow', 'breath', 'light', 'final'];

/**
 * The whole experience, in order. `from` lets a test jump straight to a chapter (?debug&from=light&s=2);
 * the sky is put in the state that chapter expects.
 */
export async function runStory(app, { from = 'gate', station = 0 } = {}) {
  const { sky } = app;
  const first = Math.max(0, ORDER.indexOf(from));

  if (first >= 1) {
    sky.reveal = 1;
    app.hud.showControls();
    document.getElementById('gate').hidden = true;
  }
  if (first >= 3) {
    sky.calm = 1;
    app.heartOn = false;
  }
  if (first >= 4) {
    sky.p = 1;
  }

  const steps = {
    gate: () => runGate(app),
    shadow: () => runShadow(app),
    breath: () => runBreath(app),
    light: () => runLight(app, { start: first === 3 ? station : 0 }),
    final: () => runFinal(app),
  };

  if (first === 3 && station > 0) sky.p = CONTENT.light.stations[station - 1].p; // the moon is already there

  for (const name of ORDER.slice(first)) await steps[name]();
}
