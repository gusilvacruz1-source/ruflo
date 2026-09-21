# Fila de cadastro — Space Personalizados

Produtos extraídos dos prints do fornecedor. **Fotos prontas, faltam os preços.**
Assim que os valores chegarem, é preencher `tiers` e colar em `PRODUCTS`,
no `js/script.js`.

Este arquivo mora FORA da pasta do site de propósito: ele tem códigos de
fornecedor, e a pasta `space-personalizados/` inteira vai para o ar no
GitHub Pages.

---

## 1. Kit Churrasco 4 Peças · estojo nylon — cód. 08199

Foto: `assets/produtos/churrasco-4-nylon.webp` ✅
Não confundir com o `churrasco-4` já cadastrado, que é maleta de alumínio.

```js
{ id:'churrasco-4-nylon', name:'Kit Churrasco 4 Peças · Nylon', cat:'churrasco', ph:'churrasco',
  desc:'Espátula, garfo, pegador e faca de 7 polegadas em inox com cabo de madeira, em estojo de nylon. Acompanha plaquinha metálica personalizável.',
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 38,8 × 12,1 × 4,7 cm · 593 g
Gravação: estojo 9 × 34 cm · plaquinha 3,5 × 7 cm

---

## 2. Kit Churrasco 3 Peças — cód. 18891A

Foto: `assets/produtos/churrasco-3.webp` ✅
O site não tinha nenhum kit de 3 peças.

```js
{ id:'churrasco-3', name:'Kit Churrasco 3 Peças', cat:'churrasco', ph:'churrasco',
  desc:'Faca de 8 polegadas, garfo de duas pontas e pegador em inox com detalhes em madeira, em estojo de nylon com alça. Acompanha plaquinha adesiva personalizável.',
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 37,6 × 9 × 4 cm · 422 g
Gravação: plaquinha 4,5 × 8 · faca 1 × 3 · garfo 1,5 × 10 · pegador 1,5 × 5 cm

---

## 3. Kit Churrasco 5 Peças · sem espetos

Foto: `assets/produtos/churrasco-5-nylon.webp` ✅

**Confirmar antes de cadastrar:** o `churrasco-5` que já está no site TEM dois
espetos e este não tem nenhum. São SKUs diferentes. Vender os dois, ou este
substitui o antigo?

```js
{ id:'churrasco-5-nylon', name:'Kit Churrasco 5 Peças · Nylon', cat:'churrasco', ph:'churrasco',
  desc:'Faca de 6 polegadas, garfo, espátula, pincel com cerdas de silicone e pegador em inox, em estojo de nylon com par de alças. Acompanha placa metálica personalizável.',
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 38,5 × 11 × 4,5 cm · 662 g
Gravação: estojo 7 × 12 cm · plaquinha 2 × 8 cm

---

## 4. Caderneta Couro Sintético — 4 cores

Fotos: `caderneta-preto` `caderneta-azul` `caderneta-caramelo` `caderneta-cinza` ✅

```js
{ id:'caderneta', name:'Caderneta Couro Sintético', cat:'escritorio', ph:'caneta',
  desc:'Capa em couro sintético com plaquinha metálica personalizável, porta-canetas lateral e marca-páginas em fita de cetim. Cerca de 96 folhas pautadas.',
  cores:[
    { id:'preto',    nome:'Preto',    hex:'#433f42' },
    { id:'azul',     nome:'Azul',     hex:'#374e6a' },
    { id:'caramelo', nome:'Caramelo', hex:'#8c5633' },
    { id:'cinza',    nome:'Cinza',    hex:'#8b887f' }
  ],
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 17,3 × 10,7 × 2,2 cm · 155 g
Gravação: plaquinha 2 × 4,5 cm · capa 16 × 8,5 cm

---

## 5. Caneca Térmica 1,2 L — 4 cores

Fotos: `caneca-termica-1200-petroleo` `-azul-claro` `-branco` `-preto` ✅

```js
{ id:'caneca-termica-1200', name:'Caneca Térmica 1,2L', cat:'copos', ph:'caneca',
  desc:'Inox 304 de parede dupla, tampa acrílica rosqueável com bico flexível e pegador plástico. Acompanha canudo.',
  cores:[
    { id:'petroleo',   nome:'Azul petróleo', hex:'#3e5968' },
    { id:'azul-claro', nome:'Azul claro',    hex:'#a7cedf' },
    { id:'branco',     nome:'Branco',        hex:'#e2e1e1' },
    { id:'preto',      nome:'Preto',         hex:'#1b1b1b' }
  ],
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 26,9 cm de altura · 15 cm de largura · circunferência 30,9 cm · 527 g
Gravação: 11 × 9 cm

---

## Fichas de produtos que JÁ estão cadastrados

Caso queira completar a descrição deles também.

**churrasco-2-caixa** (cód. 4564): inox e madeira · estojo 32,5 × 11,7 × 3,1 cm ·
faca 29,9 × 3,8 · garfo 28,5 × 2,3 · gravação estojo 9 × 31, faca 1,5 × 7,
garfo 1,5 × 7,5 · 223 g

**churrasco-4** (cód. 01644) e **churrasco-2-estojo**: descrições já atualizadas.
