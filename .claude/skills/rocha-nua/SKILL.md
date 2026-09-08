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

Não há, publicamente confirmados: nomes de músicas, datas de show,
telefone ou e-mail de contratação, cidade da banda, nem o arquivo do
logo. Tudo isso vive em `assets/js/dados.js` como lista vazia, e a
página tem estado vazio de verdade para cada uma. Não preencher com
exemplo inventado apresentado como real, e não afirmar cidade nenhuma.

As marcas de canto (`#SOMOS ROCHANUA`, `FEITO PRA TOCAR`, `RN`) são
lema e monograma, não afirmação de fato. Podem mudar; não podem virar
telefone, cidade ou data.

## Imagens

As sete fotos que a banda enviou vivem em `_fotos-originais/` (não vão
ao ar) e viram chapa por `ferramentas/meiatona.py`. As reticuladas
publicadas terminam em `-mt.webp`.

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

Hoje: **165 KB na primeira tela, 318 KB na página inteira.**

- Meia-tona é bilevel por natureza. Guardar como tom contínuo é o erro:
  a mesma chapa dá **73 KB em WebP sem perda bilevel** e **524 KB em
  WebP com perda**. Sempre binarizar antes de salvar.
- Para medir, usar `performance.getEntriesByType('resource')` e somar
  `encodedBodySize`. Somar `response.body()` pelo Playwright perde
  respostas e dá número errado.

## Vagas de foto

Cada foto que ainda não chegou tem nome fixo e lugar reservado, e o JS
marca `.vaga--cheia` quando o arquivo carrega de verdade.

Previstas em `assets/img/`: `logo.webp` (capa), `hero-banda.webp` (fundo
da capa), `emerson.webp` e `jose.webp` (retratos).

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
