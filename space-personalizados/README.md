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

### Ainda não gravou o copo?

Não tem problema: **o site já funciona agora.** Enquanto as pastas estiverem
vazias, ele desenha um copo de inox em Canvas 2D — giro, reflexos metálicos,
gravação a laser orbitando o corpo e o mergulho pela boca. Um aviso discreto
aparece na tela dizendo que está em modo prévia.

### Quando gravar

Jogue os arquivos dentro de `frames/giro/` e `frames/mergulho/`. Só isso.
O site detecta sozinho o nome, a extensão, o número de dígitos e a quantidade
de quadros. Todos estes formatos funcionam:

```
giro_0001.webp   0001.jpg   001.png   frame_0001.jpg   ezgif-frame-001.png
```

Para fatiar o vídeo:

```bash
ffmpeg -i giro.mp4     -vf "fps=30,scale=1920:-1" -q:v 3 frames/giro/giro_%04d.jpg
ffmpeg -i mergulho.mp4 -vf "fps=30,scale=1920:-1" -q:v 3 frames/mergulho/mergulho_%04d.jpg
```

Se preferir fixar tudo na mão, renomeie `frames/manifest.example.json` para
`frames/manifest.json` — o preloader usa ele como caminho rápido.

### Ajustando a duração

Tudo fica no topo de `js/script.js`, no bloco `CONFIG`:

```js
sequences: {
  giro:     { dir: 'frames/giro/',     scroll: 2400 },  // pixels de scroll
  mergulho: { dir: 'frames/mergulho/', scroll: 2000 }
},
fadeStart: 0.82,   // quando o interior começa a escurecer (0–1 do mergulho)
holdAfter: 320,    // respiro em pixels antes de soltar o pin
smoothing: 0.16    // inércia do scrub (0 = travado, 1 = sem inércia)
```

**Detalhes técnicos:** o `cover` do canvas é calculado na matemática
(`Math.max(W/iw, H/ih)`), então a imagem nunca estica nem achata; o canvas
respeita `window.devicePixelRatio` (limitado a 2.5×) para ficar nítido em
Retina e celular; o preloader só libera o ScrollTrigger com **100% dos frames
em cache**; e o redesenho roda em `requestAnimationFrame` com interpolação.

---

## 2. A loja

Layout de e-commerce dark, bento grids, pílulas e glassmorphism.
Todas as seções usam os **18 produtos reais** do catálogo Space, com as
faixas de preço por quantidade exatamente como no PDF.

- **Hero** — título gigante, card flutuante do Copo Térmico, slider de 4 telas
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
