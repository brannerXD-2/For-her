import { CONTENT } from '../content.js';
import { clamp } from '../util/math.js';
import { sixesSince, sixLabel } from '../util/dates.js';

/**
 * What is not the sky or the story: the sound button, the small mark at the top and the
 * instruction line at the bottom.
 */
export class Hud {
  constructor(soundtrack) {
    this.root = document.getElementById('hud');
    this.soundBtn = document.getElementById('sound-btn');
    this.hintEl = document.getElementById('hint');
    this.dateEl = document.getElementById('hud-date');
    this.soundtrack = soundtrack;
    this.hintTimer = 0;
    this.sixes = sixesSince(); // how many 6ths lie between the first one and today
    this.sixIndex = -1;
    this.#bindSound();
    this.setTimeline(0);
  }

  /**
   * The little date at the top is the clock of the eclipse: as the moon leaves, the 6ths go by,
   * one month at a time, from the first (06 · feb · 2024) up to the latest one.
   */
  setTimeline(progress) {
    const index = Math.round(clamp(progress) * this.sixes);
    if (index === this.sixIndex) return;
    this.sixIndex = index;
    this.dateEl.textContent = sixLabel(index);
  }

  #bindSound() {
    // The bars only "breathe" while music is really playing. If it is wanted but the browser
    // refused to start it, one tap starts it instead of muting it.
    const sync = () => {
      const { active, wanted } = this.soundtrack;
      this.soundBtn.setAttribute('aria-pressed', String(active));
      this.soundBtn.dataset.attention = String(wanted && !active);
      this.soundBtn.setAttribute('aria-label', active ? CONTENT.hud.soundLabelOn : CONTENT.hud.soundLabelOff);
    };
    sync();
    this.soundtrack.onChange(sync);
    this.soundBtn.addEventListener('click', () => {
      if (this.soundtrack.wanted && !this.soundtrack.started) this.soundtrack.prime({ force: true });
      else this.soundtrack.toggle();
    });
  }

  showControls() {
    this.root.classList.add('is-visible');
  }

  /** Short instruction line at the bottom. Empty text hides it. */
  hint(text, { strong = false } = {}) {
    clearTimeout(this.hintTimer);
    if (!text) {
      this.hintEl.classList.remove('is-visible');
      return;
    }
    if (this.hintEl.classList.contains('is-visible') && this.hintEl.textContent !== text) {
      this.hintEl.classList.remove('is-visible');
      this.hintTimer = setTimeout(() => this.#write(text, strong), 600);
    } else {
      this.#write(text, strong);
    }
  }

  #write(text, strong) {
    this.hintEl.textContent = text;
    this.hintEl.classList.toggle('is-strong', strong);
    requestAnimationFrame(() => this.hintEl.classList.add('is-visible'));
  }
}
