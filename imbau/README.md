# Imbaú Imobiliária — landing page

Página única em React + Vite + Tailwind CSS, no sistema visual portado do
estúdio Eloize: preto e branco, Bodoni em caixa alta, fotos tratadas.
O escuro aparece quatro vezes — a capa, a vitrine de imóveis, a visita e o
rodapé; o resto respira no claro.

A ordem das seções é: primeira dobra → serviços → imóveis → sobre a corretora →
chamada para avaliação → dúvidas frequentes → contato → rodapé.

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera a pasta dist/, pronta para publicar
npm run preview  # confere o build antes de subir
```

O build usa caminhos relativos, então a pasta `dist/` funciona tanto na raiz do
domínio quanto dentro de um subdiretório.

## Onde mexer

Quase tudo que muda no dia a dia está em **`src/conteudo.js`**: telefone,
CRECI, redes, textos das seções, benefícios e a lista de imóveis. Os
componentes só leem esse arquivo.

| Bloco em `conteudo.js` | O que controla |
| --- | --- |
| `marca`, `mensagens` | Contatos e o texto que cada botão manda no WhatsApp |
| `hero` | Primeira dobra: título, texto e os três pilares sobre a foto |
| `servicos` | Os sete serviços e as quatro etapas do atendimento |
| `imoveis`, `vitrine` | A carteira que aparece na vitrine |
| `sobre` | Citação, ficha da corretora e o convite para conversar |
| `avaliacoes` | Nota e depoimentos copiados do perfil no Google |
| `chamada` | Bloco claro da avaliação gratuita |
| `perguntas` | As dúvidas frequentes (abre e fecha na página) |
| `contato` | Canais, endereço e as opções do montador de mensagem |

### Avaliações do Google

Os três depoimentos e a nota vêm do perfil da Imobiliária Imbaú no Google. Os
dois primeiros aparecem cortados lá ("… Mais") — no site entra só o trecho que
dá para ler por inteiro, sem uma palavra reescrita. Se surgir avaliação nova,
copie o texto do Google e atualize `nota` e `quantidade` junto.

O endereço e o telefone também estão em `index.html`, num bloco
`application/ld+json`, para o Google ler a ficha direto do site. As avaliações
**não** entram nesse bloco de propósito: são do Google, e marcá-las como se
fossem do próprio site vai contra as regras dele.

### O montador de mensagem

Na seção de contato a pessoa escolhe o que quer (comprar, vender, alugar…), o
tipo de imóvel, o nome e um detalhe. O texto é montado por `montarMensagem` em
`src/conteudo.js` e abre no WhatsApp já escrito — não existe formulário nem
servidor por trás, nada some se ninguém responder.

Para incluir uma opção nova, acrescente a palavra em `contato.objetivos` ou
`contato.tipos` **e** a conjugação dela nos dois dicionários dentro de
`montarMensagem` (`acoes` e `bens`). Sem isso a frase sai genérica.

### O cartão do imóvel

A foto ocupa metade do cartão, não o cartão inteiro — e isso é sobre
nitidez, não sobre gosto. As fotos da carteira têm 828 px de largura;
esticadas para os 1.190 px do cartão elas apareciam ampliadas **1,44×**, e
nenhum efeito devolve o que a ampliação come. No arranjo atual elas aparecem
a 0,68–0,76× do tamanho original, que é onde foto digital fica mais nítida.

Se um dia entrarem fotos maiores (1600 px ou mais), dá para dar mais espaço
à imagem sem perder nada. Até lá, o limite é ela.

O lado da foto alterna a cada cartão: três cartões idênticos empilhados leem
como repetição.

### Publicar um imóvel novo

1. Coloque a foto em `public/imagens/` (JPG ou WebP, de preferência com pelo
   menos 1600 px de largura).
2. Copie um bloco de `imoveis` em `src/conteudo.js`, troque os textos e aponte
   `imagem` para o arquivo novo.
3. Ainda sem foto? Use `'imagens/imovel-sem-foto.svg'`.

Cada botão abre o WhatsApp com uma mensagem diferente, escrita em
`mensagens` — assim quem atende já sabe de onde veio o contato e sobre qual
imóvel a pessoa quer falar.

## Imagens

| Arquivo | O que é |
| --- | --- |
| `imagens/casa-210m2-*.webp`, `imagens/casa-122m2.webp`, `imagens/imovel-rural-1723m2.webp` | Fotos reais dos anúncios do perfil `@imobiliaria.imbau` |
| `imagens/hero-lago.svg` | Fundo da primeira dobra — cena ilustrativa, **não é um imóvel da carteira** |
| `imagens/imovel-sem-foto.svg` | Reserva para imóvel anunciado antes da sessão de fotos |
| `imagens/og.jpg` | Prévia que aparece ao compartilhar o link no WhatsApp — **gerada da própria página**, em 2400×1260 (a proporção 1,91:1 do cartão). Para refazer depois de mudar a primeira dobra, fotografe a janela em 1200×630 com o menu e o indicador de rolagem escondidos. |
| `marca/imbau-simbolo.png` | Símbolo da marca, recortado do logotipo original |

As fotos vieram de prints do Instagram, então estão em 828 px de largura. Se a
Raquel tiver os arquivos originais, vale substituir — a nitidez melhora bastante
nos cartões grandes.

O fundo da hero e a imagem de reserva são gerados por `tools/make-art.mjs`
(`node tools/make-art.mjs`). Se um dia entrar uma fotografia noturna de verdade,
é só trocar `hero.imagem` em `src/conteudo.js`.

## Documentação visual

`docs/estrutura.excalidraw` traz o mapa da página — a capa presa, as seções
que passam por cima dela e o que é claro e o que é escuro. Abra em
[excalidraw.com](https://excalidraw.com) para editar. É gerado por `node tools/faz-diagrama.mjs`, e não à mão: montar
esse JSON manualmente é como se esquece uma ligação e a seta descola da caixa
no primeiro arrasto.

## Peso e leitura

**A visita só baixa quando chega perto.** São 1,25 MB de quadros no celular;
carregados na abertura, eram 92% do peso da página competindo com a primeira
dobra — numa rede lenta a pessoa esperava a visita para ver a capa. Agora um
`IntersectionObserver` com duas telas de antecedência dispara a fila, e os
quadros vão com `fetchPriority: 'low'`. Medido: **1.362 KB → 112 KB** antes
da primeira rolagem, e 97 dos 160 quadros já prontos quando a seção aparece.

**O contraste é medido, não estimado.** As cores do Tailwind v4 saem em
`oklab()`, então a conferência resolve cada uma pintando num canvas — é a
única conversão em que dá para confiar sem reimplementar o espaço de cor. A
primeira medição achou 28 trechos abaixo do mínimo, quase todos rótulos de
11px em maiúsculas: o texto mais difícil da página tinha o menor contraste.

Os pisos que saíram da medição, para quem for mexer nas opacidades:

| Texto pequeno | Piso |
| --- | --- |
| escuro sobre o creme | opacidade **60%** |
| claro sobre o escuro | opacidade **55%** |

**Sem JavaScript a página não fica em branco.** O site é um aplicativo, e o
CSS também chega pelo pacote — então o `<noscript>` no `index.html` leva
estilo embutido e o essencial: quem é, o WhatsApp, o Instagram e o endereço.

## Antes de publicar

- [ ] Confirmar com a Raquel se os três imóveis seguem disponíveis.
- [ ] Confirmar de qual imóvel é a filmagem da visita, se ele segue disponível
      e se pode ser publicado — e ajustar `visita.alt` com o nome dele.
- [ ] Ler com ela as respostas de `perguntas` e as descrições de `servicos`:
      foram escritas a partir da placa e do perfil, mas quem responde é ela.
- [ ] Fechar o horário de atendimento: o Google só mostra que abre às 8h, então
      `contato.horario` diz apenas isso. Com os dias e o fechamento em mãos,
      atualize o texto e acrescente `openingHoursSpecification` ao bloco
      `ld+json` de `index.html`.
- [ ] Decidir o nome: o Google registra **Imobiliária Imbaú** e o site assina
      **Imbaú Imobiliária**. Vale alinhar os dois — ajuda quem procura.
- [ ] Trocar o domínio em `og:image` e no `link rel="canonical"` (`index.html`)
      se o endereço final não for `imobiliariaimbau.com.br`.
- [ ] Substituir as fotos pelos arquivos originais, se existirem.

## O sistema visual

Portado do site do estúdio Eloize (`elotattoos`), que é do mesmo autor e está
neste repositório, na branch `loja-kerollay`. Mesmos valores, não parecidos.

| | |
| --- | --- |
| Escuro | `#0d0d0e` fundo, `#17181a` bloco |
| Claro | `#efedea` papel, `#e2dfdb` papel fundo |
| Detalhe | taupe `#b9afa5` — e só |
| Display | **Bodoni Moda**, caixa alta, entrelinha 0,84 na capa |
| Interface | **Archivo** |
| Foto de imóvel | `contrast(1.05) saturate(1.04)` — em cor |
| Vídeo de fundo da capa | `grayscale(1) contrast(1.04)` |
| Botões | pílula de contorno que inverte no hover; **um** botão cheio na página |

Duas escolhas que valem entender antes de mexer:

**Foto de imóvel vai em cor.** No estúdio Eloize o preto e branco unifica
tatuagens de origens diferentes, e cheguei a aplicar o mesmo aqui — mas numa
imobiliária a cor é conteúdo: telhado, revestimento, jardim, o carro na
garagem. O que se ganha em coesão não paga o que se perde em informação.
Ficou um reforço leve de contraste e saturação (`.foto`), que ainda dá alguma
unidade a imagens de câmeras e dias diferentes sem tirar cor delas.

O único tratamento pesado que sobrou é o vídeo atrás do título da capa
(`.foto-cenario`): ali a imagem não é conteúdo, é fundo, e dessaturar é o que
segura a legibilidade da Bodoni clara por cima.

**A Bodoni precisa de tamanho.** Ela tem contraste altíssimo entre a haste
grossa e a fina — é o que dá o ar de revista, e é o que a faz sumir quando
usada pequena. Por isso ela só aparece em título; texto, rótulo e botão são
Archivo.

### A capa

Montada como a do estúdio Eloize, peça por peça:

- **Fundo**: a própria filmagem em laço, sem som (`capa-fundo.mp4`, 7 s,
  797 KB), com `capa-fundo.webp` de poster — se o vídeo não tocar, o poster
  fica no lugar dele e nada quebra.
- **Nome em duas palavras**, lado a lado, ocupando a largura do container.
  Elas quebram sozinhas quando não cabem, sem media query.
- **Arco à direita**, por cima das letras — `border-radius: 50vw 50vw 20px 20px`
  sobre a foto da varanda, que por acaso tem arcos de verdade.
- **A cópia recortada do título**, desenhada acima do arco: é o que faz as
  letras reaparecerem abaixo da cúpula, com uma imagem só. O recorte
  (`--corte`) é a distância do topo do título até a base da cúpula, medida
  em JavaScript porque depende da largura da tela. Sem JavaScript ela fica
  escondida e o arco simplesmente cobre as letras.

Um valor precisou mudar em relação ao original: o piso da escala do título.
Lá é 4,75 rem, medido para "ELOIZE" e "BETIM"; aqui a palavra mais longa tem
onze letras e estourava a largura no celular. Desceu para 2,45 rem — conferido
de 390 a 1920 px.

## Largura e alinhamento## Largura e alinhamento

Existe **um** container de conteúdo, `.site-container`, com 1320 px de teto e
o recuo lateral definido num lugar só (`src/index.css`). Toda seção usa ele —
e nenhuma inventa a própria largura. É o que mantém o logotipo, os títulos e
os textos começando exatamente na mesma coluna do topo ao rodapé.

A divisão de responsabilidade é o que sustenta a regra:

- a **seção** cuida do espaço vertical e da cor de fundo;
- o **container** cuida da largura e do recuo lateral;
- a **placa** (`.placa`, 1520 px) é a folha em que o site se apoia — moldura,
  não conteúdo, e por isso mais larga que o container.

Precisa de algo mais estreito (um texto corrido, um formulário)? Aninhe um
limite de medida dentro do container, nunca um segundo container. Precisa
sangrar até a borda (o bloco escuro dos imóveis)? Fica fora do container, com
o container por dentro dele.

## A visita

O capítulo III é a filmagem de um imóvel percorrida pela rolagem: 160 quadros
desenhados num canvas, avançando conforme a pessoa desce a página. Não é um
`<video>` com `currentTime` — Safari e iOS não fazem busca exata de quadro sob
rolagem e devolvem um vídeo que engasga. A sequência é exata por construção.

### Trocar a filmagem

```bash
# precisa de ffmpeg e ffprobe no PATH
bash ../.agents/skills/video-to-website/scripts/extrai-frames.sh \
  filmagem.mov public/visita 160
```

O script gera `public/visita/desktop/` (160 quadros, 1440 px) e
`public/visita/mobile/` (80 quadros, 800 px), e imprime o peso de cada
conjunto. Depois, acerte `total` de cada um em `visita.conjuntos`, em
`src/conteudo.js` — se o número não bater, a visita termina antes ou depois
do fim da rolagem.

Os tetos são 6 MB no desktop e 2,5 MB no celular. No celular o limite não é a
banda: um quadro decodificado ocupa `largura × altura × 4` bytes, comprima-se
o quanto for, e é isso que derruba a aba no iPhone. Por isso o conjunto de lá
é menor de verdade, e não o mesmo com qualidade pior.

## Fluidez e as caixas

**A rolagem tem inércia.** O navegador rola em degraus — cada giro da roda
salta um bloco de pixels. Com o Lenis (`src/componentes/Rolagem.jsx`) a
posição persegue o destino a cada quadro, com desaceleração. É o que faz a
capa, os planos da cena e a visita parecerem uma coisa só em movimento, em
vez de três coisas reagindo a saltos. Os links de âncora do menu e da lombada
passam pelo mesmo caminho, senão o salto instantâneo romperia justamente a
continuidade que a inércia cria.

Como a rolagem já chega suavizada, a perseguição interna da visita ficou mais
direta (0,32 em vez de 0,2): dois amortecimentos em série viram atraso.

**As caixas respondem ao cursor.** `src/componentes/Caixa.jsx` inclina o
elemento na direção do ponteiro e o eleva um pouco. Está nas etapas do
atendimento, nos cartões de imóvel e nos depoimentos — dez caixas ao todo.

Três decisões que valem saber, se for mexer nisso:

- **6 graus, e 3 nos cartões de imóvel.** O suficiente para a caixa parecer
  um objeto com espessura; mais que isso o texto dentro distorce. O cartão de
  imóvel é largo, e o mesmo ângulo ali entortaria o nome na base.
- **A ida é imediata, a volta é lenta.** O ponteiro escreve a transformação
  quadro a quadro; ao sair, a transição de 0,9 s devolve a caixa ao lugar. É
  a saída que dá a sensação de peso.
- **Só em ponteiro fino.** No toque não existe cursor a seguir e o dedo já
  cobre a caixa. Com `prefers-reduced-motion`, nada disso acontece — nem a
  inércia.

## Movimento

- **Abertura** — ao abrir a página a cena da primeira dobra se assenta (um
  zoom lento que termina em 2,6 s) e o título sobe por trás de uma máscara.
  É o único momento coreografado do site.
- **Profundidade** — as fotos andam mais devagar que a página
  (`src/componentes/Profundidade.jsx`). Um único laço de `requestAnimationFrame`
  atende todas elas: cada foto se registra ali, e o scroll recalcula o conjunto
  de uma vez. A imagem entra maior que a moldura — a sobra é o que ela usa para
  se mover sem mostrar borda.
- **Revelação no scroll** — os blocos sobem e aparecem uma vez só, via
  `IntersectionObserver` (`src/componentes/Movimento.jsx`).
- **Botão magnético** — no desktop o botão acompanha o cursor de leve e volta ao
  lugar; desligado em telas de toque.
- **Fio nos serviços** — no desktop cada linha da lista desliza um pouco e um
  fio mostarda se abre por baixo dela.
- **Dúvidas** — a resposta cresce com `grid-template-rows`, sem pulo de layout,
  e a cruz gira 45° virando um "fechar".
- Tudo respeita `prefers-reduced-motion`: quem pede menos movimento no sistema
  recebe a página estática.
