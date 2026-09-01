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

## O que você precisa trocar antes de divulgar

### 1. O link do WhatsApp (importante)

Foi lido da bio do Instagram a partir de uma captura de tela, então
**pode estar errado**. Confira antes de divulgar.

Ele aparece em dois lugares:

- `index.html` — várias ocorrências de `chat.whatsapp.com`
- `js/script.js` — a constante `ZAP`, no topo

Troque nos dois.

> Se você me passar o número de telefone da loja, dá para trocar o link de
> grupo por `wa.me`, e aí a lista de peças salvas chega já escrita na
> conversa, sem a cliente precisar colar nada.

### 2. As fotos

Nenhuma foto foi inventada. No lugar delas há placas de luz, marcadas na
tela com "Foto do hero", "Foto da peça" e "Foto editorial".

**Hero, duas fotos lado a lado.** Troque cada `<span class="hero__plate">` por:

```html
<img class="hero__photo" src="img/hero-1.jpg" alt="Modelo vestindo peça da Lumière">
```

Formato quadrado, por volta de 1200x1200. Deixe a modelo mais para a
borda externa, porque o nome fica no meio, sobre a emenda das duas.

**Peças, doze fotos.** Em cada cartão, troque `<span class="shot__plate">` por:

```html
<img src="img/alice.jpg" alt="Vestido longo Alice">
```

Proporção 4x5, por exemplo 900x1125.

**Faixa editorial, três fotos.** Troque cada `<span class="strip__plate">` por:

```html
<img src="img/editorial-1.jpg" alt="">
```

Quadradas. São fotos de clima, não de produto.

Depois que todas entrarem, apague os blocos `.hero__plate`, `.shot__plate`
e `.strip__plate` do `css/style.css`.

### 3. Os nomes das peças

As doze peças são **exemplo**, não produtos reais. Em cada
`<article class="card">` troque:

- `data-nome` (usado pela busca)
- `data-cat` (liga a peça ao filtro da nav: `vestidos`, `alfaiataria`,
  `tricot` ou `acessorios`)
- `data-id` (qualquer texto curto e único, guarda os favoritos)
- o `aria-label` do link e o do botão de salvar
- o `<span class="card__name">`

### 4. Os preços

Estão como "Sob consulta", que é verdade hoje: a negociação acontece na
conversa. Para mostrar valor, troque o conteúdo de `<span class="card__price">`.

### 5. A barra de aviso

O texto que rola no topo está em `index.html`, na variável do bloco
`.ticker`. Ele aparece duas vezes seguidas (é assim que a rolagem fica
contínua), então **troque nas duas cópias**.

## O que o site faz

- **Filtro por categoria** na nav: Vestidos, Alfaiataria, Tricot, Acessórios.
- **Busca** por nome, ignorando acento ("olivia" acha "Olívia"). Combina com
  o filtro: Tricot mais "lia" devolve só o Cardigã Lia.
- **Peças salvas**: a cliente marca no coração, e a lista fica guardada no
  navegador dela. Uma bandeja aparece embaixo com "Copiar e abrir o
  WhatsApp", que copia a lista pronta e abre a conversa.
- **Facho de luz** sobre a grade: no computador, uma luz quente acompanha o
  cursor e acende a peça por onde passa. Some no celular e com movimento
  reduzido.
- A barra de aviso **pausa** quando o cursor entra nela ou quando recebe
  foco de teclado.
- Toda a navegação funciona por teclado, com foco visível.
- Respeita `prefers-reduced-motion`.

Não existe carrinho nem conta de usuário, de propósito: seria um botão que
não leva a lugar nenhum. A venda continua acontecendo na conversa, que é
como a loja já vende.

## Publicar

Netlify, Vercel ou GitHub Pages servem. Basta apontar a pasta `lumiere/`
como diretório publicado. Não há passo de build.

## Decisões de projeto

- **Estrutura** copiada da referência que você mandou: barra de aviso
  rolando, nav com categorias, hero em duas imagens com o nome por cima,
  fileira densa de seis produtos, faixa de três fotos editoriais.
- **A voz é da Lumière.** O dourado da marca (`#7a5d28`) é o único acento.
  A frase "Vista-se de luz" abre o hero. A faixa em Bodoni entre a coleção
  e a entrega é o único momento que não é grade, e existe para a página não
  servir para qualquer loja.
- **Tipografia**: Bodoni Moda italic no logotipo e no hero, Archivo em todo
  o resto. Auto-hospedadas, então a página não depende do Google estar no ar
  nem pisca fonte de sistema no carregamento.
- **Ícones** da biblioteca Phosphor, embutidos no HTML. Nenhum desenhado à mão.
- **Contraste medido nos pixels renderizados**, não estimado: texto
  principal 18.9:1, secundário 5.3:1, dourado do hero 5.75:1 sobre a faixa
  escurecida. O escurecimento atrás do nome existe justamente para o
  contraste continuar válido quando entrar uma foto clara.
- A barra de aviso está em caixa normal, não em caixa alta como a
  referência: são mais de cem caracteres rolando, e caixa alta nesse volume
  atrapalha a leitura.
