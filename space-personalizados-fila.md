# Fichas dos produtos — Space Personalizados

**Os 12 produtos abaixo JÁ ESTÃO no site.** O copo long neck, a garrafa
LED e o copo 360 com tampa entraram com preço; os outros 9 estão *sob consulta*: sem preço na tela,
o valor sai por orçamento no WhatsApp. Quando os preços chegarem, é
preencher `tiers` em cada um no `js/script.js` e o card passa a mostrar valor
e faixas sozinho.

O que este arquivo guarda a partir de agora são as **fichas técnicas**:
códigos de fornecedor, medidas, área de gravação e as ressalvas de cada
peça — informação que não cabe no card mas que você precisa na hora de
orçar.

Este arquivo mora FORA da pasta do site de propósito: ele tem códigos de
fornecedor, e a pasta `space-personalizados/` inteira vai para o ar no
GitHub Pages.

## Pendências que precisam de você

1. **Preço dos 9 sob consulta.** Enquanto não vierem, todos ficam como sob consulta.
2. **"Acima de 10"** nos copos: li como *a partir de 10*. Num pedido de
   exatamente dez copos a diferença é R$ 250.
3. **Kit churrasco de 5 peças:** cadastrei o novo (sem espetos) ao lado do
   antigo (com dois espetos). São SKUs diferentes. Se for para o novo
   substituir o antigo, é só dizer que eu tiro o velho.
4. **Caneca 350 ml:** falta a foto solta da cor **azul** (`#0e439a`), que só
   apareceu na foto de família. E a **versão sem alça** da mesma foto é outro
   produto — precisa de código, ficha e fotos próprias.
5. **Kit garrafa:** o fornecedor só informa a área de gravação **da
   embalagem**. Se a personalização for na garrafa, confirme a área.

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

## 8. Kit Garrafa Térmica 450 ml — cód. KIT18639

Fotos: `kit-garrafa-450-azul` `kit-garrafa-450-cinza` `kit-garrafa-450-inox` `kit-garrafa-450-preto` `kit-garrafa-450-rose` `kit-garrafa-450-verde` ✅

```js
{ id:'kit-garrafa-450', name:'Kit Garrafa Térmica 450ml', cat:'garrafas', ph:'garrafa',
  desc:'Garrafa em inox de 450 ml com base antiderrapante e duas tampas extras que viram xícaras. Acompanha sacola de papel com berço de papelão.',
  cores:[
    { id:'azul',  nome:'Azul',  hex:'#364c5d' },
    { id:'cinza', nome:'Cinza', hex:'#616462' },
    { id:'inox',  nome:'Inox',  hex:'#bfbeb8' },
    { id:'preto', nome:'Preto', hex:'#2c2d31' },
    { id:'rose',  nome:'Rosé', hex:'#d6b3a2' },
    { id:'verde', nome:'Verde', hex:'#7d9d80' }
  ],
  tiers:[[1, /* PREÇO */ ]] },
```

Ficha: 25,5 × 16 × 7,2 cm · 354 g
Gravação: embalagem 19 × 15,5 cm

Atenção na gravação: o fornecedor só informa medida **da embalagem**, não da
garrafa. Se a personalização for na garrafa, vale confirmar a área.

---

## 9. Garrafa Térmica 800 ml · Base de Silicone — preta

Foto: `assets/produtos/garrafa-800-silicone.webp` ✅ · **já no site, sob consulta**

Veio de print de anúncio do Mercado Livre: "Kit 50 Garrafa Térmica 800 Ml Com
Base Silicone Cor Preta", loja **Invictopresentes**, **R$ 1.399 o kit de 50**
(R$ 27,98 a unidade). O valor ficou fora do site a pedido.

É um modelo diferente da `garrafa-800` que já estava cadastrada: aquela tem
tampa com trava lateral; esta tem tampa com bico, alça na tampa e base de
silicone. Ficha do anúncio: exterior e interior em aço inox, cor preta.

A foto é a do anúncio dessa loja. Se tiver foto própria ou do fornecedor
direto, vale trocar.

---

## 10. Copo Térmico Long Neck 420 ml

Fotos: `copo-long-neck-preto` `copo-long-neck-amarelo` `copo-long-neck-turquesa` `copo-long-neck-laranja` `copo-long-neck-nude` `copo-long-neck-pink` `copo-long-neck-rosa` `copo-long-neck-roxo` ✅ · **já no site, COM PREÇO**

Veio de print de anúncio do Mercado Livre ("Copo Térmico Porta Long Neck
Cerveja Lata Inox Personalizado", R$ 49,90). É o "Copo long neck" da tabela
de preços que você mandou antes, que também começa em R$ 49,90 — entrou com
essa tabela: 49,90 · 39,99 a partir de 10 · 36,90 a partir de 50 · 35,99 a
partir de 100.

Ficha do anúncio: 420 ml · 19 cm de altura × 9 cm de largura · 1 suporte de
lata. A foto mostra tampa, anel de borracha e tampa-abridor de garrafa.

O anúncio tem **8 cores** e as **8 estão no site**, com seletor de cor:
preto, amarelo, azul-turquesa, laranja, nude, pink, rosa e roxo (os nomes
são os do anúncio).

O print do amarelo dizia "Cor: Nude" no rótulo, mas a bolinha marcada e a
foto eram amarelas — era o mouse passando sobre outra cor na hora do print.
Na foto do amarelo, o copo turquesa com cerveja da direita encostava no
copo; o canto dele (de y=355 para baixo, onde o copo já afinou) foi coberto
com o cinza do fundo antes do recorte.

O laranja veio de outra foto do anúncio (a de detalhe, com os círculos à
direita), com fundo cinza 238–241 que escurece até 223 em volta da base. O
recorte automático nunca corta abaixo de 238, então foi com o corte fixo em
216 (`limiar_fixo`), limpeza de sombra só na faixa de baixo e descartando os
pontinhos soltos (`so_maior`).

O nude é uma foto de frente, maior e mais nítida (a boca do copo não
aparece). A base de inox fica toda abaixo de 211 e a sombra de contato à
direita dela entre 230 e 237: corte fixo em 222.

O roxo veio da mesma foto de detalhe do laranja e saiu com os mesmos
ajustes: corte fixo em 216, sombra limpa só embaixo, pontinhos descartados.

A foto traz o carimbo "SUA LOGO AQUI" do anúncio. Numa loja de
personalização até funciona, mas é o selo de outra loja.

---

## 11. Garrafa Térmica LED 500 ml — preta

Foto: `assets/produtos/garrafa-led.webp` ✅ · **já no site, COM PREÇO**

Veio de print de anúncio do Mercado Livre ("Kit 10 Garrafas Térmica 500ml
Inox Termometro Digital Preto", loja **Invictopresentes**, **R$ 171,19 o kit
de 10** — R$ 17,12 a unidade). É a "Garrafa LED" da sua lista de preços:
49,00 · 29,90 a partir de 10 · 27,90 a partir de 50 · 25,90 a partir de 100.

**Não é a `garrafa-500`** que já estava no site (R$ 29,90, foto na mão com a
gravação da Klabin): as duas são pretas, finas e de 500 ml, mas você
confirmou que são produtos diferentes. As duas ficam no catálogo.

A foto mostra a garrafa e a tampa ao lado com o visor em "58°C"; o recorte
manteve as duas peças.

---

## 12. Copo Térmico 360 ml · Tampa Transparente — preto e branco

Foto: `assets/produtos/copo-360-tampa.webp` (as duas cores juntas) ✅ ·
**já no site, COM PREÇO**

Veio de print de anúncio do Mercado Livre ("Copo Térmico 360ml Personalizado
Com A Sua Arte", R$ 35). Entrou com a tabela de **"Copos 360ml"** da sua
lista: 49,99 · 24,90 a partir de 10 · 23,90 a partir de 50 · 22,90 a partir
de 100 — a mesma do `copo-360` que já estava no site.

**Não é o `copo-360`** que já estava lá: aquele tem formato de ovo, com o
fundo arredondado; este é reto, cônico, com aro de inox e tampa
transparente. O anúncio diz 360 ml no título e 350 ml na ficha.

A foto tem o preto na frente do branco, cobrindo a tampa e o aro dele: não
dá para recortar o branco sozinho. As duas bolinhas apontam para a mesma
foto (campo `foto` da cor) e a cor escolhida vai para o orçamento. O chão
refletido embaixo dos copos (cinza 226–245, igual ao corpo do branco) foi
apagado abaixo da linha de contato de cada copo com o chão, coluna por
coluna, e o vão entre os dois copos, linha por linha.

Se chegar uma foto de cada cor separada, é trocar para uma foto por cor.

**Foto de detalhe** (lupa): `copo-360-tampa-detalhe.webp`, a segunda foto do
anúncio — os dois copos abertos, com as tampas na frente. Ela não serve para
separar as cores porque cada tampa fica na frente da base do seu copo. O
selo "360 ml" do anúncio, um círculo chapado sobre o fundo liso, foi
coberto com a cor do fundo.

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
| Copo cuia | 49,99 | 29,90 | 28,90 | 25,90 |

```js
// prontos para colar assim que houver foto e descrição
{ id:'caneca-chopp-810', name:'Caneca Chopp 810ml',  cat:'copos',    ph:'caneca',
  desc:'', tiers:[[1,69.90],[10,49.90],[50,48.90],[100,45.90]] },
{ id:'copo-cuia',        name:'Copo Cuia',           cat:'copos',    ph:'copo',
  desc:'', tiers:[[1,49.99],[10,29.90],[50,28.90],[100,25.90]] },
```

---

## Fichas de produtos que JÁ estão cadastrados

Caso queira completar a descrição deles também.

**churrasco-2-caixa** (cód. 4564): inox e madeira · estojo 32,5 × 11,7 × 3,1 cm ·
faca 29,9 × 3,8 · garfo 28,5 × 2,3 · gravação estojo 9 × 31, faca 1,5 × 7,
garfo 1,5 × 7,5 · 223 g

**churrasco-4** (cód. 01644) e **churrasco-2-estojo**: descrições já atualizadas.

---

## Bordas quadradas nas fotos (corrigido)

- **Capa:** as 4 fotos têm fundo preto chapado e ocupavam 84% de um arco
  cinza-escuro, deixando um retângulo preto com cantos à vista. O arco
  passou a ser preto, da cor do fundo das fotos.
- **Peças na mão** (copo 473, copo 360, garrafas 500/800/alumínio, canecas
  alumínio/porcelana/700, canivete inox, chapéu, e as fotos 1, 3 e 4 da
  capa): o braço terminava num corte reto com canto quadrado. Agora some
  suave em direção ao corte — `esmaece_corte()` na ferramenta de recorte.
- **Caneca 350 ml branca:** a sombra do chão embaixo da base saiu.
