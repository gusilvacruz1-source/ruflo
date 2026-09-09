---
name: rocha-nua
description: Identidade visual e estrutura do site da banda Rocha Nua (@rocha.nua). Usar em qualquer edição de layout, cor, tipografia, componente ou texto dentro de rocha-nua/.
---

# Site da Rocha Nua

Pasta: `rocha-nua/`. HTML, CSS e JS puros, sem build, sem framework,
sem biblioteca de componentes. Mesma convenção do resto do repositório.

## Estética

**Cartaz impresso.** A página é uma sequência de CHAPAS: foto inteira
reticulada em meia-tona, com a palavra da seção por cima e a letra miúda
de ficha técnica nos cantos. Entre uma chapa e outra vem o conteúdo,
sóbrio de propósito: a chapa grita, a lista informa.

Direção pedida pelo dono do site, com referência na mão, e seguida à
risca. Substituiu o desenho anterior de adesivo e marcador.

**Paleta, e é só ela:**

```
--asfalto        #141110   fundo escuro (preto quente)
--creme          #F0E7D6   papel, texto sobre o escuro
--laranja        #E2541F   tinta da chapa rubra
--laranja-forte  #F26B2E   laranja de texto pequeno
--amarelo        #F2B01E   só foco de teclado e link de pular
```

**Regra de cor, uma só, vale na página inteira:** laranja e amarelo
nunca levam texto claro em cima. Quem senta em laranja ou amarelo é o
asfalto. Creme é para fundo escuro. A exceção é a palavra gigante da
chapa rubra, que é texto grande, passa em AA de texto grande e ainda
leva sombra.

**Laranja pequeno é `--laranja-forte`, não `--laranja`.** A base dá
4,90:1 sobre asfalto limpo: não sobra folga nenhuma para o clarão da
foto de fundo, e a etiqueta de 11px cai para 4,2:1. A forte dá 6,18:1.

**Formas e recursos:**

- Canto reto em tudo, raio 0.
- Uma família só: Archivo variável, com os **dois eixos**, peso 100..900
  e largura 62..125. A referência vive dessa combinação: palavra leve e
  larga na chapa (300 / 112%), palavra pesadíssima e estreita na
  repetida (900 / 98%). Servida pelo próprio site, sem Google Fonts.
- Nada de contorno, sombra colada, moldura tremida ou fita crepe: isso
  era o desenho anterior e saiu inteiro.
- Grão de impressão: overlay fixo, `pointer-events:none`, opacidade
  baixa.

## Como a chapa funciona (é o coração do site)

A foto vai para o navegador **bilevel**: ponto preto sobre branco, e nada
mais. A cor não está na imagem, está no fundo da chapa, e a mistura faz o
resto. Mesma chapa, tinta diferente — é litografia.

```
sobre creme,   multiply → branco vira creme, ponto fica preto
sobre laranja, multiply → branco vira laranja, ponto fica preto
sobre asfalto, multiply devolveria asfalto em tudo (preto vezes
               qualquer coisa é preto), então vai de screen: o ponto
               some no fundo e o claro da foto acende
```

Por isso uma foto de 50 KB pinta a tela inteira, e por isso a seção de
conteúdo pode reaproveitar uma chapa que a página já baixou sem custar
byte nenhum.

**A armadilha, e ela me pegou duas vezes no mesmo dia:** `z-index` em
elemento posicionado cria contexto de empilhamento, e aí a mistura passa
a procurar o fundo dentro daquele contexto, onde não há nada. O elemento
aparece cru. Foi o que deixou a faixa vermelha saindo em preto e branco
(`z-index` no `.chapa__tela`) e o selo da caveira virando retângulo
branco recortado (`z-index` no `.secao > .tira`). Para ordenar pintura
sem isolar, use `position:relative` sozinho e a ordem do documento.

**Véu.** Chapa é foto, e foto tem clarão. Sem véu a palavra clara cai num
trecho branco em alguma largura de tela. O véu fica **acima** da imagem e
**fora** da mistura. Em tela estreita a elipse cobre menos área absoluta e
precisa fechar mais: existe um bloco em `max-width:820px` só para isso.
O fecho tem véu próprio, mais fechado, porque a caveira riscada tem
faixas estouradas de branco bem onde fica o título.

## Estrutura da página

Capa (estúdio) · régua · chapa rubra (vinis) · A banda (papel) ·
repetida AUTORAIS · Autorais · chapa (skates) · Agenda (papel) ·
chapa rubra (mão na guitarra) · Vídeos · fecho (caveira riscada) ·
rodapé.

A **repetida** — a palavra empilhada três vezes sangrando pelas duas
bordas, com a peça vermelha atravessando o meio — é o gesto mais forte
da página e por isso aparece **uma vez só**.

## Regras

- Cada seção precisa funcionar em 380px de largura.
- Uma faixa rolando na página inteira, no máximo. Hoje é a régua.
- Movimento sempre atrás de `prefers-reduced-motion`.
- Nenhum retângulo em cor chapada: toda seção leva foto de fundo,
  apagada, com véu por cima.

## Verdade da banda (não inventar)

- Instagram: @rocha.nua · YouTube: youtube.com/@rochanuarockband
- Emerson (@emerson7r): voz, violão e guitarra
- José (@josehique): baixo
- Descrição do perfil: "ROCHA NUA BR | Rock'n'Roll"

A banda toca "Vou Deixar" (Skank) e "Wicked Game" (Chris Isaak). São
**covers**, e cada uma é o nome de um dos vídeos ao vivo, com o artista
original creditado logo abaixo. Nunca apresentar cover como autoral:
música própria leva `autoral: true` e aparece marcada.

Qual música é qual vídeo veio do dono do site, não de escuta: o mapa
vive em `dados.js` e trocar é inverter duas linhas.

Não há, publicamente confirmados: nomes das autorais, datas de show,
telefone ou e-mail de contratação, cidade da banda, nem o arquivo do
logo. Tudo isso vive em `assets/js/dados.js` como lista vazia, e a
página tem estado vazio de verdade para cada uma. Não preencher com
exemplo inventado apresentado como real, e não afirmar cidade nenhuma.

As marcas de canto (`#SOMOS ROCHANUA`, `FEITO PRA TOCAR`, `RN`) são
lema e monograma, não afirmação de fato. Podem mudar; não podem virar
telefone, cidade ou data.

## Imagens

As fotos que a banda enviou vivem em `_fotos-originais/` (não vão ao ar)
e viram chapa por `ferramentas/meiatona.py`. As reticuladas publicadas
terminam em `-mt.webp`.

**O logo é a exceção: não é reticulado.** Ele não é bilevel, e
multiplicar sobre o creme escureceria o desenho e comeria o vermelho.
Fica no meio de "A banda", como é, na própria placa de asfalto — objeto
escuro sobre papel, que é o que a referência faz. Guardá-lo com
transparência custaria 148 KB contra 60 KB opaco, porque o WebP grava o
alfa sem perda.

Ao escolher onde cada uma entra, mandar a **leitura**, não o acaso: foto
com padrão repetido estica bem na faixa larga; foto estourada de branco
não funciona em faixa fina. E a seção de conteúdo nunca repete a foto da
chapa vizinha, senão a mesma imagem aparece duas vezes seguidas e lê
como engano.

**Três imagens não entram na página.** A capa do Charlie Brown Jr., a
foto do Chorão e a cartela com as marcas do Linkin Park e do Skillet são
material identificável de terceiros; num site que vende show, usá-las
como visual próprio faz parecer que são da banda. Ficam em
`_referencias/`. Também não recortar esses logos para virar marca da
Rocha Nua.

## Peso e como medir

Hoje: **174 KB para pintar a dobra, 360 KB a página inteira.** O maior
item da dobra é a fonte, 88 KB, que carrega o alfabeto inteiro.

Cuidado ao medir "primeira tela": o Chromium antecipa imagem `lazy` com
folga larga e busca perto de 285 KB antes de qualquer rolagem. Somar o
que carregou antes de rolar mede a antecipação do navegador, não o que a
dobra exige.

- Meia-tona é bilevel por natureza. Guardar como tom contínuo é o erro:
  a mesma chapa dá **73 KB em WebP sem perda bilevel** e **524 KB em
  WebP com perda**. Sempre binarizar antes de salvar.
- Para medir, usar `performance.getEntriesByType('resource')` e somar
  `encodedBodySize`. Somar `response.body()` pelo Playwright perde
  respostas e dá número errado.

## Vídeo

Um trecho de 30 s ao vivo, em `assets/video/`, com `preload="none"`: o
navegador busca só o cartaz e o vídeo só baixa se alguém apertar play.
Manter assim — sem isso a página passaria de 380 KB para quase 3 MB.

O cartaz é o primeiro quadro do próprio corte, reticulado. Aperta play e
ganha cor: é a única cor fotográfica da página, e é o pagamento.

Duas coisas aprendidas e que custam tempo se esquecidas:

- **`-ss` e `-t` vão ANTES do `-i`.** Depois do `-i` o corte acontece só
  depois dos filtros, e um `fade=t=out` calculado sobre a linha do tempo
  original apaga tudo. Saiu um vídeo preto e mudo de 72 KB, e só não foi
  publicado porque o tamanho absurdo denunciou.
- **Recodificar nem sempre encolhe.** O original de 2min28 já vinha
  comprimido: em CRF 26 e 29 o arquivo ficava maior que a fonte. E o VP9
  saiu maior que o H.264 nas duas tentativas, porque filmagem de mão com
  granulação não é o forte dele. O que resolveu foi cortar.

## Vídeo

Dois trechos de 30 s ao vivo, lado a lado — **um por música, com o nome
por cima do vídeo** —, em `assets/video/`, com
`preload="none"`: o navegador busca só os cartazes e os filmes só baixam
se alguém apertar play. Manter assim — sem isso a página passaria de
403 KB para mais de 5 MB.

**A retícula fica só no cartaz.** O vídeo toca em cor, como foi filmado:
é a única cor fotográfica da página, e é o pagamento de descer até lá. O
cartaz é o primeiro quadro do próprio corte, então não há salto.

**A tarja do nome:** `pointer-events:none`, senão cobriria os controles e
ninguém daria play; e **chapada, não degradê**, porque em degradê a linha
do artista de 11px cai onde a transparência já abriu e o contraste muda
com o tamanho do bloco (2,8:1 no celular contra 4,4:1 no desktop). Some
enquanto toca e volta ao pausar.

Duas coisas aprendidas, que custam tempo se esquecidas:

- **`-ss` e `-t` vão ANTES do `-i`.** Depois do `-i` o corte acontece só
  depois dos filtros, e um `fade=t=out` calculado sobre a linha do tempo
  original apaga tudo. Saiu um vídeo preto e mudo de 72 KB, e só não foi
  publicado porque o tamanho absurdo denunciou.
- **Recodificar nem sempre encolhe.** O original já vinha comprimido: em
  CRF 26 e 29 o arquivo ficava maior que a fonte, e o VP9 saiu maior que
  o H.264 nas duas tentativas. O que resolveu foi cortar, não apertar.
- **Conferir se um vídeo novo é mesmo outro vídeo.** Já chegou um arquivo
  com nome e soma de verificação diferentes que era o mesmo material:
  comparação quadro a quadro deu 0/255 e o áudio bateu byte a byte. Com
  câmera fixa, dois trechos iguais lado a lado pareceriam defeito.

## Movimento

Tudo sai da linguagem de impressão: varredura de tinta nas palavras
grandes, letra por letra no nome da capa, fora de registro, deslocamento
na rolagem, régua que acelera com a rolagem, fio de progresso, carimbo no
logo. Tudo num `requestAnimationFrame` só.

**As regras de custo, medidas e não achadas:**

- **Não mover camada misturada do tamanho da tela.** As fotos das chapas
  usam `mix-blend-mode`; deslocando-as a página cai para 30 fps em 1920 e
  20 em 2560. Ficam paradas. A mistura fica, porque é o desenho.
- **Duas camadas misturadas em tela cheia não passam de 30 fps em 1920**,
  paradas ou não. Por isso o fora de registro da foto é **assado no
  arquivo** por `meiatona.py`, e não uma camada por cima.
- **Mistura em fundo de seção não vale.** Trocada por opacidade, a
  diferença é de no máximo 8/255 e devolve 60 fps.
- **Nunca pôr variável CSS e `background-image: var()` no mesmo
  elemento.** Cada troca reavalia a imagem: a página repetia o pedido de
  cada foto de 8 a 10 vezes.

Hoje: 60 fps em 390, 768, 1440 e 1920. Em 2560 cai para 30, e é o preço
da mistura das chapas.

**Peça varrida não pode ser observada nela mesma.** O `clip-path` zera a
área de interseção — `intersectionRatio: 0` para elemento visível, o
observador nunca dispara, a peça some para sempre. Medido no título da
capa, 1196×115 com área vista zero. Observar o **pai**.

**Rede de segurança:** a margem negativa do observador exclui a última
faixa da tela, e peça no rodapé do documento pode nunca ser vista —
medido em 2560×1440, a letra miúda do fecho. Chegou ao fim da página, o
que sobrou aparece.

Escalonar pelo grupo que entra junto, nunca pelo índice. Só `opacity`,
`transform` e `clip-path`. O estado escondido só existe com `js-anima` na
raiz, dentro de um `try` que desfaz tudo em caso de erro. Movimento
reduzido desliga entrada, deslocamento, fio e régua.

Conflito de `transform`: `sections.css` carrega depois de `main.css`.
Regra de deslocamento para elemento que já tem `transform` lá — a peça da
repetida — precisa ficar em `sections.css`.

## Cursor

O ponteiro é o chifre 🤘🏼, tirado do emoji e embutido em base64.

Em **dois tamanhos**: se fosse um só, o link perderia o aviso de que é
clicável, que hoje é a mão do sistema — o maior faz esse papel. Vive
dentro de `@media (hover:hover) and (pointer:fine)`, senão tela de toque
baixaria duas imagens para nada, e cada linha termina em `auto` ou
`pointer` como saída de emergência.

O bloco fica no **fim** do `main.css`: `.btn` declara `cursor:pointer`
mais acima e venceria por ordem de declaração.

## Vagas de foto

Cada foto que ainda não chegou tem nome fixo e lugar reservado, e o JS
marca `.vaga--cheia` quando o arquivo carrega de verdade.

Previstas em `assets/img/`: `hero-banda.webp` (fundo da capa),
`emerson.webp` e `jose.webp` (retratos).

- Nunca colocar `loading="lazy"` numa `.vaga__real`. Escondida, ela não
  entraria em viewport, não carregaria, e a vaga nunca encheria.
- Vaga vazia gera 404 no console. É o próprio teste de existência, não
  é defeito. Não "consertar" removendo a vaga.
- A vaga vazia tem que ocupar zero, para o layout não abrir buraco.
- Foto crua que chega pela vaga não é bilevel: o CSS aproxima o
  tratamento, mas para o efeito de verdade ela tem que passar por
  `ferramentas/meiatona.py`.

## Ao verificar com navegador

`html{scroll-behavior:smooth}` faz cada `scrollTo` virar animação: um
laço de rolagem é reanimado a cada passo, nunca chega ao fim, e as
imagens `lazy` de baixo não entram em viewport. A captura de página
inteira sai com chapas vazias, só com o véu, e parece defeito do site.
Zerar `scrollBehavior` antes de rolar, e esperar `img.complete`.

Contraste em fundo de foto não dá para calcular pelo CSS. Medir em
pixel: uma captura normal, outra com o texto transparente, e comparar a
cor do texto com o pior pixel do fundo debaixo dele.
