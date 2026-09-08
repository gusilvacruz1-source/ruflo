# Site — ROCHA NUA (@rocha.nua)

Site de uma página para a banda Rocha Nua. HTML, CSS e JS puros, sem
framework e sem build.

## Isolamento

Esta pasta é **totalmente separada** do resto do repositório. Nada aqui
importa, sobrescreve ou depende de `/index.html`, `/css`, `/js`,
`/lojinha-kerollay`, `/elotattoos` ou `/portfolio`. O `netlify.toml` da
raiz **não foi alterado**: ele continua publicando só a lojinha da
Kerollay.

**Nada deste site foi publicado em lugar nenhum.** Não há deploy e não
foi criado site novo no Netlify. Para ver, abra local:

```
cd rocha-nua && python3 -m http.server 8080
# depois: http://localhost:8080
```

Servidor local é o jeito recomendado. Abrindo o `index.html` por clique
duplo, o navegador bloqueia as fontes próprias e o texto sai na fonte
de sistema.

## Como atualizar o conteúdo

Abra **`assets/js/dados.js`**. É o único arquivo que precisa ser tocado
para o dia a dia. Lá dentro tem quatro listas, cada uma com um exemplo
comentado explicando o formato:

| Lista      | Para quê                                        |
|------------|-------------------------------------------------|
| `autorais` | músicas próprias, com ano e link opcional       |
| `agenda`   | shows marcados (data no formato `AAAA-MM-DD`)   |
| `videos`   | vídeos do YouTube, **só o ID**, não a URL       |
| `contato`  | WhatsApp, e-mail, Instagram e canal             |

Detalhes que o site já resolve sozinho:

- Show com data passada **some da agenda automaticamente**, sem precisar
  apagar da lista.
- ID de vídeo escrito errado é **ignorado**, em vez de virar um quadro
  preto quebrado na página.
- Enquanto `whatsapp` e `email` estiverem vazios, o botão principal de
  contratação manda a pessoa para o **direct do Instagram**, que já
  existe e funciona.
- Lista vazia não deixa buraco: cada seção tem um texto próprio dizendo
  que aquilo ainda está por vir.

## O que ainda falta de verdade

Nada disso foi inventado no site, e é o que falta para ele ficar completo:

- **O logo do punho.** Hoje o hero mostra um carimbo de texto no lugar.
  Coloque o arquivo em `assets/img/` e troque o bloco marcado com
  `TROQUE AQUI` no `index.html`.
- **Nomes das autorais**, com link se houver gravação.
- **Datas de show.**
- **WhatsApp ou e-mail de contratação.**
- **Fotos da banda**, se quiserem entrar na seção "A banda".

## Estrutura

```
rocha-nua/
  index.html
  assets/
    css/main.css        tokens, reset, tipografia, botões, molduras
    css/sections.css    cada seção da página
    js/dados.js         >>> o conteúdo que muda vive aqui <<<
    js/main.js          monta as listas e os estados vazios
    fonts/              Permanent Marker e Archivo (~64 KB)
    img/favicon.svg
  _referencias/         moodboard, não vai ao ar
```

## Decisões de desenho

Direção: rua, skate, noite e adesivo.

- Paleta: asfalto `#141110`, papel sujo `#F0E7D6`, laranja `#E2541F` de
  acento e amarelo `#F2B01E` em detalhe.
- **Regra de cor, uma só:** laranja e amarelo nunca levam texto claro em
  cima. Quem senta em laranja ou amarelo é o asfalto. Creme é para fundo
  escuro. Isso mantém tudo acima de 4.5:1 sem conferir caso a caso.
- O ritmo da página é a alternância de faixas de asfalto e de papel, de
  largura total, invertendo o texto junto.
- Cantos retos em tudo, raio 0. O que é redondo é desenho, nunca caixa.
- Títulos em Permanent Marker, corpo em Archivo. As duas são servidas
  pelo próprio site, sem Google Fonts, então não há conexão a terceiros
  para a página abrir.
- Letra colada: preenchida, com contorno grosso e sombra dura, para a
  palavra parecer adesivo em vez de texto.
- As molduras tremem porque passam por um filtro SVG de turbulência
  aplicado só na borda, num pseudo-elemento. O texto continua nítido.
- Os adesivos (palheta, shape de skate, estrela, raio, disco) são
  desenhados neste repositório, para a Rocha Nua.
- Uma faixa de texto rolando na página inteira, e ela para sozinha para
  quem configurou o sistema com menos movimento.

## Fotos

### As que já estão na página

| Arquivo | Onde |
|---------|------|
| `estudio.webp` | topo, foto pregada com fita, com a caveira colada na quina |
| `caveira.webp` | adesivo recortado (tem transparência de verdade) |
| `vinis.webp` | faixa larga entre "A banda" e "Autorais" |
| `toca-discos.webp` | fundo de "Autorais" |
| `guitarra-mao.webp` | fundo de "Vídeos" |
| `caveira-glitch.webp` | fundo do fecho de contratação |
| `skates.webp` | foto pregada na "Agenda" |
| `guitarra.webp` | textura do topo, atrás de tudo |

Todas entram em preto e branco de alto contraste. As de fundo levam véu
de asfalto por cima, para o texto sentar no asfalto e não na foto.

A caveira chegou em `.jpg` com o xadrez de transparência **gravado nos
pixels**. O xadrez foi removido por preenchimento a partir da borda (o
contorno branco do adesivo fecha o caminho e o preto de dentro não é
alcançado) e ela foi salva em WebP com alfa. Se for trocar por outra,
mesmo cuidado: `.jpg` não guarda transparência.

### Vagas ainda abertas

Mesmo esquema do site da Eloize: **nome de arquivo fixo e lugar
reservado**. Salve em `assets/img/` com exatamente este nome e aparece
sozinho, sem tocar no código.

| Arquivo | Onde entra | Dimensão sugerida |
|---------|------------|-------------------|
| `logo.webp` | acima do nome, no topo | 560×560, fundo transparente |
| `hero-banda.webp` | textura do topo, no lugar da guitarra | 1600×1200, foto de show |
| `emerson.webp` | retrato no card do Emerson | 800×1000 (vertical) |
| `jose.webp` | retrato no card do José | 800×1000 (vertical) |

**Duas regras do mecanismo**, para quem for mexer no código:

- Nenhuma `.vaga__real` pode ter `loading="lazy"`. Ela nasce escondida,
  e imagem escondida com lazy nunca entra em viewport, nunca carrega, e
  a vaga nunca enche.
- Vaga vazia registra um **404 no console**. É esperado: é assim que a
  página descobre se a foto existe. Some quando o arquivo entra.

### Peso

Primeira tela 306 KB, página inteira 346 KB. Medido pela API de
performance do navegador (`encodedBodySize`), que é a contagem confiável.

Fundo entra comprimido com força porque aparece escurecido e com
opacidade baixa. Foto que aparece nítida (estúdio, caveira) fica no
tamanho em que é exibida, não maior.

## Verificado

- 380, 760 e 1440 px: nenhuma rolagem horizontal.
- Sem erro de console, com as listas vazias e com as listas cheias.
- Vídeo entra por `youtube-nocookie.com` e com carregamento adiado.
