# Imbaú Imobiliária — landing page

Página única em React + Vite + Tailwind CSS, no estilo "alto luxo, moderno e
minimalista": o site é uma placa arredondada apoiada sobre o creme da página.
Dentro dela o escuro aparece só três vezes — a primeira dobra, a vitrine de
imóveis e o rodapé; o resto respira no claro.

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

`docs/estrutura.excalidraw` traz o mapa do livro — a capa presa, as sete
folhas por cima dela, a lombada. Abra em [excalidraw.com](https://excalidraw.com)
para editar. É gerado por `node tools/faz-diagrama.mjs`, e não à mão: montar
esse JSON manualmente é como se esquece uma ligação e a seta descola da caixa
no primeiro arrasto.

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

## Tipografia

Duas vozes, e cada uma com um trabalho:

| | Fonte | Onde |
| --- | --- | --- |
| Display | **Fraunces** (serifa variável, com eixo óptico) | títulos, citação, os pilares da capa, a nota do Google |
| Interface | **Plus Jakarta Sans** (variável) | texto, rótulo, botão, formulário |

A serifa é o que dá o tom editorial — de casa que se visita, não de produto
que se contrata. Ela dispensa o peso cheio que a sem-serifa precisava para ter
presença: em 500 já ocupa a linha. O eixo óptico (`font-optical-sizing: auto`)
ajusta o contraste das hastes conforme o tamanho, o que é justamente o que
segura um título de 7 rem sem ele parecer inflado.

**As fontes são do projeto**, não do Google: `@fontsource-variable/*`,
importadas em `src/main.jsx`. Some uma requisição a um terceiro do caminho
crítico e a página tem a voz certa mesmo offline. São arquivos variáveis — um
só cobre todos os pesos.

O ritmo vertical também é um só: a classe `.secao`
(`clamp(88px, 12vh, 168px)`), em vez das cinco combinações de `py-*` que
existiam antes, uma por seção.

## Claro e escuro

Cada bloco declara o próprio tom com `data-tom="claro"` ou `data-tom="escuro"`.
O menu lê esse atributo e troca de roupa: sobre o creme a marca fica escura, a
pílula vira vidro claro e o botão inverte. Quem decide é a faixa ocupada pela
marca — o único elemento do menu sem fundo próprio —, e no empate ganha o
claro, porque texto escuro ainda se lê sobre a metade escura. Ao criar uma
seção nova, marque o tom dela; senão o menu não a enxerga.

## Largura e alinhamento

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

## O site é um livro

A metáfora não é decoração: ela organiza a página.

- **A capa fica.** A primeira dobra é `sticky` no topo, com z-index abaixo das
  seções. As folhas sobem por cima dela e a capa recua — o texto sobe e some,
  um véu escurece a cena. Quem abre o site abre um livro.
- **As folhas se empilham.** O bloco das seções carrega a sombra da costura no
  alto: é ela que faz a folha parecer apoiada sobre a capa, e não colada nela.
- **A lombada** (`src/componentes/Livro.jsx`) fica na margem esquerda, a partir
  de 1400 px. Traz os algarismos dos capítulos, acende o que está aberto — só
  nele o nome aparece — e desce uma fita dourada conforme a leitura avança.
  Como ela é alta e cruza a costura entre a capa escura e a folha clara, cada
  algarismo pergunta por si mesmo o que tem atrás dele.
- **O fólio** repete, no alto de cada folha, o algarismo e o nome do capítulo —
  a mesma repetição que um livro faz no topo de cada página.

Os capítulos vivem em `capitulos`, em `src/conteudo.js`. O `id` de cada um tem
de bater com o `id` da seção; é assim que a lombada e o fólio se encontram.

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
- **Multiplano na capa** — a cena da primeira dobra é gerada em cinco planos
  separados (céu, serras, cena, árvores, grão) e cada um anda a uma velocidade
  na rolagem. É a câmera multiplano do cinema de animação: o céu quase não sai
  do lugar, as árvores da frente correm. Custa 28 KB de SVG.

  Uma sequência de quadros extraída de vídeo daria o mesmo efeito com material
  fotográfico e custaria uns 6 MB — só vale para cena filmada de verdade.
  Material vetorial se refaz em código, que é o caso aqui.
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
