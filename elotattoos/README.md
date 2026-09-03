# Site — Estúdio Eloize Betim (@elotattoos_)

Landing page one-page para a tatuadora Eloize Betim. HTML, CSS e JS puros,
sem framework e sem build. É só abrir o `index.html` no navegador.

## Isolamento

Esta pasta é **totalmente separada** do resto do repositório. Nada aqui
importa, sobrescreve ou depende de `/index.html`, `/css`, `/js` ou de
`/lojinha-kerollay`. O `netlify.toml` da raiz **não foi alterado** — ele
continua publicando só a lojinha da Kerollay.

**Nada deste site foi publicado em lugar nenhum.** Não há deploy, não há
site novo no Netlify, não foi gasto saldo de build. Para ver, abra local:

```
# opção 1 — clique duplo
elotattoos/index.html

# opção 2 — servidor local (recomendado, evita bloqueio de fonte)
cd elotattoos && python3 -m http.server 8080
# depois: http://localhost:8080
```

## Estrutura

```
elotattoos/
  index.html
  assets/css/main.css        tokens, reset, container, tipografia, componentes
  assets/css/sections.css    estilos por seção + responsivo
  assets/js/main.js          Lenis, GSAP, header, accordion, animações
  assets/js/gallery.js       filtros (FLIP) e lightbox
  assets/img/                imagens — ver assets/README.md
```

Dependências externas (todas por CDN, com `defer`): GSAP, ScrollTrigger,
Lenis e as fontes Bodoni Moda + Archivo do Google Fonts. Mais nada.

---

## ⚠️ Pendências — o que precisa vir da Eloize

Tudo que está marcado `[CONFIRMAR]` aparece **visível na página**, de
propósito, para não passar batido. Nada foi inventado.

### Dados do estúdio
1. ~~Cidade/UF~~ — ✅ **Imbaú, PR**, já aplicado no hero, no `<title>`,
   no CTA, no rodapé e no JSON-LD.
2. **Bairro** do atendimento — CTA final e rodapé mostram só a cidade.
3. **Dias e horários** de atendimento — CTA final, rodapé e JSON-LD.
4. **Endereço completo, CEP e telefone** — só para o JSON-LD (SEO local).
5. **Domínio final** — hoje está `elotattoos.com.br` como exemplo na
   canonical e no Open Graph.

### WhatsApp (importante)
6. **Número com DDD** — preencher `WA.numero` no topo de `assets/js/main.js`,
   no formato `'5542988084236'` (55 + DDD + número, só dígitos).
   Enquanto estiver vazio, todos os botões usam o link curto da bio
   (`wa.me/message/GSIOOPZYE2W7G1`), que funciona **mas não abre a conversa
   com a mensagem pronta**. A reserva de arte só cita o nome da peça
   depois que o número for preenchido.

### Conteúdo
7. **Ano em que começou a tatuar** — texto do "Sobre".
8. **Anos tatuando** e **tatuagens feitas** — dois dos quatro números.
   (Os outros dois já estão certos: 5.9K do Instagram e 1 atendimento por vez.)
9. **Política de sinal** — etapa 02 do "Como funciona".
10. **Normas da vigilância sanitária** e **marcas de tinta/agulha** —
    seção de segurança.
11. **Protocolo de cuidados**: primeiras 24h, como higienizar, prazo de
    cicatrização e política de retoque.
12. **Três depoimentos reais** de clientes (frase + primeiro nome + região
    do corpo). Hoje estão como placeholder.
13. **Respostas do FAQ**: atende homens (na voz dela), acompanhante,
    cover-up/cobertura de cicatriz, formas de pagamento.
14. **Artes disponíveis**: nome, tamanho em cm e status (disponível ou
    reservada) de cada uma das 8 peças. Hoje estão como "Arte 01…08";
    as duas últimas aparecem como reservadas só para mostrar o estado
    visual — **isso precisa ser corrigido com a informação real**.

### Fotos e vídeo
15. **Faltam 27 arquivos de imagem** — ver `assets/README.md` com os nomes e
    as dimensões. O mais importante é o **`hero-eloize.webp`: o retrato da
    Eloize**, que é o que vai dentro do arco do hero.
16. ~~Vídeo de fundo do hero~~ — ✅ **pronto.** `hero-fundo.mp4`, 717 KB,
    H.264, convertido do `.mov` do iPhone. O poster `hero-fundo.webp` saiu
    de um frame dele. É o fundo da seção; **não** é o que vai no arco.

---

## Decisões que fugiram do briefing (e por quê)

- **FLIP feito à mão** em vez do plugin `Flip` do GSAP. O efeito é o mesmo
  (medir → aplicar filtro → medir → animar a diferença), mas evita uma
  dependência a mais e o risco do plugin não estar no CDN. ~30 linhas em
  `gallery.js`.
- **Placeholders em CSS**, não arquivos `.webp` falsos. O briefing pedia
  retângulo em `--paper-deep` com o nome do arquivo — é exatamente o que
  aparece, mas sem commitar imagem binária de mentira. Quando o arquivo
  real chega na pasta, ele assume o lugar sozinho.
- **Grão em camada única de verdade.** Em vez de repetir a textura em cada
  seção escura, há uma só camada fixa cuja opacidade vai a 0 quando a
  seção ativa é clara. Uma camada, `pointer-events: none`, como pedido.
- **Transição ink → paper na seção de estilos** feita com corte seco de
  cor (`linear-gradient` com hard stop), não com degradê — o briefing
  proíbe gradiente colorido, e isso é um corte tonal, não um degradê.
- **3 rabiscos, não 4.** O briefing permite até 4; usei os três que o
  próprio briefing localiza (círculo no "só seu", seta entre a etapa 03
  e a 04, sublinhado no botão do CTA). Não achei um quarto lugar onde
  ele estivesse enfatizando algo de verdade.
- **Escala própria para o título do hero** (`clamp(4.75rem, 13.2vw, 11rem)`),
  maior que o `--fs-display` do briefing. Com o valor original o nome ocupava
  74% do container; o briefing também exige "ocupando a largura inteira do
  container", e essa é a exigência visual que a referência mostra. O
  `--fs-display` original continua valendo para o logotipo do rodapé.
- **`--muted` escurecido** para `#6E6A64` (`--muted-dark`) quando está
  sobre fundo claro. O `#8B8781` original não passa 4.5:1 sobre
  `--paper`, que o próprio briefing apontou como ponto de risco.


---

## O que foi testado (e o que não foi)

Testado em Chromium headless, em 360 / 480 / 768 / 1024 / 1440px:

- **Zero scroll horizontal** em todos os cinco tamanhos, inclusive 360px.
- **Nada fica invisível se o JS falhar.** O teste rodou com os CDNs
  bloqueados (sem GSAP, sem Lenis, sem Google Fonts) e a página apareceu
  inteira, legível e navegável. É o requisito do briefing.
- **Interações, uma a uma:** filtros da galeria (categoria certa,
  `aria-pressed`), lightbox (abre, foco vai pro botão fechar, trava o
  scroll, seta troca a foto, Esc fecha e devolve o scroll), accordion
  (`aria-expanded`, altura, um item aberto por vez), drawer mobile
  (abre e fecha no Esc), e os 11 links de WhatsApp. 16/16 passaram, sem
  nenhum erro de JS no console.
- **Contraste** conferido no cálculo WCAG: `--muted-dark` dá 5.43:1 sobre
  `--paper` e 4.77:1 sobre `--paper-deep`; `--muted` dá 5.44:1 sobre
  `--ink`. Todos acima de 4.5:1.

**Não testado:** a camada de animação (GSAP + ScrollTrigger + Lenis) e as
fontes do Google. A rede deste ambiente bloqueia cdnjs, jsdelivr e
fonts.googleapis.com, então o código dessas animações foi escrito e
revisado, mas não rodou em navegador. Vale conferir ao abrir na sua
máquina: entrada do hero, revelação dos títulos, count-up dos números,
parallax, rabiscos e o deslize das fotos ao trocar de filtro.

### Bugs encontrados e corrigidos durante o teste
1. `.stat` com `[CONFIRMAR]` em Bodoni gigante estourava a coluna e criava
   scroll lateral em 4 dos 5 breakpoints.
2. `.drawer { display: grid }` vencia o atributo `hidden` — o menu mobile
   cobria a página inteira no desktop.
3. `z-index: 1` na `.hero__photo` criava contexto de empilhamento e
   prendia o arco atrás do título, matando o efeito principal do hero.
4. No mobile, `position: static` na `.hero__photo` fazia as camadas
   internas se posicionarem pelo `.hero__inner` e cobrirem a tela.
5. O tema do header dependia do ScrollTrigger: se o CDN caísse, o header
   ficava escuro sobre as seções claras. Agora é JS nativo.
