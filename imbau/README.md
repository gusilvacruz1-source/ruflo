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
| `imagens/og.jpg` | Prévia que aparece ao compartilhar o link no WhatsApp |
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
