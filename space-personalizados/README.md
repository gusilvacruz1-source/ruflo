# SPACE PERSONALIZADOS — site

Site independente, 100% estático. **HTML + CSS + JavaScript puro.**
Sem React, sem Vue, sem three.js, sem build, sem npm. Abre o `index.html`
e funciona.

```
space-personalizados/
├── index.html          ← a página inteira
├── css/style.css       ← todo o design (variáveis em :root)
├── js/cup3d.js         ← o copo 3D, em WebGL cru
├── js/script.js        ← scroll, catálogo e orçamento
└── assets/produtos/    ← fotos dos produtos (opcionais)
```

---

## 1. O copo

A primeira tela é um copo térmico **modelado em código**. Não é vídeo, não é
foto, não é textura de foto: é geometria gerada em tempo de execução e
desenhada em WebGL cru, sem biblioteca nenhuma.

**A forma** é uma superfície de revolução. Um perfil 2D — parede externa,
lábio da borda, parede interna e a calota do fundo — gira em torno do eixo Y
em 168 divisões. O perfil inteiro está no topo de `js/cup3d.js`, em
`PROFILE_OUT`, `LIP` e `PROFILE_IN`: mexa nos números e o copo muda de
formato.

**O material** sai do shader. Inox acima de `BAND_TOP` e abaixo de
`BAND_BOT`, revestimento vermelho fosco no meio, e a parede interna sempre
metálica. As estrias do escovado dão a volta na peça, então aparecem
horizontais na silhueta — perturbar a reflexão por ângulo em vez de altura é
o que faz metal parecer plástico.

**A luz** também é código. `studio()` é um ambiente procedural: uma softbox
estreita e forte em cima à esquerda, uma segunda mais larga à frente, um
preenchimento frio do lado oposto e um recorte quente vindo de trás, que
separa o copo do fundo escuro. Nenhum HDR para baixar — o metal reflete um
estúdio que existe só como matemática.

**A gravação a laser** é desenhada num `<canvas>` 2D (a marca SPACE com o
planeta) e vira textura, aplicada só na faixa vermelha. Ela é reassada
quando a Manrope termina de carregar, senão sairia na fonte do sistema.

### O scroll

| Parte | O que acontece |
|---|---|
| 1 | A câmera orbita o copo 360° |
| 2 | Sobe acima da boca, inclina e desce para dentro |

No fim o interior escurece e o copo se dissolve, revelando o fundo da loja —
a ilusão é que a loja existe dentro do copo.

Tudo que vale editar está no `CONFIG`, no topo de `js/script.js`:

```js
sequences: {
  giro:     { scroll: 2800 },   // pixels de scroll da órbita
  mergulho: { scroll: 1800 }    // pixels de scroll do mergulho
},
fadeStart: 0.70,   // quando o interior começa a escurecer (0–1 do mergulho)
holdAfter: 320,    // respiro em pixels antes de soltar o palco
smoothing: 0.16    // inércia do scrub (0 = travado, 1 = sem inércia)
```

O caminho da câmera está em `Cup3D.camera()`, em `js/cup3d.js`. A distância
se ajusta sozinha à proporção da tela: num celular alto e estreito o campo
horizontal é bem menor, e a mesma distância do desktop estouraria o copo
para fora da tela.

**Sem WebGL** (navegador antigo, contexto perdido, driver sem `highp`), o
site cai numa prévia do copo desenhada em Canvas 2D. Nada a baixar, nada que
possa faltar.

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

O preço em destaque é sempre o do **pedido mínimo** — o de volume vira nota.
Anunciar R$ 2,25 num item cujo mínimo de 10 unidades custa R$ 4,00 é
anunciar um preço que o cliente não consegue.

### Fotos dos produtos

Enquanto não houver foto, cada card mostra uma arte SVG gerada na hora.
Basta colocar o arquivo em `assets/produtos/` com o id do produto
(ex.: `copo-473.jpg`) que ele entra sozinho — a lista completa está em
`assets/produtos/LEIA-ME.txt`.

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

O copo não depende de nenhuma das duas: é WebGL cru. Sem framework, sem
build, sem asset para faltar.
