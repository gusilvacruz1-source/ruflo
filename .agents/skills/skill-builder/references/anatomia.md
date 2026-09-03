# Anatomia de uma skill

Índice:

1. [Como uma skill é carregada](#1-como-uma-skill-é-carregada)
2. [Escrevendo a description](#2-escrevendo-a-description)
3. [Escrevendo o corpo](#3-escrevendo-o-corpo)
4. [Lista de verificação](#4-lista-de-verificação)

## 1. Como uma skill é carregada

Três níveis, e entender isso muda como se escreve cada parte:

| Nível | O que é | Quando entra em contexto |
| --- | --- | --- |
| 1 | `name` + `description` | Sempre. É o que decide se a skill é consultada. |
| 2 | Corpo do `SKILL.md` | Quando a skill dispara. Mire abaixo de 500 linhas. |
| 3 | `references/`, `scripts/`, `assets/` | Só quando o corpo mandar abrir. |

O nível 1 custa contexto em toda conversa, mesmo quando a skill não é usada —
por isso a `description` precisa ser densa, não longa. O nível 3 é de graça
até ser aberto: é para lá que vai tudo que é longo e ocasional.

Um script no nível 3 pode ser **executado** sem ser lido. É a forma mais
barata de embutir procedimento determinístico: em vez de o modelo reescrever a
mesma função toda vez, ele roda a que já existe.

## 2. Escrevendo a description

É o campo mais importante do arquivo, e o mais malfeito. Três defeitos comuns:

**Descreve a técnica, não o problema.** Quem pede não sabe o nome da técnica.

- Fraco: "Gera sequências de frames com ffmpeg e ScrollTrigger."
- Bom: "…Use quando pedirem um vídeo que avança conforme a pessoa rola,
  hero com vídeo, ou quando alguém mandar um .mp4 e pedir para colocar no
  site — inclusive sem citar frames nem ScrollTrigger."

**Só diz o que faz, não quando usar.** Metade da função da `description` é
delimitar a ocasião. Todo "quando usar" mora aqui, não no corpo.

**Tímida demais.** Modelos erram mais para o lado de não acionar. Enumere os
contextos, use as palavras que as pessoas usam e inclua os pedidos vagos
("deixa mais bonito", "arruma isso") quando eles forem, de fato, o momento.

Fórmula que costuma funcionar:

```
<o que faz, em uma oração> — <como faz, se ajudar a distinguir>.
Use sempre que <contexto 1>, <contexto 2>, <contexto 3>, ou quando
<pedido vago que na prática é isto>. Para <caso vizinho>, use <outra skill>.
```

A última frase — mandar o caso vizinho para outro lugar — é o que evita duas
skills brigando pelo mesmo pedido.

## 3. Escrevendo o corpo

**Imperativo, com o porquê junto.** "Extraia no máximo 160 frames" é uma
ordem que o modelo cumpre e não sabe adaptar. "Extraia no máximo 160 frames:
acima disso o conjunto passa de 6 MB e a memória de imagem decodificada
derruba a aba no iPhone" é um critério que ele aplica a um caso novo.

**Comece pela triagem, quando houver.** Muita skill de qualidade se resume a
"antes de fazer o caminho caro, veja se este caso não pede o barato". Essa
seção costuma valer mais do que todo o passo a passo abaixo dela.

**Números explícitos.** Tetos, faixas, limites. Sem eles, "otimize as imagens"
vira uma decisão diferente a cada execução.

**Tabelas para escolhas.** Um quadro de "se o caso é X, use Y, custa Z" é lido
e aplicado com muito mais fidelidade que três parágrafos equivalentes.

**Erros pelo sintoma.** "A aba recarrega sozinha no iPhone" encontra o leitor;
"gerenciamento de memória" não.

**Exemplos com entrada e saída.** Um par concreto ancora o formato melhor do
que a especificação dele.

## 4. Lista de verificação

Antes de dar uma skill por pronta:

**Gatilho**
- [ ] A `description` diz o que faz **e** quando usar
- [ ] Inclui as palavras que as pessoas usam, não só os termos técnicos
- [ ] Cobre o pedido vago que, na prática, é esta skill
- [ ] Manda o caso vizinho para a skill certa
- [ ] `name` idêntico ao nome da pasta

**Conteúdo**
- [ ] Existe uma triagem no começo, se há mais de um caminho possível
- [ ] Cada regra vem com o motivo
- [ ] Há números onde havia adjetivos
- [ ] Há uma seção de erros, escrita pelo sintoma
- [ ] Há um critério de pronto — o que conferir antes de entregar

**Forma**
- [ ] `SKILL.md` abaixo de ~500 linhas
- [ ] O que é longo e ocasional está em `references/`, com uma linha dizendo
      quando abrir
- [ ] O que é repetitivo está em `scripts/`, e o corpo manda usar
- [ ] Referências longas (>300 linhas) começam com índice
- [ ] Os scripts rodam de fato — foram executados uma vez

**Honestidade**
- [ ] Nenhuma instrução depende de API, caminho ou credencial que a skill não
      documenta
- [ ] O que é incerto está marcado como incerto, não afirmado
