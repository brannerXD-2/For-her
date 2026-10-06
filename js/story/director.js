import { CONTENT } from '../content.js';
import { runFinal } from './final.js';
import { runGate } from './gate.js';
import { runLight } from './light.js';
import { runSeis } from './seis.js';

const ORDER = ['gate', 'seis', 'light', 'final'];

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
  if (first >= 2) {
    sky.calm = 1;
    app.heartOn = false;
  }
  if (first >= 3) {
    sky.p = 1;
  }

  const steps = {
    gate: () => runGate(app),
    seis: () => runSeis(app),
    light: () => runLight(app, { start: first === 2 ? station : 0 }),
    final: () => runFinal(app),
  };

  if (first === 2 && station > 0) sky.p = CONTENT.light.stations[station - 1].p; // the moon is already there

  for (const name of ORDER.slice(first)) await steps[name]();
}
