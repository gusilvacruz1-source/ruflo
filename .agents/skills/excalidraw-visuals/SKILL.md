---
name: excalidraw-visuals
description: Gera imagens estáticas (PNG) no estilo quadro branco desenhado à mão, tipo Excalidraw, por modelo de imagem (Nano Banana / Gemini Image, kie.ai ou o que a sessão tiver). Use sempre que pedirem uma ilustração explicativa, esquema visual, capa de artigo ou post, figura para README, slide ou apresentação, "um desenho explicando isso", diagrama bonito para publicar — e quando o arquivo final for uma imagem, não algo editável. Para um .excalidraw que a pessoa possa arrastar e editar, use a skill excalidraw-diagram.
---

# Imagem no estilo quadro branco

O estilo Excalidraw funciona por um motivo específico: traço trêmulo e
letra à mão dizem "isto é uma explicação, não um produto acabado". Baixa a
guarda de quem olha e convida a discordar. É por isso que ele lê tão bem em
artigo técnico, README e slide interno — e tão mal em página de vendas.

Antes de gerar, decida se o resultado precisa ser editável. Se alguém vai
querer mexer depois, o entregável é um `.excalidraw` (outra skill) — imagem
gerada não se corrige, se refaz.

## A regra que governa tudo: pouco texto

Modelo de imagem erra letra. Uma figura com quinze rótulos volta com metade
das palavras embaralhadas, e o retrabalho consome qualquer tempo que a
geração economizou.

- **No máximo 5 a 7 rótulos**, de uma ou duas palavras cada.
- Nada de frase dentro da imagem. A frase vai na legenda, em HTML.
- Precisa de texto denso? O caminho é `excalidraw-diagram`, onde o texto é
  texto de verdade.

## Prefixo de estilo

Todo pedido começa por este bloco, que é o que mantém as imagens de um mesmo
projeto parecendo da mesma mão:

```
hand-drawn whiteboard sketch in the style of Excalidraw,
black marker on clean white background, rough uneven strokes,
simple geometric shapes, short handwritten labels,
flat — no shading, no gradients, no drop shadows,
generous white space, centered composition
```

Negativos, quando o provedor aceitar campo separado:

```
photorealistic, 3D render, gradients, glossy, drop shadow, stock photo,
watermark, signature, dense paragraphs of text, cluttered
```

Uma cor de acento é permitida e ajuda a hierarquia — sempre a mesma no
projeto inteiro. Duas ou mais e o desenho perde o ar de rascunho.

```
single accent color: warm amber (#f0b429), used only for the highlighted step
```

## A descrição da cena

O prefixo dá o traço; a descrição dá o conteúdo. Ela precisa dizer três
coisas, nesta ordem — modelo de imagem obedece composição melhor do que
obedece lista de itens:

1. **O arranjo**: "three boxes in a left-to-right row connected by arrows",
   "a large circle in the center with four smaller circles orbiting".
2. **O que é cada parte**, com o rótulo exato entre aspas.
3. **O que destacar**: qual elemento recebe o acento.

Exemplo completo:

```
<prefixo de estilo>

A left-to-right flow of three rounded boxes connected by arrows.
First box labeled "Vídeo", second labeled "Frames", third labeled "Canvas".
Below the third box, a small stack of rectangles suggesting a sequence.
The third box is drawn in warm amber; everything else is black marker.
16:9, wide margins.
```

## Gerando

```bash
node scripts/generate-visual.js "descrição da cena" --saida docs/imagens/fluxo.png
```

O script monta o prompt final (prefixo + descrição + proporção), grava o
prompt ao lado da imagem para a próxima ficar consistente, e chama o provedor
configurado por variáveis de ambiente:

```bash
export IMAGE_API_URL="…"     # endpoint do provedor
export IMAGE_API_KEY="…"     # chave
export IMAGE_MODEL="…"       # ex.: gemini-2.5-flash-image
```

Sem provedor configurado, rode com `--apenas-prompt`: ele imprime o prompt
pronto para você colar em qualquer ferramenta de imagem — inclusive a da
própria sessão, quando houver. Os contratos de API mudam com frequência;
confira o do seu provedor e ajuste a função `envia()` do script se necessário.

## Depois de gerar

- **Leia todos os rótulos.** Palavra embaralhada é o defeito número um.
  Encontrou? Refaça com menos texto, não com o mesmo prompt.
- **Confira o fundo.** Precisa ser branco liso; papel texturizado e sombra
  entram sozinhos e denunciam a geração.
- **Corte as margens sobrando** e exporte com a largura em que vai ser usada.
  PNG de 2048 px num README é peso jogado fora.
- **Escreva o `alt`**, sempre, descrevendo o que a figura mostra — não
  "diagrama do fluxo", mas "vídeo vira frames, que viram uma sequência
  desenhada no canvas".

## Consistência entre imagens de um mesmo projeto

Guarde o prefixo e a cor de acento num arquivo do projeto e reutilize sem
alterar. Uma série em que a espessura do traço ou o tom do amarelo muda de
figura para figura fica pior do que uma série sem cor nenhuma.
