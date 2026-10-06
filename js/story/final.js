import { CONTACT } from '../config.js';
import { CONTENT } from '../content.js';
import { animate, sleep } from '../util/async.js';
import { easeInOut } from '../util/math.js';

const C = CONTENT.final;

function buildChoices(container) {
  const list = container.querySelector('.choices__list');
  list.replaceChildren(
    ...C.choices.map((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.id = choice.id;
      button.textContent = choice.label;
      return button;
    }),
  );
  container.querySelector('.choices__kicker').textContent = C.kicker;
  return [...list.children];
}

function whatsappLink(message) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Full light, then the one thing that is hers to decide, and the goodbye. */
export async function runFinal(app) {
  const { sky, fragments, hud } = app;
  animate(sky, 'glory', 1, 5200, easeInOut);
  animate(sky, 'p', 1.9, 7000, easeInOut); // the moon leaves the frame
  await sleep(1800);
  await fragments.play(C.lines);

  // her answer
  const box = document.getElementById('choices');
  const buttons = buildChoices(box);
  box.hidden = false;
  requestAnimationFrame(() => box.classList.add('is-visible'));
  const choice = await new Promise((resolve) => {
    for (const button of buttons) {
      button.addEventListener('click', () => resolve(C.choices.find((c) => c.id === button.dataset.id)), { once: true });
    }
  });
  buttons.forEach((b) => (b.disabled = true));
  buttons.find((b) => b.dataset.id === choice.id)?.classList.add('is-chosen');
  await sleep(900);
  box.classList.remove('is-visible');
  await sleep(900);
  box.hidden = true;

  await fragments.play(choice.reply);

  // sign-off
  const signoff = document.getElementById('signoff');
  const name = document.getElementById('signoff-name');
  const sign = document.getElementById('signoff-sign');
  name.textContent = C.name;
  sign.textContent = C.sign;
  signoff.hidden = false;
  await sleep(120);
  name.classList.add('is-in');
  await sleep(1700);
  sign.classList.add('is-in');

  const tell = document.getElementById('tell');
  if (CONTACT.whatsapp) {
    tell.textContent = C.tell;
    tell.href = whatsappLink(choice.message);
    tell.hidden = false;
    requestAnimationFrame(() => tell.classList.add('is-visible'));
  }

  await sleep(1800);
  document.getElementById('footer').classList.add('is-visible');
  hud.hint('');
}
