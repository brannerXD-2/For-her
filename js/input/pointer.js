import { INPUT } from '../config.js';
import { createEmitter } from '../util/emitter.js';

const UI_SELECTOR = 'button, a, [data-ui]';

/**
 * One pointer for everything: mouse, finger and keyboard fold into the same state and events,
 * so no interaction depends on hover or on one kind of device.
 *
 * Events: down, up, tap, drag { dx, dy }
 */
export class Input {
  constructor() {
    this.events = createEmitter();
    this.pointerId = null;
    this.lastMoveT = 0;
    this.state = {
      down: false,
      dragging: false,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      nx: 0,
      ny: 0,
      sx: 0,
      sy: 0,
      t0: 0,
      vx: 0,
      vy: 0,
      source: null,
      axis: { x: 0, y: 0 },
      lastActive: performance.now(),
    };

    const opts = { passive: false };
    document.addEventListener('pointerdown', this.#onDown, opts);
    document.addEventListener('pointermove', this.#onMove, opts);
    document.addEventListener('pointerup', this.#onUp, opts);
    document.addEventListener('pointercancel', this.#onUp, opts);
    document.addEventListener('keydown', this.#onKeyDown);
    document.addEventListener('keyup', this.#onKeyUp);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('wheel', (e) => this.events.emit('wheel', e), { passive: true });
    window.addEventListener('blur', () => this.#release('key'));
  }

  on(type, fn) {
    return this.events.on(type, fn);
  }

  get idleSeconds() {
    return (performance.now() - this.state.lastActive) / 1000;
  }

  #touch() {
    this.state.lastActive = performance.now();
  }

  #setPosition(x, y) {
    const s = this.state;
    s.x = x;
    s.y = y;
    s.nx = (x / window.innerWidth) * 2 - 1;
    s.ny = (y / window.innerHeight) * 2 - 1;
  }

  #press(x, y, source) {
    const s = this.state;
    s.down = true;
    s.dragging = false;
    s.t0 = performance.now();
    s.sx = x;
    s.sy = y;
    s.vx = s.vy = 0;
    s.source = source;
    this.#setPosition(x, y);
    this.#touch();
    this.events.emit('down', { x, y });
  }

  #release(source) {
    const s = this.state;
    if (!s.down || s.source !== source) return;
    const wasDrag = s.dragging;
    const duration = performance.now() - s.t0;
    if (performance.now() - this.lastMoveT > 90) s.vx = s.vy = 0;
    s.down = false;
    s.dragging = false;
    this.pointerId = null;
    this.#touch();
    if (!wasDrag && duration < INPUT.tapMs) this.events.emit('tap', { x: s.x, y: s.y });
    this.events.emit('up', { dragging: wasDrag, vx: s.vx, vy: s.vy });
  }

  #onDown = (e) => {
    if (e.target.closest?.(UI_SELECTOR)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.#press(e.clientX, e.clientY, 'pointer');
  };

  #onMove = (e) => {
    const s = this.state;
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    this.#setPosition(e.clientX, e.clientY);

    if (s.down && s.source === 'pointer') {
      let dragDx = dx;
      let dragDy = dy;
      if (!s.dragging && Math.hypot(e.clientX - s.sx, e.clientY - s.sy) > INPUT.tapSlop) {
        s.dragging = true;
        dragDx = e.clientX - s.sx;
        dragDy = e.clientY - s.sy;
      }
      if (s.dragging) {
        const dt = Math.max((e.timeStamp - this.lastMoveT) / 1000, 0.001);
        s.vx += (dx / dt - s.vx) * 0.35;
        s.vy += (dy / dt - s.vy) * 0.35;
        this.events.emit('drag', { dx: dragDx, dy: dragDy });
      }
    }
    this.lastMoveT = e.timeStamp;
    this.#touch();
  };

  #onUp = (e) => {
    if (e.pointerId !== this.pointerId) return;
    this.#release('pointer');
  };

  #onKeyDown = (e) => {
    const onControl = e.target.closest?.(UI_SELECTOR);
    const key = e.key;
    if ((key === ' ' || key === 'Enter') && !onControl) {
      e.preventDefault();
      if (!this.state.down && !e.repeat) this.#press(window.innerWidth / 2, window.innerHeight / 2, 'key');
      return;
    }
    const axis = this.state.axis;
    if (key === 'ArrowLeft' || key === 'ArrowUp') axis.x = -1;
    else if (key === 'ArrowRight' || key === 'ArrowDown') axis.x = 1;
    else return;
    e.preventDefault();
    this.#touch();
  };

  #onKeyUp = (e) => {
    const key = e.key;
    if (key === ' ' || key === 'Enter') {
      this.#release('key');
      return;
    }
    const axis = this.state.axis;
    if ((key === 'ArrowLeft' || key === 'ArrowUp') && axis.x < 0) axis.x = 0;
    if ((key === 'ArrowRight' || key === 'ArrowDown') && axis.x > 0) axis.x = 0;
  };
}
