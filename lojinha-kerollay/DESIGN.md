# Sistema visual — Lojinha Kerollay

Documentado a partir do que foi construído, não do que se planejou.

## Cor

| Papel | Valor | Onde |
|---|---|---|
| Areia (campo) | `#C4B29E` | fundo da página inteira |
| Areia clara | `#D8CBBA` | ladrilhos claros, gaveta, campos |
| Areia média | `#CFC0AC` | etiquetas, itens do carrinho |
| Areia linha | `#B4A08A` | única linha do rodapé |
| Vinho | `#54171B` | barra do topo, ladrilhos de destaque, botões |
| Vinho claro | `#6B2126` | estado hover do vinho |
| Vinho fundo | `#401014` | trás da aquarela |
| Creme | `#F6EFE6` | texto e botões dentro do vinho |
| Creme suave | `#E2D2C0` | texto secundário sobre vinho |
| Tinta | `#2A1512` | texto sobre areia |
| Tinta suave | `#513328` | texto secundário sobre areia |

Estratégia: **Full palette**, quatro papéis nomeados. O vinho carrega perto de
35% da superfície — é campo, não detalhe.

Contraste medido: tinta/areia 8,4:1 · tinta-suave/areia-clara 7,1:1 ·
creme/vinho 12,2:1 · creme-suave/vinho 9,4:1 · vinho/areia-clara 8,7:1.
Texto secundário é tingido do próprio matiz, nunca cinza.

## Tipografia

Plus Jakarta Sans, 400 a 800. **Escolha fixada pelo cliente no brief** — o
detector marca a fonte como batida e a regra do brief pinado prevalece.

- Display `clamp(2.35rem, 5.1vw, 4.15rem)`, peso 800, tracking `-.03em`
- Seção `clamp(1.72rem, 3.3vw, 2.5rem)`, peso 800, tracking `-.025em`
- Corpo 16px/1.62, peso 500 · medida máxima 60ch
- Etiqueta `.74rem`, peso 700, caixa alta, tracking `.13em`
- Números com `font-variant-numeric: tabular-nums` em preço, total e quantidade

## Forma

- Ladrilho `32px` (26px no celular) · foto `22px` · campo `16px`
- Controles em pill (`999px`): botões, filtros, etiquetas, ícones
- **Elevação declarada uma vez**: sombra, nunca sombra mais borda.
  `0 12px 34px rgba(42,21,18,.14)`, subindo para `.22` no hover
- Gap de 18px (13px no celular) — o areia aparece entre os ladrilhos

## Grade

Bento de 12 colunas com `grid-auto-flow: dense` e `align-items: start`.

- Capa: ladrilho vinho 7 col × 2 linhas · aquarela 5 col × 3 linhas ·
  nota 4 col · marcas 3 col
- Produtos: 3 colunas por padrão; o 1º e o 6º de cada seis ocupam 6 colunas
  e viram horizontais (foto 4:3 à esquerda, texto à direita)
- Sobre: ladrilho vinho 8 col · quatro selos de 2 col
- ≤1040px vira 12/8/4 · ≤760px vira 6 colunas por cartão

## Ícones

Sprite SVG no topo do documento, referenciado por `<use>`. Traço 1.7,
`stroke-linecap` e `linejoin` redondos, viewBox 24. **Nenhum emoji na
interface** — o único caractere pictográfico restante é o `©` do rodapé.

## Movimento

Um único momento autoral: os quatro ladrilhos da capa sobem 16px com
`cubic-bezier(.16,1,.3,1)`, escalonados em 70ms. Nenhuma outra seção repete
essa entrada.

Micro-interações: cartão de produto e de contato em `scale(1.02)` com a sombra
subindo; botões em `translateY(-2px)` com troca de cor; contador do carrinho
pulsa ao receber item. Tudo em 220–300ms com a mesma curva.

`prefers-reduced-motion: reduce` zera animação e transição e fixa a capa.

## Superfícies do navegador

Seleção em vinho sobre creme · `caret-color` e `accent-color` vinho ·
barra de rolagem vinho sobre areia média com polegar em pill ·
foco visível em contorno vinho de 2,5px, virando creme dentro dos
ladrilhos vinho e da gaveta · sublinhado com `text-underline-offset: 3px`.

## Dívida conhecida

Cada produto sem foto tenta `img/<id>.jpg` e depois `.png`, o que gera cerca
de 30 requisições 404 por carregamento com o catálogo vazio de fotos. É o
preço de a dona publicar foto só subindo arquivo, sem editar código. Cai a
zero conforme as fotos entram.
