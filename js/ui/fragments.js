import { READING } from '../config.js';
import { sleep } from '../util/async.js';

const wordCount = (lines) => lines.join(' ').split(/\s+/).filter(Boolean).length;
const readingMs = (lines) => Math.min(READING.maxMs, READING.baseMs + wordCount(lines) * READING.perWordMs);

/**
 * Shows the story one fragment at a time. The lines of a fragment fade in one after another;
 * a quiet dot says "tap when you're ready". Fragments queue, so callers just `await` them in order.
 */
export class Fragments {
  constructor({ root, text, next }, input) {
    this.root = root;
    this.text = text;
    this.next = next;
    this.chain = Promise.resolve();
    this.waiting = null; // resolve() of the fragment that waits for a tap
    input.on('tap', () => this.advance());
  }

  advance() {
    if (!this.waiting) return;
    const resolve = this.waiting;
    this.waiting = null;
    resolve();
  }

  /**
   * Plays fragments in order, each leaving with a tap. `onShow(index)` runs as each appears.
   * Resolves when the last one has left.
   */
  play(fragments, { onShow } = {}) {
    const job = async () => {
      for (const [index, lines] of fragments.entries()) {
        onShow?.(index);
        await this.#show(lines);
        await this.#waitForTap(readingMs(lines));
        await this.#hide();
      }
    };
    const run = this.chain.then(job);
    this.chain = run.catch(() => {});
    return run;
  }

  async #show(lines) {
    const chars = lines.join('').length;
    this.root.dataset.size = chars > READING.longTextChars ? 'long' : '';
    this.text.replaceChildren(
      ...lines.map((line) => {
        const span = document.createElement('span');
        span.className = 'line';
        span.textContent = line;
        return span;
      }),
    );
    await sleep(60);
    const spans = [...this.text.children];
    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.add('is-in');
      if (i < spans.length - 1) await sleep(READING.staggerMs);
    }
  }

  async #waitForTap(dwellMs) {
    await sleep(dwellMs);
    this.next.classList.add('is-ready');
    await new Promise((resolve) => (this.waiting = resolve));
    this.next.classList.remove('is-ready');
  }

  async #hide() {
    this.next.classList.remove('is-ready');
    [...this.text.children].forEach((span) => span.classList.add('is-out'));
    await sleep(READING.fadeOutMs);
    this.text.replaceChildren();
  }
}
