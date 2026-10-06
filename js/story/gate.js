import { CONTENT } from '../content.js';
import { sleep, tween } from '../util/async.js';
import { easeInOut } from '../util/math.js';

function writeWords(el, text) {
  const words = text.split(' ');
  el.replaceChildren(
    ...words.flatMap((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      return i < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
    }),
  );
  return [...el.querySelectorAll('.word')];
}

/**
 * The first screen: the sky alone, one sentence, one button.
 * The button is a real <button>: on iPhone, a genuine tap (click) is the only gesture Safari
 * accepts for starting audio, so music and heartbeat are unlocked right inside that click.
 */
export async function runGate(app) {
  const { sky, sound, heart, motion } = app;
  const root = document.getElementById('gate');
  const kicker = document.getElementById('gate-kicker');
  const title = document.getElementById('gate-title');
  const sub = document.getElementById('gate-sub');
  const enter = document.getElementById('enter');
  const soundBtn = document.getElementById('gate-sound');
  const note = document.getElementById('gate-note');

  kicker.textContent = CONTENT.gate.kicker();
  const words = writeWords(title, CONTENT.gate.title);
  sub.textContent = CONTENT.gate.sub;
  note.textContent = CONTENT.gate.note;
  enter.querySelector('.enter__label').textContent = CONTENT.gate.enter;

  const syncSound = () => {
    soundBtn.textContent = sound.wanted ? CONTENT.gate.soundOn : CONTENT.gate.soundOff;
    soundBtn.setAttribute('aria-pressed', String(sound.wanted));
  };
  syncSound();
  soundBtn.addEventListener('click', () => {
    sound.toggle();
    syncSound();
  });

  sound.warmUp(); // start fetching the music now so the first tap can play it instantly

  tween(3400, (e) => (sky.reveal = e), easeInOut);
  await sleep(1500);
  kicker.classList.add('is-in');
  await sleep(900);
  for (const word of words) {
    word.classList.add('is-in');
    await sleep(motion ? 260 : 0);
  }
  await sleep(1500);
  sub.classList.add('is-in');
  await sleep(2400);
  enter.classList.add('is-in');
  soundBtn.classList.add('is-in');
  note.classList.add('is-in');
  enter.disabled = false;
  enter.focus({ preventScroll: true });

  await new Promise((resolve) => {
    enter.addEventListener(
      'click',
      () => {
        // Everything audio starts here, inside the click itself. No timer, no promise before it.
        sound.prime({ force: true });
        heart.unlock();
        enter.disabled = true;
        resolve();
      },
      { once: true },
    );
  });

  root.classList.add('is-leaving');
  await sleep(1400);
  root.hidden = true;
}
