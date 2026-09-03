---
name: video-to-website
description: Transforma um vídeo em seção de site animada pela rolagem — sequência de frames extraída com ffmpeg, desenhada em canvas e conduzida por GSAP ScrollTrigger com Lenis. Use sempre que aparecer vídeo virando animação de scroll, "scrollytelling", cena que avança conforme a pessoa rola, hero com vídeo, sequência de frames, scroll scrubbing, pin de seção, efeito estilo Apple de produto girando, ou quando alguém mandar um .mp4/.mov e pedir para "colocar no site" — inclusive quando não citar frames nem ScrollTrigger, só descrever o efeito.
---

# Vídeo virando seção de scroll

Rolar a página e ver uma cena avançar quadro a quadro é um dos efeitos mais
caros da web: alguns megabytes de imagem, memória de sobra e uma trava de
rolagem. Feito com cuidado, é inesquecível. Feito no automático, é uma página
de 18 MB que engasga no celular e trava o Safari.

Este documento é sobre fazer direito — e, antes disso, sobre decidir se é
mesmo esse o caminho.

## Primeiro: escolha o mecanismo certo

A maior parte dos pedidos de "coloca esse vídeo no site" **não** pede sequência
de frames. Decida antes de extrair qualquer coisa:

| A cena precisa… | Use | Custo |
| --- | --- | --- |
| Avançar e voltar junto com a rolagem, parando onde a pessoa parar | **Sequência de frames em canvas** (este documento) | 3–8 MB |
| Só rodar sozinha, em laço, atrás do conteúdo | `<video autoplay muted playsinline loop poster>` | 1–3 MB |
| Mostrar interface, produto vetorial ou movimento que dá para redesenhar | **Refazer em código** (SVG/CSS/GSAP) | 5–50 KB |

Refazer em código ganha sempre que o conteúdo for gráfico: fica nítido em
qualquer tela, pesa kilobytes e é editável depois. Sequência de frames só se
justifica quando é uma cena real filmada e o controle pela rolagem é o ponto.

Se a escolha não for óbvia, pergunte antes de gastar o orçamento de bytes da
página inteira num efeito.

## Trabalhe de trás para frente, a partir do peso

O erro clássico é extrair a 30 fps e descobrir depois que a pasta tem 40 MB.
Comece pelo teto e derive o resto:

1. **Teto**: 6 MB para a sequência inteira no desktop, 2,5 MB no celular.
2. **Quantos frames**: uma rolagem confortável avança um frame a cada 6–12 px.
   Um pin de duas alturas de tela (~1600 px) a 10 px/frame = **160 frames**.
3. **Quanto cada frame pode pesar**: 6 MB ÷ 160 ≈ **37 KB**. Isso é WebP a
   qualidade 65–72 com 1440 px de largura numa cena fotográfica.
4. **Não fecha?** Corte o trecho, feche o enquadramento ou diminua a largura.
   Baixar a qualidade abaixo de ~60 faz aparecer banda em céu e gradiente —
   custa mais caro do que os bytes que economiza.

### O limite que ninguém conta: memória

Peso de arquivo não é peso na memória. Um frame decodificado ocupa
`largura × altura × 4` bytes, **independente** de quão bem comprimiu:

- 1440 × 810 → 4,7 MB por frame decodificado
- 160 frames → até 750 MB se o navegador mantiver todos vivos

É assim que essas páginas derrubam a aba no iPhone. Por isso o conjunto do
celular não é o mesmo com menos qualidade: é **menor de verdade** — no máximo
800 px de largura e 80 frames. Se o projeto exigir mais que isso, decodifique
por janela deslizante com `createImageBitmap()` e `close()` no que sai de cena
(`references/implementacao.md` traz o código).

## O pipeline

### 1. Sonde o material

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames:format=duration \
  -of json entrada.mp4
```

Anote duração, resolução e onde começa e termina o trecho que interessa.
Quase sempre o trecho útil é bem menor que o vídeo inteiro — e cada segundo
cortado é peso a menos.

### 2. Extraia os dois conjuntos

Use o script incluído, que faz a conta de fps a partir do número de frames
que você quer e gera desktop e celular de uma vez:

```bash
scripts/extrai-frames.sh entrada.mp4 public/cena 160 --inicio 2.0 --fim 8.0
```

Ele escreve `public/cena/desktop/0001.webp…` e `public/cena/mobile/0001.webp…`
e imprime o peso total de cada conjunto. Se estourar o teto, ele avisa.

Fazendo à mão, o essencial é este:

```bash
# fps = frames desejados ÷ duração do trecho
ffmpeg -ss 2.0 -to 8.0 -i entrada.mp4 \
  -vf "fps=26.67,scale=1440:-2:flags=lanczos" \
  -c:v libwebp -quality 70 -compression_level 6 \
  public/cena/desktop/%04d.webp
```

`-ss` antes de `-i` busca rápido, mas pelo keyframe mais próximo. Se o começo
sair alguns quadros fora do lugar, mova o `-ss` para depois do `-i`: fica lento
e exato.

### 3. Monte a seção

O código comentado está em **`references/implementacao.md`** — leia antes de
escrever o seu. Ele cobre, em ordem:

- HTML e CSS da seção (com o espaço reservado, para não haver salto de layout)
- Escolha do conjunto por `matchMedia` e densidade de tela
- Pré-carga com limite de simultâneas, `decode()` e primeiro frame na tela
  antes do resto
- Desenho com recorte `cover` e teto de resolução do canvas
- ScrollTrigger com `pin` e `scrub`, e o casamento com o Lenis
- `prefers-reduced-motion`, fallback e limpeza

Três decisões dele que valem repetir aqui, porque são as que costumam ser
invertidas:

**Não use `<video>` com `currentTime` na rolagem.** Parece a solução óbvia e é
a razão de esse padrão existir: Safari e iOS não fazem busca exata de quadro
sob rolagem, engasgam a thread principal e devolvem um vídeo que "pula". A
sequência de frames é exata por construção.

**Não desenhe texto no canvas.** Sobreponha DOM de verdade por cima. Texto no
canvas não é selecionável, não é lido por leitor de tela, não reflui e fica
borrado em tela densa.

**Não redesenhe a cada evento de rolagem.** O ScrollTrigger só anota o índice
alvo; um `ticker` desenha, e só quando o índice inteiro muda. Sem isso você
desenha o mesmo frame dezenas de vezes por segundo.

### 4. Confira antes de entregar

- A seção ocupa o espaço certo **antes** das imagens chegarem (sem salto).
- O primeiro frame aparece cedo: pré-carregue-o no `<head>` com
  `<link rel="preload" as="image">`.
- Chegando na seção com a sequência ainda carregando, ela avança pelos frames
  já disponíveis em vez de congelar.
- Rolagem para cima é tão suave quanto para baixo.
- No celular de verdade — não no simulador — a aba não recarrega sozinha. Se
  recarregar, é memória: corte frames ou largura.
- Com "reduzir movimento" ligado no sistema, a seção vira um quadro parado e
  a página não prende a rolagem.
- Peso total da sequência dentro do teto que você definiu no começo.

## Quando o vídeo tem várias cenas

Uma sequência longa demais é cara e cansa. Prefira duas ou três seções curtas
(60–90 frames cada), cada uma com o seu pin, separadas por conteúdo normal. A
página respira, o peso se divide e cada cena ganha um texto próprio ancorado
num intervalo de frames — o que também dá controle sobre o ritmo da leitura.
