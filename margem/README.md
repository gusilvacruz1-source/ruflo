# MARGEM

Front-end de e-commerce de streetwear, estética premium minimalista e
editorial. HTML, CSS e JavaScript puros, sem build, sem dependência de
terceiros em tempo de execução.

```
margem/
  index.html
  css/style.css      estilos
  css/fonts.css      @font-face da fonte local
  fonts/             Archivo variável (88 KB no latim)
  icons/             SVGs Phosphor "thin" de origem (os usados estão no HTML)
  img/               (vazia) as fotos entram aqui
  favicon.svg
  js/script.js
```

## MARGEM é um nome de exemplo

A marca precisava de um nome para o template ter identidade coerente.
Troque pelo nome real em três lugares: `index.html`, `favicon.svg` e o
comentário no topo do `css/style.css`.

Os seis nomes de peça e os seis preços também são **exemplo**. Nenhum
produto, preço ou depoimento real foi inventado como se fosse verdadeiro.

## As fotos

São onze slots, todos marcados na tela e comentados no HTML.

**Campanha** (uma, paisagem larga, ~2400x1400). Troque
`<span class="campanha__chapa">` por:

```html
<img class="campanha__foto" src="img/campanha.jpg" alt="Campanha da coleção">
```

**Peças** (seis peças × duas fotos cada). A primeira aparece parada, a
segunda surge no hover. Em cada peça troque as duas `<span class="chapa">`:

```html
<img class="peca__foto" src="img/moletom-1.jpg" alt="Moletom Oversized Bruto">
<img class="peca__foto peca__foto--b" src="img/moletom-2.jpg" alt="">
```

A segunda leva `alt=""` porque é a mesma peça em outro ângulo: repetir a
descrição só faria o leitor de tela falar duas vezes.

Proporção 3x4 ou 4x5, conforme o `--prop` que já está em cada peça.

**Editorial** (uma, bem larga, 21x9). Troque `<span class="editorial__chapa">`
por `<img class="editorial__foto" src="img/editorial.jpg" alt="">`.

Depois que todas entrarem, apague os blocos `.chapa`, `.campanha__chapa` e
`.editorial__chapa` do `css/style.css`.

> **Sobre o efeito borderless.** A placa do produto usa exatamente o mesmo
> tom do fundo da página (`#fafafa`). É isso que apaga a borda da imagem.
> Para o efeito continuar valendo com as fotos reais, fotografe as peças
> em fundo branco ou off-white, ou entregue PNG com fundo transparente.
> Foto com fundo colorido vai reaparecer como um retângulo.

## O que o site faz

- **Troca de foto no hover**: a segunda imagem já está posicionada por
  cima, invisível, numa escala levemente maior. No hover ela ganha
  opacidade e assenta na escala final. Nada surge do nada.
- **Revelação ao rolar**: só presença, quase sem deslocamento. O único
  momento coreografado é o título da campanha, que abre no carregamento.
- **Cabeçalho** claro sobre a campanha e escuro depois dela, sem escutar o
  evento de scroll (usa uma sentinela observada).
- Menu de tela cheia no celular, com `Esc` para fechar.
- Foco de teclado visível, e o hover da foto também dispara no foco.
- Respeita `prefers-reduced-motion`.

Não existe carrinho funcional: o ícone da sacola mostra zero e não abre
nada. É um front-end, e um carrinho de mentira seria pior que nenhum. A
integração com pagamento é uma fase seguinte.

## Decisões de projeto

- **Monocromático puro, sem cor de acento.** Papel `#fafafa`, tinta
  `#0d0d0d`, secundário `#6e6e6e`. Usei grafite em vez do preto absoluto:
  o brief permitia os dois, e em fundo claro o preto puro endurece a
  página sem ganhar nada.
- **Uma família de fonte, dois registros.** Archivo variável cobre peso 100
  a 900 e largura 62% a 125% num arquivo só. Os títulos usam largura 118%
  e peso 800; os preços, largura 100% e peso 400. É a mesma disciplina de
  fonte única que os temas premium usam, e custa 88 KB.
- **Grid assimétrico de 12 colunas** com deslocamentos verticais por peça,
  sem contorno, sem caixa e sem linha separando nada.
- **Ícones** Phosphor no peso "thin", embutidos no HTML. Nenhum desenhado
  à mão.
- **Contraste**: texto principal 18,0:1, secundário 4,9:1. O título da
  campanha tem um escurecimento na base que garante a leitura sobre
  qualquer foto que você colocar.
- Nenhum texto funcional abaixo de 11px. Verificado em 1440, 820 e 390:
  sem rolagem horizontal e sem erro de JavaScript.

## Publicar

Netlify, Vercel ou GitHub Pages. Basta apontar a pasta `margem/` como
diretório publicado. Não há passo de build.
