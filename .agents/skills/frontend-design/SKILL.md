---
name: frontend-design
description: Direção visual ousada e intencional para interfaces web — escala tipográfica, arquétipos de layout, coreografia de animação e componentes padronizados (estatísticas grandes com contagem crescente, botões-pílula com ícone encapsulado, cartões com bisel duplo). Use sempre que for criar ou redesenhar landing page, site institucional, portfólio, página de produto, hero, seção de preços ou qualquer tela que precise "parecer cara" — e também quando o pedido for vago ("deixa mais bonito", "está sem graça", "quero algo moderno"), porque é aí que a decisão estética costuma ser tomada no automático.
---

# Direção visual: ousada e intencional

Interface sem direção não fica neutra — fica genérica. O padrão que sai sem
decisão é sempre o mesmo: Inter em 16 px, cartões iguais em três colunas,
sombra suave em tudo, azul de sistema. Este documento existe para tirar cada
escolha do automático.

A regra que governa o resto: **gaste ousadia num lugar só e mantenha o resto
quieto.** Uma página com tipografia enorme, cor saturada, movimento em tudo e
seis pesos de fonte não é ousada, é barulhenta. Escolha o eixo — tipografia,
cor, layout ou movimento — e deixe os outros três servirem a ele.

## Tipografia

A escala é o esqueleto. Fixe uma e não invente valores no meio do caminho:

| Papel | Tamanho | Peso | Tracking |
| --- | --- | --- | --- |
| Display | `clamp(2.6rem, 6vw, 5.5rem)` | 600–700 | −0.035em |
| Título de seção | `clamp(2rem, 4.5vw, 3.4rem)` | 600–700 | −0.03em |
| Subtítulo | `clamp(1.2rem, 2vw, 1.6rem)` | 500 | −0.02em |
| Corpo | 0.95–1.05rem | 400 | 0 |
| Rótulo | 0.68–0.72rem | 500 | +0.18em, caixa alta |

Três decisões que separam o caro do genérico:

- **Duas famílias, no máximo.** Uma de display com caráter e uma de texto que
  suma. Se a de display não tem caráter nenhum, ela não está fazendo o
  trabalho dela — troque, não aumente o tamanho.
- **Tracking negativo só em tamanho grande.** Abaixo de 1.5rem, tracking
  apertado só atrapalha a leitura. O piso é −0.04em; entre −0.02 e −0.03
  quase sempre lê melhor.
- **Medida de 65–75 caracteres** no corpo. Linha mais longa que isso o olho
  perde o retorno, e nenhuma escolha de fonte conserta.

## Arquétipos de layout

Escolha um por página e leve até o fim. Misturar dois é o que produz aquela
sensação de página montada por partes:

**Divisão editorial** — tipografia grande ocupando metade, conteúdo
navegável na outra. Some para uma coluna abaixo de 768 px.

**Bento assimétrico** — grade de blocos de tamanhos diferentes, sem espaço
entre eles ou com espaço generoso, nunca meio-termo. Todos os `col-span`
voltam a 1 no celular.

**Cascata em profundidade** — blocos que se sobrepõem levemente, com
profundidades diferentes. Remova sobreposição e rotação abaixo de 768 px:
no toque, elemento sobreposto vira alvo errado.

**Índice** — lista de linhas separadas por fio, cada uma com nome à esquerda
e descrição à direita. Vale mais que uma grade de cartõezinhos sempre que os
itens forem texto — e é o que evita a página inteira virar cartão.

Respiro entre seções: `py-24` a `py-40`. Se a página parece apertada, o
problema quase nunca é o conteúdo — é o espaço entre os blocos.

## Coreografia de animação

Um momento coreografado vale mais que dez efeitos espalhados. Escolha onde a
página "acontece" — a abertura, a entrada da vitrine, a virada para o bloco
escuro — e trate o resto como reação discreta.

- **Curva única para tudo:** `cubic-bezier(0.16, 1, 0.3, 1)`. Saída longa,
  chegada macia. `ease-in-out` e `linear` entregam que ninguém decidiu.
- **Durações:** microinteração 200–400 ms; entrada de bloco 700–1000 ms;
  transição de cena 1200 ms+. Hover que demora mais que 400 ms parece
  travado; entrada que dura menos que 600 ms parece nervosa.
- **Entrada:** de um estado já visível, subindo 20–30 px. Nunca deixe
  conteúdo estacionado em `opacity: 0` esperando observador — quem chega
  pela busca ou tira print vê a página vazia.
- **Só `transform` e `opacity`** no que se move. `top`, `left`, `width` e
  `height` disparam layout a cada quadro.
- **`prefers-reduced-motion`** desliga tudo e entrega a página estática.

## Componentes padronizados

### Estatística grande com contagem

O número é o argumento; o rótulo é a legenda dele.

```html
<div class="stat">
  <span class="stat__valor" data-conta-ate="1240" data-sufixo="+">0</span>
  <span class="stat__rotulo">Famílias atendidas</span>
</div>
```

```css
.stat__valor {
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
  font-variant-numeric: tabular-nums; /* sem isso o número treme ao contar */
}
.stat__rotulo {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
}
```

A contagem dispara uma vez, quando entra na tela, em 1200–1600 ms com
desaceleração — e respeita movimento reduzido mostrando o valor final direto.
`scripts/conta-ate.js` traz a implementação pronta.

Duas condições para a estatística existir: **os números são reais** e **eles
são o argumento da seção**. Número grande inventado, ou usado como enfeite
onde o argumento é outro, é o clichê que essa fórmula produz quando aplicada
sem pensar.

### Botão-pílula com ícone encapsulado

O ícone nunca fica solto ao lado do texto: mora num círculo próprio, encostado
na borda interna direita do botão.

```html
<a class="botao" href="#">
  Falar com a gente
  <span class="botao__icone"><svg>…</svg></span>
</a>
```

No hover, o botão inteiro reage (cor) e o círculo gira 45° ou avança na
diagonal. `active:scale-[0.98]` dá o peso do toque.

### Cartão com bisel duplo

Nunca apoie uma imagem direto no fundo. Casca externa com fundo sutil, fio de
1 px e raio grande; núcleo interno com raio calculado
(`calc(raio - padding)`) para as curvas ficarem concêntricas. É o que faz a
foto parecer estar na frente da placa, e não colada nela.

## O que entrega falta de decisão

- Inter, Roboto, Open Sans ou Arial como voz de display
- Três cartões idênticos de ícone + título + texto como estrutura da página
- Texto em gradiente (ênfase vem de peso ou tamanho)
- Sombra escura e dura, ou borda cinza de 1 px em tudo
- Vidro e desfoque como decoração, sem serem um efeito específico
- Emoji no lugar de ícone
- Tudo centralizado
- Barra de navegação colada no topo, de ponta a ponta
