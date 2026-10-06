import { clamp } from '../util/math.js';

/**
 * A heartbeat that starts fast and settles. It is both a sound (Web Audio, two soft thumps) and the
 * pulse the sky flashes with, so the two always agree. If audio is locked or muted, the pulse
 * still runs: the sky keeps its rhythm in silence.
 *
 * Web Audio must be unlocked inside a real gesture: `unlock()` is called from the entry button.
 */
export class Heartbeat {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.running = false;
    this.bpm = 112;
    this.targetBpm = 112;
    this.level = 0; // 0..1, how present the heartbeat is
    this.audible = true; // false when the reader chose silence
    this.lastBeat = -10; // performance.now() / 1000 of the last "lub"
    this.timer = 0;

    for (const type of ['pointerup', 'touchend', 'click', 'keydown']) {
      document.addEventListener(type, () => this.#resume(), { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.#resume();
    });
  }

  /** Call inside the tap that opens the experience. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 900;
        this.master.connect(filter).connect(this.ctx.destination);
      } catch {
        this.ctx = null;
        return;
      }
    }
    this.#resume();
  }

  #resume() {
    if (this.ctx && this.ctx.state !== 'running') this.ctx.resume?.().catch(() => {});
  }

  start(bpm = 112) {
    this.bpm = this.targetBpm = bpm;
    if (this.running) return;
    this.running = true;
    this.#beat();
  }

  stop() {
    this.running = false;
    clearTimeout(this.timer);
  }

  setTarget(bpm) {
    this.targetBpm = bpm;
  }

  /** Master loudness 0..1 (the scene decides) and whether the reader wants sound at all. */
  setLevel(level, audible) {
    this.level = clamp(level);
    this.audible = audible;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(audible ? this.level * 0.9 : 0, this.ctx.currentTime, 0.25);
    }
  }

  /** The flash envelope for the sky: a big flash on the "lub" and a smaller one on the "dub". */
  pulseAt(nowSeconds) {
    const t = nowSeconds - this.lastBeat;
    if (t < 0 || t > 1.2) return 0;
    return Math.exp(-t * 9) + 0.55 * Math.exp(-Math.max(t - 0.2, 0) * 9) * (t > 0.2 ? 1 : 0);
  }

  #beat() {
    if (!this.running) return;
    const now = performance.now() / 1000;
    this.lastBeat = now;
    if (this.ctx && this.ctx.state === 'running' && this.audible && this.level > 0.01) {
      const at = this.ctx.currentTime + 0.02;
      this.#thump(at, 1, 74);
      this.#thump(at + 0.2, 0.62, 64);
    }
    this.bpm += (this.targetBpm - this.bpm) * 0.35;
    this.timer = setTimeout(() => this.#beat(), 60000 / this.bpm);
  }

  /** A soft low thump with a little upper body, so a phone speaker can reproduce it. */
  #thump(at, strength, freq) {
    const { ctx } = this;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(strength, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
    gain.connect(this.master);
    for (const [mult, amp] of [[1, 1], [2, 0.55], [3, 0.22]]) {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult * 1.6, at);
      osc.frequency.exponentialRampToValueAtTime(freq * mult * 0.7, at + 0.16);
      part.gain.value = amp;
      osc.connect(part).connect(gain);
      osc.start(at);
      osc.stop(at + 0.3);
    }
  }
}
