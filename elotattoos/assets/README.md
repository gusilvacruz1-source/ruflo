# Imagens do site — o que falta

Nenhuma foto real foi colocada aqui ainda. Enquanto o arquivo não existir,
o site mostra um retângulo em `--paper-deep` com o nome do arquivo escrito
no centro — o layout não quebra e não há salto de altura, porque cada
imagem já tem `width` e `height` no HTML.

**Como usar:** salve o arquivo com exatamente o nome da tabela, nesta pasta.
Não precisa mexer no código.

## Formato
- Todas em **WebP** (exceto `og-image.jpg`).
- Preto e branco não é necessário no arquivo: o CSS já aplica
  `grayscale(1) contrast(1.04)` em todas as fotos.
- Não usar foto de banco de imagens nem imagem das referências.

## Lista

| Arquivo | Uso | Dimensão sugerida |
|---|---|---|
| `hero-eloize.webp` | retrato da Eloize, vertical (aparece em arco no topo) | 1200×1600 |
| `sobre-estudio.webp` | ambiente do estúdio | 1000×1250 |
| `estilo-fineline.webp` | exemplo de fine line | 800×1100 |
| `estilo-floral.webp` | exemplo de floral | 800×1100 |
| `estilo-autoral.webp` | exemplo de arte autoral | 800×1100 |
| `galeria-01.webp` … `galeria-12.webp` | portfólio (12 fotos) | mínimo 1000px no lado maior |
| `arte-01.webp` … `arte-08.webp` | desenhos disponíveis, fundo claro | 900×900 |
| `cta-estudio.webp` | fachada ou detalhe do espaço, vertical | 1000×1400 |
| `hero-eloize.mp4` | ✅ **já feito** — vídeo de fundo do hero, 717 KB | 592×1206 |
| `og-image.jpg` | imagem de compartilhamento (WhatsApp, Instagram) | 1200×630 |
| `favicon.svg` | ✅ já feito (monograma EB) | — |

## Categorias da galeria

Cada foto do portfólio tem uma categoria no HTML (`data-cat`), que alimenta
os filtros. A distribuição atual é:

| Arquivo | Categoria |
|---|---|
| galeria-01, 04, 08, 12 | `florais` |
| galeria-02, 06, 10 | `fineline` |
| galeria-03, 07, 11 | `autorais` |
| galeria-05, 09 | `cicatrizadas` |

Se a foto que você tiver for de outra categoria, é só trocar o `data-cat`
no `index.html`. O texto do `alt` também precisa ser reescrito para
descrever a tatuagem de verdade (desenho + local do corpo).


---

## Vídeo do hero — `hero-eloize.mp4` ✅ pronto

O vídeo do decalque está no ar. Veio de um `.mov` de 8,3 MB gravado no
iPhone (HEVC, 6,1 s, 60 fps, com áudio) e foi convertido aqui para:

| | |
|---|---|
| **Codec** | H.264 Main, `yuv420p` — toca em todo navegador |
| **Tamanho** | **717 KB** (era 8,3 MB) |
| **Resolução** | 592×1206 (cortadas 74 px de barra preta no rodapé) |
| **Taxa** | 30 fps, sem áudio |
| **Extra** | `faststart` — começa a tocar antes de baixar o arquivo inteiro |

O `hero-eloize.webp` é um frame desse mesmo vídeo, usado como poster (o que
aparece antes de o vídeo carregar) e como fallback se o vídeo não tocar.

**Para trocar o vídeo depois:** é só substituir os dois arquivos. Se o novo
vídeo não existir, fica a foto; se ela também não existir, fica o
placeholder. Nada quebra.

O vídeo toca mudo, em loop, só enquanto está visível na tela, e fica parado
para quem usa "reduzir movimento" no sistema.

### Como exportar, se for trocar

| | |
|---|---|
| **Codec** | **H.264** (não HEVC/H.265) |
| **Container** | **`.mp4`** (não `.mov`) |
| **Duração** | 4 a 8 segundos |
| **Tamanho** | até 3–5 MB |
| **Resolução** | 720×960 vertical basta — o arco é pequeno na tela |
| **Áudio** | remover (o site toca mudo) |

**Por que não pode ser o `.mov` do iPhone:** o iPhone grava em HEVC dentro de
um `.mov`. Esse formato só toca no Safari — no Chrome, no Firefox e na maioria
dos Android o vídeo simplesmente não aparece. Precisa ser H.264 em `.mp4`.

**Como converter, sem instalar nada:** no iPhone, em *Ajustes › Câmera ›
Formatos*, escolher **"Mais Compatível"** faz a câmera gravar direto em H.264.
Para um vídeo já gravado, o caminho mais simples é passar por um editor
(CapCut, InShot, o próprio app Fotos) e exportar em 720p — a exportação já
converte para H.264/MP4.

### Se preferir mandar o arquivo pesado mesmo

Dá para servir dois formatos (um `.mp4` para todo mundo e o `.mov` original
só para o Safari), mas isso não resolve o peso: 25 MB no hero derruba o
carregamento no 4G, que é como a maioria das clientes vai abrir o site.
Melhor exportar leve.
