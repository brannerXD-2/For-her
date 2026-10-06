import { QUALITY } from '../config.js';
import { FRAGMENT, VERTEX } from './shaders.js';

const UNIFORMS = [
  'uRes', 'uDpr', 'uTime', 'uSun', 'uMoon', 'uMoonDir', 'uVis', 'uCalm', 'uBreath',
  'uPulse', 'uGlory', 'uReveal', 'uMotion', 'uPar',
];

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader: ${log}`);
  }
  return shader;
}

/**
 * Draws the sky: one full-screen triangle, one shader. Resolution steps down on its own when the
 * device cannot keep up, and the context is rebuilt if the phone takes it away in the background.
 */
export class SkyRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ok = false;
    this.tier = 0;
    this.cssW = 1;
    this.cssH = 1;
    this.dpr = 1;
    this.locations = {};

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.ok = false;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.#init();
      this.resize(this.cssW, this.cssH);
    });
    this.#init();
  }

  #init() {
    try {
      const gl =
        this.canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }) ||
        this.canvas.getContext('experimental-webgl');
      if (!gl) throw new Error('WebGL no disponible');
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      this.locations = {};
      for (const name of UNIFORMS) this.locations[name] = gl.getUniformLocation(program, name);
      this.gl = gl;
      this.ok = true;
    } catch (error) {
      console.warn('[cielo]', error);
      this.ok = false;
    }
  }

  setTier(tier) {
    const next = Math.max(0, Math.min(QUALITY.length - 1, tier));
    if (next === this.tier) return false;
    this.tier = next;
    this.resize(this.cssW, this.cssH);
    return true;
  }

  get maxTier() {
    return QUALITY.length - 1;
  }

  /** Size in CSS pixels; the backing store follows the quality tier. */
  resize(cssW, cssH) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = Math.min(window.devicePixelRatio || 1, QUALITY[this.tier].dprCap);
    this.canvas.width = Math.max(1, Math.round(cssW * this.dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * this.dpr));
    if (this.ok) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /** `u` carries the uniforms; coordinates are in CSS pixels and are scaled here. */
  render(u) {
    if (!this.ok) return;
    const { gl, locations: L, dpr } = this;
    gl.uniform2f(L.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(L.uDpr, dpr);
    gl.uniform1f(L.uTime, u.time);
    gl.uniform3f(L.uSun, u.sun.x * dpr, u.sun.y * dpr, u.sun.r * dpr);
    gl.uniform3f(L.uMoon, u.moon.x * dpr, u.moon.y * dpr, u.moon.r * dpr);
    gl.uniform2f(L.uMoonDir, u.moonDir[0], u.moonDir[1]);
    gl.uniform1f(L.uVis, u.vis);
    gl.uniform1f(L.uCalm, u.calm);
    gl.uniform1f(L.uBreath, u.breath);
    gl.uniform1f(L.uPulse, u.pulse);
    gl.uniform1f(L.uGlory, u.glory);
    gl.uniform1f(L.uReveal, u.reveal);
    gl.uniform1f(L.uMotion, u.motion);
    gl.uniform2f(L.uPar, u.par[0], u.par[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
