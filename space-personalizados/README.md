# SPACE PERSONALIZADOS — site

Site independente, 100% estático. **HTML + CSS + JavaScript puro.**
Sem React, sem Vue, sem build, sem npm. Abre o `index.html` e funciona.

```
space-personalizados/
├── index.html          ← a página inteira
├── css/style.css       ← todo o design (variáveis em :root)
├── js/script.js        ← canvas, ScrollTrigger, catálogo e orçamento
├── frames/
│   ├── giro/           ← PARTE 1: o copo girando 360°
│   └── mergulho/       ← PARTE 2: a câmera entrando no copo
└── assets/produtos/    ← fotos dos produtos (opcionais)
```

---

## 1. A animação do copo

A primeira tela é um `<canvas>` em tela cheia preso no scroll (scroll-jacking).
Duas sequências de imagens rodam em sequência contínua, sem corte:

| Parte | Pasta | O que acontece |
|---|---|---|
| 1 | `frames/giro/` | O copo dá uma volta completa de 360° |
| 2 | `frames/mergulho/` | A câmera sobe e entra no copo |

No último quadro o interior escurece e faz fade **exato** para a cor de fundo
da loja (`#0d0d0d`) — a ilusão é que a loja existe dentro do copo.

### Os quadros já estão instalados

**120 quadros** em `frames/giro/` e **60** em `frames/mergulho/`, WebP com
canal alfa, 720x1280, 3,8 MB no total. Vieram do vídeo do copo vermelho.

O fundo foi **recortado**: o copo aparece flutuando sobre o fundo animado do
site, sem cozinha, sem piso, sem parede. O recorte é feito por chave de cor
no corpo vermelho (H≈173, S≈235 — medido no próprio vídeo) mais detecção
geométrica das faixas de inox, que não dá para separar por cor porque a
parede clara tem a mesma saturação baixa. Os quadros também foram
estabilizados: cada um é deslocado para deixar o copo centrado, o que
transforma o vídeo de mão num turntable de estúdio.

A órbita sai de uma **tomada contínua** (6,78s → 11,0s) que desemboca direto
no mergulho: sem emenda no meio e sem a mão que cruzava a cena por volta dos
6 segundos.

A estabilização é condicional: o copo é filmado colado nas bordas e em boa
parte dos quadros já sai da tela. Centrar um quadro desses empurraria a
parte cortada para o meio e o copo pareceria fatiado — então só os quadros
em que ele cabe inteiro são deslocados, e nunca no eixo vertical, onde o
corte lê como close e não como defeito.

### Para trocar por outro vídeo

Jogue os arquivos dentro de `frames/giro/` e `frames/mergulho/`. Só isso.
O site detecta sozinho o nome, a extensão, o número de dígitos e a
quantidade de quadros. Todos estes formatos funcionam:

```
giro_0001.webp   0001.jpg   001.png   frame_0001.jpg   ezgif-frame-001.png
```

Se as pastas ficarem vazias, o site desenha um copo de inox em Canvas 2D
como prévia, com um aviso discreto na tela.

Para fatiar um vídeo novo:

```bash
ffmpeg -i giro.mp4     -vf "fps=12,scale=-2:1280" -c:v libwebp -q:v 70 frames/giro/giro_%04d.webp
ffmpeg -i mergulho.mp4 -vf "fps=30,scale=-2:1280" -c:v libwebp -q:v 70 frames/mergulho/mergulho_%04d.webp
```

Se preferir fixar tudo na mão, renomeie `frames/manifest.example.json` para
`frames/manifest.json` — o preloader usa ele como caminho rápido.

### Ajustando a duração

Tudo fica no topo de `js/script.js`, no bloco `CONFIG`:

```js
sequences: {
  giro:     { dir: 'frames/giro/',     scroll: 2800 },  // pixels de scroll
  mergulho: { dir: 'frames/mergulho/', scroll: 1800 }
},
fadeStart: 0.70,   // quando o interior começa a escurecer (0–1 do mergulho)
holdAfter: 320,    // respiro em pixels antes de soltar o pin
smoothing: 0.16,   // inércia do scrub (0 = travado, 1 = sem inércia)
zoom: 1.12         // tamanho do copo na tela durante o giro
```

**Detalhes técnicos:** o enquadramento é calculado na matemática — `contain`
(`Math.min(W/iw, H/ih)`) durante o giro, interpolando até `cover`
(`Math.max`) no mergulho, que é o que faz o interior tomar a tela ao entrar.
A imagem nunca estica nem achata. O canvas respeita `window.devicePixelRatio`
(limitado a 2.5×) para ficar nítido em Retina e celular; o preloader só
libera o ScrollTrigger com **100% dos quadros em cache**, com prazo em toda
sondagem e um watchdog de 25s para nunca prender a página; e o redesenho roda
em `requestAnimationFrame` com interpolação, estacionando quando o copo sai
da tela.

---

## 2. A loja

Layout de e-commerce dark com **vidro translúcido** (`backdrop-filter` sobre
uma camada de luz animada), tipografia **serifada de alto contraste**
(Playfair Display) contra uma sans limpa (Manrope), bento grids assimétricos
e pílulas.
Todas as seções usam os **18 produtos reais** do catálogo Space, com as
faixas de preço por quantidade exatamente como no PDF.

- **Hero** — título gigante em serifada editorial, moldura fina com etiquetas
  de canto, card de vidro do Copo Térmico, slider de 4 telas
- **Bento** — "Personalize seu próprio brinde" + "Empresas que escolhem"
- **Novos Brindes / Por Tipo** — filtros em pílula e 4 cards em destaque
- **Descubra os Mais Desejados** — contador 14.500+ e card de oferta
- **Catálogo completo** — os 18 itens com faixas de preço e seletor de quantidade
- **Nossa História**, CTA final e rodapé

### Orçamento pelo WhatsApp

O botão ORÇAMENTO abre uma gaveta lateral. O cliente escolhe produtos e
quantidades, o site calcula o preço unitário **na faixa certa** e monta uma
mensagem pronta para o WhatsApp `(42) 99134-3788`. O carrinho e os favoritos
ficam salvos no navegador.

### Fotos dos produtos

Enquanto não houver foto, cada card mostra uma arte SVG gerada na hora.
Basta colocar o arquivo em `assets/produtos/` com o id do produto
(ex.: `copo-473.jpg`) que ele entra sozinho — veja a lista completa em
`assets/produtos/LEIA-ME.txt`.

---

## 3. Rodar

```bash
# qualquer servidor estático serve
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Abrir o `index.html` direto pelo arquivo também funciona, mas um servidor
local é melhor porque a descoberta automática dos frames usa requisições HTTP.

## 4. Dependências

Só duas, ambas por CDN e ambas com plano B:

- **GSAP + ScrollTrigger** — se o CDN não carregar, o scroll cai num
  fallback nativo com a mesma matemática.
- **Google Fonts** (Syne + Plus Jakarta Sans) — se não carregar, cai na
  fonte do sistema.

O resto é tudo local. Nenhum framework, nenhum build.
