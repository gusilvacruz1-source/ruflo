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
