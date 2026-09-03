# Implementação de referência

Código anotado da seção. Copie e adapte — os nomes de classe e os caminhos são
os do exemplo, o resto é a parte que importa.

Índice:

1. [HTML](#1-html)
2. [CSS](#2-css)
3. [JavaScript](#3-javascript)
4. [Janela deslizante para celular](#4-janela-deslizante-para-celular)
5. [Erros que voltam sempre](#5-erros-que-voltam-sempre)

## 1. HTML

O texto vive no DOM, por cima do canvas — nunca pintado dentro dele. Assim ele
é selecionável, lido por leitor de tela, reflui e fica nítido em tela densa.

```html
<!-- O primeiro frame chega junto com o HTML: a seção nunca aparece vazia.
     O media evita baixar os dois conjuntos. -->
<link rel="preload" as="image" fetchpriority="high"
      href="/cena/desktop/0001.webp" media="(min-width: 821px)">
<link rel="preload" as="image" fetchpriority="high"
      href="/cena/mobile/0001.webp" media="(max-width: 820px)">

<section class="cena" id="cena">
  <div class="cena__palco">
    <canvas class="cena__tela" role="img"
            aria-label="Sobrevoo da casa ao entardecer, da rua até a varanda"></canvas>

    <div class="cena__texto">
      <h2>Onde a rua termina e a casa começa</h2>
      <p>Duas quadras do centro, com a mata em volta.</p>
    </div>
  </div>
</section>
```

## 2. CSS

O palco já ocupa a altura final antes de qualquer imagem chegar — é o que
impede o salto de layout. Não use `position: sticky` aqui: quem prende a seção
é o ScrollTrigger, e os dois juntos brigam.

```css
.cena__palco {
  position: relative;
  height: 100svh; /* svh, não vh: no celular a barra do navegador some e volta */
  overflow: hidden;
  background: #05080e; /* cor do primeiro frame, para o vazio nunca piscar branco */
}

.cena__tela {
  display: block;
  width: 100%;
  height: 100%;
}

.cena__texto {
  position: absolute;
  inset: auto 0 12% 0;
  padding: 0 5vw;
  text-align: center;
  color: #f6f3ec;
  text-shadow: 0 1px 30px rgba(5, 8, 14, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .cena__palco { height: auto; aspect-ratio: 16 / 9; }
}
```

## 3. JavaScript

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const cena = document.querySelector('#cena');
const palco = cena.querySelector('.cena__palco');
const tela = cena.querySelector('.cena__tela');
// alpha: false economiza uma composição por quadro — a cena é opaca.
const ctx = tela.getContext('2d', { alpha: false });

// Os dois conjuntos gerados pelo extrai-frames.sh. `total` é o número que o
// script imprimiu; se não bater, faltam ou sobram frames no fim da rolagem.
const CONJUNTOS = {
  desktop: { caminho: '/cena/desktop', total: 160, largura: 1440 },
  mobile: { caminho: '/cena/mobile', total: 80, largura: 800 },
};

const conjunto = window.matchMedia('(max-width: 820px)').matches
  ? CONJUNTOS.mobile
  : CONJUNTOS.desktop;

const endereco = (i) =>
  `${conjunto.caminho}/${String(i + 1).padStart(4, '0')}.webp`;

const quadros = new Array(conjunto.total);
let ultimoDesenhado = -1;
let ultimaImagem = null;

/* ---------- pré-carga ---------- */

function carrega(i) {
  return new Promise((pronto) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // decode() tira o custo de decodificação do primeiro desenho — é o que
      // evita o engasgo justo quando a pessoa chega na seção.
      img.decode().catch(() => {}).finally(() => {
        quadros[i] = img;
        pronto();
      });
    };
    img.onerror = () => pronto(); // um frame faltando não derruba a cena
    img.src = endereco(i);
  });
}

async function precarrega(simultaneas = 6) {
  await carrega(0);
  desenha(0, true); // a cena aparece assim que o primeiro frame chega

  let proximo = 1;
  const fila = async () => {
    while (proximo < conjunto.total) await carrega(proximo++);
  };
  // Em ordem e com limite: o navegador não abre 160 conexões, e os frames
  // chegam na sequência em que serão usados.
  await Promise.all(Array.from({ length: simultaneas }, fila));
}

/* ---------- desenho ---------- */

// Enquanto a sequência carrega, mostre o frame carregado mais próximo em vez
// de congelar. A pessoa vê a cena avançar aos saltos e depois lisa — muito
// melhor do que uma tela parada.
function maisProximo(i) {
  if (quadros[i]) return quadros[i];
  for (let d = 1; d < conjunto.total; d++) {
    if (quadros[i - d]) return quadros[i - d];
    if (quadros[i + d]) return quadros[i + d];
  }
  return null;
}

function desenha(i, forcar = false) {
  const img = maisProximo(i);
  if (!img || (!forcar && img === ultimaImagem)) return;
  ultimaImagem = img;

  // Recorte "cover" na mão: preenche o palco sem deformar.
  const escala = Math.max(
    tela.width / img.naturalWidth,
    tela.height / img.naturalHeight
  );
  const l = img.naturalWidth * escala;
  const a = img.naturalHeight * escala;
  ctx.drawImage(img, (tela.width - l) / 2, (tela.height - a) / 2, l, a);
}

function dimensiona() {
  const area = palco.getBoundingClientRect();
  const densidade = Math.min(window.devicePixelRatio || 1, 2);
  // Teto: nunca pinte mais pixels do que o frame tem. Ampliar não acrescenta
  // nitidez nenhuma e multiplica o custo de cada quadro.
  const teto = Math.max(1, conjunto.largura / area.width);
  const fator = Math.min(densidade, teto);

  tela.width = Math.round(area.width * fator);
  tela.height = Math.round(area.height * fator);
  desenha(ultimoDesenhado < 0 ? 0 : ultimoDesenhado, true);
}

/* ---------- rolagem ---------- */

const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

function liga() {
  dimensiona();
  window.addEventListener('resize', dimensiona);
  precarrega();

  if (semMovimento.matches) {
    // Quem pede menos movimento recebe um quadro do meio da cena, sem pin e
    // sem sequestro da rolagem.
    carrega(Math.floor(conjunto.total / 2)).then(() =>
      desenha(Math.floor(conjunto.total / 2), true)
    );
    return;
  }

  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  let alvo = 0;
  let atual = 0;

  ScrollTrigger.create({
    trigger: palco,
    start: 'top top',
    // Duas alturas de tela para 160 frames ≈ 10 px por frame.
    end: () => '+=' + window.innerHeight * 2,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    // Só anota onde deveria estar; quem desenha é o ticker abaixo.
    onUpdate: (self) => {
      alvo = self.progress * (conjunto.total - 1);
    },
  });

  gsap.ticker.add(() => {
    // Persegue o alvo em vez de saltar até ele: tira o serrilhado do trackpad
    // sem criar atraso perceptível.
    atual += (alvo - atual) * 0.18;
    const i = Math.round(atual);
    if (i !== ultimoDesenhado) {
      ultimoDesenhado = i;
      desenha(i);
    }
  });
}

liga();
```

Via CDN, em vez de `import`, carregue os três antes do seu script e fixe a
versão exata (confira a atual antes de copiar):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
```

## 4. Janela deslizante para celular

Só quando o conjunto reduzido não bastar. Em vez de guardar todos os frames
decodificados, mantenha uma janela em volta do índice atual e descarte o resto
com `close()` — é a única forma de liberar o bitmap de verdade.

```js
const JANELA = 24;
const bitmaps = new Map();

async function garante(i) {
  if (bitmaps.has(i) || i < 0 || i >= conjunto.total) return;
  const resposta = await fetch(endereco(i));
  bitmaps.set(i, await createImageBitmap(await resposta.blob()));
}

function limpa(centro) {
  for (const [i, bmp] of bitmaps) {
    if (Math.abs(i - centro) > JANELA) {
      bmp.close(); // sem isso a memória não volta
      bitmaps.delete(i);
    }
  }
}
```

Chame `garante()` para alguns índices à frente e atrás do atual a cada mudança
de quadro, e `limpa()` na sequência. O custo é rede em vez de memória: prefira
a janela grande o bastante para cobrir uma rolagem rápida.

## 5. Erros que voltam sempre

**A rolagem trava depois do pin.** Quase sempre é `ScrollTrigger.refresh()`
faltando depois que fontes ou imagens mudaram a altura da página. Chame
`ScrollTrigger.refresh()` no `load`, e use `invalidateOnRefresh: true` para o
`end` ser recalculado.

**O pin salta um pouco ao entrar.** `anticipatePin: 1` resolve na maioria dos
casos. Se persistir, é outro elemento com `transform` no caminho — o pin cria
um `position: fixed`, e um ancestral transformado muda o referencial dele.

**A cena fica borrada em tela Retina.** O canvas está com o tamanho CSS e não
com o tamanho em pixels: sem definir `tela.width`/`tela.height`, o navegador
estica um bitmap de 300×150.

**A aba recarrega sozinha no iPhone.** Memória. Conte
`largura × altura × 4 × frames` e compare com uns 300 MB de folga. Corte
frames, corte largura, ou vá para a janela deslizante.

**A sequência avança na direção errada.** Os frames saíram em ordem de nome,
mas `%04d` foi trocado por `%d` em algum ponto: `10.webp` vem antes de
`2.webp` na ordenação por texto. Mantenha o zero à esquerda.
