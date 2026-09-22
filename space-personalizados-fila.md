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

## 6. Caneca Inox 180 ml — cód. 07392

Fotos: `assets/produtos/caneca-inox-180.webp` ✅
Também há uma foto de ambiente, `caneca-inox-180-ambiente.webp`, no estilo das
quatro da capa. Serve para virar um quinto slide, se quiser.

**Atenção na descrição:** o fornecedor avisa que NÃO é térmica. O site tem
vários itens térmicos e seria fácil o cliente confundir.

```js
{ id:'caneca-inox-180', name:'Caneca Inox 180ml', cat:'copos', ph:'caneca',
  desc:'Caneca em inox de 180 ml com cabo e tampa em plástico resistente. Não é térmica.',
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 8,1 cm de altura · 10 cm de largura · circunferência 21,5 cm · 84 g
Gravação: 7,5 × 6 cm

---

## 7. Caneca Térmica 350 ml — cód. 06061 — cinco cores

Fotos: `caneca-termica-350-cinza` `-preto` `-branco` `-verde` `-vermelho` ✅

A branca deu trabalho: a alça é branca sobre fundo branco. Na primeira foto
ela media exatamente 255, o mesmo valor do fundo, e não havia recorte
possível. A segunda foto tem contorno na alça (mínimo 219), e com a aresta
usada como represa mais um corte por área (o vão da alça tem 8.556 px e os
realces do inox, 436 e 354) ela saiu. Resta um contorno claro fino na base,
visível só sobre card escuro.

```js
{ id:'caneca-termica-350', name:'Caneca Térmica Inox 350ml', cat:'copos', ph:'caneca',
  desc:'Inox de parede dupla com tampa acrílica, bocal e trava de segurança.',
  cores:[
    { id:'cinza',  nome:'Cinza',  hex:'#5c5f5f' },
    { id:'preto',  nome:'Preto',  hex:'#333535' },
    { id:'branco', nome:'Branco', hex:'#e2e2e4' },
    { id:'verde',  nome:'Verde',  hex:'#435030' },
    { id:'vermelho', nome:'Vermelho', hex:'#a02d35' }
  ],
  tiers:[[1, /* PREÇO */ ]] },
```

Não confundir com a `caneca-termica-700` já cadastrada nem com a de 1,2 L.

Há também uma **foto de família** com as cores juntas, em
`caneca-termica-350-familia.webp`. Não serve para recorte (as peças se
sobrepõem e apoiam em suportes), mas serve de imagem de seção.

Há também um **detalhe da tampa** em `caneca-termica-350-detalhe-tampa.webp`:
macro do fecho acrílico com a trava de segurança, na cor preta. Vinha com uma
tira de miniaturas do site do fornecedor no rodapé, que eu cortei.

O card já sabe mostrar essa foto: basta o produto ter `detalhe: true` e o
arquivo se chamar `<id>-detalhe.webp`. Uma lupa aparece no canto e a imagem
só é baixada quando alguém abre.

Duas coisas que a foto de família revelou e precisam de resposta:

1. **Existe uma cor AZUL** (aproximadamente `#0e439a`) que não veio em foto
   solta. Se quiser essa cor no site, preciso da foto individual dela.
2. **Existe uma versão SEM ALÇA**, mais baixa, que aparece em verde e azul na
   mesma foto. É outro produto, não outra cor desta caneca. Se for para
   vender, precisa de código, ficha e fotos próprias.

Ficha: 11,6 cm de altura · 11,9 cm de largura · circunferência 27,6 cm · 299 g
Gravação: 7,5 × 4 cm

---

## Preços recebidos sem produto ainda

Chegaram antes das fotos e das descrições. Ficam aqui até o produto existir.

Leitura usada em todos: **"acima de 10" = a partir de 10**, que é como a
tabela do PDF anterior dizia ("a partir de 10 uni"). Se for ao pé da letra
(11, 51, 101), é trocar os três números em cada linha — mas confirme, porque
num pedido de exatamente 10 copos a diferença é de R$ 250.

| Produto | 1 un | 10+ | 50+ | 100+ |
|---|---|---|---|---|
| Caneca chopp 810 ml | 69,90 | 49,90 | 48,90 | 45,90 |
| Copo long neck | 49,90 | 39,99 | 36,90 | 35,99 |
| Copo cuia | 49,99 | 29,90 | 28,90 | 25,90 |
| Garrafa LED | 49,00 | 29,90 | 27,90 | 25,90 |

```js
// prontos para colar assim que houver foto e descrição
{ id:'caneca-chopp-810', name:'Caneca Chopp 810ml',  cat:'copos',    ph:'caneca',
  desc:'', tiers:[[1,69.90],[10,49.90],[50,48.90],[100,45.90]] },
{ id:'copo-long-neck',   name:'Copo Long Neck',      cat:'copos',    ph:'copo',
  desc:'', tiers:[[1,49.90],[10,39.99],[50,36.90],[100,35.99]] },
{ id:'copo-cuia',        name:'Copo Cuia',           cat:'copos',    ph:'copo',
  desc:'', tiers:[[1,49.99],[10,29.90],[50,28.90],[100,25.90]] },
{ id:'garrafa-led',      name:'Garrafa LED',         cat:'garrafas', ph:'garrafa',
  desc:'', tiers:[[1,49.00],[10,29.90],[50,27.90],[100,25.90]] },
```

A "Garrafa LED" veio duas vezes na mensagem, com os mesmos valores. Tratei
como um produto só.

---

## Fichas de produtos que JÁ estão cadastrados

Caso queira completar a descrição deles também.

**churrasco-2-caixa** (cód. 4564): inox e madeira · estojo 32,5 × 11,7 × 3,1 cm ·
faca 29,9 × 3,8 · garfo 28,5 × 2,3 · gravação estojo 9 × 31, faca 1,5 × 7,
garfo 1,5 × 7,5 · 223 g

**churrasco-4** (cód. 01644) e **churrasco-2-estojo**: descrições já atualizadas.
