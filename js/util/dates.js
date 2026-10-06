/** The first 6: 6 de febrero de 2024. Everything in the experience counts from there. */
const FIRST_SIX = { year: 2024, month: 1 }; // month is 0-based: 1 = febrero

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const pad = (n) => String(n).padStart(2, '0');

/** How many times the 6th has come round since the first one (the first one itself not counted). */
export function sixesSince(now = new Date()) {
  let n = (now.getFullYear() - FIRST_SIX.year) * 12 + (now.getMonth() - FIRST_SIX.month);
  if (now.getDate() < 6) n -= 1;
  return Math.max(0, n);
}

/** "06 · feb · 2024" for the n-th 6 (0 = the first one). */
export function sixLabel(index) {
  const total = FIRST_SIX.month + index;
  const month = total % 12;
  const year = FIRST_SIX.year + Math.floor(total / 12);
  return `06 · ${MONTHS[month].slice(0, 3)} · ${year}`;
}

/** Today as "06 · octubre · 2026". */
export function todayLabel(now = new Date()) {
  return `${pad(now.getDate())} · ${MONTHS[now.getMonth()]} · ${now.getFullYear()}`;
}
