/** Opens and closes the credits dialog and gives focus back to whatever opened it. */
export function bindCredits() {
  const dialog = document.getElementById('credits');
  const close = document.getElementById('credits-close');
  let opener = null;

  const open = (trigger) => {
    opener = trigger;
    dialog.hidden = false;
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    close.focus({ preventScroll: true });
  };
  const hide = () => {
    dialog.classList.remove('is-open');
    setTimeout(() => (dialog.hidden = true), 450);
    opener?.focus?.({ preventScroll: true });
  };

  for (const trigger of document.querySelectorAll('[data-credits]')) {
    trigger.addEventListener('click', () => open(trigger));
  }
  document.getElementById('again').addEventListener('click', () => location.reload());
  close.addEventListener('click', hide);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dialog.hidden) hide();
  });
}
