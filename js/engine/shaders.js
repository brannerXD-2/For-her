/**
 * The whole sky is one fragment shader (WebGL 1 / GLSL ES 1.00, so it runs everywhere).
 * Layers, back to front: sky gradient → stars → sun glow → corona → sun disc → moon → bloom
 * → dust → mountains and the lights of the valley → vignette, grain, tone mapping.
 */

export const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2  uRes;      // canvas size in device pixels
uniform float uDpr;
uniform float uTime;     // seconds
uniform vec3  uSun;      // centre x, y (device px, y down) and radius
uniform vec3  uMoon;     // same for the moon
uniform vec2  uMoonDir;  // unit vector from the sun towards the moon's path
uniform float uVis;      // fraction of the sun's disc that is visible, 0..1
uniform float uCalm;     // 0 = panic, 1 = calm
uniform float uPulse;    // heartbeat envelope
uniform float uGlory;    // final warm lift
uniform float uReveal;   // fade in from black
uniform float uMotion;   // 0 when reduced motion is on
uniform vec2  uPar;      // parallax offset, -1..1

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.07 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;
}

// One gaussian star per cell, jittered inside the cell so it never crosses a border.
float stars(vec2 p, float cell, float density, float size, float seed) {
  vec2 id = floor(p / cell);
  vec2 f = fract(p / cell);
  float h = hash21(id + seed * 7.31);
  if (h > density) return 0.0;
  vec2 pos = vec2(hash21(id + seed * 3.7 + 1.9), hash21(id + seed * 5.1 + 8.3)) * 0.7 + 0.15;
  float d = length((f - pos) * cell);
  float b = exp(-(d * d) / (size * size));
  float tw = 0.7 + 0.3 * sin(uTime * (0.7 + h * 4.0) * uMotion + h * 60.0);
  return b * tw * (0.35 + 0.65 * hash21(id + seed * 9.9 + 4.4));
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = frag / uRes;
  float dpr = uDpr;
  float R = uSun.z;
  float aa = 1.0 * dpr;

  float day = smoothstep(0.0, 0.95, uVis);

  // ---- sky -----------------------------------------------------------------------------------
  float hy = clamp(frag.y / (uRes.y * 0.78), 0.0, 1.0);
  vec3 skyNight = mix(vec3(0.010, 0.013, 0.030), vec3(0.034, 0.036, 0.066), hy * hy);
  vec3 skyDay = mix(vec3(0.040, 0.100, 0.260), vec3(0.560, 0.300, 0.340), smoothstep(0.0, 0.58, hy));
  skyDay = mix(skyDay, vec3(1.000, 0.560, 0.200), smoothstep(0.42, 1.0, hy));
  skyDay += uGlory * vec3(0.20, 0.10, 0.03) * hy;
  vec3 sky = mix(skyNight, skyDay, day);

  vec2 dv = frag - uSun.xy;
  float dS = length(dv);
  float r = dS / R;
  vec2 dirS = dv / max(dS, 0.001);

  // light that comes back, spreading from the sun
  sky += vec3(1.0, 0.68, 0.34) * day * (0.50 + 0.40 * uGlory) * exp(-r * 0.5);
  sky += vec3(1.0, 0.82, 0.55) * day * (0.30 + 0.35 * uGlory) * exp(-r * 1.5);

  // slanting rays of light once the sun is back
  float rays = pow(noise(dirS * 3.2 + vec2(uTime * 0.02 * uMotion, 1.0)), 2.0) * 0.7
             + pow(noise(dirS * 7.5 + vec2(-uTime * 0.015 * uMotion, 7.0)), 3.0) * 0.6;
  sky += vec3(1.0, 0.72, 0.42) * rays * exp(-r * 0.2) * day * (0.12 + 0.30 * uGlory) * smoothstep(1.0, 1.8, r);

  // during totality the whole horizon glows like a sunset all around
  float horizonBand = exp(-abs(frag.y - uRes.y * 0.70) / (uRes.y * 0.075));
  sky += vec3(0.95, 0.40, 0.22) * horizonBand * 0.20 * (1.0 - day) * (0.55 + 0.45 * uCalm);

  // ---- stars ---------------------------------------------------------------------------------
  float starVis = 1.0 - smoothstep(0.0, 0.55, day);
  vec2 sp = frag + uPar * dpr * vec2(7.0, 5.0);
  float st = stars(sp, 82.0 * dpr, 0.45, 0.95 * dpr, 1.0)
           + stars(sp * 0.93 + 40.0, 47.0 * dpr, 0.40, 0.75 * dpr, 2.0) * 0.8
           + stars(sp * 1.07 + 90.0, 26.0 * dpr, 0.36, 0.60 * dpr, 3.0) * 0.55
           + stars(sp * 0.8 + 7.0, 190.0 * dpr, 0.30, 1.7 * dpr, 4.0) * 1.2;
  sky += vec3(0.86, 0.90, 1.0) * st * starVis * smoothstep(1.2, 2.6, r);

  // ---- corona --------------------------------------------------------------------------------
  float ang = atan(dv.y, dv.x);
  float stretch = 1.0 + 0.8 * pow(abs(cos(ang + 0.25)), 2.0);
  float rr = r / stretch * mix(1.4, 1.0, uCalm);
  vec3 corona = vec3(0.0);
  if (rr < 14.0) {
    float t = uTime * mix(0.06, 0.012, uCalm) * uMotion;
    float body = exp(-(rr - 1.0) * 2.1) * 0.95 + pow(max(rr, 0.001), -2.5) * 0.45;
    float streamers = fbm(dirS * 3.3 + vec2(rr * 0.18, t));
    float fine = noise(dirS * 15.0 + vec2(rr * 0.6, -t * 3.0));
    float flick = noise(dirS * 6.0 + vec2(uTime * 3.7, uTime * 2.9) * uMotion) - 0.5;
    float shape = mix(0.35, 1.55, streamers) * (0.8 + 0.4 * fine);
    shape *= 1.0 + (1.0 - uCalm) * 0.7 * flick;
    float amt = body * shape * smoothstep(R - aa, R + aa, dS);
    amt *= 1.0 + uPulse * 0.55;

    vec3 cc = mix(vec3(1.0, 0.90, 0.66), vec3(1.0, 0.60, 0.22), smoothstep(1.0, 2.6, rr));
    cc = mix(cc, vec3(0.62, 0.22, 0.30), smoothstep(2.4, 7.0, rr));
    cc = mix(cc, cc * vec3(1.0, 0.5, 0.55), (1.0 - uCalm) * 0.45);
    corona = cc * amt * mix(0.8, 1.15, uCalm);

    // pink prominences just outside the limb
    float prom = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float a0 = 0.9 + fi * 2.3;
      float da = abs(mod(ang - a0 + 3.14159, 6.28318) - 3.14159);
      float h = 1.10 + 0.07 * fi;
      prom += exp(-da * da * 220.0) * (1.0 - smoothstep(1.03, h, r)) * smoothstep(1.02, 1.035, r);
    }
    corona += vec3(1.0, 0.28, 0.38) * prom * 1.1;
  }
  corona *= 1.0 - 0.9 * day;

  // ---- sun, moon ----------------------------------------------------------------------------
  float sunM = 1.0 - smoothstep(R - aa, R + aa, dS);
  float dM = length(frag - uMoon.xy);
  float moonM = 1.0 - smoothstep(uMoon.z - aa, uMoon.z + aa, dM);
  float mu = sqrt(max(0.0, 1.0 - r * r));
  vec3 sunCol = vec3(1.0, 0.84, 0.54) * (0.6 + 0.4 * mu) * 3.4;

  vec3 col = sky;
  col += corona * (1.0 - moonM);
  col = mix(col, sunCol, sunM * (1.0 - moonM));

  vec2 mp = (frag - uMoon.xy) / uMoon.z;
  float mtex = fbm3(mp * 3.0 + 4.0);
  vec3 moonCol = vec3(0.006, 0.007, 0.012) * (0.65 + 0.7 * mtex);
  moonCol = mix(moonCol, vec3(0.018, 0.017, 0.026), day);
  float rim = smoothstep(0.82, 1.0, length(mp));
  moonCol += vec3(1.0, 0.55, 0.25) * rim * 0.05 * (1.0 - day);
  col = mix(col, moonCol, moonM);

  // ---- bloom and the diamond ring -----------------------------------------------------------
  vec2 bc = uSun.xy - uMoonDir * R * (1.0 - uVis) * 0.92;
  float db = length(frag - bc) / R;
  float sv = sqrt(uVis);
  float ringB = smoothstep(0.0, 0.05, sv) * (1.0 - smoothstep(0.14, 0.62, sv));
  float vv = pow(uVis, 0.4);
  float bloom = (0.55 * exp(-db * 2.0) + 0.10 / (db * db + 0.25)) * vv * (1.0 + ringB * 1.6);
  bloom += ringB * 1.5 * exp(-db * 4.5) + ringB * 0.5 * exp(-db * 1.1);
  col += vec3(1.0, 0.82, 0.55) * bloom * (1.0 - 0.5 * day);
  float streak = exp(-abs(frag.y - bc.y) / (R * 0.018)) * exp(-abs(frag.x - bc.x) / (R * 1.5));
  col += vec3(1.0, 0.72, 0.42) * streak * ringB * 0.55 * uMotion * (1.0 - moonM);

  // ---- dust in the warm light ---------------------------------------------------------------
  float dust = stars(frag + vec2(sin(uTime * 0.12) * 18.0 * dpr, uTime * 9.0 * dpr * uMotion), 58.0 * dpr, 0.30, 1.5 * dpr, 5.0)
             + stars(frag * 0.8 + vec2(0.0, uTime * 5.0 * dpr * uMotion) + 300.0, 90.0 * dpr, 0.24, 2.1 * dpr, 6.0) * 0.8;
  col += vec3(1.0, 0.80, 0.52) * dust * day * (0.35 + 0.65 * uGlory) * 0.55;

  // ---- mountains and the lights of the valley ------------------------------------------------
  float H = uRes.y;
  if (frag.y > H * 0.60) {
    float xn = frag.x / H;
    vec3 horizonCol = mix(vec3(0.030, 0.035, 0.062), vec3(1.0, 0.66, 0.38), day);
    horizonCol += uGlory * vec3(0.12, 0.06, 0.02);

    float yFar = H * 0.730 - H * 0.085 * fbm3(vec2(xn * 6.0 + 3.0 + uPar.x * 0.02, 1.7));
    float yMid = H * 0.790 - H * 0.075 * fbm3(vec2(xn * 7.5 + 9.0 + uPar.x * 0.04, 4.1));
    float yNear = H * 0.885 - H * 0.060 * fbm3(vec2(xn * 4.5 + 15.0 + uPar.x * 0.07, 8.3));

    float mFar = smoothstep(yFar - aa, yFar + aa, frag.y);
    float mMid = smoothstep(yMid - aa, yMid + aa, frag.y);
    float mNear = smoothstep(yNear - aa, yNear + aa, frag.y);

    col = mix(col, horizonCol * 0.50, mFar * 0.94);
    col = mix(col, horizonCol * 0.20, mMid);

    // warm rim light along the middle ridge
    float rimM = exp(-max(frag.y - yMid, 0.0) / (3.0 * dpr)) * mMid;
    col += vec3(1.0, 0.62, 0.30) * rimM * day * 0.35;

    // lights: they switch on when the sun goes out and fade as it comes back
    float lightsOn = 0.20 + 0.80 * (1.0 - smoothstep(0.0, 0.40, uVis));
    float cell = 7.0 * dpr;
    vec2 lc = frag / cell;
    vec2 lid = floor(lc);
    vec2 lpos = vec2(hash21(lid + 1.3), hash21(lid + 6.1)) * 0.7 + 0.15;
    float ld = length((fract(lc) - lpos) * cell);
    float below = (frag.y - yMid) / H;
    float cluster = smoothstep(0.40, 0.62, fbm3(lc * 0.06 + 3.0));
    float spot = step(0.70, hash21(lid)) * cluster;
    float lamp = exp(-(ld * ld) / (1.1 * dpr * dpr * (0.6 + hash21(lid + 2.2)))) * spot;
    float band = smoothstep(0.004, 0.014, below) * (1.0 - smoothstep(0.05, 0.095, below));
    float blink = 0.7 + 0.3 * sin(uTime * (1.0 + hash21(lid) * 3.0) * uMotion + hash21(lid + 5.0) * 40.0);
    col += vec3(1.0, 0.74, 0.38) * lamp * band * mMid * (1.0 - mNear) * lightsOn * blink * (1.0 - 0.75 * day) * 1.7;

    col = mix(col, vec3(0.010, 0.011, 0.018) + horizonCol * 0.04, mNear);
  }

  // ---- finish -------------------------------------------------------------------------------
  col *= mix(1.0, 0.6, smoothstep(0.72, 1.0, uv.y));
  float vg = length((uv - vec2(0.5, 0.45)) * vec2(1.0, 0.9));
  col *= 1.0 - 0.55 * smoothstep(0.35, 0.95, vg);
  col = 1.0 - exp(-col * 1.35);
  float grain = hash21(frag + floor(uTime * 24.0) * 1.37) - 0.5;
  col += grain * 0.03 * uMotion + grain * 0.012;
  col *= uReveal;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
