/**
 * Gera a arte de fundo (SVG) da landing page da Imbaú Imobiliária.
 *
 * São cenas arquitetônicas ilustrativas — névoa em camadas, profundidade
 * desfocada, vidro iluminado e reflexo n'água — feitas para segurar o clima
 * "alto padrão" enquanto as fotos reais dos imóveis não entram.
 * Para trocar por fotografia de verdade, veja src/conteudo.js.
 *
 *   node tools/make-art.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/imagens');

/* ---------- utilidades ---------- */

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v) => Number(v).toFixed(1);

/** Cordilheira: cume irregular suavizado, fechado até o horizonte. */
function ridge(seed, w, baseY, amp, steps, floor) {
  const rand = rng(seed);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push([(w / steps) * i, baseY - amp * (0.25 + 0.75 * rand())]);
  }
  let d = `M -80 ${n(floor)} L -80 ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    d += ` Q ${n(x0)} ${n(y0)} ${n((x0 + x1) / 2)} ${n((y0 + y1) / 2)}`;
  }
  d += ` L ${n(w + 80)} ${n(pts.at(-1)[1])} L ${n(w + 80)} ${n(floor)} Z`;
  return d;
}

/** Conífera esguia em silhueta — irregular o bastante para não virar clip-art. */
function tree(x, base, height, width, fill, seed) {
  const rand = rng(seed);
  const steps = 9;
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = base - height * t;
    const taper = Math.pow(1 - t, 1.5);
    left.push([x - (width / 2) * taper * (0.6 + 0.7 * rand()), y]);
    right.push([x + (width / 2) * taper * (0.6 + 0.7 * rand()), y]);
  }
  const d =
    `M ${n(x)} ${n(base)} ` +
    left.map(([px, py]) => `L ${n(px)} ${n(py)}`).join(' ') +
    ` L ${n(x)} ${n(base - height)} ` +
    right
      .reverse()
      .map(([px, py]) => `L ${n(px)} ${n(py)}`)
      .join(' ') +
    ' Z';
  return `<path d="${d}" fill="${fill}"/>`;
}

/**
 * Volume arquitetônico: laje, corpo escuro e fita de vidro iluminado.
 * As baias variam de brilho (algumas apagadas) — luz uniforme entrega
 * na hora que a cena é vetor.
 */
function volume({ x, y, w, h, bays = 6, seed = 1, top = 0.2, bottom = 0.84, warm = 'a', dim = 1 }) {
  const rand = rng(seed);
  const gy = y + h * top;
  const gh = h * (bottom - top);
  const bw = w / bays;
  let glass = '';
  for (let i = 0; i < bays; i++) {
    const r = rand();
    // uma baia em cada cinco fica apagada: dá leitura de casa habitada
    const lit = r > 0.18;
    const op = (lit ? 0.45 + r * 0.5 : 0.1) * dim;
    const bx = x + i * bw + bw * 0.07;
    glass +=
      `<rect x="${n(bx)}" y="${n(gy)}" width="${n(bw * 0.86)}" height="${n(gh)}" fill="url(#glass-${warm})" opacity="${n(op)}"/>` +
      `<rect x="${n(bx + bw * 0.41)}" y="${n(gy)}" width="${n(Math.max(1, bw * 0.035))}" height="${n(gh)}" fill="#05070c" opacity=".6"/>`;
  }
  return `
  <g>
    <ellipse cx="${n(x + w / 2)}" cy="${n(gy + gh * 0.55)}" rx="${n(w * 0.66)}" ry="${n(gh * 2.1)}" fill="url(#bloom)" opacity="${n(0.5 * dim)}" filter="url(#blurLg)"/>
    <rect x="${n(x - w * 0.025)}" y="${n(y)}" width="${n(w * 1.05)}" height="${n(h * 0.075)}" fill="#080c13"/>
    <rect x="${n(x - w * 0.025)}" y="${n(y)}" width="${n(w * 1.05)}" height="${n(Math.max(1, h * 0.008))}" fill="#3c4757" opacity=".5"/>
    <rect x="${n(x)}" y="${n(y + h * 0.075)}" width="${n(w)}" height="${n(h * 0.925)}" fill="#070a11"/>
    ${glass}
    <rect x="${n(x)}" y="${n(y + h * bottom)}" width="${n(w)}" height="${n(h * (1 - bottom))}" fill="#05080e"/>
  </g>`;
}

/* ---------- cena ---------- */

function scene({
  w,
  h,
  sky,
  haze,
  glowY = 0.62,
  waterY,
  ridges,
  build,
  trees: treeSpec = [],
  clouds = 4,
  grain = 0.07,
  vignette = 0.6,
  grade = ['#0e2233', '#c98b4b'],
  reflectOpacity = 0.3,
}) {
  const horizon = h * waterY;
  const construcoes = build({ w, h, horizon });
  const arvores = treeSpec
    .map((t, i) => tree(t.x * w, horizon + (t.drop ?? 0), t.h * h, t.w * w, t.fill, 400 + i * 37))
    .join('');
  const world = construcoes + arvores;

  const cloudRand = rng(91);
  const cloudSvg = Array.from({ length: clouds }, (_, i) => {
    const cy = h * (0.12 + 0.4 * (i / clouds)) + cloudRand() * h * 0.05;
    const rx = w * (0.28 + cloudRand() * 0.3);
    return `<ellipse cx="${n(w * cloudRand())}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(h * (0.02 + cloudRand() * 0.03))}" fill="${haze}" opacity="${n(0.05 + cloudRand() * 0.07)}" filter="url(#blurLg)"/>`;
  }).join('');

  const ridgeSvg = ridges
    .map((r, i) => {
      const top = horizon - r.lift * h - r.amp * h;
      return `
    <g filter="url(#blur${r.blur ?? 'Md'})">
      <path d="${ridge(r.seed ?? 7 + i * 13, w, horizon - r.lift * h, r.amp * h, r.steps ?? 9, horizon + h * 0.02)}" fill="${r.fill}"/>
    </g>
    <rect x="-20" y="${n(top)}" width="${n(w + 40)}" height="${n(horizon - top)}" fill="url(#haze)" opacity="${r.haze ?? 0.45}"/>`;
    })
    .join('');

  const defs = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      ${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="${glowY * 100}%" r="60%">
      <stop offset="0" stop-color="${haze}" stop-opacity=".5"/>
      <stop offset=".6" stop-color="${haze}" stop-opacity=".12"/>
      <stop offset="1" stop-color="${haze}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${haze}" stop-opacity="0"/>
      <stop offset="1" stop-color="${haze}" stop-opacity=".9"/>
    </linearGradient>
    <linearGradient id="glass-a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe9c4"/>
      <stop offset=".6" stop-color="#e9b877"/>
      <stop offset="1" stop-color="#a86f34"/>
    </linearGradient>
    <linearGradient id="glass-b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff3da"/>
      <stop offset="1" stop-color="#e0a94f"/>
    </linearGradient>
    <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#f6c67e" stop-opacity=".85"/>
      <stop offset=".5" stop-color="#e0a45f" stop-opacity=".28"/>
      <stop offset="1" stop-color="#e0a45f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#101a28" stop-opacity=".15"/>
      <stop offset=".45" stop-color="#080d16" stop-opacity=".6"/>
      <stop offset="1" stop-color="#04060b" stop-opacity=".97"/>
    </linearGradient>
    <linearGradient id="grade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${grade[0]}"/>
      <stop offset="1" stop-color="${grade[1]}"/>
    </linearGradient>
    <filter id="blurSm" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${n(w * 0.0015)}"/></filter>
    <filter id="blurMd" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${n(w * 0.004)}"/></filter>
    <filter id="blurLg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${n(w * 0.012)}"/></filter>
    <filter id="reflect" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="${n(w * 0.002)} ${n(w * 0.006)}"/>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <radialGradient id="vig" cx="50%" cy="42%" r="76%">
      <stop offset=".4" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="${vignette}"/>
    </radialGradient>
    <clipPath id="agua"><rect x="0" y="${n(horizon)}" width="${w}" height="${n(h - horizon)}"/></clipPath>
  </defs>`;

  /**
   * A cena em planos, do fundo para a frente. Juntos são a imagem única de
   * sempre; separados, viram o multiplano da capa — cada plano andando a uma
   * velocidade diferente na rolagem, que é o que produz profundidade de
   * verdade em vez de uma foto deslizando.
   */
  const partes = {
    ceu: `
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${cloudSvg}
  <rect width="${w}" height="${h}" fill="url(#sun)"/>`,

    serras: ridgeSvg,

    cena: `
  <g id="mundo">${construcoes}</g>

  <g clip-path="url(#agua)">
    <g transform="matrix(1 0 0 -1 0 ${n(horizon * 2)})" opacity="${reflectOpacity}" filter="url(#reflect)">${world}</g>
    <rect x="0" y="${n(horizon)}" width="${w}" height="${n(h - horizon)}" fill="url(#water)"/>
    ${Array.from({ length: 34 }, (_, i) => {
      const t = i / 33;
      const y = horizon + (h - horizon) * Math.pow(t, 1.8);
      return `<rect x="${n(-w * 0.02)}" y="${n(y)}" width="${n(w * 1.04)}" height="${n(1 + t * 3)}" fill="#b9cfe4" opacity="${n(0.05 * (1 - t) + 0.008)}"/>`;
    }).join('')}
  </g>`,

    arvores: arvores,

    ar: `
  <rect width="${w}" height="${h}" fill="url(#grade)" opacity=".16" style="mix-blend-mode:soft-light"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>`,
  };

  const embrulha = (miolo) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img">${defs}
${miolo}
</svg>`;

  return {
    inteira: embrulha(Object.values(partes).join('\n')),
    camadas: Object.fromEntries(
      Object.entries(partes).map(([nome, miolo]) => [nome, embrulha(miolo)])
    ),
  };
}

/* ---------- as quatro cenas ---------- */

const cenas = {
  // Hero: pavilhão baixo à beira do lago, névoa alta, casa deslocada à direita.
  'hero-lago': scene({
    w: 2400,
    h: 1350,
    waterY: 0.76,
    glowY: 0.66,
    haze: '#8aa2bb',
    vignette: 0.62,
    sky: [
      ['0', '#05080e'],
      ['.38', '#0d1522'],
      ['.66', '#1e2c40'],
      ['.88', '#41556e'],
      ['1', '#5b7189'],
    ],
    ridges: [
      { lift: 0.22, amp: 0.2, fill: '#243349', haze: 0.62, blur: 'Lg', seed: 3 },
      { lift: 0.11, amp: 0.15, fill: '#182334', haze: 0.4, blur: 'Md', seed: 11 },
      { lift: 0.02, amp: 0.09, fill: '#0e1620', haze: 0.2, blur: 'Sm', seed: 23 },
    ],
    build: ({ w, horizon }) => `
      ${volume({ x: w * 0.06, y: horizon - w * 0.042, w: w * 0.17, h: w * 0.042, bays: 4, seed: 8, dim: 0.32 })}
      ${volume({ x: w * 0.36, y: horizon - w * 0.056, w: w * 0.44, h: w * 0.056, bays: 11, seed: 21, dim: 0.62 })}
      <rect x="${n(w * 0.02)}" y="${n(horizon - 5)}" width="${n(w * 0.96)}" height="9" fill="#060910"/>
      <ellipse cx="${n(w * 0.58)}" cy="${n(horizon + 4)}" rx="${n(w * 0.26)}" ry="30" fill="#f6c67e" opacity=".13" filter="url(#blurLg)"/>`,
    trees: [
      { x: 0.025, h: 0.23, w: 0.035, fill: '#080d14', drop: 6 },
      { x: 0.075, h: 0.16, w: 0.026, fill: '#0a1018', drop: 6 },
      { x: 0.955, h: 0.26, w: 0.038, fill: '#080d14', drop: 6 },
      { x: 0.9, h: 0.18, w: 0.028, fill: '#0a1018', drop: 6 },
      { x: 0.86, h: 0.13, w: 0.022, fill: '#0c121b', drop: 6 },
    ],
  }),

  // Reserva: usada em imóvel que ainda não tem foto.
  'imovel-sem-foto': scene({
    w: 1800,
    h: 1100,
    waterY: 0.82,
    glowY: 0.7,
    haze: '#a98a92',
    vignette: 0.5,
    reflectOpacity: 0.22,
    grade: ['#1b2138', '#d09a63'],
    sky: [
      ['0', '#0f1122'],
      ['.36', '#242138'],
      ['.68', '#54424f'],
      ['.9', '#8a6558'],
      ['1', '#a87d63'],
    ],
    ridges: [
      { lift: 0.16, amp: 0.13, fill: '#2b2740', haze: 0.55, blur: 'Lg', seed: 5 },
      { lift: 0.04, amp: 0.09, fill: '#1a1829', haze: 0.28, blur: 'Sm', seed: 17 },
    ],
    build: ({ w, horizon }) => `
      ${volume({ x: w * 0.24, y: horizon - w * 0.148, w: w * 0.28, h: w * 0.075, bays: 5, seed: 13, warm: 'b' })}
      ${volume({ x: w * 0.3, y: horizon - w * 0.075, w: w * 0.42, h: w * 0.075, bays: 9, seed: 29 })}
      <rect x="${n(w * 0.16)}" y="${n(horizon - 4)}" width="${n(w * 0.68)}" height="8" fill="#0a0d16"/>`,
    trees: [
      { x: 0.055, h: 0.26, w: 0.05, fill: '#171528', drop: 3 },
      { x: 0.125, h: 0.18, w: 0.035, fill: '#1b192c', drop: 3 },
      { x: 0.93, h: 0.28, w: 0.055, fill: '#171528', drop: 3 },
      { x: 0.87, h: 0.19, w: 0.036, fill: '#1b192c', drop: 3 },
    ],
  }),

};

mkdirSync(OUT, { recursive: true });

for (const [nome, cena] of Object.entries(cenas)) {
  writeFileSync(resolve(OUT, `${nome}.svg`), cena.inteira.trim());
  console.log('gerado:', `public/imagens/${nome}.svg`);
}

// A capa é a única que também sai em planos separados — é ela que ganha o
// movimento de câmera na rolagem.
for (const [plano, svg] of Object.entries(cenas['hero-lago'].camadas)) {
  const nome = `hero-${plano}`;
  writeFileSync(resolve(OUT, `${nome}.svg`), svg.trim());
  console.log('gerado:', `public/imagens/${nome}.svg`);
}
