/**
 * Every number that changes how the experience looks, moves or paces itself.
 * Words live in content.js.
 */

/**
 * Two pieces by Kevin MacLeod (CC BY 4.0), each a seamless loop, so the music follows a reader of any pace:
 * "Floating Cities" carries the shadow, "Dreamer" takes over at the first light (see README for the edits).
 */
export const AUDIO = {
  calm: 'assets/audio/sombra.mp3',
  drop: 'assets/audio/luz.mp3',
  body: 'assets/audio/luz.mp3',
};

/**
 * Optional: Branner's WhatsApp number, digits only with country code (e.g. '573001234567').
 * When it is empty the "tell Branner" buttons simply do not appear.
 */
export const CONTACT = {
  whatsapp: '',
};

export const READING = {
  baseMs: 1500,
  perWordMs: 200,
  maxMs: 9000,
  staggerMs: 800,
  fadeOutMs: 950,
  longTextChars: 96,
};

export const INPUT = {
  tapSlop: 12,
  tapMs: 320,
};

/** Where the eclipse sits on screen, relative to the viewport. */
export const SKY = {
  portrait: { x: 0.5, y: 0.35, radius: 0.165 }, // radius relative to the smaller side
  landscape: { x: 0.27, y: 0.42, radius: 0.18 },
  moonScale: 1.025, // the moon is a hair larger than the sun, as in a real total eclipse
  moonDir: [0.94, -0.34], // direction the moon leaves in (screen space, y down)
  reach: 2.7, // how far (in sun radii) the moon travels by progress = 1
  curve: 1, // progress → distance exponent
};

/** How the drag turns into moon progress. */
export const SCRUB = {
  pxPerUnit: 1050, // pixels of dragging for the whole 0..1 path
  inertia: 3.4, // higher = the glide stops sooner
  follow: 7.5, // how quickly the moon catches up with the target
  idleAutoMs: 16000, // after this long without touching, the moon starts drifting by itself
  autoSpeed: 0.014, // progress per second while drifting
  wheel: 0.00042,
  keySpeed: 0.16,
};

/** Breathing: three slow cycles calm the sky. */
export const BREATH = {
  cycles: 3,
  minHoldS: 2.2,
  inhaleS: 4,
  exhaleS: 5,
  bpmStart: 112,
  bpmEnd: 60,
  skipAfterS: 26,
};

/** Frame-time driven quality steps. */
export const QUALITY = [
  { dprCap: 2 },
  { dprCap: 1.6 },
  { dprCap: 1.25 },
  { dprCap: 1 },
  { dprCap: 0.75 },
];
