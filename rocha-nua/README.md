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

| Lista      | Para quê                                        |
|------------|-------------------------------------------------|
| `autorais` | músicas próprias, com ano e link opcional       |
| `agenda`   | shows marcados (data no formato `AAAA-MM-DD`)   |
| `videos`   | vídeos do YouTube, **só o ID**, não a URL       |
| `contato`  | WhatsApp, e-mail, Instagram e canal             |

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

## O vídeo

Um trecho de **30 s** da banda tocando ao vivo, em `assets/video/`.

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

## O vídeo

Um trecho de **30 s** da banda tocando ao vivo, em `assets/video/`.

**O vídeo toca como é.** A retícula fica só no cartaz, a imagem parada
que aparece antes do play; o filme em si mantém cor e som do original.
O cartaz é o **primeiro quadro do próprio corte**, então apertar play não
dá salto de imagem: o cartaz impresso ganha cor.

**Ele não pesa no carregamento.** Com `preload="none"`, o navegador busca
só o cartaz (18 KB) e os 2,4 MB do vídeo só saem se alguém apertar play.
Verificado: carregando a página e rolando até o fim, o arquivo
`ao-vivo.mp4` não chega a ser pedido.

Decisões, e o porquê de cada uma:

- **Cortado, não recomprimido.** O original tem 2min28 e 13 MB.
  Recodificar o filme inteiro não ajudava: em CRF 26 e 29 o arquivo
  ficava *maior* que a fonte, que já vinha bem comprimida. Cortar foi o
  que resolveu. Os 30 s guardados ocupam 2,4 MB, e esses mesmos 30 s
  dentro do original ocupariam cerca de 2,6 MB — ou seja, a qualidade é
  a mesma; o que mudou foi a duração.
- **O trecho é 1:00 → 1:30**, escolhido a dedo. Por volta de 1:38 uma
  criança cruza a frente do palco e aos 2:02 alguém passa empurrando uma
  bicicleta. Entre 0:58 e 1:30 ninguém atravessa e os dois músicos ficam
  enquadrados.
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

O original de 2min28 não está no repositório: são 13 MB de um arquivo que
a banda já tem. Para trocar o trecho, é um comando sobre ele.

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

- **Nomes das autorais**, com link se houver gravação.
- **Datas de show.**
- **WhatsApp ou e-mail de contratação.**
- **O logo da banda** e **fotos dos integrantes** (as quatro vagas acima).

## Peso

| | |
|---|---|
| Precisa para pintar a dobra | **174 KB** |
| Página inteira | **360 KB** |

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
