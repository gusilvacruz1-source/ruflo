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

/* Liga o modo animado. É a PRIMEIRA coisa que roda: se este arquivo não
   carregar, nada do CSS esconde nada e a página degrada legível em vez de
   virar uma tela preta esperando um JS que não veio. */
document.documentElement.classList.add('js-on');

/* ============================================================================
   [1] CONFIG — EDITE AQUI
   ========================================================================== */

const CONFIG = {


  /* --- A ANIMAÇÃO DO COPO ------------------------------------------------ */
  sequences: {
    /* Estes números são o PESO do site. A introdução inteira custava 5.820px
       — seis telas e meia de rolagem antes de chegar na loja, e é isso que
       dá a sensação de arrastar. Encurtada, a volta de 360° continua inteira,
       só acontece em menos rolagem. */
    // PARTE 1 — o copo dando a volta de 360°
    giro:     { scroll: 1700, label: '360°'     },
    // PARTE 2 — a câmera sobe e entra no copo
    mergulho: { scroll: 1150, label: 'MERGULHO' }
  },

  // Em que ponto do MERGULHO o interior começa a escurecer (0–1).
  // 0.82 = os últimos 18% do mergulho fazem o fade para a cor da loja.
  fadeStart: 0.70,

  // Pixels de scroll extras depois do último frame, já com a tela na cor da
  // loja, antes de soltar o pin. Dá o "respiro" da transição.
  holdAfter: 320,

  // Suavização do scrub do canvas (0 = travado no scroll, 1 = sem inércia).
  /* O copo persegue a rolagem com atraso. Em 0.16 ele ficava visivelmente
     para trás do dedo, e atraso é exatamente o que o olho lê como peso. */
  smoothing: 0.26,

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
function phProduct(key, seed = 0) { return cached('p|'+key+'|'+(seed%4), () => buildProduct(key, seed)); }
function buildProduct(key, seed = 0) {
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
function phScene(key, seed = 0) { return cached('s|'+key+'|'+(seed%4), () => buildScene(key, seed)); }
function buildScene(key, seed = 0) {
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

/* A foto real só é buscada quando o card chega perto da tela. Com 18 cards no
   catálogo mais o hero, pedir as 22 no boot enfileirava tudo antes de a
   primeira dobra terminar de pintar. */
const fotoIO = 'IntersectionObserver' in window
  ? new IntersectionObserver((entradas, obs) => {
      entradas.forEach(en => {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        buscaFoto(en.target);
      });
    }, { rootMargin: '700px 0px' })
  : null;

/* Uma foto por quadro.
   Com margem de 700 px o observador dispara várias fotos de uma vez, e elas
   chegam praticamente juntas. Aplicadas no mesmo quadro, o navegador pinta
   todas de uma vez e devolve o engasgo pela porta dos fundos. Esta fila
   entrega uma por quadro: o custo vira uma fatia fina em vários quadros em
   vez de um pico num só. */
const filaFotos = [];
let passandoFotos = false;
function enfileiraFoto(aplica) {
  filaFotos.push(aplica);
  if (passandoFotos) return;
  passandoFotos = true;
  requestAnimationFrame(function passa() {
    const proxima = filaFotos.shift();
    if (proxima) proxima();
    if (filaFotos.length) requestAnimationFrame(passa);
    else passandoFotos = false;
  });
}

function buscaFoto(el) {
  const real = el.dataset.src;
  if (!real) return;
  const probe = new Image();
  const aplica = () => {
    // o #dealMedia é reaproveitado entre produtos: sem esta checagem uma
    // sondagem lenta pinta a foto do produto anterior sobre o novo
    if (el.dataset.src !== real) return;
    el.style.setProperty('--photo', `url("${real}")`);
    el.style.backgroundImage = `url("${real}")`;
    // Quem enquadra a foto real é o CSS (.has-photo e companhia). O tamanho e
    // a posição escritos no placeholder são inline e venciam a folha de
    // estilo — qualquer regra de enquadramento da foto virava letra morta.
    el.style.removeProperty('background-size');
    el.style.removeProperty('background-position');
    el.classList.add('has-photo');
  };
  /* onload avisa que os BYTES chegaram, não que a imagem está decodificada: a
     decodificação sobrava para a hora de pintar, dentro do quadro. decode()
     faz esse trabalho fora da thread principal e só resolve com o bitmap
     pronto — aí pintar é só copiar. */
  probe.src = real;
  if (probe.decode) {
    probe.decode().then(() => enfileiraFoto(aplica))
                  .catch(() => { if (probe.complete && probe.naturalWidth) enfileiraFoto(aplica); });
  } else {
    probe.onload = () => enfileiraFoto(aplica);
  }
}

/** Aplica o placeholder e agenda a troca pela foto real, se ela existir. */
function paint(el, key, seed = 0) {
  const isScene = el.hasAttribute('data-scene');
  el.style.backgroundImage = isScene ? phScene(key, seed) : phProduct(key, seed);
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.classList.remove('has-photo');
  if (!el.dataset.src) return;
  if (!fotoIO) { buscaFoto(el); return; }
  fotoIO.unobserve(el);                       // o #dealMedia volta aqui trocado
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight + 700 && r.bottom > -700) buscaFoto(el);
  else fotoIO.observe(el);
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function hydratePlaceholders(root = document) {
  $$('[data-ph]', root).forEach(el => {
    const card = el.closest('[data-id]');
    const idx = card ? PRODUCTS.findIndex(x => x.id === card.dataset.id) : -1;
    // semente estável: do produto quando há um, senão da própria chave.
    // Usar o índice no documento fazia o mesmo cliente virar três logos.
    const seed = idx >= 0 ? idx : hashSeed(el.dataset.ph);
    paint(el, el.dataset.ph, seed);
  });
}

/* ============================================================================
   [4] CATÁLOGO — dados reais do catálogo Space Personalizados
   --------------------------------------------------------------------------
   tiers: faixas de preço por quantidade [a partir de quantas, preço unitário]
           A primeira faixa começa em 1: não há pedido mínimo em item nenhum.
   ========================================================================== */

const PRODUCTS = [
  { id:'copo-473', name:'Copo Térmico Inox 473ml', cat:'copos', ph:'copo',
    desc:'Dupla parede em inox, acompanha tampa e abridor personalizado a laser.',
    tiers:[[1,29.90]] },

  { id:'copo-360', name:'Copo Térmico Inox 360ml', cat:'copos', ph:'copo',
    desc:'Parede em inox com tampa, para bebidas quentes e frias.',
    tiers:[[1,29.90]] },

  { id:'caneca-termica-700', name:'Caneca Térmica Inox 700ml', cat:'copos', ph:'caneca',
    desc:'Dupla parede em inox de 700 ml personalizada a laser.',
    tiers:[[1,69.90],[20,49.90],[50,48.90]] },

  { id:'caneca-aluminio-350', name:'Caneca em Alumínio 350ml', cat:'copos', ph:'caneca',
    desc:'Leve, resistente e com ótimo custo por unidade em grandes volumes.',
    tiers:[[1,17.99],[50,15.99],[100,14.99]] },

  { id:'caneca-porcelana', name:'Caneca de Porcelana 325ml', cat:'copos', ph:'xicara',
    desc:'Clássica de escritório, acabamento liso e impressão de alta definição.',
    tiers:[[1,35.00],[20,32.00],[25,29.00]] },

  { id:'torre-xicaras', name:'Torre de Xícaras 150ml', cat:'copos', ph:'xicara',
    desc:'Jogo de xícaras com suporte em metal, presente corporativo de alto impacto.',
    tiers:[[1,70.00],[20,68.00],[25,65.00]] },

  { id:'garrafa-500', name:'Garrafa Térmica 500ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa térmica de 500 ml com infusor para chá.',
    tiers:[[1,29.90]] },

  { id:'garrafa-800', name:'Garrafa Térmica 800ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa térmica de 800 ml com tampa rosqueável e vedação reforçada.',
    tiers:[[1,49.90]] },

  { id:'garrafa-aluminio-600', name:'Garrafa em Alumínio 600ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa esportiva em alumínio de 600 ml, gravada a laser.',
    tiers:[[1,44.90],[20,42.90],[50,39.90]] },

  { id:'churrasco-5', name:'Kit Churrasco 5 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Garfo, faca, pegador, espátula, pincel e espetos. Acompanha bolsa.',
    tiers:[[1,99.90],[10,79.90]] },

  { id:'churrasco-4', name:'Kit Churrasco Maleta 4 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Maleta de alumínio com travas: pegador, garfo, faca e espátula em inox.',
    tiers:[[1,159.90],[10,119.90]] },

  { id:'churrasco-2-estojo', name:'Kit Churrasco 2 Peças · Estojo', cat:'churrasco', ph:'churrasco',
    desc:'Garfo e faca de 8 polegadas acondicionados em estojo.',
    tiers:[[1,75.90],[10,55.90]] },

  { id:'churrasco-2-caixa', name:'Kit Churrasco 2 Peças · Caixa', cat:'churrasco', ph:'churrasco',
    desc:'Garfo e faca de 8 polegadas, acompanha caixa para presente.',
    tiers:[[1,75.90],[10,55.90]] },

  { id:'canivete-inox', name:'Canivete Inox com Presilha', cat:'canivetes', ph:'canivete',
    desc:'Canivete em aço inox com presilha de bolso e gravação a laser.',
    tiers:[[1,99.90],[10,49.90]] },

  { id:'canivete-aco', name:'Canivete com Lâmina de Aço', cat:'canivetes', ph:'canivete',
    desc:'Lâmina de aço com cabo ergonômico, ideal para brinde masculino.',
    tiers:[[1,69.90],[10,39.90]] },

  { id:'caneta-metal', name:'Caneta Esferográfica em Metal', cat:'escritorio', ph:'caneta',
    desc:'Caneta em metal escovado com gravação a laser da sua marca.',
    tiers:[[1,6.00],[50,4.50],[100,4.00]] },

  { id:'chaveiro-abridor', name:'Chaveiro Abridor a Laser', cat:'escritorio', ph:'chaveiro',
    desc:'Chaveiro abridor personalizado a laser, o brinde de maior giro.',
    tiers:[[1,4.00],[30,3.50],[50,3.00],[100,2.50],[500,2.25]] },

  { id:'chapeu-juta', name:'Chapéu de Juta', cat:'estilo', ph:'chapeu',
    desc:'Chapéu de juta com faixa em couro ecológico personalizada a laser.',
    tiers:[[1,80.00],[5,70.00],[10,60.00]] }
];

const byId = id => PRODUCTS.find(p => p.id === id);

/** Preço unitário para uma quantidade, respeitando as faixas. */
function unitPrice(p, qty) {
  let price = p.tiers[0][1];
  for (const [min, val] of p.tiers) if (qty >= min) price = val;
  return price;
}
/* O número em destaque é o que o cliente paga levando UMA peça. O preço de
   volume é a promessa, não a manchete: anunciar R$ 2,25 e riscar R$ 4,00 é
   mostrar um preço que exige 500 peças para existir. */
const startPrice = p => unitPrice(p, 1);
const bestPrice  = p => Math.min(...p.tiers.map(t => t[1]));
const bestQty    = p => p.tiers.reduce((a, t) => t[1] <= a[1] ? t : a)[0];
const hasVolume  = p => bestPrice(p) < startPrice(p);
/* Quanto o preço da peça cai da unidade avulsa até a melhor faixa. É o único
   selo que o card carrega: sai direto da tabela do catálogo, ao contrário de
   "Mais vendido" ou "Premium", que eram rótulos que eu tinha inventado. */
const dropPct    = p => Math.round((1 - bestPrice(p) / startPrice(p)) * 100);
function selo(p) {
  if (!hasVolume(p)) return '';
  return `<span class="tag tag--drop">−${dropPct(p)}% no lote de ${bestQty(p)}</span>`;
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
  const ctx = cv.getContext('2d', { alpha: true });
  let W = 0, H = 0, dpr = 1;

  function resize() {
    resize3D();
    // mede o palco, não o canvas: em modo 3D o canvas 2D está display:none
    // e devolveria 0x0
    const r = (cv.parentNode || cv).getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(1, Math.round(r.width  * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== W)  cv.width  = W;
    if (cv.height !== H) cv.height = H;
  }

  function clear() { ctx.clearRect(0, 0, W, H); }

  /* Quando o copo é 3D, o canvas 2D sai de cena: o WebGL desenha direto no
     seu próprio canvas, empilhado no mesmo lugar. Dois contextos não cabem
     no mesmo elemento. */
  let gl3d = null;
  function mount3D() {
    const host = cv.parentNode;
    const c = document.createElement('canvas');
    c.id = 'cupGL';
    host.insertBefore(c, cv);
    if (!global3D() || !window.Cup3D.init(c)) { c.remove(); return false; }
    gl3d = c;
    cv.style.display = 'none';
    return true;
  }
  function global3D() { return typeof window.Cup3D !== 'undefined'; }
  /* ESCALA ADAPTATIVA
     Não há como saber de antemão quanto o aparelho do cliente aguenta: o
     mesmo copo que roda a 60 quadros num desktop engasga num celular de
     entrada. Então o site mede. O laço guarda o intervalo entre quadros e a
     cada 30 chama aqui com a MEDIANA — mediana, não média, para um engasgo
     solto do coletor de lixo não derrubar a qualidade sozinho.

     O fator só desce, nunca sobe. Subir e descer produz oscilação visível:
     corta, fica rápido, devolve, engasga de novo. Descendo em degraus o
     aparelho encontra o nível dele em menos de um segundo de rolagem e fica
     lá. Custa um pouco de nitidez num aparelho que teve um azar pontual, e
     num copo de sombreado liso isso quase não aparece. */
  const Q_MIN = 0.26, Q_ALVO = 17;
  /* O aparelho que já visitou o site não precisa aprender de novo: o nível
     que ele aguentou fica guardado e a primeira rolagem da segunda visita já
     nasce fluida. */
  let qualidade = (() => {
    try {
      const g = parseFloat(localStorage.getItem('space:q'));
      if (g >= Q_MIN && g <= 1) return g;
    } catch (e) { /* navegação privada: segue no palpite */ }
    return matchMedia('(pointer: coarse)').matches ? 0.55 : 1;
  })();
  function afereQualidade(ms) {
    if (ms <= 21 || qualidade <= Q_MIN) return;
    /* Corte PROPORCIONAL ao atraso. Em degraus fixos um celular fraco levava
       vários segundos para achar o nível dele, e esses segundos são
       justamente os do copo girando na tela. Quem está em 50 ms por quadro
       apanha um corte grande de uma vez; quem está em 24 apanha um pequeno.
       O limite de metade por vez evita derrubar a nitidez por um engasgo. */
    const q = Math.max(Q_MIN, qualidade * Math.max(0.45, Q_ALVO / ms));
    if (q >= qualidade - 0.005) return;
    qualidade = q;
    try { localStorage.setItem('space:q', q.toFixed(3)); } catch (e) { /* idem */ }
    resize3D();
  }

  function resize3D() {
    if (!gl3d) return;
    const r = gl3d.getBoundingClientRect();
    /* Teto do copo em PIXELS, não em densidade. O que custa por quadro é a
       contagem total de fragmentos, e ela depende do tamanho da tela junto
       com a densidade: 1.75x num tablet grande é muito mais trabalho que
       1.75x num celular. Este teto vale igual em qualquer aparelho. */
    const TETO = 1.15e6 * qualidade;
    let d = Math.min(window.devicePixelRatio || 1, 2);
    const area = r.width * r.height * d * d;
    if (area > TETO) d *= Math.sqrt(TETO / area);
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (gl3d.width !== w) gl3d.width = w;
    if (gl3d.height !== h) gl3d.height = h;
    window.Cup3D.resize(w, h);
  }
  function fade3D(v) { if (gl3d) gl3d.style.opacity = v; }

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
        ctx.font = `700 ${u * 0.235}px Manrope, system-ui, sans-serif`;
        ctx.fillText('SPACE', 0, u * 0.02);
        ctx.font = `600 ${u * 0.072}px Manrope, system-ui, sans-serif`;
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

  function fade(v) { cv.style.opacity = v; if (gl3d) gl3d.style.opacity = v; }

  return { resize, clear, renderFake, fade, mount3D, afereQualidade,
           get is3D() { return !!gl3d; }, get w() { return W; }, get h() { return H; } };
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
  const nav      = $('#nav');

  const G = CONFIG.sequences.giro;
  const M = CONFIG.sequences.mergulho;

  let use3D = false;
  let target = 0, current = 0, needsDraw = true;
  let pGiro = 0, pDive = 1, totalScroll = 0;
  let running = false;
  let driveFromScroll = true;          // false quando o ScrollTrigger assume
  const last = { veil: -1, hud: -1, bar: -1, phase: '' };

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

    if (Stage.is3D) window.Cup3D.render(phase, t);
    else Stage.renderFake(phase, t);   // plano B sem WebGL: Canvas 2D

    /* fade do interior para a cor exata da loja.
       Só escreve no DOM o que mudou de verdade: antes eram 5 escritas de
       estilo por frame para valores quase sempre idênticos. */
    const dive = phase === 'dive' ? t : 0;
    const fade = +(p > pDive ? 1 : smoothstep(CONFIG.fadeStart, 1, dive)).toFixed(3);
    if (fade !== last.veil) {
      veil.style.opacity = fade * 0.55;      // escurece o interior
      Stage.fade(1 - fade);                  // e o copo se dissolve no fundo
      last.veil = fade;
    }

    const hudOpacity = +(1 - smoothstep(0, 0.22, dive)).toFixed(3);
    if (hudOpacity !== last.hud) {
      hud.style.opacity = hudOpacity;
      last.hud = hudOpacity;
    }

    const barPct = +(p * 100).toFixed(2);
    if (barPct !== last.bar) { bar.style.width = barPct + '%'; last.bar = barPct; }

    const phaseTxt = phase === 'giro' ? G.label : (dive > 0.82 ? 'ENTRANDO' : M.label);
    if (phaseTxt !== last.phase) { phaseEl.textContent = phaseTxt; last.phase = phaseTxt; }

    if (p > 0.96) nav.classList.add('is-live');
    else if (p < 0.93) nav.classList.remove('is-live');
  }

  /* --- loop com requestAnimationFrame ------------------------------------
     Estaciona quando o copo já saiu da tela e nada mais tem a animar; o
     scroll acorda de novo. Antes o loop ficava vivo o site inteiro. */
  /* amostragem para a escala adaptativa: 30 quadros, mediana, e recomeça */
  const intervalos = [];
  let quadroAnterior = 0, descartados = 0;

  function tick() {
    const agora = performance.now();
    /* Os primeiros quadros levam junto a compilação do shader e o envio da
       textura: medir ali condenaria qualquer aparelho ao piso. Descartados um
       a um, e não uma janela inteira, para o primeiro ajuste chegar antes. */
    if (quadroAnterior) {
      if (descartados < 8) descartados++;
      else intervalos.push(agora - quadroAnterior);
    }
    quadroAnterior = agora;
    if (intervalos.length >= 20) {
      intervalos.sort((a, b) => a - b);
      Stage.afereQualidade(intervalos[10]);   // mediana, não média: um
      intervalos.length = 0;                  // engasgo solto não decide nada
    }

    const rect = section.getBoundingClientRect();
    if (driveFromScroll) {
      target = clamp(-rect.top / Math.max(1, totalScroll));
    }

    const diff = target - current;
    if (Math.abs(diff) > 0.00015) {
      current += diff * (prefersReduced ? 1 : CONFIG.smoothing);
      needsDraw = true;
    } else if (current !== target) {
      current = target;
      needsDraw = true;
    }
    if (needsDraw) { render(current); needsDraw = false; }

    // uma única leitura de layout por quadro serve para o alvo e para a
    // decisão de estacionar
    if (current === target && rect.bottom <= 0) { running = false; quadroAnterior = 0; return; }
    requestAnimationFrame(tick);
  }

  function wake() {
    if (running) return;
    running = true;
    quadroAnterior = 0;      // a pausa entre acordadas não é tempo de quadro
    intervalos.length = 0;
    requestAnimationFrame(tick);
  }

  /* --- ligação com o scroll --------------------------------------------- */
  function bind() {
    measure();

    if (hasGSAP()) {
      driveFromScroll = false;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',       // o palco fica fixo via position:sticky
        invalidateOnRefresh: true,
        onUpdate: self => { target = self.progress; wake(); },
        onRefresh: self => { Stage.resize(); target = self.progress; needsDraw = true; }
      });
      ScrollTrigger.addEventListener('refreshInit', measure);
    }
    // o alvo é lido dentro do próprio tick quando não há ScrollTrigger

    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        measure();
        Stage.resize();
        needsDraw = true;
        wake();
        if (hasGSAP()) ScrollTrigger.refresh();
      }, 140);
    });

    Stage.resize();
    addEventListener('scroll', wake, { passive: true });
    wake();
  }

  /* --- preloader --------------------------------------------------------- */
  let released = false;
  function release() {
    if (released) return;
    released = true;
    $('#preloader').classList.add('is-done');
    document.body.classList.remove('is-locked');
    bind();
    setTimeout(() => { if (hasGSAP()) ScrollTrigger.refresh(); }, 400);
  }

  async function boot() {
    // aconteça o que acontecer, a loja abre em 25s. Nunca uma tela presa.
    const watchdog = setTimeout(() => { if (!released) release(); }, 25000);

    const fill = $('#preloaderFill');
    const pct  = $('#preloaderPct');
    const msg  = $('#preloaderMsg');
    const setPct = v => {
      const n = Math.round(clamp(v) * 100);
      fill.style.width = n + '%';
      pct.textContent = n + '%';
    };

    msg.textContent = 'modelando o copo';
    setPct(0.3);
    // O copo é gerado por código: geometria, shader e textura ficam prontos
    // aqui mesmo, de forma síncrona. A barra marca trabalho real — não há
    // download a esperar, então ela não finge demora.
    use3D = Stage.mount3D();
    if (!use3D) msg.textContent = 'preparando a prévia';

    setPct(1);
    msg.textContent = 'pronto';
    await new Promise(r => requestAnimationFrame(r));
    clearTimeout(watchdog);
    release();
  }

  return { boot, release, get info() { return { engine: use3D ? 'webgl' : 'canvas2d' }; } };
})();

/* ============================================================================
   [8] UI — vitrine, catálogo, filtros, favoritos e orçamento
   ========================================================================== */

const PH_CACHE = new Map();
function cached(key, build) {
  let v = PH_CACHE.get(key);
  if (v === undefined) { v = build(); PH_CACHE.set(key, v); }
  return v;
}

const ICO = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.2-4.4-7.2-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.2 3.1C19.2 15.6 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>',
  plus:  '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>'
};

const favs = new Set(store.get('favs', []));
const saveFavs = () => store.set('favs', [...favs]);

/* --- templates ------------------------------------------------------------ */

function showcaseCard(p, wide) {
  const base = startPrice(p);
  const fav = favs.has(p.id) ? ' is-on' : '';
  const media = `<div class="pcard__media" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.webp"></div>`;
  const top2 = `
    <div class="pcard__top">
      <button class="iconbtn iconbtn--outline" data-add="${p.id}" aria-label="Adicionar ${p.name} ao orçamento">${ICO.arrow}</button>
      <button class="iconbtn iconbtn--outline pcard__fav${fav}" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${!!fav}">${ICO.heart}</button>
    </div>`;

  if (wide) {
    return `<article class="pcard pcard--wide" data-cat="${p.cat}" data-id="${p.id}">
      ${media}${top2}
      <div class="pcard__corpo">
        <h3 class="pcard__name">${p.name}</h3>
        <div class="pcard__foot">
          <a class="pill pill--light pcard__more" href="#catalogo" data-jump="${p.id}">SAIBA MAIS ${ICO.arrow.replace('<svg', '<svg class="ico-arrow"')}</a>
          <span class="minlot">a partir de 1 uni</span>
        </div>
      </div>
    </article>`;
  }

  return `<article class="pcard" data-cat="${p.cat}" data-id="${p.id}">
    ${media}${top2}
    <div class="pcard__corpo">
      <div class="pcard__tags">${selo(p)}</div>
      <h3 class="pcard__name">${p.name}</h3>
      <p class="pcard__desc">${p.desc}</p>
      <div class="pcard__foot">
        <div>
          <span class="pcard__price"><b>${money(base)}</b><span class="pcard__each">/un</span></span>
          <span class="pcard__unit">sem pedido mínimo${
            hasVolume(p) ? ` · até ${money(bestPrice(p))}/un a partir de ${bestQty(p)}` : ''}</span>
        </div>
      </div>
    </div>
  </article>`;
}

function catalogCard(p) {
  const best = bestPrice(p), start = startPrice(p);
  // Com uma faixa só, a tabela repete o preço que já está em destaque logo
  // abaixo — quatro vezes a mesma informação no mesmo card.
  // Sem pedido mínimo a primeira faixa começa em 1, e "1+ unidades" lê torto.
  // Intervalo fechado diz a mesma coisa sem ambiguidade: quem leva 12 vê na
  // hora que está na faixa de 1 a 29, não na de 30.
  const tiers = hasVolume(p)
    ? p.tiers.map(([q, v], i) => {
        const ate = p.tiers[i + 1] ? p.tiers[i + 1][0] - 1 : 0;
        const faixa = ate ? `${q} a ${ate} unidades` : `${q} unidades ou mais`;
        return `<li class="${v === best ? 'is-best' : ''}"><span>${faixa}</span><b>${money(v)} <i>/un</i></b></li>`;
      }).join('')
    : '';
  const fav = favs.has(p.id) ? ' is-on' : '';
  return `<article class="ccard" data-cat="${p.cat}" data-id="${p.id}" id="p-${p.id}">
    <div class="ccard__media" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.webp">
      <div class="ccard__tags">${selo(p)}</div>
      <button class="iconbtn iconbtn--outline ccard__fav pcard__fav${fav}" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${!!fav}">${ICO.heart}</button>
    </div>
    <h3 class="ccard__name">${p.name}</h3>
    <p class="ccard__desc">${p.desc}</p>
    ${tiers ? `<ul class="ccard__tiers">${tiers}</ul>` : ''}
    <div class="ccard__foot">
      <div>
        <span class="ccard__from">preço por unidade</span>
        <span class="ccard__price">${money(start)}<i class="ccard__each">/un</i></span>
        <p class="ccard__min"><b>sem pedido mínimo</b>${
          hasVolume(p) ? `<br>cai para ${money(best)}/un a partir de ${bestQty(p)}` : ''}</p>
      </div>
      <div class="ccard__qty">
        <button data-step="-1" aria-label="Diminuir">${ICO.minus}</button>
        <input type="number" value="1" min="1" step="1" aria-label="Quantidade de ${p.name}">
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
const PAGE = 4;
let showcaseFilter = 'todos';
let showcaseStart = 0;
let showcaseOrder = [...SHOWCASE_IDS, ...PRODUCTS.map(p => p.id).filter(id => !SHOWCASE_IDS.includes(id))];

function showcaseList() {
  const ids = showcaseFilter === 'todos'
    ? showcaseOrder
    : PRODUCTS.filter(p => p.cat === showcaseFilter).map(p => p.id);
  return ids.map(byId).filter(Boolean);
}

function renderShowcase(filter) {
  if (filter !== undefined && filter !== showcaseFilter) { showcaseFilter = filter; showcaseStart = 0; }
  const host = $('#showcase');
  const list = showcaseList();
  if (!list.length) return;

  showcaseStart = ((showcaseStart % list.length) + list.length) % list.length;
  const pool = Array.from({ length: Math.min(PAGE, list.length) },
                          (_, k) => list[(showcaseStart + k) % list.length]);

  // o grid acompanha quantos cards realmente existem: uma categoria com
  // 2 itens não pode deixar 60% da linha vazia
  // atributo de layout do CSS (.showcase[data-count="N"]); o contador animado
  // usa data-count-to justamente para não escrever por cima destes cards
  host.dataset.count = String(pool.length);
  // O terceiro card era largo, ocupando duas colunas: com quatro cards em
  // quatro colunas isso pede cinco vagas e o último caía sozinho numa linha
  // nova, deixando meia seção vazia. Agora todos têm a mesma medida e o
  // ritmo vem do degrau vertical, no CSS.
  host.innerHTML = pool.map(p => showcaseCard(p, false)).join('');
  hydratePlaceholders(host);

  $('#showcaseTotal').textContent = String(list.length);
  $('#showcaseIndex').textContent = String(showcaseStart + 1);

  if (hasGSAP() && !prefersReduced) {
    gsap.fromTo(host.children,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: .7, stagger: .07, ease: 'power3.out', overwrite: true });
  }
}

function shiftShowcase(dir) {
  const n = showcaseList().length;
  if (!n) return;
  showcaseStart = (showcaseStart + dir * PAGE % n + n) % n;
  renderShowcase();
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
  // um id salvo no localStorage que saiu do catálogo derrubava o init()
  // inteiro — e como is-locked já estava aplicado, a página ficava preta
  // e travada em toda recarga. Saneia na entrada.
  let items = store.get('cart', []).filter(i => i && byId(i.id) && i.qty > 0);
  const save = () => { store.set('cart', items); paint(); };

  function add(id, qty) {
    const p = byId(id);
    if (!p) return;
    const q = Math.max(1, qty || 1);
    const found = items.find(i => i.id === id);
    if (found) found.qty += q; else items.push({ id, qty: q });
    save();
    toast(`${q} uni de ${p.name} no orçamento`);
  }
  function setQty(id, qty) {
    const p = byId(id);
    const it = items.find(i => i.id === id);
    if (!p || !it) return;
    it.qty = Math.max(1, qty);
    save();
  }
  function remove(id) { items = items.filter(i => i.id !== id); save(); }
  const total = () => items.reduce((s, i) => {
    const p = byId(i.id);
    return p ? s + unitPrice(p, i.qty) * i.qty : s;
  }, 0);

  function message() {
    if (!items.length) return 'Olá! Quero um orçamento de brindes personalizados.';
    const lines = items.map(i => {
      const p = byId(i.id);
      const u = unitPrice(p, i.qty);
      return `• ${p.name}: ${i.qty} uni × ${money(u)} = ${money(u * i.qty)}`;
    });
    return `Olá, Space! Montei meu orçamento no site:\n\n${lines.join('\n')}\n\nEstimativa: ${money(total())}\n\nPodem confirmar prazo e valor final?`;
  }

  function paint() {
    const body = $('#drawerBody');
    $('#cartCount').textContent = String(items.length);
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
      /* "faixa de 1+" nao dizia nada com o pedido minimo fora. No lugar entra
         a proxima faixa: quanto a peca custaria subindo o lote. E a unica
         informacao do orcamento que ajuda quem esta decidindo a quantidade. */
      const prox = p.tiers.find(([q]) => q > i.qty);
      const dica = prox ? ` · a partir de ${prox[0]} uni sai a ${money(prox[1])}` : '';
      return `<div class="ditem" data-id="${p.id}">
        <span class="ditem__thumb" data-ph="${p.ph}" data-src="assets/produtos/${p.id}.webp"></span>
        <div class="ditem__body">
          <p class="ditem__name">${p.name}</p>
          <p class="ditem__meta">${money(u)} / uni${dica}</p>
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
  const q = qty || 1;
  const u = unitPrice(p, q);
  const txt = `Olá, Space! Tenho interesse em:\n\n• ${p.name}\n• Quantidade: ${q} uni\n• Valor de referência: ${money(u)} / uni\n\nPodem me passar o orçamento?`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
}

/* ============================================================================
   INTERAÇÕES GLOBAIS
   ========================================================================== */

function resetCatalogFilter() {
  $$('#catalogFilters [role="tab"]').forEach(b => {
    const on = b.dataset.cfilter === 'todos';
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
  });
  renderCatalog('todos');
}

function qtyOfCard(el) {
  const card = el.closest('.ccard');
  const input = card && $('input', card);
  const n = input ? parseInt(input.value, 10) : NaN;
  return Number.isFinite(n) ? n : 0;
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
    // campo vazio dava NaN, que o input[type=number] apagava — e os
    // botões ficavam mortos até alguém digitar um número na mão
    const cur = parseInt(input.value, 10);
    const from = Number.isFinite(cur) ? cur : 1;
    const next = from + Number(step.dataset.step);
    input.value = Math.max(1, next);
    return;
  }

  /* índice: cai no catálogo já filtrado pela categoria escolhida */
  const cjump = e.target.closest('[data-cjump]');
  if (cjump) {
    e.preventDefault();
    const alvo = $(`#catalogFilters [data-cfilter="${cjump.dataset.cjump}"]`);
    if (alvo) alvo.click();
    $('#catalogo').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    return;
  }

  /* ir até o produto no catálogo */
  const jump = e.target.closest('[data-jump]');
  if (jump) {
    e.preventDefault();
    const id = jump.dataset.jump;
    let el = $('#p-' + id);
    if (!el) {
      // o card não está na tela porque o catálogo está filtrado noutra
      // categoria: volta para "Todos" e procura de novo
      resetCatalogFilter();
      el = $('#p-' + id);
    }
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      el.classList.add('is-target');
      setTimeout(() => el.classList.remove('is-target'), 2400);
    } else {
      $('#catalogo').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
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
    Cart.setQty(id, it.qty + Number(q.dataset.q));
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del) { Cart.remove(del.closest('.ditem').dataset.id); return; }
});

document.addEventListener('input', e => {
  if (e.target.matches('.ccard__qty input')) {
    const p = byId(e.target.closest('.ccard').dataset.id);
    if (e.target.value !== '' && +e.target.value < 1) e.target.setAttribute('aria-invalid', 'true');
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
  /* O cabeçalho passa por faixas claras e escuras: sobre papel ele inverte,
     senão o texto claro some. Quem decide é a seção que está DEBAIRO da
     barra, não a posição de rolagem. */
  const faixas = $$('[data-theme]');
  function corDaBarra() {
    const y = nav.getBoundingClientRect().bottom - 4;
    let claro = false;
    for (const f of faixas) {
      const r = f.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) claro = f.dataset.theme !== 'ink';
    }
    nav.classList.toggle('is-light', claro);
  }
  // a barra só entra quando a introdução do copo termina
  const intro = $('#cup');
  addEventListener('scroll', () => {
    nav.classList.toggle('is-stuck', scrollY > innerHeight * 1.2);
    if (intro) nav.classList.toggle('is-hidden', intro.getBoundingClientRect().bottom > 90);
    corDaBarra();
  }, { passive: true });
  addEventListener('resize', corDaBarra);
  corDaBarra();
  if (intro) nav.classList.toggle('is-hidden', intro.getBoundingClientRect().bottom > 90);

  // #top é o <main> inteiro: cruzava a faixa do observer desde o load e
  // nunca mais emitia, então INÍCIO jamais voltava a acender
  const links = $$('#navMenu a');
  const targets = [$('.hero'), $('#novidades'), $('#produtos'), $('#historia'), $('#catalogo')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const idx = targets.indexOf(en.target);
      if (idx < 0) return;
      links.forEach((a, k) => a.classList.toggle('is-active', k === idx));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach(el => { if (el) spy.observe(el); });
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
  // o observer pegava o .reveal e o [data-count-to] dentro dele: dois loops
  // de rAF escrevendo o mesmo textContent, o número tremia e voltava
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const end = Number(el.dataset.countTo) || 0;
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
      $$('[data-count-to]', en.target).forEach(animateCount);
      if (en.target.matches('[data-count-to]')) animateCount(en.target);
      obs.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('.reveal, [data-count-to]').forEach(el => io.observe(el));
}

/* ── Inclinação 3D + brilho que segue o cursor ─────────────────────────
   Um único listener delegado no documento: 30 cards com listener cada um
   custaria caro e não daria nada a mais. */
function wireTilt() {
  if (prefersReduced || matchMedia('(hover: none)').matches) return;

  const SEL = '.pcard, .ccard, .feat--dark, .dealCard, .statCard';
  let active = null, rect = null, pending = null, queued = false;

  document.addEventListener('mousemove', e => {
    const card = e.target.closest(SEL);
    if (card !== active) {
      if (active) reset(active);
      active = card;
      // o rect só muda com scroll ou resize, não a cada movimento do mouse
      rect = card ? card.getBoundingClientRect() : null;
      if (card) card.classList.add('is-tilting');
    }
    if (!card || !rect) return;
    pending = [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }, { passive: true });

  function apply() {
    queued = false;
    if (!active || !pending) return;
    const [px, py] = pending;
    active.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    active.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    active.style.transform =
      `perspective(1100px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) `
      + `rotateY(${((px - 0.5) * 9).toFixed(2)}deg) translateY(-6px)`;
  }

  function reset(card) {
    card.classList.remove('is-tilting');
    card.style.transform = '';
  }
  addEventListener('scroll', () => { if (active) rect = active.getBoundingClientRect(); }, { passive: true });
  document.addEventListener('mouseleave', () => { if (active) { reset(active); active = null; rect = null; } });
}

/* ── Paralaxe da luz de fundo ──────────────────────────────────────────
   As manchas derivam com o scroll além da própria animação, então o
   material atrás do vidro nunca fica parado. */
function wireParallax() {
  if (prefersReduced) return;
  const orbs = $$('.ambient__orb');
  if (!orbs.length) return;

  let ticking = false;
  const depth = [0.06, -0.09, 0.045];
  const RANGE = 240;   // limite do passeio, em px

  function frame() {
    const y = window.scrollY;
    orbs.forEach((o, i) => {
      // Deslocamento LIMITADO. Multiplicar o scrollY cru empurrava as três
      // manchas para fora da tela depois de duas rolagens, e aí não sobrava
      // nada atrás do vidro para desfocar.
      const raw = y * depth[i % depth.length];
      const py = Math.sin(raw / RANGE) * RANGE;
      o.style.setProperty('--py', py.toFixed(1) + 'px');
    });
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }, { passive: true });
  frame();
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

/* Os quatro grupos eram Oferta / Mais vendidos / Novidades / Recomendados, e
   a lista de cada um era escrita na mão — a loja não tem ranking de venda nem
   data de entrada de produto para sustentar nenhum dos quatro. Agora cada
   grupo é uma pergunta que o catálogo responde sozinho. */
const GRUPOS = {
  queda:   { ordem: (a, b) => dropPct(b) - dropPct(a),           filtra: hasVolume },
  ate30:    { ordem: (a, b) => startPrice(a) - startPrice(b),     filtra: p => startPrice(p) <= 30 },
  acima70:  { ordem: (a, b) => startPrice(b) - startPrice(a),     filtra: p => startPrice(p) > 70 },
  churrasco:{ ordem: (a, b) => startPrice(a) - startPrice(b),     filtra: p => p.cat === 'churrasco' }
};

function grupo(key) {
  const g = GRUPOS[key] || GRUPOS.queda;
  return PRODUCTS.filter(g.filtra).sort(g.ordem);
}

function mostraDestaque(p) {
  if (!p) return;
  $('#dealName').textContent = p.name;
  $('#dealDesc').textContent = p.desc;
  $('#dealPrice').innerHTML = `${money(startPrice(p))}<i class="dealCard__each">/un</i>`;
  $('#dealUnit').textContent = 'sem pedido mínimo' +
    (hasVolume(p) ? ` · até ${money(bestPrice(p))}/un a partir de ${bestQty(p)}` : '');
  $('#dealMin').textContent = 'a partir de 1 uni';
  $('#dealAdd').dataset.add = p.id;
  const media = $('#dealMedia');
  media.dataset.ph = p.ph;
  media.dataset.src = `assets/produtos/${p.id}.webp`;
  media.setAttribute('aria-label', p.name);
  paint(media, p.ph, PRODUCTS.indexOf(p));
  if (hasGSAP() && !prefersReduced) {
    gsap.fromTo('#dealCard', { y: 14, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' });
  }
}

function wireDeals() {
  wireFilters('#dealFilters', 'deal', key => mostraDestaque(grupo(key)[0]));
  // o HTML já nasce com a primeira aba marcada; deixa o card de acordo com ela
  mostraDestaque(grupo('queda')[0]);
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

  $('#showcaseNext').addEventListener('click', () => shiftShowcase(1));
  $('#showcasePrev').addEventListener('click', () => shiftShowcase(-1));
  $('#typesShuffle').addEventListener('click', () => {
    // Fisher-Yates: sort(() => Math.random() - .5) não é embaralhamento,
    // é um comparador inconsistente que deixa o começo quase intacto
    const ids = PRODUCTS.map(p => p.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[k]] = [ids[k], ids[i]];
    }
    showcaseOrder = ids;
    showcaseStart = 0;
    renderShowcase('todos');
    $$('#filters [role="tab"]').forEach(b => {
      const on = b.dataset.filter === 'todos';
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    toast('Destaques renovados');
  });

  HeroSlider.init();
  wireNav();
  wireReveal();
  wireMagnetic();
  wireTilt();
  wireParallax();

  Cup.boot().catch(err => { console.error('[copo]', err); Cup.release(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* diagnóstico rápido no console */
window.SPACE = { CONFIG, PRODUCTS, Cart, get sequences() { return Cup.info; } };
