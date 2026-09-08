---
name: rocha-nua
description: Identidade visual e estrutura do site da banda Rocha Nua (@rocha.nua). Usar em qualquer edição de layout, cor, tipografia, componente ou texto dentro de rocha-nua/.
---

# Site da Rocha Nua

Pasta: `rocha-nua/`. HTML, CSS e JS puros, sem build, sem framework,
sem biblioteca de componentes. Mesma convenção do resto do repositório.

## Estética

Rua, skate, noite e adesivo. A direção veio do rock nacional dos anos
2000: paleta quente de capa de disco, adesivo recortado, letra de
marcador, foto crua.

**Paleta, e é só ela:**

```
--asfalto  #141110   fundo escuro (preto quente)
--creme    #F0E7D6   papel sujo, texto sobre o escuro
--laranja  #E2541F   acento principal
--amarelo  #F2B01E   acento secundário, em detalhe
```

**Regra de cor, uma só, vale na página inteira:** laranja e amarelo
nunca levam texto claro em cima. Quem senta em laranja ou amarelo é o
asfalto. Creme é para fundo escuro. Isso mantém tudo acima de 4.5:1 sem
conferir caso a caso. Em faixa clara, laranja só em título grande: em
corpo de texto ele não alcança 4.5:1 sobre o creme.

**Formas e recursos:**

- Canto reto em tudo, raio 0. O que é redondo é desenho (adesivo, selo,
  disco), nunca caixa.
- Títulos em Permanent Marker. Corpo em Archivo. As duas servidas pelo
  próprio site, sem Google Fonts.
- Letra colada (`.colada`): preenchida, contorno grosso em creme e
  sombra dura. É o que faz a palavra parecer adesivo, não texto.
- Molduras tremidas: filtro SVG de turbulência aplicado **só na borda**,
  num pseudo-elemento, para o texto continuar nítido.
- Fita crepe amarela (`.fitado`) segurando bloco pelo canto.
- Grão de asfalto: overlay fixo, `pointer-events:none`, opacidade baixa.
- Adesivos: `<symbol>` no sprite do `index.html`, usados com `<use>`.
  O contorno vai no `.adesivo svg`, **não** nas formas: o conteúdo de
  `<use>` mora em shadow tree e não é alcançado por seletor de fora.
  `stroke`, `stroke-width` e `paint-order` são herdáveis e descem.
- O ritmo da página é a alternância de faixas de asfalto e de papel, de
  largura total, invertendo o texto junto.

## Estrutura da página

Hero (logo do punho) / Autorais / Agenda de shows / Vídeos do YouTube /
Contato para contratação.

## Regras

- Nada de biblioteca de componentes pronta para os títulos.
- Cada seção precisa funcionar em 380px de largura.
- Uma faixa de texto rolando (marquee) na página inteira, no máximo.
- Movimento sempre atrás de `prefers-reduced-motion`.

## Verdade da banda (não inventar)

- Instagram: @rocha.nua · YouTube: youtube.com/@rochanuarockband
- Emerson (@emerson7r): voz, violão e guitarra
- José (@josehique): baixo
- Descrição do perfil: "ROCHA NUA BR | Rock'n'Roll"
- Destaques do perfil: Autorais, "Rolês", Rocha Nua!, Estamos no YT

Não há, publicamente confirmados: nomes de músicas, datas de show,
telefone ou e-mail de contratação, cidade da banda, nem o arquivo do
logo do punho. Tudo isso vive em `assets/js/dados.js` como lista vazia
ou marcada, e a página tem estado vazio de verdade para cada uma. Não
preencher com exemplo inventado apresentado como real, e não afirmar
cidade nenhuma.

## Imagens de terceiros

Os originais enviados como referência ficam em `rocha-nua/_referencias/`
e **não vão ao ar**. Veja o LEIA-ME de lá.

A única que a página usa é `assets/img/guitarra.webp`: um guitarrista em
preto e branco estourado, sem rosto reconhecível e sem marca de banda
nenhuma. Ela aparece duas vezes, sempre como fundo: textura do topo e
fundo do fecho de contratação. Nunca como retrato da Rocha Nua.

**As outras três não entram na página.** A capa do Charlie Brown Jr., a
foto do Chorão e a cartela com as marcas do Linkin Park e do Skillet são
material identificável de terceiros; num site que vende show, usá-las
como visual próprio faz parecer que são da banda. Também não recortar
esses logos para virar marca da Rocha Nua.

Quando chegarem fotos de verdade da banda, elas assumem o topo, o fecho
e a seção "A banda".

## Vagas de foto

Copiado do site da Eloize: cada foto tem nome fixo e lugar reservado, e
o JS marca `.vaga--cheia` quando o arquivo carrega de verdade. Enquanto
falta, vale a reserva, que é o desenho que já está na página.

Arquivos previstos em `assets/img/`: `logo.webp` (topo), `hero-banda.webp`
(fundo do topo), `emerson.webp` e `jose.webp` (retratos).

Ao mexer nisso:

- Nunca colocar `loading="lazy"` numa `.vaga__real`. Escondida, ela não
  entraria em viewport, não carregaria, e a vaga nunca encheria.
- Vaga vazia gera 404 no console. É o próprio teste de existência, não
  é defeito. Não "consertar" removendo a vaga.
- A vaga vazia tem que ocupar zero, para o layout não abrir buraco.
