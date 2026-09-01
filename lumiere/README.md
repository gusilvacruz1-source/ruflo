# Lumière | Moda & Estilo

Loja da Lumière (Reserva, PR). HTML, CSS e JavaScript puros, sem build,
sem dependência de terceiros em tempo de execução. É só subir a pasta.

```
lumiere/
  index.html
  css/style.css      estilos
  css/fonts.css      @font-face das fontes locais
  fonts/             Bodoni Moda italic + Archivo (120 KB, auto-hospedadas)
  icons/             SVGs Phosphor de origem (os usados estão embutidos no HTML)
  img/               (vazia) as fotos entram aqui
  favicon.svg
  js/script.js
```

## O que você precisa trocar antes de publicar

### 1. O link do WhatsApp (importante)

Foi lido da bio do Instagram a partir de uma captura de tela, então
**pode estar errado**. Confira antes de publicar.

Ele aparece em dois lugares:

- `index.html` — várias ocorrências de `chat.whatsapp.com`
- `js/script.js` — a constante `ZAP`, no topo

Troque nos dois.

> Se você me passar o número de telefone da loja, dá para trocar o link de
> grupo por `wa.me`, e aí a lista de peças salvas chega já escrita na
> conversa, sem a cliente precisar colar nada.

### 2. As fotos

Nenhuma foto foi inventada. No lugar delas há placas de luz, marcadas com
"Foto da peça" e "Foto do hero".

**Foto do hero** (`index.html`, seção `.hero`): troque

```html
<span class="hero__plate" aria-hidden="true"></span>
```

por

```html
<img class="hero__photo" src="img/hero.jpg" alt="Modelos vestindo peças da Lumière">
```

Ideal: 2400x1200, com as modelos nas laterais para o nome respirar no meio.

**Modelo na frente das letras** (o efeito da referência, opcional): salve um
PNG de fundo transparente e troque

```html
<span class="hero__front" aria-hidden="true"></span>
```

por

```html
<img class="hero__cut" src="img/hero-frente.png" alt="">
```

**Fotos das peças**: em cada cartão, troque

```html
<span class="shot__plate" style="--lx:42%; --ly:24%;"></span>
```

por

```html
<img src="img/vestido-longo-alice.jpg" alt="Vestido longo Alice">
```

Proporção 3x4 (por exemplo 900x1200). Depois que todas entrarem, apague os
blocos `.shot__plate` e `.hero__plate` do `css/style.css`.

### 3. Os nomes das peças

As oito peças são **exemplo**, não produtos reais. Em cada `<article class="card">`
troque `data-nome`, o `aria-label` do link, o `aria-label` do botão de salvar
e o `<span class="card__name">`. O `data-id` pode ser qualquer texto curto e
único (ele guarda os favoritos no navegador da cliente).

### 4. Os preços

Estão como "Sob consulta", que é verdade hoje: a negociação acontece na
conversa. Para mostrar valor, troque o conteúdo de `<span class="card__price">`.

## O que o site faz

- **Busca** que filtra as peças pelo nome, ignorando acento ("olivia" acha "Olívia").
- **Peças salvas**: a cliente marca no coração, e a lista fica guardada no
  navegador dela. Uma bandeja aparece embaixo com "Copiar e abrir o WhatsApp",
  que copia a lista pronta e abre a conversa.
- Toda a navegação funciona por teclado, com foco visível.
- Respeita `prefers-reduced-motion`.

Não existe carrinho nem conta de usuário, de propósito: seria um botão que não
leva a lugar nenhum. A venda continua acontecendo na conversa, que é como a
loja já vende.

## Publicar

Netlify, Vercel ou GitHub Pages servem. Basta apontar a pasta `lumiere/`
como diretório publicado. Não há passo de build.

## Decisões de projeto

- **Paleta** amostrada da imagem de referência que você mandou, não escolhida
  de memória: creme com viés oliva (`#e9e7da`), célula de produto (`#ece9e3`),
  faixa taupe. O acento oliva (`#636144`) é o único, e passa 5.1:1 no papel.
- **Tipografia**: Bodoni Moda italic no logotipo, Archivo em todo o resto.
  Auto-hospedadas, então a página não depende do Google estar no ar nem pisca
  fonte de sistema no carregamento.
- **Ícones** da biblioteca Phosphor, embutidos no HTML. Nenhum foi desenhado
  à mão.
- **Contraste** verificado: texto principal 15.2:1, secundário 6.1:1,
  logotipo do hero 4.8:1 sobre a faixa.
