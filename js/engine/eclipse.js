import { SKY } from '../config.js';
import { clamp, smoothstep } from '../util/math.js';

/** Area where two discs of radius r1 and r2, `d` apart, overlap. */
function overlapArea(d, r1, r2) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return a + b - c;
}

/**
 * The state of the sky: where the sun and moon are, how calm the scene is, how much light is back.
 * Everything the shader needs is derived from here; the story only moves these few numbers.
 */
export class Sky {
  constructor() {
    this.p = 0; // moon progress: 0 = covering the sun, 1 = far away
    this.calm = 0.55; // 0 = panic, 1 = calm
    this.breath = 0; // 0..1, swells while someone breathes in
    this.pulse = 0; // heartbeat flash
    this.glory = 0; // final warm lift
    this.reveal = 0; // fade in from black
    this.motion = 1; // 0 with reduced motion
    this.par = [0, 0]; // parallax, smoothed pointer position
    this.sun = { x: 0, y: 0, r: 1 };
    this.moon = { x: 0, y: 0, r: 1 };
    this.vis = 0;
    this.w = 1;
    this.h = 1;
  }

  /** Places the sun for the current viewport (portrait: upper middle; landscape: left, text on the right). */
  layout(w, h) {
    this.w = w;
    this.h = h;
    const landscape = w > h * 1.05;
    const spec = landscape ? SKY.landscape : SKY.portrait;
    this.sun = { x: w * spec.x, y: h * spec.y, r: Math.min(w, h) * spec.radius };
    document.body.classList.toggle('is-landscape', landscape);
    this.update(0);
  }

  /** Recomputes the moon and the visible fraction of the sun from `p` (and a little tremble when anxious). */
  update(time) {
    const { sun } = this;
    const [dx, dy] = SKY.moonDir;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const moonR = sun.r * SKY.moonScale;
    const tremble = (1 - this.calm) * sun.r * 0.006 * this.motion;
    const shakeX = Math.sin(time * 31.7) * tremble;
    const shakeY = Math.cos(time * 27.3) * tremble;
    const dist = Math.pow(Math.max(0, this.p), SKY.curve) * SKY.reach * sun.r;
    this.moon = { x: sun.x + ux * dist + shakeX, y: sun.y + uy * dist + shakeY, r: moonR };

    const d = Math.hypot(this.moon.x - sun.x, this.moon.y - sun.y);
    const covered = overlapArea(d, sun.r, moonR) / (Math.PI * sun.r * sun.r);
    this.vis = clamp(1 - covered);
    this.dir = [ux, uy];
  }

  uniforms(time) {
    return {
      time,
      sun: this.sun,
      moon: this.moon,
      moonDir: this.dir ?? SKY.moonDir,
      vis: this.vis,
      calm: this.calm,
      breath: this.breath,
      pulse: this.pulse,
      // the light keeps warming as the moon goes, then the ending lifts it to full
      glory: Math.max(this.glory, 0.55 * smoothstep(0.4, 1, this.p)),
      reveal: this.reveal,
      motion: this.motion,
      par: this.par,
    };
  }
}
