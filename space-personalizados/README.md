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
`translateY(-100%)` esconde só a altura dela. Os testes [19] e [20] cobrem
isso.

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

Dark mode com acento champagne, **vidro translúcido** de verdade
(`backdrop-filter` sobre uma camada de luz animada — desfocar preto liso não
produz vidro nenhum), tipografia **serifada de alto contraste** (Playfair
Display) com itálico de contraponto, contra Manrope no corpo. Bento grids
assimétricos, pílulas e cantos generosos.

Todas as seções usam os **18 produtos reais** do catálogo Space, com as
faixas de preço por quantidade exatamente como no PDF.

- **Hero** — título gigante, moldura fina com etiquetas de canto, card de
  vidro do Copo Térmico, slider de 4 telas
- **Bento** — "Personalize seu próprio brinde" + "Empresas que escolhem"
- **Novos Brindes / Por Tipo** — filtros em pílula, 4 cards em destaque e
  paginação que percorre o catálogo inteiro
- **Descubra os Mais Desejados** — contador 14.500+ e card de oferta
- **Catálogo completo** — os 18 itens num grid assimétrico de 12 colunas
- **Nossa História**, CTA final e rodapé

**Movimento:** inclinação 3D nos cards, brilho que segue o cursor, paralaxe
das manchas de luz, revelação palavra a palavra nos títulos e contadores
animados.

### Orçamento pelo WhatsApp

O botão ORÇAMENTO abre uma gaveta lateral. O cliente escolhe produtos e
quantidades, o site calcula o preço unitário **na faixa certa** e monta uma
mensagem pronta para o WhatsApp `(42) 99134-3788`. Carrinho e favoritos
ficam salvos no navegador.

**Não há pedido mínimo em item nenhum**: dá para comprar uma peça só, pelo
mesmo preço unitário da tabela. Os `tiers` de cada produto começam em 1, e as
faixas acima disso são descontos por volume, não exigências.

O preço em destaque é sempre o da **unidade avulsa** e o de volume vira nota.
Anunciar R$ 2,25 num chaveiro que só chega a esse preço em 500 peças é
anunciar um preço que o cliente não consegue.

### Fotos dos produtos

Os 18 produtos já usam as fotos do catálogo PDF, em
`assets/produtos/<id>.webp`, recortadas com alfa e enquadradas em `contain`
sobre um halo dourado. Para trocar uma, basta sobrescrever o arquivo com o id
do produto (ex.: `copo-473.webp`) — a lista completa está em
`assets/produtos/LEIA-ME.txt`. Se um arquivo faltar, o card cai sozinho numa
arte SVG gerada na hora.

**Atenção:** as fotos vieram do catálogo do fornecedor e várias mostram peças
já gravadas com a marca, o Instagram e o telefone de outros clientes.

---

## 3. Rodar

```bash
python3 -m http.server 8000    # depois abra http://localhost:8000
```

Abrir o `index.html` direto pelo arquivo também funciona.

## 4. Dependências

Duas, ambas por CDN e ambas com plano B:

- **GSAP + ScrollTrigger** — se o CDN não carregar, o scroll cai num
  fallback nativo com a mesma matemática.
- **Google Fonts** (Playfair Display + Manrope) — se não carregar, cai na
  fonte do sistema.

A abertura não depende de nenhuma das duas: é uma imagem de fundo e um
`<img>`. Sem framework, sem build, sem asset que possa faltar.
