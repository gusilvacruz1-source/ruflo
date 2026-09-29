/* ============================================================================
   SPACE PERSONALIZADOS — script.js
   Vanilla JS · zero dependência externa
   ----------------------------------------------------------------------------
   [1] CONFIG          — tudo que você precisa editar fica aqui em cima
   [2] UTILS           — helpers
   [3] ESPAÇO DA FOTO  — tom liso até a foto chegar; foto só perto da tela
   [4] CATALOGO        — os produtos reais do catálogo Space
   [6] ABERTURA        — a nebulosa com a marca no meio + preloader
   [8] UI              — filtros, favoritos, contadores, orçamento
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

  /* --- NEGÓCIO ----------------------------------------------------------- */
  whatsapp: '5542991343788',
  instagram: 'https://www.instagram.com/space_personalizados/',
  /* A partir de quantas peças o site mostra preço. A tabela de cada produto
     continua como veio da Space, com o preço da unidade avulsa; o que fica
     abaixo deste número não aparece em lugar nenhum e sai por orçamento no
     WhatsApp. Voltar a mostrar a peça avulsa é trocar para 1. */
  qtdMinima: 10
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

/* VERSÃO DOS ARQUIVOS
   Foto corrigida com o mesmo nome não chegava a quem já tinha visitado: o
   navegador (e o GitHub Pages, que manda guardar por 10 min) seguia
   entregando a antiga - a correção das bordas quadradas estava no ar e o
   site continuava igual na tela. Agora toda foto sai com ?v=<versão>, e a
   versão vem do próprio <script src="js/script.js?v=..."> do index.html:
   é só trocar o número lá a cada publicação e tudo é buscado de novo. */
const VERSAO = (() => {
  try { return new URL(document.currentScript.src).searchParams.get('v') || ''; }
  catch { return ''; }
})();
const comVersao = u => (VERSAO ? `${u}${u.includes('?') ? '&' : '?'}v=${VERSAO}` : u);

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = n => BRL.format(n);

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ENTRADA DOS CARDS
   Eram três chamadas ao GSAP, e o GSAP era um arquivo baixado de um CDN só
   para elas: uma biblioteca inteira para três fades de entrada. Isto aqui faz
   o mesmo em CSS. O `void el.offsetWidth` força o reflow, senão trocar de
   filtro não reinicia a animação — o navegador vê a mesma classe e não
   repete. */
function animaEntrada(host, atraso = 55) {
  if (prefersReduced || !host) return;
  Array.from(host.children).forEach((el, i) => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = `entraCard .55s var(--ease) ${i * atraso}ms both`;
  });
}

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
   [3] ESPAÇO DA FOTO
   --------------------------------------------------------------------------
   Aqui havia um gerador de arte: silhuetas SVG preenchidas com gradiente
   metálico, poça de luz, sombra de contato e grão, montadas em tempo de
   execução para cada produto e para cada cena. Saiu a pedido, e a razão era
   boa — aquilo aparecia ANTES da foto e o cliente via um desenho falso do
   produto antes de ver o produto. Duas imagens diferentes da mesma coisa em
   sequência, e a primeira inventada.

   No lugar fica um tom liso. O card já tem a cor certa, a foto entra por
   cima quando chega, e no intervalo não há nada para o olho corrigir.
   ========================================================================== */

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
    // a foto do card troca quando muda a cor: sem esta checagem uma
    // sondagem lenta pinta a foto da cor anterior sobre a nova
    if (el.dataset.src !== real) return;
    el.style.setProperty('--photo', `url("${comVersao(real)}")`);
    el.style.backgroundImage = `url("${comVersao(real)}")`;
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
  probe.src = comVersao(real);
  if (probe.decode) {
    probe.decode().then(() => enfileiraFoto(aplica))
                  .catch(() => { if (probe.complete && probe.naturalWidth) enfileiraFoto(aplica); });
  } else {
    probe.onload = () => enfileiraFoto(aplica);
  }
}

/** Aplica o placeholder e agenda a troca pela foto real, se ela existir. */
function paint(el) {
  /* Nada de imagem enquanto a foto não chega: o CSS já pinta o tom do card.
     `seed` e `key` sumiram junto com a arte gerada. */
  el.style.removeProperty('background-image');
  el.classList.remove('has-photo');
  if (!el.dataset.src) return;
  if (!fotoIO) { buscaFoto(el); return; }
  fotoIO.unobserve(el);                       // um card repintado volta aqui
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight + 700 && r.bottom > -700) buscaFoto(el);
  else fotoIO.observe(el);
}

function hydratePlaceholders(root = document) {
  $$('[data-ph]', root).forEach(paint);
}

/* ============================================================================
   [4] CATÁLOGO — dados reais do catálogo Space Personalizados
   --------------------------------------------------------------------------
   tiers: faixas de preço por quantidade [a partir de quantas, preço unitário],
          como a Space passou. O site corta tudo abaixo de CONFIG.qtdMinima
          logo depois da lista (veja "A PARTIR DE 10").
   ========================================================================== */

const PRODUCTS = [
  { id:'copo-473', name:'Copo Térmico Inox 473ml', cat:'copos', ph:'copo',
    desc:'Dupla parede em inox, acompanha tampa e abridor personalizado a laser.',
    tiers:[[1,49.99],[10,24.90],[50,23.90],[100,22.90]] },

  { id:'copo-360', name:'Copo Térmico Inox 360ml', cat:'copos', ph:'copo',
    desc:'Parede em inox com tampa, para bebidas quentes e frias.',
    tiers:[[1,49.99],[10,24.90],[50,23.90],[100,22.90]] },

  { id:'copo-360-tampa', name:'Copo Térmico 360ml · Tampa Transparente', cat:'copos', ph:'copo',
    desc:'Copo térmico com aro de inox e tampa transparente, em preto ou branco. A foto mostra as duas cores lado a lado.',
    detalhe:true,
    cores:[
      { id:'preto',  nome:'Preto',  hex:'#1f1f1f', foto:'copo-360-tampa' },
      { id:'branco', nome:'Branco', hex:'#e6e8ec', foto:'copo-360-tampa' }
    ],
    tiers:[[1,49.99],[10,24.90],[50,23.90],[100,22.90]] },

  { id:'copo-long-neck', name:'Copo Térmico Long Neck 420ml', cat:'copos', ph:'copo',
    desc:'Inox de 420 ml que serve de copo ou de porta-lata e porta long neck. Vem com tampa, anel de borracha e abridor de garrafa. 19 cm de altura. Na cor preta.',
    tiers:[[1,49.90],[10,39.99],[50,36.90],[100,35.99]] },

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

  { id:'caneca-termica-350', name:'Caneca Térmica Inox 350ml', cat:'copos', ph:'caneca',
    desc:'Inox de parede dupla com tampa acrílica, bocal e trava de segurança. Na cor preta.',
    detalhe:true },

  { id:'caneca-termica-1200', name:'Caneca Térmica 1,2L', cat:'copos', ph:'caneca',
    desc:'Inox 304 de parede dupla, tampa acrílica rosqueável com bico flexível e pegador plástico. Acompanha canudo. Na cor preta.' },

  { id:'caneca-inox-180', name:'Caneca Inox 180ml', cat:'copos', ph:'caneca',
    desc:'Caneca em inox de 180 ml com cabo e tampa em plástico resistente. Não é térmica.' },

  /* Uma garrafa LED só. Estavam no catálogo "Garrafa Térmica 500ml" (foto na
     mão, gravada) e "Garrafa Térmica LED 500ml" (foto do anúncio), e são a
     mesma garrafa: o visor fica em cima da tampa e não aparece de lado. A foto
     principal é a gravada; a lupa mostra a tampa com o visor. */
  { id:'garrafa-led', name:'Garrafa Térmica LED 500ml', cat:'garrafas', ph:'garrafa',
    desc:'Inox por dentro e por fora, com visor de LED na tampa que mostra a temperatura da bebida. Na cor preta.',
    detalhe:true,
    tiers:[[1,49.00],[10,29.90],[50,27.90],[100,25.90]] },

  { id:'garrafa-800', name:'Garrafa Térmica 800ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa térmica de 800 ml com tampa rosqueável e vedação reforçada.',
    tiers:[[1,49.90]] },

  { id:'garrafa-800-silicone', name:'Garrafa Térmica 800ml · Base de Silicone', cat:'garrafas', ph:'garrafa',
    desc:'Aço inox por dentro e por fora, tampa com bico e alça, e base de silicone. Na cor preta.' },

  { id:'garrafa-aluminio-600', name:'Garrafa em Alumínio 600ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa esportiva em alumínio de 600 ml, gravada a laser.',
    tiers:[[1,44.90],[20,42.90],[50,39.90]] },

  { id:'kit-garrafa-450', name:'Kit Garrafa Térmica 450ml', cat:'garrafas', ph:'garrafa',
    desc:'Garrafa em inox de 450 ml com base antiderrapante e duas tampas extras que viram xícaras. Acompanha sacola de papel com berço de papelão.',
    detalhe:true,
    cores:[
      { id:'azul',  nome:'Azul',  hex:'#364c5d' },
      { id:'cinza', nome:'Cinza', hex:'#616462' },
      { id:'inox',  nome:'Inox',  hex:'#bfbeb8' },
      { id:'preto', nome:'Preto', hex:'#2c2d31' },
      { id:'rose',  nome:'Rosé',  hex:'#d6b3a2' },
      { id:'verde', nome:'Verde', hex:'#7d9d80' }
    ] },

  { id:'churrasco-5', name:'Kit Churrasco 5 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Garfo, faca, pegador, espátula, pincel e espetos. Acompanha bolsa.',
    tiers:[[1,99.90],[10,79.90]] },

  { id:'churrasco-4', name:'Kit Churrasco Maleta 4 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Maleta de alumínio com trava e forro em TNT. Faca de 8 polegadas, garfo de duas pontas, espátula e pegador em inox.',
    tiers:[[1,159.90],[10,119.90]] },

  { id:'churrasco-2-estojo', name:'Kit Churrasco 2 Peças · Estojo', cat:'churrasco', ph:'churrasco',
    desc:'Faca de 8 polegadas e garfo de duas pontas em inox, cabo de madeira, em estojo com zíper e alça.',
    tiers:[[1,75.90],[10,55.90]] },

  { id:'churrasco-2-caixa', name:'Kit Churrasco 2 Peças · Caixa', cat:'churrasco', ph:'churrasco',
    desc:'Garfo e faca de 8 polegadas, acompanha caixa para presente.',
    tiers:[[1,75.90],[10,55.90]] },

  { id:'churrasco-5-nylon', name:'Kit Churrasco 5 Peças · Nylon', cat:'churrasco', ph:'churrasco',
    desc:'Faca de 6 polegadas, garfo, espátula, pincel com cerdas de silicone e pegador em inox, em estojo de nylon com par de alças. Acompanha placa metálica personalizável.' },

  { id:'churrasco-4-nylon', name:'Kit Churrasco 4 Peças · Nylon', cat:'churrasco', ph:'churrasco',
    desc:'Espátula, garfo, pegador e faca de 7 polegadas em inox com cabo de madeira, em estojo de nylon. Acompanha plaquinha metálica personalizável.' },

  { id:'churrasco-3', name:'Kit Churrasco 3 Peças', cat:'churrasco', ph:'churrasco',
    desc:'Faca de 8 polegadas, garfo de duas pontas e pegador em inox com detalhes em madeira, em estojo de nylon com alça. Acompanha plaquinha adesiva personalizável.' },

  { id:'canivete-inox', name:'Canivete Inox com Presilha', cat:'canivetes', ph:'canivete',
    desc:'Canivete em aço inox com presilha de bolso e gravação a laser.',
    tiers:[[1,99.90],[10,49.90]] },

  { id:'canivete-aco', name:'Canivete com Lâmina de Aço', cat:'canivetes', ph:'canivete',
    desc:'Lâmina de aço com cabo ergonômico, ideal para brinde masculino.',
    tiers:[[1,69.90],[10,39.90]] },

  { id:'caderneta', name:'Caderneta Couro Sintético', cat:'escritorio', ph:'caneta',
    desc:'Capa em couro sintético com plaquinha metálica personalizável, porta-canetas lateral e marca-páginas em fita de cetim. Cerca de 96 folhas pautadas.',
    cores:[
      { id:'preto',    nome:'Preto',    hex:'#433f42' },
      { id:'azul',     nome:'Azul',     hex:'#374e6a' },
      { id:'caramelo', nome:'Caramelo', hex:'#8c5633' },
      { id:'cinza',    nome:'Cinza',    hex:'#8b887f' }
    ] },

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

/* A PARTIR DE 10
   A dona pediu para tirar o preço de 1 a 9 unidades. A faixa que cobre a
   quantidade mínima passa a começar nela, e as abaixo somem:
     copo 473   [1] 49,99 [10] 24,90 ...  ->  [10] 24,90 ...
     caneca 700 [1] 69,90 [20] 49,90 ...  ->  [10] 69,90 [20] 49,90 ...
     chapéu     [1] 80 [5] 70 [10] 60     ->  [10] 60
   Daqui para baixo nenhuma conta conhece o preço avulso. */
function aPartirDe(tiers, min) {
  const cobre = tiers.filter(([q]) => q <= min).pop();
  const depois = tiers.filter(([q]) => q > min);
  return cobre ? [[min, cobre[1]], ...depois] : depois;
}
PRODUCTS.forEach(p => { if (p.tiers) p.tiers = aPartirDe(p.tiers, CONFIG.qtdMinima); });

const byId = id => PRODUCTS.find(p => p.id === id);

/* SOB CONSULTA
   Produto sem `tiers` nao tem preco no site: o valor sai por orcamento no
   WhatsApp. Ele continua no catalogo, continua entrando no orcamento e
   continua indo na mensagem - o que nao existe e o numero. Tudo que conta
   dinheiro daqui para baixo pergunta isto primeiro. */
const semPreco = p => !p.tiers || !p.tiers.length;
/* Abaixo da primeira faixa (menos de 10 peças) o produto também fica sem
   preço: entra no orçamento e na mensagem, com o valor a combinar. */
const semPrecoPara = (p, qty) => semPreco(p) || qty < p.tiers[0][0];

/** Preço unitário para uma quantidade, respeitando as faixas. 0 = a combinar. */
function unitPrice(p, qty) {
  if (semPrecoPara(p, qty)) return 0;
  let price = p.tiers[0][1];
  for (const [min, val] of p.tiers) if (qty >= min) price = val;
  return price;
}
/* O número em destaque é o da primeira faixa, a menor quantidade com preço.
   O preço de volume é a promessa, não a manchete: anunciar R$ 2,25 é mostrar
   um preço que exige 500 peças para existir. */
const startPrice = p => (semPreco(p) ? 0 : p.tiers[0][1]);
const bestPrice  = p => (semPreco(p) ? 0 : Math.min(...p.tiers.map(t => t[1])));
const bestQty    = p => (semPreco(p) ? 0 : p.tiers.reduce((a, t) => t[1] <= a[1] ? t : a)[0]);
const hasVolume  = p => !semPreco(p) && bestPrice(p) < startPrice(p);
/* Quantidade com que o card e o orçamento começam. */
const qtdInicial = () => CONFIG.qtdMinima;
/* --- VARIAÇÕES DE COR ----------------------------------------------------
   Um produto pode vir em mais de uma cor. A foto de cada uma mora em
   assets/produtos/<id>-<cor>.webp; produto sem cor segue em <id>.webp como
   sempre foi, e nada no catálogo antigo precisou mudar de nome. */
const corDe  = (p, id) => (p.cores ? (p.cores.find(c => c.id === id) || p.cores[0]) : null);
/* Uma cor pode apontar para uma foto compartilhada (campo `foto`). Foi o
   caso do copo de 360 ml com tampa: o anúncio só tem uma foto com o preto e o
   branco juntos, e o preto fica NA FRENTE do branco, então não dá para
   recortar o branco sozinho sem ele sair com um pedaço faltando. As duas
   bolinhas mostram a mesma foto, e a cor escolhida continua indo para o
   orçamento e para o WhatsApp, que é o que a Space precisa. */
const fotoDe = (p, id) => {
  const c = corDe(p, id);
  if (c && c.foto) return `assets/produtos/${c.foto}.webp`;
  return `assets/produtos/${p.id}${c ? '-' + c.id : ''}.webp`;
};
/* FOTO DE DETALHE
   Alguns produtos têm uma segunda imagem: um macro de um recurso que a foto
   principal não mostra, como a trava da tampa. Ela mora em
   assets/produtos/<id>-detalhe.webp e só é BAIXADA quando alguém pede para
   ver — um site que acabou de cortar metade do peso não vai carregar uma
   segunda foto por produto que quase ninguém abre. */
const temDetalhe = p => !!p.detalhe;
const fotoDetalhe = p => `assets/produtos/${p.id}-detalhe.webp`;

/* Uma linha do orçamento é o produto MAIS a cor: duas cores da mesma
   caderneta são duas linhas, e não uma com o dobro da quantidade. Sem cor a
   chave continua sendo o próprio id, então os carrinhos já salvos no
   navegador seguem valendo sem conversão nenhuma. */
const chaveItem = (id, cor) => (cor ? id + '|' + cor : id);

/* ============================================================================
   [6] ABERTURA — a nebulosa com a marca no meio
   --------------------------------------------------------------------------
   Aqui moravam 460 linhas: um copo modelado por código em WebGL puro, com
   superfície de revolução, shader de iluminação de estúdio, mesa giratória e
   escala adaptativa de resolução, mais quatro telas e meia de rolagem
   controlada — e um copo de reserva desenhado em Canvas 2D para quem não
   tivesse WebGL. Saiu inteiro a pedido.

   O que ficou é uma capa: o papel de parede, a marca no meio e uma tela de
   altura. Sem canvas, sem laço de animação, sem rolagem presa.

   A barra de carregamento continua, mas agora espera trabalho de verdade —
   a marca e o papel de parede, decodificados. Sem o copo para construir não
   existe mais progresso a fingir, e barra que finge é a parte do site que
   some primeiro na confiança de quem olha.
   ========================================================================== */
const Abertura = (() => {
  let liberado = false;

  function libera() {
    if (liberado) return;
    liberado = true;
    $('#preloader').classList.add('is-done');
    document.body.classList.remove('is-locked');
  }

  /* Qual papel de parede o CSS escolheu. A regra de celular 2x troca a imagem
     por uma mais leve, e é a escolhida que tem que ser esperada — pré-carregar
     a outra baixaria duas. */
  function fundoDoPalco() {
    const palco = $('#cupStage');
    if (!palco) return null;
    const m = (getComputedStyle(palco).backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
    return m ? m[1] : null;
  }

  /* Espera DECODIFICAR, não só chegar. Soltar a tela com o bitmap ainda por
     decodificar entrega justamente o quadro engasgado que a barra existe para
     esconder. */
  function carrega(url) {
    return new Promise(resolve => {
      const im = new Image();
      im.onerror = () => resolve(false);
      im.src = url;
      if (im.decode) im.decode().then(() => resolve(true)).catch(() => resolve(false));
      else im.onload = () => resolve(true);
    });
  }

  async function boot() {
    // aconteça o que acontecer, a loja abre em 8s. Nunca uma tela presa.
    const cao = setTimeout(libera, 8000);

    const fill = $('#preloaderFill');
    const pct  = $('#preloaderPct');
    const msg  = $('#preloaderMsg');
    const setPct = v => {
      const n = Math.round(clamp(v) * 100);
      fill.style.width = n + '%';
      pct.textContent = n + '%';
    };

    const alvos = ['assets/marca.webp', fundoDoPalco()].filter(Boolean);
    let prontas = 0;
    setPct(0.06);
    await Promise.all(alvos.map(u => carrega(u).then(() => {
      prontas++;
      setPct(0.06 + 0.94 * (prontas / alvos.length));
    })));

    msg.textContent = 'pronto';
    setPct(1);
    await new Promise(r => requestAnimationFrame(r));
    clearTimeout(cao);
    libera();
  }

  return { boot, libera };
})();

/* ============================================================================
   [8] UI — vitrine, catálogo, filtros, favoritos e orçamento
   ========================================================================== */

const ICO = {
  lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.8 15.8 21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.2-4.4-7.2-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.2 3.1C19.2 15.6 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>',
  plus:  '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8"/></svg>'
};

const favs = new Set(store.get('favs', []));
const saveFavs = () => store.set('favs', [...favs]);

/* --- templates ------------------------------------------------------------ */

function catalogCard(p) {
  const best = bestPrice(p), start = startPrice(p);
  // Com uma faixa só, a tabela repete o preço que já está em destaque logo
  // abaixo — quatro vezes a mesma informação no mesmo card.
  // Intervalo fechado em vez de "10+": quem leva 12 vê na hora que está na
  // faixa de 10 a 29, não na de 30.
  const tiers = hasVolume(p)
    ? p.tiers.map(([q, v], i) => {
        const ate = p.tiers[i + 1] ? p.tiers[i + 1][0] - 1 : 0;
        const faixa = ate ? `${q} a ${ate} peças` : `${q} peças ou mais`;
        return `<li class="${v === best ? 'is-best' : ''}"><span>${faixa}</span><b>${money(v)} <i>/un</i></b></li>`;
      }).join('')
    : '';
  const fav = favs.has(p.id) ? ' is-on' : '';
  const inicial = p.cores ? p.cores[0] : null;
  /* As bolinhas são botões de verdade, não spans com clique: dão foco pelo
     teclado e anunciam o estado por aria-pressed. O nome da cor fica escrito
     ao lado porque bolinha sozinha não diz nada a quem não enxerga bem —
     e "cinza" e "caramelo" são difíceis de separar em tela de celular. */
  const cores = p.cores ? `
    <div class="ccard__cores" role="group" aria-label="Cor de ${p.name}">
      ${p.cores.map((c, i) => `<button type="button" class="swatch${i ? '' : ' is-on'}" data-cor="${c.id}" style="--tom:${c.hex}" aria-pressed="${i ? 'false' : 'true'}" title="${c.nome}"><span class="soLeitor">${c.nome}</span></button>`).join('')}
      <span class="ccard__corNome">${inicial.nome}</span>
    </div>` : '';
  return `<article class="ccard" data-cat="${p.cat}" data-id="${p.id}" id="p-${p.id}"${inicial ? ` data-cor="${inicial.id}"` : ''}>
    <div class="ccard__media" data-ph="${p.ph}" data-src="${fotoDe(p, inicial && inicial.id)}">
      ${temDetalhe(p) ? `<div class="ccard__detalhe" aria-hidden="true"></div>
      <button type="button" class="ccard__lupa" data-detalhe="${p.id}" aria-pressed="false"
              title="Ver detalhe"><span class="soLeitor">Ver detalhe de ${p.name}</span>${ICO.lupa}</button>` : ''}
      <button class="iconbtn iconbtn--outline ccard__fav pcard__fav${fav}" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${!!fav}">${ICO.heart}</button>
    </div>
    <h3 class="ccard__name">${p.name}</h3>
    <p class="ccard__desc">${p.desc}</p>
    ${cores}
    ${tiers ? `<ul class="ccard__tiers">${tiers}</ul>` : ''}
    <div class="ccard__foot">
      <div>
        ${semPreco(p) ? `
        <span class="ccard__from">valor</span>
        <span class="ccard__price ccard__price--consulta">sob consulta</span>
        <p class="ccard__min"><b>orçamento pelo WhatsApp</b><br>valor conforme a quantidade</p>` : `
        <span class="ccard__from">a partir de ${p.tiers[0][0]} peças</span>
        <span class="ccard__price">${money(start)}<i class="ccard__each">/un</i></span>
        ${hasVolume(p) ? `<p class="ccard__min">cai para <b>${money(best)}</b>/un a partir de ${bestQty(p)}</p>` : ''}`}
      </div>
      <div class="ccard__qty">
        <button data-step="-1" aria-label="Diminuir">${ICO.minus}</button>
        <input type="number" value="${qtdInicial(p)}" min="1" step="1" aria-label="Quantidade de ${p.name}">
        <button data-step="1" aria-label="Aumentar">${ICO.plus}</button>
      </div>
    </div>
    <div class="ccard__actions">
      <button class="pill pill--gold" data-add="${p.id}">ADICIONAR</button>
      <a class="pill pill--ghost" data-wa="${p.id}" href="#" target="_blank" rel="noopener">WHATSAPP</a>
    </div>
  </article>`;
}

function renderCatalog(filter = 'todos') {
  const host = $('#catalogGrid');
  const list = filter === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  // re-renderiza em vez de esconder: o ritmo 4-5-3 / 3-4-5 / 5-4-3 do grid
  // é calculado por nth-child, então card escondido quebraria as linhas.
  host.innerHTML = list.map(catalogCard).join('');
  hydratePlaceholders(host);
  animaEntrada(host, 45);
}

/* --- orçamento (carrinho) -------------------------------------------------- */

const Cart = (() => {
  // um id salvo no localStorage que saiu do catálogo derrubava o init()
  // inteiro — e como is-locked já estava aplicado, a página ficava preta
  // e travada em toda recarga. Saneia na entrada.
  /* Saneia na entrada: um id que saiu do catálogo, ou uma cor que o produto
     deixou de ter, não pode derrubar o init() inteiro — com is-locked já
     aplicado a página ficaria preta e travada em toda recarga. */
  let items = store.get('cart', []).filter(i => i && byId(i.id) && i.qty > 0)
    .map(i => {
      const c = corDe(byId(i.id), i.cor);
      return c ? { id: i.id, qty: i.qty, cor: c.id } : { id: i.id, qty: i.qty };
    });
  const save = () => { store.set('cart', items); paint(); };
  const achaPor = ch => items.find(i => chaveItem(i.id, i.cor) === ch);

  function add(id, qty, cor) {
    const p = byId(id);
    if (!p) return;
    const c = corDe(p, cor);
    const q = Math.max(1, qty || qtdInicial(p));
    const found = achaPor(chaveItem(id, c && c.id));
    if (found) found.qty += q;
    else items.push(c ? { id, qty: q, cor: c.id } : { id, qty: q });
    save();
    toast(`${q} uni de ${p.name}${c ? ' ' + c.nome.toLowerCase() : ''} no orçamento`);
  }
  function setQty(chave, qty) {
    const it = achaPor(chave);
    if (!it) return;
    it.qty = Math.max(1, qty);
    save();
  }
  function remove(chave) { items = items.filter(i => chaveItem(i.id, i.cor) !== chave); save(); }
  const total = () => items.reduce((s, i) => {
    const p = byId(i.id);
    return p ? s + unitPrice(p, i.qty) * i.qty : s;
  }, 0);

  function message() {
    if (!items.length) return 'Olá! Quero um orçamento de brindes personalizados.';
    const lines = items.map(i => {
      const p = byId(i.id);
      const u = unitPrice(p, i.qty);
      const c = corDe(p, i.cor);
      // a cor tem que ir no texto: é o que a Space precisa para separar o
      // pedido, e o cliente escolheu na tela
      const valor = semPrecoPara(p, i.qty) ? 'a combinar' : `${money(u)} = ${money(u * i.qty)}`;
      return `• ${p.name}${c ? ' · ' + c.nome : ''}: ${i.qty} uni × ${valor}`;
    });
    /* Itens sob consulta entram na mensagem mas não na soma. Sem esta linha a
       Estimativa pareceria o total do pedido inteiro, e ela é só a parte que
       o site sabe calcular. */
    const aConsultar = items.filter(i => semPrecoPara(byId(i.id), i.qty)).length;
    const rodape = aConsultar
      ? `\n\nEstimativa dos itens com preço em tabela: ${money(total())}` +
        `\n(${aConsultar} ${aConsultar > 1 ? 'itens ficam' : 'item fica'} para orçamento)`
      : `\n\nEstimativa: ${money(total())}`;
    return `Olá, Space! Montei meu orçamento no site:\n\n${lines.join('\n')}${rodape}\n\nPodem confirmar prazo e valor final?`;
  }

  function paint() {
    const body = $('#drawerBody');
    $('#cartCount').textContent = String(items.length);
    /* O total soma só o que tem preço. Mostrar R$ 0,00 para um orçamento com
       três itens sob consulta seria mentira por omissão, então o aviso vai
       junto do número. */
    const aConsultar = items.filter(i => semPrecoPara(byId(i.id), i.qty)).length;
    $('#drawerTotal').textContent = money(total());
    const nota = $('#drawerNota');
    if (nota) {
      nota.textContent = aConsultar
        ? `+ ${aConsultar} ${aConsultar > 1 ? 'itens sob consulta' : 'item sob consulta'}`
        : '';
      nota.hidden = !aConsultar;
    }
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
      /* A próxima faixa: quanto a peça custaria subindo o lote. É a única
         informação do orçamento que ajuda quem está decidindo a quantidade.
         Abaixo de 10 peças ela vira o aviso de onde o preço começa. */
      const prox = semPreco(p) ? null : p.tiers.find(([q]) => q > i.qty);
      const dica = prox ? ` · a partir de ${prox[0]} uni sai a ${money(prox[1])}` : '';
      const meta = semPreco(p) ? 'sob consulta'
        : semPrecoPara(p, i.qty) ? `menos de ${p.tiers[0][0]} peças: a combinar${dica}`
        : `${money(u)} / uni${dica}`;
      const c = corDe(p, i.cor);
      return `<div class="ditem" data-chave="${chaveItem(i.id, i.cor)}">
        <span class="ditem__thumb" data-ph="${p.ph}" data-src="${fotoDe(p, i.cor)}"></span>
        <div class="ditem__body">
          <p class="ditem__name">${p.name}${c ? ` <span class="ditem__cor">· ${c.nome}</span>` : ''}</p>
          <p class="ditem__meta">${meta}</p>
          <div class="ditem__row">
            <span class="ditem__qty">
              <button data-q="-1" aria-label="Diminuir">−</button>
              <b>${i.qty}</b>
              <button data-q="1" aria-label="Aumentar">+</button>
            </span>
            <span class="ditem__price">${semPrecoPara(p, i.qty) ? 'a combinar' : money(u * i.qty)}</span>
          </div>
          <button class="ditem__del" data-del>remover</button>
        </div>
      </div>`;
    }).join('');
    hydratePlaceholders(body);
  }

  return { add, setQty, remove, paint, message, get items() { return items; } };
})();

function waLink(id, qty, cor) {
  const p = byId(id);
  const q = qty || qtdInicial(p);
  const u = unitPrice(p, q);
  const c = corDe(p, cor);
  // sem preco na tabela nao ha valor de referencia a mandar: "R$ 0,00 / uni"
  // no WhatsApp parecia brinde de graca
  const ref = semPrecoPara(p, q) ? '' : `\n• Valor de referência: ${money(u)} / uni`;
  const txt = `Olá, Space! Tenho interesse em:\n\n• ${p.name}${c ? ' · ' + c.nome : ''}\n• Quantidade: ${q} uni${ref}\n\nPodem me passar o orçamento?`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
}

/* --- gaveta do orçamento ---------------------------------------------------
   Abrir e fechar estavam escritos três vezes (botão, fundo, Esc), e nenhuma
   das três mexia no foco: a gaveta abria e o teclado continuava no botão lá
   atrás, com Tab passeando pela página escondida. E fechada, off-canvas, ela
   ainda recebia Tab — os botões invisíveis dela entravam na fila.
   Agora a gaveta fechada é `inert`; aberta, inert fica o resto da página, o
   foco vai para o X e volta para onde estava ao fechar. */
const FORA_DA_GAVETA = ['#cup', '#nav', '#top', '.footer', '.wafab'];
let focoAntesDaGaveta = null;
const gavetaAberta = () => $('#drawer').classList.contains('is-open');

function abreGaveta() {
  const d = $('#drawer');
  focoAntesDaGaveta = document.activeElement;
  d.inert = false;
  d.classList.add('is-open');
  d.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  FORA_DA_GAVETA.forEach(sel => { const el = $(sel); if (el) el.inert = true; });
  const x = $('.drawer__head [data-close]', d);
  if (x) x.focus({ preventScroll: true });
}

function fechaGaveta() {
  const d = $('#drawer');
  if (!gavetaAberta()) return;
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  FORA_DA_GAVETA.forEach(sel => { const el = $(sel); if (el) el.inert = false; });
  d.inert = true;
  if (focoAntesDaGaveta && focoAntesDaGaveta.focus) focoAntesDaGaveta.focus({ preventScroll: true });
  focoAntesDaGaveta = null;
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
    const cardDoAdd = add.closest('[data-id]');
    Cart.add(add.dataset.add, qtyOfCard(add), cardDoAdd && cardDoAdd.dataset.cor);
    return;
  }

  /* foto de detalhe: um BOTÃO, não hover. Hover não existe em celular, e
     misturar hover no computador com toque no celular dá dois comportamentos
     para a mesma coisa. O botão funciona igual nos dois e ainda pega foco
     pelo teclado. */
  const lupa = e.target.closest('[data-detalhe]');
  if (lupa) {
    const card = lupa.closest('[data-id]');
    const capa = $('.ccard__detalhe', card);
    const prod = byId(lupa.dataset.detalhe);
    if (!capa || !prod) return;
    const ligado = capa.classList.toggle('is-on');
    lupa.setAttribute('aria-pressed', String(ligado));
    lupa.classList.toggle('is-on', ligado);
    // baixa só na primeira vez que alguém abre
    if (ligado && !capa.dataset.pronta) {
      capa.dataset.pronta = '1';
      const im = new Image();
      im.src = comVersao(fotoDetalhe(prod));
      const mostra = () => { capa.style.backgroundImage = `url("${im.src}")`; };
      if (im.decode) im.decode().then(mostra).catch(() => { if (im.complete) mostra(); });
      else im.onload = mostra;
    }
    return;
  }

  /* troca de cor: repinta a foto e guarda a escolha no próprio card, que é
     de onde ADICIONAR e WHATSAPP vão ler na hora do clique */
  const tom = e.target.closest('[data-cor]');
  if (tom && tom.tagName === 'BUTTON') {
    const card = tom.closest('[data-id]');
    const prod = byId(card.dataset.id);
    const c = corDe(prod, tom.dataset.cor);
    if (!c) return;
    card.dataset.cor = c.id;
    $$('.swatch', card).forEach(b => {
      const on = b.dataset.cor === c.id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const nome = $('.ccard__corNome', card);
    if (nome) nome.textContent = c.nome;
    /* Troca sem piscar. paint() limpa a foto antes de buscar a nova - certo
       para um card entrando na tela, errado aqui: o card ficava vazio por um
       ou dois quadros a cada bolinha, e no copo de 360 ml, em que as duas
       cores dividem a mesma foto, piscava para mostrar a MESMA imagem. Agora
       a foto antiga fica até a nova estar decodificada (buscaFoto só pinta
       depois do decode e ignora resposta de uma troca já superada). */
    const media = $('.ccard__media', card);
    const nova = fotoDe(prod, c.id);
    if (media && media.dataset.src !== nova) {
      media.dataset.src = nova;
      buscaFoto(media);
    }
    /* A foto de detalhe e uma so para o produto inteiro, nao uma por cor. Com
       ela aberta, trocar a bolinha deixava a bolinha dizendo VERDE e a foto
       mostrando o azul - o cliente escolhe uma cor e ve outra. Trocar de cor
       fecha o detalhe e devolve o card para a foto da cor escolhida. */
    const capaDet = $('.ccard__detalhe', card);
    if (capaDet && capaDet.classList.contains('is-on')) {
      capaDet.classList.remove('is-on');
      const lupaDoCard = $('[data-detalhe]', card);
      if (lupaDoCard) {
        lupaDoCard.classList.remove('is-on');
        lupaDoCard.setAttribute('aria-pressed', 'false');
      }
    }
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
    const cardDoWa = wa.closest('[data-id]');
    wa.href = waLink(wa.dataset.wa, qtyOfCard(wa), cardDoWa && cardDoWa.dataset.cor);
    return;
  }

  /* stepper de quantidade */
  const step = e.target.closest('[data-step]');
  if (step) {
    const card = step.closest('.ccard');
    const input = $('input', card);
    // campo vazio dava NaN, que o input[type=number] apagava — e os
    // botões ficavam mortos até alguém digitar um número na mão
    const cur = parseInt(input.value, 10);
    const from = Number.isFinite(cur) ? cur : qtdInicial();
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

  /* drawer */
  if (e.target.closest('#cartBtn') || e.target.closest('#ctaCart')) { abreGaveta(); return; }
  if (e.target.closest('[data-close]')) { fechaGaveta(); return; }

  /* itens do drawer */
  const q = e.target.closest('[data-q]');
  if (q) {
    const ch = q.closest('.ditem').dataset.chave;
    const it = Cart.items.find(i => chaveItem(i.id, i.cor) === ch);
    if (it) Cart.setQty(ch, it.qty + Number(q.dataset.q));
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del) { Cart.remove(del.closest('.ditem').dataset.chave); return; }
});

document.addEventListener('input', e => {
  if (e.target.matches('.ccard__qty input')) {
    if (e.target.value !== '' && +e.target.value < 1) e.target.setAttribute('aria-invalid', 'true');
    else e.target.removeAttribute('aria-invalid');
  }
});

addEventListener('keydown', e => {
  if (e.key === 'Escape' && gavetaAberta()) fechaGaveta();
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

  // um alvo por link, na mesma ordem do menu
  const links = $$('#navMenu a');
  const targets = links.map(a => $(a.getAttribute('href')));
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

/* ============================================================================
   INIT
   ========================================================================== */

function init() {
  document.body.classList.add('is-locked');
  $('#drawer').inert = true;
  $('#year').textContent = String(new Date().getFullYear());

  hydratePlaceholders();
  wireSplit();
  renderCatalog();
  Cart.paint();

  wireFilters('#catalogFilters', 'cfilter', renderCatalog);

  /* NÚMEROS NO TEXTO
     O texto corrido citava o catálogo à mão em sete lugares: "Dezoito itens",
     "o copo sai a R$ 29,90 levando uma ou cem", o índice 06/03/04/02/02/01,
     "CATÁLOGO 2025 · 18 ITENS"... O catálogo cresceu para 26 e o copo foi
     para R$ 49,99, e o texto continuou jurando o contrário. Agora quem cita
     o catálogo pergunta a ele:
       data-conta="produtos" | "<categoria>"   quantos itens (data-pad: 2 dígitos)
       data-preco="<id>" [data-qtd="N"|"melhor"] preço da unidade naquela faixa
                                                 (sem data-qtd: a primeira faixa)
       data-lote="<id>"                          quantas peças para o melhor preço
       data-minimo                               a partir de quantas peças há preço
     O número escrito no HTML fica só para quem abrir sem JavaScript. */
  (function amarraTextoAoCatalogo() {
    $$('[data-conta]').forEach(el => {
      const k = el.dataset.conta;
      const n = k === 'produtos' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === k).length;
      el.textContent = 'pad' in el.dataset ? String(n).padStart(2, '0') : String(n);
    });
    $$('[data-preco]').forEach(el => {
      const p = byId(el.dataset.preco);
      if (!p) return;
      if (semPreco(p)) { el.textContent = 'sob consulta'; return; }
      const q = el.dataset.qtd;
      el.textContent = money(q === 'melhor' ? bestPrice(p) : q ? unitPrice(p, Number(q)) : startPrice(p));
    });
    $$('[data-lote]').forEach(el => {
      const p = byId(el.dataset.lote);
      if (p && !semPreco(p)) el.textContent = String(bestQty(p));
    });
    $$('[data-minimo]').forEach(el => { el.textContent = String(CONFIG.qtdMinima); });
    // o contador animado lê o alvo de data-count-to, não do texto
    const contador = $('#contaProdutos');
    if (contador) contador.dataset.countTo = String(PRODUCTS.length);
  })();

  wireNav();
  wireReveal();
  wireParallax();

  Abertura.boot().catch(err => { console.error('[abertura]', err); Abertura.libera(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* diagnóstico rápido no console */
/* diagnóstico e testes: renderCatalog entra aqui para a suíte conseguir
   injetar um produto de exemplo e conferir o seletor de cor sem que um item
   inventado precise existir no catálogo de verdade. */
window.SPACE = { CONFIG, PRODUCTS, Cart, renderCatalog };
