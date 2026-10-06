import { CONTENT } from '../content.js';

/**
 * What is not the sky or the story: the sound button, the small mark at the top and the
 * instruction line at the bottom.
 */
export class Hud {
  constructor(soundtrack) {
    this.root = document.getElementById('hud');
    this.soundBtn = document.getElementById('sound-btn');
    this.hintEl = document.getElementById('hint');
    this.soundtrack = soundtrack;
    this.hintTimer = 0;
    this.#bindSound();
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
