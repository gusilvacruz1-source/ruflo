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

Mesmo esquema do site da Eloize: **cada foto tem nome de arquivo fixo e
lugar reservado**. Salve o arquivo em `assets/img/` com exatamente o nome
da tabela e ele assume sozinho. Não precisa mexer no código.

| Arquivo | Onde entra | Dimensão sugerida |
|---------|------------|-------------------|
| `logo.webp` | topo, no lugar da pilha de adesivos | 560×560, fundo transparente |
| `hero-banda.webp` | fundo do topo, no lugar da textura | 1600×1200, foto de show |
| `emerson.webp` | retrato no card do Emerson | 800×1000 (vertical) |
| `jose.webp` | retrato no card do José | 800×1000 (vertical) |

Enquanto o arquivo não existe, fica o que já está na página: a pilha de
adesivos no topo, a textura de guitarra no fundo, e o card do integrante
sem retrato (a vaga ocupa zero, não abre buraco).

**Tratamento das fotos:** os retratos entram em preto e branco com
contraste alto (`grayscale(1) contrast(1.35)`), para casar com o resto.
Não precisa tratar antes de subir.

**Duas regras do mecanismo**, para quem for mexer no código:

- Nenhuma `.vaga__real` pode ter `loading="lazy"`. Ela nasce escondida,
  e imagem escondida com lazy nunca entra em viewport, nunca carrega, e
  a vaga nunca enche.
- Enquanto uma vaga estiver vazia, o navegador registra um **404 no
  console** para aquele arquivo. É esperado: é assim que a página
  descobre se a foto existe. Some quando o arquivo entra.

Além dessas, a página usa `assets/img/guitarra.webp`, um guitarrista em
preto e branco sem rosto reconhecível, como textura do topo e fundo do
fecho. As outras imagens enviadas como referência ficam em
`_referencias/` e não vão ao ar.

## Verificado

- 380, 760 e 1440 px: nenhuma rolagem horizontal.
- Sem erro de console, com as listas vazias e com as listas cheias.
- Vídeo entra por `youtube-nocookie.com` e com carregamento adiado.
