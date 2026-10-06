/** Tiny event emitter: `on` returns the function that removes the listener. */
export function createEmitter() {
  const listeners = new Map();
  return {
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => listeners.get(type)?.delete(fn);
    },
    emit(type, payload) {
      listeners.get(type)?.forEach((fn) => fn(payload));
    },
  };
}
