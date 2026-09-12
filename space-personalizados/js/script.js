/* ============================================================================
   SPACE PERSONALIZADOS — script.js
   Vanilla JS · Canvas API · GSAP ScrollTrigger
   ----------------------------------------------------------------------------
   [1] CONFIG          — tudo que você precisa editar fica aqui em cima
   [2] UTILS           — helpers
   [3] PLACEHOLDERS    — arte SVG gerada em runtime (some quando entram as fotos)
   [4] CATALOGO        — os 18 produtos reais do catálogo Space
   [5] SEQUENCIA       — descoberta + preload dos frames do copo
   [6] CANVAS          — render cover matemático + fallback procedural
   [7] SCROLL          — ScrollTrigger (pin virtual por sticky) + fallback nativo
   [8] UI              — hero, filtros, favoritos, contadores, orçamento
   ========================================================================== */

'use strict';

/* ============================================================================
   [1] CONFIG — EDITE AQUI
   ========================================================================== */

const CONFIG = {

  /* --- A ANIMAÇÃO DO COPO ------------------------------------------------ */
  sequences: {
    // PARTE 1 — o copo dando a volta de 360°
    giro: {
      dir:    'frames/giro/',   // pasta dos frames
      scroll: 2400,             // ⇠ duração EM PIXELS DE SCROLL desta parte
      label:  '360°'
    },
    // PARTE 2 — a câmera sobe e entra no copo
    mergulho: {
      dir:    'frames/mergulho/',
      scroll: 2000,             // ⇠ duração EM PIXELS DE SCROLL desta parte
      label:  'MERGULHO'
    }
  },

  // Em que ponto do MERGULHO o interior começa a escurecer (0–1).
  // 0.82 = os últimos 18% do mergulho fazem o fade para a cor da loja.
  fadeStart: 0.82,

  // Pixels de scroll extras depois do último frame, já com a tela na cor da
  // loja, antes de soltar o pin. Dá o "respiro" da transição.
  holdAfter: 320,

  // Suavização do scrub do canvas (0 = travado no scroll, 1 = sem inércia).
  smoothing: 0.16,

  // Como os frames podem se chamar. A descoberta testa estas combinações
  // automaticamente — exporte do jeito que preferir que o site acha.
  naming: {
    exts:     ['webp', 'jpg', 'jpeg', 'png'],
    pads:     [4, 3, 5, 0],            // 0001 / 001 / 00001 / 1
    prefixes: ['', 'frame_', 'ezgif-frame-'],  // + o nome da pasta (giro_, mergulho_)
    starts:   [1, 0],
    maxFrames: 900
  },

  /* --- NEGÓCIO ----------------------------------------------------------- */
  whatsapp: '5542991343788',
  instagram: 'https://www.instagram.com/space_personalizados/',
  heroSlideMs: 6000
};

/* ============================================================================
   [2] UTILS
   ========================================================================== */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const clamp  = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp   = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, v) => clamp((v - a) / (b - a));
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeIn    = t => t * t * t;
const easeOut   = t => 1 - Math.pow(1 - t, 3);
const smoothstep = (a, b, v) => { const t = invLerp(a, b, v); return t * t * (3 - 2 * t); };

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = n => BRL.format(n);

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

const store = {
  get(k, fb) { try { return JSON.parse(localStorage.getItem('space.' + k)) ?? fb; } catch { return fb; } },
  set(k, v)  { try { localStorage.setItem('space.' + k, JSON.stringify(v)); } catch {} }
};

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
}

/* ============================================================================
   [3] PLACEHOLDERS — arte gerada, zero dependência externa
   --------------------------------------------------------------------------
   Cada <img>/bloco tem data-ph="chave" e (opcional) data-src="foto real".
   Se a foto existir em assets/produtos/ ela entra; se não, fica a arte SVG.
   ========================================================================== */

/* Silhuetas PREENCHIDAS (não contorno): com gradiente metálico e sombra de
   contato elas leem como render de estúdio, não como ícone de clipart. */
const SHAPES = {
  copo:      '<path d="M28 15h44v8l-1 2-5 54a8 8 0 0 1-8 7H42a8 8 0 0 1-8-7l-5-54-1-2Z"/>',
  caneca:    '<path d="M23 29h44v35a11 11 0 0 1-11 11H34a11 11 0 0 1-11-11Z"/><path d="M67 37h5a12 12 0 0 1 0 24h-5v-7h5a5 5 0 0 0 0-10h-5Z"/>',
  garrafa:   '<path d="M41 5h18v8H41Z"/><path d="M43 15h14v13l9 14v45a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V42l9-14Z"/>',
  churrasco: '<path d="M20 6h5v22h-5ZM31 6h5v22h-5ZM42 6h5v22h-5Z"/>'
           + '<path d="M18 28h31v6a12 12 0 0 1-9 11v49H27V45a12 12 0 0 1-9-11Z"/>'
           + '<path d="M70 6c10 10 14 26 11 40-1 6-5 9-11 10-6-1-10-4-11-10-3-14 1-30 11-40Z"/>'
           + '<path d="M64 58h12v36a6 6 0 0 1-12 0Z"/>',
  canivete:  '<path d="M20 60c22-5 44-17 58-32l7 10c-14 17-35 30-59 37Z"/><path d="M11 63h16v14H11a5 5 0 0 1-5-5v-4a5 5 0 0 1 5-5Z"/>',
  caneta:    '<path d="M63 8 92 37 44 85l-4-4 44-44-8-8-44 44-4-4Z"/><path d="M36 81 14 92l9-23 9 3 4 9Z"/>',
  chaveiro:  '<path fill-rule="evenodd" d="M33 10a24 24 0 1 1 0 48 24 24 0 0 1 0-48Zm0 12a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z"/><path d="M50 47 82 79l-9 9-32-32Z"/>',
  chapeu:    '<path d="M30 55V38a20 20 0 0 1 40 0v17Z"/><ellipse cx="50" cy="60" rx="40" ry="13"/>',
  xicara:    '<path d="M28 32h44l-5 28a11 11 0 0 1-11 9H44a11 11 0 0 1-11-9Z"/><path d="M71 39h5a9 9 0 0 1 0 18h-4v-6h4a3 3 0 0 0 0-6h-5Z"/><path d="M20 76h60v6H20Z"/>',
  laser:     '<path fill-rule="evenodd" d="M50 22a28 28 0 1 1 0 56 28 28 0 0 1 0-56Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z"/><circle cx="50" cy="50" r="7"/><path d="M47 2h6v14h-6ZM47 84h6v14h-6ZM2 47h14v6H2ZM84 47h14v6H84Z"/>',
  caixa:     '<path d="M50 8 88 25 50 42 12 25Z"/><path d="M10 31 47 48v40L10 71Z"/><path d="M90 31 53 48v40l37-17Z"/>'
};

/** Fundo de estúdio + objeto preenchido + sombra de contato + grão. */
function phProduct(key, seed = 0) {
  const shape = SHAPES[key] || SHAPES.copo;
  const lx = 34 + (seed % 4) * 8;            // posição da luz varia por produto
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
<linearGradient id="sw" x1="0" y1="0" x2="0.15" y2="1">
<stop offset="0" stop-color="#1c1b19"/><stop offset="0.62" stop-color="#121110"/><stop offset="1" stop-color="#090908"/>
</linearGradient>
<radialGradient id="pool" cx="${lx}%" cy="38%" r="46%">
<stop offset="0" stop-color="#38342c"/><stop offset="1" stop-color="#38342c" stop-opacity="0"/>
</radialGradient>
<linearGradient id="mt" x1="0" y1="0" x2="1" y2="0.1">
<stop offset="0" stop-color="#2a2a2c"/><stop offset="0.22" stop-color="#6e6f73"/>
<stop offset="0.42" stop-color="#d9dade"/><stop offset="0.56" stop-color="#8b8c90"/>
<stop offset="0.78" stop-color="#3a3a3d"/><stop offset="1" stop-color="#1e1e20"/>
</linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#e6c88a" stop-opacity="0"/><stop offset="0.9" stop-color="#e6c88a" stop-opacity="0.55"/>
</linearGradient>
<radialGradient id="cast" cx="50%" cy="50%" r="50%">
<stop offset="0" stop-color="#000" stop-opacity="0.75"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
<feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="600" height="600" fill="url(#sw)"/>
<rect width="600" height="600" fill="url(#pool)"/>
<ellipse cx="300" cy="470" rx="180" ry="34" fill="url(#cast)"/>
<g transform="translate(300 296) scale(3.5) translate(-50 -52)">
<g fill="url(#mt)">${shape}</g>
<g fill="url(#rim)" opacity="0.7">${shape}</g>
</g>
<rect width="600" height="600" filter="url(#gr)" opacity="0.055"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Fundo de hero: pura atmosfera de estúdio. Sem ícone, sem desenho. */
function phScene(key, seed = 0) {
  const lx = [64, 72, 30, 56][seed % 4];
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<defs>
<linearGradient id="b" x1="0" y1="0" x2="0.4" y2="1">
<stop offset="0" stop-color="#232019"/><stop offset="0.55" stop-color="#131211"/><stop offset="1" stop-color="#070707"/>
</linearGradient>
<radialGradient id="k" cx="${lx}%" cy="26%" r="44%">
<stop offset="0" stop-color="#6b5c3d" stop-opacity="0.55"/><stop offset="1" stop-color="#6b5c3d" stop-opacity="0"/>
</radialGradient>
<radialGradient id="f" cx="${lx - 26}%" cy="86%" r="40%">
<stop offset="0" stop-color="#2e2a22" stop-opacity="0.6"/><stop offset="1" stop-color="#2e2a22" stop-opacity="0"/>
</radialGradient>
<linearGradient id="v" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#000" stop-opacity="0.72"/><stop offset="0.55" stop-color="#000" stop-opacity="0"/>
</linearGradient>
<filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/>
<feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="1600" height="900" fill="url(#b)"/>
<rect width="1600" height="900" fill="url(#k)"/>
<rect width="1600" height="900" fill="url(#f)"/>
<rect width="1600" height="900" fill="url(#v)"/>
<rect width="1600" height="900" filter="url(#g2)" opacity="0.07"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** SVG de avatar circular (logos de empresas-clientes). */
function phAvatar(seed = 0) {
  const a = [[34, '#e6c88a'], [204, '#8ab6e6'], [12, '#e68a8a'], [148, '#8ae6b0'], [268, '#b98ae6']][seed % 5];
  const letters = ['MD', 'DY', 'OL', 'SP', 'BR'][seed % 5];
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${a[0]} 30% 26%)"/><stop offset="1" stop-color="#121212"/></linearGradient></defs>
<rect width="100" height="100" fill="url(#a)"/>
<circle cx="50" cy="50" r="30" fill="none" stroke="${a[1]}" stroke-opacity="0.5" stroke-width="2"/>
<text x="50" y="58" text-anchor="middle" font-family="Syne, sans-serif" font-weight="700" font-size="26" fill="${a[1]}" fill-opacity="0.9">${letters}</text>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Aplica o placeholder e tenta trocar pela foto real, se ela existir. */
function paint(el, key, seed = 0) {
  const isAvatar = /^empresa/.test(key);
  const isScene  = el.hasAttribute('data-scene');
  el.style.backgroundImage = isAvatar ? phAvatar(seed)
                           : isScene  ? phScene(key, seed)
                           : phProduct(key, seed);
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  const real = el.dataset.src;
  if (!real) return;
  const probe = new Image();
  probe.onload = () => {
    el.style.backgroundImage = `url("${real}")`;
    el.classList.add('has-photo');
  };
  probe.src = real;
}

function hydratePlaceholders(root = document) {
  $$('[data-ph]', root).forEach((el, i) => paint(el, el.dataset.ph, i));
}

/* ============================================================================
   [4] CATÁLOGO — dados reais do catálogo Space Personalizados
   --------------------------------------------------------------------------
   tiers: faixas de preço por quantidade [qtd mínima, preço unitário]
   ========================================================================== */

const PRODUCTS = [
  { id:'copo-473', name:'Copo Térmico Inox 473ml', cat:'copos', ph:'copo',
    desc:'Dupla parede em inox, acompanha tampa e abridor personalizado a laser.',
    tiers:[[10,29.90]], min:10, rating:4.95, badges:['Oferta','Copos'], deals:['hot','best','rec'] },

  { id:'copo-360', name:'Copo Térmico Inox 360ml', cat:'copos', ph:'copo',
    desc:'Parede em inox com tampa, para bebidas quentes e frias.',
    tiers:[[10,29.90]], min:10, rating:4.90, badges:['Copos'], deals:['best','rec'] },

  { id:'caneca-termica-700', name:'Caneca Térmica Inox 700ml', cat:'copos', ph:'caneca',
    desc:'Dupla parede em inox de 700 ml personalizada a laser.',
    tiers:[[10,69.90],[20,49.90],[50,48.90]], min:10, rating:4.92, badges:['Novo','Canecas'], deals:['new','best'] },

  { id:'caneca-aluminio-350', name:'Caneca em Alumínio 350ml', cat:'copos', ph:'caneca',
    desc:'Leve, resistente e com ótimo custo por unidade em grandes volumes.',
    tiers:[[20,17.99],[50,15.99],[100,14.99]], min:20, rating:4.80, badges:['Volume'], deals:['rec'] },

  { id:'caneca-porcelana', name:'Caneca de Porcelana 325ml', cat:'copos', ph:'xicara',
    desc:'Clássica de escritório, acabamento liso e impressão de alta definição.',
    tiers:[[10,35.00],[20,32.00],[25,29.00]], min:10, rating:4.86, badges:['Porcelana'], deals:['new','rec'] },

  { id:'torre-xicaras', name:'Torre de Xícaras 150ml', cat:'copos', ph:'xicara',
    desc:'Jogo de xícaras com suporte em metal — presente corporativo de alto impacto.',
    tiers:[[10,70.00],[20,68.00],[25,65.00]], min:10, rating:4.94, badges:['Premium'], deals:['new'] },

  { id:'garrafa-500', name:'Garrafa Térmica 500ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa térmica de 500 ml com infusor para chá.',
    tiers:[[10,29.90]], min:10, rating:4.88, badges:['Oferta','Garrafas'], deals:['hot','best'] },

  { id:'garrafa-800', name:'Garrafa Térmica 800ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa térmica de 800 ml com tampa rosqueável e vedação reforçada.',
    tiers:[[10,49.90]], min:10, rating:4.91, badges:['Mais vendido','Garrafas'], deals:['best','rec'] },

  { id:'garrafa-aluminio-600', name:'Garrafa em Alumínio 600ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa esportiva em alumínio de 600 ml, gravada a laser.',
    tiers:[[10,44.90],[20,42.90],[50,39.90]], min:10, rating:4.79, badges:['Garrafas'], deals:['rec'] },

  { id:'churrasco-5', name:'Kit Churrasco 5 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Garfo, faca, pegador, espátula, pincel e espetos. Acompanha bolsa.',
    tiers:[[1,99.90],[10,79.90]], min:1, rating:4.95, badges:['Oferta','Churrasco'], deals:['hot','best'] },

  { id:'churrasco-4', name:'Kit Churrasco Maleta 4 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Maleta de alumínio com travas: pegador, garfo, faca e espátula em inox.',
    tiers:[[1,159.90],[10,119.90]], min:1, rating:4.97, badges:['Recomendado','Premium'], deals:['rec','best'] },

  { id:'churrasco-2-estojo', name:'Kit Churrasco 2 Peças · Estojo', cat:'churrasco', ph:'churrasco',
    desc:'Garfo e faca de 8 polegadas acondicionados em estojo.',
    tiers:[[1,75.90],[10,55.90]], min:1, rating:4.85, badges:['Churrasco'], deals:['rec'] },

  { id:'churrasco-2-caixa', name:'Kit Churrasco 2 Peças · Caixa', cat:'churrasco', ph:'churrasco',
    desc:'Garfo e faca de 8 polegadas, acompanha caixa para presente.',
    tiers:[[1,75.90],[10,55.90]], min:1, rating:4.84, badges:['Churrasco'], deals:['new'] },

  { id:'canivete-inox', name:'Canivete Inox com Presilha', cat:'canivetes', ph:'canivete',
    desc:'Canivete em aço inox com presilha de bolso e gravação a laser.',
    tiers:[[1,99.90],[10,49.90]], min:1, rating:4.89, badges:['Oferta','Canivetes'], deals:['hot','rec'] },

  { id:'canivete-aco', name:'Canivete com Lâmina de Aço', cat:'canivetes', ph:'canivete',
    desc:'Lâmina de aço com cabo ergonômico, ideal para brinde masculino.',
    tiers:[[1,69.90],[10,39.90]], min:1, rating:4.82, badges:['Canivetes'], deals:['best'] },

  { id:'caneta-metal', name:'Caneta Esferográfica em Metal', cat:'escritorio', ph:'caneta',
    desc:'Caneta em metal escovado com gravação a laser da sua marca.',
    tiers:[[10,6.00],[50,4.50],[100,4.00]], min:10, rating:4.76, badges:['Escritório'], deals:['rec','best'] },

  { id:'chaveiro-abridor', name:'Chaveiro Abridor a Laser', cat:'escritorio', ph:'chaveiro',
    desc:'Chaveiro abridor personalizado a laser — o brinde de maior giro.',
    tiers:[[10,4.00],[30,3.50],[50,3.00],[100,2.50],[500,2.25]], min:10, rating:4.88, badges:['Mais vendido','Volume'], deals:['best','hot'] },

  { id:'chapeu-juta', name:'Chapéu de Juta', cat:'estilo', ph:'chapeu',
    desc:'Chapéu de juta com faixa em couro ecológico personalizada a laser.',
    tiers:[[1,80.00],[5,70.00],[10,60.00]], min:1, rating:4.81, badges:['Novo','Estilo'], deals:['new'] }
];

const byId = id => PRODUCTS.find(p => p.id === id);

/** Preço unitário para uma quantidade, respeitando as faixas. */
function unitPrice(p, qty) {
  let price = p.tiers[0][1];
  for (const [min, val] of p.tiers) if (qty >= min) price = val;
  return price;
}
const fromPrice = p => Math.min(...p.tiers.map(t => t[1]));
const topPrice  = p => Math.max(...p.tiers.map(t => t[1]));

/* ============================================================================
   [5] SEQUÊNCIA — descoberta automática + preload dos frames
   ========================================================================== */

const loadImage = src => new Promise(res => {
  const img = new Image();
  img.decoding = 'async';
  img.onload  = () => res(img);
  img.onerror = () => res(null);
  img.src = src;
});

const exists = src => new Promise(res => {
  const img = new Image();
  img.onload = () => res(true);
  img.onerror = () => res(false);
  img.src = src;
});

const pad = (n, len) => len ? String(n).padStart(len, '0') : String(n);
const buildSrc = (p, i) => `${p.dir}${p.prefix}${pad(i, p.padLen)}.${p.ext}`;

/**
 * Descobre como os frames estão nomeados.
 * 1º) frames/manifest.json, se você quiser fixar tudo na mão (caminho rápido).
 * 2º) sondagem em dois estágios: primeiro as combinações mais prováveis,
 *     depois o resto — evita disparar centenas de requisições à toa.
 */
let MANIFEST = null;
async function loadManifest() {
  if (MANIFEST !== null) return MANIFEST;
  try {
    const r = await fetch('frames/manifest.json', { cache: 'no-cache' });
    MANIFEST = r.ok ? await r.json() : false;
  } catch { MANIFEST = false; }
  return MANIFEST;
}

async function firstThatExists(list) {
  const found = await Promise.all(
    list.map(c => exists(buildSrc(c, c.start)).then(ok => ok ? c : null))
  );
  return found.find(Boolean) || null;
}

async function discoverPattern(dir) {
  const folder = dir.replace(/\/$/, '').split('/').pop();

  /* caminho rápido: manifest escrito à mão */
  const man = await loadManifest();
  if (man && man[folder]) {
    const m = man[folder];
    const p = {
      dir,
      ext: m.ext || 'jpg',
      padLen: m.pad ?? 4,
      prefix: m.prefix ?? '',
      start: m.start ?? 1,
      count: m.count
    };
    if (await exists(buildSrc(p, p.start))) return p;
  }

  const { exts, pads, prefixes, starts } = CONFIG.naming;
  const all = [];
  for (const ext of exts)
    for (const padLen of pads)
      for (const prefix of [folder + '_', ...prefixes])
        for (const start of starts)
          all.push({ dir, ext, padLen, prefix, start });

  /* estágio 1 — o que 95% das exportações usam */
  const likely = all.filter(c =>
    c.start === 1 && c.padLen >= 3 && (c.prefix === '' || c.prefix === folder + '_'));
  return (await firstThatExists(likely)) || (await firstThatExists(all));
}

/** Busca exponencial + binária para saber quantos frames existem. */
async function countFrames(p) {
  if (Number.isFinite(p.count) && p.count > 0) return p.count;
  const cap = CONFIG.naming.maxFrames;
  let lo = p.start, hi = p.start;
  let step = 1;
  while (step <= cap) {
    const probe = p.start + step;
    if (await exists(buildSrc(p, probe))) { lo = probe; step *= 2; }
    else { hi = probe; break; }
  }
  if (hi === p.start) hi = p.start + step;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (await exists(buildSrc(p, mid))) lo = mid; else hi = mid;
  }
  return lo - p.start + 1;
}

/** Carrega a sequência inteira reportando progresso. */
async function loadSequence(p, total, onTick) {
  const frames = new Array(total);
  let done = 0;
  const CONCURRENCY = 8;
  let cursor = 0;
  async function worker() {
    while (cursor < total) {
      const i = cursor++;
      frames[i] = await loadImage(buildSrc(p, p.start + i));
      onTick(++done);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));
  return frames.filter(Boolean);
}

/* ============================================================================
   [6] CANVAS — motor de render
   --------------------------------------------------------------------------
   · drawCover()  → object-fit:cover calculado na mão, com devicePixelRatio
   · renderReal() → desenha o frame da sequência
   · renderFake() → copo desenhado em Canvas 2D enquanto os frames não chegam
   ========================================================================== */

const Stage = (() => {
  const cv  = $('#cupCanvas');
  const ctx = cv.getContext('2d', { alpha: false });
  let W = 0, H = 0, dpr = 1;

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(1, Math.round(r.width  * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== W)  cv.width  = W;
    if (cv.height !== H) cv.height = H;
  }

  /* --- object-fit: cover, na matemática --------------------------------- */
  function drawCover(img) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(W / iw, H / ih);   // cover = MAX (contain seria MIN)
    const w = iw * scale, h = ih * scale;
    ctx.drawImage(img, (W - w) * 0.5, (H - h) * 0.5, w, h);
  }

  function clear() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }

  /* ------------------------------------------------------------------------
     COPO PROCEDURAL — prévia fiel enquanto o vídeo real não existe.
     Tudo em coordenadas locais com origem no CENTRO DA BOCA do copo,
     o que faz o zoom do mergulho "entrar" exatamente pela borda.
     ---------------------------------------------------------------------- */

  function metalGradient(g, angle) {
    const s = (Math.sin(angle) * 0.5 + 0.5);
    const stops = [
      [0, '#0d0d0d'], [s - 0.36, '#242424'], [s - 0.15, '#8f8f8f'],
      [s, '#efeeea'], [s + 0.15, '#8f8f8f'], [s + 0.36, '#242424'], [1, '#0d0d0d']
    ];
    let last = -1;
    for (const [pos, col] of stops) {
      const p = clamp(pos, 0, 1);
      if (p <= last) continue;
      g.addColorStop(p, col);
      last = p;
    }
    return g;
  }

  function drawTumbler(ctx, u, angle, detail = true) {
    const rimRX = u, rimRY = u * 0.33;
    const bodyH = u * 2.35, botRX = u * 0.80, botRY = u * 0.25;

    /* dentro do copo o corpo não aparece: pula os detalhes caros */
    if (detail) {
      /* sombra de chão */
      const sh = ctx.createRadialGradient(0, bodyH + botRY * 1.4, 0, 0, bodyH + botRY * 1.4, u * 1.5);
      sh.addColorStop(0, 'rgba(0,0,0,.75)');
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(0, bodyH + botRY * 1.5, u * 1.45, u * 0.30, 0, 0, Math.PI * 2);
      ctx.fill();

      /* corpo */
      ctx.beginPath();
      ctx.ellipse(0, 0, rimRX, rimRY, 0, 0, Math.PI);
      ctx.lineTo(-botRX, bodyH);
      ctx.ellipse(0, bodyH, botRX, botRY, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fillStyle = metalGradient(ctx.createLinearGradient(-rimRX, 0, rimRX, 0), angle);
      ctx.fill();

      /* linha de dupla parede */
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.lineWidth = u * 0.012;
      for (const y of [bodyH * 0.19, bodyH * 0.86]) {
        ctx.beginPath();
        ctx.ellipse(0, y, rimRX * 0.98, rimRY * 0.9, 0, 0.08, Math.PI - 0.08);
        ctx.stroke();
      }
      /* brilho especular que corre com o giro */
      const sg = ctx.createLinearGradient(-rimRX, 0, rimRX, 0);
      const sp = clamp(Math.sin(angle + 0.5) * 0.5 + 0.5, 0.05, 0.95);
      sg.addColorStop(clamp(sp - 0.08, 0, 1), 'rgba(255,255,255,0)');
      sg.addColorStop(sp, 'rgba(255,255,255,.34)');
      sg.addColorStop(clamp(sp + 0.08, 0, 1), 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(-rimRX, -rimRY, rimRX * 2, bodyH + botRY * 2);
      ctx.restore();

      /* gravação a laser que orbita o corpo */
      const ca = Math.cos(angle);
      if (ca > 0.03) {
        ctx.save();
        ctx.globalAlpha = clamp(ca * 1.25, 0, 1) * 0.96;
        ctx.translate(Math.sin(angle) * rimRX * 0.58, bodyH * 0.47);
        ctx.scale(Math.max(ca, 0.04), 1);
        ctx.strokeStyle = 'rgba(28,26,22,.62)';
        ctx.lineWidth = u * 0.02;
        ctx.beginPath(); ctx.arc(0, -u * 0.40, u * 0.20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(28,26,22,.62)';
        ctx.beginPath(); ctx.arc(0, -u * 0.40, u * 0.075, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = 'center';
        ctx.font = `700 ${u * 0.235}px Syne, 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText('SPACE', 0, u * 0.02);
        ctx.font = `600 ${u * 0.072}px 'Plus Jakarta Sans', sans-serif`;
        ctx.globalAlpha *= 0.72;
        ctx.fillText('P E R S O N A L I Z A D O S', 0, u * 0.20);
        ctx.restore();
      }
    }

    /* interior */
    const inner = ctx.createRadialGradient(0, -rimRY * 0.2, u * 0.05, 0, rimRY * 0.2, rimRX);
    inner.addColorStop(0, '#000000');
    inner.addColorStop(0.62, '#0b0a09');
    inner.addColorStop(1, '#211c15');
    ctx.beginPath();
    ctx.ellipse(0, 0, rimRX * 0.955, rimRY * 0.955, 0, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();

    /* parede interna iluminada ao fundo */
    ctx.save();
    ctx.clip();
    const wall = ctx.createLinearGradient(0, -rimRY, 0, rimRY * 0.4);
    wall.addColorStop(0, 'rgba(230,200,138,.30)');
    wall.addColorStop(1, 'rgba(230,200,138,0)');
    ctx.fillStyle = wall;
    ctx.fillRect(-rimRX, -rimRY, rimRX * 2, rimRY * 2);
    ctx.restore();

    /* borda */
    ctx.beginPath();
    ctx.ellipse(0, 0, rimRX * 0.978, rimRY * 0.978, 0, 0, Math.PI * 2);
    ctx.lineWidth = u * 0.045;
    ctx.strokeStyle = metalGradient(ctx.createLinearGradient(-rimRX, 0, rimRX, 0), angle + 0.6);
    ctx.stroke();
  }

  function renderFake(phase, t) {
    const glow = phase === 'dive' ? 1 - easeIn(t) : 1;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0a0a'); bg.addColorStop(0.5, '#151515'); bg.addColorStop(1, '#060606');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const rg = ctx.createRadialGradient(W * 0.5, H * 0.32, 0, W * 0.5, H * 0.32, Math.max(W, H) * 0.62);
    rg.addColorStop(0, `rgba(230,200,138,${0.17 * glow})`);
    rg.addColorStop(1, 'rgba(230,200,138,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

    let angle, zoom, rimY;
    if (phase === 'giro') {
      angle = t * Math.PI * 2;                 // exatamente uma volta
      zoom  = 1;
      rimY  = H * 0.27;
    } else {
      const e = easeIn(t);
      angle = Math.PI * 2 + t * 1.15;          // continua de onde parou: sem corte
      zoom  = 1 + e * 26;                      // a câmera entra pela boca
      rimY  = lerp(H * 0.27, H * 0.52, easeOut(t));
    }

    const u = Math.min(W * 0.34, H * 0.235);
    ctx.save();
    ctx.translate(W * 0.5, rimY);
    ctx.scale(zoom, zoom);
    drawTumbler(ctx, u, angle, zoom < 5);
    ctx.restore();

    /* vinheta */
    const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.28, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  return { resize, clear, drawCover, renderFake, get w() { return W; }, get h() { return H; } };
})();

/* ============================================================================
   [7] SCROLL — ScrollTrigger ligado ao índice dos frames
   ========================================================================== */

const Cup = (() => {
  const section  = $('#cup');
  const veil     = $('#cupVeil');
  const hud      = $('#cupHud');
  const bar      = $('#cupProgress');
  const phaseEl  = $('#cupPhase');
  const notice   = $('#cupNotice');
  const nav      = $('#nav');

  const G = CONFIG.sequences.giro;
  const M = CONFIG.sequences.mergulho;

  let giroFrames = [], mergFrames = [];
  let procedural = true;
  let target = 0, current = 0, needsDraw = true;
  let pGiro = 0, pDive = 1, totalScroll = 0;

  /* --- geometria do trilho de scroll ------------------------------------ */
  function measure() {
    const factor = prefersReduced ? 0.28 : 1;
    totalScroll = Math.round((G.scroll + M.scroll + CONFIG.holdAfter) * factor);
    pGiro = (G.scroll * factor) / totalScroll;
    pDive = ((G.scroll + M.scroll) * factor) / totalScroll;
    section.style.height = (window.innerHeight + totalScroll) + 'px';
  }

  /* --- do progresso global para fase + t local -------------------------- */
  function split(p) {
    if (p <= pGiro)  return { phase: 'giro', t: pGiro ? p / pGiro : 0 };
    if (p <= pDive)  return { phase: 'dive', t: (p - pGiro) / (pDive - pGiro) };
    return { phase: 'dive', t: 1 };
  }

  /* --- desenho ----------------------------------------------------------- */
  function render(p) {
    const { phase, t } = split(p);

    if (procedural) {
      Stage.renderFake(phase, t);
    } else {
      const list = phase === 'giro' ? giroFrames : mergFrames;
      if (list.length) {
        const idx = Math.round(t * (list.length - 1));   // progresso → índice
        Stage.clear();
        Stage.drawCover(list[clamp(idx, 0, list.length - 1)]);
      }
    }

    /* fade do interior para a cor exata da loja */
    const dive = phase === 'dive' ? t : 0;
    const fade = p > pDive ? 1 : smoothstep(CONFIG.fadeStart, 1, dive);
    veil.style.opacity = fade.toFixed(3);

    /* HUD some assim que o mergulho começa */
    const hudOpacity = (1 - smoothstep(0, 0.22, dive)).toFixed(3);
    hud.style.opacity = hudOpacity;
    if (!notice.hidden) notice.style.opacity = hudOpacity;

    bar.style.width = (p * 100).toFixed(2) + '%';
    phaseEl.textContent = phase === 'giro' ? G.label : (dive > 0.82 ? 'ENTRANDO' : M.label);

    if (p > 0.96) nav.classList.add('is-live');
    else if (p < 0.93) nav.classList.remove('is-live');
  }

  /* --- loop com requestAnimationFrame ----------------------------------- */
  function tick() {
    const diff = target - current;
    if (Math.abs(diff) > 0.00015) {
      current += diff * (prefersReduced ? 1 : CONFIG.smoothing);
      needsDraw = true;
    } else if (current !== target) {
      current = target;
      needsDraw = true;
    }
    if (needsDraw) { render(current); needsDraw = false; }
    requestAnimationFrame(tick);
  }

  /* --- ligação com o scroll --------------------------------------------- */
  function bind() {
    measure();

    if (hasGSAP()) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',       // o palco fica fixo via position:sticky
        invalidateOnRefresh: true,
        onUpdate: self => { target = self.progress; },
        onRefresh: self => { Stage.resize(); target = self.progress; needsDraw = true; }
      });
      ScrollTrigger.addEventListener('refreshInit', measure);
    } else {
      // fallback 100% nativo — mesma matemática, sem dependência
      const native = () => {
        const r = section.getBoundingClientRect();
        target = clamp(-r.top / (section.offsetHeight - window.innerHeight));
      };
      addEventListener('scroll', native, { passive: true });
      native();
    }

    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        measure();
        Stage.resize();
        needsDraw = true;
        if (hasGSAP()) ScrollTrigger.refresh();
      }, 140);
    });

    Stage.resize();
    tick();
  }

  /* --- preloader --------------------------------------------------------- */
  async function boot() {
    const fill = $('#preloaderFill');
    const pct  = $('#preloaderPct');
    const msg  = $('#preloaderMsg');
    const pre  = $('#preloader');

    const setPct = v => {
      const n = Math.round(clamp(v) * 100);
      fill.style.width = n + '%';
      pct.textContent = n + '%';
    };

    msg.textContent = 'procurando os frames do copo';
    setPct(0.04);

    const [pg, pm] = await Promise.all([discoverPattern(G.dir), discoverPattern(M.dir)]);
    setPct(0.1);

    if (pg && pm) {
      procedural = false;
      msg.textContent = 'contando os quadros';
      const [ng, nm] = await Promise.all([countFrames(pg), countFrames(pm)]);
      const total = ng + nm;
      let loaded = 0;
      const tickLoad = () => setPct(0.1 + (++loaded / total) * 0.9);
      msg.textContent = 'carregando a sequência';
      // só libera o ScrollTrigger com 100% em cache
      [giroFrames, mergFrames] = await Promise.all([
        loadSequence(pg, ng, () => tickLoad()),
        loadSequence(pm, nm, () => tickLoad())
      ]);
      if (!giroFrames.length || !mergFrames.length) procedural = true;
    } else {
      // sem frames ainda → prévia procedural, com aviso discreto
      notice.hidden = false;
      msg.textContent = 'modo prévia do copo';
      for (let i = 1; i <= 10; i++) {
        await new Promise(r => setTimeout(r, 34));
        setPct(0.1 + i * 0.09);
      }
    }

    setPct(1);
    msg.textContent = 'pronto';
    await new Promise(r => setTimeout(r, 320));
    pre.classList.add('is-done');
    document.body.classList.remove('is-locked');
    bind();
    setTimeout(() => { if (hasGSAP()) ScrollTrigger.refresh(); }, 400);
  }

  return { boot, get info() { return { procedural, giro: giroFrames.length, mergulho: mergFrames.length }; } };
})();

/* ============================================================================
   [8] UI — vitrine, catálogo, filtros, favoritos e orçamento
   ========================================================================== */

const ICO = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.2-4.4-7.2-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.2 3.1C19.2 15.6 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  star:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3Z" fill="currentColor"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>',
  plus:  '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>'
};

const favs = new Set(store.get('favs', []));
const saveFavs = () => store.set('favs', [...favs]);

/* --- templates ------------------------------------------------------------ */

function tagHTML(list) {
  return list.map((t, i) =>
    `<span class="tag${i === 0 ? ' tag--gold' : ' tag--dark'}">${t}</span>`).join('');
}

function showcaseCard(p, wide) {
  const base = fromPrice(p), top = topPrice(p);
  const fav = favs.has(p.id) ? ' is-on' : '';
  const media = `<div class="pcard__media" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.jpg"></div>`;
  const top2 = `
    <div class="pcard__top">
      <button class="iconbtn iconbtn--outline" data-add="${p.id}" aria-label="Adicionar ${p.name} ao orçamento">${ICO.arrow}</button>
      <button class="iconbtn iconbtn--outline pcard__fav${fav}" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${!!fav}">${ICO.heart}</button>
    </div>`;

  if (wide) {
    return `<article class="pcard pcard--wide" data-cat="${p.cat}" data-id="${p.id}">
      ${media}${top2}
      <h3 class="pcard__name">${p.name}</h3>
      <div class="pcard__foot">
        <a class="pill pill--light pcard__more" href="#catalogo" data-jump="${p.id}">SAIBA MAIS ${ICO.arrow.replace('<svg', '<svg class="ico-arrow"')}</a>
        <span class="rating">${ICO.star}<b>${p.rating.toFixed(2)}</b></span>
      </div>
    </article>`;
  }

  return `<article class="pcard" data-cat="${p.cat}" data-id="${p.id}">
    ${media}${top2}
    <div class="pcard__tags">${tagHTML(p.badges)}</div>
    <h3 class="pcard__name">${p.name}</h3>
    <p class="pcard__desc">${p.desc}</p>
    <div class="pcard__foot">
      <div>
        <span class="pcard__price"><b>${money(base)}</b>${top > base ? `<s>${money(top)}</s>` : ''}</span>
        <span class="pcard__unit">por unidade · mín. ${p.min} uni</span>
      </div>
      <span class="rating">${ICO.star}<b>${p.rating.toFixed(2)}</b></span>
    </div>
  </article>`;
}

function catalogCard(p) {
  const best = Math.min(...p.tiers.map(t => t[1]));
  const tiers = p.tiers.map(([q, v]) =>
    `<li class="${v === best ? 'is-best' : ''}"><span>${q}+ unidades</span><b>${money(v)}</b></li>`).join('');
  const fav = favs.has(p.id) ? ' is-on' : '';
  return `<article class="ccard" data-cat="${p.cat}" data-id="${p.id}" id="p-${p.id}">
    <div class="ccard__media" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.jpg">
      <div class="ccard__tags">${tagHTML(p.badges)}</div>
      <button class="iconbtn iconbtn--outline ccard__fav pcard__fav${fav}" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${!!fav}">${ICO.heart}</button>
    </div>
    <h3 class="ccard__name">${p.name}</h3>
    <p class="ccard__desc">${p.desc}</p>
    <ul class="ccard__tiers">${tiers}</ul>
    <div class="ccard__foot">
      <div>
        <span class="ccard__from">a partir de</span>
        <span class="ccard__price">${money(best)}</span>
        <p class="ccard__min">pedido mínimo ${p.min} uni</p>
      </div>
      <div class="ccard__qty">
        <button data-step="-1" aria-label="Diminuir">${ICO.minus}</button>
        <input type="number" value="${p.min}" min="${p.min}" step="1" aria-label="Quantidade de ${p.name}">
        <button data-step="1" aria-label="Aumentar">${ICO.plus}</button>
      </div>
    </div>
    <div class="ccard__actions">
      <button class="pill pill--gold" data-add="${p.id}">ADICIONAR</button>
      <a class="pill pill--ghost" data-wa="${p.id}" href="#" target="_blank" rel="noopener">WHATSAPP</a>
    </div>
  </article>`;
}

/* --- vitrine (4 destaques, 3º em card largo) ------------------------------ */

const SHOWCASE_IDS = ['copo-473', 'caneca-termica-700', 'garrafa-800', 'churrasco-4'];
let showcasePool = [...SHOWCASE_IDS];

function renderShowcase(filter = 'todos') {
  const host = $('#showcase');
  let pool = filter === 'todos'
    ? showcasePool.map(byId)
    : PRODUCTS.filter(p => p.cat === filter);
  if (!pool.length) pool = PRODUCTS.slice(0, 4);
  pool = pool.slice(0, 4);
  host.innerHTML = pool.map((p, i) => showcaseCard(p, i === 2 && pool.length > 2)).join('');
  hydratePlaceholders(host);
  $('#showcaseTotal').textContent = String(PRODUCTS.length);
  $('#showcaseIndex').textContent = String(pool.length);
  if (hasGSAP() && !prefersReduced) {
    gsap.fromTo(host.children,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: .7, stagger: .07, ease: 'power3.out', overwrite: true });
  }
}

function renderCatalog(filter = 'todos') {
  const host = $('#catalogGrid');
  const list = filter === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  // re-renderiza em vez de esconder: o ritmo 4-5-3 / 3-4-5 / 5-4-3 do grid
  // é calculado por nth-child, então card escondido quebraria as linhas.
  host.innerHTML = list.map(catalogCard).join('');
  hydratePlaceholders(host);
  if (hasGSAP() && !prefersReduced) {
    gsap.fromTo(host.children, { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: .6, stagger: .045, ease: 'power3.out', overwrite: true });
  }
}

/* --- orçamento (carrinho) -------------------------------------------------- */

const Cart = (() => {
  let items = store.get('cart', []);
  const save = () => { store.set('cart', items); paint(); };

  function add(id, qty) {
    const p = byId(id);
    if (!p) return;
    const q = Math.max(p.min, qty || p.min);
    const found = items.find(i => i.id === id);
    if (found) found.qty += q; else items.push({ id, qty: q });
    save();
    toast(`${p.name} · ${q} uni adicionadas ao orçamento`);
  }
  function setQty(id, qty) {
    const p = byId(id);
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(p.min, qty);
    save();
  }
  function remove(id) { items = items.filter(i => i.id !== id); save(); }
  const total = () => items.reduce((s, i) => s + unitPrice(byId(i.id), i.qty) * i.qty, 0);

  function message() {
    if (!items.length) return 'Olá! Quero um orçamento de brindes personalizados.';
    const lines = items.map(i => {
      const p = byId(i.id);
      const u = unitPrice(p, i.qty);
      return `• ${p.name} — ${i.qty} uni × ${money(u)} = ${money(u * i.qty)}`;
    });
    return `Olá, Space! Montei meu orçamento no site:\n\n${lines.join('\n')}\n\nEstimativa: ${money(total())}\n\nPodem confirmar prazo e valor final?`;
  }

  function paint() {
    const body = $('#drawerBody');
    $('#cartCount').textContent = String(items.reduce((s, i) => s + 1, 0));
    $('#drawerTotal').textContent = money(total());
    const send = $('#drawerSend');
    send.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message())}`;
    send.setAttribute('aria-disabled', items.length ? 'false' : 'true');

    if (!items.length) {
      body.innerHTML = `<p class="drawer__empty">Seu orçamento está vazio.<br>Escolha os brindes no catálogo<br>e monte seu pedido.</p>`;
      return;
    }
    body.innerHTML = items.map(i => {
      const p = byId(i.id);
      const u = unitPrice(p, i.qty);
      return `<div class="ditem" data-id="${p.id}">
        <span class="ditem__thumb" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.jpg"></span>
        <div class="ditem__body">
          <p class="ditem__name">${p.name}</p>
          <p class="ditem__meta">${money(u)} / uni · faixa de ${i.qty}+ </p>
          <div class="ditem__row">
            <span class="ditem__qty">
              <button data-q="-1" aria-label="Diminuir">−</button>
              <b>${i.qty}</b>
              <button data-q="1" aria-label="Aumentar">+</button>
            </span>
            <span class="ditem__price">${money(u * i.qty)}</span>
          </div>
          <button class="ditem__del" data-del>remover</button>
        </div>
      </div>`;
    }).join('');
    hydratePlaceholders(body);
  }

  return { add, setQty, remove, paint, message, get items() { return items; } };
})();

function waLink(id, qty) {
  const p = byId(id);
  const q = qty || p.min;
  const u = unitPrice(p, q);
  const txt = `Olá, Space! Tenho interesse em:\n\n• ${p.name}\n• Quantidade: ${q} uni\n• Valor de referência: ${money(u)} / uni\n\nPodem me passar o orçamento?`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
}

/* ============================================================================
   INTERAÇÕES GLOBAIS
   ========================================================================== */

function qtyOfCard(el) {
  const card = el.closest('.ccard');
  const input = card && $('input', card);
  return input ? parseInt(input.value, 10) : 0;
}

document.addEventListener('click', e => {

  /* adicionar ao orçamento */
  const add = e.target.closest('[data-add]');
  if (add) {
    e.preventDefault();
    Cart.add(add.dataset.add, qtyOfCard(add));
    return;
  }

  /* favoritar */
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    const id = fav.dataset.fav;
    const on = favs.has(id) ? (favs.delete(id), false) : (favs.add(id), true);
    saveFavs();
    $$(`[data-fav="${id}"]`).forEach(b => {
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    toast(on ? 'Salvo nos favoritos' : 'Removido dos favoritos');
    return;
  }

  /* link direto de WhatsApp por produto */
  const wa = e.target.closest('[data-wa]');
  if (wa) {
    wa.href = waLink(wa.dataset.wa, qtyOfCard(wa));
    return;
  }

  /* stepper de quantidade */
  const step = e.target.closest('[data-step]');
  if (step) {
    const card = step.closest('.ccard');
    const input = $('input', card);
    const p = byId(card.dataset.id);
    const next = parseInt(input.value, 10) + Number(step.dataset.step) * (p.min >= 10 ? 10 : 1);
    input.value = Math.max(p.min, next);
    return;
  }

  /* ir até o produto no catálogo */
  const jump = e.target.closest('[data-jump]');
  if (jump) {
    e.preventDefault();
    const el = $('#p-' + jump.dataset.jump);
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      el.classList.add('is-target');
      setTimeout(() => el.classList.remove('is-target'), 2400);
    }
    return;
  }

  /* drawer */
  if (e.target.closest('#cartBtn') || e.target.closest('#ctaCart')) {
    $('#drawer').classList.add('is-open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    return;
  }
  if (e.target.closest('[data-close]')) {
    $('#drawer').classList.remove('is-open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    return;
  }

  /* itens do drawer */
  const q = e.target.closest('[data-q]');
  if (q) {
    const id = q.closest('.ditem').dataset.id;
    const p = byId(id);
    const it = Cart.items.find(i => i.id === id);
    Cart.setQty(id, it.qty + Number(q.dataset.q) * (p.min >= 10 ? 10 : 1));
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del) { Cart.remove(del.closest('.ditem').dataset.id); return; }
});

document.addEventListener('input', e => {
  if (e.target.matches('.ccard__qty input')) {
    const p = byId(e.target.closest('.ccard').dataset.id);
    if (e.target.value !== '' && +e.target.value < p.min) e.target.setAttribute('aria-invalid', 'true');
    else e.target.removeAttribute('aria-invalid');
  }
});

addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#drawer').classList.contains('is-open')) {
    $('#drawer').classList.remove('is-open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }
});

/* --- filtros --------------------------------------------------------------- */

function wireFilters(hostSel, attr, cb) {
  const host = $(hostSel);
  if (!host) return;
  host.addEventListener('click', e => {
    const btn = e.target.closest('[data-' + attr + ']');
    if (!btn) return;
    $$('[role="tab"]', host).forEach(b => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });
    cb(btn.dataset[attr]);
  });
}

/* --- hero slider ----------------------------------------------------------- */

const HeroSlider = (() => {
  const slides = $$('.hero__slide');
  const now = $('#heroStepNow');
  const fill = $('#heroStepFill');
  let i = 0, timer;

  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    now.textContent = String(i + 1).padStart(2, '0');
    fill.style.transform = `translateY(${i * 100}%)`;
    restart();
  }
  function restart() {
    clearInterval(timer);
    if (!prefersReduced) timer = setInterval(() => go(i + 1), CONFIG.heroSlideMs);
  }
  function init() {
    if (!slides.length) return;
    fill.style.height = (100 / slides.length) + '%';
    $('#heroNext').addEventListener('click', () => go(i + 1));
    $('#heroPrev').addEventListener('click', () => go(i - 1));
    go(0);
  }
  return { init };
})();

/* --- nav ------------------------------------------------------------------- */

function wireNav() {
  const nav = $('#nav'), menu = $('#navMenu'), burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
  addEventListener('scroll', () => {
    nav.classList.toggle('is-stuck', scrollY > innerHeight * 1.2);
  }, { passive: true });

  const ids = ['top', 'novidades', 'produtos', 'historia', 'catalogo'];
  const links = $$('#navMenu a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const idx = ids.indexOf(en.target.id);
      links.forEach((a, k) => a.classList.toggle('is-active', k === idx));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
}

/* --- reveal, split, contadores, magnético, marquee ------------------------- */

function wireSplit() {
  $$('[data-split]').forEach(el => {
    // percorre só os nós de TEXTO: as tags de peso (.lt) e os <br> ficam intactos
    const texts = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) texts.push(walker.currentNode);

    texts.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement('span');
        span.className = 'word';
        const i = document.createElement('i');
        i.textContent = part;
        span.appendChild(i);
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });

    el.classList.add('reveal');
    $$('.word > i', el).forEach((w, k) => { w.style.transitionDelay = (k * 55) + 'ms'; });
  });
}

function animateCount(el) {
  const end = Number(el.dataset.count) || 0;
  const suffix = el.dataset.suffix || '';
  const dur = 1500;
  const t0 = performance.now();
  const fmt = new Intl.NumberFormat('pt-BR');
  (function step(now) {
    const t = clamp((now - t0) / dur);
    el.textContent = fmt.format(Math.round(easeOut(t) * end)) + (t === 1 ? suffix : '');
    if (t < 1) requestAnimationFrame(step);
  })(t0);
}

function wireReveal() {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(animateCount);
      if (en.target.matches('[data-count]')) animateCount(en.target);
      obs.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('.reveal, [data-count]').forEach(el => io.observe(el));
}

function wireMagnetic() {
  if (prefersReduced || matchMedia('(hover: none)').matches) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.32;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* --- destaque "Mais desejados" -------------------------------------------- */

function wireDeals() {
  const map = {
    hot:  { pick: 'churrasco-5',  price: 79.90 },
    best: { pick: 'chaveiro-abridor' },
    new:  { pick: 'torre-xicaras' },
    rec:  { pick: 'churrasco-4' }
  };
  wireFilters('#dealFilters', 'deal', key => {
    const pool = PRODUCTS.filter(p => p.deals.includes(key));
    const p = byId(map[key].pick) || pool[0];
    if (!p) return;
    $('#dealName').textContent = p.name;
    $('#dealDesc').textContent = p.desc;
    $('#dealPrice').textContent = money(fromPrice(p));
    $('#dealRating').textContent = p.rating.toFixed(2);
    $('#dealAdd').dataset.add = p.id;
    const media = $('#dealMedia');
    media.dataset.ph = p.ph;
    media.dataset.src = `assets/produtos/${p.id}.jpg`;
    media.setAttribute('aria-label', p.name);
    paint(media, p.ph, PRODUCTS.indexOf(p));
    if (hasGSAP() && !prefersReduced) {
      gsap.fromTo('#dealCard', { y: 14, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' });
    }
  });
}

/* ============================================================================
   INIT
   ========================================================================== */

function init() {
  document.body.classList.add('is-locked');
  $('#year').textContent = String(new Date().getFullYear());

  hydratePlaceholders();
  wireSplit();
  renderShowcase('todos');
  renderCatalog();
  Cart.paint();

  wireFilters('#filters', 'filter', renderShowcase);
  wireFilters('#catalogFilters', 'cfilter', renderCatalog);
  wireDeals();

  $('#showcaseNext').addEventListener('click', () => {
    showcasePool = [...showcasePool.slice(1), showcasePool[0]];
    renderShowcase('todos');
  });
  $('#showcasePrev').addEventListener('click', () => {
    showcasePool = [showcasePool.at(-1), ...showcasePool.slice(0, -1)];
    renderShowcase('todos');
  });
  $('#typesShuffle').addEventListener('click', () => {
    showcasePool = [...PRODUCTS].sort(() => Math.random() - .5).slice(0, 4).map(p => p.id);
    renderShowcase('todos');
    toast('Destaques renovados');
  });

  HeroSlider.init();
  wireNav();
  wireReveal();
  wireMagnetic();

  Cup.boot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* diagnóstico rápido no console */
window.SPACE = { CONFIG, PRODUCTS, Cart, get sequences() { return Cup.info; } };
