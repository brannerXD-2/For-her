import { BREATH } from '../config.js';
import { CONTENT } from '../content.js';
import { sleep } from '../util/async.js';
import { clamp, damp, lerp } from '../util/math.js';

const C = CONTENT.breath;

/**
 * Three slow breaths. Holding breathes in (the corona swells), letting go breathes out, and each
 * full breath slows the heart and steadies the sky.
 */
export async function runBreath(app) {
  const { sky, input, heart, hud, fragments } = app;
  await fragments.play(C.intro);

  const root = document.getElementById('breath');
  const ring = document.getElementById('breath-ring');
  const dots = [...root.querySelectorAll('.breath__dot')];
  const skip = document.getElementById('skip');
  const length = 2 * Math.PI * Number(ring.getAttribute('r'));
  ring.style.strokeDasharray = String(length);
  ring.style.strokeDashoffset = String(length);
  skip.textContent = C.skip;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add('is-visible'));
  hud.hint(C.hintIdle, { strong: true });

  let phase = 'idle';
  let holdT = 0;
  let exhaleT = 0;
  let cycles = 0;
  let letGoShown = false;
  let calmTarget = sky.calm;
  let elapsed = 0;
  let skipShown = false;

  const setCycles = (n) => {
    cycles = n;
    dots.forEach((dot, i) => dot.classList.toggle('is-done', i < cycles));
    calmTarget = lerp(0.05, 1, cycles / BREATH.cycles);
    heart.setTarget(lerp(BREATH.bpmStart, BREATH.bpmEnd, cycles / BREATH.cycles));
  };

  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      off();
      resolve();
    };
    skip.addEventListener('click', () => {
      setCycles(BREATH.cycles);
      finish();
    });

    const off = app.onFrame((dt) => {
      elapsed += dt;
      const down = input.state.down;

      if (down && phase !== 'inhale') {
        phase = 'inhale';
        holdT = 0;
        letGoShown = false;
        hud.hint(C.hintInhale, { strong: true });
      }
      if (phase === 'inhale') {
        if (down) {
          holdT += dt;
          if (holdT >= BREATH.minHoldS && !letGoShown) {
            letGoShown = true;
            hud.hint(C.hintLetGo, { strong: true });
          }
        } else if (holdT >= BREATH.minHoldS) {
          setCycles(cycles + 1);
          phase = 'exhale';
          exhaleT = 0;
          hud.hint(C.hintExhale, { strong: true });
        } else {
          phase = 'idle';
          hud.hint(C.hintTooShort, { strong: true });
          sleep(2200).then(() => phase === 'idle' && hud.hint(C.hintIdle, { strong: true }));
        }
      } else if (phase === 'exhale') {
        exhaleT += dt;
        if (exhaleT >= BREATH.exhaleS * 0.7 && !down) {
          if (cycles >= BREATH.cycles) {
            hud.hint('');
            finish();
          } else {
            phase = 'idle';
            hud.hint(C.hintIdle, { strong: true });
          }
        }
      }

      const inhaling = phase === 'inhale' && down;
      sky.breath = clamp(sky.breath + (inhaling ? dt / BREATH.inhaleS : -dt / BREATH.exhaleS));
      sky.calm = damp(sky.calm, calmTarget, 1.1, dt);
      ring.style.strokeDashoffset = String(length * (1 - clamp(holdT / BREATH.inhaleS)));

      if (!skipShown && elapsed > BREATH.skipAfterS) {
        skipShown = true;
        skip.hidden = false;
        requestAnimationFrame(() => skip.classList.add('is-visible'));
      }
    });
  });

  skip.hidden = true;
  root.classList.remove('is-visible');
  setTimeout(() => (root.hidden = true), 900);
  hud.hint('');
  heart.setTarget(BREATH.bpmEnd);
  await fragments.play(C.outro);

  // the heartbeat fades out with the last of the panic
  const fade = app.heartFade();
  await fade;
  heart.stop();
  app.heartOn = false;
}
