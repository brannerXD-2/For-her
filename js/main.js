import { Heartbeat } from './audio/heartbeat.js';
import { Soundtrack } from './audio/soundtrack.js';
import { AUDIO } from './config.js';
import { Sky } from './engine/eclipse.js';
import { SkyRenderer } from './engine/renderer.js';
import { Input } from './input/pointer.js';
import { runStory } from './story/director.js';
import { bindCredits } from './ui/credits.js';
import { Fragments } from './ui/fragments.js';
import { Hud } from './ui/hud.js';
import { animate } from './util/async.js';
import { clamp, damp } from './util/math.js';

const params = new URLSearchParams(location.search);
const debug = params.has('debug');

/** Frames slower than this, sustained, step the resolution down. */
const SLOW_FRAME_MS = 24;
const WARMUP_FRAMES = 90;
const WINDOW_FRAMES = 60;

async function boot() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('motion') === 'reduce';
  const sky = new Sky();
  sky.motion = reduced ? 0 : 1;

  const renderer = new SkyRenderer(document.getElementById('sky'));
  if (!renderer.ok) document.body.classList.add('no-gl');

  const input = new Input();
  const sound = new Soundtrack(AUDIO);
  const heart = new Heartbeat();
  const hud = new Hud(sound);
  const fragments = new Fragments(
    {
      root: document.getElementById('fragment'),
      text: document.getElementById('fragment-text'),
      next: document.getElementById('fragment-next'),
    },
    input,
  );
  bindCredits();

  const frameHooks = new Set();
  const app = {
    sky,
    input,
    sound,
    heart,
    hud,
    fragments,
    reduced,
    motion: !reduced,
    heartOn: false,
    heartGain: 1,
    heartFade: () => animate(app, 'heartGain', 0, 2600),
    onFrame(fn) {
      frameHooks.add(fn);
      return () => frameHooks.delete(fn);
    },
  };

  // ---- size ---------------------------------------------------------------------------------
  const resize = () => {
    renderer.resize(window.innerWidth, window.innerHeight);
    sky.layout(window.innerWidth, window.innerHeight);
  };
  resize();
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // ---- loop ---------------------------------------------------------------------------------
  let last = performance.now();
  let time = 0;
  let frames = 0;
  let windowMs = 0;

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    for (const hook of frameHooks) hook(dt);
    sound.update(dt);

    // gentle parallax: the pointer leans the world a little; a slow sway when nothing moves
    const targetX = reduced ? 0 : input.state.nx * 0.8 + Math.sin(time * 0.17) * 0.25;
    const targetY = reduced ? 0 : input.state.ny * 0.8 + Math.cos(time * 0.13) * 0.2;
    sky.par[0] = damp(sky.par[0], targetX, 2.2, dt);
    sky.par[1] = damp(sky.par[1], targetY, 2.2, dt);

    heart.setLevel(app.heartOn ? app.heartGain * (1 - sky.calm * 0.45) : 0, sound.wanted);
    sky.pulse = heart.running && app.heartOn ? heart.pulseAt(now / 1000) * (reduced ? 0.35 : 1) * (1 - sky.calm * 0.5) : 0;

    sky.update(time);
    if (renderer.ok) renderer.render(sky.uniforms(time));
    else document.body.style.setProperty('--vis', clamp(sky.vis).toFixed(3));

    // a phone that cannot keep up gets a slightly softer picture rather than a stutter
    frames++;
    if (frames > WARMUP_FRAMES) {
      windowMs += dt * 1000;
      if ((frames - WARMUP_FRAMES) % WINDOW_FRAMES === 0) {
        if (windowMs / WINDOW_FRAMES > SLOW_FRAME_MS && renderer.tier < renderer.maxTier) renderer.setTier(renderer.tier + 1);
        windowMs = 0;
      }
    }
    requestAnimationFrame(frame);
  };

  // fonts first, so the very first words never flash in a fallback face
  await Promise.race([
    Promise.all([
      document.fonts.load('400 1em "Instrument Serif"'),
      document.fonts.load('italic 400 1em "Instrument Serif"'),
      document.fonts.load('300 1em "DM Mono"'),
      document.fonts.load('400 1em "Geist Mono"'),
    ]),
    new Promise((resolve) => setTimeout(resolve, 1800)),
  ]);

  document.body.classList.remove('is-loading');
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
  if (debug) window.app = app;

  runStory(app, { from: params.get('from') ?? 'gate', station: Number(params.get('s') ?? 0) }).catch((error) => {
    console.error(error);
  });
}

boot();
