import { SCRUB, SKY } from '../config.js';
import { CONTENT } from '../content.js';
import { clamp, damp } from '../util/math.js';

const [DX, DY] = (() => {
  const len = Math.hypot(...SKY.moonDir);
  return SKY.moonDir.map((v) => v / len);
})();

/**
 * Lets the reader move the moon with a drag (or the wheel, or the arrow keys).
 * The moon can only travel up to the next resting place: it cannot be rushed past a thought.
 */
class Scrub {
  constructor(app) {
    this.app = app;
    this.target = app.sky.p; // where the moon is heading
    this.floor = app.sky.p; // it may not go back past the previous resting place
    this.limit = app.sky.p; // nor ahead of the next one
    this.vel = 0; // progress per second (inertia after a flick)
    this.touchedAt = performance.now();
    this.pending = null;
    this.hintShown = false;
    this.moved = false;

    const { input } = app;
    input.on('drag', ({ dx, dy }) => {
      if (!this.pending) return;
      this.#push((dx * DX + dy * DY) / SCRUB.pxPerUnit);
      this.vel = 0;
    });
    input.on('up', ({ dragging, vx, vy }) => {
      if (!this.pending || !dragging) return;
      this.vel = (vx * DX + vy * DY) / SCRUB.pxPerUnit;
    });
    input.on('wheel', (event) => {
      if (!this.pending) return;
      this.#push((event.deltaY + event.deltaX) * SCRUB.wheel);
    });
    app.onFrame((dt) => this.#frame(dt));
  }

  #push(delta) {
    this.target = clamp(this.target + delta, this.floor, this.limit);
    this.touchedAt = performance.now();
    if (Math.abs(delta) > 0.0004 && !this.moved) {
      this.moved = true;
      this.app.hud.hint('');
    }
  }

  /** Resolves when the moon has settled at `limit`. */
  moveTo(limit, hint) {
    this.floor = this.limit;
    this.limit = limit;
    this.moved = false;
    this.hintShown = false;
    this.hintText = hint;
    this.touchedAt = performance.now();
    return new Promise((resolve) => (this.pending = resolve));
  }

  #frame(dt) {
    if (!this.pending) return;
    const { sky, input, hud } = this.app;
    const now = performance.now();
    const idleMs = now - this.touchedAt;

    if (!input.state.down) {
      if (Math.abs(this.vel) > 0.0002) {
        this.#push(this.vel * dt);
        this.vel *= Math.exp(-SCRUB.inertia * dt);
      }
      if (input.state.axis.x !== 0) this.#push(input.state.axis.x * SCRUB.keySpeed * dt);
      else if (idleMs > SCRUB.idleAutoMs) {
        // nobody touched the screen for a while: the moon drifts on its own, slowly
        this.target = clamp(this.target + SCRUB.autoSpeed * dt, this.floor, this.limit);
      }
    }

    // the instruction appears after a short while, and again after a long pause
    if (!this.moved && !this.hintShown && idleMs > 1800) {
      this.hintShown = true;
      hud.hint(this.hintText, { strong: true });
    } else if (this.moved && idleMs > 7000 && this.target < this.limit - 0.01) {
      this.moved = false;
      this.hintShown = true;
      hud.hint(CONTENT.light.moreHint, { strong: true });
    }

    sky.p = damp(sky.p, this.target, SCRUB.follow, dt);
    if (this.target >= this.limit - 1e-4 && sky.p >= this.limit - 0.0015) {
      sky.p = this.limit;
      const done = this.pending;
      this.pending = null;
      hud.hint('');
      done();
    }
  }
}

/** The moon leaves and the light returns, one resting place at a time. */
export async function runLight(app, { start = 0 } = {}) {
  const { sound, fragments } = app;
  const scrub = new Scrub(app);
  const { stations } = CONTENT.light;

  for (let i = start; i < stations.length; i++) {
    const station = stations[i];
    await scrub.moveTo(station.p, i === 0 ? CONTENT.light.dragHint : CONTENT.light.moreHint);
    if (i === 0) {
      // the first sliver of light: this is where the second piece of music takes over
      sound.cue('drop', { instant: true });
      sound.setLevel(0.72);
    }
    await fragments.play(station.fragments);
  }
}
