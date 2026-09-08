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

## Imagens de terceiros

Os originais ficam em `_referencias/`, e as versões otimizadas que a
página usa ficam em `assets/img/`.

| Arquivo | Onde aparece |
|---------|--------------|
| `guitarra.webp` | textura do topo, apagada e sem rosto |
| `cbj.webp` | seção "Na parede" |
| `chorao.webp` | seção "Na parede" |
| `adesivos.webp` | seção "Na parede" |

As três da parede entram **identificadas**: cada uma tem legenda dizendo
o que é, e a seção fecha com a nota de que os direitos são de quem as
fez. É referência declarada, não material da banda.

Quando chegarem fotos de verdade da Rocha Nua, elas assumem o topo e a
seção "A banda", e a parede continua sendo parede de referência.

## Verificado

- 380, 760 e 1440 px: nenhuma rolagem horizontal.
- Sem erro de console, com as listas vazias e com as listas cheias.
- Vídeo entra por `youtube-nocookie.com` e com carregamento adiado.
