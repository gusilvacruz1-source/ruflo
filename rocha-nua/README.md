# Site — ROCHA NUA (@rocha.nua)

Site de uma página para a banda Rocha Nua. HTML, CSS e JS puros, sem
framework e sem build.

## Isolamento

Esta pasta é **totalmente separada** do resto do repositório. Nada aqui
importa, sobrescreve ou depende de `/index.html`, `/css`, `/js`,
`/lojinha-kerollay`, `/elotattoos` ou `/portfolio`. O `netlify.toml` da
raiz **não foi alterado**: ele continua publicando só a lojinha da
Kerollay.

Publicado pelo GitHub Pages, no ramo `gh-pages`, na subpasta
`rocha-nua/`, do mesmo jeito que os outros sites do repositório.

Para ver local, sirva a **raiz do repositório** (não esta pasta):

```
python3 -m http.server 8080
# depois: http://localhost:8080/rocha-nua/
```

Abrindo o `index.html` por clique duplo, o navegador bloqueia a fonte
própria e o texto sai na fonte de sistema.

## Como atualizar o conteúdo

Abra **`assets/js/dados.js`**. É o único arquivo que precisa ser tocado
para o dia a dia. Quatro listas, cada uma com um exemplo comentado:

| Lista        | Para quê                                       |
|--------------|------------------------------------------------|
| `aoVivo`     | uma música por vídeo, com o nome que vai por cima |
| `agenda`     | shows marcados (data no formato `AAAA-MM-DD`)  |
| `videos`     | vídeos do YouTube, **só o ID**, não a URL      |
| `contato`    | WhatsApp, e-mail, Instagram e canal            |

O site já resolve sozinho:

- Show com data passada **some da agenda**, sem apagar da lista.
- ID de vídeo escrito errado é **ignorado**, em vez de virar quadro preto.
- Sem `whatsapp` e sem `email`, o botão de contratação manda para o
  **direct do Instagram**, que já existe e funciona.
- Lista vazia não deixa buraco: cada seção tem um texto próprio.

## O desenho: chapa de meia-tona

A página é uma sequência de **chapas**. Uma chapa é uma foto inteira
reticulada em meia-tona, com a palavra da seção por cima e a letra miúda
de ficha técnica nos cantos. Entre uma chapa e outra vem o conteúdo,
sóbrio de propósito.

**A foto vai para o navegador em bilevel**: ponto preto sobre branco, e
nada mais. A cor não está na imagem — está no fundo da chapa, e a mistura
faz o resto:

| Fundo da chapa | Mistura  | Resultado                                |
|----------------|----------|------------------------------------------|
| creme          | multiply | branco vira creme, ponto fica preto      |
| laranja        | multiply | branco vira laranja, ponto fica preto    |
| asfalto        | screen   | ponto some no fundo, o claro da foto acende |

Mesma chapa, tinta diferente. É litografia, e é por isso que uma foto de
50 KB pinta a tela inteira — e por isso a seção de conteúdo reaproveita
uma chapa que a página já baixou, **sem custar byte nenhum**.

Duas consequências para quem for mexer:

- **Não ponha `z-index` em elemento posicionado que tenha mistura
  dentro.** Isso cria contexto de empilhamento e a mistura passa a
  procurar o fundo onde não há nada: o elemento aparece cru. Foi o que
  deixou a faixa vermelha em preto e branco e o selo da caveira virando
  retângulo branco. Para ordenar pintura, `position:relative` sozinho e
  a ordem do documento bastam.
- **Chapa é foto, e foto tem clarão.** O véu escuro por cima da imagem
  não é enfeite: sem ele a palavra clara cai num trecho branco em alguma
  largura de tela.

## Tipografia

Uma família só: **Archivo variável, com os dois eixos** — peso 100..900
e largura 62..125. É essa combinação que dá o desenho: palavra leve e
larga na chapa, palavra pesadíssima e estreita na repetida. Servida pelo
próprio site, sem Google Fonts, então a página não abre conexão com
terceiros.

O arquivo com eixo de largura pesa 90 KB contra 35 KB do que só tinha
peso. Os 55 KB a mais são o desenho.

## Os vídeos

Dois trechos de **30 s** da banda ao vivo, lado a lado, em
`assets/video/`. São gravações diferentes do mesmo palco: o primeiro em
luz chapada, o segundo em fim de tarde, com o sol entrando de lado.

**Ele não pesa no carregamento.** Com `preload="none"`, o navegador busca
só o cartaz (18 KB) e os 2,4 MB do vídeo só saem se alguém apertar play.
Verificado: carregando a página inteira e rolando até o fim, o arquivo
`ao-vivo.mp4` não chega a ser pedido.

O cartaz é o **primeiro quadro do próprio corte**, reticulado como o
resto da página: aperta play e ele ganha cor e som, sem salto de imagem.

Decisões, e o porquê de cada uma:

- **Cortado, não inteiro.** O original tem 2min28 e 13 MB. Recodificar
  não ajudava: em CRF 26 e 29 o arquivo ficava *maior* que a fonte, que
  já vinha bem comprimida. Cortar foi o que resolveu — 30 s a 2,4 MB.
- **O trecho é 1:00 → 1:30**, escolhido a dedo. Aos 1:40 alguém atravessa
  a frente do palco empurrando uma bicicleta, e por volta de 1:38 uma
  criança cruza o quadro. Entre 0:58 e 1:30 ninguém passa e os dois
  músicos ficam enquadrados.
- **Só MP4 (H.264).** Gerei um WebM/VP9 para comparar e ele saiu *maior*
  nas duas tentativas — é filmagem de mão, com muito movimento e
  granulação, que o VP9 não comprime melhor. Dois arquivos custariam o
  dobro de espaço sem ganho.
- **A rotação está assada no arquivo.** O original é `.mov` de celular,
  em pé por metadado. Recodificando, o vídeo sai realmente 576×1024 e
  nenhum navegador precisa interpretar matriz de rotação.
- **Esmaecimento de som e imagem no fim**, para o corte soar proposital
  em vez de estourado.

Ao mexer nisso com ffmpeg: **`-ss` e `-t` vão ANTES do `-i`.** Depois do
`-i`, o corte acontece só depois dos filtros, e um `fade=t=out:st=29`
apaga a imagem aos 29 s da linha do tempo *original* — se o trecho
guardado começa em 1:00, sai um vídeo inteiramente preto e mudo. Foi
exatamente o que aconteceu aqui na primeira tentativa.

O original de 2min28 não está no repositório: são 13 MB para um arquivo
que a banda já tem.

## Os vídeos

Dois trechos de **30 s** da banda ao vivo, lado a lado, em
`assets/video/`. São gravações diferentes do mesmo palco: o primeiro em
luz chapada, o segundo em fim de tarde, com o sol entrando de lado.

**O vídeo toca como é.** A retícula fica só no cartaz, a imagem parada
que aparece antes do play; o filme em si mantém cor e som do original.
O cartaz é o **primeiro quadro do próprio corte**, então apertar play não
dá salto de imagem: o cartaz impresso ganha cor.

**Eles não pesam no carregamento.** Com `preload="none"`, o navegador
busca só os cartazes (19 KB cada) e os 5 MB de vídeo só saem se alguém
apertar play. Verificado: carregando a página e rolando até o fim,
nenhum `.mp4` chega a ser pedido.

Decisões, e o porquê de cada uma:

- **Cortado, não recomprimido.** O original tem 2min28 e 13 MB.
  Recodificar o filme inteiro não ajudava: em CRF 26 e 29 o arquivo
  ficava *maior* que a fonte, que já vinha bem comprimida. Cortar foi o
  que resolveu. Os 30 s guardados ocupam 2,4 MB, e esses mesmos 30 s
  dentro do original ocupariam cerca de 2,6 MB — ou seja, a qualidade é
  a mesma; o que mudou foi a duração.
- **Os trechos são escolhidos a dedo**, quadro a quadro. No primeiro
  vídeo fica 1:00 → 1:30: por volta de 1:38 uma criança cruza a frente
  do palco e aos 2:02 alguém passa empurrando uma bicicleta. No segundo
  fica 0:40 → 1:10, onde ninguém atravessa e a luz está no melhor
  momento.
- **Antes de somar um vídeo, conferir se é mesmo outro.** Chegou aqui um
  arquivo com nome diferente, tamanho igual e soma de verificação
  diferente que era o **mesmo vídeo**: comparação quadro a quadro deu
  diferença 0/255 em quatro pontos e o áudio decodificado bateu byte a
  byte. Dois trechos iguais lado a lado, com câmera fixa, pareceriam
  defeito.
- **Só MP4 (H.264).** Gerei um WebM/VP9 para comparar e ele saiu *maior*
  nas duas tentativas: é filmagem de mão, com muito movimento e
  granulação, que o VP9 não comprime melhor. Dois arquivos custariam o
  dobro de espaço sem ganho nenhum.
- **A rotação está assada no arquivo.** O original é `.mov` de celular,
  em pé por metadado. Assim o vídeo sai realmente 576×1024 e nenhum
  navegador precisa interpretar matriz de rotação.
- **Esmaecimento de som e imagem no fim**, para o corte soar proposital
  em vez de estourado.

Ao mexer nisso com ffmpeg: **`-ss` e `-t` vão ANTES do `-i`.** Depois do
`-i`, o corte acontece só depois dos filtros, e um `fade=t=out:st=29`
apaga a imagem aos 29 s da linha do tempo *original* — se o trecho
guardado começa em 1:00, sai um vídeo inteiramente preto e mudo. Foi
exatamente o que aconteceu aqui na primeira tentativa.

Os originais (2min28 e 2min38, 13 e 19 MB) não estão no repositório: são
arquivos que a banda já tem. Para trocar um trecho, é um comando sobre
eles.

## Uma música por vídeo

A seção "Ao vivo" não é uma lista de músicas de um lado e vídeos do
outro: **cada vídeo é uma música, e o nome dela fica por cima do vídeo**,
numa tarja no alto. Nome, vídeo, nome, vídeo.

A tarja **some enquanto toca** e volta quando pausa: nome grande em cima
de gente tocando atrapalha quem veio ver.

Dois detalhes que parecem estilo e não são:

- A tarja é `pointer-events:none`. Sem isso ela cobriria os controles do
  vídeo e ninguém conseguiria dar play.
- A tarja é **chapada, não degradê**. Com degradê, a linha do artista
  (11px) cai onde a transparência já abriu, e a posição dela dentro do
  degradê muda com o tamanho do bloco: medi 2,8:1 no celular contra
  4,4:1 no desktop. Chapada dá o mesmo contraste em qualquer largura.

Cover leva o nome de quem fez; música da banda leva `autoral: true` e
aparece marcada, em amarelo. Sem um ou outro, a música apareceria como
se fosse da casa.

```js
{ musica: 'Vou Deixar', artista: 'Skank',
  video: 'assets/video/ao-vivo.mp4',
  cartaz: 'assets/img/ao-vivo-poster.webp' },
```

**Para trocar qual música é qual vídeo**, basta inverter as linhas
`video` e `cartaz` entre os dois blocos em `dados.js`. Não precisa tocar
em código.

## O movimento

Tudo sai da linguagem da página, que é impressão.

| O quê | Onde |
|-------|------|
| A tinta passa da esquerda para a direita | palavras grandes, nome da música |
| Letra por letra | o nome na capa, como tipo sendo montado |
| Fora de registro | palavras grandes e as fotos das chapas |
| Chapa fora de registro | as quatro chapas, assado no arquivo |
| Deslocamento na rolagem | fundos de seção, as três linhas de AO VIVO, o disco |
| Régua que responde | acelera com a rolagem e volta ao passo sozinha |
| Fio de tinta | progresso da página, no topo |
| Sobe e assenta | blocos, listas, cards, botões |
| Carimbo | o logo no meio de "A banda" |
| Cena 3D | as três linhas de AO VIVO em profundidades diferentes, giradas pelo ponteiro |

O escalonamento é **dentro do grupo que entra junto**, nunca pelo índice
no documento: pelo índice, uma peça lá embaixo herdaria um atraso enorme
e pareceria travada.

Tudo num `requestAnimationFrame` só. Separados, cada efeito leria a
rolagem por conta e o navegador recalcularia o layout várias vezes por
quadro.

### O que a medição de quadros ensinou

Aqui está o que custou caro, medido e não achado:

- **Mover uma camada misturada do tamanho da tela é o gargalo.** As fotos
  das chapas usam `mix-blend-mode`, que obriga o navegador a refazer a
  rasterização contra o fundo. Com elas se deslocando: **30 quadros por
  segundo em 1920 px e 20 em 2560**. Paradas: 60. Então elas ficaram
  paradas, e a mistura ficou, porque a mistura é o desenho.
- **Duas camadas misturadas em tela cheia não passam de 30 fps em 1920**,
  paradas ou não. Era assim que o fora de registro da foto funcionava no
  começo. A solução foi tirá-lo do compositor e **assá-lo no arquivo**:
  `meiatona.py` desloca uma cópia dos pontos e combina pelo mais escuro.
  Custa zero, e os arquivos até encolheram.
- **Mistura em fundo de seção não comprava nada.** Trocada por opacidade,
  a diferença de aparência é de no máximo **8 de 255** — invisível,
  porque esses fundos já entram apagados. E foi o que devolveu 60 fps em
  1440.
- **Variável CSS e `background-image: var()` no mesmo elemento é
  armadilha.** Cada troca da variável fazia o navegador reavaliar a
  imagem: a página repetia o pedido de cada foto de **8 a 10 vezes**.
  Camada de verdade com `transform` escrito direto resolveu.

Hoje: **60 quadros por segundo em 390, 768, 1440 e 1920 px.** Em 2560 px
cai para 30, e é o preço de manter a mistura das chapas, que é o desenho
da página.

### A armadilha da varredura

**Peça varrida não pode ser observada nela mesma.** O `clip-path` que a
esconde zera a área de interseção: o navegador devolve
`intersectionRatio: 0` para um elemento inteiramente na tela, o
`IntersectionObserver` nunca dispara, e a peça fica escondida para
sempre. Medido: o título da capa, 1196×115 px e plenamente visível, com
área vista igual a zero. **O título nunca apareceria.** Quem é observado
é o **pai**, que não está recortado.

### A rede de segurança

A margem negativa do observador exclui a última faixa da tela, e peça que
vive no rodapé do documento pode nunca cair na área observada: medido em
2560×1440, a letra miúda do fecho ficava escondida para sempre. Chegou ao
fim da página, o que sobrou aparece.

### As garantias

- Só `opacity`, `transform` e `clip-path` — as três propriedades que o
  navegador anima sem refazer layout.
- O estado escondido só existe quando o JS assume (`js-anima` na raiz), e
  a função inteira vive dentro de um `try` que desfaz a marca em caso de
  erro. Sem JS, sem `IntersectionObserver` ou com script quebrado, a
  página nasce inteira e visível.
- **24 de 24 peças entram**, conferido em 380, 390, 768, 1440, 1920 e
  2560 px.
- Quem configurou o sistema com menos movimento vê tudo de uma vez, sem
  transição, sem deslocamento, sem fio e com a régua parada.
- O nome partido em letras mantém o texto inteiro no `aria-label`, e as
  letras somem para o leitor de tela — senão ele soletraria a palavra.

## A interação

A página responde ao ponteiro, e não só à rolagem:

| O quê | Como |
|-------|------|
| A palavra da chapa | é empurrada pelo ponteiro dentro da faixa |
| Botões | viram ímã: inclinam na direção do cursor e voltam sozinhos |
| Clique | deixa um carimbo de tinta que abre e some |
| Régua | para quando o ponteiro passa por cima, e volta ao sair |
| Faixa AO VIVO | torce com a velocidade da rolagem |

### O 3D fica só na tipografia

Vídeo, card e logo ficam **planos de propósito**. Chegaram a inclinar com
o ponteiro e a página ficava bamba: coisa demais mexendo ao mesmo tempo.
O 3D vive onde é gesto de tipografia — a palavra da chapa, que vira, e a
faixa AO VIVO, que é cena.

### O 3D é cena, não truque

A faixa AO VIVO tem `perspective` no pai e `transform-style:preserve-3d`
nos filhos, e cada linha vive numa profundidade própria. **Sem
`preserve-3d`, cada linha teria a própria perspectiva e não existiria
cena nenhuma** — seria só texto girado. Com a cena montada, o ponteiro
gira o conjunto e as linhas do fundo andam menos, como num objeto de
verdade.

Os ângulos são pequenos de propósito: texto muito girado perde nitidez.

**Os ouvintes só guardam valores.** Quem escreve no estilo é o mesmo
`requestAnimationFrame` de tudo o mais: mexer em `transform` dentro do
`mousemove` faria o navegador recalcular várias vezes por quadro.

Medido depois de tudo isso: **60 quadros por segundo em 390, 768, 1440 e
1920 px**, com o ponteiro na tela e a interação rodando — zero a um
quadro lento em cem.

## O cursor

O ponteiro é uma **bolinha** laranja com anel creme, para ler tanto no
asfalto quanto no papel. Em **dois tamanhos**: se fosse um só, o link
perderia o aviso de que é clicável, que hoje é a mão do sistema. A maior
faz esse papel.

Atrás dela vem um **anel que segue com atraso** e abre quando passa por
cima de algo clicável.

A separação importa: **a bolinha é CSS puro e não depende de script** —
mesmo sem JS o cursor é a bolinha. O anel é enfeite por cima, e some se o
JS não rodar. Nada disso entra em tela de toque, onde não há cursor, nem
em movimento reduzido, onde só o anel sai e a bolinha fica, porque
bolinha não é movimento.

## Fotos

### Como uma foto vira chapa

```
python3 ferramentas/meiatona.py <entrada.jpg> <saida.webp> <largura>
```

A retícula é desenhada em supersample, reduzida e **binarizada** antes de
salvar em WebP sem perda. Binarizar não é detalhe: a mesma chapa dá
**73 KB em bilevel sem perda** e **524 KB em WebP com perda**, porque
ponto de retícula é o pior caso possível para compressão com perda.

Os sete originais ficam em `_fotos-originais/` e não vão ao ar.

### Onde cada uma está

| Arquivo | Onde |
|---------|------|
| `estudio-mt.webp` | capa, e fundo de "A banda" |
| `vinis-mt.webp` | chapa rubra "rock'n'roll", e fundo de "Autorais" |
| `logo.webp` | o logo da banda, no meio de "A banda" |
| `toca-discos-mt.webp` | peça vermelha da repetida, e fundo da "Agenda" |
| `skates-mt.webp` | chapa "agenda", e fundo de "Vídeos" |
| `guitarra-mao-mt.webp` | chapa rubra "vídeos" |
| `caveira-glitch-mt.webp` | chapa do fecho |

A seção de conteúdo **nunca** repete a foto da chapa vizinha: a mesma
imagem duas vezes seguidas lê como engano.

**O logo é a única imagem da página que não é reticulada.** Ele não é
bilevel: multiplicar sobre o creme escureceria o desenho inteiro e comeria
o vermelho. Entra como é, na própria placa de asfalto — que é o que a
referência faz com objeto escuro sobre papel.

O fundo preto do arquivo original (6,8,7) não é o asfalto do site
(20,17,16). Em vez de colar um quadrado de tom errado, o fundo foi
removido por preenchimento a partir da borda e a placa foi assentada em
asfalto. Preenchimento, e não limiar global, senão os contornos escuros
do próprio desenho virariam buraco.

O logo pesa 60 KB, contra 12 a 50 KB das chapas. O peso está no
desenho, não no descuido: guardá-lo com transparência custaria 148 KB,
porque o WebP grava o canal alfa sem perda.

### Vagas ainda abertas

**Nome de arquivo fixo e lugar reservado.** Salve em `assets/img/` com
exatamente este nome e aparece sozinho, sem tocar no código.

| Arquivo | Onde entra | Dimensão sugerida |
|---------|------------|-------------------|
| `hero-banda.webp` | fundo da capa, no lugar do estúdio | 1600×1100, foto de show |
| `emerson.webp` | retrato no card do Emerson | 800×1000 (vertical) |
| `jose.webp` | retrato no card do José | 800×1000 (vertical) |
| `nathan.webp` | retrato no card do Nathan | 800×1000 (vertical) |

**Três regras do mecanismo**, para quem for mexer no código:

- Nenhuma `.vaga__real` pode ter `loading="lazy"`. Ela nasce escondida, e
  imagem escondida com lazy nunca entra em viewport, nunca carrega, e a
  vaga nunca enche.
- Vaga vazia registra um **404 no console**. É esperado: é assim que a
  página descobre se a foto existe. Some quando o arquivo entra.
- Foto crua que chega pela vaga não é bilevel. O CSS aproxima o
  tratamento; para o efeito de verdade, passe antes pelo `meiatona.py`.

## O que ainda falta de verdade

Nada disso foi inventado no site:

- **Os nomes das autorais**, para entrarem marcadas no ao vivo.
- **Datas de show.**
- **WhatsApp ou e-mail de contratação.**
- **O logo da banda** e **fotos dos integrantes** (as quatro vagas acima).

## Peso

| | |
|---|---|
| Precisa para pintar a dobra | **174 KB** |
| Página inteira | **403 KB** |

Os 5 MB de vídeo não entram nessa conta: só baixam se alguém apertar
play.

O maior item da dobra é a **fonte, com 88 KB** — mais da metade. Ela
carrega o alfabeto inteiro; recortada só para os caracteres usados, cairia
para perto de 30 KB.

Medido pela API de performance do navegador (`encodedBodySize`), que é a
contagem confiável; somar corpos de resposta pelo Playwright perde
respostas e dá número errado.

Dois números diferentes, e a diferença importa: o Chromium antecipa
imagem `lazy` com folga larga, então antes de qualquer rolagem ele já
buscou perto de 285 KB. "Precisa para a dobra" é o que a primeira tela
exige de fato; não é o que o navegador escolhe adiantar.

## Verificado

- 380, 390, 768 e 1440 px: nenhuma rolagem horizontal.
- Sem erro de console, com as listas vazias e com as listas cheias.
  Os quatro 404 são as vagas abertas, por desenho.
- **Zero falhas de contraste AA nas quatro larguras**, medido em pixel:
  uma captura normal, outra com o texto transparente, comparando a cor do
  texto com o pior pixel do fundo debaixo dele. Em fundo de foto não dá
  para calcular pelo CSS.
- Vídeo entra por `youtube-nocookie.com` e com carregamento adiado.

Ao verificar com navegador, zere `scroll-behavior` antes de rolar: com
`smooth`, o laço de rolagem é reanimado a cada passo, nunca chega ao fim,
as imagens `lazy` de baixo não carregam e a captura sai com as chapas
vazias — parecendo defeito do site.

## Estrutura

```
rocha-nua/
  index.html
  assets/
    css/main.css        tokens, reset, tipografia, chapas, listas
    css/sections.css    barra, capa, régua, banda, repetida, fecho
    js/dados.js         >>> o conteúdo que muda vive aqui <<<
    js/main.js          monta as listas e os estados vazios
    fonts/archivo.woff2 variável, peso e largura (90 KB)
    img/*-mt.webp       as chapas reticuladas
  ferramentas/meiatona.py   gera chapa a partir de foto
  _fotos-originais/     os sete originais, não vão ao ar
  _referencias/         moodboard, não vai ao ar
```
