# SPACE PERSONALIZADOS — site

Site independente, 100% estático. **HTML + CSS + JavaScript puro.**
Sem React, sem Vue, sem three.js, sem build, sem npm. Abre o `index.html`
e funciona.

```
space-personalizados/
├── index.html          ← a página inteira
├── css/style.css       ← todo o design (variáveis em :root)
├── js/script.js        ← abertura, catálogo e orçamento
└── assets/produtos/    ← fotos dos produtos (opcionais)
```

---

## 0. O sistema visual

O site segue a linguagem do estúdio Eloize Betim, adaptada para a loja:

- **Duas tintas.** `--ink` #0D0D0E e `--paper` #EFEDEA. O ouro da marca
  virou latão dessaturado (`--brass` #B08D57) e saiu de painel: só aparece
  em fio, número e num botão — é o papel que o taupe faz no original.
- **Bodoni Moda** no display, **Archivo** na interface.
- As **seções alternam tinta e papel** de ponta a ponta (`data-theme`), com
  o conteúdo num `.site-container` de 1320 px. O corte entre elas é seco.
- `.section` define o ritmo vertical **uma vez**; nenhuma seção sobrescreve.
- **Fio de 1px** separa blocos. Não existe cartão com borda e sombra.
- **Micro-rótulo** em caixa alta com entreletra de .22em, em poucos pontos.
- O **cabeçalho inverte** a cor sobre as faixas claras, decidido pela seção
  que está debaixo da barra.

Duas armadilhas de CSS que este layout encontrou, anotadas para não
voltarem: `backdrop-filter` e `transform` num elemento **fixo** criam bloco
de contenção para os descendentes fixos — com qualquer um dos dois na barra,
o menu de tela cheia passa a medir a barra em vez da janela e o
`translateY(-100%)` esconde só a altura dela. Os testes [19] e [20] da
suíte de regressão cobrem isso (ver seção 3).

## 1. A abertura

A primeira tela é uma capa: o papel de parede de nebulosa com a marca da
empresa no meio, ocupando exatamente uma tela de altura.

```
index.html   → section#cup > .cup__stage > .cup__hud
css/style.css → .cup, .cup__stage, .cup__marca
js/script.js  → o módulo Abertura
```

A imagem grande (`assets/fundo-copo.webp`) é o fundo do palco; a marca é o
`img#cupMarca`, que sai de `assets/marca.webp` — o mesmo arquivo em PNG com
alfa extraído do material da empresa. Ela é branca sobre transparente e a
nebulosa tem partes claras, então leva uma `drop-shadow` para não se
dissolver justo onde o gás acende.

Em tela estreita de densidade até 2x entram variantes menores das duas
imagens de fundo (`-p.webp`): 11 MB de bitmap em vez de 27. Aparelho de tela
densa continua recebendo as grandes.

### O que havia aqui antes

Um copo térmico modelado em código: superfície de revolução gerada em tempo
de execução, desenhada em WebGL cru sem biblioteca nenhuma, com iluminação de
estúdio por painéis retangulares, mesa giratória, gravação a laser com relevo
assado na textura e escala adaptativa de resolução. A rolagem prendia a
seção por quatro telas e meia enquanto a câmera dava a volta de 360° e depois
entrava pela boca do copo. Havia ainda um copo de reserva desenhado em Canvas
2D para quem não tivesse WebGL.

Saiu inteiro a pedido, junto com o `js/cup3d.js`: 1.140 linhas. Está no
histórico do git, se um dia fizer falta.

A barra de carregamento continuou, mas agora espera trabalho de verdade — a
marca e o papel de parede, decodificados. Sem o copo para construir não
existe mais progresso a fingir.

---

## 2. A loja

Todas as seções saem do array `PRODUCTS`, no `js/script.js`: são os
produtos reais do catálogo Space, com as faixas de preço por quantidade.

- **Hero** — "Não é tinta. É o metal.", slider de 4 fotos e o card do Copo
  Térmico, com o preço lido do catálogo
- **Diferenciais** — "Grave o que é seu" e o índice do catálogo por
  categoria, com a contagem de cada uma
- **Novos Brindes / Por Tipo** — filtros em pílula, 4 cards em destaque e
  paginação que percorre o catálogo inteiro
- **Mais Desejados** — 5.000+ copos vendidos e quatro abas que o catálogo
  responde sozinho: maior queda no lote, até R$ 30, acima de R$ 70 e kits
  de churrasco. O card grande mostra o 1º da aba; os dois atalhos ao lado,
  o 2º e o 3º
- **Catálogo completo** — todos os itens, com seletor de cor, foto de
  detalhe, quantidade e WhatsApp direto
- **Nossa História**, CTA final e rodapé

**Movimento:** inclinação 3D nos cards, brilho que segue o cursor, paralaxe
das manchas de luz, revelação palavra a palavra nos títulos e contadores
animados. Tudo desliga com `prefers-reduced-motion`.

### Cadastrar um produto

```js
{ id:'caneca-inox-180', name:'Caneca Inox 180ml', cat:'copos', ph:'caneca',
  desc:'Caneca em inox de 180 ml com cabo e tampa em plástico resistente.',
  tiers:[[1,19.90],[50,16.90]] }
```

`cat` é uma de `copos`, `garrafas`, `churrasco`, `canivetes`, `escritorio`,
`estilo`. `tiers` são as faixas `[a partir de quantas, preço da unidade]` e
a primeira começa sempre em 1: não há pedido mínimo em item nenhum.

A foto vai em `assets/produtos/<id>.webp`. Nada mais precisa ser mexido: a
contagem de itens, o índice por categoria e os filtros acompanham sozinhos.

### Produto sob consulta

Produto **sem** `tiers` não tem preço no site: o card diz "sob consulta" e o
valor sai por orçamento no WhatsApp. Ele entra no orçamento normalmente, mas
não na soma — a gaveta mostra "+ N itens sob consulta" junto da estimativa, e
a mensagem marca o item como "a combinar". As abas de preço dos Mais
Desejados deixam esses itens de fora.

### Produtos com variação de cor

```js
{ id:'caderneta', name:'Caderneta Couro Sintético', cat:'escritorio', ph:'caneta',
  desc:'...',
  cores:[
    { id:'preto',    nome:'Preto',    hex:'#433f42' },
    { id:'caramelo', nome:'Caramelo', hex:'#8c5633' }
  ] }
```

A foto de cada cor vai em `assets/produtos/<id>-<cor>.webp` — e aí **não**
existe `<id>.webp`. Onde o site precisa da foto de um produto sem saber a
cor (vitrine, card de destaque) ele usa a primeira cor da lista, pela função
`fotoDe`. Nunca monte o caminho da foto na mão.

Quando só existe uma foto com as cores juntas, a cor pode apontar para ela
com `foto`: `{ id:'branco', nome:'Branco', hex:'#e6e8ec', foto:'copo-360-tampa' }`
usa `assets/produtos/copo-360-tampa.webp`. A foto não muda ao trocar a
bolinha, mas a cor escolhida vai para o orçamento e para o WhatsApp.

No card aparecem as bolinhas; clicar troca a foto e guarda a escolha no
próprio card, de onde ADICIONAR e WHATSAPP leem na hora do clique.

**Cada cor é uma linha do orçamento.** A chave de um item é `id|cor`, então
duas cores da mesma caderneta são dois itens, e o nome da cor vai no texto
do WhatsApp — é o que a Space precisa para separar o pedido.

### Foto de detalhe

```js
{ id:'kit-garrafa-450', /* … */ detalhe: true }
```

A imagem vai em `assets/produtos/<id>-detalhe.webp` e o card ganha uma lupa.
Ela é **uma por produto**, não uma por cor; por isso trocar de cor com o
detalhe aberto fecha o detalhe, senão a bolinha diria "Verde" com a foto
mostrando o azul.

**Ela só é baixada quando alguém abre.** A camada nasce vazia e só recebe a
URL no primeiro clique. É um **botão**, não hover: hover não existe em
celular.

### Números e preços no texto

O texto corrido cita o catálogo ("26 itens", "o copo sai a R$ 49,99", o
índice por categoria). Nada disso é escrito à mão — foi escrito, e ficou para
trás assim que o catálogo cresceu. Quem cita o catálogo pergunta a ele:

```html
<span data-conta="produtos">26</span>              quantos itens no total
<span data-conta="copos" data-pad>09</span>         quantos numa categoria, 2 dígitos
<span data-preco="copo-473">R$ 49,99</span>         preço da unidade avulsa
<span data-preco="copo-473" data-qtd="50">…</span>  preço na faixa de 50
<span data-preco="copo-473" data-qtd="melhor">…</span>  o melhor preço
<span data-lote="copo-473">100</span>               quantas peças para o melhor preço
```

O número escrito no HTML fica só para quem abrir sem JavaScript.

### Orçamento pelo WhatsApp

O botão ORÇAMENTO abre uma gaveta lateral. O cliente escolhe produtos e
quantidades, o site calcula o preço unitário **na faixa certa** e monta uma
mensagem pronta para o WhatsApp `(42) 99134-3788`. Carrinho e favoritos
ficam salvos no navegador.

Aberta, a gaveta leva o foco para o X e deixa o resto da página `inert`; o
Esc fecha e devolve o foco a quem abriu. Fechada, ela mesma fica `inert`,
para o Tab não passear pelos botões invisíveis dela.

O preço em destaque é sempre o da **unidade avulsa** e o de volume vira nota.
Anunciar R$ 2,25 num chaveiro que só chega a esse preço em 500 peças é
anunciar um preço que o cliente não consegue.

### Prévia do link

O `<head>` tem `og:image` (`assets/compartilhar.jpg`, 1200×630: a nebulosa
com a marca no meio) e os dados da loja em JSON-LD. Os endereços são
**absolutos**, apontando para o GitHub Pages — o WhatsApp não busca imagem
por caminho relativo. Se o site mudar de endereço, é trocar o prefixo
`https://gusilvacruz1-source.github.io/ruflo/space-personalizados/` nas
metas do `<head>`.

### Fotos dos produtos

Ficam em `assets/produtos/`, recortadas com fundo transparente e enquadradas
em `contain`. Enquanto a foto não chega o card mostra só o tom liso dele — a
arte SVG gerada que existia antes saiu, porque aparecia antes da foto e
mostrava um desenho falso do produto. A lista de nomes está em
`assets/produtos/LEIA-ME.txt`.

**Atenção:** várias fotos mostram peças já gravadas com a marca, o Instagram
e o telefone de outros clientes.

---

## 3. Publicar: troque a versão

Toda foto, o CSS e o JS são pedidos com `?v=<versão>`, e a versão é a que
está no `index.html`, em `<script src="js/script.js?v=...">` (o CSS usa a
mesma). **A cada publicação que troca foto, CSS ou JS, mude esse número nos
dois lugares.** Sem isso, quem já visitou o site continua vendo a versão
antiga guardada no navegador, porque o nome do arquivo não mudou.

## 4. Rodar e testar

```bash
python3 -m http.server 8099    # depois abra http://localhost:8099
```

A suíte de regressão mora **fora** desta pasta, em
`space-personalizados-testes.mjs` na raiz do repositório — esta pasta vai
inteira para o ar e teste não é coisa de publicar. Com o servidor de pé:

```bash
node space-personalizados-testes.mjs
```

Precisa do Playwright com Chromium. Cada bug que já apareceu no site virou
uma asserção numerada, e o número aparece nos comentários do código.

## 5. Dependências

Uma só: **Google Fonts** (Bodoni Moda + Archivo). Se não carregar, cai na
fonte do sistema. Sem framework, sem biblioteca de animação, sem build.
