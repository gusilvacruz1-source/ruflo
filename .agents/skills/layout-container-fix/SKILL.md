---
name: layout-container-fix
description: Impõe um único container global (.site-container) com largura máxima de 1320px e recuo padronizado, para o layout não quebrar durante a geração de código. Use sempre que estiver escrevendo ou revisando o HTML/CSS de páginas com várias seções, quando aparecerem larguras e paddings diferentes de bloco para bloco, quando o conteúdo estiver desalinhado entre seções, quando surgir rolagem horizontal indesejada, ou quando alguém pedir para "alinhar as seções", "arrumar o layout" e "padronizar as margens".
---

# Um container, e só um

O jeito mais comum de um layout gerado se desfazer não é um erro grande: é
cada seção nascendo com a sua própria largura. Uma vem com `max-w-6xl`, a
seguinte com `max-w-7xl`, a terceira com `px-6` em vez de `px-8`. Nenhuma
delas está errada sozinha, e juntas produzem uma página em que nada alinha —
o olho percebe antes de a pessoa saber dizer o quê.

A defesa é estrutural: **existe um container, ele se chama `.site-container`,
e todo conteúdo passa por ele.**

## O container

```css
.site-container {
  width: 100%;
  max-width: 1320px;
  margin-inline: auto;
  padding-inline: 24px;
}

@media (min-width: 768px) {
  .site-container { padding-inline: 40px; }
}

@media (min-width: 1280px) {
  .site-container { padding-inline: 56px; }
}
```

`1320px` é o teto do conteúdo, não da seção. Fundo, imagem de topo e blocos
coloridos vão de ponta a ponta; o que se lê fica dentro dos 1320.

## Como usar

Cada seção tem duas camadas, sempre nesta ordem: a de fora pinta e respira, a
de dentro alinha.

```html
<section class="secao secao--escura">
  <div class="site-container">
    <h2>Título</h2>
    <p>Conteúdo.</p>
  </div>
</section>
```

```css
.secao { padding-block: 96px; }
@media (min-width: 768px) { .secao { padding-block: 128px; } }
```

A seção controla **espaço vertical e cor**. O container controla **largura e
recuo lateral**. Quando essa divisão se mantém, dá para trocar o teto de
1320 px num lugar só e a página inteira acompanha.

## As três exceções, e como fazê-las

**Conteúdo que precisa ser mais estreito** — um texto corrido, um formulário.
Não crie outro container: aninhe um limite de medida dentro dele.

```html
<div class="site-container">
  <div class="medida">…</div>
</div>
```
```css
.medida { max-width: 68ch; }         /* texto corrido */
.medida--form { max-width: 560px; }  /* formulário */
```

**Imagem ou fundo sangrando até a borda** — fica fora do container, não com
um container maior:

```html
<section class="secao">
  <img class="sangra" src="…" alt="…">
  <div class="site-container">…</div>
</section>
```

**Carrossel que vaza para a direita** — o container segura o começo e a
rolagem continua até a borda:

```css
.trilho {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  margin-right: calc(50% - 50vw); /* estica só para a direita */
  padding-right: 24px;
  scrollbar-width: none;
}
```

## Como revisar

Quando o layout já está desalinhado, procure nesta ordem:

1. **Largura repetida fora do container** — busque por `max-w-`, `max-width`,
   `1200px`, `1280px`, `1440px` no CSS e nas classes. Cada ocorrência fora de
   `.site-container` é candidata a ser removida.
2. **Padding lateral repetido** — `px-`, `padding-inline`, `padding-left` em
   seções. Deve estar só no container.
3. **Rolagem horizontal** — some quase sempre de um elemento com `100vw`
   (que inclui a barra de rolagem), de uma margem negativa sem o recorte
   correspondente, ou de uma grade cujo conteúdo não cabe. Confira com:
   ```js
   [...document.querySelectorAll('*')]
     .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
   ```
4. **Container dentro de container** — o recuo dobra e a seção parece mais
   estreita que as vizinhas sem motivo aparente.

## Em Tailwind

O mesmo contrato, como classe de componente — para não repetir a tripla
`mx-auto max-w-[1320px] px-6 md:px-10 xl:px-14` em cada seção e errar uma:

```css
@layer components {
  .site-container {
    @apply mx-auto w-full max-w-[1320px] px-6 md:px-10 xl:px-14;
  }
}
```

Se o projeto já tem um container próprio com outro nome ou outra largura, use
o dele. O valor deste documento é haver **um só** — não é o número 1320.
