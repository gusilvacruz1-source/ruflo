---
name: rocha-nua
description: Identidade visual e estrutura do site da banda Rocha Nua (@rocha.nua). Usar em qualquer edição de layout, cor, tipografia, componente ou texto dentro de rocha-nua/.
---

# Site da Rocha Nua

Pasta: `rocha-nua/`. HTML, CSS e JS puros, sem build, sem framework,
sem biblioteca de componentes. Mesma convenção do resto do repositório.

## Estética

- Preto absoluto de fundo (`#000`), branco puro no texto (`#FFF`).
  Sem gradiente, sem roxo, sem card cinza arredondado.
- Títulos em fonte de marcador (Permanent Marker), com peso e distorção.
  Corpo em Archivo, limpa e pequena.
- Molduras e ícones com traço desenhado à mão (filtro SVG de
  turbulência sobre a borda), não borda de CSS lisa.
- Contraste alto e blocos cheios. O ritmo da página é a alternância de
  faixas pretas e brancas de largura total, invertendo o texto junto.
  Espaço negativo é parte do design.
- Cantos retos em tudo. Raio 0, sem exceção.

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
telefone ou e-mail de contratação, nem o arquivo do logo do punho.
Tudo isso vive em `assets/js/dados.js` como lista vazia ou marcada,
e a página tem estado vazio de verdade para cada uma. Não preencher
com exemplo inventado apresentado como real.

## Referência visual

A direção veio de um portfólio de graffiti preto e branco de outra
designer. É referência de **estilo apenas**: nada de reproduzir aquele
layout nem, em hipótese alguma, os dados de contato que aparecem nele.
